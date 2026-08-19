import type { RuleState } from "../types/game";

interface StatusPanelProps {
  questionCount: number;
  guessCount: number;
  maxScore: number;
  rules: RuleState;
}

export function StatusPanel({ questionCount, guessCount, maxScore, rules }: StatusPanelProps) {
  const directionLabel = rules.direction === "bodyType"
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
        <span>宽窄体 / 制造商：{directionLabel}</span>
        <span>地区问题：{rules.regionQuestions} / 2</span>
        <span>颜色问题：{rules.colorQuestions} / 2</span>
      </div>
    </section>
  );
}
