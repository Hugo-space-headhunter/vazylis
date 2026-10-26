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

export interface GameScene {
  engine: Engine;
  scene: Scene;
}

/**
 * Scène 3D de test pour l'étape 0 : un sol, une lumière, un objet provisoire qui tourne.
 * Le modèle 3D définitif (Quaternius/KayKit) viendra à l'étape 1 ; voir ASSETS.md.
 */
export function createScene(canvas: HTMLCanvasElement): GameScene {
  const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.08, 0.05, 0.12, 1);

  const camera = new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 3, 10, Vector3.Zero(), scene);
  camera.attachControl(canvas, true);
  camera.lowerRadiusLimit = 4;
  camera.upperRadiusLimit = 20;

  const light = new HemisphericLight("light", new Vector3(0, 1, 0.3), scene);
  light.intensity = 0.9;

  const ground = MeshBuilder.CreateGround("ground", { width: 20, height: 20 }, scene);
  const groundMaterial = new StandardMaterial("groundMaterial", scene);
  groundMaterial.diffuseColor = new Color3(0.2, 0.17, 0.25);
  ground.material = groundMaterial;

  const placeholder = MeshBuilder.CreateBox("placeholder", { size: 1.4 }, scene);
  placeholder.position.y = 0.7;
  const placeholderMaterial = new StandardMaterial("placeholderMaterial", scene);
  placeholderMaterial.diffuseColor = new Color3(0.95, 0.84, 0.55);
  placeholder.material = placeholderMaterial;

  scene.onBeforeRenderObservable.add(() => {
    const deltaSeconds = engine.getDeltaTime() / 1000;
    placeholder.rotation.y += deltaSeconds;
  });

  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener("resize", () => {
    engine.resize();
  });

  return { engine, scene };
}
