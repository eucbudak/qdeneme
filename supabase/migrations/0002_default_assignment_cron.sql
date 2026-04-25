-- Varsayılan atama: deadline geçen haftalarda seçim yapmamış öğrencilere
-- varsayılan yayın + (Q work için) varsayılan seans atar.
-- Atama yapılamayanlar için admin_alerts üretir.

create extension if not exists pg_cron with schema pg_catalog;

create or replace function public.assign_defaults_for_due_weeks()
returns table(
  week_id uuid,
  assigned int,
  alerted int
)
language plpgsql
security definer
set search_path = public
as $$
declare
  w record;
  s record;
  inst_type institution_type;
  default_pub_id uuid;
  default_session_id uuid;
  default_session_open boolean;
  default_session_capacity int;
  default_session_used int;
  v_assigned int;
  v_alerted int;
begin
  -- Deadline geçmiş ve henüz kilitlenmemiş haftalar
  for w in
    select id, institution_id
      from public.exam_weeks
     where is_locked = false
       and selection_deadline < now()
  loop
    v_assigned := 0;
    v_alerted := 0;

    select type into inst_type from public.institutions where id = w.institution_id;

    -- Bu haftanın varsayılan yayını
    select id into default_pub_id
      from public.publishers
     where exam_week_id = w.id and is_default = true
     limit 1;

    -- Bu haftanın varsayılan seansı (varsa)
    select id, is_open, capacity into default_session_id, default_session_open, default_session_capacity
      from public.sessions
     where exam_week_id = w.id and is_default = true
     limit 1;

    if default_session_id is not null then
      select count(*) into default_session_used
        from public.selections
       where session_id = default_session_id;
    else
      default_session_used := 0;
    end if;

    -- Seçim yapmamış aktif öğrenciler
    for s in
      select p.id as student_id
        from public.profiles p
        left join public.selections sel
          on sel.student_id = p.id and sel.exam_week_id = w.id
       where p.role = 'STUDENT'
         and p.is_active = true
         and p.institution_id = w.institution_id
         and sel.id is null
    loop
      -- Varsayılan yayın yoksa: alert
      if default_pub_id is null then
        insert into public.admin_alerts (exam_week_id, student_id, reason)
        values (w.id, s.student_id, 'NO_DEFAULT_PUBLISHER');
        v_alerted := v_alerted + 1;
        continue;
      end if;

      -- Q work ise seans gerekli
      if inst_type = 'Q_WORK' then
        if default_session_id is null then
          insert into public.admin_alerts (exam_week_id, student_id, reason)
          values (w.id, s.student_id, 'NO_DEFAULT_SESSION');
          v_alerted := v_alerted + 1;
          continue;
        end if;

        if not default_session_open then
          insert into public.admin_alerts (exam_week_id, student_id, reason)
          values (w.id, s.student_id, 'DEFAULT_SESSION_CLOSED');
          v_alerted := v_alerted + 1;
          continue;
        end if;

        if default_session_capacity is not null
           and default_session_used >= default_session_capacity then
          insert into public.admin_alerts (exam_week_id, student_id, reason)
          values (w.id, s.student_id, 'DEFAULT_SESSION_FULL');
          v_alerted := v_alerted + 1;
          continue;
        end if;

        insert into public.selections
          (student_id, exam_week_id, publisher_id, session_id, is_default_assigned)
        values
          (s.student_id, w.id, default_pub_id, default_session_id, true);
        default_session_used := default_session_used + 1;
        v_assigned := v_assigned + 1;
      else
        -- KNT: tek seans (varsa default = o tek seans), kapasite yok
        insert into public.selections
          (student_id, exam_week_id, publisher_id, session_id, is_default_assigned)
        values
          (s.student_id, w.id, default_pub_id, default_session_id, true);
        v_assigned := v_assigned + 1;
      end if;
    end loop;

    -- Haftayı kilitle
    update public.exam_weeks set is_locked = true where id = w.id;

    week_id := w.id;
    assigned := v_assigned;
    alerted := v_alerted;
    return next;
  end loop;
end;
$$;

-- Her 15 dakikada bir çalıştır
select cron.schedule(
  'assign-defaults-every-15min',
  '*/15 * * * *',
  $cron$ select public.assign_defaults_for_due_weeks(); $cron$
);
