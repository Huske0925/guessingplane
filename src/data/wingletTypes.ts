import type { Aircraft } from "../types/aircraft";

export const BLENDED_WINGLET = "融合式小翼";
export const ENDPLATE_WINGLET = "端板式小翼";
export const RAKED_WINGTIP = "斜削式小翼";
export const WINGTIP_FENCE = "翼尖帆";
export const FORKED_SCIMITAR_WINGLET = "叉弯刀式小翼";
export const SPLIT_SCIMITAR_WINGLET = "分裂式翼梢小翼";

const KNOWN_WINGLET_TAGS = new Set([
  "翼梢小翼",
  "鲨鳍小翼",
  "鲨鳍式小翼",
  "翼尖帆",
  "叉弯刀式小翼",
  "分裂式翼梢小翼",
  "融合式小翼",
  "端板式小翼",
  "斜削式小翼",
  "翼梢结构",
]);

export function getWingletTypeForModel(model: string): string | undefined {
  const normalized = model
    .normalize("NFKC")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, "")
    .toUpperCase();

  if (
    /A350-(900|1000)$/.test(normalized)
    || /C919$/.test(normalized)
    || /A330(?:NEO|-(800|900))$/.test(normalized)
    || /A32[01](?:-?NEO)$/.test(normalized)
    || /737-(8|800)$/.test(normalized)
  ) {
    return BLENDED_WINGLET;
  }

  if (/737MAX-?[78]$/.test(normalized)) {
    return FORKED_SCIMITAR_WINGLET;
  }

  if (/737-(7|700)$/.test(normalized)) {
    return SPLIT_SCIMITAR_WINGLET;
  }

  if (
    /A330-(200|300)$/.test(normalized)
    || /A340-(200|300|400|500|600)$/.test(normalized)
    || /747-400F?$/.test(normalized)
  ) {
    return ENDPLATE_WINGLET;
  }

  if (
    /747-8F?$/.test(normalized)
    || /787-(8|9|10)$/.test(normalized)
    || /777-(300ER|200LR)$/.test(normalized)
  ) {
    return RAKED_WINGTIP;
  }

  if (
    /A31[89](?:CEO|-(100|200))?$/.test(normalized)
    || /A32[01](?:CEO|-(100|200))?$/.test(normalized)
    || /A380(?:-800)?$/.test(normalized)
  ) {
    return WINGTIP_FENCE;
  }

  return undefined;
}

export function applyWingletClassification(aircraft: Aircraft): Aircraft {
  const wingletType = getWingletTypeForModel(aircraft.aircraftModel);
  if (!wingletType) return aircraft;

  return {
    ...aircraft,
    hasWinglet: true,
    wingletType,
    structureTags: [
      ...aircraft.structureTags.filter((tag) => !KNOWN_WINGLET_TAGS.has(tag)),
      wingletType,
    ],
  };
}
