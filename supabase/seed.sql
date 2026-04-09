-- =============================================
-- SEED — Datos de ejemplo para desarrollo
-- IMPORTANTE: correr primero la migración de ronda si no existe:
--   alter table partidos add column if not exists ronda text;
-- =============================================
-- Correr en Supabase SQL Editor (corre como postgres, bypassa RLS)
-- =============================================

-- 1. Políticas de lectura pública que faltan
-- (sin esto, la app no puede leer torneos sin login)

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'torneos' and policyname = 'lectura_publica_torneos'
  ) then
    execute 'create policy "lectura_publica_torneos" on torneos for select using (true)';
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'sedes' and policyname = 'lectura_publica_sedes'
  ) then
    execute 'create policy "lectura_publica_sedes" on sedes for select using (true)';
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'torneo_categorias' and policyname = 'lectura_publica_torneo_categorias'
  ) then
    execute 'create policy "lectura_publica_torneo_categorias" on torneo_categorias for select using (true)';
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'parejas' and policyname = 'lectura_publica_parejas'
  ) then
    execute 'create policy "lectura_publica_parejas" on parejas for select using (true)';
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'grupos' and policyname = 'lectura_publica_grupos'
  ) then
    execute 'create policy "lectura_publica_grupos" on grupos for select using (true)';
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'grupo_parejas' and policyname = 'lectura_publica_grupo_parejas'
  ) then
    execute 'create policy "lectura_publica_grupo_parejas" on grupo_parejas for select using (true)';
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'categorias' and policyname = 'lectura_publica_categorias'
  ) then
    execute 'create policy "lectura_publica_categorias" on categorias for select using (true)';
  end if;
end $$;

-- =============================================
-- 2. Usuario ficticio para created_by
-- =============================================

insert into auth.users (
  id, email, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  aud, role, encrypted_password, confirmation_token,
  email_confirmed_at
) values (
  '00000000-0000-0000-0000-000000000001',
  'seed@ejemplo.com',
  now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  'authenticated', 'authenticated',
  '', '', now()
) on conflict (id) do nothing;

-- =============================================
-- 3. Datos de ejemplo
-- (usamos IDs fijos para poder referenciar entre tablas)
-- =============================================

do $$
declare
  -- UUIDs fijos
  v_user       uuid := '00000000-0000-0000-0000-000000000001';
  v_torneo     uuid := '11111111-0000-0000-0000-000000000001';
  v_sede_vol   uuid := '22220000-0000-0000-0000-000000000001'; -- Voleando
  v_sede_mas   uuid := '22220000-0000-0000-0000-000000000002'; -- Más Pádel

  -- Categorías (traemos las existentes del seed del schema)
  v_cat_5ta    uuid;
  v_cat_damas  uuid;

  -- torneo_categorias
  v_tc_5ta     uuid := '33330000-0000-0000-0000-000000000001';
  v_tc_damas   uuid := '33330000-0000-0000-0000-000000000002';

  -- Jugadores caballeros
  v_j1  uuid := '44440000-0000-0000-0000-000000000001';
  v_j2  uuid := '44440000-0000-0000-0000-000000000002';
  v_j3  uuid := '44440000-0000-0000-0000-000000000003';
  v_j4  uuid := '44440000-0000-0000-0000-000000000004';
  v_j5  uuid := '44440000-0000-0000-0000-000000000005';
  v_j6  uuid := '44440000-0000-0000-0000-000000000006';
  v_j7  uuid := '44440000-0000-0000-0000-000000000007';
  v_j8  uuid := '44440000-0000-0000-0000-000000000008';
  -- Jugadores damas
  v_j9  uuid := '44440000-0000-0000-0000-000000000009';
  v_j10 uuid := '44440000-0000-0000-0000-000000000010';
  v_j11 uuid := '44440000-0000-0000-0000-000000000011';
  v_j12 uuid := '44440000-0000-0000-0000-000000000012';

  -- Parejas caballeros (4 parejas = 2 grupos de 2)
  v_p1  uuid := '55550000-0000-0000-0000-000000000001';
  v_p2  uuid := '55550000-0000-0000-0000-000000000002';
  v_p3  uuid := '55550000-0000-0000-0000-000000000003';
  v_p4  uuid := '55550000-0000-0000-0000-000000000004';
  -- Parejas damas (2 parejas = 1 grupo)
  v_p5  uuid := '55550000-0000-0000-0000-000000000005';
  v_p6  uuid := '55550000-0000-0000-0000-000000000006';

  -- Grupos
  v_g1  uuid := '66660000-0000-0000-0000-000000000001'; -- Grupo A caballeros
  v_g2  uuid := '66660000-0000-0000-0000-000000000002'; -- Grupo B caballeros
  v_g3  uuid := '66660000-0000-0000-0000-000000000003'; -- Grupo A damas

  -- Partidos
  v_m1  uuid := '77770000-0000-0000-0000-000000000001';
  v_m2  uuid := '77770000-0000-0000-0000-000000000002';
  v_m3  uuid := '77770000-0000-0000-0000-000000000003';
  v_m4  uuid := '77770000-0000-0000-0000-000000000004'; -- en vivo
  v_m5  uuid := '77770000-0000-0000-0000-000000000005'; -- playoff semi
  v_m6  uuid := '77770000-0000-0000-0000-000000000006'; -- playoff final

