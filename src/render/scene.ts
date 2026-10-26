import {
  ArcRotateCamera,
  Color3,
  Color4,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";
import { ORBIT_CAMERA } from "../config/player";

export interface GameScene {
  engine: Engine;
  scene: Scene;
  camera: ArcRotateCamera;
}

/**
 * Scène de base : sol, lumière, quelques repères visuels, caméra qui suivra le personnage.
 * Le personnage lui-même est chargé à part (voir render/character.ts), une fois le choix fait.
 *
 * On utilise une ArcRotateCamera (et non une FollowCamera) volontairement : une FollowCamera
 * recalcule sa position à partir de la rotation du personnage, donc quand le personnage tourne,
 * la caméra tourne avec lui et on ne voit jamais la rotation à l'écran. Une ArcRotateCamera ne
 * suit que la position du personnage (via lockedTarget), jamais sa rotation.
 */
export function createScene(canvas: HTMLCanvasElement): GameScene {
  const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.08, 0.05, 0.12, 1);

  const light = new HemisphericLight("light", new Vector3(0, 1, 0.3), scene);
  light.intensity = 0.9;

  const ground = MeshBuilder.CreateGround("ground", { width: 40, height: 40 }, scene);
  const groundMaterial = new StandardMaterial("groundMaterial", scene);
  groundMaterial.diffuseColor = new Color3(0.2, 0.17, 0.25);
  ground.material = groundMaterial;

  addLandmarks(scene);

  const camera = new ArcRotateCamera(
    "camera",
    ORBIT_CAMERA.alpha,
    ORBIT_CAMERA.beta,
    ORBIT_CAMERA.radius,
    Vector3.Zero(),
    scene,
  );
  camera.lowerBetaLimit = ORBIT_CAMERA.minBeta;
  camera.upperBetaLimit = ORBIT_CAMERA.maxBeta;
  scene.activeCamera = camera;

  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener("resize", () => {
    engine.resize();
  });

  return { engine, scene, camera };
}

/** Quelques formes simples pour se repérer sur le terrain de test (provisoire, voir ASSETS.md). */
function addLandmarks(scene: Scene): void {
  const material = new StandardMaterial("landmarkMaterial", scene);
  material.diffuseColor = new Color3(0.4, 0.32, 0.5);

  const positions: [number, number][] = [
    [5, 5],
    [-6, 4],
    [4, -7],
    [-8, -5],
    [10, -2],
  ];

  for (const [x, z] of positions) {
    const box = MeshBuilder.CreateBox(`landmark-${x}-${z}`, { size: 1.2 }, scene);
    box.position.set(x, 0.6, z);
    box.material = material;
  }
}
