import { describe, expect, it } from "vitest";
import { playerBaseDamage, playerMaxHp, rollPlayerDamage } from "./combat";
import { EMPTY_STATS, type PlayerStats } from "./stats";

const withForce = (force: number): PlayerStats => ({ ...EMPTY_STATS, force });
const withAgilite = (agilite: number): PlayerStats => ({ ...EMPTY_STATS, agilite });

describe("playerBaseDamage", () => {
  it("augmente avec la Force", () => {
    expect(playerBaseDamage(10)).toBeGreaterThan(playerBaseDamage(0));
  });
});

describe("playerMaxHp", () => {
  it("augmente avec le niveau", () => {
    expect(playerMaxHp(10, 0)).toBeGreaterThan(playerMaxHp(1, 0));
  });

  it("augmente avec la Vitalité", () => {
    expect(playerMaxHp(1, 10)).toBeGreaterThan(playerMaxHp(1, 0));
  });
});

describe("rollPlayerDamage", () => {
  it("n'est pas critique quand le tirage dépasse la chance de critique", () => {
    const roll = rollPlayerDamage(EMPTY_STATS, 0.99);
    expect(roll.isCritical).toBe(false);
    expect(roll.amount).toBe(Math.round(playerBaseDamage(0)));
  });

  it("est critique quand le tirage est sous la chance de critique, et fait plus de dégâts", () => {
    const normal = rollPlayerDamage(EMPTY_STATS, 0.99);
    const critical = rollPlayerDamage(EMPTY_STATS, 0);
    expect(critical.isCritical).toBe(true);
    expect(critical.amount).toBeGreaterThan(normal.amount);
  });

  it("un build Force fait plus de dégâts qu'un build Agilité à chance égale", () => {
    const force = rollPlayerDamage(withForce(20), 0.99);
    const agilite = rollPlayerDamage(withAgilite(20), 0.99);
    expect(force.amount).toBeGreaterThan(agilite.amount);
  });

  it("un build Agilité critique plus souvent (chance de critique plus haute)", () => {
    // Un tirage à 10 % : raté avec 5 % de base (0 Agilité), réussi avec le bonus d'Agilité.
    const base = rollPlayerDamage(EMPTY_STATS, 0.1);
    const agilite = rollPlayerDamage(withAgilite(100), 0.1);
    expect(base.isCritical).toBe(false);
    expect(agilite.isCritical).toBe(true);
  });
});
