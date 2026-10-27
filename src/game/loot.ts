import { ARMOR_SLOTS, MONSTER_LOOT_TABLE, WEAPON_FAMILIES, type ArmorSlotId, type WeaponFamilyId } from "../config/items";
import type { RarityId } from "../config/rarity";

const RARITY_ORDER: RarityId[] = ["standard", "argente", "dore", "epique"];
const WEAPON_FAMILY_IDS = Object.keys(WEAPON_FAMILIES) as WeaponFamilyId[];
const ARMOR_SLOT_IDS = Object.keys(ARMOR_SLOTS) as ArmorSlotId[];

export type ItemKind = "weapon" | "armor";

export interface GeneratedItem {
  kind: ItemKind;
  familyId: WeaponFamilyId | ArmorSlotId;
  level: number;
  rarity: RarityId;
  /** Entre 0,7 et 1 : qualité de l'item (voir "Qualité de l'item" dans le document). */
  quality: number;
}

/**
 * Détermine les raretés obtenues sur un monstre : chaque palier (standard, argenté, doré, épique)
 * est un tirage indépendant, donc un même kill peut donner plusieurs items, ou aucun.
 * `randomValues` fournit un nombre entre 0 et 1 par palier, dans l'ordre de RARITY_ORDER.
 */
export function rollLootRarities(randomValues: number[]): RarityId[] {
  const results: RarityId[] = [];
  RARITY_ORDER.forEach((rarity, index) => {
    const chance = MONSTER_LOOT_TABLE[rarity] ?? 0;
    if ((randomValues[index] ?? 1) < chance) {
      results.push(rarity);
    }
  });
  return results;
}

/** Qualité d'un item : tirée entre 70 % et 100 % de son maximum. */
export function rollQuality(randomValue: number): number {
  return 0.7 + randomValue * 0.3;
}

/**
 * Génère un item (arme ou armure) d'une rareté donnée, au niveau du monstre qui le lâche.
 * `kindRandom`/`familyRandom`/`qualityRandom` sont injectés pour rester testable.
 */
export function generateLootItem(
  level: number,
  rarity: RarityId,
  kindRandom: number,
  familyRandom: number,
  qualityRandom: number,
): GeneratedItem {
  const kind: ItemKind = kindRandom < 0.5 ? "weapon" : "armor";
  const familyIds = kind === "weapon" ? WEAPON_FAMILY_IDS : ARMOR_SLOT_IDS;
  const familyId = familyIds[Math.floor(familyRandom * familyIds.length) % familyIds.length];

  return {
    kind,
    familyId,
    level,
    rarity,
    quality: rollQuality(qualityRandom),
  };
}
