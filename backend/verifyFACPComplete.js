const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "data", "FACP_OFFICIAL_CATALOGUE.json");
const manifestFile = path.join(__dirname, "data", "FACP_CATALOGUE_MANIFEST.json");
const catalogue = JSON.parse(fs.readFileSync(file, "utf8"));
const manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));

const expectedLevels = [
  "Preprimary", "Primary-I", "Primary-II", "Secondary",
  "Prevocational-I", "Prevocational-II", "Care Group"
];
const expectedDomains = ["Personal", "Social", "Academic", "Occupational", "Recreational"];
const errors = [];

if (manifest.totalActivities !== 709) errors.push(`Expected 709 activities, found manifest value ${manifest.totalActivities}`);
if (catalogue.reduce((n, g) => n + g.items.length, 0) !== 709) errors.push("Catalogue does not contain exactly 709 activities.");
if (catalogue.some(g => !expectedLevels.includes(g.level))) errors.push("Catalogue contains an unexpected FACP checklist level.");
if (catalogue.some(g => !expectedDomains.includes(g.domain))) errors.push("Catalogue contains an unexpected domain.");
if (catalogue.some(g => g.level === "Vocational")) errors.push("Vocational must not be represented as a supplied FACP checklist level.");

const ids = new Set();
for (const group of catalogue) {
  for (const item of group.items) {
    if (!item.id || ids.has(item.id)) errors.push(`Missing/duplicate item id: ${item.id || "<missing>"}`);
    ids.add(item.id);
    if (!item.text || !item.page) errors.push(`Incomplete item: ${item.id}`);
  }
}

if (errors.length) {
  console.error("FACP catalogue verification FAILED");
  errors.forEach(e => console.error("-", e));
  process.exit(1);
}

console.log("FACP catalogue verification PASSED");
console.log(`Checklist activities: ${ids.size}`);
console.log("Levels:", expectedLevels.join(", "));
console.log("Vocational: GIID extension only; no supplied FACP checklist");
