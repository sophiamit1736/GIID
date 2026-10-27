require("dotenv").config();
const mongoose = require("mongoose");
const LearningModule = require("./models/LearningModule");
const { DOMAINS } = require("./config/facpConfig");
const { getModuleFACPLevels } = require("./config/moduleFACPLevels");

const categoryToDomain = {
  ADL: "Personal",
  Academic: "Academic",
  Motor: "Personal",
  Language: "Social",
  Vocational: "Occupational",
  Therapeutic: "Personal",
  "Specialized Care": "Personal",
};

function tokens(text = "") {
  return new Set(String(text).toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(x => x.length > 2));
}

function mapItems(module, domain, levels) {
  const moduleTokens = tokens([
    module.title, module.skill, module.description,
    ...(module.objectives || []), ...(module.steps || []),
  ].join(" "));
  const selected = [];

  for (const level of levels) {
    const rows = DOMAINS.find(d => d.id === domain)?.levels?.find(x => x.level === level)?.items || [];
    const ranked = rows.map(item => {
      const itemTokens = tokens(item.text);
      let score = 0;
      for (const t of moduleTokens) if (itemTokens.has(t)) score += 1;
      return { item, score };
    }).sort((a, b) => b.score - a.score);

    // Prefer semantically relevant FACP items. If none match, retain the first
    // few source items so every module remains linked to the official catalogue.
    const useful = ranked.filter(x => x.score > 0).slice(0, 4);
    const fallback = ranked.filter(x => !useful.includes(x)).slice(0, Math.max(2, 6 - useful.length));
    for (const x of [...useful, ...fallback]) {
      if (!selected.includes(x.item.id)) selected.push(x.item.id);
      if (selected.length >= 8) break;
    }
    if (selected.length >= 8) break;
  }
  return selected;
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const modules = await LearningModule.find({ status: "Active" }).lean();
  let updated = 0;
  for (const module of modules) {
    const facpLevels = getModuleFACPLevels(module.moduleId);
    if (!facpLevels.length) {
      console.warn(`Skipped: no FACP level mapping for ${module.moduleId}`);
      continue;
    }
    const facpDomain = module.facpDomain || categoryToDomain[module.category] || "Personal";
    const facpItemCodes = mapItems(module, facpDomain, facpLevels);
    await LearningModule.updateOne(
      { _id: module._id },
      { $set: { facpDomain, facpLevels, facpItemCodes } }
    );
    updated += 1;
    console.log(`Mapped: ${module.title} | ${facpLevels.join(", ")} | ${facpDomain} | ${facpItemCodes.length} FACP items`);
  }
  console.log(`\nUpdated ${updated} active learning modules with level-safe FACP mappings.`);
  await mongoose.disconnect();
}
run().catch(async e => { console.error(e); await mongoose.disconnect().catch(() => {}); process.exit(1); });
