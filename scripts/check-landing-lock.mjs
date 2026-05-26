import fs from "node:fs";

const requiredFiles = [
  "src/pages/Landing.jsx",
  "src/index.css",
  "docs/LANDING_PAGE_LOCK_v1.md"
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing locked landing file: ${file}`);
  }
}

const landing = fs.readFileSync("src/pages/Landing.jsx", "utf8");
const css = fs.readFileSync("src/index.css", "utf8");

const requiredLandingText = [
  "PUBLIC TOOL SURFACE",
  "Strength tools for controlled operations.",
  "OPEN TOOLS",
  "KOLOSSEUM TOOLS",
  "Public utility surface",
  "TOOL BAY",
  "Open a focused utility.",
  "Event Block Calculator",
  "IronClock",
  "Gym Share",
  "Session Log",
  "Meet Planner",
  "Load Sheet"
];

for (const text of requiredLandingText) {
  if (!landing.includes(text)) {
    throw new Error(`Landing page lock failed. Missing text: ${text}`);
  }
}

const requiredCssText = [
  "--lime: #99cf1b",
  ".columns-bg",
  ".hero-vignette",
  ".lime-panel",
  ".tool-card"
];

for (const text of requiredCssText) {
  if (!css.includes(text)) {
    throw new Error(`Landing CSS lock failed. Missing CSS marker: ${text}`);
  }
}

console.log("Landing page lock check passed.");
