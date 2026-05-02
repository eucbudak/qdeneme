-- 0004: institutions için iletişim alanları (ana sayfada lokasyonlar bölümü için)
-- Hepsi nullable; veriler zamanla doldurulur, eksik alanlar UI'da "Yakında" olarak gösterilir.

alter table public.institutions
  add column address text,
  add column phone text,
  add column maps_url text;

-- Anonim ziyaretçilerin (anon role) institutions read edebilmesi için.
-- Şu an sadece authenticated rolüne open; ana sayfa ön başvuru formu için
-- public read gerekli (lokasyon listesi + lokasyon kartları).
drop policy if exists institutions_public_read on public.institutions;
create policy institutions_public_read on public.institutions
  for select to anon, authenticated using (true);
