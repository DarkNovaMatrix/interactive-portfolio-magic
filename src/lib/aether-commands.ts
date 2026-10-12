import { PROJECT_DEEP_DIVES } from "@/data/projects";

/**
 * Universal AETHER command registry. Pure and framework-free so it can be
 * shared by the command palette, the chat HUD fast-path and tests.
 */
export type CommandAction =
  | { type: "nav"; to: string; hash?: string }
  | { type: "project"; id: string }
  | { type: "cosmos"; action: "takeoff" | "land" }
  | { type: "theme" };

export type Command = {
  id: string;
  label: string;
  hint: string;
  /** Actions that change where you are or what is on screen ask first. */
  confirm: boolean;
  action: CommandAction;
  patterns: RegExp[];
};

const NAV: [string, string, string, RegExp][] = [
  ["home", "Go home", "/", /\b(home|start|landing)\b/],
  ["about", "Open profile", "/about", /\b(about|profile|dossier|who is)\b/],
  ["projects", "Open all projects", "/projects", /\b(projects|work|portfolio)\b/],
  ["cosmos", "Open Cosmos", "/cosmos", /\b(cosmos|universe|space|galaxy)\b/],
  ["now", "Show what Amish is doing now", "/now", /\b(now|activity|live|online|doing)\b/],
  ["links", "Open all links", "/links", /\b(links|socials|contact)\b/],
  ["aether", "Visit AETHER's house", "/aether", /\b(aether'?s? (house|home|cockpit)|cockpit)\b/],
];

export const COMMANDS: Command[] = [
  ...PROJECT_DEEP_DIVES.map<Command>((p) => ({
    id: `project-${p.id}`,
    label: `Open ${p.title}`,
    hint: p.tag,
    confirm: true,
    action: { type: "project", id: p.id },
    patterns: [new RegExp(`\\b${p.id === "tor" ? "tor|threat" : p.title.split(" ")[0]!.toLowerCase()}\\b`)],
  })),
  {
    id: "certs",
    label: "Show certifications",
    hint: "Hackathons & certificates",
    confirm: false,
    action: { type: "nav", to: "/about", hash: "certs" },
    patterns: [/\b(certs?|certificates?|certifications?|hackathons?)\b/],
  },
  {
    id: "takeoff",
    label: "Take off",
    hint: "Launch from the surface in Cosmos",
    confirm: true,
    action: { type: "cosmos", action: "takeoff" },
    patterns: [/\b(take ?off|launch|lift ?off)\b/],
  },
  {
    id: "land",
    label: "Assisted landing",
    hint: "Autopilot a soft touchdown",
    confirm: true,
    action: { type: "cosmos", action: "land" },
    patterns: [/\b(land|touch ?down)\b/],
  },
  {
    id: "theme",
    label: "Toggle theme",
    hint: "Light / dark",
    confirm: false,
    action: { type: "theme" },
    patterns: [/\b(theme|dark mode|light mode|go dark|go light)\b/],
  },
  ...NAV.map<Command>(([id, label, to, re]) => ({
    id: `nav-${id}`,
    label,
    hint: to,
    confirm: false,
    action: { type: "nav", to },
    patterns: [re],
  })),
];

const INTENT = /^(please\s+)?(open|show|go( to)?|take me( to)?|navigate( to)?|launch|start|visit|toggle|switch|take|land|lift|touch)\b/;

/**
 * Match a natural request to a command. Requires an action verb so that
 * questions like "what is dravik?" stay with the AI instead of navigating.
 */
export function matchCommand(text: string): Command | null {
  const t = text.toLowerCase().trim().replace(/[.!?]+$/, "");
  if (!t || !INTENT.test(t)) return null;
  return COMMANDS.find((c) => c.patterns.some((p) => p.test(t))) ?? null;
}

export const COSMOS_PENDING_KEY = "cosmos:pending";
export const COSMOS_EVENT = "aether:cosmos";
export const AETHER_DO_EVENT = "aether:do";
export const AETHER_ASK_EVENT = "aether:ask";
