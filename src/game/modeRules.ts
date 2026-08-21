import type { GameMode } from "../types/game";

export interface ModeRules {
  directionIsExclusive: boolean;
  allowCountryQuestions: boolean;
  maxRegionQuestions: number;
  maxColorQuestions: number;
}

export const modeRules: Record<GameMode, ModeRules> = {
  easy: {
    directionIsExclusive: false,
    allowCountryQuestions: true,
    maxRegionQuestions: 2,
    maxColorQuestions: 3,
  },
  hard: {
    directionIsExclusive: true,
    allowCountryQuestions: false,
    maxRegionQuestions: 2,
    maxColorQuestions: 2,
  },
};
