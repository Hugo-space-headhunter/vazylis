import { AbstractMesh, Scene, SceneLoader } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { WEAPON_FAMILIES, type WeaponFamily, type WeaponFamilyId } from "../config/items";
import type { LoadedCharacter } from "./character";
import { makeRotatable } from "./transformUtils";

export interface WeaponVisual {
  setWeapon(familyId: WeaponFamilyId | null): Promise<void>;
}

const HAND_BONE_NAME = "hand_r";
const degToRad = (degrees: number) => (degrees * Math.PI) / 180;

/** Charge l'arme équipée et l'attache à la main droite du personnage. */
export function createWeaponVisual(scene: Scene, character: LoadedCharacter): WeaponVisual {
  let currentRoot: AbstractMesh | null = null;
  let requestId = 0;

  function clear(): void {
    currentRoot?.dispose();
    currentRoot = null;
  }

  async function attach(family: WeaponFamily, myRequestId: number): Promise<void> {
    if (!family.modelUrl || !character.skeleton) return;
    const lastSlash = family.modelUrl.lastIndexOf("/");
    const folder = family.modelUrl.slice(0, lastSlash + 1);
    const file = family.modelUrl.slice(lastSlash + 1);

    const result = await SceneLoader.ImportMeshAsync("", `${import.meta.env.BASE_URL}${folder}`, file, scene);
    const root = result.meshes[0];

    // Une autre arme a été équipée entre-temps : on jette ce qu'on vient de charger.
    if (myRequestId !== requestId) {
      root.dispose();
      return;
    }

    makeRotatable(root);
    const bone = character.skeleton.bones.find((b) => b.name === HAND_BONE_NAME);
    if (!bone) {
      root.dispose();
      return;
    }

    root.attachToBone(bone, character.root);
    root.position.set(family.gripPosition.x, family.gripPosition.y, family.gripPosition.z);
    root.rotation.set(
      degToRad(family.gripRotationDeg.x),
      degToRad(family.gripRotationDeg.y),
      degToRad(family.gripRotationDeg.z),
    );
    root.scaling.setAll(family.gripScale);
    currentRoot = root;
  }

  return {
    async setWeapon(familyId) {
      requestId += 1;
      const myRequestId = requestId;
      clear();
      if (!familyId) return;
      await attach(WEAPON_FAMILIES[familyId], myRequestId);
    },
  };
}
