# Evergreen Forest — Disc 3 Mille Seseau central woodland

> **Location canon #25** entre Furni (#24) et Deningrad (#26). Large forêt centrale Mille Seseau servant de passage vers Mountain of Mortal Dragon + Forest of Winglies (barrier).
>
> **Sources** :
>
> - 🥈 [`_sources/lod-wiki-evergreen-forest.md`](./_sources/lod-wiki-evergreen-forest.md) — wiki LoD (services + 4 chests + 5 mobs + Kamuy boss + 8 sub-areas map)

## Statut

🟡 **Draft post-ingestion wiki LoD** — fandom à ingérer pour cross-check + narrative arc (Lloyd saves Wink + Rose leaps + Teo NPC).

## Identity canon

- **Position canon** : Mille Seseau centre, entre Furni (ouest, côte Illisa Bay) + Deningrad (capital) + Neet (extrême est, hometown Dart)
- **Fonction narrative** : passage Disc 3 vers Mountain of Mortal Dragon (Divine Dragon seal) + barrière naturelle vers Forest of Winglies (Wingly hidden society)
- **Path to Mountain of Mortal Dragon under constant guard canon** — Knight blocking access protégeant le seal Divine Dragon

## Services (limités)

| Service    | Disponibilité                         |
| ---------- | ------------------------------------- |
| Save Point | ✅ 1 (first area entering from Furni) |
| Rest       | ❌                                    |
| Shops      | ❌                                    |

→ Pattern "passage dungeon" canon : pas de services intermédiaires, on traverse pour atteindre Deningrad.

## Treasure chests (4)

| Item           | Location précise                                                             | Note canon                                                         |
| -------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Destone Amulet | Près squirrel volant dans arbre (sub-area 2)                                 | Prévient Petrification (cohérent encounter Dark Elf future bosses) |
| Body Purifier  | Côté droit screen ravin central (sub-area 3)                                 | Repeat Item curatif                                                |
| Depetrifier    | Hill rencontre **Teo** (sub-area 4)                                          | Cure Petrification (status spécifique)                             |
| Mind Purifier  | Sous tente à côté garde bloquant path Mountain of Mortal Dragon (sub-area 5) | Cure Confusion/Bewitchment status                                  |

→ Pattern de loot canon : focus sur **anti-status items** (Destone Amulet + Depetrifier + Mind Purifier) → préparation aux boss Disc 3+ qui infligent ces ailments.

## Combat — 5 mobs + 1 boss

### Mobs canon

| Mob           | Element  | EXP | Gold | Drop              |
| ------------- | -------- | --- | ---- | ----------------- |
| Flying Rat    | Wind     | 64  | 24   | Angel's Prayer 8% |
| Forest Runner | Wind     | 88  | 30   | Recovery Ball 8%  |
| Wounded Bear  | Earth    | 96  | 60   | Attack Ball 8%    |
| Dark Elf      | Darkness | 80  | 36   | Depetrifier 8%    |
| Moss Dresser  | Earth    | 72  | 18   | Healing Fog 8%    |

Pattern élémental forêt canon : **Wind + Earth + Darkness** (3 éléments). Pas de Fire / Water → cohérent biome "forêt humide tempérée". Counter recommandé : **Fire vs Earth** (Wounded Bear/Moss Dresser), **Light vs Dark** (Dark Elf, Sparkle Arrow Shana/Miranda particulièrement utile).

### Boss : Kamuy ⭐ source Darkness Stone canon

| Stat    | Valeur                  |
| ------- | ----------------------- |
| Element | **Non-Elemental**       |
| EXP     | 8,000                   |
| Gold    | 0                       |
| Drop    | **Darkness Stone 100%** |

⚠️ **Kamuy = source canon Darkness Stone** (Reduces darkness-based magical damage by half). Cohérent avec [`items/equipment.md`](../items/equipment.md) §6 — les 7 stones elemental tombent de bosses canon.

