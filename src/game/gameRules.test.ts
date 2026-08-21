import { describe, expect, it } from "vitest";
import { aircraftData } from "../data/aircraftData";
import { answerQuestion } from "./answerEngine";
import { getQuestionSignature, parseQuestion } from "./questionParser";
import { applyQuestionToRules, validateQuestion } from "./ruleValidator";
import { currentMaxScore, scoreForGuess } from "./score";
import { getRecommendations } from "./recommendations";
import { LIVERY_SIMILARITY_THRESHOLD, resolveAircraftGuess, textSimilarity } from "./guessMatcher";
import { canMakeFinalGamble, canMakeIntermediateGuess } from "./guessRules";
import { getLandingGearCategory } from "./landingGear";

const emptyRules = { direction: null, regionQuestions: 0, colorQuestions: 0 } as const;

describe("问题解析", () => {
  it.each(["是波音吗", "是不是波音", "这是波音飞机吗", "波音的吗"])(
    "识别波音表达：%s",
    (text) => expect(parseQuestion(text).parsed).toMatchObject({ kind: "manufacturer", value: "Boeing" }),
  );

  it.each([
    "是波音747吗",
    "波音787-9飞机吗",
    "是747吗",
    "是空客A350吗",
    "A321neo吗",
    "Boeing 777-300ER?",
    "是77W吗",
    "它是789吗",
    "波音123",
    "空客123",
    "空中客车1234",
    "Airbus 1234?",
  ])("禁止在提问环节询问具体机型：%s", (text) => {
    const result = parseQuestion(text);
    expect(result.parsed).toBeUndefined();
    expect(result.error).toContain("具体机型属于禁止提问内容");
  });

  it.each(["是宽体吗", "是宽体机吗", "是不是宽体"])(
    "识别宽体表达：%s",
    (text) => expect(parseQuestion(text).parsed).toMatchObject({ kind: "bodyType", value: "widebody" }),
  );

  it("识别每个大洲与航司、公司、航空公司三种说法", () => {
    const continents = [
      ["亚洲", "亚洲"],
      ["欧洲", "欧洲"],
      ["非洲", "非洲"],
      ["北美洲", "北美"],
      ["南美洲", "南美"],
      ["大洋洲", "大洋洲"],
      ["南极洲", "南极洲"],
    ] as const;

    for (const [continent, value] of continents) {
      for (const companyWord of ["航司", "公司", "航空公司"]) {
        expect(parseQuestion(`${continent}${companyWord}？`).parsed).toMatchObject({
          kind: "region",
          value,
        });
      }
    }
  });

  it.each(["亚洲航司？", "亚洲公司？", "亚洲航空公司？", "是亚洲航司吗？", "是否是亚洲公司？", "它是亚洲航空公司吗？"])(
    "识别亚洲航空公司的常见表达：%s",
    (text) => expect(parseQuestion(text).parsed).toMatchObject({ kind: "region", value: "亚洲" }),
  );

  it.each(["西欧", "西欧？", "是西欧吗？", "它是西欧地区吗？", "西欧航司？", "西欧航空公司？"])(
    "识别西欧地区的常见表达：%s",
    (text) => expect(parseQuestion(text).parsed).toMatchObject({ kind: "region", value: "西欧" }),
  );

  it("所有提问类别都共用开头辅助词识别", () => {
    const cases = [
      ["波音飞机", { kind: "manufacturer", value: "Boeing" }],
      ["宽体机", { kind: "bodyType", value: "widebody" }],
      ["亚洲航空公司", { kind: "region", value: "亚洲" }],
      ["中国航空公司", { kind: "china", value: true }],
      ["有蓝色涂装", { kind: "color", value: "蓝色" }],
      ["三发飞机", { kind: "engineCount", value: 3 }],
      ["有小翼", { kind: "winglet", value: true }],
      ["有上层客舱", { kind: "upperDeck", value: true }],
      ["T型尾翼", { kind: "tailType", value: "t-tail" }],
      ["发动机在机翼下面", { kind: "enginesUnderWing", value: true }],
      ["双轮", { kind: "structureTag", value: "双轮主起落架" }],
      ["彩绘飞机", { kind: "specialLivery", value: true }],
      ["日本航空公司", { kind: "unsupportedCountry", value: "日本" }],
    ] as const;

    for (const prefix of ["是", "是否是", "它是", "这是"]) {
      for (const [question, expected] of cases) {
        expect(parseQuestion(`${prefix}${question}吗？`).parsed).toMatchObject(expected);
      }
    }
  });

  it("无法识别时不产生问题对象", () => {
    expect(parseQuestion("它飞得快吗")).toEqual({ error: "换一种问法吧" });
  });

  it.each(["有蓝色吗？", "有没有蓝色？", "机身有大面积蓝色吗？", "彩绘主要是蓝色吗？"])(
    "把常见颜色表达识别为同一个语义：%s",
    (text) => expect(parseQuestion(text).parsed).toMatchObject({ kind: "color", value: "蓝色" }),
  );

  it("不会把‘是不是’和‘有没有’误判为否定问法", () => {
    expect(parseQuestion("是不是波音飞机？").parsed).toMatchObject({ negated: false });
    expect(parseQuestion("有没有蓝色？").parsed).toMatchObject({ negated: false });
    expect(parseQuestion("这不是波音飞机吗？").parsed).toMatchObject({ negated: true });
  });

  it("简短颜色问题与完整颜色问题会被视为重复", () => {
    const shortQuestion = parseQuestion("有蓝色吗？").parsed!;
    const fullQuestion = parseQuestion("机身有大面积蓝色吗？").parsed!;
    expect(getQuestionSignature(shortQuestion)).toBe(getQuestionSignature(fullQuestion));
  });

  it.each(["是两轮起落架吗？", "是双轮起落架吗？", "主起落架是两轮的吗？", "是两轮主起落架吗？"])(
    "识别双轮主起落架的常见表达：%s",
    (text) => expect(parseQuestion(text).parsed).toMatchObject({
      kind: "structureTag",
      value: "双轮主起落架",
    }),
  );

  it.each(["是单轮起落架吗？", "主起落架是单轮的吗？", "起落架是一个轮吗？", "单轮？", "单论？", "单伦？", "一轮？", "1轮？", "1伦？"])(
    "识别单轮主起落架的常见表达：%s",
    (text) => expect(parseQuestion(text).parsed).toMatchObject({
      kind: "structureTag",
      value: "单轮主起落架",
    }),
  );

  it.each(["是三轮起落架吗？", "主起落架是三轮的吗？", "起落架是三个轮吗？", "三轮？", "三论？", "三伦？", "3轮？", "3伦？"])(
    "识别三轮主起落架的常见表达：%s",
    (text) => expect(parseQuestion(text).parsed).toMatchObject({
      kind: "structureTag",
      value: "三轮主起落架",
    }),
  );

  it.each(["双轮？", "两轮？", "是双轮吗？", "双论？", "双伦？", "2轮？", "2伦？"])(
    "识别双轮主起落架的简短表达：%s",
    (text) => expect(parseQuestion(text).parsed).toMatchObject({
      kind: "structureTag",
      value: "双轮主起落架",
    }),
  );

  it("六轮不再作为起落架分类，777 统一按三轮理解", () => {
    expect(parseQuestion("是六轮起落架吗？").parsed).toBeUndefined();
  });

  it.each(["三发", "三发？", "是三发吗？", "三发飞机", "是三发飞机吗？", "三发飞机？"])(
    "识别三发飞机的常见表达：%s",
    (text) => expect(parseQuestion(text).parsed).toMatchObject({
      kind: "engineCount",
      value: 3,
    }),
  );

  it.each([
    ["一发飞机吗？", 1],
    ["双发吗？", 2],
    ["三发？", 3],
    ["四发飞机？", 4],
    ["五发吗？", 5],
    ["六发飞机吗？", 6],
    ["1 发吗？", 1],
    ["2 发飞机吗？", 2],
    ["3 发吗？", 3],
    ["4 发飞机吗？", 4],
    ["5 发吗？", 5],
    ["6 发飞机吗？", 6],
  ] as const)("把 1～6 发表达映射为发动机数量：%s", (text, count) => {
    expect(parseQuestion(text).parsed).toMatchObject({ kind: "engineCount", value: count });
  });

  it.each([
    ["单引擎吗？", 1],
    ["双引擎吗？", 2],
    ["三个引擎吗？", 3],
    ["有 4 个引擎吗？", 4],
    ["发动机数量是五个吗？", 5],
    ["有六个发动机吗？", 6],
  ] as const)("识别发动机和引擎数量表达：%s", (text, count) => {
    expect(parseQuestion(text).parsed).toMatchObject({ kind: "engineCount", value: count });
  });

  it("只说‘有引擎吗’时不猜测发动机数量", () => {
    expect(parseQuestion("有引擎吗？").parsed).toBeUndefined();
  });

  it.each(["有小翼吗？", "是否有翼梢？", "有翼尖", "翼尖？", "winglet？"])(
    "把小翼、翼梢和翼尖表达识别为同一个问题：%s",
    (text) => expect(parseQuestion(text).parsed).toMatchObject({ kind: "winglet", value: true }),
  );

  it("翼尖与小翼问法会被视为重复", () => {
    const wingtip = parseQuestion("翼尖？").parsed!;
    const winglet = parseQuestion("有小翼吗？").parsed!;
    expect(getQuestionSignature(wingtip)).toBe(getQuestionSignature(winglet));
  });

  it.each([
    ["是常规尾翼吗？", "conventional"],
    ["传统尾翼？", "conventional"],
    ["普通尾翼吗？", "conventional"],
    ["T 型尾翼吗？", "t-tail"],
    ["T尾？", "t-tail"],
    ["高置平尾吗？", "t-tail"],
    ["十字形尾翼吗？", "cruciform"],
    ["十字尾？", "cruciform"],
    ["V 型尾翼吗？", "v-tail"],
    ["蝴蝶尾？", "v-tail"],
    ["双垂尾吗？", "twin-tail"],
    ["H 尾？", "twin-tail"],
  ] as const)("识别常见尾翼结构：%s", (text, tailType) => {
    expect(parseQuestion(text).parsed).toMatchObject({ kind: "tailType", value: tailType });
  });

  it("同一尾翼结构的不同问法会被视为重复", () => {
    const fullQuestion = parseQuestion("是 T 型尾翼吗？").parsed!;
    const shortQuestion = parseQuestion("T尾？").parsed!;
    expect(getQuestionSignature(fullQuestion)).toBe(getQuestionSignature(shortQuestion));
  });

  it("只说‘尾翼’时不猜测具体结构", () => {
    expect(parseQuestion("尾翼？").parsed).toBeUndefined();
  });

  it("不同表达和否定表达会生成相同的重复检测标识", () => {
    const first = parseQuestion("是波音吗").parsed!;
    const synonym = parseQuestion("这是不是波音飞机").parsed!;
    const negated = parseQuestion("这不是波音飞机吗").parsed!;
    expect(getQuestionSignature(first)).toBe(getQuestionSignature(synonym));
    expect(getQuestionSignature(first)).toBe(getQuestionSignature(negated));
  });
});

