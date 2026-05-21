# Aqua King — Mob Water Aglis (Disc 2) — Counter Additions canon

> **Premier mob documenté avec Counterattack Opportunities table complète (28)** + Magical Attack Barrier rare ability + **retail bug "0 damage abilities" rendant le mob trivial**.
>
> **Sources** :
>
> - 🥈 [`_sources/lod-wiki-aqua-king.md`](./_sources/lod-wiki-aqua-king.md) — wiki LoD (stats + 28 counter opportunities + Magical Attack Barrier + Trident Stab bug retail)

## Statut

🟡 **Draft post-ingestion wiki LoD** — fandom à ingérer pour cross-check + lore Aqua King.

## Identity canon

- **Espèce** : Water creature aquatic (Merman recolor canon visual)
- **Element** : Water
- **Location canon** : **Aglis** (Wingly underwater city Disc 2) — submaps 570-582, 712
- **Disc** : Disc 2 (Aglis = Wingly city sub-Reef, post-Donau)
- **Pattern symbolique** : **Premier mob canon avec Counter Additions explicite** + **mob bugged retail "trivial encounter"** ⚠️

## Stats canon

| Stat | Value          |
| ---- | -------------- |
| HP   | 640            |
| AT   | 67             |
| DF   | 120            |
| MAT  | 65             |
| MDF  | **160** (high) |
| SPD  | 70             |
| A-AV | 0%             |
| M-AV | 0%             |

→ Pattern mob Disc 2 : MDF 160 = très haut (anti-magic profile) cohérent avec **Magical Attack Barrier** rare ability.

## Status Immunity canon

Pattern mob standard : 4 immune (Petrify/Bewitch/Arm Block/Dispirit) / 4 vulnerable (Confuse/Fear/Poison/Stun).

## Yield canon

- **EXP : 135 / Gold : 30**
- **Drop : Angel's Prayer 8%** — Repeat Item resurrection-related canon (cohérent avec Angel Robe revive pattern)

## ⭐ MAJEUR canon : Counterattack Opportunities (28)

**Aqua King = premier mob documenté avec table complète Counter Opportunities canon**.

### Pattern Counter Additions canon explicit ⭐

| User      | Addition           | Button Press  | Counter Count |
| --------- | ------------------ | ------------- | ------------- |
| Dart      | Volcano            | 2             | 1             |
| Dart      | Crush Dance        | 2, 3          | 2             |
| Dart      | Moon Strike        | 2, 3          | 2             |
| Lavitz    | Rod Typhoon        | 2, 3          | 2             |
| Lavitz    | Gust of Wind Dance | 2, 5          | 2             |
| Lavitz    | Flower Storm       | 2, 3, 4, 5, 6 | 5             |
| Rose      | Hard Blade         | 2             | 1             |
| Rose      | Demon's Dance      | 3, 4, 5, 6    | 4             |
| Meru      | Cool Boogie        | 2, 3          | 2             |
| Meru      | Cat's Cradle       | 3, 4          | 2             |
| Meru      | Perky Step         | 2             | 1             |
| Haschel   | Summon 4 Gods      | 2             | 1             |
| Haschel   | Hex Hammer         | 2             | 1             |
| Albert    | Gust of Wind Dance | 2             | 1             |
| Albert    | Flower Storm       | 2             | 1             |
| **Total** |                    |               | **28**        |

### Insights canon

- **Distribution par wielder** : Dart 5 / **Lavitz 9 (max)** / Rose 5 / Meru 5 / Haschel 2 / Albert 2
- **Shana / Miranda absentes** : confirme **no Additions canon** (cohérent equipment.md restrictions Wargod Calling/Ultimate Wargod)
- **Kongol absent** ⚠️ : Aqua King = Aglis Disc 2 (Meru recruit Donau Disc 2) — Kongol pas encore disponible canon ? OR Kongol additions différentes pas listées ?
- **Lavitz Flower Storm = 5 button presses** counter (max single Addition) → Addition complexe high-tier
- **Rose Demon's Dance = 4 button presses** (presses 3-6)
- **Pattern** : "press 2" extrêmement commun (8 occurrences) → **second press = vulnerability moment fréquent canon**

### Mécanique canon Counter Additions

> Pattern canon : pendant l'animation Addition player, certains **button presses spécifiques** déclenchent un counter du mob. Si player rate ou ne touche pas ce moment, Aqua King **contre-attaque**. Vs mobs sans counter (Air Combat, Feyrbrand) = pas de risque addition timing.

