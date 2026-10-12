# Cosmos landing, project worlds, GitHub token, AETHER commands, live presence

## 1. Landing physics in /cosmos
- Each planet gets gravity, an atmosphere band and a surface radius.
- Ship controls: W/S thrust, Shift/Ctrl altitude up/down, Q/E roll, Space retro-burn, L to toggle landing gear.
- HUD adds altitude, vertical speed, fuel, tilt and a landing-stability meter (green/amber/red).
- Touchdown checks speed (< 4 m/s) and tilt (< 12°). A soft landing locks the ship to the surface. A hard landing shakes the camera and bounces the ship (no game over).
- "Take off" (key T or an AETHER command) burns the ship back to orbit.

## 2. Project deep-dive worlds
- Flagship projects become named planets in a "Portfolio System": Dravik, SmartAid, Anubhav, Nirbhay AI, OptiTask.
- Landing opens a full-screen deep-dive panel with tabs: Story, Tech stack, Demos (screens, links, GitHub repo), Timeline.
- The surface scene has a themed diorama: Earth-like globe for Dravik, clinic for SmartAid, temple hills for Anubhav, command center for Nirbhay.

## 3. Optional GitHub token
- Visitors can paste their own GitHub token in a "Boost API" panel on /about. It is kept only in their browser and sent per request.
- You get a server-side token secret as the default. When it's set, everyone gets higher limits and fresher data.
- Repo cards show the language, stars, last commit and a link to each repo.

## 4. Universal AETHER command interface
- Press Cmd/Ctrl+K anywhere to open a command palette with quick actions: Open Dravik, Show certs, Take off, Land, Go to Cosmos, Toggle theme, Show live status.
- Natural language goes to AETHER's brain, which returns a structured action. Actions that change or move things show a confirm chip ("Open Dravik? Yes / No").
- New action markers: open project, show section, take off, land, open profile.
- Smoother avatar: animation easing between forms, idle breathing, reactions on each command (Framer Motion + the existing 3D avatar).

## 5. Live presence dashboard ("Now")
- A new /now page plus a compact widget in AETHER's HUD.
- Mini cards: GitHub (recent activity and commits), LeetCode (recent solves), Codeforces (latest contest and rating), CodeChef, GFG, HackerRank.
- An "Online" indicator based on activity from the last 15 minutes.
- LinkedIn and Instagram don't offer public live data. They appear as profile cards with links only, not live feeds.
- Live location: owner-only and opt-in. A private /now/share page you open on your phone sends your location every few minutes. The public site shows it at city level only, never exact coordinates, for your safety. This needs Lovable Cloud to store the latest position and a sign-in so only you can update it.

## Technical details
- Physics: custom per-frame integrator (gravity, drag, thrust) in cosmos.tsx. Delta-clamped damping; no Rapier needed for a single body.
- Project data moves into src/data/projects.ts and is shared by /projects, cosmos planets and AETHER.
- GitHub: getCodingStats accepts an optional token header; server falls back to GITHUB_TOKEN; cache key includes token presence. Add events API (/users/:u/events/public).
- Commands: src/lib/aether-commands.ts registry (id, label, match patterns, run, needsConfirm). Brain returns markers mapped onto it; local regex fast-path for common phrases.
- Location: Cloud table `presence` (city, updated_at), RLS write limited to the owner role, public read of city only. Uses browser Geolocation + reverse geocode to city.
- Tests: landing-threshold rule and command matcher.

## Open points
- Lovable Cloud gets enabled for location and sign-in.
- You'll be asked for a GitHub personal access token (read-only public scope).
