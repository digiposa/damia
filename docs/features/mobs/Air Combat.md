# Air Combat — Mob Wind Moon That Never Sets (Disc 4)

> **Minor enemy Wind canon** : Moon That Never Sets Disc 4 endgame area, recolor de Wyvern (Mountain of Mortal Dragon), **incapable of dealing magic damage** malgré MAT 76.
>
> **Sources** :
>
> - 🥈 [`_sources/lod-wiki-air-combat.md`](./_sources/lod-wiki-air-combat.md) — wiki LoD (stats + 3 abilities HP-conditional + recolor Wyvern + no-magic trivia)

## Statut

🟡 **Draft post-ingestion wiki LoD** — fandom à ingérer pour cross-check si page existe.

## Identity canon

- **Espèce** : Air creature (Wyvern recolor canon visual)
- **Element** : Wind
- **Location canon** : **Moon That Never Sets** (Disc 4 endgame area) — submaps 615, 616, 617, 618
- **Pattern symbolique** : late-game mob endgame Disc 4 (HP 1,080 = mob "tier 4" power level)
- **Trivia majeure** : ⚠️ **"one of the few enemies incapable of dealing magic damage"** malgré MAT 76 stat — design canon "stat MAT non-utilisé" pattern

## Stats canon

| Stat | Value |
| ---- | ----- |
| HP   | 1,080 |
| AT   | 93    |
| DF   | 160   |
| MAT  | 76    |
| MDF  | 120   |
| SPD  | 50    |
| A-AV | 5%    |
| M-AV | 0%    |

→ Pattern mob endgame Disc 4 : HP 1,080 (vs Disc 3 Evergreen mobs ~300-560), DF 160 robuste, **MAT 76 mais 0 magic attacks canon** (cf. trivia).

## Status Immunity canon ⭐ pattern mob TLoD

| Immune (4) ✔ | Vulnerable (4) ✗ |
| ------------ | ---------------- |
| Petrify      | Confuse          |
| Bewitch      | Fear             |
| Arm Block    | Poison           |
| Dispirit     | Stun             |

→ Pattern canon mob master : **immune 4 high-tier status / vulnerable 4 mid-tier status**. Distinct des bosses (all 8 immune).

## Yield canon

- **EXP : 456 / Gold : 33**
- **Drop : Down Burst 8%** — Repeat Item Wind-related canon (cohérent avec Feyrbrand drop 100%)

## AI canon (3 abilities HP-conditional)

| HP   | Chance | Action              | Target | Effect                                             |
| ---- | ------ | ------------------- | ------ | -------------------------------------------------- |
| Any  | 75%    | ~Razor Tail         | Single | 1× Physical damage                                 |
| >25% | 25%    | **Charging Spirit** | Self   | "Will use Razor Tail or All-out Attack! next turn" |
| ≤25% | 25%    | **All-out Attack!** | Single | **3× Physical damage** ⚠️                          |

⚠️ Pattern AI canon mob master :

- Action base "Any HP" 75% = Razor Tail (1× phys single basic)
- HP-conditional branches 25% selon HP threshold 25%
- **Low HP "berserker mode"** : Charging Spirit + All-out Attack! 3× damage = pattern "wounded mob more dangerous" canon

### Charging Spirit self-buff canon

- Pattern self-buff "preparation" : utilise Razor Tail OR All-out Attack! next turn
- Self-buff sans damage immediate
- **Disponible HP > 25%** uniquement (mid-HP behavior)

### All-out Attack! 3× damage canon ⭐ MAJEUR

- **Triple damage physical single target** canon : 3× damage multiplier ability
- **Disponible HP ≤ 25%** (low HP exclusive) → pattern "desperate finisher canon"
- Pattern canon mob distinct des bosses (mobs ont des "ultimate ability" low HP)

## Encounters canon

### Moon That Never Sets (Disc 4)

- **Air Combat solo** (formation 311) : 35% submap 615, 35% submap 616, 10% submap 618
- **Air Combat + Swift Dragon** (formation 314) : 10% submap 616, 20% submap 617, 35% submap 618
- ⚠️ **2 unused formations** (283 single, 288 ×2) — content cut canon

### Escape rate 30% standard mob

## Trivia canon ⭐

### Recolor Wyvern (Mountain of Mortal Dragon) canon

- Pattern visual reuse TLoD : Air Combat = Wyvern recolor (Mountain of Mortal Dragon mob distinct)
- Implique **2 mobs canon Wyvern + Air Combat** partagent same model + animations canon
- À cross-référer `mobs/Wyvern.md` (à créer) Mountain of Mortal Dragon mob