⚠️ **À investiguer** : Counter = active une fois ou par button press ? Damage du counter ? Mob skips own turn quand counter ?

## Abilities canon

> Minor enemies HP-conditional + chance-weighted.

| HP    | Chance | Action                      | Target | Effect                                                          |
| ----- | ------ | --------------------------- | ------ | --------------------------------------------------------------- |
| > 50% | 50%    | **Physical Attack Barrier** | Self   | Reduces physical damage to **0** until next turn                |
| > 50% | 25%    | **Magical Attack Barrier**  | Self   | Reduces magical damage to **0** until next turn ⚠️ rare canon   |
| Any   | 25%    | **Power up**                | Self   | +50% damage dealt + -50% damage received for **3 turns**        |
| ≤ 50% | 75%    | ~Trident Stab               | Single | 1× Physical damage ⚠️ **BUGGED in retail — does nothing canon** |

### Pattern AI canon analysis

- **HP > 50% defense-focused** : 50% Phys Barrier + 25% Mag Barrier + 25% Power up = **0% offense** (zero damage actions HP > 50%)
- **HP ≤ 50% offense-focused** : 75% Trident Stab + 25% Power up = **75% damage attempt BUT bug renders 0% damage**
- → **Bug rend Aqua King totalement inoffensif damage canon**

### Magical Attack Barrier canon ⭐ RARE

⚠️ **Aqua King + Treasure Jar = only 2 enemies in entire game capable of Magical Attack Barrier**. Pattern canon ultra-rare ability. **Treasure Jar location canon** : encountered between Lidiera and Fueno (Disc 2 Tiberoa area, à investiguer).

### Power up self-buff canon

- **+50% damage dealt + -50% damage received** for **3 turns** duration
- Disponible Any HP, 25% chance
- Pattern différent de Feyrbrand Attacking power up (Feyrbrand = additive stack, Power up = fixed +50% × 3 turns)
- À implémenter `Buff { type: 'dual_damage_modifier', dealtMult: 1.5, receivedMult: 0.5, duration: 3 }`

### Trident Stab BUG canon ⚠️ MAJEUR

- ⚠️ **"Bugged in retail so Aqua King simply does nothing when selecting this action"**
- Result : **Aqua King has 0 abilities which deal damage canon**
- → **Trivial encounter canon** : Aqua King ne peut JAMAIS infliger damage en retail PS1 canon (sauf via Counter mechanism qui retaliate Addition button presses)
- Observation test canon : "using Power Down on Aqua King, often wears off before they take 3 turns" — confirms mob rarement attaque

⚠️ **Question Damia** : preserve bug (authenticity) OR fix (gameplay balance) ? Pattern "well-known retail bug" canon.

## Encounters canon

### Aglis (Disc 2, Wingly underwater city)

- **Aqua King solo** (formation 234) : submaps 574 (10%), 582 (10%)
- **Aqua King + Minotaur** (formation 236) : submaps 570 (20%), 571 (35%), 573 (35%), 578 (20%), 579 (35%)
- **Scud Shark + Aqua King** (formation 238) : submaps 573, 574, 576, 582, 712 (20-35%)

→ Pattern Aglis : Aqua King frequent middle-zone encounter, paired with Minotaur OR Scud Shark.

### Escape rate 30% standard

## Trivia canon ⭐

### Merman recolor (Marshland) canon

- Pattern visual reuse : Aqua King = Merman recolor (Marshland mob Disc 1)
- Implique **2 mobs canon Merman + Aqua King** partagent model + animations
- À cross-référer `mobs/Merman.md` (à créer) Marshland Disc 1

### 2 enemies Magical Attack Barrier canon ⭐ RARE

- **Aqua King** (Aglis Disc 2)
- **Treasure Jar** (between Lidiera and Fueno) — Disc 2 Tiberoa area
- À cross-référer `mobs/Treasure Jar.md` (à créer)

### Bug canon retail "0 damage Aqua King" ⚠️

- Conséquence : encounter trivial
- Test canon : Power Down (3 turns debuff) wears off before mob takes 3 turns
- À documenter `combat/canon-bugs.md` (à créer) retail PS1 bugs list

## Combat flow canon

