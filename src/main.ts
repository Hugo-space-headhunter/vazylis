import "./style.css";
import { createScene } from "./render/scene";
import { loadCharacter, type CharacterGender } from "./render/character";
import { createPlayerController } from "./render/playerController";
import { createJoystick } from "./ui/joystick";
import { attachFpsCounter } from "./ui/fpsCounter";

const canvas = document.getElementById("render-canvas") as HTMLCanvasElement;
const fpsElement = document.getElementById("fps-counter") as HTMLElement;
const joystickZone = document.getElementById("joystick-zone") as HTMLElement;
const characterSelect = document.getElementById("character-select") as HTMLElement;

async function startGame(gender: CharacterGender): Promise<void> {
  characterSelect.style.display = "none";

  const { engine, scene, camera } = createScene(canvas);
  attachFpsCounter(engine, scene, fpsElement);

  const character = await loadCharacter(scene, gender);
  camera.lockedTarget = character.root;

  const joystick = createJoystick(joystickZone);
  createPlayerController(scene, engine, character, camera, joystick);
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
