// Ressources lâchées par les monstres, utilisées plus tard pour l'amélioration des items (étape 7).
// Voir docs/game-design.md, section "Les 4 familles de matériaux". Seuls les paliers de la
// zone 1 sont définis pour l'instant (fer, chêne, cuir) ; les paliers suivants arriveront avec
// les zones 2 à 5. Les pierres précieuses ne tombent que des boss de donjon, pas encore construits.

export type ResourceId = "fer" | "chene" | "cuir";

export interface ResourceDefinition {
  id: ResourceId;
  name: string;
}

export const RESOURCES: Record<ResourceId, ResourceDefinition> = {
  fer: { id: "fer", name: "Fer" },
  chene: { id: "chene", name: "Bois de chêne" },
  cuir: { id: "cuir", name: "Cuir" },
};

export const RESOURCE_IDS = Object.keys(RESOURCES) as ResourceId[];

export interface ResourceDropConfig {
  chance: number;
  min: number;
  max: number;
}

/** Chance qu'un monstre standard lâche une ressource, et quantité (voir "Tables de loot"). */
export const RESOURCE_DROP: ResourceDropConfig = { chance: 0.35, min: 1, max: 3 };

/** Monstre champion ou sous-boss : ressource garantie (voir "Tables de loot"). */
export const GUARANTEED_RESOURCE_DROP: ResourceDropConfig = { chance: 1, min: 1, max: 3 };
