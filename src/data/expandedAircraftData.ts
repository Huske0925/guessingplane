import type { AircraftSeed, AirlineRegion, EuropeanSubregion } from "../types/aircraft";
import { getWingletTypeForModel } from "./wingletTypes";

interface ExpandedAircraftSeed {
  id: string;
  liveryName: string;
  liveryAliases: string[];
  airline: string;
  airlineAliases: string[];
  airlineRegion: AirlineRegion;
  airlineSubregion?: EuropeanSubregion;
  isChina: boolean;
  aircraftModel: string;
  registration: string;
  largeAreaColors: string[];
  sourceName: string;
  sourceUrl: string;
}

function isNarrowbody(model: string): boolean {
  return /A220|A319|A320|A321|737|757/.test(model);
}

function hasWinglet(model: string): boolean {
  return getWingletTypeForModel(model) !== undefined
    || /A220|A319|A320|A321|A350|A380|737|747|757/.test(model);
}

function landingGearTags(model: string): string[] {
  if (/777|A380|A350-1000/.test(model)) return ["前三点式", "三轮主起落架"];
  if (/A350-900|787|767|757|A330/.test(model)) return ["前三点式", "双轮主起落架"];
  if (/737|A220|A319|A320|A321/.test(model)) return ["前三点式", "单轮主起落架"];
  if (/747/.test(model)) return ["前三点式", "四主起落架"];
  return ["前三点式"];
}

function toAircraft(seed: ExpandedAircraftSeed): AircraftSeed {
  const manufacturer = seed.aircraftModel.startsWith("Airbus") ? "Airbus" : "Boeing";
  const engineCount = /A380|747/.test(seed.aircraftModel) ? 4 : 2;
  const winglet = hasWinglet(seed.aircraftModel);
  const wingletType = getWingletTypeForModel(seed.aircraftModel)
    ?? (winglet ? "翼梢结构" : undefined);

  return {
    id: seed.id,
    liveryName: seed.liveryName,
    liveryAliases: seed.liveryAliases,
    airline: seed.airline,
    airlineAliases: seed.airlineAliases,
    airlineRegion: seed.airlineRegion,
    airlineSubregion: seed.airlineSubregion,
    isChina: seed.isChina,
    aircraftModel: seed.aircraftModel,
    registration: seed.registration,
    manufacturer,
    bodyType: isNarrowbody(seed.aircraftModel) ? "narrowbody" : "widebody",
    largeAreaColors: seed.largeAreaColors,
    engineCount,
    hasWinglet: winglet,
    wingletType,
    hasUpperDeck: /A380|747/.test(seed.aircraftModel),
    tailType: "conventional",
    enginesUnderWing: true,
    landingGearTags: landingGearTags(seed.aircraftModel),
    structureTags: [engineCount === 4 ? "四发" : "双发", "后掠翼", ...(wingletType ? [wingletType] : [])],
    sources: [{
      name: seed.sourceName,
      url: seed.sourceUrl,
      purpose: `${seed.registration}、${seed.aircraftModel} 与 ${seed.liveryName} 彩绘核验`,
    }],
  };
}

