// Raretés des items : multiplicateur de puissance et nombre de bonus en %.
// Source : docs/game-design.md, section "Raretés".
// Ces valeurs sont des points de départ et seront ajustées en jouant.

export type RarityId = "standard" | "argente" | "dore" | "epique" | "mythique" | "transcendant";

export interface RarityConfig {
  label: string;
  /** Multiplie le niveau de l'item pour calculer sa puissance de base. */
  powerMultiplier: number;
  /** Nombre de bonus en % (vitesse d'attaque, critique, etc.) portés par l'item. */
  bonusPercentCount: number;
}

export const RARITIES: Record<RarityId, RarityConfig> = {
  standard: { label: "Standard", powerMultiplier: 1, bonusPercentCount: 0 },
  argente: { label: "Argenté", powerMultiplier: 1.2, bonusPercentCount: 1 },
  dore: { label: "Doré", powerMultiplier: 1.45, bonusPercentCount: 2 },
  epique: { label: "Épique", powerMultiplier: 1.75, bonusPercentCount: 3 },
  mythique: { label: "Mythique", powerMultiplier: 2.1, bonusPercentCount: 4 },
  transcendant: { label: "Transcendant", powerMultiplier: 2.5, bonusPercentCount: 5 },
};
