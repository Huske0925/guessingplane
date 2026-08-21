import type { AirlineRegionQuery, TailType } from "../types/aircraft";
import type { AirlineLocation } from "../data/airlineLocations";
import type { GameMode, ParsedQuestion } from "../types/game";

export interface ParseResult {
  parsed?: ParsedQuestion;
  error?: string;
}

const regionAliases: Array<{ value: AirlineRegionQuery; aliases: string[] }> = [
  { value: "东南亚", aliases: ["东南亚"] },
  { value: "东亚", aliases: ["东亚"] },
  { value: "南亚", aliases: ["南亚"] },
  { value: "中东", aliases: ["中东", "西亚"] },
  { value: "北美", aliases: ["北美洲", "北美"] },
  { value: "南美", aliases: ["南美洲", "南美"] },
  { value: "西欧", aliases: ["西欧"] },
  { value: "东欧", aliases: ["东欧"] },
  { value: "南欧", aliases: ["南欧"] },
  { value: "北欧", aliases: ["北欧"] },
  { value: "中欧", aliases: ["中欧"] },
  { value: "大洋洲", aliases: ["大洋洲"] },
  { value: "欧洲", aliases: ["欧洲"] },
  { value: "非洲", aliases: ["非洲"] },
  { value: "南极洲", aliases: ["南极洲"] },
  { value: "亚洲", aliases: ["亚洲"] },
  { value: "美洲", aliases: ["美洲"] },
];

const airlineDescriptorPattern = /航空公司|航空|航司|公司/;

const locationAliases: Array<{ value: AirlineLocation; aliases: string[] }> = [
  { value: "台湾地区", aliases: ["中国台湾", "台湾地区", "台湾"] },
  { value: "香港地区", aliases: ["中国香港", "香港地区", "香港"] },
  { value: "澳门地区", aliases: ["中国澳门", "澳门地区", "澳门"] },
  { value: "中国大陆", aliases: ["中国大陆", "大陆", "中国"] },
  { value: "阿塞拜疆", aliases: ["阿塞拜疆"] },
  { value: "澳大利亚", aliases: ["澳大利亚", "澳洲"] },
  { value: "新西兰", aliases: ["新西兰"] },
  { value: "新加坡", aliases: ["新加坡"] },
  { value: "阿联酋", aliases: ["阿联酋"] },
  { value: "卡塔尔", aliases: ["卡塔尔"] },
  { value: "印度尼西亚", aliases: ["印度尼西亚", "印尼"] },
  { value: "马来西亚", aliases: ["马来西亚"] },
  { value: "南非", aliases: ["南非"] },
  { value: "巴西", aliases: ["巴西"] },
  { value: "印度", aliases: ["印度"] },
  { value: "泰国", aliases: ["泰国"] },
  { value: "加拿大", aliases: ["加拿大"] },
  { value: "比利时", aliases: ["比利时"] },
  { value: "冰岛", aliases: ["冰岛"] },
  { value: "芬兰", aliases: ["芬兰"] },
  { value: "荷兰", aliases: ["荷兰"] },
  { value: "德国", aliases: ["德国"] },
  { value: "法国", aliases: ["法国"] },
  { value: "英国", aliases: ["英国"] },
  { value: "美国", aliases: ["美国"] },
  { value: "日本", aliases: ["日本"] },
  { value: "韩国", aliases: ["韩国"] },
];

const colorAliases: Record<string, string[]> = {
  白色: ["白色", "白的", "白吗", "大白"],
  黑色: ["黑色", "黑的", "黑吗", "大黑"],
  蓝色: ["蓝色", "蓝的", "蓝吗", "大蓝"],
  红色: ["红色", "红的", "红吗", "大红"],
  黄色: ["黄色", "黄的", "黄吗", "大黄", "金色"],
  橙色: ["橙色", "橘色", "橙的吗", "橘的吗"],
  绿色: ["绿色", "绿的", "绿吗"],
  紫色: ["紫色", "紫的", "紫吗"],
  粉色: ["粉色", "粉红", "粉红色", "粉的吗"],
};

type SupportedEngineCount = 1 | 2 | 3 | 4 | 5 | 6;

