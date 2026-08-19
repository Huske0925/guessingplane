import type { RuleState } from "../types/game";
import { getQuestionSignature, parseQuestion } from "./questionParser";

export function getRecommendations(rules: RuleState, askedSignatures: string[] = []): string[] {
  const candidates: string[] = [];
  const asked = new Set(askedSignatures);

  if (!rules.direction || rules.direction === "bodyType") {
    candidates.push("是宽体机吗？");
  }
  if (!rules.direction || rules.direction === "manufacturer") {
    candidates.push("是波音飞机吗？");
  }
  if (rules.regionQuestions < 2) {
    candidates.push(
      "是欧洲航空公司吗？",
      "是中国航空公司吗？",
    );
  }
  if (rules.colorQuestions < 2) {
    candidates.push("机身有大面积蓝色吗？");
  }
  candidates.push(
    "有小翼吗？",
    "是双发飞机吗？",
    "发动机在机翼下面吗？",
    "是常规尾翼吗？",
    "是 T 型尾翼吗？",
    "是六轮主起落架吗？",
    "是双轮主起落架吗？",
    "是四发飞机吗？",
  );

  // 次选问题放在结构问题之后，避免推荐区被同一类别占满。
  if (rules.regionQuestions < 2) {
    candidates.push("是东亚航空公司吗？", "是北美航空公司吗？", "是大洋洲航空公司吗？");
  }
  if (rules.colorQuestions < 2) {
    candidates.push(
      "机身有大面积红色吗？",
      "机身有大面积黄色吗？",
      "机身有大面积黑色吗？",
      "机身有大面积白色吗？",
    );
  }

  return candidates
    .filter((question) => {
      const parsed = parseQuestion(question).parsed;
      return parsed ? !asked.has(getQuestionSignature(parsed)) : false;
    })
    .slice(0, 7);
}
