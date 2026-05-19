# Damia

> **Boss canon Disc 4 à Vellweb** — **une des 7 anciens Dragoons** servant Emperor Diaz pendant la Dragon Campaign. **Blue-Sea Dragoon** (élément Water) dont **Meru héritera le Spirit**.
>
> 🎯 **Importance projet** : Damia est la **namesake de ce projet** (nom du fan-game). Personnage emblématique pour ce développement.
>
> **Sources canon** :
>
> - 🥈 [`_sources/lod-wiki-damia.md`](./_sources/lod-wiki-damia.md) — wiki LoD (stats, immunities, abilities table, counter group)
> - 🥉 fandom (à ingérer)

## Statut

🟡 **draft** — data canon ingérée. Aucune impl Damia (le code). 2ᵉ boss documenté (après Belzac).

## Profil

| Attribut          | Valeur                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------- |
| Type              | Boss canon (**un des 4 anciens Dragoons morts** pendant Dragon Campaign — souls à Vellweb)    |
| Archetype Dragoon | **Blue-Sea Dragon** (Water) — Meru's predecessor                                              |
| Élément           | **Water** (cf. [`../combat/elements.md`](../combat/elements.md))                              |
| Location canon    | **Vellweb (submap 499)** — cf. [`../locations/Vellweb.md`](../locations/Vellweb.md) (à créer) |
| Encounter         | **Scripted** (0% escape)                                                                      |
| Counter group     | **28** (all opportunities)                                                                    |
| Disc              | Disc 4 (Chapter 4: Moon & Fate)                                                               |
| Counters Adds     | **Yes**                                                                                       |

## Stats canon

### Stats de base

| HP    | AT  | DF  | A-AV | SPD | MAT | MDF | M-AV |
| ----- | --- | --- | ---- | --- | --- | --- | ---- |
| 9,000 | 116 | 100 | 0%   | 60  | 116 | 200 | 0%   |

