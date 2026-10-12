import { describe, expect, it } from "vitest";
import { matchCommand } from "./aether-commands";
import { evaluateTouchdown } from "./landing";

describe("matchCommand", () => {
  it("opens Dravik", () => expect(matchCommand("open Dravik")?.action).toEqual({ type: "project", id: "dravik" }));
  it("shows certs on the about page", () =>
    expect(matchCommand("show my certs")?.action).toEqual({ type: "nav", to: "/about", hash: "certs" }));
  it("takes off", () => expect(matchCommand("take off")?.action).toEqual({ type: "cosmos", action: "takeoff" }));
  it("leaves questions to the AI", () => expect(matchCommand("what is dravik?")).toBeNull());
});

describe("evaluateTouchdown", () => {
  it("is soft at 4 m/s and 12 degrees", () => expect(evaluateTouchdown(-4, 12)).toBe("soft"));
  it("is hard above 4 m/s", () => expect(evaluateTouchdown(-4.1, 0)).toBe("hard"));
  it("is hard above 12 degrees tilt", () => expect(evaluateTouchdown(-1, 12.5)).toBe("hard"));
});
