import fs from "node:fs";

const requiredFiles = [
  "src/pages/IronClock.jsx",
  "src/pages/IronClock.css",
  "src/App.jsx",
  "src/pages/Landing.jsx",
  "public/manifest.webmanifest",
  "public/sw.js",
  "docs/IRONCLOCK_LOCK_v1.md"
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing IronClock lock file: ${file}`);
  }
}

const ironclock = fs.readFileSync("src/pages/IronClock.jsx", "utf8");
const css = fs.readFileSync("src/pages/IronClock.css", "utf8");
const app = fs.readFileSync("src/App.jsx", "utf8");
const landing = fs.readFileSync("src/pages/Landing.jsx", "utf8");
const manifest = JSON.parse(fs.readFileSync("public/manifest.webmanifest", "utf8"));
const sw = fs.readFileSync("public/sw.js", "utf8");

const requiredIronClockMarkers = [
  "export default function IronClock",
  "Barbell calculator + rest timer",
  "IronClock",
  "Barbell loading",
  "Target weight",
  "Unit",
  "Collars",
  "Quick plate availability",
  "Full plate settings",
  "Closest load",
  "Per side:",
  "Rest timer",
  "Custom minutes",
  "Custom seconds",
  "Maximise timer",
  "Plate settings",
  "localStorage",
  "PLATE_SETTINGS_KEY",
  "navigator.share",
  "navigator.clipboard",
  "[20, 25].map",
  "{bar}kg bar",
  "setBarKg",
  "setCollarsKg",
  "QUICK_PLATES",
  "LARGE_PLATES",
  "CHANGE_PLATES",
  "renderBarbell",
  "fmtTime",
  "setTimer"
];

for (const marker of requiredIronClockMarkers) {
  if (!ironclock.includes(marker)) {
    throw new Error(`IronClock lock failed. Missing JSX marker: ${marker}`);
  }
}

const requiredCssMarkers = [
  ".ic-wrap",
  ".ic-page",
  ".ic-grid",
  ".ic-panel",
  ".ic-h1",
  ".ic-btn-pill",
  ".ic-result",
  ".ic-barbell",
  ".ic-plate",
  ".ic-timer-display",
  ".ic-modal",
  ".ic-overlay",
  ".ic-subbar",
  "var(--lime)"
];

for (const marker of requiredCssMarkers) {
  if (!css.includes(marker)) {
    throw new Error(`IronClock lock failed. Missing CSS marker: ${marker}`);
  }
}

const forbiddenCssMarkers = [
  "temporary base IronClock CSS",
  "temporary CSS",
  "fallback CSS"
];

for (const marker of forbiddenCssMarkers) {
  if (css.includes(marker)) {
    throw new Error(`IronClock lock failed. Forbidden CSS marker found: ${marker}`);
  }
}

if (!app.includes('import IronClock from "./pages/IronClock.jsx";')) {
  throw new Error("IronClock lock failed. App.jsx must import IronClock.");
}

if (!app.includes('path="/tools/ironclock"')) {
  throw new Error("IronClock lock failed. App.jsx must define /tools/ironclock route.");
}

if (!landing.includes('title: "IronClock"')) {
  throw new Error("IronClock lock failed. Landing page must keep IronClock card title.");
}

if (!landing.includes('href: "/tools/ironclock"')) {
  throw new Error("IronClock lock failed. Landing IronClock card must link to /tools/ironclock.");
}

if (manifest.start_url !== "/tools/ironclock") {
  throw new Error("IronClock lock failed. PWA start_url must open /tools/ironclock.");
}

if (!sw.includes("/tools/ironclock")) {
  throw new Error("IronClock lock failed. Service worker must cache /tools/ironclock.");
}

console.log("IronClock lock check passed.");
