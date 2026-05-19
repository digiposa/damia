# Aglis

> **Magical Wingly City**, ancien hub de magic research, repose au fond de la mer près des Broken Islands (adjacent à Rouge). Dungeon Disc 3/4 — exploration courte + boss Last Kraken + tests of courage party-wide.
>
> **Source canon** : 🥈 [`_sources/lod-wiki-aglis.md`](./_sources/lod-wiki-aglis.md)

## Statut

🟡 **draft** — données canon ingérées. Aucune impl Damia. Donjon end-game.

> ⚠️ **Disc à confirmer** : user mentionne Disc 4. Le canon classique place Aglis Disc 3 (arc Rouge → Aglis → Zenebatos). Submap IDs et listes adjacents (#37 Rouge → #38 Aglis → #39 Zenebatos) suggèrent une séquence mid-game ; le découpage Disc 3 vs Disc 4 peut être marginal (transitions de disque pas toujours nettes en gameplay). À retrancher lors d'une passe globale Disc.

## Profil

| Attribut         | Valeur                                                                         |
| ---------------- | ------------------------------------------------------------------------------ |
| Type             | Dungeon Wingly (ancien hub magique)                                            |
| Localisation     | Fond de mer, près des Broken Islands, adjacent à Rouge                         |
| Civilisation     | Wingly (ancienne)                                                              |
| Habitant unique  | **Savan** (lone inhabitant)                                                    |
| Architecture     | Magical city avec **téléporteurs** + **mirror rooms** + plateformes flottantes |
| Combat           | Random encounters (5 mob kinds) + boss **Last Kraken**                         |
| Previous (canon) | #37 Rouge                                                                      |
| Next (canon)     | #39 Zenebatos                                                                  |
| Submaps wiki     | **19** + 1 unused (mirror room Rose pré-visite)                                |

## Story / lore

Story beat majeur fin Disc 3 / début Disc 4 :

- **Approche** : Dart & co poursuivent **Zieg** (antagoniste majeur late-game) pour protéger le **Signet Sphere** d'Aglis (un des 4-5 sceaux magiques répartis dans Endiness).
- **Arrivée** : la cité partiellement émerge depuis Rouge et révèle un chemin d'entrée.
- **Inhabitant** : **Savan** est le seul habitant — il a passé sa vie au service de la magie et **a créé des créatures magiques** aux personnalités étranges.
- **Quest principal** : Savan veut concevoir une **créature assez puissante pour garder le Signet** — la **Psychedelic Bomb**, arme magique de grande puissance.
- **Mécanique clé** : la party participe aux **7 tests of courage** (un par membre) pour collecter le courage nécessaire à fabriquer la Psyche Bomb.

## NPCs majeurs

- **Savan** — lone Wingly inhabitant, créateur des créatures magiques
- **Phewy** — assistant dans la research room, aide à préparer la Psyche Bomb + Moot
- **Moot** — création de Savan, protector candidate pour le Signet
- **Zieg** (antagoniste poursuivi, mentionné, pas combattu ici)

## Services

| Type        | Détails                                                                                |
| ----------- | -------------------------------------------------------------------------------------- |
| Save Points | 2 — l'un près des téléporteurs aux 7 tests of courage, l'autre devant la salle de Moot |
| Hotel       | Aucun                                                                                  |
| Clinic      | Aucun                                                                                  |
| Shops       | Aucun (dungeon)                                                                        |

## Collectibles

### Quest spéciale — Tests of Courage

Quest party-wide qui détermine la récompense finale :

- **Réponses 100% correctes** → **Psychedelic Bomb X** (BID 400, item magic le plus puissant canon — cf. [`combat/damage-formula.md`](../combat/damage-formula.md))
- **Au moins une réponse fausse** → Psychedelic Bomb (BID inférieur)

Réponses canon par character (détail dans [`_sources/lod-wiki-aglis.md#tests-of-courage--correct-answers-canon`](./_sources/lod-wiki-aglis.md#tests-of-courage--correct-answers-canon)) :

| Character | Correct answer                       |
| --------- | ------------------------------------ |
| Kongol    | "Take Doel's sword."                 |
| Miranda   | "For the world" + "I cannot die now" |
| Albert    | "I cannot do that."                  |
| Meru      | "I still cannot die."                |
| Haschel   | "I couldn't stop her."               |
| Rose      | (any answer — outcome inchangé)      |
| Dart      | "I will save Shana no matter what!"  |

### Treasure Chests (10)

Détails complets dans le source. Contenu : Burn Out, Gushing Magma, Magical Hat, Moon Serenade, Angel's Prayer, Sun Rhapsody, Healing Fog, Healing Rain, 200G, Healing Breeze.

### Goods / Stardust

Aucun.

## Combat

### Minor Enemies (5 kinds, random encounters)

| Enemy      | Élément | EXP | Gold | Drop              |
| ---------- | ------- | --- | ---- | ----------------- |
| Aqua King  | Water   | 135 | 30   | Angel's Prayer 8% |
| Jelly      | Water   | 120 | 24   | Healing Fog 10%   |
| Minotaur   | Earth   | 180 | 48   | Heavy Mace 2%     |
| Scud Shark | Water   | 150 | 39   | Body Purifier 8%  |
| Stern Fish | Water   | 165 | 54   | Frozen Jet 8%     |

→ Note : zone à dominance **Water** (4/5 mobs). Minotaur Earth = outlier ; en canon TLoD Earth opposite Wind, donc party Lavitz/Albert/Kongol moins efficaces vs Minotaur.

### Boss

| Boss        | Élément | EXP    | Gold | Drop (100%)       |
| ----------- | ------- | ------ | ---- | ----------------- |
| Last Kraken | Water   | 12,000 | 300  | **Pretty Hammer** |

→ À détailler dans `bosses/Last Kraken.md` (futur).

> **Note fandom-mentioned earlier** : Last Kraken canon uses **Thunder, Light AND Water attacks** (exception du general rule "monster uses own element"). Tier 1/2 confirmation needed.

### Encounter system data (canon)

Donne le data-model pour `combat/encounter-system.md` (à créer) :

- **Encounter Rate** (17 ou 21 selon submap) = probabilité d'encounter par "step"
- **Escape Rate** : 30% standard
- **Formations** par submap : 4 formations (35/35/20/10% probabilité)
- IDs de formations (230, 231, 232, 233, 234, 235, 236, 237, 238, 239) = data reusable across submaps
- Boss = Scripted encounter (0% escape rate)

Détail submap par submap dans [`_sources/lod-wiki-aglis.md#maps`](./_sources/lod-wiki-aglis.md#maps).

## Maps / submaps

**19 submaps** + 1 unused (Rose mirror pre-visite).

Catégories principales :

- **Gate / entrée** (1)
- **Teleporter chains** (2, 3, 4, 5, 7, 9, 10, 14, 16, 17 — la majorité du donjon = navigation via téléporteurs entre plateformes)
- **Research room** (6, Phewy)
- **Mirror rooms** (8 = présent, + 701 = avant-visite Rose)
- **Tests of courage** (11 hub, 12 = Kongol/Miranda/Albert/Rose, 13 = Meru/Haschel/Dart)
- **Psyche Bomb forge** (15)
- **Last Kraken arena** (18, Moot platform)
- **Exit Zenebatos** (19)

## Vision Damia

### Mode Story

- **Reproduire** topology canon avec téléporteurs comme mécanique de mouvement signature de la zone (cohérent ambiance Wingly magic)
- **Mirror rooms** = scenes spéciales narratives (704 Rose pré-visite + 577 présent) — à implémenter comme cutscenes
- **Tests of courage party-wide** = mécanique narrative unique → UI dédiée (dialogue branching avec 7 choix par character)
- **Last Kraken boss fight** + Pretty Hammer drop garanti
- **Save points** (2 emplacements dédiés)

### Mode Survival

- Aglis **pourrait** servir d'**arène thématique Wingly** — ambiance underwater + magical platforms
- Mob pool Water-dominant cohérent pour un theme "Wingly tides"
- Tests of courage = mécanique narrative, **non transposable** directement en Survival (skip)

### À implémenter (impact code)

Systèmes underlying spécifiques à Aglis :

- **Téléporteur** entity (warp on touch, lié à un autre téléporteur par ID) — mécanique partagée probablement avec d'autres dungeons Wingly
- **Mirror room** (cutscene scripted)
- **Tests of courage UI** — branching dialog, multi-character, accumulation d'un compteur "courage 100%" gating Psyche Bomb X
- **Random encounter system** — Encounter Rate per submap + formation pool weighted + escape rate (déjà partiellement présent en code Damia via `EncounterSystem` mentionné dans inventaire combat)
- **Boss-scripted encounter** (Last Kraken, 0% escape)
- **Multi-element drop** (Pretty Hammer 100% on Last Kraken)

## Liens code & doc

- **Source canon** : [`_sources/lod-wiki-aglis.md`](./_sources/lod-wiki-aglis.md)
- **Rouge** (location précédente) : `./Rouge.md` (à créer)
- **Zenebatos** (location suivante) : `./Zenebatos.md` (à créer)
- **Last Kraken** : `../bosses/Last Kraken.md` (à créer)
- **Items des chests/drops** : `../items/` (à créer — Burn Out, Gushing Magma, Pretty Hammer, etc.)
- **Psyche Bomb X** : référencé dans [`../combat/damage-formula.md`](../combat/damage-formula.md) (BID 400, plus haut de la table Item Magic)
- **Encounter system** : `../combat/encounter-system.md` (à créer)
- **Quest tests of courage** : `../quests/disc4-aglis.md` (à créer)
- **Lore Wingly + Signet Sphere** : `../lore/` (à créer)
- **Code scène** : `src/scenes/Aglis/` (à créer)

## Questions ouvertes

- **Disc 3 vs Disc 4** — disc d'appartenance canon à reconfirmer (user mentionne Disc 4, séquence Rouge→Aglis→Zenebatos canon Disc 3).
- **Last Kraken multi-element** — fandom mentionne attaques Thunder/Light/Water, à confirmer tier 1.
- **Pretty Hammer item** — équipement Kongol probable (Hammer = Kongol weapon class). À documenter dans items/equipment.md.
- **Téléporteur mécanique** — quelle UX en real-time iso Damia ? Touch-to-warp instant vs cutscene transition ?
- **Tests of courage timing** — bloquant linéaire ou freeform party order ?
- **Psyche Bomb** (sans X) vs **Psyche Bomb X** — quelles formules / BID exact pour la version "réponses imparfaites" ? À retrouver dans items canon.
- **Submap 581 encounter data unused** — porter pour Survival (utiliser la salle inutilisée comme arena) ?
- **Signet Sphere lore** — gros plot device late-game, à documenter dans `lore/dragon-campaign.md` (à créer).
