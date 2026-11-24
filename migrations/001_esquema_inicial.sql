create table if not exists usuarios (
  id text primary key,
  email text not null unique,
  nombre text not null,
  rol text not null,
  isla text,
  sector text,
  ejemplo boolean not null default false,
  salt text not null,
  hash text not null
);

create table if not exists sesiones (
  token text primary key,
  user_id text not null references usuarios (id) on delete cascade,
  expira timestamptz not null
);

create index if not exists sesiones_expira_idx on sesiones (expira);

create table if not exists fichas (
  id text primary key,
  documento jsonb not null,
  actualizado_en timestamptz not null
);

create index if not exists fichas_actualizado_idx on fichas (actualizado_en desc);

create table if not exists calendario (
  id text primary key,
  fecha text not null,
  documento jsonb not null
);

create index if not exists calendario_fecha_idx on calendario (fecha);

create table if not exists metricas (
  mes text primary key,
  documento jsonb not null
);
