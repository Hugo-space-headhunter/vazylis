import { Engine, Scene, Vector3 } from "@babylonjs/core";
import { PLAYER_COMBAT } from "../config/combat";
import { INVENTORY_SIZE, type ArmorSlotId, type WeaponFamilyId } from "../config/items";
import { MONSTERS } from "../config/monsters";
import { playerMaxHp, rollBlock, rollPlayerDamage, weaponAttackInterval } from "../game/combat";
import {
  addItem,
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
import { generateLootItem, rollLootRarities } from "../game/loot";
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
    SPAWN_POINTS.map((spawn, index) =>
      spawnMonster(scene, `${spawn.monsterId}-${index}`, MONSTERS[spawn.monsterId], spawn.position),
    ),
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
    stats: { ...EMPTY_STATS },
    inventory: createEmptyInventory(),
  };
  let playerAttackCooldown = 0;
  let inventoryChangeCallback: ((inventory: InventoryState) => void) | null = null;

  function notifyInventoryChange(): void {
    inventoryChangeCallback?.(player.inventory);
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

  function dropLoot(monsterLevel: number): void {
    const rarities = rollLootRarities([Math.random(), Math.random(), Math.random(), Math.random()]);
    for (const rarity of rarities) {
      const generated = generateLootItem(monsterLevel, rarity, Math.random(), Math.random(), Math.random());
      const item: InventoryItem = { ...generated, instanceId: `item-${nextItemId++}` };
      const result = addItem(player.inventory, item, INVENTORY_SIZE);
      player.inventory = result.state;
    }
    if (rarities.length > 0) {
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

    dropLoot(monster.definition.level);

    const xpGained = xpGainForKill(monster.definition.baseXp, monster.definition.level, player.level);
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
    monster.hp = monster.definition.maxHp;
    monster.alive = true;
    monster.root.position.copyFrom(monster.spawnPosition);
    monster.setVisible(true);
    monster.animator.setMoving(false);
  }

  function playerAttack(target: MonsterInstance): void {
    const roll = rollPlayerDamage(player.stats, player.inventory.equipment.weapon, Math.random());
    target.hp -= roll.amount;
    target.engaged = true;
    overlay.showDamageNumber(target.headPosition(), roll.amount, { critical: roll.isCritical });
    if (target.hp <= 0) {
      killMonster(target);
    } else {
      overlay.updateMonsterBar(target.id, target.headPosition(), target.hp / target.definition.maxHp);
    }
  }

  function monsterAttack(monster: MonsterInstance): void {
    monster.animator.playAttack();
    damagePlayer(monster.definition.damage, monster.definition.level);
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
      if (monster.alive && monster.hp < monster.definition.maxHp) {
        overlay.updateMonsterBar(monster.id, monster.headPosition(), monster.hp / monster.definition.maxHp);
      }
    }

    if (player.combatMode && player.hp > 0) {
      playerAttackCooldown -= deltaSeconds;
      if (playerAttackCooldown <= 0) {
        const target = findNearestTargetInRange();
        if (target) {
          animator.playAttack();
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
  };
}
