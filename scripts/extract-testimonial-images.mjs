import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = "c:/Users/ugura/Downloads/testimonial-section.html";
const html = fs.readFileSync(htmlPath, "utf8");

const leftMatch = html.match(
  /id="cardLeft"[\s\S]*?<img src="(data:image\/[^"]+)"/,
);
const rightMatch = html.match(
  /id="cardRight"[\s\S]*?<img src="(data:image\/[^"]+)"/,
);

if (!leftMatch || !rightMatch) {
  console.error("Could not find image data URIs");
  process.exit(1);
}

function saveDataUri(filename, uri) {
  const m = uri.match(/^data:image\/([^;]+);base64,(.+)$/s);
  if (!m) {
    console.error("Bad data URI", filename);
    process.exit(1);
  }
  const buf = Buffer.from(m[2], "base64");
  const out = path.join(__dirname, "../public/assets/testimonials", filename);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, buf);
  console.log(filename, buf.length, "bytes");
}

saveDataUri("left.png", leftMatch[1]);
saveDataUri("right.png", rightMatch[1]);
