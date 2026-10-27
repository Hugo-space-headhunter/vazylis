import { describe, expect, it } from "vitest";
import { armorItemDefense, itemPower, weaponItemDamage } from "./item";
import { WEAPON_FAMILIES } from "../config/items";

describe("itemPower", () => {
  it("vaut niveau × 1 pour un standard sans amélioration", () => {
    // Exemple du document : un standard niveau 80 a une puissance de 80.
    expect(itemPower(80, "standard")).toBe(80);
  });

  it("vaut niveau × 2,5 pour un transcendant sans amélioration", () => {
    // Exemple du document : un transcendant niveau 50 a une puissance de 125.
    expect(itemPower(50, "transcendant")).toBe(125);
  });

  it("vaut niveau × 1,75 pour un épique sans amélioration", () => {
    // Exemple du document : un épique niveau 110 a une puissance de 192.
    expect(itemPower(110, "epique")).toBe(192);
  });

  it("ajoute le bonus d'amélioration à la puissance de base", () => {
    const sansAmelioration = itemPower(100, "dore", 0);
    const avecAmelioration = itemPower(100, "dore", 5);
    expect(avecAmelioration).toBeGreaterThan(sansAmelioration);
  });
});

describe("weaponItemDamage", () => {
  const hache = WEAPON_FAMILIES.hache_deux_mains;
  const dagues = WEAPON_FAMILIES.dagues;

  it("augmente avec le niveau, la rareté et la qualité", () => {
    expect(weaponItemDamage(10, "standard", hache, 1)).toBeGreaterThan(weaponItemDamage(1, "standard", hache, 1));
    expect(weaponItemDamage(10, "dore", hache, 1)).toBeGreaterThan(weaponItemDamage(10, "standard", hache, 1));
    expect(weaponItemDamage(10, "standard", hache, 1)).toBeGreaterThan(weaponItemDamage(10, "standard", hache, 0.7));
  });

  it("une hache à deux mains fait plus de dégâts qu'une paire de dagues au même niveau", () => {
    expect(weaponItemDamage(10, "standard", hache, 1)).toBeGreaterThan(weaponItemDamage(10, "standard", dagues, 1));
  });
});

describe("armorItemDefense", () => {
  it("augmente avec le niveau et la rareté", () => {
    expect(armorItemDefense(10, "standard", 1)).toBeGreaterThan(armorItemDefense(1, "standard", 1));
    expect(armorItemDefense(10, "dore", 1)).toBeGreaterThan(armorItemDefense(10, "standard", 1));
  });
});
