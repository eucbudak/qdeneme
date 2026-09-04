-- 0005: KNT Akademi Nazilli şubesi kapandı, kurum ve bağlı tüm verisi kaldırılıyor.
--
-- Silme sırası önemli:
--   1. Öğrenciler — profiles.institution_id FK'sinde cascade YOK, o yüzden kurumdan
--      önce gitmeli. auth.users silinince profiles → selections/admin_alerts cascade olur.
--   2. Kurum — exam_weeks cascade, oradan sessions/publishers/selections cascade.
--
-- institution_type enum'ından 'KNT_NAZILLI' değeri KALDIRILMADI: Postgres enum
-- değeri düşürmeyi desteklemiyor (DROP VALUE yok), tipi yeniden yaratmak ise
-- 0002'deki assign_defaults_for_due_weeks fonksiyonunun inst_type değişkenini
-- bozar. Değer artık hiçbir satırda kullanılmıyor, kalması zararsız.
-- TS tarafında InstitutionType union'ından çıkarıldı.

-- 1. Nazilli öğrencilerinin auth kullanıcıları (profiles cascade ile gider)
delete from auth.users
where id in (
  select p.id
  from public.profiles p
  join public.institutions i on i.id = p.institution_id
  where i.type = 'KNT_NAZILLI'
);

-- 2. Kurum kaydı (exam_weeks → sessions/publishers/selections cascade)
delete from public.institutions where type = 'KNT_NAZILLI';
