-- =============================================
-- SEED — Datos de ejemplo para desarrollo
-- Correr en Supabase SQL Editor
-- =============================================

-- 1. Columna ronda si no existe
alter table partidos add column if not exists ronda text;

-- FK jugadores → parejas (necesario para joins en PostgREST)
alter table parejas
  add constraint if not exists fk_jugador1 foreign key (jugador1_id) references jugadores(id),
  add constraint if not exists fk_jugador2 foreign key (jugador2_id) references jugadores(id);

-- 2. Políticas de lectura pública (idempotentes)
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'torneos' and policyname = 'lectura_publica_torneos') then
    execute 'create policy "lectura_publica_torneos" on torneos for select using (true)'; end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'sedes' and policyname = 'lectura_publica_sedes') then
    execute 'create policy "lectura_publica_sedes" on sedes for select using (true)'; end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'torneo_categorias' and policyname = 'lectura_publica_torneo_categorias') then
    execute 'create policy "lectura_publica_torneo_categorias" on torneo_categorias for select using (true)'; end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'parejas' and policyname = 'lectura_publica_parejas') then
    execute 'create policy "lectura_publica_parejas" on parejas for select using (true)'; end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'grupos' and policyname = 'lectura_publica_grupos') then
    execute 'create policy "lectura_publica_grupos" on grupos for select using (true)'; end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'grupo_parejas' and policyname = 'lectura_publica_grupo_parejas') then
    execute 'create policy "lectura_publica_grupo_parejas" on grupo_parejas for select using (true)'; end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'categorias' and policyname = 'lectura_publica_categorias') then
    execute 'create policy "lectura_publica_categorias" on categorias for select using (true)'; end if;
end $$;

-- 3. Usuario ficticio
insert into auth.users (
  id, email, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  aud, role, encrypted_password, confirmation_token, email_confirmed_at
) values (
  '00000000-0000-0000-0000-000000000001', 'seed@ejemplo.com',
  now(), now(),
  '{"provider":"email","providers":["email"]}', '{}',
  'authenticated', 'authenticated', '', '', now()
) on conflict (id) do nothing;

-- =============================================
-- 4. Limpiar seed anterior para recargar limpio
-- =============================================
delete from partidos       where torneo_id = '11111111-0000-0000-0000-000000000001';
delete from grupo_parejas  where grupo_id  in (select id from grupos where torneo_categoria_id in (select id from torneo_categorias where torneo_id = '11111111-0000-0000-0000-000000000001'));
delete from grupos         where torneo_categoria_id in (select id from torneo_categorias where torneo_id = '11111111-0000-0000-0000-000000000001');
delete from parejas        where torneo_id = '11111111-0000-0000-0000-000000000001';
delete from torneo_categorias where torneo_id = '11111111-0000-0000-0000-000000000001';
delete from sedes          where torneo_id = '11111111-0000-0000-0000-000000000001';
delete from torneos        where id        = '11111111-0000-0000-0000-000000000001';
delete from jugadores      where id::text like 'cccccccc%';

