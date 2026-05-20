# Fire Bird — Boss canon Volcano Villude Disc 1 (source Red-Eye Stone)

> **Boss volcanique Disc 1** : Fire element, source canon **Red-Eye Stone 100%** (-50% Fire magic damage), pattern Sequential Retaliation + Volcano Ball Boss Extra summons.
>
> **Sources** :
>
> - 🥈 [`_sources/lod-wiki-fire-bird.md`](./_sources/lod-wiki-fire-bird.md) — wiki LoD (stats + 3 retaliations sequential + Volcano Ball boss extra + HP 61% threshold phase swap + Instigate Erupt max 3/4 damage)

## Statut

🟡 **Draft post-ingestion wiki LoD** — fandom à ingérer pour cross-check + lore Fire Bird Volcano Villude + Disc 1 narrative arc.

## Identity canon

- **Espèce** : Bird canon, Fire element (Red-Eye Dragon lineage symbolic ?)
- **Location canon** : **Volcano Villude (submap 121)** — volcan canon Serdio
- **Disc** : Disc 1 (categorized canon "Disc 1" wiki)
- **Pattern symbolique** : **Drop Red-Eye Stone 100%** ⚠️ stratégique pour Disc 4 Zieg Feld fight (Fire element counter)
- **Counters Additions ? No** : pas de counter mechanism
- **Final Blow passive** : battle ends quand Fire Bird HP=0 (même si Volcano Balls survivent → pattern "main boss = victory trigger")

## Stats canon

| Stat        | Value   |
| ----------- | ------- |
| HP          | 640     |
| AT          | 13      |
| DF          | 80      |
| MAT         | 16      |
| MDF         | 80      |
| SPD         | 45      |
| A-AV / M-AV | 0% / 0% |

→ Pattern boss canon Disc 1 : HP 640 (vs Feyrbrand 480, Doel ~? ), MAT 16 > AT 13 → Fire Bird = magic damage dealer profil canon.

## Status Immunity canon

**All 8 status immune** (pattern boss canon master).

## Yield canon ⭐ MAJEUR

- **EXP : 800 / Gold : 100**
- **Drop : Red-Eye Stone 100%** ⭐ source canon principal Red-Eye Stone (Fire-element damage reduction -50%)
- Cohérent avec [`items/equipment.md`](../items/equipment.md) §6 — pattern 7 stones elemental dropped from bosses canon

## Mécaniques canon spécifiques

### Trait passive : Sequential Retaliation ⭐ MAJEUR NEW pattern

Vs Feyrbrand (single Retaliate type), Fire Bird a **3 retaliates cycliques** :

```
Cycle: (1st) → (2nd) → (3rd) → (1st) → ...
```

**Trigger commun** : **Has a chance to trigger when targeted by an Addition** ⚠️ vs Feyrbrand (magic-trigger), Fire Bird trigger = Addition-targeted.

| Retaliate | Action(s)                                                                                                 | Notes                                      |
| --------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| **1st**   | Bind and Peck (single phys) OR Fiery Wing Beat (party phys HP>61%) OR Molten Dive (party Fire mag HP<61%) | Selection conditionnée par HP threshold    |
| **2nd**   | Call Volcano Balls (summon ×4)                                                                            | Active phase 2 du combat (extras summoned) |
| **3rd**   | Instigate Erupt (force 4 Volcano Balls to Erupt, **max 3 hit**) OR Do Nothing si pas de Volcano Ball      | Pattern "tactical AoE setup-payoff"        |

→ **Pattern boss tactical canon** : 2nd Retaliate setup les Volcano Balls, 3rd Retaliate les déchaîne. Player a 1 cycle pour kill les Volcano Balls (HP 8 each = très fragile).

### HP threshold 61% canon (phase swap)

| HP > 61%                              | HP < 61%                                |
| ------------------------------------- | --------------------------------------- |
| **Fiery Wing Beat** (0.5× phys party) | **Molten Dive** (0.5× Fire magic party) |

→ Pattern boss "phase swap canon" : transition phys→magic à low HP. Suggérer player conserver heal magic-tanks low HP phase.

### "Trigger when targeted by Addition" canon ⚠️ NEW vs Feyrbrand

- Feyrbrand : Retaliate triggered **by magic damage** (any magic source)
- **Fire Bird : Retaliate triggered "by Addition"** ⚠️ NEW pattern : Addition action de party trigger Sequential Retaliation cycle

→ Stratégie canon : **Addition spam → Sequential Retaliation cycle deterministic** : player peut prédire cycle 1→2→3 et l'exploiter. Pattern intéressant gameplay.

⚠️ Note "Has a chance to trigger" → non systématique, chance probabiliste (à investiguer % exact).

## Boss Extra : Volcano Ball canon

| Stat       | Value                |
| ---------- | -------------------- |
| HP         | **8** (très fragile) |
| AT         | 12                   |
| DF         | 80                   |
| MAT        | 12                   |
| MDF        | 100                  |
| SPD        | 45                   |
| EXP / Gold | 0 / 0                |

