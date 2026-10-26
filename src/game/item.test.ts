import { describe, expect, it } from "vitest";
import { itemPower } from "./item";

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
