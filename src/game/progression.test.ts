import { describe, expect, it } from "vitest";
import { targetTimeForLevelMinutes } from "./progression";

describe("targetTimeForLevelMinutes", () => {
  it("donne environ 2 minutes au niveau 1", () => {
    expect(targetTimeForLevelMinutes(1)).toBeCloseTo(2.08, 1);
  });

  it("donne environ 5 minutes au niveau 20", () => {
    expect(targetTimeForLevelMinutes(20)).toBeCloseTo(5, 0);
  });

  it("donne environ 50 minutes au niveau 200", () => {
    expect(targetTimeForLevelMinutes(200)).toBeCloseTo(50, 0);
  });

  it("augmente avec le niveau", () => {
    expect(targetTimeForLevelMinutes(150)).toBeGreaterThan(targetTimeForLevelMinutes(100));
  });
});
