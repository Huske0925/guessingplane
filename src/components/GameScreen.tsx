import { FormEvent, useEffect, useState } from "react";
import { answerQuestion } from "../game/answerEngine";
import { getQuestionSignature, parseQuestion } from "../game/questionParser";
import { getRecommendations } from "../game/recommendations";
import { applyQuestionToRules, validateQuestion } from "../game/ruleValidator";
import { currentMaxScore, scoreForGuess } from "../game/score";
import type { Aircraft } from "../types/aircraft";
import type { GameResult, QuestionRecord, RuleState } from "../types/game";
import { FinalGuessIntro } from "./FinalGuess";
import { FinalGuessModal } from "./FinalGuessModal";
import { GuessModal } from "./GuessModal";
import { QuestionHistory } from "./QuestionHistory";
import { ResultScreen } from "./ResultScreen";
import { StatusPanel } from "./StatusPanel";

interface GameScreenProps {
  target: Aircraft;
  onRestart: () => void;
}

const initialRules: RuleState = {
  direction: null,
  regionQuestions: 0,
  colorQuestions: 0,
};

export function GameScreen({ target, onRestart }: GameScreenProps) {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<QuestionRecord[]>([]);
  const [rules, setRules] = useState<RuleState>(initialRules);
  const [guessCount, setGuessCount] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isGuessOpen, setGuessOpen] = useState(false);
  const [isFinalPickerOpen, setFinalPickerOpen] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);

  const questionCount = history.length;
  const isFinal = questionCount >= 10 && !result;
  const recommendations = getRecommendations(rules, history.map((record) => record.signature));
  const canGuess = questionCount >= 1 && questionCount < 10 && guessCount < 3;
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

    const parseResult = parseQuestion(question);
    if (!parseResult.parsed) {
      setFeedback(parseResult.error ?? "这个问题我暂时无法识别，请换一种问法。");
      return;
    }

    const signature = getQuestionSignature(parseResult.parsed);
    if (history.some((record) => record.signature === signature)) {
      setFeedback("您已经问过这个问题了");
      return;
    }

    const validation = validateQuestion(parseResult.parsed, rules, questionCount);
    if (!validation.valid) {
      setFeedback(validation.message ?? "这个问题不符合本局规则。");
      return;
    }

    const answer = answerQuestion(target, parseResult.parsed);
    setHistory((current) => [...current, {
      id: `${Date.now()}-${current.length}`,
      question: question.trim(),
      answer,
      signature,
    }]);
    setRules((current) => applyQuestionToRules(parseResult.parsed!, current));
    setQuestion("");
  }

  function makeGuess(aircraft: Aircraft, finalGuess = false) {
    const won = aircraft.id === target.id;
    if (finalGuess) {
      setFinalPickerOpen(false);
      setResult({ won, score: won ? 1 : 0, wasFinalGuess: true });
      return;
    }

    const nextGuessCount = guessCount + 1;
    setGuessCount(nextGuessCount);
    setGuessOpen(false);
    if (won) {
      setResult({ won: true, score: scoreForGuess(questionCount), wasFinalGuess: false });
    } else {
      setFeedback(`猜错了。剩余猜测：${3 - nextGuessCount} / 3`);
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
      />
    );
  }

  if (isFinal) {
    return (
      <>
        <FinalGuessIntro onChoose={() => setFinalPickerOpen(true)} />
        <div className="final-history-wrap"><QuestionHistory history={history} /></div>
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
    <main className="game-layout">
      <header className="game-header">
        <div>
          <p className="eyebrow">PAINTED AIRCRAFT · YES / NO</p>
          <h1><span aria-hidden="true">✈</span> 猜彩绘飞机</h1>
          <p>用十个是非问题，锁定航空公司、机型与彩绘。</p>
        </div>
        <button className="text-button" onClick={onRestart}>重新开始</button>
      </header>

      <StatusPanel
        questionCount={questionCount}
        guessCount={guessCount}
        maxScore={currentMaxScore(questionCount)}
        rules={rules}
      />

      <QuestionHistory history={history} />

      <section className="control-card">
        <form onSubmit={submitQuestion}>
          <label htmlFor="question-input">向塔台提问</label>
          <div className="question-row">
            <input
              id="question-input"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="向我提一个只能回答“是 / 否”的问题……"
              autoComplete="off"
            />
            <button className="button primary" type="submit" disabled={!question.trim()}>提交问题</button>
            <button
              className="button guess-button"
              type="button"
              disabled={!canGuess}
              onClick={() => setGuessOpen(true)}
            >
              我要猜飞机
            </button>
          </div>
        </form>

        {feedback && !isDuplicateFeedback && <div className="feedback" role="alert">{feedback}</div>}
        {!canGuess && questionCount === 0 && (
          <p className="helper-text">完成第 1 个正式问题后即可开始猜测。</p>
        )}
        {!canGuess && guessCount >= 3 && (
          <p className="helper-text">3 次中途猜测已经用完，请继续提问。</p>
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

      <aside className="rules-note">
        <strong>本局提示</strong>
        <span>宽窄体与制造商只能选择一个方向</span>
        <span>地区、颜色问题各最多 2 次</span>
        <span>普通国家不可直接询问，中国除外</span>
      </aside>

      {isDuplicateFeedback && (
        <div className="duplicate-toast" role="alert">
          <strong>重复提问</strong>
          <span>您已经问过这个问题了</span>
        </div>
      )}

      {isGuessOpen && (
        <GuessModal
          title="我要猜飞机"
          description={`选择完整答案。猜错只会消耗机会，不会透露部分信息。剩余 ${3 - guessCount} 次。`}
          confirmLabel="确认猜测"
          target={target}
          onConfirm={(aircraft) => makeGuess(aircraft)}
          onClose={() => setGuessOpen(false)}
        />
      )}
    </main>
  );
}
