import type { PlayerStats } from "../game/stats";
import { totalSpentPoints } from "../game/stats";

export type StatKey = keyof PlayerStats;

const STAT_KEYS: StatKey[] = ["force", "agilite", "vitalite", "intelligence"];

export interface StatsPanel {
  /** Ouvre le panneau avec les statistiques déjà validées et le nombre de points disponibles. */
  open(committed: PlayerStats, availablePoints: number): void;
  onValidate(callback: (spent: PlayerStats) => void): void;
}

/** Fenêtre de répartition des points de statistiques (+ / − / Valider). */
export function createStatsPanel(): StatsPanel {
  const panel = document.getElementById("stats-panel") as HTMLElement;
  const pointsLabel = document.getElementById("stats-points") as HTMLElement;
  const closeButton = document.getElementById("stats-close") as HTMLButtonElement;
  const validateButton = document.getElementById("stats-validate") as HTMLButtonElement;
  const statButtons = Array.from(document.querySelectorAll<HTMLButtonElement>(".stats-btn"));
  const valueElements: Record<StatKey, HTMLElement> = {
    force: document.getElementById("stats-value-force") as HTMLElement,
    agilite: document.getElementById("stats-value-agilite") as HTMLElement,
    vitalite: document.getElementById("stats-value-vitalite") as HTMLElement,
    intelligence: document.getElementById("stats-value-intelligence") as HTMLElement,
  };

  let availablePoints = 0;
  let committedStats: PlayerStats = { force: 0, agilite: 0, vitalite: 0, intelligence: 0 };
  let draft: PlayerStats = { force: 0, agilite: 0, vitalite: 0, intelligence: 0 };
  let validateCallback: ((spent: PlayerStats) => void) | null = null;

  function remainingPoints(): number {
    return availablePoints - totalSpentPoints(draft);
  }

  function render(): void {
    pointsLabel.textContent = `Points disponibles : ${remainingPoints()}`;
    for (const key of STAT_KEYS) {
      valueElements[key].textContent = String(committedStats[key] + draft[key]);
    }
    for (const button of statButtons) {
      const delta = Number(button.dataset.delta);
      const key = button.dataset.stat as StatKey;
      if (delta > 0) {
        button.disabled = remainingPoints() <= 0;
      } else {
        button.disabled = draft[key] <= 0;
      }
    }
  }

  function changeStat(key: StatKey, delta: number): void {
    if (delta > 0 && remainingPoints() <= 0) return;
    if (delta < 0 && draft[key] <= 0) return;
    draft[key] += delta;
    render();
  }

  for (const button of statButtons) {
    button.addEventListener("click", () => {
      const key = button.dataset.stat as StatKey;
      const delta = Number(button.dataset.delta);
      changeStat(key, delta);
    });
  }

  closeButton.addEventListener("click", () => {
    panel.classList.add("hidden");
  });

  validateButton.addEventListener("click", () => {
    validateCallback?.({ ...draft });
    panel.classList.add("hidden");
  });

  return {
    open(committed, points) {
      availablePoints = points;
      committedStats = { ...committed };
      draft = { force: 0, agilite: 0, vitalite: 0, intelligence: 0 };
      render();
      panel.classList.remove("hidden");
    },
    onValidate(callback) {
      validateCallback = callback;
    },
  };
}
