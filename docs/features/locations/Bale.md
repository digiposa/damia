# Bale

> **Capital de Basil**, royaume du nord de Serdio — première grande ville visitée en Story Disc 1 après l'évasion de Hellena.
>
> **Source canon** : 🥈 [`_sources/lod-wiki-bale.md`](./_sources/lod-wiki-bale.md)

## Statut

🟡 **draft** — données canon ingérées. Aucune impl Damia (location post-MVP "Forêt de Seles").

## Profil

| Attribut         | Valeur                                                            |
| ---------------- | ----------------------------------------------------------------- |
| Type             | Capital                                                           |
| Région           | Nord de Serdio (royaume de Basil)                                 |
| Architecture     | Brick & clay, style **European renaissance**                      |
| Landmark central | **Indels Castle** (siège du gouvernement, dirigé par King Albert) |
| Topographie      | Bâtiments + waterways (canaux navigables en boat)                 |
| Combat           | Aucun (safe city)                                                 |
| Previous (canon) | #6 Limestone Cave                                                 |
| Next (canon)     | #7 Hoax                                                           |
| Submaps wiki     | **33** (+ 1 unused)                                               |

## Story / lore

Story beat majeur Disc 1 (post-Hellena escape, avant Hoax) :

- **Arrivée** : Dart, Lavitz, Shana arrivent en hâte après leur évasion de [Hellena Prison](./Hellena Prison.md).
- **Priorisation Lavitz** : Lavitz écarte la visite à sa mère, priorise son rapport au roi.
- **Audience throne room** :
  - **King Albert** ([cf. profil](../party-members/Albert.md)) exprime son soulagement
  - **Minister Noish** souligne qu'Albert était distrait de ses devoirs politiques par l'inquiétude
  - Lavitz rapporte la destruction de son knighthood + Hellena
  - Albert offre une faveur à Dart en remerciement
- **Demande de Dart** : loger Shana à Indels Castle pour la protéger de **Sandora**
- **Refus d'Albert** : même le castle n'est pas safe — Sandora possède un **Dragon** en combat (= **Feyrbrand**, à confirmer page Disc 1)
- **Shana** : protest, refuse de rester, choisit de continuer avec Dart
- **Dart** : prévient Shana que ça va devenir dangereux ; elle reste convaincue

→ Story beat à modéliser dans `quests/disc1-bale.md` (à créer).

## NPCs majeurs

- **King Albert** — King of Basil, future Jade Dragoon (cf. [`party-members/Albert.md`](../party-members/Albert.md))
- **Minister Noish** — bras droit politique d'Albert
- **Lavitz's mother** — peut héberger gratuitement (1 fois, avant Hoax)
- **Martel** — collectrice de Stardust (10 stardust → Physical Ring)
- **Dran** — résident sous la fontaine, accepte Good Spirits (bribery) pour ouvrir un passage à treasures
- **Painter** (artiste) — donne le **Portrait of Lavitz** (perdu après Hero Competition à Lohan)
- **Master du bar** (Hotel) — vend Good Spirits
- Child playing knight (street 13)
- Girlfriend du vice commander 5e knighthood (room 10)

## Services

| Type         | Détails                                                                                                                                                                                                  |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Save Point   | 1 (Hotel interior)                                                                                                                                                                                       |
| Hotel        | 10G → restore HP + MP party                                                                                                                                                                              |
| Clinic       | 10G → cure all Status Ailments                                                                                                                                                                           |
| Lavitz's mom | **Free** full HP restore — **once only**, **becomes unavailable après Hoax**                                                                                                                             |
| Item Shop    | Healing Potion (10G), Angel's Prayer (30G), Mind Purifier (20G), Body Purifier (10G), Spear Frost (10G), Meteor Fall (20G), Charm Potion (4G)                                                            |
| Weapon Shop  | Bastard Sword (60G), Sparkle Arrow (50G), Scale Armor (50G), Leather Jacket (50G), Sallet (40G), Poison Guard (200G), Panic Guard (300G), Stun Guard (200G), Bravery Amulet (300G), Knight Shield (200G) |

## Collectibles

- **Goods** (2) : Portrait of Lavitz, Good Spirits
- **Stardust** (6) : Slambert Plaza well, Weapon Shop bucket, Indels forge, Castle 3rd floor top-left, Boat exit wine barrels, Lavitz kitchen cupboard
- **Treasure Chests** (9) : 5×Gold, Sparkle Arrow, Active Ring, Healing Breeze (path with input puzzle), 2 chests gated par Dran/Good Spirits

Détail dans [`_sources/lod-wiki-bale.md`](./_sources/lod-wiki-bale.md).

