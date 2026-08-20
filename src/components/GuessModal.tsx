import { useEffect, useMemo, useRef, useState } from "react";
import { aircraftData } from "../data/aircraftData";
import type { Aircraft } from "../types/aircraft";
import { GuessOutcomeEffect, type GuessOutcome } from "./GuessOutcomeEffect";

interface GuessModalProps {
  title: string;
  description: string;
  confirmLabel: string;
  target: Aircraft;
  onConfirm: (aircraft: Aircraft) => void;
  onClose?: () => void;
}

export function GuessModal({ title, description, confirmLabel, target, onConfirm, onClose }: GuessModalProps) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<GuessOutcome | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return aircraftData;
    return aircraftData.filter((aircraft) => {
      const searchable = [
        aircraft.airline,
        ...aircraft.airlineAliases,
        aircraft.aircraftModel,
        aircraft.liveryName,
        ...(aircraft.liveryAliases ?? []),
        aircraft.registration,
      ].join(" ").toLowerCase();
      return searchable.includes(term);
    });
  }, [query]);

  const selected = aircraftData.find((aircraft) => aircraft.id === selectedId);

  function confirmGuess() {
    if (!selected || outcome) return;
    const nextOutcome = selected.id === target.id ? "correct" : "wrong";
    setOutcome(nextOutcome);
    timerRef.current = window.setTimeout(() => onConfirm(selected), 1500);
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (!outcome && event.target === event.currentTarget && onClose) onClose();
    }}>
      <section
        className={outcome ? `guess-modal outcome-active outcome-${outcome}` : "guess-modal"}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guess-title"
      >
        <div className="modal-heading">
          <div>
            <p className="eyebrow">MAKE YOUR CALL</p>
            <h2 id="guess-title">{title}</h2>
            <p>{description}</p>
          </div>
          {onClose && (
            <button className="icon-button" disabled={Boolean(outcome)} onClick={onClose} aria-label="关闭">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          )}
        </div>

        <label className={outcome === "wrong" ? "search-field guess-fields-wrong" : "search-field"}>
          <span>搜索题库</span>
          <input
            autoFocus
            value={query}
            disabled={Boolean(outcome)}
            aria-invalid={outcome === "wrong"}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="航空公司、机型、彩绘名称或注册号"
          />
        </label>

        <div className="guess-results" role="listbox" aria-label="飞机候选项">
          {results.length === 0 ? (
            <p className="no-results">没有找到匹配的飞机，请换个关键词。</p>
          ) : results.map((aircraft) => (
            <button
              key={aircraft.id}
              className={selectedId === aircraft.id ? "guess-option selected" : "guess-option"}
              disabled={Boolean(outcome)}
              onClick={() => !outcome && setSelectedId(aircraft.id)}
              role="option"
              aria-selected={selectedId === aircraft.id}
            >
              <span>{aircraft.airline} · {aircraft.aircraftModel}</span>
              <strong>{aircraft.liveryName}</strong>
              <small>{aircraft.registration}</small>
            </button>
          ))}
        </div>

        <div className="modal-actions">
          {onClose && <button className="button secondary" disabled={Boolean(outcome)} onClick={onClose}>取消</button>}
          <button
            className="button primary"
            disabled={!selected || Boolean(outcome)}
            onClick={confirmGuess}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
      {outcome && <GuessOutcomeEffect outcome={outcome} />}
    </div>
  );
}
