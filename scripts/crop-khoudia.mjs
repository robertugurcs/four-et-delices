/**
 * Crop Khoudia portrait: remove top empty space so the frame starts
 * just above her head, keeping the full width.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src  = path.join(__dirname, "../public/assets/last-trial.jpg");
const dest = path.join(__dirname, "../public/assets/last-trial.jpg");

const meta = await sharp(src).metadata();
const { width, height } = meta;

// Keep from ~12% down — removes the blank ceiling, head starts just inside frame
const topCrop   = Math.round(height * 0.12);
const newHeight = height - topCrop;

await sharp(src)
  .extract({ left: 0, top: topCrop, width, height: newHeight })
  .jpeg({ quality: 94, mozjpeg: true })
  .toFile(dest + ".tmp.jpg");

// overwrite original
fs.renameSync(dest + ".tmp.jpg", dest);

console.log(`Cropped: ${width}x${height} → ${width}x${newHeight} (removed top ${topCrop}px)`);
