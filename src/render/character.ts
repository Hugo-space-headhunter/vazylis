import { AbstractMesh, AnimationGroup, Scene, SceneLoader, Skeleton } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

export type CharacterGender = "male" | "female";

export interface LoadedCharacter {
  root: AbstractMesh;
  skeleton: Skeleton | null;
  animations: Record<string, AnimationGroup>;
}

const CHARACTER_FILES: Record<CharacterGender, { folder: string; file: string }> = {
  male: { folder: "male", file: "Superhero_Male_FullBody.gltf" },
  female: { folder: "female", file: "Superhero_Female_FullBody.gltf" },
};

/**
 * Charge le personnage Quaternius (homme ou femme) puis lui applique les animations
 * de déplacement de la bibliothèque d'animations partagée (voir ASSETS.md).
 */
export async function loadCharacter(scene: Scene, gender: CharacterGender): Promise<LoadedCharacter> {
  const { folder, file } = CHARACTER_FILES[gender];
  const characterUrl = `${import.meta.env.BASE_URL}models/characters/${folder}/`;

  const result = await SceneLoader.ImportMeshAsync("", characterUrl, file, scene);
  const root = result.meshes[0];
  const skeleton = result.skeletons[0] ?? null;

  await SceneLoader.ImportAnimationsAsync(
    `${import.meta.env.BASE_URL}models/animations/`,
    "locomotion.glb",
    scene,
    false,
  );

  const animations: Record<string, AnimationGroup> = {};
  for (const group of scene.animationGroups) {
    group.stop();
    animations[group.name] = group;
  }

  return { root, skeleton, animations };
}
