/**
 * Key flat background out of wordmark raster → transparent PNG for hero overlay.
 * Corner sample: near-black → black key; otherwise cream (#f6f1ea family).
 *
 * Black matte: AA edges are premultiplied on black (brown RGB still contains black).
 * We estimate foreground color F from solid pixels and solve α from O = F*(α/255),
 * then output straight alpha + unpremultiplied RGB so compositing onto cream/video
 * does not show gray/tan halos.
 *
 * JPEG sources (often 4:2:0) look rough on type — upscale 3× with Lanczos3 *before*
 * keying. After matte, edge RGB is nudged toward the estimated glyph tone (despill) to cut
 * grey halos on cream/video. Replace the working source PNG with an export **without artefacts**
 * (AI images often embed thin scratches/noise that no script can reliably remove — retouch export).
 *
 * Run: node scripts/build-wordmark-transparent.mjs
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

/** Cursor chat → optional fallbacks if `public/assets/wordmark-four-et-delices-source.png` is missing locally. */
const CURSOR_ASSET_FILES = [
  "c__Users_ugura_OneDrive_Desktop_CAKE-WEBSITE_public_assets_wordmark-four-et-delices-source.png",
  "c__Users_ugura_AppData_Roaming_Cursor_User_workspaceStorage_8536800473ef9c69fc93f6cb709bb513_images_ChatGPT_Image_Apr_28__2026__05_23_47_PM-47e9122b-c03a-4153-86d7-cae9750f72e4.png",
  "c__Users_ugura_AppData_Roaming_Cursor_User_workspaceStorage_8536800473ef9c69fc93f6cb709bb513_images_ChatGPT_Image_Apr_28__2026__03_24_06_PM-ea1109b4-c202-40e1-985f-54ffef49378b.png",
];

function resolveSource() {
  const local = path.join(root, "public/assets/wordmark-four-et-delices-source.png");
  if (fs.existsSync(local)) return local;
  const assetsDir = path.join(
    os.homedir(),
    ".cursor",
    "projects",
    "c-Users-ugura-OneDrive-Desktop-CAKE-WEBSITE",
    "assets",
  );
  for (const name of CURSOR_ASSET_FILES) {
    const p = path.join(assetsDir, name);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

const OUT = path.join(root, "public/assets/four-et-delices-wordmark.png");

const CREAM_BG = { r: 248, g: 241, b: 233 };
const CREAM_KEY = { inner: 48, feather: 36 };

/** Siyah zemin + kahverengi tipografi: AA kenarlar için sıkı iç eşik + tüy. */
const BLACK_BG = { r: 0, g: 0, b: 0 };
const BLACK_KEY = { inner: 20, feather: 26 };

/** Upscale factor before keying (helps when source is compressed / chroma-subsampled JPEG). */
const UPSCALE = 3;

/**
 * Straight-alpha edge pixels toward estimated glyph RGB to reduce matte grey fringes
 * without killing core anti-alias (weighted by transparency).
 */
function despillStraightAlphaTowardF(out, F, strength = 0.42) {
  for (let i = 0; i < out.length; i += 4) {
    const a = out[i + 3];
    if (a < 5 || a > 252) continue;
    const w = strength * ((255 - a) / 255);
    out[i] = Math.round(Math.min(255, Math.max(0, out[i] + (F.r - out[i]) * w)));
    out[i + 1] = Math.round(Math.min(255, Math.max(0, out[i + 1] + (F.g - out[i + 1]) * w)));
    out[i + 2] = Math.round(Math.min(255, Math.max(0, out[i + 2] + (F.b - out[i + 2]) * w)));
  }
}

/** Ignore very dark/fringe pixels when estimating glyph color (median RGB). */
const FG_SAMPLE_MIN = 52;

function medianOf3(a, b, c) {
  return [a, b, c].sort((x, y) => x - y)[1];
}

/**
 * Robust brown-ish foreground from glyph interior (for black-backed wordmarks).
 */
function estimateForegroundRGB(data, width, height) {
  const rs = [];
  const gs = [];
  const bs = [];
  const step = Math.max(1, Math.floor(Math.min(width, height) / 400));
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const mx = Math.max(r, g, b);
      if (mx >= FG_SAMPLE_MIN) {
        rs.push(r);
        gs.push(g);
        bs.push(b);
      }
    }
  }
  if (!rs.length) {
    return { r: 80, g: 55, b: 45 };
  }
  rs.sort((a, z) => a - z);
  gs.sort((a, z) => a - z);
  bs.sort((a, z) => a - z);
  const mid = Math.floor(rs.length / 2);
  return {
    r: rs[mid],
    g: gs[mid],
    b: bs[mid],
  };
}

