-- =============================================
-- SEED — 6 categorías × 20 parejas = 120 parejas, ~240 partidos
-- Correr en Supabase SQL Editor
-- =============================================

alter table partidos add column if not exists ronda text;

alter table parejas
  add constraint if not exists fk_jugador1 foreign key (jugador1_id) references jugadores(id),
  add constraint if not exists fk_jugador2 foreign key (jugador2_id) references jugadores(id);

-- Políticas de lectura pública
do $$ begin
  if not exists (select 1 from pg_policies where tablename='torneos'            and policyname='lectura_publica_torneos')            then execute 'create policy "lectura_publica_torneos"            on torneos            for select using (true)'; end if;
  if not exists (select 1 from pg_policies where tablename='sedes'              and policyname='lectura_publica_sedes')              then execute 'create policy "lectura_publica_sedes"              on sedes              for select using (true)'; end if;
  if not exists (select 1 from pg_policies where tablename='torneo_categorias'  and policyname='lectura_publica_torneo_categorias')  then execute 'create policy "lectura_publica_torneo_categorias"  on torneo_categorias  for select using (true)'; end if;
  if not exists (select 1 from pg_policies where tablename='parejas'            and policyname='lectura_publica_parejas')            then execute 'create policy "lectura_publica_parejas"            on parejas            for select using (true)'; end if;
  if not exists (select 1 from pg_policies where tablename='grupos'             and policyname='lectura_publica_grupos')             then execute 'create policy "lectura_publica_grupos"             on grupos             for select using (true)'; end if;
  if not exists (select 1 from pg_policies where tablename='grupo_parejas'      and policyname='lectura_publica_grupo_parejas')      then execute 'create policy "lectura_publica_grupo_parejas"      on grupo_parejas      for select using (true)'; end if;
  if not exists (select 1 from pg_policies where tablename='categorias'         and policyname='lectura_publica_categorias')         then execute 'create policy "lectura_publica_categorias"         on categorias         for select using (true)'; end if;
  if not exists (select 1 from pg_policies where tablename='jugadores'          and policyname='lectura_publica_jugadores')          then execute 'create policy "lectura_publica_jugadores"          on jugadores          for select using (true)'; end if;
end $$;

-- Usuario ficticio
insert into auth.users (id, email, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role, encrypted_password, confirmation_token, email_confirmed_at)
values ('00000000-0000-0000-0000-000000000001','seed@ejemplo.com',now(),now(),'{"provider":"email","providers":["email"]}','{}','authenticated','authenticated','','',now())
on conflict (id) do nothing;

-- =============================================
-- Limpieza
-- =============================================
delete from partidos       where torneo_id = '11111111-0000-0000-0000-000000000001';
delete from grupo_parejas  where grupo_id in (select id from grupos where torneo_categoria_id in (select id from torneo_categorias where torneo_id = '11111111-0000-0000-0000-000000000001'));
delete from grupos         where torneo_categoria_id in (select id from torneo_categorias where torneo_id = '11111111-0000-0000-0000-000000000001');
delete from parejas        where torneo_id = '11111111-0000-0000-0000-000000000001';
delete from torneo_categorias where torneo_id = '11111111-0000-0000-0000-000000000001';
delete from sedes          where torneo_id = '11111111-0000-0000-0000-000000000001';
delete from torneos        where id = '11111111-0000-0000-0000-000000000001';
delete from jugadores      where id::text like 'cccccccc%';

