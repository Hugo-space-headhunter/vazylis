import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "../config/supabase";
import type { SaveData, SaveRepository } from "./types";

const TABLE_NAME = "saves";

/**
 * Sauvegarde en ligne (Supabase) : chaque joueur a un compte "anonyme" invisible
 * (pas de mot de passe), créé automatiquement et mémorisé par le navigateur. C'est
 * ce qui permet de retrouver sa partie même après avoir fermé l'application.
 */
export function createSupabaseRepository(): SaveRepository {
  const client: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  async function ensureUserId(): Promise<string | null> {
    const { data: sessionData } = await client.auth.getSession();
    if (sessionData.session) {
      return sessionData.session.user.id;
    }
    const { data, error } = await client.auth.signInAnonymously();
    if (error) {
      console.error("Connexion anonyme Supabase impossible", error);
      return null;
    }
    return data.user?.id ?? null;
  }

  return {
    async load() {
      const userId = await ensureUserId();
      if (!userId) return null;
      const { data, error } = await client
        .from(TABLE_NAME)
        .select("data")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) {
        console.error("Lecture de la sauvegarde en ligne impossible", error);
        return null;
      }
      return (data?.data as SaveData | undefined) ?? null;
    },
    async save(save: SaveData) {
      const userId = await ensureUserId();
      if (!userId) return;
      const { error } = await client
        .from(TABLE_NAME)
        .upsert({ user_id: userId, data: save, updated_at: new Date().toISOString() });
      if (error) {
        console.error("Écriture de la sauvegarde en ligne impossible", error);
      }
    },
  };
}
