import type { GameMode } from "../types/game";

interface ModeSelectionProps {
  onSelect: (mode: GameMode) => void;
}

const modes: Array<{
  id: GameMode;
  label: string;
  description: string;
}> = [
  {
    id: "easy",
    label: "简单模式",
    description: "提问更加宽松猜测更简易",
  },
  {
    id: "hard",
    label: "困难模式",
    description: "提问被限制，猜测范围更广",
  },
];

export function ModeSelection({ onSelect }: ModeSelectionProps) {
  return (
    <main className="mode-selection-layout">
      <header className="game-header mode-selection-header">
        <div>
          <p className="eyebrow">GuessingPlane</p>
          <h1>猜彩绘飞机</h1>
          <p>选择一个模式，开始今天的识别挑战</p>
        </div>
      </header>

      <section className="mode-options" aria-label="选择游戏模式">
        {modes.map((mode) => (
          <button
            key={mode.id}
            className={`mode-card mode-card-${mode.id}`}
            type="button"
            onClick={() => onSelect(mode.id)}
          >
            <span className="mode-name">{mode.label}</span>
            <span className="mode-description">{mode.description}</span>
          </button>
        ))}
      </section>

      <p className="mode-selection-hint">将鼠标移到模式上查看说明</p>
    </main>
  );
}
