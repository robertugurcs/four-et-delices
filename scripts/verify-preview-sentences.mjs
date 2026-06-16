/**
 * Prints inquiry preview sentences for EN/FR to catch grammar and punctuation issues.
 * Run: node scripts/verify-preview-sentences.mjs
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// Compiled TS isn't available in plain node — inline the same segment logic for verification.
function buildPreviewSentence(data, copy, options) {
  const occasionWireframe = {
    Wedding: copy.wedding,
    Birthday: copy.birthday,
    "Baby shower": copy.babyShower,
    Graduation: copy.graduation,
    "Corporate event": copy.corporate,
    "Something else": copy.oneOfAKind,
  };

  const segments = [copy.creating];

  if (data.occasion) {
    if (data.occasion === "Something else") {
      const customOccasion = data.customOccasion?.trim();
      segments.push(
        customOccasion
          ? `${copy.oneOfAKindWithOccasion.replace("{occasion}", customOccasion.toLowerCase())}${copy.cake}`
          : `${occasionWireframe[data.occasion]}${copy.cake}`,
      );
    } else {
      segments.push(`${occasionWireframe[data.occasion]}${copy.cake}`);
    }
  } else {
    segments.push(copy.dreamCake);
  }

  segments.push(copy.for);

  if (data.servings) {
    const customServings = data.customServings?.trim();
    segments.push(
      data.servings === "More"
        ? customServings
          ? copy.people.replace("{count}", customServings)
          : copy.largerGroup
        : copy.people.replace("{count}", data.servings.replace("–", "-")),
    );
  } else {
    segments.push(copy.yourParty);
  }

  if (!data.flavour && !data.style) {
    segments.push(copy.defaultFlavourAndStyle);
  } else {
    segments.push(copy.with);

    if (!data.flavour) {
      segments.push(copy.chosenFlavour);
    } else if (data.flavour === "Other / Custom flavour") {
      const custom = data.customFlavour?.trim();
      segments.push(custom ? custom.toLowerCase() + copy.flavourSuffix : copy.customFlavourChoice);
    } else {
      segments.push(options.flavours[data.flavour].toLowerCase() + copy.flavourSuffix);
    }

    segments.push(copy.in);

    if (!data.style) {
      segments.push(copy.styleDefined);
    } else if (data.style === "Not sure yet") {
      segments.push(copy.styleDecided);
    } else {
      segments.push(
        copy.stylePattern.replace("{style}", options.styles[data.style].toLowerCase()),
      );
    }
  }

  return segments.join("") + ".";
}

const en = require("../src/i18n/dictionaries/en.ts").enDictionary;
const fr = require("../src/i18n/dictionaries/fr.ts").frDictionary;

const scenarios = [
  { label: "empty form", data: {} },
  { label: "wedding only", data: { occasion: "Wedding" } },
  {
    label: "wedding + guests + flavour + style",
    data: {
      occasion: "Wedding",
      servings: "25–30",
      flavour: "Strawberry",
      style: "Minimal & elegant",
    },
  },
  {
    label: "birthday + custom flavour",
    data: {
      occasion: "Birthday",
      servings: "15–18",
      flavour: "Other / Custom flavour",
      customFlavour: "Citron",
      style: "Floral & romantic",
    },
  },
  {
    label: "custom occasion (school)",
    data: {
      occasion: "Something else",
      customOccasion: "school",
      servings: "25–30",
      flavour: "Strawberry",
      style: "Minimal & elegant",
    },
  },
  {
    label: "larger group with guest count",
    data: {
      occasion: "Corporate event",
      servings: "More",
      customServings: "75",
      flavour: "Chocolate & Vanilla",
      style: "Modern & clean",
    },
  },
];

function run(locale, dict) {
  console.log(`\n=== ${locale.toUpperCase()} ===`);
  for (const { label, data } of scenarios) {
    const sentence = buildPreviewSentence(data, dict.inquiry.preview, dict.inquiry.options);
    console.log(`\n[${label}]`);
    console.log(sentence);
    if (/\s[.:;!?]|[.:;!?]\s*$/.test(sentence.replace(/\.$/, ""))) {
      console.warn("  ⚠ possible stray punctuation spacing");
    }
    if (/\b(mariage|anniversaire)\s+pour\b/.test(sentence) && !sentence.includes("gâteau")) {
      console.warn("  ⚠ occasion missing gâteau");
    }
  }
}

run("en", en);
run("fr", fr);
