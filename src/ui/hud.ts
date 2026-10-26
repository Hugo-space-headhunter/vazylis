export interface HudState {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  xp: number;
  xpToNextLevel: number;
}

export interface Hud {
  update(state: HudState): void;
}

/** Bandeau en haut à gauche : nom, niveau, barres de vie, de mana (provisoire) et d'XP. */
export function createHud(): Hud {
  const nameEl = document.getElementById("hud-name") as HTMLElement;
  const levelEl = document.getElementById("hud-level") as HTMLElement;
  const hpFill = document.getElementById("hud-hp-fill") as HTMLElement;
  const xpFill = document.getElementById("hud-xp-fill") as HTMLElement;

  return {
    update(state) {
      nameEl.textContent = state.name;
      levelEl.textContent = `Niveau ${state.level}`;
      hpFill.style.width = `${Math.max(0, Math.min(1, state.hp / state.maxHp)) * 100}%`;
      xpFill.style.width = `${Math.max(0, Math.min(1, state.xp / state.xpToNextLevel)) * 100}%`;
    },
  };
}
