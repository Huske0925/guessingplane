import type { GameMode, RuleState } from "../types/game";
import { modeRules } from "../game/modeRules";

interface StatusPanelProps {
  mode: GameMode;
  questionCount: number;
  guessCount: number;
  maxScore: number;
  rules: RuleState;
}

export function StatusPanel({ mode, questionCount, guessCount, maxScore, rules }: StatusPanelProps) {
  const config = modeRules[mode];
  const directionLabel = mode === "easy"
    ? "可分别提问"
    : rules.direction === "bodyType"
      ? "已选择「宽窄体」"
      : rules.direction === "manufacturer"
        ? "已选择「制造商」"
        : "未使用";

  return (
    <section className="status-panel" aria-label="本局状态">
      <div className="stat-card">
        <span>正式问题</span>
        <strong>{questionCount} / 10</strong>
      </div>
      <div className="stat-card">
        <span>中途猜测</span>
        <strong>{guessCount} / 3</strong>
      </div>
      <div className="stat-card accent">
        <span>当前最高可得分</span>
        <strong>{maxScore}</strong>
      </div>
      <div className="rule-strip">
        <span>{mode === "easy" ? "机体特点 / 制造商" : "宽窄体 / 制造商"}：{directionLabel}</span>
        <span>{mode === "easy" ? "地区 / 国家问题" : "地区问题"}：{rules.regionQuestions} / {config.maxRegionQuestions}</span>
        <span>颜色问题：{rules.colorQuestions} / {config.maxColorQuestions}</span>
      </div>
    </section>
  );
}
