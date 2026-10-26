// Les 4 statistiques du personnage et l'effet de chaque point.
// Source : docs/game-design.md, section "Effet précis de chaque point de statistique".
// Valeurs de départ, à régler en jouant.

export const POINTS_PER_LEVEL = 4;

export const STAT_EFFECTS = {
  /** Dégâts ajoutés par point de Force. */
  forceDamagePerPoint: 2,
  /** Chance de critique ajoutée par point d'Agilité (0,1 % = 0.001). */
  agilityCritChancePerPoint: 0.001,
  /** Vitesse d'attaque ajoutée par point d'Agilité (0,4 % = 0.004). */
  agilityAttackSpeedPerPoint: 0.004,
  /** Points de vie ajoutés par point de Vitalité. */
  vitalityHpPerPoint: 12,
  /** Défense ajoutée par point de Vitalité. */
  vitalityDefensePerPoint: 0.5,
  /** Mana ajouté par point d'Intelligence (inutilisé dans le prototype, prévu pour la magie). */
  intelligenceManaPerPoint: 5,
};

export const COMBAT_CAPS = {
  baseCritChance: 0.05,
  maxCritChance: 0.6,
  maxAttackSpeedMultiplier: 2.5,
  maxDamageReduction: 0.75,
};

/** Dégâts "à mains nues", en attendant les vraies armes (étape 4). */
export const UNARMED_DAMAGE = 5;
export const CRITICAL_DAMAGE_MULTIPLIER = 1.5;

/** Mana de base, avant le bonus d'Intelligence (inutilisé dans le prototype, prévu pour la magie). */
export const BASE_MANA = 150;