- **4 summoned** par Call Volcano Balls (Fire Bird 2nd Retaliate)
- **Max 3 deal damage** sur Instigate Erupt canon ⚠️ (1 fail/4)
- HP 8 = **One-shot via single Addition typical** Disc 1 (Dart Volcano Villude AT ~25-30 with Heat Blade)
- Pattern Boss Extra : **summons "soft" countering tactical** — player priority kill Volcano Balls AVANT Instigate Erupt

### Erupt ability canon

- Target Single, 1× physical damage
- **Only triggered by Fire Bird's Instigate Erupt** (pas action autonome)

## Combat flow canon

1. Battle start : Fire Bird seul (Volcano Villude submap 121)
2. Pattern alterne base : Bind and Peck / Fiery Wing Beat (HP > 61%) / Molten Dive (HP < 61%)
3. Si player Addition Fire Bird → **chance trigger Retaliate**
4. Cycle Retaliate :
   - Premier Addition trigger → (1st) Retaliate = action HP-conditional
   - Deuxième Addition trigger → (2nd) Retaliate = Summon 4 Volcano Balls
   - Troisième Addition trigger → (3rd) Retaliate = Instigate Erupt (3/4 damage)
   - Quatrième Addition trigger → (1st) Retaliate again (cycle repeat)
5. Player wins quand Fire Bird HP=0 (**Final Blow passive** — Volcano Balls auto-disparaissent)

### Strategy canon recommandée

- **Limit Additions usage** (pour éviter trigger Retaliate) OR exploit cycle deterministic
- **Kill Volcano Balls quickly** entre 2nd Retaliate et 3rd Retaliate (1 turn window)
- **Phase 1 (HP > 61%)** : Fiery Wing Beat physical party damage — equip physical defense
- **Phase 2 (HP < 61%)** : Molten Dive Fire magic party damage — equip Red-Eye Stone (irony: drop reward) + Magic Ego Bell / Spiritual Ring
- Fire Bird = Fire weak to Water → utiliser Meru/Shana water magic OU Sparkle Arrow (Light counters Fire) — à confirmer
- Heat Blade Dart = SAME element Fire → 0.5× resist par Fire Bird probable. Switch back to Bastard Sword ou non-elemental

## Story beats canon

- Boss canon Volcano Villude Disc 1 (probable mid-Disc 1, après Hellena Prison)
- Drop Red-Eye Stone preparing canon Disc 4 Zieg Feld counter

À documenter via fandom ingestion future.

## Vision Damia (implémentation)

### Décisions canon à conserver

1. **HP 640 / stats canon** Disc 1 boss authenticity
2. **Status immunity ALL 8** (pattern master)
3. **Sequential Retaliation 3-cycle** : pattern unique vs Feyrbrand single Retaliate
4. **Addition-trigger Retaliate** (vs magic-trigger Feyrbrand) : design diversity bosses canon
5. **HP 61% threshold phase swap** : 2-phase boss canon explicite
6. **Volcano Ball Boss Extra summons** : pattern "boss + extras"
7. **Instigate Erupt max 3/4 damage** : pattern "imperfect AoE" canon
8. **Final Blow passive** : battle ends Fire Bird HP=0 even with extras alive
9. **Red-Eye Stone 100% drop** : preserve canon strategic reward
10. **HP 8 Volcano Balls** : fragile = player priority kill window

### Implementation tech

- Data-model `BossPassive` extended :
  ```ts
  type BossPassive = {
    name: 'Retaliate' | 'SequentialRetaliation' | 'FinalBlow' | string;
    trigger: 'on_magic_targeted' | 'on_addition_targeted' | 'on_hp_threshold' | ...;
    chance?: number;  // Fire Bird: < 1.0 (probabilistic)
    sequence?: BossAction[];  // for Sequential
    sequenceIndex?: number;  // current cycle position
  };
  ```
- Data-model `BossExtra`:
  ```ts
  type BossExtra = {
    spawnAction: 'Call Volcano Balls';
    spawnCount: number;
    extraEntity: BossEntity; // Volcano Ball stats
  };
  ```
- HP threshold ability swap : `Ability { conditions: { hpPctMin?: number, hpPctMax?: number } }`

### Questions ouvertes

- **% exact "Has a chance to trigger"** : 50% ? 75% ? À investiguer Discord cadors.
- **Instigate Erupt 3/4 fail** : déterministe ou random ? Probable random "1 fail/4" canon.
- **Element resistance Fire Bird** : Water double damage canon ? Light counter ? À investiguer.

## Liens transverses

- [`../locations/Volcano Villude.md`](../locations/Volcano Villude.md) (à créer) — location canon encounter
- [`../items/equipment.md`](../items/equipment.md) — Red-Eye Stone (Fire Bird 100% drop, Disc 4 Zieg Feld counter)
- [`../combat/elements.md`](../combat/elements.md) — Fire element + Fire↔Water opposing pair
- [`../bosses/Feyrbrand.md`](./Feyrbrand.md) — comparable Retaliate boss pattern (single vs sequential)
- [`Zieg.md`](./Zieg.md) (à créer) — Disc 4 final boss Fire element (Red-Eye Stone counter)

## Gaps / TODO

Voir [TODO.md](../../TODO.md) section Fire Bird.
