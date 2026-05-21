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

### Party-members / Dart (protagoniste canon, base implémentation party)

- [ ] **Stats Lv 1-60 Dart canon** — table complète à reproduire dans `src/data/balance.ts` PARTY_MEMBERS. AT/DF/MAT/MDF convergent vers 150 à Lv 60, HP 30→7500. SPD 50 constant, A-Hit/M-Hit 100%, A-AV/M-AV 0%. Source: [`features/party-members/Dart.md`](features/party-members/Dart.md) §Stats canon.

- [ ] **7 additions Dart canon** : Double Slash / Volcano / Burning Rush / Crush Dance / **Madness Hero (204 SP highest)** / Moon Strike / **Blazing Dynamo (450% ultimate, unlock via 80× chaque addition précédente)**. Damage% Maxed + SP Maxed canon respectés. Source: Dart.md §Additions.

- [ ] **Blazing Dynamo unlock mechanic** — 80 uses de chacune des 6 additions précédentes (= 480 uses total). Data-model : `Addition.unlockRequirement: { type: "level"|"mastery", value: number | AdditionPerformanceMap }`. Cohérent canon. Source: Dart.md.

- [ ] **DLV thresholds canon partagés** — Dart : 1200/6000/12000/20000 SP DLV 1→5. **Identiques Albert** (Jade). Hypothèse : **shared canon entre tous Dragoons**. Si confirmé, simplification `DragoonSystem.SP_THRESHOLDS: [1200, 6000, 12000, 20000]` global. À confirmer Meru/Rose/Haschel/etc.

- [ ] **2 Dragoon Spirits canon Dart** — Red-Eye + Divine Dragon. Seul perso canon avec 2 DS. Mécanique data-model :
  - `Character.dragoonSpirits: { current: DSId, unlocked: DSId[] }` ?
  - Switching dynamique entre Red-Eye et Divine Dragon canon ou auto-override ?
  - Divine Dragon DS auto sets DLV 5 (power spike majeur)
  - Divine Dragon stats override : AT 340% (vs Red-Eye 170%), DF/MAT/MDF unchanged 250%/170%/250%
    → Damia (le code) doit gérer cette dualité avec **cohérence narrative + UI**. Priorité: **haute** (acquisition Disc 3-4 = endgame).

- [ ] **Bug canon Status menu Divine Dragon DS** — affiche stats Red-Eye au lieu de Divine Dragon. **NE PAS reproduire** en Damia (afficher bonnes stats). Source: Dart.md.

- [ ] **Spells Red Dragon DS canon (4)** : Flame Shot (200 mult, single, 10 MP, DLV 1) / Explosion (100 mult, all, 20 MP, DLV 2) / Final Burst (300 mult, single, 30 MP, DLV 3) / Red-Eye Dragon (300 mult, all, 80 MP, DLV 5). Notable : pas de spell DLV 4 (pattern canon).

- [ ] **Spells Divine Dragon DS canon (2)** : Divine DG Ball (400 mult, all, 50 MP, **Non-Elemental**) / Divine DG Cannon (600 mult, single, 50 MP, **Non-Elemental**). Multipliers les plus hauts du jeu. Cohérent avec **Divine Dragon boss** qui utilise les mêmes abilities pour attaquer Deningrad. Cross-ref `bosses/Divine Dragon.md` (à créer).

- [ ] **Multiplier vs STR% canon** — wiki LoD clarif : Multiplier = formula damage variable, STR% display = unreliable. Damia (le code) :
  - Stocker Multiplier en data
  - Choix UI : afficher STR % canon-style OU Multiplier directement ? À trancher (déjà flagged Albert.md).
    Source: Dart.md §Spells canon.

- [ ] **Animation states Dart canon** :
  - **Idle field** : cross arms + tap foot (signature)
  - **Dispirited (combat)** : arms to each side, sword hanging downward
  - **Red HP (combat)** : down on one knee, sword angled to ground behind
    → À reproduire en sprite/animation iso Damia. Identité visuelle.

- [ ] **Madness Hero 100% damage vs 250% Volcano/Crush Dance** — design canon trade-off : Madness Hero focus SP generation (204 SP) au détriment damage. Pattern "SP battery addition". À documenter `combat/additions.md`.

- [ ] **Cannot be removed flag Dart** — `PartyMemberDefinition.cannotBeRemoved: boolean`. Dart toujours en active party canon. UI : team picker grise Dart slot. Story circumstances peuvent override.

- [ ] **Voice Artist John Butterfield** — VA EN canon. Possible référence pour casting Damia (le code) si voice over fan-content. Hors-canon mais noter.

- [ ] **Beta Dart + beta sword model** — easter egg dev PSX (orange armor Hellena flee + différent hilt Divine Dragon transform). Ne pas reproduire. Possible mention `trivia/easter-eggs.md` (à créer).

- [ ] **PlayStation All-Stars Battle Royale DLC canceled** — Dart character planned (Mike Edwards 3D model fait). Trivia uniquement, pas d'impact code. Hors-canon mais cool.

- [ ] **Zieg Feld reveal Dart's father Disc 4** — orchestration narrative à documenter `quests/disc4-vellweb.md` (à créer). Implication gameplay : Zieg = Red-Eye Archetype avatar (skin ?) ou boss séparé ? À investiguer.

- [ ] **5-year backstory Dart pre-game** — quête vengeance parents, hors-screen. Possible flashback/cinematic Damia (le code) ? Hors-scope MVP probable.

### Party-members / Dart fandom complement — hometown Neet, lore, design

- [ ] **Hometown canon = Neet (pas Seles)** — révélation fandom + cohérent canon Disc 3 (Ute Library reveal). Né à Neet, parents Zieg + Claire Feld morts 18 ans pre-game lors de l'attaque Black Monster. Dart avait 5 ans. Réfugié à Seles ensuite. À refléter `locations/Neet.md` (à créer) + `quests/disc3-deningrad.md` (Ute reveal scene).

- [ ] **Parents Zieg Feld + Claire Feld canon** — Zieg = père (Red-Eye Dragoon ancien, possédé par Melbu Frahma Disc 4 reveal). Claire = mère, morte avec Zieg apparently à Neet. À documenter `lore/feld-family.md` (à créer) + `party-members/Zieg.md` (à créer).

- [ ] **Haschel = Dart's grandfather canon** — reveal disputed Disc 4 (Haschel told Dart he looks like Dart when young, Dart nods). Probable maternal (Claire's father). Implication gameplay : pas d'effet mécanique, mais lore cross-ref. À documenter `party-members/Haschel.md` (à créer).

- [ ] **DS found by child Dart in ashes of Neet** — fandom gallery caption canon. Cohérent avec correction user antérieure (Dart trouve DS à Neet, pas reçu de Rose). Cinematic à orchestrer Mode Story (flashback Disc 3 reveal).

- [ ] **DS combat unlock at Hoax (Chapter 1 middle)** — Dart possède le DS depuis Neet mais ne peut pas l'utiliser. À Hoax, Rose intervient pendant le fight Kongol → calls forth Red-Eyed Dragon spirit → Dart bursts → knocks out Kongol → combat use unlocked. À orchestrer `quests/disc1-hoax.md` (à créer).

- [ ] **Divine Dragoon DS acquisition timing canon** — Disc 4, **from Lloyd, after initial Melbu Frahma fight, BEFORE final battle**. Précision narrative importante. À documenter `quests/disc4-moon.md` (à créer).

- [ ] **3 transformations Red-Eye outside player control canon** — 3 cutscenes à orchestrer Mode Story :
  1. Hoax vs Kongol (first transform)
  2. Block elder Bardel Brother's magic
  3. Strike Zieg possédé Melbu Frahma (fails, overpowered)
     → Important pour identité narrative Dart. À orchestrer dans quests respectifs.

- [ ] **Red-Eye Dragoon form design = identique à Zieg** — fandom canon : Dart Red-Eye = identical à Zieg en Dragoon form. Important pour design visuel + cohérence narrative Disc 4 (Zieg reveal = "you look like me!"). Détails canon : red armor + green gem chest + blue-green pants + light red boots + green gem boots + dragon-motif headband + pale green/light red wings/blue-green outlines.

- [ ] **Divine Dragoon form design canon détaillé** : white armor + red/orange accents + olive green gem (Divine Dragon eye) + left arm = cannon + reddish-orange headband + **7 green gems** forehead + green optic eyepiece left eye + dragon-feet boots + **6 wings** glowing orange/white/gray outlines + dragon fang-like sword. À documenter pour design Damia (le code).

- [ ] **Personality canon Dart** — positive/idealistic outlook, loyalty + unwavering bravery, straightforward + practical, accepts feelings for Shana, respect companions, closure about past. Important pour writing/dialogue Damia (le code).

- [ ] **Manual quote canon** — "_He is a brave and loyal warrior swordsman sworn to avenge the death of his parents by destroying the Black Monster. Dart carries the soul of the Dragoon. His destiny will take him far beyond a simple quest for revenge._" — character intro UI Mode Story possible.

- [ ] **Voice Actor JP Seki Tomokazu** — VA JP canon (en plus de John Butterfield EN). Pour casting/dub Damia (le code).

- [ ] **Stats divergence Dart Lv 10 MAT/MDF** — fandom 14/10 vs wiki LoD 21/21. Wiki LoD prime. Probable typo fandom Lv 10. À noter dans `combat/canon-divergences.md` (à créer).

- [ ] **Cheat device test canon** — Dart avec les 2 DS simultanément → utilise seulement Divine Dragon DS. Implication data-model : Divine Dragon DS OVERRIDE Red-Eye DS quand les 2 sont possédés. `Character.activeDragoonSpirit = priority(divine_dragon) > red_eye`. Simplifie data-model (pas de switching dynamique). Source: Dart.md fandom trivia.

- [ ] **Weapons table Dart canon (8 swords)** — Broad Sword AT 2 → Soul Eater AT 75. Heat Blade (Fire elemental, Kazas/Kashua), Mind Crush (Confusion proc, 350G), Fairy Sword (+50% SP gain, 400G Ulara), Claymore (Moon endgame), Soul Eater (-10% HP/turn drawback). À documenter `items/weapons-dart.md` (à créer) + crosslink locations (Bale/Kazas/Fueno/Ulara/Moon).

- [ ] **Additions Lv 1-5 progression canon par addition** — table fandom détaillée. Pattern intentionnel canon : diversité de scaling (damage scaling only / SP scaling only / both / fixe). Data-model : `Addition.scaling: { damageByLevel: number[5], spByLevel: number[5] }` non-linéaire.

- [ ] **Madness Hero = pure SP battery canon** — 100% damage constant Lv 1→5 mais 60→204 SP. Pattern design : "pure battery addition". À documenter `combat/additions.md`.

- [ ] **2 idle poses canon Dart field** — pose 1: cross arms + tap foot, pose 2: hand on hip + tap foot. Animation alternation. À reproduire Damia (le code) sprites idle.

- [ ] **Defending pose canon** — sword horizontally in front of face. Animation state defending Dart. À reproduire.

- [ ] **Astro Bot cameo** — Dart apparaît dans Astro Bot (PS5 game). Hors-canon TLoD mais cool referential. Mention `trivia/easter-eggs.md` (à créer).

- [ ] **Bardel Brothers boss (elder + younger)** — Bardel elder magic blocked by Dart Red-Eye transform (canon trivia). Younger Bardel attaque Wink patrol Disc 3 (cf. Deningrad lore). 2 bosses Bardel canon à documenter `bosses/Bardel.md` (à créer).

- [ ] **Manual canon source** — "the manual" of TLoD = source character intros canon. Pour autres characters (Lavitz/Albert/Rose/Shana/etc.), ingérer manual quotes si trouvables.

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

### Bosses (Damia — namesake projet, Blue-Sea Dragoon Vellweb)

- [ ] **Boss fight Damia (Vellweb submap 499)** — namesake du projet, **traitement particulier**. Cinematic à soigner (motifs Water/Blue-Sea), audio signature, UI tribute possible. Source: [`features/bosses/Damia.md`](features/bosses/Damia.md). Priorité: **importance lore/identité projet**.

- [ ] **Pattern canon ancien-Dragoon Vellweb confirmé via Damia** — Damia (Water, 9k HP, mage profile) + Belzac (Earth, 16k HP, tank profile) confirment :
  - EXP 6,000 + Gold 300 + drop 100% Spirit Stone
  - Status immunity totale (8/8)
  - Counter group 28
  - Scripted encounter 0% escape
  - **Patterned Retaliate** cycle 3 abilities (party AoE magic → D-attack → ultimate single-target magic)
  - AT=MAT 116 équilibré (Damia) OU asymétrique (Belzac)
  - "Dragon-named" ability = ultimate boss-special (Golden Dragon 3× / Blue-sea Dragon 4×)
    → **Template canon Vellweb-ancient-Dragoon** réutilisable pour Syuveil + Kanzas data-model. Source: Damia.md §Stats canon + abilities.

- [ ] **Blue Sea Stone item** (drop 100% Damia) — Probable Dragoon Spirit Stone Meru-related. Pattern : Belzac→Golden Stone (Kongol), Damia→Blue Sea Stone (Meru), Syuveil→Jade Stone (Lavitz/Albert ?), Kanzas→Violet Stone (?). À documenter `items/spirit-stones.md` (à créer). Lien narratif Dragoon Spirit inheritance.

- [ ] **Damia abilities canon** : Freezing Ring (single 2× Water), Diamond Dust (party 2× Water, retaliate-only), Blue-sea Dragon (single 4× Water, retaliate-only). Pattern Wulves Attack Multiplier appliqué. À implémenter `EnemyAbility` data-model + element propagation.

