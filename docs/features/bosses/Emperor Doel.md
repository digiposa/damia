# Emperor Doel

> **Antagoniste principal Disc 1** — Emperor of **Imperial Sandora** (région sud Serdio). **Tué son frère Carlo** (père d'Albert) pour rise to power → guerre civile Serdio (Bale-Basil vs Sandora-Doel). **Violet Dragoon** (Thunder element). **Boss à 2 phases canon** : Emperor Doel (humain, 600 HP) → **Dragoon Doel** transformation (1,800 HP). **8/8 status immunity** (pattern boss canon). Reward defeat : **Violet Dragoon Spirit** canon → **Haschel** héritage.
>
> **Sources canon** :
>
> - 🥈 [`_sources/lod-wiki-doel.md`](./_sources/lod-wiki-doel.md) — wiki LoD (stats 2 forms, immunities, abilities, Thunder Barrier mechanic, family lore)
> - 🥉 fandom (à ingérer)

## Statut

🟡 **draft** — data canon ingérée. Aucune impl Damia. **Premier boss Disc 1 documenté** + premier boss canon "2-phase transformation" canon (Emperor → Dragoon).

## Profil

| Attribut          | Valeur                                                                                                                                                                  |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Type              | Boss canon Disc 1 final (antagoniste principal Serdian War)                                                                                                             |
| Archetype Dragoon | **Violet Dragon** (Thunder) — Haschel's predecessor (DS reward post-defeat)                                                                                             |
| Élément           | **Thunder** (cf. [`../combat/elements.md`](../combat/elements.md))                                                                                                      |
| Location canon    | **Black Castle, Kazas (submap 660)** — cf. [`../locations/Kazas.md`](../locations/Kazas.md)                                                                             |
| Encounter         | **Scripted** (0% escape, formation 390)                                                                                                                                 |
| Counter group     | **28** (Emperor form) / **0** (Dragoon form)                                                                                                                            |
| Disc              | Disc 1 (Chapter 1: Serdian War — final boss arc)                                                                                                                        |
| Nation            | **Imperial Sandora** (région sud Serdio, capital Kazas)                                                                                                                 |
| Famille canon     | **Frère : Carlo** (Albert's father, **tué par Doel** pour rise to power) ; **Femme : Katrina** (morte war, cause inconnue) ; **Neveu : Albert** (heir Bale-Basil age 6) |
| Trait notable     | Boss à **2 phases** sequential (Emperor humain → Dragoon Doel transformation) — pattern canon réutilisable                                                              |
| Reward defeat     | **Violet Dragoon Spirit** (Thunder) — canon Haschel héritage future                                                                                                     |

## Stats canon — Phase 1 : Emperor Doel (humain)

| HP  | AT  | DF  | A-AV | SPD | MAT | MDF | M-AV |
| --- | --- | --- | ---- | --- | --- | --- | ---- |
| 600 | 30  | 100 | 0%   | 55  | 30  | 100 | 0%   |

> Stats équilibrés AT/MAT 30 = profil "balanced fighter" Disc 1. Faible HP (600) vs Disc 4 bosses (Belzac 16k, Damia 9k) — cohérent power curve Disc 1.

### Status Immunity (8/8)

| Petrify | Bewitch | Arm Block | Dispirit | Confuse | Fear | Poison | Stun |
| ------- | ------- | --------- | -------- | ------- | ---- | ------ | ---- |
| ✔       | ✔       | ✔         | ✔        | ✔       | ✔    | ✔      | ✔    |

> Confirme pattern boss canon (cohérent Belzac, Damia : 8/8 immune systématique).

### Yield (Emperor Doel — yield total des 2 phases)

| EXP   | Gold | Drops   |
| ----- | ---- | ------- |
| 3,000 | 200  | Nothing |

> **Drops "Nothing"** car le **Violet Dragoon Spirit** est obtenu en **reward scripted** (pas drop combat). Yield EXP/Gold donné dès phase 1 (Dragoon Doel phase 2 = 0/0).

### Abilities (Emperor Doel)

| Action           | Target | Damage           | Attack Multiplier | Conditions     |
| ---------------- | ------ | ---------------- | ----------------- | -------------- |
| Multi-slash Slam | Single | 1× Physical      | **1.0**           | Retaliate only |
| Spirit Bullet    | Single | 1× Thunder magic | **1.0**           | —              |

### Traits (Emperor Doel)

| Passive                | Effect                                                        | Trigger             |
| ---------------------- | ------------------------------------------------------------- | ------------------- |
| **Retaliate (simple)** | Ignore turn order + Multi-slash Slam                          | Chance per hit subi |
| **Transform**          | Ignore turn order + **transformation Dragoon Doel** (phase 2) | **HP = 0**          |

> Notable : **Retaliate single-action** (pas cyclique comme Belzac/Damia 3-action cycle). Plus simple Disc 1.
> **Transform on death** = phase 2 trigger canon, pas defeat. Pattern à implémenter `Boss.deathBehavior: "defeat" | "transform"`.

## Stats canon — Phase 2 : Dragoon Doel (transformation)

| HP    | AT  | DF  | A-AV | SPD | MAT | MDF | M-AV |
| ----- | --- | --- | ---- | --- | --- | --- | ---- |
| 1,800 | 32  | 120 | 0%   | 55  | 34  | 100 | 0%   |

> Phase 2 = power-up massif : **HP × 3** (600 → 1,800), AT/DF slight +, MAT +4, MDF identique. **Counter Additions disabled** (focus offensif pure).

### Status Immunity (8/8 — identique)

Cohérent canon.

### Yield (Dragoon Doel)

| EXP | Gold | Drops   |
| --- | ---- | ------- |
| 0   | 0    | Nothing |

> Yield phase 2 = 0 (déjà donné phase 1).

### Counter Opportunities = 0

**Dragoon Doel ne peut PAS counter** (vs Emperor Doel = group 28). Pattern : **transformation Dragoon perd counter capability** (focus magic offensif).

### Abilities (Dragoon Doel)

| Action              | Target | Damage               | Attack Multiplier | Conditions                                 |
| ------------------- | ------ | -------------------- | ----------------- | ------------------------------------------ |
| Thunder Beam        | Single | 1× Thunder magic     | **1.0**           | Disabled pendant Thunder Barrier           |
| Thunder Slash       | Party  | 1.5× Thunder magic   | **1.5**           | —                                          |
| **Spark Net**       | Single | **3× Thunder magic** | **3.0**           | Disabled pendant Thunder Barrier           |
| **Thunder Barrier** | Self   | 0× damage immune     | —                 | **HP < 50%** trigger                       |
| Dispel Barrier      | Self   | Reset state          | —                 | **Auto 4th turn après Thunder Barrier**    |
| **Thunderbolt**     | Party  | **2× Thunder magic** | **2.0**           | **Enabled ONLY by Thunder Barrier active** |

> 🆕 **Mécanique "Thunder Barrier" canon avancée** (premier boss canon avec damage immunity + abilities swap) :
>
> 1. HP atteint < 50% → Thunder Barrier auto-cast
> 2. Boss **immunisé totalement** (0× damage)
> 3. Thunder Beam + Spark Net **disabled**
> 4. **Thunderbolt** (party 2× Thunder) **enabled**
> 5. **4 turns plus tard** : Dispel Barrier auto → return normal abilities
>
> Implication tactique canon : pendant 4 turns, party doit **endure Thunderbolt party** sans pouvoir damage Doel. Stratégie : **buff defense + heal** pendant barrier window.
>
> **Pattern data-model boss canon** :
>
> - `Boss.phases: BossPhase[]` (Emperor → Dragoon)
> - `BossPhase.transformTrigger: HpThreshold | OnDeath`
> - `Boss.abilities[].enabledBy?: AbilityId` (Thunderbolt enabled par Thunder Barrier)
> - `Boss.abilities[].disabledBy?: AbilityId` (Beam + Spark Net disabled par Barrier)
> - `Boss.damageReduction: number` (0 = immune)
> - `Boss.abilityCooldownTriggers: { abilityId, turnsLater, autoCast: AbilityId }` (Dispel Barrier auto 4 turns post-Thunder Barrier)
>
> Pattern réutilisable (Caterpillar 3-phases, Melbu Frahma probable, etc.).

## Counter opportunities (group 28, Emperor form uniquement)

Emperor Doel peut counter **toutes** les opportunities d'addition non-protégées (group 28). Identique table Belzac/Damia.

Counter formula canon : `floor{floor[floor{floor[(AT² × 250 / DF)] / 100} × Target Fear × Attacker Fear] × Power}` (cf. [`../combat/additions.md`](../combat/additions.md)).

## Story / lore

### Backstory canon Doel

- **Emperor of Imperial Sandora** (région sud Serdio, capital **Kazas**)
- **Tué son frère Carlo** (Albert's father) pour **rise to power**
- **Femme Katrina** morte pendant Serdian War (cause inconnue canon)
- **Civil war Serdio** : Bale-Basil (north, Albert heir age 6) vs Sandora-Doel (south)

### Home of Giganto incident canon (background story)

- Doel led Serdian army to **Home of Giganto pour défendre les gigantos vs humans**
- **Failed prevent genocide** des gigantos
- **Sauvé Kongol** (giganto child) → ramené à Serdio
- Lien narratif : **Kongol fidèle à Doel** → cohérent Kongol = sub-boss Disc 1 servant Doel à Hoax + Black Castle
- Cf. [`../party-members/`](../party-members/) Kongol entry (à créer)

### Boss fight canon (Disc 1 final Chapter 1)

- Location : **Black Castle (submap 660)** dans Kazas
- Boss formation 390 = Emperor Doel + Dragoon Doel (2 phases scripted)
- **Phase 1 Emperor Doel** : combat humain, 600 HP, Retaliate simple
- À HP 0 → **Transform** → **Dragoon Doel** (1,800 HP phase 2)
- Phase 2 introduit **Thunder Barrier** mécanique HP<50% → 4 turns immunité
- Defeat → **Violet Dragoon Spirit** reward canon (futur héritage Haschel Disc 2/3)

### Disc 4 rematch canon

- **Dark Doel** = rematch alternate dimension Bale Disc 4
- Cf. [`../bosses/README.md`](./README.md) Disc 4 entry "Dark Doel" — same character, alternate dimension Moon-related
- À investiguer ingestion future.

## Vision Damia

### Mode Story

- Boss fight final Chapter 1 — fidèle canon
- **Pré-combat cutscene** : Doel apparaît au Black Castle Kazas (post-Kongol fight cohérent)
- **2-phase mechanic** :
  - Phase 1 Emperor Doel (humain, ~simple) — apprend mécanique Retaliate canon
  - **Phase 2 transformation cutscene** Dragoon Doel — première fois joueur voit un boss Dragoon ennemi
- **Thunder Barrier mechanic** = première fois joueur fait face à **boss damage immunity + abilities swap**
- **Reward Violet Dragoon Spirit** = setup futur Haschel Disc 2 joining
- **Strategy hint canon** :
  - Phase 1 : straightforward, kill HP fast (600 HP)
  - Phase 2 : burst damage avant HP 50% pour éviter Barrier window
  - Si Barrier proc : tank Thunderbolt party (2× Thunder) avec defense/heal
  - Thunder = **opposite Wind** → **Lavitz Dragoon advantageous**
- **Scripted encounter** (0% escape)

### Vision symbolique / character arc

- **Doel "Dark King"** : antagoniste tragique (genocide gigantos prevention failed, family killed brother), pas pur méchant
- **Boss compelling avec lore tragique** = Mode Story candidate pour reveal pré-combat (Doel motivations)
- Cohérent Kongol joining party post-Doel defeat (Kongol = orphelin sauvé par Doel)

### Mode Survival

- Phase 1 Emperor Doel = mid-tier boss-arène (600 HP)
- Phase 2 Dragoon Doel = boss avancé avec mécanique Thunder Barrier
- Pattern visuel "Dragoon antagoniste" = readyto exploiter

### À implémenter (impact code)

- **Boss "2-phase transformation" data-model** :
  - `Boss.phases: BossPhase[]` (Emperor + Dragoon Doel)
  - `BossPhase.transformTrigger: "hp_zero" | "hp_threshold"`
  - Cutscene cinematic phase transition
  - Yield (EXP/Gold) sur phase finale uniquement
- **Counter Additions per phase** : Emperor = group 28 / Dragoon = group 0 (no counters)
- **Thunder Barrier mécanique** :
  - `Boss.damageReduction: number` (0 = immune state)
  - HP threshold trigger (<50%)
  - 4-turn auto Dispel
  - Abilities enabledBy/disabledBy state (Beam+Spark disabled, Thunderbolt enabled)
- **Reward Violet Dragoon Spirit** post-defeat (story event, pas drop)
- **Thunder element** + opposing Wind (Lavitz advantage canon)

## Liens code & doc

- **Source canon** : [`_sources/lod-wiki-doel.md`](./_sources/lod-wiki-doel.md)
- **Kazas / Black Castle** : [`../locations/Kazas.md`](../locations/Kazas.md)
- **Albert** (neveu, héritier Bale) : [`../party-members/Albert.md`](../party-members/Albert.md)
- **Kongol** (giganto sauvé par Doel) : `../party-members/Kongol.md` (à créer)
- **Haschel** (futur Violet Dragoon héritier) : `../party-members/Haschel.md` (à créer)
- **Carlo** (frère tué par Doel, Albert's father) : `lore/serdia.md` (à créer) ou `npcs/carlo.md`
- **Katrina** (Doel's wife) : `npcs/katrina.md` (à créer)
- **Dark Doel** (Disc 4 alternate Bale rematch) : `./Dark Doel.md` (à créer)
- **Damage formula** : [`../combat/damage-formula.md`](../combat/damage-formula.md) (Attack Multiplier per ability)
- **Elements** : [`../combat/elements.md`](../combat/elements.md) (Thunder)
- **Additions** : [`../combat/additions.md`](../combat/additions.md) (counter group 28 Emperor / group 0 Dragoon)
- **Status effects** : `../combat/status-effects.md` (à créer)
- **Lore Serdian War / Imperial Sandora** : `lore/serdian-war.md` (à créer)
- **Lore Home of Giganto genocide** : `lore/giganto-genocide.md` (à créer)
- **Items** : `../items/` (à créer) — Violet Dragon DS

## Questions ouvertes

- **Violet Dragoon Spirit canon mechanism** — Doel défait → DS obtenu mais Haschel n'est pas présent. Comment Haschel reçoit le DS canon ? Cf. Albert pattern (Lavitz death → DS transfer party → Albert later). Probable : DS resté avec party Dart, transferred to Haschel quand il join Disc 2. À investiguer.
- **Carlo / Albert father canon** — frère de Doel, tué par Doel pour rise to power. À documenter `npcs/carlo.md` + `lore/basil.md`.
- **Katrina death cause canon "inconnue"** — possible reveal Disc 4 (alternate dimension Doel) ? Mystery narrative. À investiguer.
- **Home of Giganto genocide canon detail** — qui a tué les gigantos ? Humans (Serdians ? autres ?) ? Doel a essayé empêcher mais failed. Backstory tragique majeur. À ingérer.
- **Kongol-Doel loyalty arc** — Kongol fidèle à Doel post-sauvetage enfant. Cohérent Kongol = sub-boss Hoax + Black Castle servant Doel. Post-Doel defeat : Kongol join Dart canon Disc 2. À documenter.
- **Dragoon Doel transformation lore** — comment Doel a obtenu le Violet Dragoon Spirit ? Pre-game ? Pendant Serdian War ? Origine Spirit ? À investiguer (probable ancien Dragoon Kanzas → Doel inheritance pattern Vellweb).
- **Thunder Barrier mécanique trigger %** — wiki indique "HP < 50%" mais chance % ? Auto à HP threshold ? À reconfirmer tier 1.
- **Dispel Barrier "4th turn" canon** — comment compter en real-time Damia ? Conversion turn → seconds (e.g. 1 turn = 5 sec ?). Mécanique cooldown timer.
- **Kanzas (ancien Dragoon Vellweb) → Doel inheritance** — probable canon : Doel = Violet Dragoon héritier de Kanzas. Cohérent pattern Belzac→Kongol (Earth), Damia→Meru (Water), Syuveil→Lavitz (Wind). Si confirmé : Kanzas = Violet/Thunder canon. À investiguer.
- **Dark Doel Disc 4** — alternate dimension Bale (Moon related). Same Doel ressuscité ? Memory Manipulation by Melbu Frahma ? À investiguer ingestion Dark Doel page.
- **Imperial Sandora capital city Kazas vs Sandora as separate name** — naming canon. À clarifier.
- **8/8 status immunity dès Disc 1** — confirme pattern : **tous bosses canon = status immune total**, pas progression. Important data-model.
