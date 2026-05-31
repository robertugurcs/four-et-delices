/**
 * Makes near-pure-black pixels in the cloud divider PNG transparent so the
 * cream section below shows through (export mockups often use black).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, "../public/assets/testimonials-cloud-divider.png");

if (!fs.existsSync(file)) {
  console.error("Missing:", file);
  process.exit(1);
}

const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({
  resolveWithObject: true,
});

const px = data;
const n = info.width * info.height;
for (let i = 0; i < n; i++) {
  const o = i * 4;
  const r = px[o];
  const g = px[o + 1];
  const b = px[o + 2];
  if (r < 28 && g < 28 && b < 28) {
    px[o + 3] = 0;
  }
}

await sharp(px, {
  raw: {
    width: info.width,
    height: info.height,
    channels: 4,
  },
})
  .png()
  .toFile(file);

console.log("OK:", file, info.width, "x", info.height);