**Quest Martel** : turn 10+ stardust à Martel → **Physical Ring** (one-of-a-kind item).

## Maps / submaps

**33 submaps** + 1 unused (cutscene demo). Détail complet dans [`_sources/lod-wiki-bale.md#maps`](./_sources/lod-wiki-bale.md#maps-33-submaps--1-unused).

Catégories principales :

- **Streets** (1, 6, 9, 13, 30) — fountain plaza, Slambert Plaza, statue street, side streets
- **Indels Castle** (18-26) — extérieur + 3 floors + throne room + Albert quarters + balconies
- **Lavitz's house** (31, 32, 33) — living room, kitchen, rooftop
- **Houses** (2-3 artist, 7, 10) — résidences NPCs
- **Services** (4 hotel, 5 item shop, 12 weapon shop, 14-16 clinic, 17 library)
- **Stables / forge** (8, 19) — Indels Castle ground floor + Lavitz stable
- **Waterways** (11, 21, 27, 28, 29) — boat traversée, Dran's living space, passageways

## Vision Damia

### Mode Story

- **Reproduire fidèlement** la topology canon (33 submaps adaptés iso) — fidélité visuelle maximale (cf. [SCOPE §3](../../SCOPE.md#3-genre--style))
- Save point in Hotel
- Shops fonctionnels (item + weapon)
- Lavitz's mother free-HP mechanic (one-shot, gated par "before Hoax" flag)
- Treasure chests / Stardust / Goods collectibles
- Martel quest (Physical Ring)
- Dran bribery puzzle (Good Spirits → unlock waterway path)
- Story beat throne room avec Albert + Noish + Lavitz + Shana

### Mode Survival

- Bale **pourrait** servir d'**arène thématique** (palais / streets architecture européenne, ambiance royale)
- Pas de combat in-canon → si on l'utilise en Survival, c'est une **réinterprétation** (e.g. "Defend the Castle" wave mode, ou "Sandora invades Bale")
- Décision design à différer.

### À implémenter / vérifier (impact code Story)

Systèmes underlying nécessaires pour faire vivre Bale :

- **Save point** entity / mécanique
- **Hotel / Clinic** : services interactables (paiement Gold → full restore)
- **Shop UI** (item + weapon) — séparation Item Shop vs Weapon Shop
- **NPC dialogues** scriptés (Albert throne, Noish, Lavitz's mother, Martel, Dran, painter, etc.)
- **Goods inventory** (catégorie d'items Key Items / non-consommable)
- **Stardust collectible system** — counter global + reward gating Martel à 10 (puis 30, 50…)
- **Treasure chest system** — open/close state persistant
- **Boat navigation** (waterway subzone) — sous-mécanique movement
- **Story flags** : "before Hoax" (Lavitz's mother gating), "Hero Competition entered" (Portrait of Lavitz gating), "Good Spirits acquired" (Dran path gating), "Marsa Road closed" (trivia merchant)
- **Sandora threat narrative** — flag global (Dart's request denied because of Feyrbrand)

## Liens code & doc

- **Source canon** : [`_sources/lod-wiki-bale.md`](./_sources/lod-wiki-bale.md)
- **NPC Albert** : [`../party-members/Albert.md`](../party-members/Albert.md)
- **Hellena Prison** (previous location) : `./Hellena Prison.md` (à créer)
- **Hoax** (next location, Disc 1 → Disc 2 hinge) : `./Hoax.md` (à créer)
- **Items des shops** : `../items/equipment.md`, `../items/consumables.md` (à créer)
- **Story beats** : `../quests/disc1-bale.md` (à créer)
- **Goods system** : `../items/goods.md` (à créer — Portrait of Lavitz, Good Spirits)
- **Stardust system** : `../items/stardust.md` ou `../quests/collectibles.md` (à créer)
- **Code scène** : `src/scenes/Bale/` (à créer)
- **Code data** : `src/data/locations/bale.json` (à créer)

## Questions ouvertes

- **Reproduire 33 submaps** exactement ou les **consolider** en moins de scenes Damia (e.g. 1 scène par "quartier") ? Trade-off fidélité × performance / workload.
- **Boat waterway** : porter la mécanique navigation boat ou simplifier en transitions classiques ?
- **Dran puzzle input** : le canon a un puzzle d'inputs sur Healing Breeze chest (cross the beam) — porter ou skip ?
- **Lavitz's mother gating "before Hoax"** : implémentation via story flag persistant — confirmer mécanisme save-state.
- **Bale en mode Survival** : utiliser comme arène thématique (lequel angle ?) ou skip totalement ?
- **Trivia Marsa Road closed** : c'est un gating narratif Disc 1 (Bale → Lohan bloqué temporairement). À tracer dans `quests/` flow.
