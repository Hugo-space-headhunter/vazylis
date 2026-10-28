import { Engine, Scene, Vector3 } from "@babylonjs/core";
import { PLAYER_COMBAT } from "../config/combat";
import {
  CHAMPION_LOOT_TABLE,
  INVENTORY_SIZE,
  SOUS_BOSS_LOOT_TABLE,
  WEAPON_FAMILIES,
  type ArmorSlotId,
  type WeaponFamilyId,
} from "../config/items";
import { CHAMPION, MONSTERS } from "../config/monsters";
import { PLAYER_MOVEMENT } from "../config/player";
import { GUARANTEED_RESOURCE_DROP, RESOURCE_DROP } from "../config/resources";
import { playerMaxHp, rollBlock, rollMonsterBlock, rollPlayerDamage, weaponAttackInterval } from "../game/combat";
import {
  addItem,
  addResource,
  createEmptyInventory,
  equipItem,
  findItem,
  recycleItem,
  unequipArmor,
  unequipWeapon,
  type InventoryItem,
  type InventoryState,
} from "../game/inventory";
import { armorItemDefense } from "../game/item";
import { generateLootItem, rollLootRarities, rollResourceDrop } from "../game/loot";
import { applyXpGain, requiredXpForLevel, xpGainForKill } from "../game/progression";
import {
  EMPTY_STATS,
  attackSpeedMultiplier,
  defense,
  applyDamageReduction,
  maxMana,
  unspentPoints,
  type PlayerStats,
} from "../game/stats";
import type { Animator } from "./animator";
import type { LoadedCharacter } from "./character";
import { playLevelUpEffect } from "./levelUpEffect";
import { spawnMonster, type MonsterInstance } from "./monsterInstance";
import { createWeaponVisual } from "./weaponAttachment";
import type { Hud } from "../ui/hud";
import type { WorldOverlay } from "../ui/worldOverlay";

export interface PlayerRuntime {
  name: string;
  level: number;
  xp: number;
  hp: number;
  maxHp: number;
  combatMode: boolean;
  /** Mode AFK : le personnage cible et combat seul, sans intervention (voir CombatController.setAfkMode). */
  afkEnabled: boolean;
  stats: PlayerStats;
  inventory: InventoryState;
}

/** Les champs du joueur qui doivent être sauvegardés (voir src/save/). */
export interface PlayerSaveState {
  level: number;
  xp: number;
  stats: PlayerStats;
  inventory: InventoryState;
}

const SPAWN_POINTS: { monsterId: keyof typeof MONSTERS; position: Vector3 }[] = [
  { monsterId: "cochonnet", position: new Vector3(3, 0, 3) },
  { monsterId: "cochonnet", position: new Vector3(-4, 0, 6) },
  { monsterId: "corbac", position: new Vector3(6, 0, -3) },
  { monsterId: "corbac", position: new Vector3(-3, 0, -6) },
  { monsterId: "pomelin", position: new Vector3(8, 0, 5) },
  { monsterId: "pomelin", position: new Vector3(-9, 0, 3) },
  { monsterId: "pomelin_royal", position: new Vector3(13, 0, -9) },
  // Le Bois des Lucioles (sous-zone 2), plus loin vers l'est.
  { monsterId: "gobelin_chapardeur", position: new Vector3(24, 0, 4) },
  { monsterId: "gobelin_chapardeur", position: new Vector3(30, 0, -3) },
  { monsterId: "ronce_gueule", position: new Vector3(27, 0, 9) },
  { monsterId: "ronce_gueule", position: new Vector3(33, 0, 2) },
  { monsterId: "gobelin_chaman", position: new Vector3(22, 0, -5) },
  { monsterId: "gobelin_chaman", position: new Vector3(35, 0, 6) },
  { monsterId: "gueule_fleur", position: new Vector3(29, 0, -8) },
  // Les Ruines du Guet (sous-zone 3), encore plus loin vers l'est.
  { monsterId: "gargouillon", position: new Vector3(52, 0, 5) },
  { monsterId: "gargouillon", position: new Vector3(58, 0, -4) },
  { monsterId: "rat_cryptes", position: new Vector3(50, 0, -2) },
  { monsterId: "rat_cryptes", position: new Vector3(55, 0, 8) },
  { monsterId: "ecuyer_creux", position: new Vector3(62, 0, 2) },
  { monsterId: "ecuyer_creux", position: new Vector3(48, 0, 7) },
  { monsterId: "gardien_sans_visage", position: new Vector3(60, 0, -8) },
];

