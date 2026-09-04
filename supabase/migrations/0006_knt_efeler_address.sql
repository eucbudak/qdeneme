-- 0006: KNT Akademi Efeler yeni adrese taşındı.
-- Eski: Mimar Sinan Mahallesi 2427 Sokak No:30, Efeler / Aydın
-- Yeni: Mimar Sinan Mahallesi Efekent Bulv. No:32 Sarızeybek Bisiklet Karşısı, Efeler / Aydın
-- maps_url de yeni adrese göre güncelleniyor.

update public.institutions
set
  address = 'Mimar Sinan Mahallesi Efekent Bulv. No:32 Sarızeybek Bisiklet Karşısı, Efeler / Aydın',
  maps_url = 'https://www.google.com/maps/search/?api=1&query=Mimar%20Sinan%20Mahallesi%20Efekent%20Bulvar%C4%B1%20No%2032%20Efeler%20Ayd%C4%B1n'
where type = 'KNT_EFELER';