⚠️ **Kamuy = Non-Elemental** boss qui drop **Darkness Stone** — pattern intriguant (le boss n'est pas Darkness mais drop le stone Darkness). Hypothèse : Kamuy = créature mythique (esprit gardien forêt ?) corrompue, ou boss Darkness "déguisé" en Non-Elemental gameplay. À investiguer fandom + Discord. Pas de match avec pattern "7 ancient Dragoons drop 7 stones" (Kamuy ≠ Dragoon canon). **Possible** : Kamuy = entité distincte des ancient Dragoons.

## Map canon (8 sub-areas séquentiels)

1. **Path save point** (entrée Furni)
2. **Two paths + Flying Rat tree** + Destone Amulet chest
3. **Ravine** ⭐ **Rose leaps over** ← canon character beat athletic
4. **Hill** ⭐ **rencontre Teo** ← NPC canon + Depetrifier chest
5. **Tent + guard** bloquant Mountain of Mortal Dragon path + Mind Purifier chest
6. **Kamuy fight** (scripted encounter)
7. **Barrier vers Forest of Winglies** ← gateway géographique canon
8. **Ravine** ⭐ **Lloyd saves Wink** ← cinematic flashback canon ?

### Story beats canon mis en lumière

- ⭐ **Rose leaps over ravine** (sub-area 3) : démonstration capacités athlétiques Rose (cohérent canon "Rose Black Monster strength 11k ans + Dragoon agility")
- ⭐ **Teo NPC** (sub-area 4) : personnage rencontré sur hill — rôle narratif à documenter (probable garde / villageois / chemin info ?). À investiguer fandom
- ⭐ **Lloyd saves Wink** (sub-area 8) : cinematic flashback canon — **Lloyd protéger Wink** (la fiancée de Lynn ? cf. [Donau](./Donau.md)). Probable cinematic Disc 2 cf. quete Wink. À investiguer chronologie precise (Wink est Princesse Disc 2 mais peut-être revue Disc 3?). Sub-area 8 = "Ravine but when Lloyd saves Wink" implique réutilisation environnement pour cinematic différente.

## Connexions géographiques canon

```
Furni (#24) → Evergreen Forest (#25) → Deningrad (#26)
                  ↓
                  Mountain of Mortal Dragon (guard-blocked)
                  ↓
                  Forest of Winglies (barrier-gated)
```

→ Hub central Mille Seseau : 3 sorties (Deningrad capital / Mountain Divine Dragon / Forest of Winglies).

## Vision Damia (implémentation)

### Décisions canon à conserver

1. **8 sub-areas séquentielles** : structure linéaire dungeon-like avec branches (towards Mountain / Forest of Winglies)
2. **1 save point first area** : pattern accessibility canon
3. **Pas de shops / rest** : pattern "transition zone"
4. **5 mobs + 1 boss Kamuy** : encounter rate 10-14 (mid-range pour passage zone)
5. **Escape rate 30% standard** sauf scripted Kamuy 0%
6. **4 chests anti-status focus** : Destone/Depetrifier/Mind Purifier + Body Purifier
7. **Kamuy Non-Elemental drop Darkness Stone 100%** : conserver pattern unique (boss → stone elemental même si boss element diff)

### Story beats à intégrer

- Rose leaps ravine = animation/cutscene character
- Teo NPC = dialogue character + Depetrifier reward
- Guard blocking Mountain = barrier gameplay (story-gated progression)
- Lloyd saves Wink = cinematic (Disc 2 flashback ? Disc 3 reveal ?)

### Mode Survival potentiel

- Evergreen Forest = arène potentielle "forêt Mille Seseau" (3-element mix Wind+Earth+Darkness)
- Kamuy = boss potentiel arène avec drop Darkness Stone reward

## Liens transverses

- [`Furni.md`](./Furni.md) (à créer) — précédent #24, gateway entrée
- [`Deningrad.md`](./Deningrad.md) — suivant #26, capital Mille Seseau
- [`Mountain of Mortal Dragon.md`](./Mountain of Mortal Dragon.md) (à créer) — branche bloquée par guard
- [`Forest of Winglies.md`](./Forest of Winglies.md) (à créer) — branche bloquée par barrier
- [`Neet.md`](./Neet.md) (à créer) — hometown Dart, à l'est Evergreen
- [`bosses/Kamuy.md`](../bosses/Kamuy.md) (à créer) — source Darkness Stone canon
- [`items/equipment.md`](../items/equipment.md) — Darkness Stone (Kamuy 100% drop) + Destone Amulet (chest here)
- [`world-map/endiness.md`](../world-map/endiness.md) — Mille Seseau geography

## Gaps / TODO

Voir [TODO.md](../../TODO.md) section Evergreen Forest.
