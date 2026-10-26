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
