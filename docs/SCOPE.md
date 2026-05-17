# SCOPE — Damia

> **But** : doc opérationnel — qu'est-ce qu'on construit, pour qui, avec quoi, avec quels moyens.
> Complète [VISION.md](VISION.md) (le _pourquoi_ macro) avec le _quoi / quand / comment_.
> Source de vérité partagée entre user et Claude. Évolue au fil des sessions.

---

## 1. Identité du projet

- **Nom** : Damia
- **Nature** : remake **fan-made** de _The Legend of Dragoon_ (TLoD, PS1, 1999)
- **Positionnement** : **fan game**, pas une tentative AAA
- **Monétisation** : **aucune** — le jeu utilise des assets du jeu PS1, donc impossible légalement et hors esprit du projet
- **Distribution** : libre, sur navigateur (et tentative Play Store envisagée — voir §6)

## 2. Rôles & responsabilités

| Rôle                                                         | Tenant                                      | Description                                                                                    |
| ------------------------------------------------------------ | ------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Chef de projet & vision                                      | **User** (seul capitaine à bord)            | Direction projet, vision gameplay, lore TLoD, validation chaque étape                          |
| Dev senior code & archi                                      | **Claude**                                  | Implémentation, choix techniques scalables, refactor proactif, code "digne de l'industrie pro" |
| Génération assets graphiques                                 | **User** (via ChatGPT / Gemini / autres IA) | Sprites, tiles, portraits — partagés via `shareAI/`                                            |
| Intégration assets dans le code                              | **Claude**                                  | Pipeline AssetManager, alias logiques, swap placeholder → asset réel                           |
| Décisions de design                                          | **User tranche**                            | Quand un trade-off touche au feel / canon / vision                                             |
| Data canon TLoD (stats, courbes, additions, dragoons, sorts) | **User**                                    | Source : sources TLoD personnelles (wikis, captures, etc.)                                     |

