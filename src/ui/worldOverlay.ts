import { Camera, Matrix, Scene, Vector3 } from "@babylonjs/core";

export interface WorldOverlay {
  updateMonsterBar(id: string, worldPosition: Vector3, hpRatio: number): void;
  removeMonsterBar(id: string): void;
  showDamageNumber(
    worldPosition: Vector3,
    amount: number,
    options?: { critical?: boolean; onPlayer?: boolean; blocked?: boolean },
  ): void;
}

interface Projected {
  x: number;
  y: number;
  onScreen: boolean;
}

function project(scene: Scene, camera: Camera, canvas: HTMLCanvasElement, worldPosition: Vector3): Projected {
  const viewport = camera.viewport.toGlobal(canvas.clientWidth, canvas.clientHeight);
  const coords = Vector3.Project(worldPosition, Matrix.Identity(), scene.getTransformMatrix(), viewport);
  return { x: coords.x, y: coords.y, onScreen: coords.z > 0 && coords.z < 1 };
}

/**
 * Affiche par-dessus la scène 3D les barres de vie des monstres et les chiffres de dégâts,
 * positionnés en suivant leur cible dans le monde.
 */
export function createWorldOverlay(
  scene: Scene,
  camera: Camera,
  canvas: HTMLCanvasElement,
  container: HTMLElement,
): WorldOverlay {
  const bars = new Map<string, { root: HTMLDivElement; fill: HTMLDivElement }>();

  function getOrCreateBar(id: string) {
    let bar = bars.get(id);
    if (!bar) {
      const root = document.createElement("div");
      root.className = "monster-bar";
      const fill = document.createElement("div");
      fill.className = "monster-bar-fill";
      root.appendChild(fill);
      container.appendChild(root);
      bar = { root, fill };
      bars.set(id, bar);
    }
    return bar;
  }

  return {
    updateMonsterBar(id, worldPosition, hpRatio) {
      const bar = getOrCreateBar(id);
      const { x, y, onScreen } = project(scene, camera, canvas, worldPosition);
      bar.root.style.display = onScreen ? "block" : "none";
      bar.root.style.left = `${x}px`;
      bar.root.style.top = `${y}px`;
      bar.fill.style.width = `${Math.max(0, Math.min(1, hpRatio)) * 100}%`;
    },
    removeMonsterBar(id) {
      const bar = bars.get(id);
      if (bar) {
        bar.root.remove();
        bars.delete(id);
      }
    },
    showDamageNumber(worldPosition, amount, options) {
      const { x, y, onScreen } = project(scene, camera, canvas, worldPosition);
      if (!onScreen) return;

      const el = document.createElement("div");
      el.className = "damage-number";
      if (options?.critical) el.classList.add("critical");
      if (options?.onPlayer) el.classList.add("on-player");
      if (options?.blocked) el.classList.add("blocked");
      el.textContent = options?.blocked ? "Bloqué !" : `-${Math.round(amount)}`;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      container.appendChild(el);

      requestAnimationFrame(() => el.classList.add("rising"));
      setTimeout(() => el.remove(), 800);
    },
  };
}