const engineCountAliases: Record<string, SupportedEngineCount> = {
  "1": 1,
  一: 1,
  单: 1,
  "2": 2,
  二: 2,
  两: 2,
  双: 2,
  "3": 3,
  三: 3,
  "4": 4,
  四: 4,
  "5": 5,
  五: 5,
  "6": 6,
  六: 6,
};

const tailTypeAliases: Array<{ type: TailType; pattern: RegExp }> = [
  {
    type: "conventional",
    pattern: /常规尾翼|传统尾翼|普通尾翼|常规尾|低置平尾/,
  },
  {
    type: "t-tail",
    pattern: /t型尾翼?|t形尾翼?|t尾|高置平尾/,
  },
  {
    type: "cruciform",
    pattern: /十字(?:型|形)?尾翼|十字尾|十字(?:型|形)?平尾/,
  },
  {
    type: "v-tail",
    pattern: /v型尾翼?|v形尾翼?|v尾|蝴蝶尾/,
  },
  {
    type: "twin-tail",
    pattern: /双垂尾|双垂直尾翼|双尾翼|h型尾翼?|h形尾翼?|h尾/,
  },
];

// 具体机型只能在最终猜测中使用，不能伪装成制造商问题进入提问记录。
// 覆盖常见的波音、空客型号及游戏最终猜测支持的常用简称。
const aircraftModelPattern = /(?:(?:波音|boeing|b)?(?:707|717|727|737|747|757|767|777|787)(?:-?\d{1,3})?(?:er|lr|f|x)?|(?:空客|空中客车|airbus)?a(?:220|300|310|318|319|320|321|330|340|350|380)(?:-?\d{1,3})?(?:neo|ceo|xl|xwb)?|77w|77l|772|773|788|789|c919|c909|arj21|md-?11|dc-?10|l-?1011)/i;
const manufacturerFollowedByNumberPattern = /(?:(?:波音|boeing)(?:b)?-?\d+|(?:空客|空中客车|airbus)(?:a)?-?\d+)/i;

function normalize(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[？?！!，,。.　\s]/g, "");
}

function stripLeadingQuestionHelpers(text: string): string {
  // 开头辅助词不参与语义判断。所有问题类别共用这一步归一化。
  return text.replace(
    /^(?:请问)?(?:(?:这架飞机|这架|该飞机|它|这)(?:是否是|是不是|是否有|有没有|是|有)?|(?:是否是|是不是|是否有|有没有|是|有))/,
    "",
  );
}

function isNegated(text: string): boolean {
  // “是不是 / 有没有”是中性的是非问法，不能误判为否定。
  const withoutNeutralPhrases = text.replace(/是不是|有没有|是否/g, "");
  return /不是|没有|无/.test(withoutNeutralPhrases);
}

function parseEngineCount(text: string): SupportedEngineCount | undefined {
  const patterns = [
    /([一二三四五六两单双1-6])发/,
    /([一二三四五六两单双1-6])个?(?:发动机|引擎)/,
    /(?:发动机|引擎)(?:数量|个数)?(?:是|有)?([一二三四五六两单双1-6])个?/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return engineCountAliases[match[1]];
  }
  return undefined;
}

