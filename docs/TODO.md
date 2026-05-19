# TODO Implementation

> Liste des chantiers **code** identifiés au fil de la documentation.
> Alimentée chaque fois qu'une session de doc révèle un écart entre la spec canon TLoD et l'implémentation actuelle, ou un manque à combler.
> Ne duplique pas les jalons projet (`VISION.md` / `SCOPE.md` / `ROADMAP_MVP.md`) — pointe vers eux quand pertinent.

## Convention

- `[ ]` ouvert — `[x]` fait — `[~]` en cours
- Chaque item suit le format : **description** — Source: lien doc. Priorité: basse/moyenne/haute.
- Regroupé par feature (alignement avec `docs/features/`)

---

## Combat

### Damage formula

- [ ] **Brancher `Attack Multiplier` par-ability sur `computePhysicalDamage` (enemy branch)** — Canon Wulves : chaque enemy ability a une valeur cachée (e.g. Sword Slash = 1×, Burn Out = 1.5×). Mon code calcule `floor(AT² × 5 / DF)` sans multiplier. Data-model à définir : champ optionnel sur ce qui décrit une "ability" enemy (abstraction `EnemyAbility` à créer si absente). Source: [`features/combat/damage-formula.md`](features/combat/damage-formula.md). Priorité: **haute**.

- [ ] **Ajouter `computeEnemyMagicalDamage`** — Formule canon : `floor[MAT² × 5 / MDF] × Attack Multiplier`. Permet de typer correctement les sorts ennemis (Commander Burn Out, etc.). Source: damage-formula.md (résout la Q2 ouverte). Priorité: **haute**.

- [ ] **Modifiers inapplicables par-formule** — Aujourd'hui `applyModifiers` applique guard × 0.5 systématiquement si `Defending` présent. Canon Wulves : Archer Attack, Additions, Dragoon ★, Enemy Physical… ont chacune une liste de modifiers à ignorer. Signature à étendre : `applyModifiers(raw, m, excludes?: Set<ModifierKey>)`. Source: damage-formula.md table des inapplicables. Priorité: **moyenne** (impact UX faible tant que status/element pas wirés).

- [ ] **Dragoon Magic formula** — Porter `floor[floor{floor[(MAT × DRGNMAT% / 100)] × (LV+5) × 5 / MDF} × Multiplier / 100]` dans `SpellSystem` quand les sorts Dragoon sont implémentés. Multiplier per spell (table dans doc canon). Source: damage-formula.md. Priorité: à voir avec `dragoons/magic.md`.

- [ ] **Status damage formulas** — Confusion / Bewitchment (`floor(Attacker Max HP / 5)`), Poison DoT (`floor(Target Max HP / 10)`). Source: future `status-effects.md`. Priorité: à voir avec status-effects feature.

### Elements (système élémental)

- [x] **Vérifier ×2 Non-Elemental contre source tier 1** — ✅ **RÉSOLU 2026-05-18** : claim fandom **FAUX** confirmé par Discord (Icarus + DrewUniverse). Non-Elemental existe comme élément (couleur grise) mais N'A PAS d'effet ×2 vs tous. Psyche Bomb scale via BID, Divine Dragon attacks utilisent leurs éléments réguliers (Burning Wave=Fire, etc.). Voir [`features/combat/_sources/discord-tlod-clarifications.md`](features/combat/_sources/discord-tlod-clarifications.md).

- [x] **Vérifier "Non-Elemental does not resist itself"** — ✅ **RÉSOLU 2026-05-18** : wiki LoD 🥈 confirme explicitement "When same element, **excluding Non-Elemental**, ×0.5 multiplier". Donc Non-Elemental ne se résiste PAS à lui-même. Documenté dans [`features/combat/elements.md`](features/combat/elements.md).

- [x] **Vérifier ×1.5 vs ×2 opposing damage** — ✅ **RÉSOLU 2026-05-18** : wiki LoD 🥈 confirme **×1.5** (aligné Wulves 🥇). Fandom ×2 = simplification narrative définitivement écartée.