begin

  -- Obtener IDs de categorías existentes
  select id into v_cat_5ta   from categorias where nombre = '5ta Caballeros' limit 1;
  select id into v_cat_damas from categorias where nombre = '4ta Damas'      limit 1;

  -- Torneo
  insert into torneos (id, nombre, fecha_inicio, fecha_fin, costo_inscripcion, estado, created_by)
  values (
    v_torneo,
    'Interclub Las Flores 2026',
    '2026-04-17', '2026-04-19',
    12000,
    'en_curso',
    v_user
  ) on conflict (id) do nothing;

  -- Sedes
  insert into sedes (id, torneo_id, nombre, canchas_count, horario_inicio, horario_fin, duracion_turno, disponibilidad)
  values
    (v_sede_vol, v_torneo, 'Voleando',  4, '08:00', '22:00', 90, '{}'),
    (v_sede_mas, v_torneo, 'Más Pádel', 3, '09:00', '21:00', 90, '{}')
  on conflict (id) do nothing;

  -- Torneo categorías
  insert into torneo_categorias (id, torneo_id, categoria_id, formato, sets, tercer_set)
  values
    (v_tc_5ta,   v_torneo, v_cat_5ta,   'grupos_playoff', 'best_2', 'super_tie_break'),
    (v_tc_damas, v_torneo, v_cat_damas, 'grupos_playoff', 'best_2', 'super_tie_break')
  on conflict (id) do nothing;

  -- Jugadores
  insert into jugadores (id, nombre, apellido, telefono) values
    (v_j1,  'Martín',   'Rodríguez', '1155550001'),
    (v_j2,  'Pablo',    'García',    '1155550002'),
    (v_j3,  'Nicolás',  'López',     '1155550003'),
    (v_j4,  'Diego',    'Martínez',  '1155550004'),
    (v_j5,  'Sebastián','Fernández', '1155550005'),
    (v_j6,  'Andrés',   'González',  '1155550006'),
    (v_j7,  'Lucas',    'Sánchez',   '1155550007'),
    (v_j8,  'Matías',   'Pérez',     '1155550008'),
    (v_j9,  'Valentina','Ruiz',      '1155550009'),
    (v_j10, 'Camila',   'Díaz',      '1155550010'),
    (v_j11, 'Florencia','Torres',    '1155550011'),
    (v_j12, 'Agustina', 'Ramírez',   '1155550012')
  on conflict (id) do nothing;

  -- Parejas caballeros
  insert into parejas (id, torneo_id, categoria_id, jugador1_id, jugador2_id) values
    (v_p1, v_torneo, v_cat_5ta, v_j1, v_j2),
    (v_p2, v_torneo, v_cat_5ta, v_j3, v_j4),
    (v_p3, v_torneo, v_cat_5ta, v_j5, v_j6),
    (v_p4, v_torneo, v_cat_5ta, v_j7, v_j8)
  on conflict (id) do nothing;

  -- Parejas damas
  insert into parejas (id, torneo_id, categoria_id, jugador1_id, jugador2_id) values
    (v_p5, v_torneo, v_cat_damas, v_j9,  v_j10),
    (v_p6, v_torneo, v_cat_damas, v_j11, v_j12)
  on conflict (id) do nothing;

  -- Grupos
  insert into grupos (id, torneo_categoria_id, nombre) values
    (v_g1, v_tc_5ta,   'A'),
    (v_g2, v_tc_5ta,   'B'),
    (v_g3, v_tc_damas, 'A')
  on conflict (id) do nothing;

  -- Pareja × Grupo
  insert into grupo_parejas (grupo_id, pareja_id, posicion) values
    (v_g1, v_p1, 1),
    (v_g1, v_p2, 2),
    (v_g2, v_p3, 1),
    (v_g2, v_p4, 2),
    (v_g3, v_p5, 1),
    (v_g3, v_p6, 2)
  on conflict do nothing;

  -- Partidos de grupo (finalizados) — para que TablaView muestre stats
  insert into partidos (id, torneo_id, categoria_id, sede_id, cancha, horario, pareja1_id, pareja2_id, resultado, estado, tipo)
  values
    -- Grupo A 5ta: p1 ganó 2-0
    (v_m1, v_torneo, v_cat_5ta, v_sede_vol, 1,
     '2026-04-17 10:00:00-03',
     v_p1, v_p2,
     '{"sets_pareja1": 2, "sets_pareja2": 0}',
     'finalizado', 'grupo'),
    -- Grupo B 5ta: p3 ganó 2-1
    (v_m2, v_torneo, v_cat_5ta, v_sede_vol, 2,
     '2026-04-17 11:30:00-03',
     v_p3, v_p4,
     '{"sets_pareja1": 2, "sets_pareja2": 1}',
     'finalizado', 'grupo'),
    -- Damas: p5 ganó 2-0
    (v_m3, v_torneo, v_cat_damas, v_sede_mas, 1,
     '2026-04-17 09:00:00-03',
     v_p5, v_p6,
     '{"sets_pareja1": 2, "sets_pareja2": 0}',
     'finalizado', 'grupo'),
    -- Partido EN VIVO 5ta (grupo, pendiente de resultado)
    (v_m4, v_torneo, v_cat_5ta, v_sede_mas, 2,
     '2026-04-19 14:00:00-03',
     v_p2, v_p4,
     null,
     'en_vivo', 'grupo')
  on conflict (id) do nothing;

  -- Migración inline: columna ronda en partidos
  alter table partidos add column if not exists ronda text;

  -- Partidos de playoff (llaves)
  insert into partidos (id, torneo_id, categoria_id, sede_id, cancha, horario, pareja1_id, pareja2_id, resultado, estado, tipo, ronda)
  values
    -- Semifinal 5ta (pendiente)
    (v_m5, v_torneo, v_cat_5ta, v_sede_vol, 3,
     '2026-04-19 16:00:00-03',
     v_p1, v_p3,
     null,
     'pendiente', 'playoff', 'semis'),
    -- Final 5ta (pendiente)
    (v_m6, v_torneo, v_cat_5ta, v_sede_vol, 1,
     '2026-04-19 18:00:00-03',
     v_p1, v_p3,
     null,
     'pendiente', 'playoff', 'final')
  on conflict (id) do nothing;

end $$;
