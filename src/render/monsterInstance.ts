import { Color3, MeshBuilder, Scene, StandardMaterial, TransformNode, Vector3 } from "@babylonjs/core";
import { CHAMPION, type MonsterDefinition } from "../config/monsters";
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
  /** Vrai pour un monstre champion (1 sur 200) : plus gros, aura, bien plus de vie et d'XP. */
  isChampion: boolean;
  animator: Animator;
  root: TransformNode;
  setVisible(visible: boolean): void;
  /** Active ou retire la variante "champion" : taille et aura. */
  setChampion(isChampion: boolean): void;
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
    idle: definition.idleAnimation ?? "Idle",
    walk: definition.walkAnimation ?? "Walk",
    attack: definition.attackAnimation ?? "Attack",
    death: "Death",
  });

  // Anneau lumineux autour des pieds, visible seulement pour un monstre champion.
  const auraMaterial = new StandardMaterial(`${id}-champion-aura-material`, scene);
  auraMaterial.emissiveColor = new Color3(1, 0.55, 0.12);
  auraMaterial.alpha = 0.55;
  auraMaterial.disableLighting = true;
  const aura = MeshBuilder.CreateTorus(`${id}-champion-aura`, { diameter: 1.4, thickness: 0.07, tessellation: 20 }, scene);
  aura.material = auraMaterial;
  aura.parent = visual.root;
  aura.position.y = 0.05;
  aura.isVisible = false;

  scene.onBeforeRenderObservable.add(() => {
    if (!aura.isVisible) return;
    aura.rotation.y += scene.getEngine().getDeltaTime() / 1000;
  });

  const instance: MonsterInstance = {
    id,
    definition,
    spawnPosition: position.clone(),
    hp: definition.maxHp,
    alive: true,
    engaged: false,
    attackCooldown: 0,
    respawnCooldown: 0,
    isChampion: false,
    animator,
    root: visual.root,
    setVisible(visible: boolean) {
      visual.root.setEnabled(visible);
    },
    setChampion(isChampion: boolean) {
      instance.isChampion = isChampion;
      visual.root.scaling.setAll(isChampion ? definition.scale * CHAMPION.scaleMultiplier : definition.scale);
      aura.isVisible = isChampion;
    },
    headPosition() {
      const scale = instance.isChampion ? definition.scale * CHAMPION.scaleMultiplier : definition.scale;
      return visual.root.position.add(new Vector3(0, 1.4 * scale, 0));
    },
  };
  return instance;
}
