import { describe, expect, it } from "vitest";
import {
  addItem,
  addResource,
  createEmptyInventory,
  equipItem,
  recycleItem,
  unequipArmor,
  unequipWeapon,
  type InventoryItem,
} from "./inventory";

function makeWeapon(instanceId: string, familyId = "dagues" as const): InventoryItem {
  return { instanceId, kind: "weapon", familyId, level: 5, rarity: "standard", quality: 0.9 };
}

function makeArmor(instanceId: string, familyId = "casque" as const): InventoryItem {
  return { instanceId, kind: "armor", familyId, level: 5, rarity: "standard", quality: 0.9 };
}

describe("addItem", () => {
  it("ajoute l'item si une case est libre", () => {
    const { state, added } = addItem(createEmptyInventory(), makeWeapon("a"), 1);
    expect(added).toBe(true);
    expect(state.items).toHaveLength(1);
  });

  it("refuse l'ajout si le sac est plein", () => {
    const base = addItem(createEmptyInventory(), makeWeapon("a"), 1).state;
    const { added } = addItem(base, makeWeapon("b"), 1);
    expect(added).toBe(false);
  });
});

describe("equipItem", () => {
  it("équipe une arme et la retire du sac", () => {
    const base = addItem(createEmptyInventory(), makeWeapon("a"), 10).state;
    const result = equipItem(base, "a");
    expect(result.equipment.weapon?.instanceId).toBe("a");
    expect(result.items).toHaveLength(0);
  });

  it("remet l'ancienne arme dans le sac en équipant une nouvelle", () => {
    let state = addItem(createEmptyInventory(), makeWeapon("a"), 10).state;
    state = equipItem(state, "a");
    state = addItem(state, makeWeapon("b"), 10).state;
    state = equipItem(state, "b");

    expect(state.equipment.weapon?.instanceId).toBe("b");
    expect(state.items.map((i) => i.instanceId)).toEqual(["a"]);
  });

  it("équipe une armure dans le bon emplacement", () => {
    const base = addItem(createEmptyInventory(), makeArmor("c", "casque"), 10).state;
    const result = equipItem(base, "c");
    expect(result.equipment.armor.casque?.instanceId).toBe("c");
  });

  it("peut équiper une arme et une armure en même temps, sans se gêner", () => {
    let state = addItem(createEmptyInventory(), makeWeapon("a"), 10).state;
    state = addItem(state, makeArmor("c", "casque"), 10).state;
    state = equipItem(state, "a");
    state = equipItem(state, "c");
    expect(state.equipment.weapon?.instanceId).toBe("a");
    expect(state.equipment.armor.casque?.instanceId).toBe("c");
    expect(state.items).toHaveLength(0);
  });
});

describe("unequipWeapon / unequipArmor", () => {
  it("remet l'arme dans le sac si une case est libre", () => {
    let state = addItem(createEmptyInventory(), makeWeapon("a"), 10).state;
    state = equipItem(state, "a");
    state = unequipWeapon(state, 10);
    expect(state.equipment.weapon).toBeNull();
    expect(state.items.map((i) => i.instanceId)).toEqual(["a"]);
  });

  it("ne retire pas l'arme si le sac est plein", () => {
    let state = addItem(createEmptyInventory(), makeWeapon("a"), 1).state;
    state = equipItem(state, "a");
    state = addItem(state, makeWeapon("b"), 1).state; // remplit la seule case
    state = unequipWeapon(state, 1);
    expect(state.equipment.weapon?.instanceId).toBe("a");
  });

  it("remet une pièce d'armure dans le sac", () => {
    let state = addItem(createEmptyInventory(), makeArmor("c"), 10).state;
    state = equipItem(state, "c");
    state = unequipArmor(state, "casque", 10);
    expect(state.equipment.armor.casque).toBeUndefined();
    expect(state.items.map((i) => i.instanceId)).toEqual(["c"]);
  });
});

describe("recycleItem", () => {
  it("retire l'item du sac définitivement", () => {
    const base = addItem(createEmptyInventory(), makeWeapon("a"), 10).state;
    const result = recycleItem(base, "a");
    expect(result.items).toHaveLength(0);
  });
});

describe("addResource", () => {
  it("ajoute une ressource inédite", () => {
    const state = addResource(createEmptyInventory(), "fer", 2);
    expect(state.resources.fer).toBe(2);
  });

  it("cumule avec la quantité déjà présente", () => {
    let state = addResource(createEmptyInventory(), "fer", 2);
    state = addResource(state, "fer", 3);
    expect(state.resources.fer).toBe(5);
  });

  it("ignore une quantité nulle ou négative", () => {
    const state = addResource(createEmptyInventory(), "fer", 0);
    expect(state.resources.fer).toBeUndefined();
  });
});
