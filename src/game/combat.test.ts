import { describe, expect, it } from "vitest";
import { playerBaseDamage, playerMaxHp, rollPlayerDamage } from "./combat";

describe("playerBaseDamage", () => {
  it("augmente avec le niveau", () => {
    expect(playerBaseDamage(5)).toBeGreaterThan(playerBaseDamage(1));
  });
});

describe("playerMaxHp", () => {
  it("augmente avec le niveau", () => {
    expect(playerMaxHp(10)).toBeGreaterThan(playerMaxHp(1));
  });
});

describe("rollPlayerDamage", () => {
  it("n'est pas critique quand le tirage dépasse la chance de critique", () => {
    const roll = rollPlayerDamage(1, 0.99);
    expect(roll.isCritical).toBe(false);
    expect(roll.amount).toBe(Math.round(playerBaseDamage(1)));
  });

  it("est critique quand le tirage est sous la chance de critique, et fait plus de dégâts", () => {
    const normal = rollPlayerDamage(1, 0.99);
    const critical = rollPlayerDamage(1, 0);
    expect(critical.isCritical).toBe(true);
    expect(critical.amount).toBeGreaterThan(normal.amount);
  });
});
