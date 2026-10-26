import {
  AnimationGroup,
  Color3,
  MeshBuilder,
  Scene,
  SceneLoader,
  StandardMaterial,
  TransformNode,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import type { MonsterDefinition } from "../config/monsters";
import { makeRotatable } from "./transformUtils";

export interface MonsterVisual {
  root: TransformNode;
  /** Vide pour les formes provisoires (pas d'animation). */
  animations: Record<string, AnimationGroup>;
}

/** Charge l'apparence d'un monstre : un vrai modèle animé s'il y en a un, sinon une forme simple. */
export async function loadMonsterVisual(scene: Scene, definition: MonsterDefinition): Promise<MonsterVisual> {
  if (definition.modelUrl) {
    return loadMonsterModel(scene, definition);
  }
  return { root: createPlaceholderMonster(scene, definition), animations: {} };
}

async function loadMonsterModel(scene: Scene, definition: MonsterDefinition): Promise<MonsterVisual> {
  const modelUrl = definition.modelUrl as string;
  const lastSlash = modelUrl.lastIndexOf("/");
  const folder = modelUrl.slice(0, lastSlash + 1);
  const file = modelUrl.slice(lastSlash + 1);

  const result = await SceneLoader.ImportMeshAsync("", `${import.meta.env.BASE_URL}${folder}`, file, scene);
  const root = result.meshes[0];
  makeRotatable(root);
  root.scaling.setAll(definition.scale);

  const animations: Record<string, AnimationGroup> = {};
  for (const group of result.animationGroups) {
    group.stop();
    // Les noms exportés ressemblent à "Armature|Slime_Attack" : on ne garde que "Attack".
    const shortName = group.name.split("_").pop() ?? group.name;
    animations[shortName] = group;
  }

  return { root, animations };
}

/** Forme provisoire simple (corps + tête), en attendant un modèle CC0 adapté. Voir ASSETS.md. */
function createPlaceholderMonster(scene: Scene, definition: MonsterDefinition): TransformNode {
  const root = new TransformNode(`${definition.id}-root`, scene);

  const material = new StandardMaterial(`${definition.id}-material`, scene);
  material.diffuseColor = new Color3(...definition.placeholderColor);

  const body = MeshBuilder.CreateSphere(`${definition.id}-body`, { diameter: 1, segments: 8 }, scene);
  body.scaling.set(1, 0.75, 1.2);
  body.position.y = 0.4 * definition.scale;
  body.material = material;
  body.parent = root;

  const head = MeshBuilder.CreateSphere(`${definition.id}-head`, { diameter: 0.55, segments: 8 }, scene);
  head.position.set(0, 0.55 * definition.scale, 0.55 * definition.scale);
  head.material = material;
  head.parent = root;

  root.scaling.setAll(definition.scale);
  return root;
}
