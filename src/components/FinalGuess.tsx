export function FinalGuessIntro({ onChoose }: { onChoose: () => void }) {
  return (
    <main className="final-layout">
      <section className="final-card">
        <div className="final-radar" aria-hidden="true"><span>✈</span></div>
        <p className="eyebrow">FINAL APPROACH</p>
        <h1>最终确认</h1>
        <p>你已经使用完 10 次提问，现在还有最后一次确认答案的机会。</p>
        <strong>猜中得 1 分，猜错则本局失败。</strong>
        <button className="button primary wide" onClick={onChoose}>选择最终答案</button>
      </section>
    </main>
  );
}
