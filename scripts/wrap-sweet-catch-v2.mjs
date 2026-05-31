import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const src = process.argv[2] ?? path.join(process.env.USERPROFILE ?? "", "Downloads", "sweet_catch_v2.html");
const out = process.argv[3] ?? path.join(root, "public", "sweet-catch-v2.html");

let inner = fs.readFileSync(src, "utf8");
inner = inner.replace(
  /href="https:\/\/poezabride\.com"\s+target="_blank"/g,
  'href="/inquiry" target="_top"',
);
const doc = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Sweet Catch</title>
<style>
html,body{height:100%;margin:0;overflow:hidden;background:#FDF8F3;}
</style>
</head>
<body>
${inner.trim()}
</body>
</html>
`;
fs.writeFileSync(out, doc, "utf8");
console.log("Wrote", out);
