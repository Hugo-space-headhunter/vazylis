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

/** Bandeau en haut à gauche : nom, niveau, barres de vie, de mana et d'XP, avec leurs nombres. */
export function createHud(): Hud {
  const nameEl = document.getElementById("hud-name") as HTMLElement;
  const levelEl = document.getElementById("hud-level") as HTMLElement;
  const hpFill = document.getElementById("hud-hp-fill") as HTMLElement;
  const hpLabel = document.getElementById("hud-hp-label") as HTMLElement;
  const manaFill = document.getElementById("hud-mana-fill") as HTMLElement;
  const manaLabel = document.getElementById("hud-mana-label") as HTMLElement;
  const xpFill = document.getElementById("hud-xp-fill") as HTMLElement;
  const xpLabel = document.getElementById("hud-xp-label") as HTMLElement;

  return {
    update(state) {
      nameEl.textContent = state.name;
      levelEl.textContent = `Niveau ${state.level}`;

      hpFill.style.width = `${Math.max(0, Math.min(1, state.hp / state.maxHp)) * 100}%`;
      hpLabel.textContent = `${Math.round(state.hp)} / ${Math.round(state.maxHp)}`;

      // Le mana n'est pas encore consommé dans le prototype : la barre reste pleine, juste dimensionnée par l'Intelligence.
      manaFill.style.width = state.mana > 0 ? "100%" : "0%";
      manaLabel.textContent = `${Math.round(state.mana)} / ${Math.round(state.mana)}`;

      const xpPercent = Math.max(0, Math.min(1, state.xp / state.xpToNextLevel)) * 100;
      xpFill.style.width = `${xpPercent}%`;
      xpLabel.textContent = `${Math.round(xpPercent)} %`;
    },
  };
}
