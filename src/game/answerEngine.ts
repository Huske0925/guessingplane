import type { Aircraft, AirlineRegionQuery } from "../types/aircraft";
import type { ParsedQuestion } from "../types/game";
import { getAirlineLocation } from "../data/airlineLocations";
import { getLandingGearCategory } from "./landingGear";

const groupedRegions: Partial<Record<AirlineRegionQuery, Aircraft["airlineRegion"][]>> = {
  亚洲: ["东亚", "东南亚", "南亚", "中东"],
  美洲: ["北美", "南美"],
  南极洲: [],
};

export function answerQuestion(aircraft: Aircraft, question: ParsedQuestion): boolean {
  let answer = false;

  switch (question.kind) {
    case "manufacturer":
      answer = aircraft.manufacturer === question.value;
      break;
    case "bodyType":
      answer = aircraft.bodyType === question.value;
      break;
    case "region":
      answer = groupedRegions[question.value]
        ? groupedRegions[question.value]!.includes(aircraft.airlineRegion)
        : aircraft.airlineRegion === question.value || aircraft.airlineSubregion === question.value;
      break;
    case "china":
      answer = getAirlineLocation(aircraft.airline) === "中国大陆";
      break;
    case "country":
      answer = getAirlineLocation(aircraft.airline) === question.value;
      break;
    case "color":
      answer = aircraft.largeAreaColors.includes(question.value);
      break;
    case "engineCount":
      answer = aircraft.engineCount === question.value;
      break;
    case "winglet":
      answer = aircraft.hasWinglet;
      break;
    case "upperDeck":
      answer = aircraft.hasUpperDeck;
      break;
    case "tailType":
      answer = aircraft.tailType === question.value;
      break;
    case "enginesUnderWing":
      answer = aircraft.enginesUnderWing;
      break;
    case "structureTag":
      if (["单轮主起落架", "双轮主起落架", "三轮主起落架"].includes(question.value)) {
        answer = getLandingGearCategory(aircraft.aircraftModel) === question.value;
      } else {
        answer = [...aircraft.structureTags, ...aircraft.landingGearTags].includes(question.value);
      }
      break;
    case "specialLivery":
      answer = true;
      break;
    case "unsupportedCountry":
      answer = false;
      break;
  }

  return question.negated ? !answer : answer;
}