const seeds: ExpandedAircraftSeed[] = [
  {
    id: "ana-ja894a-pikachu-jet-nh",
    liveryName: "Pikachu Jet NH",
    liveryAliases: ["皮卡丘彩绘机 NH", "皮卡丘 NH", "宝可梦皮卡丘"],
    airline: "全日空",
    airlineAliases: ["ANA", "All Nippon Airways"],
    airlineRegion: "东亚",
    isChina: false,
    aircraftModel: "Boeing 787-9",
    registration: "JA894A",
    largeAreaColors: ["蓝色", "黄色", "白色", "绿色"],
    sourceName: "ANA Pokémon Air Adventures",
    sourceUrl: "https://www.ana.co.jp/en/us/the-ana-experience/pikachujet/",
  },
  {
    id: "ana-ja784a-eevee-jet-nh",
    liveryName: "Eevee Jet NH",
    liveryAliases: ["伊布彩绘机 NH", "伊布 NH", "宝可梦伊布"],
    airline: "全日空",
    airlineAliases: ["ANA", "All Nippon Airways"],
    airlineRegion: "东亚",
    isChina: false,
    aircraftModel: "Boeing 777-300ER",
    registration: "JA784A",
    largeAreaColors: ["黄色", "蓝色", "黑色", "肉色"],
    sourceName: "ANA Pokémon Air Adventures",
    sourceUrl: "https://www.ana.co.jp/en/us/the-ana-experience/pikachujet/",
  },
  {
    id: "ana-ja381a-flying-honu-lani",
    liveryName: "FLYING HONU Lani",
    liveryAliases: ["Flying Honu 蓝海龟", "拉尼", "蓝色海龟"],
    airline: "全日空",
    airlineAliases: ["ANA", "All Nippon Airways"],
    airlineRegion: "东亚",
    isChina: false,
    aircraftModel: "Airbus A380-800",
    registration: "JA381A",
    largeAreaColors: ["蓝色", "白色"],
    sourceName: "ANA FLYING HONU 官方资料",
    sourceUrl: "https://www.ana.co.jp/group/en/pr/pdf/20170306.pdf",
  },
  {
    id: "ana-ja382a-flying-honu-kai",
    liveryName: "FLYING HONU Kai",
    liveryAliases: ["Flying Honu 绿海龟", "凯", "绿色海龟"],
    airline: "全日空",
    airlineAliases: ["ANA", "All Nippon Airways"],
    airlineRegion: "东亚",
    isChina: false,
    aircraftModel: "Airbus A380-800",
    registration: "JA382A",
    largeAreaColors: ["绿色", "白色"],
    sourceName: "ANA FLYING HONU 官方资料",
    sourceUrl: "https://www.ana.co.jp/group/en/pr/pdf/20170306.pdf",
  },
  {
    id: "ana-ja383a-flying-honu-la",
    liveryName: "FLYING HONU La",
    liveryAliases: ["Flying Honu 橙海龟", "拉", "橙色海龟"],
    airline: "全日空",
    airlineAliases: ["ANA", "All Nippon Airways"],
    airlineRegion: "东亚",
    isChina: false,
    aircraftModel: "Airbus A380-800",
    registration: "JA383A",
    largeAreaColors: ["橙色", "白色"],
    sourceName: "ANA FLYING HONU 官方资料",
    sourceUrl: "https://www.ana.co.jp/group/en/pr/pdf/20170306.pdf",
  },
  {
    id: "shenzhen-b32f0-kunpeng",
    liveryName: "鲲鹏号",
    liveryAliases: [
      "鲲鹏",
      "鲲鹏号彩绘",
      "Kunpeng",
      "Kunpeng Hao",
      "Amazing Shenzhen",
      "深圳文旅彩绘",
    ],
    airline: "深圳航空",
    airlineAliases: ["深航", "Shenzhen Airlines", "Shenzhen Air"],
    airlineRegion: "东亚",
    isChina: true,
    aircraftModel: "Airbus A350-900",
    registration: "B-32F0",
    largeAreaColors: ["白色", "蓝色", "紫色", "红色"],
    sourceName: "中国交通新闻网",
    sourceUrl: "https://www.zgjtb.com/m/2026-07/01/content_526131.html",
  },
  {
    id: "shenzhen-b1017-shenzhen",
    liveryName: "深圳号",
    liveryAliases: [
      "深圳",
      "深圳号彩绘",
      "创意深圳 时尚之都",
      "创意深圳时尚之都",
      "Creative Fashion Capital",
      "Creative Shenzhen Capital of Fashion",
      "山海连城",
      "深圳城市彩绘",
    ],
    airline: "深圳航空",
    airlineAliases: ["深航", "Shenzhen Airlines", "Shenzhen Air"],
    airlineRegion: "东亚",
    isChina: true,
    aircraftModel: "Airbus A330-300",
    registration: "B-1017",
    largeAreaColors: ["白色", "红色", "金色", "深蓝色"],
    sourceName: "深圳政府在线",
    sourceUrl: "https://www.sz.gov.cn/cn/xxgk/zfxxgj/bmdt/content/post_10453592.html",
  },
  {
    id: "hainan-b1499-ihg-explorer",
    liveryName: "IHG洲游号",
    liveryAliases: [
      "洲游号",
      "IHG Explorer",
      "IHG Hotels & Resorts",
      "IHG洲际酒店集团",
      "洲际酒店集团彩绘",
      "IHG彩绘",
      "IGH彩绘",
      "IGH洲游号",
    ],
    airline: "海南航空",
    airlineAliases: ["海航", "Hainan Airlines", "Hainan Air"],
    airlineRegion: "东亚",
    isChina: true,
    aircraftModel: "Boeing 787-9",
    registration: "B-1499",
    largeAreaColors: ["深蓝色", "白色"],
    sourceName: "Flightradar24 B-1499 资料",
    sourceUrl: "https://www.flightradar24.com/data/aircraft/b-1499",
  },
  {
    id: "air-china-b2006-love-china",
    liveryName: "爱CHINA",
    liveryAliases: ["爱中国", "爱China", "Love China", "Air China Loves China", "国航爱中国"],
    airline: "中国国际航空",
    airlineAliases: ["国航", "Air China"],
    airlineRegion: "东亚",
    isChina: true,
    aircraftModel: "Boeing 777-300ER",
    registration: "B-2006",
    largeAreaColors: ["白色", "红色"],
    sourceName: "Air China Loves China 发布资料",
    sourceUrl: "https://www.prnewswire.co.uk/news-releases/air-china-loves-china-277357961.html",
  },
  {
    id: "air-china-b308m-star-alliance",
    liveryName: "A350星空联盟",
    liveryAliases: ["星空联盟", "星盟", "Star Alliance", "A350 Star Alliance", "国航星空联盟"],
    airline: "中国国际航空",
    airlineAliases: ["国航", "Air China"],
    airlineRegion: "东亚",
    isChina: true,
    aircraftModel: "Airbus A350-900",
    registration: "B-308M",
    largeAreaColors: ["白色", "黑色"],
    sourceName: "Flightradar24 B-308M 资料",
    sourceUrl: "https://www.flightradar24.com/data/aircraft/b-308m/",
  },
  {
    id: "china-airlines-b18918-carbon-fibre",
    liveryName: "A350 XWB碳纤维",
    liveryAliases: [
      "碳纤维",
      "碳纤维彩绘",
      "Carbon Fiber",
      "Carbon Fibre",
      "A350 Carbon Fiber",
      "华航碳纤维",
    ],
    airline: "中华航空",
    airlineAliases: ["华航", "China Airlines"],
    airlineRegion: "东亚",
    isChina: true,
    aircraftModel: "Airbus A350-900",
    registration: "B-18918",
    largeAreaColors: ["白色", "蓝色", "紫色", "红色", "灰色"],
    sourceName: "中华航空 A350 联名彩绘官方资料",
    sourceUrl: "https://www.china-airlines.com/sea/id/about-china-airlines/media/news/20180719.html",
  },
  {
    id: "malaysia-9mmrd-freedom-of-space",
    liveryName: "Freedom of Space",
    liveryAliases: ["自由空间", "空间自由", "Heliconia", "赫利科尼亚", "Freedom of Space彩绘"],
    airline: "马来西亚航空",
    airlineAliases: ["马航", "Malaysia Airlines", "Malaysian Airlines"],
    airlineRegion: "东南亚",
    isChina: false,
    aircraftModel: "Boeing 777-200ER",
    registration: "9M-MRD",
    largeAreaColors: ["白色", "蓝色", "红色"],
    sourceName: "JetPhotos 9M-MRD 彩绘资料",
    sourceUrl: "https://www.jetphotos.com/photo/542396",
  },
  {
    id: "singapore-9vswi-white-star-alliance",
    liveryName: "白色星空联盟",
    liveryAliases: ["白色星盟", "全白星空联盟", "White Star Alliance", "Star Alliance", "Albino Star Alliance"],
    airline: "新加坡航空",
    airlineAliases: ["新航", "Singapore Airlines", "Singapore Air"],
    airlineRegion: "东南亚",
    isChina: false,
    aircraftModel: "Boeing 777-300ER",
    registration: "9V-SWI",
    largeAreaColors: ["白色", "黑色"],
    sourceName: "JetPhotos 9V-SWI 彩绘资料",
    sourceUrl: "https://www.jetphotos.com/photo/11914975",
  },
  {
    id: "qatar-a7beg-formula-one",
    liveryName: "Formula 1",
    liveryAliases: ["F1", "F1赛车", "F1赛车彩绘", "Formula One", "Formula 1赛车", "一级方程式"],
    airline: "卡塔尔航空",
    airlineAliases: ["卡航", "Qatar Airways", "Qatar"],
    airlineRegion: "中东",
    isChina: false,
    aircraftModel: "Boeing 777-300ER",
    registration: "A7-BEG",
    largeAreaColors: ["红色", "黑色", "白色", "灰色"],
    sourceName: "卡塔尔航空 Formula 1 彩绘官方资料",
    sourceUrl: "https://www.qatarairways.com/press-releases/en-WW/258522-qatar-airways-unveils-new-formula-1-livery-with-exclusive-experience-at-spectacular-qatar-airways-qatar-grand-prix-weekend/",
  },
  {
    id: "lufthansa-dabpu-100-years",
    liveryName: "汉莎航空100周年",
    liveryAliases: ["汉莎百年", "汉莎百年彩绘", "100 Years Lufthansa", "100th Anniversary", "Super Crane", "超级仙鹤"],
    airline: "汉莎航空",
    airlineAliases: ["汉莎", "Lufthansa", "Lufthansa German Airlines"],
    airlineRegion: "欧洲",
    airlineSubregion: "中欧",
    isChina: false,
    aircraftModel: "Boeing 787-9",
    registration: "D-ABPU",
    largeAreaColors: ["深蓝色", "白色"],
    sourceName: "Lufthansa Group 100周年彩绘官方资料",
    sourceUrl: "https://newsroom.lufthansagroup.com/en/lufthansa-special-livery-to-mark-centennial-anniversary/",
  },
  {
    id: "delta-n521dn-team-usa",
    liveryName: "Team USA",
    liveryAliases: ["美国队", "美国国家队", "TEAM USA彩绘", "Team USA 2024", "巴黎奥运美国队"],
    airline: "达美航空",
    airlineAliases: ["达美", "Delta", "Delta Air Lines", "Delta Airlines"],
    airlineRegion: "北美",
    isChina: false,
    aircraftModel: "Airbus A350-900",
    registration: "N521DN",
    largeAreaColors: ["白色", "红色", "蓝色"],
    sourceName: "Flightradar24 N521DN 资料",
    sourceUrl: "https://www.flightradar24.com/data/aircraft/n521dn",
  },
];

export const expandedAircraftData: AircraftSeed[] = seeds.map(toAircraft);
