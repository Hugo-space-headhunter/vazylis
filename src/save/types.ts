import type { CharacterGender } from "../render/character";
import type { InventoryState } from "../game/inventory";
import type { PlayerStats } from "../game/stats";

export const SAVE_VERSION = 1;

/** Tout ce qui doit survivre à une fermeture de l'application. */
export interface SaveData {
  version: typeof SAVE_VERSION;
  gender: CharacterGender;
  level: number;
  xp: number;
  stats: PlayerStats;
  inventory: InventoryState;
}

export interface SaveRepository {
  load(): Promise<SaveData | null>;
  save(data: SaveData): Promise<void>;
}
