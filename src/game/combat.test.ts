import { describe, expect, it } from "vitest";
import { playerBaseDamage, playerMaxHp, rollBlock, rollMonsterBlock, rollPlayerDamage, weaponAttackInterval } from "./combat";
import type { InventoryItem } from "./inventory";
import { EMPTY_STATS, type PlayerStats } from "./stats";

const withForce = (force: number): PlayerStats => ({ ...EMPTY_STATS, force });
const withAgilite = (agilite: number): PlayerStats => ({ ...EMPTY_STATS, agilite });

function makeWeapon(familyId: InventoryItem["familyId"], level = 10, quality = 1): InventoryItem {
  return { instanceId: "w", kind: "weapon", familyId, level, rarity: "standard", quality };
}

describe("playerBaseDamage", () => {
  it("augmente avec la Force", () => {
    expect(playerBaseDamage(withForce(10), null)).toBeGreaterThan(playerBaseDamage(EMPTY_STATS, null));
  });

  it("une arme équipée fait plus de dégâts qu'à mains nues", () => {
    const weapon = makeWeapon("hache_deux_mains");
    expect(playerBaseDamage(EMPTY_STATS, weapon)).toBeGreaterThan(playerBaseDamage(EMPTY_STATS, null));
  });

  it("l'affinité de l'arme augmente ses propres dégâts", () => {
    const weapon = makeWeapon("hache_deux_mains"); // affinité Force
    const sansForce = playerBaseDamage(EMPTY_STATS, weapon);
    const avecForce = playerBaseDamage(withForce(50), weapon);
    expect(avecForce).toBeGreaterThan(sansForce);
  });
});

describe("playerMaxHp", () => {
  it("vaut 215 au niveau 1 sans Vitalité (200 de base + 15 du niveau)", () => {
    expect(playerMaxHp(1, 0)).toBe(215);
  });

  it("augmente avec le niveau", () => {
    expect(playerMaxHp(10, 0)).toBeGreaterThan(playerMaxHp(1, 0));
  });

  it("augmente avec la Vitalité", () => {
    expect(playerMaxHp(1, 10)).toBeGreaterThan(playerMaxHp(1, 0));
  });
});

describe("rollPlayerDamage", () => {
  it("n'est pas critique quand le tirage dépasse la chance de critique", () => {
    const roll = rollPlayerDamage(EMPTY_STATS, null, 0.99);
    expect(roll.isCritical).toBe(false);
    expect(roll.amount).toBe(Math.round(playerBaseDamage(EMPTY_STATS, null)));
  });

  it("est critique quand le tirage est sous la chance de critique, et fait plus de dégâts", () => {
    const normal = rollPlayerDamage(EMPTY_STATS, null, 0.99);
    const critical = rollPlayerDamage(EMPTY_STATS, null, 0);
    expect(critical.isCritical).toBe(true);
    expect(critical.amount).toBeGreaterThan(normal.amount);
  });

  it("un build Force fait plus de dégâts qu'un build Agilité à chance égale", () => {
    const force = rollPlayerDamage(withForce(20), null, 0.99);
    const agilite = rollPlayerDamage(withAgilite(20), null, 0.99);
    expect(force.amount).toBeGreaterThan(agilite.amount);
  });

  it("un build Agilité critique plus souvent (chance de critique plus haute)", () => {
    const base = rollPlayerDamage(EMPTY_STATS, null, 0.1);
    const agilite = rollPlayerDamage(withAgilite(100), null, 0.1);
    expect(base.isCritical).toBe(false);
    expect(agilite.isCritical).toBe(true);
  });

  it("les dagues ajoutent de la chance de critique", () => {
    const sansArme = rollPlayerDamage(EMPTY_STATS, null, 0.12);
    const avecDagues = rollPlayerDamage(EMPTY_STATS, makeWeapon("dagues"), 0.12);
    expect(sansArme.isCritical).toBe(false);
    expect(avecDagues.isCritical).toBe(true);
  });

  it("l'épée à deux mains double les dégâts critiques au lieu de ×1,5", () => {
    const epee = rollPlayerDamage(EMPTY_STATS, makeWeapon("epee_deux_mains"), 0);
    const base = playerBaseDamage(EMPTY_STATS, makeWeapon("epee_deux_mains"));
    expect(epee.amount).toBe(Math.round(base * 2));
  });
});

describe("weaponAttackInterval", () => {
  it("une paire de dagues attaque plus vite qu'une hache à deux mains", () => {
    const dagues = weaponAttackInterval(makeWeapon("dagues"), 1);
    const hache = weaponAttackInterval(makeWeapon("hache_deux_mains"), 1);
    expect(dagues).toBeLessThan(hache);
  });

  it("utilise l'intervalle à mains nues sans arme", () => {
    expect(weaponAttackInterval(null, 1)).toBe(1);
  });
});

describe("rollBlock", () => {
  it("ne bloque jamais sans bouclier", () => {
    expect(rollBlock(makeWeapon("dagues"), 0)).toBe(false);
  });

  it("peut bloquer avec épée et bouclier sous la chance de blocage", () => {
    expect(rollBlock(makeWeapon("epee_bouclier"), 0.05)).toBe(true);
    expect(rollBlock(makeWeapon("epee_bouclier"), 0.5)).toBe(false);
  });
});

describe("rollMonsterBlock", () => {
  it("ne bloque jamais sans chance de blocage", () => {
    expect(rollMonsterBlock(0, 0)).toBe(false);
  });

  it("bloque sous la chance de blocage du monstre", () => {
    expect(rollMonsterBlock(0.25, 0.1)).toBe(true);
    expect(rollMonsterBlock(0.25, 0.5)).toBe(false);
  });
});
