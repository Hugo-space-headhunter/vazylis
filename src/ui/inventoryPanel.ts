import { ARMOR_SLOTS, WEAPON_FAMILIES, type ArmorSlotId, type WeaponFamilyId } from "../config/items";
import { RARITIES, type RarityId } from "../config/rarity";
import { RESOURCES, RESOURCE_IDS } from "../config/resources";
import { armorItemDefense, weaponItemDamage } from "../game/item";
import type { InventoryItem, InventoryState } from "../game/inventory";

type SelectionRef =
  | { source: "bag"; instanceId: string }
  | { source: "equipped-weapon" }
  | { source: "equipped-armor"; slotId: ArmorSlotId };

export interface InventoryPanel {
  open(inventory: InventoryState): void;
  refresh(inventory: InventoryState): void;
  onEquip(callback: (instanceId: string) => void): void;
  onUnequipWeapon(callback: () => void): void;
  onUnequipArmor(callback: (slotId: ArmorSlotId) => void): void;
  onRecycle(callback: (instanceId: string) => void): void;
}

function itemName(item: InventoryItem): string {
  const base = item.kind === "weapon" ? WEAPON_FAMILIES[item.familyId as WeaponFamilyId].name : ARMOR_SLOTS[item.familyId as ArmorSlotId].name;
  return `${base} (niv. ${item.level})`;
}

function itemStatsText(item: InventoryItem): string {
  const rarityLabel = RARITIES[item.rarity as RarityId].label;
  const qualityPercent = Math.round(item.quality * 100);
  if (item.kind === "weapon") {
    const family = WEAPON_FAMILIES[item.familyId as WeaponFamilyId];
    const damage = weaponItemDamage(item.level, item.rarity, family, item.quality);
    return `Rareté : ${rarityLabel}\nQualité : ${qualityPercent} %\nDégâts de l'arme : ${damage}`;
  }
  const defenseValue = armorItemDefense(item.level, item.rarity, item.quality);
  return `Rareté : ${rarityLabel}\nQualité : ${qualityPercent} %\nDéfense : ${defenseValue}`;
}

function shortLabel(item: InventoryItem): string {
  const name = item.kind === "weapon" ? WEAPON_FAMILIES[item.familyId as WeaponFamilyId].name : ARMOR_SLOTS[item.familyId as ArmorSlotId].name;
  return name.slice(0, 3).toUpperCase();
}