1. Battle start : Aqua King (solo OR avec Minotaur/Scud Shark)
2. AI cycle :
   - HP > 50% : 50% Phys Barrier / 25% Mag Barrier / 25% Power up = **0% offense**
   - HP ≤ 50% : 75% ~Trident Stab (BUGGED = nothing) / 25% Power up
3. Counter mechanism : player Additions trigger Aqua King counter sur certains button presses (cf. table 28 opportunities)

### Strategy canon recommandée

- **Use elemental Earth weapon** (Twister Glaive Lavitz/Albert) — Water weak Earth ? Wait, Water↔Fire opposite. Wind↔Earth. Water = no opposite Earth. Wind weak Earth. Water counter = Light ? À investiguer canon
- Actually : **Fire counters Water** canon → use Heat Blade Dart, Fire magic (Burn Out)
- **Avoid Additions** with high counter button presses (Lavitz Flower Storm 5 / Rose Demon's Dance 4)
- **Safe Additions** : single-press counters (Dart Volcano 1 / Rose Hard Blade 1 / Meru Perky Step 1 / Haschel 2 add. / Albert 2 add.)
- **Status applicables** : Confuse / Fear / Poison / Stun (non-immune) → utiliser Mind Crush / Bemusing Arrow / Spear of Terror / etc.
- Sparkle Arrow Light vs Water Aqua King = Light vs Water canon ? Pas opposite explicit canon — probable neutral 1×
- **Heat Blade Dart Fire vs Aqua King Water = 1.5× damage canon** ⭐ optimal physical damage
- **Magic Burn Out (Fire) / Final Burst (Fire)** Dart Dragoon vs Aqua King Water = 1.5×

## Vision Damia (implémentation)

### Décisions canon à conserver

1. **Stats canon exacts** : HP 640 / AT 67 / DF 120 / MAT 65 / MDF 160 / SPD 70
2. **Counters Additions : Yes** ⭐ premier mob documenté ainsi
3. **28 Counter Opportunities exactes** : conserver button presses table (player Addition timing-based counter)
4. **Magical Attack Barrier rare canon** : preserve 1/2 mobs game
5. **Power up self-buff +50%/-50% × 3 turns** : pattern à implémenter
6. **Phys Attack Barrier reduces phys to 0 until next turn** : pattern temporary immunity
7. **Trident Stab BUG canon** ⚠️ : décision préserve bug OR fix ?
8. **Merman recolor visual** : asset reuse pattern

### Implementation tech

- Data-model `CounterOpportunity`:
  ```ts
  type CounterOpportunity = {
    user: Character;
    addition: AdditionName;
    buttonPresses: number[]; // e.g. [2, 3, 4, 5, 6] for Flower Storm
  };
  type MobCounterTable = {
    mobName: string;
    opportunities: CounterOpportunity[];
    totalCount: number;
  };
  ```
- Data-model `Buff` étendu :
  ```ts
  type Buff = {
    // ...
    type: 'dual_damage_modifier' | 'physical_immunity' | 'magical_immunity' | ...;
    dealtMult?: number;     // Power up: 1.5
    receivedMult?: number;  // Power up: 0.5
    duration: number;       // turns
    immunityType?: 'physical' | 'magical';  // Barrier abilities
  };
  ```

### Questions ouvertes

- **Trident Stab bug** : preserve canon authenticity OR fix Damia ?
- **Kongol absent du Counter Opportunities table** : oversight wiki OR Kongol Additions sans counter ?
- **Counter mechanism timing** : counter par button press OR counter total fin Addition ?
- **Counter damage** : quel damage Aqua King counter ?

## Liens transverses

- [`README.md`](./README.md) — pattern général mobs canon
- [`../locations/Aglis.md`](../locations/Aglis.md) — Wingly underwater city Disc 2
- [`Merman.md`](./Merman.md) (à créer) — model original Marshland Disc 1
- [`Minotaur.md`](./Minotaur.md) (à créer) — encounter partner Aglis
- [`Scud Shark.md`](./Scud Shark.md) (à créer) — encounter partner Aglis
- [`Treasure Jar.md`](./Treasure Jar.md) (à créer) — 2nd mob avec Magical Attack Barrier canon
- [`../combat/elements.md`](../combat/elements.md) — Water weak Fire
- [`../combat/additions.md`](../combat/additions.md) — 28 Counter Opportunities = première référence détaillée mécanique counter

## Gaps / TODO

Voir [TODO.md](../../TODO.md) section Aqua King.
