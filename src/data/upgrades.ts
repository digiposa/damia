/**
 * Per-run upgrade pool for the Survival mode's LevelUpChoiceModal.
 *
 * Each level-up rolls 3 entries from this pool (weighted by rarity),
 * the player picks one, the `apply` function mutates the player's
 * components in place, and the chosen upgrade is recorded in the
 * scene's `runUpgrades` list.
 *
 * Two life-cycle flavours coexist in the same registry:
 *
 *  - Re-applied upgrades (oneShot=false): additive bonuses on stats
 *    that the Dart canonical row overwrites on every level-up
 *    (ATK / DEF / MAT / MDF / HP max). The scene re-applies the
 *    whole stack right after the DeathSystem level-up so the bonus
 *    survives.
 *
 *  - One-shot upgrades (oneShot=true): bonuses on fields the Dart
 *    row doesn't touch (atkSpeed, range, moveSpeed) — or content
 *    unlocks (free spell items). Applied once on pick, persist
 *    naturally.
 */
import type { World } from '@core/ecs';
import type { Components } from '@gameplay/components';

export type UpgradeKind =
  | 'atk'
  | 'def'
  | 'magicAtk'
  | 'magicDef'
  | 'hpMax'
  | 'atkSpeed'
  | 'range'
  | 'moveSpeed'
  | 'freeBurnout'
  | 'freeGushingMagma';

export type UpgradeRarity = 'common' | 'uncommon' | 'rare';

export interface UpgradeApplyContext {
  world: World<Components>;
  playerId: number;
}

export interface UpgradeDef {
  kind: UpgradeKind;
  rarity: UpgradeRarity;
  /** Weight in the random roll. Convention: common=4, uncommon=2,
   *  rare=1 — keeps the early game commons-heavy. */
  weight: number;
  /** i18n key for the card title (e.g. "Force +2"). */
  nameKey: string;
  /** i18n key for the card body. Both keys share the same `args`. */
  descKey: string;
  /** Interpolation values passed to `t()` for both keys. */
  args?: Record<string, number | string>;
  /** Tint applied to the card's rarity pip. */
  pipColor: number;
  /** Mutate the player's components. Called on the initial pick AND
   *  (when oneShot is false) on every subsequent level-up so the bonus
   *  survives the Dart-row re-write of base stats. */
  apply(ctx: UpgradeApplyContext): void;
  /** True for upgrades whose `apply` would compound if called twice
   *  (multiplicative bonuses) or for content unlocks that don't need
   *  re-evaluation. Skipped during the scene's per-level-up re-apply
   *  loop. */
  oneShot?: boolean;
  /** Optional gate — keeps single-use rare unlocks (free spells) from
   *  rolling again once picked. */
  isAvailable?: (state: { ownedKinds: ReadonlyArray<UpgradeKind> }) => boolean;
}

const RARITY_PIP: Record<UpgradeRarity, number> = {
  common: 0x9aa4b8,
  uncommon: 0x5fa8e8,
  rare: 0xffd166,
};

function mutateStats(ctx: UpgradeApplyContext, mutate: (stats: Components['Stats']) => void): void {
  const s = ctx.world.getComponent(ctx.playerId, 'Stats');
  if (s) mutate(s);
}

function mutateHealth(ctx: UpgradeApplyContext, mutate: (hp: Components['Health']) => void): void {
  const h = ctx.world.getComponent(ctx.playerId, 'Health');
  if (h) mutate(h);
}

function mutateSpeed(ctx: UpgradeApplyContext, mutate: (sp: Components['Speed']) => void): void {
  const sp = ctx.world.getComponent(ctx.playerId, 'Speed');
  if (sp) mutate(sp);
}

function mutateInventory(
  ctx: UpgradeApplyContext,
  mutate: (inv: Components['Inventory']) => void,
): void {
  const i = ctx.world.getComponent(ctx.playerId, 'Inventory');
  if (i) mutate(i);
}

/** Registry: declarative pool. Order doesn't matter — the picker
 *  filters + weights at roll time. */
