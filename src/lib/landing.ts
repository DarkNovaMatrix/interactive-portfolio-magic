/** Landing rules for /cosmos. Speeds are in displayed m/s, tilt in degrees. */
export const LANDING_RULES = {
  MAX_SOFT_SPEED: 4,
  MAX_SOFT_TILT_DEG: 12,
} as const;

export type TouchdownResult = "soft" | "hard";
export type Stability = "stable" | "marginal" | "unsafe";

export function evaluateTouchdown(verticalSpeed: number, tiltDeg: number): TouchdownResult {
  return Math.abs(verticalSpeed) <= LANDING_RULES.MAX_SOFT_SPEED &&
    tiltDeg <= LANDING_RULES.MAX_SOFT_TILT_DEG
    ? "soft"
    : "hard";
}

/** Live stability readout while descending. */
export function stabilityOf(verticalSpeed: number, tiltDeg: number): Stability {
  if (evaluateTouchdown(verticalSpeed, tiltDeg) === "hard") return "unsafe";
  const speedRatio = Math.abs(verticalSpeed) / LANDING_RULES.MAX_SOFT_SPEED;
  const tiltRatio = tiltDeg / LANDING_RULES.MAX_SOFT_TILT_DEG;
  return Math.max(speedRatio, tiltRatio) > 0.7 ? "marginal" : "stable";
}
