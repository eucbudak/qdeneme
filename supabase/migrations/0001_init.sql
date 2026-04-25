-- Q Deneme initial schema
-- Institutions, profiles, exam weeks, sessions, publishers, selections, admin alerts.

create extension if not exists "uuid-ossp" with schema extensions;

-- ============================================================
-- Enums
-- ============================================================
create type institution_type as enum ('Q_WORK', 'KNT_EFELER', 'KNT_NAZILLI');
create type user_role as enum ('STUDENT', 'ADMIN');
create type alert_reason as enum (
  'DEFAULT_SESSION_FULL',
  'DEFAULT_SESSION_CLOSED',
  'NO_DEFAULT_PUBLISHER',
  'NO_DEFAULT_SESSION'
);

-- ============================================================
-- Tables
-- ============================================================
create table public.institutions (
  id uuid primary key default extensions.uuid_generate_v4(),
  name text not null,
  type institution_type not null unique,
  has_capacity boolean not null default false
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  role user_role not null,
  institution_id uuid references public.institutions(id),
  full_name text not null,
  is_active boolean not null default true,
  constraint profiles_student_has_institution check (
    (role = 'STUDENT' and institution_id is not null)
    or (role = 'ADMIN' and institution_id is null)
  )
);

create table public.exam_weeks (
  id uuid primary key default extensions.uuid_generate_v4(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  exam_date date not null,
  selection_deadline timestamptz not null,
  is_locked boolean not null default false,
  unique (institution_id, exam_date)
);

create table public.sessions (
  id uuid primary key default extensions.uuid_generate_v4(),
  exam_week_id uuid not null references public.exam_weeks(id) on delete cascade,
  session_datetime timestamptz not null,
  capacity integer,
  is_open boolean not null default true,
  is_default boolean not null default false
);

create table public.publishers (
  id uuid primary key default extensions.uuid_generate_v4(),
  exam_week_id uuid not null references public.exam_weeks(id) on delete cascade,
  name text not null,
  is_default boolean not null default false,
  unique (exam_week_id, name)
);

create table public.selections (
  id uuid primary key default extensions.uuid_generate_v4(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  exam_week_id uuid not null references public.exam_weeks(id) on delete cascade,
  publisher_id uuid not null references public.publishers(id),
  session_id uuid references public.sessions(id),
  is_default_assigned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, exam_week_id)
);

create table public.admin_alerts (
  id uuid primary key default extensions.uuid_generate_v4(),
  exam_week_id uuid not null references public.exam_weeks(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  reason alert_reason not null,
  created_at timestamptz not null default now(),
  is_resolved boolean not null default false
);

-- ============================================================
-- Indexes & partial uniques
-- ============================================================
create index profiles_institution_idx on public.profiles (institution_id) where role = 'STUDENT';
create index exam_weeks_institution_date_idx on public.exam_weeks (institution_id, exam_date);
create index sessions_exam_week_idx on public.sessions (exam_week_id);
create index publishers_exam_week_idx on public.publishers (exam_week_id);
create index selections_exam_week_idx on public.selections (exam_week_id);
create index selections_session_idx on public.selections (session_id);
create index admin_alerts_open_idx on public.admin_alerts (is_resolved, created_at);

-- Her sınav haftası için en fazla 1 varsayılan yayın, en fazla 1 varsayılan seans
create unique index one_default_publisher_per_week
  on public.publishers (exam_week_id) where is_default;
create unique index one_default_session_per_week
  on public.sessions (exam_week_id) where is_default;

-- ============================================================
-- updated_at trigger
-- ============================================================
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger selections_touch_updated_at
  before update on public.selections
  for each row execute function public.touch_updated_at();

-- ============================================================
-- Seed: 3 lokasyon (sabit)
-- ============================================================
insert into public.institutions (name, type, has_capacity) values
  ('Q work', 'Q_WORK', true),
  ('KNT Akademi Efeler', 'KNT_EFELER', false),
  ('KNT Akademi Nazilli', 'KNT_NAZILLI', false);

-- ============================================================
-- Helpers (security definer)
-- ============================================================
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from public.profiles
    where id = auth.uid() and role = 'ADMIN' and is_active = true
  );
$$;

create or replace function public.my_institution_id() returns uuid
language sql stable security definer set search_path = public as $$
  select institution_id from public.profiles where id = auth.uid();
$$;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.institutions enable row level security;
alter table public.profiles enable row level security;
alter table public.exam_weeks enable row level security;
alter table public.sessions enable row level security;
alter table public.publishers enable row level security;
alter table public.selections enable row level security;
alter table public.admin_alerts enable row level security;

-- institutions: herkes okuyabilir, sadece admin yazar
create policy institutions_read on public.institutions
  for select to authenticated using (true);
create policy institutions_admin_all on public.institutions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- profiles: kullanıcı kendi profilini okur, admin tümüne erişir
create policy profiles_self_read on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());
create policy profiles_admin_all on public.profiles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- exam_weeks: öğrenci sadece kendi lokasyonu, admin tümü
create policy exam_weeks_read on public.exam_weeks
  for select to authenticated using (
    public.is_admin() or institution_id = public.my_institution_id()
  );
create policy exam_weeks_admin_all on public.exam_weeks
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- sessions & publishers: bağlı olduğu exam_week görünüyorsa görünür
create policy sessions_read on public.sessions
  for select to authenticated using (
    public.is_admin() or exists (
      select 1 from public.exam_weeks w
      where w.id = sessions.exam_week_id
        and w.institution_id = public.my_institution_id()
    )
  );
create policy sessions_admin_all on public.sessions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy publishers_read on public.publishers
  for select to authenticated using (
    public.is_admin() or exists (
      select 1 from public.exam_weeks w
      where w.id = publishers.exam_week_id
        and w.institution_id = public.my_institution_id()
    )
  );
create policy publishers_admin_all on public.publishers
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- selections: öğrenci kendi seçimini okur/yazar (deadline'a kadar), admin tümü
create policy selections_self_read on public.selections
  for select to authenticated using (
    student_id = auth.uid() or public.is_admin()
  );
create policy selections_self_insert on public.selections
  for insert to authenticated with check (
    student_id = auth.uid()
    and not exists (
      select 1 from public.exam_weeks w
      where w.id = selections.exam_week_id
        and (w.is_locked = true or now() > w.selection_deadline)
    )
  );
create policy selections_self_update on public.selections
  for update to authenticated using (
    student_id = auth.uid()
    and not exists (
      select 1 from public.exam_weeks w
      where w.id = selections.exam_week_id
        and (w.is_locked = true or now() > w.selection_deadline)
    )
  ) with check (student_id = auth.uid());
create policy selections_admin_all on public.selections
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- admin_alerts: sadece admin
create policy admin_alerts_admin_all on public.admin_alerts
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
