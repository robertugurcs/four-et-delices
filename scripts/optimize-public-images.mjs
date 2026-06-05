/**
 * One-time-ish optimizer: converts the referenced photographic PNGs under
 * /public/assets to WebP (quality 82, alpha preserved). WebP is true lossy
 * with alpha, so there is no palette banding on portraits — quality stays high
 * while size drops ~90%. Originals are deleted only after a successful encode.
 *
 * The list below mirrors every .png referenced from src/ (components + data).
 * Run: node scripts/optimize-public-images.mjs
 */
import sharp from "sharp";
import { existsSync, statSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";

const PUBLIC = resolve(process.cwd(), "public");
const QUALITY = 82;

/** Build the our-cakes angle paths (k/b/c/w 1..4, angle 1..3). */
function ourCakesPaths() {
  const cats = [
    ["kids", "k"],
    ["birthdays", "b"],
    ["corporate", "c"],
    ["weddings", "w"],
  ];
  const out = [];
  for (const [cat, code] of cats) {
    for (let n = 1; n <= 4; n++) {
      for (let a = 1; a <= 3; a++) {
        out.push(`assets/our-cakes/${cat}/${code}-${n}/angle-${a}.png`);
      }
    }
  }
  return out;
}

/** reveal/{B,C,K,W}-{1..4}-1.png */
function revealPaths() {
  const out = [];
  for (const code of ["B", "C", "K", "W"]) {
    for (let n = 1; n <= 4; n++) out.push(`assets/reveal/${code}-${n}-1.png`);
  }
  return out;
}

const REFERENCED = [
  "assets/four-et-delices-wordmark.png",
  "assets/testimonials/left.png",
  "assets/testimonials/right.png",
  "assets/category-wish/genie-chibi.png",
  "assets/category-wish/four-et-delices-wordmark.png",
  "assets/category-wish/K-1-1.png",
  "assets/category-wish/W-2-1.png",
  "assets/category-wish/B-4-1.png",
  "assets/category-wish/C-4-1.png",
  "assets/extract/W-2-1.png",
  "assets/meet-khoudia/mobile-black-khoudia.png",
  "assets/meet-khoudia/mobile-pink.png",
  "assets/khoudia/khoudia-desktop-english.png",
  "assets/khoudia/khoudia-mobil-english.png",
  "assets/khoudia/hd-version.png",
  "assets/khoudia/khoudia-mobile.png",
  ...ourCakesPaths(),
  ...revealPaths(),
];

let beforeTotal = 0;
let afterTotal = 0;
let converted = 0;
const missing = [];

for (const rel of REFERENCED) {
  const src = resolve(PUBLIC, rel);
  if (!existsSync(src)) {
    missing.push(rel);
    continue;
  }
  const dst = src.replace(/\.png$/i, ".webp");
  const before = statSync(src).size;
  // eslint-disable-next-line no-await-in-loop
  await sharp(src)
    .webp({ quality: QUALITY, effort: 6 })
    .toFile(dst);
  const after = statSync(dst).size;
  beforeTotal += before;
  afterTotal += after;
  converted += 1;
  unlinkSync(src);
  console.log(
    `${rel}  ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`,
  );
}

console.log("\n--- summary ---");
console.log(`converted: ${converted}`);
console.log(`before: ${(beforeTotal / 1024 / 1024).toFixed(1)}MB`);
console.log(`after:  ${(afterTotal / 1024 / 1024).toFixed(1)}MB`);
if (missing.length) {
  console.log(`\nmissing (skipped): ${missing.length}`);
  for (const m of missing) console.log(`  ${m}`);
}
