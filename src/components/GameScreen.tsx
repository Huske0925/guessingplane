import { FormEvent, useEffect, useState } from "react";
import { answerQuestion } from "../game/answerEngine";
import { getQuestionSignature, parseQuestion } from "../game/questionParser";
import { getRecommendations } from "../game/recommendations";
import { applyQuestionToRules, validateQuestion } from "../game/ruleValidator";
import { currentMaxScore, scoreForGuess } from "../game/score";
import { canMakeFinalGamble, canMakeIntermediateGuess, MAX_INTERMEDIATE_GUESSES } from "../game/guessRules";
import { modeRules } from "../game/modeRules";
import type { Aircraft } from "../types/aircraft";
import type { GameMode, GameResult, QuestionRecord, RuleState } from "../types/game";
import { FinalGuessIntro } from "./FinalGuess";
import { FinalGuessModal } from "./FinalGuessModal";
import { QuestionHistory } from "./QuestionHistory";
import { ResultScreen } from "./ResultScreen";
import { StatusPanel } from "./StatusPanel";

interface GameScreenProps {
  mode: GameMode;
  target: Aircraft;
  onRestart: () => void;
  onReselectMode: () => void;
}

const initialRules: RuleState = {
  direction: null,
  regionQuestions: 0,
  colorQuestions: 0,
};

