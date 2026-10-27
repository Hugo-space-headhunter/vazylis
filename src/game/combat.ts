import { PLAYER_HEALTH } from "../config/combat";
import { WEAPON_FAMILIES, type WeaponFamilyId } from "../config/items";
import { CRITICAL_DAMAGE_MULTIPLIER, UNARMED_DAMAGE } from "../config/stats";
import type { InventoryItem } from "./inventory";
import { weaponItemDamage } from "./item";
import { criticalChance, forceDamageBonus, maxHp, type PlayerStats } from "./stats";

/** Bonus de dégâts par point de statistique d'affinité (0,3 % par point). */
const AFFINITY_DAMAGE_BONUS_PER_POINT = 0.003;

function equippedWeaponFamily(weapon: InventoryItem | null) {
  if (!weapon || weapon.kind !== "weapon") return null;
  return WEAPON_FAMILIES[weapon.familyId as WeaponFamilyId];
}

/**
 * Dégâts d'un coup du joueur : dégâts de l'arme (ou à mains nues) + bonus de Force,
 * puis bonus de la statistique d'affinité de l'arme équipée.
 * Source : docs/game-design.md, "Dégâts d'un coup".
 */
export function playerBaseDamage(stats: PlayerStats, weapon: InventoryItem | null): number {
  const family = equippedWeaponFamily(weapon);
  const weaponDamage =
    weapon && family ? weaponItemDamage(weapon.level, weapon.rarity, family, weapon.quality) : UNARMED_DAMAGE;
  const raw = weaponDamage + forceDamageBonus(stats.force);
  const affinityValue = family ? stats[family.affinity] : 0;
  return raw * (1 + affinityValue * AFFINITY_DAMAGE_BONUS_PER_POINT);
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
 * Calcule les dégâts d'un coup, avec une chance de coup critique dépendant de l'Agilité
 * et de l'arme équipée (les dagues ajoutent de la chance, l'épée à deux mains double les dégâts).
 * `randomValue` est injecté (entre 0 et 1) pour que la fonction reste testable.
 */
export function rollPlayerDamage(stats: PlayerStats, weapon: InventoryItem | null, randomValue: number): DamageRoll {
  const family = equippedWeaponFamily(weapon);
  const chance = Math.min(1, criticalChance(stats.agilite) + (family?.critChanceBonus ?? 0));
  const isCritical = randomValue < chance;
  const base = playerBaseDamage(stats, weapon);
  const critMultiplier = family?.critMultiplierOverride ?? CRITICAL_DAMAGE_MULTIPLIER;
  return {
    amount: isCritical ? Math.round(base * critMultiplier) : Math.round(base),
    isCritical,
  };
}

/** Vitesse d'attaque de base de l'arme équipée (coups par seconde), ou de l'attaque à mains nues. */
export function weaponAttackInterval(weapon: InventoryItem | null, unarmedIntervalSeconds: number): number {
  const family = equippedWeaponFamily(weapon);
  return family ? 1 / family.baseAttackSpeed : unarmedIntervalSeconds;
}

/** Chance de bloquer entièrement un coup (seulement avec épée et bouclier). */
export function rollBlock(weapon: InventoryItem | null, randomValue: number): boolean {
  const family = equippedWeaponFamily(weapon);
  return (family?.blockChance ?? 0) > randomValue;
}
