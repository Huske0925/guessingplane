export type GuessOutcome = "correct" | "wrong";

export function GuessOutcomeEffect({ outcome }: { outcome: GuessOutcome }) {
  return (
    <div className={`guess-outcome-overlay ${outcome}`} role="status" aria-live="assertive">
      <strong>{outcome === "correct" ? "猜测正确" : "猜测错误"}</strong>
    </div>
  );
}
