import type { Engine, Scene } from "@babylonjs/core";

/** Affiche les images par seconde (FPS) dans l'élément donné, mis à jour à chaque image. */
export function attachFpsCounter(engine: Engine, scene: Scene, element: HTMLElement): void {
  scene.onAfterRenderObservable.add(() => {
    element.textContent = `${Math.round(engine.getFps())} FPS`;
  });
}