export function parseQuestion(input: string, mode: GameMode = "hard"): ParseResult {
  const normalizedText = normalize(input);
  if (!normalizedText) return { error: "请输入一个问题。" };

  const negated = isNegated(normalizedText);
  const text = stripLeadingQuestionHelpers(normalizedText);

  if (manufacturerFollowedByNumberPattern.test(text) || aircraftModelPattern.test(text)) {
    return {
      error: "具体机型属于禁止提问内容，请只询问制造商，例如“是波音吗？”。",
    };
  }

  if (/彩绘机|彩绘飞机|特殊涂装/.test(text)) {
    return { parsed: { kind: "specialLivery", value: true, negated } };
  }

  const location = locationAliases.find(({ aliases }) => aliases.some((alias) => text.includes(alias)));
  const isBareLocationQuestion = location?.aliases.some((alias) => (
    text === alias || text === `${alias}吗` || text === `${alias}地区` || text === `${alias}地区吗`
  ));
  if (location && (airlineDescriptorPattern.test(text) || /来自|属于|的吗|地区/.test(text) || isBareLocationQuestion)) {
    if (mode === "easy") {
      return { parsed: { kind: "country", value: location.value, negated } };
    }
    if (location.value === "中国大陆") {
      return { parsed: { kind: "china", value: true, negated } };
    }
    return { parsed: { kind: "unsupportedCountry", value: location.value, negated } };
  }

  const region = regionAliases.find(({ aliases }) => aliases.some((alias) => text.includes(alias)));
  const isBareRegionQuestion = region?.aliases.some((alias) => (
    text === alias || text === `${alias}吗` || text === `${alias}地区` || text === `${alias}地区吗`
  ));
  if (region && (airlineDescriptorPattern.test(text) || /来自|属于|地区/.test(text) || isBareRegionQuestion)) {
    return { parsed: { kind: "region", value: region.value, negated } };
  }

  if (/波音|boeing/.test(text)) {
    return { parsed: { kind: "manufacturer", value: "Boeing", negated } };
  }
  if (/空客|空中客车|airbus/.test(text)) {
    return { parsed: { kind: "manufacturer", value: "Airbus", negated } };
  }
  if (/宽体/.test(text)) {
    return { parsed: { kind: "bodyType", value: "widebody", negated } };
  }
  if (/窄体|单通道/.test(text)) {
    return { parsed: { kind: "bodyType", value: "narrowbody", negated } };
  }

  // 颜色表达不强制要求“机身 / 大面积 / 涂装”等限定词。
  // “有蓝色吗”“机身有大面积蓝色吗”等都会归一为同一个颜色问题。
  for (const [color, aliases] of Object.entries(colorAliases)) {
    if (aliases.some((alias) => text.includes(alias))) {
      return { parsed: { kind: "color", value: color, negated } };
    }
  }

  const engineCount = parseEngineCount(text);
  if (engineCount) {
    return { parsed: { kind: "engineCount", value: engineCount, negated } };
  }
  if (/小翼|翼梢|翼尖|winglet/.test(text)) {
    return { parsed: { kind: "winglet", value: true, negated } };
  }
  if (/上层客舱|双层客舱|两层客舱|上层甲板/.test(text)) {
    return { parsed: { kind: "upperDeck", value: true, negated } };
  }
  const tailType = tailTypeAliases.find(({ pattern }) => pattern.test(text))?.type;
  if (tailType) {
    return { parsed: { kind: "tailType", value: tailType, negated } };
  }
  if (/发动机.*机翼下|机翼下.*发动机|翼下吊挂|翼吊/.test(text)) {
    return { parsed: { kind: "enginesUnderWing", value: true, negated } };
  }
  if (/双轮主起落架|两轮主起落架|2轮主起落架|双轮起落架|两轮起落架|2轮起落架|起落架.*(?:两轮|双轮|双论|双伦|2轮|2伦)|^(?:是)?(?:双轮|两轮|双论|双伦|2轮|2伦)(?:的)?(?:吗)?$/.test(text)) {
    return { parsed: { kind: "structureTag", value: "双轮主起落架", negated } };
  }
  if (/单轮主起落架|一轮主起落架|1轮主起落架|一个轮主起落架|单轮起落架|一轮起落架|1轮起落架|一个轮起落架|起落架.*(?:单轮|单论|单伦|一轮|1轮|1伦|一个轮)|^(?:是)?(?:单轮|单论|单伦|一轮|1轮|1伦|一个轮)(?:的)?(?:吗)?$/.test(text)) {
    return { parsed: { kind: "structureTag", value: "单轮主起落架", negated } };
  }
  if (/三轮主起落架|3轮主起落架|三个轮主起落架|三轮起落架|3轮起落架|三个轮起落架|起落架.*(?:三轮|三论|三伦|3轮|3伦|三个轮)|^(?:是)?(?:三轮|三论|三伦|3轮|3伦|三个轮)(?:的)?(?:吗)?$/.test(text)) {
    return { parsed: { kind: "structureTag", value: "三轮主起落架", negated } };
  }

  return { error: "换一种问法吧" };
}

// 用解析后的含义判断重复，因此不同说法也会被识别为同一个问题。
// 否定表达不改变问题所询问的属性，例如“有小翼吗”和“没有小翼吗”属于重复。
export function getQuestionSignature(question: ParsedQuestion): string {
  return `${question.kind}:${String(question.value)}`;
}
