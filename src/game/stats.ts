import { BASE_MANA, COMBAT_CAPS, POINTS_PER_LEVEL, STAT_EFFECTS } from "../config/stats";

export interface PlayerStats {
  force: number;
  agilite: number;
  vitalite: number;
  intelligence: number;
}

export const EMPTY_STATS: PlayerStats = { force: 0, agilite: 0, vitalite: 0, intelligence: 0 };

/** Nombre total de points gagnés pour un niveau donné (4 par niveau, dès le niveau 1). */
export function pointsEarnedForLevel(level: number): number {
  return level * POINTS_PER_LEVEL;
}

/** Nombre total de points déjà placés dans les statistiques. */
export function totalSpentPoints(stats: PlayerStats): number {
  return stats.force + stats.agilite + stats.vitalite + stats.intelligence;
}

/** Nombre de points qu'il reste à répartir. */
export function unspentPoints(level: number, stats: PlayerStats): number {
  return pointsEarnedForLevel(level) - totalSpentPoints(stats);
}

/** Bonus de dégâts par coup apporté par la Force. */
export function forceDamageBonus(force: number): number {
  return force * STAT_EFFECTS.forceDamagePerPoint;
}

/** Chance de coup critique (0 à 1), plafonnée. */
export function criticalChance(agilite: number): number {
  const chance = COMBAT_CAPS.baseCritChance + agilite * STAT_EFFECTS.agilityCritChancePerPoint;
  return Math.min(COMBAT_CAPS.maxCritChance, chance);
}

/** Multiplicateur de vitesse d'attaque (1 = vitesse de base), plafonné. */
export function attackSpeedMultiplier(agilite: number): number {
  const multiplier = 1 + agilite * STAT_EFFECTS.agilityAttackSpeedPerPoint;
  return Math.min(COMBAT_CAPS.maxAttackSpeedMultiplier, multiplier);
}

/** Points de vie maximum (sans le bonus des items pour l'instant). */
export function maxHp(level: number, vitalite: number, baseHp: number, hpPerLevel: number): number {
  return baseHp + hpPerLevel * level + vitalite * STAT_EFFECTS.vitalityHpPerPoint;
}

/** Défense (sans l'armure des items pour l'instant). */
export function defense(vitalite: number): number {
  return vitalite * STAT_EFFECTS.vitalityDefensePerPoint;
}

/** Points de mana maximum (inutilisés dans le prototype, juste affichés). */
export function maxMana(intelligence: number): number {
  return BASE_MANA + intelligence * STAT_EFFECTS.intelligenceManaPerPoint;
}

/**
 * Part des dégâts subis qui passe au travers de la défense (0 à 1).
 * Source : docs/game-design.md, "Réduction des dégâts subis".
 */
export function damageReduction(defenseValue: number, attackerLevel: number): number {
  const reduction = defenseValue / (defenseValue + 50 * attackerLevel);
  return Math.min(COMBAT_CAPS.maxDamageReduction, reduction);
}

/** Applique la réduction de dégâts d'une défense donnée à des dégâts bruts. */
export function applyDamageReduction(rawDamage: number, defenseValue: number, attackerLevel: number): number {
  return rawDamage * (1 - damageReduction(defenseValue, attackerLevel));
}
