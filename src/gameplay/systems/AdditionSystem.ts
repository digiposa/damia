import type { System, World } from '@core/ecs';
import type { Components } from '@gameplay/components';
import { ADDITIONS, type AdditionKind } from '@data/balance';
import { computeAdditionTotalDamage, distributeAdditionDamage } from '@gameplay/damage';
import { FLOAT_DAMAGE, spawnFloatingText } from '@gameplay/entities/floatingText';
import { addSp } from '@gameplay/sp';
import { playSfx, playAdditionVoice } from '@services/AudioManager';

/**
 * Drives active addition animations and ticks per-skill cooldowns.
 *
 * Damage / SP follow TLoD's per-level mastery table (`def.levels[level-1]`),
 * snapshotted on the Addition component at trigger time so a mid-animation
 * mastery promotion never warps the numbers. The total damage multiplier is
 * split evenly across hits, and each hit that actually lands awards its
 * fractional share of `spGain`. The avatar's voice line plays on completion
 * iff the final hit landed — same "addition succeeded" feel as TLoD.
 */
export class AdditionSystem implements System<Components> {
  update(dt: number, world: World<Components>): void {
    // Tick cooldowns first so a freshly-triggered addition's CD entry shows up
    // before this system reads it next frame.
    for (const id of world.query(['SkillCooldown'])) {
      const cd = world.getComponent(id, 'SkillCooldown');
      if (!cd) continue;
      for (const k of Object.keys(cd.remainingMs) as AdditionKind[]) {
        const next = (cd.remainingMs[k] ?? 0) - dt;
        if (next <= 0) delete cd.remainingMs[k];
        else cd.remainingMs[k] = next;
      }
    }

    for (const id of world.query(['Addition', 'Stats'])) {
      const add = world.getComponent(id, 'Addition');
      const stats = world.getComponent(id, 'Stats');
      if (!add || !stats) continue;

      const def = ADDITIONS[add.kind];
      const nbHits = def.hitTimingsMs.length;
      const levelRow = def.levels[add.level - 1] ?? def.levels[0]!;
      const multiplier = levelRow.multiplier;
      const spPerHit = levelRow.spGain / nbHits;
      const before = add.elapsedMs;
      add.elapsedMs += dt;

      // Apply each hit checkpoint we just crossed (in order, can be > 1 if dt is huge).
      for (let i = add.hitsApplied; i < def.hitTimingsMs.length; i++) {
        const t = def.hitTimingsMs[i];
        if (t === undefined) break;
        if (t > add.elapsedMs) break;
        if (t < before) continue; // shouldn't happen (hitsApplied protects us) but be defensive
        // Canonical TLoD addition damage: full formula on Σhits + multiplier
        // ONCE, then split proportionally across the hits. The plan is
        // computed lazily on the first hit and cached on the component so
        // subsequent hits read in O(1) — and a mid-animation state change
        // (target gains Defending halfway through, etc.) doesn't swing the
        // canonical total. VISION §6.3 forbids additions in Dragoon form
        // so the multiplier wouldn't normally apply, but the formula stays
        // correct if the controller-side gate ever lapses.
        if (!add.damagePerHit) {
          const sumHits = def.hits.reduce((acc, v) => acc + v, 0);
          const total = computeAdditionTotalDamage(world, id, add.targetId, sumHits, multiplier);
          add.damagePerHit = distributeAdditionDamage(total, def.hits);
        }
        const dmg = add.damagePerHit[i] ?? 0;
        const landed = this.applyHit(world, id, add.targetId, dmg);
        add.hitsApplied = i + 1;
        add.lastHitLanded = landed;
        if (landed) {
          add.hitsLanded += 1;
          // Per-hit SP gain — only credited on actual damage, so the
          // gauge tracks effective combat output rather than button
          // mashes. Floor-then-floor sums of fractional SP can drift by
          // 1 over a full sequence; `addSp` accepts floats and the HUD
          // renders the gauge as a fraction so we ignore the rounding.
          if (world.hasComponent(id, 'Character')) {
            addSp(world, id, spPerHit);
          }
        }
      }

      if (add.elapsedMs >= def.totalMs) {
        // Voice line plays iff the final hit landed — addition
        // "succeeded" in the TLoD sense. Skipped silently for mobs
        // (no Character component) or for fizzled swings where the
        // last hit missed.
        if (add.lastHitLanded) {
          const character = world.getComponent(id, 'Character');
          if (character) playAdditionVoice(character.avatar.id, add.kind);
        }
        world.removeComponent(id, 'Addition');
      }
    }
  }

  /** Apply one pre-computed hit. Returns `true` when damage actually landed
   *  on a live target, `false` when the target was missing / dying / dead
   *  (used by the caller to gate SP gain + the success-voice trigger).
   *  Damage is taken from the addition's `damagePerHit` plan rather than
   *  recomputed per call — see the caller's plan-build block. */
  private applyHit(
    world: World<Components>,
    _attackerId: number,
    targetId: number,
    dmg: number,
  ): boolean {
    const targetHealth = world.getComponent(targetId, 'Health');
    const targetStats = world.getComponent(targetId, 'Stats');
    const targetPos = world.getComponent(targetId, 'Position');
    if (!targetHealth || !targetStats || !targetPos) return false;
    if (targetHealth.current <= 0 || world.hasComponent(targetId, 'Dying')) return false;

    targetHealth.current = Math.max(0, targetHealth.current - dmg);
    spawnFloatingText(world, {
      x: targetPos.x,
      y: targetPos.y,
      text: String(dmg),
      color: FLOAT_DAMAGE,
    });
    playSfx('combat.hit');
    return true;
  }
}
