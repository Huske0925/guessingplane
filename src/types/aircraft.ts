export type Manufacturer = "Boeing" | "Airbus";
export type BodyType = "widebody" | "narrowbody";
export type TailType =
  | "conventional"
  | "t-tail"
  | "cruciform"
  | "v-tail"
  | "twin-tail";
export type AirlineRegion =
  | "东亚"
  | "东南亚"
  | "南亚"
  | "中东"
  | "欧洲"
  | "北美"
  | "南美"
  | "非洲"
  | "大洋洲";
export type EuropeanSubregion = "西欧" | "东欧" | "南欧" | "北欧" | "中欧";
export type AirlineRegionQuery = AirlineRegion | EuropeanSubregion | "亚洲" | "美洲" | "南极洲";

export interface DataSource {
  name: string;
  url: string;
  purpose: string;
}

export interface AircraftImage {
  imageUrl?: string;
  imageSource?: string;
  imageSourceUrl?: string;
  photographer?: string;
  license?: string;
  licenseUrl?: string;
}

export interface Aircraft {
  id: string;
  liveryName: string;
  liveryAliases?: string[];
  airline: string;
  airlineAliases: string[];
  airlineRegion: AirlineRegion;
  airlineSubregion?: EuropeanSubregion;
  isChina: boolean;
  aircraftModel: string;
  registration: string;
  manufacturer: Manufacturer;
  bodyType: BodyType;
  largeAreaColors: string[];
  engineCount: 1 | 2 | 3 | 4 | 5 | 6;
  hasWinglet: boolean;
  wingletType?: string;
  hasUpperDeck: boolean;
  tailType: TailType;
  enginesUnderWing: boolean;
  landingGearTags: string[];
  structureTags: string[];
  image?: AircraftImage;
  sources: DataSource[];
}
