# Deningrad

> **Capital de Mille Seseau** (nord d'Endiness), Disc 3. Reine Theresa, **Crystal Palace** royal. Lieu central de la story Disc 3 — **Divine Dragon attaque la ville** + **Lloyd kidnappe Theresa**. Mécanique unique : **pre/post-attack state** modifie toute la city.
>
> **Source canon** : 🥈 [`_sources/lod-wiki-deningrad.md`](./_sources/lod-wiki-deningrad.md)

## Statut

🟡 **draft** — données canon ingérées. Aucune impl Damia.

## Profil

| Attribut         | Valeur                                                                                             |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| Type             | **Capital + Royal Palace** (Mille Seseau) — city + Crystal Palace                                  |
| Région           | **Côte nord d'Endiness**, entre 2 groupes de montagnes                                             |
| Souveraine       | **Queen Theresa** (canon Mille Seseau)                                                             |
| Landmarks        | **Crystal Palace** (siège royal) + **National Library** (Mille Seseau)                             |
| Combat           | Aucun (safe city, même post-attack ; combat ailleurs Disc 3)                                       |
| Previous (canon) | #25 Evergreen Forest                                                                               |
| Next (canon)     | #27 **Neet** (village natal de Dart canon)                                                         |
| Submaps          | **28** (13 normal + 6 Crystal Palace + 5 Deningrad Assaulted + 4 Palace Assaulted)                 |
| Disc             | Disc 3 (Chapter 3: Fate & Soul)                                                                    |
| State machine    | **2 états canon** : pré-Divine Dragon attack vs post-attack (affecte save points, clinics, chests) |

## Story / lore

Story beat majeur Disc 3 — Chapter 3 **Fate & Soul**. Détails Read More wiki à compléter via fandom.

### Pré-Divine Dragon attack (arrivée canon)

- Party arrive à Deningrad post-Evergreen Forest
- Rencontre **Queen Theresa** au Crystal Palace
- **Bishop Dille + Librarian Ute** à la Church (cf. [Albert Chapter 3](../party-members/Albert.md) §Deningrad)
- **Albert "nerdy" moment** : enthousiasme à la **Mille Seseau National Library** — lit livre sur Dragons (book stating Dragons extinct, fact contradicted by reality)
- Lloyd targeting **Divine Moon Object** (Moon Mirror) → Miranda story exposition
- **Save Point** : alley leading to Crystal Palace
- Crystal Palace accessible : 2 chests (Angel's Prayer + **Holy Ahnk**)
- 2 stardust accessibles (front of shops)

### Divine Dragon attack (story event)

- **Divine Dragon attaque Deningrad** → ville dévastée
- **Crystal Palace endommagé** → chests Holy Ahnk + Angel's Prayer **deviennent inaccessibles**
- **Shana** est mise hors-combat ? **wakes up in the Hotel** (submap 389 cutscene)
- **Save point original** (alley) **désactivé**
- Hotel restructuré : **Clinic monte au 2e étage** (rope pulley mechanism), 1er clinic inaccessible
- City "Assaulted" state activé (5 submaps + 4 Palace Assaulted submaps)

### Post-attack (Crystal Palace Assaulted)

- Throne room accessible mais endommagée
- **Cutscene : Lloyd kidnappe Queen Theresa** (submap 376) — story beat majeur
- **3 stardust additionnels** accessibles dans les rubble (after-attack only)
- Story continue → quest pour secourir Theresa + stopper Lloyd

### State machine canon

| État            | Save Point  | Clinic                       | Crystal Palace chests  | Stardust gating               |
| --------------- | ----------- | ---------------------------- | ---------------------- | ----------------------------- |
| **Pré-attack**  | Alley actif | 1st clinic actif             | Accessibles (2 chests) | 2/5 accessibles               |
| **Post-attack** | Hotel actif | 2nd clinic (Hotel 2nd floor) | **Inaccessibles**      | 3/5 accessibles (rubble)      |
| **Stardust 5**  | —           | —                            | —                      | Tous **after Kadessa return** |

## NPCs majeurs

- **Queen Theresa** — souveraine Mille Seseau. **Kidnapped by Lloyd** post-Divine Dragon attack.
- **Bishop Dille** — Church de Deningrad. Albert/group rencontrent.
- **Librarian Ute** — National Library, guide accès aux livres.
- **Newly wed couple** (house 358)
- **Old married couple** (house 359)
- 2 kids running (house 362)
- **Lloyd** — antagoniste, kidnappe Theresa post-attack (cutscene). Cf. Albert §Tower of Flanvel pour Lloyd defeat ultérieur.

## Services

### Save Points (state-dependent)

| Pré-attack              | Post-attack             |
| ----------------------- | ----------------------- |
| Alley to Crystal Palace | **Hotel** (post-attack) |

→ Save point migration canon = pattern story-flag-driven location service.

### Rest Areas

| Type   | Prix | Effect                   |
| ------ | ---- | ------------------------ |
| Hotel  | 50G  | Restore HP + MP          |
| Clinic | 50G  | Cure all Status Ailments |

→ **50G** = prix avancé Disc 3 (vs 10G Bale Disc 1 / 20G Kazas Disc 1). Pattern : inflation prix par disc avancement.

### Item Shop (10 items, prix Disc 3)

| Item            | Prix | Note                                        |
| --------------- | ---- | ------------------------------------------- |
| Healing Fog     | 30G  | Multi heal                                  |
| Healing Breeze  | 50G  | Multi heal                                  |
| Sun Rhapsody    | 50G  | Attack item                                 |
| Angel's Prayer  | 30G  | Revive                                      |
| **Depetrifier** | 30G  | **1er anti-Petrify documenté** (8ᵉ statut)  |
| Mind Purifier   | 20G  | Anti Fear/Confusion/Bewitchment/Dispiriting |
| Body Purifier   | 10G  | Anti Poison/Stun/Arm-Blocking               |
| Spark Net       | 10G  | Attack item                                 |
| Thunderbolt     | 20G  | Attack item Thunder                         |
| Charm Potion    | 4G   | Encounter avoid / 3-turn dodge              |

> 🆕 **Depetrifier** = 1er item canon anti-Petrify documenté. Complète la liste anti-status (vs Mind/Body Purifier qui couvrent les 7 autres statuts). Confirme **les 8 statuts canon** (cf. [`combat/status-effects.md`](../combat/status-effects.md) à créer).

### Weapon Shop (Armor / Weapon / Accessory — 12 items)

| Item                | Prix        | Note                                                                                |
| ------------------- | ----------- | ----------------------------------------------------------------------------------- |
| Tomahawk            | 300G        | weapon (Kongol probable axe)                                                        |
| **Spear of Terror** | 300G        | Albert weapon — **Fear proc** (cf. [Albert.md weapons](../party-members/Albert.md)) |
| Diamond Claw        | 300G        | weapon                                                                              |
| Breast Plate        | 250G        | armor                                                                               |
| Master's Vest       | 250G        | armor                                                                               |
| Soul Headband       | 200G        | accessory/headgear                                                                  |
| Jeweled Crown       | 200G        | accessory/headgear                                                                  |
| Stardust Boots      | 150G        | boots                                                                               |
| Protector           | 200G        | accessory                                                                           |
| Bravery Amulet      | 300G        | **anti-Fear** (cohérent Bale)                                                       |
| **Destone Amulet**  | 400G        | **anti-Petrify accessory** (1er documenté)                                          |
| **Armor of Legend** | **10,000G** | **endgame top-tier armor** (most expensive canon)                                   |

> 🆕 **Destone Amulet** (400G) + **Armor of Legend** (10,000G) — top-tier items. Pattern : **anti-status accessory series** (Bale a Poison/Panic/Stun Guard + Bravery Amulet → Deningrad ajoute Destone Amulet). À documenter dans `items/equipment.md` futur — il manque encore les accessoires anti-Bewitchment / anti-Arm-Blocking / anti-Dispiriting.

## Collectibles

### Goods

Aucun.

### Stardust (5)

> ⚠️ **Gated post-Kadessa return** (story flag).

- 2 dans rubble post-Divine Dragon attack (Shana's room rubble + Signet room rubble)
- 3 accessibles dès la première visite mais gated par Kadessa

### Treasure Chests (2 — accessible window limitée)

> ⚠️ **Inaccessibles après l'attaque du Divine Dragon**. Window d'achat / pickup limitée.

- Angel's Prayer (Crystal Palace, left of twin staircases)
- **Holy Ahnk** (Crystal Palace, lounge side room) — item probable lore/special

## Combat

Aucun. Safe city même en état "Assaulted". Combat Disc 3 a lieu ailleurs (Mountain of Mortal Dragon, Forbidden Land, Tower of Flanvel, etc.).

## Vision Damia

### Mode Story

- **Reproduire les 28 submaps** (13 normal + 6 Palace + 5 Assaulted + 4 Palace Assaulted) — état dual
- **State machine "Divine Dragon attacked"** flag persistant qui :
  - Désactive save point alley → active save point Hotel
  - Désactive 1st Clinic → active 2nd Clinic (Hotel 2nd floor)
  - Désactive Crystal Palace chests
  - Active 2 stardust pickups (rubble)
  - Trigger cutscene Shana wakes up + Lloyd kidnap Theresa
- **Story flag "Kadessa returned"** : unlock 3 stardust additionnels
- **Crystal Palace ceremonial room "for sealing something"** = Signet room → lien narratif Signet Spheres (cf. Aglis/Mayfil lore)
- **Lloyd kidnap Theresa cutscene** = trigger pour next chapter beats
- **National Library** = Albert nerdy moment + Dragon book contradiction beat
- **Albert weapons unlock** : Spear of Terror disponible ici (300G) — cohérent Albert progression

### Mode Survival

- Deningrad **safe city** → mauvais candidat arène combat
- **MAIS** Crystal Palace ou state "Assaulted" pourraient servir de thème visuel ruines
- Lloyd boss encounter à Tower of Flanvel — pas ici directement

### À implémenter (impact code)

- **Location state machine** : 2 états (pré/post-Divine Dragon attack) avec service/access remap
- **Story flag-driven service migration** : save point, clinic, chest, stardust gating
- **Gated stardust** (post-Kadessa return)
- **Inaccessible chests** post-story-event (Crystal Palace chests)
- **Cutscene Lloyd kidnap Theresa** orchestration
- **Cutscene Shana wakes up Hotel** orchestration
- **Anti-Petrify items wiring** (Depetrifier consumable + Destone Amulet accessory) — cohérent 8-status data-model
- **Armor of Legend** (10kG endgame item) → balance gold economy

## Liens code & doc

- **Source canon** : [`_sources/lod-wiki-deningrad.md`](./_sources/lod-wiki-deningrad.md)
- **Evergreen Forest** (previous) : `./Evergreen Forest.md` (à créer)
- **Neet** (next) : `./Neet.md` (à créer) — village natal de Dart
- **Queen Theresa** : NPC ruler → `lore/mille-seseau.md` (à créer)
- **Lloyd** (kidnapper Theresa) : `../bosses/Lloyd.md` (à créer)
- **Divine Dragon** (attaque la ville) : `../bosses/Divine Dragon.md` (à créer)
- **Miranda** (White-Silver Dragoon Mille Seseau) : `../party-members/Miranda.md` (à créer)
- **Albert** (Chapter 3 Library beat) : [`../party-members/Albert.md`](../party-members/Albert.md)
- **Items** (Spear of Terror, Holy Ahnk, Armor of Legend, Depetrifier, Destone Amulet) → `../items/` (à créer)
- **Elements** : Spear of Terror Fear proc → [`../combat/elements.md`](../combat/elements.md)
- **Statuts** : Depetrifier + Destone Amulet = **8ᵉ statut Petrify confirmé** → `../combat/status-effects.md` (à créer)

## Questions ouvertes

- **Story Read More wiki vide** — fandom ingestion va compléter beats narratifs.
- **Holy Ahnk** item — usage canon ? Key item story ? Healing item ? À investiguer.
- **Ceremonial room "for sealing something"** (submap 372) — Signet Sphere de Mille Seseau ? Cohérent avec patterns Aglis/Mayfil ?
- **Lloyd kidnap motivation** — pour le Divine Moon Object (Moon Mirror) ? Cohérent avec Albert §Forbidden Land + Mountain of Mortal Dragon.
- **Shana wakes up in Hotel** post-attack — quelle conséquence narrative ? Lien Shana arc + Moon Child reveal Disc 3 ?
- **Save point migration mechanism** — Damia : changement de "spawn point" persistent via story flag. Pattern réutilisable.
- **Inflation prix par disc** : Hotel 10G (Bale Disc 1) → 20G (Kazas Disc 1) → 50G (Deningrad Disc 3). Balance gold curve.
- **Armor of Legend** : effet exact ? Stats ? Pourquoi 10,000G ? Item endgame canon — usage long-term ?
- **Tomahawk** : Kongol weapon ? Premier axe documenté. À confirmer items/.
- **Diamond Claw** : Meru weapon ? Premier "claw" documenté.
