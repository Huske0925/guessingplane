export type LandingGearCategory =
  | "单轮主起落架"
  | "双轮主起落架"
  | "三轮主起落架";

export function getLandingGearCategory(aircraftModel: string): LandingGearCategory | null {
  const model = aircraftModel.toUpperCase().replace(/[\s-]/g, "");

  if (/777|A?380|A?3501000/.test(model)) return "三轮主起落架";
  if (/A?350900|A?330|787|767|757/.test(model)) return "双轮主起落架";
  if (/737|A?220|A?319|A?320|A?321/.test(model)) return "单轮主起落架";

  return null;
}
