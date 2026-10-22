import { decryptConnectionKey, encryptConnectionKey } from "@/server/connectionKeyCrypto";

export async function saveConnectionKeyForUser(
  userId: string,
  connectorId: string,
  connectionAPIKey: string,
): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const connection_key_ciphertext = await encryptConnectionKey(connectionAPIKey);
  const { error } = await supabaseAdmin.from("app_user_connections").upsert(
    {
      user_id: userId,
      connector_id: connectorId,
      connection_key_ciphertext,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,connector_id" },
  );
  if (error) throw new Error("Could not securely save the LinkedIn connection.");
}

export async function getConnectionKeyForUser(userId: string, connectorId: string): Promise<string | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("app_user_connections")
    .select("connection_key_ciphertext")
    .eq("user_id", userId)
    .eq("connector_id", connectorId)
    .maybeSingle();
  if (error) throw new Error("Could not read the LinkedIn connection.");
  return data ? decryptConnectionKey(data.connection_key_ciphertext) : null;
}