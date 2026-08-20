export const MAX_INTERMEDIATE_GUESSES = 3;

export function canMakeIntermediateGuess(questionCount: number, guessCount: number): boolean {
  return questionCount >= 1 && questionCount < 10 && guessCount < MAX_INTERMEDIATE_GUESSES;
}

export function canMakeFinalGamble(guessCount: number): boolean {
  return guessCount >= MAX_INTERMEDIATE_GUESSES;
}