-- =============================================
-- Datos
-- =============================================
do $$
declare
  v_user   uuid := '00000000-0000-0000-0000-000000000001';
  v_torneo uuid := '11111111-0000-0000-0000-000000000001';
  v_vol    uuid := '22220000-0000-0000-0000-000000000001'; -- Voleando  (4 canchas)
  v_mas    uuid := '22220000-0000-0000-0000-000000000002'; -- Más Pádel (3 canchas)

  -- 6 categorías: 1-3 en Voleando, 4-6 en Más Pádel
  cat_nombres  text[]  := array['4ta Caballeros','5ta Caballeros','6ta Caballeros','4ta Damas','5ta Damas','Mixtos'];
  cat_canchas  int[]   := array[4, 4, 4, 3, 3, 3];

  -- Nombres para generar jugadores
  nm text[] := array['Martín','Pablo','Nicolás','Diego','Sebastián','Andrés','Tomás','Fernando','Alejandro','Ezequiel',
                     'Leandro','Facundo','Matías','Santiago','Luciano','Damián','Rodrigo','Gustavo','Esteban','Claudio'];
  nf text[] := array['Valentina','Camila','Florencia','Agustina','Sofía','Lucía','María','Ana','Paula','Carolina',
                     'Natalia','Jimena','Antonella','Micaela','Romina','Verónica','Daniela','Mariana','Gabriela','Celeste'];
  ap text[] := array['Rodríguez','García','López','Martínez','González','Pérez','Sánchez','Fernández','Gómez','Díaz',
                     'Torres','Ruiz','Ramírez','Herrera','Medina','Ibáñez','Castro','Vargas','Morales','Molina'];

  -- Round-robin: 10 partidos para 5 equipos (índices 1-5 dentro del grupo)
  rr_a int[] := array[1,1,1,1,2,2,2,3,3,4];
  rr_b int[] := array[2,3,4,5,3,4,5,4,5,5];

  -- Horarios: 8 slots por día
  slots text[] := array['09:00','10:30','12:00','13:30','15:00','16:30','18:00','19:30'];
  -- Fechas: 3 días
  dias  text[] := array['2026-04-17','2026-04-18','2026-04-19'];

  -- Variables de loop
  c int; g int; m int; p int;
  v_cat_id  uuid;
  v_tc_id   uuid;
  v_sede    uuid;
  v_canchas int;
  v_j1      uuid;
  v_j2      uuid;
  v_par     uuid;
  v_par_a   uuid;
  v_par_b   uuid;
  v_grupo   uuid;
  v_pid     uuid;
  v_ga      int;   -- global pair index A in match
  v_gb      int;   -- global pair index B in match
  v_pnum    int;   -- partido counter dentro de categoría
  v_dia     text;
  v_slot    text;
  v_cancha  int;
  v_estado  text;
  v_nombre  text;
  v_apell   text;

