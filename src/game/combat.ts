import { PLAYER_HEALTH } from "../config/combat";
import { CRITICAL_DAMAGE_MULTIPLIER, UNARMED_DAMAGE } from "../config/stats";
import { criticalChance, forceDamageBonus, maxHp, type PlayerStats } from "./stats";

/** Dégâts d'un coup du joueur, à mains nues (pas encore d'arme) + bonus de Force. */
export function playerBaseDamage(force: number): number {
  return UNARMED_DAMAGE + forceDamageBonus(force);
}

/** Points de vie maximum du joueur à son niveau actuel, avec le bonus de Vitalité. */
export function playerMaxHp(level: number, vitalite: number): number {
  return maxHp(level, vitalite, PLAYER_HEALTH.base, PLAYER_HEALTH.perLevel);
}

export interface DamageRoll {
  amount: number;
  isCritical: boolean;
}

/**
 * Calcule les dégâts d'un coup, avec une chance de coup critique dépendant de l'Agilité.
 * `randomValue` est injecté (entre 0 et 1) pour que la fonction reste testable.
 */
export function rollPlayerDamage(stats: PlayerStats, randomValue: number): DamageRoll {
  const isCritical = randomValue < criticalChance(stats.agilite);
  const base = playerBaseDamage(stats.force);
  return {
    amount: isCritical ? Math.round(base * CRITICAL_DAMAGE_MULTIPLIER) : Math.round(base),
    isCritical,
  };
}