describe("规则校验", () => {
  it("宽窄体和制造商只能选择一个方向", () => {
    const body = parseQuestion("是宽体机吗").parsed!;
    const manufacturer = parseQuestion("是波音吗").parsed!;
    const usedRules = applyQuestionToRules(body, { ...emptyRules });
    expect(validateQuestion(manufacturer, usedRules, 1).valid).toBe(false);
  });

  it("简单模式允许分别询问宽窄体和制造商", () => {
    const body = parseQuestion("是宽体机吗", "easy").parsed!;
    const manufacturer = parseQuestion("是波音吗", "easy").parsed!;
    const usedRules = applyQuestionToRules(body, { ...emptyRules }, "easy");

    expect(usedRules.direction).toBeNull();
    expect(validateQuestion(manufacturer, usedRules, 1, "easy").valid).toBe(true);
  });

  it("地区问题最多两次，普通国家被拒绝，中国被允许", () => {
    const china = parseQuestion("是中国航空公司吗").parsed!;
    expect(validateQuestion(china, { ...emptyRules }, 0).valid).toBe(true);
    const used = { direction: null, regionQuestions: 2, colorQuestions: 0 } as const;
    expect(validateQuestion(china, used, 2).valid).toBe(false);
    const japan = parseQuestion("是日本航空公司吗").parsed!;
    expect(validateQuestion(japan, { ...emptyRules }, 0).valid).toBe(false);
  });

  it("简单模式准确区分中国大陆与台湾地区航空公司", () => {
    const eva = aircraftData.find((item) => item.registration === "B-16722")!;
    const mainland = aircraftData.find((item) => item.airline === "中国东方航空")!;
    const taiwan = parseQuestion("它是台湾地区航空公司吗", "easy").parsed!;
    const china = parseQuestion("是中国大陆航空公司吗", "easy").parsed!;

    expect(taiwan).toMatchObject({ kind: "country", value: "台湾地区" });
    expect(china).toMatchObject({ kind: "country", value: "中国大陆" });
    expect(answerQuestion(eva, taiwan)).toBe(true);
    expect(answerQuestion(mainland, taiwan)).toBe(false);
    expect(answerQuestion(eva, china)).toBe(false);
    expect(answerQuestion(mainland, china)).toBe(true);
  });

  it.each([
    ["日本航司", "日本"],
    ["是否是澳大利亚航空公司", "澳大利亚"],
    ["它是香港地区公司吗", "香港地区"],
    ["台湾航空公司吗", "台湾地区"],
    ["是法国航司吗", "法国"],
    ["来自印度尼西亚吗", "印度尼西亚"],
  ])("简单模式识别国家或所在地：%s", (text, value) => {
    expect(parseQuestion(text, "easy").parsed).toMatchObject({ kind: "country", value });
  });

  it("困难模式仍拒绝普通国家和台湾地区问题", () => {
    const japan = parseQuestion("日本航空公司吗").parsed!;
    const taiwan = parseQuestion("台湾航空公司吗").parsed!;

    expect(japan.kind).toBe("unsupportedCountry");
    expect(taiwan).toMatchObject({ kind: "unsupportedCountry", value: "台湾地区" });
    expect(validateQuestion(japan, { ...emptyRules }, 0, "hard").valid).toBe(false);
    expect(validateQuestion(taiwan, { ...emptyRules }, 0, "hard").valid).toBe(false);
  });

  it("颜色问题最多两次", () => {
    const color = parseQuestion("有大面积蓝色吗").parsed!;
    const used = { direction: null, regionQuestions: 0, colorQuestions: 2 } as const;
    expect(validateQuestion(color, used, 2).valid).toBe(false);
  });

  it("简单模式允许三个颜色问题，第四个才被拒绝", () => {
    const color = parseQuestion("有大面积蓝色吗", "easy").parsed!;
    const twiceUsed = { direction: null, regionQuestions: 0, colorQuestions: 2 } as const;
    const threeUsed = { direction: null, regionQuestions: 0, colorQuestions: 3 } as const;

    expect(validateQuestion(color, twiceUsed, 2, "easy").valid).toBe(true);
    expect(validateQuestion(color, threeUsed, 3, "easy")).toMatchObject({
      valid: false,
      message: "本局最多只能询问 3 次机身颜色。",
    });
  });

  it("简单模式的国家问题与地区问题共用两次上限", () => {
    const japan = parseQuestion("日本航空公司吗", "easy").parsed!;
    const available = { direction: null, regionQuestions: 1, colorQuestions: 0 } as const;
    const exhausted = { direction: null, regionQuestions: 2, colorQuestions: 0 } as const;

    expect(validateQuestion(japan, available, 1, "easy").valid).toBe(true);
    expect(validateQuestion(japan, exhausted, 2, "easy").valid).toBe(false);
  });

  it("限定彩绘问题不消耗次数", () => {
    const livery = parseQuestion("这是彩绘飞机吗").parsed!;
    expect(validateQuestion(livery, { ...emptyRules }, 0).valid).toBe(false);
  });

  it("禁止询问上层客舱", () => {
    for (const text of ["有上层客舱吗？", "是双层客舱吗？", "有上层甲板吗？"]) {
      const question = parseQuestion(text).parsed!;
      expect(validateQuestion(question, { ...emptyRules }, 0)).toMatchObject({
        valid: false,
        message: "上层客舱属于禁止提问内容，请换一个机身特点问题。",
      });
    }
  });
});

