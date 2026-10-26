import { describe, expect, it } from "vitest";
import {
  EMPTY_STATS,
  applyDamageReduction,
  attackSpeedMultiplier,
  criticalChance,
  damageReduction,
  defense,
  forceDamageBonus,
  maxHp,
  maxMana,
  pointsEarnedForLevel,
  totalSpentPoints,
  unspentPoints,
} from "./stats";

describe("pointsEarnedForLevel", () => {
  it("donne 4 points par niveau", () => {
    expect(pointsEarnedForLevel(1)).toBe(4);
    expect(pointsEarnedForLevel(5)).toBe(20);
  });
});

describe("unspentPoints", () => {
  it("donne tous les points au départ", () => {
    expect(unspentPoints(1, EMPTY_STATS)).toBe(4);
  });

  it("diminue avec les points déjà placés", () => {
    const stats = { force: 2, agilite: 1, vitalite: 0, intelligence: 0 };
    expect(totalSpentPoints(stats)).toBe(3);
    expect(unspentPoints(1, stats)).toBe(1);
  });
});

describe("forceDamageBonus", () => {
  it("augmente avec la Force", () => {
    expect(forceDamageBonus(10)).toBeGreaterThan(forceDamageBonus(5));
  });
});

describe("criticalChance", () => {
  it("vaut 5 % sans Agilité", () => {
    expect(criticalChance(0)).toBeCloseTo(0.05, 5);
  });

  it("est plafonnée à 60 %", () => {
    expect(criticalChance(100000)).toBe(0.6);
  });
});

describe("attackSpeedMultiplier", () => {
  it("vaut 1 sans Agilité", () => {
    expect(attackSpeedMultiplier(0)).toBe(1);
  });

  it("est plafonnée à 2,5", () => {
    expect(attackSpeedMultiplier(100000)).toBe(2.5);
  });
});

describe("maxHp et defense", () => {
  it("la Vitalité augmente les points de vie", () => {
    expect(maxHp(1, 10, 100, 15)).toBeGreaterThan(maxHp(1, 0, 100, 15));
  });

  it("la Vitalité augmente la défense", () => {
    expect(defense(10)).toBeGreaterThan(defense(0));
  });
});

describe("maxMana", () => {
  it("vaut 150 sans Intelligence (mana de base)", () => {
    expect(maxMana(0)).toBe(150);
  });

  it("augmente avec l'Intelligence", () => {
    expect(maxMana(10)).toBeGreaterThan(maxMana(0));
  });
});

describe("damageReduction / applyDamageReduction", () => {
  it("ne réduit rien sans défense", () => {
    expect(damageReduction(0, 1)).toBe(0);
    expect(applyDamageReduction(100, 0, 1)).toBe(100);
  });

  it("réduit davantage avec plus de défense", () => {
    expect(damageReduction(50, 1)).toBeGreaterThan(damageReduction(10, 1));
  });

  it("est plafonnée à 75 %", () => {
    expect(damageReduction(1000000, 1)).toBeCloseTo(0.75, 5);
  });
});

describe("un build Force contre un build Agilité (critère de réussite de l'étape)", () => {
  it("le build Force fait plus de dégâts par coup", () => {
    const forceBonus = forceDamageBonus(20);
    expect(forceBonus).toBeGreaterThan(0);
  });

  it("le build Agilité attaque plus vite et critique plus souvent", () => {
    expect(attackSpeedMultiplier(20)).toBeGreaterThan(1);
    expect(criticalChance(20)).toBeGreaterThan(0.05);
  });
});
