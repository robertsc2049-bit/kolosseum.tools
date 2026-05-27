import fs from "node:fs";

const required = [
  "public/manifest.webmanifest",
  "public/sw.js",
  "public/offline.html",
  "public/icons/icon-192.png",
  "public/icons/icon-512.png",
  "public/icons/maskable-512.png",
  "src/main.jsx",
  "index.html"
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing PWA file: ${file}`);
  }
}

const manifest = JSON.parse(fs.readFileSync("public/manifest.webmanifest", "utf8"));

if (manifest.start_url !== "/tools/ironclock") {
  throw new Error("PWA manifest start_url must open IronClock.");
}

if (manifest.theme_color !== "#050607") {
  throw new Error("PWA theme_color must match Kolosseum dark surface.");
}

if (!Array.isArray(manifest.icons) || manifest.icons.length < 3) {
  throw new Error("PWA manifest requires install icons.");
}

const sw = fs.readFileSync("public/sw.js", "utf8");
for (const marker of ["install", "activate", "fetch", "/tools/ironclock", "offline.html"]) {
  if (!sw.includes(marker)) {
    throw new Error(`Service worker missing marker: ${marker}`);
  }
}

const main = fs.readFileSync("src/main.jsx", "utf8");
if (!main.includes("serviceWorker") || !main.includes("import.meta.env.PROD")) {
  throw new Error("Service worker must be registered from src/main.jsx in production only.");
}

const html = fs.readFileSync("index.html", "utf8");
for (const marker of ["manifest.webmanifest", "apple-touch-icon", "mobile-web-app-capable"]) {
  if (!html.includes(marker)) {
    throw new Error(`index.html missing PWA marker: ${marker}`);
  }
}

console.log("PWA check passed.");
