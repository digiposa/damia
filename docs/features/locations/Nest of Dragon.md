# Nest of Dragon

> **Dungeon Disc 1** dans **mountains of south Serdio**, post-Volcano Villude → pré-Lohan. **Forest contaminated by Dragon's poison** (Feyrbrand poison canon). **2 bosses canon** : **Greham (Jade Dragoon)** + **Feyrbrand (Wind Dragon vassal)** combat scripted ensemble. **Acquisition canon : Jade Dragon DS** → Lavitz first transformation Dragoon. **Spring rest free + full restore + cure ALL status**. **Life Water good** (interact spring + Water Bottle).
>
> **Source canon** : 🥈 [`_sources/lod-wiki-nest-of-dragon.md`](./_sources/lod-wiki-nest-of-dragon.md)

## Statut

🟡 **draft** — data canon ingérée. Aucune impl Damia.

## Profil

| Attribut          | Valeur                                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Type              | **Dungeon** (dense gloomy forest + warren of twisted organic growth beneath)                                             |
| Région            | **Mountains of south Serdio**                                                                                            |
| Disc              | Disc 1 (Chapter 1: Serdian War)                                                                                          |
| Combat            | Random Encounters + **2 bosses scripted** (Greham + Feyrbrand)                                                           |
| Previous (canon)  | #9 Volcano Villude                                                                                                       |
| Next (canon)      | #11 Lohan                                                                                                                |
| Submaps           | **9** (6 area + 1 overlook + 2 close-up cutscenes)                                                                       |
| Save points       | **1** (upper area, just before boss fight)                                                                               |
| Rest              | **Spring (free)** — full HP+MP + **cure ALL status** (pattern "ultimate rest" canon Disc 1)                              |
| Shops             | Aucun                                                                                                                    |
| Mécanique unique  | **Forest poisoned by Dragon** (Feyrbrand's presence warps environment) + **web/vine traversal** (spider web pit → climb) |
| Acquisition canon | **Jade Dragon DS** automatique post-Greham/Feyrbrand defeat → **Lavitz first Dragoon transformation**                    |

## Story / lore

Story beat majeur Disc 1 (Chapter 1 Serdian War). **Quête : confronter Feyrbrand pour briser le power tip Sandora**.

### Beats narratifs canon

- **Post-Volcano Villude** : Dart + Shana + Rose + Lavitz traversent mountain range + entrent forest
- Rose remarque la contamination en premier :
  > _"Guys, don't you feel something?"_
  > _"This forest is contaminated by the dragon's poison."_
- **Submap 131** : **forked path where Shana runs off** ← story beat narrative (probable Shana lured/runs from danger ?)
- **Submap 132** : strange plant blocking path → cohérent Dragon poison contamination
- **Submap 133** : right fork entrée Dragon's Den **covered in web** (Feyrbrand's lair)
- **Submap 134** : **pond of clean water** = Spring (healing rest + Life Water source)
- **Submap 135** : upper pathway, spooky plants block way
- **Submap 136** : distant overlook of Greham (cutscene Greham reveal)
- **Submap 656** : close-up Lavitz talking with Greham — moment narratif majeur Lavitz-Greham
- **Submap 716** : close-up after Greham defeated → Jade Dragon DS transition

### Lavitz-Greham canon (Lavitz first Dragoon moment)

- **Greham = Jade Dragoon canon** (cf. [`../dragoons/dragons.md`](../dragoons/dragons.md))
- **Lavitz talking with Greham** (submap 656) = moment narratif Disc 1 important :
  - Probable reveal lore : Greham un ancien knight Basil → Sandora defection ?
  - Greham wields Jade DS → confronts Lavitz canon (knight Basil vs ancien knight Basil défector ?)
- Defeat → **Greham dies + Jade Dragon DS transfers automatically à Lavitz**
- **Lavitz first Dragoon transformation** = unlocked here Disc 1 canon
- Pattern Archetype Jade : **Syuveil (Vellweb ancien) → Greham (Hoax-Nest) → Lavitz (Disc 1) → Albert (Disc 2 post-Lavitz death)** = 4 wielders canon (cf. dragons.md)

### Feyrbrand canon (vassal Wind Dragon)

- **Feyrbrand = Greham's Wind Dragon vassal** canon
- Praying mantis shape + green body + giant tusks ("Green-Tusked Dragon" canon)
- Source du power tip Sandora canon Serdian War (cf. [Emperor Doel.md](../bosses/Emperor Doel.md) §Backstory)
- Defeat → **Down Burst 100% drop** (Wind attack item canon)

## Services

### Save Points (1)

- **Upper area** post-spooky plants, **immediately before boss fight Greham/Feyrbrand**

### Rest Areas

| Type       | Location                                      | Prix     | Effect                                               |
| ---------- | --------------------------------------------- | -------- | ---------------------------------------------------- |
| **Spring** | Submap 134 (after falling down large web pit) | **Free** | **Full HP+MP + cure ALL Status Ailments** (ultimate) |

