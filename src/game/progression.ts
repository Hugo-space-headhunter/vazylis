import { XP_TIME_PARAMS } from "../config/progression";

/**
 * Temps cible (en minutes) pour passer du niveau L au niveau L+1.
 * t(L) = base + coefficient × L^exponent
 * Source : docs/game-design.md, section "Rythme cible et courbe d'XP".
 */
export function targetTimeForLevelMinutes(level: number): number {
  const { base, coefficient, exponent } = XP_TIME_PARAMS;
  return base + coefficient * Math.pow(level, exponent);
}
