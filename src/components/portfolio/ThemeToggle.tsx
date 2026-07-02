import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={`relative inline-flex h-7 w-14 items-center rounded-full border border-current/40 px-0.5 ${className}`}
      data-hover
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`h-6 w-6 rounded-full grid place-items-center text-[10px] ${
          dark ? "ml-auto bg-paper text-ink" : "bg-ink text-paper"
        }`}
      >
        {dark ? "☾" : "☀"}
      </motion.span>
    </button>
  );
}
