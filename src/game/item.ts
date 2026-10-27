import { RARITIES, type RarityId } from "../config/rarity";
import { UPGRADE_POWER_BONUS_PER_LEVEL } from "../config/upgrade";
import { ARMOR_BASE_DEFENSE, WEAPON_BASE_DAMAGE, type WeaponFamily } from "../config/items";

/**
 * Puissance d'un item = niveau × multiplicateur de rareté, plus le bonus d'amélioration.
 * Source : docs/game-design.md, section "Niveau et puissance d'un item".
 */
export function itemPower(level: number, rarity: RarityId, upgradeLevel = 0): number {
  const { powerMultiplier } = RARITIES[rarity];
  const basePower = level * powerMultiplier;
  const upgradeBonus = upgradeLevel * UPGRADE_POWER_BONUS_PER_LEVEL;
  return Math.floor(basePower + upgradeBonus);
}

/**
 * "Dégâts de l'arme" d'un item d'arme, qualité incluse.
 * Source : docs/game-design.md, "Dégâts de l'arme" + "Qualité de l'item".
 */
export function weaponItemDamage(
  level: number,
  rarity: RarityId,
  family: WeaponFamily,
  quality: number,
  upgradeLevel = 0,
): number {
  const base = WEAPON_BASE_DAMAGE.base + WEAPON_BASE_DAMAGE.perLevel * level;
  const raw = base * RARITIES[rarity].powerMultiplier * family.damageMultiplier * quality;
  return Math.floor(raw + upgradeLevel * UPGRADE_POWER_BONUS_PER_LEVEL);
}

/** Défense apportée par une pièce d'armure, qualité incluse. */
export function armorItemDefense(level: number, rarity: RarityId, quality: number, upgradeLevel = 0): number {
  const base = ARMOR_BASE_DEFENSE.base + ARMOR_BASE_DEFENSE.perLevel * level;
  const raw = base * RARITIES[rarity].powerMultiplier * quality;
  return Math.floor(raw + upgradeLevel * UPGRADE_POWER_BONUS_PER_LEVEL);
}
