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

## 3. Rôle de l'assistant (Claude)

L'auteur m'a demandé de **l'épauler sur le développement** du projet :
écriture du code, application stricte des conventions, propositions
d'architecture quand le code l'appelle. L'auteur valide chaque étape ;
il fournit le lore, les data canoniques TLoD (stats, additions, sprites,
OST), et tranche les décisions de design.

---

## 4. Sections à venir

> Cette doc grossira à mesure que l'auteur précise sa vision. Sections
> attendues (à compléter ensemble) :
>
> - **Périmètre fonctionnel** — modes (Story / Survival / autres),
>   zones, personnages, systèmes de jeu.
> - **Cible joueur** — public visé, plateformes (desktop/mobile), durée
>   de session.
> - **Roadmap macro** — phases / jalons revus post-MVP.
> - **Critères de "fini"** — quand est-ce qu'on considère qu'une feature
>   est canon-fidèle / acceptable.
> - **Hors-scope assumé** — multiplayer ? mods ? remaster console ?
> - **Monétisation / distribution** — gratuit / open-source / autre.

---

_Dernière mise à jour : 2026-05-12 — section 1-3 captées._
