import "./style.css";
import { createScene } from "./render/scene";
import { loadCharacter, type CharacterGender } from "./render/character";
import { createAnimator } from "./render/animator";
import { createPlayerController } from "./render/playerController";
import { createCombatController } from "./render/combatController";
import { createJoystick } from "./ui/joystick";
import { createCameraOrbitControl } from "./ui/cameraOrbit";
import { attachFpsCounter } from "./ui/fpsCounter";
import { createHud } from "./ui/hud";
import { createModeToggle } from "./ui/modeToggle";
import { createStatsPanel } from "./ui/statsPanel";
import { createWorldOverlay } from "./ui/worldOverlay";

const canvas = document.getElementById("render-canvas") as HTMLCanvasElement;
const fpsElement = document.getElementById("fps-counter") as HTMLElement;
const touchZone = document.getElementById("touch-zone") as HTMLElement;
const worldOverlayElement = document.getElementById("world-overlay") as HTMLElement;
const characterSelect = document.getElementById("character-select") as HTMLElement;
const openStatsButton = document.getElementById("open-stats") as HTMLButtonElement;

async function startGame(gender: CharacterGender): Promise<void> {
  characterSelect.style.display = "none";

  const { engine, scene, camera } = createScene(canvas);
  attachFpsCounter(engine, scene, fpsElement);

  const character = await loadCharacter(scene, gender);
  camera.lockedTarget = character.root;

  const characterAnimator = createAnimator(character.animations, {
    idle: "Idle_Loop",
    walk: "Walk_Loop",
    attack: "Punch_Jab",
  });

  const joystick = createJoystick(touchZone);
  createCameraOrbitControl(touchZone, camera);
  createPlayerController(scene, engine, character, camera, joystick, characterAnimator);

  const overlay = createWorldOverlay(scene, camera, canvas, worldOverlayElement);
  const hud = createHud();
  const combat = await createCombatController(scene, engine, character, characterAnimator, overlay, hud);

  const modeToggle = createModeToggle();
  modeToggle.onChange((combatMode) => combat.setCombatMode(combatMode));

  const statsPanel = createStatsPanel();
  statsPanel.onValidate((spent) => combat.applyStatPoints(spent));
  openStatsButton.addEventListener("click", () => {
    const snapshot = combat.getStatsSnapshot();
    statsPanel.open(snapshot.stats, snapshot.availablePoints);
  });
}

document.getElementById("select-male")?.addEventListener("click", () => void startGame("male"));
document.getElementById("select-female")?.addEventListener("click", () => void startGame("female"));

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch((error) => {
      console.error("Échec de l'enregistrement du service worker", error);
    });
  });
}
