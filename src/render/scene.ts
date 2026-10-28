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
  // Évite qu'un matériau PBR oublié (voir materialUtils.ts) ne tombe complètement au noir
  // faute de lumière ambiante (par défaut, Babylon.js met cette couleur à noir).
  scene.ambientColor = new Color3(0.3, 0.3, 0.3);

  const light = new HemisphericLight("light", new Vector3(0, 1, 0.3), scene);
  light.intensity = 0.9;
  // Un peu de lumière "par en dessous" pour adoucir les faces à l'ombre (sinon elles
  // tombent au noir complet, et les modèles ressemblent à de simples silhouettes).
  light.groundColor = new Color3(0.25, 0.22, 0.3);

  // Assez grand pour couvrir Les Prés de Vazylis ET Le Bois des Lucioles (jusqu'à x=35),
  // sinon le personnage marche dans le vide une fois sorti de la première sous-zone.
  const ground = MeshBuilder.CreateGround("ground", { width: 90, height: 40 }, scene);
  ground.position.x = 15;
  const groundMaterial = new StandardMaterial("groundMaterial", scene);
  groundMaterial.diffuseColor = new Color3(0.2, 0.17, 0.25);
  ground.material = groundMaterial;

  addLandmarks(scene);
  addVazylisLandmark(scene);
  addBoisDesLucioles(scene);

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

/**
 * Repère provisoire pour Vazylis, le point de départ et de retour à la mort (voir
 * game-design.md, "Économie et mort"). Un simple puits de pierre, en attendant un vrai
 * décor de village (étape 6, découpage en plusieurs petits morceaux : terrain simple
 * pour l'instant, à détailler plus tard).
 */
function addVazylisLandmark(scene: Scene): void {
  // Décalé du point (0,0,0) où le personnage apparaît, pour ne pas apparaître dans le puits.
  const center = new Vector3(0, 0, -3);

  const plazaMaterial = new StandardMaterial("vazylisPlazaMaterial", scene);
  plazaMaterial.diffuseColor = new Color3(0.32, 0.27, 0.22);
  const plaza = MeshBuilder.CreateDisc("vazylis-plaza", { radius: 2.4, tessellation: 24 }, scene);
  plaza.rotation.x = Math.PI / 2;
  plaza.position.set(center.x, 0.01, center.z);
  plaza.material = plazaMaterial;

  const stoneMaterial = new StandardMaterial("vazylisWellMaterial", scene);
  stoneMaterial.diffuseColor = new Color3(0.45, 0.42, 0.4);
  const well = MeshBuilder.CreateCylinder("vazylis-well", { diameter: 1.4, height: 0.6, tessellation: 16 }, scene);
  well.position.set(center.x, 0.3, center.z);
  well.material = stoneMaterial;
}

/** Centre approximatif de la zone de spawn de la sous-zone 2 (voir SPAWN_POINTS dans combatController.ts). */
const BOIS_DES_LUCIOLES_CENTER = new Vector3(28, 0, 0.5);

/**
 * Premier décor distinctif pour une sous-zone : un sol plus vert (sous le sol de base) et
 * quelques arbres simples tout autour, pour qu'on sente qu'on est arrivé dans une forêt.
 * Toujours des formes de base (voir ASSETS.md) : un vrai décor de forêt viendra plus tard.
 */
function addBoisDesLucioles(scene: Scene): void {
  const patchMaterial = new StandardMaterial("boisPatchMaterial", scene);
  patchMaterial.diffuseColor = new Color3(0.15, 0.22, 0.13);
  const patch = MeshBuilder.CreateGround(
    "bois-des-lucioles-patch",
    { width: 32, height: 26 },
    scene,
  );
  patch.position.set(BOIS_DES_LUCIOLES_CENTER.x, 0.01, BOIS_DES_LUCIOLES_CENTER.z);
  patch.material = patchMaterial;

  const trunkMaterial = new StandardMaterial("treeTrunkMaterial", scene);
  trunkMaterial.diffuseColor = new Color3(0.28, 0.2, 0.14);
  const leavesMaterial = new StandardMaterial("treeLeavesMaterial", scene);
  leavesMaterial.diffuseColor = new Color3(0.12, 0.3, 0.14);

  // Autour du bord de la clairière, pour ne pas gêner le passage vers les monstres.
  const treeOffsets: [number, number][] = [
    [-14, -11], [-9, -12], [-2, -12], [5, -11], [12, -10],
    [-14, 11], [-9, 12], [-2, 12], [5, 11], [12, 10],
    [-15, 0], [-15, 6], [-15, -6], [15, 0], [15, 7], [15, -7],
  ];

  treeOffsets.forEach(([dx, dz], index) => {
    const x = BOIS_DES_LUCIOLES_CENTER.x + dx;
    const z = BOIS_DES_LUCIOLES_CENTER.z + dz;

    const trunk = MeshBuilder.CreateCylinder(`tree-trunk-${index}`, { diameter: 0.4, height: 1.6 }, scene);
    trunk.position.set(x, 0.8, z);
    trunk.material = trunkMaterial;

    const leaves = MeshBuilder.CreateCylinder(
      `tree-leaves-${index}`,
      { diameterTop: 0, diameterBottom: 2.2, height: 2.6, tessellation: 8 },
      scene,
    );
    leaves.position.set(x, 2.9, z);
    leaves.material = leavesMaterial;
  });
}
