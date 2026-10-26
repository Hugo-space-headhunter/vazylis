import { describe, expect, it } from "vitest";
import { applyXpGain, requiredXpForLevel, targetTimeForLevelMinutes, xpGainForKill } from "./progression";

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

describe("requiredXpForLevel", () => {
  it("augmente avec le niveau", () => {
    expect(requiredXpForLevel(10)).toBeGreaterThan(requiredXpForLevel(1));
  });

  it("est toujours positif", () => {
    expect(requiredXpForLevel(1)).toBeGreaterThan(0);
  });
});

describe("xpGainForKill", () => {
  it("donne l'XP de base face à un monstre du même niveau", () => {
    expect(xpGainForKill(10, 5, 5)).toBe(10);
  });

  it("donne un bonus face à un monstre plus fort, plafonné à +50 %", () => {
    expect(xpGainForKill(10, 6, 5)).toBeCloseTo(10.5, 5);
    expect(xpGainForKill(10, 30, 5)).toBe(15); // écart énorme, plafonné
  });

  it("réduit l'XP face à un monstre plus faible, avec un minimum symbolique", () => {
    expect(xpGainForKill(10, 4, 5)).toBeCloseTo(9, 5);
    expect(xpGainForKill(10, 1, 20)).toBeCloseTo(1, 5); // écart énorme, minimum de 10 %
  });
});

describe("applyXpGain", () => {
  it("accumule l'XP sans monter de niveau si ce n'est pas assez", () => {
    const result = applyXpGain({ level: 1, xp: 0 }, 1);
    expect(result.level).toBe(1);
    expect(result.xp).toBe(1);
    expect(result.leveledUp).toBe(false);
  });

  it("monte de niveau et conserve l'XP excédentaire", () => {
    const required = requiredXpForLevel(1);
    const result = applyXpGain({ level: 1, xp: 0 }, required + 5);
    expect(result.level).toBe(2);
    expect(result.xp).toBeCloseTo(5, 5);
    expect(result.leveledUp).toBe(true);
  });

  it("peut monter plusieurs niveaux d'un coup avec un gros gain d'XP", () => {
    const result = applyXpGain({ level: 1, xp: 0 }, 1_000_000);
    expect(result.level).toBeGreaterThan(2);
    expect(result.leveledUp).toBe(true);
  });
});
