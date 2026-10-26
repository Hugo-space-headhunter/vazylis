import { Scene, TransformNode, Vector3 } from "@babylonjs/core";
import type { MonsterDefinition } from "../config/monsters";
import { createAnimator, type Animator } from "./animator";
import { loadMonsterVisual } from "./monster";

export interface MonsterInstance {
  id: string;
  definition: MonsterDefinition;
  spawnPosition: Vector3;
  hp: number;
  alive: boolean;
  /** Pour les monstres passifs : devient vrai une fois qu'ils ont été attaqués, pour qu'ils ripostent. */
  engaged: boolean;
  attackCooldown: number;
  respawnCooldown: number;
  animator: Animator;
  root: TransformNode;
  setVisible(visible: boolean): void;
  headPosition(): Vector3;
}

export async function spawnMonster(
  scene: Scene,
  id: string,
  definition: MonsterDefinition,
  position: Vector3,
): Promise<MonsterInstance> {
  const visual = await loadMonsterVisual(scene, definition);
  visual.root.position.copyFrom(position);

  const animator = createAnimator(visual.animations, {
    idle: "Idle",
    walk: "Walk",
    attack: "Attack",
    death: "Death",
  });

  return {
    id,
    definition,
    spawnPosition: position.clone(),
    hp: definition.maxHp,
    alive: true,
    engaged: false,
    attackCooldown: 0,
    respawnCooldown: 0,
    animator,
    root: visual.root,
    setVisible(visible: boolean) {
      visual.root.setEnabled(visible);
    },
    headPosition() {
      return visual.root.position.add(new Vector3(0, 1.4 * definition.scale, 0));
    },
  };
}
