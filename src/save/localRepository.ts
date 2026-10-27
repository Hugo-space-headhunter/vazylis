import type { SaveData, SaveRepository } from "./types";

const STORAGE_KEY = "vazylis-save";

/**
 * Sauvegarde locale (sur l'appareil) : fonctionne hors ligne, c'est la base de
 * secours si la sauvegarde en ligne est indisponible.
 */
export function createLocalRepository(): SaveRepository {
  return {
    async load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as SaveData) : null;
      } catch (error) {
        console.error("Lecture de la sauvegarde locale impossible", error);
        return null;
      }
    },
    async save(data: SaveData) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error("Écriture de la sauvegarde locale impossible", error);
      }
    },
  };
}