describe("回答和得分", () => {
  const target = aircraftData[0];

  it("根据结构化数据回答问题", () => {
    expect(answerQuestion(target, parseQuestion("是波音飞机吗").parsed!)).toBe(true);
    expect(answerQuestion(target, parseQuestion("是窄体机吗").parsed!)).toBe(false);
    expect(answerQuestion(target, parseQuestion("是双发飞机吗").parsed!)).toBe(true);
  });

  it("按洲级别汇总航空公司地区", () => {
    const asiaAircraft = aircraftData.find((item) => item.airlineRegion === "东亚")!;
    const americaAircraft = aircraftData.find((item) => item.airlineRegion === "北美")!;

    expect(answerQuestion(asiaAircraft, parseQuestion("亚洲航司？").parsed!)).toBe(true);
    expect(answerQuestion(asiaAircraft, parseQuestion("欧洲航司？").parsed!)).toBe(false);
    expect(answerQuestion(americaAircraft, parseQuestion("美洲航空公司？").parsed!)).toBe(true);
    expect(answerQuestion(americaAircraft, parseQuestion("北美洲公司？").parsed!)).toBe(true);
    expect(answerQuestion(asiaAircraft, parseQuestion("南极洲航司？").parsed!)).toBe(false);
  });

  it("准确区分欧洲细分地区", () => {
    const klm = aircraftData.find((item) => item.airline === "荷兰皇家航空")!;
    const icelandair = aircraftData.find((item) => item.airline === "冰岛航空")!;

    expect(answerQuestion(klm, parseQuestion("西欧？").parsed!)).toBe(true);
    expect(answerQuestion(icelandair, parseQuestion("西欧？").parsed!)).toBe(false);
    expect(answerQuestion(icelandair, parseQuestion("北欧？").parsed!)).toBe(true);
    expect(answerQuestion(icelandair, parseQuestion("欧洲航司？").parsed!)).toBe(true);
  });

  it("得分公式正确", () => {
    expect(scoreForGuess(1)).toBe(10);
    expect(scoreForGuess(5)).toBe(6);
    expect(scoreForGuess(10)).toBe(1);
    expect(currentMaxScore(0)).toBe(10);
  });

  it.each([
    ["Boeing 777-300ER", "三轮主起落架"],
    ["Airbus A380-800", "三轮主起落架"],
    ["Airbus A350-1000", "三轮主起落架"],
    ["Airbus A350-900", "双轮主起落架"],
    ["Boeing 787-9", "双轮主起落架"],
    ["Boeing 767-300ER", "双轮主起落架"],
    ["Boeing 757-200", "双轮主起落架"],
    ["Boeing 737-800", "单轮主起落架"],
    ["Airbus A320-200", "单轮主起落架"],
    ["Airbus A321neo", "单轮主起落架"],
  ] as const)("按游戏约定划分起落架：%s", (model, category) => {
    expect(getLandingGearCategory(model)).toBe(category);
  });

  it("题库里的 777 会对三轮回答是、对双轮回答否", () => {
    const boeing777 = aircraftData.find((item) => item.aircraftModel.includes("777"))!;
    expect(answerQuestion(boeing777, parseQuestion("是三轮吗？").parsed!)).toBe(true);
    expect(answerQuestion(boeing777, parseQuestion("是双轮吗？").parsed!)).toBe(false);
  });
});

