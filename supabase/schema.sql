-- =============================================
-- Vertical Deportes — Schema Supabase
-- =============================================

-- Categorías (seed data)
create table categorias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo text not null check (tipo in ('caballeros', 'damas', 'especial')),
  orden int not null
);

-- Seed de categorías
insert into categorias (nombre, tipo, orden) values
  ('2da Caballeros', 'caballeros', 1),
  ('3ra Caballeros', 'caballeros', 2),
  ('4ta Caballeros', 'caballeros', 3),
  ('5ta Caballeros', 'caballeros', 4),
  ('6ta Caballeros', 'caballeros', 5),
  ('7ma Caballeros', 'caballeros', 6),
  ('3ra Damas',      'damas',      7),
  ('4ta Damas',      'damas',      8),
  ('5ta Damas',      'damas',      9),
  ('6ta Damas',      'damas',      10),
  ('Mixtos',         'especial',   11),
  ('Suma 10',        'especial',   12),
  ('Suma 12',        'especial',   13),
  ('Veteranos +45',  'especial',   14),
  ('Veteranos +55',  'especial',   15);

-- Torneos
create table torneos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  fecha_inicio date not null,
  fecha_fin date not null,
  costo_inscripcion numeric(10,2) not null default 0,
  estado text not null default 'borrador'
    check (estado in ('borrador', 'inscripcion', 'en_curso', 'finalizado')),
  tipo text not null default 'regular'
    check (tipo in ('regular', 'interclub')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

-- Sedes
create table sedes (
  id uuid primary key default gen_random_uuid(),
  torneo_id uuid not null references torneos(id) on delete cascade,
  nombre text not null,
  canchas_count int not null check (canchas_count > 0),
  horario_inicio time not null,
  horario_fin time not null,
  duracion_turno int not null check (duracion_turno in (60, 90, 120)),
  disponibilidad jsonb not null default '{}'
);

-- Torneo × Categoria (con reglas)
create table torneo_categorias (
  id uuid primary key default gen_random_uuid(),
  torneo_id uuid not null references torneos(id) on delete cascade,
  categoria_id uuid not null references categorias(id),
  formato text not null check (formato in ('grupos_playoff', 'americano', 'eliminacion_directa', 'interclub')),
  sets text not null check (sets in ('best_2', 'best_3')),
  tercer_set text not null check (tercer_set in ('completo', 'tie_break', 'super_tie_break')),
  unique (torneo_id, categoria_id)
);

-- Clubes (para interclub)
create table clubes (
  id uuid primary key default gen_random_uuid(),
  torneo_id uuid not null references torneos(id) on delete cascade,
  nombre text not null
);

-- Parejas (Spec 1: jugadores como UUIDs; FK estricta a jugadores en Spec 2)
create table parejas (
  id uuid primary key default gen_random_uuid(),
  torneo_id uuid not null references torneos(id) on delete cascade,
  categoria_id uuid not null references categorias(id),
  jugador1_id uuid not null,
  jugador2_id uuid,  -- nullable: pareja incompleta permitida
  club_id uuid references clubes(id),
  created_at timestamptz not null default now(),
  constraint unique_jugador1_torneo unique (torneo_id, jugador1_id)
);

-- Grupos
create table grupos (
  id uuid primary key default gen_random_uuid(),
  torneo_categoria_id uuid not null references torneo_categorias(id) on delete cascade,
  nombre text not null
);

-- Pareja × Grupo
create table grupo_parejas (
  grupo_id uuid not null references grupos(id) on delete cascade,
  pareja_id uuid not null references parejas(id) on delete cascade,
  posicion int,
  primary key (grupo_id, pareja_id)
);

-- Partidos
create table partidos (
  id uuid primary key default gen_random_uuid(),
  torneo_id uuid not null references torneos(id) on delete cascade,
  categoria_id uuid not null references categorias(id),
  sede_id uuid not null references sedes(id),
  cancha int not null,
  horario timestamptz not null,
  pareja1_id uuid not null references parejas(id),
  pareja2_id uuid not null references parejas(id),
  resultado jsonb,
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'en_vivo', 'finalizado')),
  tipo text not null check (tipo in ('grupo', 'playoff')),
  created_at timestamptz not null default now()
);

