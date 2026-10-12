import { HANDLES } from "./socials";

/** Deep-dive content shown when the pilot lands on a project-planet in /cosmos. */
export type ProjectDeepDive = {
  id: string;
  title: string;
  tag: string;
  accent: string;
  story: string[];
  tech: { layer: string; items: string[] }[];
  links: { label: string; url: string }[];
  timeline: { when: string; what: string }[];
};

const repoSearch = (q: string) =>
  `https://github.com/${HANDLES.github}?tab=repositories&q=${encodeURIComponent(q)}`;

export const PROJECT_DEEP_DIVES: ProjectDeepDive[] = [
  {
    id: "dravik",
    title: "Dravik",
    tag: "AI travel safety",
    accent: "#5aa9ff",
    story: [
      "Dravik started from a simple fear: getting lost somewhere new with no one knowing where you are.",
      "It grew into a travel-safety layer — an AI assistant, live location sharing with your group, SOS alerts, weather risk and route safety scoring.",
    ],
    tech: [
      { layer: "Client", items: ["Flutter"] },
      { layer: "Backend", items: ["Node.js", "MongoDB", "REST APIs"] },
      { layer: "Intelligence", items: ["LLM travel assistant", "Route risk scoring", "Weather risk"] },
    ],
    links: [{ label: "Repositories", url: repoSearch("dravik") }],
    timeline: [
      { when: "2025", what: "Concept and first prototypes" },
      { when: "2025", what: "SOS, group sync and live location" },
      { when: "Now", what: "AI assistant and route safety" },
    ],
  },
  {
    id: "smartaid",
    title: "SmartAid",
    tag: "Healthcare AI",
    accent: "#9be7c4",
    story: [
      "Doctors lose hours to paperwork. SmartAid turns a doctor's voice note into a structured medical record.",
      "Retrieval-augmented generation keeps answers grounded, and every suggestion explains why it was made.",
    ],
    tech: [
      { layer: "AI", items: ["LLM", "RAG", "Speech-to-text"] },
      { layer: "Platform", items: ["Python", "Java", "APIs"] },
    ],
    links: [{ label: "Repositories", url: repoSearch("smartaid") }],
    timeline: [
      { when: "2024", what: "Emergency triage prototype" },
      { when: "2025", what: "Voice-note to record pipeline" },
      { when: "Now", what: "Explainable clinical decision support" },
    ],
  },
  {
    id: "anubhav",
    title: "Anubhav",
    tag: "Tourism · Jharkhand",
    accent: "#ff7a3c",
    story: [
      "Jharkhand is beautiful and under-explored. Anubhav makes it easy to plan, preview and trust a trip there.",
      "AI itineraries, AR/VR previews of places, blockchain-secured payments and a multilingual chatbot.",
    ],
    tech: [
      { layer: "Apps", items: ["Flutter", "React"] },
      { layer: "Data", items: ["MongoDB", "Firebase"] },
      { layer: "Trust", items: ["Solidity smart contracts"] },
    ],
    links: [{ label: "Repositories", url: repoSearch("anubhav") }],
    timeline: [
      { when: "2025", what: "Smart India Hackathon build" },
      { when: "2025", what: "AR/VR previews and gamification" },
    ],
  },
  {
    id: "nirbhay",
    title: "Nirbhay AI",
    tag: "Emergency dispatch",
    accent: "#ff6ad5",
    story: [
      "Inspired by 911: every second on an emergency call matters.",
      "Nirbhay transcribes calls, uses NLP to rank incidents by urgency and helps dispatchers respond faster.",
    ],
    tech: [
      { layer: "Voice", items: ["Speech-to-text", "Regional languages"] },
      { layer: "AI", items: ["Python", "NLP prioritisation"] },
    ],
    links: [{ label: "Repositories", url: repoSearch("nirbhay") }],
    timeline: [
      { when: "2025", what: "Call transcription and triage" },
      { when: "Next", what: "Pilot with a state police department" },
    ],
  },
  {
    id: "tor",
    title: "TOR Threat Attribution",
    tag: "Research",
    accent: "#c8a2ff",
    story: [
      "A research proposal to the Tamil Nadu Police: an AI-augmented framework for attributing threats on the TOR network.",
      "It combines behavioural analysis with network intelligence to link anonymous activity to patterns.",
    ],
    tech: [{ layer: "Research", items: ["Behavioural analysis", "Network intelligence", "ML"] }],
    links: [],
    timeline: [{ when: "2025", what: "Proposal submitted" }],
  },
  {
    id: "optitask",
    title: "OptiTask",
    tag: "Productivity",
    accent: "#ffe08a",
    story: ["The first product Amish shipped end-to-end: task management paired with light budgeting."],
    tech: [{ layer: "App", items: ["Flutter", "SQLite", "Offline-first"] }],
    links: [{ label: "Repositories", url: repoSearch("optitask") }],
    timeline: [{ when: "2024", what: "Shipped" }],
  },
  {
    id: "library",
    title: "Library System",
    tag: "Foundations",
    accent: "#a5c8c8",
    story: ["Coursework that became a real tool: role-based accounts, fines and search that finds books."],
    tech: [{ layer: "Stack", items: ["Java", "SQL"] }],
    links: [{ label: "Repositories", url: repoSearch("library") }],
    timeline: [{ when: "2024", what: "Built and extended" }],
  },
];

export function getDeepDive(id: string): ProjectDeepDive | undefined {
  return PROJECT_DEEP_DIVES.find((p) => p.id === id);
}
