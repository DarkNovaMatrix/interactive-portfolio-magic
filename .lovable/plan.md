## 1. Redesign AETHER's body & movement

Replace the floating morphing orb with a physical, mechanical companion inspired by **TARS (Interstellar)** and **Rocky (Project Hail Mary)** — no more smooth drifts, no ghost-glide.

**New form (`AetherForm3D.tsx` rewrite):**
- Default body: TARS-style monolith — 4 hinged rectangular slabs stacked vertically, matte dark metal with subtle emissive seams and a small screen face.
- Locomotion mode: Rocky-style — same slabs re-arrange into a squat, multi-limbed crawler with 3–4 articulated legs that plant and lift.
- Emotion drives *articulation*, not distortion: excited = faster limb cycle + brighter screen; sleepy = slabs collapse into a low block; focused = upright monolith, screen sharp; playful = cartwheel/segment-flip.
- Screen face uses tiny animated glyphs (dots/bars) reacting to speech + emotion — no smiley faces.

**New movement (`Aether.tsx` rewrite):**
- Snap-and-hold motion instead of continuous floating: it *walks/hops/rolls* between anchor points with easing that mimics weight (fast lift, slow plant).
- Idle: stands still, occasionally shifts weight, screen blinks. No aimless drifting.
- Escort: reconfigures into crawler mode, physically crawls along the viewport toward the target link, plants, then hops to page-top on route change.
- Drag: user can grab it; on release it "catches itself" with a small stumble animation.
- Trail: rare — only during escort/hop, as short thruster puffs, not a constant comet tail.

## 2. New page: `/cosmos` — observable universe explorer

A standalone route where the visitor pilots through a stylized model of everything humans have observed.

**Scenes (nested scale levels, seamlessly zoomable):**
1. **Solar System** — Sun + 8 planets + Pluto + asteroid belt + Kuiper. Click a planet → camera dives, lands on surface with a labeled info card (mass, moons, fun fact, missions).
2. **Local Stars** — Nearest 30 named stars (Proxima, Sirius, Betelgeuse, etc.) as a 3D starfield with correct relative brightness/color.
3. **Milky Way** — Spiral galaxy from outside; click regions (Sgr A*, Orion Arm, our Sun's position) to inspect.
4. **Black holes gallery** — Sgr A*, M87*, Cygnus X-1 with accretion-disk shader and event-horizon lensing effect.
5. **Deep sky** — Famous nebulae + galaxy clusters as a navigable field (Andromeda, Pillars of Creation, Hubble Deep Field backdrop).
6. **Observable universe** — Zoomed-out cosmic-web sphere; hovers show large-scale structure names.

**Controls:**
- WASD + mouse-look for free flight, or scroll wheel to zoom between scale levels.
- "Land" button when near a body — camera drops to surface, HUD info card slides in.
- Scale indicator (AU / ly / Mpc) in a corner HUD.
- AETHER rides along on-screen as a small HUD element, reacting in-character to what you're viewing ("that's a lot of nothing", "Sgr A* — four million suns, one bad neighborhood").

**Tech:**
- R3F scene with instanced meshes for stars, custom shader for accretion disk & sun corona.
- Data-driven: `src/data/cosmos.ts` holds all bodies (name, radius, distance, color, blurb).
- Route: `src/routes/cosmos.tsx` + nav link in `SiteNav`.
- Head metadata set per route (title/description/og).

## 3. Technical notes

- Keep existing `aether-state`, LLM speech, voice — only body + motion change.
- Postprocessing: reuse Bloom; add subtle chromatic aberration on `/cosmos` only.
- Perf: instanced starfield, LOD on planets, pause R3F loops when tab hidden.
- No new packages required (three, drei, r3f, postprocessing already installed).

## 4. Out of scope (ask if you want these)

- Real astronomical positions from live catalogs (would need a data fetch).
- Multiplayer / shared cursors in `/cosmos`.
- VR controls.

Once you approve I'll build both in one pass — companion redesign first, then `/cosmos`.