-- Veedores (control de acceso por sede)
create table veedores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  sede_id uuid not null references sedes(id) on delete cascade,
  unique (user_id, sede_id)
);

-- Jugadores (nueva — Spec 1, extendida con email y fecha_nacimiento)
create table jugadores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  apellido text not null,
  telefono text,
  email text,
  fecha_nacimiento date,
  categoria_id uuid references categorias(id),
  created_at timestamptz not null default now()
);

alter table jugadores enable row level security;

create policy "lectura_publica_jugadores" on jugadores
  for select using (true);

create policy "organizador_jugadores" on jugadores
  for all using (auth.uid() is not null);

-- =============================================
-- RLS
-- =============================================

alter table torneos enable row level security;
alter table sedes enable row level security;
alter table torneo_categorias enable row level security;
alter table parejas enable row level security;
alter table grupos enable row level security;
alter table grupo_parejas enable row level security;
alter table partidos enable row level security;
alter table veedores enable row level security;
alter table clubes enable row level security;

-- Torneos: organizador ve y modifica sus torneos
create policy "organizador_torneos" on torneos
  for all using (auth.uid() = created_by);

-- Sedes: organizador del torneo
create policy "organizador_sedes" on sedes
  for all using (
    exists (select 1 from torneos t where t.id = sedes.torneo_id and t.created_by = auth.uid())
  );

-- Partidos: organizador puede todo; veedor solo update de su sede
create policy "organizador_partidos" on partidos
  for all using (
    exists (select 1 from torneos t where t.id = partidos.torneo_id and t.created_by = auth.uid())
  );

create policy "veedor_update_partidos" on partidos
  for update using (
    exists (select 1 from veedores v where v.user_id = auth.uid() and v.sede_id = partidos.sede_id)
  );

-- Lectura pública de partidos (jugadores ven fixture en tiempo real)
create policy "lectura_publica_partidos" on partidos
  for select using (true);

create policy "lectura_publica_categorias" on categorias
  for select using (true);

-- =============================================
-- RPC — Spec 1
-- =============================================

create or replace function crear_torneo_completo(payload jsonb)
returns uuid language plpgsql security definer as $$
declare
  v_torneo_id uuid;
  v_sede record;
begin
  -- 1. Crear torneo
  insert into torneos (nombre, fecha_inicio, fecha_fin, costo_inscripcion, estado, created_by)
  values (
    payload->>'nombre',
    (payload->>'fecha_inicio')::date,
    (payload->>'fecha_fin')::date,
    (payload->>'costo_inscripcion')::numeric,
    'borrador',
    auth.uid()
  ) returning id into v_torneo_id;

  -- 2. Crear sedes
  for v_sede in select * from jsonb_array_elements(payload->'sedes')
  loop
    insert into sedes (torneo_id, nombre, canchas_count, horario_inicio, horario_fin, duracion_turno, disponibilidad)
    values (
      v_torneo_id,
      v_sede.value->>'nombre',
      2,
      (v_sede.value->>'horario_inicio')::time,
      (v_sede.value->>'horario_fin')::time,
      (payload->>'duracion_turno')::int,
      v_sede.value->'disponibilidad'
    );
  end loop;

  -- 3. Crear torneo_categorias
  insert into torneo_categorias (torneo_id, categoria_id, formato, sets, tercer_set)
  select
    v_torneo_id,
    (cat->>'categoria_id')::uuid,
    cat->>'formato',
    cat->>'sets',
    cat->>'tercer_set'
  from jsonb_array_elements(payload->'categorias') as cat;

  return v_torneo_id;
end;
$$;
