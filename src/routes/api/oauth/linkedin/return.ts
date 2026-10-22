import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/oauth/linkedin/return")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const connectorId = url.searchParams.get("connector_id") ?? "";
        const success = url.searchParams.get("success") === "true" && connectorId === "linkedin";
        const offlineAccessAllowed = url.searchParams.get("offline_access_allowed");
        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");
        const result = success && offlineAccessAllowed === "false"
          ? { success: true, connectorId, code: null }
          : success && code
            ? { success: true, connectorId, code }
            : { success: false, connectorId: "linkedin", error: error ?? "LinkedIn connection was not completed." };
        const safeJson = JSON.stringify(result).replace(/<\//g, "<\\/");
        const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>LinkedIn connection</title></head><body><p>${result.success ? "Connection received. You can close this window." : "Connection could not be completed. You can close this window."}</p><script>const result=${safeJson};if(window.opener&&window.opener!==window){window.opener.postMessage({type:result.success?"appUserConnectorOAuthComplete":"appUserConnectorOAuthFailed",connectorId:result.connectorId,code:result.code??null},window.location.origin)}window.close()</script></body></html>`;
        return new Response(html, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-store",
            "Content-Security-Policy": "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",
            "X-Content-Type-Options": "nosniff",
          },
        });
      },
    },
  },
});