export const UPGRADES: Readonly<Record<UpgradeKind, UpgradeDef>> = {
  // --- COMMON: base-stat bumps. Re-applied each level-up so the
  //     Dart-row overwrite doesn't wipe them.
  atk: {
    kind: 'atk',
    rarity: 'common',
    weight: 4,
    nameKey: 'survival.upgrades.atk.name',
    descKey: 'survival.upgrades.atk.desc',
    args: { n: 2 },
    pipColor: RARITY_PIP.common,
    apply: (c) => mutateStats(c, (s) => (s.atk += 2)),
  },
  def: {
    kind: 'def',
    rarity: 'common',
    weight: 4,
    nameKey: 'survival.upgrades.def.name',
    descKey: 'survival.upgrades.def.desc',
    args: { n: 2 },
    pipColor: RARITY_PIP.common,
    apply: (c) => mutateStats(c, (s) => (s.def += 2)),
  },
  magicAtk: {
    kind: 'magicAtk',
    rarity: 'common',
    weight: 4,
    nameKey: 'survival.upgrades.magicAtk.name',
    descKey: 'survival.upgrades.magicAtk.desc',
    args: { n: 2 },
    pipColor: RARITY_PIP.common,
    apply: (c) => mutateStats(c, (s) => (s.magicAtk += 2)),
  },
  magicDef: {
    kind: 'magicDef',
    rarity: 'common',
    weight: 4,
    nameKey: 'survival.upgrades.magicDef.name',
    descKey: 'survival.upgrades.magicDef.desc',
    args: { n: 2 },
    pipColor: RARITY_PIP.common,
    apply: (c) => mutateStats(c, (s) => (s.magicDef += 2)),
  },
  hpMax: {
    kind: 'hpMax',
    rarity: 'common',
    weight: 4,
    nameKey: 'survival.upgrades.hpMax.name',
    descKey: 'survival.upgrades.hpMax.desc',
    args: { n: 15 },
    pipColor: RARITY_PIP.common,
    apply: (c) =>
      mutateHealth(c, (h) => {
        h.max += 15;
        // Soaking the bonus into current so the player feels it
        // immediately on pick AND on re-application after a level-up
        // (which heals to old max via DeathSystem.awardXp before this
        // re-runs — the +15 here tops them up to the NEW max).
        h.current = Math.min(h.max, h.current + 15);
      }),
  },

  // --- UNCOMMON: multipliers + speed. one-shot to avoid compounding
  //     on the per-level re-apply pass.
  atkSpeed: {
    kind: 'atkSpeed',
    rarity: 'uncommon',
    weight: 2,
    nameKey: 'survival.upgrades.atkSpeed.name',
    descKey: 'survival.upgrades.atkSpeed.desc',
    args: { n: 10 },
    pipColor: RARITY_PIP.uncommon,
    oneShot: true,
    apply: (c) => mutateStats(c, (s) => (s.atkSpeed *= 1.1)),
  },
  range: {
    kind: 'range',
    rarity: 'uncommon',
    weight: 2,
    nameKey: 'survival.upgrades.range.name',
    descKey: 'survival.upgrades.range.desc',
    args: { n: 10 },
    pipColor: RARITY_PIP.uncommon,
    oneShot: true,
    apply: (c) => mutateStats(c, (s) => (s.range *= 1.1)),
  },
  moveSpeed: {
    kind: 'moveSpeed',
    rarity: 'uncommon',
    weight: 2,
    nameKey: 'survival.upgrades.moveSpeed.name',
    descKey: 'survival.upgrades.moveSpeed.desc',
    args: { n: 8 },
    pipColor: RARITY_PIP.uncommon,
    oneShot: true,
    apply: (c) => mutateSpeed(c, (sp) => (sp.value *= 1.08)),
  },

  // --- RARE: content unlocks. One per run (isAvailable filter).
  freeBurnout: {
    kind: 'freeBurnout',
    rarity: 'rare',
    weight: 1,
    nameKey: 'survival.upgrades.freeBurnout.name',
    descKey: 'survival.upgrades.freeBurnout.desc',
    pipColor: RARITY_PIP.rare,
    oneShot: true,
    isAvailable: ({ ownedKinds }) => !ownedKinds.includes('freeBurnout'),
    apply: (c) =>
      mutateInventory(c, (inv) => {
        // 99 = effectively unlimited for a run's length (1.5 casts/s
        // tops × 1200 s run cap = 1800, but 99 is enough for the spell
        // to play "free" without inflating the hotbar counter past 2
        // digits).
        inv.items.burnOut = 99;
      }),
  },
  freeGushingMagma: {
    kind: 'freeGushingMagma',
    rarity: 'rare',
    weight: 1,
    nameKey: 'survival.upgrades.freeGushingMagma.name',
    descKey: 'survival.upgrades.freeGushingMagma.desc',
    pipColor: RARITY_PIP.rare,
    oneShot: true,
    isAvailable: ({ ownedKinds }) => !ownedKinds.includes('freeGushingMagma'),
    apply: (c) =>
      mutateInventory(c, (inv) => {
        inv.items.gushingMagma = 99;
      }),
  },
};

/**
 * Weighted random pick of up to `count` distinct upgrades from the
 * registry. Filters out anything whose `isAvailable` returns false
 * (one-per-run rares already owned). The returned list is shorter
 * than `count` only if the pool exhausts itself — never expected at
 * v1's pool size of 10.
 */
export function rollUpgradeChoices(
  count: number,
  ownedKinds: ReadonlyArray<UpgradeKind>,
): UpgradeKind[] {
  const candidates = (Object.values(UPGRADES) as UpgradeDef[]).filter((u) =>
    u.isAvailable ? u.isAvailable({ ownedKinds }) : true,
  );
  const picked: UpgradeKind[] = [];
  // Sample without replacement by cumulative-weight roll, then strip
  // the chosen entry from the pool so duplicates don't appear in the
  // same roll.
  const pool = [...candidates];
  while (picked.length < count && pool.length > 0) {
    const totalWeight = pool.reduce((acc, u) => acc + u.weight, 0);
    let r = Math.random() * totalWeight;
    let chosenIdx = pool.length - 1;
    for (let i = 0; i < pool.length; i++) {
      r -= pool[i]!.weight;
      if (r <= 0) {
        chosenIdx = i;
        break;
      }
    }
    picked.push(pool[chosenIdx]!.kind);
    pool.splice(chosenIdx, 1);
  }
  return picked;
}
