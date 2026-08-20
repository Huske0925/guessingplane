import type { QuestionRecord } from "../types/game";

interface QuestionHistoryProps {
  history: QuestionRecord[];
  guessCount: number;
}

export function QuestionHistory({ history, guessCount }: QuestionHistoryProps) {
  return (
    <section className="history-card" aria-live="polite">
      <div className="section-heading">
        <div>
          <p className="eyebrow">FLIGHT LOG</p>
          <h2>问答记录</h2>
        </div>
        <span className="record-count">{history.length} 条</span>
      </div>

      <div className="question-progress">
        <div className="question-progress-label">
          <span>已提问数量</span>
          <strong>{history.length} / 10</strong>
        </div>
        <div
          className="question-progress-track"
          role="progressbar"
          aria-label="已提问数量"
          aria-valuemin={0}
          aria-valuemax={10}
          aria-valuenow={history.length}
        >
          {Array.from({ length: 10 }, (_, index) => (
            <span
              key={index}
              className={index < history.length ? "question-progress-segment filled" : "question-progress-segment"}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>

      <div className="question-progress guess-progress">
        <div className="question-progress-label">
          <span>已用猜测次数</span>
          <strong>{guessCount} / 3</strong>
        </div>
        <div
          className="question-progress-track"
          role="progressbar"
          aria-label="已用猜测次数"
          aria-valuemin={0}
          aria-valuemax={3}
          aria-valuenow={guessCount}
        >
          {Array.from({ length: 3 }, (_, index) => (
            <span
              key={index}
              className={index < guessCount ? "question-progress-segment filled" : "question-progress-segment"}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>

      {history.length === 0 ? (
        <div className="empty-history">
          <p>还没有提问呢，先来提问吧</p>
        </div>
      ) : (
        <ol className="history-list">
          {history.map((record, index) => (
            <li
              key={record.id}
              className={record.answer ? "history-record history-record-yes" : "history-record history-record-no"}
            >
              <span className="history-number">{index + 1}</span>
              <span className="history-question">{record.question}</span>
              <strong className={record.answer ? "answer yes" : "answer no"}>
                {record.answer ? "✓ 是" : "× 否"}
              </strong>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
