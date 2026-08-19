export function scoreForGuess(questionCount: number): number {
  if (questionCount <= 0) return 0;
  return Math.max(1, 11 - questionCount);
}

export function currentMaxScore(questionCount: number): number {
  return questionCount === 0 ? 10 : scoreForGuess(questionCount);
}
