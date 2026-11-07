import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SOCIALS } from "@/data/socials";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "./ThemeToggle";
import { useAetherEscort } from "./Aether";

/** Session-aware owner link: "Sign in" when logged out, "Beacon" (location control) when in. */
function AuthLink() {
  const navigate = useNavigate();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setSignedIn(!!session));
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  return signedIn ? (
    <span className="flex items-center gap-3">
      <Link to="/now-share" className="hover-underline" title="Location beacon control">
        Beacon
      </Link>
      <button onClick={signOut} className="hover-underline uppercase tracking-widest text-xs">
        Out
      </button>
    </span>
  ) : (
    <Link to="/auth" className="hover-underline" title="Owner sign-in">
      Sign in
    </Link>
  );
}


const LINKS: [string, string][] = [
  ["Home", "/"],
  ["Work", "/projects"],
  ["About", "/about"],
  ["Cosmos", "/cosmos"],
  ["Now", "/now"],
  ["Aether", "/aether"],
  ["Links", "/links"],
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const escort = useAetherEscort();
  const top4 = SOCIALS.filter(s => ["GitHub","LinkedIn","Twitter / X","Instagram"].includes(s.name));

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <>
    <header className="fixed top-0 inset-x-0 z-[110] border-b border-border bg-background/90 text-foreground backdrop-blur-md">
      <div className="relative z-50 flex items-center justify-between px-6 md:px-10 py-4">
        <Link to="/" className="serif text-2xl leading-none" onClick={(e) => { setOpen(false); escort("/", e); }}>
          Amish<span className="text-accent">.</span>
        </Link>

        <nav className="hidden xl:flex gap-5 text-[11px] uppercase tracking-widest items-center">
          {LINKS.map(([l, h]) => (
            <Link
              key={h}
              to={h}
              onClick={(e) => escort(h, e)}
              className="hover-underline"
              activeProps={{ className: "italic" }}
              activeOptions={{ exact: true }}
            >
              {l}
            </Link>
          ))}
          <span className="h-4 w-px bg-border" />
          <AuthLink />
          <ThemeToggle />

        </nav>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen((value) => !value)}
          className="xl:hidden relative z-50"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="site-menu-overlay"
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>

    </header>
    <AnimatePresence>
      {open && (
        <motion.div
          id="site-menu-overlay"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="fixed inset-0 z-[100] overflow-y-auto bg-background text-foreground xl:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <div className="mx-auto flex min-h-full max-w-6xl flex-col px-6 pb-10 pt-24 md:px-10">
            <div className="eyebrow text-muted-foreground">Amish Kumar · Index</div>
            <nav aria-label="Main navigation" className="mt-5 grid grid-cols-1 gap-x-12 border-t border-border sm:grid-cols-2">
              {LINKS.map(([label, href], index) => (
                <Link
                  key={href}
                  to={href}
                  onClick={(event) => { setOpen(false); escort(href, event); }}
                  className="group flex items-center justify-between border-b border-border py-4 serif text-3xl transition-colors hover:text-accent md:py-5 md:text-4xl"
                >
                  <span>{label}</span>
                  <span className="eyebrow text-muted-foreground">0{index + 1}</span>
                </Link>
              ))}
            </nav>
            <div className="mt-auto grid grid-cols-2 gap-x-6 gap-y-3 border-t border-border pt-6 sm:grid-cols-4">
              {top4.map((social) => (
                <a key={social.name} href={social.url} target="_blank" rel="noreferrer" className="hover-underline text-sm">
                  {social.name} ↗
                </a>
              ))}
              <div className="col-span-2 flex items-center justify-between sm:col-span-4">
                <AuthLink />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
