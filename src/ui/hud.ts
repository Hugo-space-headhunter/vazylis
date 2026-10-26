export interface HudState {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  mana: number;
  xp: number;
  xpToNextLevel: number;
}

export interface Hud {
  update(state: HudState): void;
}

/** Bandeau en haut à gauche : nom, niveau, barres de vie, de mana et d'XP. */
export function createHud(): Hud {
  const nameEl = document.getElementById("hud-name") as HTMLElement;
  const levelEl = document.getElementById("hud-level") as HTMLElement;
  const hpFill = document.getElementById("hud-hp-fill") as HTMLElement;
  const manaFill = document.getElementById("hud-mana-fill") as HTMLElement;
  const xpFill = document.getElementById("hud-xp-fill") as HTMLElement;

  return {
    update(state) {
      nameEl.textContent = state.name;
      levelEl.textContent = `Niveau ${state.level}`;
      hpFill.style.width = `${Math.max(0, Math.min(1, state.hp / state.maxHp)) * 100}%`;
      // Le mana n'est pas encore consommé dans le prototype : la barre reste pleine, juste dimensionnée par l'Intelligence.
      manaFill.style.width = state.mana > 0 ? "100%" : "0%";
      xpFill.style.width = `${Math.max(0, Math.min(1, state.xp / state.xpToNextLevel)) * 100}%`;
    },
  };
}
