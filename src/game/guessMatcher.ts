import { aircraftData } from "../data/aircraftData";
import type { Aircraft } from "../types/aircraft";

export type GuessResolution =
  | { status: "matched"; aircraft: Aircraft }
  | { status: "livery-required"; candidates: Aircraft[] }
  | { status: "ambiguous"; candidates: Aircraft[] }
  | { status: "not-found" };

export const LIVERY_SIMILARITY_THRESHOLD = 0.7;

function normalize(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s\-–—_·:：'"“”‘’()（）.，,。/\\]/g, "");
}

function withoutAirlineWords(value: string): string {
  return value.replace(/航空公司|航空|航司|airlines|airline|airways/g, "");
}

function airlineKeys(value: string): string[] {
  const normalized = normalize(value);
  return [...new Set([normalized, withoutAirlineWords(normalized)].filter(Boolean))];
}

const aircraftModelAliases: Record<string, string[]> = {
  "7879": ["789"],
  "7878": ["788"],
  "78710": ["78x"],
  "777300er": ["77w"],
  "777200": ["772"],
  "777300": ["773"],
  "777200lr": ["77l"],
  "747400": ["744"],
  "747400er": ["744er"],
  "7478": ["748"],
  "7478f": ["748f"],
  "757200": ["752"],
  "767300er": ["763"],
  "737800": ["738"],
  "a380800": ["388"],
  "a3501000": ["35k"],
  "a350900": ["359"],
  "a330300": ["333"],
  "a220300": ["223"],
  "a320200": ["320"],
  "a319100": ["319"],
};

function expandModelAliases(keys: string[]): string[] {
  const expanded = new Set(keys);
  for (const [canonical, aliases] of Object.entries(aircraftModelAliases)) {
    if (expanded.has(canonical) || aliases.some((alias) => expanded.has(alias))) {
      expanded.add(canonical);
      aliases.forEach((alias) => expanded.add(alias));
    }
  }
  return [...expanded];
}

function modelKeys(value: string, manufacturer?: Aircraft["manufacturer"]): string[] {
  const normalized = normalize(value).replace(/飞机|客机|机型/g, "");
  const withoutManufacturer = normalized.replace(/boeing|波音|airbus|空中客车|空客/g, "");
  const keys = [normalized, withoutManufacturer];

  if (manufacturer === "Boeing" && withoutManufacturer) {
    keys.push(`b${withoutManufacturer}`);
    if (/^b\d/.test(withoutManufacturer)) keys.push(withoutManufacturer.slice(1));
  }
  if (manufacturer === "Airbus" && withoutManufacturer.startsWith("a")) {
    keys.push(withoutManufacturer.slice(1));
  }

  return expandModelAliases([...new Set(keys.filter(Boolean))]);
}

function hasSharedKey(left: string[], right: string[]): boolean {
  return left.some((key) => right.includes(key));
}

function matchesAirline(input: string, aircraft: Aircraft): boolean {
  const inputKeys = airlineKeys(input);
  return [aircraft.airline, ...aircraft.airlineAliases]
    .some((name) => hasSharedKey(inputKeys, airlineKeys(name)));
}

function matchesModel(input: string, aircraft: Aircraft): boolean {
  return hasSharedKey(
    modelKeys(input, aircraft.manufacturer),
    modelKeys(aircraft.aircraftModel, aircraft.manufacturer),
  );
}

function normalizeLivery(value: string): string {
  return normalize(value)
    .replace(/彩绘飞机|彩绘|涂装|飞机|客机|livery|jet/g, "")
    .replace(/^(?:它|这)?(?:是|叫做|叫|名为|名称是|名字是)/, "")
    .replace(/(?:吗|呢|吧|号)$/g, "");
}

function editDistance(left: string, right: string): number {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const substitutionCost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + substitutionCost,
      );
    }
    previous.splice(0, previous.length, ...current);
  }

  return previous[right.length];
}

export function textSimilarity(left: string, right: string): number {
  const leftKey = normalizeLivery(left);
  const rightKey = normalizeLivery(right);
  if (!leftKey || !rightKey) return 0;
  if (leftKey === rightKey) return 1;

  const shorter = leftKey.length <= rightKey.length ? leftKey : rightKey;
  const longer = leftKey.length > rightKey.length ? leftKey : rightKey;
  if (shorter.length >= 3 && longer.includes(shorter)) {
    return 0.75 + 0.25 * (shorter.length / longer.length);
  }

  return 1 - editDistance(leftKey, rightKey) / Math.max(leftKey.length, rightKey.length);
}

function liverySimilarity(input: string, aircraft: Aircraft): number {
  if (normalize(input) === normalize(aircraft.registration)) return 1;
  return Math.max(
    ...[aircraft.liveryName, ...(aircraft.liveryAliases ?? [])]
      .map((name) => textSimilarity(input, name)),
  );
}

export function resolveAircraftGuess(
  airline: string,
  aircraftModel: string,
  liveryName = "",
  data: Aircraft[] = aircraftData,
): GuessResolution {
  const candidates = data.filter((aircraft) => (
    matchesAirline(airline, aircraft) && matchesModel(aircraftModel, aircraft)
  ));

  if (candidates.length === 0) return { status: "not-found" };
  if (!liveryName.trim()) return { status: "livery-required", candidates };

  const scored = candidates
    .map((aircraft) => ({ aircraft, score: liverySimilarity(liveryName, aircraft) }))
    .filter(({ score }) => score > LIVERY_SIMILARITY_THRESHOLD)
    .sort((left, right) => right.score - left.score);

  if (scored.length === 0) return { status: "not-found" };
  if (scored.length === 1 || scored[0].score - scored[1].score > 0.02) {
    return { status: "matched", aircraft: scored[0].aircraft };
  }

  return { status: "ambiguous", candidates: scored.map(({ aircraft }) => aircraft) };
}
