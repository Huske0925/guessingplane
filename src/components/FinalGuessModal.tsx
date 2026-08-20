import { FormEvent, useEffect, useRef, useState } from "react";
import { resolveAircraftGuess } from "../game/guessMatcher";
import type { Aircraft } from "../types/aircraft";
import { GuessOutcomeEffect, type GuessOutcome } from "./GuessOutcomeEffect";

interface FinalGuessModalProps {
  target: Aircraft;
  onResolved: (won: boolean) => void;
  onClose: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
}

export function FinalGuessModal({
  target,
  onResolved,
  onClose,
  title = "输入最终答案",
  description = "输入航空公司、具体机型和彩绘名称，系统将直接核验答案。",
  confirmLabel = "确认答案",
}: FinalGuessModalProps) {
  const [airline, setAirline] = useState("");
  const [aircraftModel, setAircraftModel] = useState("");
  const [liveryName, setLiveryName] = useState("");
  const [outcome, setOutcome] = useState<GuessOutcome | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  function submitGuess(event: FormEvent) {
    event.preventDefault();
    if (outcome) return;

    const resolution = resolveAircraftGuess(airline, aircraftModel, liveryName);
    const won = resolution.status === "matched" && resolution.aircraft.id === target.id;
    setOutcome(won ? "correct" : "wrong");
    timerRef.current = window.setTimeout(() => onResolved(won), 1500);
  }

  const fieldClassName = outcome === "wrong"
    ? "manual-guess-fields guess-fields-wrong"
    : "manual-guess-fields";

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className={outcome
          ? `guess-modal final-guess-modal outcome-active outcome-${outcome}`
          : "guess-modal final-guess-modal"}
        role="dialog"
        aria-modal="true"
        aria-labelledby="final-guess-title"
      >
        <div className="modal-heading final-guess-heading">
          <div>
            <p className="eyebrow">MAKE YOUR FINAL CALL</p>
            <h2 id="final-guess-title">{title}</h2>
            <p>{description}</p>
          </div>
        </div>

        <form className="manual-guess-form" onSubmit={submitGuess}>
          <div className={fieldClassName}>
            <label>
              <span>航空公司</span>
              <input
                autoFocus
                value={airline}
                disabled={Boolean(outcome)}
                aria-invalid={outcome === "wrong"}
                onChange={(event) => {
                  setAirline(event.target.value);
                }}
                placeholder="例如：全日空、ANA"
              />
            </label>
            <label>
              <span>具体机型</span>
              <input
                value={aircraftModel}
                disabled={Boolean(outcome)}
                aria-invalid={outcome === "wrong"}
                onChange={(event) => {
                  setAircraftModel(event.target.value);
                }}
                placeholder="例如：Boeing 787-9、787-9"
              />
            </label>
            <label>
              <span>彩绘名称</span>
              <input
                value={liveryName}
                disabled={Boolean(outcome)}
                aria-invalid={outcome === "wrong"}
                onChange={(event) => setLiveryName(event.target.value)}
                placeholder="可以输入中文名、英文名、常用简称或注册号"
              />
            </label>
          </div>

          <div className="modal-actions manual-guess-actions">
            <button className="button secondary" type="button" disabled={Boolean(outcome)} onClick={onClose}>取消</button>
            <button
              className="button primary"
              type="submit"
              disabled={!airline.trim() || !aircraftModel.trim() || !liveryName.trim() || Boolean(outcome)}
            >
              {confirmLabel}
            </button>
          </div>
        </form>
      </section>

      {outcome && <GuessOutcomeEffect outcome={outcome} />}
    </div>
  );
}
