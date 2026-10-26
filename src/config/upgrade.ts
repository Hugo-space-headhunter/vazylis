// Amélioration des items (+1 à +10).
// Source : docs/game-design.md, section "Taux de réussite de l'amélioration (proposition)".
// Un échec fait perdre les matériaux utilisés, jamais le niveau d'amélioration déjà atteint.

/** Chance de réussite (entre 0 et 1) pour atteindre chaque palier d'amélioration. */
export const UPGRADE_SUCCESS_RATES: Record<number, number> = {
  1: 1,
  2: 1,
  3: 0.9,
  4: 0.8,
  5: 0.7,
  6: 0.45,
  7: 0.35,
  8: 0.2,
  9: 0.12,
  10: 0.06,
};

export const MAX_UPGRADE_LEVEL = 10;

// Valeur provisoire, à régler en jouant : puissance ajoutée par niveau d'amélioration.
export const UPGRADE_POWER_BONUS_PER_LEVEL = 1;
