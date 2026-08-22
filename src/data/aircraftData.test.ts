import { describe, expect, it } from "vitest";
import { aircraftData } from "./aircraftData";
import { expandedAircraftData } from "./expandedAircraftData";
import { getAirlineLocation } from "./airlineLocations";
import { getFuselageLengthForModel } from "./aircraftDimensions";
import {
  CFM56,
  GE90,
  GENX,
  LEAP_1B,
  PW1100G,
  PW4000,
  RB211,
  TRENT_1000,
  TRENT_700,
  TRENT_800,
  TRENT_900,
  TRENT_XWB,
  getEngineModelForAircraftModel,
} from "./engineModels";
import {
  BLENDED_WINGLET,
  ENDPLATE_WINGLET,
  FORKED_SCIMITAR_WINGLET,
  RAKED_WINGTIP,
  SPLIT_SCIMITAR_WINGLET,
  WINGTIP_FENCE,
  getWingletTypeForModel,
} from "./wingletTypes";

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

  it("keeps the sixteen approved expanded aircraft records", () => {
    expect(expandedAircraftData).toHaveLength(16);
    expect(expandedAircraftData.every((aircraft) => aircraft.image === undefined)).toBe(true);
    expect(expandedAircraftData.every((aircraft) => aircraft.sources.length > 0)).toBe(true);
    expect(aircraftData.map((aircraft) => aircraft.id)).toEqual(
      expect.arrayContaining(expandedAircraftData.map((aircraft) => aircraft.id)),
    );
  });

  it("contains exactly the 37 retained aircraft", () => {
    expect(aircraftData).toHaveLength(37);
    expect(aircraftData.map((aircraft) => aircraft.registration)).not.toContain("OO-SNA");
    expect(aircraftData.map((aircraft) => aircraft.registration)).not.toContain("9V-SKI");
  });

  it("adds both reviewed Shenzhen Airlines liveries with their complete core fields", () => {
    expect(aircraftData.find((aircraft) => aircraft.registration === "B-32F0")).toMatchObject({
      id: "shenzhen-b32f0-kunpeng",
      liveryName: "鲲鹏号",
      airline: "深圳航空",
      aircraftModel: "Airbus A350-900",
      largeAreaColors: ["白色", "蓝色", "紫色", "红色"],
      engineModel: TRENT_XWB,
      fuselageLengthMeters: 66.8,
    });
    expect(aircraftData.find((aircraft) => aircraft.registration === "B-1017")).toMatchObject({
      id: "shenzhen-b1017-shenzhen",
      liveryName: "深圳号",
      airline: "深圳航空",
      aircraftModel: "Airbus A330-300",
      largeAreaColors: ["白色", "红色", "金色", "深蓝色"],
      engineModel: TRENT_700,
      fuselageLengthMeters: 63.66,
    });
  });

  it.each([
    ["B-1499", "IHG洲游号", "海南航空", "Boeing 787-9", GENX, ["深蓝色", "白色"]],
    ["B-2006", "爱CHINA", "中国国际航空", "Boeing 777-300ER", GE90, ["白色", "红色"]],
    ["B-308M", "A350星空联盟", "中国国际航空", "Airbus A350-900", TRENT_XWB, ["白色", "黑色"]],
    ["B-18918", "A350 XWB碳纤维", "中华航空", "Airbus A350-900", TRENT_XWB, ["白色", "蓝色", "紫色", "红色", "灰色"]],
    ["9M-MRD", "Freedom of Space", "马来西亚航空", "Boeing 777-200ER", TRENT_800, ["白色", "蓝色", "红色"]],
    ["9V-SWI", "白色星空联盟", "新加坡航空", "Boeing 777-300ER", GE90, ["白色", "黑色"]],
    ["A7-BEG", "Formula 1", "卡塔尔航空", "Boeing 777-300ER", GE90, ["红色", "黑色", "白色", "灰色"]],
    ["D-ABPU", "汉莎航空100周年", "汉莎航空", "Boeing 787-9", GENX, ["深蓝色", "白色"]],
    ["N521DN", "Team USA", "达美航空", "Airbus A350-900", TRENT_XWB, ["白色", "红色", "蓝色"]],
  ])("adds reviewed livery %s with all identifying fields", (registration, liveryName, airline, aircraftModel, engineModel, colors) => {
    expect(aircraftData.find((aircraft) => aircraft.registration === registration)).toMatchObject({
      registration,
      liveryName,
      airline,
      aircraftModel,
      engineModel,
      largeAreaColors: colors,
    });
  });

  it("uses the manually reviewed color sets", () => {
    const colors = Object.fromEntries(
      aircraftData.map((aircraft) => [aircraft.registration, aircraft.largeAreaColors]),
    );

    expect(colors.JA873A).toEqual(["白色", "蓝色", "黑色"]);
    expect(colors.JA743A).toEqual(["白色", "黄色", "黑色"]);
    expect(colors.JA789A).toEqual(["白色", "橙色", "灰色"]);
    expect(colors.N36272).toEqual(["黑色", "蓝色"]);
    expect(colors["C-GWSV"]).toEqual(["蓝色", "白色"]);
    expect(colors["OO-SNB"]).toEqual(["蓝色", "橙色"]);
    expect(colors["B-20EC"]).toEqual(["红色", "金色"]);
    expect(colors["B-226M"]).toEqual(["白色", "红色", "金色"]);
    expect(colors.JA894A).toEqual(["蓝色", "黄色", "白色", "绿色"]);
    expect(colors.JA784A).toEqual(["黄色", "蓝色", "黑色", "肉色"]);
  });

  it.each([
    "Airbus A350-900",
    "Airbus A350-1000",
    "COMAC C919",
    "Airbus A330neo",
    "Airbus A330-900",
    "Airbus A320neo",
    "Airbus A321-neo",
  ])("classifies %s as a blended winglet aircraft", (model) => {
    expect(getWingletTypeForModel(model)).toBe(BLENDED_WINGLET);
  });

  it.each([
    "Boeing 737 MAX 8",
    "Boeing 737 MAX 7",
  ])("classifies %s as a forked-scimitar winglet aircraft", (model) => {
    expect(getWingletTypeForModel(model)).toBe(FORKED_SCIMITAR_WINGLET);
  });

  it.each([
    "Boeing 737-8",
    "Boeing 737-800",
  ])("treats %s as the blended-winglet 737-800 category", (model) => {
    expect(getWingletTypeForModel(model)).toBe(BLENDED_WINGLET);
  });

  it.each([
    "Boeing 737-7",
    "Boeing 737-700",
  ])("keeps %s in its existing split-scimitar category", (model) => {
    expect(getWingletTypeForModel(model)).toBe(SPLIT_SCIMITAR_WINGLET);
  });

  it("only treats an explicit MAX name as the MAX winglet category", () => {
    expect(getWingletTypeForModel("Boeing 737-8")).toBe(BLENDED_WINGLET);
    expect(getWingletTypeForModel("Boeing 737 MAX 8")).toBe(FORKED_SCIMITAR_WINGLET);
  });

  it("updates all retained 737-800 records to the blended category", () => {
    const retained737s = aircraftData.filter((aircraft) => aircraft.aircraftModel === "Boeing 737-800");
    expect(retained737s).toHaveLength(3);
    expect(retained737s.every((aircraft) => aircraft.wingletType === BLENDED_WINGLET)).toBe(true);
    expect(retained737s.every((aircraft) => aircraft.hasWinglet)).toBe(true);
  });

  it.each([
    "Airbus A330-200",
    "Airbus A330-300",
    "Airbus A340-200",
    "Airbus A340-300",
    "Airbus A340-400",
    "Airbus A340-500",
    "Airbus A340-600",
    "Boeing 747-400",
    "Boeing 747-400F",
  ])("classifies %s as an endplate winglet aircraft", (model) => {
    expect(getWingletTypeForModel(model)).toBe(ENDPLATE_WINGLET);
  });

  it("updates both retained 747-400 records to the endplate category", () => {
    const retained747s = aircraftData.filter((aircraft) => /747-400/.test(aircraft.aircraftModel));
    expect(retained747s).toHaveLength(2);
    expect(retained747s.every((aircraft) => aircraft.wingletType === ENDPLATE_WINGLET)).toBe(true);
    expect(retained747s.every((aircraft) => aircraft.structureTags.includes(ENDPLATE_WINGLET))).toBe(true);
  });

  it.each([
    "Boeing 747-8",
    "Boeing 747-8F",
    "Boeing 787-8",
    "Boeing 787-9",
    "Boeing 787-10",
    "Boeing 777-300ER",
    "Boeing 777-200LR",
  ])("classifies %s as a raked wingtip aircraft", (model) => {
    expect(getWingletTypeForModel(model)).toBe(RAKED_WINGTIP);
  });

  it("updates every retained 787 and 777-300ER record to the raked category", () => {
    const rakedAircraft = aircraftData.filter((aircraft) => /787-|777-300ER/.test(aircraft.aircraftModel));
    expect(rakedAircraft.length).toBeGreaterThan(0);
    expect(rakedAircraft.every((aircraft) => aircraft.hasWinglet)).toBe(true);
    expect(rakedAircraft.every((aircraft) => aircraft.wingletType === RAKED_WINGTIP)).toBe(true);
    expect(rakedAircraft.every((aircraft) => aircraft.structureTags.includes(RAKED_WINGTIP))).toBe(true);
  });

  it("does not classify the 777-200ER as a raked wingtip aircraft", () => {
    expect(getWingletTypeForModel("Boeing 777-200ER")).toBeUndefined();
  });

  it.each([
    "Boeing 777-200",
    "Boeing 777-300",
    "Boeing 777-200ER",
    "Boeing 767-200",
    "Boeing 767-300ER",
  ])("leaves %s unclassified until the user supplies its winglet rule", (model) => {
    expect(getWingletTypeForModel(model)).toBeUndefined();
  });

  it.each([
    "Airbus A318",
    "Airbus A318-100",
    "Airbus A319ceo",
    "Airbus A319-100",
    "Airbus A320ceo",
    "Airbus A320-200",
    "Airbus A321ceo",
    "Airbus A321-200",
    "Airbus A380",
    "Airbus A380-800",
  ])("classifies %s as a wingtip-fence aircraft", (model) => {
    expect(getWingletTypeForModel(model)).toBe(WINGTIP_FENCE);
  });

  it("keeps the neo family in the blended category", () => {
    expect(getWingletTypeForModel("Airbus A320neo")).toBe(BLENDED_WINGLET);
    expect(getWingletTypeForModel("Airbus A321neo")).toBe(BLENDED_WINGLET);
  });

  it("updates retained A320ceo and A380 records to the wingtip-fence category", () => {
    const wingtipFenceAircraft = aircraftData.filter((aircraft) => /A320-200|A380-800/.test(aircraft.aircraftModel));
    expect(wingtipFenceAircraft).toHaveLength(4);
    expect(wingtipFenceAircraft.every((aircraft) => aircraft.hasWinglet)).toBe(true);
    expect(wingtipFenceAircraft.every((aircraft) => aircraft.wingletType === WINGTIP_FENCE)).toBe(true);
    expect(wingtipFenceAircraft.every((aircraft) => aircraft.structureTags.includes(WINGTIP_FENCE))).toBe(true);
  });

  it("updates the retained A321neo record to the blended winglet category", () => {
    const a321neo = aircraftData.find((aircraft) => aircraft.registration === "B-18101")!;
    expect(a321neo.wingletType).toBe(BLENDED_WINGLET);
    expect(a321neo.structureTags).toContain(BLENDED_WINGLET);
  });

  it("keeps every retained aircraft aligned with the reviewed winglet table", () => {
    const expectedByRegistration: Record<string, string | undefined> = {
      JA873A: RAKED_WINGTIP,
      JA743A: undefined,
      JA789A: RAKED_WINGTIP,
      "B-16722": RAKED_WINGTIP,
      "B-18101": BLENDED_WINGLET,
      "ZK-OKQ": RAKED_WINGTIP,
      "G-BYGC": ENDPLATE_WINGLET,
      N36272: BLENDED_WINGLET,
      "C-GWSV": BLENDED_WINGLET,
      "PH-BVA": RAKED_WINGTIP,
      "OO-SNB": WINGTIP_FENCE,
      "TF-FIU": BLENDED_WINGLET,
      JA874A: RAKED_WINGTIP,
      "B-2727": RAKED_WINGTIP,
      "B-1792": BLENDED_WINGLET,
      "B-1356": RAKED_WINGTIP,
      "B-20EC": RAKED_WINGTIP,
      "B-226M": RAKED_WINGTIP,
      "B-20D1": RAKED_WINGTIP,
      "B-KQN": RAKED_WINGTIP,
      "4K-SW008": ENDPLATE_WINGLET,
      JA894A: RAKED_WINGTIP,
      JA784A: RAKED_WINGTIP,
      JA381A: WINGTIP_FENCE,
      JA382A: WINGTIP_FENCE,
      JA383A: WINGTIP_FENCE,
      "B-32F0": BLENDED_WINGLET,
      "B-1017": ENDPLATE_WINGLET,
      "B-1499": RAKED_WINGTIP,
      "B-2006": RAKED_WINGTIP,
      "B-308M": BLENDED_WINGLET,
      "B-18918": BLENDED_WINGLET,
      "9M-MRD": undefined,
      "9V-SWI": RAKED_WINGTIP,
      "A7-BEG": RAKED_WINGTIP,
      "D-ABPU": RAKED_WINGTIP,
      N521DN: BLENDED_WINGLET,
    };

    expect(Object.keys(expectedByRegistration)).toHaveLength(aircraftData.length);
    for (const aircraft of aircraftData) {
      expect(aircraft.wingletType, aircraft.registration).toBe(expectedByRegistration[aircraft.registration]);
    }
  });

  it("adds the official overall length to every retained aircraft", () => {
    const expectedByModel: Record<string, number> = {
      "Boeing 737-800": 39.47,
      "Boeing 747-400": 70.67,
      "Boeing 747-400F": 70.67,
      "Boeing 757-200": 47.32,
      "Boeing 777-200ER": 63.73,
      "Boeing 777-300ER": 73.86,
      "Boeing 787-8": 56.72,
      "Boeing 787-9": 62.81,
      "Airbus A320-200": 37.57,
      "Airbus A321neo": 44.51,
      "Airbus A330-300": 63.66,
      "Airbus A350-900": 66.80,
      "Airbus A380-800": 72.73,
    };

    expect(new Set(aircraftData.map((aircraft) => aircraft.aircraftModel))).toEqual(new Set(Object.keys(expectedByModel)));
    for (const aircraft of aircraftData) {
      expect(aircraft.fuselageLengthMeters, aircraft.registration).toBe(expectedByModel[aircraft.aircraftModel]);
      expect(getFuselageLengthForModel(aircraft.aircraftModel)).toBe(expectedByModel[aircraft.aircraftModel]);
    }
  });

  it.each([
    ["Boeing 737-600", CFM56],
    ["Boeing 737-700", CFM56],
    ["Boeing 737-800", CFM56],
    ["Boeing 737-900", CFM56],
    ["Boeing 737-8", CFM56],
    ["Boeing 737 MAX 7", LEAP_1B],
    ["Boeing 737 MAX 8", LEAP_1B],
    ["Airbus A350-900", TRENT_XWB],
    ["Airbus A350-1000", TRENT_XWB],
  ] as const)("maps %s to the reviewed engine family", (model, engineModel) => {
    expect(getEngineModelForAircraftModel(model)).toBe(engineModel);
  });

  it("adds CFM56 to every retained 737NG record", () => {
    const retained737NG = aircraftData.filter((aircraft) => /737-800/.test(aircraft.aircraftModel));
    expect(retained737NG).toHaveLength(3);
    expect(retained737NG.every((aircraft) => aircraft.engineModel === CFM56)).toBe(true);
  });

  it("applies all manually reviewed engine models by registration", () => {
    const engineByRegistration = Object.fromEntries(
      aircraftData.map((aircraft) => [aircraft.registration, aircraft.engineModel]),
    );

    for (const registration of ["G-BYGC", "4K-SW008", "TF-FIU"]) {
      expect(engineByRegistration[registration]).toBe(RB211);
    }
    expect(engineByRegistration.JA743A).toBe(PW4000);
    for (const registration of ["JA789A", "B-16722", "ZK-OKQ", "PH-BVA", "B-KQN", "JA784A"]) {
      expect(engineByRegistration[registration]).toBe(GE90);
    }
    for (const registration of ["B-2727", "B-1356", "B-20EC", "B-226M", "B-20D1", "JA894A"]) {
      expect(engineByRegistration[registration]).toBe(GENX);
    }
    for (const registration of ["JA873A", "JA874A"]) {
      expect(engineByRegistration[registration]).toBe(TRENT_1000);
    }
    for (const registration of ["JA381A", "JA382A", "JA383A"]) {
      expect(engineByRegistration[registration]).toBe(TRENT_900);
    }
    expect(engineByRegistration["OO-SNB"]).toBe(CFM56);
    expect(engineByRegistration["B-18101"]).toBe(PW1100G);
    expect(engineByRegistration["B-1017"]).toBe(TRENT_700);
    expect(engineByRegistration["B-32F0"]).toBe(TRENT_XWB);
    expect(engineByRegistration["B-1499"]).toBe(GENX);
    expect(engineByRegistration["B-2006"]).toBe(GE90);
    expect(engineByRegistration["B-308M"]).toBe(TRENT_XWB);
    expect(engineByRegistration["B-18918"]).toBe(TRENT_XWB);
    expect(engineByRegistration["9M-MRD"]).toBe(TRENT_800);
    expect(engineByRegistration["9V-SWI"]).toBe(GE90);
    expect(engineByRegistration["A7-BEG"]).toBe(GE90);
    expect(engineByRegistration["D-ABPU"]).toBe(GENX);
    expect(engineByRegistration.N521DN).toBe(TRENT_XWB);
  });

  it("has an engine model for every retained aircraft", () => {
    expect(aircraftData.every((aircraft) => aircraft.engineModel)).toBe(true);
  });

  it("uses the manually reviewed 757 and 777-200ER winglet states", () => {
    const boeing757 = aircraftData.find((aircraft) => aircraft.registration === "TF-FIU")!;
    const boeing777200ER = aircraftData.find((aircraft) => aircraft.registration === "JA743A")!;

    expect(boeing757.hasWinglet).toBe(true);
    expect(boeing757.wingletType).toBe(BLENDED_WINGLET);
    expect(boeing777200ER.hasWinglet).toBe(false);
    expect(boeing777200ER.wingletType).toBeUndefined();
  });

  it("has an explicit country or area mapping for every airline", () => {
    const unmappedAirlines = aircraftData
      .filter((aircraft) => getAirlineLocation(aircraft.airline) === undefined)
      .map((aircraft) => aircraft.airline);

    expect(unmappedAirlines).toEqual([]);
  });
});