- [x] **Vérifier mécanique Element Dimensions / Special Battle Command** — ✅ **RÉSOLU 2026-05-18** : wiki LoD donne la mécanique complète. Seul effet = Field modifier (×1.5 si attack match field, ×0.5 si opposite), **bidirectionnel** (allies & enemies). Pas de mécanique "diminution dégâts reçus" séparée. Exception Divine Dragoon : ×1.5 uniquement sur Divine DG Cannon + Divine DG Ball.

- [ ] **Vérifier claim fandom : Dragoon Magic + Additions ×2 + auto-perfect en Special** — Wiki LoD est silent sur ce point spécifique. Si ce mécanisme existe en plus du Field modifier, il faut une source tier 1 pour le confirmer (Discord). Sinon : claim fandom à écarter. Priorité: basse.

- [ ] **Récupérer couleurs RGB exactes des 8 éléments** — Image `Element Colors.webp` du wiki LoD. Utile pour mapping UI Damia (name windows, particle effects, etc.). À screenshot/intégrer.

- [ ] **Vérifier mob elements** (Berserk Mouse, Goblin, Assassin Cock, Trent) contre wiki LoD 🥈 — actuellement basé sur fandom 🥉 listing.
- [ ] **Vérifier % Element Dimensions (Special Battle Command)** — Fandom dit ×2 Dragoon Magic + Additions ; user mentionne aussi "diminution dégâts reçus" (% inconnu). Confirmer ces chiffres via source tier 1. Source: elements.md §Element Dimensions.

