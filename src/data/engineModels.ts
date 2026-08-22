import type { Aircraft } from "../types/aircraft";

export const CFM56 = "CFM56";
export const RB211 = "RB211";
export const PW4000 = "PW4000";
export const PW1100G = "PW1100G";
export const GE90 = "GE90";
export const GENX = "GEnx";
export const TRENT_1000 = "Trent 1000";
export const TRENT_700 = "Trent 700";
export const TRENT_800 = "Trent 800";
export const TRENT_900 = "Trent 900";
export const LEAP_1A = "LEAP-1A";
export const LEAP_1B = "LEAP-1B";
export const TRENT_XWB = "Trent XWB";

function compactEngineText(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]/g, "");
}

export function parseEngineModelQuery(text: string): string | undefined {
  const compact = compactEngineText(text);

  if (compact.includes("trentxwb") || compact.includes("遄达xwb")) return TRENT_XWB;
  if (compact.includes("trent1000") || compact.includes("遄达1000")) return TRENT_1000;
  if (compact.includes("trent700") || compact.includes("遄达700")) return TRENT_700;
  if (compact.includes("trent800") || compact.includes("trent892") || compact.includes("遄达800")) return TRENT_800;
  if (compact.includes("trent900") || compact.includes("遄达900")) return TRENT_900;
  if (compact.includes("pw1100g") || compact.includes("pw1133g")) return PW1100G;
  if (compact.includes("pw4000")) return PW4000;
  if (compact.includes("ge90")) return GE90;
  if (compact.includes("genx")) return GENX;
  if (compact.includes("cfm56")) return CFM56;
  if (compact.includes("rb211")) return RB211;
  if (compact.includes("leap1a")) return LEAP_1A;
  if (compact.includes("leap1b")) return LEAP_1B;

  if (compact.includes("rollsroyce") || compact.includes("罗罗") || compact.includes("劳斯莱斯")) return "Rolls-Royce";
  if (compact.includes("trent") || compact.includes("遄达")) return "Trent";
  if (compact.includes("leap")) return "LEAP";
  if (compact.includes("cfm")) return "CFM";
  if (compact.includes("pw") || compact.includes("普惠")) return "PW";
  if (compact === "ge" || compact.startsWith("ge引擎") || compact.startsWith("ge发动机") || compact.startsWith("ge吗")) return "GE";

  return undefined;
}

export function engineModelMatchesQuery(engineModel: string | undefined, query: string): boolean {
  if (!engineModel) return false;
  const model = compactEngineText(engineModel);

  switch (query) {
    case "Rolls-Royce":
      return model === compactEngineText(RB211) || model.startsWith("trent");
    case "Trent":
      return model.startsWith("trent");
    case "LEAP":
      return model.startsWith("leap");
    case "CFM":
      return model.startsWith("cfm");
    case "PW":
      return model.startsWith("pw");
    case "GE":
      return model === compactEngineText(GE90) || model === compactEngineText(GENX);
    default:
      return model === compactEngineText(query);
  }
}

const REVIEWED_ENGINE_MODELS: Record<string, string> = {
  "G-BYGC": RB211,
  "4K-SW008": RB211,
  "TF-FIU": RB211,
  JA743A: PW4000,
  JA789A: GE90,
  "B-16722": GE90,
  "ZK-OKQ": GE90,
  "PH-BVA": GE90,
  "B-KQN": GE90,
  JA784A: GE90,
  JA873A: TRENT_1000,
  JA874A: TRENT_1000,
  "B-2727": GENX,
  "B-1356": GENX,
  "B-20EC": GENX,
  "B-226M": GENX,
  "B-20D1": GENX,
  JA894A: GENX,
  JA381A: TRENT_900,
  JA382A: TRENT_900,
  JA383A: TRENT_900,
  "B-1017": TRENT_700,
  "B-1499": GENX,
  "B-2006": GE90,
  "B-308M": TRENT_XWB,
  "B-18918": TRENT_XWB,
  "9M-MRD": TRENT_800,
  "9V-SWI": GE90,
  "A7-BEG": GE90,
  "D-ABPU": GENX,
  N521DN: TRENT_XWB,
  "OO-SNB": CFM56,
  "B-18101": PW1100G,
};

export function getEngineModelForAircraftModel(model: string): string | undefined {
  const normalized = model
    .normalize("NFKC")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, "")
    .toUpperCase();

  if (/737MAX-?(7|8|9|10)$/.test(normalized)) return LEAP_1B;
  if (/737-(600|700|800|900)$/.test(normalized) || /737-(7|8)$/.test(normalized)) return CFM56;
  if (/A350-(900|1000)$/.test(normalized)) return TRENT_XWB;

  return undefined;
}

export function applyEngineModelClassification(aircraft: Aircraft): Aircraft {
  const engineModel = REVIEWED_ENGINE_MODELS[aircraft.registration]
    ?? getEngineModelForAircraftModel(aircraft.aircraftModel);
  return engineModel ? { ...aircraft, engineModel } : aircraft;
}
