import type { Aircraft, AircraftSeed } from "../types/aircraft";

// Overall aircraft lengths from the manufacturers' airport-planning documents.
// Values retain the precision published in the metric dimension drawings.
const FUSELAGE_LENGTH_BY_MODEL: Record<string, number> = {
  "BOEING 737-800": 39.47,
  "BOEING 747-400": 70.67,
  "BOEING 747-400F": 70.67,
  "BOEING 757-200": 47.32,
  "BOEING 777-200ER": 63.73,
  "BOEING 777-300ER": 73.86,
  "BOEING 787-8": 56.72,
  "BOEING 787-9": 62.81,
  "AIRBUS A320-200": 37.57,
  "AIRBUS A321NEO": 44.51,
  "AIRBUS A330-300": 63.66,
  "AIRBUS A350-900": 66.80,
  "AIRBUS A380-800": 72.73,
};

function normalizeModel(model: string): string {
  return model.normalize("NFKC").replace(/[–—]/g, "-").replace(/\s+/g, " ").trim().toUpperCase();
}

export function getFuselageLengthForModel(model: string): number | undefined {
  return FUSELAGE_LENGTH_BY_MODEL[normalizeModel(model)];
}

export function applyAircraftDimensions(aircraft: AircraftSeed): Aircraft {
  const fuselageLengthMeters = getFuselageLengthForModel(aircraft.aircraftModel);
  if (fuselageLengthMeters === undefined) {
    throw new Error(`Missing reviewed fuselage length for ${aircraft.aircraftModel}`);
  }
  return { ...aircraft, fuselageLengthMeters };
}