function pickKey(data) {
  const r0 = data[0];
  const g0 = data[1];
  const b0 = data[2];
  const max0 = Math.max(r0, g0, b0);
  if (max0 < 12) {
    return { bg: BLACK_BG, inner: BLACK_KEY.inner, feather: BLACK_KEY.feather };
  }
  return {
    bg: CREAM_BG,
    inner: CREAM_KEY.inner,
    feather: CREAM_KEY.feather,
  };
}

async function main() {
  const src = resolveSource();
  if (!src) {
    console.error(
      "Source PNG missing. Copy the wordmark to public/assets/wordmark-four-et-delices-source.png",
    );
    process.exit(1);
  }

  const meta0 = await sharp(src).metadata();
  const w0 = meta0.width ?? 0;
  const h0 = meta0.height ?? 0;
  if (!w0 || !h0) throw new Error("Could not read source dimensions");

  const { data, info } = await sharp(src)
    .ensureAlpha()
    .resize(Math.round(w0 * UPSCALE), Math.round(h0 * UPSCALE), {
      kernel: sharp.kernel.lanczos3,
      fit: "fill",
    })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  if (channels !== 4) throw new Error("Expected RGBA");

  const picked = pickKey(data);
  const { bg } = picked;
  const INNER = picked.inner;
  const FEATHER = picked.feather;
  const F =
    bg === BLACK_BG ? estimateForegroundRGB(data, width, height) : null;

  const out = Buffer.alloc(data.length);

  for (let i = 0; i < data.length; i += 4) {
    const rIn = data[i];
    const gIn = data[i + 1];
    const bIn = data[i + 2];
    const origA = data[i + 3];

    let r = rIn;
    let g = gIn;
    let b = bIn;
    let keyA;

    if (bg === BLACK_BG && F) {
      const aR = F.r > 3 ? (255 * rIn) / F.r : 0;
      const aG = F.g > 3 ? (255 * gIn) / F.g : 0;
      const aB = F.b > 3 ? (255 * bIn) / F.b : 0;
      keyA = Math.min(255, Math.max(0, medianOf3(aR, aG, aB)));
      keyA = Math.round(keyA);

      if (keyA < 18) {
        keyA = 0;
        r = 0;
        g = 0;
        b = 0;
      } else {
        const inv = 255 / Math.max(keyA, 1);
        r = Math.round(Math.min(255, Math.max(0, rIn * inv)));
        g = Math.round(Math.min(255, Math.max(0, gIn * inv)));
        b = Math.round(Math.min(255, Math.max(0, bIn * inv)));
      }
    } else {
      const dr = rIn - bg.r;
      const dg = gIn - bg.g;
      const db = bIn - bg.b;
      const d = Math.sqrt(dr * dr + dg * dg + db * db);

      keyA = 255;
      if (d <= INNER) {
        keyA = 0;
      } else if (d < INNER + FEATHER) {
        const t = (d - INNER) / FEATHER;
        keyA = Math.round(255 * t * t);
      }
      r = rIn;
      g = gIn;
      b = bIn;
    }

    out[i] = r;
    out[i + 1] = g;
    out[i + 2] = b;
    out[i + 3] = Math.round((origA / 255) * keyA);
  }

  if (bg === BLACK_BG && F) {
    despillStraightAlphaTowardF(out, F);
  }

  /* Drop JPEG/compression sparkle and fringe: near-transparent pixels → fully transparent */
  const ALPHA_TRIM = 8;
  for (let i = 0; i < out.length; i += 4) {
    if (out[i + 3] < ALPHA_TRIM) {
      out[i] = 0;
      out[i + 1] = 0;
      out[i + 2] = 0;
      out[i + 3] = 0;
    }
  }

  await sharp(out, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(OUT);

  console.log(
    "Wrote",
    OUT,
    `${width}x${height}`,
    "from",
    src,
    bg === BLACK_BG ? `(black key + matte F≈rgb(${F.r},${F.g},${F.b}))` : "(cream key)",
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
