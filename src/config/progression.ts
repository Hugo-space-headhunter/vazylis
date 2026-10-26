// Rythme de progression du personnage.
// Source : docs/game-design.md, section "Rythme cible et courbe d'XP".
// Objectif : niveau 200 en environ 4 semaines, à raison d'environ 3 heures de jeu par soirée.

/**
 * Paramètres de la formule du temps cible pour passer un niveau L (en minutes) :
 * t(L) = base + coefficient × L^exponent
 */
export const XP_TIME_PARAMS = {
  base: 2,
  coefficient: 0.084,
  exponent: 1.2,
};

/** Monstres tués par minute en moyenne (environ un toutes les 10 secondes). */
export const MONSTERS_KILLED_PER_MINUTE = 6;

/**
 * XP moyenne d'un monstre proche du niveau du joueur, utilisée pour calculer l'XP
 * nécessaire à chaque niveau (voir src/game/progression.ts). Calibrée sur les monstres
 * de la zone 1 (src/config/monsters.ts) ; à ajuster quand d'autres zones arriveront.
 */
export const AVERAGE_MONSTER_XP_REFERENCE = 9;

/** Coefficients d'écart de niveau entre le joueur et le monstre (voir game-design.md, "XP gagnée"). */
export const XP_LEVEL_DIFFERENCE = {
  /** Bonus par niveau quand le monstre est plus fort que le joueur. */
  bonusPerLevelAbove: 0.05,
  maxBonus: 0.5,
  /** Malus par niveau quand le monstre est plus faible que le joueur. */
  malusPerLevelBelow: 0.1,
  /** Part minimale d'XP conservée face à un monstre très faible (minimum symbolique). */
  minimumShare: 0.1,
};
