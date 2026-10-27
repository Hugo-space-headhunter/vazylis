import { createLocalRepository } from "./localRepository";
import { createSupabaseRepository } from "./supabaseRepository";
import type { SaveData } from "./types";

/** Attente avant d'envoyer vers Supabase, pour regrouper plusieurs changements rapprochés. */
const REMOTE_SAVE_DELAY_MS = 1500;

export interface SaveService {
  /** Essaie la sauvegarde en ligne, puis la sauvegarde locale si elle est indisponible. */
  load(): Promise<SaveData | null>;
  /** Sauvegarde tout de suite en local, et en ligne après un court délai. */
  save(data: SaveData): void;
}

export function createSaveService(): SaveService {
  const local = createLocalRepository();
  const remote = createSupabaseRepository();
  let remoteSaveTimeout: ReturnType<typeof setTimeout> | undefined;

  return {
    async load() {
      try {
        const remoteSave = await remote.load();
        if (remoteSave) {
          await local.save(remoteSave);
          return remoteSave;
        }
      } catch (error) {
        console.error("Sauvegarde en ligne indisponible, on utilise la sauvegarde locale", error);
      }
      return local.load();
    },
    save(data: SaveData) {
      void local.save(data);
      if (remoteSaveTimeout) clearTimeout(remoteSaveTimeout);
      remoteSaveTimeout = setTimeout(() => {
        remote.save(data).catch((error) => {
          console.error("Sauvegarde en ligne impossible, la sauvegarde locale reste à jour", error);
        });
      }, REMOTE_SAVE_DELAY_MS);
    },
  };
}
