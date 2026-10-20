import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, LogOut, Satellite } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/portfolio/SiteNav";

export const Route = createFileRoute("/_authenticated/now-share")({
  head: () => ({
    meta: [
      { title: "Share my location — Amish Kumar" },
      { name: "description", content: "Owner-only control for the live city shown on the Now page." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NowSharePage,
});

const MIN_INTERVAL = 3 * 60 * 1000; // publish at most every 3 minutes

async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) return null;
    const json = await res.json();
    const a = json.address ?? {};
    return a.city ?? a.town ?? a.village ?? a.county ?? a.state ?? null;
  } catch {
    return null;
  }
}

function NowSharePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sharing, setSharing] = useState(false);
  const [city, setCity] = useState<string | null>(null);
  const [lastSent, setLastSent] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchId = useRef<number | null>(null);
  const lastPublish = useRef(0);
  const lastCity = useRef<string | null>(null);

  const publish = useCallback(async (lat: number, lon: number) => {
    const now = Date.now();
    if (now - lastPublish.current < MIN_INTERVAL) return;
    const found = await reverseGeocode(lat, lon);
    if (!found) return;
    if (found === lastCity.current && now - lastPublish.current < 15 * 60 * 1000) return;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { error: err } = await supabase.from("presence").upsert(
      { user_id: userData.user.id, city: found, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );
    if (err) {
      setError(
        "Couldn't publish — your account may not be marked as the site owner yet. Ask Lovable to grant you the owner role.",
      );
      return;
    }
    lastPublish.current = now;
    lastCity.current = found;
    setCity(found);
    setLastSent(now);
    setError(null);
  }, []);

  const start = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setError("This device doesn't support geolocation.");
      return;
    }
    setError(null);
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => void publish(pos.coords.latitude, pos.coords.longitude),
      () => setError("Location permission denied. Allow it in your browser settings to share."),
      { enableHighAccuracy: false, maximumAge: 60_000 },
    );
    setSharing(true);
  }, [publish]);

  const stop = useCallback(() => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null;
    setSharing(false);
  }, []);

  useEffect(() => stop, [stop]);

  const signOut = async () => {
    stop();
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="flex min-h-screen items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl border border-border bg-card p-8"
        >
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            <Satellite size={13} /> live beacon
          </div>
          <h1 className="serif italic text-4xl mt-2">Share my city</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            While this is on, your public Now page shows the city you're in — never your exact
            coordinates. Keep this tab open on your phone and it updates as you move.
          </p>

          <div className="mt-6 rounded-xl border border-border bg-background p-4">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${sharing ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground/50"}`}
              />
              <span className="text-sm font-medium">{sharing ? "Beacon on" : "Beacon off"}</span>
            </div>
            {city && (
              <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin size={13} /> Currently showing: <span className="text-foreground">{city}</span>
              </div>
            )}
            {lastSent && (
              <div className="text-[11px] text-muted-foreground mt-1">
                Last update {new Date(lastSent).toLocaleTimeString()}
              </div>
            )}
            {error && <p className="mt-2 text-[13px] text-red-500">{error}</p>}
          </div>

          <div className="mt-4 flex gap-2">
            {sharing ? (
              <button
                onClick={stop}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm uppercase tracking-widest hover:bg-accent/10 transition"
              >
                Stop sharing
              </button>
            ) : (
              <button
                onClick={start}
                className="flex-1 rounded-xl bg-foreground text-background py-2.5 text-sm font-medium uppercase tracking-widest"
              >
                Start sharing
              </button>
            )}
            <button
              onClick={signOut}
              className="rounded-xl border border-border px-4 py-2.5 text-muted-foreground hover:text-foreground transition"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