-- =============================================
-- 5. Datos completos
-- =============================================
do $$
declare
  v_user    uuid := '00000000-0000-0000-0000-000000000001';
  v_torneo  uuid := '11111111-0000-0000-0000-000000000001';

  -- Sedes
  v_vol uuid := '22220000-0000-0000-0000-000000000001'; -- Voleando (4 canchas)
  v_mas uuid := '22220000-0000-0000-0000-000000000002'; -- Más Pádel (3 canchas)

  -- Categorías (se buscan del seed del schema)
  v_5ta    uuid;
  v_4ta    uuid;
  v_damas  uuid;
  v_mixtos uuid;

  -- torneo_categorias
  v_tc1 uuid := 'bbbbbbbb-0000-0000-0000-000000000001';
  v_tc2 uuid := 'bbbbbbbb-0000-0000-0000-000000000002';
  v_tc3 uuid := 'bbbbbbbb-0000-0000-0000-000000000003';
  v_tc4 uuid := 'bbbbbbbb-0000-0000-0000-000000000004';

  -- Jugadores 5ta Caballeros (6)
  v_j01 uuid := 'cccccccc-0000-0000-0000-000000000001';
  v_j02 uuid := 'cccccccc-0000-0000-0000-000000000002';
  v_j03 uuid := 'cccccccc-0000-0000-0000-000000000003';
  v_j04 uuid := 'cccccccc-0000-0000-0000-000000000004';
  v_j05 uuid := 'cccccccc-0000-0000-0000-000000000005';
  v_j06 uuid := 'cccccccc-0000-0000-0000-000000000006';

  -- Jugadores 4ta Caballeros (6)
  v_j07 uuid := 'cccccccc-0000-0000-0000-000000000007';
  v_j08 uuid := 'cccccccc-0000-0000-0000-000000000008';
  v_j09 uuid := 'cccccccc-0000-0000-0000-000000000009';
  v_j10 uuid := 'cccccccc-0000-0000-0000-000000000010';
  v_j11 uuid := 'cccccccc-0000-0000-0000-000000000011';
  v_j12 uuid := 'cccccccc-0000-0000-0000-000000000012';

  -- Jugadores 4ta Damas (6)
  v_j13 uuid := 'cccccccc-0000-0000-0000-000000000013';
  v_j14 uuid := 'cccccccc-0000-0000-0000-000000000014';
  v_j15 uuid := 'cccccccc-0000-0000-0000-000000000015';
  v_j16 uuid := 'cccccccc-0000-0000-0000-000000000016';
  v_j17 uuid := 'cccccccc-0000-0000-0000-000000000017';
  v_j18 uuid := 'cccccccc-0000-0000-0000-000000000018';

  -- Jugadores Mixtos (6)
  v_j19 uuid := 'cccccccc-0000-0000-0000-000000000019';
  v_j20 uuid := 'cccccccc-0000-0000-0000-000000000020';
  v_j21 uuid := 'cccccccc-0000-0000-0000-000000000021';
  v_j22 uuid := 'cccccccc-0000-0000-0000-000000000022';
  v_j23 uuid := 'cccccccc-0000-0000-0000-000000000023';
  v_j24 uuid := 'cccccccc-0000-0000-0000-000000000024';

  -- Parejas (12 total, 3 por categoría)
  v_p01 uuid := 'dddddddd-0000-0000-0000-000000000001'; -- 5ta: Rodríguez/García
  v_p02 uuid := 'dddddddd-0000-0000-0000-000000000002'; -- 5ta: López/Martínez
  v_p03 uuid := 'dddddddd-0000-0000-0000-000000000003'; -- 5ta: Fernández/González

  v_p04 uuid := 'dddddddd-0000-0000-0000-000000000004'; -- 4ta: Gómez/Díaz
  v_p05 uuid := 'dddddddd-0000-0000-0000-000000000005'; -- 4ta: Torres/Ruiz
  v_p06 uuid := 'dddddddd-0000-0000-0000-000000000006'; -- 4ta: Ramírez/Herrera

  v_p07 uuid := 'dddddddd-0000-0000-0000-000000000007'; -- Damas: V.Ruiz/Díaz
  v_p08 uuid := 'dddddddd-0000-0000-0000-000000000008'; -- Damas: Torres/Ramírez
  v_p09 uuid := 'dddddddd-0000-0000-0000-000000000009'; -- Damas: Morales/Castro

  v_p10 uuid := 'dddddddd-0000-0000-0000-000000000010'; -- Mixtos: Suárez/Vega
  v_p11 uuid := 'dddddddd-0000-0000-0000-000000000011'; -- Mixtos: Ibáñez/Blanco
  v_p12 uuid := 'dddddddd-0000-0000-0000-000000000012'; -- Mixtos: Molina/Sosa

  -- Grupos (4)
  v_g1 uuid := 'eeeeeeee-0000-0000-0000-000000000001'; -- Grupo A 5ta Cabs
  v_g2 uuid := 'eeeeeeee-0000-0000-0000-000000000002'; -- Grupo A 4ta Cabs
  v_g3 uuid := 'eeeeeeee-0000-0000-0000-000000000003'; -- Grupo A Damas
  v_g4 uuid := 'eeeeeeee-0000-0000-0000-000000000004'; -- Grupo A Mixtos

