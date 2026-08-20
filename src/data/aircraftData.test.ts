import { describe, expect, it } from "vitest";
import { aircraftData } from "./aircraftData";
import { expandedAircraftData } from "./expandedAircraftData";

const addedRegistrations = [
  "JA874A",
  "B-2727",
  "B-1792",
  "B-1356",
  "B-20EC",
  "B-226M",
  "B-20D1",
  "B-KQN",
  "4K-SW008",
];

describe("aircraftData", () => {
  it("contains the verified livery records added from the user's catalog", () => {
    const registrations = aircraftData.map((aircraft) => aircraft.registration);
    expect(registrations).toEqual(expect.arrayContaining(addedRegistrations));
  });

  it("keeps ids and registrations unique", () => {
    const ids = aircraftData.map((aircraft) => aircraft.id);
    const registrations = aircraftData.map((aircraft) => aircraft.registration);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(registrations).size).toBe(registrations.length);
  });

  it("does not attach image files while only the data catalog is being expanded", () => {
    const added = aircraftData.filter((aircraft) => addedRegistrations.includes(aircraft.registration));
    expect(added).toHaveLength(addedRegistrations.length);
    expect(added.every((aircraft) => aircraft.image === undefined)).toBe(true);
  });

  it("adds exactly 50 new data-only aircraft records", () => {
    expect(expandedAircraftData).toHaveLength(50);
    expect(expandedAircraftData.every((aircraft) => aircraft.image === undefined)).toBe(true);
    expect(expandedAircraftData.every((aircraft) => aircraft.sources.length > 0)).toBe(true);
    expect(aircraftData).toEqual(expect.arrayContaining(expandedAircraftData));
  });
});
