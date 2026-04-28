# ARCHITECTURE — Damia

> État fonctionnel et organisation du code à un instant T.
> **À mettre à jour à la fin de chaque jalon.** Dernière mise à jour : fin M1.

---

## Sommaire

- [État fonctionnel actuel](#état-fonctionnel-actuel)
- [Vue en couches](#vue-en-couches)
- [Détail par dossier](#détail-par-dossier)
- [Flux runtime](#flux-runtime)
- [Historique des jalons](#historique-des-jalons)

---

## État fonctionnel actuel

**Jalon courant :** M1 ✅ done — prêt pour M2.

**Ce qui marche aujourd'hui :**

- Un canvas plein écran avec fond vert sombre
- Une **grille isométrique 32×32** de losanges en damier vert (deux nuances)
- **Drag caméra** au clic gauche ou clic molette
- **Zoom molette** clampé entre 0.5x et 2x
- **Overlay FPS** en haut-gauche : framerate instantané + moyenne 60 frames + label renderer (WebGL/WebGPU), reste toujours au-dessus de la scène
- Pipeline complet : dev/build/lint/typecheck/tests passent sans warning

**Ce qui n'existe pas encore :**

- Aucun personnage, aucun ennemi
- Aucune collision
- Aucun système de combat
- Aucun asset graphique (uniquement des formes géométriques dessinées)
- Aucune sauvegarde
- Aucun audio
- Aucune i18n active (structure prête, pas de traductions)

---

## Vue en couches

Le code est découpé en **5 couches strictes** avec règle de dépendance descendante : une couche ne peut jamais importer d'une couche supérieure.

```
┌─────────────────────────────────────────────┐
│  scenes/         ← orchestre les niveaux     │
├─────────────────────────────────────────────┤
│  gameplay/       ← logique de jeu (ECS)      │ ← vide en M1, M2 commence ici
├─────────────────────────────────────────────┤
│  rendering/      ← Pixi pur                  │
│  services/       ← AssetManager, etc.        │ ← contenus à venir M2-M7
├─────────────────────────────────────────────┤
│  core/           ← maths, ECS engine, events │
└─────────────────────────────────────────────┘
```

**Règles strictes :**

- `core/` ne dépend de RIEN (pas même Pixi)
- `rendering/` ne connaît pas `gameplay/`
- `gameplay/` ne touche pas Pixi directement (passera par un component `Sprite`)
- `scenes/` orchestre, ne contient pas de logique métier
- Imports circulaires interdits

---

## Détail par dossier

### `src/core/` — fondations sans dépendance

Code utilitaire qui ne connaît rien du reste, pas même Pixi. Réutilisable partout.

| Fichier                                           | Rôle                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [src/core/math/Vec2.ts](../src/core/math/Vec2.ts) | Type vecteur 2D + helpers (add, sub, scale, distance, length).                                                                                                                                                                                                                             |
| [src/core/math/iso.ts](../src/core/math/iso.ts)   | **Cœur mathématique du jeu.** Constantes `TILE_W=128`, `TILE_H=64` (ratio 2:1 dimétrique standard). Conversions `gridToWorld(gx,gy)` ↔ `worldToGrid(wx,wy)`. Helper `isoZIndex(gx,gy) = gx + gy` pour le tri par profondeur. À chaque sprite placé sur la grille on appelle ces fonctions. |

**Sous-dossiers prévus, vides aujourd'hui :** `core/ecs/` (Entity, Component, System, World), `core/events/` (EventBus), `core/time/` (Clock, fixed-step accumulator).

### `src/rendering/` — couche Pixi pure

Tout ce qui touche au rendu graphique. Ne connaît rien du gameplay.

| Fichier                                                                       | Rôle                                                                                                                                                                                                              |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [src/rendering/Renderer.ts](../src/rendering/Renderer.ts)                     | Initialise une `Pixi.Application` v8 (résolution écran, devicePixelRatio, fond, antialias, preferWebGPU). Helper `describeRenderer()` retourne "WebGPU" ou "WebGL".                                               |
| [src/rendering/Camera.ts](../src/rendering/Camera.ts)                         | Wrapper `pixi-viewport`. Drag (left/middle), zoom molette clampé, gestion du resize. Une scène demande une caméra avec `createCamera(app, { worldWidth, worldHeight })`.                                          |
| [src/rendering/Layers.ts](../src/rendering/Layers.ts)                         | 4 conteneurs Pixi nommés : `ground` (sol), `entities` (persos), `fx` (particules), `ui` (HUD). Garantit un z-order propre. `mountWorld()` monte les 3 premiers dans la viewport, `mountUi()` met le HUD au stage. |
| [src/rendering/TileMap.ts](../src/rendering/TileMap.ts)                       | **M1 placeholder.** Dessine 32×32 losanges colorés via `Pixi.Graphics` (damier vert sombre). Sera remplacé par `@pixi/tilemap` + textures réelles en M3+.                                                         |
| [src/rendering/debug/DebugOverlay.ts](../src/rendering/debug/DebugOverlay.ts) | FPS instantané + moyenne 60 frames + nom du renderer. Fond semi-transparent. Reste au-dessus de la scène via `stage.sortableChildren + zIndex=1000`.                                                              |

### `src/scenes/` — orchestration des niveaux

Une scène = un "écran" du jeu (menu, forêt, donjon…). Chaque scène monte ce dont elle a besoin, nettoie en sortant.

| Fichier                                                                               | Rôle                                                                                                                                     |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| [src/scenes/Scene.ts](../src/scenes/Scene.ts)                                         | Interface commune : `name`, `enter(ctx)`, `exit(ctx)`, `update(dt, ctx)`.                                                                |
| [src/scenes/SceneManager.ts](../src/scenes/SceneManager.ts)                           | Gère la transition : appelle `exit()` sur l'ancienne et `enter()` sur la nouvelle. Tick la scène courante.                               |
| [src/scenes/BootScene.ts](../src/scenes/BootScene.ts)                                 | Scène d'amorçage. M1 : bascule immédiatement vers `ForestScene`. Plus tard : préchargera les assets via `AssetManager`.                  |
| [src/scenes/ForestOfSeles/ForestScene.ts](../src/scenes/ForestOfSeles/ForestScene.ts) | Zone MVP. M1 : crée le tilemap, la caméra, monte les layers, centre la vue. M2+ ajoutera Dart, M3 les arbres et collisions, M5 les mobs. |

### `src/Game.ts` — le chef d'orchestre

[src/Game.ts](../src/Game.ts) crée le renderer, instancie le `SceneManager`, attache la boucle de jeu (`app.ticker`), lance la `BootScene`. Définit le `GameContext` : `{ app, scenes }` passé à toutes les scènes pour qu'elles puissent interagir avec le moteur.

### `src/main.ts` — point d'entrée

[src/main.ts](../src/main.ts) : ultra-minimal. Récupère `<div id="app">`, instancie `Game`, l'attache. Tout le reste vit dans `Game`.

### Dossiers vides (préparés pour la suite)

| Dossier                           | Quand il se remplira                                                    |
| --------------------------------- | ----------------------------------------------------------------------- |
| [src/gameplay/](../src/gameplay/) | M2 : ECS components, systems, factories d'entités. **Prochaine étape.** |
| [src/data/](../src/data/)         | M4-M5 : stats mobs, items, équilibrage.                                 |
| [src/ui/](../src/ui/)             | M6 : HUD, mini-map, hotbar, ZoneTitle, ActionLog.                       |
| [src/services/](../src/services/) | M2 (AssetManager) → M7 (Audio, Save, I18n).                             |
| [src/store/](../src/store/)       | M2+ : zustand stores (player, world, ui).                               |
| [src/types/](../src/types/)       | Au besoin : types partagés.                                             |

### Tests

| Fichier                                             | Couverture                                                    |
| --------------------------------------------------- | ------------------------------------------------------------- |
| [tests/core/iso.test.ts](../tests/core/iso.test.ts) | 4 tests : projection iso (origine, round-trip, +1 gx, +1 gy). |

Politique : tests sur `core/` et `gameplay/systems/` (logique pure). Pas de test sur `rendering/` (visuel = manuel). Coverage non obligatoire au MVP, mais fonctions critiques (combat math, pathfinding queries, save migration) **doivent** avoir des tests.

---

## Flux runtime

```
1. index.html charge /src/main.ts
2. main.ts récupère #app, crée un Game, appelle game.start(container)
3. Game.start():
   ├─ createRenderer() → instancie Pixi App
   ├─ mount canvas dans le DOM
   ├─ active stage.sortableChildren (pour zIndex du debug)
   ├─ crée DebugOverlay, l'attache au ticker, l'ajoute au stage avec zIndex=1000
   ├─ ajoute le tick principal (appelle scenes.update à chaque frame)
   └─ switchTo(BootScene)
4. BootScene.enter() switch immédiatement vers ForestScene
5. ForestScene.enter():
   ├─ crée TileMap 32×32 (dessine 1024 losanges)
   ├─ calcule les bounds monde
   ├─ crée la caméra (pixi-viewport) avec ces bounds
   ├─ ajoute viewport au stage
   ├─ monte layers (ground/entities/fx dans viewport, ui dans stage)
   ├─ met le tilemap dans layers.ground
   └─ centre la caméra
6. À chaque frame du ticker:
   ├─ DebugOverlay met à jour le texte FPS
   └─ SceneManager appelle ForestScene.update() (vide en M1)
```

**Point clé pour la suite :** quand M2 ajoutera Dart, la scène n'aura rien de fondamentalement nouveau à faire — elle créera une entité player via une factory, l'ajoutera au monde ECS, et le `RenderSystem` synchronisera automatiquement la position du sprite Pixi avec le component `Position`. La forêt grossira en complexité mais l'architecture reste la même.

---

## Historique des jalons

### M0 — Setup ✅

**Fonctionnel :** projet vide qui démarre, lint/typecheck/build/tests passent, husky armé.
**Techniquement créé :** `package.json`, `tsconfig.json` strict, `vite.config.ts`, `eslint.config.js` (flat config v9), `.prettierrc.json`, `.husky/pre-commit` + lint-staged, arborescence dossiers complète, `index.html`, `src/main.ts` (canvas Pixi vert sombre), README.
**Stack figée :** PixiJS v8 + TypeScript strict + Vite + zustand + howler + easystarjs + i18next + @pixi/tilemap + pixi-viewport + vitest.

### M1 — Scène iso + caméra ✅

**Fonctionnel :** grille iso 32×32 visible, drag/zoom caméra, FPS overlay au top.
**Techniquement créé :**

- `core/math/Vec2.ts` + `iso.ts` (avec 4 tests vitest)
- `rendering/Renderer.ts` (init Pixi v8 wrapper)
- `rendering/Camera.ts` (pixi-viewport wrapper)
- `rendering/Layers.ts` (4 containers manager)
- `rendering/TileMap.ts` (placeholder Graphics 32×32)
- `rendering/debug/DebugOverlay.ts` (FPS + renderer label)
- `scenes/Scene.ts` (interface), `SceneManager.ts`, `BootScene.ts`, `ForestOfSeles/ForestScene.ts`
- `Game.ts` (orchestrateur), `main.ts` mis à jour
- ESLint : désactivé `no-redeclare` pour pattern TS interface+const (Vec2)
- `.gitignore` : ajouté `.vite/`

**Bug résolu :** FPS overlay passait sous le tilemap → corrigé via `stage.sortableChildren + zIndex=1000`.

### M2 — Player + clic-to-move ⏳

À faire : ECS core, factory Dart, AssetManager (placeholders procéduraux), InputController, easystarjs setup, PathfindingSystem, MovementSystem, RenderSystem, tri Z par `gx + gy`.
