import type { ArmorSlotId } from "../config/items";
import type { GeneratedItem } from "./loot";

export interface InventoryItem extends GeneratedItem {
  instanceId: string;
}

export interface EquipmentState {
  weapon: InventoryItem | null;
  armor: Partial<Record<ArmorSlotId, InventoryItem>>;
}

export interface InventoryState {
  items: InventoryItem[];
  equipment: EquipmentState;
}

export function createEmptyInventory(): InventoryState {
  return { items: [], equipment: { weapon: null, armor: {} } };
}

/** Ajoute un item au sac, si une case est libre. */
export function addItem(
  state: InventoryState,
  item: InventoryItem,
  capacity: number,
): { state: InventoryState; added: boolean } {
  if (state.items.length >= capacity) {
    return { state, added: false };
  }
  return { state: { ...state, items: [...state.items, item] }, added: true };
}

export function removeItem(state: InventoryState, instanceId: string): InventoryState {
  return { ...state, items: state.items.filter((i) => i.instanceId !== instanceId) };
}

export function findItem(state: InventoryState, instanceId: string): InventoryItem | undefined {
  return state.items.find((i) => i.instanceId === instanceId);
}

/** Équipe un item du sac : l'ancien item du même emplacement (s'il y en a un) revient dans le sac. */
export function equipItem(state: InventoryState, instanceId: string): InventoryState {
  const item = findItem(state, instanceId);
  if (!item) return state;

  const itemsWithoutNew = state.items.filter((i) => i.instanceId !== instanceId);

  if (item.kind === "weapon") {
    const previous = state.equipment.weapon;
    const items = previous ? [...itemsWithoutNew, previous] : itemsWithoutNew;
    return { items, equipment: { ...state.equipment, weapon: item } };
  }

  const slotId = item.familyId as ArmorSlotId;
  const previous = state.equipment.armor[slotId];
  const items = previous ? [...itemsWithoutNew, previous] : itemsWithoutNew;
  return {
    items,
    equipment: { ...state.equipment, armor: { ...state.equipment.armor, [slotId]: item } },
  };
}

/** Retire l'arme équipée et la remet dans le sac, si une case est libre. */
export function unequipWeapon(state: InventoryState, capacity: number): InventoryState {
  if (!state.equipment.weapon) return state;
  if (state.items.length >= capacity) return state;
  return {
    items: [...state.items, state.equipment.weapon],
    equipment: { ...state.equipment, weapon: null },
  };
}

/** Retire une pièce d'armure équipée et la remet dans le sac, si une case est libre. */
export function unequipArmor(state: InventoryState, slotId: ArmorSlotId, capacity: number): InventoryState {
  const equipped = state.equipment.armor[slotId];
  if (!equipped) return state;
  if (state.items.length >= capacity) return state;
  const armor = { ...state.equipment.armor };
  delete armor[slotId];
  return { items: [...state.items, equipped], equipment: { ...state.equipment, armor } };
}

/** Recycle un item du sac : pour l'instant, le détruit simplement (l'économie viendra plus tard). */
export function recycleItem(state: InventoryState, instanceId: string): InventoryState {
  return removeItem(state, instanceId);
}
