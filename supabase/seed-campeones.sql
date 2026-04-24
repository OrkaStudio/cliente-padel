-- =============================================
-- SEED LOCAL — Torneo de Campeones
-- ⚠️  Solo para desarrollo local.
--     NO ejecutar en producción.
-- =============================================
--
-- Qué hace:
--   - Crea jugadores/parejas/grupos/partidos ficticios
--   - Pone el torneo en estado 'en_curso'
--   - Día 1 (Vie 24/04): todos los partidos grupo A → finalizados
--   - Día 2 (Sáb 25/04): partidos grupo B → 1 en_vivo + resto pendientes
--   - Día 3 (Dom 26/04): playoffs → todos pendientes
--
-- Cómo correrlo:
--   Supabase local SQL Editor o: psql $DATABASE_URL -f supabase/seed-campeones.sql
--
-- Para limpiar y volver a empezar: simplemente volver a ejecutar (es idempotente).
-- =============================================

-- Por si no se corrió seed.sql antes
alter table partidos add column if not exists ronda text;

-- Prefijos UUID (no colisionan con seed.sql del interclub que usa cc/dd/ee/ff):
--   Jugadores:  22770000-{cat4}-0000-0000-{player12}
--   Parejas:    22880000-{cat4}-0000-0000-{pair12}
--   Grupos:     22990000-{cat4}-0000-0000-{group12}
--   Partidos grupo:    22aa0000-{cat4}-0001-0000-{match12}
--   Partidos playoff:  22aa0000-{cat4}-{round4}-0000-000000000001/2

do $$
declare
  v_user   uuid := '00000000-0000-0000-0000-000000000001';
  v_torneo uuid := '22222222-0000-0000-0000-000000000001';
  v_vol    uuid := '33333333-0000-0000-0000-000000000001';  -- Voleando (2 canchas)
  v_mas    uuid := '33333333-0000-0000-0000-000000000002';  -- +Pádel   (2 canchas)

  cat_nombres text[] := array[
    '2da Caballeros', '4ta Caballeros', '6ta Caballeros',
    '8va Caballeros', '6ta Damas',      '4+5 Damas'
  ];
  cat_tipos text[] := array[
    'caballeros', 'caballeros', 'caballeros',
    'caballeros', 'damas',      'especial'
  ];

  nm text[] := array['Martín','Pablo','Nico','Diego','Sebas','Andrés','Tomás','Fer','Ale','Eze','Lean','Facu'];
  nf text[] := array['Valen','Cami','Flor','Agus','Sofi','Lucía','Mari','Ana','Paula','Caro','Nati','Mime'];
  ap text[] := array['Rodríguez','García','López','Martínez','González','Pérez','Sánchez','Fernández','Gómez','Díaz','Torres','Ruiz'];

  -- Round-robin de 3 parejas: (1v2), (1v3), (2v3)
  rr_a int[] := array[1, 1, 2];
  rr_b int[] := array[2, 3, 3];

  -- Resultados variados para partidos finalizados (m=1,2,3)
  res_grupo jsonb[] := array[
    '{"sets_pareja1":2,"sets_pareja2":0}'::jsonb,
    '{"sets_pareja1":2,"sets_pareja2":1}'::jsonb,
    '{"sets_pareja1":2,"sets_pareja2":0}'::jsonb
  ];

  c int; p int; g int; m int;
  v_cat_id  uuid;
  v_tc_id   uuid;
  v_sede    uuid;
  v_j1 uuid; v_j2 uuid;
  v_par uuid; v_par_a uuid; v_par_b uuid;
  v_grupo uuid;
  v_pid uuid;
  v_cancha int;
  v_estado text;
  v_nombre text;
  v_horario timestamptz;