### "Incapable of dealing magic damage" ⭐ MAJEUR

- Malgré MAT 76 stat (non-trivial), Air Combat ne fait **AUCUN magic attack canon**
- Pattern design canon "stat unused" : MAT 76 = leftover/cosmetic stat
- Implique : Spiritual Ring / Robe (magic defense) **inutile vs Air Combat** canon
- ⚠️ Pattern à investiguer : combien d'autres mobs canon ont MAT > 0 mais 0 magic abilities ?

## Combat flow canon

1. Mob spawn random Moon That Never Sets
2. AI cycle :
   - HP > 25% : 75% Razor Tail / 25% Charging Spirit (self-buff)
   - HP ≤ 25% : 75% Razor Tail / 25% All-out Attack! (3× damage)
3. Charging Spirit (HP > 25% only) prepares Razor Tail OR All-out Attack! for next turn — **bug canon ?** All-out Attack! is HP ≤ 25% only, comment Charging Spirit le prépare en HP > 25% state ? À investiguer.

### Strategy canon recommandée

- **Wind weak to Earth** → Kongol axes + Earth Repeat Items (Pellet/Meteor Fall) effective
- **Light Sparkle Arrow** vs Wind = neutral (pas Light↔Wind canon)
- **HP > 25% safer** : just Razor Tail (1× phys, manageable)
- **HP ≤ 25% danger zone** : All-out Attack! 3× phys → finish quickly avant low HP
- Status applicables : **Confuse / Fear / Poison / Stun** (mob non-immune) → utiliser Mind Crush / Bemusing Arrow / Spear of Terror / Virulent Arrow / Beast Fang
- Wind weapons (Twister Glaive Lavitz) = same-element resist 0.5× → switch non-elemental
- **A-AV 5%** : 5% chance miss player attacks (faible mais existe)

## Vision Damia (implémentation)

### Décisions canon à conserver

1. **Stats canon exacts** : HP 1,080 / AT 93 / DF 160 / MAT 76 / MDF 120 / SPD 50
2. **Status immunity 4✔/4✗ pattern mob** : préserver vs bosses all-8 immune
3. **AI HP-conditional 3 abilities** : Razor Tail (any 75%) / Charging Spirit (>25% 25%) / All-out Attack! (≤25% 25%)
4. **3× damage All-out Attack! low HP berserker** : preserve pattern
5. **A-AV 5%** : low-tier evasion canon
6. **Drop Down Burst 8%** : Wind Repeat Item
7. **Recolor Wyvern visual** : asset reuse pattern
8. **No magic damage despite MAT 76** : preserve quirk canon

### Implementation tech

- Data-model `MobAI`:
  ```ts
  type MobAI = {
    abilities: Array<{
      hpRange: 'any' | 'above_25pct' | 'below_25pct' | string;
      chance: number;
      action: Ability;
    }>;
    statusImmunity: StatusAilment[]; // mob: 4 / boss: 8
    countersAdditions: boolean;
  };
  ```
- Data-model `Ability` damage multiplier :
  ```ts
  type Ability = {
    name: string;
    target: 'single' | 'party' | 'self';
    physMult?: number; // 1× base, 3× All-out Attack!
    magicMult?: number;
    statusInflict?: StatusInflict;
    selfBuff?: Buff;
    primesNextTurn?: boolean; // Charging Spirit pattern
  };
  ```

### Questions ouvertes

- **Charging Spirit + HP zone bug ?** Self-buff "prepares All-out Attack! next turn" mais All-out Attack! requires HP ≤ 25%. Si Charging Spirit used HP > 25%, comment All-out triggers next turn ? Probable AI override OR Charging Spirit force HP-zone re-check next turn. À investiguer.
- **MAT 76 vestigial stat ?** Damia : conserver tel quel OR utiliser pour magic damage ? Probable preserve canon authenticity.
- **Wyvern recolor sharing** : Damia partage assets ou model distinct ?

## Liens transverses

- [`README.md`](./README.md) — pattern général mobs canon
- [`../locations/Moon That Never Sets.md`](../locations/Moon That Never Sets.md) (à créer) — encounters canon
- [`Wyvern.md`](./Wyvern.md) (à créer) — model original Mountain of Mortal Dragon
- [`../combat/elements.md`](../combat/elements.md) — Wind weak Earth
- [`../bosses/Feyrbrand.md`](../bosses/Feyrbrand.md) — Wind dragon canon comparison

## Gaps / TODO

Voir [TODO.md](../../TODO.md) section Air Combat.
