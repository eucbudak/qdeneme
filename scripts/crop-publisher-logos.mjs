// Canva'dan inen 30-logo grid PNG'sini tek tek logoya böler.
// Kaynak: 1920x1080, 5 sütun x 6 satır.
// Kullanım: node scripts/crop-publisher-logos.mjs
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const SRC = "C:/Users/EMRE/Downloads/Adsız tasarım (2).png";
const OUT_DIR = resolve("public/publishers");

// Grid metriği (görsel inspekte göre tahmin):
const GRID_X0 = 510; // ilk sütun sol kenarı
const GRID_Y0 = 80;  // ilk satır üst kenarı
const CELL_W = 147;
const CELL_H = 151;
const COLS = 5;
const ROWS = 6;
// Komşu hücrenin sarı çemberi sızmasın diye iç boşluk
const PAD_X = 8;
const PAD_TOP = 12;
const PAD_BOTTOM = 8;

// Sıralı yayın isimleri (sol→sağ, üst→alt)
const NAMES = [
  // Row 1
  "ozdebir", "ucdortbes", "bilgi-sarmal", "3d", "palme",
  // Row 2
  "vip", "karekok", "paraf", "acil", "proba",
  // Row 3
  "orbital", "hiz-ve-renk", "orijinal-matematik", "toprak", "paylasim",
  // Row 4
  "endemik", "supara", "ankara", "ephesus", "tammat",
  // Row 5
  "origami", "limit", "miray", "okyanus", "esen",
  // Row 6  (ozdebir 2. kez tekrarlıyor — skip)
  "sonuc", "__skip_ozdebir_dup__", "baris", "apotemi", "cap",
];

await mkdir(OUT_DIR, { recursive: true });

let saved = 0;
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const idx = r * COLS + c;
    const name = NAMES[idx];
    if (!name || name.startsWith("__skip")) continue;

    const left = GRID_X0 + c * CELL_W + PAD_X;
    const top = GRID_Y0 + r * CELL_H + PAD_TOP;
    const width = CELL_W - 2 * PAD_X;
    const height = CELL_H - PAD_TOP - PAD_BOTTOM;

    const outPath = resolve(OUT_DIR, `${name}.png`);
    await sharp(SRC)
      .extract({ left, top, width, height })
      // Beyaz dış kenarları kırp ki logo kareye sıkışmış görünmesin
      .trim({ background: "white", threshold: 12 })
      .png()
      .toFile(outPath);
    saved++;
    console.log(`✓ ${name}.png`);
  }
}
console.log(`\nToplam ${saved} logo kaydedildi → ${OUT_DIR}`);
