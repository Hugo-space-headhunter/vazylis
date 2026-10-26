import {
  AVERAGE_MONSTER_XP_REFERENCE,
  MONSTERS_KILLED_PER_MINUTE,
  XP_LEVEL_DIFFERENCE,
  XP_TIME_PARAMS,
} from "../config/progression";

/**
 * Temps cible (en minutes) pour passer du niveau L au niveau L+1.
 * t(L) = base + coefficient × L^exponent
 * Source : docs/game-design.md, section "Rythme cible et courbe d'XP".
 */
export function targetTimeForLevelMinutes(level: number): number {
  const { base, coefficient, exponent } = XP_TIME_PARAMS;
  return base + coefficient * Math.pow(level, exponent);
}

/** XP nécessaire pour passer du niveau L au niveau L+1. */
export function requiredXpForLevel(level: number): number {
  return targetTimeForLevelMinutes(level) * MONSTERS_KILLED_PER_MINUTE * AVERAGE_MONSTER_XP_REFERENCE;
}

/**
 * XP gagnée en tuant un monstre, selon l'écart de niveau avec le joueur.
 * Source : docs/game-design.md, section "Progression et expérience".
 */
export function xpGainForKill(monsterBaseXp: number, monsterLevel: number, playerLevel: number): number {
  const levelDiff = monsterLevel - playerLevel;

  if (levelDiff > 0) {
    const bonus = Math.min(XP_LEVEL_DIFFERENCE.maxBonus, levelDiff * XP_LEVEL_DIFFERENCE.bonusPerLevelAbove);
    return monsterBaseXp * (1 + bonus);
  }

  if (levelDiff < 0) {
    const malus = -levelDiff * XP_LEVEL_DIFFERENCE.malusPerLevelBelow;
    const share = Math.max(XP_LEVEL_DIFFERENCE.minimumShare, 1 - malus);
    return monsterBaseXp * share;
  }

  return monsterBaseXp;
}

export interface LevelState {
  level: number;
  xp: number;
}

export interface LevelUpResult extends LevelState {
  leveledUp: boolean;
}

/** Ajoute de l'XP à l'état du joueur, et fait monter de niveau autant de fois que nécessaire. */
export function applyXpGain(state: LevelState, xpGained: number): LevelUpResult {
  let { level, xp } = state;
  xp += xpGained;
  let leveledUp = false;

  while (xp >= requiredXpForLevel(level)) {
    xp -= requiredXpForLevel(level);
    level += 1;
    leveledUp = true;
  }

  return { level, xp, leveledUp };
}