/** Fenêtre "Sac à dos" : équipement actuel, grille d'items, et une fiche détail pour équiper/recycler. */
export function createInventoryPanel(capacity: number): InventoryPanel {
  const panel = document.getElementById("inventory-panel") as HTMLElement;
  const equippedContainer = document.getElementById("inventory-equipped") as HTMLElement;
  const resourcesContainer = document.getElementById("inventory-resources") as HTMLElement;
  const grid = document.getElementById("inventory-grid") as HTMLElement;
  const detail = document.getElementById("item-detail") as HTMLElement;
  const detailName = document.getElementById("item-detail-name") as HTMLElement;
  const detailStats = document.getElementById("item-detail-stats") as HTMLElement;
  const primaryButton = document.getElementById("item-detail-primary") as HTMLButtonElement;
  const secondaryButton = document.getElementById("item-detail-secondary") as HTMLButtonElement;
  const closeButton = document.getElementById("inventory-close") as HTMLButtonElement;

  let current: InventoryState | null = null;
  let selection: SelectionRef | null = null;
  let equipCallback: ((instanceId: string) => void) | null = null;
  let unequipWeaponCallback: (() => void) | null = null;
  let unequipArmorCallback: ((slotId: ArmorSlotId) => void) | null = null;
  let recycleCallback: ((instanceId: string) => void) | null = null;

  function selectedItem(): InventoryItem | null {
    if (!current || !selection) return null;
    if (selection.source === "bag") {
      const instanceId = selection.instanceId;
      return current.items.find((i) => i.instanceId === instanceId) ?? null;
    }
    if (selection.source === "equipped-weapon") {
      return current.equipment.weapon;
    }
    return current.equipment.armor[selection.slotId] ?? null;
  }

  function renderDetail(): void {
    const item = selectedItem();
    if (!selection || !item) {
      detail.classList.add("hidden");
      return;
    }
    detail.classList.remove("hidden");
    detailName.textContent = itemName(item);
    detailStats.textContent = itemStatsText(item);

    if (selection.source === "bag") {
      primaryButton.textContent = "Équiper";
      primaryButton.onclick = () => equipCallback?.(item.instanceId);
      secondaryButton.textContent = "Recycler";
      secondaryButton.onclick = () => recycleCallback?.(item.instanceId);
    } else if (selection.source === "equipped-weapon") {
      primaryButton.textContent = "Déséquiper";
      primaryButton.onclick = () => unequipWeaponCallback?.();
      secondaryButton.textContent = "Fermer";
      secondaryButton.onclick = () => {
        selection = null;
        renderDetail();
      };
    } else {
      const slotId = selection.slotId;
      primaryButton.textContent = "Déséquiper";
      primaryButton.onclick = () => unequipArmorCallback?.(slotId);
      secondaryButton.textContent = "Fermer";
      secondaryButton.onclick = () => {
        selection = null;
        renderDetail();
      };
    }
  }

  function renderEquipped(): void {
    if (!current) return;
    equippedContainer.innerHTML = "";

    const weaponRow = document.createElement("div");
    const weapon = current.equipment.weapon;
    weaponRow.className = `equipped-row${weapon ? " filled" : ""}`;
    weaponRow.innerHTML = `<span class="equipped-slot-name">Arme</span><span class="equipped-item-name">${weapon ? itemName(weapon) : "Aucune"}</span>`;
    weaponRow.addEventListener("click", () => {
      if (!weapon) return;
      selection = { source: "equipped-weapon" };
      renderDetail();
    });
    equippedContainer.appendChild(weaponRow);

    for (const slot of Object.values(ARMOR_SLOTS)) {
      const equipped = current.equipment.armor[slot.id];
      const row = document.createElement("div");
      row.className = `equipped-row${equipped ? " filled" : ""}`;
      row.innerHTML = `<span class="equipped-slot-name">${slot.name}</span><span class="equipped-item-name">${equipped ? itemName(equipped) : "Vide"}</span>`;
      row.addEventListener("click", () => {
        if (!equipped) return;
        selection = { source: "equipped-armor", slotId: slot.id };
        renderDetail();
      });
      equippedContainer.appendChild(row);
    }
  }

  function renderResources(): void {
    if (!current) return;
    resourcesContainer.innerHTML = "";
    for (const id of RESOURCE_IDS) {
      const count = current.resources[id] ?? 0;
      const item = document.createElement("span");
      item.className = "resource-item";
      item.innerHTML = `<span class="resource-count">${count}</span> ${RESOURCES[id].name}`;
      resourcesContainer.appendChild(item);
    }
  }

  function renderGrid(): void {
    if (!current) return;
    grid.innerHTML = "";
    for (let i = 0; i < capacity; i++) {
      const item = current.items[i];
      const slotEl = document.createElement("div");
      if (!item) {
        slotEl.className = "item-slot empty";
        grid.appendChild(slotEl);
        continue;
      }
      slotEl.className = `item-slot rarity-${item.rarity}`;
      slotEl.textContent = shortLabel(item);
      slotEl.addEventListener("click", () => {
        selection = { source: "bag", instanceId: item.instanceId };
        renderDetail();
      });
      grid.appendChild(slotEl);
    }
  }

  function renderAll(): void {
    renderEquipped();
    renderResources();
    renderGrid();
    renderDetail();
  }

  closeButton.addEventListener("click", () => {
    panel.classList.add("hidden");
  });

  return {
    open(inventory) {
      current = inventory;
      selection = null;
      renderAll();
      panel.classList.remove("hidden");
    },
    refresh(inventory) {
      current = inventory;
      // Si l'item sélectionné a disparu (équipé, recyclé...), on referme la fiche détail.
      if (selection && !selectedItem()) {
        selection = null;
      }
      renderAll();
    },
    onEquip(callback) {
      equipCallback = callback;
    },
    onUnequipWeapon(callback) {
      unequipWeaponCallback = callback;
    },
    onUnequipArmor(callback) {
      unequipArmorCallback = callback;
    },
    onRecycle(callback) {
      recycleCallback = callback;
    },
  };
}