const PLAYER_HEAD_HEIGHT = 1.7;

export interface CombatController {
  setCombatMode(combatMode: boolean): void;
  /** Pour la fenêtre de statistiques : niveau actuel, points déjà placés et points disponibles. */
  getStatsSnapshot(): { level: number; stats: PlayerStats; availablePoints: number };
  /** Ajoute les points fraîchement validés aux statistiques du joueur. */
  applyStatPoints(spent: PlayerStats): void;
  getInventory(): InventoryState;
  equip(instanceId: string): void;
  unequipWeapon(): void;
  unequipArmor(slotId: ArmorSlotId): void;
  recycle(instanceId: string): void;
  /** Prévenu à chaque changement du sac (butin, équipement, recyclage) pour rafraîchir la fenêtre si elle est ouverte. */
  onInventoryChange(callback: (inventory: InventoryState) => void): void;
  /** Prévenu à chaque changement à sauvegarder (niveau, xp, statistiques, sac). */
  onStateChange(callback: (state: PlayerSaveState) => void): void;
  /** Remplace l'état actuel du joueur par une sauvegarde chargée (niveau, xp, stats, sac). */
  restoreState(saved: PlayerSaveState): void;
  /** Active ou désactive le mode AFK : le personnage cible seul les monstres de la zone. */
  setAfkMode(enabled: boolean): void;
  /** Pour que le déplacement manuel (joystick) se taise pendant que le mode AFK pilote le personnage. */
  isAfkActive(): boolean;
}

