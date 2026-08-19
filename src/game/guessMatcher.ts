import { aircraftData } from "../data/aircraftData";
import type { Aircraft } from "../types/aircraft";

export type GuessResolution =
  | { status: "matched"; aircraft: Aircraft }
  | { status: "ambiguous"; candidates: Aircraft[] }
  | { status: "not-found" };

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
  "777300er": ["77w"],
  "777200": ["772"],
  "777300": ["773"],
  "777200lr": ["77l"],
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

function matchesLivery(input: string, aircraft: Aircraft): boolean {
  const inputKey = normalize(input);
  return [aircraft.liveryName, ...(aircraft.liveryAliases ?? []), aircraft.registration]
    .some((name) => normalize(name) === inputKey);
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
  if (candidates.length === 1) return { status: "matched", aircraft: candidates[0] };

  if (liveryName.trim()) {
    const liveryMatches = candidates.filter((aircraft) => matchesLivery(liveryName, aircraft));
    if (liveryMatches.length === 1) return { status: "matched", aircraft: liveryMatches[0] };
    if (liveryMatches.length === 0) return { status: "not-found" };
    return { status: "ambiguous", candidates: liveryMatches };
  }

  return { status: "ambiguous", candidates };
}
