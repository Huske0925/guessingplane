import type { GameMode, ParsedQuestion, RuleState } from "../types/game";
import { modeRules } from "./modeRules";

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export function validateQuestion(
  question: ParsedQuestion,
  rules: RuleState,
  questionCount: number,
  mode: GameMode = "hard",
): ValidationResult {
  const config = modeRules[mode];
  if (questionCount >= 10) {
    return { valid: false, message: "你已经使用完 10 次正式提问。" };
  }

  if (question.kind === "specialLivery") {
    return {
      valid: false,
      message: "当前模式为彩绘飞机限定模式，因此无需询问该问题。",
    };
  }

  if (question.kind === "upperDeck") {
    return {
      valid: false,
      message: "上层客舱属于禁止提问内容，请换一个机身特点问题。",
    };
  }

  if (
    question.kind === "unsupportedCountry"
    && ["台湾地区", "香港地区", "澳门地区"].includes(String(question.value))
  ) {
    return {
      valid: false,
      message: "台湾、香港、澳门不能作为单独地区问题，请统一询问是否属于中国。",
    };
  }

  if (question.kind === "unsupportedCountry" || (question.kind === "country" && !config.allowCountryQuestions)) {
    return {
      valid: false,
      message: "地区问题最小粒度为大区，普通国家不能直接询问；中国大陆是唯一例外。",
    };
  }

  if (config.directionIsExclusive && question.kind === "manufacturer" && rules.direction === "bodyType") {
    return {
      valid: false,
      message: "本局已经选择‘宽窄体’方向，不能再询问波音/空客。",
    };
  }

  if (config.directionIsExclusive && question.kind === "bodyType" && rules.direction === "manufacturer") {
    return {
      valid: false,
      message: "本局已经选择‘制造商’方向，不能再询问宽体/窄体。",
    };
  }

  if ((question.kind === "region" || question.kind === "china" || question.kind === "country") && rules.regionQuestions >= config.maxRegionQuestions) {
    return { valid: false, message: `本局最多只能询问 ${config.maxRegionQuestions} 次航空公司地区。` };
  }

  if (question.kind === "color" && rules.colorQuestions >= config.maxColorQuestions) {
    return { valid: false, message: `本局最多只能询问 ${config.maxColorQuestions} 次机身颜色。` };
  }

  return { valid: true };
}

export function applyQuestionToRules(
  question: ParsedQuestion,
  rules: RuleState,
  mode: GameMode = "hard",
): RuleState {
  const next = { ...rules };
  if (modeRules[mode].directionIsExclusive) {
    if (question.kind === "manufacturer" && !next.direction) next.direction = "manufacturer";
    if (question.kind === "bodyType" && !next.direction) next.direction = "bodyType";
  }
  if (question.kind === "region" || question.kind === "china" || question.kind === "country") next.regionQuestions += 1;
  if (question.kind === "color") next.colorQuestions += 1;
  return next;
}