export function GameScreen({ mode, target, onRestart, onReselectMode }: GameScreenProps) {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<QuestionRecord[]>([]);
  const [rules, setRules] = useState<RuleState>(initialRules);
  const [guessCount, setGuessCount] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackKind, setFeedbackKind] = useState<"default" | "question-invalid">("default");
  const [isGuessOpen, setGuessOpen] = useState(false);
  const [isFinalPickerOpen, setFinalPickerOpen] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);

  const questionCount = history.length;
  const isFinal = questionCount >= 10 && !result;
  const recommendations = getRecommendations(rules, history.map((record) => record.signature), mode);
  const canGuess = canMakeIntermediateGuess(questionCount, guessCount);
  const canFinalGamble = canMakeFinalGamble(guessCount);
  const isDuplicateFeedback = feedback === "您已经问过这个问题了";

  useEffect(() => {
    if (!isDuplicateFeedback) return;

    const timer = window.setTimeout(() => {
      setFeedback((current) => current === "您已经问过这个问题了" ? null : current);
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [isDuplicateFeedback]);

  function submitQuestion(event: FormEvent) {
    event.preventDefault();
    setFeedback(null);
    setFeedbackKind("default");

    const parseResult = parseQuestion(question, mode);
    if (!parseResult.parsed) {
      setFeedback(parseResult.error ?? "换一种问法吧");
      setFeedbackKind("question-invalid");
      return;
    }

    const signature = getQuestionSignature(parseResult.parsed);
    if (history.some((record) => record.signature === signature)) {
      setFeedback("您已经问过这个问题了");
      return;
    }

    const validation = validateQuestion(parseResult.parsed, rules, questionCount, mode);
    if (!validation.valid) {
      setFeedback(validation.message ?? "这个问题不符合本局规则。");
      setFeedbackKind("question-invalid");
      return;
    }

    const answer = answerQuestion(target, parseResult.parsed);
    setHistory((current) => [...current, {
      id: `${Date.now()}-${current.length}`,
      question: question.trim(),
      answer,
      signature,
    }]);
    setRules((current) => applyQuestionToRules(parseResult.parsed!, current, mode));
    setQuestion("");
  }

  function finishIntermediateGuess(won: boolean) {
    const nextGuessCount = guessCount + 1;
    setGuessCount(nextGuessCount);
    setGuessOpen(false);
    if (won) {
      setResult({ won: true, score: scoreForGuess(questionCount), wasFinalGuess: false });
    } else {
      setFeedbackKind("default");
      setFeedback(null);
    }
  }

  function finishFinalGuess(won: boolean) {
    setFinalPickerOpen(false);
    setResult({ won, score: won ? 1 : 0, wasFinalGuess: true });
  }

  if (result) {
    return (
      <ResultScreen
        target={target}
        result={result}
        history={history}
        guessCount={guessCount + (result.wasFinalGuess ? 1 : 0)}
        onRestart={onRestart}
        onReselectMode={onReselectMode}
      />
    );
  }

  if (isFinal) {
    return (
      <>
        <FinalGuessIntro onChoose={() => setFinalPickerOpen(true)} />
        <div className="final-history-wrap"><QuestionHistory history={history} guessCount={guessCount} /></div>
        {isFinalPickerOpen && (
          <FinalGuessModal
            target={target}
            onResolved={finishFinalGuess}
            onClose={() => setFinalPickerOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <main className="game-layout" data-game-mode={mode}>
      <header className="game-header">
        <div>
          <p className="eyebrow">GuessingPlane</p>
          <h1>猜彩绘飞机</h1>
          <p>用十个是非问题，锁定航空公司、机型与彩绘</p>
        </div>
      </header>

      <StatusPanel
        mode={mode}
        questionCount={questionCount}
        guessCount={guessCount}
        maxScore={currentMaxScore(questionCount)}
        rules={rules}
      />

      <QuestionHistory history={history} guessCount={guessCount} />

      <section className="control-card">
        <form onSubmit={submitQuestion}>
          <label htmlFor="question-input">向塔台提问</label>
          <div className="question-row">
            <input
              id="question-input"
              className={feedbackKind === "question-invalid" ? "question-input-invalid" : undefined}
              value={question}
              aria-invalid={feedbackKind === "question-invalid"}
              onChange={(event) => {
                setQuestion(event.target.value);
                if (feedbackKind === "question-invalid") {
                  setFeedback(null);
                  setFeedbackKind("default");
                }
              }}
              placeholder="向我提一个只能回答“是 / 否”的问题……"
              autoComplete="off"
            />
            <button className="button primary" type="submit" disabled={!question.trim()}>提交问题</button>
            <button
              className="button guess-button"
              type="button"
              disabled={!canGuess && !canFinalGamble}
              onClick={() => canFinalGamble ? setFinalPickerOpen(true) : setGuessOpen(true)}
            >
              {canFinalGamble ? "最后博弈" : "我要猜飞机"}
            </button>
          </div>
        </form>

        {feedback && !isDuplicateFeedback && (
          <div
            className={feedbackKind === "question-invalid" ? "feedback question-invalid-feedback" : "feedback"}
            role="alert"
          >
            {feedback}
          </div>
        )}
        {!canGuess && questionCount === 0 && (
          <p className="helper-text">完成第 1 个正式问题后即可开始猜测。</p>
        )}
        {canFinalGamble && (
          <p className="helper-text">3 次中途猜测已经用完，可以立即进行最后博弈。</p>
        )}

        <div className="recommendations">
          <span>推荐问题</span>
          <div>
            {recommendations.map((item) => (
              <button key={item} type="button" onClick={() => setQuestion(item)}>{item}</button>
            ))}
          </div>
        </div>
      </section>

      <button className="restart-card" type="button" onClick={onRestart}>重新开始</button>
      <button className="restart-card" type="button" onClick={onReselectMode}>重新选择难度</button>

      <aside className="rules-note">
        <strong>本局提示</strong>
        {mode === "easy" ? (
          <>
            <span>宽窄体与制造商可以分别提问</span>
            <span>地区 / 国家问题最多 {modeRules[mode].maxRegionQuestions} 次，颜色问题最多 {modeRules[mode].maxColorQuestions} 次</span>
            <span>国家和地区名称均可直接询问</span>
          </>
        ) : (
          <>
            <span>宽窄体与制造商只能选择一个方向</span>
            <span>地区、颜色问题各最多 2 次</span>
            <span>普通国家不可直接询问，中国大陆除外</span>
          </>
        )}
      </aside>

      {isDuplicateFeedback && (
        <div className="duplicate-toast" role="alert">
          <strong>重复提问</strong>
          <span>您已经问过这个问题了</span>
        </div>
      )}

      {isGuessOpen && (
        <FinalGuessModal
          title="我要猜飞机"
          description={`输入航空公司、具体机型和彩绘名称。猜错只消耗机会，剩余 ${MAX_INTERMEDIATE_GUESSES - guessCount} 次。`}
          confirmLabel="确认猜测"
          target={target}
          onResolved={finishIntermediateGuess}
          onClose={() => setGuessOpen(false)}
        />
      )}

      {isFinalPickerOpen && (
        <FinalGuessModal
          target={target}
          onResolved={finishFinalGuess}
          onClose={() => setFinalPickerOpen(false)}
        />
      )}
    </main>
  );
}
