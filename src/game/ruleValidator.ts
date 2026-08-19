import type { ParsedQuestion, RuleState } from "../types/game";

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export function validateQuestion(
  question: ParsedQuestion,
  rules: RuleState,
  questionCount: number,
): ValidationResult {
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

  if (question.kind === "unsupportedCountry") {
    return {
      valid: false,
      message: "地区问题最小粒度为大区，普通国家不能直接询问；中国是唯一例外。",
    };
  }

  if (question.kind === "manufacturer" && rules.direction === "bodyType") {
    return {
      valid: false,
      message: "本局已经选择‘宽窄体’方向，不能再询问波音/空客。",
    };
  }

  if (question.kind === "bodyType" && rules.direction === "manufacturer") {
    return {
      valid: false,
      message: "本局已经选择‘制造商’方向，不能再询问宽体/窄体。",
    };
  }

  if ((question.kind === "region" || question.kind === "china") && rules.regionQuestions >= 2) {
    return { valid: false, message: "本局最多只能询问 2 次航空公司地区。" };
  }

  if (question.kind === "color" && rules.colorQuestions >= 2) {
    return { valid: false, message: "本局最多只能询问 2 次机身颜色。" };
  }

  return { valid: true };
}

export function applyQuestionToRules(question: ParsedQuestion, rules: RuleState): RuleState {
  const next = { ...rules };
  if (question.kind === "manufacturer" && !next.direction) next.direction = "manufacturer";
  if (question.kind === "bodyType" && !next.direction) next.direction = "bodyType";
  if (question.kind === "region" || question.kind === "china") next.regionQuestions += 1;
  if (question.kind === "color") next.colorQuestions += 1;
  return next;
}
