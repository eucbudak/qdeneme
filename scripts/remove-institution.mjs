// Bir kurumu ve bağlı tüm verisini siler (service role, tek seferlik komut).
// Migration 0005 ile aynı işi yapar; canlı DB'ye SQL erişimi olmadığında kullanılır.
// Kullanım: node scripts/remove-institution.mjs <INSTITUTION_TYPE> [--apply]
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) process.env[m[1]] ??= m[2].trim();
  }
}

const [instType] = process.argv.slice(2);
const apply = process.argv.includes("--apply");

if (!instType) {
  console.error("Kullanım: node scripts/remove-institution.mjs <INSTITUTION_TYPE> [--apply]");
  process.exit(1);
}

loadEnv();

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const { data: inst, error: instErr } = await admin
  .from("institutions")
  .select("id, name, type")
  .eq("type", instType)
  .maybeSingle();

if (instErr) {
  console.error("Kurum okunamadı:", instErr.message);
  process.exit(1);
}
if (!inst) {
  console.log(`'${instType}' kurumu bulunamadı — yapılacak bir şey yok.`);
  process.exit(0);
}

console.log(`Kurum: ${inst.name} (${inst.type}) — ${inst.id}\n`);

const { data: students } = await admin
  .from("profiles")
  .select("id, username, full_name")
  .eq("institution_id", inst.id);

const { data: weeks } = await admin
  .from("exam_weeks")
  .select("id, exam_date")
  .eq("institution_id", inst.id);

const { count: leads } = await admin
  .from("lead_applications")
  .select("id", { count: "exact", head: true })
  .eq("preferred_institution_id", inst.id);

console.log(`Silinecek öğrenci: ${students.length}`);
for (const s of students) console.log(`  ${s.username.padEnd(20)} ${s.full_name}`);
console.log(`Silinecek sınav haftası: ${weeks.length} (seans/yayın/seçim cascade)`);
for (const w of weeks) console.log(`  ${w.exam_date}`);

// lead_applications.preferred_institution_id cascade DEĞİL — varsa kurum silinemez.
if (leads > 0) {
  console.error(`\nDUR: bu kuruma bağlı ${leads} ön başvuru var, FK silmeyi engeller.`);
  console.error("Önce başvuruları taşıyın veya silin.");
  process.exit(1);
}

if (!apply) {
  console.log("\n[KURU ÇALIŞTIRMA] Hiçbir şey silinmedi. Silmek için --apply ekleyin.");
  process.exit(0);
}

console.log("\n1) Öğrenciler siliniyor (auth.users → profiles cascade)...");
const failed = [];
for (const s of students) {
  const { error } = await admin.auth.admin.deleteUser(s.id);
  if (error) failed.push(`${s.username}: ${error.message}`);
  else console.log(`   silindi: ${s.username}`);
}
if (failed.length) {
  console.error("Silinemeyen öğrenciler, kurum silinmedi:");
  for (const f of failed) console.error("  " + f);
  process.exit(1);
}

console.log("\n2) Kurum siliniyor (exam_weeks → sessions/publishers/selections cascade)...");
const { error: delErr } = await admin.from("institutions").delete().eq("id", inst.id);
if (delErr) {
  console.error("Kurum silinemedi:", delErr.message);
  process.exit(1);
}
console.log("   silindi.");

// Doğrulama
const { data: remainInst } = await admin.from("institutions").select("type");
const { count: remainStud } = await admin
  .from("profiles")
  .select("id", { count: "exact", head: true })
  .eq("institution_id", inst.id);
const { count: remainWeeks } = await admin
  .from("exam_weeks")
  .select("id", { count: "exact", head: true })
  .eq("institution_id", inst.id);

console.log("\nDoğrulama:");
console.log(`  kalan kurumlar: ${remainInst.map((i) => i.type).join(", ")}`);
console.log(`  bu kuruma bağlı kalan profil: ${remainStud}, hafta: ${remainWeeks}`);