> Comparaison avec [Belzac](./Belzac.md) :
>
> - **HP** : Damia 9k vs Belzac 16k → Damia plus fragile (mage profile)
> - **AT/MAT** : Damia **équilibrée 116/116** vs Belzac asymétrique (178/71 = physical-heavy)
> - **DF/MDF** : Damia 100/**200** vs Belzac 200/80 → **Damia = profil magique** (high MDF, low DF). **Pattern Wulves : haute MDF = boss mage, faible DF = vulnérable physical**
> - **SPD** : Damia 60 vs Belzac 50 → Damia plus rapide
> - **Pattern canon ancien-Dragoon Vellweb** : symétrie AT=MAT à 116, status immunity totale, scripted, drop 100% Spirit Stone

### Status Immunity

✅ **Immunisée à tous les 8 statuts canon** :

| Petrify | Bewitch | Arm Block | Dispirit | Confuse | Fear | Poison | Stun |
| ------- | ------- | --------- | -------- | ------- | ---- | ------ | ---- |
| ✔       | ✔       | ✔         | ✔        | ✔       | ✔    | ✔      | ✔    |

> Confirme pattern boss canon (cohérent Belzac).

## Yield

| EXP   | Gold | Drops                     |
| ----- | ---- | ------------------------- |
| 6,000 | 300  | **Blue Sea Stone (100%)** |

> **Blue Sea Stone** = item canon (drop 100%). **Probable lien Dragoon Spirit related** — Meru reçoit le Blue-Sea Dragoon Spirit canon en Disc 2 (Phantom Ship arc post-Phantom Ship boss). Pattern : Belzac drop Golden Stone (→ Kongol) / Damia drop Blue Sea Stone (→ Meru) / Syuveil → Jade Stone (?) / Kanzas → Violet Stone (?).
>
> Cohérent yield Belzac (EXP 6k, Gold 300, drop 100% Stone) → **pattern unifié anciens Dragoons Vellweb**.

## Abilities & Traits

### Abilities

Toutes valeurs canon — confirmant le système **Attack Multiplier per ability** Wulves :

| Action              | Target | Damage         | Attack Multiplier | Conditions         |
| ------------------- | ------ | -------------- | ----------------- | ------------------ |
| D-attack            | Single | 1× Physical    | **1.0**           | —                  |
| **Freezing Ring**   | Single | 2× Water magic | **2.0**           | —                  |
| **Diamond Dust**    | Party  | 2× Water magic | **2.0**           | **Retaliate only** |
| **Blue-sea Dragon** | Single | 4× Water magic | **4.0**           | **Retaliate only** |

> 🆕 **Blue-sea Dragon** = ability boss-special **4×** — **plus puissant que Golden Dragon (3×)** chez Belzac. Pattern : **dragon-named ability** = ultimate par ancien Dragoon.
>
> Confirmation Wulves : **Enemy Magical formula** = `floor[MAT² × 5 / MDF] × Attack Multiplier`.
> Pour Damia vs allié niveau X :
>
> - D-attack physique : Enemy Physical formula = `floor[116² × 5 / DF] × 1.0`
> - Freezing Ring : `floor[116² × 5 / MDF] × 2.0`
> - Diamond Dust : `floor[116² × 5 / MDF] × 2.0`
> - Blue-sea Dragon : `floor[116² × 5 / MDF] × 4.0`

> Notable : Damia n'a **pas de "Grand Stream" équivalent (1.5×)** comme Belzac. Sa courbe d'abilities est : standard 1× → 2× spell × 2 (regular + retaliate) → 4× ultimate. **Profile = double-threat mage** (Freezing Ring single + Diamond Dust party).

### Trait passive

| Passive name (community) | Effect                                                                                                                  | Trigger                                   |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| **Patterned Retaliate**  | **Ignore turn order** + Diamond Dust. **2nd trigger** = D-attack. **3rd trigger** = Blue-sea Dragon. **Cycle repeats**. | Chance to trigger when targeted by attack |

> **Confirmation pattern canon** : tous les anciens Dragoons Vellweb (à confirmer Syuveil + Kanzas) ont **Patterned Retaliate** cycle **party-AoE magic → D-attack → ultimate single-target magic**.
>
> Cycle Damia :
>
> 1. **Diamond Dust** (party 2× Water)
> 2. **D-attack** (single 1× physical)
> 3. **Blue-sea Dragon** (single 4× Water)
> 4. **Loop**

## Counter opportunities (group 28)

Damia peut counter **toutes** les opportunities d'addition non-protégées (group 28).

| User    | Addition           | Button Press counterable |
| ------- | ------------------ | ------------------------ |
| Dart    | Volcano            | 2                        |
| Dart    | Crush Dance        | 2, 3                     |
| Dart    | Moon Strike        | 2, 3                     |
| Lavitz  | Rod Typhoon        | 2, 3                     |
| Lavitz  | Gust of Wind Dance | 2, 5                     |
| Lavitz  | Flower Storm       | 2, 3, 4, 5, 6            |
| Rose    | Hard Blade         | 2                        |
| Rose    | Demon's Dance      | 3, 4, 5, 6               |
| Meru    | Cool Boogie        | 2, 3                     |
| Meru    | Cat's Cradle       | 3, 4                     |
| Meru    | Perky Step         | 2                        |
| Haschel | Summon 4 Gods      | 2                        |
| Haschel | Hex Hammer         | 2                        |
| Albert  | Gust of Wind Dance | 2                        |
| Albert  | Flower Storm       | 2                        |

> Identique table Belzac → confirme **counter group 28 = template canon boss anciens Dragoons** (cohérent avec hypothèse Syuveil + Kanzas même groupe).

Counter formula canon : `floor{floor[floor{floor[(AT² × 250 / DF)] / 100} × Target Fear × Attacker Fear] × Power}` (cf. [`../combat/additions.md`](../combat/additions.md)).

## Story / lore

### Contexte canon Dragon Campaign

- Damia = **une des 7 Dragon incarnations** servant Emperor Diaz pendant la Dragon Campaign (~11k ans avant les événements du jeu)
- Spécifiquement : Damia = **Blue-Sea Dragoon** (Water)
- Mort pendant la Dragon Campaign (4 anciens Dragoons morts : Belzac, Damia, Syuveil, Kanzas → souls gathered à **Vellweb**)
- Après sa mort, le **Blue-Sea Dragoon Spirit** reste jusqu'à ce que **Meru** en hérite (Disc 2 canon, après Phantom Ship arc)

### Rencontre Vellweb (Chapter 4 — Disc 4)

(Pattern présumé identique à [Belzac](./Belzac.md#rencontre-vellweb-chapter-4--disc-4) — à compléter via fandom/ingestion future)

- Party retourne à Vellweb pour libérer les âmes des 4 anciens Dragoons morts
- Damia apparaît comme spectre / âme manifestée
- Force le party à combattre
- Upon defeat : âme freed → goes to Mayfil

### Lien Meru (successor canon)

- Meru = **Wingly** (cf. canon TLoD) qui reçoit le **Blue-Sea Dragoon Spirit** en Disc 2
- Notable : Meru = **Wingly** mais hérite d'un **anti-Wingly Dragoon Spirit** historique → tension narrative canon
- À documenter `party-members/Meru.md` (à créer)

## Vision Damia (le code, vs Damia le boss !)

### Mode Story

- Boss fight Vellweb (Disc 4) — fidèle canon
- **Pré-combat** : cutscene (à découvrir via fandom) — pattern similaire Belzac probable (frenzy / denial / forced fight)
- **Trait Patterned Retaliate** = cycle 3 abilities. **Damia = profile mage** (Freezing Ring + Diamond Dust = double water spells, Blue-sea Dragon ultimate)
- **Scripted encounter** (0% escape)
- **Drop 100%** : Blue Sea Stone
- **Status immunity total** (8 statuts)
- **Post-defeat** : âme freed → Mayfil (pattern Belzac)
- **Strategy hint canon** :
  - **DF 100 = faible défense physique** → spam physical additions efficace
  - **MDF 200 = haute résistance magique** → éviter spell-only strats
  - Pattern Retaliate cycle = telegraph offensive party AoE → soigner après Diamond Dust trigger
  - **AT/MAT 116 équilibrés** → menace à la fois physical (D-attack 1×) et magic (2-4× Water spells)

### Importance lore namesake

- Le projet **Damia** porte le nom de ce boss/ancien Dragoon
- **Boss fight de référence** à soigner particulièrement en implémentation (cinematic, audio, design visuel)
- Possible signature visuelle Damia (le code) reprenant l'identité Water/Blue-Sea de la boss (motifs water, blue palette UI, etc.)

### Mode Survival

- Damia peut servir de **boss arena** dans une vague avancée
- Mécanique Retaliate cycle = signature visuelle / boss "telegraphe" ses 3 attacks → joueur apprend pattern (identique Belzac)
- En Modern Survival : possibles variations (élément différent, abilities supplémentaires, scaling)

### À implémenter (impact code)

- **Boss data-model** (mutualisé avec Belzac) :
  - `BossDefinition extends EnemyDefinition` avec stats étendus
  - **Status immunity flags** (8 booleans, ou bitmask)
  - **Retaliate trait** (chance, cycle, ignoresTurnOrder)
  - **Scripted encounter** flag (0% escape)
  - **Counter group** field (28 = template Vellweb)
- **Attack Multiplier per ability** (cohérent Belzac confirmation Wulves)
- **Element abilities** Water (Freezing Ring + Diamond Dust + Blue-sea Dragon all Water)
- **Drop 100% Blue Sea Stone** (mécanique Spirit Stone canon)

## Liens code & doc

- **Source canon** : [`_sources/lod-wiki-damia.md`](./_sources/lod-wiki-damia.md)
- **Vellweb** (location) : `../locations/Vellweb.md` (à créer)
- **Meru** (héritière Blue-Sea Dragoon) : `../party-members/Meru.md` (à créer)
- **Belzac** (autre ancien Dragoon Vellweb — Gold/Earth) : [`./Belzac.md`](./Belzac.md)
- **Syuveil / Kanzas** (autres ancien Dragoons Vellweb) : `./Syuveil.md` + `./Kanzas.md` (à créer)
- **Dragon Campaign lore** : `../lore/dragon-campaign.md` (à créer) — 7 anciens Dragoons originaux
- **Damage formula** : [`../combat/damage-formula.md`](../combat/damage-formula.md) (Attack Multiplier per ability)
- **Elements** : [`../combat/elements.md`](../combat/elements.md) (Water element)
- **Additions** : [`../combat/additions.md`](../combat/additions.md) (counter group 28)
- **Status effects** : `../combat/status-effects.md` (à créer — 8 statuts canon)
- **Items** : `../items/` (à créer — Blue Sea Stone + Spirit Stones canon)

## Questions ouvertes

- **Damia vivante ou esprit ?** — Présumé esprit (pattern Belzac confirmé). À reconfirmer fandom.
- **Blue Sea Stone** — item canon (drop 100%). Effet exact ? Trigger Dragoon Spirit Meru ? Probable lien narratif fort. À documenter `items/`.
- **Cycle Patterned Retaliate confirmation** — wiki dit Diamond Dust → D-attack → Blue-sea Dragon. Confirmer trigger % (probable identique Belzac).
- **Identity humaine canon** — Damia était-elle humaine ? Wingly ? Race ? Genre ? Le nom suggère féminin (Damia = nom grec féminin). À confirmer fandom + tier 1.
- **Lore Damia personnage** — backstory, nation d'origine, lien Emperor Diaz / Dragon Campaign ? Pattern Belzac (royal family Gloriano) → Damia royal d'autre nation ? À documenter.
- **Cutscene Disc 2 / Disc 4** — Damia apparaît-elle dans flashbacks Rose (Lidiera) comme Belzac ? À confirmer fandom.
- **Comment exactement Damia meurt** — Virage attack ? Super Virage ? Autre cause ? Pattern Belzac avait une contradiction canon à résoudre.
- **Lien Meru-Damia** — moment exact du transfer Blue-Sea Spirit canon → Meru. Probable Phantom Ship arc Disc 2 ou plus tôt.
- **Profile mage canon** vs Belzac physical-tank : suggère un design intentionnel pour la **diversité des 4 boss Vellweb** (tank Earth / mage Water / ? Wind Syuveil / ? Thunder Kanzas). À explorer.
- **Personnage féminin Vellweb** ? — Si Damia = féminine, c'est la **1ère ancienne Dragoon féminine confirmée à Vellweb** (Belzac, Syuveil, Kanzas + Rose vivante / Shirley spirit Shrine). Lien Sacred Sisters Mille Seseau ? Non probable (Sacred Sisters Disc 3, Damia Dragon Campaign 11k ans).
