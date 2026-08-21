import type { AirlineRegionQuery, BodyType, Manufacturer, TailType } from "./aircraft";
import type { AirlineLocation } from "../data/airlineLocations";

export type DirectionChoice = "bodyType" | "manufacturer" | null;
export type GamePhase = "ready" | "playing" | "final" | "result";
export type GameMode = "easy" | "hard";

export type ParsedQuestion =
  | { kind: "manufacturer"; value: Manufacturer; negated: boolean }
  | { kind: "bodyType"; value: BodyType; negated: boolean }
  | { kind: "region"; value: AirlineRegionQuery; negated: boolean }
  | { kind: "china"; value: true; negated: boolean }
  | { kind: "country"; value: AirlineLocation; negated: boolean }
  | { kind: "color"; value: string; negated: boolean }
  | { kind: "engineCount"; value: 1 | 2 | 3 | 4 | 5 | 6; negated: boolean }
  | { kind: "winglet"; value: true; negated: boolean }
  | { kind: "upperDeck"; value: true; negated: boolean }
  | { kind: "tailType"; value: TailType; negated: boolean }
  | { kind: "enginesUnderWing"; value: true; negated: boolean }
  | { kind: "structureTag"; value: string; negated: boolean }
  | { kind: "specialLivery"; value: true; negated: boolean }
  | { kind: "unsupportedCountry"; value: string; negated: boolean };

export interface QuestionRecord {
  id: string;
  question: string;
  answer: boolean;
  signature: string;
}

export interface RuleState {
  direction: DirectionChoice;
  regionQuestions: number;
  colorQuestions: number;
}

export interface GameResult {
  won: boolean;
  score: number;
  wasFinalGuess: boolean;
}
