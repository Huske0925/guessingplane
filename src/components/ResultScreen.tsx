import type { CSSProperties } from "react";
import type { Aircraft } from "../types/aircraft";
import type { GameResult, QuestionRecord } from "../types/game";
import { AircraftImage } from "./AircraftImage";
import { QuestionHistory } from "./QuestionHistory";

interface ResultScreenProps {
  target: Aircraft;
  result: GameResult;
  history: QuestionRecord[];
  guessCount: number;
  onRestart: () => void;
}

function ScoreReel({ value }: { value: number }) {
  return (
    <span className="score-reel" aria-label={String(value)}>
      {String(value).split("").map((digit, columnIndex) => {
        const finalDigit = Number(digit);
        const sequence = [...Array.from({ length: 20 }, (_, index) => index % 10), finalDigit];
        const style = { "--reel-delay": `${columnIndex * 80}ms` } as CSSProperties;

        return (
          <span className="score-reel-window" key={`${digit}-${columnIndex}`} aria-hidden="true">
            <span className="score-reel-track" style={style}>
              {sequence.map((number, index) => <span key={index}>{number}</span>)}
            </span>
          </span>
        );
      })}
    </span>
  );
}

export function ResultScreen({ target, result, history, guessCount, onRestart }: ResultScreenProps) {
  return (
    <main className="result-layout">
      <section className={result.won ? "result-hero win" : "result-hero loss"}>
        <p className="eyebrow">{result.won ? "TOUCHDOWN" : "ANSWER REVEALED"}</p>
        <h1>{result.won ? "猜对了！" : "本局未猜中"}</h1>
        <p className="result-score">你获得了 <ScoreReel value={result.score} /> 分</p>
        {!result.won && <p>没关系，下一局会更接近答案。</p>}
      </section>

      <section className="reveal-grid">
        <AircraftImage aircraft={target} />
        <div className="answer-card">
          <p className="eyebrow">正确答案</p>
          <h2>{target.liveryName}</h2>
          <dl>
            <div><dt>航空公司</dt><dd>{target.airline}</dd></div>
            <div><dt>具体机型</dt><dd>{target.aircraftModel}</dd></div>
            <div><dt>注册号</dt><dd>{target.registration}</dd></div>
            <div><dt>本局得分</dt><dd>{result.score}</dd></div>
            <div><dt>正式问题</dt><dd>{history.length} / 10</dd></div>
            <div><dt>猜测次数</dt><dd>{guessCount}</dd></div>
          </dl>
          <button className="button primary wide" onClick={onRestart}>再来一局</button>
        </div>
      </section>

      <QuestionHistory history={history} guessCount={guessCount} />

      <details className="sources-card">
        <summary>资料来源</summary>
        <ul>
          {target.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noreferrer">{source.name}</a>
              <span>{source.purpose}</span>
            </li>
          ))}
        </ul>
      </details>
    </main>
  );
}