describe("猜测机会", () => {
  it("三次中途猜测用完后立即开放最后博弈，不要求问满十题", () => {
    expect(canMakeIntermediateGuess(4, 2)).toBe(true);
    expect(canMakeIntermediateGuess(4, 3)).toBe(false);
    expect(canMakeFinalGamble(2)).toBe(false);
    expect(canMakeFinalGamble(3)).toBe(true);
  });
});

describe("动态推荐问题", () => {
  it("八个常见问题问完后仍提供未问过的有效问题", () => {
    const askedQuestions = [
      "是宽体机吗？",
      "是欧洲航空公司吗？",
      "是中国航空公司吗？",
      "机身有大面积蓝色吗？",
      "机身有大面积红色吗？",
      "有小翼吗？",
      "是双发飞机吗？",
      "是常规尾翼吗？",
    ];
    const signatures = askedQuestions.map((text) => getQuestionSignature(parseQuestion(text).parsed!));
    const usedRules = { direction: "bodyType", regionQuestions: 2, colorQuestions: 2 } as const;
    const recommendations = getRecommendations(usedRules, signatures);

    expect(recommendations.length).toBeGreaterThanOrEqual(2);
    for (const recommendation of recommendations) {
      const signature = getQuestionSignature(parseQuestion(recommendation).parsed!);
      expect(signatures).not.toContain(signature);
    }
  });
});

