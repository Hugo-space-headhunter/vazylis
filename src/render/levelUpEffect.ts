import { Color3, MeshBuilder, Scene, StandardMaterial, Vector3 } from "@babylonjs/core";

const DURATION_SECONDS = 1;

/**
 * Montée de niveau : un cercle lumineux au sol et une aura autour du personnage, pendant 1 seconde.
 * Voir docs/game-design.md, section "Retours visuels".
 */
export function playLevelUpEffect(scene: Scene, position: Vector3): void {
  const ring = MeshBuilder.CreateDisc("levelup-ring", { radius: 0.1, tessellation: 32 }, scene);
  ring.rotation.x = Math.PI / 2;
  ring.position = position.add(new Vector3(0, 0.05, 0));
  const ringMaterial = new StandardMaterial("levelup-ring-material", scene);
  ringMaterial.emissiveColor = new Color3(0.95, 0.84, 0.55);
  ringMaterial.alpha = 0.8;
  ring.material = ringMaterial;

  const aura = MeshBuilder.CreateSphere("levelup-aura", { diameter: 0.3, segments: 12 }, scene);
  aura.position = position.add(new Vector3(0, 1, 0));
  const auraMaterial = new StandardMaterial("levelup-aura-material", scene);
  auraMaterial.emissiveColor = new Color3(0.95, 0.84, 0.55);
  auraMaterial.alpha = 0.35;
  aura.material = auraMaterial;

  let elapsed = 0;
  const observer = scene.onBeforeRenderObservable.add(() => {
    elapsed += scene.getEngine().getDeltaTime() / 1000;
    const progress = Math.min(1, elapsed / DURATION_SECONDS);

    const ringScale = 0.3 + progress * 3;
    ring.scaling.set(ringScale, ringScale, ringScale);
    ringMaterial.alpha = 0.8 * (1 - progress);

    const auraScale = 1 + progress * 2.5;
    aura.scaling.set(auraScale, auraScale, auraScale);
    auraMaterial.alpha = 0.35 * (1 - progress);

    if (progress >= 1) {
      scene.onBeforeRenderObservable.remove(observer);
      ring.dispose();
      ringMaterial.dispose();
      aura.dispose();
      auraMaterial.dispose();
    }
  });
}
