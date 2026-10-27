require("dotenv").config();
const mongoose = require("mongoose");
const LearningModule = require("./models/LearningModule");
const catalogue = require("./data/FACP_OFFICIAL_CATALOGUE.json");
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
  return new Set(
    String(text)
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter((x) => x.length > 2)
  );
}

// Important: FACP item mappings are semantic links, not arbitrary positions in
// the official checklist. An unrelated fallback item is worse than an empty
// mapping because it can make the recommender teach the wrong skill.
function mapItems(module, domain, levels) {
  const moduleText = [
    module.title,
    module.skill,
    module.description,
    ...(module.objectives || []),
    ...(module.steps || []),
  ].join(" ");
  const moduleTokens = tokens(moduleText);
  const selected = [];

  for (const level of levels) {
    const rows = catalogue.find((x) => x.level === level && x.domain === domain)?.items || [];
    const ranked = rows
      .map((item) => {
        const itemTokens = tokens(item.text);
        let score = 0;
        for (const token of moduleTokens) {
          if (itemTokens.has(token)) score += 1;
        }
        return { item, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);

    for (const x of ranked.slice(0, 8)) {
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
  let unmapped = 0;

  for (const module of modules) {
    const facpLevels = getModuleFACPLevels(module.moduleId);
    if (!facpLevels.length) {
      console.warn(`Skipped: no FACP functional-level mapping for ${module.moduleId}`);
      unmapped += 1;
      continue;
    }

    const facpDomain = module.facpDomain || categoryToDomain[module.category] || "Personal";
    const facpItemCodes = mapItems(module, facpDomain, facpLevels);

    if (!facpItemCodes.length) {
      console.warn(`No semantically matched FACP items: ${module.moduleId} | ${facpDomain} | ${facpLevels.join(", ")}`);
      unmapped += 1;
      continue;
    }

    await LearningModule.updateOne(
      { _id: module._id },
      { $set: { facpDomain, facpLevels, facpItemCodes } }
    );
    updated += 1;
    console.log(`Mapped: ${module.title} | ${facpLevels.join(", ")} | ${facpDomain} | ${facpItemCodes.length} items`);
  }

  console.log(`\nUpdated ${updated} modules. Unmapped ${unmapped}.`);
  console.log("No arbitrary first-in-checklist FACP items were assigned.");
  await mongoose.disconnect();
}

run().catch(async (e) => {
  console.error(e);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
