import type { QuestionRecord } from "../types/game";

export function QuestionHistory({ history }: { history: QuestionRecord[] }) {
  return (
    <section className="history-card" aria-live="polite">
      <div className="section-heading">
        <div>
          <p className="eyebrow">FLIGHT LOG</p>
          <h2>问答记录</h2>
        </div>
        <span className="record-count">{history.length} 条</span>
      </div>

      {history.length === 0 ? (
        <div className="empty-history">
          <span className="radar-icon" aria-hidden="true">⌁</span>
          <p>还没有提问。先从飞机类型、航司地区或结构入手吧。</p>
        </div>
      ) : (
        <ol className="history-list">
          {history.map((record, index) => (
            <li key={record.id}>
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
