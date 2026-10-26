import { Engine, Scene, Vector3 } from "@babylonjs/core";
import { PLAYER_COMBAT } from "../config/combat";
import { MONSTERS } from "../config/monsters";
import { playerMaxHp, rollPlayerDamage } from "../game/combat";
import { applyXpGain, requiredXpForLevel, xpGainForKill } from "../game/progression";
import type { Animator } from "./animator";
import type { LoadedCharacter } from "./character";
import { playLevelUpEffect } from "./levelUpEffect";
import { spawnMonster, type MonsterInstance } from "./monsterInstance";
import type { Hud } from "../ui/hud";
import type { WorldOverlay } from "../ui/worldOverlay";

export interface PlayerRuntime {
  name: string;
  level: number;
  xp: number;
  hp: number;
  maxHp: number;
  combatMode: boolean;
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

  const player: PlayerRuntime = {
    name: "Vazylien",
    level: 1,
    xp: 0,
    hp: playerMaxHp(1),
    maxHp: playerMaxHp(1),
    combatMode: false,
  };
  let playerAttackCooldown = 0;

  function refreshHud(): void {
    hud.update({
      name: player.name,
      level: player.level,
      hp: player.hp,
      maxHp: player.maxHp,
      xp: player.xp,
      xpToNextLevel: requiredXpForLevel(player.level),
    });
  }
  refreshHud();

  function damagePlayer(amount: number): void {
    if (player.hp <= 0) return;
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

  function killMonster(monster: MonsterInstance): void {
    monster.alive = false;
    monster.engaged = false;
    overlay.removeMonsterBar(monster.id);
    monster.animator.playDeath();
    monster.setVisible(false);
    monster.respawnCooldown = monster.definition.respawnSeconds;

    const xpGained = xpGainForKill(monster.definition.baseXp, monster.definition.level, player.level);
    const result = applyXpGain({ level: player.level, xp: player.xp }, xpGained);
    player.level = result.level;
    player.xp = result.xp;
    if (result.leveledUp) {
      player.maxHp = playerMaxHp(player.level);
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
    const roll = rollPlayerDamage(player.level, Math.random());
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
    damagePlayer(monster.definition.damage);
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
          playerAttackCooldown = PLAYER_COMBAT.attackIntervalSeconds;
        }
      }
    }
  });

  return {
    setCombatMode(combatMode: boolean) {
      player.combatMode = combatMode;
    },
  };
}