begin

  -- Torneo
  insert into torneos (id, nombre, fecha_inicio, fecha_fin, costo_inscripcion, estado, created_by)
  values (v_torneo, 'Interclub Las Flores 2026', '2026-04-17', '2026-04-19', 12000, 'en_curso', v_user)
  on conflict (id) do nothing;

  -- Sedes
  insert into sedes (id, torneo_id, nombre, canchas_count, horario_inicio, horario_fin, duracion_turno, disponibilidad) values
    (v_vol, v_torneo, 'Voleando',  4, '09:00', '21:30', 90, '{}'),
    (v_mas, v_torneo, 'Más Pádel', 3, '09:00', '21:30', 90, '{}')
  on conflict (id) do nothing;

  -- ────────────────────────────────────────────────────────────
  -- Loop por categoría
  -- ────────────────────────────────────────────────────────────
  for c in 1..6 loop

    select id into v_cat_id from categorias where nombre = cat_nombres[c] limit 1;
    v_sede    := case when c <= 3 then v_vol else v_mas end;
    v_canchas := cat_canchas[c];

    -- torneo_categoria
    v_tc_id := ('bbbbbbbb-0000-0000-0000-' || lpad(to_hex(c), 12, '0'))::uuid;
    insert into torneo_categorias (id, torneo_id, categoria_id, formato, sets, tercer_set)
    values (v_tc_id, v_torneo, v_cat_id, 'grupos_playoff', 'best_2', 'super_tie_break')
    on conflict (id) do nothing;

    -- ── Jugadores: 40 por categoría (2 por pareja × 20 parejas) ──
    for p in 1..40 loop
      v_j1 := ('cccccccc-' || lpad(to_hex(c), 4, '0') || '-0000-0000-' || lpad(to_hex(p), 12, '0'))::uuid;

      -- nombre según tipo de categoría
      if c <= 3 then          -- Caballeros: nombres masculinos
        v_nombre := nm[((p - 1) % 20) + 1];
      elsif c <= 5 then       -- Damas: nombres femeninos
        v_nombre := nf[((p - 1) % 20) + 1];
      else                    -- Mixtos: impares masc, pares fem
        v_nombre := case when p % 2 = 1 then nm[((p - 1) / 2 % 20) + 1] else nf[(p / 2 - 1) % 20 + 1] end;
      end if;
      v_apell := ap[((c * 40 + p - 1) % 20) + 1];

      insert into jugadores (id, nombre, apellido, telefono, categoria_id)
      values (v_j1, v_nombre, v_apell, null, v_cat_id)
      on conflict (id) do nothing;
    end loop;

    -- ── Parejas: 20 por categoría ──
    for p in 1..20 loop
      v_par := ('dddddddd-' || lpad(to_hex(c), 4, '0') || '-0000-0000-' || lpad(to_hex(p), 12, '0'))::uuid;
      v_j1  := ('cccccccc-' || lpad(to_hex(c), 4, '0') || '-0000-0000-' || lpad(to_hex(p * 2 - 1), 12, '0'))::uuid;
      v_j2  := ('cccccccc-' || lpad(to_hex(c), 4, '0') || '-0000-0000-' || lpad(to_hex(p * 2),     12, '0'))::uuid;
      insert into parejas (id, torneo_id, categoria_id, jugador1_id, jugador2_id)
      values (v_par, v_torneo, v_cat_id, v_j1, v_j2)
      on conflict (id) do nothing;
    end loop;

    -- ── Grupos: 4 × 5 parejas ──
    for g in 1..4 loop
      v_grupo := ('eeeeeeee-' || lpad(to_hex(c), 4, '0') || '-0000-0000-' || lpad(to_hex(g), 12, '0'))::uuid;
      insert into grupos (id, torneo_categoria_id, nombre)
      values (v_grupo, v_tc_id, chr(64 + g))   -- A, B, C, D
      on conflict (id) do nothing;

      for p in 1..5 loop
        v_par := ('dddddddd-' || lpad(to_hex(c), 4, '0') || '-0000-0000-' || lpad(to_hex((g-1)*5 + p), 12, '0'))::uuid;
        insert into grupo_parejas (grupo_id, pareja_id, posicion)
        values (v_grupo, v_par, p)
        on conflict do nothing;
      end loop;
    end loop;

    -- ── Partidos: 10 por grupo × 4 grupos = 40 por categoría ──
    -- Distribución: días 1 y 2 para grupos, día 3 para playoffs
    -- Día 1: partidos 1-20 (grupos A y B)
    -- Día 2: partidos 21-40 (grupos C y D)
    v_pnum := 0;

    for g in 1..4 loop
      for m in 1..10 loop
        v_pnum := v_pnum + 1;

        -- Índices globales de pareja (1-20)
        v_ga := (g - 1) * 5 + rr_a[m];
        v_gb := (g - 1) * 5 + rr_b[m];
        v_par_a := ('dddddddd-' || lpad(to_hex(c), 4, '0') || '-0000-0000-' || lpad(to_hex(v_ga), 12, '0'))::uuid;
        v_par_b := ('dddddddd-' || lpad(to_hex(c), 4, '0') || '-0000-0000-' || lpad(to_hex(v_gb), 12, '0'))::uuid;

        -- Día: primera mitad en día 1, segunda en día 2
        v_dia  := dias[case when v_pnum <= 20 then 1 else 2 end];
        v_slot := slots[((v_pnum - 1) % 8) + 1];
        -- Cancha: rotar con offset por categoría para distribuir entre canchas del día
        v_cancha := ((v_pnum - 1 + (c - 1) * 2) % v_canchas) + 1;

        -- Estado: día 1 finalizado, día 2 = primeros 5 pendientes + el 6to en vivo + resto pendiente
        v_estado := case
          when v_pnum <= 20 then 'finalizado'
          when v_pnum = 21  then 'en_vivo'
          else 'pendiente'
        end;

        v_pid := ('ffffffff-' || lpad(to_hex(c), 4, '0') || '-0000-0000-' || lpad(to_hex(v_pnum), 12, '0'))::uuid;

        insert into partidos (id, torneo_id, categoria_id, sede_id, cancha, horario, pareja1_id, pareja2_id, resultado, estado, tipo, ronda)
        values (
          v_pid, v_torneo, v_cat_id, v_sede, v_cancha,
          (v_dia || ' ' || v_slot || ':00-03:00')::timestamptz,
          v_par_a, v_par_b,
          case when v_estado = 'finalizado'
            then '{"sets_pareja1":2,"sets_pareja2":1,"sets":[{"p1":6,"p2":3},{"p1":4,"p2":6},{"p1":10,"p2":7}]}'::jsonb
            else null
          end,
          v_estado, 'grupo', null
        )
        on conflict (id) do nothing;

      end loop;
    end loop;

  end loop; -- categorías

  -- ────────────────────────────────────────────────────────────
  -- Playoff: cuartos, semis, final y 3er puesto por categoría
  -- Usando las primeras 8 parejas de cada categoría como placeholder
  -- ────────────────────────────────────────────────────────────
  for c in 1..6 loop
    select id into v_cat_id from categorias where nombre = cat_nombres[c] limit 1;
    v_sede := case when c <= 3 then v_vol else v_mas end;
    v_tc_id := ('bbbbbbbb-0000-0000-0000-' || lpad(to_hex(c), 12, '0'))::uuid;

    -- Cuartos de final (4 partidos)
    for m in 1..4 loop
      v_par_a := ('dddddddd-' || lpad(to_hex(c), 4, '0') || '-0000-0000-' || lpad(to_hex(m * 2 - 1), 12, '0'))::uuid;
      v_par_b := ('dddddddd-' || lpad(to_hex(c), 4, '0') || '-0000-0000-' || lpad(to_hex(m * 2),     12, '0'))::uuid;
      v_pid   := ('aaaaaaaa-' || lpad(to_hex(c), 4, '0') || '-0001-0000-' || lpad(to_hex(m),         12, '0'))::uuid;
      insert into partidos (id, torneo_id, categoria_id, sede_id, cancha, horario, pareja1_id, pareja2_id, resultado, estado, tipo, ronda)
      values (v_pid, v_torneo, v_cat_id, v_sede, m,
              ('2026-04-19 09:00:00-03:00')::timestamptz,
              v_par_a, v_par_b, null, 'pendiente', 'playoff', 'cuartos')
      on conflict (id) do nothing;
    end loop;

    -- Semifinales (2 partidos)
    for m in 1..2 loop
      v_par_a := ('dddddddd-' || lpad(to_hex(c), 4, '0') || '-0000-0000-' || lpad(to_hex(m * 2 + 7),  12, '0'))::uuid;
      v_par_b := ('dddddddd-' || lpad(to_hex(c), 4, '0') || '-0000-0000-' || lpad(to_hex(m * 2 + 8),  12, '0'))::uuid;
      v_pid   := ('aaaaaaaa-' || lpad(to_hex(c), 4, '0') || '-0002-0000-' || lpad(to_hex(m),           12, '0'))::uuid;
      insert into partidos (id, torneo_id, categoria_id, sede_id, cancha, horario, pareja1_id, pareja2_id, resultado, estado, tipo, ronda)
      values (v_pid, v_torneo, v_cat_id, v_sede, m,
              ('2026-04-19 11:00:00-03:00')::timestamptz,
              v_par_a, v_par_b, null, 'pendiente', 'playoff', 'semis')
      on conflict (id) do nothing;
    end loop;

    -- Final (1 partido)
    v_par_a := ('dddddddd-' || lpad(to_hex(c), 4, '0') || '-0000-0000-' || lpad(to_hex(13), 12, '0'))::uuid;
    v_par_b := ('dddddddd-' || lpad(to_hex(c), 4, '0') || '-0000-0000-' || lpad(to_hex(14), 12, '0'))::uuid;
    v_pid   := ('aaaaaaaa-' || lpad(to_hex(c), 4, '0') || '-0003-0000-000000000001')::uuid;
    insert into partidos (id, torneo_id, categoria_id, sede_id, cancha, horario, pareja1_id, pareja2_id, resultado, estado, tipo, ronda)
    values (v_pid, v_torneo, v_cat_id, v_sede, 1,
            ('2026-04-19 13:00:00-03:00')::timestamptz,
            v_par_a, v_par_b, null, 'pendiente', 'playoff', 'final')
    on conflict (id) do nothing;

    -- 3er puesto (1 partido)
    v_par_a := ('dddddddd-' || lpad(to_hex(c), 4, '0') || '-0000-0000-' || lpad(to_hex(15), 12, '0'))::uuid;
    v_par_b := ('dddddddd-' || lpad(to_hex(c), 4, '0') || '-0000-0000-' || lpad(to_hex(16), 12, '0'))::uuid;
    v_pid   := ('aaaaaaaa-' || lpad(to_hex(c), 4, '0') || '-0004-0000-000000000001')::uuid;
    insert into partidos (id, torneo_id, categoria_id, sede_id, cancha, horario, pareja1_id, pareja2_id, resultado, estado, tipo, ronda)
    values (v_pid, v_torneo, v_cat_id, v_sede, 2,
            ('2026-04-19 13:00:00-03:00')::timestamptz,
            v_par_a, v_par_b, null, 'pendiente', 'playoff', '3er_puesto')
    on conflict (id) do nothing;

  end loop; -- playoff

end $$;
