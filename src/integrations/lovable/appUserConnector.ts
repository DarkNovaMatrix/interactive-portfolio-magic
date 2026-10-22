function requireApiKey(): string {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("LOVABLE_API_KEY is not configured");
  return key;
}

export interface AppUserOAuthAuthorizeParams {
  gatewayBaseUrl: string;
  connectorId: string;
  appUserId: string;
  clientAPIKey: string;
  connectionAPIKey?: string;
  returnUrl: string;
  credentialsConfiguration?: Record<string, unknown>;
}

export async function authorizeAppUserOAuth({
  gatewayBaseUrl,
  connectorId,
  appUserId,
  clientAPIKey,
  connectionAPIKey,
  returnUrl,
  credentialsConfiguration,
}: AppUserOAuthAuthorizeParams): Promise<{ authorizationUrl: string }> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${requireApiKey()}`,
    "Content-Type": "application/json",
    "X-Client-Api-Key": clientAPIKey,
  };
  if (connectionAPIKey) headers["X-Connection-Api-Key"] = connectionAPIKey;

  const response = await fetch(`${gatewayBaseUrl}/api/v1/app-users/oauth2/authorize`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      connector_id: connectorId,
      app_user_id: appUserId,
      return_url: returnUrl,
      credentials_configuration: credentialsConfiguration,
    }),
  });
  const text = await response.text();
  if (!response.ok) {
    console.error(`LinkedIn connection start failed [${response.status}]: ${text}`);
    throw new Error("Could not start LinkedIn connection.");
  }

  const body = JSON.parse(text) as { authorization_url?: string };
  if (!body.authorization_url) throw new Error("LinkedIn connection could not be started.");
  return { authorizationUrl: body.authorization_url };
}

export async function exchangeAppUserOAuthCode(
  gatewayBaseUrl: string,
  code: string,
): Promise<{ connectionAPIKey: string; connectorId: string }> {
  const response = await fetch(`${gatewayBaseUrl}/api/v1/app-users/oauth2/exchange`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${requireApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });
  const text = await response.text();
  if (!response.ok) {
    console.error(`LinkedIn connection completion failed [${response.status}]: ${text}`);
    throw new Error("Could not finish LinkedIn connection.");
  }

  const body = JSON.parse(text) as { api_key?: string; connector_id?: string };
  if (!body.api_key || !body.connector_id) throw new Error("LinkedIn connection could not be completed.");
  return { connectionAPIKey: body.api_key, connectorId: body.connector_id };
}

export async function callAsAppUser({
  gatewayBaseUrl,
  connectionAPIKey,
  connectorId,
  path,
  init,
  requiredScopes,
}: {
  gatewayBaseUrl: string;
  connectionAPIKey: string;
  connectorId: string;
  path: string;
  init?: RequestInit;
  requiredScopes?: string[];
}): Promise<Response> {
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${requireApiKey()}`);
  headers.set("X-Connection-Api-Key", connectionAPIKey);
  if (requiredScopes?.length) headers.set("X-Lovable-Required-Scopes", requiredScopes.join(" "));
  return fetch(`${gatewayBaseUrl}/${connectorId}${path.startsWith("/") ? path : `/${path}`}`, {
    ...init,
    headers,
  });
}

export async function appUserReconnectRequired(response: Response): Promise<boolean> {
  if (response.status !== 401) return false;
  const body = (await response.clone().json().catch(() => null)) as { type?: unknown } | null;
  return typeof body?.type === "string" && body.type.startsWith("credential_");
}