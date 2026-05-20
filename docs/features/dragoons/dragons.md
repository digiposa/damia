# Dragons (créatures)

> **Foundational lore TLoD** : les Dragons sont les **créatures** (distinctes des **Dragoons** = wielders humains de Dragoon Spirits). **105ème fruit du Divine Tree** (cf. [`locations/Divine Tree.md`](../locations/Divine Tree.md)), importance grew **~11,682 ans ago**. **Hiérarchie canon** : élément + **eye count 1-7** (plus d'yeux = plus de pouvoir + commande sur lower-eye). **Dragoon Spirit = magical gem laissé par Dragon mort**, mécanique Dragoon power source. **Dragoons can command Dragons** : even element + Spirit's Dragon had MORE eyes que target. **Thought extinct** present, **3 vivants canon** (Feyrbrand, Regole, Divine Dragon).
>
> **Source canon** : 🥈 [`_sources/lod-wiki-dragons.md`](./_sources/lod-wiki-dragons.md)

## Statut

🟡 **draft** — foundational lore canon ingéré.

## Profil

| Attribut              | Valeur                                                                                                |
| --------------------- | ----------------------------------------------------------------------------------------------------- |
| Type                  | **Créatures canon** (105th fruit Divine Tree)                                                         |
| Origine               | **105ème fruit du Divine Tree** (cohérent [Divine Tree.md](../locations/Divine Tree.md) §108-species) |
| Importance historique | Grew **~11,682 ans avant les events** (Dragon Campaign era)                                           |
| Statut présent        | **Thought extinct**, 3 connus survivants (Feyrbrand / Regole / Divine Dragon)                         |
| Hiérarchie canon      | **Élément + Eye count (1-7)** déterminent rang                                                        |
| Mécanique DS          | **Magical gem dropped on death** = Dragoon Spirit, harnessed by humans                                |

## History canon

### Pré-Dragon Campaign era

- Dragons existent depuis l'**aurore du monde** (105th fruit Divine Tree)
- **~11,682 ans ago** : importance grew dramatically
- **Winglies subjugaient nombreuses species** incluant **humans + Dragons**
- Dragons → **bloody uprising** contre oppression Wingly
- **Humans discover Dragoon Spirit mechanic** : Dragon mort laisse **magical gem** → harnessable → power "**forever afterward**" (Dragoon = permanent power) → rival Wingly magic capabilities

### Dragon Campaign (war canon)

- "**Bloody uprising**" Humans + Dragons vs Winglies
- **Many Dragons lost** during la war
- Pattern : Dragons servent leur **commander Dragoon** (cf. § Hierarchy)
- Issue : Wingly age fell → **Human Age** débute (cf. [Divine Tree.md](../locations/Divine Tree.md) §Cycle)

### Present canon (game era)

- Dragons **thought extinct** par la plupart
- **3 Dragons vivants confirmés canon** :
  - **Feyrbrand** (Disc 1 Serdio, used by Sandora)
  - **Regole** (Disc 2 Undersea Cavern)
  - **Divine Dragon** (Disc 3 attaque Deningrad)
- **1 carcass canon** : **Deceased Dragon Black Castle Kazas** (harvested magical energy)
- Lien Kongol/Doel : magical research Black Castle = exploit Dragon carcass canon (cohérent [Kazas.md](../locations/Kazas.md) §magical research)

---

## Liste canon Dragons (10 + 1 unnamed)

### 7 anciens Dragons élémentaux (Dragon Campaign, 6 eyes chacun — source des 7 Dragoon Spirits)

| Dragon                  | Élément  | Eyes | Dragoon Spirit owner canon                                                      |
| ----------------------- | -------- | ---- | ------------------------------------------------------------------------------- |
| **Red-Eyed Dragon**     | Fire     | 6    | Zieg Feld → **Dart** (Disc 1) ; + Divine Dragon DS Disc 4                       |
| **Jade Dragon**         | Wind     | 6    | Syuveil (ancien Vellweb) → Lavitz Disc 1 → **Albert** Disc 2 (héritage)         |
| **White Silver Dragon** | Light    | 6    | Shirley (Shrine of Shirley) → **Shana** Disc 1 → **Miranda** Disc 3 (transfert) |
| **Darkness Dragon**     | Darkness | 6    | **Rose** (immortelle 11k ans canon)                                             |
| **Violet Dragon**       | Thunder  | 6    | Kanzas probable (ancien Vellweb) → **Doel** Disc 1 → **Haschel** post-defeat    |
| **Blue Sea Dragon**     | Water    | 6    | **Damia** (ancien Vellweb) → **Meru** Disc 2 (post-Phantom Ship arc)            |
| **Golden Dragon**       | Earth    | 6    | **Belzac** (ancien Vellweb) → **Kongol** Disc 2 (post-Doel)                     |

> Pattern canon : **7 anciens Dragons élémentaux 6-eye** = source du **système Dragoon canon TLoD**.

### Hierarchical Dragons (autres eye counts)

| Dragon            | Élément  | Eyes  | Lore canon                                                                           |
| ----------------- | -------- | ----- | ------------------------------------------------------------------------------------ |
| **Michael**       | Darkness | **5** | **Vassal Dragon de Rose** (Dragon Campaign canon, fight Winglies + Virage)           |
| **Unnamed**       | ?        | **7** | **Fought Divine Dragon, defeated by it** — un des rares 7-eye Dragons documentés     |
| **Divine Dragon** | ?        | ?     | **King of Dragons** canon, sealed by Winglies, broke free Disc 3 → attaque Deningrad |

> **🆕 Hierarchy canon Dragon-Dragoon command rule** :
>
> - **Element match** requis (Dragoon Darkness commande Darkness Dragons only)
> - **Dragoon Spirit > target Dragon eye count** : Spirit from 6-eye → commande Dragons 5-eye and below same element
> - **Exemple canon** : Rose's DS (Darkness 6-eye Dragon source) → commande **Michael** (Darkness 5-eye) ✅
>
> Pattern data-model Damia : `Dragon.eyes: 1-7`, `Dragoon.spiritEyes: 1-7`, `commandRule(dragoon, dragon) = sameElement && dragoon.spiritEyes > dragon.eyes`.

### Dragons vivants present (game era)

| Dragon            | Élément                   | Location canon                                                     | Boss Disc | Lore                                                                                                                                              |
| ----------------- | ------------------------- | ------------------------------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Feyrbrand**     | Wind probable             | **Serdio forest** (used by Sandora military advantage vs Basil)    | Disc 1    | Boss canon Nest of Dragon arc, Greham wielder. Cohérent Sandora power tip war.                                                                    |
| **Regole**        | Water probable            | **Undersea Cavern** (home), terrorise villages **Suncrest Island** | Disc 2    | Boss canon Mountain of Mortal Dragon arc.                                                                                                         |
| **Divine Dragon** | Non-Elemental (canon tag) | Sealed by Winglies → broke free, attaque **Deningrad**             | Disc 3    | "King of Dragons" canon. Attaque event canon (Divine DG Ball + Cannon). Spirits accordés à Dart Disc 4 (cf. [Dart.md](../party-members/Dart.md)). |

### Deceased Dragon (carcass canon)

- **Black Castle Kazas** : Dragon carcass harvested for **magical energy**
- Cohérent canon : **Doel orders elaborate magical research Black Castle** (cf. [Emperor Doel.md](../bosses/Emperor Doel.md) §Personality)
- Implication lore : **Sandora exploite Dragon mort** pour magical research = source potentielle des Dragoon Spirits Disc 1 ? Ou autre artifact ?
- À investiguer ingestion ultérieure.

---

## Appearance canon

- **Wide variety of shapes and sizes** — pas un unique design
- **Eyes = prime similarity** (1-7 selon power tier)
- Shapes diverses : **empowered versions of normal creatures** (mantis, beetle, fish, etc.)
- Some look **otherworldly** : "strange propulsion on their backsides" canon

## Characteristics

- Abilities **vary wildly**
- Similarities : **eyes + magical properties + elemental attribute**
- **Many can fly** (pas tous)

## Hierarchy canon

### 2 traits déterminants

1. **Élément spécifique** (Fire / Water / Wind / Earth / Light / Darkness / Thunder)
2. **Eye count 1-7** (1=faible, 7=top tier)

### Power scaling par eye count

| Eyes  | Power tier                    | Canon examples                                            |
| ----- | ----------------------------- | --------------------------------------------------------- |
| 1-3   | Lesser Dragons                | (non documentés explicitement)                            |
| 4-5   | Mid-tier                      | Michael (5-eye Darkness vassal)                           |
| **6** | **Elite Dragon Campaign era** | 7 anciens élémentaux (Red-Eyed, Jade, etc.)               |
| **7** | **Top tier**                  | Unnamed (defeated by Divine Dragon)                       |
| ?     | **King canon**                | Divine Dragon (eye count non spécifié, "king of Dragons") |

### Dragoon command rule canon

**Dragoon commande Dragon UNIQUEMENT si** :

1. **Same element** (Dragoon's Spirit element == target Dragon element)
2. **Spirit's Dragon eyes > target Dragon eyes** (strict inequality)

→ Implication : un **6-eye Spirit Dragoon** peut commander **all 1-5 eye Dragons same element**. Cohérent canon Rose (6-eye DS) → Michael (5-eye Darkness) ✅.

→ Pattern réutilisable data-model Damia (le code) :

```ts
Dragon { id, element, eyes (1-7), location, lore }
Dragoon { id, spirit: DragonId, ... }
canCommand(dragoon, dragon): boolean =
  dragon.element === spiritOf(dragoon).element &&
  spiritOf(dragoon).eyes > dragon.eyes
```

---

## Vision Damia

### Mode Story

- **7 anciens Dragoons + 3 Dragons vivants + 1 carcass + 1 Unnamed + Michael** = ~12 Dragons canon à modéliser
- **3 boss canon vivants** : Feyrbrand (Disc 1) + Regole (Disc 2) + Divine Dragon (Disc 3)
- **Lore cinematics** : Dragon Campaign uprising (Cutscene 8 Library Ute mentionne 7 Dragoons), Dragon Spirit gem drop mechanic
- **Deceased Dragon Black Castle** = scene canon (Kazas magical research)
- **Michael cameo possible** Disc 4 (Rose's vassal flashback ?) — à investiguer
- **Unnamed 7-eye Dragon** = lore-only probable (defeated by Divine Dragon, jamais shown active ?)

### Mode Survival

- Dragons = **boss arènes premium** (Feyrbrand/Regole/Divine Dragon ready visuels uniques)
- Dragons = **theme visuel** : 7 colors/styles canon (Red/Jade/White Silver/Darkness/Violet/Blue/Gold + Divine Non-Elemental)
- Possible variants Survival (alt-element Dragons hors-canon, eye count différent pour balance)

### À implémenter (impact code)

- **Data-model Dragon** : `Dragon { id, name, element, eyes: 1-7, status: alive|dead|spirit, location?, owner?: DragoonId }`
- **Dragoon command rule** : function `canCommand(dragoon, dragon)` selon canon
- **Dragoon Spirit gem mechanic** : Dragon mort → drop Spirit Stone (cohérent Vellweb anciens Dragoons drop 100% Stone canon — Belzac → Golden Stone, Damia → Blue Sea Stone)
- **3 boss canon vivants** : Feyrbrand + Regole + Divine Dragon (bosses/\*.md à créer)
- **Eye count importance** : visual rendering (Dragon model has 6 eyes design canon majoritaire)
- **Black Castle Deceased Dragon** : interactable décor Kazas

## Liens code & doc

- **Source canon** : [`_sources/lod-wiki-dragons.md`](./_sources/lod-wiki-dragons.md)
- **Divine Tree** (origine 105th fruit) : [`../locations/Divine Tree.md`](../locations/Divine Tree.md)
- **Dragon Campaign** : `../lore/dragon-campaign.md` (à créer)
- **Dragoon Spirit mechanism** : [`./README.md`](./README.md) (Dragoons category overview)
- **Vellweb anciens Dragoons** (6 of 7 anciens élémentaux) : [`../bosses/Belzac.md`](../bosses/Belzac.md), [`../bosses/Damia.md`](../bosses/Damia.md), Syuveil/Kanzas (à créer)
- **Shirley** (White Silver Spirit) : `../bosses/Shirley.md` (à créer) — Shrine of Shirley canon
- **Rose** (Darkness 6-eye Dragoon, immortelle 11k ans) : [`../bosses/Damia.md`](../bosses/Damia.md) §Vellweb scène (cross-ref Rose narrative)
- **Boss Feyrbrand** : `../bosses/Feyrbrand.md` (à créer)
- **Boss Regole** : `../bosses/Regole.md` (à créer) — Dragon Spirit Mountain of Mortal Dragon canon
- **Boss Divine Dragon** : `../bosses/Divine Dragon.md` (à créer)
- **Michael (Rose's vassal)** : `lore/michael.md` (à créer) ou entrée NPC
- **Unnamed 7-eye** : `lore/unnamed-dragon.md` (à créer) — probable lore-only
- **Black Castle Deceased Dragon** : [`../locations/Kazas.md`](../locations/Kazas.md)
- **Party members wielders** : [`../party-members/Dart.md`](../party-members/Dart.md) + autres
- **Combat elements** : [`../combat/elements.md`](../combat/elements.md) — 7 elements correspondant 7 Dragons + Non-Elemental Divine Dragon

## Questions ouvertes

- **Unnamed 7-eye Dragon canon** — fight contre Divine Dragon. Element ? Origin ? Lore-only ou apparaît in-game ? Présumé pré-game / Dragon Campaign era.
- **Divine Dragon eye count** — non spécifié wiki, mais "king of Dragons" suggère **8+ eyes** ou **special unique**. À investiguer.
- **Feyrbrand element exact** — pas confirmé wiki Dragon page. Cohérent Wind (Greham wielder Wind canon) ? À reconfirmer via `bosses/Feyrbrand.md`.
- **Regole element exact** — "sea Dragon" suggère Water. Cohérent Mountain of Mortal Dragon arc ? À confirmer.
- **Lesser Dragons (1-3 eye)** — existent canon mais non documentés. Lore-only ou possibles encounters minor mob Damia ?
- **Michael in-game appearance** — fight Dragon Campaign mais visible in-game (cutscene Disc 2 Rose flashback Lidiera ?). À investiguer.
- **Black Castle Deceased Dragon identity** — quel Dragon ? Origine ? Comment Sandora a obtenu ? Lien Doel-Lloyd magical research ?
- **Divergence timeline canon** : wiki Dragons dit "~11,682 ans ago", autres pages disent "11,000 ans". À reconcilier (probable approximations).
- **Dragoon command rule application Damia** — gameplay mechanic à implémenter ? (e.g. Albert Jade DS 6-eye → command Wind Dragons in Survival ?). Possible feature mode.
- **Magical gem vs Dragoon Spirit Stone naming** — wiki Dragons dit "magical gem", Vellweb bosses drop "Spirit Stone". Same item canon ou distinction ?
- **Pattern eye count par archetype canon** — tous 6 anciens élémentaux Dragon Campaign = 6-eye. Coïncidence canon ou design intentionnel ?
- **Top-tier 7-eye + Divine Dragon king** — implication cosmic hierarchy : Divine Dragon > 7-eye > 6-eye > etc. À refléter lore docs.
- **Dragons "many can fly"** — implication design : tous Dragons canon flying ? Quelques exceptions ?
- **Wingly oppression details** — canon "subjugating many species" : Humans + Dragons + autres ? Lien Mininto + Mermaid (autres species du 108) ?
