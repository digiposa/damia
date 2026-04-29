import type { ItemKind } from '@data/items';

/** Maximum distinct item kinds the inventory can hold (counts stack within a slot). */
export const INVENTORY_SLOT_CAP = 32;

/**
 * Player-side inventory. `items` maps a kind to its accumulated count (counts
 * stack inside a slot, so 99 healing potions = 1 slot used). `gold` is its own
 * field — currency doesn't take a slot.
 *
 * The slot cap (`INVENTORY_SLOT_CAP`) applies to the number of distinct keys
 * in `items`, NOT the sum of counts. Adding a 33rd kind when the inventory is
 * full is rejected by ItemPickupSystem (toast "inventaire plein").
 */
export interface Inventory {
  items: Partial<Record<ItemKind, number>>;
  gold: number;
}
