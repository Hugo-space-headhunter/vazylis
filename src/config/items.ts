// Familles d'armes du prototype et table de butin.
// Source : docs/game-design.md, sections "Armes du prototype", "Affinités entre
// statistiques et armes", "Tables de loot". Valeurs de départ, à régler en jouant.
import type { RarityId } from "./rarity";

export type WeaponFamilyId = "dagues" | "arc" | "epee_deux_mains" | "hache_deux_mains" | "epee_bouclier";
export type StatKey = "force" | "agilite" | "vitalite" | "intelligence";

export interface WeaponFamily {
  id: WeaponFamilyId;
  name: string;
  /** Vitesse de base, en coups par seconde. */
  baseAttackSpeed: number;
  /** Multiplie les "dégâts de l'arme" de base (faible à très élevé, voir le document). */
  damageMultiplier: number;
  /** Statistique d'affinité : +0,3 % de dégâts par point. */
  affinity: StatKey;
  /** Modèle 3D (relatif à la racine du site), ou null pour une forme provisoire. */
  modelUrl: string | null;
  /** Deuxième modèle (bouclier) pour "épée et bouclier" uniquement. */
  offHandModelUrl?: string | null;
  /** Mise à l'échelle et ajustement pour que l'arme ait l'air tenue en main (valeurs réglées à l'œil). */
  gripScale: number;
  gripPosition: { x: number; y: number; z: number };
  gripRotationDeg: { x: number; y: number; z: number };
  critChanceBonus: number;
  critMultiplierOverride?: number;
  ignoreDefensePercent: number;
  blockChance: number;
}

export const WEAPON_FAMILIES: Record<WeaponFamilyId, WeaponFamily> = {
  dagues: {
    id: "dagues",
    name: "Paire de dagues",
    baseAttackSpeed: 1.6,
    damageMultiplier: 0.7,
    affinity: "agilite",
    modelUrl: "models/weapons/rogues_dagger_low.glb",
    gripScale: 0.35,
    gripPosition: { x: 0, y: 0.1, z: 0 },
    gripRotationDeg: { x: 0, y: 0, z: 0 },
    critChanceBonus: 0.1,
    ignoreDefensePercent: 0,
    blockChance: 0,
  },
  arc: {
    id: "arc",
    name: "Arc",
    baseAttackSpeed: 1.3,
    damageMultiplier: 0.85,
    affinity: "agilite",
    modelUrl: null,
    gripScale: 0.8,
    gripPosition: { x: 0, y: 0, z: 0 },
    gripRotationDeg: { x: 0, y: 0, z: 0 },
    critChanceBonus: 0,
    ignoreDefensePercent: 0,
    blockChance: 0,
  },
  epee_deux_mains: {
    id: "epee_deux_mains",
    name: "Épée à deux mains",
    baseAttackSpeed: 0.8,
    damageMultiplier: 1.2,
    affinity: "force",
    modelUrl: "models/weapons/highland_claymore_low.glb",
    gripScale: 0.9,
    gripPosition: { x: 0, y: 0.15, z: 0 },
    gripRotationDeg: { x: 0, y: 0, z: 0 },
    critChanceBonus: 0,
    critMultiplierOverride: 2,
    ignoreDefensePercent: 0,
    blockChance: 0,
  },
  hache_deux_mains: {
    id: "hache_deux_mains",
    name: "Hache à deux mains",
    baseAttackSpeed: 0.75,
    damageMultiplier: 1.35,
    affinity: "force",
    modelUrl: "models/weapons/twin_moon_battle_axe_low.glb",
    gripScale: 0.85,
    gripPosition: { x: 0, y: 0.1, z: 0 },
    gripRotationDeg: { x: 0, y: 0, z: 0 },
    critChanceBonus: 0,
    ignoreDefensePercent: 0.15,
    blockChance: 0,
  },
  epee_bouclier: {
    id: "epee_bouclier",
    name: "Épée et bouclier",
    baseAttackSpeed: 1.1,
    damageMultiplier: 0.85,
    affinity: "vitalite",
    modelUrl: "models/weapons/knights_longsword_low.glb",
    offHandModelUrl: null,
    gripScale: 0.8,
    gripPosition: { x: 0, y: 0.08, z: 0 },
    gripRotationDeg: { x: 0, y: 0, z: 0 },
    critChanceBonus: 0,
    ignoreDefensePercent: 0,
    blockChance: 0.1,
  },
};

/** "Dégâts de l'arme" avant le multiplicateur de famille : (10 + 3 × niveau) × multiplicateur de rareté. */
export const WEAPON_BASE_DAMAGE = { base: 10, perLevel: 3 };

/** Armure (défense) d'un item, avant multiplicateur de rareté : simplifiée pour le prototype. */
export const ARMOR_BASE_DEFENSE = { base: 4, perLevel: 0.8 };

export type ArmorSlotId = "casque" | "plastron" | "gants" | "bottes" | "ceinture" | "cape";

export interface ArmorSlot {
  id: ArmorSlotId;
  name: string;
}

// L'apparence (un modèle par pièce) viendra avec les vraies zones ; pour l'instant l'armure
// n'est qu'un bonus de défense, sans changer l'apparence du personnage. Voir IDEES.md.
export const ARMOR_SLOTS: Record<ArmorSlotId, ArmorSlot> = {
  casque: { id: "casque", name: "Casque" },
  plastron: { id: "plastron", name: "Plastron" },
  gants: { id: "gants", name: "Gants" },
  bottes: { id: "bottes", name: "Bottes" },
  ceinture: { id: "ceinture", name: "Ceinture" },
  cape: { id: "cape", name: "Cape" },
};

export const INVENTORY_SIZE = 30;

/** Table de butin des monstres de zone (voir game-design.md, "Tables de loot"). */
export const MONSTER_LOOT_TABLE: Partial<Record<RarityId, number>> = {
  standard: 0.08,
  argente: 0.03,
  dore: 0.005,
  epique: 0.0005,
};