begin

  -- Categorías (buscar por nombre, pre-seeded en schema.sql)
  select id into v_5ta    from categorias where nombre = '5ta Caballeros' limit 1;
  select id into v_4ta    from categorias where nombre = '4ta Caballeros' limit 1;
  select id into v_damas  from categorias where nombre = '4ta Damas'      limit 1;
  select id into v_mixtos from categorias where nombre = 'Mixtos'         limit 1;

  -- Torneo
  insert into torneos (id, nombre, fecha_inicio, fecha_fin, costo_inscripcion, estado, created_by) values
    (v_torneo, 'Interclub Las Flores 2026', '2026-04-17', '2026-04-19', 12000, 'en_curso', v_user)
  on conflict (id) do nothing;

  -- Sedes
  insert into sedes (id, torneo_id, nombre, canchas_count, horario_inicio, horario_fin, duracion_turno, disponibilidad) values
    (v_vol, v_torneo, 'Voleando',  4, '08:00', '22:00', 90, '{}'),
    (v_mas, v_torneo, 'Más Pádel', 3, '09:00', '21:00', 90, '{}')
  on conflict (id) do nothing;

  -- Torneo categorías
  insert into torneo_categorias (id, torneo_id, categoria_id, formato, sets, tercer_set) values
    (v_tc1, v_torneo, v_5ta,    'grupos_playoff', 'best_2', 'super_tie_break'),
    (v_tc2, v_torneo, v_4ta,    'grupos_playoff', 'best_2', 'super_tie_break'),
    (v_tc3, v_torneo, v_damas,  'grupos_playoff', 'best_2', 'super_tie_break'),
    (v_tc4, v_torneo, v_mixtos, 'grupos_playoff', 'best_2', 'super_tie_break')
  on conflict (id) do nothing;

  -- ─── Jugadores ────────────────────────────────────────────
  -- 5ta Caballeros
  insert into jugadores (id, nombre, apellido, telefono, categoria_id) values
    (v_j01, 'Martín',    'Rodríguez', '1155550001', v_5ta),
    (v_j02, 'Pablo',     'García',    '1155550002', v_5ta),
    (v_j03, 'Nicolás',   'López',     '1155550003', v_5ta),
    (v_j04, 'Diego',     'Martínez',  '1155550004', v_5ta),
    (v_j05, 'Sebastián', 'Fernández', '1155550005', v_5ta),
    (v_j06, 'Andrés',    'González',  '1155550006', v_5ta)
  on conflict (id) do nothing;

  -- 4ta Caballeros
  insert into jugadores (id, nombre, apellido, telefono, categoria_id) values
    (v_j07, 'Tomás',     'Gómez',    '1155550007', v_4ta),
    (v_j08, 'Fernando',  'Díaz',     '1155550008', v_4ta),
    (v_j09, 'Alejandro', 'Torres',   '1155550009', v_4ta),
    (v_j10, 'Ezequiel',  'Ruiz',     '1155550010', v_4ta),
    (v_j11, 'Leandro',   'Ramírez',  '1155550011', v_4ta),
    (v_j12, 'Facundo',   'Herrera',  '1155550012', v_4ta)
  on conflict (id) do nothing;

  -- 4ta Damas
  insert into jugadores (id, nombre, apellido, telefono, categoria_id) values
    (v_j13, 'Valentina', 'Ruiz',    '1155550013', v_damas),
    (v_j14, 'Camila',    'Díaz',    '1155550014', v_damas),
    (v_j15, 'Florencia', 'Torres',  '1155550015', v_damas),
    (v_j16, 'Agustina',  'Ramírez', '1155550016', v_damas),
    (v_j17, 'Sofía',     'Morales', '1155550017', v_damas),
    (v_j18, 'Lucía',     'Castro',  '1155550018', v_damas)
  on conflict (id) do nothing;

  -- Mixtos
  insert into jugadores (id, nombre, apellido, telefono, categoria_id) values
    (v_j19, 'Carlos',    'Suárez',  '1155550019', v_mixtos),
    (v_j20, 'Ana',       'Vega',    '1155550020', v_mixtos),
    (v_j21, 'Miguel',    'Ibáñez',  '1155550021', v_mixtos),
    (v_j22, 'Julia',     'Blanco',  '1155550022', v_mixtos),
    (v_j23, 'Roberto',   'Molina',  '1155550023', v_mixtos),
    (v_j24, 'Carla',     'Sosa',    '1155550024', v_mixtos)
  on conflict (id) do nothing;

  -- ─── Parejas ──────────────────────────────────────────────
  insert into parejas (id, torneo_id, categoria_id, jugador1_id, jugador2_id) values
    (v_p01, v_torneo, v_5ta,    v_j01, v_j02),
    (v_p02, v_torneo, v_5ta,    v_j03, v_j04),
    (v_p03, v_torneo, v_5ta,    v_j05, v_j06),
    (v_p04, v_torneo, v_4ta,    v_j07, v_j08),
    (v_p05, v_torneo, v_4ta,    v_j09, v_j10),
    (v_p06, v_torneo, v_4ta,    v_j11, v_j12),
    (v_p07, v_torneo, v_damas,  v_j13, v_j14),
    (v_p08, v_torneo, v_damas,  v_j15, v_j16),
    (v_p09, v_torneo, v_damas,  v_j17, v_j18),
    (v_p10, v_torneo, v_mixtos, v_j19, v_j20),
    (v_p11, v_torneo, v_mixtos, v_j21, v_j22),
    (v_p12, v_torneo, v_mixtos, v_j23, v_j24)
  on conflict (id) do nothing;

  -- ─── Grupos ───────────────────────────────────────────────
  insert into grupos (id, torneo_categoria_id, nombre) values
    (v_g1, v_tc1, 'A'),
    (v_g2, v_tc2, 'A'),
    (v_g3, v_tc3, 'A'),
    (v_g4, v_tc4, 'A')
  on conflict (id) do nothing;

  insert into grupo_parejas (grupo_id, pareja_id, posicion) values
    (v_g1, v_p01, 1), (v_g1, v_p02, 2), (v_g1, v_p03, 3),
    (v_g2, v_p04, 1), (v_g2, v_p05, 2), (v_g2, v_p06, 3),
    (v_g3, v_p07, 1), (v_g3, v_p08, 2), (v_g3, v_p09, 3),
    (v_g4, v_p10, 1), (v_g4, v_p11, 2), (v_g4, v_p12, 3)
  on conflict do nothing;

  -- ─── Partidos ─────────────────────────────────────────────
  -- Round robin 3 parejas = 3 partidos por grupo = 12 de grupo total
  -- + 8 de playoff (2 semis + 1 final por categoría)
  -- Voleando: 5ta Cabs (C1-C2) + Damas (C3-C4)
  -- Más Pádel: 4ta Cabs (C1-C2) + Mixtos (C2-C3)

  insert into partidos (id, torneo_id, categoria_id, sede_id, cancha, horario, pareja1_id, pareja2_id, resultado, estado, tipo, ronda) values

    -- ══════════════════════════════
    -- DÍA 1 — 17/04 — GRUPOS
    -- ══════════════════════════════

    -- 5ta Cabs en Voleando (3 matches)
    ('ffffffff-0000-0000-0000-000000000001', v_torneo, v_5ta, v_vol, 1,
     '2026-04-17 09:00:00-03', v_p01, v_p02,
     '{"sets_pareja1": 2, "sets_pareja2": 1}', 'finalizado', 'grupo', null),

    ('ffffffff-0000-0000-0000-000000000002', v_torneo, v_5ta, v_vol, 2,
     '2026-04-17 10:30:00-03', v_p02, v_p03,
     '{"sets_pareja1": 1, "sets_pareja2": 2}', 'finalizado', 'grupo', null),

    ('ffffffff-0000-0000-0000-000000000003', v_torneo, v_5ta, v_vol, 1,
     '2026-04-17 12:00:00-03', v_p01, v_p03,
     '{"sets_pareja1": 2, "sets_pareja2": 0}', 'finalizado', 'grupo', null),

    -- 4ta Cabs en Más Pádel (3 matches)
    ('ffffffff-0000-0000-0000-000000000004', v_torneo, v_4ta, v_mas, 1,
     '2026-04-17 09:00:00-03', v_p04, v_p05,
     '{"sets_pareja1": 2, "sets_pareja2": 0}', 'finalizado', 'grupo', null),

    ('ffffffff-0000-0000-0000-000000000005', v_torneo, v_4ta, v_mas, 2,
     '2026-04-17 10:30:00-03', v_p05, v_p06,
     '{"sets_pareja1": 2, "sets_pareja2": 1}', 'finalizado', 'grupo', null),

    ('ffffffff-0000-0000-0000-000000000006', v_torneo, v_4ta, v_mas, 1,
     '2026-04-17 12:00:00-03', v_p04, v_p06,
     '{"sets_pareja1": 2, "sets_pareja2": 0}', 'finalizado', 'grupo', null),

    -- ══════════════════════════════
    -- DÍA 2 — 18/04 — GRUPOS
    -- ══════════════════════════════

    -- Damas en Voleando (3 matches: 2 finalizados + 1 EN VIVO)
    ('ffffffff-0000-0000-0000-000000000007', v_torneo, v_damas, v_vol, 3,
     '2026-04-18 09:00:00-03', v_p07, v_p08,
     '{"sets_pareja1": 2, "sets_pareja2": 1}', 'finalizado', 'grupo', null),

    ('ffffffff-0000-0000-0000-000000000008', v_torneo, v_damas, v_vol, 4,
     '2026-04-18 10:30:00-03', v_p08, v_p09,
     '{"sets_pareja1": 0, "sets_pareja2": 2}', 'finalizado', 'grupo', null),

    ('ffffffff-0000-0000-0000-000000000009', v_torneo, v_damas, v_vol, 3,
     '2026-04-18 12:00:00-03', v_p07, v_p09,
     null, 'en_vivo', 'grupo', null),  -- ← PARTIDO EN VIVO

    -- Mixtos en Más Pádel (3 matches: 1 finalizado + 2 pendientes)
    ('ffffffff-0000-0000-0000-000000000010', v_torneo, v_mixtos, v_mas, 2,
     '2026-04-18 09:00:00-03', v_p10, v_p11,
     '{"sets_pareja1": 1, "sets_pareja2": 2}', 'finalizado', 'grupo', null),

    ('ffffffff-0000-0000-0000-000000000011', v_torneo, v_mixtos, v_mas, 3,
     '2026-04-18 10:30:00-03', v_p11, v_p12,
     null, 'pendiente', 'grupo', null),

    ('ffffffff-0000-0000-0000-000000000012', v_torneo, v_mixtos, v_mas, 2,
     '2026-04-18 12:00:00-03', v_p10, v_p12,
     null, 'pendiente', 'grupo', null),

    -- ══════════════════════════════
    -- DÍA 3 — 19/04 — PLAYOFFS
    -- ══════════════════════════════

    -- 5ta Cabs: Semis + Final (Voleando C1-C2)
    ('ffffffff-0000-0000-0000-000000000013', v_torneo, v_5ta, v_vol, 1,
     '2026-04-19 09:00:00-03', v_p01, v_p03,
     null, 'pendiente', 'playoff', 'semis'),

    ('ffffffff-0000-0000-0000-000000000014', v_torneo, v_5ta, v_vol, 2,
     '2026-04-19 09:00:00-03', v_p02, v_p03,
     null, 'pendiente', 'playoff', 'semis'),

    ('ffffffff-0000-0000-0000-000000000015', v_torneo, v_5ta, v_vol, 1,
     '2026-04-19 14:00:00-03', v_p01, v_p02,
     null, 'pendiente', 'playoff', 'final'),

    -- 4ta Cabs: Semis + Final (Más Pádel C1)
    ('ffffffff-0000-0000-0000-000000000016', v_torneo, v_4ta, v_mas, 1,
     '2026-04-19 09:00:00-03', v_p04, v_p06,
     null, 'pendiente', 'playoff', 'semis'),

    ('ffffffff-0000-0000-0000-000000000017', v_torneo, v_4ta, v_mas, 2,
     '2026-04-19 09:00:00-03', v_p05, v_p06,
     null, 'pendiente', 'playoff', 'semis'),

    ('ffffffff-0000-0000-0000-000000000018', v_torneo, v_4ta, v_mas, 1,
     '2026-04-19 14:00:00-03', v_p04, v_p05,
     null, 'pendiente', 'playoff', 'final'),

    -- Damas: Semis + Final (Voleando C3-C4)
    ('ffffffff-0000-0000-0000-000000000019', v_torneo, v_damas, v_vol, 3,
     '2026-04-19 09:00:00-03', v_p07, v_p09,
     null, 'pendiente', 'playoff', 'semis'),

    ('ffffffff-0000-0000-0000-000000000020', v_torneo, v_damas, v_vol, 4,
     '2026-04-19 09:00:00-03', v_p08, v_p09,
     null, 'pendiente', 'playoff', 'semis'),

    ('ffffffff-0000-0000-0000-000000000021', v_torneo, v_damas, v_vol, 3,
     '2026-04-19 14:00:00-03', v_p07, v_p08,
     null, 'pendiente', 'playoff', 'final'),

    -- Mixtos: Semis + Final (Más Pádel C2-C3)
    ('ffffffff-0000-0000-0000-000000000022', v_torneo, v_mixtos, v_mas, 2,
     '2026-04-19 09:00:00-03', v_p10, v_p12,
     null, 'pendiente', 'playoff', 'semis'),

    ('ffffffff-0000-0000-0000-000000000023', v_torneo, v_mixtos, v_mas, 3,
     '2026-04-19 09:00:00-03', v_p11, v_p12,
     null, 'pendiente', 'playoff', 'semis'),

    ('ffffffff-0000-0000-0000-000000000024', v_torneo, v_mixtos, v_mas, 2,
     '2026-04-19 14:00:00-03', v_p10, v_p11,
     null, 'pendiente', 'playoff', 'final')

  on conflict (id) do nothing;

end $$;
