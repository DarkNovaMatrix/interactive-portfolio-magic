import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, LoaderCircle, RefreshCw, Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  completeLinkedInConnect,
  getLinkedInConnectionStatus,
  startLinkedInConnect,
  syncLinkedInProfile,
} from "@/lib/linkedin.functions";

type Status = "loading" | "connected" | "disconnected" | "unavailable";

export function LinkedInProfileSync() {
  const startConnect = useServerFn(startLinkedInConnect);
  const completeConnect = useServerFn(completeLinkedInConnect);
  const getStatus = useServerFn(getLinkedInConnectionStatus);
  const syncProfile = useServerFn(syncLinkedInProfile);
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const refreshStatus = useCallback(async () => {
    try {
      const result = await getStatus();
      setStatus(result.connected ? "connected" : "disconnected");
    } catch {
      setStatus("unavailable");
    }
  }, [getStatus]);

  const sync = useCallback(async () => {
    const result = await syncProfile();
    if (result.updated) {
      setNotice(`LinkedIn profile refreshed as ${result.displayName}.`);
      return;
    }
    if ("reconnectRequired" in result && result.reconnectRequired) {
      setStatus("disconnected");
      setNotice("LinkedIn access needs to be renewed.");
      return;
    }
    if ("error" in result && result.error) setNotice(result.error);
  }, [syncProfile]);

  useEffect(() => {
    let cancelled = false;
    let refreshTimer: number | undefined;
    void getStatus()
      .then(async (result) => {
        if (cancelled) return;
        setStatus(result.connected ? "connected" : "disconnected");
        if (result.connected) {
          try {
            const latest = await syncProfile();
            if (cancelled) return;
            if (latest.updated) setNotice(`LinkedIn profile refreshed as ${latest.displayName}.`);
            else if ("error" in latest && latest.error) setNotice(latest.error);
            else if ("reconnectRequired" in latest && latest.reconnectRequired) {
              setStatus("disconnected");
              setNotice("LinkedIn access needs to be renewed.");
            }
          } catch {
            if (!cancelled) setNotice("LinkedIn could not refresh this profile.");
          }
          refreshTimer = window.setInterval(() => {
            void syncProfile().then((latest) => {
              if (cancelled) return;
              if (latest.updated) setNotice(`LinkedIn profile refreshed as ${latest.displayName}.`);
              else if ("error" in latest && latest.error) setNotice(latest.error);
              else if ("reconnectRequired" in latest && latest.reconnectRequired) {
                setStatus("disconnected");
                setNotice("LinkedIn access needs to be renewed.");
                if (refreshTimer !== undefined) window.clearInterval(refreshTimer);
              }
            }).catch(() => {
              if (!cancelled) setNotice("LinkedIn could not refresh this profile.");
            });
          }, 5 * 60 * 1000);
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("unavailable");
      });
    return () => {
      cancelled = true;
      if (refreshTimer !== undefined) window.clearInterval(refreshTimer);
    };
  }, [getStatus, syncProfile]);

  const connect = async () => {
    const popup = window.open("about:blank", "linkedin-profile-connect", "width=600,height=720");
    if (!popup) {
      setNotice("Allow pop-ups to connect LinkedIn.");
      return;
    }
    setBusy(true);
    setNotice("");
    let poll: number | undefined;
    try {
      const completion = new Promise<{ code: string | null }>((resolve, reject) => {
        const cleanup = () => {
          window.removeEventListener("message", onMessage);
          if (poll !== undefined) window.clearInterval(poll);
        };
        const onMessage = (event: MessageEvent) => {
          const message = event.data as { type?: unknown; connectorId?: unknown; code?: unknown } | null;
          if (
            event.origin !== window.location.origin ||
            event.source !== popup ||
            message?.connectorId !== "linkedin" ||
            (message.type !== "appUserConnectorOAuthComplete" && message.type !== "appUserConnectorOAuthFailed")
          ) return;
          cleanup();
          if (message.type === "appUserConnectorOAuthComplete") {
            resolve({ code: typeof message.code === "string" ? message.code : null });
          } else {
            reject(new Error("LinkedIn connection was not completed."));
          }
        };
        window.addEventListener("message", onMessage);
        poll = window.setInterval(() => {
          if (!popup.closed) return;
          cleanup();
          reject(new Error("LinkedIn connection window was closed."));
        }, 500);
      });
      const { authorizationUrl } = await startConnect();
      popup.location.href = authorizationUrl;
      const { code } = await completion;
      if (!code) {
        setNotice("LinkedIn consent finished, but persistent access was not granted.");
        return;
      }
      await completeConnect({ data: code });
      await refreshStatus();
      const latest = await syncProfile();
      setStatus(latest.connected ? "connected" : "disconnected");
      if (latest.updated) setNotice(`Connected and refreshed ${latest.displayName}'s public identity.`);
      else if ("error" in latest && latest.error) setNotice(latest.error);
      else setNotice("LinkedIn connected. The public identity fields will refresh when this page is opened.");
    } catch (error) {
      if (!popup.closed) popup.close();
      setNotice(error instanceof Error ? error.message : "LinkedIn could not be connected.");
    } finally {
      if (poll !== undefined) window.clearInterval(poll);
      setBusy(false);
    }
  };

  const refresh = async () => {
    setBusy(true);
    setNotice("");
    try {
      await sync();
    } catch {
      setNotice("LinkedIn could not refresh this profile.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="border-t border-border pt-8">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="max-w-xl">
          <div className="eyebrow text-muted-foreground">Profile connections</div>
          <h2 className="serif mt-2 text-3xl">LinkedIn identity</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            LinkedIn shares only your approved basic identity here. It does not provide your full work history, projects, or skills through this access.
          </p>
          {notice && <p role="status" className="mt-3 text-sm text-foreground">{notice}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {status === "connected" && (
            <Button variant="outline" onClick={refresh} disabled={busy}>
              {busy ? <LoaderCircle className="animate-spin" /> : <RefreshCw />}
              Refresh profile
            </Button>
          )}
          <Button variant={status === "connected" ? "ghost" : "default"} onClick={connect} disabled={busy || status === "loading" || status === "unavailable"}>
            {busy ? <LoaderCircle className="animate-spin" /> : status === "connected" ? <Check /> : <Unplug />}
            {status === "connected" ? "Reconnect LinkedIn" : status === "loading" ? "Checking…" : status === "unavailable" ? "Owner access required" : "Connect LinkedIn"}
          </Button>
        </div>
      </div>
    </section>
  );
}