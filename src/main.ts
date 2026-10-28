import "./style.css";
import { INVENTORY_SIZE } from "./config/items";
import { createScene } from "./render/scene";
import { loadCharacter, type CharacterGender } from "./render/character";
import { createAnimator } from "./render/animator";
import { createPlayerController } from "./render/playerController";
import { createCombatController } from "./render/combatController";
import { createJoystick } from "./ui/joystick";
import { createCameraOrbitControl } from "./ui/cameraOrbit";
import { attachFpsCounter } from "./ui/fpsCounter";
import { createHud } from "./ui/hud";
import { createInventoryPanel } from "./ui/inventoryPanel";
import { createAfkToggle } from "./ui/afkToggle";
import { createModeToggle } from "./ui/modeToggle";
import { createStatsPanel } from "./ui/statsPanel";
import { createWorldOverlay } from "./ui/worldOverlay";
import { createSaveService } from "./save/saveService";
import { SAVE_VERSION, type SaveData } from "./save/types";

const canvas = document.getElementById("render-canvas") as HTMLCanvasElement;
const fpsElement = document.getElementById("fps-counter") as HTMLElement;
const touchZone = document.getElementById("touch-zone") as HTMLElement;
const worldOverlayElement = document.getElementById("world-overlay") as HTMLElement;
const characterSelect = document.getElementById("character-select") as HTMLElement;
const openStatsButton = document.getElementById("open-stats") as HTMLButtonElement;
const openInventoryButton = document.getElementById("open-inventory") as HTMLButtonElement;

const saveService = createSaveService();

async function startGame(gender: CharacterGender, savedState: SaveData | null): Promise<void> {
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

  const overlay = createWorldOverlay(scene, camera, canvas, worldOverlayElement);
  const hud = createHud();
  const combat = await createCombatController(scene, engine, character, characterAnimator, overlay, hud);

  // Créé après combat : le mode AFK (dans combat) doit pouvoir couper le joystick.
  createPlayerController(scene, engine, character, camera, joystick, characterAnimator, combat.isAfkActive);

  if (savedState) {
    combat.restoreState(savedState);
  }
  combat.onStateChange((state) => {
    saveService.save({ version: SAVE_VERSION, gender, ...state });
  });

  const modeToggle = createModeToggle();
  modeToggle.onChange((combatMode) => combat.setCombatMode(combatMode));

  const afkToggle = createAfkToggle();
  afkToggle.onChange((enabled) => combat.setAfkMode(enabled));

  const statsPanel = createStatsPanel();
  statsPanel.onValidate((spent) => combat.applyStatPoints(spent));
  openStatsButton.addEventListener("click", () => {
    const snapshot = combat.getStatsSnapshot();
    statsPanel.open(snapshot.stats, snapshot.availablePoints);
  });

  const inventoryPanel = createInventoryPanel(INVENTORY_SIZE);
  inventoryPanel.onEquip((instanceId) => combat.equip(instanceId));
  inventoryPanel.onUnequipWeapon(() => combat.unequipWeapon());
  inventoryPanel.onUnequipArmor((slotId) => combat.unequipArmor(slotId));
  inventoryPanel.onRecycle((instanceId) => combat.recycle(instanceId));
  combat.onInventoryChange((inventory) => inventoryPanel.refresh(inventory));
  openInventoryButton.addEventListener("click", () => {
    inventoryPanel.open(combat.getInventory());
  });
}

document.getElementById("select-male")?.addEventListener("click", () => void startGame("male", null));
document.getElementById("select-female")?.addEventListener("click", () => void startGame("female", null));

saveService.load().then((savedState) => {
  if (savedState) {
    void startGame(savedState.gender, savedState);
  }
  // Sinon, on laisse l'écran de choix du personnage déjà affiché dans la page.
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch((error) => {
      console.error("Échec de l'enregistrement du service worker", error);
    });
  });
}
