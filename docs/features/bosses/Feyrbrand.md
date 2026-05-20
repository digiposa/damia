# Feyrbrand — Premier dragon TLoD (Wind, boss Disc 1)

> **Premier dragon canon vu en jeu** : Wind element, monture/familier de Greham, boss Nest of Dragon Disc 1.
>
> **Sources** :
>
> - 🥈 [`_sources/lod-wiki-feyrbrand.md`](./_sources/lod-wiki-feyrbrand.md) — wiki LoD (stats + status immunity + abilities + Retaliate passive + Attacking power up stacking)

## Statut

🟡 **Draft post-ingestion wiki LoD** — fandom à ingérer pour cross-check + lore Feyrbrand-Greham bond + Disc 1 narrative arc.

## Identity canon

- **Espèce** : Dragon Wind canon (Jade Dragon Tribe)
- **Lien Dragoon** : Source du **Jade Dragoon Spirit** canon (Wind Dragoon = Lavitz/Albert)
- **Rider canon Disc 1** : **Greham**, ex-compagnon Servi (Lavitz' father) qui le trahit pour devenir Wind Dragoon
- **Encounter unique** : Nest of Dragon Disc 1 scripted boss + 0% escape (combat obligatoire story)
- **Mort canon** : tué par Lavitz/party → spirit becomes Lavitz Jade Dragoon Spirit canon (Eye merge mécanique)
- **Pattern symbolique** : **premier dragon TLoD vu en jeu** → introduction visuelle "creatures of Soa" lore foundation

## Stats canon

| Stat        | Value   |
| ----------- | ------- |
| HP          | 480     |
| AT          | 18      |
| DF          | 100     |
| MAT         | 12      |
| MDF         | 80      |
| SPD         | 50      |
| A-AV / M-AV | 0% / 0% |

→ Pattern boss canon Disc 1 : **HP 480** modéré (vs Damia ~2,500 Disc 3, Divine Dragon ~30,000 Disc 3), **DF 100 / MDF 80** robuste relatif au niveau early game.

## Status Immunity canon

**Immune à TOUS les 8 status canon** (Petrify, Bewitch, Arm Block, Dispirit, Confuse, Fear, Poison, Stun) → Pattern boss canon : status ailments inutiles contre bosses majeurs. Mind Crush / Spear of Terror / Demon Stiletto = no effect Feyrbrand.

## Yield canon

- **EXP : 0 / Gold : 0** — wiki list 0/0 mais c'est probablement parce que Feyrbrand est joined à Greham dans encounter (393), donc les rewards globaux viennent de Greham (~750 EXP / 350 Gold à confirmer)
- **Drop : Down Burst 100%** ⚠️ Repeat Item canon : "Down Burst" probable un item curatif/buff Wind-related. À cross-référer `items/consumables.md` (à créer)
- **Counter Opportunities : 0** — pas de fenêtre Counter canon

## Mécaniques canon spécifiques

### Trait passive : Retaliate ⭐ MAJEUR canon

**Triggered when targeted by magic** (Dragoon Magic ou enemy magic, à clarifier) :

- **Ignore turn order** (action hors-tour)
- **Use Attacking power up** sur soi-même (self-buff)

→ Pattern boss canon : **utiliser magie = penalité** Feyrbrand stacks damage multiplier. Discourage magic spam Lavitz/Dart Dragoon precoce.

### Attacking power up (self-buff stacking) ⭐ NEW pattern

| Use # | Multiplier            |
| ----- | --------------------- |
| Base  | 1.0×                  |
| 1st   | 1.1×                  |
| 2nd   | 1.2×                  |
| 3rd   | 1.3×                  |
| ...   | etc (linear additive) |

→ **Additive stacking** (vs multiplicative) canon. Si magic spam x5 → Feyrbrand est x1.5× damage. **Pattern : "boss adapte sa puissance face à magic spam"** canon design.

### Abilities canon (2 + 1 self-buff)

| Action             | Target | Effect                                              | Notes                                                     |
| ------------------ | ------ | --------------------------------------------------- | --------------------------------------------------------- |
| ~Mandible Strike   | Single | 1× Physical damage                                  | Attaque basique standard                                  |
| ~Status Slime      | Single | 1× Phys damage + **100% Fear/Poison/Stun (random)** | Réduit par A-AV target — pattern "guaranteed status proc" |
| Attacking power up | Self   | 1.1× stacking                                       | Self-buff via Retaliate uniquement                        |

⚠️ **Status Slime 100% canon** ⚠️ avec A-AV reduction → **pattern boss "guaranteed but evadable"** : sans A-AV high, status appliqué; avec A-AV, chance escape proportionnelle. À investiguer formule canon exacte A-AV → status proc reduction.

## Combat flow canon

1. Battle start : Feyrbrand + Greham scripted Nest of Dragon (submap 136)
2. Pattern Feyrbrand : alterne Mandible Strike / Status Slime
3. Si party utilise magic (Dragoon Magic) → **Retaliate trigger** : Feyrbrand ignore tour + boost +0.1× multiplier
4. Boss fight strategy canon recommandée :
   - **Avoid Dragoon Magic** (au moins until Feyrbrand HP low)
   - Use **physical Additions** uniquement
   - Equip **status prevention** (Bravery Amulet vs Fear, Poison Guard, Stun Guard) — utile car Status Slime 100%
   - Lavitz physical advantage natural (Spear Lance/Twister Glaive)

## Story beats canon

- Premier "**big dragon**" visuel TLoD canon — pattern reveal "Dragons exist, dangerous"
- Greham + Feyrbrand = **antagonist pair Disc 1** : Greham humain + dragon mount → after defeat, **Greham's body falls + Lavitz inherits Jade Dragoon Spirit** (eye merge canon)
- Précurseur narratif : montre **bond Dragoon-Dragon canon** (cf. [`dragoons/dragons.md`](../dragoons/dragons.md))

## Vision Damia (implémentation)

### Décisions canon à conserver

1. **HP 480 / stats canon** : balance Disc 1 boss authenticity
2. **Status immunity full** : pattern bosses Damia tous immunes au 8 status
3. **Retaliate passive trigger magic** : intéressant gameplay mécanique
4. **Attacking power up additive stack** : conserver linear scaling (vs multiplicative)
5. **Status Slime 100% Fear/Poison/Stun** avec A-AV reduction : pattern "guaranteed but mitigable"
6. **Encounter joined avec Greham** : 1 fight = 2 enemies pattern canon
7. **Down Burst drop 100%** : Repeat Item reward canon
8. **Counters Additions: No** : Feyrbrand n'a pas de counter mechanism (vs autres bosses qui en ont)

### Implementation tech

- Data-model `BossPassive`:
  ```ts
  type BossPassive = {
    name: 'Retaliate' | string;
    trigger: 'on_magic_targeted' | 'on_physical_targeted' | 'on_low_hp' | ...;
    action: BossAction;
    ignoreTurnOrder: boolean;
  };
  ```
- Data-model `Buff`:
  ```ts
  type Buff = {
    type: 'damage_multiplier';
    multiplier: number; // ex 0.1 increments
    stacking: 'additive' | 'multiplicative';
    duration?: number; // null = permanent
  };
  ```

### Questions ouvertes

- **"targeted by magic" = quoi exactement ?** Dragoon Magic ? Spells ? Magical items (Burn Out / Spark etc.) ? À investiguer Discord cadors. Probable : tout magic damage type.
- **Counters Additions: No** : implique d'autres bosses canon SONT counter-able via specific Addition patterns. À investiguer mécanique "Counter Opportunities" canon Damia.
- **Attacking power up : decay au fil du combat ?** Probable non (permanent buff). Si Feyrbrand stacks 10×, atteint 2× damage permanent ?

## Liens transverses

- [`../locations/Nest of Dragon.md`](../locations/Nest of Dragon.md) — location canon encounter
- [`Greham.md`](./Greham.md) (à créer) — rider + boss joined encounter
- [`../party-members/Lavitz.md`](../party-members/Lavitz.md) (à créer) — Jade Dragoon Spirit obtained post-Feyrbrand defeat
- [`../party-members/Albert.md`](../party-members/Albert.md) (à créer) — hérite Jade Dragoon Lavitz mort Disc 1
- [`../dragoons/dragons.md`](../dragoons/dragons.md) — Dragons canon master, Jade Dragon Tribe
- [`../dragoons/mechanics.md`](../dragoons/mechanics.md) — Eye merge → Dragoon Spirit canon mécanique
- [`../combat/elements.md`](../combat/elements.md) — Wind element (Feyrbrand = Wind)
- [`../items/equipment.md`](../items/equipment.md) — Plate Mail 30% drop Greham (joined fight)

## Gaps / TODO

Voir [TODO.md](../../TODO.md) section Feyrbrand.
