import { PLAYER_COMBAT, PLAYER_HEALTH } from "../config/combat";

/** Dégâts d'un coup du joueur à son niveau actuel (formule simplifiée, sans arme ni stats pour l'instant). */
export function playerBaseDamage(level: number): number {
  return PLAYER_COMBAT.baseDamage + PLAYER_COMBAT.damagePerLevel * (level - 1);
}

/** Points de vie maximum du joueur à son niveau actuel (sans le bonus de Vitalité pour l'instant). */
export function playerMaxHp(level: number): number {
  return PLAYER_HEALTH.base + PLAYER_HEALTH.perLevel * level;
}

export interface DamageRoll {
  amount: number;
  isCritical: boolean;
}

/**
 * Calcule les dégâts d'un coup, avec une chance de coup critique.
 * `randomValue` est injecté (entre 0 et 1) pour que la fonction reste testable.
 */
export function rollPlayerDamage(level: number, randomValue: number): DamageRoll {
  const isCritical = randomValue < PLAYER_COMBAT.critChance;
  const base = playerBaseDamage(level);
  return {
    amount: isCritical ? Math.round(base * PLAYER_COMBAT.critMultiplier) : Math.round(base),
    isCritical,
  };
}