export async function createCombatController(
  scene: Scene,
  engine: Engine,
  character: LoadedCharacter,
  animator: Animator,
  overlay: WorldOverlay,
  hud: Hud,
): Promise<CombatController> {
  const monsters: MonsterInstance[] = await Promise.all(
    SPAWN_POINTS.map(async (spawn, index) => {
      const monster = await spawnMonster(scene, `${spawn.monsterId}-${index}`, MONSTERS[spawn.monsterId], spawn.position);
      applyChampionRoll(monster);
      return monster;
    }),
  );

  const weaponVisual = createWeaponVisual(scene, character);
  let nextItemId = 1;

  const player: PlayerRuntime = {
    name: "Vazylien",
    level: 1,
    xp: 0,
    hp: playerMaxHp(1, 0),
    maxHp: playerMaxHp(1, 0),
    combatMode: false,
    afkEnabled: false,
    stats: { ...EMPTY_STATS },
    inventory: createEmptyInventory(),
  };
  let playerAttackCooldown = 0;
  let afkTargetId: string | null = null;
  let inventoryChangeCallback: ((inventory: InventoryState) => void) | null = null;
  let stateChangeCallback: ((state: PlayerSaveState) => void) | null = null;

  /** Vie, dégâts et XP effectifs d'un monstre, 5 fois plus élevés pour un champion. */
  function monsterMaxHp(monster: MonsterInstance): number {
    return monster.isChampion ? monster.definition.maxHp * CHAMPION.hpMultiplier : monster.definition.maxHp;
  }
  function monsterDamage(monster: MonsterInstance): number {
    return monster.isChampion ? monster.definition.damage * CHAMPION.damageMultiplier : monster.definition.damage;
  }
  function monsterXp(monster: MonsterInstance): number {
    return monster.isChampion ? monster.definition.baseXp * CHAMPION.xpMultiplier : monster.definition.baseXp;
  }

  /** Tire la variante "champion" (1 sur 200), sauf pour les sous-boss, et ajuste les points de vie. */
  function applyChampionRoll(monster: MonsterInstance): void {
    const isChampion = monster.definition.lootTier !== "sous_boss" && Math.random() < CHAMPION.spawnChance;
    monster.setChampion(isChampion);
    monster.hp = monsterMaxHp(monster);
  }

  function notifyInventoryChange(): void {
    inventoryChangeCallback?.(player.inventory);
    notifyStateChange();
  }

  function notifyStateChange(): void {
    stateChangeCallback?.({
      level: player.level,
      xp: player.xp,
      stats: { ...player.stats },
      inventory: player.inventory,
    });
  }

  /** Les items chargés depuis une sauvegarde ont déjà des identifiants : on évite les doublons. */
  function syncNextItemIdWithInventory(): void {
    let maxId = 0;
    const allItems = [
      ...player.inventory.items,
      player.inventory.equipment.weapon,
      ...Object.values(player.inventory.equipment.armor),
    ];
    for (const item of allItems) {
      const match = item ? /^item-(\d+)$/.exec(item.instanceId) : null;
      if (match) maxId = Math.max(maxId, Number(match[1]));
    }
    nextItemId = Math.max(nextItemId, maxId + 1);
  }

  function totalArmorDefense(): number {
    return Object.values(player.inventory.equipment.armor).reduce((sum, item) => {
      if (!item) return sum;
      return sum + armorItemDefense(item.level, item.rarity, item.quality);
    }, 0);
  }

  function refreshHud(): void {
    hud.update({
      name: player.name,
      level: player.level,
      hp: player.hp,
      maxHp: player.maxHp,
      mana: maxMana(player.stats.intelligence),
      xp: player.xp,
      xpToNextLevel: requiredXpForLevel(player.level),
    });
    notifyStateChange();
  }
  refreshHud();

  function damagePlayer(rawAmount: number, attackerLevel: number): void {
    if (player.hp <= 0) return;

    if (rollBlock(player.inventory.equipment.weapon, Math.random())) {
      overlay.showDamageNumber(character.root.position.add(new Vector3(0, PLAYER_HEAD_HEIGHT, 0)), 0, {
        onPlayer: true,
        blocked: true,
      });
      return;
    }

    const totalDefense = defense(player.stats.vitalite) + totalArmorDefense();
    const amount = Math.round(applyDamageReduction(rawAmount, totalDefense, attackerLevel));
    player.hp = Math.max(0, player.hp - amount);
    overlay.showDamageNumber(character.root.position.add(new Vector3(0, PLAYER_HEAD_HEIGHT, 0)), amount, {
      onPlayer: true,
    });
    refreshHud();
    if (player.hp <= 0) {
      respawnPlayer();
    }
  }

  function respawnPlayer(): void {
    character.root.position.set(0, 0, 0);
    player.hp = player.maxHp;
    refreshHud();
  }

  function dropLoot(monster: MonsterInstance): void {
    const isSousBoss = monster.definition.lootTier === "sous_boss";
    const lootTable = isSousBoss ? SOUS_BOSS_LOOT_TABLE : monster.isChampion ? CHAMPION_LOOT_TABLE : undefined;
    const rarities = rollLootRarities([Math.random(), Math.random(), Math.random(), Math.random()], lootTable);
    for (const rarity of rarities) {
      const generated = generateLootItem(monster.definition.level, rarity, Math.random(), Math.random(), Math.random());
      const item: InventoryItem = { ...generated, instanceId: `item-${nextItemId++}` };
      const result = addItem(player.inventory, item, INVENTORY_SIZE);
      player.inventory = result.state;
    }

    const resourceDropConfig = isSousBoss || monster.isChampion ? GUARANTEED_RESOURCE_DROP : RESOURCE_DROP;
    const resourceDrop = rollResourceDrop(Math.random(), Math.random(), Math.random(), resourceDropConfig);
    if (resourceDrop) {
      player.inventory = addResource(player.inventory, resourceDrop.id, resourceDrop.quantity);
    }

    if (rarities.length > 0 || resourceDrop) {
      notifyInventoryChange();
    }
  }

  function killMonster(monster: MonsterInstance): void {
    monster.alive = false;
    monster.engaged = false;
    overlay.removeMonsterBar(monster.id);
    monster.animator.playDeath();
    monster.setVisible(false);
    monster.respawnCooldown = monster.definition.respawnSeconds;

    dropLoot(monster);

    const xpGained = xpGainForKill(monsterXp(monster), monster.definition.level, player.level);
    const result = applyXpGain({ level: player.level, xp: player.xp }, xpGained);
    player.level = result.level;
    player.xp = result.xp;
    if (result.leveledUp) {
      player.maxHp = playerMaxHp(player.level, player.stats.vitalite);
      player.hp = player.maxHp;
      playLevelUpEffect(scene, character.root.position.clone());
    }
    refreshHud();
  }

  function respawnMonster(monster: MonsterInstance): void {
    applyChampionRoll(monster);
    monster.alive = true;
    monster.root.position.copyFrom(monster.spawnPosition);
    monster.setVisible(true);
    monster.animator.setMoving(false);
  }

  function playerAttack(target: MonsterInstance): void {
    target.engaged = true;
    if (rollMonsterBlock(target.definition.blockChance ?? 0, Math.random())) {
      overlay.showDamageNumber(target.headPosition(), 0, { blocked: true });
      return;
    }

    const roll = rollPlayerDamage(player.stats, player.inventory.equipment.weapon, Math.random());
    target.hp -= roll.amount;
    overlay.showDamageNumber(target.headPosition(), roll.amount, { critical: roll.isCritical });
    if (target.hp <= 0) {
      killMonster(target);
    } else {
      overlay.updateMonsterBar(target.id, target.headPosition(), target.hp / monsterMaxHp(target));
    }
  }

  function monsterAttack(monster: MonsterInstance): void {
    monster.animator.playAttack();
    damagePlayer(monsterDamage(monster), monster.definition.level);
  }

  function findNearestTargetInRange(): MonsterInstance | null {
    let nearest: MonsterInstance | null = null;
    let nearestDistance = PLAYER_COMBAT.attackRange;
    for (const monster of monsters) {
      if (!monster.alive) continue;
      const distance = Vector3.Distance(character.root.position, monster.root.position);
      if (distance <= nearestDistance) {
        nearest = monster;
        nearestDistance = distance;
      }
    }
    return nearest;
  }

  /** Pour le mode AFK : le monstre vivant le plus proche, sans limite de distance. */
  function findNearestAliveMonster(fromPosition: Vector3): MonsterInstance | null {
    let nearest: MonsterInstance | null = null;
    let nearestDistance = Infinity;
    for (const monster of monsters) {
      if (!monster.alive) continue;
      const distance = Vector3.Distance(fromPosition, monster.root.position);
      if (distance < nearestDistance) {
        nearest = monster;
        nearestDistance = distance;
      }
    }
    return nearest;
  }

  /** Mode AFK : le personnage marche seul vers le monstre le plus proche et l'attaque une fois à portée. */
  function tickAfk(deltaSeconds: number): void {
    if (!player.afkEnabled || player.hp <= 0) return;

    let target = afkTargetId ? monsters.find((m) => m.id === afkTargetId && m.alive) : undefined;
    if (!target) {
      target = findNearestAliveMonster(character.root.position) ?? undefined;
      afkTargetId = target?.id ?? null;
    }
    if (!target) return;

    const distance = Vector3.Distance(character.root.position, target.root.position);
    if (distance > PLAYER_COMBAT.attackRange) {
      const direction = target.root.position.subtract(character.root.position);
      direction.y = 0;
      direction.normalize();
      character.root.position.addInPlace(direction.scale(PLAYER_MOVEMENT.speed * deltaSeconds));
      // +PI car le modèle importé fait face à +Z quand sa rotation vaut 180°, pas 0°.
      character.root.rotation.y = Math.atan2(direction.x, direction.z) + Math.PI;
      animator.setMoving(true);
    } else {
      animator.setMoving(false);
    }
  }

  function moveToward(monster: MonsterInstance, targetPosition: Vector3, deltaSeconds: number): void {
    const direction = targetPosition.subtract(monster.root.position);
    direction.y = 0;
    direction.normalize();
    monster.root.position.addInPlace(direction.scale(monster.definition.moveSpeed * deltaSeconds));
    // +PI car les modèles importés font face à +Z quand leur rotation vaut 180°, pas 0° (voir transformUtils.ts).
    monster.root.rotation.y = Math.atan2(direction.x, direction.z) + Math.PI;
  }

  function tickMonster(monster: MonsterInstance, deltaSeconds: number): void {
    if (!monster.alive) {
      monster.respawnCooldown -= deltaSeconds;
      if (monster.respawnCooldown <= 0) {
        respawnMonster(monster);
      }
      return;
    }

    monster.attackCooldown -= deltaSeconds;
    const distanceToPlayer = Vector3.Distance(monster.root.position, character.root.position);

    if (monster.definition.aggressive) {
      if (distanceToPlayer <= monster.definition.aggroRadius) {
        if (distanceToPlayer > monster.definition.attackRange) {
          moveToward(monster, character.root.position, deltaSeconds);
          monster.animator.setMoving(true);
          return;
        }
        monster.animator.setMoving(false);
        if (monster.attackCooldown <= 0) {
          monsterAttack(monster);
          monster.attackCooldown = monster.definition.attackIntervalSeconds;
        }
        return;
      }
      monster.animator.setMoving(false);
      return;
    }

    if (monster.engaged && distanceToPlayer <= monster.definition.attackRange) {
      monster.animator.setMoving(false);
      if (monster.attackCooldown <= 0) {
        monsterAttack(monster);
        monster.attackCooldown = monster.definition.attackIntervalSeconds;
      }
      return;
    }
    monster.animator.setMoving(false);
  }

  scene.onBeforeRenderObservable.add(() => {
    const deltaSeconds = engine.getDeltaTime() / 1000;

    for (const monster of monsters) {
      tickMonster(monster, deltaSeconds);
      if (monster.alive && monster.hp < monsterMaxHp(monster)) {
        overlay.updateMonsterBar(monster.id, monster.headPosition(), monster.hp / monsterMaxHp(monster));
      }
    }

    tickAfk(deltaSeconds);

    if ((player.combatMode || player.afkEnabled) && player.hp > 0) {
      playerAttackCooldown -= deltaSeconds;
      if (playerAttackCooldown <= 0) {
        const target = findNearestTargetInRange();
        if (target) {
          const equippedWeapon = player.inventory.equipment.weapon;
          const attackAnimation = equippedWeapon
            ? WEAPON_FAMILIES[equippedWeapon.familyId as WeaponFamilyId].attackAnimation
            : undefined;
          animator.playAttack(undefined, attackAnimation);
          playerAttack(target);
          const baseInterval = weaponAttackInterval(player.inventory.equipment.weapon, PLAYER_COMBAT.attackIntervalSeconds);
          const speedMultiplier = attackSpeedMultiplier(player.stats.agilite);
          playerAttackCooldown = baseInterval / speedMultiplier;
        }
      }
    }
  });

  return {
    setCombatMode(combatMode: boolean) {
      player.combatMode = combatMode;
    },
    getStatsSnapshot() {
      return {
        level: player.level,
        stats: { ...player.stats },
        availablePoints: unspentPoints(player.level, player.stats),
      };
    },
    applyStatPoints(spent: PlayerStats) {
      player.stats.force += spent.force;
      player.stats.agilite += spent.agilite;
      player.stats.vitalite += spent.vitalite;
      player.stats.intelligence += spent.intelligence;
      player.maxHp = playerMaxHp(player.level, player.stats.vitalite);
      refreshHud();
    },
    getInventory() {
      return player.inventory;
    },
    equip(instanceId: string) {
      const item = findItem(player.inventory, instanceId);
      if (!item) return;
      player.inventory = equipItem(player.inventory, instanceId);
      if (item.kind === "weapon") {
        void weaponVisual.setWeapon(item.familyId as WeaponFamilyId);
      }
      refreshHud();
      notifyInventoryChange();
    },
    unequipWeapon() {
      player.inventory = unequipWeapon(player.inventory, INVENTORY_SIZE);
      void weaponVisual.setWeapon(null);
      refreshHud();
      notifyInventoryChange();
    },
    unequipArmor(slotId: ArmorSlotId) {
      player.inventory = unequipArmor(player.inventory, slotId, INVENTORY_SIZE);
      refreshHud();
      notifyInventoryChange();
    },
    recycle(instanceId: string) {
      player.inventory = recycleItem(player.inventory, instanceId);
      notifyInventoryChange();
    },
    onInventoryChange(callback) {
      inventoryChangeCallback = callback;
    },
    onStateChange(callback) {
      stateChangeCallback = callback;
    },
    restoreState(saved: PlayerSaveState) {
      player.level = saved.level;
      player.xp = saved.xp;
      player.stats = { ...saved.stats };
      // "resources" peut manquer sur une sauvegarde faite avant l'étape 6 : on complète sans casser.
      player.inventory = { ...saved.inventory, resources: saved.inventory.resources ?? {} };
      player.maxHp = playerMaxHp(player.level, player.stats.vitalite);
      player.hp = player.maxHp;
      syncNextItemIdWithInventory();
      if (player.inventory.equipment.weapon) {
        void weaponVisual.setWeapon(player.inventory.equipment.weapon.familyId as WeaponFamilyId);
      }
      refreshHud();
      notifyInventoryChange();
    },
    setAfkMode(enabled: boolean) {
      player.afkEnabled = enabled;
      if (!enabled) {
        afkTargetId = null;
      }
    },
    isAfkActive() {
      return player.afkEnabled;
    },
  };
}
