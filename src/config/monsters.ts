// Monstres des trois premières sous-zones (Les Prés de Vazylis 1-10, Le Bois des
// Lucioles 11-20, Les Ruines du Guet 21-30). Voir docs/game-design.md, section
// "Zone 1 — La Vallée claire". Valeurs de départ, à régler en jouant.

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
  /** Nom de l'animation d'attaque dans le modèle (certains packs n'utilisent pas "Attack"). Par défaut "Attack". */
  attackAnimation?: string;
  /** Nom de l'animation de repos (certains packs n'ont pas de vraie boucle "Idle"). Par défaut "Idle". */
  idleAnimation?: string;
  /** Nom de l'animation de marche (certains packs l'appellent autrement, ex. "Running"). Par défaut "Walk". */
  walkAnimation?: string;
  /** Chance de bloquer entièrement un coup du joueur (statue, armure...). Par défaut 0. */
  blockChance?: number;
  /** Remplace la couleur du modèle par une teinte unie (ex. un modèle réutilisé comme substitut). */
  tintColor?: [number, number, number];
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
  gobelin_chapardeur: {
    id: "gobelin_chapardeur",
    name: "Gobelin chapardeur",
    level: 12,
    modelUrl: "models/monsters/gobelin_chapardeur/monkroose.gltf",
    scale: 0.75,
    maxHp: 70,
    damage: 8,
    aggressive: true,
    moveSpeed: 3,
    attackRange: 1.6,
    attackIntervalSeconds: 0.9,
    aggroRadius: 7,
    respawnSeconds: 13,
    baseXp: 18,
    placeholderColor: [0.3, 0.55, 0.2],
    attackAnimation: "Punch",
  },
  ronce_gueule: {
    id: "ronce_gueule",
    name: "Ronce-gueule",
    level: 14,
    modelUrl: "models/monsters/ronce_gueule/mushnub.gltf",
    scale: 0.9,
    maxHp: 90,
    damage: 9,
    // Immobile : ne riposte (et ne frappe) que si le joueur reste à portée, ne poursuit jamais.
    aggressive: false,
    moveSpeed: 0,
    attackRange: 2.2,
    attackIntervalSeconds: 1.6,
    aggroRadius: 0,
    respawnSeconds: 16,
    baseXp: 20,
    placeholderColor: [0.55, 0.15, 0.45],
    attackAnimation: "Bite_Front",
  },
  gobelin_chaman: {
    id: "gobelin_chaman",
    name: "Gobelin chaman",
    level: 16,
    modelUrl: "models/monsters/gobelin_chaman/tribal.gltf",
    scale: 0.85,
    maxHp: 75,
    damage: 7,
    aggressive: true,
    moveSpeed: 2,
    // Grande portée pour simuler son attaque à distance (pas encore de vrais projectiles).
    attackRange: 4.5,
    attackIntervalSeconds: 1.5,
    aggroRadius: 8,
    respawnSeconds: 14,
    baseXp: 24,
    placeholderColor: [0.5, 0.3, 0.15],
    attackAnimation: "Punch",
  },
  gueule_fleur: {
    id: "gueule_fleur",
    name: "Gueule-Fleur",
    level: 20,
    // Même modèle que la Ronce-gueule (Mushnub), en version adulte ("Evolved").
    modelUrl: "models/monsters/ronce_gueule/mushnub_evolved.gltf",
    scale: 1.3,
    maxHp: 420,
    damage: 16,
    aggressive: false,
    moveSpeed: 0,
    attackRange: 2.5,
    attackIntervalSeconds: 1.4,
    aggroRadius: 0,
    respawnSeconds: 300,
    baseXp: 130,
    placeholderColor: [0.55, 0.15, 0.45],
    attackAnimation: "Bite_Front",
    lootTier: "sous_boss",
  },
  gargouillon: {
    id: "gargouillon",
    name: "Gargouillon",
    level: 22,
    modelUrl: "models/monsters/gargouillon/dragon.glb",
    scale: 0.6,
    maxHp: 140,
    damage: 11,
    aggressive: true,
    // "Ailes trop courtes" : ne vole pas vite, et "très résistant, frappe lentement".
    moveSpeed: 1.5,
    attackRange: 1.8,
    attackIntervalSeconds: 1.8,
    aggroRadius: 6,
    respawnSeconds: 14,
    baseXp: 26,
    placeholderColor: [0.45, 0.45, 0.48],
    // Ce modèle n'a pas de vraie boucle de repos, juste un vol sur place.
    idleAnimation: "Flying",
    walkAnimation: "Flying",
    // Les couleurs d'origine du modèle sont presque noires (pensées pour un rendu PBR avec
    // reflets, qu'on n'a pas) : on les remplace par un gris pierre, plus adapté à une gargouille.
    tintColor: [0.55, 0.55, 0.58],
  },
  rat_cryptes: {
    id: "rat_cryptes",
    name: "Rat des cryptes",
    level: 24,
    modelUrl: "models/monsters/rat_cryptes/dog.gltf",
    scale: 0.7,
    maxHp: 55,
    damage: 6,
    // "Attaque en groupe" : rapide, respawn court, pour une sensation de meute.
    aggressive: true,
    moveSpeed: 3.3,
    attackRange: 1.5,
    attackIntervalSeconds: 0.8,
    aggroRadius: 8,
    respawnSeconds: 11,
    baseXp: 20,
    placeholderColor: [0.3, 0.25, 0.28],
    attackAnimation: "Bite_Front",
  },
  ecuyer_creux: {
    id: "ecuyer_creux",
    name: "Écuyer creux",
    level: 26,
    modelUrl: "models/monsters/ecuyer_creux/skeleton.glb",
    scale: 1,
    maxHp: 110,
    damage: 10,
    aggressive: true,
    moveSpeed: 2.2,
    attackRange: 1.8,
    attackIntervalSeconds: 1.2,
    aggroRadius: 7,
    respawnSeconds: 15,
    baseXp: 30,
    placeholderColor: [0.5, 0.48, 0.45],
    walkAnimation: "Running",
    // "Pare parfois les coups".
    blockChance: 0.25,
  },
  gardien_sans_visage: {
    id: "gardien_sans_visage",
    name: "le Gardien sans visage",
    level: 30,
    // Même modèle que l'Écuyer creux, en plus grand (voir "scale").
    modelUrl: "models/monsters/ecuyer_creux/skeleton.glb",
    scale: 1.5,
    maxHp: 480,
    damage: 18,
    // "Statue... qui s'éveille" : immobile tant qu'on ne l'attaque pas, comme Gueule-Fleur.
    aggressive: false,
    moveSpeed: 0,
    attackRange: 2.3,
    attackIntervalSeconds: 1.5,
    aggroRadius: 0,
    respawnSeconds: 300,
    baseXp: 150,
    placeholderColor: [0.5, 0.48, 0.45],
    walkAnimation: "Running",
    // "Bloque de face" : chance de blocage plus élevée que l'Écuyer creux.
    blockChance: 0.35,
    lootTier: "sous_boss",
  },
};
