import { RARITIES, type RarityId } from "../config/rarity";
import { UPGRADE_POWER_BONUS_PER_LEVEL } from "../config/upgrade";

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
