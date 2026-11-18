import { TEAM } from "@/lib/club";
export { parseTeamPage, ParseError } from "./teamPage";
export { guessMatchType } from "./matchType";
export { parseDutchDate, seasonLabel, seasonStartYear } from "./dates";
export type * from "./types";

export const TEAM_NAME = TEAM.name;
export const TEAM_PAGE_URL = TEAM.pageUrl;