Voir aussi [VISION §3](VISION.md#3-rôle-de-lassistant-claude--capitaine-code).

## 3. Genre & style

- **Genre** : Action-RPG temps réel — diverge volontairement du JRPG tour-par-tour de l'original
- **Perspective** : 2D **isométrique**
- **Inspirations gameplay** :
  - **Diablo 2** — boucle action-RPG iso, combat direct à la souris
  - **Age of Empires 2 Definitive Edition** — feel clic-to-move / clic-to-attack, lisibilité iso temps réel
- **Fidélité visuelle / narrative à TLoD** : **maximale** (cf. [VISION §4.1](VISION.md#41-mode-story--fidélité-maximale-à-tlod))

## 4. Raisons des choix structurants

| Choix                                    | Pourquoi                                                                                                      |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Remake TLoD plutôt qu'un jeu original    | Passion personnelle du user, communauté TLoD orpheline d'un vrai remake                                       |
| Web (vs Unity / native)                  | User est dev web business IRL → leverage compétences. Plus facile à coder avec IA. Distribution simple (URL). |
| 2D isométrique (vs 3D)                   | Compatible mobile, lisible, dans l'esprit de revisite TLoD                                                    |
| Action-RPG temps réel (vs tour-par-tour) | Réinterprétation moderne, public habitué aux ARPG iso                                                         |
| Pas de monétisation                      | Assets PS1 → impossible légalement. Esprit fan game gratuit.                                                  |
| Fan game (pas AAA)                       | Tentative honnête, pas d'objectifs commerciaux, respect du matériau source                                    |

**Précédente tentative abandonnée** : éditeur de scénarios AoE2 DE — timers foireux, assets non-fantasy, expérience tedious globalement. Voir [VISION §2](VISION.md#2-genèse--pourquoi-un-projet-web-et-pas-autre-chose).

## 5. Audience cible

- **Public principal** : **communauté TLoD PS1** — fans du jeu original qui attendent un remake qui « ne viendra probablement jamais »
- **Tonalité** : faite par un fan pour les fans, pas un produit grand public

> **À clarifier** : place des newcomers (joueurs découvrant TLoD via Damia) ? On les accueille ou on assume une audience qui connaît déjà le jeu source ?

## 6. Plateformes cibles

Toutes en **premier rang** (pas de plateforme privilégiée) :

- **Navigateur PC** — clavier + souris
- **Navigateur Mobile** — tactile (joystick virtuel, gestures, boutons)
- **Play Store** — tentative d'intégration envisagée

Contraintes induites :

- Inputs duals obligatoires (cf. [VISION §5](VISION.md#5-plateformes-cibles))
- Layout responsive (safe-area iOS, portrait/paysage)
- 60 FPS y compris sur mobile milieu de gamme

> **À clarifier** : Play Store via PWA, Capacitor, Cordova, ou autre ? Choix techniques à anticiper.

## 7. Modes de jeu

Damia se développe sur **2 modes en parallèle**, **base de code unique**.

### 7.1 Mode Story — fidélité maximale TLoD

- Suit la trame du jeu PS1 fidèlement (zones, bosses, cutscenes, dialogues, additions, Dragoons, OST)
- Adaptation forcée du gameplay : tour-par-tour → temps réel iso
- Détails mécaniques verrouillées : [VISION §6](VISION.md#6-mécaniques-verrouillées--forme-dragoon-sp-dlv-mp)

### 7.2 Mode Survival — fun-first

- Inspiration : **Vampire Survivors** (et similaires) — vagues infinies, scaling exponentiel, méta-progression
- Laboratoire de feel : permet de tester en avance des éléments destinés à finir aussi en Story
- Différences assumées avec Story : acquisition (méta-unlocks vs narrative), équilibrage (endless vs canon)

### 7.3 Code partagé vs spécifique

Les **mécaniques de combat** (additions, Dragoon transform, SP, magies, items, stats) sont **partagées au niveau code** entre les deux modes.

Ce qui **diffère par mode** :

- **Acquisition** des unlocks (narrative scénarisée vs méta-progression run-based)
- **Équilibrage** (stats canoniques TLoD vs scaling endless)
- **Scènes / orchestration** (Forest / Hellena / WorldMap vs Arena)

**Implication code** : architecture **propre** indispensable — features communes dans des modules réutilisables, mode-specific dans des couches séparées.

## 8. Priorités et long terme

### Court terme (priorités actuelles)

- Focus **solo**, Story + Survival
- Continuer le chantier en cours (cf. [VISION §7](VISION.md#7-état-du-chantier--focus-courant) + [ROADMAP_MVP.md](ROADMAP_MVP.md))

### Long terme (vision, non priorisé)

- **Multijoueur coop Survival**
- **Multijoueur Story**
- Distribution Play Store (cf. §6)

> **À clarifier** : roadmap macro post-M8 — l'actuelle s'arrête à un MVP "Forêt de Seles", mais le projet est déjà bien plus avancé selon VISION §7. Calage à faire (voir §9 contradictions).

## 9. Contradictions / zones grises à résoudre

Identifiées en relisant la doc existante :

1. **MVP vs implémentation actuelle**
   - `ROADMAP_MVP.md` Backlog post-MVP liste "Transformation Dragoon", "Système de classes Dragoon", "Additions QTE", "Magie / Items utilisables" comme **hors scope MVP**
   - Mais `VISION §6` détaille des décisions Dragoon verrouillées (SP/DLV/MP) et `VISION §7` dit que "Personnages, additions et Dragoons" sont en **chantier actif**
   - → **Quelle est la vérité actuelle ?** Le ROADMAP est obsolète ou la VISION anticipe ?

2. **Exception à la fidélité TLoD** ([VISION §4.1](VISION.md#41-mode-story--fidélité-maximale-à-tlod))
   - Une phrase amorcée par "sauf." n'a jamais été complétée
   - → Quelles **exceptions assumées** à la fidélité ?

3. **Critères de "fini"**
   - Pas encore défini : quand est-ce qu'une feature est considérée canon-fidèle / mergeable ?

## 10. Hors-scope assumé

- ❌ Monétisation (légalement impossible avec assets PS1, esprit fan game)
- ❌ Tentative AAA / publication commerciale
- ❌ Multijoueur court terme (vision long terme uniquement)

> **À clarifier (autres hors-scope potentiels)** :
>
> - Open-source du code (repo public ouvert aux contributions) ou repo privé ?
> - Mods / éditeur de map joueur ?
> - Remaster console (Switch, PS5) ?
> - Localisation au-delà de EN/FR ?

## 11. Questions ouvertes synthèse

À trancher progressivement pour stabiliser le scope :

- [ ] **Audience newcomers** : on accueille les non-fans TLoD ou audience fan-only assumée ? (§5)
- [ ] **Play Store technique** : PWA / Capacitor / Cordova / autre ? (§6)
- [ ] **Contradiction MVP/Dragoon** : statut réel du chantier ? (§9.1)
- [ ] **Exceptions fidélité TLoD** : compléter la phrase « sauf. » de VISION §4.1 (§9.2)
- [ ] **Critères de canon-fidélité** : définition opérationnelle "fini = mergeable" (§9.3)
- [ ] **Open-source ou repo privé** ? (§10)
- [ ] **Scope canon final** : full TLoD (4 discs, monde complet) ou sous-ensemble ? Étalonnage de l'ambition

---

## Liens utiles

- [VISION.md](VISION.md) — vision macro, mécaniques verrouillées Dragoon
- [PROJECT_BLUEPRINT.md](PROJECT_BLUEPRINT.md) — archi technique, stack, conventions code
- [ROADMAP_MVP.md](ROADMAP_MVP.md) — jalons M0→M8 (statut MVP)
- [ARCHITECTURE.md](ARCHITECTURE.md) — état fonctionnel à un instant T
- [features/](features/README.md) — doc fonctionnelle par thématique
