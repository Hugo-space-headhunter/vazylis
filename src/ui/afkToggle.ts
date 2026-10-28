export interface AfkToggle {
  onChange(callback: (enabled: boolean) => void): void;
}

/** Le petit bouton AFK, à côté des boutons "Arme" / "Pied" (voir game-design.md, "Mode AFK"). */
export function createAfkToggle(): AfkToggle {
  const button = document.getElementById("mode-afk") as HTMLButtonElement;
  let enabled = false;
  let listener: ((enabled: boolean) => void) | null = null;

  button.addEventListener("click", () => {
    enabled = !enabled;
    button.classList.toggle("active", enabled);
    listener?.(enabled);
  });

  return {
    onChange(callback) {
      listener = callback;
    },
  };
}
