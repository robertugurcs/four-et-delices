/**
 * Circular favicon from badge logo — white disc, transparent corners (true circle in tabs).
 * Run: npm run build:favicon
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const SIZE = 512;
const APPLE_SIZE = 180;
const ICON_SIZE = 64;
/** Center-crop zoom — pushes hat/hearts/bowl larger inside the tab icon */
const ZOOM = 1.28;

const SOURCE = path.join(root, "public/assets/rename4.png");

function circleMask(size) {
  return Buffer.from(
    `<svg width="${size}" height="${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/>
    </svg>`,
  );
}

async function buildCircleBadge(src) {
  const meta = await sharp(src).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  if (!w || !h) throw new Error("Could not read source dimensions");

  const cropSize = Math.round(Math.min(w, h) / ZOOM);
  const left = Math.round((w - cropSize) / 2);
  const top = Math.round((h - cropSize) / 2);

  const zoomed = await sharp(src)
    .ensureAlpha()
    .extract({ left, top, width: cropSize, height: cropSize })
    .resize(SIZE, SIZE, {
      fit: "fill",
      kernel: sharp.kernel.lanczos3,
    })
    .png()
    .toBuffer();

  return sharp(zoomed)
    .composite([{ input: circleMask(SIZE), blend: "dest-in" }])
    .png()
    .toBuffer();
}

function resizeForTabIcon(input, size) {
  return sharp(input)
    .resize(size, size, { kernel: sharp.kernel.lanczos3 })
    .sharpen({ sigma: size <= 64 ? 1.1 : 0.6, m1: 0.5, m2: 2.5 })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

async function main() {
  if (!fs.existsSync(SOURCE)) {
    console.error("Badge source missing:", SOURCE);
    process.exit(1);
  }

  const circlePng = await buildCircleBadge(SOURCE);

  const outPublic = path.join(root, "public/assets/four-et-delices-favicon-circle.png");
  const outAppIcon = path.join(root, "src/app/icon.png");
  const outApple = path.join(root, "src/app/apple-icon.png");

  const icon64 = await resizeForTabIcon(circlePng, ICON_SIZE);
  const apple180 = await resizeForTabIcon(circlePng, APPLE_SIZE);

  await sharp(circlePng).png().toFile(outPublic);
  await sharp(icon64).toFile(outAppIcon);
  await sharp(apple180).toFile(outApple);

  console.log("Wrote", outPublic, `${SIZE}x${SIZE} (circular, transparent corners)`);
  console.log("Wrote", outAppIcon, `${ICON_SIZE}x${ICON_SIZE}`);
  console.log("Wrote", outApple, `${APPLE_SIZE}x${APPLE_SIZE}`);
  console.log("Source:", SOURCE);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