> **Pattern "ultimate rest" canon Disc 1** : Spring Nest of Dragon = même mécanique que Cave Water Death Frontier / Water Divine Tree (full HP+MP + ALL status cure). Free + sacred location.

### Shops

Aucun (dungeon naturel hostile).

## Collectibles

### Goods (2)

| Good               | Acquisition mechanic                                                                                                                                      |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Jade Dragon DS** | **Automatic add to inventory post-defeat Greham + Feyrbrand**. Enables Lavitz transform Dragoon. **Première DS canon obtenue par party member non-Dart**. |
| **Life Water**     | Interact with **Spring** + **Water Bottle in inventory**. Pattern : context-dependent good acquisition.                                                   |

> 🆕 **Pattern canon "DS auto-add post-boss defeat"** : Jade Dragon DS = précédent canonique. Cohérent canon : **defeating Dragoon → DS becomes available to party**. À refléter Damia (le code) `Boss.onDefeat.grants: ItemId[]`.

### Stardust

Aucun.

### Treasure Chests (5)

| Contents           | Acquisition (path-dependent)                                   |
| ------------------ | -------------------------------------------------------------- |
| **Chain Mail** ⚠️  | Normal path, hop rocks before web pit, follow path to end      |
| Mind Purifier      | In pit, climb 1st vine, hole right then hole left              |
| **Bravery Amulet** | From Mind Purifier chest, hole near bottom right + follow path |
| Body Purifier      | Instead of bottom-right hole, climb vine + hole at end of path |
| Spirit Potion      | Along path to Body Purifier                                    |

> 🆕 **Items canon nouveaux** :
>
> - **Chain Mail** : armor canon Disc 1 (chest). À documenter `items/equipment.md`.
> - **Bravery Amulet** : anti-Fear accessory canon (cohérent Bale shop + Deningrad 300G). Pattern : accessory disponible early Disc 1 chest avant Bale shop.
> - Pattern **chests path-dependent** : exploration récompense joueur qui descend Dragon's Nest deep.

## Combat

### Minor Enemies (5 — theme nature corrupted)

| Mob                | Élément  | EXP | Gold | Drop (%)             |
| ------------------ | -------- | --- | ---- | -------------------- |
| **Mandrake**       | Water    | 15  | 9    | Sun Rhapsody 8%      |
| **Run Fast**       | Thunder  | 16  | 12   | Body Purifier 10%    |
| **Lizard Man**     | Earth    | 18  | 15   | **Beast Fang 2%** 🆕 |
| **Man Eating Bud** | Darkness | 20  | 24   | Angel's Prayer 8%    |
| **Tricky Bat**     | Wind     | 12  | 6    | Mind Purifier 8%     |

> Notable :
>
> - **Diversité élémentaire** : Water/Thunder/Earth/Darkness/Wind (5 éléments différents) — pattern "diverse early dungeon"
> - **Tricky Bat = lowest EXP 12** = entry mob
> - **Man Eating Bud = highest EXP 20** = élite Nest mob
> - **Beast Fang** = NEW item canon (drop Lizard Man 2% rare) — probable attack item physical/Earth ? À documenter
> - **Random Encounter** standard Disc 1
> - **Escape 50%** = élevé (pattern Disc 1 = forgivant)

### Bosses

#### Greham (Wind Dragoon Jade)

| Stat    | Valeur             |
| ------- | ------------------ |
| Element | Wind               |
| EXP     | 1,200              |
| Gold    | 100                |
| Drops   | **Plate Mail 30%** |

> Greham = **Jade Dragoon canon** (cf. dragons.md §Greham reveal). Drops **Plate Mail 30%** (armor canon Disc 1). À documenter [`../bosses/Greham.md`](../bosses/Greham.md) (à créer) — boss profile complet.

#### Feyrbrand (Wind Dragon vassal)

| Stat    | Valeur                 |
| ------- | ---------------------- |
| Element | Wind                   |
| EXP     | 0 (yield via Greham)   |
| Gold    | 0                      |
| Drops   | **Down Burst 100%** 🆕 |

> Feyrbrand = **Wind Dragon vassal of Greham canon**. Praying mantis shape + green body + giant tusks ("Green-Tusked Dragon" canon). Drop **Down Burst 100%** = NEW item canon (probable attack item Wind, à investiguer). À documenter [`../bosses/Feyrbrand.md`](../bosses/Feyrbrand.md) (à créer) — boss profile complet.

### Encounter formations canon

Formations (54-59, 50-53) = 10 groupes mixed. Formation **393** = boss scripted (Feyrbrand + Greham ensemble, 0% escape).

## Vision Damia

### Mode Story

- **9 submaps** à reproduire (incl. 2 close-up cutscenes Lavitz-Greham)
- **Forest poisoning visual theme** = effet ambient (couleurs malsaines, particules toxiques)
- **Web/vine traversal mechanic** = mini-puzzle exploration (spider web pit → climb vines → access chests path-dependent)
- **Cutscene Lavitz-Greham** = moment narratif majeur Disc 1
- **Boss double Greham + Feyrbrand** = **prémier multi-boss canon**
- **Jade Dragon DS auto-add** + **first Lavitz Dragoon transformation** = milestone Disc 1 unlock
- **Shana runs off** narrative beat (submap 131) — orchestrer

