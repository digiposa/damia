# Belzac

> Boss canon Disc 4 à **Vellweb** — **un des 7 anciens Dragoons** servant Emperor Diaz pendant la Dragon Campaign. **Gold Dragoon** (élément Earth) dont **Kongol héritera le Spirit**.
>
> **Source canon** : 🥈 [`_sources/lod-wiki-belzac.md`](./_sources/lod-wiki-belzac.md)

## Statut

🟡 **draft** — data canon ingérée. Aucune impl Damia. Premier boss documenté (premier de la catégorie `bosses/`).

## Profil

| Attribut          | Valeur                                                                            |
| ----------------- | --------------------------------------------------------------------------------- |
| Type              | Boss canon (un des 7 anciens Dragoons)                                            |
| Archetype Dragoon | **Gold Dragon** (Earth) — Kongol's predecessor                                    |
| Élément           | **Earth** (cf. [`../combat/elements.md`](../combat/elements.md))                  |
| Location canon    | **Vellweb (submap 502)** — cf. [`../locations/`](../locations/) (Vellweb à créer) |
| Encounter         | **Scripted** (0% escape)                                                          |
| Counter group     | **28** (all opportunities)                                                        |
| Disc              | Disc 4 (Chapter 4: Moon & Fate)                                                   |

## Stats canon

### Stats de base

| HP     | AT  | DF  | A-AV | SPD | MAT | MDF | M-AV |
| ------ | --- | --- | ---- | --- | --- | --- | ---- |
| 16,000 | 178 | 200 | 0%   | 50  | 71  | 80  | 0%   |

### Status Immunity

✅ **Immunisé à tous les 8 statuts canon** :

| Petrify | Bewitch | Arm Block | Dispirit | Confuse | Fear | Poison | Stun |
| ------- | ------- | --------- | -------- | ------- | ---- | ------ | ---- |
| ✔       | ✔       | ✔         | ✔        | ✔       | ✔    | ✔      | ✔    |

> Pattern boss canon : **status immunity totale** (8 statuts). Important pour data-model boss vs minor mob.

## Yield

| EXP   | Gold | Drops                   |
| ----- | ---- | ----------------------- |
| 6,000 | 300  | **Golden Stone (100%)** |

> **Golden Stone** = item à documenter dans `items/` futur. Probable lien Dragoon Spirit related (Kongol acquires Spirit after Belzac defeat ?).

## Abilities & Traits

### Abilities

Toutes les valeurs canon — confirmant le système **Attack Multiplier per ability** Wulves :

| Action        | Target | Damage           | Attack Multiplier | Conditions         |
| ------------- | ------ | ---------------- | ----------------- | ------------------ |
| D-attack      | Single | 1× Physical      | **1.0**           | —                  |
| Grand Stream  | Party  | 1.5× Earth magic | **1.5**           | —                  |
| Meteor Strike | Party  | 2× Earth magic   | **2.0**           | **Retaliate only** |
| Golden Dragon | Party  | 3× Earth magic   | **3.0**           | **Retaliate only** |

→ **Grand Stream / Meteor Strike / Golden Dragon** = les **trois Dragoon Magic spells canon de Kongol (Gold Dragoon)**. Belzac utilise ses propres sorts. Lien lore direct.

> Confirmation Wulves : **Enemy Magical formula** = `floor[MAT² × 5 / MDF] × Attack Multiplier`. Pour Belzac vs allié niveau X :
>
> - D-attack physique : Enemy Physical formula = `floor[178² × 5 / DF] × 1.0`
> - Grand Stream : `floor[71² × 5 / MDF] × 1.5`
> - Meteor Strike : `floor[71² × 5 / MDF] × 2.0`
> - Golden Dragon : `floor[71² × 5 / MDF] × 3.0`

### Trait passive

| Passive name (community) | Effect                                                                                                                 | Trigger                                   |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| **Patterned Retaliate**  | **Ignore turn order** + Meteor Strike. **2nd trigger** = D-attack. **3rd trigger** = Golden Dragon. **Cycle repeats**. | Chance to trigger when targeted by attack |

