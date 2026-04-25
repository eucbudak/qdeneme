# Q Deneme

Haftalık deneme sınavı seçim platformu. Öğrenci her hafta belirlenen yayınlardan birini
seçer, kurum yöneticisi haftalık sınav/seans/yayın yönetimini yapar.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind v4
- Supabase (Postgres + Auth + pg_cron)
- shadcn/ui (Radix) bileşenler
- Deploy: Vercel

## Kurum ve seanslar

| Lokasyon          | Gün & Saat                   | Kapasite |
| ----------------- | ---------------------------- | -------- |
| Q work            | Cmt/Paz/Pzt (çoklu seans)    | Var      |
| KNT Akademi Efeler | Pazar 10:00                  | Yok      |
| KNT Akademi Nazilli| Pazar 10:00                  | Yok      |

## Yerel çalıştırma

```bash
# 1. Supabase URL + anon key'i .env.local'a kopyala
cp .env.local.example .env.local

# 2. Bağımlılıklar (ilk kez)
npm install

# 3. Dev server
npm run dev
```

http://localhost:3000 adresinde açılır.

## Önemli iş kuralları

- Öğrenci yalnızca kendi lokasyonunun seansına girebilir.
- Seçim için deadline: sınav gününden **10 gün önce**.
- Deadline geçince seçim yapmayan öğrenciye **varsayılan yayın** atanır.
- Varsayılan Q work seansı: **Pazar 10:00**. Dolu veya kapalıysa atama yapılmaz,
  yöneticiye uyarı düşer.
- Öğrenci şifre değiştiremez, unuttuğunda kurumdan talep eder.
