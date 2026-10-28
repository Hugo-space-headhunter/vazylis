import { describe, expect, it } from "vitest";
import { generateLootItem, rollLootRarities, rollQuality, rollResourceDrop } from "./loot";

describe("rollLootRarities", () => {
  it("ne donne rien si tous les tirages ratent", () => {
    expect(rollLootRarities([1, 1, 1, 1])).toEqual([]);
  });

  it("donne standard si le tirage est sous 8 %", () => {
    expect(rollLootRarities([0.01, 1, 1, 1])).toEqual(["standard"]);
  });

  it("peut donner plusieurs raretés à la fois (tirages indépendants)", () => {
    expect(rollLootRarities([0.01, 0.01, 1, 1])).toEqual(["standard", "argente"]);
  });

  it("donne épique seulement sous 0,05 %", () => {
    expect(rollLootRarities([1, 1, 1, 0.0001])).toEqual(["epique"]);
    expect(rollLootRarities([1, 1, 1, 0.01])).toEqual([]);
  });

  it("utilise la table donnée plutôt que celle des monstres standards", () => {
    const championTable = { argente: 1, dore: 1, epique: 0.03 };
    expect(rollLootRarities([1, 0.5, 0.5, 0.5], championTable)).toEqual(["argente", "dore"]);
    expect(rollLootRarities([1, 0.5, 0.5, 0.5])).toEqual([]);
  });
});

describe("rollResourceDrop", () => {
  it("ne donne rien si le tirage de chance rate", () => {
    expect(rollResourceDrop(0.4, 0, 0)).toBeNull();
  });

  it("donne une ressource si le tirage de chance réussit", () => {
    const drop = rollResourceDrop(0.1, 0, 0);
    expect(drop).not.toBeNull();
    expect(drop?.quantity).toBe(1);
  });

  it("tire la quantité entre le min et le max de la config", () => {
    const drop = rollResourceDrop(0, 0, 0.999, { chance: 1, min: 1, max: 3 });
    expect(drop?.quantity).toBe(3);
  });

  it("respecte un taux garanti (champion, sous-boss)", () => {
    expect(rollResourceDrop(0.99, 0, 0, { chance: 1, min: 1, max: 3 })).not.toBeNull();
  });
});

describe("rollQuality", () => {
  it("vaut 70 % avec un tirage à 0", () => {
    expect(rollQuality(0)).toBeCloseTo(0.7, 5);
  });

  it("vaut 100 % avec un tirage à 1", () => {
    expect(rollQuality(1)).toBeCloseTo(1, 5);
  });
});

describe("generateLootItem", () => {
  it("donne une arme avec kindRandom < 0,5", () => {
    const item = generateLootItem(5, "standard", 0, 0, 0.5);
    expect(item.kind).toBe("weapon");
  });

  it("donne une armure avec kindRandom >= 0,5", () => {
    const item = generateLootItem(5, "standard", 0.9, 0, 0.5);
    expect(item.kind).toBe("armor");
  });

  it("reprend le niveau et la rareté donnés", () => {
    const item = generateLootItem(12, "dore", 0, 0, 0.5);
    expect(item.level).toBe(12);
    expect(item.rarity).toBe("dore");
  });
});