> Pattern AI canon boss → cycle 3 abilities en réponse aux attaques. À porter en Damia avec data-model :
>
> - `boss.retaliate.chance: number` (probabilité par hit)
> - `boss.retaliate.cycle: Ability[]` (séquence d'abilities)
> - `boss.retaliate.cycleIndex: number` (état interne, persiste pendant le combat)
> - `boss.retaliate.ignoresTurnOrder: boolean`
>
> En real-time Damia : "turn order" → notion de cooldown / animation queue. À adapter.

## Counter opportunities (group 28)

Belzac peut counter **toutes** les opportunities d'addition non-protégées (group 28).

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

Counter formula canon : `floor{floor[floor{floor[(AT² × 250 / DF)] / 100} × Target Fear × Attacker Fear] × Power}` (cf. [`../combat/additions.md`](../combat/additions.md)).

## Story / lore

> _Section "Story Read More" de la page wiki non développée. À compléter via ingestion fandom Belzac ou via page Vellweb._

**Contexte canon Dragon Campaign** (cf. [Bale folklore Noish](../locations/Bale.md#story--lore)) :

- Belzac est **un des 7 Dragon incarnations** servant **Emperor Diaz** pendant la Dragon Campaign (~11k ans avant les événements du jeu).
- Spécifiquement : Belzac = **Gold Dragoon** (Earth).
- Après sa mort, le **Gold Dragoon Spirit** reste à Vellweb (mausolée des 7 Dragoons) jusqu'à ce que **Kongol** en hérite (Disc 2/3).
- Belzac est rencontré comme boss à Vellweb en **Disc 4** — possiblement résurrection / spectre / scripted spirit encounter (à confirmer lors de l'ingestion fandom/lore).

## Vision Damia

### Mode Story

- Boss fight Vellweb (Disc 4) — fidèle canon
- **Trait Patterned Retaliate** = mécanique unique → data-model retaliate cycle réutilisable pour d'autres bosses
- **Scripted encounter** (0% escape)
- **Drop 100%** : Golden Stone (item canon)
- **Status immunity total** (8 statuts)

### Mode Survival

- Belzac peut servir de **boss arena** dans une vague avancée
- Mécanique Retaliate cycle = signature visuelle / boss "telegraphe" ses 3 attacks → joueur apprend pattern
- En Modern Survival : possibles variations (élément différent, abilities supplémentaires, scaling)

### À implémenter (impact code)

- **Boss data-model** :
  - `BossDefinition extends EnemyDefinition` avec stats étendus
  - **Status immunity flags** (8 booleans, ou bitmask)
  - **Retaliate trait** (chance, cycle, ignoresTurnOrder)
  - **Scripted encounter** flag (0% escape)
  - **Counter group** field (1-28)
- **Attack Multiplier per ability** (déjà tracé en TODO — voir §Belzac confirmation)
- **Element abilities** distinct du boss element (Belzac=Earth, abilities = Earth ; cohérent canon)
- **Drop 100% items** (vs % drops pour minors)

## Liens code & doc

- **Source canon** : [`_sources/lod-wiki-belzac.md`](./_sources/lod-wiki-belzac.md)
- **Vellweb** (location) : `../locations/Vellweb.md` (à créer)
- **Kongol** (héritier Gold Dragoon) : `../party-members/Kongol.md` (à créer)
- **Dragon Campaign lore** : `../lore/dragon-campaign.md` (à créer) — 7 anciens Dragoons originaux
- **Damage formula** : [`../combat/damage-formula.md`](../combat/damage-formula.md) (Attack Multiplier per ability)
- **Elements** : [`../combat/elements.md`](../combat/elements.md) (Earth element)
- **Additions** : [`../combat/additions.md`](../combat/additions.md) (counter group 28)
- **Status effects** : `../combat/status-effects.md` (à créer — 8 statuts canon)
- **Items** : `../items/` (à créer — Golden Stone)

## Questions ouvertes

- **Belzac vivant ou esprit ?** — Lore : Belzac mort ~11k ans pre-game. Comment apparaît-il à Vellweb ? Spirit/résurrection/scripted spectre ? À confirmer via lore.
- **Golden Stone** — item canon (drop 100%). Effet ? Lien avec Dragoon Spirit Kongol ? À documenter dans items/.
- **Retaliate cycle real-time adaptation** — comment porter "ignore turn order" en Damia real-time ? Idée : boss execute retaliate ability **immédiatement** après être touché (interrupt sa propre animation/cooldown courante).
- **Patterned Retaliate trigger chance** — wiki ne précise pas le % exact. À confirmer source tier 1.
- **Lien Kongol-Belzac** — moment exact du transfer Gold Spirit canon ? Lien narratif disc 2/3 (probablement Disc 2 Kongol join party post-Doel fight).
- **Other 6 Dragoons à Vellweb** — Damia, Syuveil, Kanzas, Atlow + 2 autres ? À confirmer via page Vellweb.
- **Belzac Element = Earth** mais ses spells sont aussi Earth (cohérent canon). Pas d'exception comme Last Kraken (multi-élément).
