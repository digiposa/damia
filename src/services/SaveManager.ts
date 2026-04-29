import type { ItemKind } from '@data/items';
import type { HotbarSlot } from '@ui/Hotbar';

const KEY = 'damia.save';

/** V1 (pre-M9): no inventory, no hotbar bindings. */
interface SaveDataV1Wire {
  schemaVersion: 1;
  zone: 'forest';
  player: { hp: number; maxHp: number; gx: number; gy: number };
  savedAtMs: number;
}

/** V2 (M9): adds inventory (items + gold) and hotbar slot bindings. */
export interface SaveDataV2 {
  schemaVersion: 2;
  zone: 'forest';
  player: { hp: number; maxHp: number; gx: number; gy: number };
  inventory: { items: Partial<Record<ItemKind, number>>; gold: number };
  hotbar: ReadonlyArray<HotbarSlot>;
  savedAtMs: number;
}

/** Public alias used by callers — always points at the latest schema. */
export type SaveDataV1 = SaveDataV2;

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

function migrateV1ToV2(v1: SaveDataV1Wire): SaveDataV2 {
  return {
    schemaVersion: 2,
    zone: v1.zone,
    player: v1.player,
    inventory: { items: {}, gold: 0 },
    hotbar: DEFAULT_HOTBAR,
    savedAtMs: v1.savedAtMs,
  };
}

export const SaveManager = {
  save(payload: Omit<SaveDataV2, 'schemaVersion' | 'savedAtMs'>): void {
    const data: SaveDataV2 = { schemaVersion: 2, savedAtMs: Date.now(), ...payload };
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('[SaveManager] failed to persist save:', e);
    }
  },

  load(): SaveDataV2 | null {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { schemaVersion?: number };
      if (parsed.schemaVersion === 2) return parsed as SaveDataV2;
      if (parsed.schemaVersion === 1) return migrateV1ToV2(parsed as SaveDataV1Wire);
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
