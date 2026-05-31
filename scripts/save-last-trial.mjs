/**
 * Copy latest ChatGPT export from Cursor workspace storage into the site + Desktop.
 * Run after a new attachment lands (update `source` / glob as needed).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const assetsDir = path.join(
  process.env.USERPROFILE ?? "",
  ".cursor/projects/c-Users-ugura-OneDrive-Desktop-CAKE-WEBSITE/assets",
);

const matches = fs
  .readdirSync(assetsDir)
  .filter((n) => n.includes("4e849c56") && n.endsWith(".png"));
const pick = matches[0];
if (!pick) {
  console.error("No matching source in", assetsDir);
  process.exit(1);
}

const source = path.join(assetsDir, pick);
const buf = fs.readFileSync(source);

const webDest = path.join(root, "public/assets/last-trial.jpg");
const desktopDest = path.join(
  process.env.USERPROFILE ?? "",
  "OneDrive/Desktop/last trial.jpg",
);

await sharp(buf).jpeg({ quality: 94, mozjpeg: true }).toFile(webDest);
const m = await sharp(webDest).metadata();

fs.mkdirSync(path.dirname(desktopDest), { recursive: true });
fs.copyFileSync(webDest, desktopDest);

console.log("Web:", webDest, `${m.width}x${m.height}`);
console.log("Desktop:", desktopDest);