- [ ] **Damia DLV magic Meru ?** — Si Damia avait des sorts Dragoon canon, ce sont peut-être les sorts Meru DLV1-5 (Rainbow Breath, Diamond Dust, etc.). À investiguer pour cohérence "boss utilise les sorts de son archetype" (pattern Belzac → Grand Stream/Meteor Strike/Golden Dragon = Kongol's spells DLV1-5).

- [ ] **Profile mage Damia vs Profile tank Belzac** — design intentionnel diversifier les 4 boss Vellweb (Water mage, Earth tank, Wind ?, Thunder ?). Suggère **Syuveil = balanced fighter** (Wind/Lavitz), **Kanzas = berserker** (Thunder self-destruct canon). À confirmer pages futures.

- [ ] **Genre / identité Damia personnage** — Nom grec féminin probable. Confirme tier 1 + fandom. Si confirmée femme = **1ère ancienne Dragoon féminine à Vellweb** (vs Shirley qui a son propre Shrine). Pourrait orienter design visuel cohérent feminine warrior Water/Blue. Importance projet (namesake).

- [ ] **Damia backstory lore** — nation d'origine, lien Emperor Diaz, circonstances de la mort pendant Dragon Campaign. Pattern Belzac (royal Gloriano, mort vs Virage protégeant Shirley) → Damia probable rôle similaire à découvrir. À ingérer fandom.

### Bosses (Damia fandom — identity reveal half-Mermaid 15 ans + scène Vellweb émotionnelle)

- [ ] **Identity canon Damia consignée** : female, half Human / half Mermaid, 15 ans, 147cm, personally trained by Emperor Diaz, first to die canon. À refléter dans design visuel + cinematic. Source: [`features/bosses/Damia.md`](features/bosses/Damia.md) §Profil identity.

- [ ] **Race Mermaid lore canon** — confirmation race **Mermaid** dans TLoD via Damia heritage. Lien possible Tiberoa / Lenus / Undersea Cavern Disc 2 (à investiguer). À documenter `lore/races.md` (à créer) — Wingly / Giganto / Human / Mermaid / autres. Damia = **seul personnage canon mixed-racial** confirmé.

- [ ] **Scène Vellweb Rose-Damia émotionnelle** — pré-fight + post-defeat cinematic. Beats canon :
  1. Découverte Damia dans sa tower
  2. Reveal identity mi-mermaid
  3. Damia pleads "don't leave me alone"
  4. Rose quote "There is nobody who bullies you like in the past anymore. We won't let them."
  5. Rose regret forcing battle
  6. Boss fight
  7. Post-defeat : Rose "we will meet again", Damia senses friends presence
  8. Soul freed → Mayfil
  9. Rose promet "to join her someday" (foreshadowing fin Rose canon)
     → Plus émotionnelle des 4 boss Vellweb. À orchestrer carefully (priorité haute namesake).

- [ ] **Foreshadowing Rose end** — promesse "to join her someday" à Damia = direct setup fin Rose Disc 4 (sacrifice/suicide canon ?). À investiguer + documenter `party-members/Rose.md` + `lore/rose-arc.md` (à créer).

- [ ] **Dragoon Addition = same as Meru's** (canon confirmation Archetype mécanique) — Confirme [VISION §6.6](VISION.md) pattern Archetype + Avatar. Blue-Sea Dragon Archetype = Damia + Meru (Story canon) + skins Survival à imaginer. À refléter `party-members/Meru.md` + data-model Archetype.

- [ ] **Sorts Damia canon = Meru DLV 1-3 (sans Rainbow Breath)** — Freezing Ring, Diamond Dust, Blue-Sea Dragon. Damia n'utilise pas Rainbow Breath (DLV 4-5 Meru). Implications data-model :
  - Soit `DragoonAvatar.spellsUnlocked: SpellId[]` (Damia subset Meru)
  - Soit `DragoonAvatar.maxDLV: number` (Damia max DLV 3, Meru max DLV 5)
  - Soit Rainbow Breath = innovation Meru not in original Damia kit
    → À trancher avec design Dragoons. Source: Damia.md §Lien Meru.

- [ ] **Damia tower architecture Vellweb** — Vellweb = 1 tower par ancien Dragoon mort ? 4 towers (Belzac+Damia+Syuveil+Kanzas) ? À confirmer via ingestion `locations/Vellweb.md`. Pattern visual cohérent : chaque tower = identity de son ancien Dragoon (Damia = water/blue/mermaid motifs).

- [ ] **Stats divergence US/EU vs JP Damia** — wiki LoD 9k HP vs fandom 9.5k US/EU vs fandom 14k JP. Pattern récurrent (Belzac aussi). Cible Damia (le code) probable US/EU. À trancher.

- [ ] **Damia absente flashback Rose Disc 2** — canonical "doesn't appear in Rose's flashback of the final clash". Coherent avec "first to die" Guidebook. Mort très précoce Dragon Campaign. Implication narrative : Damia = première loss Rose, plus traumatique, raison du bond émotionnel fort. À refléter dans `lore/dragon-campaign.md`.

- [ ] **Concept art canon Damia** (fandom gallery) — référence visuelle externe. Ne pas héberger (droits). Pointer dans `features/bosses/Damia.md` pour artistic direction Damia (le code).

### Bosses (premier boss documenté — Belzac)

- [ ] **Statut "Petrify" identifié** — 8ᵉ statut canon (extension de 7 vu via Bale items). Liste finale 8 statuts : Fear, Confusion, Bewitchment, Dispiriting, Poison, Stun, Arm-Blocking, **Petrify**. À documenter dans `combat/status-effects.md`. Source: [`features/bosses/Belzac.md`](features/bosses/Belzac.md).

- [ ] **Boss Status Immunity data-model** — Bosses canon = immunisés à **tous** les statuts (8/8). Data-model : `BossDefinition.statusImmunity: Record<Status, boolean>` ou bitmask. Pattern : default immunity = true pour bosses (overridable). Source: Belzac.md §Status Immunity.

- [ ] **Attack Multiplier per ability CONFIRMÉ** via Belzac canon. Valeurs : D-attack=1.0, Grand Stream=1.5, Meteor Strike=2.0, Golden Dragon=3.0. Item TODO existant (cf. damage-formula §Attack Multiplier) maintenant validé avec exemple concret. Data-model : `EnemyAbility.attackMultiplier: number`. Priorité: **haute** (déjà flagged).

- [ ] **Boss AI : Patterned Retaliate trait** — cycle d'abilities en réponse aux attaques (e.g. Belzac : Meteor Strike → D-attack → Golden Dragon → repeat). Ignore turn order canon = en RT Damia : interrupt animation actuelle, execute retaliate immediately. Data-model :

  ```ts
  RetaliateTrait {
    triggerChance: number,         // % par hit subi
    cycle: AbilityId[],
    cycleIndex: number,             // état interne, persiste pendant combat
    ignoresTurnOrder: boolean,
  }
  ```

  Source: Belzac.md §Trait passive. Priorité: à voir avec design boss AI.

- [ ] **Retaliate-only abilities** — flag canon sur certaines abilities (Meteor Strike, Golden Dragon dans Belzac). Ces abilities ne peuvent être trigger que par Retaliate, jamais en attaque "normale" du boss. Data-model : `EnemyAbility.retaliateOnly: boolean`. Source: Belzac.md.

- [ ] **Scripted encounters 0% escape** — flag boss canon. Data-model : `BossFormation.escapeRate = 0`. Already noted in Aglis (Last Kraken). Confirmed Belzac. Pattern stable.

- [ ] **Boss drop 100%** — pattern canon : bosses drop guaranteed items (Belzac → Golden Stone, Last Kraken → Pretty Hammer). Data-model : `BossYield.guaranteedDrop: ItemId`. Distinct du % drop des minor mobs.

- [ ] **Lore canon 7 anciens Dragoons** (Dragon Campaign) — Vellweb mausolée. Liste partielle :
  - Belzac (Gold/Earth) → Kongol héritier
  - Damia (Blue-Sea/Water) → Meru héritière
  - Syuveil (Jade/Wind) → Lavitz héritier
  - Atlow (?) — élément à déterminer
  - Kanzas (?) — élément à déterminer
  - - 2 autres à identifier (probable : Red-Eye, Dark, White-Silver, Violet predecessors)
      → 7 Dragoons originaux servant Emperor Diaz. À documenter dans `lore/dragon-campaign.md` (à créer). Cross-ref [`bosses/README.md`](features/bosses/README.md).

- [ ] **Lien Boss-to-PartyMember Dragoon Spirit inheritance** — pattern canonical :
  - Belzac → Kongol (Gold)
  - Damia → Meru (Blue-Sea)
  - Syuveil → Lavitz → Albert (Jade)
  - Shirley → Shana → Miranda (White-Silver, lore Shrine of Shirley)
    → Chaque ancien Dragoon = lore character + boss fight Vellweb. À documenter via bosses/_ + party-members/_ + lore/.

- [ ] **Belzac specific** : Golden Stone item drop — effet ? Lien Dragoon Spirit Kongol ? À investiguer + documenter dans `items/` futur.

- [ ] **Divergence stats Belzac wiki LoD vs fandom** — HP 16k/18k/25k(JP), AT 178/200, MAT 71/80, SPD 50/70. Vérifier tier 1 (Discord) pour valeurs canon US/EU vs JP. Source: [`features/bosses/Belzac.md`](features/bosses/Belzac.md) §Stats.

- [ ] **Lore Gloriano nation** — Belzac de la royal family de Gloriano (per Official Guidebook). Nouvelle nation à documenter dans `lore/` futur. Possible lien avec Mille Seseau ou autres nations canon. Source: Belzac.md fandom trivia.

- [ ] **Soul mechanic Mayfil** — Dragoons morts canon : souls à Vellweb, libérées par party Disc 4 → goes to **Mayfil** (city of dead). Confirmé Belzac. Pattern : Mayfil = destination finale souls Dragoons. Cohérent avec Lavitz spirit at Mayfil (déjà documenté Albert.md). Mécanique narrative à orchestrer.

- [ ] **Contradiction canon Belzac death** — Virage standard (cutscene Disc 2) vs Super Virage (Forbidden Land + Belzac quote). Pour Damia : choisir une version cohérente. Recommandation : Virage standard (suit la cutscene visible). Source: Belzac.md.

- [ ] **Repartition 7 anciens Dragoons → 4 morts Vellweb + 3 autres** — Précision fandom Belzac : "souls of the four Dragoons that died in the Dragon Campaign". Liste : Belzac(Gold/Earth), Damia(Blue-Sea/Water), Syuveil(Jade/Wind), Kanzas(?). Shirley morte mais Spirit à Shrine of Shirley. Zieg + Rose survivants. **Atlow** (listé wiki LoD Vellweb boss) = existence à reconfirmer — peut-être pas un ancien Dragoon mais autre boss à Vellweb.

### Locations + Story systèmes (Kazas/Black Castle)

- [ ] **White Flame checkpoint mechanic** — Free full restore (HP+MP+Status) **+ respawns all enemies**. Mécanique trade-off canon unique à Kazas Black Castle. Très intéressant pour Damia : potential design pattern réutilisable comme "risky checkpoint" / "altar of respawn" en Mode Story et/ou Survival. Source: [`features/locations/Kazas.md`](features/locations/Kazas.md). Priorité: moyenne (excellent gameplay primitive).

- [ ] **Encounter type "Contact"** — Mobs visibles, walk-into = engage combat (vs Random Encounter step-based). Canon majeur. Cohérent natif avec Damia real-time iso. Damia probablement utilise déjà ce pattern par défaut. À confirmer en code. Source: Kazas.md §Combat.

- [ ] **Secret Weapon Shop** unlock mechanic — accessible via dialogue NPC (Clinic operator parle de l'existence). Pattern "hidden shop discovery". Data-model : shop locked + unlock flag via dialogue. Source: Kazas.md §Services.

- [ ] **Story flag : "Doel defeated" → Item Shop Black Castle inaccessible** — exemple concret pattern shop accessibility gated par story flag. Data-model `Shop.accessibilityCondition: StoryFlagPredicate`. Source: Kazas.md.

- [ ] **Boss multi-forme (Doel humain → Dragoon Doel)** — formation canon "Emperor Doel, Dragoon Doel" = même fight, 2 phases. Data-model :
  - Option A : 2 entités sequential (kill first → spawn second avec same fight context)
  - Option B : 1 entity avec phase transition (stats + sprite swap + new abilities)
    → Probable Option B (continue HP bar visuel, transformation in-place). Cf. également Kongol final boss (mentionned Kongol scripted counter à 3 fights).

- [ ] **Reward post-boss (event drop) vs loot drop** — Distinction canon :
  - **Loot drop** (Kongol Wargod Calling 30%) = standard probabilistic drop
  - **Story reward** (Violet Dragon DS post-Doel) = scripted event, not a "drop" — narrative item handed at story progression
    → Data-model dual : `BossYield.drops[]` (RNG) + `BossYield.storyReward: ItemId | DragoonSpirit` (scripted).

- [ ] **3 Goods Stones (Red/Blue/Yellow)** + Magic Oil — usage canon ? Quest items isolés ? Ingrédients craft ? Collector ? À investiguer ; impacte items/ data-model.

- [ ] **Fake Power Wrist / Fake Shield** (Secret Shop) — scam items canon ? Effect null/réduit ? Quest item lore (Sandora charlatan theme) ? À documenter dans `items/equipment.md` futur.

- [ ] **Empress Karina lore** — Doel's wife ? Disparue ? Statue 4th floor Black Castle. À documenter dans `lore/serdia.md` (à créer).

- [ ] **Lloyd cutscene pré-visite** (submap 696 — "Lloyd and Doel discussing Hellena falling") — story beat dialogue à scénariser. Important Lloyd arc reveal. À orchestrer dans `quests/disc1-kazas-climax.md` (à créer).

- [ ] **Doel → Violet Spirit → Haschel transfer** mechanism — Spirit transfer canon (similar Lavitz → Albert) mais Haschel join party avant ou après Doel fight ? Order canon à confirmer via Haschel ingestion. Cf. [`party-members/`](features/party-members/) Haschel à créer.

- [ ] **Wargod Calling early access** (Kongol drop 30% à Kazas Disc 1) — 1st canon source pour le joueur, vs achat 1000G à Lohan plus tard. Implication design : équilibrage progression items.

- [ ] **Charlatan salesman quest** (Mysterious Adventurer fake Feyrbrand slayer + fake dragon-weakening feather) — side content narratif optionnel. À porter ?

- [ ] **Griping rooms** — pièces "soundproof" Sandora canon (oppressive régime atmosphere). Side content atmospheric.

- [ ] **Popo questions / New Serdio Party hideout** — checkpoint narratif Disc 1 ; unlocks save point + secret entrée Black Castle. À scénariser. **Réponses canon (fandom)** : 1. "I cannot say which" / 2. "Take care at home" / 3. "To protect something". Questions exactes à confirmer (canon TBD via ingestion source primaire ou playthrough vidéo).

- [ ] **Popo lore** — orphelin de guerre (cherche ses parents post-Serdian War). Side narrative possible. Source: [`features/locations/Kazas.md`](features/locations/Kazas.md) fandom §Story.

- [ ] **Sandora troops non-recognition** mécanique — canon : les troops à Kazas ne reconnaissent pas le party comme ennemi. Implication : pas de combat in-city auto même en territoire ennemi. Distinction "patrol" vs "engage" à modéliser. Source: Kazas.md.

- [ ] **Heat Blade prix divergence** : wiki LoD 150G / fandom 75G. À confirmer tier 1.

- [ ] **Armet helmet boost MAT** — équipement helm Males qui ajoute **+23 MAT** (fandom). Pattern inhabituel (helmet = magic attack boost). À documenter dans `items/equipment.md` futur.

- [ ] **Long Bow Shana** — 18 AT + Attack-Hit +10%. Premier équipement Shana documenté avec stats détaillées (fandom). À ajouter dans `items/equipment.md` futur.

- [ ] **Armet/Iron Kneepiece "Males" filter** — restriction équipement par genre canon (Males-only items). Cohérent avec restriction "Males" déjà notée à Bale (Sallet). Data-model `Equipment.equipsBy: 'males' | 'females' | character[]`.

- [ ] **Aesthetic canon Kazas** : Gothic Black Castle + industrial uniform buildings + power grids électriques (rooftop electrical lines) + slums scrap wood makeshift housing. Référence visuelle forte pour design Damia mode Story. À capturer dans references visuelles (assets/screens TLoD).

### Locations + Story systèmes (Deningrad)

- [ ] **Location state machine (pré/post-story-event)** — Deningrad change drastiquement post-Divine Dragon attack : save point migre, clinic migre, chests désactivés, nouveaux stardust accessibles. Pattern réutilisable pour autres lieux story-flagged. Data-model : `Location.states: Map<StoryFlag, LocationConfig>` ou similaire. Source: [`features/locations/Deningrad.md`](features/locations/Deningrad.md) §State machine. Priorité: moyenne (pattern transverse).

- [ ] **Story-gated stardust** (post-Kadessa return) — Stardust 41-45 Deningrad. Pattern : stardust gated par flag autre que location-clear (story progression elsewhere). Data-model `Stardust.accessibilityCondition: StoryFlagPredicate`.

- [ ] **Inaccessible chests post-event** (Crystal Palace chests Holy Ahnk + Angel's Prayer) — Same pattern que Bale Portrait of Lavitz (perdu après Hero Competition). Cf. existant. Data-model : `Chest.accessibilityWindow: { available: StoryFlag, until?: StoryFlag }`.

- [ ] **Depetrifier consumable** (anti-Petrify) — 1er item canon anti-Petrify documenté. Cohérent avec 8 statuts canon. À documenter dans `items/consumables.md` futur.

- [ ] **Destone Amulet accessory** (anti-Petrify equipment) — 1er accessoire anti-Petrify. Cohérent pattern anti-status accessories (Poison Guard/Panic Guard/Stun Guard/Bravery Amulet déjà à Bale). À documenter dans `items/equipment.md` futur + `combat/status-effects.md`.

- [ ] **Anti-status accessory series canon (8 statuts → 8 accessories ?)** — Patterns identifiés :
  - Bravery Amulet (anti-Fear) — Bale/Deningrad
  - Poison Guard (anti-Poison) — Bale
  - Panic Guard (anti-Confusion) — Bale
  - Stun Guard (anti-Stun) — Bale
  - **Destone Amulet (anti-Petrify) — Deningrad**
  - **Anti-Bewitchment** : à trouver
  - **Anti-Arm-Blocking** : à trouver
  - **Anti-Dispiriting** : à trouver
    → 3 anti-status accessories restants à découvrir (probablement Lohan/Fletz/Furni late-game shops).

- [ ] **Armor of Legend** (10,000G, Deningrad) — endgame top-tier armor canon. Stats / effet exact ? À documenter `items/equipment.md`. Probablement comparable Ultimate Wargod 10,000G Lohan (autre 10kG item canon).

- [ ] **Holy Ahnk item** (Crystal Palace chest) — usage canon ? Key item story ? Healing ? À investiguer.

- [ ] **Spear of Terror confirmation** — Albert weapon avec Fear proc. Confirmé present at Deningrad 300G (cohérent Albert.md weapons list).

- [ ] **Lloyd kidnap Theresa cutscene** (Deningrad submap 376) — story beat majeur Disc 3. À orchestrer `quests/disc3-deningrad-attack.md` (à créer).

- [ ] **Divine Dragon attaque Deningrad event** — non un boss fight but un story event qui dévaste la ville. Cutscene + state transition. À orchestrer.

- [ ] **Shana wakes up Hotel cutscene** (submap 389) — story beat post-attack. Lien Shana arc + Moon Child reveal Disc 3 ?

- [ ] **National Library** + Bishop Dille + Librarian Ute (Deningrad) — Albert nerdy moment + lore Dragon book contradiction. À orchestrer dans `quests/disc3-deningrad.md`.

- [ ] **Crystal Palace ceremonial "sealing room"** — probable Mille Seseau **Signet Sphere** room ? Lien avec patterns Aglis/Mayfil Signet Spheres. À documenter dans `lore/signet-spheres.md` futur.

- [ ] **Inflation prix Hotel par disc** : 10G (Bale Disc 1) → 20G (Kazas Disc 1) → 50G (Deningrad Disc 3). Pattern balance economy / progression. À documenter dans `combat/balance.md` futur ou similaire.

### Locations + Story / Lore (Deningrad fandom — Chapter 3 beats + Chapter 4 reveal)

- [ ] **3 visites Deningrad orchestration** (Visit 1.1 / 1.2 / 2 / 3) — Cohérent pattern multi-visit avec state machine par visite. Décomposer en scènes Damia : Library FMV → Hotel awakens → Crystal Palace DS transfer → départ Forest of Winglies → retour ville détruite → Hotel rest → Kashua Glacier. Source: [`features/locations/Deningrad.md`](features/locations/Deningrad.md) §Story.

- [ ] **DS transfer Shana → Miranda** (Crystal Palace sealing room, Visit 1.2) — Cutscene + mécanique data-model : DragoonSpirit ownership transfer. Pattern réutilisable (Zieg→Dart à Neet, Shirley spirit independent). Affecte `party-members/Miranda.md` (DLV reset à 1 ? carry-over ?), `party-members/Shana.md` (perd power → arc Moon Child Disc 4).

- [ ] **Sacred Sisters hierarchy canon (4 confirmées)** — Miranda (1st) + Luanna (2nd) + Wink (3rd) + Setie (4th). À documenter `lore/sacred-sisters.md` (à créer). Vérifier cardinalité finale (12 ? autre ?). NPCs avec rôles narratifs spécifiques :
  - Miranda → Dragoon party member
  - Luanna → survivante Neet, démasque Lloyd
  - Wink → patrol leader, sauvée par Lloyd vs Younger Bardel
  - Setie → escortée par Rose depuis Neet

- [ ] **Cutscene 8 — History of the Dragoon Campaign** (FMV canon, Ute narration Library) — Foundational lore TLoD (7 Dragoons, Melbu Frahma, Gloriano, Human Age, Moon That Never Sets). À reproduire en cinematic Damia ou récit textuel scrollable. Source: `_sources/fandom-deningrad.md` Ute quote verbatim.

- [ ] **Folklore Black Monster / Moon Child / 108 ans** (Ute attic, Visit 1.1) — Foundational lore Disc 3 → reveal Disc 4 (Rose = Black Monster, Shana = Moon Child). Cycle 108 ans Moon That Never Sets glows red. Récit narratif à présenter via Ute scene. `lore/black-monster-moon-child.md` (à créer).

- [ ] **Soa créateur + Divine Tree** lore (Bishop Dille, Church Visit 1.1) — Foundational créationiste TLoD. `lore/soa-divine-tree.md` (à créer).

- [ ] **Signet Spheres lore unifié** (Chapter 4 Charle Frahma reveal Ulara) — Confirmé : Crystal Palace sealing room = **Signet Sphere binding the Moon That Never Sets**. Divine Dragon a détruit le Signet → bright light ascend vers Moon → release magical power. Pattern probable avec autre Signet Spheres (Aglis ? Vellweb ?). `lore/signet-spheres.md` (à créer) cross-ref avec `Aglis.md`.

- [ ] **Dragon Block Staff** — Wingly weapon anti-Dragon power, quest Forest of Winglies. Item story ou usable combat ? Cohérent pattern Wingly tech (Dragon Buster, etc.). À documenter `items/key-items.md` (à créer).

- [ ] **Moon Mirror** — Mille Seseau national treasure, sealed Tower of Flanvel, Theresa = key du seal. Probable **Divine Moon Object** canon (Disc 3 plot : Lloyd collecte Divine Moon Objects). À documenter `lore/moon-objects.md` (à créer).

- [ ] **Lloyd Younger Bardel encounter** — Wink patrol attaquée par Younger Bardel (Wingly vengeful), Lloyd sauve Wink → trust ploy → kidnap Theresa. À documenter `bosses/Younger Bardel.md` (à créer) si boss canon, ou narrative-only.

- [ ] **Shana abducted to Vellweb by Emperor Diaz** — final beat Chapter 3 (Wink reveal post-Tower of Flanvel). Start Vellweb arc + introduction Emperor Diaz antagoniste. `lore/emperor-diaz.md` (à créer).

- [ ] **Shana bright light during Divine Dragon attack** — Moon Child power foreshadowing Disc 4. Protège Theresa + Sacred Sisters miraculously. Mécanique narrative à orchestrer (cinematic ou story flag).

- [ ] **Divine Dragon Ball + Divine Dragon Cannon** abilities — utilisées pendant attack Deningrad (Visit 2). Ball = AoE city, Cannon = single target Crystal Palace. À documenter `bosses/Divine Dragon.md` (à créer).

- [ ] **Arbitrer divergences canon Deningrad** (wiki LoD vs fandom) :
  - Item shop : "Healing Fog 30G" (wiki LoD 🥈) vs "Healing Potion 30G" (fandom 🥉) → wiki LoD prime probable
  - Stardust gating : "post-Kadessa return + 2/5 pré-attack" (wiki LoD) vs "all 5 post-attack" (fandom) → tier 1 nécessaire
  - Holy Ahnk (wiki) vs Holy Ankh (fandom) → orthographe tier 1
    → consigner choix canon dans `combat/canon-divergences.md` (à créer).

### Locations + Story / Lore (Death Frontier Disc 4 desert ex-Gloriano)

- [ ] **Mécanique sinkholes / sand falls** — pattern unique Death Frontier : tomber dans sinkhole → tunnel souterrain (autre submap). ~14 sinkholes canon, certains chests sinkhole-gated. Data-model : `Interactable.type = "sinkhole"`, `Interactable.destination: SubmapId`. Pattern réutilisable Damia (e.g. autres caves canon). Source: [`features/locations/Death Frontier.md`](features/locations/Death Frontier.md).

- [ ] **Lore Gloriano canon — désertification** — Death Frontier = formerly part of Gloriano (nation de Belzac). Lien direct **Cutscene 8 Ute Library** (Saint Imperial Gloriano scorched by gods' fire). Death Frontier = **memorial désertifié** de la Dragon Campaign. Foundational lore. À documenter `lore/gloriano.md` (à créer) + `lore/dragon-campaign.md` cross-ref.

- [ ] **Scène canon "Miranda slaps Rose"** (submap 764 oasis) — cutscene majeure Disc 4. Motivation à investiguer fandom : Rose = Black Monster reveal confrontation ? Tensions party ? À orchestrer `quests/disc4-death-frontier.md` (à créer).

- [ ] **Scène "Dart refuses path back"** (submap 745) — moment d'engagement narratif Disc 4. Trigger dialogue/cinematic à orchestrer.

- [ ] **3 caves post-exit Death Frontier** (submaps 788-790) — préface Ulara probable. À explorer via ingestion Ulara.

- [ ] **Cutscene Rose/Dart fighting flashback Ulara** (submap 512) — scène canon post-Death Frontier. Probable révélation Rose = Black Monster + confrontation. À documenter via Ulara/Rose ingestion.

- [ ] **Free rest spots canon (Cave Water + Oases)** — pattern Disc 4 désert hostile = rest gratuit compense l'absence de shops. Damia (le code) : `RestArea.cost = 0` quand zone wilderness. Cohérent design.

- [ ] **Encounter Contact 30% canon Disc 4** — pattern stable, à confirmer autres locations Disc 4.

- [ ] **5 mobs canon Death Frontier** (Cactus / Spiky Beetle / Scorpion / Sandworm / Canbria Dayfly) — à documenter `combat/mobs.md` (à créer) ou `data/mobs.ts`. 4 Earth + 1 Wind (cohérent stratégie party Fire/Earth/Wind). EXP 112-168, Gold 21-51, drops 8-15%.

- [ ] **Items canon nouveaux Death Frontier** (4 à documenter `items/`) :
  - **Moon Serenade** — type ? Moon Objects related ? Healing ? Attack ?
  - **Gladius** — weapon. Character cible ? (Dart non, cf. Dart.md weapons list ; possible Albert/Lavitz/Haschel à clarifier)
  - **Power Up** — stat-boost permanent canon Disc 4 endgame
  - **Bandit's Shoes** — accessory. Escape +%? Speed +%? Gold bonus ?
    → À investiguer items canon + ingérer pages items wiki/fandom dédiées.

- [ ] **Sinkhole network mapping Death Frontier** — 14+ sinkholes connectent les submaps. Cartographier précisément pour Damia (le code) — graph topology.

- [ ] **Submap coordinates xy system canon** — wiki LoD utilise xy grid (left=+x, right=-x, up=+y, down=-y). Format inhabituel (inversé). Cohérent isométrique ? À adopter pour Damia (le code) ou inverser au format conventionnel.

### Locations + Story / Lore (Divine Tree — foundational lore TLoD Disc 4)

- [ ] **Foundational lore Divine Tree canon** — Tree of Life (2,500m), planté par Soa, 108 fruits = 108 species, quand tous tombent → tree meurt → cycle complete. Mille Seseau state religion 11k ans (Bishop Dille). À documenter `lore/soa-divine-tree.md` (à créer). Source: [`features/locations/Divine Tree.md`](features/locations/Divine Tree.md).

- [ ] **108 Species canon** — liste partielle révélée :
  - 97 = Giganto (3-8m, Kongol seul survivant bandit raid 20 ans)
  - 99 = Mininto (1m fun-loving)
  - 105 = Dragon (great destructive force)
  - 106 = Human (no innate magic)
  - 107 = Wingly (flight + teleport)
  - 108 = Virage (ends all life, Embryo + vanguards)
  - - Demons (Mayfil, Residents of Darkness, Zackwell/Menon, Selebus half-Demon)
  - - Mermaid (probable, lien Damia + fruit aquatique submap 586)
      → À documenter `lore/108-species.md` (à créer). Foundational pour codex/lore UI Damia.

- [ ] **Moon Child cycle canon** — Crystal Sphere broken par Zieg vs Melbu Frahma final Dragon Campaign à Kadessa → soul du 108th fruit released → **cycle 108 ans** (soul possesses newborn human) → goal reach Moon → original cycle resumes → all life wiped out. Probable : **Shana = Moon Child** (Disc 4 reveal). À documenter `lore/moon-child-cycle.md` (à créer). Cross-ref Deningrad Ute folklore.

- [ ] **Moon That Never Sets origine canon** — = **flesh du 108th fruit (Virage)** suspended in sky par Winglies. Cohérent Wingly fort capability (cf. Crystal Palace = Wingly fort canon). À documenter `locations/Moon (That Never Sets).md` (à créer).

- [ ] **Crystal Sphere artifact canon** — magical container Wingly avec **soul du 108th fruit**. Broken in final Dragon Campaign battle. Distinct **Signet Spheres** (Crystal Palace Mille Seseau + Aglis + autres). Pattern Wingly artifacts canon : Signet Spheres + Crystal Sphere + Dragon Block Staff + Moon Mirror + Rose's Choker. À documenter `lore/wingly-artifacts.md` (à créer).

- [ ] **Magical cloaking Divine Tree canon** — cloaked tant que 108th fruit suspended sky. Implication : Divine Tree devient accessible **uniquement à la fin Disc 4** (story flag spécifique). Data-model location accessibility condition canon. À orchestrer story flags Damia.

- [ ] **Bishop Dille religious authority canon** — Mille Seseau state religion = Divine Tree worship. Bishop Dille = autorité confirmée. À documenter `npcs/bishop-dille.md` (à créer) + cross-ref `locations/Deningrad.md`.

- [ ] **Soa creator canon** — deity TLoD, planté Divine Tree. Manifestation possible Disc 4 (cf. final boss arc Melbu Frahma possibly Soa-related ?). À investiguer + `lore/soa-divine-tree.md`.

- [ ] **Coolon vehicle/creature canon** — crashes au Divine Tree submap 583 (arrivée party). Wingly origin probable. Mécanique transport canon Disc 4 ? À documenter `lore/coolon.md` (à créer) ou `npcs/`.

- [ ] **Boss Caterpillar canon (Divine Tree Disc 4)** — Non-Elemental, **13,000 EXP** (record canon), 300G, **drop 100% × 3 items** (Healing Rain + Moon Serenade + Sun Rhapsody), 3-form encounter (Caterpillar + Pupa + Imago — life cycle insectoid). À documenter `bosses/Caterpillar.md` (à créer). Pattern boss "transformation cycle" canon.

- [ ] **Multi-drop 100% canon pattern** — Caterpillar = premier boss canon avec **3 drops 100% différents**. Distinct du single 100% drop (Belzac Golden Stone, Damia Blue Sea Stone). Data-model `BossYield.guaranteedDrops: ItemId[]` (array, pas single). À implementer flexible.

- [ ] **Rest "ultimate" pattern canon** — Divine Tree Water rest = **full HP+MP + remove ALL Status Ailments** (le plus puissant canon vs Hotel 50G HP+MP / Clinic 50G status only). Pattern endgame "sacred site full restore" gratuit. Data-model : `RestArea.effects: { restoreHp, restoreMp, removeAllStatus }`. Réutilisable autres sacred sites.

- [ ] **Submap encounter grouping pattern canon** — Divine Tree submaps groupés par ID partagent encounter formations identiques : (583,589) (584,590) (585,591) (586,592) + 587 standalone. Data-model `EncounterGroup.submaps: SubmapId[]` réutilisation efficient. Pattern transverse à confirmer autres locations.

- [ ] **Random Encounter (vs Contact) pattern canon Disc 4** — Divine Tree retour au pattern classique Random Encounter (vs Phantom Ship + Death Frontier = Collision Encounter). Pattern mixed Disc 4. À documenter.

- [ ] **Items canon Divine Tree** (`items/` à créer) :
  - **Phoenix Plume** — revive item probable (Phoenix lore) ?
  - **Silver DG Armor** = **White-Silver Dragon's Armor** (display) = Miranda endgame armor. Pattern probable : Dragoon armor 1-par-archetype canon. À documenter `items/dragoon-armor.md` (à créer).
  - **Dancer's Shoes** (drop Cute Cat 2%) — effet ? Speed +% ? Dance proc ?
  - À investiguer all 3 items effects via fandom / wiki items pages.

- [ ] **Mermaid species canon** — lien probable Damia (mi-mermaid) + fruit aquatique Divine Tree submap 586. Race canon non encore confirmée numérotation 108-species. À documenter `lore/108-species.md`.

- [ ] **Kadessa lore canon** — Wingly capital où final battle Dragon Campaign (Zieg vs Melbu Frahma) → Crystal Sphere broke + Kadessa fell apart. Distinct Aglis/Forest of Winglies. À documenter `locations/Kadessa.md` (à créer) — possible location accessible Disc 4 ?

### Bosses (Emperor Doel — antagoniste Disc 1, premier boss 2-phase canon documenté)

- [ ] **Boss "2-phase transformation" data-model canon** — Emperor Doel (humain 600 HP) → Dragoon Doel (1,800 HP). Data-model :
  - `Boss.phases: BossPhase[]`
  - `BossPhase.transformTrigger: "hp_zero" | "hp_threshold"`
  - Yield (EXP/Gold) **sur phase finale uniquement** (Emperor donne 3k XP / 200G, Dragoon 0/0)
  - **Counter group per phase** : Emperor = group 28, Dragoon = 0 (no counter)
  - Cinematic phase transition
    → Pattern réutilisable Caterpillar (3 phases), Melbu Frahma final probable. Source: [`features/bosses/Emperor Doel.md`](features/bosses/Emperor Doel.md).

- [ ] **Mécanique "Thunder Barrier" canon avancée** — Phase 2 Dragoon Doel : HP < 50% trigger auto Thunder Barrier (0× damage immune) → ability swap (Thunderbolt enabled / Beam+Spark disabled) → 4 turns plus tard Dispel Barrier auto reverse. Data-model :
  - `Boss.damageReduction: number` (0 = immune state)
  - `Boss.abilities[].enabledBy?: AbilityId` / `disabledBy?: AbilityId`
  - `Boss.abilityCooldownTriggers: { abilityId, turnsLater, autoCast: AbilityId }`
    → Premier boss canon avec **damage immunity + abilities swap**. Pattern data-model réutilisable.

- [ ] **Counter Additions per phase canon** — Emperor Doel = group 28 (all counter opportunities) / Dragoon Doel = **group 0** (NO counter). Pattern : transformation Dragoon = perd counter capability, focus offensif magic. À refléter data-model.

- [ ] **Doel family lore canon** — `lore/serdia.md` + `npcs/`(à créer) :
  - **Carlo** = frère de Doel, **Albert's father**, **tué par Doel** pour rise to power
  - **Katrina** = Doel's wife, **morte pendant Serdian War** (cause inconnue canon — mystère narratif)
  - **Albert** = neveu de Doel (Bale-Basil heir age 6)
  - **Kongol** = giganto child sauvé par Doel (post-genocide Home of Giganto)
    → Famille tragique = base writing dialogue Doel pré-fight.

- [ ] **Home of Giganto genocide canon** — Doel led Serdian army for **defend gigantos vs humans** mais failed prevent genocide. Sauvé Kongol enfant. À documenter `lore/giganto-genocide.md` (à créer). Backstory Disc 1 majeur.

- [ ] **Violet Dragoon Spirit transfer mechanism canon** — Doel défait → Spirit obtenu mais Haschel pas présent Disc 1. Probable : DS carried by party until Haschel joins Disc 2/3. Cohérent pattern Lavitz death → DS held party → Albert receive. À documenter `lore/dragoon-spirit-inheritance.md`.

- [ ] **Kanzas (Vellweb ancien Dragoon) → Doel inheritance probable** — Pattern : Belzac(Earth)→Kongol / Damia(Water)→Meru / Syuveil(Wind)→Lavitz/Albert / **Kanzas(Thunder?)→Doel**. Si confirmé : Kanzas = Violet/Thunder ancien Dragoon canon. Implication doc `bosses/Kanzas.md` + `lore/dragon-campaign.md`.

- [ ] **Dark Doel rematch canon Disc 4** — alternate dimension Bale (Moon-related). Same Doel ressuscité ? Memory Manipulation by Melbu Frahma ? À investiguer ingestion `bosses/Dark Doel.md` (à créer).

- [ ] **Boss "Drops Nothing" + scripted DS reward pattern** — Doel drops "Nothing" car DS = scripted reward (pas drop combat). Pattern canon vs Vellweb anciens Dragoons (drop 100% Spirit Stone). Distinction lore : ancien Dragoon Vellweb = dropped Stone, antagoniste vivant Disc 1-3 = scripted reward. À refléter data-model.

- [ ] **Boss death behavior canon : defeat vs transform** — Emperor Doel HP=0 = transform (pas defeat). Data-model : `Boss.deathBehavior: "defeat" | "transform_phase_X"`. Distinguer game-over boss vs phase trigger.

- [ ] **Retaliate "simple" vs "Patterned" canon** — Emperor Doel Retaliate = single ability (Multi-slash Slam) **vs** Belzac/Damia Retaliate Patterned (cycle 3 abilities). 2 patterns canon distincts. Data-model : `RetaliateTrait.type: "simple" | "patterned"`.

- [ ] **8/8 status immunity dès Disc 1** — confirmé : tous bosses canon = status immune total, pas progression par Disc. Pattern stable. Important data-model `Boss.statusImmunity` = full default.

### Bosses (Emperor Doel fandom + Dark Doel — Lloyd advisor + Diaz reborn + 2 swords mechanic)

- [ ] **Lloyd = advisor Doel canon Disc 1** — Lloyd avant Disc 3 (kidnap Theresa Tower of Flanvel) était **advisor Doel** + **instilled "demonic word"** Doel → wrathful turn. Lore foundational : Lloyd antagoniste arc Disc 1→3. À documenter `bosses/Lloyd.md` (à créer) + `lore/lloyd-arc.md`.

- [ ] **Emperor Diaz reborn canon Disc 1 reveal** — Doel quote canon : "All is ordered by the reborn Emperor Diaz. Lloyd is a mere pawn." Diaz mort Dragon Campaign 11k ans → reborn / possessed Disc 1. Mastermind canon de tout l'arc. À documenter `lore/emperor-diaz.md` (à créer). Reveal majeur Disc 1 qui setup Disc 2-4.

- [ ] **Empress Karina canon name** (vs wiki LoD "Katrina") — fandom prime probable (canon name spelling). Statue Black Castle. À reconfirmer tier 1.

- [ ] **Father Faza NPC Black Castle** — raconte canon "humane side Doel" + Karina statue lore. À documenter `npcs/father-faza.md` (à créer).

- [ ] **Popo + New Serdio Party Kazas** — civil movement helps party access Black Castle Disc 1. À documenter `npcs/popo.md` + `lore/new-serdio-party.md`.

- [ ] **Doel personality canon enrichie** — visionary "all species from Divine Tree are equal" → motivation Kongol joining. Post-Lloyd : wrathful/merciless. Father Faza quote : "Strength and frailty. Fondness and Cruelness." Pattern character tragique compelling.

- [ ] **Tragic family canon reveal Disc 4 Albert trial Moon** — Carlo (Albert's father) **trusted Doel** + admitted "Doel was most likely to take throne". Civil war Serdio = misunderstanding tragique. À orchestrer cinematic Mode Story très important.

- [ ] **Doel quote canon catchphrase** : "I will do anything to conquer Serdio even if I have to sell my soul to the devil." À utiliser pour intro Doel character UI.

- [ ] **Dark Doel canon Battle in the Moon (Albert individual trial)** :
  - HP 1,500 (US/EU) / 2,500 (JP), AT 75, DF 120, MAT 90, MDF 120, SPD 50
  - 6,000 EXP, 0 Gold, no drops, Can Counterattack: Yes
  - **Cannot attack Doel before 2 swords defeated** :
    - **Shadow Blade** (white sword, entity séparée)
    - **Light Sword** (black/red sharp, entity séparée)
  - **Albert sans Dragoon form** (canon trial rule)
  - Post-swords-defeated : **Lightning Cape** ability unlocked (4 bolts from cape)
    → Nouveau pattern boss canon : **"Components must be destroyed first"**. Data-model `Boss.requiresComponentsDefeated: EntityId[]`. Réutilisable. Source: [`features/bosses/Emperor Doel.md`](features/bosses/Emperor Doel.md) §Dark Doel.

- [ ] **Aglis trials canon Disc 4** — confirmation : trial of Kongol = Doel apparition (accuses Kongol). Pattern : trials of courage Aglis = past antagonists/lessons. À documenter `locations/Aglis.md` enrichissement + `quests/disc4-aglis-trials.md`.

- [ ] **Moon That Never Sets individual trials canon** — chaque party member a son trial (Albert vs Doel, autres TBD). Pattern dungeon Disc 4 final. À documenter `locations/Moon (That Never Sets).md` (à créer).

- [ ] **Doel abilities renaming divergences canon** — wiki LoD vs fandom :
  - Multi-slash Slam (wiki) = Double Sword (fandom)
  - Spirit Bullet (wiki) = Scream Bullet (fandom)
  - Thunder Slash (wiki) = Judgement Storm (fandom, with detailed sword toss + electrical storm sequence)
  - Thunder Beam (wiki) ≈ Charge Burst (fandom)
  - Spark Net + Thunderbolt (wiki) ≈ Random Thunder (fandom, during Barrier)
    → À harmoniser data-model Damia. Préférer canon-most-descriptive names (fandom plus visuel).

- [ ] **Doel Barrier mécanique trigger DIVERGENCE canon majeure** :
  - Wiki LoD : **HP < 50%** trigger
  - Fandom : **"unchanging amount of time"** trigger (timer-based, pas damage-based)
  - Implication game balance : si timer-based, burst damage rapide peut éviter Barrier ; si HP-based, inevitable
  - Wiki LoD : Barrier dure **4 turns** / Fandom : **3 turns**
    → À reconfirmer tier 1 (Discord). Important balance design. Source: Doel.md.

- [ ] **Therapy Ring + Spirit Ring items canon** (fandom Doel strategy tips) — useful pendant Barrier downtime. NEW items canon à documenter `items/accessories.md` (à créer).

- [ ] **Doel "wields 2 swords" canon visual** — Emperor form animation = 2 swords (Double Sword, Scream Bullet stab + throw both). À refléter design Damia (le code) sprite/animation.

- [ ] **Dragoon Spirit "ascending after death" canon visual** (fandom gallery) — Doel's DS ascends post-defeat. Pattern visual transfer Spirit cinematic. À orchestrer Damia (le code). Probable réutilisable autres bosses canon (Lavitz death → Spirit transfer Albert).

### Locations + Story / Lore (Donau Disc 2 Flower City — Meru recruit + Lloyd-Wink long con + 0 chests canon)

- [ ] **Lloyd saves Wink à Donau Disc 2 canon** (submap 240) — **long con narrative canon** : Lloyd manipule Wink trust depuis Disc 2 (peace city Donau) → renforce Disc 3 Younger Bardel rescue → exploite trust Crystal Palace pour kidnap Theresa. **Foreshadowing arc Lloyd 2 discs** = villain compétent. Pattern à orchestrer cinematic Mode Story + reference Disc 3 Deningrad arc. Source: [`features/locations/Donau.md`](features/locations/Donau.md) §Lloyd-Wink long con.

- [ ] **Meru recruitment canon Donau** (submap 250 close-up "party meets Meru") — Disc 2 party member recruit. Mécanique exacte à confirmer fandom. Cinematic Damia (le code) à orchestrer.

- [ ] **Pattern "Conditional goods acquisition" canon Donau** — Kate's Bouquet 3-way outcome :
  - Action icon press → Shana grabs (Dart pushes)
  - No action + Dart "agreed Meru beautiful wedding dress" earlier → Meru grabs (rejoices "next bride")
  - No action + disagreed → Haschel grabs (apologizes "pure reflex")
    → Pattern dialogue choice → outcome canon. Data-model `DialogueChoice.consequences: GameStateChange[]`. Tracking dialogue history requis Damia (le code). Source: Donau.md.

- [ ] **Pattern "Goods double-acquisition with name change" canon** — Letter from Lynn pickup 2 fois (Kate 1st → Mayor's house 2nd post-delivery), display différent. Data-model `Good.acquisitions: { trigger, displayName }[]`. Niche pattern mais à supporter.

- [ ] **First "0 chests" location canon Donau** — pattern intentionnel "peaceful city safe no loot". Cohérent narrative focus vs gameplay reward. Data-model : pas tous les locations need chests. Pattern réutilisable (Ulara probable similar Disc 4).

- [ ] **Return-only event pattern canon** (Kate's Bouquet) — accessible **uniquement si return Donau post-Lynn rescue** (skip si Fletz direct). Story flag mécanique. Data-model `Event.accessibilityCondition: { afterFlag, beforeFlag, locationReturn: boolean }`. Pattern Damia (le code).

- [ ] **Rave Twister item canon NEW** — 20G Item Shop Donau. Type probable attack item (Wind ?) à investiguer. À documenter `items/consumables.md` (à créer).

- [ ] **Silver Vest + Tiara items canon Donau weapon shop** — 150G chacun, characters cibles probables (Tiara feminine Shana/Meru/Rose ; Silver Vest body armor Dart/Lavitz/Haschel ?). À documenter `items/equipment.md`.

- [ ] **Lynn rescue quest canon Disc 2** — Donau → Valley of Corrupted Gravity (#17 next location). Kate (mère probable) → Letter from Lynn → Mayor's butler delivery → rescue Lynn. À orchestrer `quests/disc2-donau-lynn.md` (à créer).

- [ ] **Wedding Kate ceremony canon** (submap 259) — return-only post-rescue. Cinematic bouquet throw + 3-way outcome. Possible mini Vision Damia "Survival arena festif" décor.

- [ ] **NPCs Donau canon** : Kate (gives Letter, throws bouquet), Lynn (kidnapped), Mayor + Mayor's butler (Letter delivery), Wink (rescued by Lloyd here Disc 2 pré-Sacred Sister reveal). À documenter `npcs/donau.md` (à créer).

- [ ] **Wink double-rescue canon** (Disc 2 Donau + Disc 3 Younger Bardel) — pattern Lloyd "saviour figure" établit trust durable. Important pour Disc 3 Crystal Palace kidnap context. À refléter `lore/lloyd-arc.md` (à créer).

### Locations + Bosses (Nest of Dragon fandom — Greham canon backstory + Servi + Diaz reveal Disc 1)

- [ ] **Greham canon lore complet** — former head **Second Knighthood of Kingdom of Basil**, turned treacherous, **killed Lavitz' father Servi** (canon Servi = nom père Lavitz). Lavitz revenge motivation Disc 1. **Greham post-defeat regret + praises Lavitz** for father strength. À documenter `bosses/Greham.md` (à créer) + `npcs/servi.md` (Lavitz' father). Source: [`features/locations/Nest of Dragon.md`](features/locations/Nest of Dragon.md).

- [ ] **Servi = Lavitz' father canon** — killed by Greham many years ago. NPC lore canon. À documenter `npcs/servi.md` (à créer) + crosslink `party-members/Lavitz.md` backstory.

- [ ] **Second Knighthood of Basil canon** — Greham = former head. Implique structure militaire Basil canon (multiple knighthoods). À documenter `lore/serdia.md` (à créer) ou `lore/basil-knighthood.md`.

- [ ] **Diaz reveal Disc 1 (Nest of Dragon canon)** — Greham révèle pré-fight : Doel reçoit power+intelligence d'Emperor Diaz. Rose disbelief (Diaz mort 11k ans). Confirme **fil rouge antagoniste Diaz reborn déjà à Disc 1 mid** (avant Black Castle final reveal). Pattern Cohérence narrative à orchestrer Mode Story.

- [ ] **Shana poison collapse canon Disc 1** — exposure-time status mechanic à Nest of Dragon. Shana sickened → requires break → post-fight collapses → Lohan cure quest. Pattern : **environment-based party status** canon (à documenter `combat/status-effects.md` + `quests/disc1-nest-shana-poison.md`).

- [ ] **Return trip Shrine of Shirley canon** — Water Bottle (Lohan shop) + pure water (Nest Spring) = **Life Water** → purify **mutated plant blocking road** vers Shrine of Shirley. Pattern **environmental gate item** canon. Data-model `MapNode.gate: { type: "obstacle", removableBy: ItemId }`.

- [ ] **DS "chooses wielder" canon language** — Jade DS **chooses** Lavitz (vs simple auto-add). Implications narrative + data-model : DragoonSpirit affinity selection. Pas juste mécanique inventory. À refléter `dragoons/obtention.md` (à créer).

- [ ] **Plate Mail possible alternate drop Man Eating Bud** (canon fandom "reports vary") — main source Greham 30%, alternate Man Eating Bud ?. À reconfirmer tier 1.

- [ ] **Mob HP canon Nest of Dragon** : Lizard Man 40, Mandrake 99, Tricky Bat 33, Run Fast 66, Man Eating Bud 132 (US/EU). JP +25%. Pattern récurrent. À reproduire `src/data/balance.ts` MOBS.

- [ ] **Strange umbrella-like plants touch mechanic canon** — gameplay puzzle Nest of Dragon (touch plant → "wall" plants disappear → progress). Pattern interactable plant mechanic. À refléter design Damia (le code).

- [ ] **2-floor dungeon canon Nest of Dragon** — climb plants up/down. Pattern vertical traversal canon. Réutilisable.

- [ ] **JP name Nest of Dragon** : 竜の巣 (Ryū no Su) = "Dragon's Nest" ou "Dragon's Lair". Translation flexible.

### Locations + Bosses (Nest of Dragon Disc 1 — Greham+Feyrbrand + Jade DS Lavitz unlock)

- [ ] **Boss Greham canon (Jade Dragoon)** — Wind, 1,200 XP, 100G, drop Plate Mail 30%. Cf. dragons.md §Greham reveal. Lavitz-Greham close-up cutscene submap 656 → moment narratif Disc 1 majeur. À documenter `bosses/Greham.md` (à créer).

- [ ] **Boss Feyrbrand canon (Wind Dragon vassal Greham)** — Wind, 0 XP/0G (yield via Greham), drop **Down Burst 100%**. Praying mantis shape, green body + tusks "Green-Tusked Dragon". Source du Sandora power tip war canon. À documenter `bosses/Feyrbrand.md` (à créer).

- [ ] **Jade Dragon DS auto-add post-defeat canon** — Lavitz first Dragoon transformation Disc 1 trigger. Data-model `Boss.onDefeat.grants: ItemId[]`. Pattern : defeating Dragoon → DS transferred to party. Source: [`features/locations/Nest of Dragon.md`](features/locations/Nest of Dragon.md).

- [ ] **Pattern "Ultimate Rest" canon** — Spring Nest of Dragon (free + full HP+MP + cure ALL status) = même mécanique que Cave Water Death Frontier + Water Divine Tree. Pattern "sacred location rest" gratuit Disc 1/3/4. Data-model `RestArea.tier: "basic" | "ultimate"`.

- [ ] **Life Water good canon** — context-dependent acquisition (Water Bottle in inventory + interact Spring). Pattern conditional good. Où obtenir Water Bottle Disc 1 ? À investiguer.

- [ ] **Items nouveaux Nest of Dragon canon** :
  - **Down Burst** (Feyrbrand drop 100%) — probable Wind attack item canon
  - **Beast Fang** (Lizard Man drop 2%) — type ? Physical attack ? Material ?
  - **Plate Mail** (Greham drop 30%) — armor canon Disc 1
  - **Chain Mail** (chest) — armor canon Disc 1
    → À documenter `items/` (à créer).

- [ ] **Bravery Amulet early Disc 1 canon** — anti-Fear accessory disponible chest Nest of Dragon. Confirme pattern : accessory chains accessible early dungeons + late shops (Bale 300G + Deningrad 300G). À documenter `items/accessories.md`.

- [ ] **Boss double encounter scripted canon (formation 393)** — Greham + Feyrbrand fight ensemble. Pattern "multi-boss encounter" data-model. Mécanique : sequential phases ou simultaneous ? À reconfirmer. Premier multi-boss canon Disc 1.

- [ ] **"Shana runs off" submap 131 canon** — story beat narrative à orchestrer. Possible Feyrbrand poison threat ? Lured ? À investiguer canon fandom.

- [ ] **Greham backstory canon** — ancien knight Basil défector vers Sandora probable (Lavitz "talks" canon submap 656). À documenter `bosses/Greham.md` story.

- [ ] **Forest poisoning visual canon** — Feyrbrand's presence warps environment. Effet ambient Damia (le code) : couleurs malsaines, particules, plantes corrompues. Pattern réutilisable autres Dragon territories.

- [ ] **Web pit + vine climb traversal canon** — mini-puzzle exploration Nest of Dragon. Pattern Damia gameplay : interactable web/vine objects, fall mechanics.

### Dragon Campaign — foundational war lore TLoD

- [ ] **Eye-merge mécanique Dragoon Spirit canon (Dragon Campaign reveal)** — Quand Dragon meurt, **eyes (1-7) merge into singular gem** = DS canon. **Harvested at moment of death** uniquement. Wielder doit "**tame the beast within**". Implication data-model : `DragonSpirit.eyesMerged: number` (cohérent hierarchy eye count). Visual canon : DS = représentation visuelle des eyes Dragon. Source: [`features/dragoons/dragon-campaign.md`](features/dragoons/dragon-campaign.md).

- [ ] **Diaz canon humain originel** (Liberation Army leader) — pas Emperor à l'époque. Speech war declaration **Fort Magrad** canon. Reborn antagoniste reveal Disc 1+4. À documenter `lore/emperor-diaz.md` (à créer) avec lifecycle complet (human → leader → "die" Kadessa → reborn 11k ans plus tard).

- [ ] **Vellweb canon "capital of the oppressed"** Dragon Campaign — base Liberation Army training. **Évolution canon vers mausoleum** present (4 anciens Dragoons souls). À documenter `locations/Vellweb.md` (à créer) avec dual lore (Dragon Campaign + present mausoleum).

- [ ] **Kadessa canon Wingly capital** — coliseum oppression + final battle Dragon Campaign + Crystal Sphere broken site. **Crumbled** end Dragon Campaign. À documenter `locations/Kadessa.md` (à créer). Vestige Disc 4 possible ?

- [ ] **Fort Magrad canon** — Diaz speech war declaration site. À investiguer existence in-game (Disc 4 possible vestige ?). À documenter `locations/Fort Magrad.md` (à créer) si confirmé.

- [ ] **5 floating Wingly cities canon** — cibles guerre Dragon Campaign. 4 connues (Forest of Winglies, Aglis underwater, Ulara hidden Spring Breath Town, Zenebatos). **5ème** = Kadessa probable (Wingly capital) OU autre ? À investiguer.

- [ ] **Flanvel floating mobile fortress canon** — cible Dragon Campaign. **Tower of Flanvel Disc 3** = vestige canon (Kashua Glacier). Cohérent narrative. À documenter `locations/Tower of Flanvel.md` enrichi.

- [ ] **Zieg-Melbu Frahma duel canon final battle Kadessa** — Dragoon form vs Crystal Sphere + Dragon Buster. **Zieg fatal blow** → Melbu **petrifies Zieg + embeds essence Red-Eye DS** (last-ditch survival). Both fall. Implications data-model : Red-Eye DS contient **Zieg soul + Melbu essence** canon → cohérent Zieg possessed Disc 4 reveal. À orchestrer cinematic Mode Story Disc 4 endgame + `bosses/Melbu Frahma.md` (à créer).

- [ ] **Dragon Buster wielded by Melbu Frahma canon** — Wingly anti-Dragon ethereal sword utilisé par dictator Melbu. Post-Kadessa fate ? Item survives ? Lost ? À investiguer `items/key-items.md` (à créer).

- [ ] **Crystal Sphere broken canon → Moon Child cycle start** — précision narrative : la **rupture Crystal Sphere durant Zieg-Melbu fight** = mécanique exacte lance le **cycle 108 ans Moon Child** (cohérent Divine Tree canon). Foundational. À orchestrer cinematic Mode Story Disc 4.

- [ ] **Kanzas self-sacrifice canon vs Super Virage** Kadessa — confirme self-destruct/sacrifice mécanique canon. À documenter `bosses/Kanzas.md` (à créer) + élément (Violet/Thunder confirmé Vellweb).

- [ ] **Michael (Rose's vassal) Dragon Campaign role canon** — aerial Virage killer + **special laser** mass-elimination. Asset majeur final battle. Cohérent canon Black Burst Dragon Darkness 5-eye + later savage / killed by Rose. À documenter `lore/michael.md` (à créer).

- [ ] **Belzac + Shirley death scene canon Kadessa** — Belzac holds column up via Dragoon power+will (Virage impaled chest), Shirley arrow vs Virage charging laser, both die. **Reconcilie contradictions Belzac death** (cf. Belzac.md questions ouvertes). Cohérent narrative complète.

- [ ] **Liberation Army canon** — armée rebellion Diaz-led. Members 7 Dragoons + Diaz + autres. À documenter `lore/liberation-army.md` (à créer).

- [ ] **Coliseum within Kadessa canon** — site oppression species forced fight. Tragique. Cinematic Mode Story possible (Cutscene 8 Library Ute mention possible).

- [ ] **Virage spawn at will mechanism Winglies** — comment Winglies spawn Virage hors Crystal Sphere ? Magical tech ? Implications canon Virage origin. À investiguer.

- [ ] **Super Virage canon** — plus puissant que regular Virage. Kanzas self-sacrifice required. Possible boss Disc 2/3. Stats canon ? À investiguer.

- [ ] **Diaz reborn mécanique canon** — mort Kadessa (presumed) → reborn 11k ans plus tard. Comment ? Possessed via Moon Child cycle ? Crystal Sphere broken mécanique ? À investiguer Disc 4 reveal + `lore/emperor-diaz.md`.

- [ ] **Cinematic Dragon Campaign Mode Story Damia (le code)** — backstory foundational à présenter via :
  - Cutscene 8 Library Ute (Deningrad Disc 3)
  - Vellweb anciens Dragoons visits (Disc 4)
  - Ulara Charle Frahma Signet Spheres reveal (Disc 4)
  - Possible dedicated cinematic flashback majeur Disc 4 endgame
  - À orchestrer `quests/disc4-vellweb-mausoleum.md` (à créer) + `quests/disc4-kadessa-flashback.md` (à créer)

### World Map official artwork — corrections positions + Barrier Station NEW location

- [ ] **🆕 Barrier Station canon NEW location** — Visible map officielle Endiness, position Tiberoa entre Fletz et Valley of Corrupted Gravity. **Non documenté wiki/fandom Endiness pages**. À investiguer canon usage (poste-frontière ? checkpoint ? Disc 2 location ?). À documenter `locations/Barrier Station.md` (à créer). Source: [`features/world-map/_sources/official-worldmap-observations.md`](features/world-map/_sources/official-worldmap-observations.md).

- [ ] **🆕 CORRECTION position Zenebatos canon** — Position confirmée map officielle = **extrême NORD GLORIANO** (pas Mille Seseau / vague comme documenté précédemment). Pattern : **Zenebatos + Vellweb + Snowfield + Tower of Flanvel + Kashua Glacier = locations Gloriano**. À refléter `locations/Zenebatos.md` (à créer).

- [ ] **🆕 CORRECTION position Kadessa canon** — Position confirmée map = **extrême NORD-EST Mille Seseau** (cohérent "Divine Dragon flies above"). Forbidden Land = ruines visibles map officielle. À documenter `locations/Kadessa.md` / `locations/Forbidden Land.md`.

- [ ] **🆕 Position Furni canon précisée** — Sud Mille Seseau côte ouest Illisa Bay (Water City). À refléter `locations/Furni.md` (à créer).

- [ ] **🆕 Position Mayfil canon précisée** — Centre nord, entre Mille Seseau et Death Frontier (Death City). À documenter `locations/Mayfil.md` (à créer).

- [ ] **🆕 Position Aglis canon précisée** — Île sud-ouest, Broken Islands area (cohérent "underwater near Rouge" canon). À refléter `locations/Aglis.md`.

- [ ] **🆕 Divergence orthographique canon "Nest of Dragon(s)"** — Map officielle dit **"Nest of Dragons"** (pluriel), wiki/fandom disent "Nest of Dragon" (singulier). À noter `combat/canon-divergences.md` (à créer).

- [ ] **Pattern géographique master canon validé via map officielle** — 4 régions + Broken Islands + Death Frontier + Mayfil entre regions. À utiliser comme master reference Damia (le code) world map design.

- [ ] **Queen Fury route ship visible canon** — Trajet Aglis/Rouge ↔ Fletz Tiberoa (cohérent canon Aquaria Coral Reef trajet). À refléter `world-map/sea-routes.md` (à créer).

- [ ] **Wingly cities mapping canon complete via map officielle** :
  - **Zenebatos** = NORD Gloriano
  - **Aglis** = sud-ouest Broken Islands area (underwater)
  - **Kadessa (Forbidden Land)** = NE Mille Seseau (ruins)
  - **Mayfil** = centre nord (between Mille Seseau and Death Frontier)
  - **Tower of Flanvel** = Kashua Glacier (between Gloriano & Mille Seseau)
  - **Forest of Winglies** = NE Mille Seseau (cohérent fandom)
  - **Ulara** = sud Death Frontier (Spring Breath Town hidden)
    → **7 Wingly locations canon mappés** (cohérent canon "5 floating cities + Flanvel mobile fortress" Dragon Campaign + hidden post-war).

### World Map fandom complement — oceans nommés + locations canon par region + new NPCs/lore

- [ ] **🆕 6 oceans/seas canon nommés** : Aquaria Coral Reef (sud) + Straits of Walter (ouest, sépare mainland des Broken Islands) + Rudra Bay (nord-ouest, sépare Death Frontier) + Fourtos Ocean (nord-ouest + nord) + Straits of Merzis (nord-est Mille Seseau) + Illisa Bay (centre, entre 3 countries + Suncrest+Prison Islands). À documenter `world-map/oceans-seas.md` (à créer). Source: [`features/world-map/endiness.md`](features/world-map/endiness.md).

- [ ] **🆕 Divergences canon noms east lands** : Edinoro (fandom) / Ediroso (wiki LoD) + Lidalio (fandom) / Vidalio (wiki LoD). À reconfirmer tier 1.

- [ ] **🆕 Tiberoa royals canon enrichi** : **King Zior + Princesses Emille + Lisa**. Tiberoa people canon : **dark skin + astronomy + astrology** culture. Twin Castle Fletz = symbols astronomy. À documenter `lore/tiberoa.md` (à créer) + `npcs/king-zior.md` + `npcs/princess-emille.md` + `npcs/princess-lisa.md`.

- [ ] **🆕 Furni "Water City" canon** Mille Seseau — town directly at ocean + boat rides through water channels + **temperate climate** (vs rest Mille Seseau cold). À documenter `locations/Furni.md` (à créer).

- [ ] **🆕 Charle Frahma canon = sister of Melbu Frahma** ⚠️ MAJOR REVEAL — confirme pattern Frahma surname canon. Sister of dictator + Rose's friend (gave Choker) + resides Ulara. À documenter `lore/charle-frahma.md` (à créer) + `npcs/charle-frahma.md`. **Frahma family = Wingly dictator dynasty** canon.

- [ ] **🆕 Vellweb 7 towers canon design** — each tower dedicated to one of original 7 Dragoons. À refléter `locations/Vellweb.md` (à créer) — Damia (le code) Vellweb visual design 7 towers (cohérent souls Vellweb canon).

- [ ] **🆕 Spear Shooter disabled Tower of Flanvel canon** — weapon Liberation Army Vellweb confirms canon. À documenter `lore/spear-shooter.md` (à créer) + `bosses/Faust.md` + `locations/Tower of Flanvel.md`.

- [ ] **🆕 Zenebatos "Law City" canon + Lapto robots** ⚠️ NEW — Wingly society laws creation/revision/enforcement + trials/executions. Lapto robots still functional 11k ans plus tard. Pattern data-model Damia : `Zenebatos.activities = ["lawmaking", "trials", "executions"]` + Lapto = automated NPCs. À documenter `locations/Zenebatos.md` (à créer).

- [ ] **🆕 Aglis "bubble of air underwater" canon** — magic seals out ocean, cityscape in vast bubble. **Entire city devoted to studying magical powers** canon. À enrichir `locations/Aglis.md`.

- [ ] **🆕 Kadessa "Forbidden Land" canon name** — ancient capital ruins now = Forbidden Land. **Probable located in Mille Seseau** (Divine Dragon flies above canon). À documenter `locations/Kadessa.md` ou `locations/Forbidden Land.md` (à créer). Divergence naming canon : Kadessa = past, Forbidden Land = present ruins.

- [ ] **🆕 Mayfil "Death City" canon + gate to hell** — souls gathering destination canon. Demons location (Zackwell/Menon/Selebus). À documenter `locations/Mayfil.md` (à créer).

- [ ] **🆕 Rouge School of Martial Arts canon** ⚠️ NEW — origine Rouge village Broken Islands. **Probable Haschel link** (canon martial artist). À documenter `locations/Rouge.md` (à créer) + investiguer Haschel backstory.

- [ ] **🆕 Mountain of Mortal Dragon canon** = "volcano north Mille Seseau" + Divine Dragon sealed + **many dragons still live** canon. À documenter `locations/Mountain of Mortal Dragon.md` (à créer).

- [ ] **🆕 Limestone Cave serpent Urobolus canon** — boss possible Disc 1. Path Bale infested. À documenter `bosses/Urobolus.md` (à créer) + `locations/Limestone Cave.md`.

- [ ] **🆕 Lohan Hero Competition canon** — strongest adventurer Endiness contest event. À documenter `quests/disc1-lohan-hero-competition.md` (à créer).

- [ ] **🆕 Larger peninsula south Death Frontier unnamed canon** ⚠️ — visible map, non-visité, no name. Hook supplémentaire DLC/expansion Damia.

- [ ] **🆕 Statistic canon ~1M habitants Endiness** — Royal Personnel Authority Serdio (Fletz Albert quote). 550k women, 22k Claire. À utiliser pour balance scale lore Damia (le code). Pattern dialogue Fletz "Dart-Haschel possible relation Claire mother/daughter same name".

- [ ] **🆕 Trivia canon Endiness** :
  - "Endines" typo bookstore Bale canon
  - Geographic Fletz/Illisa Bay contradiction writer's mistake canon
  - Eastern Tribe false alert Albert Aglis trial canon
  - Rose tells Syuveil "eastern lands circle of life" Vellweb canon
  - Dart pre-game journey east confirmed (dotted path + cheat code)

### World Map / Lore (Endiness foundational map TLoD)

- [ ] **🆕 Tesfer Realm canon** — encompassing "world" wrapper. Cosmological lore ? Lien spiritual/physical planes ? À investiguer + documenter `lore/tesfer-realm.md` (à créer).

- [ ] **🆕 Planet name canon mystère** — never given canon trivia. Design choice ou future reveal ? À noter `lore/cosmology.md`.

- [ ] **🆕 Fourtos Ocean + Aquaria Coral Reef canon water bodies** — bordent Endiness W/S/N. Ship routes (Queen Fury Donau-Fueno + Donau-Furni). Aquaria Coral Reef = where Aglis underwater hidden ? À documenter `world-map/oceans.md` (à créer).

- [ ] **🆕 6 lands far east unexplored canon** : **Azeel, Ediroso, Losta, Nissel, Seilnder, Vidalio**. Visible world map only, no story content Disc 1-4. Hooks pour DLC/expansion ou Mode Survival exclusive arènes Damia. À documenter `world-map/east-lands.md` (à créer).

- [ ] **🆕 Endiness = peninsula anchored east canon** — implications geography. Continent structure pour world map Damia rendering.

- [ ] **🆕 4 territories canon present** : Serdio + Tiberoa + Mille Seseau + Gloriano (partial = Death Frontier south + ruins north). À refléter world-map data-model. Source: [`features/world-map/endiness.md`](features/world-map/endiness.md).

- [ ] **🆕 Broken Islands canon** — large island south ripped apart Dragon Campaign. Visited Disc 4 ? Exploration possible ? À documenter `locations/Broken Islands.md` (à créer).

- [ ] **🆕 Gloriano vs Death Frontier canon distinction** — Gloriano north retains ruins (Vellweb probable + Fort Magrad probable), Death Frontier south = désert scorched only. À cartographier précisément. Cohérent Death Frontier ex-Gloriano canon.

- [ ] **🆕 Winglies hiding canon (post-war magic)** — confirme : Aglis (underwater) + Ulara (Spring Breath revealed Rose Choker) + Forest of Winglies + Zenebatos = **4 Wingly cities canon hidden**. 5ème ? Cohérent 5 floating cities Dragon Campaign canon ?

- [ ] **🆕 Winglies suspended 108th species birth canon** — détail précis Endiness wiki. Cohérent Crystal Sphere harness Virage Embryo. Foundational lore lien Divine Tree + Dragon Campaign.

- [ ] **🆕 Some Winglies wished equality canon** — pas tous Winglies oppresseurs. Possible alliés Liberation Army ? Cohérent Meru Wingly party member + Charle Frahma + Faust (cohérent ?). À nuancer `dragoons/dragon-campaign.md` + investiguer.

- [ ] **3 Divine Moon Objects canon** — 2 à identifier (Serdio Basil + Tiberoa King Zior). Moon Mirror Mille Seseau confirmed. À documenter `lore/moon-objects.md` (à créer).

- [ ] **Creation features/world-map/ category** — nouvelle catégorie wiki ingéré. À enrichir au fil locations canon. Cf. README.md update.

### Dragoons mechanics fandom complement — DLV thresholds par char + Elements/Colors + boss anti-Dragoon mécaniques

- [ ] **🆕 DLV SP thresholds canon TABLE per character** — Critical data-model :
  - Dart + Rose : **1,200 SP DLV 2** (higher canon)
  - Lavitz/Albert + Shana/Miranda + Haschel : 1,000 SP DLV 2 / 6,000 DLV 3 / 12,000 DLV 4 / 20,000 DLV 5
  - **Meru + Kongol = 2,000 SP DLV 3** (3× faster — Disc 2 catch-up canon)
    → Data-model `DragoonWielder.dlvThresholds: number[]` per character. Source: [`features/dragoons/mechanics.md`](features/dragoons/mechanics.md) §DLV thresholds per character.

- [ ] **MP scaling DLV canon** — Min 20 (DLV 1) / Max 100 (DLV 5). Linear progression probable (20/40/60/80/100). À reconfirmer per character.

- [ ] **🆕 Dragoon Elements + Colors canon table** :
  - Darkness Dragoon = **Indigo color** (vs typical Black/Dark) ⚠️
  - Divine Dragoon = **Grey color** ⚠️
  - **Thunder + No Element NO opposing canon** (vs typical 4 elemental pairs)
    → Confirme [`combat/elements.md`](features/combat/elements.md) : 3 opposing pairs (Fire↔Water, Wind↔Earth, Light↔Dark) + 2 standalone (Thunder + Non-Elemental). À refléter UI Damia color palette.

- [ ] **🆕 Dragoons immune to Status Ailments canon** — Transform cures + immunity during Dragoon form. Replacement Body/Mind Purifiers. Data-model : `DragoonForm.statusImmunity = true` + `onTransform: cureAllStatus()`.

- [ ] **🆕 Dispirit prevents SP gain canon** — Dispirit status = SP gain impossible. 3 cures : transform (if enough SP pre-dispirit) + Mind Purifier + Clinic. À refléter `combat/status-effects.md` (à créer).

- [ ] **🆕 DS Goods + SP tracking canon (Dart Gehrich case)** — DS in Goods = trigger SP tracking. Pas d'accumulation pendant DS-loss period. Total SP preserved. Data-model `Character.spTracking.enabled = (DS_in_Goods)`.

- [ ] **🆕 Spirit Potion sources canon** :
  - Drop 8% : **Icicle Ball, Will-O-Wisp, Mermaid, Sandworm** (4 mobs canon)
  - **Arena Lohan** : 20 tickets = 200G = 1 Spirit Potion (won OR bought)
  - **00PARTS Unique Monster = 100% drop** ⚠️ NEW Unique Monster canon
    → À documenter `items/consumables.md` (à créer) + `bosses/00PARTS.md` (à créer ?).

- [ ] **🆕 Animation toggle Dragoon transformation canon** — Menu option short/long. UX setting. À implémenter Damia (le code) Settings UI.

- [ ] **🆕 DS recognition cinematic canon** — stone glows + levitates to new owner. Visual pattern Damia (le code) DS pickup cinematic.

- [ ] **🆕 Eye count reflected on Dragoon headbands canon** — visual design Damia (le code) sprite Dragoon headband. Some discrepancies in-game art vs FMVs.

- [ ] **🆕 Unique DS variations per wielder canon** (specialties + weapons-of-choice) :
  - Greham (Jade DS boss) : "**Dragon Crucification**" spell variant + (weapon à confirmer)
  - Doel (Violet DS boss) : "**Judgment Storm**" spell variant + **two swords** (vs Haschel knuckles)
  - Lenus (Blue Sea DS boss) : "**Pillar Break**" spell variant + **chakrams** (vs Meru hammer)
    → Pattern data-model `DragoonWielder.spellOverrides + weaponClass`. "Original Seven Dragoons coincidentally same weapon/style as Dart's group" canon.

- [ ] **🆕 Anti-Dragoon Boss Mechanics canon** :
  - **Lloyd 2nd fight Dragon Buster** = 1-shot kill Dragoon. **Talisman item** protect 2 chars ⚠️ NEW item canon
  - **Grand Jewel** wields Dragon Block Staff → weakens Dragoon ; conditional AI (1 Dragoon turn → no use)
  - **Melbu Frahma 4th form** : similar reduce Dragoon power
  - **Divine Dragon fight** : party uses Dragon Block Staff → self-debuff Dragoon ; Rose Storm + Miranda heal unaffected
    → Pattern canon : **Healing/Shield magic bypass Dragoon debuff** rule. Data-model `Spell.bypassesDragoonDebuff = true`. À documenter `bosses/Lloyd.md` + `bosses/Grand Jewel.md` (à créer) + `bosses/Melbu Frahma.md` (à créer).

- [ ] **🆕 Talisman canon item** — protect 2 characters from Dragon Buster attack (Lloyd 2nd fight). À documenter `items/accessories.md` (à créer).

- [ ] **🆕 Kongol Special +25% canon bonus** — Special transformation upgrade Kongol Dragoon Attack from 4-hit to 5-hit = +25% damage unique. À refléter Kongol-specific data-model override.

- [ ] **🆕 Drawback Dragoon form canon** — fighting in Dragoon form = **no SP gain + no Addition level up** (only normal EXP). Trade-off design canon. À refléter Damia balance.

- [ ] **🆕 Unnamed 7-eye Dragon "fate unknown" canon confirme** — second top-rank 7-eye Dragon mentioned canon. Cohérent dragons.md "Unnamed Dragon fought Divine Dragon, defeated". À documenter `lore/unnamed-dragon.md` (à créer).

- [ ] **🆕 393 Spirit Potions max DLV all chars canon** — 78,600G (Lohan Arena). Balance economy curve canon Disc 2 farming.

- [ ] **🆕 Bandit's Ring +20 Speed canon** ⚠️ NEW item — Kongol speedup canon. À documenter `items/accessories.md` + Bandit's Shoes (canon, déjà mentioné Death Frontier chest).

- [ ] **🆕 Spirit Ring vs Wargod's Sash break-even canon** — 40 SP per addition cutoff. Strategic equip choice canon. À refléter Damia equip recommendations / equipment guide.

- [ ] **8 Dragoon spells with special effects canon (fandom count)** — 3 Shana/Miranda + 1 Lavitz/Albert (Rose Storm) + 3 Rose + 1 Meru = 8 canon. Validates list mechanics.md.

- [ ] **Rose quote canon foundational** : "When Dragoons meet, blood will flow and as they leave, time does slow." — à utiliser cinematic intro/title Mode Story.

- [ ] **DS = "Knight of the Dragon who is chosen by fate to rule over Dragons"** canon Rose definition. À utiliser dialogue/codex.

### Dragoons mechanics master (wiki Dragoon — wielders + ranks + SP + DLV + spells)

- [ ] **Dragoon Ranks canon (Official Guidebook)** — 7 ranks par eye count : Rank 1 (7-eye Divine Dragon) / Rank 2 "God Dragon" (6-eye 7 elemental DS) / Rank 3 (5-eye Michael) / Rank 4 "Ultimate Dragon" (4-eye Regole) / Rank 5 "Dragon King" (3-eye Feyrbrand) / Rank 6 (2-eye unknown) / Rank 7 (1-eye Pseudo Dragons = minor mobs). À documenter data-model + cross-ref dragons.md. Source: [`features/dragoons/mechanics.md`](features/dragoons/mechanics.md).

- [ ] **DS acquisition canon mécanique** : Goods, story progression only. **Exception** : **Gold Dragon DS purchasable Lohan after defeating Gehrich** (cohérent Mr. Pelpee hint). Data-model `Item.acquisition: "story" | "shop" | "boss_drop"`.

- [ ] **Spirit Points (SP) mécanique canon complète** :
  - 100 SP fills meter once
  - Each DLV adds +100 SP capacity (max DLV 5 = 500 SP)
  - Transforming drains 100 SP/turn → de-transform at 0
  - SP levels = remaining Dragoon turns
  - **Stored SP non-multiple 100 lost at transform** (180→100)
  - **SP accumulates beyond max for DLV progression** (no transform required to level up)
  - Sources canon : Additions / Shana+Miranda hits / Spirit Potion 100 / Recovery Ball 100 random / Spirit Ring +20/turn passive / Equipment (magic-damage SP grants : Knight Helm/Giganto Helm/Jeweled Crown/Soul Headband/Robe/Ruby Ring + physical-damage : Sparkle Dress/Master's Vest/Giganto Armor/Saint Armor + SP+ Fairy Sword/Pretty Hammer/Energy Girdle/Wargod's Sash)
    → Master data-model SP system. À implémenter Damia (le code).

- [ ] **DLV canon mécanique** :
  - Start DLV 1, max DLV 5
  - Stats AT/DF/MAT/MDF multiplier per DLV
  - +1 spell per DLV sauf DLV 4 (no new spell pattern canon)
  - **Kongol exception** : skip DLV 2 spell unlock (3 spells total au lieu de 4)
  - Hidden SP threshold per character pour DLV up
    → Data-model `DragoonWielder.spellUnlockOverrides`. Cohérent VISION §6 Damia.

- [ ] **Transformation canon** : cannot de-transform sauf SP 0 ou HP 0 ; disable Item/Defend/Escape ; enable D'Attack + Magic commands.

- [ ] **D'Attack input system canon** : Spirit Meter compass + light rotation, X-time presses, up to 5 strikes (Kongol max 4). **Cohérent décision Damia Q1 auto-complete additions** — à trancher si D'Attack même règle ou inputs préservés en real-time.

- [ ] **D'Attack input output table canon** : 1→100, 2→110, 3→130, 4→160, 5→200. Diminishing returns pattern. Data-model `DAttackInputOutput: Map<inputs, output>`.

- [ ] **D'Attack damage formula canon Non-Archers** : `floor[floor{floor[round{floor[floor{Output * DRGNAT% / 100} * AT / 100] * (LV + 5) * 5 / DF} * Target Fear * Power] * Field} * Element]`. À wirer Damia (le code).

- [ ] **D'Attack damage formula canon Archers (Shana/Miranda)** : simpler (no inputs polynomial). À implémenter.

- [ ] **DRGNAT% / DRGNMAT% per character canon** — values Status menu Dragoon column. À retrouver per character via ingestion pages (Albert.md déjà, Dart.md déjà, autres à compléter).

- [ ] **Magic spell damage formula canon** : `floor{floor[floor{floor[floor{floor[(MAT * DRGNMAT% /100)] * (LV + 5) * 5 / MDF} * Multiplier / 100] * Target Fear * Power} * Field] * Element}`. Multiplier canon (not STR%).

- [ ] **STR% vs Multiplier UI canon** — STR% display unreliable (errors), Multiplier authoritative. Damia : store Multiplier, UI possible STR% style mais use Multiplier canon.

- [ ] **26 Dragoon spells canon** (master table mechanics.md) :
  - Dart Red-Eye (4 spells Fire) + Dart Divine DS (2 spells Non-Elemental)
  - Lavitz/Albert Jade (4 Wind, Blossom Storm/Rose Storm naming variant canon)
  - Rose Dark (4 Darkness, Demon's Gate **100% Instant Death** canon, Astral Drain heal-share)
  - Shana/Miranda White-Silver (4 Light+heal/revive utility)
  - Haschel Violet (4 Thunder single-target, Thunder Kid 100% Stun)
  - Meru Blue-Sea (4 Water+heal, Rainbow Breath cure status + heal 50%)
  - Kongol Gold (**3 Earth AoE only** — Kongol exception DLV 2 skip)
    → À implémenter `dragoons/magic.md` (à créer) + data canon. Source: mechanics.md §Magic.

- [ ] **Demon's Gate 100% Instant Death canon** (Rose DLV 3) — spell unique canon. Boss probable immune (status immunity 8/8 — mais Instant Death distinct ? À clarifier).

- [ ] **Blossom Storm/Rose Storm canon mécanique** — Power Up state buff allies 3 turns, persists death, applies revive. **No stack with Power Up item** canon. **Rare attacks ignore Power Up calculations** (Rare Monster Rare Attack + Ghost Commander Haunting Bolt bypass). À documenter combat/status-effects.md.

- [ ] **Special Battle Command canon mécanique** :
  - All 3 party SP max + none in Dragoon form → "Special" available
  - All party transforms simultaneously
  - Background → Dragoon Space (instigator's element)
  - Instigator D'attacks auto-complete (bypass spirit meter)
  - **Field +50% same element / -50% opposite element** in Dragoon Space
  - **Dragon-named spells (Red-Eye Dragon, Jade Dragon, etc.) IGNORE Field** despite Dragoon Space graphics
    → Data-model `DragoonSpell.ignoresField: boolean` flag. Source: mechanics.md §Special.

- [ ] **H.R. Giger influence canon** — Dragoon art style. **Miranda's torso armor in Dragoon form** = grotesque remnant. À refléter design Damia (le code) Dragoon transformation cinematics + Miranda design accent.

- [ ] **Dragoon flight speed canon** — 1,200 km/h (sound barrier just). **Some teleport** ability. Lore + possible mécanique Mode Survival.

- [ ] **Backwash distort nature canon** — Dragon-Virage clashes residue distort nature for 1000s years post-Dragon Campaign. World map Damia : zones still affected ? Implications design Disc 1-4 environnement.

- [ ] **Dragoon Spirit eye-merge mécanique** déjà documenté dragons.md/dragon-campaign.md — cohérent canon mechanics.md confirme.

- [ ] **"Sometimes powers differ between two wielders of same DS" canon** — implication Lavitz vs Albert (Jade) ou Shana vs Miranda (White-Silver) avec subtle differences. À investiguer ingestion party-members futures.

- [ ] **Items canon SP-related** à documenter `items/` (à créer) :
  - Spirit Potion (consumable 100 SP)
  - Recovery Ball (consumable random 100 SP)
  - Spirit Ring (accessory +20 SP/turn passive)
  - SP+ équipements : Fairy Sword, Pretty Hammer, Energy Girdle, Wargod's Sash
  - Magic-damage SP grants : Knight Helm, Giganto Helm, Jeweled Crown, Soul Headband, Robe, Ruby Ring
  - Physical-damage SP grants : Sparkle Dress, Master's Vest, Giganto Armor, Saint Armor

### Dragon Campaign fandom complement — narrative depth + new NPCs/items canon

- [ ] **3 Cutscenes canon FMV Dragon Campaign** :
  - **Cutscene 3** : Minister Noish Bale Disc 1 (Legend of the Dragoons)
  - **Cutscene 6** : Rose's Memory Lidiera Disc 2 (final battle Kadessa flashback)
  - **Cutscene 8** : Librarian Ute Deningrad Disc 3 (history détaillée)
    → Pattern progressive story reveal Disc 1→2→3. À orchestrer fidèle Mode Story Damia. Source: [`features/dragoons/dragon-campaign.md`](features/dragoons/dragon-campaign.md).

- [ ] **Diaz canon "Holy Emperor of Gloriano"** + supplies DS to Greham/Doel/Lenus canon — distributing 3 villain DS canon Disc 1-2 (setup antagoniste pour final Disc 4 reveal). À documenter `lore/emperor-diaz.md` (à créer).

- [ ] **3 Divine Moon Objects canon post-war** distributed Serdio/Tiberoa/Mille Seseau royalties as Wingly peace offering :
  - **Moon Mirror** (Mille Seseau, Tower of Flanvel sealed, Theresa key Disc 3) — confirmed canon
  - **Serdio object** — à identifier (probable Basil royals)
  - **Tiberoa object** — à identifier (King Zior royals Fletz)
    → Humans **unaware of nature of power** canon. Implication : Moon Objects = setup pour Moon Child cycle ? Lien Charle Frahma Ulara reveal Disc 4. À documenter `lore/moon-objects.md` (à créer).

- [ ] **Zieg+Rose love story canon Dragon Campaign** — Rose **fiancée de Zieg** canon, fell in love during Campaign. **Rose failed hold on to Zieg final battle** (trauma — refuse let go Dart Lidiera Disc 2 Phantom Ship). Cohérent narrative arc Rose Disc 2. À documenter `party-members/Rose.md` + cinematic Mode Story.

- [ ] **Belzac+Shirley fondness canon** — Belzac had particular fondness for Shirley → died protecting her Kadessa Virage. Cohérent narrative tragique Belzac.md.

- [ ] **Shirley canon enrichi** :
  - **Convinced Kanzas to join Dragoons** (Kanzas bloodthirsty reputation)
  - **Spirit Shrine of Shirley Serdio** + **Dragoni plant grows** canon
  - **Tests Dart/Rose/Lavitz worthiness** Disc 1 (Shrine of Shirley arc, save Shana)
  - **Meets group Vellweb** post-trials — **fixed original Dragoons' souls Vellweb away from Death City Mayfil** → released to heaven
  - À documenter `bosses/Shirley.md` (à créer) + `locations/Shrine of Shirley.md` (à créer).

- [ ] **Kanzas bloodthirsty canon** — Shirley convinced him join Dragoons (contrast personality). À refléter dans `bosses/Kanzas.md` (à créer).

- [ ] **Syuveil canon "afraid of Mayfil"** — soul stayed Endiness post-death. **Does not appear FMV Disc 2 Rose Memory**. À documenter `bosses/Syuveil.md` (à créer).

- [ ] **Damia canon mermaid heritage clarifié** — **daughter of human + mermaid** (vs "half-Mermaid" autres pages). 15 ans Dragon Campaign début. Outcast most of life. **Afraid alone → soul stayed Endiness** (cohérent fandom Damia Rose "pleads not leave alone"). À refléter dans Damia.md.

- [ ] **Charle Frahma canon NPC** — Rose's friend canon, **gave the Choker** (11k ans stop-time mechanism). Famille name "Frahma" = lien Melbu Frahma ? Sister/relative possible. À documenter `lore/charle-frahma.md` (à créer) + lien Ulara Signet Sphere reveal Disc 4.

- [ ] **Faust canon NEW NPC** — **Possibly most powerful Wingly ever** + Melbu's **2nd in command** + **Commander of Tower of Flanvel** + apparition same-power ability + **Vanishing Stone safeguard** created by Melbu against him. Possible boss canon Tower of Flanvel Disc 3 ? À documenter `bosses/Faust.md` (à créer).

- [ ] **Vanishing Stone canon item** — Melbu Frahma created against Faust. Statut present inconnu. Possible item Disc 3-4 Tower of Flanvel arc. À documenter `items/key-items.md` (à créer).

- [ ] **Spear Shooter canon Vellweb weapon** — Liberation Army weapon to **shoot down Wingly cities** (5 floating cities + Flanvel). Visible Vellweb background canon (fandom gallery). À documenter `locations/Vellweb.md` (à créer) + `lore/spear-shooter.md`.

- [ ] **5/7 Dragoons died canon precise** — survivants : Rose (immortelle) + Zieg (petrified). Morts canon : Belzac + Shirley + Kanzas (Kadessa) + Damia (first) + Syuveil. 4 souls Vellweb (fixed by Shirley away from Mayfil) + Shirley Shrine separate.

- [ ] **Zieg post-petrification narrative canon** :
  - Spell **wore off 11k ans plus tard**
  - **Married Claire Feld** + son **Dart born**
  - **Black Monster attack Neet 18 ans pre-game** :
    - Zieg takes them outside + **returns into village helping villagers**
    - **Never seen again by Dart**
    - Claire follows → also never seen again
  - **Dramatic return Disc 4** canon (possessed by Melbu essence)
    → À orchestrer cinematic Damia Mode Story Disc 4 endgame + cohérent Dart backstory `party-members/Dart.md`.

- [ ] **Virage mysterious connection to Shana canon** — fandom dit "show mysterious connection". Lien Disc 3-4 reveal (Shana = Moon Child donc Virage related ?). À investiguer `bosses/Virage.md` (à créer) + `lore/moon-child-cycle.md`.

- [ ] **Death City Mayfil canon** — Shirley fixed souls **away from Mayfil**, vers heaven instead. Implique Mayfil = destination naturelle souls = lieu purgatoire / underworld canon. Pattern Damia (le code) : Mayfil = lieu Disc 4 souls travel before "true death". À documenter `locations/Mayfil.md` (à créer).

- [ ] **Quotes canon Minister Noish + Ute** — à utiliser pour scripts Mode Story Damia (Cutscene 3 Bale + Cutscene 8 Deningrad). Foundational lore narration verbatim canon.

- [ ] **Pattern lore : "Frahma" surname canon** — Melbu Frahma (dictator) + Charle Frahma (Rose's friend). Famille canon Wingly ? Relatives ? À investiguer.

### Dragons fandom complement — Lenus/Greham Dragoons canon + Michael Black Burst + Dragon weapons

- [ ] **REVEAL canon majeur — Lenus = Blue Sea Dragoon** (pas juste un boss !) — Lenus était une Dragoon Water Disc 2 canon (Regole = son vassal). Implication : **Lenus aurait pu être party member alternate**. Conflict avec Meru's Blue Sea Spirit inheritance Disc 2 post-Phantom Ship arc à reconcilier. À documenter `bosses/Lenus.md` (à créer) + corrections `party-members/Meru.md`. Source: [`features/dragoons/dragons.md`](features/dragoons/dragons.md) §Lenus.

- [ ] **REVEAL canon — Greham = Jade Dragoon canon** (Feyrbrand = son vassal Dragon). Cohérent pattern Jade Dragon archetype canon : **Syuveil (Vellweb ancien) → Greham (Hoax) → Lavitz (Disc 1 post-Hoax fight) → Albert (Disc 2 post-Lavitz death)**. 4 wielders Jade Dragoon canon = pattern Archetype + Avatar (cohérent VISION §6.6). À documenter `bosses/Greham.md` (à créer) + enrichir `dragoons/README.md` Jade Dragon archetype.

- [ ] **Albert quote canon (Mille Seseau National Library)** — book about Dragons claiming "couldn't avoid being annihilated" — wrong (Dart trivia note). Quote canon foundational : Dragons = **2nd most powerful species of 107 created by Divine Tree** (1st implicite = Virage Embryo). **Soa reduced Dragon intelligence intentionally** pour balance → controlled by Humans. Quest scene Disc 3 Library. À orchestrer Mode Story `quests/disc3-deningrad-library.md` (à créer).

- [ ] **108 vs 107 species canon reconcilier** — Divine Tree dit 108 fruits. Fandom dit "107 creatures given life". Implique **108ème fruit Virage non encore born** (sealed Moon) → seulement 107 species "given life" actuellement. À clarifier `lore/108-species.md`.

- [ ] **Anti-Dragon Wingly weapons canon** :
  - **Dragon Buster** = ethereal sword designed to kill Dragons (canon, usage in-game ?)
  - **Dragon Block Staff** = reduces Dragon power (canon, recovered Forest of Winglies Disc 3 quest, used vs Divine Dragon Mountain of Mortal Dragon)
    → À documenter `items/key-items.md` (à créer). Dragon Buster = nouveau item lore canon à investiguer existence in-game.

- [ ] **Michael "Black Burst Dragon" canon** — Rose's vassal Dragon (Darkness 5-eye). Born from **sacrificed Darkness Dragon** by Rose (canon Disc 4 flashback). **Eventually became savage + uncontrollable** → **attacked Rose** → **Rose killed him** canon. Tragic immortal lose pattern. À documenter `lore/michael.md` ou `bosses/Michael.md` (si in-game). Shape canon : pterodactyl.

- [ ] **Divine Dragon canon enrichi** : 7 wings, multiple eyes head (**largest at lower jaw**), sealed inside **Mountain of Mortal Dragon** (pas Crystal/Signet Sphere). **Fought Winglies on his own** sans allying Humans (unique parmi Dragons). À documenter `bosses/Divine Dragon.md` (à créer).

- [ ] **Dragoon Spirit manifestation canon** — mécanique exacte never fully explained. 2 cas in-game canon :
  1. **Divine Dragon death** → soul transferred into Spirit
  2. **Rose sacrificed Darkness Dragon** → obtained Spirit
     → Suggère : **Dragon mort = soul → manifest as DS**. Pattern à refléter `dragoons/obtention.md` (à créer).

- [ ] **Spéculation immortal vs mortal Dragons canon** — DS Dragons = immortels (live on in Spirit), autres = mortels (cf. nom "Mountain of Mortal Dragon" canon). À investiguer + reflect lore.

- [ ] **Darkness Dragon = only Dragon sacrificed canon** — Rose seule à avoir sacrificed her Dragon pour DS (vs autres = mort naturelle / combat). **Pattern unique darkness/Rose** ? Lien Black Monster lore Rose ?

- [ ] **Black Castle "Purple Flame Dragon" speculation canon** — corpse suspended in basement, magical research. 2 theories canon :
  - Doel sacrificed his Dragon for magical research (color match magic oil lifts, Doel can't summon Violet Dragon ?)
  - Corpse = slain Feyrbrand (post-Greham defeat ?)
    → À investiguer + documenter `locations/Kazas.md` §Magical Research enrichi.

- [ ] **9 minor Dragon mob types canon** : Sea Dragon, Dragonfly, Baby Dragon, Beastie Dragon, Mega Sea Dragon, Wyvern, Swift Dragon, Air Combat, Triceratops. Encountered Mountain of Mortal Dragon + Marshlands. Implique **Dragons 1-3 eyes existent comme regular mobs** (lesser Dragons hierarchy). À documenter `combat/mobs.md` (à créer) + per-location encounters.

- [ ] **Dragons of Dragoon Spirits — DLV 5 summon visuals canon** :
  - Red-Eyed : missile warhead 6 eyes → charge + explode
  - Jade : whale 4 wings + cannon → giant gust
  - Violet : stag beetle pincers → electric tackle discharge
  - Dark Dragon : asymmetric space shuttle → absorb darkness + light trace
  - White-Silver : spaceship → laser judgment + heal party
  - Blue Sea : flying fish → freeze ground + tidal waves + whirlpool
  - Golden : armadillo + cannon → quicksand + cannon sky
    → **Aesthetic "creature + tech hybrid" canon TLoD signature** : missile/spaceship/cannon visuels. À respecter pour design Damia (le code) DLV 5 summon attacks. Cf. `dragoons/magic.md` (à créer).

- [ ] **7 Dragoons sent par Emperor Diaz canon Dragon Campaign** — confirme 7 anciens Dragoons : Belzac (Gold/Earth) + Damia (Blue Sea/Water) + Syuveil (Jade/Wind) + Kanzas (Violet/Thunder) + Shirley (White-Silver/Light) + Rose (Darkness) + Zieg (Red-Eyed/Fire) = 7. À documenter `lore/dragon-campaign.md`.

### Dragons (créatures canon, lore foundational TLoD)

- [ ] **Data-model Dragon canon** — `Dragon { id, name, element, eyes: 1-7, status: alive|dead|spirit, location?, owner?: DragoonId }`. 7 anciens 6-eye + 1 Unnamed 7-eye + Michael 5-eye Darkness + Divine Dragon (king) + 3 vivants present + 1 carcass Black Castle = ~13 Dragons documentés canon. Source: [`features/dragoons/dragons.md`](features/dragoons/dragons.md).

- [ ] **Dragoon command rule canon** — `canCommand(dragoon, dragon) = sameElement && spirit.eyes > dragon.eyes`. Element match + Spirit's source Dragon had MORE eyes que target. Exemple canon : Rose 6-eye Darkness DS → command Michael 5-eye Darkness ✅. À implémenter `dragoons/command-rule.md` (à créer).

- [ ] **Hierarchy eye count canon (1-7 + Divine king)** — 6-eye = elite Dragon Campaign tier (7 anciens élémentaux), 7-eye = top tier (Unnamed), Divine Dragon = king (eye count unspecified, super-tier). Lesser Dragons (1-3) existent canon mais non documentés. À refléter design Damia (le code) — visual Dragon model 6 eyes = standard, 7 = special.

- [ ] **Red-Eyed Dragon "eyes actually green" canon** — design détail canon : nom "Red-Eyed" mais les yeux sont **GREEN**. Important pour design visual Damia (le code) — ne pas confondre nom et apparence.

- [ ] **Michael — Rose's vassal Dragon canon** — Darkness 5-eye Dragon, fought Wingly + Virage Dragon Campaign. Lore character à documenter `dragoons/lore/michael.md` ou `bosses/Michael.md` (à créer si apparaît in-game).

- [ ] **Unnamed 7-eye Dragon canon** — fight contre Divine Dragon, defeated. Lore-only probable. À investiguer canon source supplémentaire.

- [ ] **Deceased Dragon Black Castle Kazas canon** — Dragon mort harvested for magical energy. Cohérent Doel magical research canon. Possible source Sandora power. Implication lore : Sandora exploite Dragon mort = canon mécanique Dragoon Spirit potentielle ? À investiguer + cross-ref [Kazas.md](features/locations/Kazas.md) + [Emperor Doel.md](features/bosses/Emperor Doel.md).

- [ ] **Magical Gem vs Dragoon Spirit Stone naming canon** — wiki Dragons dit "magical gem" (drop Dragon mort), Vellweb anciens drop "Spirit Stone" (Golden Stone, Blue Sea Stone). **Même item canon ou distinction** ? À clarifier `dragoons/obtention.md` (à créer).

- [ ] **Timeline divergence canon** — wiki Dragons "~11,682 ans ago" vs autres pages "11,000 ans". Probable approximations canon — reconcilier `lore/timeline.md` (à créer) ou `dragoons/dragons.md`.

- [ ] **Pattern 7 anciens Dragoons élémentaux 6-eye** — tous les 6 anciens Dragon Campaign Dragons sont 6-eye (coïncidence canon ou design intentionnel ?). 7th : **Red-Eyed Dragon → Zieg Feld** (Dart's father, Disc 4 reveal canon). Implication : **Zieg = 7ème ancien Dragoon canon** (cohérent Dragon Campaign 7 Dragoons folklore Ute).

- [ ] **Dragons "many can fly" canon** — pas tous. Implication design Damia : Dragons mobiles (Feyrbrand forest moving), boss aériens (Divine Dragon flies), Dragons terrestriaux peut-être (Regole sea).

- [ ] **3 vivants Dragons present canon : Feyrbrand + Regole + Divine Dragon** — bosses canon, à documenter chacun (`bosses/Feyrbrand.md`, `bosses/Regole.md`, `bosses/Divine Dragon.md`). Stats + abilities + drops à compléter via ingestion bosses pages.

### Locations + Story / Lore (Donau fandom — 3 visits canon + relations clarifiées + Queen Fury)

- [ ] **⚠️ MÉTA leçon ingestion** : éviter les déductions/suppositions hors-canon dans les notes synthèse. Exemple bug self-introduit : ingestion wiki Donau initial avait ajouté "(Lynn's mother probable)" sur Kate alors que wiki LoD ne précisait **pas** la relation. Fandom a ensuite révélé Kate = Lynn's fiancée. **Pattern à éviter** : si la source n'indique pas X, ne pas l'inférer dans la doc — marquer "relation non précisée" plutôt que deviner. À documenter dans `meta/ingestion-rules.md` (à créer) ou README features.

- [ ] **Relations canon Donau (clarifiées par fandom)** : **Kate = Lynn's fiancée**, **Mayor = Lynn's father**. Lynn went alone convince Gehrich Gang "few days before wedding day". (Wiki LoD ne précisait pas les relations, fandom seul source canon ici). À refléter `npcs/donau.md` (à créer). Source: [`features/locations/Donau.md`](features/locations/Donau.md).

- [ ] **Donau localisation canon Tiberoa** — Donau dans **nord de Tiberoa** (fandom prime). Tiberoa = kingdom canon avec Fletz capital + King Zior + Twin Castle. À documenter `lore/tiberoa.md` (à créer) + `locations/Fletz.md` (à créer).

- [ ] **3 visits canon Donau Disc 2** :
  - **First Visit** : Meru recruit + Lynn rescue setup (mandatory)
  - **Second Visit optional** : Wedding ceremony Kate+Lynn (post-Gehrich Home of Gigantos)
  - **Third Visit** : Queen Fury boarding pursue Lenus Prison Island (post-Lenus Twin Castle)
    → À orchestrer cinematic Damia (le code) avec story flags per visit. Source: Donau.md.

- [ ] **Meru recruit canon mandatory** — "joins regardless of Dart's answer". Mandatory party member Disc 2 (pas optional). Dart's question = flavor only. À reflèter recruit logic (no branch).

- [ ] **Twin Castle bedroom dialogue trigger canon** — trigger pour Meru bouquet outcome est **post-first banquet Twin Castle bedroom** (Fletz castle scene). Dart : "Meru pretty in wedding dress" Y/N. Si N → Haschel "lacks mature charm" + irks Meru canon. À orchestrer `quests/disc2-fletz-banquet.md` (à créer).

- [ ] **Queen Fury boarding canon Donau Third Visit** — Commodore Puler (captain) + Kayla (assistant) NPCs. Routes : Donau-Fueno + Donau-Furni (Mille Seseau). À documenter `locations/Queen Fury.md` (à créer) + `npcs/queen-fury-crew.md`.

- [ ] **Mr. Pelpee Mininto canon NPC** — confirme **Mininto species existe in-game** (cf. Divine Tree 99th fruit). Au bar Donau post-Kongol joins (vient de Lohan). Donne hint optional Kongol DS location (Lohan). À documenter `npcs/mr-pelpee.md` + enrichir `lore/108-species.md`.

- [ ] **Mille Seseau knights chasing Lloyd canon Disc 2** — trivia canon : knights searching Lloyd around Donau shops post-Wink rescue. Implique **Lloyd antagoniste connu déjà Disc 2** par Mille Seseau. À documenter `lore/lloyd-arc.md` (à créer).

- [ ] **Gehrich Gang bandits canon Disc 2** — terrorise Donau (mid-Disc 2 antagoniste). Origin canon : "area beyond Valley of Corrupted Gravity". Boss **Gehrich** au Home of Gigantos. À documenter `bosses/Gehrich.md` (à créer).

- [ ] **King Zior + Tiberoa kingdom canon** — King Zior Fletz autorise entrée Valley of Corrupted Gravity. Tiberoa kingdom Disc 2. À documenter `lore/tiberoa.md` (à créer) + `npcs/king-zior.md`.

- [ ] **Quest path canon Disc 2 Donau-arc** : Donau (Kate Letter) → Fletz (King Zior permission) → Valley of Corrupted Gravity → Home of Gigantos (Gehrich boss) → Lynn rescue → optional return Donau wedding → continue main quest. À documenter `quests/disc2-platinum-shadow.md` (à créer).

### Locations + Story / Lore (Divine Tree fandom — reveal mechanism + Caterpillar 3-phases + Coolon dies)

- [ ] **CORRECTION canon Caterpillar = 3 phases sequential** (pas 3 mobs simultanés) — Caterpillar → Pupa → Imago, cycle de vie insectoid. Stats par phase :
  - Caterpillar : 10,400 HP (13,000 JP), N/A XP/Gold, drop Moon Serenade 100%
  - Pupa : 3,200 HP (4,000 JP), N/A XP/Gold, drop Sun Rhapsody 100%
  - Imago : 16,000 HP (20,000 JP), 13,000 EXP, 300 Gold, drop Healing Rain 100%
  - Total : 29,600 HP US/EU / 37,000 JP
    → Pattern boss canon "phase boss" : HP 0 phase → transition phase suivante. Data-model `Boss.phases: BossPhase[]`. Réutilisable Emperor Doel 2-forms, Melbu Frahma final boss probable. Source: [`features/locations/Divine Tree.md`](features/locations/Divine Tree.md) §Boss.

- [ ] **Reveal mechanism Divine Tree canon Disc 4** — final Signet Sphere détruit à **Mayfil** → Moon falls to earth → bright flash → Divine Tree reveals dans desert-like land. Moon crushes branches du Tree, link via thin branches, **hundreds of Virage crawl out of Moon** = forebearers du **God of Destruction** (108th species). À orchestrer cinematic Disc 4 Damia.

- [ ] **"Signet of Soa" canon** — distinct ou lié aux Signet Spheres ? Bishop Dille quote canon : "protected by the Signet of Soa". Le Divine Tree est protégé par ce seal Soa-related. Lien avec chain Signet Spheres (Crystal Palace Deningrad + Aglis + Mayfil = 3 connus minimum) ? À investiguer + documenter `lore/signet-of-soa.md` ou unifier `lore/signet-spheres.md`.

- [ ] **Soa + followers canon** — fandom révèle : Soa "descended from the sky" avec **followers** qui ont créé le monde. Multiple deities ? Soa = chief deity + équipe créatrice ? À documenter `lore/soa-divine-tree.md` (à créer).

- [ ] **7 rooted branches canon Divine Tree** — design visuel canon. 7 = nombre symbolique probable (7 anciens Dragoons ? 7 Sacred Sisters ? coincidence ?). À refléter design Damia (le code) — Tree visual.

- [ ] **"God of Destruction" canon name** — fandom révèle : 108th fruit Virage = "God of Destruction" supposé naître. Distinct du concept "ends all life". Nom officiel à utiliser. À documenter `lore/virage.md` (à créer).

- [ ] **Coolon dies canon** — post-crash mid-flight Virage intercept au pied du Divine Tree. Moment tragique. À orchestrer cinematic Damia (le code). Coolon = vehicle/creature Wingly canon mort en service.

- [ ] **Energy streams Divine Tree** — mécanique gameplay vertical movement. Party climbs upward via energy streams. Auto-heal après stream exit (cohérent rest Water free). Pattern unique location.

- [ ] **Point of no return canon Mayfil → Divine Tree** — leaving Mayfil = no return Endiness. Story flag majeur. À orchestrer warning UI Damia (cohérent canon last-warning prompt).

- [ ] **"Death City Mayfil" canon name** — fandom canon. À utiliser pour ingestion future Mayfil.

- [ ] **"New species from unhatched fruit" canon** — Caterpillar/Pupa/Imago = species canon, fruit non éclos oublié. Lore : explique pourquoi certaines espèces n'ont jamais éclot. À documenter `lore/108-species.md`.

- [ ] **Mob HP canon Divine Tree** : Potbelly 560, Slug 1,200, Cute Cat 704, Manticore 960, Mountain Ape 1,000 (US/EU). JP +25% standard sauf **Mountain Ape JP 1,800 = +80%** (outlier à reconfirmer tier 1, possible typo fandom).

- [ ] **Manticore element divergence canon** — wiki LoD = Darkness / fandom = Earth. Wiki LoD prime. À reconfirmer tier 1 si possible.

- [ ] **Walkthrough linear canon** — Divine Tree = completely linear dungeon, climb upward only. Pattern simple Damia (le code) — pas de maze branching (vs Death Frontier).

- [ ] **"Relics of the past" canon** — dried up fruits visibles dans le Divine Tree (les 107 fruits déjà tombés). Décor narratif à intégrer Damia (le code). Possible interaction NPC/codex pour lore (cohérent National Library Deningrad pattern).

### Locations + Story / Lore (Death Frontier fandom — narrative + farming canon)

- [ ] **Power Up + Power Down items canon distincts (Repeat Items)** — clarif user : ce sont **2 items différents canon**, pas une divergence de nommage :
  - **Power Up** = buff allié, AT/DF +X pendant **3 tours**
  - **Power Down** = debuff ennemi, AT/DF -X pendant **3 tours**
    → Wiki LoD dit Power Up à chest 775, fandom dit Power Down. À confirmer tier 1 capture in-game pour savoir lequel est vraiment dans le chest. Les 2 items existent dans le jeu. À documenter `items/consumables.md` (à créer) avec mécanique 3-turn duration buffs/debuffs canon. Source: [`features/locations/Death Frontier.md`](features/locations/Death Frontier.md).

- [ ] **Mécanique buff/debuff 3-turn canon** — Power Up + Power Down = pattern items "temporary stat modifier" 3 turns. Data-model : `Item.effect.duration: number` (turns). En real-time Damia : conversion turns → seconds (e.g. 1 turn = 5 sec ?). Pattern réutilisable si autres items canon similaires. À investiguer items canon transverse.

- [ ] **Slide treasure mechanic canon** (Death Frontier) — 5 paires chests connectées par "slide direction" (north/west/east/south) via quicksand intentionnelle. Distinct du "trapped sinkhole" (= reset to checkpoint). Data-model : `Sinkhole.intentional: boolean`, `destination?: SubmapId`. Pattern réutilisable canon.

- [ ] **Collision Encounter pattern canon** = Death Frontier + Phantom Ship (Disc 2) + autres ? Mobs visibles + contact = battle, mobs respawn after battle (Cactus exception = needs screen change). Damia (le code) natif cohérent (real-time iso). À confirmer pattern transverse.

- [ ] **Rose's Choker artifact canon** — Wingly magical choker stop-time 11k ans + reveal Ulara mechanism. Disc 4 reveal canon. À documenter `lore/rose-choker.md` ou `items/key-items.md`. Pattern : artifacts Wingly anciens (Dragon Block Staff, Moon Mirror, Signet Spheres, Rose Choker, etc.).

- [ ] **Ulara reveal mechanism canon** — ancient Wingly construction au sol (teleport mechanism) + Rose Choker → Ulara apparaît. À orchestrer cinematic Damia (le code). Premier reveal Spring Breath Town.

- [ ] **Miranda slaps Rose motivation canon** — Rose dismissive attitude post-Black Monster identity reveal → Miranda slaps pour "jeopardizing group efforts". À orchestrer `quests/disc4-death-frontier.md` (à créer). Conflit Sacred Sister vs immortelle 11k ans.

- [ ] **Meru Wingly sensing capability canon** — "senses people's feelings ahead". Lore mécanique Wingly. Implication : Meru = navigation hint pour Wingly hidden locations (Forest of Winglies + Ulara). Possible gameplay UI : Meru indicator pour Wingly content. À documenter `party-members/Meru.md`.

- [ ] **Lucky Jar mob canon** (world map Death Frontier ↔ Ulara) — 6 HP, **1,000 EXP**, **300 G**, drop **Moon Serenade**, **only vulnerable to Poison**. Pattern "metal slime" canon TLoD. À documenter `combat/mobs.md`. Stratégie : Mind Crush proc / Poison Needle / Scorpion drop chain.

- [ ] **Rainbow Bird mob canon** (world map Death Frontier ↔ Ulara) — 4 HP, **3,000 EXP** (record canon!), 0 G, drop **Rainbow Dress** (new accessory canon), **only vulnerable to Confusion**. Best EXP/HP ratio canon. Stratégie : Mind Crush Confusion proc. À documenter `combat/mobs.md`.

- [ ] **Mob damage rules canon — "Only vulnerable to status X"** — Lucky Jar (Poison) + Rainbow Bird (Confusion) = pattern "**only kill via status proc**". Data-model : `Mob.damageRules.onlyDamageWhen: StatusEffect[]` ou similar. Implication : status effects = damage source canon valide. Réutilisable ailleurs ? À investiguer.

- [ ] **Rainbow Dress accessory** (Rainbow Bird drop) — nouvel accessory canon. Effet ? Lien rainbow element / luxury accessory ? À documenter `items/equipment.md`.

- [ ] **Moon Serenade item** — drop Lucky Jar + chest Death Frontier paire 1. Lien lore Moon Objects ? Healing ? Attack Moon-themed ? À investiguer `items/`.

- [ ] **Mob HP canon Death Frontier** : Sandworm 1440 / Spiky Beetle 480 / Canbria Dayfly 520 / Scorpion 280 / Cactus 320 (US/EU). JP +25% systématique. À reproduire `src/data/balance.ts` MOBS.

- [ ] **Mob Gold divergence US/EU vs JP ~/3** — pattern canon récurrent (Belzac aussi). JP version = less gold reward systématique. Cible Damia (le code) probable US/EU. À noter `combat/canon-divergences.md`.

- [ ] **Cactus respawn exception canon** — Cactus needs screen change to respawn (vs autres mobs respawn immédiat). Mécanique anti-farming spécifique. Data-model : `Mob.respawnRule: "immediate" | "screen_change"`.

- [ ] **Farming canon : Death Frontier** — area officielle pour farming XP/SP/additions selon wiki LoD. Cible Miranda (souvent left behind) + Kongol DLV. Sandworm solo encounter friendly. Implication design Damia : zones de farming canon à respecter en Mode Story balance.

- [ ] **Zieg shocking revelations Vellweb** — quoi exactement ? À documenter `quests/disc4-vellweb.md` (à créer). Probable : father reveal Dart + possessed by Melbu Frahma + Dragon Campaign truth.

- [ ] **Spring Breath Town Ulara naming canon** — "Spring Breath" descriptor + Ulara name. Wingly hidden city pattern (cf. Forest of Winglies). À documenter `lore/wingly-cities.md` (à créer).

### Items / Equipment (master canon TLoD — 5 slots, 7 weapon classes, 7 DG armors elemental)

- [ ] **🆕 Data-model `Equipment`** — Définir types canon : `slot ∈ {weapon, headwear, body_armor, footwear, accessory}` + `restrictions` (character[], gender, custom). Probablement `src/data/equipment.ts`. Source: [`features/items/equipment.md`](features/items/equipment.md). Priorité: **haute** (préréquis combat).

- [ ] **🆕 Data-model effets équipement modulaires** — Séparer `stats: { AT, DF, MAT, MDF, A_HIT, M_HIT, A_AV, M_AV, SPD }`, `passives: { onTurnStart, onPhysicalDamageTaken, onMagicalDamageTaken, onDeath, statusPrevention[], elementalReduction{element: factor} }`, `weaponEffect: { type: 'addition_element' | 'attack_element' | 'addition_sp_bonus' | 'status_proc' | 'aoe_physical' | 'hp_scaling' | 'self_damage', payload }`. Source: equipment.md §7. Priorité: **haute**.

- [ ] **🆕 7 weapons classes character-locked canon** — Dart=sword, Lavitz/Albert=spear (lance/glaive/halberd), Shana/Miranda=bow, Rose=dagger/rapier, Haschel=fist/knuckle, Meru=hammer/mace, Kongol=axe. Conserver restrictions strictes canon. À modéliser dans `src/data/weapons/` par character. Source: equipment.md §2.

- [ ] **🆕 7 Dragoon (DG) armors elemental immunity** — Red (Fire/Dart), Jade (Wind/Lavitz-Albert), Silver (Light/Shana-Miranda), Dark (Darkness/Rose), Blue (Water/Meru), Violet (Thunder/Haschel), Gold (Earth/Kongol). **Effet canon = reduces elemental magic damage TO 0** (pas -50% / -75% mais 0). À implémenter slot-based passive. Source: equipment.md §4.

- [ ] **🆕 7 elemental damage reduction stones canon -50% magic** — Red-Eye (Fire/Fire Bird drop), Silver (Light/Shirley), Jade (Wind/Syuveil), Blue Sea (Water/**Damia** ⭐ project namesake), Violet (Thunder/Kanzas), Golden (Earth/Belzac), Darkness (Darkness/Kamuy). **Pattern canon : drops 100% des bosses Dragoon Dragon Campaign** = legacy story design. Source: equipment.md §6. Priorité: **moyenne** (post-bosses).

- [ ] **🆕 Status prevention accessories canon** (8 single + 1 ALL) — Poison Guard / Active Ring (Dispiriting) / Panic Guard (Confusion) / Stun Guard / Bravery Amulet (Fear) / Magic Ego Bell (Bewitchment) / Protector (Arm-Blocking) / Talisman (Instant Death) / Destone Amulet (Petrification) / **Rainbow Earring** (ALL — Martel 40 Stardust). Status prevention = passive `statusPrevention[]` sur Accessory. Source: equipment.md §6.

- [ ] **🆕 Wargod Calling / Ultimate Wargod auto-Additions canon** — Wargod Calling = auto mais dmg/SP halved + no Addition level-up (1000G Lohan/Fletz, Rouge chest, Kongol Black Castle 30%). Ultimate Wargod = auto full power (10,000G Lohan, Phantom Ship mini-game). Restriction canon : **not Shana/Miranda** (elles n'ont pas d'Additions). Source: equipment.md §6.

- [ ] **🆕 Soul Eater Dart trade-off canon** — +75 AT mais -10% max HP/turn auto. Pattern unique "self-damage" canon. Drop Polter Sword 100% (boss?) / Loner Knight 2% (mob?). Décision Damia : conserver tel quel ou rééquilibrer ? Source: equipment.md §2 Dart table + §7 décisions.

- [ ] **🆕 Detonate Arrow AoE canon — UNIQUE weapon AoE physical** — Seul weapon canon attacks all enemies simultaneously (Shana/Miranda, +50 AT, Chest Moon That Never Sets). Préserver unicité du pattern. Source: equipment.md §2 + §7.

- [ ] **🆕 Destroyer Mace Haschel HP scaling canon** — ×1.5 damage si HP ≤50%, ×2 si ≤25%. Pattern "berserker" risk/reward. À implémenter via `weaponEffect: { type: 'hp_scaling', thresholds: [{ hpPct: 50, mult: 1.5 }, { hpPct: 25, mult: 2 }] }`. Source: equipment.md §2.

- [ ] **🆕 Dragon Buster Rose story reward +100 AT canon** — Acquisition unique "Story: Moon That Never Sets" (pas shop, pas drop). À gérer comme cinematic story reward + flag inventory. Source: equipment.md §2.

- [ ] **🆕 Halberd drop 50% Lavitz's Spirit canon** — Drop boss Disc 2 Phantom Ship (Lavitz spirit fight). Acquisition narrative-locked. À documenter dans `bosses/Lavitz Spirit.md` (à créer) + Phantom Ship dungeon. Source: equipment.md §2.

- [ ] **🆕 Indora's Axe drop 100% Indora canon** — Kongol's ultimate axe via Indora boss (Wingly Forest). À documenter `bosses/Indora.md` (à créer). Source: equipment.md §2.

- [ ] **🆕 Plate Mail drop 30% Greham canon** — Greham boss Nest of Dragon Disc 1 drop. Cohérent canon Wind Dragoon antagoniste Lavitz. À cross-référer `bosses/Greham.md` (à créer) + `locations/Nest of Dragon.md`. Source: equipment.md §4.

- [ ] **🆕 Jeweled Crown drop 50% Lenus canon** — Lenus boss Undersea Cavern Disc 2 drop. Cohérent canon assassin half-Wingly. À cross-référer `bosses/Lenus.md` (à créer) + Undersea Cavern. Source: equipment.md §3.

- [ ] **🆕 Phantom Shield drop 100% Magician Faust canon** — Mayfil Disc 3 boss reward. Best damage reduction accessory canon (-50% all damage). À cross-référer `bosses/Magician Faust.md` (à créer) + Mayfil. Source: equipment.md §6.

- [ ] **🆕 Dragon Shield drop 20% Divine Dragon canon** — Divine Dragon Disc 3 boss reward. Best physical reduction accessory (-50% phys). Drop rate 20% = farming incentive. À cross-référer `bosses/Divine Dragon.md` (à créer) + Mountain of Mortal Dragon. Source: equipment.md §6.

- [ ] **🆕 Armor of Legend / Legend Casque 10,000G shop top-tier canon** — Deningrad shop (Armor of Legend +127 DF -50% phys damage) + Lohan shop (Legend Casque +127 MDF -50% magic damage). Pattern "all-character endgame defense". Source: equipment.md §3 + §4.

- [ ] **🆕 Magical Hat / Dragon Helm canon +50% max stat** — Magical Hat = +50% max MP (Drop Magician Bogy 2% + Chests Aglis/Tower of Flanvel). Dragon Helm = +50% max HP (Chest Mountain of Mortal Dragon + Tower of Flanvel). À implémenter passive `maxStatBoost: { stat: 'MP'|'HP', pct: 50 }`. Source: equipment.md §3.

- [ ] **🆕 Angel Robe / Holy Ahnk revive 40% half HP stacking** — Both items grant 40% revive chance, **stack additively → 80% combined**. Pattern unique stacking canon explicite. À implémenter passive `onDeath: { revive: { chance, healPct } }` + règle additive stacking. Source: equipment.md §4 + §6.

- [ ] **🆕 Sparkle Arrow canon "Attacks deal Light" ⚠️ divergence** — Tous autres weapons elemental disent "Additions deal" — Sparkle Arrow seul dit "Attacks deal". Vérifier source tier 1 (Discord/Wulves) : Shana n'a pas d'Additions canon, donc Light proc s'applique-t-il sur attack physique normale ? Source: equipment.md §2. Priorité: **moyenne** (édge case Shana mechanics).

- [ ] **🆕 Thunder Fist + Special command bonus damage canon** — Wiki dit "Although the Thunder element has no opposite, the Thunder Fist can still apply bonus damage to Haschel's D-attack when he initiates Special." → confirme Thunder = standalone element + interaction Special command bonus. À cross-référer `combat/elements.md` (Thunder pas d'opposite) + `dragoons/mechanics.md` (Special command bonus damage interaction). Source: equipment.md §2.

- [ ] **🆕 Martel Stardust rewards canon 4 items 10/20/30/40** — Physical Ring (10 stardust, +50% max HP), Amulet (20, +100% max MP), Wargod's Sash (30, +50% SP from Additions), **Rainbow Earring** (40, prevents ALL ailments). Total 100 stardust mais collect 50 max canon ? À vérifier source. À implémenter quest `quests/stardust-collection.md` (à créer). Source: equipment.md §6.

- [ ] **🆕 "Holy Ankh" vs "Holy Ahnk" orthographe divergente wiki ⚠️** — Same wiki page écrit BOTH spellings (Body Armor table dit "Angel Robe stacks with Holy Ahnk" mais Accessory table dit "\*Holy Ankh"). À choisir canonical spelling Damia. Probablement "Holy Ankh" (égyptien original) ou "Holy Ahnk" (TLoD legacy ?). Source: equipment.md §4/§6.

- [ ] **🆕 Inventaire cap 255 items canon** — Limite hardcoded TLoD. Décision Damia : conserver cap pour authenticité OU augmenter pour QoL ? Source: equipment.md §1.

- [ ] **🆕 No equipment change in battle canon** — Restriction TLoD = équipement figé pendant battle. Décision Damia : conserver pour respect canon + cohérence stratégique. Source: equipment.md §1.

- [ ] **🆕 Lion Fur Kongol initial unique canon** — +46 DF / +20 MDF dès le départ — stats massifs pour un initial equip. Pattern "Kongol tank différencié". À refléter `party-members/Kongol.md` (à créer). Source: equipment.md §4.

- [ ] **🆕 Armor of Yore "men + Kongol" restriction canon** — Snowfield chest, prevents Poison/Stun/Arm-Blocking. **Restriction "Dart, Lavitz, Albert, Kongol"** (i.e. all men). Pattern restriction "men+Kongol" rare. Source: equipment.md §4.

- [ ] **🆕 Shop distribution par disc/location canon** — Distribution complète des prix shop par ville (Bale/Lohan/Fletz/Furni/Donau/Fueno/Kazas/Deningrad/Phantom Ship/Vellweb/Kashua Glacier/Ulara/Forest of Winglies/Zenebatos/Rouge/Moon That Never Sets). À tabuler dans `locations/` shops sub-pages. Source: equipment.md tables.

- [ ] **🆕 Albert hérite Jade DG Armor de Lavitz canon** — Pattern story "Lavitz mort Disc 1 → Albert Wind Dragoon successor → hérite équipement et DG Armor". 7 DG armors mais 8 wielders potentiels (Lavitz+Albert se partagent). À documenter `dragoons/wind.md` (à créer) + `party-members/Albert.md`. Source: equipment.md §4.

- [ ] **🆕 Mode Survival équipement canon ?** — Cf. [SCOPE §7](SCOPE.md#7-modes-de-jeu) Survival : a-t-il les 5 slots ou simplifié style roguelite (random drops + upgrades) ? À trancher pour `survival/equipment.md` (à créer). Source: equipment.md §7.

- [ ] **🆕 Repeat Items vs Equipment separation** — Equipment = 5 slots permanents. Repeat Items = consommables / Multi (ex Power Up/Down). Documentation Items canon à splitter clairement. À créer `items/consumables.md` + `items/key-items.md`. Source: equipment.md §1 + Donau Power Up/Down doc précédente.

### Items / Equipment fandom complement — 46 weapons confirmé + Unique Monsters 1-cap + divergences locations/drops

- [ ] **🆕 46 weapons total canon confirmé** — Fandom donne le count master. Utile pour validation exhaustive base de données équipement Damia (count cohérent : 8 Dart + 7 Lavitz-Albert + 7 Shana-Miranda + 7 Rose + 6 Haschel + 6 Meru + 5 Kongol = 46). Source: [`features/items/_sources/fandom-weapons.md`](features/items/_sources/fandom-weapons.md).

- [ ] **🆕 Unique Monsters 1-damage cap canon ⚠️ mécanique mob spéciale** — "the AT stat does not matter against these monsters, as they will always take 1 damage when hit". À implémenter via flag `Mob.uniqueMonster: boolean` + override damage formula → forcer dmg = 1 (sauf exception Destroyer Mace HP scaling qui bypass). Lucky Jar mentionné comme exemple Unique Monster. À documenter `combat/unique-monsters.md` (à créer). Source: fandom-weapons.md §Shana/Miranda + §Haschel. Priorité: **moyenne** (impact bosses spéciaux).

- [ ] **🆕 Destroyer Mace exception canon = SEUL weapon dépassant 1-damage cap** — HP scaling permet bypass Unique Monsters cap. Pattern unique design. À refléter logique combat. Source: fandom-weapons.md §Haschel.

- [ ] **🆕 Meru + Kongol pas de weapons elemental canon explicite** — Fandom confirme : "Meru has no Elemental Weapon" + "Kongol has no Elemental Weapon". Cohérent : Pretty Hammer = SP-only utility, pas Water elemental. Indora's Axe = Instant Death proc, pas Earth elemental. **Design canon intentionnel** : 5 elemental weapons sur 7 wielders. À refléter `combat/elements.md` + `items/equipment.md`. Source: fandom-weapons.md §Meru + §Kongol.

- [ ] **🆕 Sell prices canon ≈ 50% buy price** — Pattern systématique fandom (Heat Blade 150G buy → 75G sell, Bastard Sword 60G → 30G, etc.). À implémenter formule `sellPrice = floor(buyPrice / 2)` pour shop sell logic. Exceptions story-locked weapons : Soul Eater (no buy / 225 sell), Pretty Hammer (no buy / 200 sell), Brass Knuckle (no buy / 175 sell), Indora's Axe (no buy / 250 sell), Demon Stiletto (no buy / 80 sell), Dragon Buster (no buy / no sell), Detonate Arrow (no buy / no sell). Source: fandom-weapons.md tables.

- [ ] **🆕 Therapy Ring neutralise Soul Eater self-damage combo canon** — Soul Eater = -10% HP/turn / Therapy Ring = +10% HP/turn → net 0%. Combo synergy explicite à documenter `items/equipment.md` §Combos. Source: fandom-weapons.md §Dart.

- [ ] **🆕 Pretty Hammer + Wargod's Sash + Cool Boogie L5 = 495 SP canon optimal grind** — Setup canon Meru best SP gain per Addition. À documenter `dragoons/mechanics.md` §SP grinding + `party-members/Meru.md` (à créer). Source: fandom-weapons.md §Meru.

- [ ] **🆕 Detonate Arrow ≈ Detonate Rock Attack Item canon** — Pattern AoE physical identique. À documenter parallèle dans `items/consumables.md` (à créer) + `items/equipment.md`. Source: fandom-weapons.md §Shana/Miranda.

- [ ] **🆕 Heat Blade ×2 vs Lenus/Regole/Windigo/Undersea Cavern/Kashua Glacier enemies canon** — Fandom dit "double damage" mais wiki LoD ×1.5 — divergence ×1.5/×2 déjà résolue au profit wiki (confirmé Discord). Conserver ×1.5 mais documenter exemples enemies cibles (Lenus Water, Regole Water, Undersea Cavern dwellers Water, Windigo? Kashua Glacier Ice?). Source: fandom-weapons.md §Dart.

- [ ] **🆕 Twister Glaive ×1.5 vs Grand Jewel (Earth element) canon** — Confirme Grand Jewel = Earth element + Wind weapon counter pattern. À documenter `bosses/Grand Jewel.md` (à créer) + element matchups dans `combat/elements.md`. Source: fandom-weapons.md §Lavitz/Albert.

- [ ] **🆕 Sparkle Arrow ×1.5 vs Phantom Ship Dark element enemies canon** — Confirme Phantom Ship dungeon = mostly Dark enemies + Light Sparkle Arrow ×1.5. Refléter `locations/Phantom Ship.md` (à créer). Source: fandom-weapons.md §Shana/Miranda.

- [ ] **🆕 Pretty Hammer SP gain divergence wiki/fandom ⚠️** — Wiki LoD : "+50% more SP". Fandom : "generates double SP" (i.e. +100% more, ×2). DIVERGENCE source tier 2 vs tier 3 — **adopter wiki +50%** (cohérent avec Fairy Sword + Arrow of Force qui sont aussi +50%). À noter `combat/canon-divergences.md` (à créer). Source: fandom-weapons.md §Meru vs wiki-equipment §Meru.

- [ ] **🆕 "Polter Sword" vs "Polter Armor" enemy name divergence ⚠️** — Wiki LoD : Soul Eater drop 100% from **"Polter Sword"**. Fandom : drop 100% from **"Polter Armor"**. Le boss/mob dropant Soul Eater (Dart's ultimate sword) — quel nom canon réel ? Probable Polter Sword (cohérent thématique sword drop). À cross-checker via Discord. À noter `combat/canon-divergences.md`. Source: fandom-weapons.md §Dart vs wiki-equipment §Dart.

- [ ] **🆕 "Queen Fury" vs "Phantom Ship" shop divergence ⚠️** — Fandom dit Glaive shop = **Queen Fury**, Beast Fang shop = **Black Castle + Queen Fury**. Wiki LoD dit pour les deux **"Phantom Ship"**. Queen Fury (Disc 2 cruise ship Tiberoa-Mille Seseau) ≠ Phantom Ship (haunted ship). 2 ships différents canon. **Probable explication** : weapons disponibles Queen Fury Disc 2 (avant Phantom Ship Disc 3) — wiki utilise "Phantom Ship" comme erreur ? OU il y a 2 occasions d'acheter (Queen Fury Disc 2, Phantom Ship Disc 3) ? À vérifier in-game. À noter `combat/canon-divergences.md`. Source: fandom-weapons.md §Lavitz vs wiki.

- [ ] **🆕 Lance chest "Marshland" vs "The Seventh Fort" canon ⚠️** — Wiki = Chest Marshland. Fandom = "The Seventh Fort, Lohan". "The Seventh Fort" = fort spécifique dans Marshland canon (cohérent narrative TLoD : fort militaire défensif Serdio south) OU divergence ? À vérifier `locations/Marshland.md` (à créer) + `locations/The Seventh Fort.md` (à créer). Source: fandom-weapons.md §Lavitz vs wiki.

- [ ] **🆕 Kadessa = The Forbidden Land synonyme canon confirmé** — Mind Crush chest fandom dit "Forbidden Land", wiki dit "Kadessa". Confirme synonymie déjà notée dans worldmap observations. Source: fandom-weapons.md §Dart.

- [ ] **🆕 Forest of Winglies = Wingly Forest synonyme canon** — Variations naming. Adopter "Forest of Winglies" canonical Damia (cohérent wiki LoD master). Source: fandom-weapons.md §Meru.

### Items / Armor fandom complement — 53 armor pieces + "Dragon Armor" canon name + Fort Magrad + Faust boss + divergences stats

- [ ] **🆕 53 armor pieces total canon** — Fandom count master pour validation base de données. À vérifier exhaustivement vs wiki tier 2 (~5+5+4 headwear + 8+6+4+10+1 body + 4+4+1 boots ≈ 52). Source: [`features/items/_sources/fandom-armor.md`](features/items/_sources/fandom-armor.md).

- [ ] **🆕 "Dragon Armor" canon name (PAS "Dragoon Armor") ⚠️ MAJEUR** — Silver DG Armor chest Divine Tree gain message canon = **"White Silver Dragon Armor"**. Golden DG Armor chest Moon canon = **"Golden Dragon Armor"**. Les armures appartiennent aux DRAGONS des Dragoons, pas aux Dragoons eux-mêmes. À refléter naming Damia : adopter "Dragon Armor" comme canonical (e.g. `RedDragonArmor`, `JadeDragonArmor`, etc.) avec alias DG. À documenter `dragoons/dragons.md` + `items/equipment.md`. Source: fandom-armor.md §Trivia.

- [ ] **🆕 Fort Magrad = Armor of Yore chest location canon** — Confirme Fort Magrad **playable canon location Gloriano** (cohérent canon "Diaz Fort Magrad declaration"). Chest Armor of Yore IN Fort Magrad (probable sub-area Snowfield ou region séparée). À documenter `locations/Fort Magrad.md` (à créer). Source: fandom-armor.md §Male Armor Dart/Lavitz/Albert.

- [ ] **🆕 Faust boss canon mécanique = Tower of Flanvel area ?** — Fandom dit "Dragon Helm: Mountain of Mortal Dragon, Tower of Flanvel (**after Faust**)" + "Magical Hat: Magician Bogey (2%), Aglis, Tower of Flanvel (**after Faust**)". Implication : 2 chests Tower of Flanvel **gated derrière Faust boss défaite**. Faust boss canon = Mayfil (Death City) OU Tower of Flanvel ? À vérifier. Probable : Faust = Mayfil boss + chest spawn Tower of Flanvel after. À documenter `bosses/Magician Faust.md` (à créer). Source: fandom-armor.md §Headwear.

- [ ] **🆕 Legend Casque "crucial item to defeat Faust" canon** — Mecca anti-Faust 10,000G top-tier magic defense. À noter `bosses/Magician Faust.md` (à créer) gear pre-requirement. Source: fandom-armor.md §Headwear guidance.

- [ ] **🆕 Dragon Helm + Physical Ring additive +50% +50% = +100% max HP canon** — Combo stack additive explicite fandom. À implémenter stacking logic `maxHpModifiers: [...]` accumulant. Source: fandom-armor.md §Headwear guidance.

- [ ] **🆕 Angel Robe revive chance divergence 40% vs 45-49% ⚠️** — Wiki LoD : "+40%". Fandom : "estimated between 45-49%". DIVERGENCE — wiki tier 2 chiffre exact prévaut. Adopter 40% canon Damia. À noter `combat/canon-divergences.md` (à créer). Source: fandom-armor.md §Armor guidance.

- [ ] **🆕 Holy Ankh revive chance 40% vs 45-49% ⚠️** — Idem divergence Angel Robe — wiki tier 2 40% prévaut.

- [ ] **🆕 Angel Robe + Holy Ankh disk-swap bug rumored canon** — Fandom mentionne bug rumored disque swap. Pas applicable Damia (single-build sans disk swap mécanique). Ignorer. Source: fandom-armor.md §Armor guidance.

- [ ] **🆕 Knight Helm restriction "Kongol included" divergence ⚠️** — Wiki LoD : Dart, Lavitz, Albert. Fandom : Dart, Lavitz/Albert AND Kongol. À vérifier in-game si Kongol peut équiper Knight Helm. Probable : fandom correct (Kongol partage souvent armor "Dart-Lavitz" male). À investiguer. Source: fandom-armor.md §Male Headwear footnote.

- [ ] **🆕 Jeweled Crown MAT divergence wiki +42 vs fandom +24 ⚠️** — Wiki tier 2 prévaut probable. Adopter +42 MAT. Source: fandom-armor.md vs wiki-equipment.md.

- [ ] **🆕 Jeweled Crown Lenus drop rate divergence 50% vs 100% ⚠️** — Wiki tier 2 50% prévaut probable. Source: idem.

- [ ] **🆕 Silver Vest MDF divergence wiki +27 vs fandom +17 ⚠️** — Wiki tier 2 prévaut probable. Adopter +27 MDF. Source: idem.

- [ ] **🆕 Angel Robe stats divergence ⚠️** — Wiki LoD : +10 DF / +20 MDF / +5 A-AV / +5 M-AV. Fandom : tous 0. Wiki tier 2 prévaut probable (cohérent autres armures female). Source: idem.

- [ ] **🆕 Disciple Vest A-AV divergence wiki +10 vs fandom 0 ⚠️** — Wiki tier 2 prévaut probable (+10 A-AV). Pattern fandom omet A-AV/M-AV values systématiquement. Source: idem.

- [ ] **🆕 Rainbow Dress drop enemy divergence "Rainbow Dress (10%)" vs "Rainbow Bird (2%)" ⚠️** — Wiki dit drop from enemy named "Rainbow Dress" 10% (mob name = item name pattern). Fandom dit "Rainbow Bird" 2%. Hypothèse : Rainbow Bird = enemy canon, wiki erreur typo / autre nom canon ? À vérifier in-game ou Discord. Source: idem.

- [ ] **🆕 Warrior Dress "+5% Defense" effect canon fandom** — Wiki silent sur cet effet. À vérifier source tier 2 (wiki canon stats column ne mentionne pas +5% defense). Possible erreur fandom OU mécanique wiki manquée. Source: fandom-armor.md §Haschel.

- [ ] **🆕 Rose's Hairband "Can't Combat" TLoD terminology canon** — Fandom utilise "Can't Combat" = in-game wording pour "Instant Death" + ?. À documenter terminology canon dans `combat/status-effects.md` (à créer). Source: fandom-armor.md §Female Headwear.

- [ ] **🆕 "Silver Embroidered Vest" naming canon larger UI** — Silver Vest in chest Hellena affiche **"Silver Embroidered Vest"** dans la barre de gain avec character limit augmenté. À utiliser pour i18n Damia (full name display). Source: fandom-armor.md §Female Armor footnote.

- [ ] **🆕 "Magician Bogey" vs "Magician Bogy" orthographe ⚠️** — Wiki "Bogy" (court), fandom "Bogey" (long). Wiki tier 2 prévaut. Adopter "Magician Bogy" canon Damia.

- [ ] **🆕 "Breast Plate" vs "Breastplate" orthographe ⚠️** — Wiki "Breast Plate" 2 mots, fandom "Breastplate" 1 mot. Wiki tier 2 prévaut probable. Adopter "Breast Plate" canon.

- [ ] **🆕 "Gold DG Armor" vs "Golden DG Armor" naming ⚠️** — Wiki "Gold DG Armor", fandom "Golden DG Armor" / "Golden Dragon Armor". Cohérent "Dragoon of the Golden Dragon" canon Kongol → adopter **"Golden"** canon Damia (cohérent naming Dragon Armor).

- [ ] **🆕 Magical Avoidance > Physical Avoidance late-game canon** — Design canon : enemies utilisent mostly magic attacks late game (Disc 3-4) → M-AV more valuable que A-AV. Pattern à respecter pour balance Damia late-game enemies. Source: fandom-armor.md §Boots guidance.

- [ ] **🆕 Sallet + Tiara accuracy useful vs Unique Monsters canon** — Pattern accuracy importe vs Unique Monsters même si AT capped à 1 damage. Cohérent Long Bow / Virulent Arrow utiles vs Unique Monsters. Source: fandom-armor.md §Male/Female Headwear guidance.

### Items / Accessories fandom complement — 49 accessories total + Therapy/Spirit/Mage Ring NOT in Dragoon form + Zieg=Fire + Virages=Light + Can't Combat status

- [ ] **🆕 49 accessories total canon** confirmé via fandom. À utiliser comme count master pour exhaustivité base de données. Source: [`features/items/_sources/fandom-accessories.md`](features/items/_sources/fandom-accessories.md).

- [ ] **🆕 Therapy Ring + Spirit Ring + Mage Ring DO NOT WORK in Dragoon form ⚠️ MAJEUR** — Canon fandom : "Therapy Ring, Spirit Ring and Mage Ring do not work when a character is in the Dragoon form." À implémenter via flag `passiveEffect.disabledInDragoonForm: boolean` (ou équivalent state-conditional). Impact gameplay : choix Dragoon form trade-off vs accessory passive regen. Affecte 3 accessories regen-per-turn. Source: fandom-accessories.md §Recovering. Priorité: **haute** (système Dragoon-state interaction).

- [ ] **🆕 "Can't Combat" disputed status ailment canon** ⚠️ — Fandom : "It is disputable whether 'Can't Combat' is an actual Status Ailment". Wiki LoD utilise "Instant Death" pour Talisman. Hypothèse : "Can't Combat" = catégorie distincte (le character ne peut plus agir mais n'est pas mort), OU synonym in-game pour Instant Death. **Talisman prévient Can't Combat**. À documenter `combat/status-effects.md` (à créer) avec section dédiée "Can't Combat vs Instant Death : distinction canon ?". Source: fandom-accessories.md §Protective.

- [ ] **🆕 Talisman useful vs 4 bosses Can't Combat canon** : Complete Virage, Mappi, Polter Armor, Kubila. À noter `bosses/Complete Virage.md`, `bosses/Mappi.md`, `bosses/Polter Armor.md`, `bosses/Kubila.md` (à créer). **Polter Armor** ⚠️ confirme fandom nom Soul Eater drop divergence (wiki dit "Polter Sword", fandom dit "Polter Armor" cohérent ici). Probable Polter Armor = correct canon. Source: fandom-accessories.md §Protective + fandom-weapons.md §Dart.

- [ ] **🆕 Zieg Feld Disc 4 = Fire element / Red Dragoon canon ⚠️ MAJEUR** — Fandom : "Zieg Feld on Disc 4, against whom the Red-Eye Stone (obtained from Firebird on Disc 1) should be used". Confirme Zieg = Red-Eye Dragoon originel (Dart's father, ancien Dragon Campaign 11k ans pre-game, possessed by Melbu Frahma Disc 4). À documenter `bosses/Zieg.md` (à créer) + `dragoons/dragons.md` (Red-Eye Dragoon lineage Zieg → Dart) + `dragoons/fire.md` (à créer). Source: fandom-accessories.md §Element Stones.

- [ ] **🆕 Virages laser attacks = Light element canon ⚠️ MAJEUR** — "all Virages, as their laser attacks are of the Light Element". Silver Stone useful counter vs all Virages. Cohérent canon Virage = 108ème espèce hostile vs Soa-création (Virage Light = anti-Wingly-tradition ?). À documenter `bosses/Virage.md` (à créer) + `combat/elements.md` (mob Virages = Light). Source: fandom-accessories.md §Element Stones.

- [ ] **🆕 Wargod's Sash break-even point ≈ 40 SP canon** — Math : 40 × 1.5 = 60 = 40 + 20 (Spirit Ring formula). Pattern : Addition < 40 SP base → Spirit Ring +20/turn supérieur, Addition > 40 SP base → Wargod's Sash +50% supérieur. À documenter `dragoons/mechanics.md` §SP optimization. Source: fandom-accessories.md §Other.

- [ ] **🆕 Fletz Jewellery Shop 4 accessories dédiés canon** : Platinum Collar (MP/physical) + Sapphire Pin (MP/magical) + Ruby Ring (SP/magical) + Emerald Earring (SP/physical). Pattern "Jewellery Shop" canon Fletz spécifique. À refléter `locations/Fletz.md` shop dedicated logic. Source: fandom-accessories.md §Recovering.

- [ ] **🆕 Platinum Collar + Emerald Earring "superior" canon** vs Sapphire Pin/Ruby Ring : "Generally, characters are hit much more often with physical damage than with magical damage, and SP are usually easier to collect than MP" → balance hierarchy. À considérer pour Damia balance Mode Story. Source: idem.

- [ ] **🆕 Holy Ankh 45-49% estimate fandom vs wiki 40% ⚠️** déjà flaggé Armor cross-check. Wiki tier 2 prévaut → adopter 40% canon Damia.

- [ ] **🆕 00PARTS + Red Bird = Unique Monsters Gold farming canon** — "farming Unique Monsters such as 00PARTS and the Red Bird" pour Gold. 00PARTS = boss/mob canon name (lieu/spawn ?). À documenter `bosses/00PARTS.md` (à créer) + `bosses/Red Bird.md` (à créer) + `combat/unique-monsters.md` (à créer). Source: fandom-accessories.md §General.

- [ ] **🆕 Ultimate Wargod "unrewarding item" canon analysis** — Fandom analyse 10,000G + Phantom Ship mini-game cost vs reward "easier or more relaxed battles" only → conserver mécanique mais flagger comme low-value strategic choice. Source: fandom-accessories.md §Additions.

- [ ] **🆕 Wargod Calling "Half Damage and SP, Does not increase addition level"** confirmé fandom in-game description. Pattern : auto-Addition mode = trade-off complet (dmg/SP/leveling). Source: idem.

- [ ] **🆕 "Emerald Ring" vs "Emerald Earring" naming divergence ⚠️** — Wiki LoD = "Emerald Ring", fandom = "Emerald Earring". À choisir canonical Damia. Cohérent avec "Ruby Ring" / "Platinum Collar" / "Sapphire Pin" (variety jewellery), "Earring" est aussi plausible (cohérent "Rainbow Earring"). À vérifier in-game (probable Earring = canon affiché). Source: fandom-accessories.md vs wiki-equipment.md.

- [ ] **🆕 "Firebird" vs "Fire Bird" orthographe divergence ⚠️** — Wiki "Fire Bird" 2 mots, fandom "Firebird" 1 mot. Cf. enemy dropping Red-Eye Stone. À vérifier in-game.

- [ ] **🆕 Magic Ego Bell + Stun Guard shops Queen Fury addition canon** — Fandom ajoute Queen Fury comme shop pour Magic Ego Bell + Stun Guard. Cohérent pattern weapons divergence Queen Fury (ship Disc 2) vs Phantom Ship (Disc 3) : possible que les 2 shops ships proposent les mêmes accessories (Queen Fury Disc 2 ≠ Phantom Ship Disc 3). À investiguer in-game. Source: fandom-accessories.md table.

- [ ] **🆕 Dancer's Ring location "Kadessa" fandom probable confusion canon ⚠️** — Wiki Dancer's **Ring** = Chest Snowfield + Tower of Flanvel + Puck drop. Wiki Dancer's **Shoes** = Chest Kadessa + Cute Cat drop. Fandom met Kadessa dans Dancer's Ring → probable confusion noms similaires. Adopter wiki canonical (Dancer's Ring PAS dans Kadessa). Source: fandom-accessories.md table vs wiki-equipment.md.

- [ ] **🆕 Spirit Cloak "Fire Spirit (I) + Fire Spirit (II)" wiki vs Fire Spirit fandom canon** — Wiki granulaire 2 mobs canon ("Fire Spirit (I)" 10% + "Fire Spirit (II)" 2%). Fandom simplifie 1 enemy. Wiki tier 2 prévaut probable. À documenter `mobs/Fire Spirit I.md` + `mobs/Fire Spirit II.md` (à créer). Source: idem.

- [ ] **🆕 Stardust progression Martel = 100 Stardust max canon** confirmé fandom (4 items × 10/20/30/40 = 100 cumulé). Corrige TODO précédent "50 max ?". Source: fandom-accessories.md §Improving.

- [ ] **🆕 Knight Shield drops "Fruegel" 100% (boss) + Flabby Troll 2% + Dragon Soldier 2%** wiki canon (fandom moins exhaustif). Fruegel = boss Hellena Prison canon (à documenter `bosses/Fruegel.md` à créer). Source: wiki-equipment.md.

- [ ] **🆕 In-game descriptions canon i18n master** — Fandom liste les "In-game Description" texts canon pour chaque accessory ("Avoids the abnormal status X", "Raises Y", "When Z damaged, ..."). À utiliser comme source i18n EN canonical Damia. Source: fandom-accessories.md entire table.

### Locations + Bosses + Story / Lore (Evergreen Forest Disc 3 Mille Seseau central + Kamuy Darkness Stone source)

- [ ] **🆕 Evergreen Forest = location canon #25** (entre Furni #24 et Deningrad #26) — Forêt centrale Mille Seseau passage Disc 3 vers Mountain of Mortal Dragon + Forest of Winglies (barrier-gated). À refléter `world-map/endiness.md` map officielle position confirmée. Source: [`features/locations/_sources/lod-wiki-evergreen-forest.md`](features/locations/_sources/lod-wiki-evergreen-forest.md) + [`features/locations/Evergreen Forest.md`](features/locations/Evergreen%20Forest.md).

- [ ] **🆕 Kamuy boss canon Non-Elemental → Darkness Stone 100% drop** ⚠️ pattern intriguant — Boss Non-Elemental drop le stone Darkness. Pas un ancient Dragoon (vs pattern Shirley/Syuveil/Damia/Kanzas/Belzac/Zieg-Firebird = stones par Dragoons). Kamuy = entité distincte, possiblement esprit gardien forêt corrompu, OU boss "déguisé" canon. À documenter `bosses/Kamuy.md` (à créer). 8,000 EXP / 0 Gold canon. Source: lod-wiki-evergreen-forest.md.

- [ ] **🆕 "Path to Mountain of Mortal Dragon under constant guard" canon** — Guard NPC bloque accès à Mountain (Divine Dragon seal protection). Pattern story-gated progression Disc 3. À documenter game flow Disc 3 + `locations/Mountain of Mortal Dragon.md` (à créer). Source: idem.

- [ ] **🆕 4 chests anti-status pattern canon** : Destone Amulet (Petrification) + Body Purifier + Depetrifier (cure Petrification) + Mind Purifier (cure Confusion/Bewitchment) = focus préparation status ailments Disc 3+. Cohérent avec design canon "préparer joueur aux bosses Disc 3-4 statuses". Source: idem.

- [ ] **🆕 5 mobs Evergreen Forest canon — pattern Wind+Earth+Darkness 3 éléments forêt** : Flying Rat (Wind, 64 EXP) + Forest Runner (Wind, 88 EXP) + Wounded Bear (Earth, 96 EXP) + Dark Elf (Darkness, 80 EXP) + Moss Dresser (Earth, 72 EXP). Pas de Fire/Water → biome "forêt humide tempérée" canon. À refléter `mobs/Flying Rat.md` + `mobs/Forest Runner.md` + `mobs/Wounded Bear.md` + `mobs/Dark Elf.md` + `mobs/Moss Dresser.md` (à créer). Source: idem.

- [ ] **🆕 Rose leaps over ravine canon (sub-area 3) ⚠️ character beat** — Animation/cutscene canon démontrant capacités athlétiques Rose (cohérent Black Monster strength 11k ans + Dragoon agility). À refléter `party-members/Rose.md` (à créer) + cinematic potentielle. Source: idem.

- [ ] **🆕 Teo NPC canon (sub-area 4 hill rencontre)** — Personnage rencontré + Depetrifier chest reward associated. Rôle narratif à investiguer (probable garde forestier / villageois Mille Seseau / informant ?). À documenter `npcs/Teo.md` (à créer) + dialogue Evergreen Forest. Source: idem.

- [ ] **🆕 Lloyd saves Wink cinematic canon (sub-area 8 "Ravine but when")** ⚠️ — Sub-area 8 = réutilisation environnement ravin pour **cinematic Lloyd protégeant Wink**. Quel disc / quand ? Wink = Princesse Tiberoa Disc 2 (cf. [Donau](features/locations/Donau.md)). Probable flashback Disc 2 OU revisite Disc 3 ? À investiguer fandom + game flow timeline Lloyd-Wink. À documenter `quests/disc?-lloyd-wink-cinematic.md` (à créer). Source: idem.

- [ ] **🆕 Barrier Evergreen Forest → Forest of Winglies canon** — Sub-area 7 = "Barrier leading to Forest of Winglies" : gateway géographique magique Wingly hidden city. À refléter `locations/Forest of Winglies.md` (à créer) entry conditions. Source: idem.

- [ ] **🆕 Encounter rate Evergreen Forest 10-14 canon + escape 30%** — Pattern canon : zone passage 10 standard / 14 ravine area + 30% escape. Pour Damia balance Mode Story → respecter ces rates pour authenticity. Sub-area 6 Kamuy = scripted 0% escape pour boss fight. Source: idem.

- [ ] **🆕 Mob drop rate Evergreen Forest 8% uniformly canon** — Tous les 5 mobs drop à 8% (Angel's Prayer / Recovery Ball / Attack Ball / Depetrifier / Healing Fog). Pattern canon "uniform mob drop rate 8% Mille Seseau forest". À refléter design Damia balance drops. Source: idem.

### Locations + Story / Lore (Evergreen Forest fandom — 4 visits Chapter 3 + Meru Wingly reveal + Lloyd Dragon Buster + Moon Mirror plot + Queen Theresa kidnap)

- [ ] **🆕 4 visits Evergreen Forest canon Chapter 3 (Disc 3)** + 5e optionnel Neet Stardust — pattern canon "pass-through area" multiples visites. À refléter game flow Disc 3 structure (Furni → Deningrad → FoW → Deningrad → Mountain → Deningrad). Source: [`features/locations/_sources/fandom-evergreen-forest.md`](features/locations/_sources/fandom-evergreen-forest.md).

- [ ] **🆕 Meru reveal Wingly canon dans Evergreen Forest northern dead end** ⚠️ MAJEUR — Visit 2 cinematic Meru ouvre portal Forest of Winglies + reveal she's Wingly. Cohérent canon "Many surviving Winglies fled to Forest of Winglies". À documenter `party-members/Meru.md` (à créer) reveal scene + `quests/disc3-meru-wingly-reveal.md` (à créer). Source: fandom-evergreen-forest.md §Second Visit.

- [ ] **🆕 Lloyd uses Dragon Buster canon vs Younger Bardel** ⚠️ MAJEUR Dragon Buster lineage — Visit 4 cinematic Lloyd kills Younger Bardel avec Dragon Buster. Confirme Dragon Buster = **Lloyd's signature weapon canon avant Rose** (Rose obtains après killing Lloyd Disc 4 final). À refléter `items/equipment.md` Dragon Buster acquisition story (Rose obtient "Story: Moon" canon = post-Lloyd defeat). Source: fandom-evergreen-forest.md §Fourth Visit.

- [ ] **🆕 Moon Mirror = Divine Moon Object of Mille Seseau canon ⚠️ MAJEUR plot point** — Lloyd kidnap Queen Theresa Deningrad pour obtenir Moon Mirror. Cohérent canon 3 Moon Objects (Tiberoa Moon Dagger / Mille Seseau Moon Mirror / Serdio Moon Gem?). À documenter `quests/disc3-moon-mirror-quest.md` (à créer) + `items/moon-objects.md` (à créer). Source: fandom-evergreen-forest.md §Fourth Visit.

- [ ] **🆕 Sacred Sister Wink + Younger Bardel Brother canon** ⚠️ NEW characters — Wink = Sacred Sister Mille Seseau (cohérent 5 Sacred Sisters lore Deningrad). Bardel Brothers = Winglies servant Lloyd. **Younger Bardel self-destruct technique canon** Wingly suicide attack. À documenter `npcs/Wink Sacred Sister.md` (à créer + cross-référer Donau Wink Princess Tiberoa — possible NOM IDENTIQUE DIFFÉRENTE PERSONNE ou même Wink ? À investiguer) + `bosses/Younger Bardel.md` + `bosses/Elder Bardel.md` (à créer). Source: fandom-evergreen-forest.md §Fourth Visit.

- [ ] **🆕 ⚠️ Wink Sacred Sister vs Wink Princess Tiberoa NOMS IDENTIQUES** — Disc 2 Donau Wink = Lynn's fiancée Princess Tiberoa. Disc 3 Evergreen Wink = Sacred Sister Mille Seseau attaquée par Younger Bardel + sauvée par Lloyd. **Même personne ?** Improbable géographiquement (Tiberoa ≠ Mille Seseau). Probable **2 NPCs différents avec même nom canon**, ou Wink Princess Tiberoa devenue Sacred Sister Mille Seseau ? À investiguer fandom Wink page. Source: comparaison Donau doc + fandom-evergreen-forest.md.

- [ ] **🆕 Lloyd "long con" pattern canon** — Lloyd sauve Wink (montre bonté) pour gagner trust → infiltrer Deningrad → kidnap Queen Theresa → voler Moon Mirror. Pattern manipulation canon Lloyd = master strategist. À documenter `bosses/Lloyd.md` (à créer) personality + `quests/disc3-lloyd-long-con.md` (à créer). Source: fandom-evergreen-forest.md §Fourth Visit.

- [ ] **🆕 Queen Theresa Mille Seseau kidnap canon Disc 3** — Reine de Mille Seseau kidnappée par Lloyd → Miranda furieuse (Miranda = Sacred Sister + Dragoon White-Silver post-Shana switch). À documenter `npcs/Queen Theresa.md` (à créer) + `quests/disc3-queen-theresa-kidnap.md`. Source: idem.

- [ ] **🆕 Shana Dragoon Spirit White-Silver Dragon healing power canon** — Shana utilise healing capacity Dragoon Spirit pour sauver Kamuy + turn him into wolf cub harmless. Pattern unique White-Silver Dragoon = **healer/restorer canon** (cohérent "Shana = Dragoon support magic"). À documenter `dragoons/light.md` (à créer) + `dragoons/dragons.md` (Dragon White-Silver healing capacity). Source: fandom-evergreen-forest.md §First Visit.

- [ ] **🆕 Kamuy "savage because Divine Dragon seal decaying" canon ⚠️ MAJEUR lore** — Trivia fandom : "Monsters and animals of Evergreen Forest acting savage because of the decaying seal on the Divine Dragon" (Winglies dixit). **Explication canon des mobs sauvages + Kamuy** = effet zone Divine Dragon seal failure. Pattern : Divine Dragon seal Mountain of Mortal Dragon corrompt → wildlife savage Mille Seseau zones limitrophes. À documenter `dragoons/divine-dragon.md` (à créer) seal mechanic + `world-map/endiness.md` Mille Seseau impact. Source: fandom-evergreen-forest.md §Trivia.

- [ ] **🆕 Miranda saves Kamuy "what Shana would do" canon Disc 4 ?** — Optional battle Kamuy après Miranda joining → Miranda prend rôle Shana (post-switch Disc 3). Reflète **Miranda character arc compassion via mémoire Shana** canon. À documenter `party-members/Miranda.md` (à créer) character arc + `dragoons/miranda-shana-switch.md` (à créer). Source: fandom-evergreen-forest.md §Trivia.

- [ ] **🆕 Resident Knight Harris canon NPC name** — Harris = name Resident Knight Furni (commande Kamuy quest + reward 500G). À documenter `npcs/Harris.md` (à créer) + `locations/Furni.md` (à créer). Source: fandom-evergreen-forest.md §First Visit.

- [ ] **🆕 Bulgus mercenaire canon NPC** — Mercenary attaque Kamuy Visit 1 + thrown aside. À documenter `npcs/Bulgus.md` (à créer). Source: idem.

- [ ] **🆕 Fa NPC Furni canon "lost speech ability"** — Fa = NPC Furni qui a perdu la parole (probable trauma Kamuy/Black Monster attack) → regagne après Kamuy quest. À documenter `locations/Furni.md` (à créer) Fa NPC + `quests/disc3-kamuy-teo-quest.md` (à créer) reward. Source: fandom-evergreen-forest.md §First Visit gameplay.

- [ ] **🆕 Teo NPC backstory canon** — Garçon Furni, ancien owner de Kamuy (wolf creature). Teo aime Kamuy, demande pardon vie. À documenter `npcs/Teo.md` (à créer). Source: fandom-evergreen-forest.md §First Visit.

- [ ] **🆕 Serfius model used canon NPC reference** — Mercenary bloquant east path (vers Neet) = "using the model of Serfius". Serfius = NPC canon (déjà existant ? À investiguer). Pattern reuse 3D models TLoD. Source: fandom-evergreen-forest.md §First Visit gameplay.

- [ ] **🆕 5 connexions canon Evergreen Forest** — Fandom corrige wiki tier 2 : 5 sorties au lieu de 3 (Furni / Deningrad / Forest of Winglies / Mountain of Mortal Dragon / **Kashua Glacier** ⚠️ NEW + **Neet** ⚠️ NEW). Confirme worldmap official observations Mille Seseau hub central. Source: fandom-evergreen-forest.md §Geography.

- [ ] **🆕 Small lake near rotten tree stump canon geography** — Petit lac caché dans Evergreen Forest. À refléter level design Damia map. Source: idem.

- [ ] **🆕 US vs JP HP/Gold divergence canon** — JP version : +HP mobs/boss + -Gold drop. Kamuy 4,800 HP US vs 6,000 JP. **Adopter US comme canonical Damia** (cohérent original localisation Western). À documenter `combat/canon-divergences.md` (à créer) section "US vs JP balance differences". Source: fandom-evergreen-forest.md §Monsters.

- [ ] **🆕 3 chests fandom vs 4 chests wiki divergence ⚠️** — Wiki LoD liste 4 chests (Destone Amulet + Body Purifier + Depetrifier + Mind Purifier). Fandom liste 3 chests (Mind Purifier omis). Wiki tier 2 plus exhaustif probable. À vérifier in-game. Source: comparaison sources.

- [ ] **🆕 Dragon Block Staff canon artifact Disc 3** — Trouvé dans Forbidden Land (Kadessa). Utilité : permettre fight vs Divine Dragon. À documenter `items/key-items.md` (à créer) + `quests/disc3-dragon-block-staff.md` (à créer). Source: fandom-evergreen-forest.md §Second Visit + §Third Visit.

- [ ] **🆕 Destruction Deningrad par Divine Dragon canon Disc 3 cinematic ⚠️** — Pattern story : Dart group trop tard pour empêcher = traumatic event canon. À documenter `quests/disc3-deningrad-destruction.md` (à créer) + `locations/Deningrad.md` (mise à jour post-destruction state). Source: fandom-evergreen-forest.md §Third Visit.

### Combat / Experience / Leveling (master canon — cap 60 + per-character XP curves + survivor-only + Petrification penalty)

- [ ] **🆕 Level cap 60 canon master** — post-L60 no more level up, stats final. À implémenter `level: clamp(currentLevel, 1, 60)` + soft cap (gain XP au-delà = lost). Source: [`features/combat/_sources/lod-wiki-experience.md`](features/combat/_sources/lod-wiki-experience.md). Priorité: **haute**.

- [ ] **🆕 7 per-character XP thresholds canon (60 levels = 420 data points)** — Dart=easiest, Rose=hardest. À implémenter `THRESHOLDS: Record<Character, number[]>` data-table. Order canon L60 : Dart 382,000 < Haschel 385,820 < Meru 386,584 < Lavitz/Albert 387,730 < Kongol 388,494 < Shana/Miranda 389,640 < Rose 390,786. Source: [`features/combat/experience.md`](features/combat/experience.md). Priorité: **haute**.

- [ ] **🆕 Rose XP penalty curve canon (hardest at L60 = +8,786 EXP vs Dart)** — Cohérent character lore "11k ans Dragoon Black Monster". À refléter `party-members/Rose.md` (à créer) + balance Mode Story. Source: idem.

- [ ] **🆕 EXP distribution survivors-only canon** — Active survivors split EXP evenly + fallen (0 HP / Petrified end of fight) get 0 + Inactive get 50% (rounded down) of survivor share. À implémenter `awardExp(survivors, fallen, inactive, totalExp)` avec integer division + lost remainder tracking. Priorité: **haute**.

- [ ] **🆕 Petrification = 0 EXP gain canon ⚠️ status interaction** — Membre actif Petrified à fin de combat → 0 XP gain (comme dead). À refléter `combat/status-effects.md` (à créer) + tag specific EXP penalty. Source: lod-wiki-experience.md §Distribution.

- [ ] **🆕 "Fewer survivors = more total party EXP" exploit pattern canon** — Single survivor + N inactive = jusqu'à 3× total party XP (vs 3 survivors + 1 inactive = 1.16×). Pattern speed runner exploit canon. À conserver tel quel design Damia (player choice trade-off). À documenter `combat/experience.md` §1 pattern. Source: idem.

- [ ] **🆕 Speed runner trivia canon "funnel EXP to Shana/Miranda"** — Pattern : laisser 2 actifs mourir → 1 survivant Shana/Miranda → over-leveling Dragoon précoce. À noter design intentionnel TLoD (player agency). Source: idem.

- [ ] **🆕 Inactive members rounded down 50% canon** — Pattern `floor(active_share / 2)`. Affecte balance Damia : si party rotation autorisée, les inactifs accumulent XP plus lentement → encourage rotation pour égaliser levels. Source: idem.

- [ ] **🆕 Stats per-level growth formules canon (HP/AT/DF/MAT/MDF)** — Wiki tier 2 silent sur formules exactes growth rates per level. À investiguer Discord Wulves/Dedspawn ou fandom complement. Probable : courbes per-character distinctes (Kongol = high HP/AT growth tank, Shana/Meru = high MAT growth caster, etc.). Source: gap dans wiki.

- [ ] **🆕 L2 baseline divergence canon** — Dart/Rose/Haschel/Meru/Kongol = 20 EXP / Shana/Miranda = 30 EXP / **Lavitz/Albert = 35 EXP** (max). Pattern : Lavitz/Albert plus difficile early game. Cohérent avec Lavitz/Albert = Knight discipline canon. Source: lod-wiki-experience.md table.

- [ ] **🆕 EXP curve quasi-flat early L2-L10 canon** — Variance entre characters ≤ 36 EXP à L10. Divergence croît avec level (à L60 = +8,786 max diff). Pattern "balanced early game, character-specific late game". Source: idem.

- [ ] **🆕 Integer division lost EXP canon** — Pattern "100 EXP / 3 = 33+33+33+1 lost" → tracking `lostExp` analytics utile pour balance verification. Source: lod-wiki-experience.md example.

- [ ] **🆕 Survival Mode XP system adaptation** — Cf. [SCOPE §7.2](SCOPE.md#72-mode-survival--fun-first) Survival : per-run XP vs persistent ? Si Vampire-Survivors-like, probable per-run. Si Classic Mode Survival, probable persistent. À trancher. Source: vision design Damia.

- [ ] **🆕 Lavitz → Albert XP transfer canon ?** — Lavitz mort Disc 1, Albert prend over Wind Dragoon. **Albert hérite-t-il du level/XP de Lavitz ?** Wiki dit "Lavitz/Albert" même thresholds → probable : Albert apparaît avec level proche/identique Lavitz à sa mort canon. À vérifier in-game + Discord. À documenter `party-members/Albert.md` recrutement state. Source: comparaison wiki tables.

- [ ] **🆕 Recruitment level baseline canon** — Quel niveau de départ pour chaque character à son recrutement ? Wiki silent. Probable : Dart commence L1, autres rejoignent à level "matching party average" canon. À investiguer + documenter `party-members/`. Source: gap dans wiki.

### Combat / Experience fandom complement — Additions level-gated + recruitment levels canon + DLV SP thresholds canon

- [ ] **🆕 Additions level-gated UNLOCK canon ⚠️ MAJEUR** — "Experience levels are the only requirement for characters to receive new Additions, except for their Master Level addition." → Pattern : chaque Addition débloquée par level threshold spécifique. À cross-référer `combat/additions.md` (déjà documenté) + investiguer exact level → Addition mappings canon. Master Level addition = exception (probable canon usage counter / mastery). Source: [`features/combat/_sources/fandom-experience.md`](features/combat/_sources/fandom-experience.md). Priorité: **haute**.

- [ ] **🆕 Recruitment levels canon par character (via fandom "-" dashes)** — Dart L2 / Lavitz-Albert L4 / Shana-Miranda L5 / Rose L9 / Haschel L14 / Meru L18 / Kongol L20. Pattern canon recrutement story-timeline. À implémenter dans data-model `RecruitmentTimeline` + balance Mode Story (each character apparaît au level minimum canon). Source: fandom-experience.md table dashes. Priorité: **moyenne**.

- [ ] **🆕 DLV SP thresholds canon ⭐ MAJEUR** — Table Dragoon Level requirements :
  - DLV 2 = **1000 SP** (Haschel/Lavitz/Albert/Shana/Miranda/Meru)
  - DLV 2 = **1200 SP** penalty (Dart/Rose)
  - DLV 2 = **2000 SP** max penalty (Kongol)
  - DLV 3 = 6000 SP all
  - DLV 4 = 12000 SP all
  - DLV 5 = 20000 SP all
    → Adopter ces values comme canonical Damia. À cross-référer `dragoons/mechanics.md` (potentiellement déjà documenté Discord). Source: fandom-experience.md §Dragoon Level.

- [ ] **🆕 DLV 2 penalty Dart+Rose canon (1200 SP)** — Pourquoi Dart et Rose seulement ? Hypothèse : Fire (Dart) + Dark (Rose) = éléments "principaux/iconiques" Disc 1 → balance penalty pour éviter early Dragoon spam. À documenter `dragoons/mechanics.md`. Source: idem.

- [ ] **🆕 DLV 2 penalty Kongol canon (2000 SP) max ⚠️** — Kongol = +100% penalty vs baseline. Cohérent avec late-game character + Golden/Giganto Dragoon rarity canon. À documenter `party-members/Kongol.md` (à créer) + `dragoons/golden.md` (à créer). Source: idem.

- [ ] **🆕 Master Level addition exception canon ⚠️** — Wiki dit "Master Level addition" pour chaque character. Quel requirement exact ? Probable : Addition use count atteint cap (mastery via repetition). À investiguer Discord + `combat/additions.md`. Source: fandom-experience.md mécanique generale.

- [ ] **🆕 Petrification = 0 EXP wiki only ⚠️ divergence** — Wiki tier 2 inclut Petrification dans "knocked out". Fandom omet → simplification. Wiki tier 2 prévaut. Adopter Petrification = 0 EXP canon Damia. Source: comparaison sources.

- [ ] **🆕 Divergences thresholds wiki vs fandom probables typos ⚠️** :
  - L19 Dart : wiki 10,974 vs fandom 10,947 (27 EXP diff)
  - L33 Rose : wiki 58,821 vs fandom 58,321 (500 EXP diff)
  - L51 Dart : wiki 215,302 vs fandom 215,303 (1 EXP diff)
  - L52 Meru : wiki 233,990 vs fandom 233,490 (500 EXP diff)
    → Wiki tier 2 prévaut probable (cohérent monotonie + cross-référence Prima Strategy Guide via fandom refs). Adopter wiki canon. Source: comparaison sources.

- [ ] **🆕 Sources cross-references fandom canon** — Prima's Official Strategy Guide + thelegendofdragoon.net + CCajes Character FAQ (gamefaqs). À récupérer pour validation tertiary indépendante. Source: fandom-experience.md §References.

- [ ] **🆕 "Training Spot" canon page reference fandom** — Mentionné pour grinding spots. Implique TLoD a des **Training Spot canon definits**. À investiguer fandom Training Spot page + intégrer dans `combat/training-spots.md` (à créer) ou `locations/farming-zones.md` (à créer). Source: fandom-experience.md intro.

- [ ] **🆕 Unique Monsters give EXP "under certain conditions" canon** — Fandom : "certain unique monsters" give EXP. Cohérent Unique Monsters 1-damage cap + specific reward conditions. À documenter `combat/unique-monsters.md` (à créer) EXP rules. Source: fandom-experience.md intro.

### Bosses / Mechanics (Feyrbrand — premier dragon TLoD + Retaliate passive + Attacking power up stacking + Status Slime 100% canon)

- [ ] **🆕 Feyrbrand canon data-model** — Wind, HP 480, AT 18, DF 100, MAT 12, MDF 80, SPD 50, A-AV/M-AV 0%. Premier dragon TLoD canon. Source de Jade Dragoon Spirit (Lavitz). À implémenter `bosses/feyrbrand.ts` data. Source: [`features/bosses/_sources/lod-wiki-feyrbrand.md`](features/bosses/_sources/lod-wiki-feyrbrand.md). Priorité: **moyenne**.

- [ ] **🆕 Status immunity ALL 8 pattern boss canon** — Feyrbrand immune Petrify/Bewitch/Arm Block/Dispirit/Confuse/Fear/Poison/Stun = **pattern canon master tous bosses**. À implémenter `Boss.statusImmunity: StatusAilment[]` (probablement all par défaut). Source: idem.

- [ ] **🆕 Retaliate passive canon ⭐ MAJEUR pattern** — "Triggered when targeted by magic → Ignore turn order + use Attacking power up (self-buff)". À implémenter `BossPassive { trigger: 'on_magic_targeted', action, ignoreTurnOrder: true }`. Pattern : magic spam = boss adapte sa puissance. Source: idem.

- [ ] **🆕 Attacking power up canon — ADDITIVE STACKING** ⭐ — 1.1× / 1.2× / 1.3× / etc (additive +0.1 per use). À implémenter `Buff { type: 'damage_multiplier', stacking: 'additive', delta: 0.1 }`. Distinction additive vs multiplicative cruciale. Source: idem.

- [ ] **🆕 ~Status Slime 100% Fear/Poison/Stun (random) canon** — Ability boss canon : 100% chance proc l'un des 3 status aléatoirement, **réduit par A-AV target**. Pattern "guaranteed but evadable". À investiguer formule exacte canon A-AV → status proc reduction. À implémenter `Ability { target: 'single', dmg: 1, statusProc: { chance: 1.0, statuses: ['Fear','Poison','Stun'], pickRandom: true, mitigatedByAAV: true } }`. Source: idem.

- [ ] **🆕 "Counters Additions: No" canon ⚠️** — Feyrbrand n'a PAS de counter mechanism. Implique **certains autres bosses canon ONT** counter mechanism. À investiguer "Counter Opportunities" data-model pour tous les bosses. Source: idem.

- [ ] **🆕 Feyrbrand + Greham = joined encounter scripted canon** — Submap 136 Nest of Dragon, escape 0%, encounter scripted (393). EXP/Gold du Feyrbrand = 0/0 → rewards aggregated sur Greham seul. Pattern canon "boss+rider" 1 fight = 2 enemies. À implémenter encounter type. Source: idem + Nest of Dragon doc.

- [ ] **🆕 Down Burst Repeat Item drop 100% Feyrbrand canon** — NEW canon item. À documenter `items/consumables.md` (à créer) — Down Burst probable Wind-elemental utility item. Source: idem.

- [ ] **🆕 Feyrbrand = source Jade Dragoon Spirit canon** — Confirmé canon : Feyrbrand mort → eyes merge → Jade Dragoon Spirit récupéré par Lavitz. Pattern Eye merge canon = `dragoons/mechanics.md` §Eye merge. À cross-référer `dragoons/dragons.md` Jade Dragon Tribe lineage. Source: idem.

- [ ] **🆕 "Targeted by magic" trigger canon — clarification needed ⚠️** — Retaliate trigger : Dragoon Magic ? Spells ? Magical items (Burn Out/Spark Net) ? À investiguer Discord cadors. Probable = tout magic damage type. À documenter `combat/boss-passives.md` (à créer). Source: idem.

- [ ] **🆕 Attacking power up — décay or permanent ?** — Probable permanent self-buff (pas de duration). Si Feyrbrand stacks 10× via 10 magic spells → 2× damage permanent jusqu'à end of fight. Pattern conserver tel quel. Source: idem.

- [ ] **🆕 "first dragon seen in game" canon symbolic placement** — Feyrbrand = premier dragon visuel TLoD, introduction "creatures of Soa" lore. À refléter Damia : importance design level (cinematic reveal Feyrbrand premier moment crash boss-introduction). Source: identity canon.

### Bosses / Lore (Feyrbrand fandom — "Green-Tusked Dragon" canon name + 3 encounters (Disc 1 cold open + Nest of Dragon + Mayfil Disc 4 spirit) + Slime Shot color→status mapping + blind canon + Servi Slambert + first vassal Dragon TLoD)

- [ ] **🆕 "Feyrbrand the Green-Tusked Dragon" moniker canon ⭐** — 緑牙竜フェルブランド (Ryokugaryū Feruburando) JP/EN canon name. À refléter `bosses/Feyrbrand.md` + i18n EN/FR. Source: [`features/bosses/_sources/fandom-feyrbrand.md`](features/bosses/_sources/fandom-feyrbrand.md).

- [ ] **🆕 "First of several vassal Dragons" canon pattern ⭐ MAJEUR** — Feyrbrand premier d'une série de **vassal Dragons** TLoD (Damia, Regole, Divine Dragon, Mortal Dragon, etc.). Pattern canon "vassal Dragon" à documenter `dragoons/dragons.md` §Vassal Dragons. Source: idem.

- [ ] **🆕 Feyrbrand Cold Open Disc 1 = first Dart-Rose meet canon ⭐ MAJEUR** — Feyrbrand attaque Dart dans forêt près Seles, Dart chassé deeper, **Rose saves Dart** (premier rencontre canon Dart-Rose, avant Hellena Prison Lavitz). À documenter `quests/disc1-cold-open.md` (à créer) + `party-members/Rose.md` (à créer) intro. Source: idem.

- [ ] **🆕 Feyrbrand Disc 4 Mayfil spirit return optional boss ⭐ MAJEUR canon** — Feyrbrand's soul re-encounter Death City Mayfil. Stats spirit ×16 HP (8,000 US / 10,000 JP) / ×5+ AT (100) / ×6+ MAT (80). Rose canon explanation : "had too much pride as a Dragon for having been defeated by humans". À documenter `quests/disc4-mayfil-dragon-spirits.md` (à créer). À investiguer si autres dragon spirits canon Mayfil (Damia, Regole, etc. ?). Source: fandom-feyrbrand.md §Chapter 4.

- [ ] **🆕 Slime Shot color → status mapping canon ⭐** — Vs wiki "random" : Green slime = **Poison**, White slime = **Stun**, Blue slime = **Fear**. Pattern boss "color tell" canon → player anticipate via animation color. À implémenter dans Feyrbrand AI : 3 ability variants distincts, pas 1 random. À noter `combat/boss-tells.md` (à créer). Source: idem.

- [ ] **🆕 Feyrbrand BLIND canon trait (unused Rose line) ⚠️** — Unused script line Disc 1 : Rose suggests Feyrbrand est aveugle, explique pourquoi ne détecte pas Dart+Rose cachés derrière rock. Canon trait dragon **présent script mais non-déclamé in-game**. Pour Damia : potentiel cinematic intro restaurer ce line ? À noter `quests/disc1-cold-open.md`. Source: fandom-feyrbrand.md §Trivia.

- [ ] **🆕 Servi Slambert canon full name** — Lavitz' père : "Servi Slambert" canon (vs simple "Servi" prior docs). À refléter `party-members/Lavitz.md` + `party-members/Albert.md` (à créer) + `bosses/Greham.md` (à créer) backstory. Source: fandom-feyrbrand.md §Second Encounter.

- [ ] **🆕 Strategy canon "defeat Feyrbrand BEFORE Greham" tactical** — Pattern joined encounter : Feyrbrand = damage dealer + status, Greham = secondary threat. À refléter Boss AI gameplay design canon (player priority order). Source: fandom-feyrbrand.md §Battle at Nest of Dragon.

- [ ] **🆕 Imperial Sandora vassal Dragon canon Serdian War context** — Feyrbrand utilisé par Imperial Sandora vs Kingdom of Basil → contrôle Dragon = "balance of power broken" → Emperor Doel aggressive escalation canon. À refléter `lore/serdian-war.md` (à créer) + `bosses/Emperor Doel.md` motivations. Source: fandom-feyrbrand.md §Chapter 1.

- [ ] **🆕 Imperial Sandora connection canon linguistic (kanji 竜 ryū/ryō)** — Japanese 竜 (ryū "dragon") double-reading "ryō" = "imperial" → Green-Tusked Dragon ↔ Imperial Sandora. Pattern canon naming linguistic. À noter `lore/canon-naming.md` (à créer) Japanese subtleties. Source: fandom-feyrbrand.md §Trivia 2.

- [ ] **🆕 Stats divergences wiki vs fandom Feyrbrand ⚠️** :
  - AT : wiki 18 vs fandom **21** (wiki tier 2 prévaut probable)
  - MAT : wiki 12 vs fandom **14** (wiki tier 2 prévaut probable)
    → À vérifier in-game Discord cadors. Adopter wiki canon. Source: comparaison sources.

- [ ] **🆕 US/JP HP divergence Feyrbrand canon** — Disc 1 : 480 US / 600 JP. Disc 4 spirit : 8,000 US / 10,000 JP. Pattern systématique JP +25% HP (cohérent Evergreen Forest, Kamuy). Adopter US canon Damia. Source: fandom-feyrbrand.md tables.

- [ ] **🆕 Feyrbrand EXP/Gold pooled with Greham canon** — Total joined encounter : 1,200 EXP + 100 Gold pour les 2. Wiki disait "0 direct" car Feyrbrand seul = 0, mais pool joined = 1,200. À implémenter reward aggregation logic. Source: fandom-feyrbrand.md vs wiki yield.

- [ ] **🆕 Down Burst Wind elemental Repeat Item canon** — Drop 100% Feyrbrand both encounters (Disc 1 + Disc 4 spirit). Probable item utility Wind-elemental (offensive Repeat Item ?). À documenter `items/consumables.md` (à créer). Source: idem.

- [ ] **🆕 Ability names canon officiels fandom** — "Tusk Attack" + "Slime Shot" + "Attack Power Up" = noms canon officiels (vs wiki ~community approximations "~Mandible Strike" / "~Status Slime"). Adopter fandom canon. Source: fandom-feyrbrand.md §Battle at Nest of Dragon.

- [ ] **🆕 Attack Power Up trigger précisé canon** — "He **only uses it when he is hit with any magic based attack**" → confirme trigger Retaliate = magic damage (any type). Lift ambiguïté wiki "targeted by magic". À refléter Boss AI : trigger = damage type magic (vs targeting). Source: idem.

- [ ] **🆕 Pellet + Meteor Fall Earth items canon mentionnés** — Wind-weak Feyrbrand → Earth attacking items ×1.5 damage. Pellet + Meteor Fall = canon Earth Repeat Items. À documenter `items/consumables.md` (à créer) elemental items list. Source: idem.

### Bosses / Mechanics (Fire Bird — boss Disc 1 Volcano Villude, source Red-Eye Stone + Sequential Retaliation 3-cycle + Volcano Ball Boss Extra + HP 61% phase swap)

- [ ] **🆕 Fire Bird canon data-model** — Fire, HP 640, AT 13, DF 80, MAT 16, MDF 80, SPD 45, A-AV/M-AV 0%. Boss Volcano Villude Disc 1. À implémenter `bosses/fire-bird.ts` data. Source: [`features/bosses/_sources/lod-wiki-fire-bird.md`](features/bosses/_sources/lod-wiki-fire-bird.md). Priorité: **moyenne**.

- [ ] **🆕 Fire Bird source canon Red-Eye Stone 100% drop ⭐** — Confirmé pattern "7 stones elemental from canon bosses". Red-Eye Stone = Fire damage reduction -50% magic. Stratégie canon : récupérer Disc 1 pour Disc 4 Zieg Feld counter. Source: idem + [`items/equipment.md`](features/items/equipment.md).

- [ ] **🆕 Sequential Retaliation 3-cycle pattern canon ⭐ MAJEUR NEW vs Feyrbrand** — Vs Feyrbrand single Retaliate type, Fire Bird a **3 retaliates cycliques (1st → 2nd → 3rd → repeat)**. À implémenter `BossPassive { sequence: [action1, action2, action3], sequenceIndex, advance: () => index = (index+1) % 3 }`. Pattern boss tactical canon "setup-payoff" multi-stage. Source: idem.

- [ ] **🆕 Retaliate trigger by Addition (vs magic) canon ⚠️ NEW pattern diversity** — Feyrbrand trigger = magic damage. Fire Bird trigger = **"targeted by Addition"**. Pattern : boss design diversity = différentes player actions triggers. À implémenter trigger type generic enum `RetaliateTrigger = 'magic' | 'addition' | 'physical' | 'hp_threshold'`. Source: idem.

- [ ] **🆕 "Has a chance to trigger" probabilistic Retaliate ⚠️** — Fire Bird Retaliates ne se trigger **pas systématiquement** (chance %). À investiguer % exact Discord cadors. Pattern : boss Retaliate avec chance probabiliste (vs Feyrbrand deterministic ?). Source: idem.

- [ ] **🆕 Final Blow passive canon ⭐** — "The battle ends when Fire Bird's HP reaches 0". Pattern boss canon : "main boss = victory trigger" — extras (Volcano Balls) auto-disparaissent. À implémenter `BossPassive { onMainBossKilled: 'endBattle', extrasAutoRemove: true }`. Source: idem.

- [ ] **🆕 HP 61% threshold phase swap canon ⭐ NEW** — Fire Bird : HP > 61% utilise Fiery Wing Beat (physical party 0.5×), HP < 61% utilise Molten Dive (Fire magic party 0.5×). À implémenter `Ability.conditions.hpPctMin/hpPctMax`. **61% exact** threshold canon (vs ronde 50%/25%). Source: idem.

- [ ] **🆕 Volcano Ball "Boss Extra" canon ⭐ NEW pattern "summons"** — Boss Extra entities canon : Fire Bird summon ×4 Volcano Balls (HP 8 fragile, AT 12, MDF 100). 0 EXP / 0 Gold / no drops. À implémenter `BossExtra { spawnedBy: 'Fire Bird Call Volcano Balls', count: 4, entity: VolcanoBallStats }`. Pattern canon TLoD : main boss + extras summons distinct mécanique. À documenter `combat/boss-extras.md` (à créer). Source: idem.

- [ ] **🆕 Instigate Erupt "max 3/4 damage" canon ⚠️** — Force all 4 Volcano Balls to Erupt mais **only 3 actually deal damage** (1 fail systématique). Pattern "imperfect AoE" canon. Déterministe ou random ? À investiguer. À implémenter `Ability { erupt: { totalTargets: 4, maxDamageHits: 3 } }`. Source: idem.

- [ ] **🆕 Volcano Ball stats canon** — HP 8 (très fragile, one-shot Disc 1 typical), AT 12, DF 80, MAT 12, MDF 100, SPD 45, A-AV/M-AV 0%. Status immune ALL 8 (cohérent boss pattern). Drop Nothing. Pattern "fragile extras one-shot kill window". Source: idem.

- [ ] **🆕 ~Bind and Peck canon ability** — Single target 1× phys, basic attack Fire Bird. Sans condition. Source: idem.

- [ ] **🆕 ~Fiery Wing Beat canon ability** — Party 0.5× physical AoE, HP > 61% phase. Source: idem.

- [ ] **🆕 ~Molten Dive canon ability** — Party 0.5× Fire magic AoE, HP < 61% phase. Source: idem.

- [ ] **🆕 ~Erupt Volcano Ball ability** — Single target 1× physical. **Only triggered via Fire Bird's Instigate Erupt** (pas autonomous). Pattern "extra controlled by main". Source: idem.

- [ ] **🆕 Volcano Villude location canon Disc 1** — Volcan Serdio (cohérent worldmap Serdio centre-sud). Boss Fire Bird scripted (submap 121). À documenter `locations/Volcano Villude.md` (à créer) + cross-reference Sapphire Pin chest Volcano Villude (cf. equipment.md). Source: idem.

- [ ] **🆕 Strategy canon Fire Bird : Addition spam exploit cycle** — Sequential Retaliation déterministic cycle → player peut **exploiter cycle 1→2→3** : forcer Retaliate (1st) HP swap → forcer (2nd) Volcano Balls summoning → kill Balls avant (3rd) Instigate Erupt → repeat. Pattern gameplay intéressant à documenter `combat/boss-strategies.md` (à créer). Source: idem.

- [ ] **🆕 Heat Blade Dart vs Fire Bird = same element resist** — Dart equip Heat Blade (Fire elemental) vs Fire Bird (Fire) = **0.5× resist canon** (same element). Pattern : switch back to non-elemental weapon (Bastard Sword) pour cette fight. À noter `items/equipment.md` Dart weapon switching strategy. Source: cross-ref combat/elements.md.

### Bosses / Lore (Fire Bird fandom — JP name Rokkuhāken + Rose's lore tease + Dabas NPC + Wounded Virage prequel + Battle of Hoax + ability names officiels)

- [ ] **🆕 Fire Bird JP name "ロックハーケン" (Rokkuhāken) "rock piton" canon ⚠️** — Divergence localisation majeure EN/JP : EN "Fire Bird" (Phoenix-like) vs JP "rock piton" (rock climbing tool, métaphore complètement différente). À investiguer rationale localisation Western. À documenter `lore/canon-naming.md` (à créer) Japanese subtleties. Source: [`features/bosses/_sources/fandom-fire-bird.md`](features/bosses/_sources/fandom-fire-bird.md).

- [ ] **🆕 Rose's "first hand knowledge of Fire Bird" canon lore tease ⭐ MAJEUR** — Visit Volcano Villude Disc 1, Rose recognizes Fire Bird "as if she has first hand knowledge of it, or as if it were a legend of the past". **11k ans Dragoon lore foreshadowing canon avant Disc 2/3 reveal Rose**. À refléter `party-members/Rose.md` (à créer) character arc + `quests/disc1-rose-foreshadowing.md` (à créer). Source: fandom-fire-bird.md §Story.

- [ ] **🆕 Dabas travelling merchant canon NPC** — Rescued par party in Volcano Villude after Wounded Virage. Possible recurring merchant NPC TLoD (Dabas pattern). À documenter `npcs/Dabas.md` (à créer) + appearances multiple locations à investiguer. Source: idem.

- [ ] **🆕 Wounded Virage boss prequel canon Volcano Villude ⚠️ NEW boss** — Pre-Fire Bird boss canon Volcano Villude. **Wounded Virage** = boss canon distinct (vs Complete Virage / Virages standard). À documenter `bosses/Wounded Virage.md` (à créer). Pattern canon **2 bosses consecutive same location** (advisable save between). Source: idem.

- [ ] **🆕 Phoenix resemblance canon Fire Bird ⭐** — "Fire Bird resembles the legendary bird Phoenix" → visual lore Phoenix mythology canon. À refléter `bosses/Fire Bird.md` design + lore reference. Source: fandom-fire-bird.md §Trivia.

- [ ] **🆕 Battle of Hoax canon event Disc 1** — Mentioned fandom : "after the Battle of Hoax". Major story event Disc 1 (probable cinematic siege Hoax village ?). À documenter `quests/disc1-battle-of-hoax.md` (à créer). Cohérent worldmap Hoax (Serdio centre-est, nord). Source: idem.

- [ ] **🆕 Soldier of Hoax warning Fire Bird canon NPC** — Après Battle of Hoax, un soldat warns Dart group of Fire Bird in Volcano Villude → setup canon next event. Pattern "NPC foreshadowing boss". À noter `locations/Hoax.md` (à créer). Source: idem.

- [ ] **🆕 HP color states canon UI : blue / yellow / red ⭐** — Pattern canon TLoD : HP visualization 3 zones colors. Probable mapping : blue (>60%) / yellow (30-60%) / red (<30%). Affecte boss AI triggers (Dive Bomb red-only, Presto Fire blue/yellow only). À implémenter `HpState = 'blue' | 'yellow' | 'red'` + boss AI conditions. Source: fandom-fire-bird.md §Attacks.

- [ ] **🆕 Fire Bird ability names officiels canon ⭐** — Fandom donne noms canon vs wiki ~community :
  - **Volcanic Peck** (= wiki ~Bind and Peck)
  - **Presto Fire** (= wiki ~Fiery Wing Beat ? probable, HP blue/yellow)
  - **Summon** (= wiki ~Call Volcano Balls)
  - **Dive Bomb** (= wiki ~Molten Dive ? probable, HP red only)
  - **Fire Quake** ⚠️ mentioned comparative ("Peck and Fire Quake") non détaillé → possible ability supplémentaire canon non catalogué wiki
    → Adopter fandom canon names dans Damia. À investiguer Fire Quake exact behavior. Source: idem.

- [ ] **🆕 Volcano Ball HP divergence wiki 8 vs fandom 50 ⚠️ MAJEUR** — Factor 6× divergence. Wiki tier 2 prévaut probable (8 = très fragile one-shot Disc 1). À vérifier in-game ou Discord cadors. Source: comparaison sources.

- [ ] **🆕 Fire Bird stats divergence wiki vs fandom ⚠️** :
  - P. Attack : wiki 13 vs fandom 15
  - M. Attack : wiki 16 vs fandom 19
    → Wiki tier 2 prévaut probable. Source: idem.

- [ ] **🆕 US/JP HP divergence Fire Bird canon** — 640 US / 800 JP (+25%). Pattern systématique JP +25% (cohérent Feyrbrand, Kamuy, Evergreen Forest). Adopter US canon Damia. Source: fandom-fire-bird.md table.

- [ ] **🆕 "Red-Eye Stone" vs "Red-Eyed Stone" orthographe ⚠️** — Wiki "Red-Eye Stone" / fandom "Red-Eyed Stone". À vérifier in-game canon spelling. Wiki tier 2 prévaut probable. Source: idem.

- [ ] **🆕 "Can Counterattack: Yes" fandom vs "Counters Additions: No" wiki ⚠️ conceptual divergence** — Wiki dit Counter Opportunities = 0 (pas counter Addition mechanism) mais fandom dit "Can Counterattack: Yes" (Retaliate canon term ?). Probable : Retaliate (wiki) = Counterattack (fandom) nomenclature divergente. **Counters Additions** = specific Addition counter mechanism distinct du Retaliate général. À clarifier nomenclature canon `combat/boss-passives.md` (à créer). Source: idem.

- [ ] **🆕 Spear Frosts Repeat Item canon Water/Frost element Bale ⭐** — Magic Attack Item canon : **Spear Frosts** (probable Water-elemental projectile attack), **bought at Bale**, **used by Rose or Shana** (women bows + daggers ?). Confirme Fire weak to Water via Repeat Items canon. À documenter `items/consumables.md` (à créer) Spear Frosts entry + Bale shop. Source: fandom-fire-bird.md §Strategy.

- [ ] **🆕 "Progressively stronger attacks as health gets lower" canon general pattern bosses ⭐** — Pattern canon TLoD master : bosses utilisent ability escalation HP-based. À documenter `combat/boss-ai.md` (à créer) general escalation pattern + appliquer à tous bosses. Source: idem.

- [ ] **🆕 Lavitz low MDF profile canon explicit** — "Lavitz has low Magical Defense" → confirme stat profile Lavitz (knight = high physical, low magical). À refléter `party-members/Lavitz.md` (à créer) stat profile canon. Source: idem.

- [ ] **🆕 Fire Quake ability canon — investigation needed ⚠️** — Mentioned indirectly "Peck and Fire Quake" comparative dans description Dive Bomb. Possible ability canon distincte Fire Bird non détaillée fandom. Pas dans wiki tier 2 listing. À investiguer Discord cadors / Prima Strategy Guide. Source: fandom-fire-bird.md §Attacks Dive Bomb.

### Mobs (Air Combat — premier mob documenté + pattern canon mobs vs bosses)

- [ ] **🆕 Catégorie `mobs/` créée canon** — Per-mob detailed pages (vs locations per-zone listings). Pattern documentation : stats + AI HP-conditional + status immunity 4✔/4✗ + encounters + drops. À documenter incrementally (les ~75 mobs canon TLoD). Source: [`features/mobs/README.md`](features/mobs/README.md).

- [ ] **🆕 Pattern canon mobs vs bosses status immunity ⭐ MAJEUR** — Bosses : **all 8 status immune** / Mobs : **4 immune (Petrify/Bewitch/Arm Block/Dispirit)** + **4 vulnerable (Confuse/Fear/Poison/Stun)**. Pattern design canon TLoD : bosses absolument résistants vs mobs partiellement résistants. À implémenter `EnemyType = 'boss' | 'mob' | 'unique_monster'` + `statusImmunity` mapping selon type. Source: idem.

- [ ] **🆕 Pattern AI canon mobs HP-conditional + chance-weighted ⭐** — "Minor enemies act on their turn based primarily on their current HP. Additional criteria, if any, is annotated on the table. Minor enemies have an equal chance to perform any eligible action unless otherwise indicated." À implémenter `MobAI { abilities: [{ hpRange, chance, action }] }` data structure. Source: idem.

- [ ] **🆕 Air Combat canon data-model** — Wind, HP 1,080, AT 93, DF 160, MAT 76, MDF 120, SPD 50, A-AV 5%, M-AV 0%. Mob Disc 4 Moon That Never Sets. À implémenter `mobs/air-combat.ts` data. Source: [`features/mobs/_sources/lod-wiki-air-combat.md`](features/mobs/_sources/lod-wiki-air-combat.md).

- [ ] **🆕 Air Combat 3 abilities HP-conditional canon** :
  - ~Razor Tail : Any HP, 75% chance, 1× phys single
  - Charging Spirit : HP > 25%, 25% chance, self-buff "preps Razor Tail OR All-out Attack! next turn"
  - All-out Attack! : HP ≤ 25%, 25% chance, **3× phys single** ⚠️ low-HP berserker
    Source: idem.

- [ ] **🆕 All-out Attack! 3× damage low HP berserker pattern canon ⭐** — Pattern canon mob "wounded more dangerous" : 3× physical damage multiplier disponible HP ≤ 25%. Distinct des bosses (HP-conditional phase swap, pas damage ×3 escalation). À implémenter pattern dans data-model + mob AI. Source: idem.

- [ ] **🆕 Charging Spirit self-buff "prepares next turn" canon ⚠️** — Self-buff sans damage immediate, prepare specific ability next turn. Pattern unique vs Attacking power up (Feyrbrand stacking) ou direct attacks. À implémenter `selfBuff.primesNextTurn: AbilityRef`. **Possible bug** : Charging Spirit HP > 25% prépare All-out Attack! (HP ≤ 25% required) — ambiguïté. À investiguer. Source: idem.

- [ ] **🆕 Air Combat = recolor Wyvern canon visual asset reuse ⚠️** — Pattern canon TLoD : asset reuse + recolor. Wyvern original = mob Mountain of Mortal Dragon, Air Combat = recolor Disc 4 Moon. À documenter `mobs/Wyvern.md` (à créer) + asset-sharing pattern dans `mobs/README.md`. Source: lod-wiki-air-combat.md §Trivia.

- [ ] **🆕 Air Combat "incapable of dealing magic damage" malgré MAT 76 ⭐ MAJEUR** — Pattern design canon "stat unused" : MAT 76 = vestigial/cosmetic stat, **0 magic abilities canon**. Implications :
  - Spiritual Ring / Robe / magic defense gear inutile vs Air Combat
  - Question : combien d'autres mobs canon ont MAT > 0 mais 0 magic abilities ?
    À documenter `mobs/README.md` pattern + investigation systematic.
    Source: idem.

- [ ] **🆕 Air Combat encounters Moon That Never Sets canon (Disc 4 endgame)** — Submaps 615, 616, 617, 618. Formations canon : Air Combat solo (35%/35%/10%) + Air Combat+Swift Dragon (10%/20%/35%). 2 unused formations (283, 288). Pattern "unused content cut" canon. À documenter `locations/Moon That Never Sets.md` (à créer). Source: idem.

- [ ] **🆕 Swift Dragon mob canon Moon That Never Sets** — Encounter partner de Air Combat formation 314. Pattern joined mob fights canon. À documenter `mobs/Swift Dragon.md` (à créer). Source: idem.

- [ ] **🆕 A-AV 5% Air Combat canon** — Minor evasion stat (5% chance miss). Pattern : mobs ont parfois petite A-AV (vs bosses 0%). À noter `mobs/README.md` pattern. Source: idem.

- [ ] **🆕 Drop rate 8% Repeat Item pattern mobs canon** — Air Combat drop Down Burst 8% (cohérent avec Evergreen Forest mobs all 8% drops). À investiguer : 8% = uniform mob drop rate canon ? Source: idem + cross-ref Evergreen Forest mobs.

### Mobs / Air Combat fandom complement — Wyvern classification + "stronger cousin same name" + Light blue eyes unique + Charging Spirit 50% + Down Burst Triceratops/Divine Tree counter + divergences stats

- [ ] **🆕 Air Combat = Wyvern type classification canon ⭐** — Fandom : "type of dragon, more specifically a Wyvern". Vs wiki "recolor of Wyvern" — fandom classification taxonomique vs wiki visual asset note. À documenter `mobs/Wyvern.md` (à créer) + species classification canon TLoD. Source: [`features/mobs/_sources/fandom-air-combat.md`](features/mobs/_sources/fandom-air-combat.md).

- [ ] **🆕 "Stronger cousin to monster of same name" canon ⚠️ MAJEUR** — Fandom : Air Combat = "much stronger cousin to a monster of the same name". Implique : **2 mobs canon avec nom "Air Combat"** OU Wyvern original = "monster of same name" species (Air Combat = late-game Wyvern variant). À investiguer mob "Air Combat" Disc 1-3 OR Wyvern relationship canon. Source: idem.

- [ ] **🆕 "The Everlasting Moon" = nom alternatif Moon That Never Sets canon ⚠️ NEW** — Location alt name canon. À refléter `locations/Moon That Never Sets.md` (à créer) + i18n. Source: idem.

- [ ] **🆕 Light blue eyes canon Air Combat unique trait ⭐ "without red eyes"** — Pattern lore canon TLoD : **majority mobs have red eyes** (cohérent avec "red-eye Dragon" Dragoon Dart). Air Combat = **"one of the few monsters without red eyes"** canon. À investiguer pattern "red eyes" canon mobs systematic. À documenter `mobs/README.md` red-eyes pattern. Source: idem.

- [ ] **🆕 Air Combat appearance détaillée canon** — Wings green/grey large + body brown + light blue eyes + spikes wings + 3 large tail spikes + massive talons + spiky head. À refléter visual design Damia. Source: idem.

- [ ] **🆕 Charging Spirit "50% next turn All-out Attack" canon précisé ⚠️** — Wiki vague ("Razor Tail OR All-out Attack! next turn"), fandom précis "50% chance All-out Attack next turn". Adopter fandom canon : `Charging Spirit { primesNextTurn: { sharpEdge: 0.5, allOutAttack: 0.5 } }`. Source: idem.

- [ ] **🆕 Sharp Edge canon name officiel (vs wiki ~Razor Tail) ⭐** — Fandom donne nom officiel "Sharp Edge". Adopter fandom canon dans Damia (~Razor Tail = community approximation wiki). Source: idem.

- [ ] **🆕 Down Burst "most potent wind-element spell item" canon descriptor** — Down Burst = top-tier Wind Repeat Item canon. Useful vs **Triceratops** + **Divine Tree mobs Earth-element**. À documenter `items/consumables.md` (à créer) Down Burst entry top-tier rank Wind. Source: idem.

- [ ] **🆕 Triceratops mob Earth-element canon ⚠️ NEW** — Mob canon mentioned fandom Air Combat strategy. Pattern : Wind counters Earth mobs. À documenter `mobs/Triceratops.md` (à créer). Source: idem.

- [ ] **🆕 Divine Tree mobs Earth-element pattern canon ⭐** — "Most monsters on The Divine Tree" Earth element → Wind counters. À refléter `locations/Divine Tree.md` mobs elemental biome pattern. Source: idem.

- [ ] **🆕 Down Burst farming time "~10 minutes average" canon** — Drop 8% × ~5 encounters/min ≈ 10 min average. Pattern farming efficiency canon. À utiliser pour balance Damia Mode Survival drop rates. Source: idem.

- [ ] **🆕 Stats divergences Air Combat wiki vs fandom ⚠️** :
  - P. Attack : wiki 93 vs fandom **105** (wiki × 1.125 — probable fandom = JP values)
  - M. Attack : wiki 76 vs fandom **86** (wiki × 1.13)
    → Pattern : fandom values potentiellement JP version stats canon ? À investiguer si fandom = JP / wiki = US/EU. Adopter wiki US tier 2 canon Damia. Source: comparaison sources.

- [ ] **🆕 A-AV divergence wiki 5% vs fandom 120 ⚠️ MAJEUR** — Wiki 5% (raisonnable), fandom 120 (suspicious — 120% impossible OR différent référentiel). Probable typo fandom. Wiki tier 2 prévaut. Source: idem.

- [ ] **🆕 JP version Gold ÷3 canon Air Combat (33 US → 11 JP)** — Pattern JP harsher reward (vs +25% HP). Confirmé Air Combat. À documenter `combat/canon-divergences.md` US vs JP balance pattern + investiguer si autres mobs JP Gold reduction systematic. Source: idem.

- [ ] **🆕 JP HP Air Combat +25% canon (1080 → 1350)** — Pattern systématique JP +25% HP (cohérent autres bosses/mobs). Adopter US canon. Source: idem.

- [ ] **🆕 Air Combat "only Wind-element mob Moon That Never Sets" canon** — Pattern : Moon That Never Sets = endgame area, Air Combat = unique Wind mob there. Implique autres mobs Moon = autres éléments. À cross-référer `locations/Moon That Never Sets.md` (à créer) elemental biome distribution. Source: idem.

- [ ] **🆕 Swift Dragon partner formation 314 — mob Earth probable ⚠️** — Swift Dragon = Air Combat encounter partner. Si Moon That Never Sets variety, Swift Dragon = Earth or other element ? À documenter `mobs/Swift Dragon.md` (à créer). Source: idem.

### Mobs / Aqua King (Water Aglis Disc 4 — premier Counter Additions table canon + Magical Attack Barrier rare + retail bug "0 damage")

- [ ] **🆕 Aqua King canon data-model** — Water, HP 640, AT 67, DF 120, MAT 65, MDF **160** (high anti-magic), SPD 70, A-AV/M-AV 0%. Mob **Disc 4 Aglis** (Magic City endgame Wingly hidden). À implémenter `mobs/aqua-king.ts`. Source: [`features/mobs/_sources/lod-wiki-aqua-king.md`](features/mobs/_sources/lod-wiki-aqua-king.md). Priorité: **moyenne**.

- [ ] **🆕 Counterattack Opportunities table canon ⭐ MAJEUR NEW mécanique** — Premier mob documenté avec table complète Counter Additions (28 opportunities). Pattern : Addition player button presses spécifiques déclenchent counter du mob. À implémenter `CounterOpportunity { user, addition, buttonPresses: number[] }` + `MobCounterTable`. À documenter master pattern `combat/counter-additions.md` (à créer). Source: idem.

- [ ] **🆕 28 Counter Opportunities distribution canon Aqua King** :
  - Dart 5 (Volcano [2] / Crush Dance [2,3] / Moon Strike [2,3])
  - Lavitz 9 (Rod Typhoon [2,3] / Gust of Wind Dance [2,5] / Flower Storm [2,3,4,5,6])
  - Rose 5 (Hard Blade [2] / Demon's Dance [3,4,5,6])
  - Meru 5 (Cool Boogie [2,3] / Cat's Cradle [3,4] / Perky Step [2])
  - Haschel 2 (Summon 4 Gods [2] / Hex Hammer [2])
  - Albert 2 (Gust of Wind Dance [2] / Flower Storm [2])
    Pattern : **press 2 dominant** (8 occurrences) = "second-press vulnerability moment". Source: idem.

- [ ] **🆕 Counter Opportunities Shana/Miranda absentes canon confirmé** — Pattern "no Additions Shana/Miranda" confirmé encore (cf. Wargod Calling/Ultimate Wargod restriction). Source: idem.

- [ ] **🆕 Counter Opportunities Kongol absent ⚠️** — Aqua King Disc 4 Aglis. Kongol disponible Disc 2+ (recrutement Black Castle Kazas L20 canon), donc pas une question de timing. **Probable Kongol Additions sans counter listées canon OR oversight wiki** — à investiguer. Source: idem.

- [ ] **🆕 Magical Attack Barrier rare ability canon ⭐ "1 of 2 enemies"** — Aqua King + **Treasure Jar** (between Lidiera & Fueno) = only 2 enemies game capable Magical Attack Barrier. Reduces magical damage to 0 until next turn. Pattern canon ultra-rare. À documenter `combat/boss-abilities.md` (à créer) + `mobs/Treasure Jar.md` (à créer). Source: idem.

- [ ] **🆕 Physical Attack Barrier canon Aqua King** — Reduces physical damage to **0** until next turn. Pattern temporary immunity. 50% chance HP > 50%. À implémenter `Buff { immunityType: 'physical', duration: 1 }`. Source: idem.

- [ ] **🆕 Power up self-buff +50%/-50% × 3 turns canon** — Disponible Any HP 25% chance. **+50% damage dealt + -50% damage received** for **3 turns**. Pattern différent Feyrbrand Attacking power up (additive). À implémenter `Buff { type: 'dual_damage_modifier', dealtMult: 1.5, receivedMult: 0.5, duration: 3 }`. Source: idem.

- [ ] **🆕 Trident Stab BUGGED retail canon ⚠️ MAJEUR** — "Bugged in retail so Aqua King simply does nothing when selecting this action". 75% HP ≤ 50% action devrait infliger 1× phys, but **does nothing canon**. Conséquence : **Aqua King has 0 damage-dealing abilities en retail PS1**. Damia : preserve bug authenticity OR fix balance ? À documenter `combat/canon-bugs.md` (à créer). Source: idem.

- [ ] **🆕 Aqua King "trivial encounter due to bug" canon** — Observation canon : Power Down (3 turns debuff) wears off before Aqua King takes 3 turns → mob attaque rarement. À noter `combat/canon-bugs.md` retail observable patterns. Source: idem.

- [ ] **🆕 Aqua King AI HP-split offense/defense canon** :
  - HP > 50% = **100% defense** (Phys Barrier 50% / Mag Barrier 25% / Power up 25%) = **0% offense**
  - HP ≤ 50% = 75% Trident Stab (BUG = nothing) / 25% Power up
    Pattern unique : mob never attacks HP > 50% canon ! Mais bug rend même HP ≤ 50% non-aggressive. Source: idem.

- [ ] **🆕 Aqua King = Merman recolor canon (Marshland Disc 1)** — Pattern visual reuse. À documenter `mobs/Merman.md` (à créer) Marshland Disc 1 + cross-ref recolor pattern Air Combat/Wyvern. Source: idem trivia.

- [ ] **🆕 Aqua King encounters Aglis Disc 4 canon** — Submaps 570-582, 712. Formations : solo (234) + Aqua King+Minotaur (236) + Scud Shark+Aqua King (238). À documenter `locations/Aglis.md` (à enrichir) + `mobs/Minotaur.md` + `mobs/Scud Shark.md` (à créer). Source: idem.

- [ ] **🆕 Treasure Jar mob canon location "between Lidiera and Fueno"** ⭐ — Disc 2 Tiberoa area mob. Magical Attack Barrier rare. À documenter `mobs/Treasure Jar.md` (à créer) + cross-reference locations canon (Lidiera island Tiberoa, Fueno port). Source: idem trivia.

- [ ] **🆕 Counter mechanism unanswered questions ⚠️** :
  - Counter par button press OR counter total fin Addition ?
  - Damage du counter Aqua King ?
  - Mob skips own turn quand counter ?
  - Player peut "skip" certains button presses pour éviter counter ?
    À investiguer Discord cadors + `combat/counter-additions.md` (à créer). Source: gap dans wiki.

- [ ] **🆕 "Press 2 dominant" pattern canon Counter Opportunities ⭐** — 8 occurrences "press 2" sur 15 abilities. Implique : **second button press = vulnerability frequency canon**. À investiguer si pattern systématique tous mobs counter OR Aqua King-spécifique. Source: comptage table.

- [ ] **🆕 Lavitz Flower Storm "5 button presses counter" max canon** — Addition complexe Lavitz late-game (5 hits). Pattern Addition = boss-counter-prone (more presses = more counter risk). À documenter `combat/additions.md` Flower Storm details. Source: idem.

- [ ] **🆕 Rose Demon's Dance "presses 3-6" 4-counter canon** — Pattern : Rose Addition mid-tier 4 counter presses (3 through 6). À documenter Rose's Demon's Dance Addition details. Source: idem.

- [ ] **🆕 Cool Boogie Meru "presses 2, 3" canon** — Confirme Cool Boogie = Addition Meru (déjà mentionné canon equipment.md Pretty Hammer + Wargod's Sash + Cool Boogie L5 = 495 SP optimal grind). Source: idem.

- [ ] **🆕 Status applicables vs Aqua King canon** — Confuse / Fear / Poison / Stun applicables. Status weapons effective vs Aqua King : Mind Crush (Dart), Bemusing Arrow (Shana), Spear of Terror (Lavitz), Virulent Arrow (Shana), Beast Fang (Haschel). Source: status immunity standard mob pattern.

### Mobs / Aqua King fandom complement — "Magic City Aglis" + yellow eyes + cannot have both Barriers simultaneous + Spider Urchin mob + grind Additions canon

- [ ] **🆕 "Magic City, Aglis" canon name ⭐** — Aglis = **"The Magic City"** canon descriptor. À refléter `locations/Aglis.md` (Wingly Magic City canon name complete). Source: [`features/mobs/_sources/fandom-aqua-king.md`](features/mobs/_sources/fandom-aqua-king.md).

- [ ] **🆕 Aqua King yellow eyes canon trait ⭐** — Vs Air Combat **light blue eyes** + majorité mobs **red eyes**. Pattern lore canon "eye colors mobs" : yellow / blue / red distinct canon. À investiguer pattern systematic + documenter `mobs/README.md` eye-colors lore. Source: idem.

- [ ] **🆕 "Cannot have both Barriers active simultaneously" constraint canon ⭐** — Player peut exploiter : si Phys Barrier active, switch to magic damage next turn (Magic Barrier sera utilisé tour suivant). À implémenter `MutuallyExclusive { abilities: [PhysicalBarrier, MagicalBarrier] }` constraint. Source: idem.

- [ ] **🆕 Power Up canon effect divergence wiki vs fandom ⚠️** — Wiki : "+50% damage dealt + -50% damage received × 3 turns" (damage-multiplier model). Fandom : "DF + MDF + AT + MAT boost × 3 turns" (stat-based model). Probable même effect réel, descriptions différentes. À investiguer Discord cadors. Adopter wiki tier 2 damage-multiplier canon probable. Source: comparaison.

- [ ] **🆕 Spider Urchin mob canon Aglis ⚠️ NEW** — Fandom mentioned other Aglis mob "Spider Urchin could still attack back". À documenter `mobs/Spider Urchin.md` (à créer). Source: fandom-aqua-king.md §Battle.

- [ ] **🆕 Aqua King = "best Addition grind target" canon ⭐** — Pattern farming : Aqua King bug = safe environment Phys Barrier most often → spam Additions sans damage taken. À documenter `combat/addition-grinding.md` (à créer) + cross-ref Aqua King utilité farming canon. Source: idem.

- [ ] **🆕 Speed 70 Aqua King vs Kongol/Albert pattern canon** — Aqua King SPD 70 = mid-high. Kongol + Albert = **low SPD profil canon**. Pour out-speed Aqua King = équiper **Bandit's Shoes (+20 SPD) + Bandit's Ring (+20 SPD)** = +40 SPD boost canon strategy. À refléter `party-members/Kongol.md` + `party-members/Albert.md` low SPD stat profiles. Source: idem.

- [ ] **🆕 Angel's Prayer shop item 30 gold canon ⚠️** — Healing item canon, **purchased 30 gold** (probable Bale/Lohan shops). Counter-productive farming Aqua King vs direct shop purchase. À documenter `items/consumables.md` (à créer) Angel's Prayer entry + shop locations canon. Source: idem.

- [ ] **🆕 Aqua King farming time ~15 min canon** — Drop Angel's Prayer 8% × encounter rate Aglis = ~15 min average. Pattern farming efficiency canon (vs Air Combat ~10 min). Source: idem.

- [ ] **🆕 Aqua King appearance détaillée canon** — Merfolk wielding trident + several fins + gills body + yellow eyes + **red skin** + **silver underbelly + silver fins**. À refléter visual design Damia. Source: fandom-aqua-king.md §Appearance.

- [ ] **🆕 Stats divergences Aqua King wiki vs fandom ⚠️** :
  - P. Attack : wiki 67 vs fandom **76** (×1.13 — probable JP values fandom pattern systématique)
  - M. Attack : wiki 65 vs fandom **73** (×1.12)
    → Wiki tier 2 US prévaut probable. Pattern : fandom values = JP values systematic à investiguer. Source: comparaison.

- [ ] **🆕 JP version Aqua King canon** — HP 800 (+25%) / Gold 10 (÷3) — pattern systématique JP. Source: fandom-aqua-king.md table.

- [x] **✅ "Disc 4 Monsters" categorization fandom Aqua King CONFIRMÉ CORRECT** — Aglis = **Disc 4** canon (endgame Magic City Wingly hidden, accédée depuis **Rouge** dans les Broken Islands — la mer se sépare en deux pour inviter la party, puis se referme piégeant à l'intérieur). Forest of Winglies = location Mille Seseau Disc 3 (≠ Aglis, 2 Wingly cities distinctes). Doc Damia initiale erronée "Disc 2 via Donau Meru" + "Disc 4 via Forest of Winglies" corrigées 2026-05-20. Source: user clarification + `locations/Aglis.md` (déjà correct).

### Bosses / Archangel (Light boss Disc 4 Moon That Never Sets — Final Verdict dialogue mechanic + Meru-targeted + 28 Counter table identique Aqua King)

- [ ] **🆕 Archangel canon data-model** — Light, HP 3,000, AT 53, DF 80, MAT 76, MDF 160, SPD 50, A-AV 5%, M-AV 5%. Boss Disc 4 endgame Moon That Never Sets submap 729. À implémenter `bosses/archangel.ts`. Source: [`features/bosses/_sources/lod-wiki-archangel.md`](features/bosses/_sources/lod-wiki-archangel.md). Priorité: **moyenne**.

- [ ] **🆕 Final Verdict victory condition canon ⭐ MAJEUR UNIQUE TLoD** — "Battle ends after Talk is used for the last time". Pattern unique : **battle ends via dialogue Talk usage final** (PAS HP=0). Archangel utilise 4 Talks (HP <75% / <60% / <35% / <5%) → 4ème Talk déclenche fin. À implémenter `BossVictoryCondition = { type: 'dialogue_complete', maxTalks: 4, hpThresholds: [0.75, 0.60, 0.35, 0.05] }`. À documenter `combat/boss-victory-conditions.md` (à créer). Source: idem.

- [ ] **🆕 28 Counter Opportunities IDENTIQUE Aqua King ⭐ HYPOTHÈSE pattern UNIVERSEL canon** — Archangel + Aqua King partagent **exactement le même tableau 28 opportunities**. Hypothèse : Counter Opportunities = **table UNIVERSEL canon pour tous enemies avec `Counters Additions: Yes`**. À investiguer : autres bosses/mobs canon avec Counter Additions → confirmation hypothesis pattern universel ? À implémenter `UNIVERSAL_COUNTER_TABLE: CounterOpportunity[]` shared data. Source: comparaison Aqua King + Archangel.

- [ ] **🆕 Meru-targeted boss canon ⭐ MAJEUR** — Archangel **heals Meru** (Healing Flower 30% / Healing Scripture 100% si HP ≤ 31%) + **talks to Meru** (4 talks dialogue) → connection lore Meru-Wingly endgame. Pattern boss "personal connection" canon. À documenter `party-members/Meru.md` (à créer) Disc 4 lore arc + investigation identité Archangel. Source: idem.

- [ ] **🆕 Archangel identity hypothèse canon ⚠️** — Possible identités : **Charle Frahma** (Wingly elder canon Ulara reveal) OR Meru's mother / Wingly ancestor / spirit form. À investiguer fandom Archangel + lore Disc 4 Moon. À documenter `npcs/Charle Frahma.md` (à créer) + cross-référer. Source: spéculation lore.

- [ ] **🆕 Blow Trumpet "reduce target HP to 1 + grant turn out of order, cannot be dodged" canon ⭐ UNIQUE** — Pattern boss ability unique :
  - Reduce target HP to 1 (near-kill scaling)
  - Grant target turn out of order (compensatory mechanic)
  - **Cannot be dodged** (A-AV/M-AV irrelevant)
  - Used **once at HP < 75%** AND **once at HP < 35%** = 2 utilisations
    À implémenter `Ability { setTargetHpTo: 1, grantsExtraTurn: true, cannotDodge: true, onlyUsedOnce: true, hpThresholds: [0.75, 0.35] }`. Source: idem.

- [ ] **🆕 Healing Flower visual bug overflow canon ⚠️** — "Should recovery exceed Meru's max HP, displays correct number but actually recovers 0 HP". Retail bug pattern (cohérent Aqua King Trident Stab bug). À documenter `combat/canon-bugs.md` (à créer) Healing Flower overflow entry. Damia : preserve OR fix ? Source: idem.

- [ ] **🆕 4 Talk thresholds canon HP <75% / <60% / <35% / <5%** — Pattern boss dialogue progression : 4 talks à 4 HP thresholds spécifiques. Cohérent boss canon "story-driven phase swap". À implémenter `Ability { hpThresholds: [0.75, 0.60, 0.35, 0.05], onlyUsedOnce: true }`. Source: idem.

- [ ] **🆕 Healing Flower / Healing Scripture mutual exclusion canon** — Aqua King pattern "cannot have both Barriers simultaneous" → Archangel pattern similaire : Healing Flower OR Healing Scripture (alternative, not both). À implémenter `MutuallyExclusive { abilities: [HealingFlower, HealingScripture] }`. Source: idem.

- [ ] **🆕 "Healing the enemy party member" canon rare pattern ⚠️** — Boss heals player character (Meru spécifiquement) = pattern rare canon. Possible exploit : keep Meru HP low to waste Archangel turns healing. À investiguer si pattern intended OR unintended canon. Source: idem.

- [ ] **🆕 Archangel abilities damage canon** :
  - ~Sword Bash : 1× phys single
  - **Spark Net** : 1.2× Thunder magic single (official name)
  - **Flash Hall** : 3× Thunder magic AoE party ⚠️
  - **Trans Light** : 1.5× Light magic single
  - **Spectral Flash** : 3× Light magic AoE party ⚠️
    → 3× AoE party damage = high party-wipe potential canon endgame. Source: idem.

- [ ] **🆕 Spark Net + Flash Hall + Trans Light + Spectral Flash = canon ability names officiels (pas ~)** — Vs ~Sword Bash / ~Healing Flower / ~Healing Scripture / ~Blow Trumpet / ~Talk community-named. Pattern : magic abilities = canon official names / physical = community ~names. À noter `combat/ability-naming.md` (à créer). Source: idem.

- [ ] **🆕 Drop Nothing canon Archangel** — Boss story-endgame, pas de loot direct (vs Fire Bird Red-Eye Stone 100% / Feyrbrand Down Burst 100%). Cohérent : Final Verdict = story conclusion, pas defeat traditional. Source: idem.

- [ ] **🆕 EXP 6000 / Gold 0 Archangel canon** — High EXP yield (cohérent boss endgame) + 0 Gold (story-boss pattern). Source: idem.

- [ ] **🆕 A-AV 5% / M-AV 5% boss endgame canon** — Vs majorité bosses 0% evasion. Pattern : boss endgame Disc 4 = evasion notable. À investiguer autres bosses Disc 4 evasion stats. Source: idem.

### Bosses / Archangel fandom complement — Wingly deity invented god (PAS Charle Frahma) + Meru solo fight + no Dragoon form Moon solo combats + 107 species + Ancestor Blano + Buddhist Mara

- [ ] **🆕 Archangel = Wingly deity "invented god" canon ⭐ MAJEUR identity révélée** — PAS Charle Frahma (hypothèse précédente écartée). Archangel = **deity worshipped by Winglies Forest of Winglies** (PAS toutes les Winglies — Ulara n'a pas de traces). **Vision/test illusoire**, PAS entity réel — Meru reveal canon : "You are not real! You are an invented god so they can justify themselves". À refléter `bosses/Archangel.md` identity + `lore/wingly-religion.md` (à créer). Source: [`features/bosses/_sources/fandom-archangel.md`](features/bosses/_sources/fandom-archangel.md).

- [ ] **🆕 Meru solo fight Archangel canon ⚠️** — Bridge to floating castle disappears, **Meru teleported alone**. Pas full party. À implémenter `SoloCombatConstraints { onlyCharacter: 'Meru', forbidsDragoonForm: true }`. Source: idem.

- [ ] **🆕 "No Dragoon form Moon solo combats" pattern canon ⭐ MAJEUR** — "As with all the Moon solo combats, the Dragoon form cannot be used". Implique : **pattern systematic Moon That Never Sets solo combats canon** (combien autres ? À investiguer per character). À documenter `locations/Moon That Never Sets.md` (à créer) solo combats pattern + `combat/dragoon-restrictions.md` (à créer). Source: idem.

- [ ] **🆕 Other Moon solo combats utilisent "right/wrong answer choice" canon ⚠️ NEW pattern** — Fandom : "in contrast to other battles in the Moon That Never Sets, it is not necessary to choose between a correct and wrong answer". Implique **autres Moon solo combats canon utilisent dialogue answer choice victory** (vs Archangel "fight through"). Quels personnages ? Quels mécaniques ? À investiguer canon Moon solo combats catalog. Source: idem.

- [ ] **🆕 Appearance Archangel canon 4 wings 6 arms + 6 items wielded** — "Angel with four feathered wings and six arms" wielding **book + staff + shield + sword + black flower + horn**. Visual design canon. Cohérent ability "Wingly Army" horn = Buddhist Mara reference. À refléter visual design Damia. Source: idem.

- [ ] **🆕 Ancestor Blano canon NPC Forest of Winglies ⭐** — Wingly leader Forest of Winglies. Disc 3 : decides Wingly-Human cooperation vs Divine Dragon. À documenter `npcs/Ancestor Blano.md` (à créer) + `locations/Forest of Winglies.md` (à créer). Source: idem.

- [ ] **🆕 Statue Archangel Disc 3 Forest of Winglies canon** — Meru introduit Dart au statue Archangel dans Wingly shops room. Meru quote canon : "It's the Archangel! It's the guardian god of the Winglies! [...] I dunno. I've never been protected. Maybe, I just don't know though." → foreshadowing rejection Disc 4. À documenter `locations/Forest of Winglies.md` (à créer). Source: idem.

- [ ] **🆕 107 species Divine Tree canon ⚠️ DIVERGENCE vs précédent 108 species ⭐** — Archangel claim canon : "of the **107 species** created from fruits of the Divine Tree, over half are extinct". Ma précédente doc disait **108 species** (Winglies=107th, Virage=108th). À reconcilier : 107 (sans Winglies créateurs) + 108 total avec Virage suspended ? À documenter `lore/108-species.md` ou `lore/107-species.md` (à créer) clarification canon. Source: idem.

- [ ] **🆕 Wingly extermination history canon ⭐ MAJEUR** — Archangel claim : "of 107 species created, **over half are extinct**, a trend ended by the Winglies". Meru counter canon : "**many of those were exterminated by the Winglies themselves**". Archangel reply : "they were meant to become extinct from the beginning". Pattern lore canon Wingly supremacy historique génocide species. À documenter `lore/wingly-history.md` (à créer) + `lore/108-species.md` extinct species canon. Source: idem.

- [ ] **🆕 Meru "love humans" ideology canon ⭐** — Quote canon Meru : "I love Humans! I adore Dart, Shana and the others! This is real!! Get of out my sight!! I love Humans." Pattern character arc canon Meru = **Wingly mais rejette Wingly supremacy via humans love**. À refléter `party-members/Meru.md` (à créer) character arc Disc 4 climax. Source: idem.

- [ ] **🆕 Wingly Army = Buddhist Mara reference canon ⭐** — Special summoning attack = reference Buddhist legend **Mara** (demon heading fiend army from elephant **Girimekhala** attempting prevent **Gautama** meditation/enlightenment). Pattern lore symbolisme TLoD references mythologique. À documenter `lore/mythological-references.md` (à créer). Source: fandom-archangel.md §Trivia.

- [ ] **🆕 "Archangel Wingly identity uncertain" canon ⚠️** — "It is unknown whether the Archangel is a Wingly himself or not". Comparison **Melbu Frahma "little similarity to regular Winglies"** canon. Pattern : **certains Wingly figures pas typical Wingly canon** (Archangel, Melbu Frahma). À investiguer lore canon. Source: idem.

- [ ] **🆕 Archangel worship limited Forest of Winglies canon ⚠️** — "In Ulara, the other living Wingly city shown in the game, no traces of the Archangel can be found". Implique **religion Wingly NOT uniform canon** — Forest of Winglies specific cult vs Ulara secular ?. À documenter `lore/wingly-religion.md` (à créer). Source: idem.

- [ ] **🆕 Stats divergences Archangel wiki vs fandom ⚠️** :
  - HP : wiki 3,000 / fandom **3,200 US** / **4,000 JP** (+33%)
  - P. Attack : wiki 53 / fandom **60** (×1.13)
  - M. Attack : wiki 76 / fandom **86** (×1.13)
    → Wiki tier 2 US prévaut canonical. JP HP +33% pattern. Source: comparaison.

- [ ] **🆕 Ability names mapping wiki vs fandom Archangel canon** :
  - ~Sword Bash → **Manju Dagger** (fandom canon name)
  - ~Blow Trumpet → **Wingly Army** (fandom canon name + Buddhist Mara reference)
  - ~Healing Flower → **Flower Gift** (1350 HP exact value fandom)
  - ~Healing Scripture → **Healing Gift**
  - Spark Net + Flash Hall + Trans Light + Spectral Flash → **"Heaven Spell"** (composite fandom)
  - ~Talk → not in fandom (mécanique unique wiki)
    → Adopter fandom canon names + wiki tier 2 mechanics specifics. Source: comparaison.

- [ ] **🆕 Flower Gift heals 1350 HP exact canon** — Vs wiki "30% Meru HP recovery". Si exact = 1350 HP, Meru max HP probable ~4500 (30% = 1350 match). Calibration canon Meru HP late-game. À investiguer Meru max HP canon Disc 4. Source: idem.

- [ ] **🆕 Healing Fog Repeat Item canon counter Wingly Army HP→1** — Strategy fandom : "quickly countered by using a healing fog or similar item". Healing Fog = Repeat Item canon Wind/healing-related (cohérent forest theme). À documenter `items/consumables.md` (à créer) Healing Fog entry. Source: idem.

- [ ] **🆕 "Bridge disappears + teleported alone" cutscene pattern canon** — Disc 4 Moon solo combats canon : approach floating castle → bridge removed → solo teleport. À implémenter cutscene canon pattern `cinematics/disc4-moon-solo.md` (à créer). Source: idem.

### Mobs / Arrow Shooter (Earth Barrens Disc 2 Tiberoa — Counter Opportunities (9) ≠ Aqua King/Archangel (28) INVALIDE hypothesis universal + source Bemusing Arrow weapon drop + 3-phase HP AI)

- [ ] **🆕 Arrow Shooter canon data-model** — Earth, HP 168, AT 33, DF 100, MAT 33, MDF 100, SPD 60, A-AV/M-AV 0%. Mob Barrens Disc 2 Tiberoa + World Map roads. À implémenter `mobs/arrow-shooter.ts`. Source: [`features/mobs/_sources/lod-wiki-arrow-shooter.md`](features/mobs/_sources/lod-wiki-arrow-shooter.md). Priorité: **moyenne**.

- [ ] **🆕 Counter Opportunities (9) Arrow Shooter ⚠️ INVALIDE hypothesis universal canon ⭐ MAJEUR** — Pattern revised : Counter Opportunities = **per-enemy specific** canon (vs précédente hypothesis universal 28). Distribution Arrow Shooter : Dart 3 / Lavitz 2 / Rose 2 / Meru 1 / Albert 1 / Haschel 0 / Shana/Miranda/Kongol 0. **Aqua King + Archangel (28 même table)** = possible **tier "high counter density"** canon distinct d'Arrow Shooter "mid counter density" (9). À investiguer mapping complet per-enemy. Source: idem.

- [ ] **🆕 Bemusing Arrow weapon drop 2% canon ⚠️ pattern rate weapons** — Drop rate **2%** (vs standard mob Repeat Item 8%). Pattern canon **weapon drops = lower rate** ? À investiguer systematic autres weapon drops mobs canon. Source: idem.

- [ ] **🆕 Arrow Shooter AI 3-phase HP canon ⭐** :
  - HP > 50% : ~Punch (1× phys basic)
  - HP ≤ 50%, > 25% : **Poison Arrow** (1.5× phys + 100% Poison, A-AV mitigation) OU **Thunder Arrow** (1.5× phys + 100% Stun, M-AV mitigation)
  - HP ≤ 25% : **Detonating Arrow** (Party 0.5× Non-Elemental magic AoE)
    Pattern canon mob mid-tier 3-phase escalation. Source: idem.

- [ ] **🆕 Status proc mitigation type canon (A-AV vs M-AV) ⭐** — Poison Arrow physical damage + Poison proc → **A-AV** mitigation. Thunder Arrow physical damage + Stun proc → **M-AV** mitigation. Implique : **mitigation type depends on ability nature, NOT damage type**. Probable : Thunder Arrow = "physical damage with Thunder element" → M-AV. À implémenter `StatusProc { mitigatedBy: 'A-AV' | 'M-AV' }`. À documenter `combat/status-effects.md` (à créer) mitigation patterns. Source: idem.

- [ ] **🆕 Detonating Arrow Non-Elemental AoE party canon ⚠️** — Earth mob utilise **Non-Elemental** magic ability = exception canon. Pattern : ability element ≠ mob element. Cohérent **"Detonate family" canon** (Detonating Arrow = Arrow Shooter / Detonate Rock = Attack Item / Detonate Arrow = Shana/Miranda weapon). Probable : "Detonate" family = Non-Elemental AoE systematic. Source: idem.

- [ ] **🆕 World Map roads encounters canon Arrow Shooter** — 4 roads canon : Barrens→Intersection, Barrens→Donau, Barrens→Valley of Corrupted Gravity, Valley→Home of Giganto. Pattern Tiberoa roads canon. À documenter `world-map/road-encounters.md` (à créer). Source: idem.

- [ ] **🆕 Escape rate 40% Arrow Shooter canon ⚠️** — Vs 30% standard random encounters. Pattern : World Map roads + Barrens canon = **40% escape rate**. À investiguer autres roads mobs canon si systematic. Source: idem.

- [ ] **🆕 Frilled Lizard mob canon NEW Barrens partner** — Encounter formation 86 partner Arrow Shooter. À documenter `mobs/Frilled Lizard.md` (à créer). Source: idem.

- [ ] **🆕 Barrens Tiberoa Disc 2 submaps 231-233 canon** — Desert location Disc 2 (entre Donau et Valley of Corrupted Gravity probable). À documenter `locations/Barrens.md` (à créer). Source: idem + cross-ref Warrior Dress equipment chest Barrens canon.

- [ ] **🆕 Tiberoa road network canon Disc 2** :
  - Barrens ↔ Donau (north Tiberoa)
  - Barrens ↔ Valley of Corrupted Gravity
  - Valley of Corrupted Gravity ↔ Home of Giganto
  - Barrens ↔ Intersection
    → À documenter `world-map/tiberoa-roads.md` (à créer) + `world-map/endiness.md` enrichissement. Source: idem.

### Mobs / Arrow Shooter fandom complement — centaur tiger appearance + Muscle Fist canon + Detonate Arrow naming + Body Purifier + Fueno shop Bemusing Arrow

- [ ] **🆕 Arrow Shooter appearance canon centaur tiger ⭐** — "Centaur with lower body of a tiger" + strap chest + bow + quiver + helmet. Visual design canon unique : tiger-centaur archer. À refléter visual design Damia. Source: [`features/mobs/_sources/fandom-arrow-shooter.md`](features/mobs/_sources/fandom-arrow-shooter.md).

- [ ] **🆕 Muscle Fist canon name officiel (vs wiki ~Punch) ⭐** — Adopter fandom canon dans Damia. Cohérent pattern fandom donne noms officiels (vs wiki ~community approximations). Source: idem.

- [ ] **🆕 "Detonate Arrow" naming canon (vs wiki "Detonating Arrow") ⚠️** — Fandom dit "Detonate Arrow" cohérent avec weapon Shana/Miranda "Detonate Arrow" + Repeat Item "Detonate Rock". Pattern "Detonate family" naming uniform. Adopter fandom canonical "Detonate Arrow" Damia. À corriger dans Arrow Shooter docs + Aqua King refs. Source: idem.

- [ ] **🆕 Body Purifier Repeat Item canon (Poison cure) ⭐** — Fandom strategy : "keep some Body Purifiers" vs Arrow Shooter Poison Arrow. Implique Body Purifier = canon Poison-status cure Repeat Item. À documenter `items/consumables.md` (à créer) Body Purifier entry (cohérent avec Body Purifier chest Evergreen Forest canon). Source: idem.

- [ ] **🆕 Bemusing Arrow buyable Fueno Disc 2 canon** — Confirme weapon disponible shop Fueno (cohérent equipment.md Bemusing Arrow shop Fueno 250G canon). Pattern : 2% drop OR purchase later canon design. Source: idem.

- [ ] **🆕 "4 hours away from Fueno when Arrow Shooter encountered" canon timing ⭐** — Implication player timeline Disc 2 : Arrow Shooter Barrens = ~4h before Fueno shop. Pattern timing canon Disc 2 progression. À noter `world-map/disc2-progression.md` (à créer). Source: idem.

- [ ] **🆕 "Second screen Barrens" matters for farming canon ⚠️** — Implique Barrens a **multiple screens/submaps avec encounter rates différentes**. À investiguer Barrens detailed map canon (probable submaps 231 vs 232 vs 233 différents farming efficiency). À documenter `locations/Barrens.md` (à créer). Source: idem.

- [ ] **🆕 Detonate Arrow weapon "very end of final disc near final encounter" canon** — Confirme equipment.md acquisition Detonate Arrow weapon Shana/Miranda = Chest Moon That Never Sets pre-final boss. Source: idem.

- [ ] **🆕 Stats divergences Arrow Shooter wiki vs fandom ⚠️** :
  - HP : wiki 168 vs fandom **176** (US) / **210** (JP)
  - P. Attack : wiki 33 vs fandom **37** (+12%)
  - M. Attack : wiki 33 vs fandom **37** (+12%)
  - Gold JP : 8 (÷3 pattern)
    → Wiki tier 2 US prévaut canonical. JP HP +25% pattern systématique. Source: comparaison.

- [ ] **🆕 AI phase order canon divergence wiki vs fandom ⚠️** — Wiki : Phase 2 = Poison Arrow OR Thunder Arrow random ≤50%>25% / Phase 3 = Detonate ≤25%. Fandom : Poison Arrow d'abord → Thunder Arrow when "health halved" → Detonate Arrow when "critical". Probable réconciliation : Thunder Arrow chance ↑ progressivement avec HP lower. À investiguer Discord cadors. Source: idem.

### Mobs / Assassin Cock (Wind Forest Seles Disc 1 earliest mob — Counter Opportunities (19) new tier + escape 90% + Sandora-trained birds hypothesis + Fowl Fighter recolor)

- [ ] **🆕 Assassin Cock canon data-model ⭐ first regular mob TLoD** — Wind, HP **3**, AT 2, DF 100, MAT 2, MDF 120, SPD 45, A-AV/M-AV 0%. Mob Forest near Seles Disc 1 + 4 World Map roads Serdio. Stats minimal "tutorial intro" canon. À implémenter `mobs/assassin-cock.ts`. Source: [`features/mobs/_sources/lod-wiki-assassin-cock.md`](features/mobs/_sources/lod-wiki-assassin-cock.md).

- [ ] **🆕 Counter Opportunities tier 19 mid-density canon ⭐ NEW tier** — Vs Arrow Shooter 9 (low) / Aqua King-Archangel 28 (high) / no-counter 0 (Air Combat/Feyrbrand/Fire Bird). Pattern canon : **possiblement 4 tiers fixés (0/9/19/28)** Counter Opportunities. À investiguer mapping complet enemies canon. Source: idem.

- [ ] **🆕 Pattern Rose Demon's Dance counter presses corrélé au tier ⭐ HYPOTHESIS** :
  - Arrow Shooter tier 9 : Rose Demon's Dance (4, 5) = 2 presses
  - Assassin Cock tier 19 : Rose Demon's Dance (4, 5, 6) = 3 presses
  - Aqua King/Archangel tier 28 : Rose Demon's Dance (3, 4, 5, 6) = 4 presses
    → Pattern : **Rose Demon's Dance counter count corrélé directement au tier counter density canon**. Possible règle canon (tier × Rose presses). À investiguer autres Additions per-tier mapping. Source: comparaison Counter tables.

- [ ] **🆕 Escape rate 90% canon early Disc 1 ⚠️ MAJEUR** — Pattern Forest Seles Disc 1 mobs = **easy to flee** (vs 30% standard / 40% Tiberoa roads / 0% scripted). Design canon "tutorial accessibility". À documenter `combat/escape-rates.md` (à créer) tier mapping (0%/30%/40%/90%). Source: idem.

- [ ] **🆕 Talon Kick 2× damage canon early mob ⭐** — Pattern "high damage despite low HP" canon. Rare early mob 2× phys ability. Compensation HP 3 minimal. Source: idem.

- [ ] **🆕 Cry Non-Elemental Party AoE canon ⭐** — Pattern "low HP panic AoE" cohérent avec Detonate family (Arrow Shooter Detonating Arrow Non-Elemental AoE). Hypothesis : **AoE finisher Non-Elemental = pattern systématique mobs low HP** canon. À investiguer. Source: idem.

- [ ] **🆕 Drop rate 10% Healing Potion canon ⚠️** — Vs standard 8% Repeat Item / 2% weapon. Pattern early mob = drop rate ↑ canon ? À investiguer other early Disc 1 mobs drop rates. Source: idem.

- [ ] **🆕 Sandora-trained birds species hypothesis canon ⭐ MAJEUR** — Assassin Cock + Fowl Fighter (Hellena Prison) = **same species canon, distinguished only by training type Sandora**. Pattern lore Sandora military bird training program. Cohérent Fire Bird "Imperial Sandora vassal" canon. À documenter `lore/sandora-military.md` (à créer). Source: idem.

- [ ] **🆕 Fowl Fighter mob canon Hellena Prison NEW ⭐** — Original mob Hellena Prison (Disc 1, Dart's escape arc). Assassin Cock = recolor. À documenter `mobs/Fowl Fighter.md` (à créer). Source: idem.

- [ ] **🆕 Goblin / Trent / Berserk Mouse mobs canon Forest Seles ⭐ NEW** — Partners encounter Assassin Cock formations 4/5/6. À documenter `mobs/Goblin.md`, `mobs/Trent.md`, `mobs/Berserk Mouse.md` (à créer). Source: idem.

- [ ] **🆕 Forest near Seles location canon Disc 1 ⭐** — Starting area post-Seles destruction. Submaps 5, 6, 7, 624, 625. À documenter `locations/Forest.md` (à créer). Source: idem.

- [ ] **🆕 Serdio roads Disc 1 canon network** :
  - Seles ↔ Forest
  - Forest ↔ Intersection
  - Forest Intersection ↔ Hellena Prison Intersection
  - Hellena Prison ↔ Intersection
    → 4 roads network Serdio Disc 1. À documenter `world-map/serdio-roads-disc1.md` (à créer). Source: idem.

- [ ] **🆕 "Blades affixed to feet" Assassin Cock visual canon** — Pattern visual design rooster anthropomorphique avec lames pieds. À refléter design Damia. Source: idem.

### Mobs / Assassin Cock fandom complement — Feet Sickle/Sound Wave canon names + appearance purple + DIRECTION recolor INVERSE wiki

- [ ] **🆕 Assassin Cock JP name アサシンコック (Asashin Kokku) canon ⭐** — Direct katakana translit (pattern simple translit canon, vs Fire Bird "Rokkuhāken" rock piton métaphore distinct). À refléter i18n. Source: [`features/mobs/_sources/fandom-assassin-cock.md`](features/mobs/_sources/fandom-assassin-cock.md).

- [ ] **🆕 Feet Sickle + Sound Wave canon names officiels (vs wiki ~Talon Kick / ~Cry) ⭐** — Adopter fandom canon. Sound Wave "multi-target attack" confirme Party AoE pattern Cry. Source: idem.

- [ ] **🆕 Assassin Cock appearance "purple bird with large claws" canon** — Visual design canon précisé (vs wiki silent appearance). À refléter design Damia. Source: idem.

- [ ] **🆕 DIRECTION RECOLOR INVERSE canon ⚠️ MAJEUR divergence wiki vs fandom** — Fandom : **Fowl Fighter = recolored version OF Assassin Cock** (Assassin Cock = original asset canon). Wiki tier 2 : Assassin Cock = recolor OF Fowl Fighter (inverse). **Réconciliation timing-wise** : Assassin Cock = first regular mob TLoD encountered (Forest Disc 1 pre-Hellena), donc original asset created premier probable → **fandom direction prévaut probable**. À investiguer Discord cadors. Pattern revisé asset reuse canon TLoD : original first → recolor later. Source: comparaison.

- [ ] **🆕 "Assassin Cock high speed first strike" canon ⭐** — Fandom strategy : "high speed will often allow it to have the first strike". Confirme SPD vs party Disc 1 starting (Dart SPD ~30 initial probable). Pattern early mob "fast threat" canon. Source: idem.

- [ ] **🆕 Stats divergences Assassin Cock wiki vs fandom ⚠️** :
  - HP JP : fandom 4 (+33% vs US 3) — pattern early stats minimal variance distinct du +25% standard
  - M. Attack : wiki 2 vs fandom **3** — wiki tier 2 prévaut probable
  - SPD : wiki 45 vs fandom **50** — fandom cohérent avec "first strike" canon commentary → investiguer
  - Gold JP : 2 (÷3 pattern systématique)
    → Wiki tier 2 US prévaut canonical Damia. Source: idem.

- [ ] **🆕 Trent + Assassin Cock formation omission fandom ⚠️** — Wiki tier 2 a formation 5 = Trent + Assassin Cock (submap 5, 625 35% each). Fandom liste seulement 4 formations (omission Trent). Wiki tier 2 prévaut probable. Source: idem.

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
