// Data catalogue for the /cosmos explorer. Distances are stylized, not to scale.

export type Body = {
  id: string;
  name: string;
  kind: "star" | "planet" | "dwarf" | "moon" | "blackhole" | "nebula" | "galaxy" | "cluster";
  color: string;
  radius: number; // scene units
  orbit?: number; // scene units from parent
  speed?: number; // radians / second
  tilt?: number;
  emissive?: number;
  ring?: { inner: number; outer: number; color: string };
  blurb: string;
  facts: string[];
};

export const SOLAR: Body[] = [
  {
    id: "sun",
    name: "The Sun",
    kind: "star",
    color: "#ffcf6e",
    radius: 2.2,
    emissive: 2.5,
    blurb: "A G-type main-sequence star, our anchor for 4.6 billion years.",
    facts: ["Surface ~5,500 °C", "Core ~15 million °C", "Contains 99.86% of the system's mass"],
  },
  { id: "mercury", name: "Mercury", kind: "planet", color: "#a78d70", radius: 0.28, orbit: 4, speed: 1.2, blurb: "Iron core, no atmosphere, extremes on both faces.", facts: ["Day: 176 Earth days", "No moons", "Temp: -180 to 430 °C"] },
  { id: "venus", name: "Venus", kind: "planet", color: "#e6b877", radius: 0.5, orbit: 5.6, speed: 0.9, blurb: "Runaway greenhouse; the solar system's hottest surface.", facts: ["Surface: 465 °C", "Atmosphere: 96% CO₂", "Rotates backwards"] },
  { id: "earth", name: "Earth", kind: "planet", color: "#4ea8ff", radius: 0.55, orbit: 7.2, speed: 0.7, blurb: "The only place we know that knows it exists.", facts: ["Age: 4.54 Gyr", "1 moon", "71% ocean surface"] },
  { id: "mars", name: "Mars", kind: "planet", color: "#c8654d", radius: 0.42, orbit: 8.8, speed: 0.55, blurb: "Rust-red desert, ice caps, and one very large volcano.", facts: ["Olympus Mons: 22 km tall", "2 moons: Phobos, Deimos", "Day ~24h 37m"] },
  { id: "jupiter", name: "Jupiter", kind: "planet", color: "#d5a06a", radius: 1.2, orbit: 12, speed: 0.32, blurb: "Gas giant; a failed star with a 400-year storm.", facts: ["95 known moons", "Great Red Spot ~1.3× Earth wide", "Radiates more heat than it receives"] },
  {
    id: "saturn",
    name: "Saturn",
    kind: "planet",
    color: "#e8c98b",
    radius: 1.0,
    orbit: 15.5,
    speed: 0.24,
    ring: { inner: 1.3, outer: 2.1, color: "#e2c185" },
    blurb: "Ice-and-rock rings, a hexagonal storm at the north pole.",
    facts: ["Density < water", "146 moons and counting", "Rings: 20 m to 1 km thick"],
  },
  { id: "uranus", name: "Uranus", kind: "planet", color: "#88d0d6", radius: 0.85, orbit: 19, speed: 0.18, blurb: "Tipped on its side, methane sky, oddly quiet.", facts: ["Axial tilt: 98°", "27 moons", "Winds up to 900 km/h"] },
  { id: "neptune", name: "Neptune", kind: "planet", color: "#3c66d0", radius: 0.82, orbit: 22, speed: 0.14, blurb: "Deep-blue wind giant, found by math before by telescope.", facts: ["Fastest winds in the system", "14 moons", "1 year = 165 Earth years"] },
  { id: "pluto", name: "Pluto", kind: "dwarf", color: "#c8b298", radius: 0.2, orbit: 26, speed: 0.09, blurb: "Icy dwarf with a heart-shaped nitrogen plain.", facts: ["5 moons", "Surface: -230 °C", "Reclassified 2006"] },
];

export const NEAR_STARS: Body[] = [
  { id: "proxima", name: "Proxima Centauri", kind: "star", color: "#ff8a5c", radius: 0.6, emissive: 1.6, blurb: "Nearest known star to the Sun; hosts Proxima b.", facts: ["Distance: 4.24 ly", "Red dwarf", "Flare star"] },
  { id: "alphacen", name: "Alpha Centauri A/B", kind: "star", color: "#fff2c4", radius: 0.9, emissive: 1.8, blurb: "Sun-like binary with Proxima as a distant companion.", facts: ["Distance: 4.37 ly", "Two Sun-like stars", "Discovered 1689"] },
  { id: "barnard", name: "Barnard's Star", kind: "star", color: "#ff6b3c", radius: 0.4, emissive: 1.4, blurb: "The fastest-moving star across our sky.", facts: ["Distance: 5.96 ly", "Red dwarf", "Proper motion: 10.3\"/yr"] },
  { id: "sirius", name: "Sirius", kind: "star", color: "#c9e2ff", radius: 1.4, emissive: 2.4, blurb: "The brightest star in Earth's night sky.", facts: ["Distance: 8.6 ly", "Binary with a white dwarf", "Twice as massive as the Sun"] },
  { id: "epsilon", name: "Epsilon Eridani", kind: "star", color: "#ffb968", radius: 0.85, emissive: 1.6, blurb: "Young K-type star with a debris disk.", facts: ["Distance: 10.5 ly", "~800 Myr old", "Hosts at least 1 planet"] },
  { id: "vega", name: "Vega", kind: "star", color: "#dceaff", radius: 1.6, emissive: 2.6, blurb: "One of the first stars ever photographed.", facts: ["Distance: 25 ly", "Rotates in 12.5 h", "Zero-point of magnitude scale"] },
  { id: "arcturus", name: "Arcturus", kind: "star", color: "#ffb15a", radius: 2.0, emissive: 2.2, blurb: "Red giant older than the Sun, racing through the halo.", facts: ["Distance: 37 ly", "Age: ~7.1 Gyr", "170× Sun's luminosity"] },
  { id: "betelgeuse", name: "Betelgeuse", kind: "star", color: "#ff6a4a", radius: 3.6, emissive: 2.8, blurb: "Red supergiant that will one day go supernova.", facts: ["Distance: ~640 ly", "Radius: ~700× Sun", "May explode within 100k yrs"] },
];