### Mode Survival

- Nest of Dragon = **theme dungeon forest poisoned** = excellent arène boss
- 5 mobs ready-to-use (5 éléments différents = diversity)
- Greham + Feyrbrand = boss combo intéressant Survival

### À implémenter (impact code)

- **Mécanique "DS auto-add post-boss defeat"** : `Boss.onDefeat.grants: ItemId[]` data-model
- **Lavitz first transformation cinematic** (tutorial Dragoon form basic)
- **Spring "ultimate rest"** pattern (full HP+MP + ALL status cure free) — réutilisable Spring/Water/Cave Water
- **Web pit + vine climb traversal** = mini-puzzle exploration
- **Life Water context-dependent good** (Water Bottle prerequisite)
- **Forest poisoning visual ambient**
- **Boss double scripted formation** (Greham + Feyrbrand encounter 393)
- **Items nouveaux** : Down Burst (Feyrbrand drop), Beast Fang (Lizard Man drop), Chain Mail, Plate Mail (Greham drop)
- **Bravery Amulet** = anti-Fear accessory canon early Disc 1 (cohérent pattern 8-status accessories)

## Liens code & doc

- **Source canon** : [`_sources/lod-wiki-nest-of-dragon.md`](./_sources/lod-wiki-nest-of-dragon.md)
- **Volcano Villude** (previous) : `./Volcano Villude.md` (à créer)
- **Lohan** (next) : `./Lohan.md` (à créer)
- **Greham** (boss Jade Dragoon) : `../bosses/Greham.md` (à créer)
- **Feyrbrand** (Wind Dragon vassal) : `../bosses/Feyrbrand.md` (à créer)
- **Dragons lore** (Feyrbrand canon Green-Tusked + Greham Jade Dragoon) : [`../dragoons/dragons.md`](../dragoons/dragons.md)
- **Lavitz** (Jade DS first wielder Disc 1) : `../party-members/Lavitz.md` (à créer)
- **Albert** (Jade DS inheritor Disc 2 post-Lavitz death) : [`../party-members/Albert.md`](../party-members/Albert.md)
- **Items** :
  - **Jade Dragon DS** + **Life Water** + **Water Bottle** → `../items/goods.md` (à créer)
  - **Chain Mail** + **Plate Mail** → `../items/equipment.md` (à créer)
  - **Down Burst** + **Beast Fang** → `../items/consumables.md` (à créer)
  - **Bravery Amulet** anti-Fear → `../items/accessories.md` (à créer)
- **Combat / Elements** : 5 mobs Water/Thunder/Earth/Darkness/Wind — [`../combat/elements.md`](../combat/elements.md)
- **Status effects** : Body Purifier + Mind Purifier — `../combat/status-effects.md` (à créer)

## Questions ouvertes

- **Greham backstory canon** — ancien knight Basil défector vers Sandora ? Why Lavitz "talks with" Greham ? Tension narrative.
- **"Shana runs off" submap 131** — pourquoi ? Story event ? Threat Feyrbrand poison ? Lured ?
- **Down Burst item** — Wind attack item probable (Feyrbrand drop 100%). Mécanique exacte ? À documenter `items/consumables.md`.
- **Beast Fang item** — drop Lizard Man 2%. Type ? Physical attack item ? Material crafting ?
- **Plate Mail** vs Chain Mail Disc 1 — 2 armors disponibles ici. Stats/effects ? À investiguer items page.
- **Bravery Amulet à Disc 1 already** — confirme anti-Fear accessory disponible **avant** Deningrad (300G) et Bale shop. Pattern : early-game access même accessory progression.
- **Greham + Feyrbrand fight ensemble canon** — simultaneous ? Sequential (Greham → Feyrbrand) ? Phases ? À reconfirmer fandom.
- **Life Water mécanique** — Water Bottle requis. Where obtain Water Bottle ? Probable Disc 1 earlier location. À investiguer.
- **Forest poisoning canon mechanic** — narrative only ou gameplay effect (party damage walking in poisoned zones) ?
- **Spider web pit** mécanique — gameplay puzzle vs just décor ? Visual + traversal seulement ?
- **9 submaps "small dungeon" canon** — vs Death Frontier 46 submaps. Pattern : Disc 1 dungeons = smaller, Disc 4 = larger.
- **Lavitz Dragoon transformation first time canon** — animation/cinematic notable ? Cohérent canon "Dart Hoax transformation premiere" (Disc 1 mid).
- **Forêt-mountains régionale canon** — "south Serdio mountains" — comparison Volcano Villude (volcanic) + Marshlands (wetland) régions. Mapping géographie Serdio Disc 1.
- **Pre-Lavitz Dragoon canon** — Greham wielded Jade DS first Disc 1 (vs Lavitz). Why Greham gave up / lost it ? À investiguer Greham lore.
