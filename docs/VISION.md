# VISION — Damia

> Document canonique de la vision du projet. Source de vérité unique.
> Capté au fil des explications de l'auteur — chaque section reprend
> exhaustivement et fidèlement ce qui a été énoncé, sans extrapolation.

---

## 1. Identité du projet

**Damia** est un remake du JRPG **The Legend of Dragoon (TLoD)**, sorti
à l'origine sur PlayStation 1.

- **Plateforme cible** : navigateur web, rendu **WebGL**.
- **Pourquoi le web** :
  - **Simplicité** — déploiement direct, pas de pipeline d'installation.
  - **Accessibilité** — n'importe qui peut lancer le jeu sans setup
    préalable.
- **Genre revisité** : **Action-RPG temps réel**.
  - Diverge volontairement du JRPG tour-par-tour de l'original.
- **Perspective** : **2D isométrique**.
- **Inspirations gameplay** :
  - **Age of Empires 2 Definitive Edition (AoE2 DE)** — pour le feel
    clic-to-move / clic-to-attack et la lisibilité iso temps réel.
  - **Diablo 2** — pour la boucle action-RPG iso, le combat direct,
    l'engagement à la souris.
- **Fidélité à l'œuvre** : **la plus canon et fidèle possible à TLoD**
  (lore, personnages, zones, classes Dragoon, additions, magies, OST,
  ambiance visuelle).

---

## 2. Genèse — pourquoi un projet web et pas autre chose

### Tentative #1 — éditeur de scénarios AoE2 DE (abandonnée)

L'auteur a initialement tenté de monter le projet dans l'**éditeur de
scénarios d'AoE2 DE**.

Raisons de l'abandon :

- **Timers foireux** — pas assez fiables pour la logique d'un Action-RPG.
- **Assets non-fantasy** — la bibliothèque d'AoE2 DE ne couvre pas
  l'univers heroic-fantasy nécessaire à TLoD (Dragoons, monstres,
  zones d'Endiness, etc.).
- **Et d'autres limites de l'éditeur** (à compléter si besoin).

### Tentative #2 — projet web dédié (en cours)

Devant les limites de la voie AoE2 DE, l'auteur est passé sur un
développement web custom, avec mon assistance (Claude) sur la partie
code.

---

## 3. Rôle de l'assistant (Claude) — capitaine code

L'auteur me confie le **lead sur l'organisation du code**. Je dois me
comporter comme un **architecte / développeur Senior** :

- **Code propre** — conventions strictes, lisibilité d'abord, zéro
  bricolage qui dette technique demain.
- **Code scalable** — chaque ajout doit s'intégrer au modèle data-driven
  existant (ECS pur, AssetManager centralisé, archétypes + avatars
  séparés, etc.) sans forker la moitié du moteur.
- **Refactor sans hésiter** — si je vois un truc foireux ou qui va
  bloquer une évolution, je propose le refactor (et je l'applique
  après validation). Pas de respect aveugle de l'existant si l'existant
  est mauvais.

Ce que l'auteur garde côté lui :

- **Validation** de chaque étape avant qu'elle parte en main / soit
  considérée comme actée.
- **Lore TLoD** — jamais inventé. Si une décision narrative est
  ambiguë, je demande.
- **Data canoniques** (stats, courbes XP, additions, dragoons, sorts,
  sprites, OST) fournies par l'auteur depuis ses sources TLoD.
- **Décisions de design** — quand un trade-off touche au feel ou à la
  vision, l'auteur tranche.

---

## 4. Périmètre fonctionnel — les deux modes de jeu

Damia se développe **sur deux modes en parallèle**, avec des objectifs
distincts mais une base de code unique.

### 4.1 Mode Story — fidélité maximale à TLoD

- **Trame** : suit le jeu TLoD original de la PS1 **fidèlement**, mais
  rendu en **2D isométrique** et **temps réel**.
- **Fidélité visée à 100% sur** (liste donnée par l'auteur) :
  - **Acquisition des additions** — courbes de uses, ordres d'unlock,
    Master Additions, etc.
  - **Acquisition des Dragoon Spirits** — points de bascule narratifs,
    transformations.
  - **Cutscenes** — toutes les séquences scénarisées.
  - **Dialogues** — texte intégral des PNJ et boss.
  - **Stats** — courbes par level canoniques (HP/ATK/DEF/M.ATK/M.DEF,
    XP cumulé, etc.).
  - **Etc.** — tout le reste suit aussi (équipement, items, magies,
    boss, zones, OST…).
- **Position courante** : on reste fidèle au max. _(Note : l'auteur a
  amorcé une exception en disant "sauf." sans préciser — point à
  clarifier ; rien n'est à dévier tant que ça n'est pas explicité.)_

### 4.2 Mode Survival — Vampire-Survivors-like

- **Inspiration** : **Vampire Survivors** (vagues infinies, scaling
  exponentiel, méta-progression).
- **Pourquoi ce mode** (raisons données par l'auteur) :
  - **Parce que c'est fun**.
  - **Laboratoire de feel** — permet de tester en avance des éléments
    de gameplay qui finiront aussi en Story.
- **Différences assumées avec le Story** :
  - **Méthodes d'acquisition** différentes (méta-unlocks via runs, pas
    progression scénarisée).
  - **Équilibrage** différent (le Story doit rester canon TLoD ; le
    Survival peut être tuné pour le fun et le challenge endless).

### 4.3 Relation entre les deux modes

Les **mécaniques de combat** (additions, Dragoon transform, SP, magies,
etc.) sont **partagées** au niveau code — c'est tout l'intérêt de la
double cible. Ce qui diffère par mode :

- **Acquisition** (story narrative vs survival meta-unlock).
- **Équilibrage** (stats canoniques vs scaling endless).
- **Scènes / orchestration** (Forest/Hellena/WorldMap vs Arena).

---

## 5. Plateformes cibles

Le jeu doit tourner **aussi bien sur navigateur PC que mobile**. Pas de
plateforme privilégiée — les deux sont des cibles de premier rang.

Conséquences directes :

- **Inputs duals obligatoires** : clavier+souris ET tactile (joystick
  virtuel, boutons d'action, gestures).
- **Layout responsive** : safe-area iOS, redimensionnement dynamique
  des HUD, viewport portrait vs paysage.
- **Performance** : 60 FPS cible y compris sur mobile milieu de gamme.

**Contexte de développement** : l'auteur code actuellement **depuis son
mobile** (pas d'accès à son PC fixe pour le moment). Implication
pratique : la collaboration passe par échanges texte / images, je dois
être autonome côté lecture-de-code et anticiper ce que l'auteur ne peut
pas vérifier rapidement à l'œil.

---

## 6. Sections à venir

> Cette doc grossira à mesure que l'auteur précise sa vision. Sections
> attendues (à compléter ensemble) :
>
> - **Cible joueur** — public visé, durée de session, niveau d'expérience
>   attendu (fans TLoD vs nouveaux venus).
> - **Roadmap macro** — phases / jalons revus post-MVP (le `ROADMAP_MVP.md`
>   actuel s'arrête à M8 alors qu'on a livré bien plus).
> - **Critères de "fini"** — quand est-ce qu'une feature est considérée
>   canon-fidèle / acceptable pour merge.
> - **Hors-scope assumé** — multiplayer ? mods ? remaster console ?
> - **Monétisation / distribution** — gratuit / open-source / autre.
> - **Exceptions à la fidélité TLoD** — la phrase "sauf." de §4.1
>   reste à compléter.

---

_Dernière mise à jour : 2026-05-12 — sections 1-5 captées._