export const BLACK_HOLES: Body[] = [
  { id: "sgra", name: "Sagittarius A*", kind: "blackhole", color: "#ffaa66", radius: 1.0, blurb: "The 4-million-solar-mass giant at the Milky Way's heart.", facts: ["Distance: 26,000 ly", "Mass: 4.1M ☉", "Imaged 2022 (EHT)"] },
  { id: "m87", name: "M87*", kind: "blackhole", color: "#ffb070", radius: 1.6, blurb: "First black hole ever imaged (2019).", facts: ["Distance: 55 Mly", "Mass: 6.5 B ☉", "Jet extends 5,000 ly"] },
  { id: "cyg", name: "Cygnus X-1", kind: "blackhole", color: "#ff9060", radius: 0.7, blurb: "First widely accepted stellar-mass black hole.", facts: ["Distance: 7,200 ly", "Mass: ~21 ☉", "Discovered 1964"] },
  { id: "ton618", name: "TON 618", kind: "blackhole", color: "#ffc080", radius: 2.2, blurb: "Ultramassive; ~66 billion solar masses.", facts: ["Distance: 10.4 Gly", "Mass: 66 B ☉", "Powers a hyperluminous quasar"] },
];

export const DEEP_SKY: Body[] = [
  { id: "andromeda", name: "Andromeda Galaxy", kind: "galaxy", color: "#b5c9ff", radius: 3.5, blurb: "Our closest large galactic neighbor; will merge with us in ~4.5 Gyr.", facts: ["Distance: 2.5 Mly", "1 trillion stars", "Diameter: 220,000 ly"] },
  { id: "pillars", name: "Pillars of Creation", kind: "nebula", color: "#c4a4ff", radius: 2.2, blurb: "Star-forming trunks of gas inside the Eagle Nebula.", facts: ["Distance: 6,500 ly", "~5 ly tall", "Photographed by Hubble & JWST"] },
  { id: "orionneb", name: "Orion Nebula", kind: "nebula", color: "#ff8ac0", radius: 2.5, blurb: "The nearest region of massive star formation.", facts: ["Distance: 1,344 ly", "24 ly across", "Contains the Trapezium cluster"] },
  { id: "crab", name: "Crab Nebula", kind: "nebula", color: "#8fffbe", radius: 1.6, blurb: "Remnant of a supernova witnessed in 1054 AD.", facts: ["Distance: 6,500 ly", "Expands 1,500 km/s", "Hosts a 33 ms pulsar"] },
  { id: "virgo", name: "Virgo Cluster", kind: "cluster", color: "#ffe8a8", radius: 4.0, blurb: "1,300+ galaxies bound by gravity; the nearest large cluster.", facts: ["Distance: 54 Mly", "Center of the Local Supercluster", "Home to M87"] },
  { id: "coma", name: "Coma Cluster", kind: "cluster", color: "#a8e2ff", radius: 3.6, blurb: "One of the densest galaxy clusters; where dark matter was first inferred.", facts: ["Distance: 320 Mly", ">1,000 galaxies", "Studied by Zwicky in 1933"] },
];

export type Scene =
  | { id: "solar"; label: "Solar System"; scale: "AU"; blurb: string }
  | { id: "stars"; label: "Nearby Stars"; scale: "ly"; blurb: string }
  | { id: "galaxy"; label: "The Milky Way"; scale: "kly"; blurb: string }
  | { id: "blackholes"; label: "Black Holes"; scale: "varies"; blurb: string }
  | { id: "deep"; label: "Deep Sky"; scale: "Mly"; blurb: string }
  | { id: "universe"; label: "Observable Universe"; scale: "Gly"; blurb: string };

export const SCENES: Scene[] = [
  { id: "solar", label: "Solar System", scale: "AU", blurb: "Our home system — one star, eight planets, one dwarf." },
  { id: "stars", label: "Nearby Stars", scale: "ly", blurb: "The closest suns in our galactic neighborhood." },
  { id: "galaxy", label: "The Milky Way", scale: "kly", blurb: "A barred spiral, 100,000 ly wide, home to ~200 billion stars." },
  { id: "blackholes", label: "Black Holes", scale: "varies", blurb: "Where spacetime bends past the point of return." },
  { id: "deep", label: "Deep Sky", scale: "Mly", blurb: "Nebulae, galaxies, and clusters beyond the Milky Way." },
  { id: "universe", label: "Observable Universe", scale: "Gly", blurb: "The cosmic web — 93 billion light-years across." },
];
