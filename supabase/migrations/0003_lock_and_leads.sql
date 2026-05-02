-- 0003: change_lock_at (öğrenci değişiklik kilidi) + lead_applications (ön başvuru formu)
--
-- change_lock_at: bu tarihten sonra öğrenci seçim ekleyemez/değiştiremez,
-- ama varsayılan atama hâlâ selection_deadline'da çalışır.
-- NULL bırakılırsa eski davranış: sadece selection_deadline kilitler.

-- ============================================================
-- A) exam_weeks: change_lock_at alanı
-- ============================================================
alter table public.exam_weeks
  add column change_lock_at timestamptz;

alter table public.exam_weeks
  add constraint exam_weeks_change_lock_lte_deadline check (
    change_lock_at is null or change_lock_at <= selection_deadline
  );

-- ============================================================
-- B) RLS: selections insert/update için change_lock_at kontrolü
-- ============================================================
drop policy if exists selections_self_insert on public.selections;
drop policy if exists selections_self_update on public.selections;

create policy selections_self_insert on public.selections
  for insert to authenticated with check (
    student_id = auth.uid()
    and not exists (
      select 1 from public.exam_weeks w
      where w.id = selections.exam_week_id
        and (
          w.is_locked = true
          or now() > w.selection_deadline
          or (w.change_lock_at is not null and now() > w.change_lock_at)
        )
    )
  );

create policy selections_self_update on public.selections
  for update to authenticated using (
    student_id = auth.uid()
    and not exists (
      select 1 from public.exam_weeks w
      where w.id = selections.exam_week_id
        and (
          w.is_locked = true
          or now() > w.selection_deadline
          or (w.change_lock_at is not null and now() > w.change_lock_at)
        )
    )
  ) with check (student_id = auth.uid());

-- ============================================================
-- C) lead_applications: ön başvuru formu
-- ============================================================
create type grade_level as enum ('GRADE_9', 'GRADE_10', 'GRADE_11', 'GRADE_12', 'MEZUN');
create type study_track as enum ('SAY', 'EA', 'DIL', 'SOZEL');
create type lead_status as enum ('NEW', 'CONTACTING', 'NOT_REACHED', 'CONVERTED', 'REJECTED');

create table public.lead_applications (
  id uuid primary key default extensions.uuid_generate_v4(),
  full_name text not null,
  grade grade_level not null,
  track study_track not null,
  phone text not null,
  parent_phone text,
  preferred_institution_id uuid not null references public.institutions(id),
  status lead_status not null default 'NEW',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index lead_applications_status_created_idx
  on public.lead_applications (status, created_at desc);
create index lead_applications_institution_idx
  on public.lead_applications (preferred_institution_id);

create trigger lead_applications_touch_updated_at
  before update on public.lead_applications
  for each row execute function public.touch_updated_at();

-- RLS: sadece admin okur/yazar. Insert'ler server action'dan admin client (service role) ile yapılır.
alter table public.lead_applications enable row level security;

create policy lead_applications_admin_all on public.lead_applications
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