- [ ] **Data-model `Element`** — Définir le type (enum 8 valeurs : fire, water, wind, earth, light, darkness, thunder, non-elemental) + table `OPPOSITES`. Probablement `src/data/elements.ts`. Source: [`features/combat/elements.md`](features/combat/elements.md). Priorité: **haute** (préréquis à plein d'autres choses).

- [ ] **Champ `element` côté entité** — Trancher : ajouter `Stats.element?` OU créer component `Elemental` dédié. Affecte les mobs (tagger Berserk Mouse=Dark, Goblin=Fire, etc.) ET les player characters (élément du Dragoon). Source: elements.md §Vision Damia. Priorité: **haute**.

- [ ] **Élément de l'attaque** — Logique pour déterminer l'élément d'une attaque selon source (arme équipée pour physical, sort pour magic, élément Dragoon pour form Dragoon). Source: elements.md. Priorité: moyenne.

- [ ] **Wirer modifier `Field` et `Element`** dans `damage.ts` `readModifiers` une fois data-model en place. Logique : Element = ×0.5 si match, ×1.5 si opposite (Wulves) — pas ×2 (fandom approximé). Cas spécial Non-Elemental = ×2 vs tous. Source: elements.md. Priorité: moyenne (après data-model).

- [ ] **Special Battle Command / Element Dimensions** — Décider : porter (comment en real-time ?) ou skip. Si porté : option Dragoon form = auto-Field correspondant ? Source: elements.md §Vision Damia, option B. Priorité: basse (mécanique narrative).

- [ ] **Tagging élémental des mobs Damia** — Berserk Mouse=Darkness, Goblin=Fire, Assassin Cock=Wind, Trent=Earth (canon). Fruegel=? (à décider). À ajouter dans `src/data/balance.ts` MOBS. Source: elements.md §Element des enemies. Priorité: à voir avec data-model.

### Additions (système chained attacks)

- [x] **Trancher QTE timing en real-time** — ✅ **TRANCHÉ 2026-05-18** : Option A retenue. Auto-complete des additions (état actuel du code Damia conservé). Source: [`features/combat/additions.md`](features/combat/additions.md) §Q1.

- [x] **Trancher Counterattacks** — ✅ **TRANCHÉ 2026-05-18** : Skip pour l'instant. Pas de mécanique de counter Addition implémentée en Damia. Source: additions.md §Q2.

- [x] **Wargod Calling / Ultimate Wargod accessoires** — ✅ **TRANCHÉ 2026-05-18** : Reframer en mécanique différente Damia (gardent le concept "accessoires liés aux additions" mais effets redessinés). Design exact à valider au moment de `items/equipment.md`. Source: additions.md §Q3.

- [ ] **💡 IDÉE FUTURE — Mécanique fun pour additions** (cohérente 2D iso action) — possiblement réservée Mode Survival (Modern ?). Pistes : timing key tap, combo direction, bonus damage scalant sur N inputs. Source: additions.md §Q1 (enrichissement). Priorité: basse (post-MVP).

- [ ] **💡 IDÉE FUTURE — Mécanique fun pour counterattacks** (risque/récompense pendant additions) — pistes : parry window, block press, mob interrupt, perk Modern Survival. Source: additions.md §Q2 (enrichissement). Priorité: basse (post-MVP).

- [ ] **Design Wargod accessories Damia** — Imaginer les effets exacts d'Ultimate Wargod + Wargod Calling reframés. À traiter dans `items/equipment.md` quand on attaque l'équipement. Source: additions.md §Q3.

- [x] **Lavitz vs Albert différenciation** — ✅ **TRANCHÉ 2026-05-18** : pas de différence gameplay/stats. Pattern `Archetype + Avatar` (cf. VISION §6.6). Story mode : héritage narratif Lavitz→Albert (Shana→Miranda). Survival mode : tous avatars du même archetype = skins (incl. Greham, Syuveil, etc.). Greham en Story reste boss avec skillset distinct. Source: [`features/combat/additions.md`](features/combat/additions.md) §Q4.

- [x] **Level applied after battle vs immediate** — ✅ **TRANCHÉ 2026-05-18** : Option A — Immediate (style Diablo 2). Pas de notion "fin de combat" en real-time. Source: additions.md §Q5.

- [x] **Performances tracked past level cap (Q6)** — ✅ **TRANCHÉ 2026-05-18** : respect canon — compteur de performances cappé à 99 (s'arrête à 99 même si on continue), level cappé à 5 dès 80 uses. Source: [`features/combat/additions.md`](features/combat/additions.md) §Q6.

### Additions — vérifications code (vs vision)

- [ ] **Vérifier cap performances à 99** dans le code Damia (cohérent canon)
- [ ] **Vérifier unlock progressif** des additions par character level (Story mode) dans le code
- [ ] **Vérifier Master Addition gating** : final unlock conditionné à la maîtrise des autres
- [ ] **Shana / Miranda** : pas d'addition, arc, SP scale DLV — état du code à vérifier (cf. VISION §6.2)
- [ ] **Lavitz → Albert inheritance** : état apprentissage additions + stats + XP transféré à la mort de Lavitz — vérifier code
- [ ] **Survival mode — additions persistence** : performances reset par run ou tracked across runs ? Design à acter

- [ ] **Voice clip mapping par avatar** : certaines additions ont une voice line distincte selon avatar (e.g. Lavitz "Rose Storm" vs Albert "Blossom Storm" pour Flower Storm). Prévoir le data-model voice par addition × avatar (pas seulement par addition kind). Source: [`features/combat/additions.md`](features/combat/additions.md), [`features/party-members/Albert.md`](features/party-members/Albert.md).

### Dragoons

- [ ] **Câbler DLV thresholds canon par archetype** dans data (SP lifetime cumulé). Jade Dragon confirmé : 0 / 1k / 6k / 12k / 20k. Autres archetypes : à ingérer page par page. Source: [`features/dragoons/README.md`](features/dragoons/README.md#dlv-thresholds--multipliers-canon-à-compléter-par-archetype).

- [ ] **Câbler stat multipliers per DLV par archetype** dans data (AT/DF/MAT/MDF en %). Jade Dragon confirmé : 150-170% AT, 200-250% DF, 200-220% MAT, 200-250% MDF. Cohérent avec VISION §6.2 et `effective*` helpers (déjà code via `archetype.dragoon.statsMultiplier`).

- [ ] **Lavitz → Albert inheritance state transfer** : à la mort de Lavitz, Albert hérite : additions levels + performances counter, stats character (AT/DF/MAT/MDF/HP), XP cumulé, DLV, MP. Mécanisme code à câbler au moment de l'event Albert join. Source: [`features/party-members/Albert.md`](features/party-members/Albert.md).

- [ ] **Pattern `Archetype + Avatar`** : confirmer état impl (Albert/Lavitz/Greham/Syuveil = avatars du Jade Dragon archetype). Cf. VISION §6.6.

### Damage modifiers (Power)

- [ ] **Power modifier per-entity (pas global)** — Rose Storm (Jade Dragoon spell DLV 2) active le Power Up modifier sur les party members. Implication : le Power modifier doit être un état per-entity (chaque allié a son own Power Up state), pas un flag global. Item Power Up et Rose Storm ne stack pas (même variable). Source: [`features/party-members/Albert.md`](features/party-members/Albert.md) §Rose Storm. À traiter quand on câblera `damage-modifiers.md`.

- [ ] **Rose Storm 3 turns → adaptation real-time** : canon = 3 turns. Damia real-time = timer (N secondes) ou X attaques reçues. À trancher au moment du status effects design.

### Combat — Stats constants

- [ ] **Stats constants par character** (Speed, A-Hit, M-Hit, A-AV, M-AV) — canon : ces stats ne montent pas avec le level, seulement via équipement. A-Hit/M-Hit = 100% baseline, A-AV/M-AV = 0% baseline. Speed varie par character (Albert = 40). Vérifier que le système Damia respecte ça (probablement OK via `effective*` + équipement).

### Locations / Story systèmes (préliminaires Bale)

- [ ] **Save point** entity + mécanique (interactable, persiste l'état save)
- [ ] **Hotel / Clinic** services (interactable Gold-payment → full restore HP+MP / cure status)
- [ ] **Shop UI** (Item Shop + Weapon Shop séparés)
- [ ] **NPC dialogues** scriptés (system dialog box + branching)
- [ ] **Goods** inventory category (key items non-consommables) — e.g. Portrait of Lavitz, Good Spirits
- [ ] **Stardust** collectible counter global + reward gating (Martel à 10 → Physical Ring ; voir si plus haut tiers à autres NPCs)
- [ ] **Treasure chest** entity + open/close state persistant par save
- [ ] **Boat / waterway** navigation (subzone mécanique)
- [ ] **Story flags** persistants : "before Hoax", "Hero Competition entered", "Good Spirits acquired", "Marsa Road closed", etc. → architecture flags world-state
- [ ] **Trame Story beat Bale** (post-Hellena → throne room → Sandora threat → Shana stays) — orchestrateur scènes / cutscenes (cf. `quests/disc1-bale.md` à créer)
- [ ] **33 submaps Bale** : décider consolidation (1 scène / quartier ?) vs reproduction stricte. Cf. [`features/locations/Bale.md`](features/locations/Bale.md) questions ouvertes.
- [ ] **Input puzzle Healing Breeze** (cross the beam) — porter ou skip ?

### Locations / Story systèmes (préliminaires Aglis)

- [ ] **Random encounter system** — déjà partiellement en code (`EncounterSystem`). Confirmer data-model : Encounter Rate per submap (17, 21, ...), Escape Rate (default 30%), pool de formations weighted (35/35/20/10%), formation IDs reusables across submaps. Source: [`features/locations/Aglis.md`](features/locations/Aglis.md) §Encounter system data.
- [ ] **Téléporteur** entity — warp-on-touch entre paires identifiées par ID. Mécanique Wingly cities (Aglis, Zenebatos probable). À factoriser comme component réutilisable.
- [ ] **Mirror room** (scripted cutscene) — utilisé à Aglis (701 Rose pré-visite, 577 présent). Possiblement d'autres locations canon.
- [ ] **Tests of courage UI** — branching dialog multi-character avec compteur "courage" cumulatif gating Psyche Bomb X. Mécanique narrative spécifique Aglis mais réutilisable pour autres quests.
- [ ] **Scripted boss encounter** (0% escape) — flag par formation : Last Kraken à Aglis. Cohérent canon boss fights.
- [ ] **Multi-element boss attacks** (Last Kraken : Thunder/Light/Water selon fandom) — confirmer tier 1 + data-model abilities multi-element par boss.

- [ ] **Cleone (boss?) à Aglis** — listé par fandom 🥉 mais absent du wiki LoD 🥈. HP 1360/1700, 0 EXP/Gold (= scripted ?). À vérifier tier 1 si c'est un boss réel, une phase de Last Kraken, ou un oubli wiki. Source: [`features/locations/Aglis.md`](features/locations/Aglis.md) §Cleone.

- [ ] **Magical Attack Barrier (ability)** — Aqua King d'Aglis = seul non-unique avec cette ability (fandom). Comprendre la mécanique exacte (immunité magie ? reflect ? counter ?) et documenter dans `combat/status-effects.md` (à créer). Source: Aglis.md §Particularités canon.

- [ ] **Mécaniques narratives Aglis** :
  - Sea-splits cutscene à l'entrée (Rouge → Aglis)
  - Sea-closes-behind (location lock-in jusqu'à boss kill)
  - Peace zones flag (créatures Savan présentes = no random encounters)
  - Savan sacrifice cutscene (climax)
  - Magical creatures dying post-Savan-death (activate Zenebatos teleport)
    → À orchestrer dans `quests/disc4-aglis.md` (à créer).

- [ ] **Lore central Disc 3-4** (à documenter dans `lore/` futur) :
  - **Moon Children** (Rose tue chacun pour empêcher la transformation en God of Destruction)
  - **Black Monster** (Rose elle-même, identité révélée Disc 4)
  - **Plan of the creator** (motif de Zieg)
  - **Moot** (Signet Sphere artificiel)
  - **Moon That Never Sets** (final dungeon, à sceller via Moot)
  - **Signet Spheres** (5 sceaux disséminés en Endiness, dont 1 à Aglis)

- [x] **Albert Dmg%/SP table wiki** — ✅ **RÉSOLU** : typo wiki, Albert = Lavitz (mêmes stats / additions / SP, archetype Jade Dragoon partagé). Utiliser table Lavitz comme référence. Source: additions.md §Q7.

- [ ] **Mob counter groups** — Si on implémente jamais les counters (cf. idée future), il faudra le data-model. Canon : ~140 enemies sortés en 10 groupes (1, 2, 3, 4, 9, 13, 16, 19, 23, 28). Damia mobs identifiés : Berserk Mouse=28, Goblin=28, Trent=28, Assassin Cock=19, Fruegel=28. Source: additions.md. Priorité: basse (dépend idée future Q2).

- [ ] **Per-addition counter-eligibility flag** — canon fandom liste explicitement les additions jamais counterables : toutes Kongol's, Madness Hero, Blazing Dynamo, 5-Ring Shattering, Omni-Sweep, Hammer Spin. Ajouter un flag `counterable: boolean` dans data balance par addition pour la cohérence canon. Source: [`features/combat/additions.md`](features/combat/additions.md). Priorité: basse (dépend idée future Q2 counters).

- [ ] **Wargod accessories pricing canon** — Wargod Calling = 1000G (Lohan/Fletz), Ultimate Wargod = 10000G (Lohan, ou rare drop Phantom Ship). Référencer dans `items/equipment.md` futur. Décision design Damia : garder même prix, ajuster pour Modern Survival ?

- [ ] **Master Tasman tutorial NPC** — Seles NPC qui explique Additions canon. Si on porte le tutorial : refaire avec adaptation Damia (auto-complete + skill cooldown). Source: additions.md §Tutorial canon. Priorité: à voir avec `locations/Seles.md` futur.

- [ ] **Voice clip + display name dual mapping** — Trois cas canon identifiés :
  - Lavitz "Rose Storm" voice vs Albert "Blossom Storm" voice (display = "Flower Storm")
  - Haschel "Flurry of Styx" voice vs display "Ferry of Styx"
  - JP version unifie "Cherry Blossom Blizzard" (桜の吹雪)
    → Data-model : `Addition.displayName` + `Addition.voiceLine[avatarId][localeId]`. Source: additions.md §Trivia voice + naming.

- [ ] **Kongol scripted counter** (boss fight) — canon : si player rate addition pendant Kongol boss (Hoax, Black Castle, final boss phase 1), Kongol exécute un counter scripté. À porter si on respecte ces boss fights. Source: additions.md §Trivia gameplay.

- [ ] **Dragoon Addition max inputs divergence** — Wulves dit 5 (Kongol 4), fandom dit 4 général. Hypothèse : "4 inputs après strike initial" = 5 presses totales. À vérifier tier 1 (Discord). Académique pour Damia (Q1 = auto-complete + Dragoon form = splash AoE différent du canon Dragoon Addition). Source: additions.md §Dragoon Additions.

### Party-members / Albert spécifique (de la fandom complement)

- [ ] **STR % vs Multiplier UI** — Clarifier : le STR % affiché in-game canon n'est pas le damage multiplier réel (clarif fandom). Décider en Damia : afficher STR % canon-style dans UI menu spell OU afficher directement le Multiplier ? Cohérence pour le joueur. Source: [`features/party-members/Albert.md`](features/party-members/Albert.md).

- [ ] **Eye color divergence Albert** — wiki LoD "golden eyes" / fandom "blue eyes". À vérifier tier 1 (screenshot in-game). Pour design sprite Damia.

- [ ] **Spear of Terror "Chance to cause Fear"** — équipement Albert canon avec proc status Fear. Cohérent avec Fear modifier (cf. damage formula). À documenter dans `items/equipment.md` futur + lier à `combat/status-effects.md` futur.

- [ ] **Twister Glaive** (Wind elemental) — arme Albert/Lavitz partagée. À câbler quand items + element data-model.

- [ ] **Story beats Albert canon par chapter** — Ch.1 Bale throne → Hellena rescue + Lavitz death + Spirit transfer (event canon clé). Ch.2 Emille romance arc + Lloyd nemesis. Ch.3 Tower of Flanvel Lloyd defeat. Ch.4 Aglis test of courage + Mayfil Lavitz spirit goodbye + Doel rematch alternate dimension + Epilogue Bale wedding. À orchestrer dans `quests/disc*-*.md` futurs.

- [ ] **Voice actor mapping** — Albert EN David Babich (also Melbu Frahma), JP Shinichirô Miki. Si on porte les voice lines, prévoir le mapping avatar × locale. Lien avec voice clip + display name dual mapping déjà tracé.

- [ ] **Family tree Serdio canon** — Carlo (père) - Doel (oncle, killer) - Albert (héritier crowned at 6). Royaume divisé : Basil (Albert) vs Sandora (Doel). Civil war 20 years pre-game. À documenter dans `lore/serdia.md` futur ou `quests/disc1-story.md`.

### Locations / Story systèmes (compléments Bale fandom)

- [ ] **7 status effects canon identifiés** (via items Bale : Mind/Body Purifier) — Fear, Confusion, Bewitchment, **Dispiriting**, Poison, Stun, **Arm-Blocking**. À documenter exhaustivement dans `combat/status-effects.md` (à créer). Étendre la slot DamageModifiers actuelle si besoin. Source: [`features/locations/Bale.md`](features/locations/Bale.md) §Shops + [`features/locations/_sources/fandom-bale.md`](features/locations/_sources/fandom-bale.md).

- [ ] **Equipment compatibility per-character** canon — items Bale révèlent contraintes :
  - Bastard Sword → Dart only
  - Sparkle Arrow → Shana only
  - Scale Armor → Dart or Lavitz
  - Leather Jacket → Shana or Rose
  - Sallet → Males only
    → Data-model `Equipment.equipsBy: CharacterFilter` à prévoir. À documenter `items/equipment.md` futur.

- [ ] **Charm Potion double-use mécanique** — item canon avec 2 usages distincts : **Menu** = reset encounter distance to 0 (réinitialise compteur encounter random) / **In Battle** = avoid enemy attacks for 3 turns. Data-model items avec contexte d'usage. Source: Bale.md §Item Shop.

- [ ] **Lavitz mother arc post-Serdian War** — long-term character development : mother lives with Prairie refugee family ; child calls her "grandmother" later → réconfort sur perte Lavitz. Story beat à scripter dans `quests/post-serdian-bale-return.md` (à créer). Source: Bale.md.

- [ ] **Lore Dragon Campaign canon (Noish folklore)** — Emperor Diaz + 7 Dragon incarnations + 11k years ago + Wingly slavery → human liberation war. Verbatim canon. À documenter dans `lore/dragon-campaign.md` (à créer). Source: Bale.md §Folklore Dragon Campaign.

- [ ] **Slambert (Lavitz's father)** — character lore : Slambert Plaza nommée d'après lui. À documenter avec Lavitz profile (`party-members/Lavitz.md` à créer). Source: Bale.md trivia.

- [ ] **Divergence prix Poison Guard** : wiki LoD 200G / fandom 300G. Vérifier tier 1. Source: Bale.md §Weapon Shop.

- [ ] **Good Spirits prix canon** : **100G** (fandom). Donc Dran path Bale = 100G ; lien avec Hotel master bar vendor. Cohérent avec items canon.

### À décider / explorer

- [ ] **Multi Items mashing UX en real-time** — Canon a `Multiplier%` obtenu via mashing pendant l'animation. Pas de QTE en RT chez nous. Décision probable : `Multiplier%` constant (100% ou 200% selon item) — ou wontfix. À trancher au moment du wiring.

- [ ] **Percentage attacks** — Haunting Bolt (`floor(Target Current HP / 2)`), Rare Monster Basic (`floor(Target Max HP / 10)`). Implémenter si pertinent dans scope canon complet (boss-spécifiques).

- [ ] **Unique formulas** — Drake's Wire (`floor(1000 / DF)`), Addition Counter (`floor{floor[AT² × 250 / DF] / 100}`), Feyrbrand Atk Power Up modifier, Rare Monster Mitigation (dégâts forcés à 1). Au fil des bosses, doc dans `bosses/`.

- [ ] **Critical hits pour Survival Modern** — Quand on traitera Survival Modern (cf. [SCOPE §7.2](SCOPE.md#72-mode-survival--fun-first)), décider : plug en 8ᵉ modifier dans wrapper ? Multiplicateur post-wrapper ? Probabilité × magnitude ? Hors-canon donc liberté de design.

---

## Tooling / infra

- [ ] **GitHub Actions deploy automatisé** — Vérifier `.github/` actuel et configurer un pipeline qui déploie chaque push sur une URL accessible. Permet à l'auteur de tester chaque push depuis mobile sans setup local (contrainte forte SCOPE §6). Priorité: à voir avec user (hors scope doc).

---

## Méta / docs

- [ ] **Archiver ou refondre `ROADMAP_MVP.md`** — Doc outdated (s'arrête à M8 alors que le chantier est largement au-delà). Reprendre en macro-roadmap post-MVP ou archiver. Source: [SCOPE §9.1](SCOPE.md#9-contradictions--zones-grises).

- [ ] **Compléter VISION.md §8 progressivement** — Sections "à venir" (critères de fini, exceptions fidélité TLoD, etc.) à remplir quand tranchées. La plupart sont déjà capturées dans SCOPE.md.

---

_Dernière mise à jour : 2026-05-18 — création initiale après ingestion doc Wulves damage formulas._
