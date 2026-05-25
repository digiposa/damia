# Drake the Bandit — Boss Shrine of Shirley (Disc 1)

> **Boss Disc 1 Wind element Shrine of Shirley** — multi-entity battle canon : **Drake (HP 1,200) + 3× Bursting Ball (HP 64 kamikaze bombs) + 1× Wire (HP 120 defensive shield)** = 5-entity battle canon. Story canon : Drake = bandit stealing Shirley's Light Dragoon Spirit Disc 1.
>
> ⭐⭐⭐ **Multi-entity Boss Extras canon MAJEUR ⭐⭐⭐** — Drake + 2 Boss Extra types (Bursting Ball + Wire) = **5-entity battle**. Boss Extras canonical 4ème instance Damia (cohérent Crafty Thief / Divine Dragon / Dark Doel existing canon).
>
> ⭐⭐⭐ **Final Blow passive Disc 1 canon NEW MAJEUR ⭐⭐⭐** — Battle ends when Drake's HP reaches 0 (Boss Extras inutiles à kill). Cohérent existing Divine Dragon Final Blow canon Disc 3. Pattern Damia : `FinalBlowPassive { trigger: 'main-boss-hp-zero'; effect: 'end-battle' }` data-model canon — Drake confirms Disc 1 instance.
>
> ⭐⭐⭐ **Bomb Trap → Wire Trap → HP recovers chain canon NEW MAJEUR ⭐⭐⭐** — Sequential "Enable" trigger system Drake AI canon NEW : (1) Bomb Trap (within first 3 actions — summons 3× Bursting Ball + enables Wire Trap) → (2) Wire Trap (HP ≤ 50% — summons Wire + enables HP recovers) → (3) HP recovers (HP ≤ 33.3% — single-use 30% Max HP heal = 360 HP). Pattern Damia `EnableChainAI` data-model canon NEW.
>
> ⭐⭐⭐ **Bursting Ball Boss Extra NEW canon ⭐⭐⭐** — Kamikaze self-destruct AoE bomb thematic. HP 64 fragile. AI 2-Roll-Forward → Auto-Detonate (1× phys + self-destructs) Auto. Position-based target "opposite party member" canon (3-position cohérent existing Divine Dragon Cannon).
>
> ⭐⭐⭐ **Wire Boss Extra NEW canon MAJEUR ⭐⭐⭐** — 2 NEW passives MAJEURS defensive shield for Drake : (1) **Impassable** = 0× Physical Damage Multiplier to Drake (full physical immunity via Wire while alive) + (2) **Sharp** = (1,000 / attacker's DF) reactive Physical Damage to attacker when Drake targeted by Addition. Pattern AI Wire = passive-only (~Do nothing offensive). Strategy : kill Wire first to disable Impassable.
>
> ⭐⭐⭐ **Impassable passive canon NEW MAJEUR** — `ImpassablePassive { effect: 'physical-damage-zero-to-protected-entity'; protectedEntity: 'drake-the-bandit' }` data-model canon NEW.
>
> ⭐⭐⭐ **Sharp reactive passive canon NEW MAJEUR** — `SharpReactivePassive { trigger: 'protected-targeted-by-addition'; formula: '1000 / attackerDF'; damageTarget: 'attacker' }` data-model canon NEW. ⚠️ Inverse DF formula (lower DF = higher Sharp damage taken).
>
> ⭐⭐⭐ **Boss Extras canonical 4ème instance confirmed** — Drake the Bandit Disc 1 + Crafty Thief Disc 1 + Divine Dragon Disc 3 + Dark Doel Disc 4 = 4 Boss Extras instances cross-disc canon.
>
> ⭐⭐ **HP recovers single-use chain-gated canon NEW** — 30% Max HP = 360 HP (cohérent existing 30% formula Crystal Golem + Dragon Soldier). ⚠️ **Single use canon** (vs Crystal Golem / Dragon Soldier repeatable) — pattern NEW Drake variant + gated triple-condition (Wire Trap enabled + HP ≤ 33.3% + single use).
>
> ⭐⭐ **Counter 0 No counter tier** all 3 entities (Drake + Bursting Ball + Wire) cohérent existing canon Air Combat/Feyrbrand/Fire Bird/Canbria Dayfly.
>
> ⭐⭐ **Bandit's Ring 30% drop NEW item canon** — high drop rate (vs typical 2-8% Mob). Pattern thematic Drake signature drop. Probable accessory canon (ring).
>
> ⭐⭐ **Shrine of Shirley canon location Disc 1** — cohérent existing Crystal Golem Shrine + **Shirley Light Dragoon Spirit canon Disc 1** (Shana receives Light Dragoon Spirit after Drake defeat thematic).
>
> ⭐⭐ **Status all 8 ✔ Boss-tier** all 3 entities standard pattern Boss canon.
>
> ⭐⭐ **EXP 1,500 / Gold 100 Drake yield + 0/0 Boss Extras yield canon** — Boss Extras = no yield pattern cohérent existing canon.
>
> ⭐ **Scripted encounter + Escape 0%** canon Boss standard.
>
> ⭐ **Drake AI ~Throw Knives baseline 1× phys** (community approximation).
>
> **Sources** :
>
> - 🥈 [`_sources/lod-wiki-drake-the-bandit.md`](./_sources/lod-wiki-drake-the-bandit.md) — wiki LoD tier 2 (Drake stats US 1,200 HP / 20 AT / 80 DF / 17 MAT / 80 MDF / 70 SPD + Counter 0 + Status all 8 ✔ + Yield 1,500 EXP / 100 Gold / Bandit's Ring 30% + Final Blow passive + 4-ability AI Throw Knives/Bomb Trap/Wire Trap/HP recovers + Bursting Ball Boss Extra Roll Forward/Detonate kamikaze + Wire Boss Extra Impassable/Sharp passives + Do nothing AI + Shrine of Shirley submap 161 scripted)

## Statut

🟡 **Canon documenté wiki tier 2 uniquement** — fandom à ingérer (probablement JP stats + appearance + Story Drake bandit Shirley canon).

## Identity canon

- **Espèce** : Drake the Bandit (bandit boss humain Disc 1)
- **Element** : **Wind**
- **Category** : **Boss** Disc 1 multi-entity (Drake + 3 Bursting Ball + 1 Wire Boss Extras)
- **Location canon** : **Shrine of Shirley** submap 161 (Disc 1)
- **Disc** : Disc 1
- **Pattern symbolique** : ⭐⭐⭐ **Multi-entity Boss Extras 4ème instance canonical** + **Final Blow passive Disc 1** + **Bomb→Wire→HP recovers chain NEW** + **Bursting Ball kamikaze NEW** + **Wire Impassable+Sharp defensive shield NEW MAJEUR** + **Bandit's Ring 30% drop NEW**

### Story canon (Wiki "Read More" — à investiguer fandom future)

Pattern thematic Disc 1 :

- Drake = bandit stealing Shirley's Light Dragoon Spirit canon
- Shrine of Shirley = Shirley canon location Disc 1 (cohérent existing Crystal Golem + Shirley Light Dragoon Spirit canon)
- Defeat Drake → Shana receives Light Dragoon Spirit thematic canon Disc 1
- À investiguer fandom Story complet canon

### Shrine of Shirley location canon ⭐⭐

- **Shrine of Shirley** = existing location canon Disc 1 (cohérent Crystal Golem submaps 153/154/156)
- **Drake spawn submap 161** — boss-specific submap (vs Crystal Golem 153/154/156)
- Pattern thematic Light Dragoon Spirit shrine canon
- À cross-référer `locations/Shrine of Shirley.md` (à créer) — Disc 1 Light Dragoon Spirit location canon

## Stats canon multi-entity ⚠️ Damia adopt US base — JP TBD fandom future

### Drake the Bandit stats

| Stat      | Wiki US                    | Notes                                |
| --------- | -------------------------- | ------------------------------------ |
| HP        | **1,200** ⭐               | Disc 1 boss HP tier moderate         |
| AT        | 20                         | Low Attack (weak baseline offensive) |
| DF        | 80                         | Moderate Defense                     |
| MAT       | 17                         | Very low Magical                     |
| MDF       | 80                         | Moderate Magical Defense             |
| SPD       | 70                         | Moderate SPD                         |
| A-AV/M-AV | 0%/0%                      | Standard Boss                        |
| EXP       | 1,500                      | Disc 1 boss yield                    |
| Gold      | 100                        |                                      |
| Drop      | **Bandit's Ring 30%** ⭐⭐ | NEW item canon high drop rate        |

### Bursting Ball stats (Boss Extra x3) — NEW

| Stat          | Wiki US     | Notes                           |
| ------------- | ----------- | ------------------------------- |
| HP            | **64**      | Very low HP (fragile bomb)      |
| AT            | 30          |                                 |
| DF            | **150**     | **High DF anti-physical** ⭐    |
| MAT           | 30          |                                 |
| MDF           | 50          | Low MDF (magic favored counter) |
| SPD           | 70          |                                 |
| EXP/Gold/Drop | 0/0/Nothing | Boss Extra no yield canon       |

### Wire stats (Boss Extra x1) — NEW

| Stat          | Wiki US     | Notes                                |
| ------------- | ----------- | ------------------------------------ |
| HP            | **120**     | Low HP                               |
| AT            | 13          | Very low (irrelevant — passive-only) |
| DF            | **120**     | **High DF anti-physical**            |
| MAT           | 13          | Very low                             |
| MDF           | 80          | Moderate                             |
| SPD           | 50          | Low SPD                              |
| EXP/Gold/Drop | 0/0/Nothing | Boss Extra no yield canon            |

⚠️ **JP stats Drake + Boss Extras à confirmer fandom future** — wiki US only ingéré, pattern Damia adopt JP when available (+25% HP typical / ÷3 Gold systematic).

## Status Immunity canon (all 8 ✔ Boss-tier) — all 3 entities

| Petrify | Bewitch | Arm Block | Dispirit | Confuse | Fear | Poison | Stun |
| ------- | ------- | --------- | -------- | ------- | ---- | ------ | ---- |
| ✔       | ✔       | ✔         | ✔        | ✔       | ✔    | ✔      | ✔    |

Pattern Boss-tier all 8 ✔ standard canon all 3 entities.

## Counter Opportunities (0) — NO COUNTER tier all 3 entities

**(0)** — **No counter** tier all 3 entities (cohérent existing canon Air Combat / Feyrbrand / Fire Bird / Canbria Dayfly).

Pattern Damia tier mapping canon : Drake the Bandit + 2 Boss Extras = Counter 0 tier confirmed cross-entity.

## Final Blow passive Drake canon NEW Disc 1 ⭐⭐⭐

| Passive        | Effect                                           | Requires |
| -------------- | ------------------------------------------------ | -------- |
| **Final Blow** | Battle ends when Drake the Bandit's HP reaches 0 | —        |

⚠️ **Final Blow passive Disc 1 canon NEW MAJEUR ⭐⭐⭐** :

- **Final Blow** = canon passive (cohérent existing Divine Dragon Final Blow canon Disc 3)
- **Effect canon** : battle ends when Drake HP reaches 0 (Boss Extras persist mais battle ends)
- Pattern Damia : `FinalBlowPassive { trigger: 'main-boss-hp-zero'; effect: 'end-battle' }` data-model canon — Drake confirms Disc 1 instance
- ⭐ Pattern canon Damia : Final Blow = canonical recurring passive cross-disc (Disc 1 Drake + Disc 3 Divine Dragon)
- Pattern canon multi-entity boss : **kill main = win battle** (Boss Extras inutiles à kill — strategy focus Drake)
- À documenter `combat/passives.md` (à créer/vérifier) Final Blow passive cross-boss canon

## Drake AI — Bomb Trap → Wire Trap → HP recovers chain canon NEW MAJEUR ⭐⭐⭐

| Action            | Target | Effect                                             | Conditions                                                                 |
| ----------------- | ------ | -------------------------------------------------- | -------------------------------------------------------------------------- |
| **~Throw Knives** | Single | 1× Physical damage                                 | — (baseline canon)                                                         |
| **~Bomb Trap** ⭐ | N/A    | Summons **Bursting Ball (x3)** + Enables Wire Trap | Bursting Ball not in battle. **Will always use within first 3 actions** ⭐ |
| **~Wire Trap** ⭐ | N/A    | Summons **Wire** + Enables HP recovers             | Wire not in battle. Must be **Enabled by Bomb Trap**. **HP ≤ 50%**         |
| **HP recovers**   | Self   | Restores **30% (360) HP**                          | Must be **Enabled by Wire Trap**. **HP ≤ 33.3%**. **Single use** ⭐        |

⚠️ **Sequential "Enable" trigger system canon NEW MAJEUR ⭐⭐⭐** :

Drake AI cascade canon :

1. **Bomb Trap** (within first 3 actions — guaranteed early-battle) → summons 3× Bursting Ball + enables Wire Trap
2. **Wire Trap** (HP ≤ 50% threshold) → summons Wire + enables HP recovers
3. **HP recovers** (HP ≤ 33.3% threshold + single-use) → 30% Max HP heal = 360 HP

⚠️ **Pattern Damia EnableChainAI data-model canon NEW** :

```ts
type EnableChainAI = {
  phase1: {
    action: 'bomb-trap';
    trigger: 'within-first-3-actions';
    summons: 3;
    enables: 'wire-trap';
  };
  phase2: {
    action: 'wire-trap';
    trigger: 'hp <= 50% + enabled';
    summons: 1;
    enables: 'hp-recovers';
  };
  phase3: {
    action: 'hp-recovers';
    trigger: 'hp <= 33.3% + enabled + single-use';
    healPercent: 0.3;
  };
};
```

### ~Throw Knives canon name (community)

- **~Throw Knives** = community approximation baseline ability (1× phys)
- Pattern thematic "bandit thief throwing daggers" canon

### Bomb Trap canon name (community) ⭐⭐

- **~Bomb Trap** = community approximation summoning ability
- **Within first 3 actions guaranteed** canon — pattern guaranteed early-battle ability (à confirmer pattern cross-boss)
- 3× Bursting Ball summon canon NEW
- Pattern Damia : summon Boss Extras canon mechanic (cohérent Boss Extras canonical pattern)

### Wire Trap canon name (community) ⭐⭐

- **~Wire Trap** = community approximation summoning ability
- **HP ≤ 50% trigger** canon — pattern HP-threshold ability
- 1× Wire summon canon NEW
- ⚠️ Pattern chain enable canon : requires Bomb Trap enabled prior (sequential)

### HP recovers single-use chain-gated canon ⭐⭐ NEW variant

- **HP recovers** = canon name officiel (cohérent existing canon Crystal Golem + Dragon Soldier)
- **30% Max HP = 360 HP** (Drake US 1,200 × 30% = 360 ✓ — cohérent existing 30% formula cross-mob/boss)
- ⚠️ **Single use canon** ⚠️ NEW variant Damia :
  - Vs Crystal Golem repeatable / Dragon Soldier repeatable — Drake = single-use variant
  - Pattern Damia : HP recovers variants cross-boss canon (repeatable vs single-use)
- ⚠️ **Triple-condition gated** : Wire Trap enabled + HP ≤ 33.3% + single-use
- À implémenter ability `hpRecovers` Damia avec variant single-use option canon

## Boss Extra (Bursting Ball) — NEW canon ⭐⭐⭐ kamikaze AI

### Identity canon Bursting Ball

- **Boss Extra** summoned by Drake's Bomb Trap (3× simultaneous)
- **Element** : **Non-Elemental**
- **Counter 0** + **Status all 8 ✔** + **EXP/Gold/Drop 0** (Boss Extra no yield canon)

### Bursting Ball kamikaze AI canon NEW MAJEUR ⭐⭐⭐

| Action            | Target                                          | Effect                                              | Conditions                                          |
| ----------------- | ----------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- |
| **~Roll Forward** | Self                                            | Move towards party member opposite of Bursting Ball | —                                                   |
| **~Detonate** ⭐  | Single (party member opposite of Bursting Ball) | 1× Physical damage + **self destructs** ⭐          | **Only used after Roll Forward twice**. **Auto** ⭐ |

⚠️ **Bursting Ball kamikaze AI canon NEW MAJEUR ⭐⭐⭐** :

- Pattern thematic "ball rolls towards target then explodes self-destructs" canon
- **2-Roll-Forward → Auto-Detonate** sequence canon NEW
- Pattern Damia : `BurstingBallKamikazeAI { rollPhases: 2; autoDetonate: true; target: 'opposite-party-member'; selfDestruct: true }` data-model canon NEW
- ⚠️ Pattern position-based target canon : "opposite of Bursting Ball" — 3-position party canon (cohérent existing Divine Dragon Cannon position-based)
- À implémenter Boss Extra summoned entity Damia avec kamikaze AI canon NEW

### Strategy Bursting Ball canon

- **HP 64 very fragile** — kill rapidement avant Detonate (2 turns warning Roll Forward sequence)
- **DF 150 high anti-physical** + **MDF 50 low** → magic favored counter canon
- 3× Bursting Ball simultaneously → AoE pressure 3-direction kamikaze threat canon
- Pattern Damia : magic burst priority canon vs Bursting Ball threat

## Boss Extra (Wire) — NEW canon MAJEUR ⭐⭐⭐ defensive shield

### Identity canon Wire

- **Boss Extra** summoned by Drake's Wire Trap (1× single)
- **Element** : **Non-Elemental**
- **Counter 0** + **Status all 8 ✔** + **EXP/Gold/Drop 0** (Boss Extra canon)

### Wire passives canon NEW MAJEUR ⭐⭐⭐

| Passive               | Effect                                                      | Requires                                                      |
| --------------------- | ----------------------------------------------------------- | ------------------------------------------------------------- |
| **Impassable** ⭐⭐⭐ | **0× Physical Damage Multiplier to Drake the Bandit**       | —                                                             |
| **Sharp** ⭐⭐⭐      | **(1,000 / attacker's DF) Physical Damage to the attacker** | **Triggers when Drake the Bandit is targeted by an Addition** |

⚠️ **Impassable passive canon NEW MAJEUR ⭐⭐⭐** :

- **0× Physical Damage Multiplier to Drake** = **full physical immunity via Wire** canon
- Pattern Damia : `ImpassablePassive { effect: 'physical-damage-zero-to-protected-entity'; protectedEntity: 'drake-the-bandit' }` data-model canon NEW
- ⚠️ Pattern Boss Extra defensive shield canon NEW : Wire = shield for Drake (physical attacks deal 0 damage while Wire alive)
- Strategy counter canon : **kill Wire first** to disable Impassable + access physical damage Drake
- À implémenter passive `impassable` Damia (canon NEW Boss Extra defensive)
- À cross-référer pattern existing Boss Extra defensive shield canon (cohérent Lloyd Untargetable passive Dark Doel canon ?)

⚠️ **Sharp passive canon NEW MAJEUR ⭐⭐⭐** :

- **(1,000 / attacker's DF) Physical Damage** reactive to attacker when Drake targeted by Addition
- ⚠️ **Reactive damage formula canon NEW** : 1,000 / DF inverse formula (lower DF = higher damage taken)
- Pattern Damia : `SharpReactivePassive { trigger: 'protected-targeted-by-addition'; formula: '1000 / attackerDF'; damageTarget: 'attacker' }` data-model canon NEW
- ⚠️ Pattern reactive thorns/spikes damage canon NEW (cohérent thematic Wire = sharp barbed wire)
- Pattern canon Damia : attacker DF self-protection vs Sharp counter (higher DF gear = less Sharp damage taken)
- Strategy counter canon : avoid Additions targeting Drake while Wire alive (Magic / Items / non-Addition attacks favored)
- À implémenter passive `sharp` Damia (canon NEW reactive damage)

### Wire passive-only AI ⭐

| Action          | Target | Effect       | Conditions |
| --------------- | ------ | ------------ | ---------- |
| **~Do nothing** | N/A    | Does nothing | —          |

⚠️ **Wire passive-only canon ⭐** :

- Wire's role = **defensive passive shield** for Drake (Impassable + Sharp)
- AI action = **~Do nothing** (no offensive ability)
- Pattern Damia : Boss Extra passive-only entity canon NEW (cohérent thematic Wire = inanimate trap barbed wire)
- À implémenter Boss Extra entity Damia avec passive-only AI canon NEW

### Strategy Wire canon

- **HP 120** → kill Wire rapidly to disable Impassable + Sharp passives
- **DF 120 + MDF 80** → mixed offensive options
- **Priority canon** : kill Wire first before attacking Drake (otherwise physical 0× damage + Sharp reactive)
- Pattern Damia : multi-entity boss priority order canon (Wire > Bursting Ball > Drake — kill order strategy)

## Encounters canon

### Shrine of Shirley (Disc 1)

| Encounter Formation (ID) | Location (Submap ID)    | Encounter | Escape |
| ------------------------ | ----------------------- | --------- | ------ |
| Drake the Bandit (412)   | Shrine of Shirley (161) | Scripted  | 0%     |

⚠️ **Scripted encounter + Escape 0%** canon Boss battle standard.

## Combat flow canon

1. Player enters Shrine of Shirley submap 161 → scripted encounter Drake the Bandit
2. Turn 1-3 : Drake **guaranteed** uses **Bomb Trap** → summons 3× Bursting Ball + enables Wire Trap
3. Bursting Ball threat 2-Roll-Forward → Auto-Detonate kamikaze sequence per ball
4. HP ≤ 50% Drake : Drake uses **Wire Trap** → summons Wire + enables HP recovers
5. Wire on field : Impassable (0× phys to Drake) + Sharp ((1,000/DF) reactive when Drake targeted by Addition)
6. HP ≤ 33.3% Drake (single use) : HP recovers heals 360 HP (30% Max)
7. Battle ends when **Drake HP reaches 0** (Final Blow passive — Boss Extras persist mais battle ends)

### Strategy canon recommandée

- **Wind weak Earth** → Albert Earth Dragoon attacks favored vs Drake ⭐
- **Multi-entity priority order canon** :
  1. **Kill Bursting Balls** rapidly (HP 64 fragile + Auto-Detonate threat)
  2. **Kill Wire** if summoned (disable Impassable + Sharp passives)
  3. **Focus Drake** (Final Blow = battle ends at Drake HP 0)
- **Wire active period strategy** :
  - **Magic attacks favored** vs Drake (Impassable = 0× phys / Magic unaffected)
  - **Items / Spell Items favored** vs Drake (no Addition trigger Sharp)
  - **Avoid Additions Drake-targeted** (Sharp reactive damage to attacker)
- **HP recovers timing** : burst Drake to < 33.3% then finish before HP recovers single-use (or after used)
- **Bursting Ball counter** : magic burst (MDF 50 low) — kill before Detonate Auto trigger
- **Status applicables** : NONE all 8 ✔ Boss + Boss Extras immune
- **Counter 0** : no Counter Additions possible all 3 entities
- **Bandit's Ring farming** : 30% rate ⭐⭐ high rate (3 attempts avg cohérent rate)

## Vision Damia (implémentation)

### Décisions canon à conserver

1. **Multi-entity battle canon** : Drake + 3 Bursting Ball + 1 Wire = 5-entity battle Disc 1
2. **Drake stats US** : HP 1,200 + AT 20 + DF 80 + MAT 17 + MDF 80 + SPD 70 (JP TBD)
3. **Bursting Ball stats US** : HP 64 + AT 30 + DF 150 + MAT 30 + MDF 50 + SPD 70 (kamikaze fragile)
4. **Wire stats US** : HP 120 + AT 13 + DF 120 + MAT 13 + MDF 80 + SPD 50 (passive-only)
5. **Status all 8 ✔ Boss-tier** all 3 entities
6. **Counter 0 No counter tier** all 3 entities
7. **Final Blow passive Disc 1 canon NEW** : battle ends Drake HP 0 (cohérent Divine Dragon Final Blow canon cross-disc)
8. **Bomb Trap → Wire Trap → HP recovers chain canon NEW MAJEUR** : sequential Enable trigger system AI
9. **Bomb Trap guaranteed within first 3 actions** canon
10. **Wire Trap conditional HP ≤ 50%** canon
11. **HP recovers single-use HP ≤ 33.3% triple-condition gated** canon (Wire Trap enabled + HP threshold + single use)
12. **HP recovers 30% Max HP = 360 HP** : cohérent existing 30% formula cross-mob/boss
13. **HP recovers single-use variant canon NEW** : vs Crystal Golem / Dragon Soldier repeatable
14. **Bursting Ball Boss Extra NEW canon kamikaze** : 2-Roll-Forward → Auto-Detonate self-destruct, position-based target opposite party member
15. **Wire Boss Extra NEW canon MAJEUR defensive shield** : Impassable + Sharp passives + passive-only AI
16. **Impassable passive NEW MAJEUR** : 0× Physical Damage to protected entity (Drake)
17. **Sharp passive NEW MAJEUR** : (1,000/attacker DF) reactive Physical Damage when protected targeted by Addition
18. **Boss Extras canonical 4ème instance** : Drake Disc 1 + Crafty Thief Disc 1 + Divine Dragon Disc 3 + Dark Doel Disc 4
19. **Shrine of Shirley submap 161 scripted encounter** : Boss location canon Disc 1
20. **Drake yield 1,500 EXP / 100 Gold / Bandit's Ring 30% drop** : NEW item canon high drop rate
21. **Bandit's Ring NEW item canon** : probable accessory ring thematic — effect précis à investiguer
22. **Boss Extras 0/0/Nothing yield** : standard Boss Extra no-yield pattern
23. **Wind element Drake** : weak Earth → Albert favored canon strategy

### Implementation tech

- Data-model `MultiEntityBossBattle` Drake the Bandit :
  ```ts
  type DrakeTheBanditBattle = {
    mainBoss: DrakeBoss;
    extras: {
      burstingBalls: BurstingBallExtra[]; // 3× summoned by Bomb Trap
      wires: WireExtra[]; // 1× summoned by Wire Trap
    };
    mainBossPassive: 'final-blow'; // battle ends on Drake HP 0
    aiChain: 'bomb-trap → wire-trap → hp-recovers';
  };
  ```
- Data-model `EnableChainAI` (Drake's sequential AI) :
  ```ts
  type EnableChainAI = {
    phase1: {
      action: 'bomb-trap';
      trigger: 'within-first-3-actions';
      summons: 3;
      enables: 'wire-trap';
    };
    phase2: {
      action: 'wire-trap';
      trigger: 'hp <= 50% + enabled';
      summons: 1;
      enables: 'hp-recovers';
    };
    phase3: {
      action: 'hp-recovers';
      trigger: 'hp <= 33.3% + enabled + single-use';
      healPercent: 0.3;
    };
  };
  ```
- NEW Passive `impassable` (Wire) :
  ```ts
  type ImpassablePassive = {
    type: 'protected-entity-physical-immunity';
    effect: 'physical-damage-zero';
    protectedEntity: 'drake-the-bandit';
  };
  ```
- NEW Passive `sharp` (Wire reactive) :
  ```ts
  type SharpReactivePassive = {
    type: 'reactive-damage-attacker';
    trigger: 'protected-targeted-by-addition';
    formula: '1000 / attackerDF';
    damageTarget: 'attacker';
    damageType: 'physical';
  };
  ```
- NEW AI `BurstingBallKamikaze` :
  ```ts
  type BurstingBallKamikazeAI = {
    rollPhases: 2;
    autoDetonate: true;
    target: 'opposite-party-member';
    detonateEffect: { multiplier: 1; type: 'physical'; selfDestruct: true };
  };
  ```
- Variant ability `hpRecovers` Damia :
  ```ts
  // Drake variant: single-use chain-gated
  type DrakeHpRecoversAbility = {
    type: 'self-heal';
    healPercent: 0.3;
    singleUse: true; // ⚠️ vs Crystal Golem/Dragon Soldier repeatable
    chainGated: ['wire-trap-enabled', 'hp <= 33.3%'];
  };
  ```

### Questions ouvertes

- **JP stats Drake + Boss Extras** : à confirmer fandom future (probable +25% HP / ÷3 Gold pattern systematic)
- **Bandit's Ring effect précis** : NEW accessory canon — à investiguer items wiki + Guidebook (probable stat/elemental bonus)
- **Story Drake the Bandit canon détaillé** : à investiguer fandom future (bandit stealing Shirley's Light Dragoon Spirit)
- **Shrine of Shirley layout canon** : à documenter `locations/Shrine of Shirley.md` (à créer) Disc 1 Light Dragoon Spirit location
- **Drake AI exact button-press priority** : multi-condition AI selection order — à investiguer cross-boss
- **HP recovers variants cross-boss** : single-use Drake vs repeatable Crystal Golem/Dragon Soldier — pattern Damia HP recovers variants canon documentation
- **Sharp reactive damage formula generalization** : 1,000 / DF inverse formula — cross-boss pattern ?
- **Impassable cross-boss/Boss Extra canon** : Wire premier ingestion — autres Boss Extras avec full immunity passive ?
- **Bursting Ball kamikaze pattern cross-boss** : Wire-summoning + bomb-summoning patterns — autres Boss avec ?
- **Bomb Trap "within first 3 actions" guaranteed mechanic** : cross-boss pattern guaranteed early-battle ability ?

## Liens transverses

- [`README.md`](./README.md) — pattern général bosses canon
- [`../locations/Shrine of Shirley.md`](../locations/Shrine of Shirley.md) (à créer) — Disc 1 Light Dragoon Spirit location canon
- [`../mobs/Crystal Golem.md`](../mobs/Crystal Golem.md) — Shrine of Shirley Mob existing canon + HP recovers cross-mob/boss canon
- [`Divine Dragon.md`](./Divine Dragon.md) — Final Blow passive existing canon Disc 3 + Boss Extras canonical pattern
- [`Dark Doel.md`](./Dark Doel.md) (à créer/vérifier) — Boss Extras existing canon Disc 4 + multi-entity pattern
- [`Crafty Thief.md`](./Crafty Thief.md) (à créer/vérifier) — Boss Extras existing canon Disc 1 + cross-disc pattern
- [`../party-members/Shana.md`](../party-members/Shana.md) — Light Dragoon Spirit canon Disc 1 (Drake stealing thematic)
- [`../dragoons/dragons.md`](../dragoons/dragons.md) — Shirley Light Dragoon canon
- [`../combat/passives.md`](../combat/passives.md) (à créer/vérifier) — Final Blow + Impassable + Sharp passives canon NEW
- [`../combat/boss-extras.md`](../combat/boss-extras.md) (à créer/vérifier) — Boss Extras 4ème instance canonical pattern Damia
- [`../combat/mob-abilities.md`](../combat/mob-abilities.md) — HP recovers variants cross-mob/boss canon (single-use vs repeatable)
- [`../combat/elements.md`](../combat/elements.md) — Wind weak Earth canon strategy
- [`../items/equipment.md`](../items/equipment.md) — Bandit's Ring NEW accessory canon

## Gaps / TODO

Voir [TODO.md](../../TODO.md) section Drake the Bandit.
