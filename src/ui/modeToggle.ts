export interface ModeToggle {
  onChange(callback: (combatMode: boolean) => void): void;
}

/** Les deux gros boutons « pied » / « arme » en bas à droite. */
export function createModeToggle(): ModeToggle {
  const moveButton = document.getElementById("mode-move") as HTMLButtonElement;
  const combatButton = document.getElementById("mode-combat") as HTMLButtonElement;
  let listener: ((combatMode: boolean) => void) | null = null;

  function setMode(combatMode: boolean) {
    moveButton.classList.toggle("active", !combatMode);
    combatButton.classList.toggle("active", combatMode);
    listener?.(combatMode);
  }

  moveButton.addEventListener("click", () => setMode(false));
  combatButton.addEventListener("click", () => setMode(true));

  return {
    onChange(callback) {
      listener = callback;
    },
  };
}
