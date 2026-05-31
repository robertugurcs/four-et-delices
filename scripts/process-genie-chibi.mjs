/**
 * One-off: remove near-black backdrop from chibi genie PNG, write PNG with alpha.
 * Usage: node scripts/process-genie-chibi.mjs [inputPath] [outputPath]
 */
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const defaultIn =
  process.argv[2] ||
  path.join(
    process.env.USERPROFILE || "",
    ".cursor",
    "projects",
    "c-Users-ugura-OneDrive-Desktop-CAKE-WEBSITE",
    "assets",
    "c__Users_ugura_AppData_Roaming_Cursor_User_workspaceStorage_8536800473ef9c69fc93f6cb709bb513_images_genie-2aab8d91-4ad7-411a-b072-b227da24e38c.png",
  );
const outPath = process.argv[3] || path.join(root, "public", "assets", "category-wish", "genie-chibi.png");

const THRESH = 32; // RGB below this → transparent (crush black matte)

const img = sharp(defaultIn).ensureAlpha();
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
if (channels !== 4) {
  console.error("Expected RGBA");
  process.exit(1);
}
for (let i = 0; i < data.length; i += 4) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  if (r <= THRESH && g <= THRESH && b <= THRESH) {
    data[i + 3] = 0;
  }
}

await sharp(data, { raw: { width, height, channels: 4 } })
  .png({ compressionLevel: 9, effort: 10 })
  .toFile(outPath);

console.log("Wrote", outPath);
