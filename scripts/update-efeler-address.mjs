// KNT Akademi Efeler'in yeni adresini yazar (service role, tek seferlik komut).
// Migration 0006 ile aynı işi yapar; canlı DB'ye SQL erişimi olmadığında kullanılır.
// Kullanım: node scripts/update-efeler-address.mjs
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) process.env[m[1]] ??= m[2].trim();
  }
}

loadEnv();

const ADDRESS =
  "Mimar Sinan Mahallesi Efekent Bulv. No:32 Sarızeybek Bisiklet Karşısı, Efeler / Aydın";
const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Mimar%20Sinan%20Mahallesi%20Efekent%20Bulvar%C4%B1%20No%2032%20Efeler%20Ayd%C4%B1n";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const { data, error } = await admin
  .from("institutions")
  .update({ address: ADDRESS, maps_url: MAPS_URL })
  .eq("type", "KNT_EFELER")
  .select("name, address, maps_url");

if (error) {
  console.error("Güncellenemedi:", error.message);
  process.exit(1);
}

console.log("Güncellendi:", JSON.stringify(data, null, 2));
