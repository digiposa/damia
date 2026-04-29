import type { System, World } from '@core/ecs';
import type { Components } from '@gameplay/components';
import { INVENTORY_SLOT_CAP } from '@gameplay/components/Inventory';
import { ITEMS, type ItemKind } from '@data/items';

const PICKUP_RADIUS_PX = 36;

export type ItemPickupResult = 'gold' | 'stored' | 'full';

export interface ItemPickupEvent {
  kind: ItemKind;
  result: ItemPickupResult;
  /** New gold balance (only meaningful when result === 'gold'). */
  gold?: number;
}

export type ItemPickupListener = (event: ItemPickupEvent) => void;

/**
 * Each frame, picks up any Item entity whose Position is within `PICKUP_RADIUS_PX`
 * of the player. Routes the pickup into the player's Inventory:
 *  - `gold` → adds to Inventory.gold (no slot used)
 *  - bindable items → stack in Inventory.items[kind]; rejected if a brand-new
 *    kind would push the distinct-slot count over `INVENTORY_SLOT_CAP`.
 *
 * Fires `onPickup` so the scene can toast / log / play sfx. Result tells the
 * listener what happened so it can branch on full vs stored vs gold.
 */
export class ItemPickupSystem implements System<Components> {
  private listener: ItemPickupListener | null = null;

  onPickup(listener: ItemPickupListener): void {
    this.listener = listener;
  }

  update(_dt: number, world: World<Components>): void {
    const players = world.query(['Player', 'Position']);
    const playerId = players[0];
    if (playerId === undefined) return;
    const ppos = world.getComponent(playerId, 'Position');
    const inv = world.getComponent(playerId, 'Inventory');
    if (!ppos || !inv) return;

    for (const id of world.query(['Item', 'Position'])) {
      const ipos = world.getComponent(id, 'Position');
      const item = world.getComponent(id, 'Item');
      if (!ipos || !item) continue;
      if (Math.hypot(ipos.x - ppos.x, ipos.y - ppos.y) > PICKUP_RADIUS_PX) continue;

      const def = ITEMS[item.kind];
      if (!def.bindable) {
        // Currency. For now the only non-bindable item is `gold`; pickup adds 1.
        // Later we can encode value on the Item entity if we want stack drops.
        inv.gold += 1;
        this.listener?.({ kind: item.kind, result: 'gold', gold: inv.gold });
        world.destroyEntity(id);
        continue;
      }

      const existing = inv.items[item.kind];
      if (existing === undefined) {
        const distinctSlots = Object.keys(inv.items).length;
        if (distinctSlots >= INVENTORY_SLOT_CAP) {
          // Inventory full — leave the entity on the ground so the player can
          // drop something and pick it up later.
          this.listener?.({ kind: item.kind, result: 'full' });
          continue;
        }
        inv.items[item.kind] = 1;
      } else {
        inv.items[item.kind] = existing + 1;
      }
      this.listener?.({ kind: item.kind, result: 'stored' });
      world.destroyEntity(id);
    }
  }

  destroy(): void {
    this.listener = null;
  }
}
