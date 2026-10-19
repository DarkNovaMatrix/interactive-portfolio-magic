import { useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTheme } from "@/lib/theme";
import { COSMOS_EVENT, type Command } from "@/lib/aether-commands";

/** Execute a matched AETHER command: navigate, toggle theme, or steer the cosmos ship. */
export function useCommandRunner() {
  const navigate = useNavigate();
  const { toggle } = useTheme();

  return useCallback(
    (cmd: Command) => {
      const a = cmd.action;
      if (a.type === "nav") {
        navigate({ to: a.to as never });
        if (a.hash) {
          window.setTimeout(() => {
            document.getElementById(a.hash!)?.scrollIntoView({ behavior: "smooth" });
          }, 500);
        }
      } else if (a.type === "theme") {
        toggle();
      } else if (a.type === "cosmos") {
        const fire = () => window.dispatchEvent(new CustomEvent(COSMOS_EVENT, { detail: a.action }));
        if (window.location.pathname !== "/cosmos") {
          navigate({ to: "/cosmos" });
          window.setTimeout(fire, 1500);
        } else {
          fire();
        }
      } else if (a.type === "project") {
        navigate({ to: "/projects" });
      }
    },
    [navigate, toggle],
  );
}