begin

  -- ─── Auth user ficticio ─────────────────────────────────────────────────────
  insert into auth.users (
    id, email, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    aud, role, encrypted_password, confirmation_token, email_confirmed_at
  )
  values (
    v_user, 'seed@local.dev', now(), now(),
    '{"provider":"email","providers":["email"]}', '{}',
    'authenticated', 'authenticated', '', '', now()
  )
  on conflict (id) do nothing;

  -- ─── Categorías especiales (no están en schema base) ────────────────────────
  if not exists (select 1 from categorias where nombre = '8va Caballeros') then
    insert into categorias (nombre, tipo, orden) values ('8va Caballeros', 'caballeros', 16);
  end if;
  if not exists (select 1 from categorias where nombre = '4+5 Damas') then
    insert into categorias (nombre, tipo, orden) values ('4+5 Damas', 'especial', 17);
  end if;

  -- ─── Torneo ─────────────────────────────────────────────────────────────────
  -- oculto=true: no aparece en vista pública, accesible solo via admin o URL directa
  insert into torneos (id, nombre, fecha_inicio, fecha_fin, costo_inscripcion, estado, oculto, created_by)
  values (v_torneo, 'Torneo de Campeones', '2026-04-24', '2026-04-26', 15000, 'en_curso', true, v_user)
  on conflict (id) do update set estado = 'en_curso', oculto = true;

  -- ─── Sedes ──────────────────────────────────────────────────────────────────
  insert into sedes (id, torneo_id, nombre, canchas_count, horario_inicio, horario_fin, duracion_turno, disponibilidad)
  values
    (v_vol, v_torneo, 'Voleando', 2, '09:00', '21:00', 90, '{}'),
    (v_mas, v_torneo, '+Pádel',   2, '09:00', '21:00', 90, '{}')
  on conflict (id) do nothing;

  -- ─── Limpieza ───────────────────────────────────────────────────────────────
  delete from partidos where torneo_id = v_torneo;
  delete from grupo_parejas
    where grupo_id in (
      select g.id from grupos g
      join torneo_categorias tc on g.torneo_categoria_id = tc.id
      where tc.torneo_id = v_torneo
    );
  delete from grupos
    where torneo_categoria_id in (
      select id from torneo_categorias where torneo_id = v_torneo
    );
  delete from parejas where torneo_id = v_torneo;
  delete from jugadores where id::text like '2277%';

  -- ─── Por categoría ──────────────────────────────────────────────────────────
  for c in 1..6 loop

    select id into v_cat_id from categorias where nombre = cat_nombres[c] limit 1;
    v_sede := case when c <= 3 then v_vol else v_mas end;

    -- Asegurar que torneo_categoria existe (ya puede estar desde el wizard)
    insert into torneo_categorias (torneo_id, categoria_id, formato, sets, tercer_set)
    values (v_torneo, v_cat_id, 'grupos_playoff', 'best_2', 'super_tie_break')
    on conflict (torneo_id, categoria_id) do nothing;

    select id into v_tc_id
    from torneo_categorias
    where torneo_id = v_torneo and categoria_id = v_cat_id;

    -- 12 jugadores (6 parejas × 2)
    for p in 1..12 loop
      v_j1 := ('22770000-' || lpad(to_hex(c), 4, '0') || '-0000-0000-' || lpad(to_hex(p), 12, '0'))::uuid;
      v_nombre := case
        when cat_tipos[c] in ('damas', 'especial') then nf[p]
        else nm[p]
      end;
      insert into jugadores (id, nombre, apellido, categoria_id)
      values (v_j1, v_nombre, ap[((c * 12 + p - 1) % 12) + 1], v_cat_id)
      on conflict (id) do nothing;
    end loop;

    -- 6 parejas
    for p in 1..6 loop
      v_par := ('22880000-' || lpad(to_hex(c), 4, '0') || '-0000-0000-' || lpad(to_hex(p), 12, '0'))::uuid;
      v_j1  := ('22770000-' || lpad(to_hex(c), 4, '0') || '-0000-0000-' || lpad(to_hex(p * 2 - 1), 12, '0'))::uuid;
      v_j2  := ('22770000-' || lpad(to_hex(c), 4, '0') || '-0000-0000-' || lpad(to_hex(p * 2),     12, '0'))::uuid;
      insert into parejas (id, torneo_id, categoria_id, jugador1_id, jugador2_id)
      values (v_par, v_torneo, v_cat_id, v_j1, v_j2)
      on conflict (id) do nothing;
    end loop;

    -- 2 grupos (A, B) de 3 parejas
    for g in 1..2 loop
      v_grupo := ('22990000-' || lpad(to_hex(c), 4, '0') || '-0000-0000-' || lpad(to_hex(g), 12, '0'))::uuid;
      insert into grupos (id, torneo_categoria_id, nombre)
      values (v_grupo, v_tc_id, chr(64 + g))
      on conflict (id) do nothing;

      for p in 1..3 loop
        v_par := ('22880000-' || lpad(to_hex(c), 4, '0') || '-0000-0000-' || lpad(to_hex((g - 1) * 3 + p), 12, '0'))::uuid;
        insert into grupo_parejas (grupo_id, pareja_id, posicion)
        values (v_grupo, v_par, p)
        on conflict do nothing;
      end loop;
    end loop;

    -- ─── Partidos de grupo (3 por grupo × 2 grupos = 6 por cat) ───────────────
    for g in 1..2 loop
      for m in 1..3 loop
        v_par_a := ('22880000-' || lpad(to_hex(c), 4, '0') || '-0000-0000-' || lpad(to_hex((g - 1) * 3 + rr_a[m]), 12, '0'))::uuid;
        v_par_b := ('22880000-' || lpad(to_hex(c), 4, '0') || '-0000-0000-' || lpad(to_hex((g - 1) * 3 + rr_b[m]), 12, '0'))::uuid;
        v_pid   := ('22aa0000-' || lpad(to_hex(c), 4, '0') || '-0001-0000-' || lpad(to_hex((g - 1) * 3 + m), 12, '0'))::uuid;
        v_cancha := ((g - 1) * 3 + m - 1) % 2 + 1;

        if g = 1 then
          -- Grupo A → día 1 (Vie 24/04), todos finalizados
          v_estado  := 'finalizado';
          v_horario := ('2026-04-24 09:00:00-03:00')::timestamptz
                       + make_interval(mins => (m - 1) * 90 + c * 5);
        elsif c = 1 and m = 1 then
          -- Grupo B, cat 1, match 1 → en_vivo (para ver el banner en inicio)
          v_estado  := 'en_vivo';
          v_horario := ('2026-04-25 09:00:00-03:00')::timestamptz;
        else
          -- Grupo B, resto → pendientes (día 2)
          v_estado  := 'pendiente';
          v_horario := ('2026-04-25 09:00:00-03:00')::timestamptz
                       + make_interval(mins => (m - 1) * 90 + c * 5);
        end if;

        insert into partidos (id, torneo_id, categoria_id, sede_id, cancha, horario,
                              pareja1_id, pareja2_id, resultado, estado, tipo)
        values (
          v_pid, v_torneo, v_cat_id, v_sede, v_cancha, v_horario,
          v_par_a, v_par_b,
          case when v_estado = 'finalizado' then res_grupo[m] else null end,
          v_estado, 'grupo'
        )
        on conflict (id) do nothing;
      end loop;
    end loop;

    -- ─── Playoffs (día 3, Dom 26/04) ──────────────────────────────────────────

    -- Semifinales (2 partidos)
    for m in 1..2 loop
      v_par_a := ('22880000-' || lpad(to_hex(c), 4, '0') || '-0000-0000-' || lpad(to_hex(m * 2 - 1), 12, '0'))::uuid;
      v_par_b := ('22880000-' || lpad(to_hex(c), 4, '0') || '-0000-0000-' || lpad(to_hex(m * 2),     12, '0'))::uuid;
      v_pid   := ('22aa0000-' || lpad(to_hex(c), 4, '0') || '-0002-0000-' || lpad(to_hex(m),         12, '0'))::uuid;
      insert into partidos (id, torneo_id, categoria_id, sede_id, cancha, horario,
                            pareja1_id, pareja2_id, resultado, estado, tipo, ronda)
      values (v_pid, v_torneo, v_cat_id, v_sede, m,
              ('2026-04-26 09:00:00-03:00')::timestamptz + make_interval(mins => c * 5),
              v_par_a, v_par_b, null, 'pendiente', 'playoff', 'semis')
      on conflict (id) do nothing;
    end loop;

    -- Final
    v_par_a := ('22880000-' || lpad(to_hex(c), 4, '0') || '-0000-0000-000000000005')::uuid;
    v_par_b := ('22880000-' || lpad(to_hex(c), 4, '0') || '-0000-0000-000000000006')::uuid;
    v_pid   := ('22aa0000-' || lpad(to_hex(c), 4, '0') || '-0003-0000-000000000001')::uuid;
    insert into partidos (id, torneo_id, categoria_id, sede_id, cancha, horario,
                          pareja1_id, pareja2_id, resultado, estado, tipo, ronda)
    values (v_pid, v_torneo, v_cat_id, v_sede, 1,
            ('2026-04-26 13:00:00-03:00')::timestamptz + make_interval(mins => c * 5),
            v_par_a, v_par_b, null, 'pendiente', 'playoff', 'final')
    on conflict (id) do nothing;

    -- 3er puesto
    v_par_a := ('22880000-' || lpad(to_hex(c), 4, '0') || '-0000-0000-000000000003')::uuid;
    v_par_b := ('22880000-' || lpad(to_hex(c), 4, '0') || '-0000-0000-000000000004')::uuid;
    v_pid   := ('22aa0000-' || lpad(to_hex(c), 4, '0') || '-0004-0000-000000000001')::uuid;
    insert into partidos (id, torneo_id, categoria_id, sede_id, cancha, horario,
                          pareja1_id, pareja2_id, resultado, estado, tipo, ronda)
    values (v_pid, v_torneo, v_cat_id, v_sede, 2,
            ('2026-04-26 13:00:00-03:00')::timestamptz + make_interval(mins => c * 5),
            v_par_a, v_par_b, null, 'pendiente', 'playoff', '3er_puesto')
    on conflict (id) do nothing;

  end loop; -- categorías

end $$;

-- ─── Resumen ──────────────────────────────────────────────────────────────────
select
  c.nombre                                                         as categoria,
  count(*) filter (where p.tipo = 'grupo')                        as grupo,
  count(*) filter (where p.tipo = 'playoff')                      as playoff,
  count(*) filter (where p.estado = 'finalizado')                 as fin,
  count(*) filter (where p.estado = 'en_vivo')                    as vivo,
  count(*) filter (where p.estado = 'pendiente')                  as pend
from partidos p
join categorias c on c.id = p.categoria_id
where p.torneo_id = '22222222-0000-0000-0000-000000000001'
group by c.nombre, c.orden
order by c.orden;
