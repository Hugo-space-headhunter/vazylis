import type { AnimationGroup } from "@babylonjs/core";

/**
 * Sans ça, passer d'une animation à l'autre (repos → marche → attaque...) fait sauter le
 * personnage d'une pose à l'autre instantanément : saccadé, "robotique". Avec le fondu activé,
 * Babylon.js glisse en douceur de la pose actuelle vers les premières images de la nouvelle
 * animation, comme dans la plupart des jeux (mouvement plus humain).
 */
export function enableAnimationBlending(animations: Record<string, AnimationGroup>, blendingSpeed = 0.15): void {
  for (const group of Object.values(animations)) {
    for (const targeted of group.targetedAnimations) {
      targeted.animation.enableBlending = true;
      targeted.animation.blendingSpeed = blendingSpeed;
    }
  }
}
