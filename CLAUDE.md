# Q Deneme — Claude Code rehberi

## Proje özeti
Haftalık deneme sınavı seçim platformu. 3 lokasyon (Q work, KNT Efeler, KNT Nazilli).
Öğrenci her hafta yayın seçer, kurum yöneticisi haftalık konfigürasyonu girer.

## Stack
Next.js 15 (App Router, server components first) + TypeScript + Tailwind v4 + shadcn/ui.
DB/Auth: Supabase. Cron: Supabase pg_cron. Deploy: Vercel.

## Klasör yapısı
- `src/app/` — sayfalar. `/login`, `/student/*`, `/admin/*` ana alanlar.
- `src/lib/supabase/` — `client` (browser), `server` (RSC/server action), `admin` (service role).
- `src/lib/db/types.ts` — DB entity tipleri.
- `src/components/ui/` — shadcn bileşenleri.
- `supabase/` — SQL migration dosyaları.
- `src/middleware.ts` — session refresh + protected route koruması.

## Kurallar
- Server component default, "use client" sadece interaktif bileşenlerde.
- Mutation'lar için **Server Action** tercih et, API route yerine.
- Admin işlemleri `createAdminClient()` — service role. Asla client'a sızmasın.
- Öğrenci tarafı işlemleri `createClient()` (server.ts) — RLS ile korunmalı.
- UI dili Türkçe.