describe("手动答案核验", () => {
  it("每一架飞机都必须提供彩绘名称后才能匹配", () => {
    for (const aircraft of aircraftData) {
      const resolution = resolveAircraftGuess(aircraft.airline, aircraft.aircraftModel);
      expect(resolution).toMatchObject({ status: "livery-required" });
      expect(resolveAircraftGuess(
        aircraft.airline,
        aircraft.aircraftModel,
        aircraft.liveryName,
      )).toMatchObject({ status: "matched", aircraft: { id: aircraft.id } });
    }
  });

  it.each([
    ["ANA", "787-9", "R2D2", "ana-ja873a-r2d2"],
    ["ANA", "789", "JA873A", "ana-ja873a-r2d2"],
    ["全日空航空公司", "B787-9", "R2-D2 ANA Jet", "ana-ja873a-r2d2"],
    ["KLM", "B777-300ER", "Orange Pride", "klm-phbva-orange-pride"],
    ["KLM", "77W", "橙色骄傲", "klm-phbva-orange-pride"],
    ["华航", "321neo", "皮卡丘", "china-airlines-b18101-pikachu"],
  ])("接受航空公司和机型的常见简称：%s / %s", (airline, model, livery, expectedId) => {
    expect(resolveAircraftGuess(airline, model, livery)).toMatchObject({
      status: "matched",
      aircraft: { id: expectedId },
    });
  });

  it("扩容后同航司同机型不会被系统擅自选中第一条", () => {
    expect(resolveAircraftGuess("ANA", "787-9").status).toBe("livery-required");
  });

  it.each([
    ["Boeing 787-9", "789"],
    ["Boeing 787-8", "788"],
    ["Boeing 777-300ER", "77W"],
    ["Boeing 777-200", "772"],
    ["Boeing 777-300", "773"],
    ["Boeing 777-200LR", "77L"],
  ])("识别机型简称：%s 可输入为 %s", (aircraftModel, shorthand) => {
    const sample = { ...aircraftData[0], aircraftModel };
    expect(resolveAircraftGuess(sample.airline, shorthand, sample.liveryName, [sample])).toMatchObject({
      status: "matched",
      aircraft: { id: sample.id },
    });
  });

  it("同航司同机型有多个彩绘时要求彩绘名称并支持别名", () => {
    const first = aircraftData[0];
    const second = {
      ...first,
      id: "test-second-livery",
      liveryName: "Second Test Livery",
      liveryAliases: ["第二彩绘"],
      registration: "TEST-02",
    };
    const data = [first, second];

    expect(resolveAircraftGuess("ANA", "787-9", "", data).status).toBe("livery-required");
    expect(resolveAircraftGuess("ANA", "787-9", "R2D2", data)).toMatchObject({
      status: "matched",
      aircraft: { id: first.id },
    });
    expect(resolveAircraftGuess("ANA", "787-9", "第二彩绘", data)).toMatchObject({
      status: "matched",
      aircraft: { id: second.id },
    });
  });

  it("彩绘名称相似度超过 70% 时可以匹配，低于或等于阈值时判错", () => {
    expect(textSimilarity("R2D3", "R2D2")).toBeGreaterThan(LIVERY_SIMILARITY_THRESHOLD);
    expect(resolveAircraftGuess("ANA", "787-9", "R2D3")).toMatchObject({
      status: "matched",
      aircraft: { id: "ana-ja873a-r2d2" },
    });
    expect(resolveAircraftGuess("ANA", "787-9", "完全无关的名称").status).toBe("not-found");
  });

  it("彩绘输入会忽略常见辅助词、彩绘和涂装字样", () => {
    expect(resolveAircraftGuess("吉祥", "789", "它是东方宝石彩绘吗")).toMatchObject({
      status: "matched",
      aircraft: { id: "juneyao-b20ec-oriental-ruby" },
    });
  });

  it("题库中不存在的组合判定为未找到", () => {
    expect(resolveAircraftGuess("不存在航空", "A999").status).toBe("not-found");
  });
});

describe("题库完整性", () => {
  it("每道题拥有唯一 id、注册号和来源", () => {
    expect(new Set(aircraftData.map((item) => item.id)).size).toBe(aircraftData.length);
    expect(new Set(aircraftData.map((item) => item.registration)).size).toBe(aircraftData.length);
    for (const aircraft of aircraftData) {
      expect(aircraft.sources.length).toBeGreaterThan(0);
      expect(aircraft.largeAreaColors.length).toBeGreaterThan(0);
    }
  });
});
