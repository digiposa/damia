import type { ItemKind } from '@data/items';
import { xpToNext } from '@data/progression';
import type { HotbarSlot } from '@ui/Hotbar';

const KEY = 'damia.save';

/** V1 (pre-M9): no inventory, no hotbar bindings, no progression. */
interface SaveDataV1Wire {
  schemaVersion: 1;
  zone: 'forest';
  player: { hp: number; maxHp: number; gx: number; gy: number };
  savedAtMs: number;
}

/** V2 (M9): adds inventory (items + gold) and hotbar slot bindings. */
interface SaveDataV2Wire {
  schemaVersion: 2;
  zone: 'forest';
  player: { hp: number; maxHp: number; gx: number; gy: number };
  inventory: { items: Partial<Record<ItemKind, number>>; gold: number };
  hotbar: ReadonlyArray<HotbarSlot>;
  savedAtMs: number;
}

/** V3: adds character progression (level / xp / xpToNext). */
export interface SaveDataV3 {
  schemaVersion: 3;
  zone: 'forest';
  player: { hp: number; maxHp: number; gx: number; gy: number };
  inventory: { items: Partial<Record<ItemKind, number>>; gold: number };
  hotbar: ReadonlyArray<HotbarSlot>;
  progression: { level: number; xp: number; xpToNext: number };
  savedAtMs: number;
}

/** Public alias used by callers — always points at the latest schema. */
export type SaveDataV1 = SaveDataV3;
export type SaveDataV2 = SaveDataV3;

const DEFAULT_HOTBAR: ReadonlyArray<HotbarSlot> = [
  { kind: 'addition', addition: 'doubleSlash' },
  null,
  null,
  null,
  null,
  null,
  null,
  null,
];

function migrateV1ToV2(v1: SaveDataV1Wire): SaveDataV2Wire {
  return {
    schemaVersion: 2,
    zone: v1.zone,
    player: v1.player,
    inventory: { items: {}, gold: 0 },
    hotbar: DEFAULT_HOTBAR,
    savedAtMs: v1.savedAtMs,
  };
}

function migrateV2ToV3(v2: SaveDataV2Wire): SaveDataV3 {
  return {
    schemaVersion: 3,
    zone: v2.zone,
    player: v2.player,
    inventory: v2.inventory,
    hotbar: v2.hotbar,
    progression: { level: 1, xp: 0, xpToNext: xpToNext(1) },
    savedAtMs: v2.savedAtMs,
  };
}

export const SaveManager = {
  save(payload: Omit<SaveDataV3, 'schemaVersion' | 'savedAtMs'>): void {
    const data: SaveDataV3 = { schemaVersion: 3, savedAtMs: Date.now(), ...payload };
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('[SaveManager] failed to persist save:', e);
    }
  },

  load(): SaveDataV3 | null {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { schemaVersion?: number };
      if (parsed.schemaVersion === 3) return parsed as SaveDataV3;
      if (parsed.schemaVersion === 2) return migrateV2ToV3(parsed as SaveDataV2Wire);
      if (parsed.schemaVersion === 1) {
        return migrateV2ToV3(migrateV1ToV2(parsed as SaveDataV1Wire));
      }
      return null;
    } catch {
      return null;
    }
  },

  has(): boolean {
    return SaveManager.load() !== null;
  },

  clear(): void {
    try {
      localStorage.removeItem(KEY);
    } catch {
      // ignore
    }
  },
};
