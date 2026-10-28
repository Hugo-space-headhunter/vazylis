// Monstres de la première sous-zone (Les Prés de Vazylis, niveaux 1-10).
// Voir docs/game-design.md, section "Zone 1 — La Vallée claire".
// Valeurs de départ, à régler en jouant.

export type MonsterLootTier = "monstre" | "sous_boss";

export interface MonsterDefinition {
  id: string;
  name: string;
  level: number;
  /** Chemin du modèle 3D (relatif à la racine du site), ou null pour une forme provisoire. */
  modelUrl: string | null;
  scale: number;
  maxHp: number;
  damage: number;
  /** Un monstre agressif charge le joueur dès qu'il est repéré ; un monstre passif ne riposte que si on l'attaque. */
  aggressive: boolean;
  moveSpeed: number;
  attackRange: number;
  attackIntervalSeconds: number;
  /** Rayon de détection pour les monstres agressifs. */
  aggroRadius: number;
  respawnSeconds: number;
  baseXp: number;
  /** Couleur de la forme provisoire (si modelUrl est null). */
  placeholderColor: [number, number, number];
  /** "sous_boss" change la table de butin et l'exclut du tirage "monstre champion". Par défaut "monstre". */
  lootTier?: MonsterLootTier;
}

/** Monstre champion : 1 monstre sur 200, plus gros avec une aura, 5 fois plus de vie et d'XP
 * (voir game-design.md, "Monstres champions"). Les dégâts sont aussi augmentés, pour rester
 * cohérent avec le calibrage (environ 50 s à tuer, tue le joueur en 30 s). */
export const CHAMPION = {
  spawnChance: 1 / 200,
  hpMultiplier: 5,
  xpMultiplier: 5,
  damageMultiplier: 2,
  scaleMultiplier: 1.4,
};

export const MONSTERS: Record<string, MonsterDefinition> = {
  cochonnet: {
    id: "cochonnet",
    name: "Cochonnet de suie",
    level: 1,
    modelUrl: null,
    scale: 0.5,
    maxHp: 30,
    damage: 3,
    aggressive: false,
    moveSpeed: 1.5,
    attackRange: 1.4,
    attackIntervalSeconds: 1.4,
    aggroRadius: 0,
    respawnSeconds: 12,
    baseXp: 8,
    placeholderColor: [0.05, 0.05, 0.06],
  },
  corbac: {
    id: "corbac",
    name: "Corbac",
    level: 2,
    modelUrl: null,
    scale: 0.4,
    maxHp: 25,
    damage: 2,
    aggressive: false,
    moveSpeed: 2,
    attackRange: 1.3,
    attackIntervalSeconds: 1.2,
    aggroRadius: 0,
    respawnSeconds: 12,
    baseXp: 9,
    placeholderColor: [0.15, 0.1, 0.12],
  },
  pomelin: {
    id: "pomelin",
    name: "Pomelin",
    level: 3,
    modelUrl: "models/monsters/pomelin/slime.glb",
    scale: 0.8,
    maxHp: 40,
    damage: 4,
    aggressive: true,
    moveSpeed: 2.2,
    attackRange: 1.5,
    attackIntervalSeconds: 1.1,
    aggroRadius: 6,
    respawnSeconds: 15,
    baseXp: 11,
    placeholderColor: [0.21, 0.64, 0.11],
  },
  pomelin_royal: {
    id: "pomelin_royal",
    name: "Pomelin Royal",
    level: 10,
    // Même modèle que le Pomelin (slime), mais bien plus gros (voir "scale").
    modelUrl: "models/monsters/pomelin/slime.glb",
    scale: 1.6,
    maxHp: 240,
    damage: 10,
    aggressive: true,
    moveSpeed: 1.8,
    attackRange: 2,
    attackIntervalSeconds: 1.3,
    aggroRadius: 7,
    respawnSeconds: 300,
    baseXp: 70,
    placeholderColor: [0.21, 0.64, 0.11],
    lootTier: "sous_boss",
  },
};
