import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { appUserReconnectRequired, authorizeAppUserOAuth, callAsAppUser, exchangeAppUserOAuthCode } from "@/integrations/lovable/appUserConnector";
import { getConnectionKeyForUser, saveConnectionKeyForUser } from "@/server/appUserConnections.server";

const CONNECTOR_ID = "linkedin";
const GATEWAY_BASE_URL = "https://connector-gateway.lovable.dev";
const LINKEDIN_SCOPES = ["openid", "profile"];

async function assertPortfolioOwner(supabase: { rpc: (fn: "has_role", args: { _user_id: string; _role: "admin" }) => Promise<{ data: boolean | null; error: unknown }> }, userId: string) {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error || !data) throw new Error("Owner access is required to manage profile connections.");
}

export const startLinkedInConnect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertPortfolioOwner(context.supabase, context.userId);
    const clientAPIKey = process.env["LINKEDIN_APP_USER_CONNECTOR_CLIENT_API_KEY"];
    if (!clientAPIKey) throw new Error("LinkedIn connection is not configured yet.");
    const request = getRequest();
    if (!request) throw new Error("Open LinkedIn connection from the portfolio.");
    const returnUrl = new URL("/api/oauth/linkedin/return", new URL(request.url).origin).toString();
    const connectionAPIKey = await getConnectionKeyForUser(context.userId, CONNECTOR_ID);
    const { authorizationUrl } = await authorizeAppUserOAuth({
      gatewayBaseUrl: GATEWAY_BASE_URL,
      connectorId: CONNECTOR_ID,
      appUserId: context.userId,
      clientAPIKey,
      connectionAPIKey: connectionAPIKey ?? undefined,
      returnUrl,
      credentialsConfiguration: { scopes: LINKEDIN_SCOPES },
    });
    return { authorizationUrl };
  });

export const completeLinkedInConnect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.string().trim().min(1).max(4096).parse(input))
  .handler(async ({ data: code, context }) => {
    await assertPortfolioOwner(context.supabase, context.userId);
    const result = await exchangeAppUserOAuthCode(GATEWAY_BASE_URL, code);
    if (result.connectorId !== CONNECTOR_ID) throw new Error("LinkedIn returned an unexpected connection.");
    await saveConnectionKeyForUser(context.userId, result.connectorId, result.connectionAPIKey);
    return { ok: true };
  });

export const getLinkedInConnectionStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertPortfolioOwner(context.supabase, context.userId);
    const connectionAPIKey = await getConnectionKeyForUser(context.userId, CONNECTOR_ID);
    return { connected: Boolean(connectionAPIKey) };
  });

export const syncLinkedInProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertPortfolioOwner(context.supabase, context.userId);
    const connectionAPIKey = await getConnectionKeyForUser(context.userId, CONNECTOR_ID);
    if (!connectionAPIKey) return { connected: false as const, updated: false as const };

    const response = await callAsAppUser({
      gatewayBaseUrl: GATEWAY_BASE_URL,
      connectionAPIKey,
      connectorId: CONNECTOR_ID,
      path: "/v2/userinfo",
      requiredScopes: LINKEDIN_SCOPES,
    });
    if (await appUserReconnectRequired(response)) {
      return { connected: false as const, reconnectRequired: true as const, updated: false as const };
    }
    if (!response.ok) {
      const details = await response.text();
      console.error(`LinkedIn profile refresh failed [${response.status}]: ${details}`);
      return { connected: true as const, updated: false as const, error: "LinkedIn could not refresh this profile." };
    }

    const profile = (await response.json()) as {
      name?: unknown;
      given_name?: unknown;
      family_name?: unknown;
      picture?: unknown;
    };
    const name = typeof profile.name === "string"
      ? profile.name.trim()
      : [profile.given_name, profile.family_name].filter((part): part is string => typeof part === "string").join(" ").trim();
    if (!name) return { connected: true as const, updated: false as const, error: "LinkedIn did not share a display name." };
    const pictureUrl = typeof profile.picture === "string" && profile.picture.startsWith("https://")
      ? profile.picture
      : null;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("linkedin_profile_snapshots").upsert({
      user_id: context.userId,
      display_name: name,
      picture_url: pictureUrl,
      published: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    if (error) {
      console.error("Could not save refreshed LinkedIn profile.", error);
      return { connected: true as const, updated: false as const, error: "LinkedIn details could not be published." };
    }
    return { connected: true as const, updated: true as const, displayName: name };
  });