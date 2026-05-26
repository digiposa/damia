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

- [ ] **🆕 Down Burst Wind elemental Attack Item canon one-shot (kills minor enemy direct, NOT Repeat Item)** — Drop 100% Feyrbrand both encounters (Disc 1 + Disc 4 spirit). Probable item utility Wind-elemental (offensive Repeat Item ?). À documenter `items/consumables.md` (à créer). Source: idem.

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

- [ ] **🆕 Spear Frosts Attack Item canon one-shot (kills minor enemy direct, NOT Repeat Item) Water/Frost element Bale ⭐** — Magic Attack Item canon : **Spear Frosts** (probable Water-elemental projectile attack), **bought at Bale**, **used by Rose or Shana** (women bows + daggers ?). Confirme Fire weak to Water via Repeat Items canon. À documenter `items/consumables.md` (à créer) Spear Frosts entry + Bale shop. Source: fandom-fire-bird.md §Strategy.

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

- [ ] **🆕 Down Burst "most potent wind-element spell item" canon descriptor** — Down Burst = top-tier Wind Attack Item canon one-shot (kills minor enemy direct, NOT Repeat Item). Useful vs **Triceratops** + **Divine Tree mobs Earth-element**. À documenter `items/consumables.md` (à créer) Down Burst entry top-tier rank Wind. Source: idem.

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

- [ ] **🆕 Healing Fog Attack Item canon one-shot (kills minor enemy direct, NOT Repeat Item) counter Wingly Army HP→1** — Strategy fandom : "quickly countered by using a healing fog or similar item". Healing Fog = Attack Item canon one-shot (kills minor enemy direct, NOT Repeat Item) Wind/healing-related (cohérent forest theme). À documenter `items/consumables.md` (à créer) Healing Fog entry. Source: idem.

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

- [ ] **🆕 Body Purifier Attack Item canon one-shot (kills minor enemy direct, NOT Repeat Item) (Poison cure) ⭐** — Fandom strategy : "keep some Body Purifiers" vs Arrow Shooter Poison Arrow. Implique Body Purifier = canon Poison-status cure Repeat Item. À documenter `items/consumables.md` (à créer) Body Purifier entry (cohérent avec Body Purifier chest Evergreen Forest canon). Source: idem.

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

### Bosses / Atlow (Darkness Hero Competition Lohan Disc 1 — Scripted Shot first-turn + 5-sense-blocker after 4 Keen Shots + HP recovers self-heal + poison-coated arrows lore)

- [ ] **🆕 Atlow canon data-model** — Darkness, HP 266, AT 16, DF 80, MAT 16, MDF 100, SPD 55, A-AV/M-AV 0%. Boss Hero Competition Lohan Disc 1 submap 638. À implémenter `bosses/atlow.ts`. Source: [`features/bosses/_sources/lod-wiki-atlow.md`](features/bosses/_sources/lod-wiki-atlow.md). Priorité: **moyenne**.

- [ ] **🆕 Scripted Shot first-turn trait canon ⭐ NEW pattern** — "At the start of combat, ignore turn order and use Keen Shot". Pattern boss "first-turn scripted opener" (distinct des Retaliate triggered actions). À implémenter `BossPassive { trigger: 'on_battle_start', action, ignoreTurnOrder: true }`. Source: idem.

- [ ] **🆕 5-sense-blocker!! count-based trigger canon ⭐ NEW pattern** — "After the fourth use of Keen Shot, ignore turn order and use 5-sense-blocker. Single use." 3× phys + 100% Fear (A-AV reduces). À implémenter `Ability { triggerAfterUseCount: { name: 'KeenShot', count: 4 }, singleUse: true, ignoreTurnOrder: true }`. Pattern lore "5-sense-blocker" = poison-coated arrow overwhelm senses canon. Source: idem.

- [ ] **🆕 HP recovers self-heal 30% (79 HP) HP<30% canon ⭐** — Boss self-heal pattern : 30% max HP restored quand HP < 30%. Math : 30% × 266 = 79.8 ≈ 79 (integer division canon). À implémenter `Ability { target: 'self', hpRecoveryPct: 0.3, condition: { hpBelow: 0.3 } }`. Source: idem.

- [ ] **🆕 Hero Competition Lohan canon tournament Disc 1 ⭐** — Event canon Lohan trade city. Atlow = champion participant. Structure tournament (rounds, autres participants ?) à investiguer fandom + game. À documenter `quests/disc1-hero-competition.md` (à créer) + `locations/Lohan.md` (à créer/enrichir). Source: idem.

- [ ] **🆕 Atlow poison-coated arrows disqualification canon ⭐** — Pattern lore tournament rules : Atlow coats arrows poison → disqualifié si Dart perd. **"Likely the cause of the Fear status effect"** = poison induce Fear visual canon. Implication : **Dart can lose AND still progress story** (Atlow disqualifié soit par défaite player soit par cheating detection). À documenter `quests/disc1-hero-competition.md` (à créer). Source: idem.

- [ ] **🆕 Atlow character canon stats** — **33 ans / 179 cm (5'7")**. NEW character canon stats. À refléter design Damia visual + i18n character bio. Source: idem.

- [ ] **🆕 Atlow model reused Kamuy hunt mercenary canon** — "A mercenary joining the hunt for Kamuy re-uses Atlow's model" → asset reuse pattern Disc 3 Evergreen Forest (probable Bulgus OR autre mercenary canon). Cohérent visual reuse TLoD. Source: idem.

- [ ] **🆕 Pattern "first-turn Scripted action" canon** — Atlow Scripted Shot = nouveau type boss passive distinct du Retaliate. À documenter `combat/boss-passives.md` (à créer) types of triggers : on_battle_start / on_magic_targeted / on_addition_targeted / on_hp_threshold / etc. Source: idem.

### Bosses / Hero Competition Lohan Disc 1 — Tournament 5 rounds + 5 contestants canon (Gorgaga / Serfius / Danton / Atlow / Lloyd)

- [ ] **🆕 Hero Competition Lohan Disc 1 canon tournament structure ⭐** — 5 rounds, 32 warriors total (perfect bracket 2^5), hosted by **Ginger empresario**, Lohan Commercial City Serdio Disc 1. Dart participe + Haschel 3e place (defeated by Lloyd semi-finals). À documenter `quests/disc1-hero-competition.md` (créé) + `locations/Lohan.md` (à créer/enrichir). Source: [`features/bosses/_sources/fandom-hero-competition.md`](features/bosses/_sources/fandom-hero-competition.md).

- [ ] **🆕 "Dart advance every round even if loses" mechanic canon ⭐ MAJEUR** — Pattern systematic 4 rounds : Gorgaga (poison + cold-blood attempt = rules DQ) / Serfius (chronic illness flare) / Danton (heavy armor fall) / Atlow (poison arrows DQ). Pattern design canon "story-protected progression" tournament. À implémenter pattern boss outcome alternative paths Damia Mode Story. Source: idem.

- [ ] **🆕 Lloyd Final Round UNWINNABLE canon ⭐ MAJEUR** — Lloyd = invincible canon Disc 1 final (magic items no effect + evades all attacks + 3-slash counter → Dart unable to continue). Scripted defeat canon. HP 6,000 US / 8,500 JP. Cryptic dialogue prophecy "You will become stronger". À documenter `bosses/Lloyd.md` (créé) + `quests/disc1-hero-competition.md` final scripted scene. Source: idem.

- [ ] **🆕 Lloyd main antagonist canon TLoD Disc 1-4 ⭐** — Wingly platinum-haired swordsman, Phantom Swordsmanship + after-images + 6-strike combo "inhumanly fast". Dragon Buster = Lloyd's signature weapon (Rose inherits Disc 4 post-defeat canon). Long con pattern : Hero Competition intro → Disc 2 long con → Disc 3 Wink trust → Queen Theresa kidnap → Moon Mirror → endgame Disc 4. À documenter `bosses/Lloyd.md` (créé). Source: idem.

- [ ] **🆕 Ginger empresario NPC canon Lohan ⭐ NEW** — Host Hero Competition Lohan. Quote canon "I guarantee you will die". Announces tournament results. À documenter `npcs/Ginger.md` (à créer). Source: idem.

- [ ] **🆕 Attendant waiting room NPC canon ⭐ NEW** — Waiting room NPC Hero Competition. Donne insight opponents + motivates Dart + **becomes fan of Dart** character arc canon. À documenter `npcs/Attendant.md` (à créer). Source: idem.

- [ ] **🆕 Lavitz ineligible canon "soldiers can't join" Hero Competition ⚠️ rule** — Pattern canon rules tournament : soldiers ineligible. À refléter `party-members/Lavitz.md` (à créer) + tournament canon rules. Source: idem.

- [ ] **🆕 Haschel competing canon Hero Competition Lohan Disc 1 ⭐** — Haschel = participant tournament, defeated by Lloyd semi-finals, 3rd place final. Pattern recruitment context Disc 1 Lohan canon. Pre-Atlow encounter context. À refléter `party-members/Haschel.md` (à créer) recruitment Lohan story. Source: idem.

- [ ] **🆕 Gorgaga boss canon (Round 1 Earth)** — HP 200, axe wielder, "Winning is winning" no honor canon, Poison Needle opener cheat. JP name ゴルガガ. À documenter `bosses/Gorgaga.md` (créé). Source: idem.

- [ ] **🆕 Serfius boss canon (Round 2 Fire knight)** — HP 250, longsword + plate mail + winged helmet red plume, **HP 50% phase swap "true power" DEF/ATK doubled + jumping 2-hit combo**, "quite famous" canon, **model reused Evergreen Forest Disc 3 mercenary**. JP name セルフィス. À documenter `bosses/Serfius.md` (créé). Source: idem.

- [ ] **🆕 Danton boss canon (Round 3 Earth heavy armor)** — HP 240 US / 300 JP, **black mallet + chain mail cape + red helmet white spike**, MAT 10 low (physical-only), **mallet drop trap "Make my day kiddo, bring it!" counter grab+punch combo** unique canon, **low HP all-out 2-strike → Dart HP 1**. JP name ダンドン. À documenter `bosses/Danton.md` (créé). Source: idem.

- [ ] **🆕 Atlow canon stats refined fandom** — HP **270 US / 333 JP** (fandom vs wiki 266) — adopter wiki tier 2 canonical 266. Appearance canon : reddish-brown hair + bare-chested + plate legs + spike knees + tattered cape + longbow. **5-sense-blocker visual canon** : 3 apples + arrow pierces + 5 hexagons explode head/arms/knees. **Targeting reticle canon** : light blue hexagons. **2nd place previous tournament** canon. À enrichir [`bosses/Atlow.md`](features/bosses/Atlow.md) (déjà fait). Source: idem.

- [ ] **🆕 Hero Competition results canon** — 1st Lloyd / 2nd Dart "young flame" / 3rd Haschel "master of Rouge Art" — pas de prize handed out canon. À documenter `quests/disc1-hero-competition.md` (créé). Source: idem.

- [ ] **🆕 Hero Competition models reused Furni Disc 3 Kamuy hunt canon ⭐** — "Most warriors models appear again Disc 3 in Furni to battle and kill Kamuy" — pattern asset reuse canon multi-disc. Cohérent Atlow trivia + Serfius cross-ref Evergreen Forest. À refléter `locations/Furni.md` (à créer) + `locations/Evergreen Forest.md` Kamuy hunt mercenaries. Source: idem trivia.

- [ ] **🆕 Save-over glitch Lloyd soft-lock canon retail bug ⚠️** — "If save-over glitch transforms Dart Dragoon form Final = soft-lock when Lloyd counterattack". Pattern retail bug canon (cohérent Aqua King Trident Stab / Archangel Healing Flower overflow). À documenter `combat/canon-bugs.md` (à créer). Source: idem trivia.

- [ ] **🆕 Lloyd "young flame" canon nickname Dart ⭐** — Tournament results title "Dart, the 'young flame'" = nickname canon Dart (pre-Dragoon reveal Disc 1). Cohérent Fire Dragoon Dart identity. À refléter `party-members/Dart.md` (à créer/enrichir) nickname canon. Source: idem.

### Mobs / Baby Dragon (Thunder Mountain of Mortal Dragon Disc 3 — Dragon emotion abilities + Swift Dragon recolor + Mind Purifier drop)

- [ ] **🆕 Baby Dragon canon data-model** — Thunder, HP 240, AT 50, DF **140** (high), MAT 50, MDF 80, SPD 60. Mob Mountain of Mortal Dragon Disc 3 + road Mountain → Evergreen Forest (directional). À implémenter `mobs/baby-dragon.ts`. Source: [`features/mobs/_sources/lod-wiki-baby-dragon.md`](features/mobs/_sources/lod-wiki-baby-dragon.md).

- [ ] **🆕 "Dragon emotion" abilities pattern canon ⭐ NEW** — 3-phase HP escalation : ~Tail (>50%) / **Anger of Dragon** (1× Fire magic, 50-25%) / **Sorrow of Dragon** (Non-Elemental + 100% Dispiriting M-AV mitigated, ≤25%) / **Cry of Dragon** (Non-Elemental + 100% Fear M-AV mitigated, ≤25%). Pattern unique canon "dragon emotion" naming. Source: idem.

- [ ] **🆕 Anger of Dragon Fire ability from Thunder mob canon ⚠️ exception** — Baby Dragon = Thunder element mais utilise Fire ability. Pattern "mob element ≠ ability element" canon (cohérent Arrow Shooter Earth utilise Detonate Arrow Non-Elemental). Possibly lore : "dragon emotion-element associative" (anger = fire). À investiguer. Source: idem.

- [ ] **🆕 Sorrow/Cry of Dragon panic phase ≤25% canon** — Both Non-Elemental magic + 100% status proc (Dispiriting / Fear). M-AV mitigation (pattern magic status proc → M-AV cohérent Arrow Shooter Thunder Arrow). À implémenter "panic phase" boss/mob pattern. Source: idem.

- [ ] **🆕 Baby Dragon = Swift Dragon recolor canon ⭐** — Recolor of Swift Dragon (Moon That Never Sets Disc 4). Pattern asset reuse multi-disc (cohérent Air Combat = Wyvern recolor Mountain → Moon). Possible lore "Swift Dragon = adult version Baby Dragon" canon. À documenter `mobs/Swift Dragon.md` (à créer). Source: idem.

- [ ] **🆕 Mountain of Mortal Dragon → Evergreen Forest directional road canon ⚠️** — Baby Dragon spawn road **Mountain → Evergreen Forest** UNIQUEMENT, **PAS Evergreen → Mountain** direction. Pattern road encounter directional restriction canon. À refléter `world-map/road-encounters.md` (à créer). Source: idem.

- [ ] **🆕 Mind Purifier Repeat Item drop 8% canon** — Cohérent Mind Purifier chest Evergreen Forest canon. Anti-Confusion/Bewitchment cure. À documenter `items/consumables.md` (à créer) Mind Purifier entry. Source: idem.

- [ ] **🆕 Mountain of Mortal Dragon submaps canon (413-427)** — Mountain Divine Dragon seal location Disc 3. À documenter `locations/Mountain of Mortal Dragon.md` (à créer) avec submaps map canon. Source: idem.

- [ ] **🆕 Baby Dragon ×3 formation canon** — Encounter formation 159 = 3 Baby Dragons simultanés. Pattern multi-mob same species canon. Source: idem.

### Mobs / Baby Dragon fandom complement — JP name + appearance + Dragon Tail canon name + Mind Purifier 20 gold shop

- [ ] **🆕 Baby Dragon JP name ベビードラゴン (Bebīdoragon) direct translit** — pattern simple. Source: [`features/mobs/_sources/fandom-baby-dragon.md`](features/mobs/_sources/fandom-baby-dragon.md).

- [ ] **🆕 Baby Dragon appearance canon ⭐** — Short green dragons + 2 legs + very short wings + tail + spikey head + yellow armored stomach. À refléter visual design Damia. Source: idem.

- [ ] **🆕 Dragon Tail canon name officiel (vs wiki ~Tail)** — Adopter fandom canon. Source: idem.

- [ ] **🆕 Mind Purifier shop price 20 gold canon ⚠️ NEW** — Purchasable "anywhere" canon. Pattern status purifiers cheap. À documenter `items/consumables.md` (à créer) Mind Purifier 20G entry. Source: idem.

- [ ] **🆕 "Attack-all spells preferable groups of 3" strategy canon** — Baby Dragon × 3 formations canon → AoE magic optimal. Source: idem.

- [ ] **🆕 Baby Dragon evade probability fandom canon ⚠️ divergence** — Fandom : "evades with given probability". Wiki tier 2 : A-AV/M-AV 0%. Wiki tier 2 prévaut probable (0% evade). Source: comparaison.

- [ ] **🆕 Stats divergences Baby Dragon wiki vs fandom ⚠️** :
  - P. Attack : wiki 50 vs fandom **56** (+12%)
  - M. Attack : wiki 50 vs fandom **56** (+12%)
  - HP JP : 300 (+25% pattern)
  - Gold JP : 9 (÷3 pattern)
    → Wiki tier 2 US prévaut canonical. Source: idem.

### Mobs / Basilisk (Earth Flanvel Tower Disc 3 — Instant Death Immunity passive NEW + Petrifying Glare 100% + Depetrifier in-character drop)

- [ ] **🆕 Basilisk canon data-model** — Earth, HP 656, AT 86, DF 100, MAT 86, MDF 100, SPD 50, A-AV/M-AV 0%. Mob Flanvel Tower Disc 3. À implémenter `mobs/basilisk.ts`. Source: [`features/mobs/_sources/lod-wiki-basilisk.md`](features/mobs/_sources/lod-wiki-basilisk.md).

- [ ] **🆕 Instant Death Immunity passive trait canon ⭐ NEW** — "Anything which inflicts Instant Death misses". Pattern thematic "stone creature immune to death" canon. Affecte : Gladius / Brass Knuckle / Indora's Axe (Instant Death procs miss vs Basilisk). À implémenter `MobPassive { immuneToInstantDeath: true }`. À investiguer autres mobs canon avec immunity. Source: idem.

- [ ] **🆕 Petrifying Glare 100% Petrification canon thematic ⭐** — Status-only ability (no damage) Petrification 100% (M-AV mitigates). Pattern mythological basilisk gaze + status-only ability rare canon. HP ≤ 25% phase only. Source: idem.

- [ ] **🆕 Depetrifier in-character drop canon ⭐** — Basilisk's own ability = Petrification → drop cure = Depetrifier (cohérent lore design "mob drops antidote to its ability"). Pattern à noter `items/consumables.md` (à créer) Depetrifier entry + thematic drops canon. Source: idem.

- [ ] **🆕 Charging Spirit pattern récurrent canon multi-mob** — Same pattern Air Combat (self-buff HP > 25%, prepares specific ability next turn). À implémenter pattern réutilisable mob AI. Source: idem.

- [ ] **🆕 Flanvel Tower mob encounters canon Disc 3** — Submaps 449, 451 (used formations). Cohérent equipment.md chests Tower of Flanvel after Faust. À documenter `locations/Flanvel Tower.md` (à créer). Source: idem.

- [ ] **🆕 5/7 unused formations Flanvel Tower canon ⚠️ content cut** — Basilisk solo + partners Rocky Turtle / Mr. Bone / Unicorn + Madman variant. Pattern content cut massif. À investiguer raison cut intended. Source: idem.

- [ ] **🆕 4 NEW mobs canon mentioned Flanvel Tower** :
  - **Madman** (formation 175 USED, submap 449)
  - **Rocky Turtle** (formations unused 205, 208)
  - **Mr. Bone** (formation unused 207)
  - **Unicorn** (formation unused 208)
    → À documenter `mobs/Madman.md`, `mobs/Rocky Turtle.md`, `mobs/Mr. Bone.md`, `mobs/Unicorn.md` (à créer). Source: idem.

### Mobs / Basilisk fandom complement — "Tower of Flanvel" canon + Erase mechanic precise + Total Vanishing/Demon's Gate Dragoon Magic NEW + Feyrbrand resemblance

- [ ] **🆕 "Tower of Flanvel" canon location name** (vs wiki "Flanvel Tower" variant) — adopter canonical "Tower of Flanvel" (cohérent equipment.md). Source: [`features/mobs/_sources/fandom-basilisk.md`](features/mobs/_sources/fandom-basilisk.md).

- [ ] **🆕 "Erase effect" mechanic canon precise ⭐ MAJEUR** — Basilisk immune to 3 categories : Can't Combat Weapons (Gladius/Brass Knuckle/Indora's Axe Instant Death) + **Total Vanishing** + **Demon's Gate**. Pattern unifié "Erase = remove from battle" canon. À documenter `combat/erase-mechanic.md` (à créer) + status-effects.md Erase effect entry. Source: idem.

- [ ] **🆕 Total Vanishing Dragoon Magic NEW canon ⭐** — Ability mentionned ability Erase-type. Probable Dragoon Magic instant-removal mob. À investiguer + documenter `dragoons/magic.md` (à créer) + identifier which Dragoon (Rose Darkness probable). Source: idem.

- [ ] **🆕 Demon's Gate Dragoon Magic NEW canon ⭐** — Ability Erase-type. Probable Dragoon Magic. À investiguer + documenter `dragoons/magic.md` + identifier Dragoon. Source: idem.

- [ ] **🆕 Basilisk appearance "arthropod-like draconic similar Feyrbrand" canon ⚠️** — Visual asset reuse OR species lineage canon (Wind dragon Feyrbrand → Earth Basilisk arthropod variant). Pattern lore "dragon species variants" canon. À investiguer + cross-référer `dragoons/dragons.md`. Source: idem.

- [ ] **🆕 Munch canon name officiel (vs wiki ~Triple Bite) ⭐** — Adopter fandom canon dans Damia. Source: idem.

- [ ] **🆕 Stats divergences Basilisk wiki vs fandom ⚠️** :
  - HP : wiki **656** vs fandom **715** US / **820** JP (+9% / +25%)
  - P. Attack : wiki 86 vs fandom **97** (+13%)
  - M. Attack : wiki 86 vs fandom **97** (+13%)
  - Gold JP : 17 (÷3 pattern)
    → Wiki tier 2 US prévaut canonical Damia. HP 656 canonical. Source: comparaison.

- [ ] **🆕 Disc 4 Monsters fandom Basilisk ⚠️ vs Disc 3 wiki context** — Fandom catégorise Disc 4. Wiki context Tower of Flanvel canon Disc 3 (Faust Mayfil Disc 3 + chests Tower of Flanvel "after Faust"). **Tower of Flanvel revisitable Disc 4 ?** OR fandom error. À investiguer canon game flow Tower of Flanvel disc timeline. Source: idem.

- [ ] **🆕 Basilisk "highest HP Flanvel Tower mob" canon** — "Health second to none here" fandom commentary. Pattern boss-tier mob Tower of Flanvel canon. Source: idem.

### Mobs / Beastie Dragon (Wind Mountain of Mortal Dragon Disc 3 — Mist abilities + Total Vanishing Attack Item canon one-shot (kills minor enemy direct, NOT Repeat Item) reconciliation)

- [ ] **🆕 Beastie Dragon canon data-model** — Wind, HP 336, AT 66, DF 130 (high), MAT 42, MDF 90, SPD 50, A-AV/M-AV 0%. Mob Mountain of Mortal Dragon Disc 3. À implémenter `mobs/beastie-dragon.ts`. Source: [`features/mobs/_sources/lod-wiki-beastie-dragon.md`](features/mobs/_sources/lod-wiki-beastie-dragon.md).

- [ ] **🆕 Total Vanishing = Attack Item one-shot canon ⭐ MAJEUR clarification user** — Beastie Dragon drops Total Vanishing 8%. **Attack Item canon : tue un mob mineur direct (one-shot)** — NON repeatable (use unique consommable). Distincts des Repeat Items (Healing Potion etc. réutilisables). Reconcilie : Basilisk "immune to Erase effect" = immune à one-shot Attack Items Erase. Demon's Gate probable pattern same. À documenter `items/consumables.md` (à créer) Total Vanishing entry + `combat/erase-mechanic.md` (à créer). Source: user clarification + idem.

- [ ] **🆕 Mist-based abilities canon ⭐** — Black Mist (Non-Elemental + 50% Fear) + Sweet Mist (Non-Elemental + 50% Bewitchment). Pattern thematic Wind-related mist. M-AV mitigation. **50% proc rate** (lower vs 100% pattern Arrow Shooter/Baby Dragon/Basilisk). Source: idem.

- [ ] **🆕 Deadly Spider mob canon NEW partner Mountain of Mortal Dragon** — Formation 157 partner Beastie Dragon. À documenter `mobs/Deadly Spider.md` (à créer). Source: idem.

- [ ] **🆕 Directional road Mountain → Evergreen Forest canon récurrent** — Same pattern Baby Dragon canon : Mountain → Evergreen Forest only, PAS Evergreen → Mountain. Pattern systematic road encounter canon Mountain mobs Disc 3. Source: idem.

- [ ] **🆕 50% status proc rate pattern canon** — Beastie Dragon lower proc rate (50%) vs other mobs canon 100% pattern (Arrow Shooter/Baby Dragon/Basilisk). Pattern variability proc rates canon — à documenter `combat/status-effects.md` (à créer) proc rates per mob. Source: idem.

### Mobs / Beastie Dragon fandom complement — velociraptor toxic-breathing + Bounce canon + Total Vanishing one-shot confirme

- [ ] **🆕 Beastie Dragon JP name ビースティドラゴン (Bīsutidoragon) direct translit** — Source: [`features/mobs/_sources/fandom-beastie-dragon.md`](features/mobs/_sources/fandom-beastie-dragon.md).

- [ ] **🆕 Beastie Dragon appearance canon "velociraptor-like toxic-breathing dragon" ⭐** — 2 hind legs + small arms balance + wings functional pair limbs (4-limb design) + toxic-breathing thematic explique Mist abilities. À refléter visual design Damia. Source: idem.

- [ ] **🆕 Bounce canon name officiel (vs wiki ~Flying Kick) ⭐** — Adopter fandom canon. Source: idem.

- [ ] **🆕 Total Vanishing "destroys individual minor enemies instantly" canon confirme Attack Item one-shot ⭐** — Confirme user clarification : Total Vanishing = Attack Item one-shot, kills mob mineur direct, single-use. À refléter `items/consumables.md` (à créer) Total Vanishing entry. Source: idem.

- [ ] **🆕 "Saboteur team role" canon Beastie Dragon** — Pattern role mob : inflige status while others damage. Pattern enemy team composition canon design. Source: idem.

- [ ] **🆕 Encounter rate Common canon Beastie Dragon** — Vs Uncommon Air Combat / Aqua King. Pattern encounter rate variability canon. Source: idem.

- [ ] **🆕 ~45 min farming Total Vanishing canon** — Pattern farming time Attack Item drop (vs ~10min Down Burst Air Combat / ~15min Angel's Prayer Aqua King). Plus long car Attack Item one-shot rare. Source: idem.

- [ ] **🆕 Stats divergences Beastie Dragon wiki vs fandom ⚠️** :
  - P. Attack : wiki 66 vs fandom **80** (+21%)
  - M. Attack : wiki 42 vs fandom **48** (+14%)
  - HP JP : 420 (+25% pattern)
  - Gold JP : 11 (÷3 pattern)
    → Wiki tier 2 US prévaut canonical Damia. Source: comparaison.

### Mobs / Berserk Mouse (Darkness Forest Disc 1 — HP 2 lowest TLoD + Run away! NEW canon + Fear immune NEW)

- [ ] **🆕 Berserk Mouse canon data-model** — **Darkness** element, **HP 2** ⭐ lowest TLoD probable, AT 1, DF 80, MAT 1, MDF 120, SPD 45, A-AV/M-AV 0%. Mob Forest near Seles Disc 1 partner Assassin Cock. À implémenter `mobs/berserk-mouse.ts`. Source: [`features/mobs/_sources/lod-wiki-berserk-mouse.md`](features/mobs/_sources/lod-wiki-berserk-mouse.md).

- [ ] **🆕 "Run away!" ability NEW canon ⭐ MAJEUR** — Self-target ability removes mob from combat **NO EXP/gold/item awarded**. Pattern thematic "mouse flees". Trigger conditions canon unknown (HP threshold ? turn-random ?). À investiguer fandom + Discord. Implémenter mob self-escape mechanic Damia : data-model `MobSelfRemoval { trigger, rewardNone: true }`. À documenter `combat/mob-ai.md` (à créer) Run away! pattern. Source: idem.

- [ ] **🆕 Status Immunity DEVIATES pattern 5✔/3✗ canon Berserk Mouse ⭐** — Fear ✔ immune NEW (vs standard mob 4✔/4✗ Fear vulnerable). Cohérent thematic "berserk fearless aggressive". À cross-check autres "berserk/aggressive" mobs Fear immune pattern. À documenter `combat/status-effects.md` (à créer) per-mob immunity table canon (NOT universal 4/4). Source: idem.

- [ ] **🆕 HP 2 = lowest mob TLoD probable canon ⭐** — Vs Assassin Cock HP 3 / autres mobs Disc 1. Pattern "intro-tier minimal stats" — first mob designs canon. À confirmer alphabetical ingestion future. Source: idem.

- [ ] **🆕 3-phase AI canon Berserk Mouse** — Bite > 50% (1× phys) / Chisel ≤ 50% (2× phys) / Run away! self-removal. Pattern AI 3-phase NEW (vs standard 2-phase HP-split). Data-model `MobAI3Phase` extension `MobAI2Phase`. Source: idem.

- [ ] **🆕 Chisel canon name officiel partial-canon** — Wiki name ≤ 50% Chisel (vs ~Bite community > 50%). Pattern partial-canon naming (named for one phase, community-approximated for autre). À clarifier fandom. Source: idem.

- [ ] **🆕 Counter Opportunities 28 universal multi-disc confirmé ⭐** — Berserk Mouse Disc 1 = 28 (same Aqua King/Archangel Disc 4 + Atlow Disc 1 boss). Confirme **Counter 28 = standard universal tier high-density toutes-discs canon** (NOT disc-correlated). Pattern per-enemy assignment canon. Per user instruction : feature non-implémentée Damia, factual mention only. Source: idem.

- [ ] **🆕 Submap 624 dominant Berserk Mouse hotspot canon** — 3 formations sur 3 incluent submap 624 (vs autres submaps 6/7/625 less frequent). Pattern submap mob-specific hotspot canon — à exploiter map design Damia (per-mob density). Source: idem.

- [ ] **🆕 Darkness Disc 1 Forest canon rare** — Vs Wind Assassin Cock / Fire Goblin / Earth Trent partners Forest. Pattern element diversification Forest mobs canon. Cross-référer TODO existing "Tagging élémental des mobs Damia : Berserk Mouse=Darkness" — confirme wiki tier 2. Source: idem.

### Mobs / Berserk Mouse fandom complement — Plague Rat recolor NEW + Nibble/Escape canon + Trent partner formation NEW

- [ ] **🆕 Berserk Mouse JP name バーサクマウス (Bāsaku mausu) direct translit** — Source: [`features/mobs/_sources/fandom-berserk-mouse.md`](features/mobs/_sources/fandom-berserk-mouse.md).

- [ ] **🆕 Berserk Mouse appearance canon "grey rat red eyes large ears" ⭐** — Visual design canon précisé. À refléter sprites/visual Damia. Source: idem.

- [ ] **🆕 Plague Rat = recolor stronger variant Berserk Mouse canon NEW ⭐ MAJEUR** — Pattern recolor mob canon (cohérent Fowl Fighter/Assassin Cock Sandora birds + Wyvern/Air Combat). À documenter `mobs/Plague Rat.md` (à créer) — stronger variant Berserk Mouse, location/Disc à investiguer. Implémenter pattern visual recolor systematic Damia. Source: idem.

- [ ] **🆕 Nibble canon name officiel (vs wiki ~Bite community) ⭐** — Adopter fandom canon > 50% phase ability. Source: idem.

- [ ] **🆕 Escape canon name officiel (vs wiki "Run away!" descriptive) ⭐** — Adopter fandom canon mob self-removal ability. "Flees the battle" confirme self-removal mechanic. Source: idem.

- [ ] **🆕 Berserk Mouse + Trent formation NEW canon ⭐** — Wiki tier 2 silent. Pattern partner mobs Forest étendu (3 partners canon : Assassin Cock + Trent + ×2). À investiguer wiki tier 2 formation ID + submap pour cette formation. Source: idem.

- [ ] **🆕 Stats divergences Berserk Mouse wiki vs fandom ⚠️** :
  - P. Attack : wiki 1 vs fandom **2** (+100% — probable JP values OR fandom typo)
  - M. Attack : wiki 1 vs fandom **2** (+100%)
  - SPD : wiki 45 vs fandom **50** (+11% — cohérent Assassin Cock même divergence)
  - HP JP : 4 (+100% vs +25% usual — pattern extrême sur stats minimaux)
  - Gold JP : 1 (÷3 pattern)
    → Wiki tier 2 US prévaut canonical Damia. Source: comparaison.

- [ ] ⚠️ **🆕 A-AV 0% (wiki) vs 120% (fandom) ANOMALY MAJEURE** — Fandom claim "Berserk Mouse can sometimes avoid attacks with 120% A-AV" mécaniquement impossible (>100% A-AV = near-immune attacks). Wiki tier 2 0% prévaut canonical Damia. Hypothesis : fandom typo / confusion M-DEF 120 / stat caché spécial ? À investiguer Discord/Wulves source tier 1. Source: idem.

### Mobs / Berserker (Darkness Home of Gigantos Disc 2 — Gehrich Gang + glass cannon + Charging Spirit telegraph + Menacing 100% Fear NEW + Energy Girdle drop + Contact arrows encounter NEW)

- [ ] **🆕 Berserker canon data-model** — **Darkness** element, HP 400, AT 40, DF **30** (low), MAT 32, MDF **50** (low), SPD 60, A-AV/M-AV 0%. Mob Gehrich Gang Home of Gigantos Disc 2. Glass cannon profile (high HP + low DF/MDF + high SPD). À implémenter `mobs/berserker.ts`. Source: [`features/mobs/_sources/lod-wiki-berserker.md`](features/mobs/_sources/lod-wiki-berserker.md).

- [ ] **🆕 Status Immunity 6✔/2✗ NEW canon pattern ⭐** — Berserker Confuse + Fear ✔ immune NEW (vs Berserk Mouse 5✔/3✗ Fear only). Cohérent thematic "berserker single-minded fearless rage focus". Pattern per-mob deviations canon — wiki standard 4✔/4✗ NOT universel. À documenter `combat/status-effects.md` per-mob immunity matrix. Source: idem.

- [ ] **🆕 Pattern "berserk" mob Fear immune canon systematic ?** — Berserker + Berserk Mouse both Fear immune confirmed. À cross-check alphabetical mobs ingestion future si "berserk-themed" mobs partagent Fear immunity systematic. Source: idem.

- [ ] **🆕 Menacing 100% Fear single canon NEW ⭐** — Berserker ≤ 25% HP ability : 100% Fear proc single-target (vs Beastie Dragon Black Mist 50% Fear). Pattern Fear-inflict ability canon. Target M-AV mitigates. Implication player : **Bravery Amulet equip critical HP ≤ 25% phase**. À implémenter ability `menacing`. Source: idem.

- [ ] **🆕 All-out Attack! 3× phys canon récurrent multi-mob** — Berserker + Air Combat share **same ability "All-out Attack!" 3× physical damage** ≤ 25% phase. Pattern shared cross-mob ability canon. Data-model ability référence partagée. Source: idem.

- [ ] **🆕 Charging Spirit telegraph pattern canon récurrent multi-mob ⭐ MAJEUR** — Berserker + Air Combat share **same Charging Spirit self-buff mechanic** preparing next-turn high-damage ability. Pattern AI "wounded mob more dangerous" canon systematic. Implémenter data-model `MobAI3PhaseCharging` réutilisable + `selfBuff.primesNextTurn: AbilityRef`. Player strategy : Stun/Poison Berserker during Charging Spirit turn. Source: idem.

- [ ] **🆕 Charging Spirit HP threshold canon ambiguous Berserker ⚠️** — Wiki dit "25%" exact threshold (NOT range > 25%). Pattern différent Air Combat ("> 25%, 25% chance"). À clarifier fandom + Discord : Berserker Charging Spirit @ HP = 25% exact OR HP > 25% probabilistic ? Source: idem.

- [ ] **🆕 Energy Girdle 2% drop canon Berserker Home of Gigantos Disc 2 ⭐** — Source canon SP+ accessory farming. À refléter `items/equipment.md` Energy Girdle source (Berserker 2% Home of Gigantos Disc 2). Pattern accessory drop rate 2% (vs 8% item / 10% early-mob). Source: idem.

- [ ] **🆕 "Contact (arrows)" encounter mechanic NEW canon ⭐ MAJEUR** — Berserker Home of Gigantos submap 261 + 262 + 263 + 264 encounters triggered par contact with arrows (vs Random Encounter standard). Pattern NEW encounter type : event-trigger vs Random spawn. Cohérent thematic Gehrich Gang arrow traps hideout. À documenter `combat/encounter-mechanics.md` (à créer) — Contact-type encounters canon. Implémenter Damia : event triggers map zones vs random spawns. Data-model `EncounterMechanic = 'random' | 'contact-arrows' | 'contact-other'`. Source: idem.

- [ ] **🆕 Berserker location-locked Home of Gigantos canon** — No World Map road encounters (vs Berserk Mouse 4 roads / Beastie Dragon Mountain → Evergreen road). Pattern location-locked Disc 2 Gehrich Gang faction mob. Source: idem.

- [ ] **🆕 Gehrich Gang faction mob canon ⭐** — Berserker + Piggy + Crafty Thief = Gehrich Gang members canon (cohérent Donau quest line Lynn rescue). À documenter `lore/factions.md` (à créer) — Gehrich Gang faction roster + Berserker/Piggy/Crafty Thief mobs. Cross-référer `bosses/Gehrich.md` (à créer) boss leader Disc 2. Source: idem.

- [ ] **🆕 Escape rate 40% Home of Gigantos canon** — Pattern location-specific escape rate (vs 30% standard / 90% Forest Disc 1 / location-tier-correlated). À documenter `combat/escape-mechanic.md` (à créer) — per-location escape rates canon. Source: idem.

### Mobs / Berserker fandom complement — Butcher Knives canon + Energy Girdle armor classification + Rock Fireflies free replenish + Mappi/Gehrich bosses

- [ ] **🆕 Berserker appearance canon "humanoid two large cleavers + wounded legs/arms + gold boots/pauldrons/bracers + blue chest plate" ⭐** — Visual design canon précisé (vs wiki silent). À refléter sprites/visual Damia. Source: [`features/mobs/_sources/fandom-berserker.md`](features/mobs/_sources/fandom-berserker.md).

- [ ] **🆕 Butcher Knives canon name officiel (vs wiki ~Multi Slash community) ⭐** — Adopter fandom canon ability > 25% phase. Source: idem.

- [ ] **🆕 "Spams All Out Attack in critical health" canon clarification HP ≤ 25% behavior ⭐** — Fandom précise All Out Attack predominant phase 3 (vs Menacing rare). Wiki ambiguous "Menacing OR All-out Attack" → fandom dit "spams" = high frequency. À refléter AI data-model `phase3.weights: { menacing: 0.2, allOutAttack: 0.8 }` probable. Source: idem.

- [ ] **🆕 All Out Attack damage canon précisé 250-500 dégâts party ⚠️** — High finisher damage. À balancing Damia : Berserker All Out Attack 3× phys = 250-500 vs party HP Disc 2 (~500-700) = potentially KO turn. Source: idem.

- [ ] **🆕 Encounter rate Common canon Berserker** — Pattern encounter rate variability multi-mob (cohérent Beastie Dragon Common / Air Combat Uncommon). Source: idem.

- [ ] ⚠️ **🆕 Energy Girdle classification canon armor vs accessory ⭐ MAJEUR** — Fandom Berserker "body armor Haschel-only" + "greater than most armors Disc 3" classification. Existing docs Damia (`dragoons/mechanics.md`, TODO 1046/1110) classifient SP+ "accessory". À reconcilier `items/equipment.md` Energy Girdle entry : armor body slot Haschel-only OR accessory SP+ ? Hypothesis : possible Energy Girdle = armor slot avec effet SP+ (cohérent Sparkle Dress armor avec SP+ effet pattern). Décision impact data-model `Equipment.slot` + SP+ effect routing. Source: idem.

- [ ] **🆕 ~30+ minutes farming Energy Girdle canon time** — Vs ~45min Total Vanishing / ~15min Angel's Prayer. Pattern farming time per drop rate. Source: idem.

- [ ] **🆕 Rock Fireflies free resource replenish NEW canon Home of Gigantos ⭐ MAJEUR** — Home of Gigantos feature unique : NPCs/objects "Rock Fireflies" replenish party resources (HP/MP/SP probable) sans coût. Pattern farming-area design canon. À documenter `npcs/Rock Fireflies.md` (à créer) + cross-référer `locations/Home of Gigantos.md` (à créer). Implémenter Damia : interactable NPCs zone-specific free resource refill. Source: idem.

- [ ] **🆕 Mappi + Gehrich = bosses Home of Gigantos Disc 2 canon ⭐** — Fandom révèle 2 bosses Home of Gigantos area : Mappi (à documenter `bosses/Mappi.md` à créer) + Gehrich (`bosses/Gehrich.md` à créer). Pattern boss duo area finale (cohérent Hero Competition rounds multiple bosses). Cross-référer Donau quest line Gehrich Gang. Source: idem.

- [ ] **🆕 Stats divergences Berserker wiki vs fandom ⚠️** :
  - P. Attack : wiki 40 vs fandom **55** (+37% — probable JP values)
  - M. Attack : wiki 32 vs fandom **36** (+12%)
  - HP JP : 500 (+25% pattern)
  - Gold JP : 5 (÷3 pattern)
    → Wiki tier 2 US prévaut canonical Damia. Source: comparaison.

- [ ] **🆕 Sachets drop Piggy Home of Gigantos canon** — Co-drop Home of Gigantos farm area (Energy Girdle Berserker 2% + Bandit's Ring Gangster 2% + Sachets Piggy %). À documenter `items/consumables.md` (à créer) Sachet entry. Cross-référer `mobs/Piggy.md` (à créer) drop canon. Source: idem.

### Mobs / Blue Bird Rare Monster Water Disc 2 — NEW CATEGORY canon + Damage Mitigation + Magical Immunity + Rare Attack 10% Max HP + Run away! + 5 Rare Birds template AI shared

- [ ] **🆕 ⭐ NEW CATEGORY "Rare Monster" canon MAJEUR** — Classification distincte de Minor Enemy / Boss / Unique Monster Jars. **5 Rare Monsters Counter 28 confirmé canon** : Blue Bird + OOPARTS + Rainbow Bird + Red Bird + Yellow Bird (cohérent existing `combat/_sources/lod-wiki-additions.md:154`). Implémenter classification `MonsterCategory = 'minor-enemy' | 'rare-monster' | 'unique-monster-jar' | 'boss'`. À documenter `combat/rare-monsters.md` (à créer) — full Rare Monster canon doc. Source: [`features/mobs/_sources/lod-wiki-blue-bird.md`](features/mobs/_sources/lod-wiki-blue-bird.md).

- [ ] **🆕 Blue Bird canon data-model** — **Water** element Rare Monster, HP **5**, AT **0**, DF 100, MAT **0**, MDF 100, **SPD 120 ⭐ highest seen**, **A-AV 50% ⭐ NEW first non-0**, M-AV 0%. World Map roads Disc 2. EXP 1000 / Gold 0 / Drops Nothing (EXP-only reward design). À implémenter `mobs/blue-bird.ts`. Source: idem.

- [ ] **🆕 Status Immunity all 8 ✔ boss-tier canon Rare Monster ⭐** — Vs Mob 4/4 (Assassin Cock) ou 5/3 (Berserk Mouse) ou 6/2 (Berserker). Cohérent Rare Monster = "no status proc possible" canon design. À refléter `combat/status-effects.md` per-category immunity tiers (Mob deviations 4-6 immune / Rare Monster 8 immune / Boss 8 immune). Source: idem.

- [ ] **🆕 Rare Monster Damage Mitigation passive canon ⭐ MAJEUR** — Physical damage forced to 1. Exceptions canon : **Attacker Fear** (×½ applies after) + **Destroyer Mace** (Haschel HP-scaling weapon bypass cap). Cohérent existing `combat/damage-formula.md` §11 "Rare Monster Mitigation forcée à 1" + TODO 1430 "Destroyer Mace = SEUL weapon dépassant cap". Implémenter `RareMonsterPassives.damageMitigation: { physicalCap: 1; exceptions: ['attackerFear', 'destroyerMace'] }`. Source: idem.

- [ ] **🆕 Rare Monster Magical Immunity passive canon ⭐ MAJEUR** — Magical damage forced to 0. Pas d'exception canon. Spells / Dragoon Magic / Repeat Items magic-type = INEFFICACE Rare Monsters. Implémenter `RareMonsterPassives.magicalImmunity: { magicalCap: 0 }`. À refléter `combat/damage-formula.md` Rare Monster magic immunity rule. Source: idem.

- [ ] **🆕 Rare Attack formula canon ⭐ MAJEUR** — 10% target Max HP physical damage, **bypasses stats like defense**, **only Guarding + Target Fear modifiers apply**. Cohérent existing `combat/damage-formula.md` §10 "Rare Monster Basic = Max HP / 10" + wrapper "Rare Monster Mitigation | Target Fear, Power, Field, Element, Guard" inapplicables list. Implémenter ability shared multi-Rare-Monster. Source: idem.

- [ ] **🆕 Run away! Rare Monster canon récurrent multi-mob ⭐** — Pattern same Berserk Mouse Run away! canon : self-removal, no EXP/gold/item. Blue Bird 25% rate explicit (vs Berserk Mouse silent rate). Yellow Bird 50% rate comparison. Pattern AI template shared 5 Rare Birds canon. Data-model `RareMonsterAI { rareAttackChance, runAwayChance }`. Source: idem.

- [ ] **🆕 Pattern AI template shared 5 Rare Birds canon ⭐** — (B) = Blue Bird 75/25, (YR) = Yellow Rare = Yellow Bird 50/50 probable. Likely Red Bird + Rainbow Bird + OOPARTS share template with varying rates. À investiguer per-monster ingestion alphabetical. Source: idem.

- [ ] **🆕 EXP-only reward design canon Rare Monster** — Blue Bird 1000 EXP / 0 Gold / Nothing drop = pattern "metal slime" TLoD. Catch incentive massive EXP reward. Vs Lucky Jar (Unique Monster Jar Counter 16) = 1000 EXP + 300 Gold + Moon Serenade drop (different category). À documenter `combat/rare-monsters.md` reward design pattern. Source: idem.

- [ ] **🆕 SPD 120 ⭐ highest seen + A-AV 50% ⭐ NEW first non-0** — Blue Bird stats canon : pattern Rare Monster fast + evasive. Tagging visual `MobStats.spd` cap probable 120 ? À investiguer alphabetical. Source: idem.

- [ ] **🆕 World Map road exclusive canon Rare Monster** — Blue Bird no submap encounters, only World Map roads Disc 2 (Barrens → Valley of Corrupted Gravity / Valley of Corrupted Gravity → Home of Giganto). Pattern Rare Monster spawn rules canon — exclude location interior, World Map exclusive. À implémenter `MonsterSpawnRules.locationType: 'submap' | 'world-map-road' | 'both'`. Source: idem.

- [ ] **🆕 Escape rate 100% canon Rare Monster** — Player can ALWAYS escape Blue Bird (vs 30% standard / 90% Forest / 40% Home of Gigantos). Pattern Rare Monster = "player choice catch OR escape" canon design. Implémenter escape rate 100% Rare Monsters. Source: idem.

- [ ] **🆕 Counter 28 universal transverse Mob/Boss/Rare Monster ⭐ confirmé** — Blue Bird Rare Monster Disc 2 = same Berserker mob = same Aqua King boss = 28-tier monster canon. Pattern Counter Opportunities 28 NOT category-correlated (mob vs boss vs rare) NI disc-correlated. Per user instruction : feature non-implémentée Damia, factual mention only. Source: idem.

- [ ] **🆕 Player strategy canon vs Rare Monster** — Standard weapons : 5 hits HP 5 (Run away! 25%/turn race) / Destroyer Mace Haschel bypass cap. Spells/magic useless (Magical Immunity → 0). Status useless (all 8 ✔ immune). À documenter `combat/rare-monsters.md` strategy section. Source: idem.

### Mobs / Blue Bird fandom complement — Unique Monster umbrella terminology + generic strategy canon NEW items (Magical Stone of Signet + Speed Down/Up + Wargod's Amulet + Dancer's/Bandit's Shoes)

- [ ] ⚠️ **🆕 Terminology divergence Rare Monster vs Unique Monster ⭐ MAJEUR** — Wiki tier 2 distingue **Rare Monster** (5 Birds Counter 28) vs **Unique Monster** Jars (Counter 16). Fandom utilise **"Unique Monster"** umbrella inclusif (Birds + Jars + autres). Damia adopt **wiki granular** : `MonsterCategory = 'rare-monster' | 'unique-monster-jar'` distincts. Pattern terminology canon à fixer `combat/rare-monsters.md` (à créer) + `combat/unique-monsters.md` (à créer) — 2 docs distincts catégories. Source: [`features/mobs/_sources/fandom-blue-bird.md`](features/mobs/_sources/fandom-blue-bird.md).

- [ ] **🆕 Stats divergences MASSIVES wiki vs fandom Blue Bird ⚠️** :
  - DF : wiki **100** vs fandom **0** (massive — fandom probable display error JP null OR irrelevant via Damage Mitigation)
  - MDF : wiki **100** vs fandom **0** (idem)
  - SPD : wiki **120** vs fandom **0** (massive — fandom contradicte propre strategy "high speed helps overcome Blue Bird")
  - HP (prose) : wiki 5 vs fandom prose 4 (internal contradiction fandom table 5 vs prose 4)
    → Wiki tier 2 prévaut canonical Damia (DF 100 / MDF 100 / SPD 120 / HP 5). Source: comparaison.

- [ ] **🆕 Magical Stone of Signet canon item NEW ⭐** — Fandom NEW reference : "generic strategy for defeating Unique Monsters" key item. Effect canon unknown (Time Stop probable OR SPD debuff ?). À investiguer items canon Damia. Possible lien Signet Sphere / Magical Stone (cohérent Divine Tree Signet Sphere lore). À documenter `items/key-items.md` (à créer) Magical Stone of Signet entry. Source: idem.

- [ ] **🆕 Speed Down + Speed Up canon spells/abilities NEW ⭐** — Fandom mention generic strategy Unique Monsters : Speed Down (debuff target SPD) + Speed Up (buff party SPD). Pattern SPD manipulation canon multi-Unique-Monster. À investiguer : Repeat Items SPD-related ? Dragoon Magic ? Status effects ? À documenter `combat/status-effects.md` (à créer) Speed Down/Up entries. Source: idem.

- [ ] **🆕 Wargod's Amulet canon accessory NEW ⭐** — Distinct Wargod's Sash + Wargod's Calling (SP+ existing). Wargod's Amulet = accuracy bonus accessory probable (cohérent Unique Monster strategy "high accuracy"). À investiguer `items/equipment.md` accessory canon catalog complète. Source: idem.

- [ ] **🆕 Dancer's Shoes + Bandit's Shoes canon SPD boots NEW ⭐** — Fandom mention SPD-boost items vs Unique Monsters. À investiguer slot (armor/accessory ?) + SPD effect canon. À documenter `items/equipment.md` Boots category. Source: idem.

- [ ] **🆕 Generic strategy canon Unique/Rare Monster pattern ⭐** — Magical Stone of Signet + Speed Down + Speed Up + accuracy items (Wargod's Amulet + Sallet + Long Bow) + SPD boots (Dancer's/Bandit's Shoes). Pattern strategy réutilisable multi-Unique-Monster (Birds + Jars). À documenter `combat/rare-monsters.md` + `combat/unique-monsters.md` Strategy generic sections. Source: idem.

- [ ] **🆕 Blue Bird location précisification fandom** — Primary spawn road : Home of Gigantos ↔ Valley of Corrupted Gravity / Secondary rare/seldom : Barrens ↔ Valley of Corrupted Gravity. Cohérent wiki "Valley of Corrupted Gravity → Home of Giganto most common". À refléter spawn rates per-road. Source: idem.

### Bosses / Master Table canon TLoD — 75+ bosses Disc 1-4 + taxonomy officielle + Pandemonium NEW + Halberd revision

- [ ] **🆕 ⭐ MASTER TABLE BOSSES canon Damia ⭐ MAJEUR** — 75+ bosses Disc 1-4 stats complète (HP/DF/MDF/PAV/MAV/AT/MAT/SPD/EXP/Gold/Drops/Location) ingéré canonique. À implémenter `bosses/*.ts` per-boss data-models. Source: [`features/bosses/_sources/lod-wiki-bosses-master-table.md`](features/bosses/_sources/lod-wiki-bosses-master-table.md).

- [ ] **🆕 ⭐ Taxonomy canon officielle TLoD fixée ⭐ MAJEUR** — 4 catégories canon : Minor Enemy / Rare Monster (SUBSET Minor Enemy) / Boss / **Boss Extras NEW**. Implémenter `MonsterCategory = 'minor-enemy' | 'rare-monster' | 'unique-monster-jar' | 'boss' | 'boss-extras'`. Documentation complète : [`features/combat/monster-categories.md`](features/combat/monster-categories.md). Source: idem.

- [ ] **🆕 ⭐ Correction Rare Monster = SUBSET Minor Enemy canon (NOT separate category)** — Wiki tier 2 confirme : "Minor Enemies who appear in random battles but possess special resistances to damage, see Rare Monsters". Adjust Blue Bird + autres Birds classification. Fandom umbrella "Unique Monster" = approximative. Source: idem.

- [ ] **🆕 Boss Extras NEW category canon ⭐** — "enemies who appear in Boss encounters but are neither Minor Enemies nor Bosses". À investiguer scope canon : adds spawned ? Background entities ? Specific wiki page `bosses/_sources/lod-wiki-boss-extras.md` si existe. Source: idem.

- [ ] **🆕 ⭐ Pandemonium NEW Attack Item canon ⭐ MAJEUR** — Wiki master Bosses page : "susceptible to items like Total Vanishing or Pandemonium". Pattern Pandemonium = Attack Item one-shot kills minor enemies direct, cohérent Total Vanishing canon (Demon's Gate probable même pattern). À documenter `items/consumables.md` (à créer) Pandemonium entry + cross-référer Total Vanishing / Demon's Gate Erase Attack Items canon. Source: idem.

- [ ] **🆕 ⚠️ Halberd source canon REVISION** — Wiki master canon dit **Lavitz's Spirit at Mayfil (Disc 4)** drops Halberd 50% (vs existing TODO 1428 "Halberd via Lavitz Spirit Phantom Ship Disc 2"). Phantom Ship Disc 2 = Ghost Commander (Night Raid 100% drop), pas Lavitz. À reconcilier `items/equipment.md` Halberd source canonical Mayfil Disc 4. Source: idem.

- [ ] **🆕 Magician Faust Optional 20,000 EXP / 10,000 Gold ⭐ MAJEUR** — Highest single-encounter Gold reward TLoD canon. Optional rematch Flanvel Tower Disc 3 (vs Apparition first fight 0 reward). Pattern Optional endgame Gold farm canon. À documenter `bosses/Magician Faust.md` (à créer) + `bosses/_sources/`. Source: idem.

- [ ] **🆕 Vellweb 4 Dragoon Knights Optional bosses Disc 3 canon ⭐** — Belzac (Earth, 16k HP, 178 AT highest) / Damia (Water, 200 MDF) / Kanzas (Thunder, 10% PAV) / Syuveil (Wind, 10% PAV, 152 AT). All 6k EXP / 300 Gold / Stone drop (Golden/Blue Sea/Violet/Jade). À documenter `bosses/Belzac.md` (existing draft à compléter) + `bosses/Damia.md` (existing) + `bosses/Kanzas.md` (à créer) + `bosses/Syuveil.md` (à créer). Source: idem.

- [ ] **🆕 Mayfil 3 Ghost Dragon Spirit pairs Optional Disc 4 canon ⭐** — Ghost Feyrbrand + Dragon Spirit (Wind) / Ghost Regole + Dragon Spirit (Water) / Divine Dragon Ghost + Dragon Spirit (Non-Elemental). Pattern "haunted Dragon Spirits" canon. À documenter `bosses/Ghost Feyrbrand.md` (à créer) + `bosses/Ghost Regole.md` (à créer) + `bosses/Divine Dragon Ghost.md` (à créer). Source: idem.

- [ ] **🆕 Lavitz's Spirit + Zackwell pair canon Mayfil Disc 4 ⭐** — Lavitz's Spirit 5,000 HP + Zackwell 8,000 HP. Lavitz's Spirit drops Halberd 50% (REVISION canon). Zackwell drops Healing Rain 100%. Pattern emotional Disc 4 fight canon (Lavitz ghost reveal). À documenter `bosses/Lavitz Spirit.md` (à créer) + `bosses/Zackwell.md` (à créer). Source: idem.

- [ ] **🆕 Caterpillar 3-phase transformation canon Divine Tree Disc 4 ⭐** — Caterpillar (6k HP Non-Elemental) → Pupa (2.5k HP) → Imago (12k HP) sequential. Drops Healing Rain + Moon Serenade + Sun Rhapsody 100% chacun. Pattern 3-form boss canon. Cohérent existing [`features/locations/Divine Tree.md`](features/locations/Divine Tree.md) ~29.6k HP total mention. À documenter `bosses/Caterpillar.md` (à créer) + Pupa + Imago. Source: idem.

- [ ] **🆕 Melbu Frahma final boss canon Moon That Never Sets ⭐** — **42,000 HP** ⭐ highest HP boss TLoD + 200 DF / 250 MDF / 107 AT / 80 MAT / 0 EXP/Gold rewards (no drop). Pattern "high HP / moderate stats" final boss design. À documenter `bosses/Melbu Frahma.md` (à créer). Source: idem.

- [ ] **🆕 Heart (Windigo) HP 3 ⭐ lowest boss HP canon** — Pattern Heart must be killed during Windigo fight (instant-kill possible). Mechanism canon : boss vulnerability instant-kill via Heart targeting ? À investiguer. Source: idem.

- [ ] **🆕 Stats patterns A-AV/M-AV non-0 bosses canon** — Magician Faust 20% MAV (highest), Kanzas/Syuveil 10% PAV, Archangel 5% PAV/MAV, Selebus 10% PAV, Ghost Regole 5% MAV. Pattern endgame bosses physical avoidance canon. Source: idem.

- [ ] **🆕 Multi-part bosses canon pattern ⭐** — Virage (Head/Body/Arm canon × 3 fights Disc 1-3-4) / Divine Dragon (+Cannon+Ball Disc 3) / Polter (Helm/Armor/Sword Disc 3 optional) / Caterpillar 3-phase / Michael (+Core Disc 4) / Lenus (+Regole Disc 2) / Greham (+Feyrbrand Disc 1) / Gehrich (+Mappi Disc 2). Pattern multi-target boss fights canon. À implémenter `BossFight.parts: BossPartRef[]` data-model. Source: idem.

- [ ] **🆕 Shirley EXP/Gold conditional "0 (1,500)" canon ⭐** — Pattern conditional reward (sparing path canon ?). Shirley Disc 1 Shrine of Shirley boss : 0 normal / 1,500 EXP + 100 Gold conditional. À investiguer mechanism canon. Source: idem.

- [ ] **🆕 HP scaling Disc 1 → 4 canon** — Commander 14 → Drake 1,200 → Divine Dragon 5,000 → Melbu Frahma 42,000. Pattern progressive scaling canon. À utiliser balancing reference Damia. Source: idem.

- [ ] **🆕 AT scaling Disc 1 → 4 canon** — Commander 2 → Doel 32 → Polter Sword 134 → Belzac 178 (max). Pattern progressive scaling canon offensive bosses. Source: idem.

- [ ] **🆕 Indora SPD 30 ⭐ lowest boss SPD canon** — Pattern Giganto slow canon (cohérent Kongol SPD 60 mid). Race species SPD scaling canon. Source: idem.

- [ ] **🆕 Polter Sword SPD 100 ⭐ highest boss SPD canon** — Pattern animated weapon canon (vs 50 standard). Source: idem.

- [ ] **🆕 Boss drops canon highlights** :
  - **Total Vanishing 100% Mappi (Barrens Disc 2)** — boss-drop Attack Item canon (cohérent Beastie Dragon 8% drop)
  - **Indora's Axe 100% Indora (Moon That Never Sets Disc 4)** — Kongol weapon boss-locked
  - **Pretty Hammer 100% Last Kraken (Aglis Disc 4)** — Kongol weapon
  - **Wargod's Amulet 100% Urobolus (Limestone Cave Disc 1)** — earliest accessory canon (cohérent Blue Bird strategy mention)
  - **Brass Knuckle 100% Windigo (Kashua Glacier Disc 3)** — Haschel weapon
  - **Dragoon Stones** Disc 1 (Silver/Red-Eye/Darkness) + Vellweb Disc 3 (Golden/Blue Sea/Violet/Jade)
    À refléter `items/equipment.md` boss-locked weapon/accessory sources canon. Source: idem.

### Bosses / fandom master complement — NEW boss entries (Bomb Star/Cleone/Crafty Thief boss/Dark Doel 3-phase/Gangster/Ghost Knight/Guftas/Imago multi-phase/Rodriguez/Sandora Soldier/Scarred Super Virage Forbidden Land/Senior Warden/Shirley 3-fight/Wounded Virage/etc.) + Escape disabled + No respawn + Two types Minor/Major + US/JP divergences

- [ ] ⭐ **🆕 Definition canon Boss fandom complement ⭐ MAJEUR** :
  - **Escape cannot be used during boss fight** canon NEW
  - **Bosses do not respawn** canon NEW
  - **Same boss in same circumstances impossible** (unique encounter)
  - Pattern enforce data-model `BossFight.escapeDisabled: true` + `Boss.spawnRules.respawnable: false`
  - Source: [`features/bosses/_sources/fandom-bosses-master.md`](features/bosses/_sources/fandom-bosses-master.md).

- [ ] ⭐ **🆕 Two types canon Bosses fandom ⭐** : **Minor Boss** (drops Gold) vs **Major Boss** (story line + lots EXP). Exceptions canon : **Hero Competition + Crafty Thief = Minor Boss sans Gold** (0 Gold). À implémenter `BossTier = 'minor' | 'major'` + flag exception. Source: idem.

- [ ] ⭐ **🆕 Boss minions canon clarification fandom** : "boss minions counted as bosses, not regular monsters". Adopt fandom interpretation : Damia `MonsterCategory` boss minions = subset Boss (vs wiki "Boss Extras" 3ème catégorie). À reconcilier `combat/monster-categories.md` (déjà ajusté). Source: idem.

- [ ] ⭐ **🆕 NEW boss entries fandom-only ⭐ MAJEUR** :
  - **Bomb Star** (Moon That Never Sets, No Element, 1600 HP) — boss MTNS Disc 4 NEW
  - **Cleone** (Aglis, Water, 1360 HP) — boss Aglis Disc 4 NEW
  - **Crafty Thief boss** (Barrens, Dark, 320 HP) ⭐ — wiki classifie mob ; fandom = boss canon
  - **Dark Doel 3-phase** : Dark Doel + Light Sword + Shadow Blade (Moon That Never Sets) ⭐ multi-phase NEW
  - **Drake minions** : Wire Net (120 HP) + Bursting Bomb (70 HP) ⭐ NEW
  - **Fire Bird (Volcano Ball)** summon minion ⭐ NEW
  - **Gangster boss** (Home of Gigantos, Earth, 280 HP) — wiki mob ; fandom boss
  - **Ghost Knight** (Phantom Ship, Dark, 200 HP) ⭐ minion Ghost Commander
  - **Guftas** (Hellena Prison, Dark, 560 HP) ⭐ NEW Disc 1
  - **Hellena Warden (Fruegel minion)** ⭐ NEW
  - **Imago multi-phase** : Imago + (Caterpillar) + (Pupa) 3 forms canon ⭐
  - **Melbu Frahma (Tentacle) + Monster (boss summon)** ⭐ NEW final minions
  - **Rodriguez** (Hellena Prison, Wind, 400 HP) ⭐ NEW
  - **Sandora Soldier ×3** : Hoax Fire + Marshlands Fire + Marshlands Water ⭐ NEW
  - **Scarred Super Virage** (Forbidden Land = Kadessa) Head/Body/Arm ⭐ NEW canon name
  - **Senior Warden (Fruegel fight)** ⭐ NEW Hellena Shana rescue
  - **Shirley 3-fight** : Shirley + Lavitz + Shana ⭐ NEW canon ("essence fights")
  - **Wounded Virage** (Volcano Villude) Head/Body/Arm — wiki "Virage" = "Wounded Virage" canon name fandom
  - **Windigo Snow Cannon** ⭐ NEW minion Windigo
    → À implémenter individual boss data-models + à documenter `bosses/*.md` per-boss. Source: idem.

- [ ] ⭐ **🆕 "Forbidden Land" = Kadessa alternative canon name ⭐** — Fandom location name vs wiki "Kadessa". Same place — Wingly hidden city Disc 3. À refléter `locations/Kadessa.md` aliases canonical. Source: idem.

- [ ] ⚠️ **🆕 "Prison Island" location canon NEW Lenus 2nd fight** — Fandom "Prison Island" vs wiki "Undersea Cavern". Possible same place different name OR multiple Lenus encounters. À investiguer Discord. Source: idem.

- [ ] ⚠️ **🆕 Stats divergences MASSIVES wiki vs fandom Bosses ⭐** :
  - Archangel : wiki 3000 HP vs fandom **3200** + AT/MAT divergences (53/76 vs 60/86)
  - Belzac : wiki 16000 vs fandom **18000** + AT 178 vs 200
  - Damia : wiki 9000 vs fandom **11200** + AT 116 vs 130
  - Kanzas : wiki 12000 vs fandom **14400** + AT 134 vs 150
  - Syuveil : wiki 10000 vs fandom **12800** + AT 152 vs 170
  - Faust : wiki 25600 vs fandom **24000** ⚠️ rare downward + AT 125 vs 140
  - Kongol BC : wiki 1000 vs fandom **1200** + AT 32 vs 36
  - Imago : HP match + AT 100 vs 140 + MAT 134 vs 150 divergence
  - Melbu Frahma : HP match + AT 107 vs 120 + MAT 80 vs 90
  - Pattern : fandom +10-30% higher most stats (probable JP values closer). Wiki tier 2 prévaut canonical Damia.
    Source: comparaison.

- [ ] **🆕 US vs JP HP divergences pattern systematic Bosses canon ⭐** — Fandom indique stats parentheses = JP version. Pattern JP +25% systematic (cohérent mobs Beastie Dragon/Berserk Mouse pattern). Examples : Melbu Frahma 42k US / 60k JP (+43%) / Belzac 18k US / 25k JP / Imago 12k US / 20k JP (+67% extrême). À documenter `combat/jp-vs-us-stats.md` (à créer). Source: idem.

- [ ] **🆕 Element terminology fandom abbreviations** — Fandom utilise "Dark" (wiki "Darkness") + "No Element" (wiki "Non-Elemental"). Damia adopt wiki canonical full names. Source: idem.

- [ ] **🆕 Drake the Bandit's Wire Net + Bursting Bomb canon ⭐** — Boss minions/weapons-as-targets Drake fight. Pattern boss interactive objects targetable canon. Wire Net 120 HP / Bursting Bomb 70 HP. À documenter `bosses/Drake the Bandit.md` (à créer) avec multi-target fight. Source: idem.

- [ ] **🆕 Imago multi-phase 3-form canon ⭐** — Imago (main 12k HP) + Imago (Caterpillar form 6k HP) + Imago (Pupa form 2.8k HP) — pattern transformation reverse-cycle canon Disc 4 Divine Tree. Cohérent existing Caterpillar 3-phase doc. À refléter `bosses/Caterpillar.md` (à créer) + `bosses/Imago.md`. Source: idem.

- [ ] **🆕 Dark Doel 3-phase canon Moon That Never Sets Disc 4 ⭐** — Dark Doel (1500 HP) + Dark Doel (Light Sword) (1000 HP) + Dark Doel (Shadow Blade) (1000 HP). Pattern multi-form ghostly Doel canon MTNS. À documenter `bosses/Dark Doel.md` (à créer). Source: idem.

- [ ] **🆕 Shirley 3-fight canon Shrine of Shirley Disc 1 ⭐** — Shirley main (640 HP) + Shirley (Lavitz) (140 HP) + Shirley (Shana) (140 HP). Pattern "Lavitz/Shana essence fights" canon — to investigate mechanic exact. À documenter `bosses/Shirley.md` (à créer). Source: idem.

- [ ] **🆕 Sandora Soldier ×3 boss versions canon ⭐** — Hoax Fire (40 HP) + Marshlands Fire (55 HP) + Marshlands Water (66 HP). Pattern Sandora military boss variants canon. À cross-référer `lore/sandora-military.md` (à créer). Source: idem.

- [ ] **🆕 Hellena Warden + Senior Warden boss-mob hybrid canon ⭐** — Hellena Warden (Fruegel minion) 9 HP + Senior Warden (Fruegel fight) 24 HP. Pattern minor boss-mob hybrid hellena warden NPCs. À cross-référer `mobs/Hellena Warden.md` (à créer) — existing in counter list. Source: idem.

- [ ] **🆕 Rodriguez boss Hellena Prison Disc 1 ⭐** — Wind, 400 HP. Probable boss Hellena Prison rescue Shana arc. À documenter `bosses/Rodriguez.md` (à créer). Source: idem.

- [ ] **🆕 Guftas boss Hellena Prison Disc 1 ⭐** — Dark, 560 HP. À documenter `bosses/Guftas.md` (à créer). Source: idem.

- [ ] **🆕 Wounded Virage canon name vs wiki "Virage" Volcano Villude Disc 1 ⭐** — Fandom précise "Wounded" (cohérent thematic Volcano Villude Virage Disc 1 partially destroyed). Adopt fandom canon name. Source: idem.

- [ ] **🆕 Cleone boss Aglis Disc 4 NEW ⭐** — Water, 1360 HP. À investiguer lore Aglis Disc 4 (cohérent Aglis Lenus reveal). À documenter `bosses/Cleone.md` (à créer). Source: idem.

- [ ] **🆕 Bomb Star boss MTNS Disc 4 NEW ⭐** — No Element, 1600 HP, 120 AT. À documenter `bosses/Bomb Star.md` (à créer). Source: idem.

### ⭐ DÉCISION PROJET DAMIA — adopter stats JP canon (case-by-case)

- [ ] ⭐ **🆕 DÉCISION CANON Damia : adopter stats JP** ⭐ MAJEUR — Pour Damia (action 2D iso PixiJS), adopter les **stats JP canon** (vs US/EU) car JP +25% HP / ÷3 Gold systematic = **gameplay action plus challenging + grind plus rewarding**. **Décision case-by-case** par ennemi : certains ennemis garderont US si JP problématique balancing. À évaluer per-mob/per-boss ingestion finale + playtest. À implémenter data-model :

  ```ts
  type MonsterStats = {
    hp: number; // JP value canon Damia (default)
    hpUS?: number; // US/EU value reference (fallback)
    gold: number; // JP value canon
    goldUS?: number; // US/EU reference
  };
  ```

  Documenter `combat/monster-categories.md` (déjà ajusté). Source: décision user 2026-05-22.

- [ ] **🆕 Validation JP stats per-mob/per-boss canon ⭐** — Procédure case-by-case : pour chaque mob/boss ingéré, valider si JP canon adopt ou US fallback. Pattern systematic JP +25% HP / ÷3 Gold à respecter par défaut. Examples cases potentiellement problématiques :
  - **Imago JP 20k HP** vs US 12k (+67% extrême) — possible OK action gameplay
  - **Belzac JP 25k HP** vs US 18k (+39%) — boss Optional Vellweb, JP OK probable
  - **Melbu Frahma JP 60k HP** vs US 42k (+43%) — final boss, JP OK gameplay narrative
  - **Faust JP 32k HP** vs US 25.6k (+25%) — JP standard pattern
    → À valider par mob/boss ingestion alphabetical. Source: idem.

- [ ] **🆕 Cross-reference docs canon Damia adopt JP stats ⭐** — Mettre à jour tous mobs/bosses docs existing avec note "Damia adopte stats JP par défaut" :
  - `mobs/Beastie Dragon.md` : HP US 336 → **JP 420** Damia
  - `mobs/Berserk Mouse.md` : HP US 2 → **JP 4** Damia
  - `mobs/Berserker.md` : HP US 400 → **JP 500** Damia, Gold US 15 → **JP 5** Damia
  - `mobs/Aqua King.md` / `mobs/Air Combat.md` / `mobs/Arrow Shooter.md` / `mobs/Assassin Cock.md` / `mobs/Baby Dragon.md` / `mobs/Basilisk.md` / `mobs/Blue Bird.md`
  - `bosses/*.md` toutes existing docs
    À refléter "Stats canon (JP adopté)" sections ⭐. Source: décision projet.

### Mobs / Bowling (Non-Elemental Snowfield Disc 3 — Status all 8 ✔ Minor Enemy NEW + Counter 4 NEW lowest tier + Attack Ball drop NEW + Charging Spirit Air-Combat-style)

- [ ] **🆕 Bowling canon data-model** — **Non-Elemental** element, HP 400 (JP à confirmer), AT 70, DF **160 high**, MAT 50, MDF 80, SPD 60. Mob Snowfield Disc 3 partner Windy Weasel + Wildman + White Ape. Pattern tank physical (DF high). À implémenter `mobs/bowling.ts`. Source: [`features/mobs/_sources/lod-wiki-bowling.md`](features/mobs/_sources/lod-wiki-bowling.md).

- [ ] ⭐ **🆕 Status Immunity all 8 ✔ Minor Enemy NEW canon ⭐ MAJEUR** — Bowling = preuve canon Minor Enemy avec boss-tier immunity (vs standard 4/4 ou deviations 5/3, 6/2). Pattern Mob varying jusqu'à 8/8 immune. Cross-référence : Bowling Minor + Rare Monsters Birds + Bosses share all 8 ✔ → not exclusive Rare/Boss trait. À documenter `combat/status-effects.md` per-mob immunity tier matrix avec `'minor-boss-tier-8'` profile NEW. Source: idem.

- [ ] ⭐ **🆕 Counter Opportunities tier 4 NEW lowest non-0 ⭐ MAJEUR** — Bowling first ingestion Counter (4) tier. Pattern Damia étendu **6 tiers canon : 0 / 4 / 9 / 16 / 19 / 28**. Counter (4) = Dart Volcano + Dart Crush Dance + Meru Perky Step + Albert Gust of Wind Dance (4 button presses 4 abilities total). À investiguer si autres mobs Counter 4 exist alphabetical. Per user instruction : feature non-implémentée Damia, factual mention only. Source: idem.

- [ ] **🆕 Attack Ball 8% drop NEW canon item ⭐** — Bowling drops Attack Ball 8%. Effect canon unknown (probable Repeat Item attack damage OR consumable). À investiguer fandom + items wiki. À documenter `items/consumables.md` (à créer) Attack Ball entry. Source: idem.

- [ ] **🆕 Charging Spirit Air-Combat-style AI Bowling pattern ⭐** — Confirms shared canon Air Combat + Bowling = same probability-based Charging Spirit (vs Berserker @25% exact threshold). 75% basic / 25% Charging Spirit > 25% HP / 25% All-out Attack! ≤ 25% HP (3× phys). Pattern AI réutilisable Damia `MobAI3PhaseCharging` data-model + cross-mob ability references. Source: idem.

- [ ] **🆕 Snowfield mob faction canon NEW ⭐** — Bowling + **Windy Weasel** + **Wildman** + **White Ape** = 4 mobs Snowfield Disc 3 ecosystem canon. À documenter `mobs/Windy Weasel.md` + `mobs/Wildman.md` + `mobs/White Ape.md` (à créer). Cohérent Polter Helm/Armor/Sword optional bosses Snowfield + Snowfield → Vellweb road. Source: idem.

- [ ] **🆕 Snowfield → Vellweb road canon Disc 3** — Bowling formation 181 spawns on this transit road. Pattern road Disc 3 pre-Vellweb 4 Dragoon Knights Optional bosses. À documenter `locations/Snowfield.md` + `locations/Vellweb.md` (à créer). Source: idem.

- [ ] **🆕 Pattern "tank physical" canon Bowling ⭐** — HP 400 + DF 160 high + MDF 80 moderate + AT 70 = mob anti-physical favorise magic player strategy. Cross-référence : Beastie Dragon (DF 130 high) similar pattern. Pattern Disc 3 mob tank physical canon. Source: idem.

- [ ] **🆕 Rotating Hammer canon ability name (community) Bowling** — Wiki ~Rotating Hammer (community), fandom canon name à investiguer ingestion future. Source: idem.

### Mobs / Bowling fandom complement — JP name + Appearance automaton 3 arms + Spinning Attack canon + Spell Item Attack Ball NEW + JP stats confirmés

- [ ] **🆕 Bowling JP name ボーリング (Bōringu) direct translit** — Source: [`features/mobs/_sources/fandom-bowling.md`](features/mobs/_sources/fandom-bowling.md).

- [ ] **🆕 Bowling appearance canon MAJEUR ⭐** — Humanoid automaton with **light-brown wood + gray stone body**, **head indistinguishable from torso aside red eye**, **three arms used as flails**. Pattern thematic "primitive Wingly automaton" canon (cohérent Snowfield Disc 3 → Vellweb Wingly proximity). À refléter visual sprite design Damia. Source: idem.

- [ ] **🆕 Spinning Attack canon name officiel (vs wiki ~Rotating Hammer community) ⭐** — Adopter fandom canon > 25% phase ability. Pattern "three arms swinging" cohérent appearance. Source: idem.

- [ ] **🆕 Charging Spirit Bowling = "Uses All-out Attack next turn" simpler ⚠️** — Fandom clarifie : Bowling Charging Spirit toujours preps All-out Attack (vs wiki "Rotating Hammer OR All-out Attack" dual-option). Pattern Bowling AI différent Air Combat/Berserker (dual-option). Damia adopt fandom simpler version probable. À implémenter `MobAI3PhaseCharging.chargingSpiritOptions: 'single' | 'dual'` data-model. Source: idem.

- [ ] **🆕 Encounter rate Very common canon Bowling** — Vs Common Beastie Dragon/Berserker, Uncommon Air Combat. Pattern encounter rate variability canon. Cohérent ~10min Attack Ball farming. Source: idem.

- [ ] **🆕 Attack Ball = Spell Item canon NEW ⭐ MAJEUR** — Fandom classifie Attack Ball comme "spell item" (vs Attack Item Total Vanishing / Repeat Item Healing Potion). Pattern Spell Items canon distinct : item qui cast spell effect (probable Repeat Item magic-type OU consumable spell-cast). À reconcilier `items/consumables.md` (à créer) taxonomy 3 categories : **Attack Items** (Total Vanishing/Pandemonium one-shot Erase) / **Repeat Items** (Healing Potion/Spirit Potion reusable) / **Spell Items NEW** (Attack Ball/etc spell-cast). Cannot be purchased + ~10 min farming canon. Source: idem.

- [ ] **🆕 Bowling JP stats confirmés ⭐** — HP US 400 / JP **500** (+25% pattern systematic) + Gold US 42 / JP **14** (÷3 pattern systematic). Damia adopt JP : HP 500 / Gold 14. Cohérent décision projet adopt JP. Source: idem.

- [ ] **🆕 Stats divergences Bowling wiki vs fandom ⚠️** :
  - P. Attack : wiki 70 vs fandom **79** (+13%)
  - M. Attack : wiki 50 vs fandom **56** (+12%)
    → Pattern fandom higher (probable JP closer). À reconcilier final canon Damia. Source: comparaison.

- [ ] **🆕 "Defend once Charging Spirit" strategy canon Bowling** — Guard reduce All-out Attack damage. Pattern player counter-strategy : Guard pendant Charging Spirit turn = mitigation. À documenter `combat/strategy.md` (à créer). Source: idem.

- [ ] **🆕 "Primitive Wingly automaton" thematic Bowling canon** — Cohérent Snowfield Disc 3 location proximity Vellweb Wingly Knights area. Pattern Wingly-tech mobs Disc 3 ? À cross-check autres Snowfield mobs (Windy Weasel/Wildman/White Ape) + Polter Helm/Armor/Sword bosses thematic. Source: idem.

### Mobs / Cactus (Earth Death Frontier Disc 4 — Counter 16 Minor NEW + symmetric balanced AT=MAT/DF=MDF + Contact visible mob + Recovery Ball drop NEW)

- [ ] **🆕 Cactus canon data-model** — **Earth** element, HP 320 (JP +25% ~400 à confirmer), AT 67, DF **150 high**, MAT 67, MDF **150 high**, SPD 60. Mob Death Frontier Disc 4 Cactus ×2 formation unique. À implémenter `mobs/cactus.ts`. Source: [`features/mobs/_sources/lod-wiki-cactus.md`](features/mobs/_sources/lod-wiki-cactus.md).

- [ ] ⭐ **🆕 Counter Opportunities 16 Minor Enemy NEW canon ⭐ MAJEUR** — Cactus = first Minor Enemy avec Counter 16 confirmed canon. Previously thought Counter 16 = exclusive Unique Jars tier (Lucky Jar/Cursed Jar/Treasure Jar). Pattern Counter tier per-mob assigned NOT category-correlated. À reconcilier `combat/additions.md` Counter Opportunities tier mapping documentation. Pattern Damia 6 tiers canon : 0 / 4 / 9 / 16 (Minor + Jar shared) / 19 / 28. Source: idem.

- [ ] ⭐ **🆕 Stats "symmetric balanced tank" canon NEW Cactus ⭐** — AT=MAT=67 + DF=MDF=150 unique pattern symmetric. Mob anti-physical AND anti-magic balanced offense. Pattern Disc 4 Death Frontier mob design "tough generalist". À cross-check autres Disc 4 mobs same pattern. Source: idem.

- [ ] ⭐ **🆕 Recovery Ball 15% drop NEW item canon ⭐** — Cactus drops Recovery Ball 15%. Pattern Spell Item probable (cohérent Attack Ball Bowling Spell Item canon) — Recovery thematic = healing-cast Spell Item probable. **15% drop rate ⭐ high** (vs 8% standard). Cohérent existing TODO 1046 "Recovery Ball 100 random" Magic Damage SP grants. À documenter `items/consumables.md` (à créer) Recovery Ball entry Spell Item healing. Source: idem.

- [ ] ⭐ **🆕 "Contact" encounter mechanic Death Frontier visible mob canon NEW ⭐** — Cactus formation 456 Death Frontier submaps 748/755/763/769 = **Contact** (visible mob contact-trigger). Cohérent existing `locations/Death Frontier.md` "Collision Encounter (mobs visibles + contact = battle, comme Phantom Ship)". Distinct **"Contact (arrows)" Berserker** Home of Gigantos arrow traps. À documenter `combat/encounter-mechanics.md` (à créer) — pattern 3 encounter types canon : `random` / `contact-arrows` / `contact-visible-mob`. Source: idem.

- [ ] **🆕 Cactus ×2 unique formation canon** — Cactus uniquement spawns par paires (formation 456). Pas de solo ni partners autres mobs. Pattern formation "duo dedicated" canon. Source: idem.

- [ ] **🆕 World Map roads bidirectional Cactus canon Disc 4 ⭐** — Death Frontier ↔ Ulara (entrance + exit Wingly hidden city) + Ulara → Home of Giganto (reverse direction Disc 4 to Disc 2 area). Pattern roaming mob roads multi-direction canon. À documenter `world-map/disc4-roads.md` (à créer). Source: idem.

- [ ] **🆕 AI 2-phase simple Cactus canon** — ~Bite (>50%, 1× phys) / ~Thousand Needles (≤50%, **3× phys**). Pas de Charging Spirit telegraph (vs Air Combat/Berserker/Bowling). Pattern AI simple direct escalation canon. Pattern "wounded mob more dangerous" canon récurrent. Source: idem.

- [ ] **🆕 ~Thousand Needles canon name (community) Cactus** — Wiki ~Thousand Needles (community), pattern thematic "cactus shoots needles" — possible Final Fantasy "1000 Needles" reference. Fandom canon name à investiguer ingestion future. Source: idem.

### Mobs / Cactus fandom complement — Appearance gliding flytrap canon + Base Dive/Needle Burst canon names + Recovery Ball "healing item" taxonomy clarification + JP stats confirmés

- [ ] **🆕 Cactus appearance canon MAJEUR ⭐** — "Green spiky plants **NOT rooted like normal cacti**, **glide with large leaves**, **biting target with flytrap-like maw**". Pattern thematic "mobile gliding flytrap cactus hybrid" canon — Audrey II / Venus flytrap inspired probable. NOT a normal cactus (naming misleading). À refléter sprite visual Damia : plant-mob-with-leaves NOT ball-shape. Source: [`features/mobs/_sources/fandom-cactus.md`](features/mobs/_sources/fandom-cactus.md).

- [ ] **🆕 Base Dive canon name officiel (vs wiki ~Bite community) Cactus ⭐** — Description "hovers + hops on target" cohérent gliding appearance. Adopter fandom canon > 50% phase. Source: idem.

- [ ] **🆕 Needle Burst canon name officiel (vs wiki ~Thousand Needles community) Cactus ⭐** — Description "twirls + launches needles". Adopter fandom canon ≤ 50% phase. Source: idem.

- [ ] **🆕 Cactus "No magical attacks/status ailments" pure physical canon** — Cactus MAT 75 stats but no magic offensive uses ; no status inflict capability. Pattern pure physical mob canon. Pattern à refléter mob abilities data-model. Source: idem.

- [ ] **🆕 "Guard effective" strategy canon Cactus** — Mitigation Cactus damage via Guard. Cohérent Bowling "Defend Charging Spirit" pattern. À documenter `combat/strategy.md` (à créer) Guard mitigation pattern. Source: idem.

- [ ] **🆕 ~10 minutes farming Recovery Ball Cactus canon** — Cohérent Very common encounter rate Death Frontier. Pattern farming time canon. Source: idem.

- [ ] ⭐ **🆕 Recovery Ball = "healing item" canon NEW MAJEUR — taxonomy items clarification ⭐** — Fandom classifie Recovery Ball comme "healing item" distinct **"spell item"** Attack Ball (Bowling). Pattern items canon taxonomy étendue :
  - **Healing Items** : Recovery Ball (heal HP) + Healing Potion + Spirit Potion + autres potions
  - **Spell Items** : Attack Ball (cast offensive spell) + Detonating Ball ? + autres
  - **Attack Items** : Total Vanishing + Pandemonium + Demon's Gate (one-shot Erase)
  - **Repeat Items** : umbrella reusable consumables (Healing/Spell Items subset)
    À reconcilier `items/consumables.md` (à créer) taxonomy items 3-4 categories canon distinctes. Source: idem.

- [ ] **🆕 Cactus JP stats confirmés ⭐** — HP US 320 / JP **400** (+25% pattern systematic) + Gold US 36 / JP **12** (÷3 pattern systematic). Damia adopt JP : HP 400 / Gold 12. Cohérent décision projet adopt JP. Source: idem.

- [ ] **🆕 Stats divergences Cactus wiki vs fandom ⚠️** :
  - P. Attack : wiki 67 vs fandom **75** (+12%) — fandom higher
  - M. Attack : wiki 67 vs fandom **75** (+12%) — symétrique AT=MAT confirmé 75
    → Damia adopt fandom 75/75 probable (pattern fandom JP closer). Source: comparaison.

- [ ] **🆕 Damage descriptions divergence wiki vs fandom Cactus ⚠️** — Wiki tier 2 explicit "1× phys / 3× phys HP-conditional" / Fandom imprécis "medium both abilities". Wiki tier 2 prévaut HP-conditional escalation canon Damia. Pattern AI 2-phase explicit damage scaling canon. Source: idem.

### Mobs / Canbria Dayfly (Wind Death Frontier Disc 4 — A-AV 10% NEW first Minor + Status 5/3 Poison immune NEW + Counter 0 + Spinning Gale 1.5× Wind magic + Body Purifier drop NEW + Cambrian mistranslation)

- [ ] **🆕 Canbria Dayfly canon data-model** — **Wind** element, HP 520 (JP +25% ~650 à confirmer), AT 58, DF 100, **A-AV 10% ⭐ NEW first Minor**, MAT 76, MDF 140 high, M-AV 0%, SPD 70. Mob Death Frontier Disc 4 ubiquitous (37 submaps coverage). À implémenter `mobs/canbria-dayfly.ts`. Source: [`features/mobs/_sources/lod-wiki-canbria-dayfly.md`](features/mobs/_sources/lod-wiki-canbria-dayfly.md).

- [ ] ⭐ **🆕 A-AV 10% NEW first Minor Enemy non-0 canon ⭐ MAJEUR** — Canbria Dayfly = first Minor Enemy avec A-AV non-0 ingestion canon Damia (vs Blue Bird Rare Monster 50% A-AV existing — Minor Enemies were 0% par défaut). Pattern thematic "flying insect dodge" canon. À refléter `combat/damage-formula.md` A-AV modifier applies Minor Enemy canon. Implication player : 10% miss physical attacks. À cross-check autres mobs Disc 4 same pattern. Source: idem.

- [ ] ⭐ **🆕 Status Immunity 5/3 Poison immune NEW canon ⭐** — Canbria Dayfly Poison ✔ immune NEW (distinct Berserk Mouse Fear+, Berserker Confuse+Fear+, Bowling all 8). Pattern thematic "insect immune to poison naturally" canon. À documenter `combat/status-effects.md` per-mob immunity matrix avec `'minor-deviation-5-3-poison'` profile NEW. Source: idem.

- [ ] **🆕 Counter Opportunities 0 "Counters Additions? No" Canbria Dayfly** — Pattern multi-mob no counter : Air Combat / Feyrbrand / Fire Bird / **Canbria Dayfly NEW** ⭐. Per user instruction : feature non-implémentée Damia, factual mention only. Source: idem.

- [ ] ⭐ **🆕 Spinning Gale canon name officiel (NOT ~ approximation) ⭐** — Wiki tier 2 canonical name explicit (vs ~Bite community approximation). **1.5× Wind-elemental magic damage canon** ⭐ — pattern Attack Multiplier 1.5× canon cohérent `combat/damage-formula.md`. À implémenter ability `spinningGale` Damia avec 1.5× multiplier + Wind element. Source: idem.

- [ ] ⭐ **🆕 Body Purifier 8% drop NEW item canon ⭐** — Probable Healing Item Poison cure thematic (cohérent Canbria Dayfly Poison immune irony). Pattern Purifier items canon : Mind Purifier (Confuse) + **Body Purifier (Poison probable)** + autres Purifiers ? À documenter `items/consumables.md` (à créer) Body Purifier entry + Mind Purifier taxonomy Purifier items. Source: idem.

- [ ] **🆕 37 submaps coverage canon Canbria Dayfly ⭐ MAJEUR** — Pattern "ubiquitous mob" Death Frontier (submaps 747-758, 760-763, 765-778, 780-786) vs Cactus 4 submaps localisés. À refléter spawn rates per-submap canon Death Frontier ecosystem. Source: idem.

- [ ] **🆕 Partner Scorpion NEW mob canon Death Frontier ⭐** — Formation 458 Canbria Dayfly + Scorpion. À documenter `mobs/Scorpion.md` (à créer) Death Frontier mob partner Disc 4. Source: idem.

- [ ] **🆕 "Contact ×37" encounter mechanic Canbria Dayfly** — Pattern Death Frontier visible mob Collision Encounter (cohérent locations/Death Frontier.md existing + Cactus pattern). 37 submaps spawn notation. Source: idem.

- [ ] ⭐ **🆕 Trivia "Cambrian" mistranslation canon NEW ⭐** — Wiki trivia : correct name = **Cambrian** (geological period ~500 million years ago Earth). "Canbria" = JP→EN mistranslation probable. À décider naming canon Damia : adopt canonical "Cambrian Dayfly" OR conserve community-translated "Canbria Dayfly" wiki standard. Pattern thematic "primordial insect creature" Death Frontier desert canon. Source: idem.

### Mobs / Canbria Dayfly fandom complement — Appearance massive insect 3 pairs wings stinger + "Only wind + strongest mob" Death Frontier + Bug bite canon + Body Purifier "effect item" taxonomy NEW + JP stats confirmés

- [ ] **🆕 Canbria Dayfly appearance canon MAJEUR ⭐** — "Colossal day fly massive insect, larger than 2 individuals, dark grey skin + red dotted abdomen lateral, **3 pairs wings (2 thorax + 1 abdomen) + large stinger**, long curled snout, red eyes". Pattern thematic "primordial Cambrian-era massive insect" cohérent trivia "Cambrian geological period". À refléter sprite visual Damia : insect 3-pair wings + stinger primordial. Source: [`features/mobs/_sources/fandom-canbria-dayfly.md`](features/mobs/_sources/fandom-canbria-dayfly.md).

- [ ] **🆕 "Only wind-element + strongest mob Death Frontier" canon ⭐** — Canbria Dayfly = unique Wind (vs majority Earth mobs Death Frontier ecosystem) + top tier mob area. À cross-référer mobs Death Frontier (Cactus Earth + Scorpion à investiguer + autres). Source: idem.

- [ ] **🆕 Bug bite canon name officiel (vs wiki ~Bite community) ⭐** — Adopter fandom canon any HP phase ability. Pattern thematic "long curled snout smack" cohérent appearance. Source: idem.

- [ ] **🆕 "Persistence derived from defence" canon Canbria Dayfly** — Pattern DF 100 / MDF 140 high makes mob resilient. Pattern Disc 4 tank mob canon. Source: idem.

- [ ] **🆕 "Spinning Gale = spell item" fandom phrasing ⚠️ ambiguous** — Narrative loose phrasing OR literal Spell Item canon classification ? Wiki tier 2 prévaut "ability magic 1.5× Wind" classification. À investiguer Discord/Wulves pour clarification. Source: idem.

- [ ] ⚠️ **🆕 Counter divergence Canbria Dayfly wiki vs fandom MAJEUR** — Wiki tier 2 "Counters Additions? No" + Counter Opportunities (0) / Fandom "Can Counterattack: Yes". Wiki tier 2 prévaut canon Damia Counter 0. Fandom probable default "Yes" imprécis. Source: comparaison.

- [ ] ⭐ **🆕 Body Purifier = "effect item" canon NEW MAJEUR — taxonomy items ⭐ étendue** — Fandom classifie Body Purifier "effect item" distinct **"spell item"** (Attack Ball Bowling) + **"healing item"** (Recovery Ball Cactus). Pattern items canon taxonomy étendue 4 categories canon :
  - **Healing Items** : Recovery Ball + Healing Potion + Spirit Potion (restore HP/MP)
  - **Spell Items** : Attack Ball (cast offensive spell-effect)
  - **Effect Items** ⭐ NEW : Body Purifier (cure Poison) + Mind Purifier probable (cure Confuse) + autres Purifiers (cure status conditions)
  - **Attack Items** : Total Vanishing + Pandemonium + Demon's Gate (one-shot Erase)
  - **Repeat Items** : umbrella reusable consumables (Healing/Spell/Effect subsets)
    À reconcilier `items/consumables.md` (à créer) taxonomy items 4-5 categories canon distinctes. Source: idem.

- [ ] ⭐ **🆕 Body Purifier purchasable 20 gold all shops canon ⭐** — Pattern Effect Items purchasable canon distinct Spell Items Attack Ball drop-only. À documenter `items/consumables.md` (à créer) Body Purifier price 20 gold + purchasability. Pattern Effect Items canon : generally purchasable shops (vs Spell Items drop-only). Source: idem.

- [ ] **🆕 ~5 minutes farming Body Purifier canon ⭐** — Cohérent Very common encounter rate Death Frontier. Pattern farming time canon. Source: idem.

- [ ] **🆕 Canbria Dayfly JP stats confirmés ⭐** — HP US 520 / JP **650** (+25% pattern systematic) + Gold US 30 / JP **10** (÷3 pattern). Damia adopt JP : HP 650 / Gold 10. Cohérent décision projet adopt JP. Source: idem.

- [ ] **🆕 Stats divergences Canbria Dayfly wiki vs fandom ⚠️** :
  - P. Attack : wiki 58 vs fandom **65** (+12%) — fandom higher probable JP closer
  - M. Attack : wiki 76 vs fandom **86** (+13%) — idem
    → Damia adopt fandom 65/86 probable. Source: comparaison.

### NPCs / Carlo (King of Unified Serdio pré-game lore — Albert's father + Doel's brother + Serdian Civil War trigger)

- [ ] **🆕 Carlo NPC lore canon ⭐** — **King Carlo of Serdio** = last king of unified Serdio (pre-Civil War). Albert's father + Doel's brother. **Murdered by Doel 20 years pre-game** → Serdio split Kingdom Basil (Albert north) + Imperial Sandora (Doel south) + 2 decades Civil War canon. Document NPC lore : [`features/npcs/Carlo.md`](features/npcs/Carlo.md). Source: [`features/npcs/_sources/lod-wiki-carlo.md`](features/npcs/_sources/lod-wiki-carlo.md) + [`features/npcs/_sources/fandom-carlo.md`](features/npcs/_sources/fandom-carlo.md).

- [ ] ⭐ **🆕 Reveal canon tragique Disc 4 Carlo NEW MAJEUR ⭐** — Albert duel Doel Moon that Never Sets reveals : Carlo lui-même **trustful of Doel** + **self-doubts king stature** ("didn't quite have the stature to be King" + "Without Doel, he couldn't do anything") + **expected Doel succession** ("you who was most likely to take the throne"). **Conflit familial = misunderstanding tragique canon** — Doel a tué frère qui aurait été allié. Pattern "miscommunication tragic family conflict" canon. À refléter Disc 4 boss fight Doel dialogues + Albert reveals. Source: idem.

- [ ] **🆕 Two views canon Carlo ⭐** — Doel's view (incompetent leader, overtaxation/disorder/corrupt ministers) vs Albert's view (loved by people + vassals). Pattern double-perspective canon political ambiguity. Source: idem.

- [ ] **🆕 Serdian Civil War 2 decades lore canon ⭐** — 20 years post-Carlo death → Disc 1 game start. Bale-Basil (Albert north) vs Imperial Sandora (Doel south). À documenter `lore/serdian-civil-war.md` (à créer) + `lore/serdia.md` (à créer) — full Serdio lore. Source: idem.

- [ ] **🆕 NPCs catalog `features/npcs/` créé NEW ⭐** — Pattern feature category NPCs lore (vs party-members + bosses + mobs). Premier NPC documenté = Carlo. Pattern à étendre autres NPCs lore TLoD : Albert's mother (à investiguer), Empress Karina (Doel's wife), autres NPCs canon. Source: décision projet.

- [ ] **🆕 Carlo questions ouvertes canon** : Carlo's wife / Albert's mother documented ? Carlo's reign duration ? Carlo's age ? À investiguer Discord/Wulves source tier 1 + autres ingestion. Source: idem.

### Bosses / Caterpillar (Boss 3-form transformation Divine Tree Disc 4 — AI "if→then" model NEW + A-AV status reduction NEW + Dark Vapor RNG 1/101 NEW + Can't Combat Instant Death combo + 3 Spell Items drops 100%)

- [ ] **🆕 Caterpillar 3-form boss canon data-model ⭐ MAJEUR** — Caterpillar → Pupa → Imago séquentielle (HP=0 = Transform au lieu de mort). HP : Caterpillar 6k / Pupa 2.5k / Imago 12k = total ~20.5k US (JP +25% ~25.6k). EXP 13k total (Caterpillar only). À implémenter `bosses/caterpillar.ts` multi-phase data-model. Cohérent existing `locations/Divine Tree.md` 3-phase mention. Source: [`features/bosses/_sources/lod-wiki-caterpillar.md`](features/bosses/_sources/lod-wiki-caterpillar.md).

- [ ] ⭐ **🆕 NEW Boss AI "if → then" model canon ⭐ MAJEUR** — Pattern boss behavior changes player input + conditions + multi-action random selection. Key terms canon : **Auto** (next turn condition met) + **Ignore Turn Order** (Retaliate pattern doesn't change turn values). À implémenter `BossAI` data-model :

  ```ts
  type BossAction = { name; target; effect; conditions: BossCondition[] };
  type BossCondition =
    | { type: 'hp-zero'; ignoreTurnOrder: true; result: 'transform' }
    | { type: 'auto'; previousAction: AbilityRef }
    | { type: 'target-status'; status: StatusEffect };
  ```

  À documenter `combat/monster-categories.md` Boss AI canon section. Source: idem.

- [ ] ⭐ **🆕 3 Spell Items 100% drops séquentiels canon ⭐ MAJEUR** — Healing Rain (Caterpillar) + Moon Serenade (Pupa) + Sun Rhapsody (Imago). Pattern boss multi-part 100% guaranteed drops = farming high-value Disc 4. À documenter `items/consumables.md` (à créer) — Healing Rain + Moon Serenade + Sun Rhapsody entries Spell Items canon. Source: idem.

- [ ] ⭐ **🆕 A-AV status reduction NEW canon ⭐ MAJEUR** — Caterpillar abilities Poison/Stun + Imago Dispiriting "reduced by **A-AV**" (NOT M-AV usual mob pattern). Pattern distinct boss abilities canon vs Minor Enemy abilities M-AV reduction. À investiguer canon distinction A-AV vs M-AV per-ability type. À documenter `combat/status-effects.md` (à créer) per-ability reduction modifier matrix canon. Implémenter `StatusReductionModifier = 'A-AV' | 'M-AV'` data-model per-ability. Source: idem.

- [ ] ⭐ **🆕 Dark Vapor RNG 1/101 (~0.99%) code calling 0-100 NEW canon ⭐ MAJEUR** — Imago Dispiriting 99.01% listed mais code RNG 0-100 inclusive (101 values) = 1/101 chance fail. Pattern technical canon Damia. Cohérent Trivia : Ghost Commander Skull Projection + Kamuy Howl same RNG pattern. À documenter `combat/rng-mechanics.md` (à créer) canon RNG 0-100 inclusive multi-boss pattern. Implémenter RNG status proc 0-100 inclusive Damia. Source: idem.

- [ ] ⭐ **🆕 Can't Combat Instant Death ability boss canon NEW ⭐ MAJEUR** — Name same canon "Can't Combat Weapons" (Gladius/Brass Knuckle/Indora's Axe). Imago boss ability variant : trigger only Dispirited target + Auto next turn. **Pattern boss combo canon** : Dark Vapor → Auto Can't Combat = setup Instant Death sequence. Strategy player : prevent Dispirited status → prevent Can't Combat. Cohérent canon Erase mechanic existing (Basilisk immune Can't Combat Weapons). À implémenter ability `cantCombat` Damia avec conditions Dispirited + Auto. Source: idem.

- [ ] **🆕 Pupa "Writhe" useless turn canon NEW ⭐** — "Does nothing" pattern boss filler turn cocoon state thematic. À implémenter ability `noop` Damia pour boss filler turns. Pattern multi-form boss intermediate state pattern. Source: idem.

- [ ] **🆕 Imago "Laser" Light-elemental NEW canon ⭐** — Non-Elemental boss BUT Light-elemental ability. Pattern boss flex element abilities canon (cohérent Divine Dragon "Non-Elemental tag but spells regular elements" existing). Implication player : Darkness Rose Dragoon strong vs Light ability. Source: idem.

- [ ] **🆕 Pupa Counter 0 NEW canon ⭐** — Pupa = "Counters Additions? No" (vs Caterpillar/Imago Counter 28). Pattern boss intermediate form Counter 0. Pattern multi-form boss canon : intermediate state = no counter mechanic. À cross-référence autres multi-form bosses canon (Virage Body pieces, Polter Helm/Armor/Sword) si même pattern. Source: idem.

- [ ] **🆕 HP total Caterpillar reconcilation** ⚠️ — Existing `locations/Divine Tree.md` mention "~29,600 HP total" canon. Wiki tier 2 ingestion : 6k + 2.5k + 12k = **20.5k** US / ~25.6k JP. ⚠️ Divergence ~9k vs locations Damia. À investiguer : possible older Damia data différent OR fandom JP variant other. Source: comparaison.

- [ ] **🆕 Caterpillar = Virage subset canon ?** — Cohérent story Disc 4 Divine Tree : Moon falls onto Divine Tree → Virage swarm crawls out. Caterpillar = Divine Tree boss vs Virage subset ? À investiguer canon classification (cohérent `locations/Divine Tree.md` 108 species lore). Source: idem.

- [ ] **🆕 Healing Rain / Moon Serenade / Sun Rhapsody Spell Items canon ⭐** — 3 Caterpillar boss drops. À documenter `items/consumables.md` (à créer) :
  - **Healing Rain** : Spell Item healing-AoE probable
  - **Moon Serenade** : Spell Item lunar-themed (cohérent Lucky Jar drop Moon Serenade canon)
  - **Sun Rhapsody** : Spell Item solar-themed
    À investiguer effects précis fandom + items wiki ingestion future. Source: idem.

- [ ] **🆕 "Scripted + Escape 0%" boss combat lock-in canon ⭐** — Pattern boss canon cohérent fandom Bosses master "Escape cannot be used". Caterpillar = first explicit boss documentation Escape 0% canon Damia. Source: idem.

### Bosses / Caterpillar fandom complement — Imago naming + Rose "unawakened fruit + subspecies of insect" lore MAJEUR + Imago Harlequin appearance + 4 fandom canon ability names + stats divergences

- [ ] **🆕 Naming canon Caterpillar vs Imago primary** — Wiki primary "Caterpillar" (first form) / Fandom page name "Imago" (final form). Damia adopt **Caterpillar primary boss name canonical** (first encountered + EXP/Gold attribué). "Imago" = final form name canonical. Source: [`features/bosses/_sources/fandom-caterpillar.md`](features/bosses/_sources/fandom-caterpillar.md).

- [ ] ⭐ **🆕 Rose dialogue "unawakened fruit + subspecies of insect" canon NEW MAJEUR ⭐⭐** — Rose recognizes Imago canon. Pattern lore Disc 4 : Divine Tree harbors **awakened (108 TLoD species)** + **unawakened fruits** potential additional species. Caterpillar = potential 109th+ species canon (= insect-derived subspecies). Cohérent existing `locations/Divine Tree.md` 108 fruits = 108 species lore + Virage 108th fruit Moon That Never Sets. À documenter `lore/divine-tree.md` (à créer) + cross-référence `locations/Divine Tree.md` lore reveal Disc 4. Source: idem.

- [ ] **🆕 Story canon Kongol's landing wakes Caterpillar ⭐** — Giganto stomp impact shakes Imago/Caterpillar from slumber. Pattern narrative trigger boss fight Disc 4 Divine Tree. Caterpillar "crawls off-screen, later confronts team". À refléter cutscene scripted Damia. Source: idem.

- [ ] ⭐ **🆕 Imago Harlequin/Jester humanoid appearance canon MAJEUR ⭐** — "Transparent luminescent red + yellow tinted wings matching main body color scheme + head antennas + regular hands". Pattern thematic "insect adult humanoid Harlequin jester" canon — distinctive design Disc 4 boss. À refléter sprite design Damia. Source: idem.

- [ ] **🆕 Caterpillar "eccentric tentacle-like tails" appearance canon** — Cohérent wiki ~Tentacle Whip ability. À refléter visual sprite Caterpillar form 1. Source: idem.

- [ ] **🆕 Pupa "floats in mid air + wriggles" canon + "foreshadowing of another boss to come"** — Pattern intermediate cocoon state thematic + narrative tension build. Cohérent wiki ~Writhe "does nothing". Source: idem.

- [ ] ⭐ **🆕 4 Imago abilities fandom canon names NEW ⭐ MAJEUR** :
  - **Infight** (= wiki ~Pickup Slash) — hover + grab head antennas + smack 2-3× + jump away
  - **High Output Laser** (= wiki ~Laser) — beam of energy Light-magic
  - **Smoke of Despair** (= wiki ~Dark Vapor) — hover + flap wings
  - **Triangle Death** (= wiki Can't Combat) — blue triangle + capture + slam ground ⭐
    Adopter fandom canon names officiels (vs wiki ~ approximations). À implémenter ability names Damia. Source: idem.

- [ ] ⭐ **🆕 Can't Combat vs Triangle Death dual-naming canon NEW ⭐** — Wiki "Can't Combat" (ability mechanic ID, ties weapons canon) / Fandom "Triangle Death" (visual descriptor — blue triangle + slam ground). **Both valid canon names probable** — pattern dual-naming canon (mechanic ID + visual descriptor). Damia conserve both pour data-model :

  ```ts
  type Ability = { mechanicId: string; visualName?: string; ... };
  // Caterpillar Imago : { mechanicId: 'cantCombat', visualName: 'Triangle Death', ... }
  ```

  Source: idem.

- [ ] **🆕 Smoke of Despair effects divergence wiki vs fandom ⚠️** — Wiki "~99.01% Dispiriting only" / Fandom "stun OR poison OR dispirit" (3 effects probable). Wiki tier 2 prévaut Dispiriting-only canon Damia ? OR fandom 3-effects accurate ? À investiguer Discord/Wulves source tier 1. Source: idem.

- [ ] **🆕 Stats divergences Caterpillar wiki vs fandom ⚠️** :
  - Caterpillar AT : wiki 110 vs fandom **140** (+27%) — fandom higher
  - Imago AT : wiki 100 vs fandom **140** (+40%) ⚠️ MAJOR
  - MAT all forms : wiki 92/92/134 vs fandom **103/103/150** (+12%) recurrent
  - DF/MDF/SPD match
    → Damia adopt fandom higher probable (JP closer). OR wiki tier 2 prévaut. Source: comparaison.

- [ ] **🆕 "Moon That Never Sets lays within heart of Divine Tree" canon confirmation** — Cohérent existing `locations/Divine Tree.md` lore. Pattern Divine Tree = vessel Moon That Never Sets (Virage 108th fruit + Crystal Sphere). Caterpillar boss = pre-Moon access fight canon. À cross-référer lore. Source: idem.

- [ ] **🆕 "Subspecies of insect" Imago lineage canon** — Rose dialogue indique Imago = derived insect species. Pattern Divine Tree harbours **awakened (108 TLoD species canon)** + **unawakened fruits potential subspecies**. À investiguer lore "subspecies" canon + 108 species roster détaillé. Source: idem.

### Bosses / Claire (Possessed boss Disc 4 Moon That Never Sets — Haschel's daughter — Multi-entity boss pattern récurrent + Unslayable + Alternate Win Condition dialogue + Four-Gods-Destruction reduce-to-1 + Untargetable)

- [ ] **🆕 Claire boss canon dual-entity Moon Disc 4 ⭐ MAJEUR** — Haschel's daughter possessed. **Claire (Possessed)** + **Claire (Unpossessed)** dual-entity formation 435 submap 611. Thunder element. Stats identical (HP 3200/AT 76/DF 100/MAT 76/MDF 100/SPD 55). À implémenter `bosses/claire.ts` multi-entity data-model. Source: [`features/bosses/_sources/lod-wiki-claire.md`](features/bosses/_sources/lod-wiki-claire.md).

- [ ] ⭐ **🆕 Multi-entity boss fights pattern canon récurrent ⭐ MAJEUR** — Pattern "2+ entities in battle swapped for dialogue/graphical reasons" canon TLoD :
  - **Claire (Disc 4 Moon)** = Possessed + Unpossessed swap
  - **Kamuy (Disc 2 Evergreen Optional)**
  - **Lloyd (Flanvel Tower Disc 3)**
  - **Magician Faust (Real)**
  - **3 Dragon Spirits Mayfil Disc 4** (Feyrbrand/Regole/Divine Dragon Spirits)
  - **Zieg Feld (Disc 4 Moon final)**
    À documenter `combat/multi-entity-bosses.md` (à créer) — pattern technical canon Damia. Data-model `MultiEntityBoss { entities, rewardAttribution }`. Source: idem.

- [ ] ⭐ **🆕 Unslayable boss passive canon NEW MAJEUR ⭐** — Claire Possessed : HP=0 ne tue pas, continue actions. Chance trigger when targeted by attack. Pattern boss "unkillable via damage only" canon. Solution canon = Alternate Win Condition dialogue path. À implémenter `BossPassive { type: 'unslayable'; triggerChance; onTrigger }` data-model. Source: idem.

- [ ] ⭐ **🆕 Alternate Win Condition boss passive canon NEW MAJEUR ⭐⭐** — Claire Possessed defeated via correct dialogue choice during Talk command (NOT damage). Pattern story-canon boss resolution via dialogue. À implémenter `BossWinCondition = 'damage' | 'dialogue' | 'both'` data-model + Talk command player canon. Cohérent thematic Haschel "save daughter via words" canon Disc 4. Source: idem.

- [ ] ⭐ **🆕 Retaliate boss passive canon NEW ⭐** — Claire Possessed HP=0 + targeted → trigger Retaliate Rouge Art. Pattern boss "death attack response" canon. Cohérent existing canon "Ignore Turn Order paired with Retaliate". À implémenter `BossPassive { type: 'retaliate'; trigger: 'hp-zero-targeted'; ability }` data-model. Source: idem.

- [ ] ⭐ **🆕 Untargetable boss passive canon NEW MAJEUR ⭐** — Claire Unpossessed cannot be targeted or take damage. Pattern "graphical entity in battle pour dialogue swap" canon. Cohérent multi-entity boss pattern canon récurrent. À implémenter `BossPassive { type: 'untargetable' }` data-model. Source: idem.

- [ ] ⭐ **🆕 Four-Gods-Destruction ability mechanic canon NEW MAJEUR ⭐⭐** — Claire Possessed ability : **Reduce Target HP to 1** + **Grant target turn out of order** + **Auto Do Nothing next turn**. Pattern boss "near-instakill + extra turn + filler" combo canon. Thematic reference Haschel "Summon 4 Gods" addition canon. À implémenter ability `fourGodsDestruction` Damia avec data-model `AbilityEffect = { type: 'reduce-hp-to-1' } | { type: 'grant-extra-turn'; outOfOrder: true }`. Source: idem.

- [ ] **🆕 ~Talk ability NEW canon MAJEUR ⭐** — Claire Unpossessed breaks possession briefly to speak with Haschel, reverts post-speech. **Trigger conditions** : HP <75% (once) + HP <50% (once) + HP <25% (continuously). Pattern boss "dialogue interjection threshold" canon. Combo player : Talk threshold + Talk command player → correct dialogue → battle ends. À implémenter ability `talk` Damia avec HP-threshold conditions + dialogue trigger. Source: idem.

- [ ] **🆕 Rouge Art canon name (community) Claire** — Possessed Claire physical attack 1× phys single. Pattern thematic possessed "rouge" (red) magic art canon. Fandom canon name à investiguer ingestion future. Source: idem.

- [ ] **🆕 Pattern boss reward attribution multi-entity canon ⭐** — Claire EXP 6,000 attribué Unpossessed entity (Possessed EXP 0). Pattern multi-entity boss : EXP/Gold attribué entity-spécifique. À refléter data-model `MultiEntityBoss.rewardAttribution: { exp: BossEntityRef; gold: BossEntityRef }`. Source: idem.

- [ ] **🆕 Pattern Counter multi-entity boss canon** — Claire Possessed Counter 28 / Unpossessed Counter 0. Pattern cohérent Pupa Counter 0 intermediate forms. Pattern multi-entity boss : main entity Counter standard / graphical entity Counter 0. Source: idem.

- [ ] **🆕 Disc 4 Moon trials structure canon — Claire = Haschel individual trial probable ⭐** — Cohérent Hero Competition pattern + Atlow individual trial. Pattern Moon That Never Sets Disc 4 individual party member trials canon. À investiguer Moon trials full structure (Albert Doel duel existing + Haschel Claire probable + autres ?). Source: idem.

- [ ] **🆕 Correct dialogue Talk Alternate Win Condition canon ⚠️** — Quels choix dialogue précis terminent battle Claire ? À investiguer fandom/script Disc 4 Haschel Claire dialogue tree. Pattern story-canon resolution canon Damia. Source: idem.

### Bosses + NPCs / Claire fandom complement — Identity unified canon Claire = Claire Feld + War God + "Mind's eye awaken!" exact dialogue + Haschel-only target + Melbu Frahma Zieg possession Neet 18y pre-game lore reveal MAJEUR

- [ ] ⭐ **🆕 Identity Claire = Claire Feld unified canon NEW MAJEUR ⭐⭐⭐** — Strong evidence canon : Claire (Haschel's daughter) = Claire Feld (Dart's mother + Zieg's wife). 3 fandom pages = 1 personnage unified canon. **Dart = Haschel's grandson canon** (strongly hinted, NOT directly confirmed in-game). Evidence list canon :
  1. Lullaby = Shana's Theme canon (Claire composed + Dart knew childhood)
  2. Claire Bridge Fletz Disc 2 reveal
  3. Haschel "she doesn't know about [me] yet" Moon Disc 4
  4. Piano Moon Hotel reaction Haschel + Dart
  5. "You look just like me when I was younger" Haschel to Dart pre-final
  6. Timeline : 25y Claire ran away + Dart 23y old → Claire met Zieg ~2y post-Rouge
     À implémenter unified NPC `npcs/Claire.md` (créé) + cross-reference `bosses/Claire.md`. Source: [`features/npcs/_sources/fandom-claire-lore.md`](features/npcs/_sources/fandom-claire-lore.md).

- [ ] ⭐ **🆕 "War God" boss possession canon NEW MAJEUR ⭐** — Claire (Boss) Disc 4 Moon possessed by **War God** (specific divine entity, NOT just "demon"). Pattern thematic Haschel "Summon 4 Gods" addition + Four-Gods-Destruction naming connect. War God vs Haschel canon : 4 Gods = Haschel's power ↔ War God possession Claire = corrupt aspect. À documenter `lore/war-god.md` (à créer) — possible single deity OR among 4 Gods Haschel canon. Source: [`features/bosses/_sources/fandom-claire-boss.md`](features/bosses/_sources/fandom-claire-boss.md).

- [ ] ⭐ **🆕 "Mind's eye awaken!" exact correct dialogue canon NEW MAJEUR ⭐** — Alternate Win Condition specific trigger : player Talk command Claire → choose "Mind's eye awaken!" → battle ends + frees Claire from War God. À implémenter dialogue tree boss Claire Damia. Pattern story-canon resolution canon récurrent ? À cross-check autres bosses Alternate Win Condition dialogue choices. Source: idem.

- [ ] ⭐ **🆕 Four-Gods-Destruction targets HASCHEL ONLY canon NEW ⭐** — Wiki "Single target" générique vs fandom "Haschel only" précisé. Pattern story-canon ability target spécifique (daughter attacks father thematic canon). À implémenter target-specific ability data-model : `{ target: 'haschel-only' }` boss ability canon. Source: idem.

- [ ] ⭐ **🆕 Lullaby = Shana's Theme canon NEW MAJEUR ⭐⭐** — 27y pre-game Claire teenage composed lullaby for future child. Shana's Theme = music box-like rearrangement of Claire's lullaby canon. Furni Disc 3 reveal mechanism : Shana sings to Fa (mayor's child) → Haschel recognizes Claire's tune → Dart knew childhood → trigger Haschel awareness Dart connection. À refléter music canon Damia : Shana's Theme = Claire's lullaby thematic reuse. Source: idem.

- [ ] ⭐ **🆕 Melbu Frahma possession Zieg via Dragoon Spirit canon NEW MAJEUR ⭐⭐ MAJEUR** — 11,000 years ago Zieg destroyed Melbu's body end Dragon Campaign canon → Melbu transferred soul into Red-Eye Dragoon Spirit → sealed soul awaited reactivation. **Neet 18y pre-game** : Zieg used Dragoon Spirit → Melbu set free → took over Zieg's body. Pattern canon : Zieg final antagonist Disc 4 = Melbu possessed Zieg. À documenter `lore/melbu-frahma-zieg-possession.md` (à créer) + cross-référer `bosses/Zieg Feld.md` (à créer) + `bosses/Melbu Frahma.md` (à créer). Source: idem.

- [ ] ⭐ **🆕 Claire Feld Neet death canon — 3 possibilités MAJEUR ⭐** — Cause Claire Feld's death Neet 18y pre-game ambiguous canon :
  1. **Fire** (Neet burning)
  2. **Black Monster attack** directly
  3. **Zieg under Melbu's control** ⭐ tragic implication (potential filicide via possessed husband)
     Pattern thematic dark ambiguity canon — game does NOT reveal exact cause. À documenter `lore/neet-tragedy.md` (à créer) — 3 hypothesis canon list. Source: idem.

- [ ] ⭐ **🆕 Claire's soul Mayfil canon implied MAJEUR ⭐** — Disc 4 Death City Mayfil possible encounter Dart with Claire Feld's soul. Bright light → soul familiar + warm. Dart quote canon : "We will stop dad" (Dart aware Zieg-Melbu connection). Soul heals entire party + becomes **healing point** (gameplay mechanic). Pattern thematic "mother's soul aids son" canon Disc 4. À documenter `locations/Mayfil.md` (à créer) + cross-référer healing point gameplay canon. Source: idem.

- [ ] **🆕 Lotta NPC canon NEW ⭐** — Rouge School fellow martial artist + Claire's sparring partner. 25y pre-game incident : Lotta seriously injured/killed by Claire after Haschel criticism trigger. Fate canon (survived ? died ?) à investiguer. À documenter `npcs/Lotta.md` (à créer) — sparring incident catalyst canon. Source: idem.

- [ ] **🆕 Timeline canon Claire unified ⭐** :
  - 27y pre-game : Claire teenage composed lullaby
  - 25y pre-game : Lotta sparring incident → ran away Rouge
  - ~24-23y pre-game : Met Zieg + Dart born
  - 20y pre-game : Haschel started pursuit (5y gap unexplained)
  - 18y pre-game : Black Monster Neet → Claire Feld dies
  - Disc 4 : younger Claire boss + Mayfil soul possibly meets Dart
    À documenter `lore/claire-timeline.md` (à créer) — unified timeline canon. Source: idem.

- [ ] **🆕 Pattern boss "Alternate Win Condition specific dialogue" récurrent canon ?** — Claire = "Mind's eye awaken!" exact answer. À cross-check autres bosses dialogue resolution canon TLoD. Pattern story-canon boss alternate path resolution canon récurrent ? Source: idem.

- [ ] **🆕 5-year Haschel delay canon unexplained ⚠️** — Claire ran away 25y pre-game / Haschel pursued 20y (per quote). Gap 5y unexplained. Possible interpretations : Haschel hesitated 5y / Haschel pursued differently / quote 20y approximation. À investiguer Discord/Wulves canon. Source: idem.

- [ ] **🆕 Dart age 5 Neet canon ⭐** — Confirmed Dart 23y old (Official Guidebook) + Neet tragedy 18y pre-game = Dart age 5 at tragedy. Wandered ruins alone, found Red-Eye Dragoon Spirit from Zieg → inheritance canon. À cross-référer `party-members/Dart Feld.md` (à créer) backstory. Source: idem.

- [ ] **🆕 Stats divergences Claire wiki vs fandom ⚠️** :
  - P. Attack : wiki 76 vs fandom **86** (+13%) — fandom higher
  - M. Attack : wiki 76 vs fandom **86** (+13%) idem
    → Damia adopt fandom higher probable JP closer. Source: comparaison.

### Bosses / Commander (Dual-classification Boss Seles + Minor Marshland Disc 1 — Power Up boss mechanic NEW + HP recovers + Instant Death Immunity Mob passive + Attack Ball drop confirme Spell Item canon + Escape 100% Mob NEW)

- [ ] ⭐ **🆕 Dual-classification Commander canon MAJEUR ⭐** — Same NPC role/title, different encounter context determines classification : **Commander (Seles) = Boss** (Counter 0, all 8 ✔, Power Up) / **Commander (Marshland) = Minor Enemy** (Counter 28, 4/4, Instant Death Immunity). Pattern unique TLoD canon NPC dual-role. À implémenter `EnemyType` per-encounter context Damia. Source: [`features/bosses/_sources/lod-wiki-commander.md`](features/bosses/_sources/lod-wiki-commander.md).

- [ ] ⭐ **🆕 Power Up boss mechanic canon NEW MAJEUR ⭐** — Self-buff Auto Single-use : disables Sword Slash + enables Slash Twice + Burn Out 1.2× → 1.5× + Ignore Turn Order uses Slash Twice immediately. Trigger : Knights of Sandora defeated (story-canon). Pattern boss "ability transformation buff" canon. À implémenter `BossAbility { type: 'power-up'; disables; enables; modifies; postAction; ignoreTurnOrder }` data-model. ⚠️ Trivia : Commander's Power Up = ability enable (NOT Power modifier buff like standard Power Up canon) — pattern variants distincts canon. Source: idem.

- [ ] ⭐ **🆕 HP recovers boss self-heal canon NEW ⭐** — Commander Seles : restores 30% (4) HP trigger HP < 51%. Pattern boss self-heal canon Disc 1. À implémenter `BossAbility { type: 'self-heal'; healPercent: 0.30; trigger: { hpBelow: 0.51 } }` data-model. Source: idem.

- [ ] ⭐ **🆕 Instant Death Immunity Minor Enemy passive canon NEW MAJEUR ⭐** — Commander Marshland immune to Instant Death-proc (Can't Combat Weapons : Gladius / Brass Knuckle / Indora's Axe). Pattern Minor Enemy with passive canon (rare). Pattern thematic "officer rank higher tier immunity" canon. Cohérent canon Erase mechanic (Basilisk immune Total Vanishing / Demon's Gate / Can't Combat Weapons). À implémenter `MobPassive { type: 'instant-death-immunity' }` data-model. Source: idem.

- [ ] ⭐ **🆕 Attack Ball 100% drop Commander Marshland confirme Spell Item canon ⭐** — Pattern Spell Item drop 100% boss-like sur Mob. Cohérent Bowling Snowfield Attack Ball drop pattern. Confirme **Attack Ball = Spell Item canon classification**. À documenter `items/consumables.md` (à créer) Attack Ball entry précis effect canon Fire/Magic ?. Source: idem.

- [ ] ⭐ **🆕 Escape 100% Mob Commander Marshland canon NEW ⭐** — Minor Enemy escapable 100% (vs 30%/90% standard). Pattern thematic "scripted encounter player can flee" canon (cohérent Blue Bird Rare Monster Escape 100% pattern). À refléter spawn rules Damia canon flexible escape per-encounter. Source: idem.

- [ ] **🆕 Burn Out 1.2× → 1.5× Fire-magic boss ability canon** — Boss Seles ability. Burn Out = canon name officiel (NOT ~ approximation) Fire-elemental magic 1.2× damage default → 1.5× post-Power Up. Pattern Attack Multiplier per-ability canon (cohérent `combat/damage-formula.md`). À implémenter ability `burnOut` Damia avec multiplier dynamic. **Burn Out = ability name shared with item drop canon** (cohérent pattern Spinning Gale Canbria Dayfly + autres). Source: idem.

- [ ] **🆕 Stunning Hammer canon name officiel Commander Marshland ⭐** — Mob ability 100% Stun-inflict single target. M-AV reduces chance (standard mob pattern). À implémenter ability `stunningHammer` Damia. Source: idem.

- [ ] **🆕 Stats divergence Commander Marshland wiki page vs wiki Bosses master ⚠️** — Page HP 128 vs Bosses master HP 132. Minor stats discrepancy à reconcilier. À investiguer Discord/Wulves source tier 1. Source: comparaison.

- [ ] **🆕 Pattern boss self-modifier abilities canon ⭐** — Commander Power Up vs standard Power Up canon distinction : Power modifier buff (standard) vs ability enable (Commander variant). À documenter `combat/damage-modifiers.md` (à créer) — Power Up canon variants distincts. Pattern boss-specific mechanic variants canon. Source: idem.

- [ ] **🆕 Visual canon Commander idle stance change Power Up ⭐** — Sprite/animation canon change post-Power Up. À refléter visual design Damia (idle animation transition canon). Source: idem.

- [ ] **🆕 "Knights of Sandora defeated" story-canon Power Up trigger ⭐** — Boss Seles Power Up Auto trigger = when all Knights defeated party. Pattern story-canon condition trigger boss ability canon (cohérent Hero Competition + autres scripted events). À implémenter `BossCondition { type: 'allies-defeated' }` data-model. Source: idem.

### Bosses / Commander fandom complement — JP name + appearance canon + Seventh Fort + Great Commander NPC + fandom canon ability names + Potion = Healing Potion item + stats/drops divergences

- [ ] **🆕 Commander JP name 小隊長 (Kotaichō) "Squad/Platoon Leader" canon ⭐** — Imperial Sandora military rank canon. Pattern lore military hierarchy : Commander (Squad Leader) < Great Commander < Emperor Doel. À refléter localization Damia. Source: [`features/bosses/_sources/fandom-commander.md`](features/bosses/_sources/fandom-commander.md).

- [ ] **🆕 HP JP +1 unit minimal stats pattern Commander Seles ⭐** — HP 14 US → 15 JP. Pattern minimal stats +1 unit canon (NOT +25% standard ; cohérent Berserk Mouse HP 2 → 4 = +100% car arrondi minimal stats sensitivity). À documenter `combat/jp-vs-us-stats.md` (à créer) pattern minimal stats +1 unit canon. Source: idem.

- [ ] ⭐ **🆕 Commander appearance canon ⭐** — Visual design 2 color schemes :
  - **Seles** : red trim armor + large red cape + black sword
  - **Marshland Seventh Fort** : blue trim + cape + silver sword
    Pattern thematic color schemes per-location canon. À refléter sprite design Damia. Source: idem.

- [ ] ⭐ **🆕 Seventh Fort location canon NEW ⭐** — Marshland Commander = **Seventh Fort** canon name (Imperial Sandora military base). À documenter `locations/Seventh Fort.md` (à créer) — Marshland sub-area Imperial military base canon. Cohérent existing locations Damia Marshland generic. Source: idem.

- [ ] ⭐ **🆕 Great Commander of Sandora NPC canon NEW MAJEUR ⭐** — Distinct NPC met later (Shana arrest probable canon) — "more bulky armor" similar Commander appearance. Pattern Imperial Sandora hierarchy : Commander (Squad Leader) < Great Commander. À documenter `npcs/Great Commander.md` (à créer) — Shana arrest scene NPC canon. Source: idem.

- [ ] ⭐ **🆕 Sandora Soldiers "run away upon killing one" canon NEW ⭐** — Pattern soldiers flee mid-fight si un kill. Pattern AI mob escape mechanic (cohérent Berserk Mouse Run away! pattern). À implémenter AI mob "flee on partner death" data-model Damia. Source: idem.

- [ ] ⭐ **🆕 Potion ability = Boss uses Healing Potion canonically NEW MAJEUR ⭐** — Wiki "HP recovers 30% (4) HP" générique = Fandom précise : **Boss uses Healing Potion item canonically** (4 HP = standard Healing Potion canon). Pattern boss-uses-inventory-items canon. À implémenter `BossAbility { type: 'use-item'; item: ItemRef }` data-model Damia. Pattern boss canon récurrent (autres bosses utilise items ?). Source: idem.

- [ ] ⭐ **🆕 Fandom canon ability names Commander Seles + Marshland ⭐** :
  - **Seles** : **Sword** (= wiki ~Sword Slash) / **Double Strike** (= wiki ~Slash Twice) / **Potion** (= wiki "HP recovers")
  - **Marshland** : **Slash** (= wiki ~Sword Slash mob) / **Double Slash** (= wiki ~Multi Slash) / Stunning Hammer confirmed
    Adopter fandom canon names officiels (vs wiki ~ community approximations). À implémenter abilities Damia. Pattern naming Seles vs Marshland canon : Sword/Slash + Double Strike/Double Slash = similar but distinct canon names. Source: idem.

- [ ] **🆕 EXP/Gold divergences Commander Seles wiki vs fandom ⚠️** :
  - EXP : wiki **20** vs fandom **24** (+20%)
  - Gold : wiki **20** vs fandom **26** (+30%)
    → Pattern fandom higher recurrent (probable JP closer). Source: comparaison.

- [ ] ⚠️ **🆕 Drops divergence Marshland wiki vs fandom MAJEUR** — Wiki tier 2 "Attack Ball 100%" Marshland mob drop / Fandom infobox "Burn Out + 2× Healing Potion 100%" combined. Wiki tier 2 prévaut canonical Damia probable. Possible : 2× Healing Potion = Seles Boss secondary drop OR Marshland fandom revised. À investiguer Discord/Wulves source tier 1. Source: comparaison.

- [ ] ⚠️ **🆕 Commander Marshland classification "Scripted" wiki vs "Optional Seventh Fort" fandom DIVERGENCE** — Wiki "Scripted" (Required) / Fandom "optional Seventh Fort". Possible : Seventh Fort visit optional but encounter scripted ONCE if visited. Damia clarification needed. Source: comparaison.

- [ ] ⚠️ **🆕 Soldier rank naming wiki vs fandom canon ⚠️** — Wiki Boss Seles formation "Knight of Sandora" / Fandom "Sandoran Soldier". Possible distinct entities canon (Knights vs Soldiers ranks Sandora military) OR fandom imprécis. À investiguer : Knights of Sandora canon mob existing TODO. Source: comparaison.

- [ ] **🆕 "First minor boss TLoD" + "2nd fight entire game" canon ⭐** — Commander Seles = first minor boss + 2nd fight entire game canon. Quel est le 1er fight canon ? Probable Hellena Prison tutorial Lavitz aide OR Sandora Soldiers tutorial pre-Commander. À investiguer Disc 1 opening sequence canon. Source: idem.

### Bosses / Crafty Thief (Dual-classification Boss Extras Barrens + Minor Home of Giganto — CONFIRME Boss Extras canonical 4th category + Magic Sig Stone Vulnerability + 50G Stolen! + Bastard Sword drop + A-AV 5%)

- [ ] ⭐ **🆕 Boss Extras canonical 4th category CONFIRMED canon MAJEUR ⭐⭐** — Crafty Thief (Barrens with Mappi) wiki tier 2 EXPLICIT note : "not Minor Enemies, and instead categorized as Boss Extras". CONFIRME Boss Extras = canonical 4th category distinct TLoD (cohérent existing `combat/monster-categories.md` taxonomy). Pattern wiki tier 2 prévaut fandom umbrella interpretation "minions = bosses". À documenter `combat/monster-categories.md` (déjà ajusté) — Boss Extras characteristics canon : companion to main boss / Status all 8 ✔ / EXP 0 / Counter 28 / passives spécifiques possibles. Source: [`features/bosses/_sources/lod-wiki-crafty-thief.md`](features/bosses/_sources/lod-wiki-crafty-thief.md).

- [ ] **🆕 Crafty Thief dual-classification canon ⭐** — **Boss Extras (Barrens with Mappi)** : HP 320, Counter 28, all 8 ✔, Magic Sig Stone Vulnerability passive / **Minor Enemy (Home of Giganto Gehrich Gang)** : HP 200, Counter 28, 4/4 standard, 50G Stolen! ability. Pattern same NPC role different encounter context. À implémenter `bosses/crafty-thief.ts` data-model dual entries. Source: idem.

- [ ] ⭐ **🆕 Magic Sig Stone Vulnerability passive Boss Extras canon NEW MAJEUR ⭐** — Crafty Thief Barrens Boss Extras "Is affected by Magic Stone of Signet". Cohérent existing **Magical Stone of Signet** canon (Blue Bird Rare Monster strategy fandom reveal). Pattern Boss Extras can have specific item vulnerabilities canon. À documenter `items/key-items.md` (à créer) Magic Stone of Signet item entry + effect canon précis (Time Stop ? Status ? Damage modifier ?). À implémenter `BossPassive { type: 'item-vulnerability'; item: ItemRef }` data-model. Source: idem.

- [ ] ⭐ **🆕 50G Stolen! gold-steal ability canon NEW MAJEUR ⭐⭐** — Crafty Thief Home of Giganto ≤50% HP : Removes 50G from player + post-use switches to **Cut with Knife** ability. Pattern thief mob steal mechanic canon. À implémenter `MobAbility { type: 'gold-steal'; amount: 50; postAction: 'cutWithKnife'; cannotRecover: true }` data-model Damia. Pattern boss/mob "ability one-shot then replacement" canon (cohérent Commander Power Up + Caterpillar Transform). Source: idem.

- [ ] ⭐ **🆕 Bastard Sword drop compensation canon NEW MAJEUR ⭐** — Crafty Thief defeated drops Bastard Sword (30G sell value) — pattern thief compensation canon. "Defeating Crafty Thief does NOT return 50G" canon → player net loss -20G (-50G stolen + 30G sword). À documenter `items/equipment.md` Bastard Sword entry Dart sword weapon canon + 30G value. À implémenter "thief compensation" mechanic Damia. Source: idem.

- [ ] **🆕 Cut with Knife post-50G Stolen! ability replacement canon ⭐** — Pattern boss/mob "ability one-shot then replacement" canon (cohérent Commander Power Up). À implémenter `Ability { type: 'replacement-trigger'; originalAbility: AbilityRef; replacement: AbilityRef; trigger: 'post-use' }` data-model. Source: idem.

- [ ] **🆕 A-AV 5% NEW canon Boss Extras + Mob ⭐** — Crafty Thief A-AV 5% both forms. First A-AV 5% ingestion canon Damia (vs Canbria Dayfly 10%, Blue Bird 50%). Pattern thematic "thief evasion" canon. Pattern A-AV tier mapping canon Damia : 0% / 5% / 10% / 50% (Rare Monster). À cross-check autres entities A-AV 5% canon. Source: idem.

- [ ] **🆕 Pellet item drop canon NEW ⭐** — Crafty Thief Boss Extras + Mob drop Pellet 8%. Probable Spell Item OR consumable. À documenter `items/consumables.md` (à créer) Pellet entry — investiguer effect canon précis. Source: idem.

- [ ] **🆕 Run away! canon récurrent multi-mob shared confirmed ⭐** — Crafty Thief Home of Giganto Mob has Run away! ability (cohérent Berserk Mouse + Blue Bird Rare Monster Run away! canon). Pattern AI mob self-escape mechanic shared canon : Berserk Mouse + Blue Bird (Rare) + **Crafty Thief (Mob)** = 3 entities confirmed canon. À implémenter shared `MobAbility { type: 'run-away'; selfRemoval: true; noReward: true }` data-model. Source: idem.

- [ ] **🆕 Stats divergence Boss Extras vs Mob Crafty Thief canon ⚠️** — Boss Extras HP 320 / Mob HP 200 (Mob LOWER) + Boss Extras AT 28 / Mob AT 30 (Mob slightly higher) + Boss Extras SPD 70 / Mob SPD 80. Pattern Boss Extras tanky / Mob fast offensive canon. À refléter data-model per-classification stats. Source: idem.

- [ ] **🆕 Formation 475 Gangster partner Crafty Thief Home of Giganto ⭐** — Scripted encounter Crafty Thief ×2 + Gangster boss (cohérent existing Bosses master Gangster Home of Gigantos NEW canon fandom). À documenter `bosses/Gangster.md` (à créer) — Gehrich Gang boss canon Home of Giganto. Source: idem.

- [ ] **🆕 Contact (arrows) Home of Giganto canon pattern récurrent** — Cohérent Berserker Contact arrows canon (Gehrich Gang hideout arrow traps). Pattern Death Frontier visible-mob distinct Home of Giganto arrows-traps. Source: idem.

- [ ] **🆕 Gehrich Gang faction expanded canon ⭐** — Gehrich Gang Home of Giganto members canon : Berserker + Piggy + **Crafty Thief** + **Gangster** + (Mappi cross-Barrens) + Gehrich (leader). Pattern faction roster expanding canon. À documenter `lore/gehrich-gang.md` (à créer) — faction lore canon. Source: idem.

### Bosses / Crafty Thief fandom complement — JP name + GLITCH canon documented + fandom canon ability names (Quick Knife/Gimme yr' gold!/Escape) + Pellet Spell Item purchasable 10G NEW + Counter quite often + Inventory 255 cap NEW

- [ ] **🆕 Crafty Thief JP name クラフティシーフ (Kurafuti Shīfu) canon ⭐** — Direct translit "Crafty Thief". Pattern thief-themed mob naming canon. Source: [`features/bosses/_sources/fandom-crafty-thief.md`](features/bosses/_sources/fandom-crafty-thief.md).

- [ ] ⚠️ **🆕 GLITCH canon documenté MAJEUR ⭐⭐** — Fandom documents : "When a Crafty Thief steals 50 gold from you, you may find you do NOT in fact receive said gold back as the text would have you believe. You will instead receive a Bastard Sword". **Pattern thief mob bug-feature canon** : game text suggests "get it back" but actually gives Bastard Sword. Wiki documents as canon mechanic, fandom reveals as **glitch**. À investiguer Damia : implémenter as canon mechanic (Bastard Sword compensation canon) OR canonical bug-feature reproduction ? À documenter `combat/glitches.md` (à créer) — canonical glitches TLoD canon (Crafty Thief Bastard Sword + autres possibles). Source: idem.

- [ ] ⭐ **🆕 Fandom canon ability names Crafty Thief ⭐ MAJEUR** :
  - **Quick Knife** (= wiki ~Cut community) — adopter fandom canon
  - **Gimme yr' gold!** (= wiki "50G Stolen!" community) — adopter fandom canon NEW MAJEUR (casual narrative-style name preserved canonical)
  - **Escape** (= wiki "Run away!") — adopter fandom canon récurrent (cohérent Blue Bird Rare Monster Escape canon + Berserk Mouse Run away! same ability)
    À implémenter abilities Damia avec exact names canon. Pattern narrative-style ability name canon (NOT sanitized). Source: idem.

- [ ] ⭐ **🆕 Pellet = "spell item" canon classification + purchasable 10G all shops canon NEW MAJEUR ⭐** — Fandom révèle Pellet = Spell Item canon (cohérent Attack Ball Bowling + Spinning Gale Canbria Dayfly Spell Item pattern). **Cheapest Spell Item canon Damia** (vs Body Purifier 20G). "Not worth farming" — drop 8% inefficient vs shop 10G. À documenter `items/consumables.md` (à créer) Pellet entry — Spell Item 10G shop canon + effect précis à investiguer. Source: idem.

- [ ] **🆕 "Counter quite often" canon Crafty Thief ⭐** — Pattern Counter 28 actively-triggered canon (vs passive Counter tier). Pattern Counter behavior variable per-mob canon. À documenter `combat/additions.md` Counter behavior per-mob trigger frequency canon. Source: idem.

- [ ] ⭐ **🆕 Inventory 255 items cap canon NEW ⭐** — Game item inventory limit 255 items canon. Pattern technical canon Damia : à décider Damia conserve limit 255 OR remove for QoL canon ? À documenter `inventory/inventory-cap.md` (à créer) — canon vs QoL decision. Source: idem.

- [ ] **🆕 Pattern Home of Gigantos farming canon ⭐** — 3 valuable enemies canon : Berserker (Energy Girdle) + Gangster (Bandit's Ring) + Piggy (Sachet). **Crafty Thief = least valuable** (Pellet purchasable). Pattern farming-zone strategy canon : escape Crafty Thief encounters. À refléter `locations/Home of Gigantos.md` (à créer) farming-zone canon + escape strategy canon. Source: idem.

- [ ] **🆕 "Less HP and faster" Mob Home of Gigantos transition canon ⭐** — Confirme dual-classification stats variant : Boss Extras HP 320/SPD 70 → Mob HP 200/SPD 80. Pattern Boss Extras tanky → Mob faster offensive canon. Source: idem.

- [ ] **🆕 "Fork between locations in the Barrens" Mappi fight canon ⭐** — Narrative location canon Disc 2 Barrens. À refléter `locations/Barrens.md` (à créer) Mappi boss fight at fork location canon. Source: idem.

- [ ] **🆕 Stats divergences Crafty Thief wiki vs fandom ⚠️** :
  - P. Attack : wiki 30 vs fandom **36** (+20%)
  - M. Attack : wiki 27 vs fandom **31** (+15%)
    → Pattern fandom higher recurrent (probable JP closer). Source: comparaison.

- [ ] **🆕 Encounter rate Very common Crafty Thief canon** — Cohérent Disc 3-4 mobs Very common pattern. Source: idem.

- [ ] **🆕 "Kill immediately after they steal" exploit canon Crafty Thief ⭐** — Player exploit : let Crafty Thief steal 50G → kill immediately → get Bastard Sword (30G value but stackable). Pattern thief mob exploit canon. À refléter mechanic Damia avec optional exploit availability. Source: idem.

### Mobs / Crescent Bee (Wind Prairie Disc 1 — A-AV 20% NEW higher tier + Spinning Gale Spell Item drop confirme pattern canon + Recolor of Stinger canon Trivia)

- [ ] **🆕 Crescent Bee canon data-model** — **Wind** element, HP 9 (JP ~11 à confirmer), AT 5, DF 100, MAT 5, MDF 100, SPD 60, **A-AV 20% ⭐ NEW higher tier**, M-AV 0%. Mob Prairie Disc 1 partners Vampire Kiwi + Mantis. À implémenter `mobs/crescent-bee.ts`. Source: [`features/mobs/_sources/lod-wiki-crescent-bee.md`](features/mobs/_sources/lod-wiki-crescent-bee.md).

- [ ] ⭐ **🆕 A-AV 20% NEW higher tier canon MAJEUR ⭐** — Crescent Bee A-AV 20% (vs Crafty Thief 5%, Canbria Dayfly 10%, Blue Bird Rare Monster 50%). Pattern A-AV tier mapping étendu canon Damia : **0% / 5% / 10% / 20% / 50%**. Pattern thematic "flying bee evasive" canon. À documenter `combat/damage-formula.md` A-AV tier mapping canon. À investiguer autres entities A-AV 20% canon. Source: idem.

- [ ] ⭐ **🆕 Spinning Gale Spell Item drop confirme ability + drop shared name pattern canon NEW MAJEUR ⭐⭐** — Crescent Bee drops Spinning Gale Spell Item 8%. **Spinning Gale = Spell Item canon confirmed** (cohérent ability Canbria Dayfly 1.5× Wind magic). **Pattern récurrent canon : ability name = Spell Item drop name** :
  - **Burn Out** : ability Commander Seles + Spell Item drop Commander Seles
  - **Spinning Gale** : ability Canbria Dayfly + Spell Item drop Crescent Bee
    À documenter `items/consumables.md` (à créer) Spinning Gale Spell Item Wind 1.5× magic damage entry. Pattern canon "ability = item" Damia. Source: idem.

- [ ] **🆕 Spinning Gale shared ability cross-mob canon ⭐** — Same canon ability Canbria Dayfly (Disc 4) + Crescent Bee (Disc 1). Pattern Wind insect shared ability canon. À implémenter ability `spinningGale` Damia référence cross-mob. À investiguer autres mobs Wind canon utilisent Spinning Gale. Source: idem.

- [ ] ⭐ **🆕 Recolor of Stinger Barrens canon NEW Trivia ⭐** — Crescent Bee model = recolor of Stinger (Barrens Disc 2 mob). Pattern visual reuse mob TLoD récurrent (cohérent Assassin Cock/Fowl Fighter, Plague Rat/Berserk Mouse, Wyvern/Air Combat). À documenter `mobs/Stinger.md` (à créer) — Barrens Disc 2 mob, Crescent Bee model source canon. Source: idem.

- [ ] **🆕 Vampire Kiwi + Mantis NEW mobs canon Prairie partners ⭐** — Both Prairie Disc 1 mobs canon. À documenter `mobs/Vampire Kiwi.md` + `mobs/Mantis.md` (à créer). Pattern Prairie ecosystem canon Disc 1. Source: idem.

- [ ] ⭐ **🆕 Prairie 3 World Map roads hub canon Disc 1 ⭐** — Prairie = hub Disc 1 transit canon : **Prairie → Intersection** + **Prairie → Forest** + **Prairie → Limestone Cave** roads. Pattern central hub canon (cohérent post-Forest Seles area + pre-Hellena Prison). À documenter `locations/Prairie.md` (à créer) — Disc 1 hub canon + 3 connecting roads canon. Source: idem.

- [ ] **🆕 Escape rate 80% Prairie Disc 1 canon ⭐** — Pattern early Disc 1 escape rate canon (vs Forest 90% / Mountain 30% / Home of Gigantos 40%). Pattern Disc 1 player learning curve canon. À documenter `combat/escape-mechanic.md` (à créer) per-location escape rates canon. Source: idem.

- [ ] **🆕 ~Needle Prick canon name (community) Crescent Bee** — Wiki community approximation > 50% phase ability (1× phys). Pattern thematic "bee stinger" canon. Fandom canon name à investiguer ingestion future. Source: idem.

### Mobs / Crescent Bee fandom complement — Appearance aerial insect canon + "far weaker cousin to Stinger" confirme recolor family + Buzzing Sting canon + Spinning Gale AoE divergence + HP JP 20 EXTRÊME + Hoax magical weakness canon NEW

- [ ] **🆕 Crescent Bee appearance canon MAJEUR ⭐** — "Aerial insect with 2 large wings + massive stinger below" canon. À refléter sprite design Damia : 2-wing bee + stinger (vs Canbria Dayfly 3 pairs wings). Source: [`features/mobs/_sources/fandom-crescent-bee.md`](features/mobs/_sources/fandom-crescent-bee.md).

- [ ] **🆕 "Far weaker cousin to Stinger" canon récurrent confirme Stinger family ⭐** — Crescent Bee Disc 1 weaker + Stinger Disc 2 stronger variant canon. Cohérent existing wiki "recolor of Stinger" Trivia. Pattern recolor mob canon récurrent confirme. À documenter `mobs/Stinger.md` (à créer) — Barrens Disc 2 mob, Crescent Bee family. Source: idem.

- [ ] **🆕 Buzzing Sting canon name officiel (vs wiki ~Needle Prick community) ⭐** — Adopter fandom canon > 50% phase ability. Pattern thematic "bee buzzing sting" cohérent appearance massive stinger canon. Source: idem.

- [ ] ⚠️ **🆕 Spinning Gale target divergence wiki Single vs fandom "all targets" AoE MAJEUR ⚠️** — Wiki tier 2 Single target / Fandom Battle "an attack all spell item" + fandom Drops "attacks only one enemy" (internal inconsistency). Wiki tier 2 prévaut canon Damia Single target probable. Cependant thematic "spinning gale wind storm" suggère AoE canonically. À investiguer Discord/Wulves canon précis. Pattern Spinning Gale targeting canon Spell Item ambiguous. Source: comparaison.

- [ ] ⚠️ **🆕 HP JP 20 EXTRÊME divergence ⚠️ MAJEUR Crescent Bee** — HP US 9 / JP **20** = +122% pattern EXTRÊME (vs +25% standard JP). Pattern minimal stats sensitive scaling (cohérent Berserk Mouse +100% sur HP 2→4, Imago +67% sur 12k→20k). Damia adopt JP 20. À refléter dans `combat/jp-vs-us-stats.md` (à créer) pattern minimal stats extrême variants canon. Source: idem.

- [ ] ⚠️ **🆕 Counterattack divergence wiki vs fandom Crescent Bee ⚠️** — Wiki tier 2 "Counters Additions? Yes" + Counter 28 / Fandom "Can Counterattack: No". Wiki tier 2 prévaut canon Damia Counter 28. Pattern fandom default Yes/No imprécis canon récurrent (cohérent Canbria Dayfly same divergence). Source: comparaison.

- [ ] **🆕 Encounter rate Uncommon Crescent Bee canon ⭐** — Vs Bowling/Canbria Dayfly/Cactus Very common. Pattern Disc 1 encounter rate variability canon. Source: idem.

- [ ] **🆕 Strategy "conserve Spinning Gale for Urobolus boss" canon ⭐** — Urobolus = Earth-element boss Disc 1 Limestone Cave (cohérent existing Bosses master). Wind weakness Earth → Spinning Gale 1.5× damage vs Urobolus. Pattern strategic Spell Item usage canon. À refléter `bosses/Urobolus.md` (à créer) strategy canon section. Source: idem.

- [ ] ⭐ **🆕 "Hoax battles massive weakness to magical attacks regardless of element" canon NEW MAJEUR ⭐** — Hoax location (Disc 1 Sandora Elite + Kongol boss fights) = massive magic vulnerability canon. "Regardless of element" = pattern Hoax mob/boss weakness magic-overall (NOT specific element). Pattern strategic location-specific weakness canon NEW. À documenter `locations/Hoax.md` (à créer) — magical weakness canon. Pattern location-canon weakness profile per-zone. Source: idem.

- [ ] **🆕 Stats divergences Crescent Bee wiki vs fandom ⚠️** :
  - P. Attack : wiki 5 vs fandom **6** (+20%)
  - M. Attack : wiki 5 vs fandom **6** (+20%)
    → Damia adopt fandom 6/6 probable (fandom higher JP closer pattern). Source: comparaison.

### Mobs / Crocodile (Water Marshland Disc 1 — ANOMALY weaker secondary ability canon RARE + Skull Casting canon name + appearance trident-tail/dorsal fin + Pellet 10% farming source canon)

- [ ] **🆕 Crocodile canon data-model** — **Water** element, HP 32, AT 10, **DF 160 high**, MAT 9, **MDF 50 LOW**, SPD 50, A-AV/M-AV 0%. Mob Marshland Disc 1 + road Volcano Villude. Pattern tank physical / weak magic profile canon. À implémenter `mobs/crocodile.ts`. Source: [`features/mobs/_sources/lod-wiki-crocodile.md`](features/mobs/_sources/lod-wiki-crocodile.md).

- [ ] ⭐ **🆕 ANOMALY canon weaker secondary ability Crocodile NEW MAJEUR ⭐⭐** — RARE pattern : Crocodile = mob qui devient OBJECTIVELY WEAKER post HP threshold (Bite 2× phys > 25% → Skull Casting 1× phys ≤ 50%). **OPPOSITE of standard "wounded mob more dangerous" canon TLoD** récurrent (Air Combat/Berserker/Caterpillar All-out Attack 3× phys pattern). Pattern UNIQUE TLoD à investiguer si autres mobs same anomaly. À documenter `combat/mob-ai.md` (à créer) — anomaly pattern canon Crocodile + autres cases. Implémenter `MobAIPhasePattern = 'standard-stronger-on-wound' | 'anomaly-weaker-on-wound'` data-model. Source: idem.

- [ ] ⭐ **🆕 Skull Casting canon name officiel ⭐** — Wiki tier 2 canonical (NOT ~ approximation). 1× phys damage ≤ 50% HP. Pattern thematic "skull casting" — Crocodile defensive retreat ability canon ? À investiguer effect précis + fandom appearance. Source: idem.

- [ ] **🆕 Bite 2× phys high primary canon Crocodile ⭐** — Bite typically 1× phys (cohérent Berserk Mouse / autres). Crocodile Bite **2× phys = rare high primary ability** canon. Pattern primary high damage ability canon. Source: idem.

- [ ] ⭐ **🆕 Appearance canon Crocodile MAJEUR ⭐** — "Large reptile resembling real-world crocodile + **trident-like blades on tail** + **large dorsal fin on back**". Pattern fantasy crocodile modifications canon (aquatic Water theme cohérent). À refléter sprite design Damia : crocodile + trident-blade tail + dorsal fin. Source: idem.

- [ ] **🆕 Pellet 10% drop higher rate canon Crocodile ⭐** — Pattern Pellet drop rate varies per-mob canon : Crocodile 10% (Marshland Disc 1) vs Crafty Thief 8% (Home of Giganto Disc 2). **Crocodile = better Pellet farming source canon Disc 1**. Cohérent existing Pellet = Spell Item purchasable 10G all shops canon. À refléter `items/consumables.md` Pellet farming sources canon. Source: idem.

- [ ] **🆕 Pattern "tank physical / weak magic" canon Crocodile ⭐** — DF 160 high anti-physical + MDF 50 LOW magic-vulnerable + AT/MAT 10/9 balanced. Pattern mob favorise magic player strategy canon (cohérent Beastie Dragon DF 130 pattern). Pattern strategic mob profile canon. Source: idem.

- [ ] **🆕 HP overlap zone 25-50% AI selection ambiguous canon ⚠️ Crocodile** — Phase 1 (HP > 25%) + Phase 2 (HP ≤ 50%) overlap in 25-50% HP zone. Both abilities possible. AI selection canon : random ? Weighted ? À investiguer Discord. Pattern HP overlap zones canon multi-phase mobs. Source: idem.

- [ ] **🆕 Marshland → Volcano Villude road canon Disc 1 ⭐** — Crocodile World Map road. Pattern Disc 1 transit road Fire Bird boss + Wounded Virage area Volcano Villude. À documenter `locations/Marshland.md` (à créer) + `locations/Volcano Villude.md` (à créer). Source: idem.

- [ ] **🆕 Escape rate 60% Marshland Disc 1 canon ⭐** — Between Forest 90% / Prairie 80% early Disc 1 and standard 30%. Pattern Marshland intermediate escape canon Disc 1. Source: idem.

### Mobs / Crocodile fandom complement — Disc 1 highest DF + appearance 4-legs/3-spines + Jaws canon + Skull Casting "3 skulls horror" visual + Magic Stone of Signet "delays 3 turns" REVEALED MAJEUR + Pellet Earth-element NEW + Gushing Magma Fire NEW + Sea Dragon NEW partner mob

- [ ] **🆕 Crocodile JP stats confirmés ⭐** — HP US **33** (vs wiki 32 minor divergence) / JP **40** (+25% pattern) + Gold US 6 / JP **2** (÷3). Damia adopt JP 40/2. Cohérent décision projet adopt JP. Stats divergences fandom +20-22% AT/MAT. Source: [`features/mobs/_sources/fandom-crocodile.md`](features/mobs/_sources/fandom-crocodile.md).

- [ ] **🆕 "Disc 1 highest DF mob" + "Marshland's most powerful enemy" canon ⭐** — Crocodile DF 160 = Disc 1 highest mob canon. Pattern Disc 1 mob ranking canon. À cross-référer autres Disc 1 mobs DF stats canon. Source: idem.

- [ ] **🆕 Appearance canon Crocodile MAJEUR ⭐** :
  - 4 legs near stomach + Red eyes + 3 massive claws tail-tip + **3 spines on back** + Green scaly skin + Lengthy teeth
  - ⚠️ **Visual divergence wiki "dorsal fin" vs fandom "3 spines"** sur back — à reconcilier
  - À refléter sprite design Damia : crocodile + 4-legs-stomach + 3-claws-tail + 3-spines-back + green + red eyes
  - Source: idem.

- [ ] ⭐ **🆕 Jaws canon name officiel (vs wiki ~Bite community) ⭐** — Adopter fandom canon > 25% phase ability. Description : "Launches its body towards a single target biting in mid air". Source: idem.

- [ ] ⭐ **🆕 Skull Casting visual canon MAJEUR ⭐⭐** — "Opens its mouth, **launching three skulls towards a single target from within**" — Crocodile expels SKULLS from inside mouth ⚠️ horror canon. Pattern thematic "necromantic crocodile" canon — unique visual design. À refléter VFX/animation Damia : mouth opens → 3 skull projectiles launched. Pattern macabre design canon Disc 1 Marshland mob. Source: idem.

- [ ] ⭐ **🆕 MAGIC STONE OF SIGNET EFFECT CANON REVEALED MAJEUR ⭐⭐⭐** — Fandom révèle effect : **"delays three turns of one target"**. Pattern time-stop / turn-delay item canon. Cohérent existing **Crafty Thief Boss Extras "Magic Sig Stone Vulnerability" passive** (= affected by 3-turn delay) + **Blue Bird strategy "Speed Down + Magical Stone of Signet"** canon. À documenter `items/key-items.md` (à créer) Magic Stone of Signet entry précis : **3-turn delay target ability canon**. Pattern strategic combat item canon MAJEUR. À implémenter `ItemEffect { type: 'turn-delay'; turns: 3; target: 'single' }` data-model Damia. Source: idem.

- [ ] ⭐ **🆕 Pellet = Earth-element Spell Item canon NEW MAJEUR ⭐** — Fandom révèle Pellet = "average damage dealing single target **earth-element** based spell item". Pattern Spell Items per-element canon :
  - **Burn Out** : Fire-element
  - **Gushing Magma** : Fire-element NEW
  - **Spinning Gale** : Wind-element
  - **Pellet** : **Earth-element** ⭐ NEW
    À documenter `items/consumables.md` (à créer) Pellet Earth-element Spell Item entry + per-element Spell Items taxonomy canon. Source: idem.

- [ ] ⭐ **🆕 Gushing Magma NEW Fire-element Spell Item canon ⭐** — Fandom révèle Gushing Magma = Fire-element Spell Item (cohérent Burn Out Fire). Pattern Fire Spell Items canon : Burn Out + Gushing Magma + autres ? À documenter `items/consumables.md` (à créer) Gushing Magma entry. Source canon : à investiguer drop/shop. Source: idem.

- [ ] ⭐ **🆕 Sea Dragon NEW Marshland mob canon ⭐ MAJEUR** — Fandom NEW formation : Crocodile + Sea Dragon ×2 (wiki tier 2 omits). Sea Dragon = NEW mob canon Marshland Disc 1 (probable Water-element thematic). À documenter `mobs/Sea Dragon.md` (à créer) — Marshland Disc 1 mob canon. Source: idem.

- [ ] **🆕 "Travel in packs of two" canon Crocodile** — Pattern Crocodile ×2 formation 38 dominant canon (cohérent wiki 35%/35% rates). Pattern duo mob canon récurrent. Source: idem.

- [ ] **🆕 "Slow to attack" canon Crocodile** — SPD 50 = slow canon, player advantage. Pattern strategic mob slow SPD canon. Source: idem.

- [ ] **🆕 "Single Magic from Dart" strategy canon ⭐** — Fandom suggère Dart Disc 1 magic capacity (probable Dragoon form OR Repeat Items magic-type). Pattern player Dart magic Disc 1 hint canon. À investiguer Dart magic abilities Disc 1 precise. Source: idem.

- [ ] **🆕 Encounter rate Uncommon Crocodile canon ⭐** — Cohérent Crescent Bee Uncommon pattern Disc 1. Source: idem.

- [ ] **🆕 Stats divergences Crocodile wiki vs fandom ⚠️** :
  - HP US : wiki 32 vs fandom **33** (+1 minor divergence)
  - P. Attack : wiki 10 vs fandom **12** (+20%)
  - M. Attack : wiki 9 vs fandom **11** (+22%)
    → Damia adopt fandom higher probable (JP closer pattern). Source: comparaison.

### Mobs / Crystal Golem (Light Shrine of Shirley Disc 1 — Counter 3 NEW LOWEST tier canon MAJEUR + Status all 8 ✔ Minor récurrent + Instant Death Immunity passive + AI 3-phase Clap/Trans Light/HP recovers self-heal + Sapphire Pin drop NEW + 5 roads multi-disc coverage canon)

- [ ] **🆕 Crystal Golem canon data-model** — **Light** element, HP 160 (JP +25% ~200 à confirmer), AT 19, DF 120 moderate, MAT 18, **MDF 160 high anti-magic**, SPD 80 high, A-AV/M-AV 0%. Mob Shrine of Shirley Disc 1 + 5 World Map roads Disc 1-2. Pattern "balanced tank anti-magic" canon. À implémenter `mobs/crystalGolem.ts`. Source: [`features/mobs/_sources/lod-wiki-crystal-golem.md`](features/mobs/_sources/lod-wiki-crystal-golem.md).

- [ ] ⭐ **🆕 Counter Opportunities tier 3 NEW LOWEST non-0 canon MAJEUR ⭐⭐** — Crystal Golem first ingestion Counter (3) tier (vs Bowling 4 previously NEW lowest). Pattern Damia étendu **7 tiers canon : 0 / 3 / 4 / 9 / 16 / 19 / 28**. À investiguer si autres mobs Counter 3 exist alphabetical ingestion future. Per user instruction : feature non-implémentée Damia, factual tier mention only. Source: idem.

- [ ] ⭐ **🆕 Status Immunity all 8 ✔ Minor Enemy récurrent canon ⭐** — Crystal Golem = **2ème Minor Enemy all 8 ✔ ingestion canon Damia** (cohérent Bowling Snowfield Disc 3 pattern). Confirms Minor Enemy varying status immunity per-mob canon : 4/4 standard / 5/3 / 6/2 / **all 8 ✔ boss-tier récurrent**. Pattern non-exclusif Rare/Boss trait. À documenter `combat/monster-categories.md` Status Immunity tier mapping update + `'minor-boss-tier-8'` profile NEW confirmed second case. Source: idem.

- [ ] ⭐ **🆕 Instant Death Immunity Mob passive canon récurrent ⭐** — Crystal Golem **Mob passive** (cohérent existing **Commander Marshland Boss passive**). Pattern Minor Enemy avec passive canon rare (most Minor no passive) — confirms cross-mob/boss shared passive canon. Immune Can't Combat Weapons (Gladius / Brass Knuckle / Indora's Axe). Cohérent thematic "crystal golem solid construct". À documenter `combat/mob-passives.md` (à créer) — pattern Minor Enemy passives canon : Commander Marshland + Crystal Golem confirmed. Source: idem.

- [ ] ⭐ **🆕 AI 3-phase NEW Crystal Golem MAJEUR ⭐** — Phase 1 (HP > 25%) ~Clap (1× phys + 50% Stun proc) / Phase 2 (HP ≤ 50%) **Trans Light** (1.5× Light-elemental magic) / Phase 3 (HP ≤ 25%) **HP recovers** (30% Max HP = 48 HP self-heal). HP overlap zones 25-50% (Clap + Trans Light) + ≤25% (all three possible). Pattern AI 3-phase avec self-heal NEW canon Mob. À implémenter `MobAI3PhaseSelfHeal` data-model. Source: idem.

- [ ] ⭐ **🆕 Trans Light canon name officiel + Light-element ability NEW ⭐** — Wiki tier 2 canonical (NOT ~ approximation). 1.5× Light-elemental magic damage. Pattern Attack Multiplier 1.5× canon (cohérent Spinning Gale Wind / Burn Out Fire 1.5×). **First Mob Light ability ingestion Damia**. À implémenter ability `transLight` Damia Light 1.5× magic. Source: idem.

- [ ] ⭐ **🆕 HP recovers self-heal Mob canon NEW MAJEUR ⭐⭐** — Crystal Golem = **First Minor Enemy self-heal ingestion canon Damia**. Self-heal 30% Max HP (48 HP) on Phase 3 (HP ≤ 25%). Cohérent **Commander Seles HP recovers boss ability canon** (same name) — pattern boss/mob shared ability canon récurrent. À implémenter ability `hpRecovers` Damia shared cross-mob/boss. Pattern Mob recovery ability strategic burst threshold canon. Source: idem.

- [ ] **🆕 ~Clap canon name (community) + 50% Stun proc Crystal Golem** — Wiki community approximation > 25% phase. 1× phys + 50% chance Stun. **A-AV reduces Stun proc canon** (cohérent Caterpillar pattern — A-AV reduction status canon cross-mob/boss confirmé vs M-AV theory). Pattern thematic "crystal golem clapping shockwave". Source: idem.

- [ ] ⭐ **🆕 First Light-element Minor Enemy ingestion canon Damia ⭐** — Crystal Golem = first Light Minor ingestion. Pattern Light mobs rare canon — most Light = Shana/Miranda allies. Cohérent thematic "crystal golem" Light + Shrine of Shirley (Shirley = Light Dragoon Spirit canon Disc 1). À cross-référer autres Light Minor mobs canon ingestion future. Source: idem.

- [ ] **🆕 Sapphire Pin NEW item canon 2% drop ⭐** — Crystal Golem drops Sapphire Pin 2% (pattern accessory drop rate cohérent Berserker Energy Girdle 2%, Drake's Ring 2%). Probable accessory ("pin" thematic accessoire). Effect précis canon à investiguer fandom. À documenter `items/equipment.md` Sapphire Pin accessory canon entry. Source: idem.

- [ ] **🆕 Pattern "balanced tank anti-magic" canon Crystal Golem ⭐** — DF 120 moderate + **MDF 160 high anti-magic** + AT 19 / MAT 18 balanced + SPD 80 high (first strike often). Pattern mob anti-magic priority canon (OPPOSITE Crocodile DF 160 anti-physical profile). Pattern Disc 1 mob anti-magic profile canon. Source: idem.

- [ ] ⭐ **🆕 5 World Map roads multi-disc coverage canon MAJEUR ⭐** — Crystal Golem spawns :
  - **Kazas Intersection → Lohan Intersection** road (Disc 1)
  - **Hellena Prison Intersection → Kazas Intersection** road (Disc 1, conditional ⚠️ "Only if crossing from Forest Intersection Road")
  - **Kazas → Intersection** road (Disc 1)
  - **Barrier Station → Fletz Intersection** road (Disc 2)
  - **Barrier Station → Nest of Dragon Intersection** road (Disc 1-2)
    Pattern **5 roads multi-disc canon** (Disc 1 Kazas area + Disc 2 Fletz area via Barrier Station). À documenter `world-map/` (à créer) roads canon multi-disc. Pattern road conditional canon NEW "Only if crossing from X" mechanic. Source: idem.

- [ ] **🆕 Shrine of Shirley Disc 1 location canon ⭐** — Crystal Golem submaps 153, 154, 156. Cohérent existing Shrine of Shirley = Disc 1 Drake the Bandit + Shirley boss location canon. Cohérent thematic Light element (Shirley = Light Dragoon Spirit canon). À documenter `locations/Shrine of Shirley.md` (à créer). Encounter rates 20%/35%/35% canon. Source: idem.

- [ ] **🆕 Escape rate 40% canon Crystal Golem** — Standard intermediate Disc 1 (cohérent Home of Gigantos 40% pattern). Pattern intermediate escape rate Disc 1-2 canon. Source: idem.

- [ ] **🆕 HP overlap zones canon Crystal Golem ⚠️** — Phase boundaries overlap : HP 25-50% zone (Clap + Trans Light) + ≤25% zone (all three abilities possible). Pattern HP overlap zones multi-phase mobs canon — AI selection canon : random ? Weighted ? À investiguer Discord. Source: idem.

- [ ] **🆕 Conditional road canon NEW "Only if crossing from Forest Intersection Road" Crystal Golem ⭐** — Hellena Prison Intersection → Kazas Intersection road specific condition canon. Pattern road conditional spawn mechanic NEW canon. À documenter `world-map/` (à créer) conditional road encounters canon. Source: idem.

### Mobs / Crystal Golem fandom complement — JP stats CONFIRMED HP 200/Gold 9 + HP recovers scaling canon resolved (30% × HP base) + Appearance "giant crystal evil grinning face" NEW + "Outside Fletz" terminology + Trans Light confirmé + "Can't Combat" immune confirms Instant Death

- [ ] ⭐ **🆕 Crystal Golem JP stats CONFIRMED fandom MAJEUR ⭐⭐** — HP US 160 / JP **200** ✓ (+25% pattern systematic confirmé) + Gold US 27 / JP **9** ✓ (÷3 pattern systematic confirmé). Damia adopt JP 200/9. Cohérent décision projet adopt JP. Pattern JP/US conversion canon récurrent confirmé (cohérent Bowling/Crocodile/Crescent Bee). Source: [`features/mobs/_sources/fandom-crystal-golem.md`](features/mobs/_sources/fandom-crystal-golem.md).

- [ ] ⭐ **🆕 HP recovers scaling canon resolved MAJEUR ⭐⭐** — Fandom **"recover 60 health"** vs wiki **"30% (48) HP"** → divergence apparente résolue par scaling : **60 HP = JP HP 200 × 30%** ✓ / **48 HP = US HP 160 × 30%** ✓. Confirme **30% multiplier canon scales with HP base** — Damia adopt JP base → recovery **60 HP**. Pattern recovery % canon scaling per-mob HP base. À implémenter `hpRecovers` ability avec `healPercent: 0.3` (scaling automatique sur HP max canon). Source: idem.

- [ ] ⭐ **🆕 Appearance canon Crystal Golem NEW MAJEUR ⭐** — Fandom révèle visual canon : **"giant crystal with evil grinning face on it"**. Pattern thematic "sentient evil crystal" canon (vs typical golem humanoid form). "Big monster" terminology = imposing presence canon. À refléter sprite design Damia : giant crystal + evil grinning face + Light glow + Light element thematic. Pattern unique mob design canon Disc 1. Source: idem.

- [ ] **🆕 "Outside Fletz" location terminology canon ⭐** — Fandom utilise "Outside Fletz" = simplification narrative pour "Barrier Station → Fletz Intersection" road (wiki tier 2 précis). Pattern fandom geographic simplification canon récurrent. Cohérent Disc 2 area access via Barrier Station. Source: idem.

- [ ] **🆕 "Completely immune to all status ailments including Can't Combat" canon confirmed fandom ⭐** — Confirms wiki **Instant Death Immunity passive** (= "Can't Combat" immune) + **all 8 ✔ Status Immunity**. Pattern Mob passive boss-tier canon confirmed cross-source wiki + fandom. Source: idem.

- [ ] **🆕 Trans Light canon name confirmed fandom ⭐** — Fandom utilise "Trans Light" verbatim (cohérent wiki tier 2 canonical). Confirms canon name officiel cross-source. Source: idem.

- [ ] **🆕 "Normal physical attack causes stun" canon confirmed fandom ⭐** — Fandom confirms **~Clap 1× phys + 50% Stun proc** wiki canon (sans utiliser nom "~Clap" community). Pattern physical attack + status proc canon. Source: idem.

- [ ] **🆕 Formation solo only canon confirmed Crystal Golem ⭐** — Fandom liste UNIQUEMENT formation solo (cohérent wiki formation 60). Pattern "big monster" = solo encounter canon (vs typical mob duo/trio pattern). Pattern Crystal Golem solo presence thematic. Source: idem.

- [ ] **🆕 Stats divergences Crystal Golem wiki vs fandom ⚠️** :
  - P. Attack : wiki 19 vs fandom **20** (+1 minor divergence)
  - M. Attack : wiki 18 vs fandom **21** (+17% divergence)
  - DF/MDF/SPD/EXP match wiki
    → Damia adopt fandom higher AT 20 / MAT 21 probable (JP closer pattern récurrent). Source: comparaison.

### Mobs / Cursed Jar (Rare Monster Non-Elemental 3ème Unique Jar trio canon — World Map only Disc 1-2 + Night Raid 100% drop NEW + SPD 200 EXTRÊME + AT/MAT 0 + Escape 100% + Stunning Hammer 100% Stun NEW + M-AV reduces Stun DIVERGENCE vs Crystal Golem A-AV + Destroyer Mace NEW weapon canon)

- [ ] **🆕 Cursed Jar canon data-model** — **Non-Elemental** element, HP 4 extrême low, **AT 0 / MAT 0** (no offensive stats), DF/MDF 100 moderate, **SPD 200 EXTRÊME** (highest SPD ingestion canon Damia), A-AV/M-AV 0%. EXP 300 / Gold 0. Rare Monster category subset Minor canon. À implémenter `mobs/cursedJar.ts`. Source: [`features/mobs/_sources/lod-wiki-cursed-jar.md`](features/mobs/_sources/lod-wiki-cursed-jar.md).

- [ ] ⭐ **🆕 3ème Rare Monster Unique Jar ingestion canon Damia MAJEUR ⭐** — Cursed Jar = 3ème Unique Jar canon après Lucky Jar + Treasure Jar (trio complet). Pattern Unique Jars Counter 16 tier consistent confirmé (Lucky/Treasure/Cursed all Counter 16). À ingérer Lucky Jar + Treasure Jar canon ingestion future pour compléter trio Unique Jars canon. Pattern Unique Jars = Rare Monsters World Map only signature 100% item drop. Source: idem.

- [ ] ⭐ **🆕 Night Raid 100% drop NEW item canon MAJEUR ⭐** — Cursed Jar signature drop (100% guaranteed canon). Probable Attack Item ou Spell Item canon (thematic "raid"). À documenter `items/` Night Raid entry — investiguer effect précis fandom + items wiki. Pattern Rare Monster Jar = signature 100% item drop canon. Source: idem.

- [ ] ⭐ **🆕 SPD 200 EXTRÊME canon Cursed Jar MAJEUR ⭐** — Highest SPD ingestion canon Damia. Pattern Jar SPD high récurrent ? À cross-check Lucky/Treasure Jar SPD canon. Cursed Jar = always first strike canon (SPD 200 EXTRÊME guarantees first turn). À documenter `combat/speed-tiers.md` (à créer) SPD tier mapping per-mob. Source: idem.

- [ ] ⭐ **🆕 AT/MAT 0 canon Cursed Jar Jar pattern ⭐** — No offensive stats (uses Rare Attack 10% Max HP bypass formula instead). Pattern Rare Monster Jar bypass-formula offensive canon. Cohérent thematic "static jar = no offensive stats" canon. Source: idem.

- [ ] ⭐ **🆕 Escape 100% canon Cursed Jar MAJEUR ⭐** — Always escapable canon (player advantage, avoid losing turns to Stunning Hammer). Pattern Rare Monster escape rate variable canon : 100% (Cursed Jar) vs Lucky/Treasure Jar à vérifier. Cohérent thematic "cursed jar = player can always avoid". À documenter pattern Rare Monster escape canon. Source: idem.

- [ ] ⭐ **🆕 Stunning Hammer canon name officiel NEW ability ⭐** — Wiki tier 2 canonical (NOT ~ approximation). 100% Stun proc ≤ 50% HP phase canon (high reliability status). À implémenter ability `stunningHammer` Damia (100% Stun proc). Source: idem.

- [ ] ⭐ **🆕 M-AV reduces Stun proc Stunning Hammer DIVERGENCE NEW MAJEUR ⭐⭐** — Pattern A-AV/M-AV per-ability canon DIVERGENCE :
  - Cursed Jar Stunning Hammer : **M-AV reduces** Stun proc
  - Crystal Golem ~Clap : **A-AV reduces** Stun proc
  - Pattern A-AV/M-AV per-ability classification canon (physical-tagged vs magical-tagged ability ?)
  - À investiguer Discord pattern A-AV vs M-AV per-ability classification canon
  - À implémenter `StatusProcModifier` data-model avec `reducedBy: 'A-AV' | 'M-AV'` per-ability config
  - Pattern canon précis status proc reduction attribute per ability. Source: idem.

- [ ] ⭐ **🆕 Destroyer Mace NEW weapon canon MAJEUR ⭐** — Mentionné via Damage Mitigation bypass modifier ("Attacker Fear" + "Destroyer Mace" only apply post-1-damage cap Rare Monster). Pattern weapon canon NEW ingestion (probable weapon mid/late-game character — à investiguer Dart/Lavitz/Rose/Meru/Albert weapons). À documenter `items/equipment.md` Destroyer Mace weapon entry NEW canon. Source: idem.

- [ ] **🆕 Physical Attack Barrier canon name officiel NEW Cursed Jar ⭐** — Wiki tier 2 canonical. Self-buff reduces physical damage to 0 until next turn. 25% chance any phase. Pattern Mob Barrier ability canon (cohérent Aqua King Barriers boss-tier — Mob-tier version). À implémenter `physicalAttackBarrier` ability Damia (1-turn duration). Source: idem.

- [ ] **🆕 Run away! shared Rare Monster ability canon Cursed Jar ⭐** — 25% chance per turn. Does NOT award EXP/Gold/Item if mob runs away (vs player escape). Pattern Rare Monster escape risk canon — player must finish fast. Cohérent Blue Bird / Berserk Mouse Run away! shared. À implémenter shared `runAway` ability cross-mob Rare Monster canon. Source: idem.

- [ ] **🆕 Rare Monster passive duo canon Cursed Jar confirmed ⭐** — **Damage Mitigation** (physical → 1) + **Magical Immunity** (magical → 0) standard duo. Cohérent existing Blue Bird Rare Monster same duo. Cross-coverage Rare Monsters universal canon confirmed (Blue Bird + Cursed Jar). Pattern Damia `RareMonsterPassive` data-model shared canon. Source: idem.

- [ ] **🆕 "Attacker Fear" + "Destroyer Mace" Damage Mitigation bypass modifiers canon ⭐** — Only these 2 modifiers apply AFTER 1-damage cap. Pattern Damage Mitigation bypass canon. Attacker Fear = mob Fear status → boost damage modifier canon. Pattern strategic counter-Rare Monster canon. Source: idem.

- [ ] **🆕 AI Rare Monster chance-based pattern canon Cursed Jar ⭐** — Multi-action chance-based (vs Minor Enemy HP-conditional canon) :
  - Phase HP > 50% : 50% ~Rare Attack / 25% Physical Attack Barrier / 25% Run away!
  - Phase HP ≤ 50% : 50% Stunning Hammer / 25% Physical Attack Barrier / 25% Run away!
    Pattern probabilities distribution canon Rare Monster. À implémenter `RareMonsterAI` chance-based data-model (vs `MinorEnemyAI` HP-conditional). Source: idem.

- [ ] **🆕 ~Rare Attack shared Rare Monster canon Cursed Jar ⭐** — Community approximation HP > 50% phase. **10% target Max HP bypass formula** (cohérent Blue Bird). Only "Guarding" + "Target Fear" modifiers apply (formula bypass). Pattern Rare Monster "Rare Attack" universal trait canon. À implémenter ability `rareAttack` Damia shared cross-Rare Monster. Source: idem.

- [ ] **🆕 4 World Map roads coverage canon Cursed Jar Disc 1-2 ⭐** — Cursed Jar spawns :
  - **Nest of Dragon to Intersection** (Disc 1, most common spawn)
  - **Lohan Intersection to Nest of Dragon Intersection** (Disc 1)
  - **Nest of Dragon to Shrine of Shirley** (Disc 1)
  - **Barrier Station to Intersection** (Disc 2)
    Pattern 4 roads multi-disc canon (Disc 1 Nest of Dragon area + Disc 2 Barrier Station). World Map ONLY (no in-location encounter). Pattern Unique Jars = World Map only canon probable. À documenter `world-map/` (à créer) roads canon multi-disc. Source: idem.

- [ ] **🆕 Pattern Cursed Jar = World Map ONLY canon ⭐** — No in-location encounter (vs typical Minor Enemy Shrine/Forest spawn). Pattern Unique Jars = Rare Monsters World Map only canon (à confirmer Lucky/Treasure Jar). Pattern rare encounter type canon Disc 1-2. Source: idem.

### Mobs / Cursed Jar fandom complement — SACHET NEW item canon auto-kill Unique Monsters MAJEUR + 00PARTS NEW Unique Monster canon MAJEUR + "Unique Monster" category terminology = Rare Monster wiki + Magic Stone of Signet REQUIRED strategy + Speed Down location Mountain of Mortal Dragon Disc 3 + Long Bow Shana/Miranda weapon canon confirmé + Party build canon farming + Items récurrents canon

- [ ] ⭐ **🆕 SACHET NEW ITEM CANON MAJEUR ⭐⭐⭐** — Fandom révèle **Sachet auto-damage 10 HP one-shot ALL Unique Monsters canon**. Pattern shared cross-Unique-Monster signature counter item. Sachet bypass Damage Mitigation 1-cap (fixed damage canon). À documenter `items/sachet.md` (à créer) — Unique Monster signature counter item canon. À implémenter `SachetItem` data-model `{ type: 'fixed-damage'; damage: 10; targetCategory: 'unique-monster'; bypassMitigation: true }`. Pattern Damia strategic counter Unique Monsters canon. ⚠️ "Time-consuming farming" canon — Sachet source à investiguer. Source: [`features/mobs/_sources/fandom-cursed-jar.md`](features/mobs/_sources/fandom-cursed-jar.md).

- [ ] ⭐ **🆕 00PARTS NEW Unique Monster canon MAJEUR ⭐⭐** — Fandom révèle 00PARTS = Unique Monster similar Cursed Jar (runs away quickly + 1-damage cap + Magical Immunity + Physical Attack Barrier). Pattern Unique Monsters umbrella étendu : Lucky/Treasure/Cursed Jars + **00PARTS** + autres ? Probable Disc 3-4 location (à confirmer). À documenter `mobs/00PARTS.md` (à créer) — Unique Monster canon NEW. Pattern Unique Monsters share strategy (Sachet + Magic Stone of Signet + Speed Down). Source: idem.

- [ ] ⭐ **🆕 "Unique Monster" category terminology canon = Rare Monster wiki ⭐** — Fandom uses "Unique Monster" umbrella (cohérent existing Blue Bird canon). Cross-source terminology canon Damia : Wiki "Rare Monster" = Fandom "Unique Monster" canonical. Pattern category dual-terminology canon. À mettre à jour `combat/monster-categories.md` Rare Monster = Unique Monster cross-source canon. Source: idem.

- [ ] ⭐ **🆕 Magic Stone of Signet REQUIRED strategy canon Cursed Jar MAJEUR ⭐** — Fandom confirms **"required to at least have a Magic Stone of Signet in the inventory"** for consistent Cursed Jar kill. Strategy : attack 1-2 dmg → Magic Stone of Signet (3-turn delay) → finish attacks before mob runs away. Cohérent Crocodile fandom reveal "3-turn delay" canon. Pattern strategic Unique Monster counter canon. À documenter `items/key-items.md` (à créer) Magic Stone of Signet REQUIRED Unique Monster strategy canon. Source: idem.

- [ ] ⭐ **🆕 Speed Down location canon Mountain of Mortal Dragon Disc 3 NEW ⭐** — Fandom révèle "Speed Down (found on the Mountain of Mortal Dragon)" canon. Mountain of Mortal Dragon = Disc 3 location canon (cohérent existing Baby Dragon ingestion). À documenter `items/consumables.md` (à créer) Speed Down found-location canon Disc 3. Pattern Repeat Item location-specific drop canon. Source: idem.

- [ ] ⭐ **🆕 Long Bow Shana/Miranda weapon canon confirmé NEW ⭐** — Fandom : "Shana/Miranda should use the Long Bow". Pattern Shana/Miranda bow archetype canon (cohérent Shana/Miranda shared archetype canon Damia). À documenter `items/equipment.md` Long Bow weapon entry + `party-members/Shana.md` + `party-members/Miranda.md` weapon canon. Pattern accuracy-focused weapon Shana/Miranda canon. Source: idem.

- [ ] **🆕 Items canon récurrents Cursed Jar farming ⭐** :
  - **Wargod's Amulet** accessory accuracy boost canon (cohérent Wargod Calling/Ultimate Wargod additions canon ?)
  - **Sallet** helmet accuracy boost canon
  - **Dancer's Shoes** SPD-boost footwear canon
  - **Bandit's Shoes** SPD-boost footwear canon
  - **Magical Greaves** SPD-boost armor canon
  - **Dancer's Ring** SPD-boost accessory canon
    À documenter `items/equipment.md` (à créer/maj) entries canon. Pattern accuracy + SPD items canon Unique Monster farming. Source: idem.

- [ ] **🆕 Party build canon Cursed Jar farming ⭐** — Fandom recommande **Dart + Meru + Shana/Miranda** avec Shana/Miranda = main damage dealer (Long Bow accuracy). Pattern strategic party canon accuracy-focused Unique Monster farming. Cohérent shared 00PARTS farming strategy. À documenter `combat/strategy.md` (à créer) party builds canon par target. Source: idem.

- [ ] **🆕 "Runs away quickly cannot instantly KO" canon Cursed Jar + 00PARTS ⭐** — Confirms wiki Run away! 25%/turn canon + AT 0 (no offensive threat). Pattern Unique Monster low-threat-high-reward canon. Player urgency = finish before escape. Source: idem.

- [ ] **🆕 Stats divergences Cursed Jar wiki vs fandom ⚠️** :
  - AT : wiki **0** vs fandom **1** (+1 minor divergence)
  - MAT : wiki **0** vs fandom **1** (+1 minor divergence)
  - HP/DF/MDF/SPD/EXP/Gold match
  - Interprétation : wiki "0" = "no offensive used" vs fandom "1" = minimal effective value ?
    À trancher decision Damia. Source: comparaison.

- [ ] **🆕 Element "none" fandom = Non-Elemental wiki cross-source ⭐** — Cross-source terminology canon : Element "none" (fandom narrative) = Non-Elemental (wiki canonical). Pattern Non-Elemental Rare Monsters canon. Source: idem.

- [ ] **🆕 Location simplification fandom Cursed Jar ⚠️** — Fandom "Road between Lohan and Nest of Dragon" = un seul des 4 roads wiki tier 2. Pattern fandom geographic simplification canon récurrent (vs wiki tier 2 exhaustive). Damia adopt wiki 4 roads exhaustif. Source: comparaison.

### Mobs / Cute Cat (Thunder Divine Tree Disc 3 — First Thunder Minor canon + AI 4-phase complex NEW + Dance of Death first Mob "Can't Combat" Instant Death offensive NEW MAJEUR + Luring Dance 100% Bewitchment NEW + Charging Spirit dual-option Air-Combat-style + Pattern A-AV/M-AV per-ability classification CONFIRMED + Dancer's Shoes 2% drop source + Manticore + Mountain Ape NEW mobs partners + M-AV 5% NEW low tier)

- [ ] **🆕 Cute Cat canon data-model** — **Thunder** element, HP 640 high (JP +25% ~800 à confirmer), AT 71, DF 140, MAT 91, **MDF 180 very high anti-magic**, SPD 70 moderate, **A-AV 5% / M-AV 5% NEW low tier**. EXP 162 / Gold 51. Mob Divine Tree Disc 3 interior dungeon only. Pattern "balanced high-tier Disc 3 anti-magic" canon. À implémenter `mobs/cuteCat.ts`. Source: [`features/mobs/_sources/lod-wiki-cute-cat.md`](features/mobs/_sources/lod-wiki-cute-cat.md).

- [ ] ⭐ **🆕 First Thunder-element Minor Enemy ingestion canon Damia MAJEUR ⭐** — Cute Cat = first Thunder Minor canon. Pattern Thunder mobs rare canon — most Thunder = Meru/Kanzas allies. Cohérent thematic "electric cat" + Divine Tree Disc 3. À cross-référer autres Thunder Minor mobs canon ingestion future. Source: idem.

- [ ] ⭐ **🆕 AI 4-phase complex canon Cute Cat NEW MAJEUR ⭐** — Pattern AI complex multi-phase NEW (vs typical 2-3 phase) :
  - **Any HP** : ~Scratch (1× phys baseline)
  - **> 50% HP** : Charging Spirit (dual-option telegraph)
  - **≤ 50% > 25% HP** : Luring Dance (100% Bewitchment proc, M-AV reduces)
  - **≤ 25% HP** : Dance of Death (Instant Death "Can't Combat")
    HP overlap zones canon : ~Scratch any HP + Charging Spirit > 50% peut télégraphier Dance of Death override. À implémenter `MobAI4PhaseComplex` data-model. Source: idem.

- [ ] ⭐⭐ **🆕 Dance of Death NEW canon name + first Mob "Can't Combat" Instant Death offensive ability ingestion canon Damia MAJEUR ⭐⭐⭐** — Wiki tier 2 canonical (NOT ~ approximation). Inflicts Instant Death "Can't Combat" Mob ability ≤ 25% HP phase. **Pattern Mob Instant Death offensive canon NEW** (vs typical mob no Instant Death offensive). Cohérent existing **Erase mechanic 4-tier player canon** (Can't Combat Weapons + Total Vanishing + Pandemonium + Demon's Gate) — Mob equivalent Damia. Pattern Mob Instant Death low-HP threshold strategic ability canon. À implémenter ability `danceOfDeath` Damia Instant Death "Can't Combat" Mob canon. À documenter `combat/instant-death.md` (à créer) Mob Instant Death offensive canon Dance of Death + Erase mechanic player parallel. Source: idem.

- [ ] ⭐ **🆕 Luring Dance NEW canon name officiel ⭐** — Wiki tier 2 canonical. 100% Bewitchment proc ≤ 50% > 25% HP phase (high reliability status). Pattern thematic "cat luring victim dance". À implémenter ability `luringDance` Damia (100% Bewitchment proc, M-AV-reduced). Source: idem.

- [ ] ⭐⭐ **🆕 Pattern A-AV/M-AV per-ability classification CONFIRMED canon MAJEUR ⭐⭐⭐** — Cross-mob/boss pattern canon CONFIRMED par Cute Cat Luring Dance :
  - **Crystal Golem ~Clap** (physical-tagged Stun) → **A-AV reduces**
  - **Cursed Jar Stunning Hammer** (magical-tagged Stun) → **M-AV reduces**
  - **Cute Cat Luring Dance** ⭐ NEW (magical-tagged Bewitchment) → **M-AV reduces**
  - Pattern : Magical-tagged ability (dance/spell-themed) → M-AV reduces / Physical-tagged ability (clap/strike-themed) → A-AV reduces
  - À documenter `combat/avoidance-tiers.md` (à créer) per-mob A-AV/M-AV tier mapping + per-ability classification canon
  - À implémenter `StatusProcModifier { type; chance; reducedBy: 'A-AV' | 'M-AV'; abilityType: 'physical' | 'magical' }` data-model canon. Source: idem.

- [ ] ⭐ **🆕 Charging Spirit dual-option Cute Cat canon MAJEUR ⭐** — Telegraph dual-option : Scratch OR Dance of Death next turn (Air Combat-style canon). Pattern Air Combat-style dual-option Charging Spirit canon (cohérent Air Combat Charging Spirit + All-out Attack/basic). Pattern différent Bowling **single-option** (Charging Spirit → All-out Attack only). À implémenter `MobAI.chargingSpiritOptions: 'single' | 'dual'` data-model (cohérent existing Bowling fandom). Pattern Cute Cat = "dual" canon. ⚠️ Charging Spirit > 50% peut **télégraphier Dance of Death** normalement réservée ≤ 25% — pattern AI override canon. Source: idem.

- [ ] ⭐ **🆕 Manticore + Mountain Ape NEW mobs canon Divine Tree Disc 3 MAJEUR ⭐** — Cute Cat formation partners :
  - **Manticore** = NEW mob canon Divine Tree Disc 3 (formation 266 partner Cute Cat)
  - **Mountain Ape** = NEW mob canon Divine Tree Disc 3 (formation 269 partner ×2 Cute Cat)
    Pattern Divine Tree Disc 3 mob ecosystem canon : Cute Cat + Manticore + Mountain Ape (3 mobs Disc 3 confirmed). À documenter `mobs/Manticore.md` + `mobs/Mountain Ape.md` (à créer) — Divine Tree Disc 3 mobs canon. Source: idem.

- [ ] ⭐ **🆕 Dancer's Shoes 2% drop source canon revealed Cute Cat ⭐** — Wiki tier 2 révèle Cute Cat Divine Tree Disc 3 = drop source canon NEW. Confirms existing item canon **Dancer's Shoes** (mentioned in Cursed Jar fandom strategy items récurrents). Pattern equipment 2% drop rate canon (cohérent Sapphire Pin 2%, Energy Girdle 2%, Drake's Ring 2%). À documenter `items/equipment.md` Dancer's Shoes entry — Cute Cat 2% drop source + SPD-boost footwear canon récurrent. Source: idem.

- [ ] ⭐ **🆕 M-AV 5% rare canon NEW Cute Cat ⭐** — Most mobs M-AV 0% canon majoritaire. Cute Cat M-AV 5% = NEW low-tier M-AV present canon. Pattern A-AV/M-AV tier mapping cross-mob étendu : 0% / 5% / 10% / 20% / 50%. À documenter `combat/avoidance-tiers.md` (à créer) per-mob A-AV/M-AV tier mapping. Source: idem.

- [ ] **🆕 ~Scratch canon name (community) Cute Cat** — Wiki community approximation any-HP baseline ability. 1× phys damage canon. Pattern thematic "cat scratch". Source: idem.

- [ ] **🆕 Divine Tree Disc 3 location canon ⭐** — Cute Cat submaps Divine Tree massive coverage : 583, 584, 585, 586, 587, 589, 590, 591, 592. Pattern Divine Tree Disc 3 ecosystem canon (cohérent existing Divine Tree boss area). Pattern Thunder element thematic Divine Tree (Wind Dragoon Spirit area thematic ?). À documenter `locations/Divine Tree.md` (à créer) — Disc 3 location canon. Source: idem.

- [ ] **🆕 Cute Cat World Map = None canon** — Pattern Cute Cat = location-only canon (no World Map road spawn). Pattern Divine Tree mob = interior dungeon canon. Source: idem.

- [ ] **🆕 Escape rate 30% canon Divine Tree Disc 3** — Pattern Disc 3 standard escape canon (vs Disc 1 elevated rates 40-90%). Pattern late-game lower escape rates canon. Source: idem.

- [ ] **🆕 Pattern "balanced high-tier Disc 3 anti-magic" canon Cute Cat ⭐** — HP 640 high + DF 140 high + **MDF 180 very high anti-magic strong** + AT 71 / MAT 91 high offensive Disc 3 + SPD 70 moderate. Pattern Disc 3 mob high-stats tier canon (vs Disc 1 mobs much lower). À documenter stats tier mapping per-Disc canon. Source: idem.

- [ ] **🆕 Pattern Mobs with Instant Death Immunity vs Cute Cat Dance of Death ⚠️** — Question canon : Commander Marshland + Crystal Golem (Instant Death Immunity passive) vs Cute Cat Dance of Death = Mob ability missing ? Pattern Instant Death passive vs Mob Instant Death offensive canon. À investiguer Discord. Source: idem.

### Mobs / Cute Cat fandom complement — JP stats CONFIRMED HP 800/Gold 17 + Fury Swipes canon name officiel + Talisman + Rose's Hairband NEW accessories canon protect Can't Combat MAJEUR + "only Thunder mob within Divine Tree" unique canon + Disc 4 Monsters category fandom (Disc 3-4 timing) + Dancer's Shoes = accessory classification + Stats divergences AT/MAT/HP wiki vs fandom + Charging Spirit fandom generic template

- [ ] ⭐ **🆕 Cute Cat JP stats CONFIRMED fandom MAJEUR ⭐⭐** — HP US 640 / JP **800** ✓ (+25% pattern systematic confirmé) + Gold US 51 / JP **17** ✓ (÷3 pattern systematic confirmé). Damia adopt JP 800/17. Cohérent décision projet adopt JP. Pattern JP/US conversion canon récurrent confirmé (cohérent Bowling/Crocodile/Crescent Bee/Crystal Golem). Source: [`features/mobs/_sources/fandom-cute-cat.md`](features/mobs/_sources/fandom-cute-cat.md).

- [ ] ⭐ **🆕 Fury Swipes canon name officiel NEW MAJEUR ⭐** — Fandom révèle canon name (vs wiki ~Scratch community approximation). Description : "Runs towards single target smacking them several times with paws, dealing **medium physical damage**". Pattern thematic "cat fury swipes multi-strike" canon. ⚠️ "Medium damage" fandom vs wiki "1× phys" — possible multi-strike effective higher damage canon. Damia adopt fandom canon **Fury Swipes** > wiki community ~Scratch. À mettre à jour ability data-model. Source: idem.

- [ ] ⭐⭐ **🆕 TALISMAN + ROSE'S HAIRBAND NEW ACCESSORIES CANON MAJEUR ⭐⭐⭐** — Fandom révèle 2 accessoires canon protection Can't Combat status :
  - **Talisman** = NEW accessory canon (protects against Can't Combat status)
  - **Rose's Hairband** = NEW accessory canon (protects against Can't Combat status) — **character-specific accessory Rose-themed** canon NEW
    Pattern accessories anti-status canon récurrent. Cohérent **Dance of Death Mob Instant Death "Can't Combat" ability** canon → counter player items. Pattern strategic counter Mob Instant Death offensive canon. Pattern character-specific accessory canon NEW (Rose's Hairband Rose-themed equipment). À documenter `items/equipment.md` Talisman + Rose's Hairband accessories canon entries. À implémenter `AccessoryEffect { type: 'status-immunity'; status: 'Cant-Combat' }` data-model Damia. Pattern character-specific equipment NEW canon (Rose's Hairband). Source: idem.

- [ ] ⭐ **🆕 "Only thunder-element monster within The Divine Tree" canon unique Cute Cat ⭐** — Fandom confirms Cute Cat = unique Thunder mob Divine Tree canon (cohérent wiki First Thunder Minor Enemy Damia). Pattern Divine Tree mob diversity canon : Cute Cat (Thunder) + Manticore (?) + Mountain Ape (?). À cross-check Manticore + Mountain Ape elements ingestion future. Source: idem.

- [ ] ⭐ **🆕 Disc 4 Monsters category fandom vs Disc 3 wiki implicit DIVERGENCE ⚠️** — Fandom catégorise **Disc 4 Monsters** (vs wiki tier 2 implicit Disc 3 contexte Divine Tree). Pattern Divine Tree timing canon : Disc 3-4 transition area (accessible Disc 3 events + Disc 4 finale). Damia adopt Disc 3-4 canon. À investiguer story timing canon précis (Discord ?). Pattern category timing canon divergence wiki vs fandom. Source: idem.

- [ ] ⭐ **🆕 Dancer's Shoes = accessory canon classification confirmé fandom ⭐** — Fandom : "the accessory Dancer's Shoes" canon — classification **accessory** (vs SPD-boost footwear category ambiguity). Pattern accessories canon Damia includes Dancer's Shoes. "Very rare 2%" drop rate canon cohérent. À documenter `items/equipment.md` Dancer's Shoes = accessory category canon. Source: idem.

- [ ] **🆕 "Evade attacks with given probability" canon confirms A-AV/M-AV cross-source ⭐** — Fandom narrative confirme **A-AV 5% / M-AV 5% Cute Cat canon**. Pattern evasion mechanic canon récurrent cross-source. Source: idem.

- [ ] **🆕 Charging Spirit fandom generic template vs wiki precise ⚠️** — Fandom : "Uses special attack or All-out Attack next turn" = generic Charging Spirit template (cohérent Air Combat / Berserker). Wiki tier 2 : "Scratch or Dance of Death next turn" = specific Cute Cat dual-option canon. Damia adopt wiki tier 2 precise canon (specific abilities télégraphiées). Pattern fandom generic descriptor vs wiki specific canon. Source: comparaison.

- [ ] **🆕 Stats divergences Cute Cat wiki vs fandom ⚠️** :
  - HP US : wiki 640 vs fandom **704** (+10% — fandom higher OR JP intermediate ?)
  - P. Attack : wiki 71 vs fandom **80** (+12.7%)
  - M. Attack : wiki 91 vs fandom **102** (+12%)
  - DF/MDF/SPD match
  - JP HP 800 confirmé fandom = +25% wiki US 640 (pas +13% fandom US 704)
  - → Damia adopt fandom higher AT 80 / MAT 102 probable (JP closer pattern récurrent)
    À investiguer wiki source older vs fandom intermediate. Source: comparaison.

- [ ] **🆕 Formations canon confirmed cross-source Cute Cat ⭐** — 3 formations identiques wiki tier 2 confirmé fandom : Cute Cat solo (262) + Cute Cat + Manticore (266) + Cute Cat + Mountain Ape ×2 (269). Pattern Manticore + Mountain Ape NEW mobs canon Divine Tree partners cross-source confirmé. Source: idem.

- [ ] **🆕 Haschel party member Divine Tree Disc 3-4 canon confirmed gallery ⭐** — Image gallery confirme Haschel = party member Divine Tree canon. Cohérent existing Haschel canon (Summon 4 Gods + Hex Hammer additions per Counter table). Pattern party composition Disc 3-4 canon. Source: idem.

### Bosses / Danton wiki (Hero Competition Round 3 Lohan Disc 1 Earth heavy armor — AI "if → then" canon + ~Bring It! 4-turn reactive NEW MAJEUR + All-out Attack! HP-to-1 Single Use Auto ≤ 25% UNIQUE TLoD variant + Counter 28 + Status all 8 ✔ Boss + No passives + JP HP 300 confirmed cross-source)

- [ ] ⭐ **🆕 Danton wiki tier 2 canon ingestion MAJEUR ⭐** — Complète fandom existing `_sources/fandom-hero-competition.md`. AI canon "if → then" model révélé wiki tier 2 + cross-source confirmations. Source: [`features/bosses/_sources/lod-wiki-danton.md`](features/bosses/_sources/lod-wiki-danton.md).

- [ ] ⭐⭐ **🆕 ~Bring It! NEW canon reactive ability 4-turn MAJEUR ⭐⭐⭐** — Wiki tier 2 révèle ability mécanique précise : 4 turns Do Nothing + reactive (if physical attack received → 0 damage + ignore turn order + retaliate 0.5× phys attacker). Pattern thematic cross-source **"Make my day kiddo, bring it!"** confirmé (cohérent fandom mallet drop trap reveal). Pattern Boss reactive ability canon NEW (vs proactive). Pattern character-thematic ability canon (taunt → counter mechanic). À implémenter `BringItAbility { duration: 4; reactive: 'physical-attack'; effects: ['damage-immunity', 'ignore-turn-order', 'retaliate-0.5x-phys'] }` data-model Damia. Pattern "Ignore Turn Order" mechanic canon NEW. Source: idem.

- [ ] ⭐⭐ **🆕 All-out Attack! "Reduce Target's HP to 1" UNIQUE TLoD variant canon MAJEUR ⭐⭐⭐** — Wiki tier 2 révèle ability **"Reduce Target's HP to 1"** Single Use Auto ≤ 25% HP. Pattern UNIQUE TLoD Danton variant All-out Attack canon : HP-to-1 reduction (vs typical "All-out Attack 3× phys" pattern Air Combat/Bowling). Cross-source confirmed **fandom Dart HP→1 reveal** ✓. Cohérent fandom **comedy beat "Danton stumbles and falls"** canon (executes HP-to-1 but loses balance → Dart wins by default). À implémenter `AllOutAttackHpTo1Ability { type: 'reduce-hp-to-1'; singleUse: true; autoTrigger: 'hp <= 25%' }` data-model Damia. Pattern "Single Use" + "Auto" conditions canon NEW (cohérent existing Boss AI canon). Source: idem.

- [ ] ⭐ **🆕 Boss AI "if → then" model canon confirmed cross-source ⭐** — Wiki tier 2 explicite "Auto" + "Ignore Turn Order" mechanic terms. Cohérent existing **Caterpillar boss AI "if → then" model** canon. Pattern Boss AI canon récurrent. Pattern "Ignore Turn Order" mechanic canon NEW (paired with Retaliate action). À documenter `combat/boss-ai.md` (à créer) — "if → then" model + reactive abilities canon. Source: idem.

- [ ] ⭐ **🆕 Danton JP HP 300 confirmed cross-source ⭐** — Wiki US 240 / fandom JP 300 = +25% pattern systematic confirmé. Damia adopt JP 300 canon. Cohérent décision projet adopt JP. Source: idem.

- [ ] **🆕 Stats divergences Danton wiki vs fandom ⚠️ minor** :
  - AT : wiki **23** vs fandom **26** (+3 / +13%)
  - MAT : wiki **8** vs fandom **10** (+2 / +25%)
  - HP/DF/MDF/SPD match ✓
  - → Damia adopt fandom higher probable (JP closer pattern récurrent). Source: comparaison.

- [ ] **🆕 Status all 8 ✔ Boss-tier Danton confirmed ⭐** — Pattern Boss-tier immunity canon majoritaire confirmé. Cohérent existing Bosses canon all 8 ✔. Source: idem.

- [ ] **🆕 No passives canon Danton ⭐** — Pattern bosses peuvent ou non avoir passives canon (variable per-boss). Danton = pure AI offensive/defensive canon. À cross-référer autres Hero Competition bosses (Belzac/etc.) passives canon. Pattern variability boss passives canon. Source: idem.

- [ ] **🆕 Lohan submap 638 Scripted encounter canon Danton ⭐** — Pattern Hero Competition Round 3 Lohan Disc 1 canon. Scripted / 0% escape = pattern tournament boss canon. À documenter `quests/disc1-hero-competition.md` (à créer/vérifier) — tournament master doc. Source: idem.

- [ ] **🆕 Counter 28 high-density tier Danton confirmed ⭐** — Cohérent pattern Boss + Mob Counter 28 récurrent. Confirmed cross-source. Source: idem.

- [ ] **🆕 "Auto" + "Ignore Turn Order" mechanic terms canon NEW ⭐** — Wiki tier 2 définit explicitement : **Auto** = action used next turn if conditions met / **Ignore Turn Order** = current turn order values unchanged from this action. Pattern combat mechanic terminology canon NEW (à documenter `combat/boss-ai.md` à créer). Source: idem.

### Bosses / Dark Doel wiki (Multi-entity boss Moon That Never Sets Disc 4 Albert trial — Dark Doel + Light Sword + Shadow Blade 3500 HP + Untargetable passive + Instigate mechanic NEW Boss Extras + ~Curved Thunder + ~Triple Slash + Boss Extras canonical 2nd instance + AI "if → then" + Counter 28/0)

- [ ] ⭐ **🆕 Dark Doel standalone canon doc créé MAJEUR ⭐** — Création `bosses/Dark Doel.md` synthesis canon (auparavant section Emperor Doel doc). Multi-entity boss canon Disc 4 Moon trial Albert canon. Source: [`features/bosses/_sources/lod-wiki-dark-doel.md`](features/bosses/_sources/lod-wiki-dark-doel.md).

- [ ] ⭐⭐ **🆕 Multi-entity boss canon récurrent Dark Doel confirmed MAJEUR ⭐⭐** — Dark Doel + Light Sword + Shadow Blade = **3-entity multi-entity boss canon Disc 4 finale**. Cohérent existing multi-entity bosses : Claire / Kamuy / Lloyd Flanvel / Magician Faust / 3 Dragon Spirits / Zieg Feld. Pattern Damia `MultiEntityBoss { main; extras; synergy }` data-model canon. À documenter `combat/multi-entity-bosses.md` (à créer) — pattern canon récurrent étendu confirmed. Source: idem.

- [ ] ⭐⭐ **🆕 Untargetable passive Dark Doel canon MAJEUR ⭐⭐** — Pattern **"Components must be destroyed first"** canon : Dark Doel **cannot be targeted/damaged** while EITHER Light Sword OR Shadow Blade alive. Player MUST destroy both Boss Extras first → Dark Doel becomes targetable. Cohérent existing Emperor Doel doc reveal "Cannot be attacked before 2 swords defeated". À implémenter `UntargetablePassive { condition: 'while-entity-alive'; entities; mode: 'OR' | 'AND' }` data-model. Pattern Boss + Boss Extras synergy canon MAJEUR. Source: idem.

- [ ] ⭐⭐⭐ **🆕 "INSTIGATE" MECHANIC NEW CANON Boss Extras MAJEUR ⭐⭐⭐** — Pattern Boss Extras = "command-the-boss" canon NEW :
  - **Light Sword Instigate Sword Slash** → force Dark Doel to use ~Sword Slash (1× phys)
  - **Shadow Blade Instigate Blade Slash** → force Dark Doel to use ~Blade Slash (1× phys)
  - **Ignore turn order** = Dark Doel forced action ne change pas son turn order canon
  - Pattern Boss Extras drive Boss behavior canon NEW
  - Consistent **"Ignore Turn Order" terminology canon** (cohérent Danton "Auto" + "Ignore Turn Order")
    À implémenter `InstigateAbility { type: 'force-boss-action'; targetBoss; forcedAction; ignoreTurnOrder: true }` data-model Damia. Pattern unique multi-entity boss mechanic canon. Source: idem.

- [ ] ⭐⭐ **🆕 Boss Extras canonical 4th category 2nd instance confirmed cross-boss MAJEUR ⭐** — Light Sword + Shadow Blade = **2ème Boss Extras ingestion canon Damia** (1ère = Crafty Thief Boss Extras Pellet/Drake's Ring etc.). Pattern Boss Extras canonical category distinct Minor Enemy / Rare Monster / Boss. Pattern characteristics canon confirmed cross-boss :
  - Counter (0) canon
  - EXP/Gold/Drops 0/0/Nothing canon
  - Status all 8 ✔ canon
  - Stats similar Boss (HP 1000, DF 120)
  - A-AV 5% canon (cohérent Cute Cat parallel)
    À mettre à jour `combat/monster-categories.md` Boss Extras = 4th category with multiple confirmed instances (Crafty Thief + Dark Doel). Source: idem.

- [ ] ⭐ **🆕 ~Curved Thunder NEW canon name Dark Doel post-swords phase ⭐** — Wiki tier 2 community approximation : 1× Thunder-elemental magic damage. Condition : Light Sword OR Shadow Blade destroyed (post-Boss-Extras-destruction phase canon). Pattern Thunder element ability cohérent Doel Violet Dragoon canon. Cohérent existing Emperor Doel doc "Lightning Cape" phase post-swords-destroyed. À reconcilier Curved Thunder vs Lightning Cape canon name. Source: idem.

- [ ] ⭐ **🆕 ~Triple Slash NEW canon name Dark Doel while Boss Extras alive ⭐** — Wiki tier 2 community approximation : 2× Physical damage. Condition : Light Sword OR Shadow Blade in battle. Pattern thematic "triple slash" (lift + slam + slash combo ?). Pattern Dark Doel dual-phase AI canon (Triple Slash phase 1 + Curved Thunder phase 2). Source: idem.

- [ ] **🆕 ~Sword Slash + ~Blade Slash 1× phys forced via Instigate canon Dark Doel ⭐** — Wiki tier 2 community approximation. Only used via Boss Extras Instigate mechanic. Pattern unique forced-action canon Boss Extras → Boss. Source: idem.

- [ ] **🆕 AI canon "if → then" model Dark Doel confirmed cross-boss ⭐** — Pattern Boss AI canon récurrent (cohérent Caterpillar + Danton + Dark Doel). "Auto" + "Ignore Turn Order" terminology canon confirmed. À documenter `combat/boss-ai.md` (à créer) — "if → then" model + Auto + Ignore Turn Order + Instigate mechanic NEW. Source: idem.

- [ ] **🆕 Pattern identical paired Boss Extras canon ⭐** — Light Sword + Shadow Blade = stats identical pair canon (HP 1000 / AT 70 / DF 120 / SPD 45 / MAT 76 / MDF 120 / A-AV 5% / M-AV 0%). Pattern dual entity Boss Extras paired canon. À investiguer autres paired Boss Extras canon cross-boss. Source: idem.

- [ ] **🆕 HP total combat 3500 Disc 4 finale tier canon ⭐** — Dark Doel 1500 + Light Sword 1000 + Shadow Blade 1000 = **3500 HP total**. Pattern multi-entity boss HP distributed canon. Pattern Disc 4 finale combat tier canon. Source: idem.

- [ ] **🆕 EXP 6000 high late game canon Dark Doel ⭐** — Pattern Disc 4 finale trial boss EXP reward canon. Gold 0 / Drops Nothing = story-only Disc 4 trial pattern. Source: idem.

- [ ] **🆕 A-AV 5% Boss Extras canon Light Sword + Shadow Blade ⭐** — Cohérent existing Cute Cat A-AV 5% canon. Pattern A-AV 5% tier extension across Boss Extras + Minor Enemy. À documenter `combat/avoidance-tiers.md` (à créer) per-mob A-AV/M-AV tier mapping étendu. Source: idem.

- [ ] **🆕 Moon That Never Sets submap 596 Disc 4 trial canon Dark Doel ⭐** — Pattern Disc 4 Moon trials boss canon (Albert individual trial). Scripted / 0% escape = story trial boss canon. À documenter `locations/Moon That Never Sets.md` (à créer) — Disc 4 trials area canon. Source: idem.

- [ ] **🆕 Stats divergences Dark Doel wiki vs existing Emperor Doel fandom doc ⚠️** :
  - Wiki tier 2 : HP 1500 / AT 60 / MAT 70
  - Existing Emperor Doel fandom doc : HP US 1500 / JP 2500 / AT 75 / MAT 90
  - Possible : existing doc Lightning Cape phase post-swords stats ? Versions différentes ?
  - Damia adopt wiki tier 2 precise canon (1500 / 60 / 70) — wiki pattern précis
  - À reconcilier ingestion Dark Doel fandom dédié future. Source: comparaison.

### Mobs / Dark Elf (Darkness Evergreen Forest Disc 1 — Counter 23 NEW intermediate tier MAJEUR + AI HP-based chance modifiers NEW + Detonate Arrow NEW + Petrifying Arrow 100% Petrification NEW + Bewitching Arrow cut content reveal NEW + Depetrifier 8% drop source + Forest Runner + Flying Rat NEW mobs partners + MDF 180 anti-magic)

- [ ] **🆕 Dark Elf canon data-model** — **Darkness** element, HP 450 mid-tier (JP +25% ~562 à confirmer), AT 42, DF 70, MAT 44, **MDF 180 very high anti-magic** (cohérent Cute Cat 180 pattern), SPD 70 mid, A-AV/M-AV 0%. EXP 80 / Gold 36. Mob Evergreen Forest Disc 1 interior dungeon only. Pattern "anti-magic balanced Disc 1 magical-archer" canon. À implémenter `mobs/darkElf.ts`. Source: [`features/mobs/_sources/lod-wiki-dark-elf.md`](features/mobs/_sources/lod-wiki-dark-elf.md).

- [ ] ⭐ **🆕 Counter Opportunities tier 23 NEW intermediate canon MAJEUR ⭐** — Dark Elf first ingestion Counter (23) tier intermediate between 19 et 28. Pattern Damia étendu **8 tiers canon : 0 / 3 / 4 / 9 / 16 / 19 / 23 / 28**. À investiguer autres mobs Counter 23 tier exist alphabetical. Per user instruction : feature non-implémentée Damia, factual tier mention only. Source: idem.

- [ ] ⭐ **🆕 AI HP-based avec chance modifiers Dark Elf NEW pattern MAJEUR ⭐** — Pattern AI Minor Enemy avec chance distribution per HP zone NEW (vs typical fixed phase abilities) :
  - **Phase HP > 50%** : ~Heel Drop (1× phys baseline)
  - **Phase HP ≤ 50% > 25%** : 75% Detonate Arrow + 25% Petrifying Arrow
  - **Phase HP ≤ 25%** : 50% Detonate Arrow + 50% Petrifying Arrow
    Pattern complex phase + RNG canon Minor Enemy. À implémenter `MobAIHpChance` data-model. Source: idem.

- [ ] ⭐ **🆕 Detonate Arrow NEW canon name officiel ⭐** — Wiki tier 2 canonical (NOT ~ approximation). Party target + 0.5× Non-Elemental magic damage AoE. Pattern thematic "exploding arrow AoE". Pattern Non-Elemental magic ability canon. Cross-reference Arrow Shooter Detonate Arrow shared canon (Arrow family ?). À implémenter ability `detonateArrow` Damia Party Non-Elemental 0.5× magic AoE. Source: idem.

- [ ] ⭐⭐ **🆕 Petrifying Arrow NEW canon name officiel MAJEUR ⭐⭐** — Wiki tier 2 canonical (NOT ~ approximation). Single target + **100% chance Petrification proc** canon. **M-AV reduces Petrification proc** (cohérent pattern A-AV/M-AV per-ability classification CONFIRMED 4ème instance). À implémenter ability `petrifyingArrow` Damia Single 100% Petrification proc M-AV-reduced. Pattern Mob Petrification offensive ability canon NEW (cohérent Basilisk Petrifying Glare 100% similar pattern existing). Source: idem.

- [ ] ⭐⭐ **🆕 Pattern A-AV/M-AV per-ability classification CONFIRMED 4ème instance Dark Elf ⭐⭐** — Cross-mob/boss pattern canon CONFIRMED étendu :
  - Crystal Golem ~Clap (physical-tagged Stun) → A-AV reduces
  - Cursed Jar Stunning Hammer (magical-tagged Stun) → M-AV reduces
  - Cute Cat Luring Dance (magical-tagged Bewitchment) → M-AV reduces
  - **Dark Elf Petrifying Arrow (magical-tagged Petrification)** → **M-AV reduces** ⭐ 4ème instance NEW
  - Pattern : Magical-tagged ability → M-AV reduces / Physical-tagged ability → A-AV reduces
  - À documenter `combat/avoidance-tiers.md` (à créer) per-mob A-AV/M-AV tier mapping + per-ability classification canon
  - Pattern Damia `StatusProcModifier { reducedBy: 'A-AV' | 'M-AV'; abilityType: 'physical' | 'magical' }` data-model canon confirmé. Source: idem.

- [ ] ⭐⭐ **🆕 Bewitching Arrow cut content canon NEW MAJEUR ⭐⭐** — Wiki tier 2 trivia reveal : combat script residual ability **"Bewitching Arrow"** cut from final game. Reveal canon : **2 enemies Evergreen Forest had Bewitchment ability planned** → one cut to avoid redundancy → **confirms other Evergreen Forest mob canon Bewitchment ability** (Forest Runner OR Flying Rat probable). Pattern game design canon : status diversification per-area canon ⭐. Pattern thematic "Dark Elf 3-arrow trio" canon (Detonate + Petrifying + Bewitching cut → Detonate + Petrifying only canon). À documenter `combat/cut-content.md` (à créer) — cut abilities canon documentation. Pattern Damia : data-model `MobAbility { canon: true; cut?: boolean }` optional reference. Decision Damia : adopt cut Bewitching Arrow ? OR respect canon cut content ? Source: idem.

- [ ] ⭐ **🆕 Forest Runner + Flying Rat NEW mobs canon Evergreen Forest Disc 1 MAJEUR ⭐** — Dark Elf formation partners :
  - **Forest Runner** = NEW mob canon Evergreen Forest Disc 1 (formation 137 partner)
  - **Flying Rat** = NEW mob canon Evergreen Forest Disc 1 (formation 138 partner ×2)
    Pattern Evergreen Forest Disc 1 mob ecosystem canon : Dark Elf + Forest Runner + Flying Rat (3 mobs confirmed). À documenter `mobs/Forest Runner.md` + `mobs/Flying Rat.md` (à créer) — Evergreen Forest Disc 1 mobs canon. À investiguer Bewitchment ability ownership (per trivia cut content reveal). Source: idem.

- [ ] ⭐ **🆕 Depetrifier 8% drop source canon Dark Elf ⭐** — Pattern thematic IRONIC canon ⭐ : Dark Elf inflicts Petrification (Petrifying Arrow 100%) + drops Depetrifier counter — design canon. Cohérent existing item canon **Depetrifier** (mentioned Basilisk doc — cures Petrification). À documenter `items/consumables.md` Depetrifier entry — Dark Elf 8% Disc 1 source canon (pre-Basilisk Tower of Flanvel Disc 3 source). Pattern Petrification cure-item drop canon. Source: idem.

- [ ] **🆕 ~Heel Drop canon name (community) Dark Elf** — Wiki community approximation > 50% phase baseline ability. 1× phys damage canon. Pattern thematic "elf kick attack". Source: idem.

- [ ] **🆕 Evergreen Forest Disc 1 location canon Dark Elf ⭐** — Submaps 340, 341, 342, 343, 345. Pattern **Shana home village area Disc 1** pre-Hellena rescue canon. Pattern Disc 1 forest mob ecosystem canon. À documenter `locations/Evergreen Forest.md` (à créer) — Disc 1 location canon. Source: idem.

- [ ] **🆕 Dark Elf World Map = None canon** — Pattern Dark Elf = location-only canon (no World Map road spawn). Pattern Evergreen Forest mob = interior dungeon canon. Source: idem.

- [ ] **🆕 Escape rate 30% canon Evergreen Forest Disc 1** — Pattern Disc 1 standard escape rate canon (between early high rates 60-90% et standard 30%). Pattern Evergreen Forest pre-Hellena rescue intermediate area canon. Source: idem.

- [ ] **🆕 MDF 180 very high anti-magic Disc 1 mob canon Dark Elf ⭐** — Cohérent Cute Cat MDF 180 pattern Disc 3-4 — Dark Elf Disc 1 anti-magic mid-tier MDF 180. Pattern Disc 1 anti-magic mob canon NEW (vs typical low MDF Disc 1 mobs). Pattern Dark Elf magical-archer thematic. Source: idem.

### Mobs / Dark Elf fandom complement — Forest Runner WOOING (Bewitchment) RÉSOLU cut Bewitching Arrow MAJEUR + JP HP 500 +11% variant NON systematic NEW + Drop Kick canon name + Kill Dark Elf first strategy + Petrify removes character explanation + Stats divergences AT/MAT wiki vs fandom + MDF 120 vs 180 divergence

- [ ] ⭐⭐⭐ **🆕 Forest Runner WOOING (Bewitchment) ability canon REVEALED fandom MAJEUR ⭐⭐⭐** — Fandom révèle Forest Runner has **Wooing** ability (Bewitchment-type "removes character from combat"). **RÉSOUT trivia cut content Dark Elf "Bewitching Arrow"** ✓ : Forest Runner = other Evergreen Forest mob avec Bewitchment ability canon (cut Dark Elf Bewitching Arrow to avoid redundancy). Pattern game design canon : status diversification per-area canon CONFIRMED ✓. **Wooing canon name NEW Forest Runner** ability canon. "Wooing only at red health" condition canon (HP ≤ 25% probable). Pattern thematic "Wooing" = attract/charm = Bewitchment narrative cohérent. À documenter `mobs/Forest Runner.md` (à créer) — Wooing ability canon Bewitchment proc + AI red health trigger. Source: [`features/mobs/_sources/fandom-dark-elf.md`](features/mobs/_sources/fandom-dark-elf.md).

- [ ] ⭐⭐ **🆕 JP HP 500 +11% variation NON systematic Dark Elf canon NEW MAJEUR ⭐** — Fandom HP US 450 / JP **500** = **+11% variation NON systematic** (vs typical +25%). Pattern **JP scaling variable per-mob canon** : +11% (Dark Elf) / +25% standard (Crystal Golem/Cute Cat/Bowling/Crocodile/Crescent Bee/Danton) / +67% extreme (Imago) / +122% extreme (Crescent Bee Wind variant). Gold ÷3 toujours constant canon. Damia adopt JP 500 canon. À documenter `combat/jp-us-stats-scaling.md` (à créer) — pattern JP scaling variable per-mob canon. Source: idem.

- [ ] ⭐ **🆕 Drop Kick canon name officiel Dark Elf NEW (fandom) ⭐** — Fandom révèle canon name (vs wiki ~Heel Drop community approximation). Pattern thematic "elf drop kick" canon. 1× phys damage baseline canon. Damia adopt fandom canon **Drop Kick** > wiki community ~Heel Drop. À mettre à jour ability data-model. Source: idem.

- [ ] **🆕 Petrify Arrow fandom shortened name (vs wiki "Petrifying Arrow") ⚠️** — Minor naming difference cross-source. Damia adopt wiki **Petrifying Arrow** (more formal canon name). Confirms cross-source Petrification 100% proc canon. Source: comparaison.

- [ ] **🆕 Detonate Arrow Magic Attack tag confirmed cross-source ⭐** — Fandom "Magic Attack" tag confirms wiki Non-Elemental magic damage canon. Pattern Detonate Arrow Party magic AoE canon confirmed cross-source. Source: idem.

- [ ] ⭐ **🆕 "Kill Dark Elf first" strategy canon NEW (fandom) ⭐** — Dark Elf = main threat (Petrify Arrow 100% from HP ≤ 50%). Forest Runner = secondary threat (Wooing only at red health = HP ≤ 25%). Pattern kill order canon : Dark Elf first → Forest Runner second. Strategy player priority canon. À documenter `combat/strategy.md` (à créer) party strategy canon par target. Source: idem.

- [ ] **🆕 Petrification removes character from combat canon explanation (fandom) ⭐** — Fandom : "Petrify an ally, effectively **removing a character from combat in one shot**". Pattern Petrification = combat removal canon (cohérent Erase mechanic similar). Pattern Damia : Petrification status = remove from combat canon. À documenter `combat/status-effects.md` (à créer) — Petrification removal mechanic canon. Source: idem.

- [ ] **🆕 Stats divergences Dark Elf wiki vs fandom ⚠️** :
  - AT : wiki **42** vs fandom **50** (+8 / +19%)
  - MAT : wiki **44** vs fandom **50** (+6 / +13%)
  - **MDF : wiki 180 vs fandom 120** ⚠️ MAJEUR divergence (-33%) — Damia adopt wiki **180** (pattern wiki tier 2 plus précis canon)
  - HP/DF/SPD/EXP match ✓
  - Damia adopt fandom higher AT 50 / MAT 50 probable (JP closer pattern récurrent)
  - À investiguer Discord MDF discrepancy. Source: comparaison.

- [ ] **🆕 JP Gold 12 ✓ ÷3 pattern systematic confirmed Dark Elf ⭐** — Fandom US 36 / JP **12** = ÷3 pattern systematic confirmed cohérent autres mobs. Damia adopt JP 12 canon. Source: idem.

- [ ] **🆕 Formations canon confirmed cross-source Dark Elf ⭐** — 3 formations identiques wiki tier 2 confirmé fandom : Dark Elf solo (133) + Dark Elf + Forest Runner (137) + Dark Elf + Flying Rat ×2 (138). Pattern Forest Runner + Flying Rat NEW mobs canon Evergreen Forest partners cross-source confirmed. Source: idem.

- [ ] **🆕 Dark Elf article fandom stub note ⭐** — Article fandom stub canon (informations limitées vs wiki tier 2 complet). Pattern fandom stub canon. Damia priorise wiki tier 2 pour stats + AI précis canon (vs fandom narrative). Source: idem.

### Mobs / Deadly Spider (Earth Mountain of Mortal Dragon Disc 3 — Status 5/3 deviation Poison immune NEW MAJEUR + AI 2-phase Cobweb 50% Arm-Blocking A-AV reduces 5ème pattern instance + Mega Sea Dragon NEW partner + Evil Spider recolor parent + Limestone Cave NEW location + Body Purifier 8% drop)

- [ ] **🆕 Deadly Spider canon data-model** — **Earth** element, HP 328 (JP +25% ~410 à confirmer), AT 60, DF 100 mid, MAT 42, **MDF 60 low anti-magic vulnerable**, SPD 50 low, A-AV/M-AV 0%. EXP 90 / Gold 39. Mob Mountain of Mortal Dragon Disc 3 interior dungeon only. Pattern "balanced Disc 3 physical-focused magic-vulnerable" canon. À implémenter `mobs/deadlySpider.ts`. Source: [`features/mobs/_sources/lod-wiki-deadly-spider.md`](features/mobs/_sources/lod-wiki-deadly-spider.md).

- [ ] ⭐⭐ **🆕 Status Immunity 5/3 deviation Poison immune NEW canon Deadly Spider MAJEUR ⭐⭐** — 5 immune (Petrify/Bewitch/Arm Block/Dispirit/**Poison**) / 3 vulnerable (Confuse/Fear/Stun). **Poison immunity NEW deviation** from standard 4/4 mob pattern. Cohérent thematic "spider venom = poison-resistant" canon biology. Pattern Minor Enemy Status varying per-mob canon : 4/4 standard / **5/3 NEW** / 6/2 / all 8 ✔ boss-tier. À documenter `combat/monster-categories.md` Status Immunity tier mapping update + `'minor-5-3-poison-immune'` profile NEW canon. Source: idem.

- [ ] ⭐ **🆕 Cobweb NEW canon name officiel Deadly Spider ⭐** — Wiki tier 2 canonical (NOT ~ approximation). Single target + **1× Physical damage + 50% chance Arm-Blocking proc** canon. Pattern thematic "spider web traps target arm" canon. **A-AV reduces Arm-Blocking proc canon**. À implémenter ability `cobweb` Damia 1× phys + 50% Arm-Blocking proc A-AV-reduced. Source: idem.

- [ ] ⭐⭐ **🆕 Pattern A-AV/M-AV per-ability classification CONFIRMED 5ème instance Deadly Spider Cobweb ⭐⭐** — Cross-mob pattern canon CONFIRMED étendu :
  - Crystal Golem ~Clap (physical-tagged Stun) → A-AV reduces
  - Cursed Jar Stunning Hammer (magical-tagged Stun) → M-AV reduces
  - Cute Cat Luring Dance (magical-tagged Bewitchment) → M-AV reduces
  - Dark Elf Petrifying Arrow (magical-tagged Petrification) → M-AV reduces
  - **Deadly Spider Cobweb (physical-tagged Arm-Blocking)** → **A-AV reduces** ⭐ 5ème instance NEW
  - Pattern : Magical-tagged ability → M-AV reduces / Physical-tagged ability → A-AV reduces
  - Pattern bien établi cross-mob (Crystal Golem + Cobweb physical → A-AV ; Stunning Hammer + Luring Dance + Petrifying Arrow magical → M-AV)
  - À documenter `combat/avoidance-tiers.md` (à créer) per-mob A-AV/M-AV tier mapping + per-ability classification canon. Source: idem.

- [ ] ⭐ **🆕 Mega Sea Dragon NEW mob canon Mountain of Mortal Dragon Disc 3 MAJEUR ⭐** — Deadly Spider formation partners (155 + 158). Pattern Mountain of Mortal Dragon Disc 3 mob ecosystem canon : Deadly Spider + Beastie Dragon + Baby Dragon + **Mega Sea Dragon** (4 mobs Disc 3 confirmed). Pattern "Mega" naming canon = upgraded/larger variant probable. Probable Water thematic (cohérent existing Sea Dragon Marshland Disc 1 — Mega = upgrade ?). À documenter `mobs/Mega Sea Dragon.md` (à créer) — Mountain of Mortal Dragon Disc 3 mob canon NEW. À investiguer relationship Mega Sea Dragon vs Sea Dragon Marshland Disc 1. Source: idem.

- [ ] ⭐⭐ **🆕 Evil Spider NEW mob canon (recolor parent Deadly Spider) + Limestone Cave NEW location canon MAJEUR ⭐⭐** — Wiki tier 2 trivia reveal : Deadly Spider model = recolor of **Evil Spider** located in **Limestone Cave**. Pattern recolor canon récurrent (cohérent existing) :
  - Berserk Mouse → Plague Rat
  - Crescent Bee → Stinger
  - Assassin Cock → Fowl Fighter
  - **Evil Spider → Deadly Spider** ⭐ NEW
    À documenter `mobs/Evil Spider.md` (à créer) — parent recolor mob canon Limestone Cave + `locations/Limestone Cave.md` (à créer) — Evil Spider location canon (Disc ? à investiguer, probable Disc 1-2 early). Pattern asset reuse canon. Pattern Damia : `MobRecolor { parent; variant }` data-model canon. Source: idem.

- [ ] ⭐ **🆕 Body Purifier 8% drop source canon Deadly Spider ⭐** — Pattern thematic IRONIC ⭐ : Poison-immune mob drops Poison cure (vs typical Poison-inflicting mob dropping cure). Cohérent existing item canon **Body Purifier** (cures Poison status). Pattern multi-mob drop source canon (Deadly Spider + Arrow Shooter existing ? + autres ?). À documenter `items/consumables.md` Body Purifier entry — Deadly Spider 8% Disc 3 source canon. Source: idem.

- [ ] **🆕 Counter 16 mid-low tier Deadly Spider confirmed ⭐** — Cohérent pattern **Unique Jars (Lucky/Treasure/Cursed) + Cactus + Deadly Spider** Counter 16 tier mid-low density. Pattern 8 tiers canon : 0 / 3 / 4 / 9 / **16** / 19 / 23 / 28. Source: idem.

- [ ] **🆕 Mountain of Mortal Dragon Disc 3 location canon Deadly Spider ⭐** — Submaps 413-427 (massive coverage). Cohérent existing **Baby Dragon + Beastie Dragon** Mountain of Mortal Dragon Disc 3 canon (Disc 3 Mountain Wind area). Pattern Disc 3 mob ecosystem canon massive. À documenter `locations/Mountain of Mortal Dragon.md` (à créer) — Disc 3 Mountain area canon. Source: idem.

- [ ] **🆕 Deadly Spider World Map = None canon** — Pattern Deadly Spider = location-only canon (no World Map road spawn). Pattern Mountain of Mortal Dragon mob = interior dungeon canon. Source: idem.

- [ ] **🆕 Escape rate 30% canon Mountain of Mortal Dragon Disc 3 ⭐** — Pattern Disc 3 standard escape canon (vs Disc 1 elevated rates). Pattern late-game lower escape rates canon. Source: idem.

- [ ] **🆕 ~Bite canon name (community) Deadly Spider** — Wiki community approximation > 25% baseline ability. 1× phys damage canon. Pattern thematic "spider bite". Source: idem.

- [ ] **🆕 Pattern Spider thematic web-trap canon Deadly Spider ⭐** — Cobweb late-game ability + Arm-Blocking status = web traps target arm thematic. Pattern AI 2-phase spider canon : Bite baseline + Cobweb wounded. À investiguer Evil Spider AI cross-mob shared (recolor pattern shared abilities ?). Source: idem.

### Mobs / Deadly Spider fandom complement — JP HP 410 ✓ +25% systematic CONFIRMED + Appearance canon NEW + Gnaw canon name officiel + Arm-Blocking 3-5 turns duration REVEALED NEW MAJEUR + Cobweb damage type wiki/fandom divergence + Body Purifier 10 gold shop canon + Encounter "Very common"

- [ ] ⭐⭐ **🆕 Deadly Spider JP stats CONFIRMED +25% systematic fandom MAJEUR ⭐⭐** — HP US 328 / JP **410** ✓ (+25% pattern systematic confirmé, 328 × 1.25 = 410 exact) + Gold US 39 / JP **13** ✓ (÷3 pattern systematic confirmé, 39 ÷ 3 = 13 exact). Damia adopt JP 410/13. Cohérent décision projet adopt JP. Pattern JP/US conversion canon récurrent confirmé (cohérent Bowling/Crocodile/Crescent Bee/Crystal Golem/Cute Cat/Danton — Dark Elf reste exception +11% variant). Source: [`features/mobs/_sources/fandom-deadly-spider.md`](features/mobs/_sources/fandom-deadly-spider.md).

- [ ] ⭐⭐ **🆕 Appearance canon Deadly Spider NEW MAJEUR ⭐⭐** — Fandom révèle visual canon :
  - **Giant size = small deer scale** (imposing creature canon vs typical mob spider size)
  - **Green and grey/white fur** = visual palette canon
  - **8 eyes total** : 3 large horizontal + 3 small above + 2 below = arachnid eye configuration canon
  - **4 large pincers on face** = predatory canon
    À refléter sprite design Damia. Pattern thematic predatory giant spider canon. Source: idem.

- [ ] ⭐ **🆕 Gnaw canon name officiel Deadly Spider NEW (fandom) ⭐** — Fandom révèle canon name (vs wiki ~Bite community approximation). Description : "Runs towards single target, biting them for medium physical damage". Pattern thematic "spider gnaw bite" canon. Damia adopt fandom canon **Gnaw** > wiki community ~Bite. À mettre à jour ability data-model. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Arm-Blocking 3-5 turns duration canon REVEALED NEW MAJEUR (fandom) ⭐⭐⭐** — Pattern Status Arm-Blocking canon mechanic reveal NEW canon : prevent character from attacking physically for **3-5 turns**. Pattern status proc duration RNG canon NEW (3-5 random range). À documenter `combat/status-effects.md` (à créer) — Arm-Blocking 3-5 turns duration canon. À implémenter `ArmBlockingStatus { type: 'physical-attack-block'; duration: { min: 3; max: 5; random: true } }` data-model Damia. Pattern Status duration canon mécanique précise NEW. Cross-référer autres status durations (Petrification / Bewitchment / etc.) canon. Source: idem.

- [ ] ⚠️ **🆕 Cobweb damage type DIVERGENCE wiki Physical vs fandom Magic MAJEUR ⚠️** — Wiki tier 2 : "1× **Physical** damage + 50% Arm-Blocking" + "A-AV reduces". Fandom : "Spits cobweb dealing medium **MAGIC** damage + Arm-Blocking". ⚠️ Damage type divergence : wiki Physical vs fandom Magic. Pattern interpretation : Wiki tier 2 = canonical mechanic (A-AV reduces → physical-tagged ability canon confirmé pattern A-AV/M-AV per-ability) / Fandom = narrative interpretation (cobweb spit = magical-feeling visual). ⚠️ **Damia adopt wiki Physical canon** (cohérent A-AV reduction pattern classification). Pattern Cobweb = ranged projectile physical-tagged canon. À investiguer Discord pattern précis Cobweb damage type. Source: comparaison.

- [ ] ⭐ **🆕 Body Purifier 10 gold all item shops canon Deadly Spider (fandom) ⭐** — Fandom révèle : "This item can be bought for 10 gold at any item shop". Pattern Body Purifier = shop-purchasable item canon (cohérent Pellet 10 gold all shops + Mind Purifier 20 gold shop existing canon). Pattern shop pricing canon récurrent. À documenter `items/consumables.md` Body Purifier shop canon entry. Pattern Mind Purifier 20 gold + Body Purifier 10 gold + Pellet 10 gold all shops pricing canon récurrent. Source: idem.

- [ ] ⭐ **🆕 Encounter rate "Very common" canon Deadly Spider (fandom) ⭐** — Pattern encounter rate canon : Very common (cohérent Bowling Very common Disc 3 pattern existing). Pattern Mountain of Mortal Dragon Disc 3 mob frequency canon. Cohérent farming Body Purifier 8% rate viable canon. Source: idem.

- [ ] **🆕 Stats divergences Deadly Spider wiki vs fandom ⚠️** :
  - AT : wiki **60** vs fandom **68** (+8 / +13%)
  - MAT : wiki **42** vs fandom **48** (+6 / +14%)
  - HP/DF/MDF/SPD/EXP match ✓
  - → Damia adopt fandom higher AT 68 / MAT 48 probable (JP closer pattern récurrent)
    Source: comparaison.

- [ ] **🆕 "Immune to poison" cross-source confirmed Deadly Spider ⭐** — Fandom confirme wiki Status 5/3 deviation Poison immune canon. Cohérent thematic "spider venom = poison-resistant" biology canon. Cross-source confirmation Status 5/3 NEW canon. Source: idem.

- [ ] **🆕 Formations canon confirmed cross-source + NEW reveal Deadly Spider ⭐** — 4 formations canon fandom (vs wiki tier 2 4 formations) :
  - Deadly Spider solo (formation 153 wiki ✓)
  - Deadly Spider + Beastie Dragon (formation 157 wiki ✓)
  - **Deadly Spider + Mega Sea Dragon** ⭐ NEW (vs wiki formation 155 = Mega Sea Dragon + Deadly Spider — same different naming order)
  - Deadly Spider + Mega Sea Dragon ×2 (formation 158 wiki ✓)
    Pattern Mega Sea Dragon NEW mob canon Mountain of Mortal Dragon partner confirmé cross-source. Pattern Beastie Dragon existing partner confirmé cross-source. Source: idem.

- [ ] **🆕 Rose + Dart party member Mountain of Mortal Dragon Disc 3 canon confirmed gallery ⭐** — Image gallery Deadly Spider Cobweb on Rose + Gnaw on Dart confirme party composition Mountain of Mortal Dragon Disc 3 canon. Cohérent existing Disc 3 party composition canon. Source: idem.

### Mobs / Death (Darkness Phantom Ship Disc 2 — Status 7/1 NEW extreme deviation Poison-only-vulnerable MAJEUR + Total Vanishing 8% drop signature ironic + Instant Death Immunity passive 3ème instance + Can't Combat NEW Mob Instant Death offensive 2ème instance + Midnight Terror NEW Fear M-AV 6ème pattern + Charging Spirit dual-option + Contact ×3 encounter NEW + Will-o'-Wisp NEW partner + Death Purger Zenebatos recolor parent NEW)

- [ ] **🆕 Death canon data-model** — **Darkness** element, HP **200 low** Disc 2 (JP +25% ~250 à confirmer), AT 50, DF 120 high anti-physical, MAT 35, **MDF 60 low anti-magic vulnerable**, SPD 50 low, A-AV/M-AV 0%. EXP 66 / Gold 30. Mob Phantom Ship Disc 2 interior dungeon only. Pattern "low HP physical-tank magic-vulnerable" canon (glass cannon defensive). À implémenter `mobs/death.ts`. Source: [`features/mobs/_sources/lod-wiki-death.md`](features/mobs/_sources/lod-wiki-death.md).

- [ ] ⭐⭐⭐ **🆕 Status Immunity 7/1 deviation NEW MAJEUR canon Death only Poison vulnerable ⭐⭐⭐** — Most extreme deviation tier yet : **7 immune** (Petrify/Bewitch/Arm Block/Dispirit/Confuse/Fear/Stun) / **1 vulnerable** (only **Poison**). Pattern Minor Enemy Status tier mapping étendu : 4/4 standard / 5/3 (Deadly Spider) / 6/2 / **7/1 Death NEW** / all 8 ✔ (Bowling/Crystal Golem). Pattern thematic IRONIC ⭐ "Death-themed mob immune to almost everything except Poison" biology paradox canon. Pattern Death = near-boss-tier immunity Mob canon (1 step from all 8 ✔). À documenter `combat/monster-categories.md` Status Immunity tier mapping update + `'minor-7-1-poison-only'` profile NEW canon. Source: idem.

- [ ] ⭐⭐⭐ **🆕 TOTAL VANISHING 8% drop source canon REVEALED MAJEUR ⭐⭐⭐** — Death Phantom Ship Disc 2 drops Total Vanishing 8% (Attack Item one-shot mob killer existing canon per user instruction). Pattern thematic IRONIC ⭐⭐ : Death drops Total Vanishing (Death-themed one-shot item = perfect thematic match — "Death gives you Death"). Pattern Death drop = signature item canon. À documenter `items/consumables.md` Total Vanishing entry — Death 8% Phantom Ship Disc 2 source canon. Pattern multi-mob drop source canon Total Vanishing (Death + Beastie Dragon ? + autres). Source: idem.

- [ ] ⭐⭐ **🆕 Instant Death Immunity Mob passive canon 3ème instance Death ⭐⭐** — Cohérent existing **Commander Marshland Instant Death Immunity passive canon** (Boss) + **Crystal Golem Instant Death Immunity passive canon** (Minor) + **Death Instant Death Immunity passive canon** (Minor) ⭐ NEW 3ème instance. Pattern Mob Instant Death Immunity passive canon cross-mob confirmé : 3 mobs (1 Boss + 2 Minor). Immune Can't Combat Weapons (Gladius / Brass Knuckle / Indora's Axe). Pattern thematic IRONIC MAJEUR ⭐ : "Death-themed mob immune to Death dealing Death (Can't Combat ability)" canon. À documenter `combat/mob-passives.md` (à créer) — pattern Mob Instant Death Immunity passives canon : 3 mobs confirmed. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Can't Combat NEW Mob Instant Death offensive ability canon 2ème instance Death MAJEUR ⭐⭐⭐** — Wiki tier 2 canonical. Single target + **Inflicts Instant Death** canon. Pattern Mob "Can't Combat" Instant Death offensive ability canon NEW 2ème instance : 1ère = **Cute Cat Dance of Death** (existing) / 2ème = **Death Can't Combat** ⭐ NEW. Pattern Mob Instant Death offensive canon récurrent confirmé cross-mob. Cohérent existing **Erase mechanic 4-tier player canon** — Mob equivalent canon confirmé. À implémenter ability `cantCombat` Damia Mob Instant Death "Can't Combat" canon. Pattern thematic IRONIC ⭐⭐ : "Death uses Can't Combat" — perfect thematic match Mob name + ability. Source: idem.

- [ ] ⭐ **🆕 Midnight Terror NEW canon name officiel Death ⭐** — Wiki tier 2 canonical (NOT ~ approximation). Single target + **100% chance Fear proc** canon. **M-AV reduces Fear proc canon**. Pattern thematic "midnight terror" = night-fear Darkness canon. À implémenter ability `midnightTerror` Damia Single 100% Fear proc M-AV-reduced. Source: idem.

- [ ] ⭐⭐ **🆕 Pattern A-AV/M-AV per-ability classification CONFIRMED 6ème instance Death Midnight Terror ⭐⭐** — Cross-mob pattern canon CONFIRMED bien établi étendu :
  - Crystal Golem ~Clap (physical-tagged Stun) → A-AV reduces
  - Cursed Jar Stunning Hammer (magical-tagged Stun) → M-AV reduces
  - Cute Cat Luring Dance (magical-tagged Bewitchment) → M-AV reduces
  - Dark Elf Petrifying Arrow (magical-tagged Petrification) → M-AV reduces
  - Deadly Spider Cobweb (physical-tagged Arm-Blocking) → A-AV reduces
  - **Death Midnight Terror (magical-tagged Fear)** → **M-AV reduces** ⭐ 6ème instance NEW
  - Pattern : Magical-tagged ability → M-AV reduces / Physical-tagged ability → A-AV reduces
  - Pattern bien établi cross-mob CONFIRMED MAJEUR : 2 physical → A-AV (Clap + Cobweb) ; 4 magical → M-AV (Stunning Hammer + Luring Dance + Petrifying Arrow + Midnight Terror)
  - À documenter `combat/avoidance-tiers.md` (à créer) per-mob A-AV/M-AV tier mapping + per-ability classification canon. Source: idem.

- [ ] ⭐⭐ **🆕 Charging Spirit dual-option Death canon MAJEUR ⭐** — Telegraph dual-option : Midnight Terror OR Can't Combat next turn. Pattern Air Combat-style **dual-option Charging Spirit canon** (cohérent existing Cute Cat Fury Swipes OR Dance of Death pattern). Pattern Death = "dual" canon. À implémenter `MobAI.chargingSpiritOptions: 'single' | 'dual'` data-model (cohérent existing canon Bowling fandom). Source: idem.

- [ ] ⭐ **🆕 AI HP-based avec chance modifiers complex 4-phase NEW canon Death MAJEUR ⭐** — Pattern AI Minor Enemy avec chance distribution per HP zone complex :
  - **Phase HP > 50%** : 25% Charging Spirit (dual-option telegraph) + 75% ~Reaping Slash (1× phys baseline)
  - **Phase HP > 25%** : 75% ~Reaping Slash baseline (overlap zone > 50%)
  - **Phase HP ≤ 25%** : 25% Midnight Terror (100% Fear M-AV reduces) + **75% Can't Combat (Instant Death)** ⚠️ DANGEREUX
    Pattern dangereux ≤ 25% canon ⭐ : 75% chance Instant Death (Can't Combat) at low HP — high threat majeur Mob. À implémenter `MobAIHpChanceComplex` data-model. Source: idem.

- [ ] ⭐⭐ **🆕 Contact ×3 encounter type NEW canon Death MAJEUR ⭐⭐** — Pattern **visible mob encounter mechanic canon** : "Contact" = player must touch visible mob to trigger battle (vs typical random encounter rate). ×3 = 3 spawn instances probable (3 visible mobs in submaps 288/291/296). Pattern Phantom Ship Disc 2 visible mob canon (cohérent ghost-themed dungeon). Cohérent existing **Berserker Contact arrows encounter NEW canon** Disc 2 Home of Gigantos pattern. À documenter `combat/encounter-mechanics.md` (à créer) — Contact encounter type canon. Pattern Damia : `EncounterType { type: 'random' | 'contact'; visibleMob: boolean; instances?: number }` data-model canon. Source: idem.

- [ ] ⭐ **🆕 Will-o'-Wisp NEW mob canon Phantom Ship Disc 2 MAJEUR ⭐** — Death formation partner ×2 (formation 453). Pattern Phantom Ship Disc 2 mob ecosystem canon : Death + **Will-o'-Wisp** (2 mobs Disc 2 confirmed). Pattern thematic "Will-o'-Wisp ghostly spirit" canon (cohérent Phantom Ship thematic ghost dungeon). À documenter `mobs/Will-o'-Wisp.md` (à créer) — Phantom Ship Disc 2 mob canon NEW. Source: idem.

- [ ] ⭐⭐ **🆕 Death Purger NEW mob canon (recolor parent Zenebatos Disc 4) + Trivia recolor reveal MAJEUR ⭐⭐** — Wiki tier 2 trivia reveal : Death model = recolor of **Death Purger** located in **Zenebatos**. **Death Purger** = NEW mob canon (parent recolor) + **Zenebatos** = existing canon Disc 4 (Wingly forest city location). Pattern recolor canon récurrent (cohérent existing Plague Rat / Stinger / Fowl Fighter / Deadly Spider). Pattern **Disc 4 → Disc 2 reverse-recolor** canon ? À investiguer chronology design. À documenter `mobs/Death Purger.md` (à créer) — Zenebatos Disc 4 mob canon NEW (parent recolor). ⚠️ Pattern naming inversion : "Death Purger" ≠ "Death" — Death Purger thematic "purger" suggests Wingly thematic Zenebatos canon. Source: idem.

- [ ] **🆕 Phantom Ship Disc 2 location canon Death ⭐** — Submaps 288, 291, 296. Cohérent existing Phantom Ship Disc 2 canon (Halberd weapon source existing canon — Lavitz's Spirit Mayfil reveal). Pattern Phantom Ship Disc 2 mob ecosystem canon. À documenter `locations/Phantom Ship.md` (à créer) — Disc 2 ghost-themed dungeon area canon. Source: idem.

- [ ] **🆕 Death World Map = None canon** — Pattern Death = location-only canon (no World Map road spawn). Pattern Phantom Ship mob = interior dungeon canon. Source: idem.

- [ ] **🆕 Escape rate 30% canon Phantom Ship Disc 2 Death ⭐** — Pattern Disc 2 standard escape canon. Pattern Phantom Ship interior dungeon escape canon. Source: idem.

- [ ] **🆕 ~Reaping Slash canon name (community) Death** — Wiki community approximation > 25% baseline ability. 1× phys damage canon. Pattern thematic "death reap scythe". Source: idem.

- [ ] **🆕 Pattern thematic IRONIC Death canon MAJEUR ⭐⭐** — Pattern design canon récurrent Death-themed mob :
  - Status 7/1 = near-boss-tier immunity (biology paradox)
  - Instant Death Immunity passive (immune to Death weapons)
  - Can't Combat Instant Death offensive ability (deals Death)
  - Total Vanishing item drop (Death-themed one-shot weapon)
    Pattern design canon "Death-themed perfect" — design philosophy ironique. Source: idem.

### Mobs / Death fandom complement — JP HP 250 ✓ +25% systematic CONFIRMED + Appearance Grim Reaper + Des Rapier canon name + All-Out Attack NEW separate ability + Lightning Punisher canon name + Skeleton + Magician Bogey NEW mobs + Charging Spirit triple-option NEW + No-return Phantom Ship canon + Total Vanishing farming canon

- [ ] ⭐⭐ **🆕 Death JP stats CONFIRMED +25% systematic fandom MAJEUR ⭐⭐** — HP US 200 / JP **250** ✓ (+25% pattern systematic, 200 × 1.25 = 250 exact) + Gold US 30 / JP **10** ✓ (÷3 pattern systematic, 30 ÷ 3 = 10 exact). Damia adopt JP 250/10. Pattern JP/US conversion canon récurrent confirmé (cohérent autres mobs +25% standard). Source: [`features/mobs/_sources/fandom-death.md`](features/mobs/_sources/fandom-death.md).

- [ ] ⭐⭐ **🆕 Appearance canon Death NEW MAJEUR (fandom) ⭐⭐** — Fandom révèle visual canon : "**traditional Grim Reaper** + **bare skulls** + **skeletal hands wielding Scythe** + **long black cloak**". Pattern thematic classic Grim Reaper canon. À refléter sprite design Damia : Grim Reaper Scythe + black cloak + skeletal. Source: idem.

- [ ] ⭐⭐ **🆕 Des Rapier canon name officiel Death NEW (fandom) ⭐⭐** — Fandom révèle canon name (vs wiki ~Reaping Slash community approximation). Description : "Floats towards single target swings Scythe medium physical damage". Pattern thematic "Des Rapier" — "Des" préfixe (Death German "der" / French thematic). Pattern Scythe weapon canon (cohérent Grim Reaper appearance). Damia adopt fandom canon **Des Rapier** > wiki community ~Reaping Slash. Source: idem.

- [ ] ⭐⭐⭐ **🆕 All-Out Attack NEW canon ability separate Death MAJEUR (fandom) ⭐⭐⭐** — Wiki tier 2 listed only Charging Spirit dual-option (Midnight Terror OR Can't Combat) — fandom révèle **All-Out Attack** = separate ability "massive physical damage" canon (~50% target HP probable). Pattern Charging Spirit **triple-option** canon NEW Death : Midnight Terror OR Lightning Punisher OR All-Out Attack ⚠️. Cohérent existing All-Out Attack canon shared ability (Bowling / Air Combat existing pattern). À reconcilier wiki/fandom — fandom plus complète canon. À implémenter `allOutAttack` ability Damia Mob Charging Spirit triple-option canon. À implémenter `MobAI.chargingSpiritOptions: 'single' | 'dual' | 'triple'` data-model étendu canon NEW. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Lightning Punisher canon name officiel Death NEW MAJEUR (fandom) ⭐⭐⭐** — Fandom révèle canon name ability (vs wiki "Can't Combat" — wiki used status name as ability name). Description : "Inflicts the status ailment Can't Combat upon single target". Pattern naming canon : ability name (Lightning Punisher) ≠ status name (Can't Combat). Pattern thematic "Lightning Punisher" Thunder thematic ironic (Death = Darkness mais uses Lightning-named ability). Damia adopt fandom canon **Lightning Punisher** > wiki "Can't Combat" ability naming. Pattern Mob Instant Death offensive 2 abilities confirmed canon : **Cute Cat Dance of Death + Death Lightning Punisher** both inflict Can't Combat status (different ability names). À implémenter ability `lightningPunisher` Damia Mob Instant Death "Can't Combat" canon. Source: idem.

- [ ] ⭐ **🆕 Midnight Terror minor damage addition canon NEW (fandom) ⭐** — Fandom révèle : Midnight Terror = 100% Fear proc + **"some minor damage"** (vs wiki tier 2 100% Fear only, no damage mention). Pattern Midnight Terror = Fear proc + minor magic damage canon NEW (cohérent magic ability + damage typique). À reconcilier exact damage multiplier (probable 0.5× or 1× magic). À mettre à jour ability `midnightTerror` data-model avec minor damage. Source: idem.

- [ ] ⭐⭐ **🆕 Skeleton NEW mob canon Phantom Ship Disc 2 MAJEUR (fandom) ⭐⭐** — Fandom révèle formation "Death ×2 + Skeleton" canon. **Skeleton** = NEW mob canon Phantom Ship Disc 2. Pattern thematic "Skeleton" cohérent Phantom Ship ghost-themed dungeon canon. À documenter `mobs/Skeleton.md` (à créer) — Phantom Ship Disc 2 mob canon NEW. Pattern Phantom Ship Disc 2 mob ecosystem étendu : Death + Will-O-Wisp + **Skeleton** + **Magician Bogey** (4 mobs Disc 2 confirmed). Source: idem.

- [ ] ⭐ **🆕 Magician Bogey NEW mob canon Phantom Ship Disc 2 "limited" (fandom) ⭐** — Fandom mentionne **Magician Bogey** = NEW mob canon Phantom Ship Disc 2 ("most annoying enemy other than the limited Magician Bogey"). "Limited" = rare/specific encounter canon (probable spawn rare ou scripted). À documenter `mobs/Magician Bogey.md` (à créer) — Phantom Ship Disc 2 mob canon NEW. Pattern "limited" encounter mob canon NEW (à investiguer mécanique précise). Source: idem.

- [ ] ⭐⭐ **🆕 NEW formations canon Death fandom MAJEUR ⭐** — Wiki tier 2 listed only 1 formation (Will-O-Wisp ×2 + Death — 453). Fandom révèle 4 formations canon total :
  - Death solo
  - Death + Will-O-Wisp ×2 (wiki ✓)
  - **Death ×2** ⭐ NEW (formation duo)
  - **Death ×2 + Skeleton** ⭐⭐ NEW
    "Both on rare occasion" canon = Death ×2 + Skeleton rare encounter. Pattern Phantom Ship Disc 2 ecosystem étendu cross-source. Source: idem.

- [ ] ⭐⭐ **🆕 "No returning to Phantom Ship" canon NEW MAJEUR (fandom) ⭐⭐** — Phantom Ship = **one-time area canon** (no return after story progression). Pattern story-progression canon : Phantom Ship Disc 2 → permanent advance. ⚠️ Player must farm Total Vanishing during Phantom Ship visit if wanted. "But you will still be able to find more later in the game" = Total Vanishing other sources canon (à investiguer — Beastie Dragon Disc 3 ?). Pattern multi-source canon Total Vanishing : Phantom Ship Disc 2 (Death) + later (à confirmer). À documenter `locations/Phantom Ship.md` (à créer) — Disc 2 one-time area canon. Pattern Damia : data-model `LocationCanon { oneTimeArea?: boolean; postStoryNoReturn?: boolean }` canon. Source: idem.

- [ ] ⭐ **🆕 "Prioritize killing Death immediately" strategy canon NEW (fandom) ⭐** — Fandom : "Hands down, if this creature is fighting you, regardless of whatever other creatures are with it, **prioritize killing this immediately**". Death = top priority kill canon Phantom Ship Disc 2. Pattern threat level canon : Death = highest threat in encounter. Strategy canon : kill Death first regardless of formation partners. Cohérent existing Cute Cat Dance of Death threat pattern (Instant Death offensive). À documenter `combat/strategy.md` (à créer) priority-target canon par mob. Source: idem.

- [ ] ⭐ **🆕 Total Vanishing farming canon Death (fandom) ⭐** — Fandom : "30+ minutes average" farming time canon (cohérent 8% drop + Uncommon encounter). "Instantly destroy minor enemies with it" canon ✓ confirme Attack Item one-shot mob killer canon (cohérent existing Beastie Dragon reveal). Pattern Total Vanishing = Attack Item one-shot minor mob killer canon confirmed cross-source. À documenter `items/consumables.md` Total Vanishing canon farming time + sources canon. Source: idem.

- [ ] ⭐ **🆕 Encounter rate "Uncommon" canon Death (fandom) ⭐** — Pattern encounter rate canon : Uncommon (cohérent Crescent Bee / Crocodile Uncommon Disc 1 pattern existing). Pattern Phantom Ship Disc 2 mob frequency canon. Source: idem.

- [ ] **🆕 Stats divergences Death wiki vs fandom ⚠️** :
  - AT : wiki **50** vs fandom **56** (+6 / +12%)
  - MAT : wiki **35** vs fandom **40** (+5 / +14%)
  - HP/DF/MDF/SPD/EXP match ✓
  - → Damia adopt fandom higher AT 56 / MAT 40 probable (JP closer pattern récurrent)
    Source: comparaison.

- [ ] **🆕 Charging Spirit description fandom "special or All-Out Attack" canon ⭐** — Fandom : "Prepares to do a special or All-Out Attack". Pattern Charging Spirit triple-option Death canon confirmé fandom (cohérent wiki Midnight Terror/Can't Combat dual + fandom adds All-Out Attack triple). Pattern Damia adopt triple-option canon fandom-enriched. Source: idem.

- [ ] **🆕 Will-O-Wisp formation cross-source confirmed Death ⭐** — Fandom confirme formation Death + Will-O-Wisp ×2 canon (cohérent wiki formation 453). Pattern Will-O-Wisp NEW mob canon Phantom Ship partner confirmé cross-source. Source: idem.

### Mobs / Death Purger wiki (Darkness Zenebatos Disc 4 — recolor VARIANT Death + CORRECTION reciprocal claim + Status 7/1 shared + Total Vanishing 8% shared + Instant Death Immunity passive 4ème instance + Power up NEW Self-buff ability + A-AV 10% tier + Guillotine + Professor NEW mobs partners)

- [ ] ⭐⭐ **🆕 Death Purger canon data-model** — **Darkness** element, HP 532 (JP +25% ~665 à confirmer), AT 83, DF 120 high, MAT 58, MDF 100 mid, SPD 50 low, **A-AV 10% NEW tier**, M-AV 0%. EXP 144 / Gold 24. Mob Zenebatos Disc 4 interior dungeon only. **Recolor variant of Death** (Phantom Ship Disc 2 parent canon). Pattern Disc 4 upgraded variant Death : +166% HP / +66% AT/MAT/MDF / +10% A-AV vs Death. À implémenter `mobs/deathPurger.ts`. Source: [`features/mobs/_sources/lod-wiki-death-purger.md`](features/mobs/_sources/lod-wiki-death-purger.md).

- [ ] ⭐⭐ **🆕 Recolor canon CORRECTION reciprocal claim Death ↔ Death Purger MAJEUR ⭐⭐** — Wiki tier 2 reciprocal claim cross-page (Death dit "recolor of Death Purger" / Death Purger dit "recolor of Death"). Damia adopt **chronological canon** : Death (Disc 2 first appearance) = parent / Death Purger (Disc 4 upgraded variant) = recolor. Pattern recolor = chronological asset reuse canon. CORRECTION existing Death.md trivia appliquée. Pattern recolor canon récurrent confirmé : Death → Death Purger ⭐ NEW (Disc 2 parent → Disc 4 variant). Pattern Damia `MobRecolor { parent: 'death'; variant: 'deathPurger'; chronological: 'disc-2-to-disc-4' }` data-model canon. Source: idem.

- [ ] ⭐⭐ **🆕 Status 7/1 deviation cohérent Death recolor shared canon Death Purger ⭐⭐** — 7 immune / 1 vulnerable (only Poison) identique Death canon ✓. **Pattern recolor shared Status Immunity NEW canon** ⭐ : Death family (Death + Death Purger) = same 7/1 only-Poison-vulnerable. Pattern thematic IRONIC cohérent Death : "Death-themed mob immune to almost everything except Poison" biology paradox canon. Pattern recolor canon shared Status profile (à investiguer si tous recolors shared Status — Plague Rat vs Berserk Mouse ?). Source: idem.

- [ ] ⭐⭐⭐ **🆕 Power up NEW canon ability MAJEUR Death Purger ⭐⭐⭐** — Wiki tier 2 canonical (NOT ~ approximation). Self-buff : **Increases damage inflicted + reduces damage received by 50% for 3 turns** canon. Pattern Mob Self-buff ability canon NEW (vs typical mob direct-damage abilities). Pattern dual-effect buff canon : offensive +damage + defensive -damage received simultanément 50% canon. À implémenter ability `powerUp` Damia Self-buff 3-turn duration +damage/-damage received 50%. Pattern Damia : `PowerUpAbility { type: 'self-buff-dual'; duration: 3; effects: ['damage-increase-50', 'damage-reduction-50'] }` data-model canon. À documenter `combat/mob-buffs.md` (à créer) Mob Self-buff abilities canon. Source: idem.

- [ ] ⭐⭐ **🆕 Total Vanishing 8% drop canon shared Death recolor Death Purger MAJEUR ⭐⭐** — Identique Death canon ✓ pattern **recolor shared signature drop canon** ⭐. Pattern Damia : `MobRecolor` shared drop canon (recolor inherits parent drop). ⭐ **Résout fandom Death reveal "no return to Phantom Ship, find more later in game"** — **Death Purger Disc 4 = "later in game" Total Vanishing source canon** ✓ confirmed cross-source. Pattern multi-source Total Vanishing canon confirmed : Phantom Ship Disc 2 (Death) one-time + **Zenebatos Disc 4 (Death Purger)** late-game permanent. À documenter `items/consumables.md` Total Vanishing Death + Death Purger 8% drop sources canon. Source: idem.

- [ ] ⭐⭐ **🆕 Instant Death Immunity passive Mob canon 4ème instance Death Purger ⭐⭐** — Cohérent existing **Commander Marshland (Boss) + Crystal Golem (Minor) + Death (Minor) + Death Purger (Minor)** ⭐ NEW 4ème instance ✓. Pattern Mob Instant Death Immunity passive canon : 4 mobs confirmed. Pattern thematic IRONIC cohérent Death family : "Death-themed mob immune to Death dealing Death (Can't Combat ability)" canon. À documenter `combat/mob-passives.md` (à créer) — 4 mobs Instant Death Immunity confirmed canon. Source: idem.

- [ ] ⭐ **🆕 A-AV 10% canon Death Purger tier confirmed ⭐** — Pattern A-AV 10% tier canon récurrent : Canbria Dayfly (existing) + **Death Purger** (NEW) ✓ confirmed cross-mob. Pattern A-AV/M-AV tier mapping étendu : 0% (majoritaire) / 5% (Cute Cat + Boss Extras Dark Doel) / **10% (Canbria Dayfly + Death Purger)** / 20% (Crescent Bee) / 50% (à confirmer). À documenter `combat/avoidance-tiers.md` (à créer). Source: idem.

- [ ] ⭐⭐ **🆕 Guillotine + Professor NEW mobs canon Zenebatos Disc 4 MAJEUR ⭐⭐** — Death Purger formation partners :
  - **Guillotine** = NEW mob canon Zenebatos Disc 4 (formation 246 partner)
  - **Professor** = NEW mob canon Zenebatos Disc 4 (formation 249 partner ×2 Death Purger)
    Pattern Zenebatos Disc 4 mob ecosystem canon : Death Purger + **Guillotine** + **Professor** (3 mobs Disc 4 confirmed). Pattern thematic Wingly Zenebatos canon : "Purger" + "Guillotine" + "Professor" = punisher/judicial/scholar thematic (Wingly machinery thematic). À documenter `mobs/Guillotine.md` + `mobs/Professor.md` (à créer) — Zenebatos Disc 4 mobs canon NEW. Source: idem.

- [ ] **🆕 Can't Combat canon wiki naming Death Purger ⚠️** — Wiki uses "Can't Combat" (status name as ability name) — cohérent wiki Death naming. Fandom Death révèle **Lightning Punisher** ability name. Possible interprétation : Death Purger Can't Combat = same ability mechanically as Death Lightning Punisher (shared canon abilities cross-recolor). À investiguer fandom Death Purger if Lightning Punisher canon name shared OR different ability canon. À documenter `combat/instant-death.md` (à créer) Mob Instant Death offensive abilities canon. Source: idem.

- [ ] **🆕 ~Reaping Slash canon name shared Death recolor Death Purger ⭐** — Community approximation any-HP baseline ability (cohérent Death shared ~ ability — recolor shared). 1× phys damage canon. Pattern thematic "death reap scythe" canon. ⚠️ Note : Death fandom révèle canon **Des Rapier** > wiki ~Reaping Slash — à cross-référer Death Purger fandom future ingestion si shared. Source: idem.

- [ ] **🆕 AI 3-phase Death Purger canon ⭐** — Pattern AI cycle canon : baseline Reaping Slash 75% + late-game burst Power up 25% (HP > 25%) OR Can't Combat 25% (HP ≤ 25%). Pattern recolor AI complexity variation canon : Death (4-phase Charging Spirit triple-option complex) vs Death Purger (3-phase simpler). Pattern recolor AI canon : parent complexity > variant simpler — recolor variation canon NEW à investiguer pattern universel. Source: idem.

- [ ] **🆕 Pattern Death family recolor canon shared MAJEUR ⭐⭐** — 9 propriétés partagées Death (parent) ↔ Death Purger (variant) :
  - Element Darkness (shared)
  - Status 7/1 only-Poison-vulnerable (shared)
  - Instant Death Immunity passive (shared)
  - Counter 28 high-density tier (shared)
  - Total Vanishing 8% drop (shared signature)
  - Can't Combat ability (shared — same Instant Death effect)
  - Reaping Slash baseline (shared ~ approximation)
  - SPD 50 low (shared)
  - DF 120 high (shared)
    Pattern recolor canon shared properties cross-mob. À documenter `combat/mob-recolors.md` (à créer) — recolor family canon récurrent. Source: idem.

- [ ] **🆕 Zenebatos Disc 4 location canon Death Purger ⭐** — Submaps 529, 530, 532, 717, 718. Cohérent existing Zenebatos Disc 4 canon (Wingly forest city location). Pattern Zenebatos Disc 4 mob ecosystem canon. À documenter/vérifier `locations/Zenebatos.md` (existing ?) — Disc 4 Wingly forest city. Pattern thematic Wingly Zenebatos canon machinery (Purger/Guillotine/Professor). Source: idem.

- [ ] **🆕 Death Purger World Map = None canon** — Pattern Death Purger = location-only canon (no World Map road spawn). Pattern Zenebatos mob = interior dungeon canon (Wingly city). Source: idem.

- [ ] **🆕 Escape rate 30% canon Zenebatos Disc 4 Death Purger ⭐** — Pattern Disc 4 standard escape canon. Pattern late-game lower escape rates canon. Source: idem.

- [ ] **🆕 Stats Disc 4 upgrade variant Death Purger vs Death parent ⭐** — Pattern recolor stats scaling canon : HP +166% (200 → 532) / AT +66% (50 → 83) / MAT +66% (35 → 58) / MDF +66% (60 → 100) / A-AV +10% (0% → 10%). DF/SPD shared canon. Pattern Disc 4 variants stats scaling canon (à investiguer pattern universel recolors). Source: idem.

### Mobs / Death Purger fandom complement — JP HP 666 ✓ +25% CONFIRMED + "Law City Zenebatos" location NEW + Appearance Reaper canon + Des Rapier + Lightning Punisher canon names shared cross-recolor + "Cousin to Death" + "Does NOT share Fear" subset canon + Power Up 1.5× quad-stat CORRECTION + Stats divergences MAJEUR + Total Vanishing ~10 min farming

- [ ] ⭐⭐ **🆕 Death Purger JP HP 666 ✓ +25% CONFIRMED systematic fandom MAJEUR ⭐⭐** — Wiki US 532 / fandom US 583 ⚠️ / **JP 666** ✓ (532 × 1.25 = 665 ≈ 666 ✓). JP Gold **8** ✓ ÷3 confirmed (22 ÷ 3 ≈ 7.33 → 8). Damia adopt wiki US 532 + JP 666 canon (wiki US plus précis, fandom US 583 probable typo/version). Source: [`features/mobs/_sources/fandom-death-purger.md`](features/mobs/_sources/fandom-death-purger.md).

- [ ] ⭐⭐ **🆕 "Law City, Zenebatos" location canon NEW MAJEUR (fandom) ⭐⭐** — Fandom révèle location canon name : **Law City, Zenebatos** ⭐. Pattern thematic "Law City" Wingly judicial canon. Cohérent thematic Death Purger + Guillotine + Professor formation partners (judicial/punisher/scholar machinery Wingly). À documenter/vérifier `locations/Zenebatos.md` existing : "Law City" canon name addition. Pattern Wingly Zenebatos = Law City judicial machinery canon. Source: idem.

- [ ] ⭐⭐ **🆕 Appearance canon Death Purger NEW MAJEUR (fandom) ⭐⭐** — Fandom révèle visual canon :
  - **Reaper or malevolent ghostly spirit** archetype canon
  - **Massive Scythe** weapon canon
  - **Long blue cloak** (vs Death black cloak — recolor color variation canon)
  - **Gold-trimmed red collar + 5 red gems decorative piece** = Wingly ornate canon
  - **Black eye sockets + yellow flame spheres** = supernatural
  - **Two tall horns** = demonic appearance
  - **Skeletal face + hands** (shared Death thematic)
    À refléter sprite design Damia. Pattern recolor color variation canon : Death (black cloak Phantom Ship) vs Death Purger (blue cloak Wingly Law City Zenebatos). Source: idem.

- [ ] ⭐⭐ **🆕 "Cousin to Death" canon shared recolor family confirmed (fandom) ⭐⭐** — Fandom : "This monster is the much more potent cousin to Death". Pattern recolor family canon : cousin relationship cohérent existing chronological canon (Death Disc 2 parent → Death Purger Disc 4 variant). "Much more potent" = stat upgrade canon confirmé. Source: idem.

- [ ] ⭐⭐⭐ **🆕 "Same names for attacks" canon shared cross-recolor MAJEUR (fandom) ⭐⭐⭐** — Fandom : "has the same names for its attacks" (cohérent Death naming canon). Pattern **recolor shared ability canon NEW** ⭐ :
  - **Des Rapier** = canon shared Death + Death Purger (vs wiki ~Reaping Slash community)
  - **Lightning Punisher** = canon shared Death + Death Purger (vs wiki "Can't Combat" status-naming)
    Damia adopt fandom canon names cross-recolor. Pattern Damia data-model : recolor shared ability names canon. Pattern Mob Instant Death offensive canon 3 mobs confirmed cross-mob : Cute Cat (Dance of Death) + Death + Death Purger (both Lightning Punisher). Source: idem.

- [ ] ⭐⭐⭐ **🆕 "Does NOT share Fear with Death" canon NEW MAJEUR (fandom) ⭐⭐⭐** — Fandom : "It is easier than Death, though, in that it does not share with Death the ability to cause Fear". Pattern **Death Purger LACKS Midnight Terror** (Fear ability) ⚠️ canon. Pattern recolor AI subset canon NEW : Death (parent 5 abilities complex) vs Death Purger (variant 3 abilities subset simpler). "Easier than Death" canon confirmé : recolor variant less complex AI vs parent. Pattern recolor AI variation canon NEW universel à investiguer cross-recolor (Plague Rat vs Berserk Mouse / Stinger vs Crescent Bee). Source: idem.

- [ ] ⭐⭐ **🆕 Power Up 1.5× quad-stat CORRECTION fandom precision MAJEUR ⭐⭐** — Wiki tier 2 : "Increases damage inflicted and reduces damage received by 50% for 3 turns" (2 stats simpler). Fandom : "Increases **both physical and magical attack power** as well as **both defences** by a **1.5× multiplier** for **3 turns**". CORRECTION canon : Power Up affects **4 stats** = P-Atk + M-Atk + P-Def + M-Def (1.5× = +50% mathematically equivalent wiki, fandom plus précis sur stats affectés). À implémenter `PowerUpAbility { type: 'self-buff-quad'; duration: 3; multiplier: 1.5; affects: ['p-atk', 'm-atk', 'p-def', 'm-def'] }` data-model CORRECTION (vs initial 2-stat). Source: idem.

- [ ] ⭐ **🆕 Total Vanishing ~10 min farming canon Death Purger NEW (fandom) ⭐** — Fandom : "average amount of time required to obtain this is roughly 10 minutes". Pattern Death Purger faster farming canon (vs Death 30+ min canon). Pattern Encounter rate Death Purger > Death (probable Common vs Death Uncommon). Pattern multi-source Total Vanishing canon confirmed avec farming times :
  - Phantom Ship Disc 2 (Death) 8% — one-time area, 30+ min average
  - **Zenebatos Disc 4 (Death Purger) 8%** — late-game permanent, **~10 min average** (faster)
    À documenter `items/consumables.md` Total Vanishing entry avec sources + farming times canon. Source: idem.

- [ ] **🆕 "Spell items + dragoon magic favored" + Light element bonus canon (fandom) Death Purger ⭐** — Fandom : "spell items or dragoon magic most frequently, you are in luck since it has lower resistance towards magical attacks" + "light element based spell items to gain the bonus damage against its elemental weakness". Confirms MDF 100 mid (vs DF 120 anti-physical) + Darkness weak Light pattern récurrent cross-source. Source: idem.

- [ ] **🆕 "Great chance to evade attacks" canon confirms A-AV 10% cross-source (fandom) ⭐** — Fandom narrative confirme A-AV 10% canon Death Purger. Pattern evasion mechanic canon récurrent cross-source. Source: idem.

- [ ] **🆕 Stats divergences Death Purger wiki vs fandom ⚠️ MAJEUR** :
  - HP US : wiki **532** vs fandom **583** (+10% — fandom probable typo/version, JP 666 confirms wiki US 532)
  - AT : wiki **83** vs fandom **93** (+12%)
  - MAT : wiki **58** vs fandom **65** (+12%)
  - EXP : wiki **144** vs fandom **134** (-7% divergence)
  - Gold : wiki **24** vs fandom **22** (-2 divergence)
  - DF/MDF/SPD match ✓
  - → Damia adopt mix : wiki HP 532 + EXP 144 (cohérent JP +25%) + fandom higher AT 93 + MAT 65 (JP closer pattern récurrent)
    Source: comparaison.

- [ ] **🆕 Pattern recolor color variation canon (fandom) Death family ⭐** — Death black cloak (Phantom Ship Disc 2) vs Death Purger **blue cloak + ornate red gold trim** (Wingly Law City Zenebatos Disc 4). Pattern recolor color variation canon NEW : palette + ornaments variation cross-recolor. À cross-référer autres recolors color variations canon (Berserk Mouse vs Plague Rat / Crescent Bee vs Stinger / etc.). Source: idem.

- [ ] **🆕 Formations canon confirmed cross-source Death Purger ⭐** — 3 formations canon identiques wiki tier 2 confirmé fandom : Death Purger solo + Death Purger + Guillotine + Death Purger ×2 + Professor. Pattern Guillotine + Professor NEW mobs canon Law City Zenebatos partners confirmé cross-source. Source: idem.

### Bosses / Death Rose wiki (Non-Elemental Moon That Never Sets Disc 4 — probable Miranda trial — Unslayable + Alternate Win Condition dialogue victory NEW MAJEUR + Talk Miranda dialogue trigger + Vampiric Tentacle life-steal NEW + Thorn Claw + Spin Thread baseline)

- [ ] ⭐⭐ **🆕 Death Rose canon data-model** — **Non-Elemental** element, HP 2400 (JP +25% ~3000 à confirmer), AT 44 / MAT 44 balanced, DF 80 low-mid, **MDF 140 high anti-magic**, SPD 50 low, A-AV/M-AV 0%. EXP 6000 / Gold 0 / Drops Nothing. Counter (0) Boss canon. Boss Moon That Never Sets submap 607 Disc 4 Scripted (probable Miranda individual trial canon — parallel Dark Doel Albert trial). À implémenter `bosses/deathRose.ts`. Source: [`features/bosses/_sources/lod-wiki-death-rose.md`](features/bosses/_sources/lod-wiki-death-rose.md).

- [ ] ⭐⭐⭐ **🆕 Unslayable passive NEW canon MAJEUR Death Rose ⭐⭐⭐** — When HP reduced to 0, Death Rose **NOT slain** and **continues to take actions** ⚠️. Pattern unique Boss canon NEW Damia : impossible HP-victory canon — Boss invulnerable to standard kill mechanic. À implémenter `UnslayablePassive { type: 'no-hp-victory'; continueAtZero: true; alternateWinRequired: true }` data-model canon. Pattern thematic "Rose immortal Black Monster" canon possible. Pattern Boss canon "cannot kill via HP" canon NEW (vs typical HP 0 = defeated). À documenter `combat/boss-passives.md` (à créer). Source: idem.

- [ ] ⭐⭐⭐ **🆕 Alternate Win Condition passive NEW canon MAJEUR Death Rose ⭐⭐⭐** — When **correct dialogue chosen during Talk**, battle ends. Pattern **dialogue-based victory canon NEW** ⭐ : player must respond correctly to Talk to win. Pattern unique non-HP victory condition canon NEW (vs typical reduce HP to 0). À implémenter `AlternateWinCondition { type: 'dialogue-correct'; trigger: 'talk-response'; triggerAbility: 'talk' }` data-model canon. Pattern thematic "Miranda confrontation Rose dialogue" canon (story trial mechanic Disc 4). Cohérent passive Unslayable : Boss invulnerable to HP-kill, only way to win = dialogue correct. À documenter `combat/win-conditions.md` (à créer) — Mob/Boss win conditions canon NEW (HP 0 + Alternate + scripted). Source: idem.

- [ ] ⭐⭐⭐ **🆕 ~Talk ability NEW MAJEUR Death Rose ⭐⭐⭐** — Community approximation dialogue ability. N/A target (no damage) + **Talk to Miranda** canon. Used **once at HP < 75%** + **once at HP < 50%** + **continuously at HP < 25%**. Pattern **Miranda-specific dialogue trigger canon** ⭐ : Death Rose-Miranda dialogue mechanic (cohérent Alternate Win Condition passive). Pattern dialogue HP threshold progression canon : 75% → 50% → 25% (3 dialogue triggers). À implémenter `TalkAbility { target: 'character'; characterId: 'miranda'; triggers: ['hp<75%', 'hp<50%', 'hp<25%']; mode: ['once', 'once', 'continuous']; alternateWinResponse: true }` data-model canon. Pattern story trial mechanic canon Disc 4. Source: idem.

- [ ] ⭐⭐ **🆕 ~Vampiric Tentacle NEW canon Death Rose MAJEUR ⭐⭐** — Community approximation > 25% phase special ability. **1.5× Physical damage + HP recovers equal to damage dealt** canon ⭐. Pattern **Vampiric absorb / life-steal ability canon NEW** ⭐ : damage dealt = HP recovered (life-steal mechanic). Pattern life-steal Mob/Boss canon NEW (vs Crystal Golem HP recovers % Max HP — Death Rose = damage-based life-steal variant). Cohérent passive Unslayable : Vampiric Tentacle = Boss self-heal mechanic complement Unslayable invincibility. À implémenter ability `vampiricTentacle` Damia 1.5× phys + life-steal canon. Pattern Damia : `VampiricTentacleAbility { multiplier: 1.5; type: 'physical'; lifesteal: { type: 'damage-dealt'; amount: 'equal-to-damage' } }` data-model canon. À documenter `combat/lifesteal.md` (à créer) — Vampiric absorb life-steal abilities canon. Source: idem.

- [ ] ⭐⭐ **🆕 Pattern Moon trials canon récurrent Death Rose + Dark Doel MAJEUR ⭐⭐** — Pattern individual trials per character canon Disc 4 :
  - **Dark Doel (submap 596)** = Albert individual trial canon (multi-entity boss + Untargetable + Instigate)
  - **Death Rose (submap 607)** ⭐ NEW = probable Miranda individual trial canon (single-entity + Unslayable + Alternate Win Condition dialogue victory + Talk Miranda)
  - Each trial = unique mechanic canon (Dark Doel = component destruction / Death Rose = dialogue victory)
  - Pattern thematic "character confrontation past" canon Disc 4
- À investiguer autres Moon trials canon ingestion future (Dart / Meru / Haschel / Kongol / Shana ?). Pattern Moon That Never Sets multi-trial area canon récurrent. À documenter `locations/Moon That Never Sets.md` (à créer). Source: idem.

- [ ] ⭐⭐ **🆕 Death Rose = Rose dark form Miranda trial canon probable MAJEUR ⭐⭐** — Pattern thematic "Death Rose" = Rose dark form canon. Cohérent ~Talk to Miranda ability (Miranda-specific trigger). Cohérent Black Monster lore canon (Rose = Black Monster — Miranda = Shana Light Dragoon successor confronts Rose's past). Pattern Disc 4 reveal trials : characters confront personal demons/past via Moon trials. Pattern parallel : Dark Doel (Doel dark form trial Albert) vs Death Rose (Rose dark form trial Miranda probable). À investiguer story trial context canon Miranda + Rose narrative arc Disc 4. Source: idem.

- [ ] ⭐ **🆕 AI canon "if → then" model Death Rose confirmed cross-boss ⭐** — Pattern Boss AI canon récurrent (cohérent Caterpillar + Danton + Dark Doel + Death Rose). "Auto" + "Ignore Turn Order" terminology canon confirmed. À documenter `combat/boss-ai.md` (à créer) — "if → then" model + Auto + Ignore Turn Order + dialogue triggers NEW canon. Source: idem.

- [ ] **🆕 ~Thorn Claw + ~Spin Thread canon names community Death Rose ⭐** — Wiki community approximations > 25% phase baseline abilities. Both 1× phys damage canon. Pattern duo baseline abilities canon (Thorn Claw thematic "rose thorn claw scratch" + Spin Thread thematic "rose-stem thread spin attack"). Source: idem.

- [ ] **🆕 ~Do nothing ≤ 25% phase Death Rose canon ⭐** — Boss enters passive state at HP ≤ 25% : Do nothing + Talk continuously dialogue spam canon. Pattern AI Death Rose phases canon : aggressive HP > 25% → passive HP ≤ 25% + dialogue continuously. Strategy player canon : reduce HP to ≤ 25% then dialogue Talk loop until correct response = Alternate Win Condition trigger. Source: idem.

- [ ] **🆕 Status all 8 ✔ Boss-tier Death Rose confirmed ⭐** — Pattern Boss-tier immunity canon majoritaire confirmé. Cohérent existing Bosses canon all 8 ✔ (Dark Doel + Danton + Bowling pattern). Source: idem.

- [ ] **🆕 Element Non-Elemental Boss canon Death Rose ⭐** — Pattern Non-Elemental Boss canon (vs typical Death-themed Darkness). Pattern thematic Rose dark form Non-Elemental (cohérent Rose canon character + Cursed Jar Non-Elemental Unique Monster parallel). Source: idem.

- [ ] **🆕 Counter (0) Boss canon Death Rose ⭐** — Cohérent existing Boss-tier specific + Boss Extras Counter 0 pattern. Per user instruction : feature non-implémentée Damia, factual tier mention only. Source: idem.

- [ ] **🆕 Moon That Never Sets submap 607 Scripted Disc 4 canon Death Rose ⭐** — Pattern Disc 4 trial boss canon scripted / 0% escape (cohérent Dark Doel submap 596 same pattern). Pattern individual trials per character canon Disc 4. À documenter `locations/Moon That Never Sets.md` (à créer) — Disc 4 trials area canon. Source: idem.

- [ ] **🆕 EXP 6000 / Gold 0 / Drops Nothing canon Death Rose ⭐** — Pattern Disc 4 trial boss yield canon cohérent Dark Doel same EXP. Story trial pattern : no direct loot rewards canon. Pattern Moon trials no rewards (rewards via story progression). Source: idem.

### Bosses / Death Rose fandom complement — CORRECTION IDENTITY MIRANDA'S MOTHER apparition NOT Rose dark form MAJEUR + Miranda's mother backstory canon REVEALED + JP HP 3000 +25% CONFIRMED + Mille Seseau Moon + Vine Snap + Pollen Spray NEW + SP farming canon

- [ ] ⭐⭐⭐ **🆕 CORRECTION CANON IDENTITY Death Rose = APPARITION OF MIRANDA'S MOTHER (rose plant manifestation) MAJEUR ⭐⭐⭐** — Fandom révèle : "Death Rose is actually the first boss the player is facing as an **apparition of Miranda's hatred towards her mother**". ⚠️ NOT Rose party member dark form (wiki tier 2 initial interpretation à corriger). Pattern manifestation Miranda's hatred toward mother (rose plant opens up revealing mother's face during battle). Pattern Moon trials canon CORRECTION : character FAMILY/PAST confrontation (NOT party member dark forms). Pattern Damia `MobRecolor` data-model nécessite distinction : **mob personality = "miranda-mother-apparition"** vs party member. À CORRECTION existing Death Rose.md identity canon appliquée. Source: [`features/bosses/_sources/fandom-death-rose.md`](features/bosses/_sources/fandom-death-rose.md).

- [ ] ⭐⭐⭐ **🆕 Miranda's mother backstory canon REVEALED MAJEUR ⭐⭐⭐** — Pattern Miranda family backstory canon Disc 4 reveal :
  - Mother left because **father drunk + wasted hard-earned money** → forced to leave
  - Father stayed : "at least cared enough to stay" (Miranda's perception)
  - Mother visited many times to take Miranda — father kicked her out
  - Miranda emotional arc : hatred → understanding → forgiveness canon Disc 4
  - **Resolution** : Miranda forgives mother → Death Rose disappears (Alternate Win Condition trigger ✓)
    À documenter `party-members/Miranda.md` mother + father backstory canon NEW MAJEUR Disc 4 reveal. Pattern Miranda character arc canon. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Death Rose JP HP 3000 ✓ +25% CONFIRMED systematic MAJEUR ⭐⭐⭐** — Wiki US 2400 / JP **3000** ✓ (2400 × 1.25 = 3000 exact). Pattern JP/US conversion systematic confirmé. Damia adopt JP 3000. Source: idem.

- [ ] ⭐⭐ **🆕 Mille Seseau snowy landscape Moon canon Death Rose ⭐⭐** — Pattern Moon trials = location-specific to character canon (cohérent Albert's Bale Castle 20 ans ago Dark Doel trial — Albert's homeland canon parallel). Mille Seseau = Miranda's homeland canon (Queen Theresa Deningrad). Pattern thematic "homeland trial" canon Disc 4 Moon. À documenter `locations/Moon That Never Sets.md` (à créer) avec Mille Seseau snowy landscape Miranda trial canon. Source: idem.

- [ ] ⭐⭐ **🆕 Pattern Moon trials = character family/past confrontation canon CORRECTION MAJEUR ⭐⭐** — Pattern CORRECTION Moon trials canon : NOT party member dark forms but **PARENTS/FAMILY apparitions** canon :
  - **Dark Doel (Albert trial)** = Doel **uncle** apparition (Albert's family — Doel killed Carlo Albert's father)
  - **Death Rose (Miranda trial)** ⭐ NEW = **Mother apparition** (Miranda's family past — abandonment story)
  - Pattern Disc 4 = character family/past confrontation canon NEW
  - Other trials probable per character : Dart confronts Zieg/Black Monster ? Haschel confronts Claire ? Kongol confronts Gigantos ? Rose confronts Zieg/Dragon Campaign ?
    Pattern Moon trials canon canon récurrent MAJEUR à documenter `combat/moon-trials.md` (à créer). Source: idem.

- [ ] ⭐⭐ **🆕 SP farming Miranda Dragoon Spirit canon NEW Death Rose MAJEUR (fandom) ⭐⭐** — Fandom : "You can farm SP to level Miranda's Dragoon Spirit if you keep **declining the request to forgive**". Pattern : decline forgiveness → battle continues → SP farm canon strategy. Cohérent Unslayable passive : Boss invulnerable to HP-kill, only victory via Alternate Win Condition (forgiveness). Pattern player choice canon : forgive (end battle) OR decline (farm SP indefinitely). Cohérent existing Spider Urchin SP grinding pattern Disc 4 (Aglis Disc 4 canon). À documenter `combat/sp-farming.md` (à créer) — Death Rose SP farming canon strategy. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Pollen Spray NEW canon ability MAJEUR (fandom) ⭐⭐⭐** — Fandom révèle ability **Pollen Spray** (vs wiki absent !). Description : "The Death Rose sprays pollen at Miranda". Pattern thematic "rose plant pollen attack" canon NEW. ⚠️ Wiki tier 2 ne liste pas Pollen Spray — possible wiki omis OR fandom narrative addition. Pattern rose-plant thematic abilities canon : vines (Vine Snap) + absorb (Vampiric Tentacle) + pollen (Pollen Spray). À implémenter `PollenSprayAbility` data-model NEW canon Damia (à investiguer effect précis : status proc ? AoE ?). Source: idem.

- [ ] ⭐⭐ **🆕 Vine Snap canon name fandom (regroups wiki ~Thorn Claw + ~Spin Thread possibly) MAJEUR ⭐⭐** — Fandom **Vine Snap** = canon name simplifie wiki dual ~Thorn Claw + ~Spin Thread baseline abilities (both 1× phys). Damia adopt fandom canon name **Vine Snap** > wiki community ~Thorn Claw/~Spin Thread (simpler canon name). Pattern thematic "rose vine snap" canon. À reconcilier wiki + fandom ability list précis (Vine Snap = 1 OR 2 abilities ?). Source: idem.

- [ ] ⭐⭐ **🆕 Absorb canon name fandom = Vampiric Tentacle wiki cross-source confirmed ⭐⭐** — Fandom **Absorb** = shortened canon name fandom (vs wiki ~Vampiric Tentacle). Confirms wiki Vampiric Tentacle canon : 1.5× phys + life-steal mechanic damage-based. Damia adopt wiki canon name **Vampiric Tentacle** (plus précis) — fandom Absorb = informal shortened. Pattern Death Rose-Miranda thematic "rose absorbs Miranda's life" canon. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Battle dialogue revelation canon Death Rose MAJEUR ⭐⭐⭐** — Fandom révèle dialogue script complet :
  - HP < 75% : Mother truth begins "Miranda's father drunk + wasted money"
  - HP < 50% : Miranda retorts "at least father cared enough to stay"
  - HP < 25% (continuously) : Mother "I visited him so many times to take you with me. But every time, he just kicked me out"
  - Forgiveness response = Alternate Win Condition trigger
    Pattern dialogue HP threshold canon = **3 progressive revelation triggers** canon. Pattern emotional arc combat canon NEW Damia. À documenter `combat/boss-dialogue.md` (à créer) — Boss dialogue triggers + Alternate Win Condition responses canon. Source: idem.

- [ ] ⭐⭐ **"First boss Moon That Never Sets" canon Death Rose (fandom) ⭐⭐** — Pattern Moon trials story sequence : Death Rose = **first boss** Moon trials sequence canon. Pattern Miranda trial = first individual trial canon. À investiguer Moon trials story sequence canon précis (Death Rose first → Dark Doel ? → autres ?). Pattern Disc 4 Moon trials chronologic order canon. Source: idem.

- [ ] **🆕 Visual canon Death Rose NEW MAJEUR (fandom) ⭐⭐⭐** — "Rose plant + opens up revealing Miranda's mother's face during battle". Pattern unique boss visual canon NEW Damia. À refléter sprite design Damia : rose plant + open mode revealing mother's face. Pattern thematic "rose flower = symbol hatred manifested + mother apparition" canon. Source: idem.

- [ ] **🆕 Stats divergences Death Rose wiki vs fandom ⚠️** :
  - AT : wiki **44** vs fandom **50** (+6 / +14%)
  - MAT : wiki **44** vs fandom **50** (+6 / +14%)
  - HP/DF/MDF/SPD/EXP/Gold match ✓
  - → Damia adopt fandom higher AT 50 / MAT 50 probable (JP closer pattern récurrent)
    Source: comparaison.

- [ ] **🆕 Element "none" fandom = Non-Elemental wiki cross-source confirmed Death Rose ⭐** — Pattern terminology cross-source canon : Element "none" (fandom narrative) = Non-Elemental (wiki canonical). Pattern Non-Elemental Boss canon récurrent. Source: idem.

### Bosses / Divine Dragon wiki (Non-Elemental Mountain of Mortal Dragon Disc 3 final boss — Multi-entity 3-entity 9000 HP total + Dragon Block Staff anti-Dragoon NEW + Final Blow main-priority NEW + Boss Extras canonical 3ème instance + Instigate 2ème + Countdown mechanic NEW + Divine Dragon Cannon position-based AoE NEW + Intimidating Presence reactive counter NEW + Dragon Shield + Gravity Grabber + Flash Hall NEW items + Burning Wave NEW)

- [ ] ⭐⭐⭐ **🆕 Divine Dragon canon data-model multi-entity 3-entity MAJEUR ⭐⭐⭐** — **Non-Elemental** element all 3 entities. Divine Dragon HP 5000 (JP +25% ~6250) + AT 60 + DF 160 high + MAT 53 + MDF 60 low + SPD 60. Divine Cannon HP 2000 + AT 51 + DF 160 + MAT **60** (higher) + MDF 60 + SPD 50. Divine Ball HP 2000 + AT 51 + DF 160 + MAT 53 + MDF 60 + SPD 50. **HP total 9000** Disc 3 final boss massive tier. À implémenter `bosses/divineDragon.ts` multi-entity. Source: [`features/bosses/_sources/lod-wiki-divine-dragon.md`](features/bosses/_sources/lod-wiki-divine-dragon.md).

- [ ] ⭐⭐⭐ **🆕 Dragon Block Staff passive NEW canon MAJEUR Divine Dragon ⭐⭐⭐** — **Dragoons gain 0.4× Damage Dealt + 4× Damage Received** ⚠️. Pattern unique Boss canon : DISCOURAGES Dragoon form usage canon NEW. Pattern thematic "Dragon Block Staff = Wingly anti-Dragon weapon canon" (cohérent Lloyd holds Dragon Block Staff Disc 4 existing canon). Strategy canon : avoid Dragoon transformations vs Divine Dragon — use Additions + Items instead. À implémenter `DragonBlockStaffPassive { type: 'anti-dragoon'; dragoonDamageDealt: 0.4; dragoonDamageReceived: 4.0 }` data-model canon. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Final Blow passive NEW canon MAJEUR Divine Dragon ⭐⭐⭐** — Battle ends when **Divine Dragon HP 0** (Boss Extras optional kill). Pattern multi-entity boss main-priority canon NEW (vs Dark Doel Untargetable Boss Extras-priority). Pattern player strategy canon : focus Divine Dragon HP 5000 for victory (Boss Extras optional drops only). À implémenter `FinalBlowPassive { type: 'main-boss-victory'; mainEntity: 'divineDragon'; bossExtrasOptional: true }` data-model canon. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Boss Extras canonical 3ème instance canon Divine Dragon MAJEUR ⭐⭐⭐** — Divine Cannon + Divine Ball = **3ème Boss Extras ingestion canon Damia** :
  1. Crafty Thief (existing canon — Boss Extras canonical 4th category established)
  2. Dark Doel : Light Sword + Shadow Blade (Disc 4 Moon trial)
  3. **Divine Dragon : Divine Cannon + Divine Ball** ⭐ NEW (Disc 3 Mountain of Mortal Dragon)
     Pattern Boss Extras canonical category 3 confirmed instances. Pattern characteristics canon récurrent confirmed cross-boss : Counter 0 + EXP/Gold 0 + Status all 8 ✔ + Stats Boss-similar + **100% drops** (Gravity Grabber + Flash Hall). À mettre à jour `combat/monster-categories.md` Boss Extras = 4th category 3 confirmed instances. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Instigate mechanic 2ème instance canon Divine Dragon MAJEUR ⭐⭐⭐** — Pattern Boss Extras force Boss action canon confirmed cross-boss 2ème instance :
  - **Divine Cannon Instigate Divine Dragon Cannon** (forces Divine Dragon use Divine Dragon Cannon)
  - **Divine Ball Instigate Divine Dragon Barrage** (forces Divine Dragon use Divine Dragon Barrage)
    Cohérent existing **Dark Doel Light Sword Instigate Sword Slash + Shadow Blade Instigate Blade Slash** (Disc 4 trial). Pattern Boss Extras = "command-the-boss" canon récurrent confirmé cross-boss. Pattern Damia : `InstigateAbility` shared cross-boss data-model. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Countdown mechanic Divine Cannon canon NEW MAJEUR ⭐⭐⭐** — Pattern unique multi-entity countdown timer canon NEW Damia :
  - **Count starts 3** → reduces 1 per ~Countdown action
  - **Trigger** : Divine Dragon HP <61%
  - **Enable/Disable canon** : Disabled by default (Do nothing) / Enabled when Divine Dragon HP <61% + Divine Dragon takes any action OTHER than Divine Dragon Cannon
  - **Auto Instigate Divine Dragon Cannon** : when Count reaches 0
    Pattern stall paradox : forcing Divine Dragon Cannon resets Countdown but Cannon = massive 8× primary damage. À implémenter `CountdownMechanic { initial: 3; trigger: 'main-hp<61%'; enabledCondition: 'main-action-not-divine-dragon-cannon'; autoActionAtZero: 'instigate-divine-dragon-cannon' }` data-model canon NEW. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Divine Dragon Cannon position-based AoE NEW canon MAJEUR ⭐⭐⭐** — Pattern unique position-based AoE canon NEW Damia :
  - **Central party member primary** → 8× Non-Elemental magic + both sides adjacent 4×
  - **Side member primary** (left/right) → 8× primary + center 4× + **opposite side 0% (NOT targeted)**
    Pattern thematic "Divine Dragon Cannon = AoE laser canon". Player strategy canon : positioning matters — central member = both side members adjacent damage / side member = opposite side immune. À implémenter `DivineDragonCannonAbility { type: 'position-based-aoe'; primaryMultiplier: 8; adjacentMultiplier: 4; oppositeSideMultiplier: 0; element: 'non-elemental'; abilityType: 'magic' }` data-model canon NEW. À documenter `combat/position-based-aoe.md` (à créer) — pattern position-based AoE canon NEW. Source: idem.

- [ ] ⭐⭐ **🆕 Burning Wave NEW canon ability Divine Dragon ⭐⭐** — Wiki tier 2 canonical. Party target + **3× Fire-elemental magic damage** canon (NEW canon AoE). Pattern Fire AoE ability canon NEW MAJEUR (3× magic Party = high damage). Pattern thematic "Fire AoE wave". À implémenter ability `burningWave` Damia Party 3× Fire magic AoE. Source: idem.

- [ ] ⭐⭐ **🆕 ~Intimidating Presence reactive counter-item canon NEW MAJEUR Divine Dragon ⭐⭐** — Wiki tier 2 community approximation. Party 100% Fear proc, A-AV reduces. **Auto trigger canon** : when targeted by **Item Magic All-target** (counter-item reactive mechanic canon NEW). Pattern Boss reactive counter-item canon NEW (vs typical Boss reactive abilities). Pattern A-AV/M-AV per-ability classification 7ème instance (physical/intimidation-tagged → A-AV reduces Fear). À implémenter `IntimidatingPresenceAbility { type: 'reactive-counter-item'; trigger: 'item-magic-all-target'; effect: { status: 'Fear'; chance: 1.0; reducedBy: 'A-AV' }; target: 'party' }` data-model canon NEW. Source: idem.

- [ ] ⭐ **🆕 Existing items confirmed cross-boss Divine Dragon ⭐** — Pellet (Earth Spell Item) + Burn Out (Fire Spell Item) + Down Burst (Wind Air Combat shared canon) all cross-confirmed Divine Dragon abilities. Pattern Spell Item / Boss ability shared canon récurrent confirmé. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Dragon Shield NEW item canon MAJEUR Divine Dragon ⭐⭐** — 20% drop Divine Dragon. Pattern probable armor canon ("Shield" thematic). Probable anti-Dragoon item canon (cohérent Dragon Block Staff passive thematic). À investiguer fandom + items wiki canon. À documenter `items/equipment.md` Dragon Shield armor canon entry NEW. Source: idem.

- [ ] ⭐⭐ **🆕 Gravity Grabber NEW item canon Divine Cannon ⭐⭐** — 100% guaranteed Boss Extra drop. Pattern thematic "Gravity" = probable Spell Item Earth/gravity. Pattern Boss Extras 100% drop canon récurrent. À documenter `items/consumables.md` Gravity Grabber Spell Item canon entry NEW. Source: idem.

- [ ] ⭐⭐ **🆕 Flash Hall NEW item canon Divine Ball ⭐⭐** — 100% guaranteed Boss Extra drop. Pattern thematic "Flash Hall" = probable Spell Item Light/flash. À documenter `items/consumables.md` Flash Hall Spell Item canon entry NEW. Source: idem.

- [ ] ⭐ **🆕 EXP 10,000 highest yield ingestion canon Damia Divine Dragon ⭐** — Pattern Disc 3 final boss EXP reward canon massive. Cohérent existing canon yields scaling. Source: idem.

- [ ] **🆕 ~Arm Swipe canon name community Divine Dragon ⭐** — Wiki community approximation Party 1× Physical damage ability baseline. Pattern thematic "dragon arm sweep". Source: idem.

- [ ] **🆕 ~Divine Dragon Barrage canon name community ⭐⭐** — Wiki community approximation forced Divine Dragon ability via Divine Ball Instigate. Party 2× Non-Elemental magic damage canon. Pattern Instigate mechanic 2ème instance canon. À implémenter `divineDragonBarrage` ability Damia. Source: idem.

- [ ] **🆕 Pattern multi-entity boss canon récurrent 3ème ingestion Divine Dragon ⭐⭐** — 3-entity multi-entity boss canon récurrent étendu :
  - **Claire** (existing) / Kamuy / Lloyd Flanvel / Magician Faust / 3 Dragon Spirits / Zieg Feld
  - **Dark Doel + Light Sword + Shadow Blade** (Disc 4 Moon trial)
  - **Divine Dragon + Divine Cannon + Divine Ball** ⭐ NEW (Disc 3 Mountain of Mortal Dragon)
    Pattern Damia : `MultiEntityBoss` data-model canon récurrent. À documenter `combat/multi-entity-bosses.md` (à créer) — pattern canon récurrent étendu. Source: idem.

- [ ] **🆕 Mountain of Mortal Dragon submap 423 Disc 3 final boss canon Divine Dragon ⭐** — Pattern Disc 3 final boss canon Mountain of Mortal Dragon (cohérent existing mob ecosystem Beastie Dragon / Baby Dragon / Deadly Spider). À documenter `locations/Mountain of Mortal Dragon.md` (à créer) — Disc 3 Mountain Wind area + Divine Dragon final boss canon. Source: idem.

- [ ] **🆕 Divine Dragoon Spirit canon context cross-reference ⚠️** — Divine Dragon Boss Disc 3 = narrative confrontation canon. Divine Dragoon Spirit acquisition = Disc 4 via Lloyd post-Melbu Frahma fight (cohérent existing Dart canon). Pattern story canon distinction : Boss fight ≠ Spirit drop (drops Dragon Shield 20% instead). À cross-référer existing Dart.md + Lloyd Disc 4 canon. Source: idem.

### Bosses / Divine Dragon fandom complement — JP HP NON systematic +40-50% variant + Appearance 7 wings/7 eyes + Lore MASSIVE + BATTLE AT MAYFIL revisit boss NEW MAJEUR + Dragons 7-tier Guidebook + Dragon Buster + Bravery Amulet + Spiritual Ring + Pressure Fear 4-stat reduction + Dragon Claw + Divine Dragon Ball canon names + Imperial Spell NEW

- [ ] ⭐⭐⭐ **🆕 JP HP NON systematic variant Divine Dragon canon NEW MAJEUR (fandom) ⭐⭐⭐** — Head **US 5000 / JP 7000** (+40%) / Ball/Cannon **US 2000 / JP 3000** (+50%). Pattern Boss JP scaling variable canon NEW (vs typical +25% systematic mobs). Pattern Boss ≠ pas toujours +25% systematic. Damia adopt JP 7000 / 3000 canon. À documenter `combat/jp-us-stats-scaling.md` (à créer) — pattern JP scaling variable per-mob/boss canon (mobs typically +25% standard, bosses variable). Source: [`features/bosses/_sources/fandom-divine-dragon.md`](features/bosses/_sources/fandom-divine-dragon.md).

- [ ] ⭐⭐⭐ **🆕 JP name 神竜王 Shinryūō "God Dragon King" canon MAJEUR (fandom) ⭐⭐⭐** — Divine Dragon = "King of Dragons" title canon (strongest all Dragons). Pattern Boss JP name canonical. À cross-référer autres Dragons JP names canon ingestion future. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Appearance canon Divine Dragon NEW MAJEUR (fandom) ⭐⭐⭐** :
  - Colossal Western-style quadrupedal winged reptile + elongated neck
  - **7 wings** ⭐⭐⭐ canon
  - Long tail + **cannon on right shoulder** (Divine Dragon Cannon source)
  - **7 eyes** : 6 at front upper jaw + 1 largest seventh eye on chin (**main eye Lloyd target canon**)
  - Post-seal-break : body shackled + broken chains hanging from limbs
  - Guidebook : **68 meters long / 180 tons**
    Pattern thematic "King of Dragons" 7-eyes 7-wings canon. À refléter sprite design Damia. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Lore canon MASSIVE Divine Dragon (fandom) MAJEUR ⭐⭐⭐** :
  - **10,000+ years sealed** by ancient Winglies Mountain of Mortal Dragon (couldn't kill)
  - Pre-Dragon Campaign : shared "God Dragon King" title with another 7-eyed Dragon → Divine Dragon prevailed
  - Dragon Campaign : humans **unable to ally** → remained sealed
  - **Chapter 3 Fate & Soul** : seal weakens → Evergreen Forest aggression + Forest of Winglies Guaraha reveals to Meru
  - Seal dissolves → Dragon free → vengeance world
  - Dart Red-Eye + Albert Jade Dragoon resonance canon
  - **First attack Deningrad** minor / **Major attack Deningrad** : Crystal Palace Signet destroyed + **Moon seal dissolves**
  - Party + Dragon Block Staff defeats
  - **Lloyd kills with main eye stab** + Divine Dragoon Spirit manifests as soul
  - Lloyd takes Spirit BUT cannot use (doesn't react)
  - **End Chapter 4** : Lloyd struck by Melbu Frahma → dying gives Dart **Divine Dragoon Spirit + Dragon Buster** canon
    Pattern Disc 3 story arc canon Mille Seseau + Divine Dragon + Moon seal mechanic. À documenter `story/disc-3-divine-dragon-arc.md` (à créer). Source: idem.

- [ ] ⭐⭐⭐ **🆕 BATTLE AT MAYFIL — Divine Dragon Spirit revisit boss canon NEW MAJEUR (fandom) ⭐⭐⭐** — Pattern Disc 4 revisit boss canon NEW :
  - **Divine Dragon Spirit** Disc 4 **Death City Mayfil** (optional encounter)
  - HP US 16,000 / JP **20,000** ✓ (+25% systematic confirmed — vs Mountain Disc 3 +40-50% variant)
  - AT 120 / DF 160 / MAT 130 / MDF 100 / SPD 60 / Gold 400 / EXP 8000
  - Drop **Flash Hall 100%** / **Counter Yes** (vs Mountain Counter No)
  - ⭐ **NO Dragon Block Staff Disc 4** : Dragoons fully usable canon
  - ⭐⭐⭐ **"Most challenging boss battles in entire game" canon** — high speed = consecutive actions Game Over risk
    Pattern Damia : `RevisitBossCanon { mainBoss; revisitForm; location; disc; dragoonsAvailable }` data-model NEW canon. Pattern Disc 4 revisit boss canon (à investiguer autres revisit bosses). À documenter `bosses/Divine Dragon Spirit Mayfil.md` (à créer ou intégrer Divine Dragon.md). Source: idem.

- [ ] ⭐⭐⭐ **🆕 Dragons 7-tier ranking canon Guidebook MAJEUR (fandom) ⭐⭐⭐** — Pattern Dragons ranked **7 tiers** par # eyes = rank/power canon (max 7). **Divine Dragon = 7 eyes = top tier canon**. Pattern **Dragoon Spirit formation lore canon NEW MAJEUR** : eyes "dragged together" when sufficient power dragon dies → forms Dragoon Spirit. Spirit must be claimed quickly or expires. À documenter `dragoons/dragon-tiers.md` (à créer) — 7-tier Dragon ranking canon Guidebook. À cross-référer autres Dragons canon (Red-Eye / Jade / Blue-Sea / Violet / Golden / Dark / White Silver-Dragon) tier rankings. Pattern Damia : Dragon canonical lore mechanic. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Pressure canon name officiel + Fear 4-stat reduction canon NEW MAJEUR (fandom) ⭐⭐⭐** — **Pressure** = canon name fandom (vs wiki ~Intimidating Presence community). Description : "shakes head, casts Fear into all party members causing fear that **lowers attack and defense from both physical and magical**" ⭐⭐⭐. Pattern Fear status canon mechanic NEW MAJEUR : **4-stat reduction** (P-Atk + P-Def + M-Atk + M-Def). À documenter `combat/status-effects.md` (à créer) — Fear status canon mechanic 4-stat reduction canon NEW. Pattern Damia : `FearStatus { type: 'stat-reduction'; affects: ['p-atk', 'p-def', 'm-atk', 'm-def']; reductionPercent: ? }` data-model canon CORRECTION. Damia adopt fandom canon **Pressure** > wiki community ~Intimidating Presence. Source: idem.

- [ ] ⭐⭐ **🆕 Dragon Claw canon name officiel (fandom) ⭐⭐** — vs wiki ~Arm Swipe community. Description : "swipes claw across the field and attacks the entire party dealing moderate damage". Damia adopt fandom canon **Dragon Claw** > wiki ~Arm Swipe. Source: idem.

- [ ] ⭐⭐ **🆕 Divine Dragon Ball canon name officiel (fandom) ⭐⭐** — vs wiki ~Divine Dragon Barrage community. Description : "flies into air + fires volley of energy balls Party high magical damage". **Common attack canon**. Damia adopt fandom canon **Divine Dragon Ball** > wiki ~Divine Dragon Barrage. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Imperial Spell NEW canon ability MAJEUR (fandom) ⭐⭐⭐** — Wiki community ~5 elemental abilities séparées (Pellet/Burn Out/Burning Wave/Down Burst). Fandom révèle **Imperial Spell** = "shakes neck, using max-level Attack Item magic" generic descriptor. ⚠️ Possible interprétation : fandom regroupe wiki precise abilities sous generic Imperial Spell. Damia adopt mix : wiki precise abilities (canonical mechanics) + Imperial Spell fandom narrative descriptor. À reconcilier wiki + fandom ability list précis. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Dragon Buster NEW item canon Dart ultimate weapon MAJEUR (fandom) ⭐⭐⭐** — Lloyd gives Dart Disc 4 (end Chapter 4 dying) along with Divine Dragoon Spirit. Probable **Dart's ultimate weapon canon** (anti-Dragon thematic possible — "Dragon Buster"). À documenter `items/equipment.md` Dragon Buster ultimate weapon canon entry NEW. Pattern Damia : Dart weapons progression canon Disc 4. À cross-référer `party-members/Dart.md` weapons table canon. Source: idem.

- [ ] ⭐⭐ **🆕 Bravery Amulet NEW item canon (fandom) ⭐⭐** — Anti-Fear accessory canon : "prevents Divine Dragon from inflicting Fear". Pattern accessories anti-status canon récurrent (cohérent existing Talisman + Rose's Hairband anti-Can't Combat canon). À documenter `items/equipment.md` Bravery Amulet accessory canon entry NEW. Pattern Damia : `AccessoryEffect { type: 'status-immunity'; status: 'Fear' }` data-model canon NEW. Source: idem.

- [ ] ⭐⭐ **🆕 Spiritual Ring + Guard Badge + Legend Casque NEW items canon (fandom) ⭐⭐** — Anti-magic accessories canon Mayfil revisit fight :
  - **Spiritual Ring** = anti-magic accessory canon NEW
  - **Guard Badge** = anti-magic accessory canon NEW
  - **Legend Casque** = anti-magic accessory canon NEW (probable late-game)
    Pattern Disc 4 anti-magic accessories canon. À documenter `items/equipment.md` accessories canon entries NEW. Source: idem.

- [ ] ⭐⭐ **🆕 Dragoon limited 1 round canon (fandom) Divine Dragon strategy ⭐⭐** — Pattern Dragon Block Staff battle canon : Dragoons usage limited 1 round + supportive Dragoon Magic only :
  - **Albert Rose Storm** (Wind defensive party buff)
  - **Meru Rainbow Breath** (Water heal/buff)
  - **Miranda healing spells** (Light heal)
    Pattern Dragoon Magic supportive canon Damia Disc 3 boss strategy. Cohérent existing Dragoon Magic spells canon (à cross-référer party-members docs). Source: idem.

- [ ] ⭐ **🆕 "Divine DG Ball" mistranslation canon (fandom) ⭐** — Trivia : Japanese **Shinryū Tama** (Tama = "ball") mistranslated as "Divine Dragon Egg" (Tamago = "egg"). Pattern translation error canon. Damia adopt correct "Divine Dragon Ball" canon for Dart Dragoon Magic name. Source: idem.

- [ ] **🆕 Stats divergences Divine Dragon wiki vs fandom ⚠️** :
  - AT : wiki **60** vs fandom **65** (+5 / +8%)
  - MAT : wiki **53** vs fandom **58** (+5 / +9%)
  - HP US match (5000)
  - DF/MDF/SPD/Gold/EXP match ✓
  - → Damia adopt fandom higher AT 65 + MAT 58 probable (JP closer pattern récurrent)
    Source: comparaison.

- [ ] **🆕 Divine Dragoon Spirit lore canon hint Tower of Flanvel Disc 3 (fandom) ⭐⭐** — Tower of Flanvel Disc 3 Mirror chamber cutscene pre-Lloyd fight : Spirit shines near Dart while Lloyd holds it = canon hint Dart destined master. Pattern Dragoon Spirit selection canon : Spirits choose master canon. À documenter `bosses/Lloyd.md` (existing/à créer) + cohérent existing Dart canon. Source: idem.

- [ ] **🆕 Rose introduction quote canon Divine Dragon (fandom) ⭐** — "The arrival of the 'one who glares through seven diabolical eyes, and crosses the sky with seven wings.' It's trouble. It's the King of Dragons. The Divine Dragon." Pattern Rose canon knowledge = Dragon Campaign veteran lore (cohérent existing Rose canon Black Monster + Dragon Campaign survivor). À cross-référer `party-members/Rose.md`. Source: idem.

### Items / Dragon Block Staff wiki (Key Item Wingly artifact Disc 3 — Variable per-battle effects + Grand Jewel boss NEW + Kadessa Forbidden Land + Forest of Winglies acquisition + Dragon Buster lost reveal)

- [ ] ⭐⭐⭐ **🆕 Dragon Block Staff Key Item canon Disc 3 MAJEUR ⭐⭐⭐** — Wingly artifact anti-Dragon + anti-Dragoon canon. Quest object Disc 3 : Dart's party retrieve Forest of Winglies/Kadessa ruins → stop Divine Dragon. Created by ancient Winglies. Passed down generations. Sealed Divine Dragon **10,000+ years** ✓ cross-source confirmed (cohérent Divine Dragon lore récent — ancient Winglies couldn't kill). À documenter `items/Dragon Block Staff.md` (créé). Source: [`features/items/_sources/lod-wiki-dragon-block-staff.md`](features/items/_sources/lod-wiki-dragon-block-staff.md).

- [ ] ⭐⭐⭐ **🆕 Kadessa = former Wingly capital "Forbidden Land" present canon NEW MAJEUR (fandom) ⭐⭐⭐** — Storage Dragon Block Staff sealed Kadessa ruins. Pattern Wingly civilization decline canon : Forbidden Land = former capital ruins. À documenter `locations/Kadessa.md` (à créer) — Forbidden Land Wingly former capital canon NEW. Cross-référer existing Wingly thematic (Zenebatos Law City + Forest of Winglies + Kadessa). Source: idem.

- [ ] ⭐⭐⭐ **🆕 Grand Jewel boss canon NEW MAJEUR (fandom) ⭐⭐⭐** — Wingly guardian boss Kadessa ruins (Dragon Block Staff protector). Pattern thematic "dark material + golden glows" + "embedded in rocky formation" + "dislodges from ceiling flipping over Staff upright" canon. Pattern Boss canon Disc 3 Kadessa Forbidden Land. À documenter `bosses/Grand Jewel.md` (à créer) — Wingly guardian boss canon NEW Disc 3. À ingérer wiki tier 2 + fandom future Grand Jewel stats + abilities. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Dragon Block Staff variable per-battle effects canon NEW MAJEUR (fandom) ⭐⭐⭐** — Pattern variable effects par battle :
  - **Grand Jewel battle** : Dragoons 10% damage dealt / 10× damage received (reactive trigger if Dragoons used)
  - **Divine Dragon battle** : Dragoons **40% dmg / 4× received** ✓ confirmé wiki Divine Dragon canon cross-source. Dart activates start battle → Staff **BREAKS** (last time ever used)
  - **Melbu Frahma final phase** : Dragoons 10% / 10× (reactive trigger Dragoon Magic attack — Wingly magic intrinsic ability, Staff already broken)
    Pattern Damia : `DragonBlockStaffKeyItem` data-model variable per-battle effects canon NEW MAJEUR. Pattern healing + defensive Dragoon Magic NOT affected canon ✓ cohérent Divine Dragon strategy "supportive Dragoon Magic only" fandom récent. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Dragon Block Staff breaks Divine Dragon battle canon NEW MAJEUR (fandom) ⭐⭐⭐** — "The Dragon Block Staff broke during the battle, marking the last time it was ever used". Pattern Damia : Dragon Block Staff = **single-use battle Disc 3 Divine Dragon** canon (cannot reuse Disc 4 — Melbu Frahma uses Wingly magic intrinsic ability). Source: idem.

- [ ] ⭐⭐⭐ **🆕 Dragon Buster LOST canon Disc 3 reveal (fandom) ⭐⭐⭐** — Forest of Winglies Ancestor Blano reveals : Dragon Buster **lost canon** (vs Dragon Block Staff still safe Kadessa). Cohérent existing Divine Dragon fandom canon : Lloyd gives Dart Dragon Buster Disc 4 (post-Melbu Frahma — Lloyd finds/has Dragon Buster Disc 3-4 between reveal "lost" Disc 3 → Lloyd has it Disc 4). À documenter `items/Dragon Buster.md` (à créer) — Wingly sword anti-Dragon Dart ultimate weapon canon NEW. Pattern Wingly anti-Dragon weapons pair canon : Dragon Block Staff (reduce power) + Dragon Buster (sword kill). Source: idem.

- [ ] ⭐⭐ **🆕 Forest of Winglies location canon (fandom) ⭐⭐** — Evergreen Forest secret path north reveals Forest of Winglies hidden canon Disc 3 acquisition quest. Pattern Wingly Forest hostility → Ancestor Blano permits entry. Pattern Wingly teleportation system magic-channel to Kadessa ruins canon. **Meru confirmed Wingly canon** story reveal Disc 3 ✓ via secret path. À documenter `locations/Forest of Winglies.md` (à créer) — Disc 3 Wingly Forest canon NEW. Source: idem.

- [ ] ⭐⭐ **🆕 Ancestor Blano canon NPC NEW (fandom) ⭐⭐** — Wingly elder leader Forest of Winglies canon Disc 3. Pattern thematic "Times won't leave Winglies alone" canon. Pattern Damia : `AncestorBlanoNpc { type: 'wingly-elder'; location: 'forest-of-winglies'; permitsEntry: true; reveals: ['staff-location', 'dragon-buster-lost'] }` data-model canon. À documenter `npcs/Ancestor Blano.md` (à créer) — Wingly elder NEW NPC canon. Source: idem.

- [ ] ⭐⭐ **🆕 Miranda joins group Dragon Block Staff quest canon Disc 3 (fandom) ⭐⭐** — Miranda joins party for Dragon Block Staff quest canon Disc 3. Cohérent existing Miranda Disc 3 join canon story arc. À cross-référer existing `party-members/Miranda.md` join trigger canon Disc 3. Source: idem.

- [ ] ⭐⭐ **🆕 Meru Wingly heritage reveal Disc 3 canon (fandom) ⭐⭐** — Meru reveals Staff location Forest of Winglies via her Wingly heritage. Pattern Meru Wingly confirmé canon Disc 3 story reveal. Cross-référer existing `party-members/Meru.md` Wingly canon. Source: idem.

- [ ] ⭐⭐ **🆕 Rose canon Disc 3 reveals (fandom) ⭐⭐** — Rose canon dialogue Kadessa ruins :
  - "The appearance of an object doesn't correlate to its magical prowess" canon
  - "Divine Dragon was sealed because it could not be tamed nor killed" canon ✓ confirmé Divine Dragon lore cross-source
    Pattern Rose canon knowledge Dragon Campaign veteran lore (cohérent existing). Source: idem.

- [ ] ⭐⭐ **🆕 "Winglies can no longer master the Staff" canon NEW (fandom) ⭐⭐** — Pattern Wingly magic decline thematic Disc 3-4 era. **Dragoons may use Staff canon NEW**. Pattern Damia : Wingly magic civilization decline canon (post-Divine Dragon free era). Source: idem.

- [ ] **🆕 Wingly teleportation system canon (fandom) ⭐** — Forest of Winglies → Kadessa ruins via Blano + Winglies channel magic. Pattern Wingly magic-channel transport canon. À documenter `dragoons/wingly-magic.md` (à créer) — Wingly magic capabilities canon. Source: idem.

- [ ] **🆕 Divine Dragon real stats weakened state canon (fandom) ⭐** — Fandom : "Divine Dragon is weakened as well, but its stats do not change; implying that its stats only reflect the weakened state". Pattern Divine Dragon real stats higher than displayed canon. À documenter `bosses/Divine Dragon.md` (existing) — stats canon = weakened state via Dragon Block Staff. Source: idem.

- [ ] ⭐⭐ **🆕 Pattern Wingly anti-Dragon weapons canon récurrent ⭐⭐** — Pattern Wingly anti-Dragon weapons canon confirmé cross-source :
  - **Dragon Block Staff** : Wingly artifact reduces Dragon + Dragoon power canon (variable effects 10%/40%)
  - **Dragon Buster** : Wingly sword anti-Dragon canon (Dart ultimate weapon Disc 4 from Lloyd)
    Pattern Wingly civilization canon ancient anti-Dragon weapons creation. À documenter `dragoons/wingly-anti-dragon-weapons.md` (à créer) — pattern canon récurrent + items list. Source: idem.

- [x] **✅ Wiki tier 2 Dragon Block Staff ingéré** — `_sources/lod-wiki-dragon-block-staff.md` (legendofdragoon.org/wiki/Dragon_Block_Staff). Cross-source confirmé avec fandom.

### Items / Dragon Block Staff fandom (lore-focused — Luanna 2nd Sacred Sister NEW + Rose recommendation + Endiness world + Divine Dragon bound in chains + VFX eerie green + Deningrad detour + Chapter 3 title + Trivia theory)

- [ ] ⭐⭐⭐ **🆕 Luanna 2nd Sacred Sister of Mille Seseau canon NEW MAJEUR (fandom) ⭐⭐⭐** — Luanna = 2nd Sacred Sister Mille Seseau canon NEW. Reads Staff energy à Deningrad post-Grand Jewel battle : "huge tornado of energy that absorbs everything". Pattern Mille Seseau Sacred Sisters canon : Luanna = #2 (cohérent existing Miranda Sacred Sister canon). Pattern Damia : Luanna = magic-sensitive Sacred Sister NPC canon Disc 3 Deningrad. À documenter `npcs/Luanna.md` (à créer) — 2nd Sacred Sister Mille Seseau magic-sensitive NPC canon NEW. Cohérent existing Deningrad Sacred Sisters canon. Source: [`features/items/_sources/fandom-dragon-block-staff.md`](features/items/_sources/fandom-dragon-block-staff.md).

- [ ] ⭐⭐⭐ **🆕 Deningrad detour story flow Disc 3 canon NEW (fandom) ⭐⭐⭐** — Pattern story flow Disc 3 canon : Forest of Winglies → Kadessa (Grand Jewel) → **Deningrad (Luanna reads Staff)** → Mountain of Mortal Dragon canon NEW. Pattern Damia story progression Disc 3 confirmed. À cross-référer existing Deningrad canon + story flow Disc 3. Source: idem.

- [ ] ⭐⭐ **🆕 Rose recommendation canon (fandom) ⭐⭐** — Dart's group decides search Dragon Block Staff upon **Rose** recommendation canon (vs wiki "Meru reveals location"). Pattern Rose Dragon Campaign veteran knowledge canon. Cross-référer existing `party-members/Rose.md` Dragon Block Staff knowledge canon. Pattern : Rose recommends + Meru leads to Forest of Winglies (cohérent wiki + fandom). Source: idem.

- [ ] ⭐⭐ **🆕 Endiness = TLoD world canon (fandom) ⭐⭐** — Pre-game era canon : Divine Dragon plagued **Endiness** (TLoD world setting canon). Référence world name pour Damia worldbuilding. À cross-référer `lore/world.md` (à créer/vérifier) — Endiness world canon. Source: idem.

- [ ] ⭐⭐ **🆕 Divine Dragon "bound in chains" pre-game canon NEW (fandom) ⭐⭐** — Pre-game era 10,000 years ago : Dragon Block Staff **presumably used to weaken Divine Dragon + bind in chains** canon NEW. Pattern Damia : Divine Dragon = **chained** by Staff ancient era visual/lore canon. À cross-référer existing `bosses/Divine Dragon.md` lore — sealing mechanism chains canon. Source: idem.

- [ ] ⭐⭐ **🆕 VFX Staff activation Divine Dragon battle canon NEW (fandom) ⭐⭐** — Visual canon : Dart **holds Staff up into the air** → **absorbs draconic power** → **glows eerie green** → suddenly breaks → drastically weakens both power. Pattern Damia VFX implementation : `DragonBlockStaffActivationVFX { color: 'eerie-green'; effect: 'tornado-absorbs-draconic-power'; animation: 'dart-holds-staff-up'; result: 'staff-breaks-then-weakens-both' }` data-model canon NEW. À implémenter VFX canon Damia Divine Dragon battle. Source: idem.

- [ ] ⭐ **🆕 Chapter 3 title canon = "Fate & Soul" (fandom) ⭐** — TLoD Disc 3 / Chapter 3 official title canon : "Fate & Soul". Pattern Damia : chapter titles canon préservés. À cross-référer `lore/chapters.md` (à créer/vérifier) — TLoD 4 discs/chapters canon. Source: idem.

- [ ] ⭐⭐ **🆕 Trivia theory officially ambiguous canon (fandom) ⭐⭐** — Dialogue dans game pre-Grand Jewel battle **hints** Dragon Block Staff = force behind Divine Dragon sealing. Pattern **officially ambiguous canon** : "unknown whether actually the case" + "unclear why Staff breaks Divine Dragon battle". Theory : Staff couldn't contain ferocity 'King of Dragons' completely + shattered absorbing too much power canon. Pattern Damia : Staff break = canonical event but mechanism = official mystery canon (Damia respects lore ambiguity). À cross-référer `bosses/Divine Dragon.md` Trivia sealing ambiguity canon. Source: idem.

- [ ] ⭐ **🆕 Divine Dragon vengeful rampage Mille Seseau canon (fandom) ⭐** — Pattern story canon Disc 3 : Divine Dragon awakens Mountain of Mortal Dragon → **vengeful rampage over Mille Seseau** canon (explains Deningrad attack). Cohérent existing Deningrad burned canon. À cross-référer `bosses/Divine Dragon.md` Disc 3 rampage canon. Source: idem.

- [ ] ⭐ **🆕 Ancestor Blano reveals Dragon Buster lost canon (fandom) ⭐** — Confirms wiki canon **précisé** : c'est **Blano specifically** qui révèle Dragon Buster lost (vs vague "wiki reveal"). À cross-référer `npcs/Ancestor Blano.md` (à créer) reveal canon Dragon Buster lost — Blano knowledge canon. Source: idem.

### Mobs / Dragon Soldier wiki (Earth Flanvel Tower Disc 3 — Minor Enemy heavy knight + Physical Attack Barrier NEW ability MAJEUR + HP recovers cross-mob confirmed + Knight Shield NEW item + Metal Fang sibling NEW mob + Flanvel Tower NEW location MAJEUR + AI 3-phase 75% baseline NEW pattern)

- [ ] ⭐⭐⭐ **🆕 Flanvel Tower NEW location canon MAJEUR ⭐⭐⭐** — Disc 3 Mille Seseau Snowfield Tower (cohérent thematic Snow Queen / White Silver Dragon Spirit canon TLoD). Location exclusive Dragon Soldier + Metal Fang mob spawns. À documenter `locations/Flanvel Tower.md` (à créer) — Disc 3 Mille Seseau Snowfield Tower NEW location canon. Cross-référer existing Snowfield + Mille Seseau canon. Source: [`features/mobs/_sources/lod-wiki-dragon-soldier.md`](features/mobs/_sources/lod-wiki-dragon-soldier.md).

- [ ] ⭐⭐⭐ **🆕 Physical Attack Barrier NEW ability canon MAJEUR ⭐⭐⭐** — Self-buff ability "reduces physical damage to 0 until next turn" = full physical immunity 1 turn defensive canon NEW. Pattern Mob defensive self-buff canon rare (most Mob aggressive attacks only). Strategy counter : utiliser Magic attacks pendant Barrier turn (physique inutile). Pattern Damia : `PhysicalAttackBarrierAbility { type: 'self-buff'; effect: 'physical-damage-zero'; duration: 'next-turn' }` data-model canon NEW. À implémenter ability `physicalAttackBarrier` Damia. À investiguer cross-mob/boss : autres mobs/boss avec same ability + symmetric Magical Attack Barrier ? Source: idem.

- [ ] ⭐⭐⭐ **🆕 Dragon Soldier Mob canon Disc 3 Flanvel Tower ⭐⭐⭐** — Earth element Minor Enemy. Stats US HP 488 / AT 122 / DF 160 / MAT 86 / MDF 100 / SPD 50 / A-AV/M-AV 0% + Gold 60 + EXP 180. Pattern "anti-physical heavy tank knight" canon (DF 160 high + AT 122 high + SPD 50 slow). Status 4/4 standard (Petrify/Bewitch/Arm Block/Dispirit ✔ vs Confuse/Fear/Poison/Stun ✗). Counter 28 high-density tier. À documenter `mobs/Dragon Soldier.md` (créé). Source: idem.

- [ ] ⭐⭐ **🆕 HP recovers cross-mob confirmed canon ⭐⭐** — **30% Max HP scaling formula canon** ✓ confirmed cross-mob : Crystal Golem US 160 × 30% = 48 ✓ / Dragon Soldier US 488 × 30% = 146 ✓. Pattern `HpRecoversAbility { type: 'self-heal'; healPercent: 0.3 }` data-model canon **shared cross-mob/boss** (Crystal Golem + Dragon Soldier + Commander Seles confirmed). Source: idem.

- [ ] ⭐⭐ **🆕 Knight Shield NEW item canon ⭐⭐** — 2% drop Dragon Soldier. Pattern thematic "shield" = probable armor canon (defensive equipment knight thematic). Cohérent thematic Dragon Soldier (knight) drops Knight Shield (knight equipment). À documenter `items/equipment.md` Knight Shield armor canon entry — effect précis à investiguer fandom + Guidebook. Source: idem.

- [ ] ⭐⭐ **🆕 Metal Fang sibling mob NEW canon ⭐⭐** — Flanvel Tower fellow encounter (mixed formation 177 = Metal Fang x2 + Dragon Soldier, 35% submap 451). À documenter `mobs/Metal Fang.md` (à créer) — Disc 3 Flanvel Tower Mob NEW. Pattern mixed formation canon : 3-entity formation (Metal Fang x2 + Dragon Soldier). Source: idem.

- [ ] ⭐⭐ **🆕 AI 3-phase 75% baseline + 25% phase-conditional NEW pattern ⭐⭐** — Pattern NEW Mob AI : 75% baseline ability (~Sword Slash 1× phys) + 25% phase-conditional (HP > 25% → Physical Attack Barrier OR HP ≤ 25% → HP recovers, both 25% chance). Pattern aggressive baseline + conditional self-action canon NEW (vs Crystal Golem phase-based exclusive). Pattern Damia : `MobAI3PhaseBaselineConditional` data-model canon NEW. À investiguer cross-mob : autres mobs avec same 75% baseline + 25% conditional pattern ? Source: idem.

- [ ] ⭐ **🆕 Encounter Formation 171 "Unused" canon ⭐** — Dragon Soldier solo (171) = Unused encounter canon (cut content / dev placeholder). Pattern cut content encounter canon : formation existe data mais N/A spawn. Cohérent pattern Dark Elf / Bewitching Arrow cut content canon (existing canon). À noter : encounter ID 171 reserved data mais non-spawn dans final game. Source: idem.

- [ ] ⭐ **🆕 Earth element thematic divergence Snowfield Tower canon ⭐** — Dragon Soldier Earth element dans Snowfield Mille Seseau (vs typical Ice/Water mobs Snowfield). Pattern thematic "stone fortress + armored knight soldier" canon. Cohérent Earth thematic Tower (stone structure) canon. Pattern thematic divergence canon : Earth-element Mob dans région froide → fortress-armor association. Source: idem.

- [ ] ⭐ **🆕 Counter 28 high-density tier confirmé Dragon Soldier ⭐** — Counter Opportunities (28) cohérent existing canon Aqua King / Berserk Mouse / Berserker / Atlow / Blue Bird / etc. Pattern Damia tier mapping confirmed. Per user instruction : feature Counter non-implémentée Damia, factual tier mention only. Source: idem.

- [ ] **🆕 JP stats Dragon Soldier à confirmer fandom future ⚠️** — Wiki US only ingéré (HP 488 / Gold 60). Pattern Damia adopt JP when available (+25% HP typical = ~610 / Gold ÷3 systematic = ~20). À mettre à jour quand fandom Dragon Soldier ingéré. ✅ **RÉSOLU fandom** : JP HP **610** ✓ +25% CONFIRMED / JP Gold **20** ✓ ÷3 CONFIRMED. Source: à ingérer.

### Mobs / Dragon Soldier fandom complement — JP stats CONFIRMED 610/20 + Vanishing Stone Key Item NEW MAJEUR + Optional sector Tower of Flanvel + Appearance detailed grey draconic humanoid + Destructive Cut canon name officiel + Knight Shield ACCESSORY correction + HP Recovery scaling US 146/JP 183 + AT 137 + MAT 97 wiki divergence + Mayfil cross-reference + Additions training

- [ ] ⭐⭐⭐ **🆕 Vanishing Stone Key Item NEW canon MAJEUR (fandom) ⭐⭐⭐** — NEW Key Item canon Damia. **Function canon** : required access optional sector Tower of Flanvel (gates Dragon Soldier mob spawns). Pattern thematic "vanishing" = probable teleport/invisibility/access-key item canon. À documenter `items/Vanishing Stone.md` (à créer) — Key Item Disc 3 Tower of Flanvel optional sector access canon. Pattern Damia : Vanishing Stone gates optional content canon (cohérent pattern existing canon Key Items gating areas). À investiguer : Vanishing Stone obtained where ? Pattern canon Disc 3 sequence ? Source: [`features/mobs/_sources/fandom-dragon-soldier.md`](features/mobs/_sources/fandom-dragon-soldier.md).

- [ ] ⭐⭐⭐ **🆕 Tower of Flanvel optional sector NEW canon MAJEUR (fandom) ⭐⭐⭐** — Dragon Soldier "located **deep within Tower of Flanvel in optional sector** that requires **Vanishing Stone** to enter". Pattern Damia : Tower of Flanvel = Disc 3 Mille Seseau Snowfield Tower + optional gated content via Vanishing Stone Key Item. "Most powerful mob within this location" canon — Dragon Soldier = top-tier mob Tower of Flanvel. À documenter `locations/Tower of Flanvel.md` (à créer) layout + optional sector canon. Source: idem.

- [ ] ⭐⭐⭐ **🆕 JP HP 610 ✓ +25% systematic CONFIRMED (fandom) ⭐⭐⭐** — US wiki 488 × 1.25 = 610 ✓ matches JP fandom exact. Pattern Damia +25% HP US→JP systematic canon récurrent confirmed Crystal Golem (160→200), Deadly Spider (328→410), Death (200→250), Death Purger (533→666), Dragon Soldier (488→610). Source: idem.

- [ ] ⭐⭐⭐ **🆕 JP Gold 20 ✓ ÷3 systematic CONFIRMED (fandom) ⭐⭐⭐** — US 60 ÷ 3 = 20 ✓ matches JP exact. Pattern Damia ÷3 Gold US→JP systematic canon récurrent confirmed cross-mob. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Appearance canon DETAILED MAJEUR (fandom) ⭐⭐⭐** — Pattern thematic **dragon-humanoid knight warrior** canon Dragon Soldier — fusion draconic anatomy + armored knight equipment. **Grey-skinned draconic humanoid** ("hence the name") + **heavy gold-trimmed grey armor** covering majority body (visible : face, arms, feet, tail) + **large shield with emblem upon exterior** (cohérent Knight Shield drop) + **massive sword in opposing hand** (cohérent Destructive Cut + Sword Slash community name) + **red eyes** + **pointed teeth** + **medium-sized horn upon head** + **two large ears** + **three massive hook-shaped claws on each foot** + **large tail resting behind**. Pattern Damia sprite design canon. Source: idem.

- [ ] ⭐⭐ **🆕 Destructive Cut canon name officiel MAJEUR (fandom) ⭐⭐** — Wiki ~Sword Slash = community approximation, fandom révèle **Destructive Cut** name officiel. Effect canon : "Lunges towards single opponent + swings large sword + medium physical damage" (cohérent appearance "massive sword in opposing hand"). 1× Physical damage baseline (wiki + fandom cohérent). Pattern Damia : adopter **Destructive Cut** canon name officiel + flag community ~Sword Slash alias deprecated. Source: idem.

- [ ] ⭐⭐ **🆕 Knight Shield = ACCESSORY classification CORRECTION (fandom) ⭐⭐** — Wiki hypothesis "shield = probable armor" CORRIGÉ → **accessory** canon fandom. Pattern Damia : adopter **Knight Shield = accessory** canon (override wiki hypothesis). À documenter `items/equipment.md` Knight Shield accessory classification correction. Pattern thematic "knight equipment accessory" canon (cohérent Dancer's Shoes accessory thematic pattern). Effect précis à investiguer Guidebook future (probable stat/elemental bonus accessory canon). "Decent item of which you may want to attain" — desirable accessory canon. Farming time average 45 minutes canon. Source: idem.

- [ ] ⭐⭐ **🆕 HP Recovery scaling resolved cross-version (fandom) ⭐⭐** — US fandom 146 HP heal ✓ matches wiki 146 ✓ exact. JP fandom 183 HP heal ✓ matches calculation 610 × 30% = 183 ✓ exact. Pattern **30% scaling formula canon CONFIRMED cross-mob + cross-version** ✓ : Crystal Golem US 160 × 30% = 48 ✓ / JP 200 × 30% = 60 ✓ + Dragon Soldier US 488 × 30% = 146 ✓ / JP 610 × 30% = 183 ✓. ⚠️ Fandom "roughly 28%" imprécis — Damia adopt **30% Max HP exact** (wiki + math confirmed). HP Recovery vs HP recovers naming variant — adopt **HP Recovery** (fandom capitalization more formal canon). Source: idem.

- [ ] ⭐⭐ **🆕 AT 137 + MAT 97 fandom CORRECTION wiki (+12%/+13% divergence) ⭐⭐** — Wiki AT 122 vs Fandom 137 / Wiki MAT 86 vs Fandom 97. Pattern Damia adopt fandom higher (JP closer probable cohérent pattern systematic). À valider Guidebook JP future. Source: idem.

- [ ] ⭐⭐ **🆕 HP US 488 vs 528 wiki/fandom divergence ⚠️** — Wiki US 488 vs Fandom US/EU 528 (+8.2%). Damia adopt JP 610 priority (US source ambiguity wiki/fandom disagree US stat). Source: idem.

- [ ] ⭐⭐ **🆕 "Spam Physical Attack Barrier quite often" frequency canon (fandom) ⭐⭐** — Dragon Soldier tend to abuse Physical Attack Barrier ability "quite often" canon fandom. Pattern Damia : AI 25% chance Physical Attack Barrier > 25% HP — frequency observable behavior canon. Source: idem.

- [ ] ⭐⭐ **🆕 Mayfil cross-reference Disc 4 damage tier canon (fandom) ⭐⭐** — "Updated gear + levels → **average damage similar to Mayfil monsters**" canon fandom. Pattern Damia : Dragon Soldier = Disc 3 mob with **Disc 4-tier offensive output** canon. À cross-référer `locations/Mayfil.md` (à créer) Death City Disc 4 damage benchmark canon. Pattern thematic : Dragon Soldier punches above Disc 3 weight class (optional content reward justifies difficulty). Source: idem.

- [ ] ⭐ **🆕 Additions training farming spot canon (fandom) ⭐** — Dragon Soldier ideal Additions training (high HP + Counter 28 + spam Physical Attack Barrier). Pattern Damia : Dragon Soldier farming spot canon recommended Disc 3 Additions training. Source: idem.

- [ ] ⭐ **🆕 Knight Shield farming time 45 min avg (fandom) ⭐** — 2% drop rate canon ⚠️ rare drop. Farming estimate canon Damia documentation. Source: idem.

- [ ] ⭐ **🆕 Encounter formation 177 wiki vs fandom divergence ⭐** — Wiki ID 177 : "Metal Fang x2, Dragon Soldier" (2× Metal Fang + 1× Dragon Soldier) vs Fandom : "Dragon Soldier x2 + Metal Fang" (2× Dragon Soldier + 1× Metal Fang). Damia adopt **wiki canon** (more precise + ID numbered + submap referenced). Possible fandom inversion / typo canon — wiki priority data source. Source: idem.

- [ ] **🆕 Encounter rate "Common" canon fandom** — Cohérent wiki 20-35% submap dependent. Pattern Damia encounter rate descriptive terminology canon. Source: idem.

### Bosses / Dragon Spirit wiki (3 ghost-form bosses Mayfil Disc 4 — Feyrbrand + Regole + Divine Dragon revisit — Dual-entity boss + Retaliate passive NEW MAJEUR + Untargetable Ghost form trick + Cross-boss untargetable canon récurrent + 3 signature Spell Items + Status Slime/W Laser/Tsunami NEW + Divine Dragon Cannon position-based ✓)

- [ ] ⭐⭐⭐ **🆕 3 Dragon Spirits Mayfil Disc 4 canon MAJEUR ⭐⭐⭐** — 3 ghost-form bosses Disc 4 Mayfil Death City = revisit canon dragons defeated previously : (1) Dragon Spirit (Feyrbrand) Wind HP 8000 formation 449 submap 542 drop Down Burst 100% ; (2) Dragon Spirit (Regole) Water HP 12000 formation 448 submap 544 drop Frozen Jet 100% ; (3) Dragon Spirit (Divine Dragon) Non-Elemental HP 16000 formation 447 submap 546 drop Flash Hall 100%. Pattern thematic Mayfil = revisit boss area canon Disc 4. À documenter `bosses/Dragon Spirit.md` (créé). Cohérent existing Divine Dragon canon "BATTLE AT MAYFIL revisit boss" canon. Source: [`features/bosses/_sources/lod-wiki-dragon-spirit.md`](features/bosses/_sources/lod-wiki-dragon-spirit.md).

- [ ] ⭐⭐⭐ **🆕 Dual-entity boss canon MAJEUR (Dragon Spirit + Ghost) ⭐⭐⭐** — Chaque Dragon Spirit = Dragon Spirit form (targetable) + Ghost form (untargetable). Pattern Damia : `DragonSpiritBoss { entityType: 'dual-entity'; ghostForm: { targetable: false; ... } }` data-model canon NEW. Boss-tier dual-entity pattern canon NEW Damia. À documenter `combat/dual-entity-bosses.md` (à créer). Source: idem.

- [ ] ⭐⭐⭐ **🆕 Retaliate passive canon NEW MAJEUR ⭐⭐⭐** — Reactive ability triggered when Dragon Spirit targeted by attack → "Ignore turn order + use Instigate" / transform Ghost + abilities. Pattern Damia : `RetaliatePassive { trigger: 'on-targeted-by-attack'; chance: 'variable'; effect: 'ignore-turn-order + instigate' }` data-model canon NEW. Variant per-spirit canon : Feyrbrand "use Instigate" / Regole "transform + subset abilities" / Divine Dragon "transform + 7-ability sub-pool expansive". À documenter `combat/passives.md` (à créer) Retaliate canon. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Untargetable Ghost form Trivia MAJEUR canon NEW ⭐⭐⭐** — Ghost counterpart "likely only intended for creating graphical effect of transforming" → consequence canon : **Ghost forms unaffected Power Down + Speed Down** ⚠️ bypass debuffs canon. Strategy implication : Power Down + Speed Down INEFFECTIVE Dragon Spirits battles. Pattern Damia : `UntargetableGhostFormBoss { unaffectedByDebuffs: ['power-down', 'speed-down']; purpose: 'graphical-transformation-effect' }` data-model canon NEW. À documenter `combat/stat-debuffs.md` (à créer) Power Down + Speed Down ineffective untargetable canon. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Cross-boss untargetable trick canon récurrent NEW MAJEUR ⭐⭐⭐** — 5 additional bosses canon untargetable trick confirmed : **Kamuy** (NEW boss) + **Lloyd (Flanvel Tower)** (NEW variant separate main Lloyd Disc 3) + **Magician Faust (Real)** (NEW variant separate "real" form) + **Claire** (NEW boss — Dart's mother encounter possible Disc 4 ?) + **Zieg Feld** (NEW boss — Dart's father antagonist final-area Disc 4). 5 additional + 3 Dragon Spirits = **8 bosses canon confirmed** untargetable mechanic. À documenter individuels : `bosses/Kamuy.md`, `bosses/Lloyd (Flanvel Tower).md`, `bosses/Magician Faust (Real).md`, `bosses/Claire.md`, `bosses/Zieg Feld.md` (tous à créer). Source: idem.

- [ ] ⭐⭐⭐ **🆕 Lloyd (Flanvel Tower) NEW boss variant canon MAJEUR ⭐⭐⭐** — Boss variant Disc 3 Tower of Flanvel separate main Lloyd boss canon. Cohérent existing canon Lloyd Disc 3-4 + cohérent Dragon Soldier Tower of Flanvel canon Disc 3. Pattern Damia : Lloyd multiple encounters canon (Lloyd Tower of Flanvel Disc 3 + main Lloyd boss Disc 3-4). Untargetable trick canon. À documenter `bosses/Lloyd (Flanvel Tower).md` (à créer). Source: idem.

- [ ] ⭐⭐⭐ **🆕 Magician Faust (Real) NEW boss variant canon MAJEUR ⭐⭐⭐** — Boss variant "real" form separate main Magician Faust boss canon. Pattern Damia : Faust multiple encounters canon (Real variant + main Faust). Untargetable trick canon. À investiguer "Real" qualifier meaning canon (real vs illusion ?). À documenter `bosses/Magician Faust (Real).md` (à créer). Source: idem.

- [ ] ⭐⭐⭐ **🆕 Claire NEW boss canon MAJEUR ⭐⭐⭐** — Boss canon NEW référence Trivia Dragon Spirit. Claire = Dart's mother canon lore. Pattern Damia : Claire boss encounter possible Disc 4 ? (à investiguer story canon) — possible Mayfil revisit thematic cohérent ghost-form encounters. Untargetable trick canon. À documenter `bosses/Claire.md` (à créer). Source: idem.

- [ ] ⭐⭐⭐ **🆕 Zieg Feld NEW boss canon MAJEUR ⭐⭐⭐** — Boss canon NEW référence Trivia Dragon Spirit. Zieg Feld = Dart's father canon lore — antagonist final-area Disc 4 canon. Pattern Damia : Zieg Feld boss encounter Disc 4 final-area Moon That Never Sets ? (à investiguer story canon). Untargetable trick canon. À documenter `bosses/Zieg Feld.md` (à créer). Source: idem.

- [ ] ⭐⭐⭐ **🆕 Kamuy NEW boss canon MAJEUR ⭐⭐⭐** — Boss canon NEW référence Trivia Dragon Spirit. Untargetable trick canon. À investiguer story canon (Kamuy = ?). À documenter `bosses/Kamuy.md` (à créer). Source: idem.

- [ ] ⭐⭐⭐ **🆕 3 signature Spell Items drops 100% canon ⭐⭐⭐** — Dragon Spirit form 100% guaranteed drops : **Down Burst** (Wind, Feyrbrand spirit) + **Frozen Jet** (Water, Regole spirit) + **Flash Hall** (Non-Elemental, Divine Dragon spirit). Pattern thematic spirit element matches Spell Item element canon. À documenter `items/Down Burst.md` + `items/Frozen Jet.md` + `items/Flash Hall.md` (tous à créer/vérifier). Pattern Damia : 3 spirits = 3 free signature Spell Items canon (1 farm run). Source: idem.

- [ ] ⭐⭐⭐ **🆕 Mayfil Death City Disc 4 = Dragon Spirits encounter location canon ⭐⭐⭐** — 3 spawn submaps 542/544/546 separate encounter formations canon. Pattern Damia : Mayfil = revisit boss area canon Disc 4 (3 Dragon Spirits + autres bosses Mayfil canon). À documenter `locations/Mayfil.md` (à créer). Cross-référer existing Mayfil mentions canon (Dragon Soldier Mayfil cross-reference + Divine Dragon "BATTLE AT MAYFIL"). Source: idem.

- [ ] ⭐⭐⭐ **🆕 Instigate self-action canon ✓ cohérent Boss Extras + Divine Dragon canon ⭐⭐⭐** — Action self-targeting transforming Dragon Spirit → Ghost form → use Ghost ability → revert Dragon Spirit. Pattern Boss Extras Instigate canon : canonical mechanic transforming entity boss. Pattern Damia : `InstigateSelfAction { type: 'transform-attack-revert'; targetForm: 'ghost-form' }` data-model canon. Cohérent existing Divine Dragon Disc 3 Boss Extras Instigate canon. À documenter `combat/boss-extras.md` (à créer/vérifier) Instigate canon. Source: idem.

- [ ] ⭐⭐ **🆕 Status Slime NEW Feyrbrand spirit ability MAJEUR ⭐⭐** — 1× Physical damage + **100% inflict Fear OR Poison OR Stun** (multi-status proc canon NEW vs typical 50% single-status). Pattern Damia : `StatusSlimeAbility { type: 'physical+multi-status'; multiplier: 1; statusProcs: ['fear', 'poison', 'stun']; procChance: 1.0 }` data-model canon NEW. À implémenter ability Damia. Source: idem.

- [ ] ⭐⭐ **🆕 W Laser NEW Regole spirit ability MAJEUR ⭐⭐** — 2× **Light-elemental** magic Party (cross-element canon : Water spirit uses Light magic NEW). Pattern Damia : `WLaserAbility { type: 'magic-party-aoe'; multiplier: 2; element: 'light' }` data-model canon NEW. Pattern cross-element canon : spirits use abilities outside their natural element canon. À implémenter ability Damia. Source: idem.

- [ ] ⭐⭐ **🆕 Tsunami NEW Regole spirit ability MAJEUR ⭐⭐** — 4× Water-elemental magic Party (high-tier Party AoE canon). Pattern Damia : `TsunamiAbility { type: 'magic-party-aoe'; multiplier: 4; element: 'water'; accessTrigger: 'instigate-only' }` data-model canon NEW. ⭐⭐ **Differential ability access canon NEW** : Tsunami available only via Instigate (NOT Retaliate) — pattern canon NEW. À implémenter ability Damia. Source: idem.

- [ ] ⭐⭐ **🆕 Divine Dragon spirit canonical Dragon Spirit form abilities NOT ~ approximations ⭐⭐** — **Burning Wave** (3× Fire Party) / **Burn Out** (1.5× Fire Single) / **Pellet** (1.5× Earth Single) / **Down Burst** (3× Wind Party) = canon names officiels (no ~ marker wiki). Cohérent existing Divine Dragon Disc 3 boss canon. Pattern Damia : Dragon Spirit form 4 abilities = canon names from existing Divine Dragon canon (cohérent revisit). Source: idem.

- [ ] ⭐⭐ **🆕 Divine Dragon Cannon position-based AoE canon ✓ cohérent existing ⭐⭐** — Position-based AoE : 4× primary / 2× adjacent Non-Elemental magic. Pattern position-based : central member primary → both sides adjacent / side member primary → central adjacent + opposite side NOT targeted. Pattern Damia : `DivineDragonCannonAbility { type: 'position-based-aoe'; multiplierPrimary: 4; multiplierAdjacent: 2; element: 'non-elemental'; magicType: 'magic' }` data-model canon (cohérent existing canon Divine Dragon Disc 3). Source: idem.

- [ ] ⭐⭐ **🆕 EXP/Gold "0/X" pattern dual-entity yield canon NEW ⭐⭐** — Ghost form = 0 EXP / 0 Gold (untargetable, defeated indirectly via Dragon Spirit defeat) / Dragon Spirit form = X yield canon. Pattern Damia : dual-entity yield split canon (cohérent untargetable trick mechanic). Source: idem.

- [ ] ⭐⭐ **🆕 Status all 8 ✔ Boss-tier all 3 Dragon Spirits canon ⭐⭐** — Standard pattern Boss all 8 ✔ immune (Petrify/Bewitch/Arm Block/Dispirit/Confuse/Fear/Poison/Stun). Cohérent existing canon Boss-tier all 8 ✔ pattern. Source: idem.

- [ ] ⭐⭐ **🆕 Counter 28 high-density tier all 3 Dragon Spirits canon ⭐⭐** — Cohérent existing canon HIGH DENSITY tier pattern. Per user instruction : feature Counter non-implémentée Damia, factual tier mention only. Source: idem.

- [ ] ⭐ **🆕 Retaliate variant per-spirit canon ⭐** — Feyrbrand : "use Instigate" (standard) / Regole : "transform Ghost Regole + Tentacle Smash OR W Laser + revert" (subset, NO Tsunami via Retaliate) / Divine Dragon : "transform Divine Dragon Ghost + 7-ability sub-pool expansive" (most complex). Pattern canon variant per-spirit. Source: idem.

- [ ] ⭐ **🆕 M-AV 0/5% Regole variant canon NEW ⭐** — Dragon Spirit form 0% / Ghost form 5% différencié pattern NEW canon. Pattern Damia : stats variant per-form canon NEW. Source: idem.

- [ ] **🆕 Wiki naming inconsistency Divine Dragon Barrage vs Divine Dragon Bullet ⚠️** — Retaliate passive lists "Divine Dragon Bullet" mais Abilities lists "Divine Dragon Barrage" — probable typo wiki canon. Damia adopt **Divine Dragon Barrage** (Abilities section more authoritative + cohérent ~ approximation marker). À clarifier fandom future. Source: idem.

- [ ] **🆕 Dragon Spirit Story canon à investiguer ⚠️** — Wiki section "Read More" — story lore Dragon Spirits canon Mayfil revisit. À ingérer wiki + fandom future pour comprendre narrative context 3 Dragon Spirits canon. Source: idem.

- [ ] **🆕 JP stats Dragon Spirits à confirmer fandom future ⚠️** — Wiki US only ingéré. Pattern Damia adopt JP when available (+25% HP typical / ÷3 Gold systematic). À mettre à jour quand fandom Dragon Spirits ingéré (probablement détaillé sur Feyrbrand/Regole/Divine Dragon fandom pages individuelles). Source: à ingérer.

- [ ] **🆕 Element advantages Dragon Spirits canon à clarifier ⚠️** — Feyrbrand Wind weak Earth ? Regole Water weak Fire/Lightning ? Divine Dragon Non-Elemental neutral all ? À clarifier `combat/elements.md` cross-référence canon. Source: à investiguer.

- [ ] **🆕 Retaliate chance % canon ⚠️** — Wiki dit "Chance to trigger when targeted by attack" — exact % à investiguer fandom + Discord future. Source: à investiguer.

### Mobs / Dragonfly wiki (Thunder Valley of Corrupted Gravity Disc 2 — Minor Enemy + Thunderbolt canon name officiel + Counter 4 very-low tier 2ème instance + AI 2-phase + Balanced anti-stat tank profile NEW + Angel's Prayer 8% drop + Valley 5 submaps location canon)

- [ ] ⭐⭐⭐ **🆕 Thunderbolt canon name officiel MAJEUR ⭐⭐⭐** — Party AoE 1× Thunder-elemental magic damage canon name officiel (NOT ~ approximation). Pattern thematic "thunder strike electric discharge" canon Dragonfly Thunder element. Pattern Damia : `ThunderboltAbility { type: 'magic-party-aoe'; multiplier: 1; element: 'thunder'; target: 'party' }` data-model canon NEW. À implémenter ability `thunderbolt` Damia. Pattern Thunder-element ability canon NEW Mob — à cross-référer existing Thunder mobs (Cute Cat) pour pattern shared canon. Source: [`features/mobs/_sources/lod-wiki-dragonfly.md`](features/mobs/_sources/lod-wiki-dragonfly.md).

- [ ] ⭐⭐ **🆕 Dragonfly Mob canon Disc 2 Valley of Corrupted Gravity ⭐⭐** — Thunder element Minor Enemy. Stats US HP 296 / AT 32 / DF 120 / MAT 31 / MDF 150 / SPD 80 / A-AV/M-AV 0% + Gold 21 + EXP 48. Pattern "balanced anti-stat tank" canon NEW (DF 120 + MDF 150 dual high defense). Status 4/4 standard. Counter 4 very-low tier. AI 2-phase Claw and Pierce (>25%) / Thunderbolt (≤50% Party Thunder magic). Angel's Prayer 8% drop. À documenter `mobs/Dragonfly.md` (créé). Source: idem.

- [ ] ⭐⭐ **🆕 Valley of Corrupted Gravity 5 submaps location canon ⭐⭐** — Disc 2 dungeon area (cohérent existing `locations/README.md` "à spec"). 5 submaps Dragonfly spawn : 252 (35% primary) / 254 (20%) / 255 / 256 / 257 (10% each). Pattern thematic "gravity-bent valley + aerial mobs" cohérent. À documenter `locations/Valley of Corrupted Gravity.md` (à créer) — Disc 2 dungeon area canon. Source: idem.

- [ ] ⭐⭐ **🆕 Counter 4 very-low tier 2ème instance canon ⭐⭐** — Dragonfly = 2ème Minor Enemy "Very low" tier ingestion canon Damia (cohérent Bowling existing pattern). Counter Opportunities tier mapping canon Damia updated : 7 tiers 0/3/4/9/16/19/28 — tier 4 confirmed 2 instances (Bowling + Dragonfly). Source: idem.

- [ ] ⭐⭐ **🆕 Pattern "balanced anti-stat tank" canon Dragonfly NEW ⭐⭐** — DF 120 high + MDF 150 high = dual high defense (vs typical anti-physical OR anti-magic single-priority pattern existing canon). First Minor Enemy balanced anti-stat profile ingestion canon Damia. À investiguer cross-mob : autres mobs avec balanced DF+MDF profile ? Pattern Damia : new combat archetype "balanced defensive tank" canon NEW. Source: idem.

- [ ] ⭐⭐ **🆕 AI 2-phase Mob HP overlap zone canon ⭐⭐** — Phase 1 (HP > 25%) ~Claw and Pierce / Phase 2 (HP ≤ 50%) Thunderbolt. HP overlap zone 25-50% canon : both abilities possible (equal chance random selection per Minor Enemy AI canon). Pattern Damia : MobAI overlap zone selection canon — équivalent existing pattern Mob AI canon. Source: idem.

- [ ] ⭐⭐ **🆕 Angel's Prayer 8% drop canon Dragonfly Disc 2 farming source ⭐⭐** — Existing item canon Angel's Prayer = revive item. 8% drop rate canon. Pattern Dragonfly farming source canon Disc 2 (early revive item farming spot). À cross-référer `items/Angel's Prayer.md` (à créer/vérifier) — revive item canon Damia. Source: idem.

- [ ] ⭐ **🆕 SPD 80 high first-strike often canon Dragonfly ⭐** — Pattern aerial dragonfly thematic cohérent (fast aerial real-world association). SPD 80 = high tier Minor Enemy (vs Dragon Soldier SPD 50 slow knight). Pattern Damia : SPD canon per-mob archetype. Source: idem.

- [ ] ⭐ **🆕 Thunder element Minor Enemy ingestion canon Damia ⭐** — Dragonfly = 2ème Thunder Minor Enemy ingestion (1er = Cute Cat existing canon). Thunder mobs limited canon. Pattern Damia : Thunder element rare Minor Enemy ingestion. Source: idem.

- [ ] ⭐ **🆕 ~Claw and Pierce community approximation canon ⭐** — Community approximation baseline ability (1× phys) Dragonfly >25% phase. Pattern thematic "dragonfly claws + piercing sting" canon (insect physical attack). Source: idem.

- [ ] ⭐ **🆕 AT 32 / MAT 31 low offensive canon Dragonfly ⭐** — Weak attacker (mostly Thunderbolt magic Party AoE threat ≤50% HP). Pattern Damia : low-offensive Mob with single magic AoE threat canon. Source: idem.

- [ ] ⭐ **🆕 Escape rate 40% Valley of Corrupted Gravity canon ⭐** — Cohérent Home of Gigantos 40% intermediate Disc 1-2 pattern. Pattern Damia escape rate Disc 2 dungeon. Source: idem.

- [ ] **🆕 JP stats Dragonfly à confirmer fandom future ⚠️** — Wiki US only ingéré (HP 296 / Gold 21). Pattern Damia adopt JP when available (+25% HP typical = ~370 / Gold ÷3 = ~7). À mettre à jour quand fandom Dragonfly ingéré. ✅ **RÉSOLU fandom** : JP HP **370** ✓ +25% CONFIRMED / JP Gold **7** ✓ ÷3 CONFIRMED. Source: à ingérer.

### Mobs / Dragonfly fandom complement — JP stats CONFIRMED 370/7 + Devil Sting canon name officiel MAJEUR + Appearance purple draconic demonic visage detailed + Thunderbolt cross-source confirmed + Angel's Prayer 30 G shop purchasable NEW + Dragonfly x2 rare formation NEW + HP US 319 / AT 35 / MAT 35 / XP 36 divergences wiki

- [ ] ⭐⭐⭐ **🆕 Devil Sting canon name officiel MAJEUR (fandom) ⭐⭐⭐** — Wiki ~Claw and Pierce = community approximation, fandom révèle **Devil Sting** name officiel. Effect canon : "Flies towards + latches on + stings single target with tail + high physical damage" (cohérent appearance "long sharp pointed tail"). 1× phys damage baseline. Pattern thematic "Devil" prefix cohérent demonic visage head appearance canon Dragonfly. Pattern Damia : adopter **Devil Sting** canon name officiel + flag community ~Claw and Pierce alias deprecated. À implémenter ability `devilSting` Damia. Source: [`features/mobs/_sources/fandom-dragonfly.md`](features/mobs/_sources/fandom-dragonfly.md).

- [ ] ⭐⭐⭐ **🆕 Appearance canon DETAILED MAJEUR Dragonfly (fandom) ⭐⭐⭐** — Pattern thematic **purple draconic-demonic humanoid insect creature** canon Dragonfly — fusion dragon + demonic + insect aerial design. **Purple draconic creature** + **floats with two wings** (cohérent SPD 80 high aerial) + **long sharp pointed tail** (cohérent Devil Sting) + **long arms half body length** with **massive razor-like claws** + **torso somewhat humanoid** + **head almost demonic visage** (cohérent "Devil" Sting prefix canon). Pattern Damia sprite design canon. Source: idem.

- [ ] ⭐⭐⭐ **🆕 JP HP 370 ✓ +25% systematic CONFIRMED Dragonfly (fandom) ⭐⭐⭐** — Wiki US 296 × 1.25 = 370 ✓ matches JP fandom exact. ⚠️ Fandom US 319 divergence wiki 296 — JP base derived from **wiki US** baseline canon (NOT fandom US). Pattern Damia adopt JP 370 priority + flag US source ambiguity wiki/fandom. Pattern Damia +25% HP US→JP systematic canon récurrent CONFIRMED 7 mobs : Crystal Golem (160→200) + Deadly Spider (328→410) + Death (200→250) + Death Purger (533→666) + Dragon Soldier (488→610) + Dragonfly (296→370). Source: idem.

- [ ] ⭐⭐⭐ **🆕 JP Gold 7 ✓ ÷3 systematic CONFIRMED Dragonfly (fandom) ⭐⭐⭐** — US 21 ÷ 3 = 7 ✓ matches JP exact. Pattern Damia ÷3 Gold US→JP systematic canon récurrent confirmed cross-mob. Source: idem.

- [ ] ⭐⭐ **🆕 Thunderbolt canon name CROSS-SOURCE confirmed Dragonfly (fandom) ⭐⭐** — Canon name officiel CROSS-SOURCE confirmed (wiki + fandom both list canon name). Effect canon fandom : "Large thunderbolt rains upon all party members + high Thunder element magic damage". Pattern Damia ThunderboltAbility data-model canon cross-mob (Dragonfly + à investiguer Cute Cat ?). Source: idem.

- [ ] ⭐⭐ **🆕 Angel's Prayer purchasable 30 Gold "practically every shop" canon NEW MAJEUR (fandom) ⭐⭐** — Revive item buyable standard consumable canon NEW. Pattern Damia : drop farming **inefficient** when shop available (Angel's Prayer 30 G alternative vs Dragonfly 8% drop). Strategy farming canon optionnel. À documenter `items/Angel's Prayer.md` (à créer) — revive item canon Damia + purchasable 30 G + drop sources. Pattern Damia consumable items shop economy canon NEW. Source: idem.

- [ ] ⭐⭐ **🆕 Dragonfly x2 rare formation NEW canon (fandom) ⭐⭐** — "Very rarely appear with another Dragonfly" canon. "Never appears with other types of monsters" — Dragonfly exclusive formation canon (no mixed). ⚠️ Pattern wiki vs fandom : wiki encounter formation list mentions only Dragonfly solo (92) — fandom canon Dragonfly x2 rare formation = NEW formation potentially unlisted wiki ⚠️ à confirmer. Source: idem.

- [ ] ⭐⭐ **🆕 "Most powerful regularly encounterable monster Valley of Corrupted Gravity" canon (fandom) ⭐⭐** — Dragonfly = top-tier Mob Valley canon. "Damage potentially very high especially when health halved" (Thunderbolt phase activation ≤50% HP). À noter : "regularly encounterable" qualifier suggère non-regular encounters Valley (boss spawns ?) — à investiguer. Source: idem.

- [ ] ⭐⭐ **🆕 HP US fandom 319 vs wiki 296 divergence ⚠️** — Wiki US 296 vs Fandom US 319 (+23 / +7.8% divergence). Damia adopt JP 370 priority (cohérent +25% systematic pattern wiki US × 1.25 = 370 ✓ NOT fandom US 319 × 1.16). Pattern Damia : flag US source ambiguity wiki/fandom + adopt JP canon. Source: idem.

- [ ] ⭐⭐ **🆕 XP 36 fandom vs 48 wiki MAJOR divergence ⚠️** — -25% wiki vs fandom XP. Damia adopt fandom **36** probable closer JP canon (cohérent +25% HP pattern : XP scaling inverse ?). À valider Guidebook JP future. Pattern canon NEW : XP US/JP can differ from HP scaling formula. Source: idem.

- [ ] ⭐⭐ **🆕 AT 35 + MAT 35 fandom CORRECTION wiki Dragonfly (+9%/+13% divergence) ⭐⭐** — Wiki AT 32 vs Fandom 35 / Wiki MAT 31 vs Fandom 35. Pattern Damia adopt fandom higher (JP closer probable cohérent pattern systematic). À valider Guidebook JP future. Source: idem.

- [ ] ⭐ **🆕 Encounter rate "Uncommon" Dragonfly canon (fandom) ⭐** — Pattern Damia encounter rate descriptive terminology canon. Cohérent existing canon "Common" terminology pattern. Source: idem.

- [ ] ⭐ **🆕 Farming time "roughly an hour" Angel's Prayer Dragonfly source canon (fandom) ⭐** — 8% drop rate canon. Vs Knight Shield 45 min (Dragon Soldier) — Dragonfly farming slower (~2× rate). Pattern Damia drop farming time canon documentation. Source: idem.

### Bosses / Drake the Bandit wiki (Wind Shrine of Shirley Disc 1 — Multi-entity boss 5 entities + Final Blow passive Disc 1 NEW + Bomb→Wire→HP recovers chain NEW + Bursting Ball Boss Extra NEW kamikaze + Wire Boss Extra NEW MAJEUR defensive shield + Impassable/Sharp passives NEW + Bandit's Ring 30% drop NEW + Boss Extras canonical 4ème instance)

- [ ] ⭐⭐⭐ **🆕 Drake the Bandit Multi-entity Boss canon MAJEUR Disc 1 ⭐⭐⭐** — Boss Shrine of Shirley submap 161 Wind element. Multi-entity battle canon : Drake (HP 1,200) + 3× Bursting Ball (HP 64 kamikaze bombs) + 1× Wire (HP 120 defensive shield) = 5-entity battle. Story canon : Drake = bandit stealing Shirley's Light Dragoon Spirit Disc 1. À documenter `bosses/Drake the Bandit.md` (créé). Source: [`features/bosses/_sources/lod-wiki-drake-the-bandit.md`](features/bosses/_sources/lod-wiki-drake-the-bandit.md).

- [ ] ⭐⭐⭐ **🆕 Final Blow passive Disc 1 canon NEW MAJEUR ⭐⭐⭐** — Drake the Bandit confirms Disc 1 instance Final Blow passive (cohérent existing Divine Dragon Final Blow canon Disc 3). Effect canon : battle ends when Drake HP reaches 0 (Boss Extras persist mais battle ends). Pattern Damia : `FinalBlowPassive { trigger: 'main-boss-hp-zero'; effect: 'end-battle' }` data-model canon — Drake confirms cross-disc canonical recurring passive (Disc 1 Drake + Disc 3 Divine Dragon). Pattern canon multi-entity boss : kill main = win battle. À documenter `combat/passives.md` (à créer/vérifier) Final Blow passive cross-boss canon. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Bomb Trap → Wire Trap → HP recovers chain canon NEW MAJEUR ⭐⭐⭐** — Sequential "Enable" trigger system Drake AI canon NEW : (1) Bomb Trap (within first 3 actions guaranteed — summons 3× Bursting Ball + enables Wire Trap) → (2) Wire Trap (HP ≤ 50% — summons Wire + enables HP recovers) → (3) HP recovers (HP ≤ 33.3% — single-use 30% Max HP heal = 360 HP). Pattern Damia `EnableChainAI` data-model canon NEW. À cross-référer pattern Boss AI canon cross-boss. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Bursting Ball Boss Extra NEW canon MAJEUR ⭐⭐⭐** — Kamikaze self-destruct AoE bomb Boss Extra summoned by Drake's Bomb Trap (3× simultaneous). Stats HP 64 fragile + DF 150 high + MDF 50 low. AI 2-Roll-Forward → Auto-Detonate (1× phys + self-destructs) Auto. Position-based target "opposite party member" canon (3-position cohérent existing Divine Dragon Cannon). Pattern Damia : `BurstingBallKamikazeAI { rollPhases: 2; autoDetonate: true; target: 'opposite-party-member'; selfDestruct: true }` data-model canon NEW. Strategy : magic burst (MDF 50 low) avant Auto-Detonate trigger. À implémenter Boss Extra summoned entity Damia avec kamikaze AI canon NEW. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Wire Boss Extra NEW canon MAJEUR defensive shield ⭐⭐⭐** — Boss Extra summoned by Drake's Wire Trap (1× single). Stats HP 120 + AT 13 (irrelevant — passive-only) + DF 120. AI = ~Do nothing (passive-only entity canon NEW). 2 NEW passives MAJEURS defensive shield for Drake : Impassable + Sharp. Pattern Damia : Boss Extra passive-only entity canon NEW (cohérent thematic Wire = inanimate trap barbed wire). À implémenter Boss Extra entity Damia avec passive-only AI canon NEW. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Impassable passive canon NEW MAJEUR (Wire) ⭐⭐⭐** — **0× Physical Damage Multiplier to Drake the Bandit** = full physical immunity via Wire while alive. Pattern Damia : `ImpassablePassive { effect: 'physical-damage-zero-to-protected-entity'; protectedEntity: 'drake-the-bandit' }` data-model canon NEW. Pattern Boss Extra defensive shield canon NEW : Wire = shield for Drake (physical attacks deal 0 damage while Wire alive). Strategy counter : kill Wire first to disable Impassable + access physical damage Drake. À implémenter passive `impassable` Damia. À cross-référer pattern existing Boss Extra defensive shield canon (cohérent Lloyd Untargetable Dark Doel canon ?). Source: idem.

- [ ] ⭐⭐⭐ **🆕 Sharp reactive passive canon NEW MAJEUR (Wire) ⭐⭐⭐** — **(1,000 / attacker's DF) Physical Damage** reactive to attacker when Drake targeted by Addition. ⚠️ Reactive damage formula canon NEW : 1,000 / DF inverse formula (lower DF = higher damage taken). Pattern Damia : `SharpReactivePassive { trigger: 'protected-targeted-by-addition'; formula: '1000 / attackerDF'; damageTarget: 'attacker' }` data-model canon NEW. Pattern reactive thorns/spikes damage canon NEW (cohérent thematic Wire = sharp barbed wire). Strategy counter : avoid Additions Drake-targeted while Wire alive (Magic / Items / non-Addition attacks favored). À implémenter passive `sharp` Damia. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Boss Extras canonical 4ème instance confirmed ⭐⭐⭐** — Drake the Bandit Disc 1 + Crafty Thief Disc 1 + Divine Dragon Disc 3 + Dark Doel Disc 4 = 4 Boss Extras instances cross-disc confirmed canon. Pattern Damia : Boss Extras = canonical recurring boss mechanic (4 instances Disc 1/3/4). À documenter `combat/boss-extras.md` (à créer/vérifier) Boss Extras canonical pattern Damia. Source: idem.

- [ ] ⭐⭐ **🆕 HP recovers single-use chain-gated canon NEW variant ⭐⭐** — Drake HP recovers single-use vs Crystal Golem repeatable / Dragon Soldier repeatable — pattern Damia HP recovers variants cross-boss canon (repeatable vs single-use). 30% Max HP = 360 HP (Drake US 1,200 × 30% = 360 ✓ cohérent existing 30% formula cross-mob/boss confirmed). Triple-condition gated : Wire Trap enabled + HP ≤ 33.3% + single-use. À implémenter ability `hpRecovers` Damia avec variant single-use option canon. Source: idem.

- [ ] ⭐⭐ **🆕 Bandit's Ring 30% drop NEW item canon ⭐⭐** — High drop rate (vs typical 2-8% Mob accessory). Pattern thematic "Bandit" name = cohérent Drake the Bandit signature drop. Probable accessory canon (ring thematic). À documenter `items/equipment.md` Bandit's Ring accessory entry — effect précis à investiguer fandom + Guidebook. Pattern Damia : high drop rate Boss signature item canon (vs Mob low rate). Source: idem.

- [ ] ⭐⭐ **🆕 Shrine of Shirley Drake submap 161 location canon ⭐⭐** — Drake spawn submap 161 (vs Crystal Golem submaps 153/154/156 — boss-specific submap canon). Pattern thematic Shirley Light Dragoon Spirit shrine canon. À cross-référer `locations/Shrine of Shirley.md` (à créer) — Disc 1 Light Dragoon Spirit location canon avec Drake submap 161 + Crystal Golem submaps 153/154/156. Source: idem.

- [ ] ⭐⭐ **🆕 Bomb Trap "within first 3 actions" guaranteed canon ⭐⭐** — Drake AI guaranteed Bomb Trap within first 3 actions canon — pattern guaranteed early-battle ability cross-boss ? Pattern Damia : Boss AI scripted-priority canon documentation. À investiguer cross-boss pattern. Source: idem.

- [ ] ⭐⭐ **🆕 Multi-entity boss priority order strategy canon ⭐⭐** — Drake battle priority canon : (1) Kill Bursting Balls rapidly (HP 64 fragile + Auto-Detonate threat 2-turn warning) → (2) Kill Wire if summoned (disable Impassable + Sharp passives) → (3) Focus Drake (Final Blow ends battle). Pattern Damia : multi-entity boss strategy canon order kill priority. Source: idem.

- [ ] ⭐⭐ **🆕 Counter 0 No counter tier confirmed 3 entities Drake ⭐⭐** — Drake + Bursting Ball + Wire all Counter 0 (cohérent existing canon Air Combat/Feyrbrand/Fire Bird/Canbria Dayfly). Pattern Damia tier mapping canon : Boss + Boss Extras Counter 0 standard pattern. Source: idem.

- [ ] ⭐ **🆕 Boss Extras 0/0/Nothing yield pattern confirmed ⭐** — Bursting Ball + Wire EXP/Gold/Drop 0 cohérent existing Boss Extra no-yield pattern canon Damia. Source: idem.

- [ ] ⭐ **🆕 Scripted encounter + Escape 0% Drake canon standard ⭐** — Pattern Boss battle standard non-fuyable scripted canon. Source: idem.

- [ ] **🆕 JP stats Drake + Boss Extras à confirmer fandom future ⚠️** — Wiki US only ingéré (Drake HP 1,200 / Gold 100 + Bursting Ball HP 64 + Wire HP 120). Pattern Damia adopt JP when available (+25% HP typical / Gold ÷3 systematic). À mettre à jour quand fandom Drake the Bandit ingéré. Source: à ingérer.

- [ ] **🆕 Story Drake the Bandit canon à investiguer ⚠️** — Wiki section "Read More" — story lore Drake bandit stealing Shirley's Light Dragoon Spirit canon Disc 1. À ingérer wiki + fandom future pour comprendre narrative context complet. ✅ **RÉSOLU fandom** : Drake = guardian Shrine canon + Dragoni Plant cure Shana Dragon poisoning + White Silver Dragoon Spirit Shirley acquisition + Drake love Shirley + Drake = only boss NPC canon. Source: idem.

### Bosses / Drake the Bandit fandom complement — JP HP 1,500 ✓ CONFIRMED + Drake = Guardian Shrine canon MAJEUR + Dragoni Plant + Dragon poisoning + White Silver Dragoon Spirit + Canon names Dagger Toss/Wire Net/Bombs/Heal + Healing Potion item canon NEW + Kamuy CROSS-SOURCE CONFIRMED + Drake = ONLY boss NPC UNIQUE + Drake love Shirley NEW lore + Resident Knight Harris NEW NPC + Special Transformation Dragoon ref

- [ ] ⭐⭐⭐ **🆕 JP HP 1,500 ✓ +25% systematic CONFIRMED Drake (fandom) ⭐⭐⭐** — Wiki US 1,200 × 1.25 = 1,500 ✓ matches JP fandom exact. Pattern Damia +25% HP US→JP systematic canon récurrent CONFIRMED **Boss instance** (Drake = 1er Boss confirmé +25% pattern Damia — vs Mobs Crystal Golem/Deadly Spider/Death/Death Purger/Dragon Soldier/Dragonfly). ⚠️ **Gold ÷3 NOT applied Boss anomaly ⚠️** : Drake Gold US 100 = JP 100 (vs Mob ÷3 systematic). Pattern Damia : Bosses Gold canon ≠ Mobs Gold ÷3 systematic — à investiguer cross-boss pattern. Source: [`features/bosses/_sources/fandom-drake-the-bandit.md`](features/bosses/_sources/fandom-drake-the-bandit.md).

- [ ] ⭐⭐⭐ **🆕 Drake = Guardian Shrine of Shirley canon MAJEUR (fandom) ⭐⭐⭐** — NOT bandit per se — defender role canon officiel fandom. "For a long time, Drake protected Shrine of Shirley **from other bandits**." Fiercely loyal Shirley. Origin unknown. Pattern Damia : "Drake the Bandit" = name (probable misnomer / community label) + role canon = guardian. À cross-référer canon. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Dragoni Plant + Dragon poisoning canon Disc 1 lore MAJEUR (fandom) ⭐⭐⭐** — Party (Dart/Lavitz/Rose) goes beyond "troublesome plant" in Nest of Dragon → Shrine of Shirley **in search of Dragoni Plant** as cure for **Shana's Dragon poisoning** ⭐ canon Disc 1. ⚠️ Shirley reveal : "there is NONE [Dragoni Plant] in the Shrine". Pattern Damia : **Dragoni Plant = NEW Key Item canon MAJEUR** (cure Dragon poisoning Shana Disc 1). **Dragon poisoning Shana = canon status effect Disc 1** (probable Shana Dragon Spirit consequence). À documenter `items/Dragoni Plant.md` (à créer) + `status-effects/dragon-poisoning.md` (à créer). Source: idem.

- [ ] ⭐⭐⭐ **🆕 White Silver Dragoon Spirit Shirley acquisition canon Disc 1 (fandom) ⭐⭐⭐** — Shirley gives Spirit to heal Shana (alternative cure Dragoni Plant). Cohérent existing Shana White Silver Dragoon canon. Pattern Damia : Shirley = previous White Silver Dragoon canon → passes Spirit to Shana. Spirit heals Shana's Dragon poisoning canon. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Canon ability names officiels fandom MAJEUR Drake (fandom) ⭐⭐⭐** — Wiki community approximations → fandom révèle canon names :
  - **Dagger Toss** (~Throw Knives wiki) — throws "2 daggers" possible multi-hit canon (ambiguity vs wiki 1× phys)
  - **Bombs** (~Bomb Trap wiki) — opens box + 3 bombs + 3 rolls + massive damage explosion
  - **Wire Net** (~Wire Trap wiki) — weaves wire net + invulnerable physical + barrier needs destroyed
  - **Heal via Healing Potion item** (HP recovers wiki ability classification) — heal 360 HP when "yellow or below" UI threshold
    Pattern Damia : adopter canon names officiels fandom + flag wiki ~ aliases deprecated. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Healing Potion item-based Boss heal canon NEW MAJEUR (fandom) ⭐⭐⭐** — Drake "uses Healing Potion" item to heal 360 HP (vs wiki HP recovers ability classification). Pattern Damia : **Healing Potion item-based Boss heal canon NEW** (cohérent existing Commander Healing Potion canon reference). Pattern ambiguity canon Item vs Ability classification — Damia adopt fandom narrative (Boss consumes item) + mechanic wiki canon (30% Max HP heal). Pattern canon : Boss using consumable items canon NEW. À cross-référer `items/Healing Potion.md` (à créer/vérifier) — existing canon item Damia + Boss consumption canon NEW. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Kamuy boss CROSS-SOURCE CONFIRMED via Drake Trivia (fandom) ⭐⭐⭐** — Drake model reused Disc 3 Furni listening Resident Knight Harris' plan about **wolf Kamuy**. **CROSS-SOURCE CONFIRMATION** existing Dragon Spirit Trivia untargetable trick canon (8 bosses untargetable confirmed) ! Kamuy = wolf boss canon Disc 3 Furni. À documenter `bosses/Kamuy.md` (à créer) — wolf boss canon Disc 3 + story canon à investiguer. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Drake = ONLY boss becoming NPC canon UNIQUE Trivia MAJEUR (fandom) ⭐⭐⭐** — "Drake the Bandit is the only boss in the game to become a NPC that can freely be talked to after the fight" canon fandom. Pattern canon UNIQUE : no other boss canon has post-battle dialogue NPC mode. Pattern Damia : Drake post-battle NPC UNIQUE canon — special case lore device. À documenter `combat/boss-mechanics.md` (à créer) — Drake post-battle NPC UNIQUE canon. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Drake love Shirley canon NEW lore MAJEUR (fandom) ⭐⭐⭐** — Post-game dialogue Shrine of Shirley : Drake admits "**in love with Shirley**" + "**keeps guarding Shrine despite not believing Shirley returns**". Pattern thematic lore canon : Drake's loyalty motivated by love + tragic devotion canon. Pattern Damia : Drake post-battle dialogue NPC canon Disc 1-2+ continue Shrine guard + love reveal lore device. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Resident Knight Harris NEW NPC canon Furni Disc 3 (fandom) ⭐⭐⭐** — NPC Furni Disc 3 + Kamuy plan canon reference. À documenter `npcs/Resident Knight Harris.md` (à créer) — NEW NPC Furni Disc 3 + Kamuy plan canon. À documenter `locations/Furni.md` (à créer/vérifier) — Disc 3 location canon. Source: idem.

- [ ] ⭐⭐ **🆕 Special Transformation command Dragoons canon reference (fandom) ⭐⭐** — Fandom strategy : "Using the Special Transformation command might be recommendable to **double the attacking power of Dragoons for a given time**". Pattern Dragoon mechanic canon : 2× damage timed. À cross-référer `dragoons/mechanics.md` Special Transformation canon (existing canon ?). Pattern Damia : Dragoon damage-doubling timed mechanic canon référence. Source: idem.

- [ ] ⭐⭐ **🆕 JP name canon Drake 盗賊ドレイク (Tōzoku Doreiku) "Thief Drake" (fandom) ⭐⭐** — US "Bandit" = JP "Thief" localization variant. Pattern Damia : adopt **Drake the Bandit** (US official name) + JP name référence canon. Source: idem.

- [ ] ⭐⭐ **🆕 HP threshold "yellow or below" UI indicator canon NEW (fandom) ⭐⭐** — UI HP color threshold indicator canon (vs wiki "HP ≤ 33.3%" numeric threshold) — same threshold différent representation. Pattern Damia : UI HP color thresholds canon (yellow/red/etc.) — à documenter UI canon. Source: idem.

- [ ] ⭐⭐ **🆕 AT 23 + MAT 20 fandom CORRECTION wiki Drake (+15%/+18% divergences) ⭐⭐** — Wiki AT 20 vs Fandom 23 / Wiki MAT 17 vs Fandom 20. Pattern Damia adopt fandom higher (JP closer probable cohérent pattern systematic). À valider Guidebook JP future. Source: idem.

- [ ] ⭐⭐ **🆕 Wire HP 100 fandom vs 120 wiki divergence ⚠️ (fandom) ⭐⭐** — Wire Boss Extra HP -20/-17% fandom vs wiki. Damia adopt wiki precise data (120 HP). Source: idem.

- [ ] ⭐⭐ **🆕 Bombs HP 76 fandom vs Bursting Ball 64 wiki divergence ⚠️ (fandom) ⭐⭐** — Bursting Ball Boss Extra HP +12/+19% fandom vs wiki. Damia adopt wiki precise data (64 HP). Source: idem.

- [ ] ⭐⭐ **🆕 Bombs roll count 3 fandom vs 2 wiki divergence ⚠️ (fandom) ⭐⭐** — Bursting Ball Roll Forward sequence count +50% fandom vs wiki. Damia adopt wiki precise (2-roll canon — cohérent precise wiki AI data). Source: idem.

- [ ] ⭐⭐ **🆕 Nest of Dragon "troublesome plant" obstacle canon Disc 1 (fandom) ⭐⭐** — Disc 1 path canon Nest of Dragon → Shrine of Shirley with "troublesome plant" obstacle. Pattern Damia : Nest of Dragon location canon Disc 1 + plant obstacle mécanique canon. À documenter `locations/Nest of Dragon.md` (à créer/vérifier) Disc 1 location canon + plant obstacle. Source: idem.

- [ ] ⭐⭐ **🆕 Shrine of Shirley layout canon traps + chests + messages (fandom) ⭐⭐** — Drake's defenses : "Multitude of traps + messages inside chests" to discourage adventurers + bandits intruding. Pattern Damia : Shrine of Shirley layout canon Disc 1 (Drake traps + chests messages + Crystal Golem mob spawns + Drake submap 161 boss). À documenter `locations/Shrine of Shirley.md` (à créer) layout canon complet. Source: idem.

- [ ] ⭐⭐ **🆕 Dart Explosion Dragoon Magic Spell canon reference (fandom) ⭐⭐** — Dart Dragoon Magic Spell canon. Fire-element Dart ability canon strategy vs Drake (cohérent Dart Fire Dragoon canon). À documenter/vérifier `party-members/Dart.md` Explosion canon Dragoon ability. Source: idem.

- [ ] ⭐ **🆕 Battle pragmatism Rose canon (fandom) ⭐** — Rose canon dialogue : "it would be easier to kill him" → pattern Rose pragmatic character canon cohérent existing Rose canon. Source: idem.

- [ ] ⭐ **🆕 Drake "Bandit's loyalty" mystery canon (fandom) ⭐** — "Never revealed how he came to picking up that task" — pattern thematic mystery canon Drake's origin. Source: idem.

### Mobs / Earth Shaker wiki (Earth Barrens Disc 1 — Minor Enemy + ~Stomp the Ground 0.5× Party AoE NEW low multiplier MAJEUR + Stunning Hammer 8% 2ème farming source + A-AV reduces Stun 3ème instance pattern récurrent + Barrens 2 submaps + AI 2-phase HP-shift variant NEW)

- [ ] ⭐⭐⭐ **🆕 ~Stomp the Ground 0.5× Party AoE NEW low multiplier canon MAJEUR ⭐⭐⭐** — First instance < 1× multiplier Mob canon Damia. Pattern Damia `StompTheGroundAbility { type: 'physical-party-aoe'; multiplier: 0.5 }` data-model canon NEW. Pattern thematic "earth-shaker stomps ground = weak Party tremor". ⚠️ **Sub-1× multiplier canon** (rare Mob — most Mobs ≥ 1× offensive). À investiguer cross-mob : autres mobs avec sub-1× multiplier abilities ? À implémenter ability `stompTheGround` Damia. Source: [`features/mobs/_sources/lod-wiki-earth-shaker.md`](features/mobs/_sources/lod-wiki-earth-shaker.md).

- [ ] ⭐⭐ **🆕 Earth Shaker Mob canon Disc 1 Barrens ⭐⭐** — Earth element Minor Enemy. Stats US HP 200 / AT 33 / DF 140 / MAT 27 / MDF 60 / SPD 50 + Gold 15 + EXP 48. Pattern "anti-physical tank moderate" (DF 140 high + MDF 60 low magic favored counter). Status 4/4 standard. Counter 28 high-density. AI 2-phase HP-shift NEW variant. Stunning Hammer 8% drop. À documenter `mobs/Earth Shaker.md` (créé). Source: idem.

- [ ] ⭐⭐ **🆕 Stunning Hammer 8% drop canon Earth Shaker 2ème farming source ⭐⭐** — Cohérent existing Cursed Jar Stunning Hammer 100% Stun NEW canon. Earth Shaker = 2ème source farming canon Damia (vs Cursed Jar primary Disc 1-2 Rare Monster). Pattern Damia : multi-source farming canon Stunning Hammer (Cursed Jar + Earth Shaker Barrens Disc 1 Minor). À cross-référer `items/Stunning Hammer.md` (à créer/vérifier) — drop sources cross-mob canon. Source: idem.

- [ ] ⭐⭐ **🆕 A-AV reduces status proc canon RÉCURRENT 3ème instance ⭐⭐** — Earth Shaker ~Rush 50% Stun proc + A-AV reduces canon récurrent. Cohérent existing Caterpillar boss + Crystal Golem mob A-AV reduces status pattern canon. Earth Shaker = **3ème instance pattern confirmé canon Damia cross-mob/boss** (Caterpillar boss + Crystal Golem mob + Earth Shaker mob). Pattern Damia : A-AV reduction status proc canon universel cross-entity ? Source: idem.

- [ ] ⭐⭐ **🆕 Barrens location canon Disc 1 confirmé Earth Shaker ⭐⭐** — Cohérent existing Crafty Thief Barrens canon. 2 submaps spawn Earth Shaker (232 + 233 primary 35%). À documenter `locations/Barrens.md` (à créer/vérifier) — Disc 1 location canon. Source: idem.

- [ ] ⭐⭐ **🆕 AI 2-phase HP-shift NEW pattern variant Earth Shaker ⭐⭐** — Phase 1 (HP > 50%) aggressive Single (~Rush 1× phys + 50% Stun proc) → Phase 2 (HP ≤ 50%) **weak Party AoE shift** (~Stomp the Ground 0.5× phys Party). Pattern "wounded mob defensive AoE shift" canon NEW (vs typical mob escalation pattern). Pattern Damia : `MobAI2PhaseHPShift` data-model canon NEW. Source: idem.

- [ ] ⭐ **🆕 Counter 28 high-density tier confirmé Earth Shaker** — Cohérent existing canon Aqua King/Berserker/Dragon Soldier/Dragon Spirits/etc. Source: idem.

- [ ] ⭐ **🆕 Escape rate 40% Earth Shaker Barrens canon** — Pattern intermediate Disc 1 (cohérent Home of Gigantos / Crystal Golem / Dragonfly 40% pattern). Source: idem.

- [ ] **🆕 JP stats Earth Shaker à confirmer fandom future ⚠️** — Wiki US only ingéré (HP 200 / Gold 15). Pattern Damia adopt JP when available (+25% HP typical = ~250 / Gold ÷3 = ~5). À mettre à jour quand fandom Earth Shaker ingéré. ✅ **RÉSOLU fandom** : JP HP **250** ✓ +25% CONFIRMED / JP Gold **5** ✓ ÷3 CONFIRMED. Source: à ingérer.

### Mobs / Earth Shaker fandom complement — JP HP 250/5 CONFIRMED + Charge/Earthquake canon names officiels MAJEUR + Appearance rhinoceros 4 horns cuboid DETAILED + Stunning Hammer 3-turn Stun duration REVEALED + Haschel Stun resistance NEW + Donau Flower City + Fork World Map + Stun loop trap canon

- [ ] ⭐⭐⭐ **🆕 Charge canon name officiel MAJEUR Earth Shaker (fandom) ⭐⭐⭐** — Wiki ~Rush = community approximation, fandom révèle **Charge** name officiel. Effect canon : "Charges towards single target + smashes with **horns** + medium damage + 50% Stun proc" (cohérent appearance "4 horns facing forward"). Pattern thematic "rhinoceros charge with 4 horns smash" canon. Pattern Damia : adopter **Charge** canon name officiel + flag community ~Rush alias deprecated. Source: [`features/mobs/_sources/fandom-earth-shaker.md`](features/mobs/_sources/fandom-earth-shaker.md).

- [ ] ⭐⭐⭐ **🆕 Earthquake canon name officiel MAJEUR Earth Shaker (fandom) ⭐⭐⭐** — Wiki ~Stomp the Ground = community approximation, fandom révèle **Earthquake** name officiel. Effect canon fandom : "Stands up + stomps ground with **front two feet** + high damage all targets" ⚠️ divergence wiki precise 0.5× vs fandom qualitative "high damage". Damia adopt wiki precise 0.5× multiplier canon (sub-1× Mob NEW pattern Damia first instance). Pattern Damia : adopter **Earthquake** canon name officiel + flag community ~Stomp the Ground alias deprecated. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Appearance canon DETAILED MAJEUR Earth Shaker (fandom) ⭐⭐⭐** — Pattern thematic **large rhinoceros-creature** canon. Large rhinoceros + **4 horns on face all facing forward** (cohérent Charge "horns smash") + short heavy pointed tail + little spikes on sides + **bulky creature rectangular cuboid structure** (visual). Pattern Damia sprite design canon : grey rhinoceros + 4 forward horns + cuboid body + side spikes + short pointed tail. Source: idem.

- [ ] ⭐⭐⭐ **🆕 JP HP 250 ✓ +25% systematic CONFIRMED Earth Shaker (fandom) ⭐⭐⭐** — US 200 × 1.25 = 250 ✓ matches JP fandom exact. Pattern Damia +25% HP US→JP systematic canon récurrent CONFIRMED 8 entities maintenant : Crystal Golem / Deadly Spider / Death / Death Purger / Dragon Soldier / Dragonfly / Drake the Bandit (Boss) / **Earth Shaker**. Source: idem.

- [ ] ⭐⭐⭐ **🆕 JP Gold 5 ✓ ÷3 systematic CONFIRMED Earth Shaker (fandom) ⭐⭐⭐** — US 15 ÷ 3 = 5 ✓ matches JP exact. Pattern Damia ÷3 Gold Mob systematic confirmed cross-mob (vs Boss Drake anomaly Gold ÷3 NOT applied). Source: idem.

- [ ] ⭐⭐⭐ **🆕 Stunning Hammer 3-turn Stun duration canon NEW REVEALED MAJEUR (fandom) ⭐⭐⭐** — "Stunning Hammer stuns single target for **THREE TURNS**" canon precise duration REVEALED. Pattern Damia : `StunningHammerItem { type: 'item-attack-stun'; statusProc: 'stun'; procChance: 1.0; duration: 3 }` data-model canon NEW. Cohérent existing Cursed Jar 100% Stun proc canon. Fandom commentary : "no real need to get one, especially at the low 8% chance" — Stunning Hammer underpowered farming canon. À cross-référer `items/Stunning Hammer.md` (à créer/vérifier) — 3-turn duration REVEALED + drop sources cross-mob. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Haschel Stun resistance canon NEW MAJEUR (fandom) ⭐⭐⭐** — "Haschel seems to have good resistance towards being stunned so he would be more useful in this battle" canon fandom. Pattern Damia : **per-character status resistance canon NEW** (probable stat-based ou character-trait canon). À cross-référer `party-members/Haschel.md` Stun resistance canon NEW. Pattern Damia : party member individual resistance to status effects canon NEW. À investiguer cross-status : other character resistances canon ? Source: idem.

- [ ] ⭐⭐ **🆕 Donau "Flower City" canon nickname (fandom) ⭐⭐** — Cohérent existing Donau location canon. Pattern Damia : Donau = "Flower City" nickname canon. À cross-référer `locations/Donau.md` existing canon + nickname update. Source: idem.

- [ ] ⭐⭐ **🆕 Fork World Map Donau ↔ Valley of Corrupted Gravity canon Disc 1 (fandom) ⭐⭐** — Earth Shaker "very high chance of being the only fight at the **fork between Donau (Flower City) and Valley of Corrupted Gravity**" canon. Pattern Damia : Barrens spawn fork canon Disc 1 World Map road. À cross-référer `world-map/` (à créer) — Disc 1 fork canon. Source: idem.

- [ ] ⭐⭐ **🆕 Stun loop trap canon NEW Earth Shaker x2 (fandom) ⭐⭐** — "Could get stuck in a loop where one or more people are stunned repetitively, constantly taking 100+ damage possibly until death" canon. Pattern Damia : Earth Shaker x2 Stun cascade = potential party wipe canon. Strategy : kill quickly OR Haschel team to mitigate. Source: idem.

- [ ] ⭐⭐ **🆕 Additions training farming spot canon Earth Shaker (fandom) ⭐⭐** — "Good for getting additions up at first when they still take several hits to knock down" canon. Pattern Damia : Earth Shaker = 2ème Additions training spot canon (cohérent Dragon Soldier pattern existing). Pattern Damia farming canon documentation. Source: idem.

- [ ] ⭐⭐ **🆕 AT 31 fandom INVERSE divergence wiki 33 ⚠️ (fandom) ⭐⭐** — Wiki AT 33 vs Fandom 31 (-2 / -6%) — pattern atypique (vs typical fandom higher). Damia adopt wiki 33 (cohérent typical pattern). Pattern Damia : flag inverse divergence canon. Source: idem.

- [ ] ⭐⭐ **🆕 MAT 31 fandom CORRECTION wiki 27 (+15% divergence) ⭐⭐** — Wiki MAT 27 vs Fandom 31. Pattern Damia adopt fandom higher (JP closer probable cohérent pattern systematic). Source: idem.

- [ ] ⭐ **🆕 Encounter rate "Very common" Earth Shaker canon (fandom) ⭐** — Pattern Damia encounter rate descriptive terminology canon. Source: idem.

- [ ] ⭐ **🆕 "Always paired with another Earth Shaker" fandom claim ⚠️ INACCURATE (fandom) ⭐** — Wiki solo formation (84) submap 232 10% exists ⚠️ fandom inaccurate claim. Damia adopt wiki canon (solo + x2 both formations exist). Source: idem.

### Combat / Enemies wiki (foundation meta-page MAJEUR — Random encounters arrow color NEW + 6 Damage Formulas REVEALED + 11 Variable Multipliers REVEALED + 14 NEW Bosses revealed via database + Categories 3+1 confirmed + Total Vanishing/Pandemonium susceptibility + Graphical-only entities canon)

- [ ] ⭐⭐⭐⭐⭐ **🆕 6 Damage Formulas canon REVEALED MAJEUR wiki ⭐⭐⭐⭐⭐** — Physical : `floor{floor[floor{floor[(AT^2 * 5 / DF)] * AttackMult * TargetFear * AttackerFear} * Power] * Guard}` / Magical : MAT²/MDF + Field + Element / Addition Counter : AT² × 250/DF / 100 (wiki incomplete ⚠️) / **Rare Monster Attack** : `(Target MaxHP / 10)` = **10% Max HP** NEW canon / **Wire Counter** : `(1000 / DF)` ✓ Drake Bandit Sharp passive cross-source CONFIRMED / **Haunting Bolt** : `(Target CurrentHP / 2)` = **50% Current HP** Ghost Commander signature NEW. À documenter `combat/damage-formula.md` (existing — update with revealed formulas). Source: [`features/combat/_sources/lod-wiki-enemies.md`](features/combat/_sources/lod-wiki-enemies.md).

- [ ] ⭐⭐⭐ **🆕 11 Variable Multipliers canon REVEALED MAJEUR wiki ⭐⭐⭐** — Attack Multiplier (hidden per-enemy) / Target Fear ×2 / Attacker Fear ×0.5 / Power (Power items state) / Attacker Power Up ×0.5 / Power Down −0.5 / Target Power Up −0.5 / Down ×0.5 (ambiguity ⚠️) / Field (element match special field) / Attack Element match/opposite ×0.5/−0.5 / Element (Target Element vs attack element) ×0.5/−0.5 / Guard ×0.5. Pattern Damia : 11 variables canon définissent toute formule damage cross-attack-type. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Random encounter mechanic Arrow color indicator canon NEW MAJEUR wiki ⭐⭐⭐** — UI spinning triangle above Dart's head 3-tier color : Blue (Many steps) / Yellow (Some) / Red (Few). Each area uses different step value (per-location threshold canon). À documenter `combat/random-encounters.md` (à créer) — arrow color indicator canon NEW + step counter mechanic. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Bug 75% fewer steps running up/right canon NEW wiki ⭐⭐⭐** — "A bug causes movement up or right when running to count 75% fewer steps than intended". Pattern Damia : known game bug canon direction-dependent step count. ⚠️ Décision Damia : reproduire OR fixer ce bug ? Balance vs canon. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Patrolling visible enemies areas canon NEW wiki ⭐⭐⭐** — Some areas arrow permanent red + visible patrolling enemies collision = battle (vs random invisible). Pattern Damia : 2 encounter mechanics canon (random steps + patrolling visible). Source: idem.

- [ ] ⭐⭐⭐ **🆕 Rare Monster Attack signature 10% Max HP canon NEW MAJEUR wiki ⭐⭐⭐** — `(Target MaxHP / 10)` formula = Rare Monsters signature attack canon NEW. Pattern Damia : Rare Monsters gimmick damage canon (Cursed Jar / Lucky Jar / Treasure Jar / Cute Cat). À documenter `combat/damage-formula.md` Rare Monster Attack canon NEW. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Haunting Bolt 50% Current HP Ghost Commander signature canon NEW MAJEUR wiki ⭐⭐⭐** — `(Target CurrentHP / 2)` formula = Ghost Commander Phantom Ship Disc 2 signature ability canon NEW. Pattern : strong but cannot kill (always leaves 50% HP min). À cross-référer `bosses/Ghost Commander.md` (à créer/vérifier) — Haunting Bolt signature canon NEW. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Wire Counter formula ✓ CROSS-SOURCE CONFIRMED Drake Bandit Sharp passive wiki ⭐⭐⭐** — `(1000 / DF)` formula ✓ confirme Sharp passive Wire Boss Extra Drake canon existing. Pattern Damia : Sharp passive Drake Wire = Wire Counter formula cohérent ✓. Cross-source confirmation canon Damia consolidée. Source: idem.

- [ ] ⭐⭐⭐ **🆕 14 NEW Bosses canon revealed via Enemies database wiki ⭐⭐⭐** — Database wiki révèle 14 NEW bosses canon Damia : Belzac/Damia/Kanzas/Syuveil (4 Legendary 7 Dragoons Vellweb optional) + Last Kraken (Aglis) + Windigo + Imago/Pupa/Caterpillar transforms + Magician Faust Apparition vs Optional variants + Kubila/Vector/Selebus (Zenebatos) + Lavitz's Spirit + Zackwell (Mayfil) + Indora + Michael/Michael's Core + Archangel + Melbu Frahma + Tentacle/Bomb Star/Monster (3 Boss Extras final boss). À documenter `bosses/` 14 nouvelles entrées. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Belzac + Damia + Kanzas + Syuveil = 4 Legendary 7 Dragoons canon NEW MAJEUR ⭐⭐⭐** — Optional fight Vellweb = legendary Dragoons spirits canon Disc 4. Each drops "Stone" elemental item canon (Golden / Blue Sea / Violet / Jade Stones). Pattern thematic Vellweb = Dragoons legendary final resting place canon. Cohérent existing canon 7 legendary Dragoons Dragon Campaign. Stats : Belzac HP 16,000 Earth / Damia HP 9,000 Water / Kanzas HP 12,000 Thunder / Syuveil HP 10,000 Wind. À documenter `bosses/Belzac.md` + `bosses/Damia.md` + `bosses/Kanzas.md` + `bosses/Syuveil.md` (tous à créer). Source: idem.

- [ ] ⭐⭐⭐ **🆕 Melbu Frahma final boss + 3 Boss Extras canon MAJEUR ⭐⭐⭐** — Melbu Frahma HP 42,000 = highest HP canon TLoD. 3 Boss Extras Tentacle / Bomb Star / Monster (HP 1,600 each Non-Elemental). Pattern canon multi-entity final boss canon (cohérent existing Boss Extras pattern). À documenter `bosses/Melbu Frahma.md` (à créer/vérifier) — final boss canon Disc 4 + 3 Boss Extras. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Lavitz's Spirit + Zackwell canon Mayfil Disc 4 MAJEUR ⭐⭐⭐** — Lavitz's Spirit = Lavitz revisit ghost form Disc 4 Mayfil canon NEW MAJEUR (Lavitz died Disc 1). HP 5,000 Wind + Halberd 50% drop (cohérent Lavitz Halberd weapon canon). Zackwell HP 8,000 Darkness multi-entity battle + Healing Rain 100% drop. Pattern thematic Mayfil = ghost area Disc 4 (cohérent existing Dragon Spirits canon). À documenter `bosses/Lavitz's Spirit.md` + `bosses/Zackwell.md` (à créer). Source: idem.

- [ ] ⭐⭐⭐ **🆕 Magician Faust 2 variants canon CONFIRMED ⭐⭐⭐** — **Apparition** (Flanvel Tower 0 EXP / 0 Gold / Nothing drop) = story scripted variant + **Optional** (Flanvel Tower 20,000 EXP / 10,000 Gold / Phantom Shield 100% drop) = post-game optional super-boss. ⚠️ Cohérent existing Drake Trivia "Magician Faust (Real)" — "Real" probable = "Optional" variant (real fight vs Apparition cutscene). À documenter `bosses/Magician Faust.md` (à créer) — 2 variants canon. Source: idem.

- [ ] ⭐⭐ **🆕 Graphical-only entities excluded canon NEW wiki ⭐⭐** — Kamuy's Tree + 4 Mazo found with Faust = untargetable non-attacking entities excluded database. Pattern Damia : untargetable + non-attacking = graphical-only (excluded) vs untargetable BUT attacking (Dragon Spirits Ghost forms) = included. 4 Mazo Faust = NEW graphical entities canon Magician Faust battle. Pattern Damia : graphical-only canon design philosophy. Source: idem.

- [ ] ⭐⭐ **🆕 Total Vanishing / Pandemonium susceptibility Minor Enemies canon confirmed ⭐⭐** — Page Enemies wiki confirme Minor Enemies (incl. Rare Monsters) susceptible Total Vanishing / Pandemonium instant-kill items canon. Pattern Damia : instant-kill items work vs Minor Enemies only (Bosses immune). Source: idem.

- [ ] ⭐⭐ **🆕 Enemies meta-page database master reference canon wiki ⭐⭐** — 100+ enemies entries complete stats (HP / DF / MDF / PAV / MAV / AT / MAT / SPD / EXP / Gold / Drops / Location). Pattern Damia : database = master reference future cross-source validation stats canon. Cohérent existing ingestions individuelles Damia. Source: idem.

- [ ] ⭐ **🆕 Rare Monsters terminology Guidebook 2000 p.15 reference canon ⭐** — Citation Legend of Dragoon Official Guidebook (ASCII, 2000) p.15 confirme terminology officiel "Rare Monsters" canon (vs community variants "Unique Monsters" fandom). Pattern Damia : adopt "Rare Monsters" canon Guidebook officiel. Source: idem.

- [ ] **🆕 Addition Counter formula complete à investiguer ⚠️** — Wiki incomplete formula `floor{floor[floor{floor[(AT^2 * 250 / DF)] / 100} * Target Fear * Attacker...`. À investiguer Discord ou autre source pour formule complete. Source: à investiguer.

- [ ] **🆕 Power formula Target Power Up vs Down ambiguity wiki ⚠️** — Wiki ambiguity "Target Power Up → −(1/2) or if power up then (1/2)". À clarifier fandom + Discord future. Source: à investiguer.

### Mobs / Erupting Chick wiki (Wind Valley of Corrupted Gravity Disc 2 — Minor Enemy + Summon Roc temporary one-shot summon NEW MAJEUR + Run away! self-escape NEW MAJEUR + A-AV 20% high tier + Killer Bird + Spider Urchin NEW partner mobs)

- [ ] ⭐⭐⭐ **🆕 Summon Roc canon NEW MAJEUR Erupting Chick wiki ⭐⭐⭐** — Mob summons **Roc** (Boss Extra-like entity) → **2× Physical damage Party AoE** → ⚠️ **Roc does NOT remain in battle** canon NEW. Pattern Damia : `SummonRocAbility { type: 'summon-extra-one-shot'; summonEntity: 'roc'; effect: { multiplier: 2; type: 'physical'; target: 'party' }; entityRemains: false }` data-model canon NEW. Pattern **temporary one-shot summon mechanic canon NEW** (vs Drake Bandit Bursting Ball + Wire persistent summons). Pattern thematic "chick summons adult Roc bird for parental attack". Roc dual existence canon ? (regular mob + summoned variant). À implémenter ability Damia. Source: [`features/mobs/_sources/lod-wiki-erupting-chick.md`](features/mobs/_sources/lod-wiki-erupting-chick.md).

- [ ] ⭐⭐⭐ **🆕 Run away! ability canon NEW MAJEUR Erupting Chick wiki ⭐⭐⭐** — Mob self-escape removes target from combat. ⚠️ **No reward canon NEW** : "Does NOT award EXP, gold, or item". Pattern Damia : `RunAwayAbility { type: 'self-escape'; effect: 'remove-from-battle'; rewardsGranted: false }` data-model canon NEW. Pattern Mob desperation escape mechanic canon NEW (vs typical mob fight-to-death). **Strategy CRITIQUE** : burst-kill avant Run away! trigger ≤ 25% HP pour rewards. Erupting Chick = premier Mob avec self-escape mechanic ingestion canon Damia. À implémenter ability Damia. Source: idem.

- [ ] ⭐⭐ **🆕 Erupting Chick Mob canon Disc 2 Valley of Corrupted Gravity ⭐⭐** — Wind element Minor Enemy. Stats US HP 120 / AT 20 / DF 80 / MAT 22 / MDF 30 / SPD 80 / **A-AV 20%** + Gold 15 + EXP 32. Pattern "fast fragile dodge canon" (SPD 80 + A-AV 20% high + HP 120 low + MDF 30 very low). Status 4/4 standard. Counter 28 high-density. AI 3-phase NEW (~Kick / Summon Roc / Run away!). Mind Purifier 8% drop. À documenter `mobs/Erupting Chick.md` (créé). Source: idem.

- [ ] ⭐⭐ **🆕 A-AV 20% NEW canon Mob Erupting Chick ⭐⭐** — High A-AV tier Mob canon (status proc reduction pattern récurrent canon Damia). Pattern Damia : Erupting Chick = first Mob with explicit high A-AV % tier ingestion. À cross-référer pattern A-AV reduces status proc canon universel. Source: idem.

- [ ] ⭐⭐ **🆕 Killer Bird + Spider Urchin NEW partner mobs canon Valley of Corrupted Gravity ⭐⭐** — Mixed formations canon : Killer Bird x2 + Erupting Chick (formation 95 submaps 252/253/255 35%/35%/20%) + Erupting Chick x2 + Spider Urchin (formation 97 submaps 253-257). Pattern Damia : 3 formation types Erupting Chick (solo + 2 mixed). À documenter `mobs/Killer Bird.md` + `mobs/Spider Urchin.md` (à créer) — NEW partner mobs canon Valley. Source: idem.

- [ ] ⭐⭐ **🆕 AI 3-phase Mob HP overlap zones canon Erupting Chick ⭐⭐** — Phase 1 (HP > 25%) ~Kick / Phase 2 (HP ≤ 50%) Summon Roc / Phase 3 (HP ≤ 25%) Run away!. HP overlap zones canon : 25-50% overlap (~Kick + Summon Roc) + ≤25% all three abilities possible. Pattern Damia : MobAI 3-phase overlap selection canon. Source: idem.

- [ ] ⭐⭐ **🆕 Yield contingency canon Run away! Erupting Chick ⭐⭐** — Si Erupting Chick uses Run away! (≤ 25% HP), **NO EXP / NO gold / NO item awarded** canon. Pattern Damia : Mob yield contingency canon NEW (yield contingent on kill before Run away!). Source: idem.

- [ ] ⭐ **🆕 Mind Purifier 8% drop canon Erupting Chick** — Existing item canon (probable Confusion cure). 8% drop rate canon. Source: idem.

- [ ] ⭐ **🆕 Counter 28 high-density tier confirmé Erupting Chick** — Cohérent existing canon. Source: idem.

- [ ] ⭐ **🆕 Status 4/4 standard Minor Enemy canon Erupting Chick** — Cohérent existing pattern. Source: idem.

- [ ] **🆕 JP stats Erupting Chick à confirmer fandom future ⚠️** — Wiki US only ingéré. Pattern Damia adopt JP when available (+25% HP / Gold ÷3). ✅ **RÉSOLU fandom** : JP HP **150** ✓ +25% CONFIRMED / JP Gold **5** ✓ ÷3 CONFIRMED. Source: à ingérer.

### Mobs / Erupting Chick fandom complement — JP HP 150/5 CONFIRMED + Baby Roc lineage canon CONFIRMED MAJEUR + Appearance pink featherless chick in nest + Tiny Kick + Rave Twister NEW ability + "Cannot Stun" baby vs adult NEW + Mind Purifier 20G shop NEW + AI wiki vs fandom DIVERGENCE MAJEUR

- [ ] ⭐⭐⭐ **🆕 Baby Roc lineage canon CONFIRMED MAJEUR Erupting Chick (fandom) ⭐⭐⭐** — "Baby form of the Roc" canon fandom ✓ CONFIRMS Roc dual existence canon Damia ! Pattern Damia : **baby/adult lineage canon Mob NEW** (Erupting Chick baby + Roc adult Valley of Corrupted Gravity). Pattern canon récurrent à investiguer cross-mob (autres baby/adult lineages ?). À documenter `mobs/Roc.md` (à créer) — adult Roc canon Wind Valley of Corrupted Gravity + lineage Erupting Chick baby. Source: [`features/mobs/_sources/fandom-erupting-chick.md`](features/mobs/_sources/fandom-erupting-chick.md).

- [ ] ⭐⭐⭐ **🆕 Appearance canon DETAILED MAJEUR Erupting Chick (fandom) ⭐⭐⭐** — Young chick in nest + **baby form of Roc** + **no feathers + whole body pink** + can move/jump/kick **with nest remaining under/around it** (nest immobile baby canon). Pattern Damia sprite design canon : pink featherless chick + nest base + small mobile creature. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Tiny Kick canon name officiel MAJEUR Erupting Chick (fandom) ⭐⭐⭐** — Wiki ~Kick = community approximation, fandom révèle **Tiny Kick** name officiel. Effect canon : "Runs towards single opponent + jump kick + low physical damage" (cohérent thematic baby chick small kick). Pattern thematic "tiny" prefix = cohérent baby form. À implémenter ability `tinyKick` Damia. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Rave Twister NEW ability canon MAJEUR Erupting Chick (fandom) ⭐⭐⭐** — Wind element spell + Party + **medium-high magic damage** (shared ability with adult Roc canon NEW). ⚠️ **NOT in wiki AI table** — canon discrepancy MAJEUR. Pattern Damia : `RaveTwisterAbility { type: 'magic-party-aoe'; multiplier: '?'; element: 'wind' }` data-model canon NEW (multiplier à confirmer). Pattern Damia : shared ability baby/adult Roc lineage canon NEW. À implémenter ability `raveTwister` Damia. À investiguer wiki incomplete AI table. Source: idem.

- [ ] ⭐⭐⭐ **🆕 "Cannot Stun" baby vs adult canon NEW MAJEUR Erupting Chick (fandom) ⭐⭐⭐** — "Cannot Stun an opponent" canon NEW : Erupting Chick baby lacks adult Roc Stun ability. Pattern Damia : **baby vs adult ability differences canon NEW** (Erupting Chick = baby Roc, lacks adult abilities). À cross-référer adult Roc canon (Stun ability + other adult-only abilities). Pattern thematic baby/adult lineage canon. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Mind Purifier 20 Gold shop canon NEW MAJEUR Erupting Chick (fandom) ⭐⭐⭐** — "You can simply buy them in most places for **20G**" — Mind Purifier purchasable consumable canon NEW. Pattern Damia : standard buyable consumable canon NEW (cohérent existing Angel's Prayer 30G shop pattern — **2ème consumable purchasable confirmed**). Pattern Damia consumable items shop economy canon NEW : **tiers de prix canon** (Mind Purifier 20G + Angel's Prayer 30G). Drop farming inefficient when shop available. À cross-référer `items/Mind Purifier.md` (à créer/vérifier). Source: idem.

- [ ] ⭐⭐⭐ **🆕 AI wiki vs fandom DIVERGENCE MAJEUR Erupting Chick (fandom) ⭐⭐⭐** — Wiki AI : ~Kick / Summon Roc / Run away! vs Fandom AI : Tiny Kick / Rave Twister / Summon Roc. ⚠️ Run away! NOT in fandom + Rave Twister NOT in wiki. Pattern Damia : adopter **union des 2 sources canon** = **AI 4-ability pool** (Tiny Kick + Summon Roc + Rave Twister + Run away!). Pattern Damia : flag wiki AI table incomplete (Rave Twister missing) + flag fandom AI incomplete (Run away! missing). À investiguer Discord pour AI table complete future. Source: idem.

- [ ] ⭐⭐⭐ **🆕 JP HP 150 ✓ +25% systematic CONFIRMED Erupting Chick (fandom) ⭐⭐⭐** — US 120 × 1.25 = 150 ✓ matches JP exact. Pattern Damia +25% HP US→JP systematic canon récurrent CONFIRMED 9 entities maintenant. Source: idem.

- [ ] ⭐⭐⭐ **🆕 JP Gold 5 ✓ ÷3 systematic CONFIRMED Erupting Chick (fandom) ⭐⭐⭐** — US 15 ÷ 3 = 5 ✓ matches JP exact. Pattern Damia ÷3 Gold Mob systematic confirmed cross-mob. Source: idem.

- [ ] ⭐⭐ **🆕 Summon Roc CROSS-SOURCE CONFIRMED + tweeting lore canon (fandom) ⭐⭐** — Effect canon fandom : "Summons by **tweeting** fully aged Roc to **swoop down + smash all allies + medium damage**". Pattern thematic : chick **tweet** call = summon parental Roc canon. Roc Boss Extra-like temporary one-shot summon canon ✓ confirmed cross-source. Source: idem.

- [ ] ⭐⭐ **🆕 AT 26 + MAT 26 fandom CORRECTION wiki Erupting Chick (fandom) ⭐⭐** — Wiki AT 20 vs Fandom 26 (+30%) / Wiki MAT 22 vs Fandom 26 (+18%). Pattern Damia adopt fandom higher (JP closer probable cohérent pattern systematic). Source: idem.

- [ ] ⭐⭐ **🆕 "One of the lowest MDF in the game" canon Erupting Chick (fandom) ⭐⭐** — MDF 30 confirmé fandom comme "one of the lowest" canon. Pattern Damia : MDF tier rankings canon (Erupting Chick = very low MDF tier reference). Source: idem.

- [ ] ⭐⭐ **🆕 "Capable of killing in a hit or two" fragility canon Erupting Chick (fandom) ⭐⭐** — Pattern Damia : fragile mob canon (HP 120 low + MDF 30 very low). Strategy canon : kill rapidly to bypass Summon Roc + Run away! thresholds. Source: idem.

- [ ] ⭐ **🆕 Encounter rate "Very common" Erupting Chick canon (fandom) ⭐** — Pattern Damia encounter rate descriptive terminology canon. Source: idem.

### Mobs / Evil Spider wiki (Earth Limestone Cave Disc 1 — Recolor parent of Deadly Spider canon MAJEUR + Cobweb shared ability canon + Appearance WIKI DIRECT NEW + Escape 70% HIGH tier + Counter 16 Mid-low 4ème instance + Angel's Prayer 2ème farming source)

- [ ] ⭐⭐⭐ **🆕 Recolor family canon CONFIRMED Trivia wiki Evil Spider MAJEUR ⭐⭐⭐** — Wiki Trivia : "Evil Spider model = recolor of Deadly Spider located in Mountain of Mortal Dragon" canon. Pattern Damia : **Evil Spider parent ancestor + Deadly Spider recolor child** (cohérent chronologie Disc 1 → Disc 3 game progression). Cohérent existing recolor family canon Damia : Crescent Bee / Stinger + Death / Death Purger + Evil Spider / Deadly Spider (3 instances confirmed). Cobweb shared ability across recolor family canon. À cross-référer existing `mobs/Deadly Spider.md` canon — corriger pattern parent/child si nécessaire. Source: [`features/mobs/_sources/lod-wiki-evil-spider.md`](features/mobs/_sources/lod-wiki-evil-spider.md).

- [ ] ⭐⭐⭐ **🆕 Cobweb canon name officiel cohérent existing Deadly Spider Evil Spider (wiki) ⭐⭐⭐** — 1× Non-Elemental magic Single (NO ~ marker — canonical wiki). Shared ability across recolor family canon (Evil Spider parent + Deadly Spider child). Pattern thematic "spider web sticky magic attack". Pattern Damia : `CobwebAbility { type: 'magic-single'; multiplier: 1; element: 'non-elemental' }` data-model canon shared cross-recolor. À cross-référer existing Deadly Spider Cobweb canon. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Appearance canon WIKI DIRECT NEW MAJEUR Evil Spider (wiki) ⭐⭐⭐** — Rare wiki tier 2 providing appearance directly : Brown + yellow arachnid + **sharp prongs jutting from end of legs** + **4 pedipalps for biting** (vs real-world spiders 2 pedipalps — **biological divergence canon NEW**). Pattern Damia sprite design canon : brown + yellow + sharp leg prongs + 4 pedipalps biting equipment. Pattern Damia : wiki appearance exception canon (usually fandom domain). Source: idem.

- [ ] ⭐⭐ **🆕 Evil Spider Mob canon Disc 1 Limestone Cave (wiki) ⭐⭐** — Earth Minor Enemy. Stats US HP 30 / AT 8 / DF 80 / MAT 6 / MDF 60 / SPD 60 + Gold 12 + EXP 12. Pattern "fragile early Disc 1 mob" (1-shot probable). Status 4/4 standard. Counter 16 Mid-low tier. AI 2-phase ~Bite/Cobweb. Angel's Prayer 8% drop. À documenter `mobs/Evil Spider.md` (créé). Source: idem.

- [ ] ⭐⭐ **🆕 Escape rate 70% NEW HIGH tier canon Evil Spider (wiki) ⭐⭐** — Pattern Damia : NEW HIGH escape tier canon (vs typical 30-40% pattern). Pattern Disc 1 early-game easy escape canon. Pattern Damia : escape rate variable per-mob canon (low / moderate / high tiers). À cross-référer cross-mob future. Source: idem.

- [ ] ⭐⭐ **🆕 Counter 16 Mid-low tier confirmé 4ème instance Evil Spider (wiki) ⭐⭐** — Evil Spider = 4ème Minor Enemy Mid-low tier ingestion canon Damia (cohérent Lucky Jar + Cursed Jar + Treasure Jar Unique Jars trio + Cactus Minor existing canon). Counter Opportunities tier mapping canon updated. Source: idem.

- [ ] ⭐⭐ **🆕 Limestone Cave 4 submaps location canon Evil Spider (wiki) ⭐⭐** — Cohérent existing Limestone Cave canon (Crocodile + Orc + Screaming Bat + Slime + Ugly Balloon + Urobolus partner mobs). 4 submaps spawn 45/48/49/51 (primary 45 35%). Source: idem.

- [ ] ⭐⭐ **🆕 Angel's Prayer 8% drop 2ème farming source canon Evil Spider (wiki) ⭐⭐** — Evil Spider = 2ème source Angel's Prayer farming canon Damia (cohérent existing Dragonfly Valley Disc 2 source). Pattern Damia : Angel's Prayer multi-source farming canon (Dragonfly Disc 2 + Evil Spider Disc 1). ⚠️ Pattern fandom Dragonfly canon : Angel's Prayer 30G shop purchasable — drop farming inefficient vs shop alternative. Source: idem.

- [ ] ⭐ **🆕 Cobweb shared cross-recolor pattern canon Evil Spider/Deadly Spider** — Cobweb ability shared across recolor family canon. Pattern Damia : recolor family shared abilities canon (cohérent existing Crescent Bee/Stinger Spinning Gale + Death/Death Purger Total Vanishing patterns). Source: idem.

- [ ] **🆕 JP stats Evil Spider à confirmer fandom future ⚠️** — Wiki US only ingéré (HP 30 / Gold 12). Pattern Damia adopt JP when available (+25% HP / Gold ÷3). ✅ **RÉSOLU fandom** : JP HP **50** ⚠️ ANOMALY (+67% NOT +25%) / JP Gold **4** ✓ ÷3 CONFIRMED. Source: à ingérer.

### Mobs / Evil Spider fandom complement — JP HP 50 ANOMALY MAJEUR pattern break + JP Gold 4 ÷3 CONFIRMED + Gnaw canon name cross-recolor + Cobweb cross-source confirmed + Recolor "cousin" canon CONFIRMED + Appearance divergences + "Most powerful Limestone" canon

- [ ] ⭐⭐⭐ **🆕 JP HP 50 ANOMALY MAJEUR FIRST PATTERN BREAK +25% systematic Damia (fandom) ⭐⭐⭐** — US 30 → JP 50 = **×1.67 (+67%)** — NOT +25% systematic. **FIRST pattern break canon Damia** (9 previous mobs +25% confirmed : Crystal Golem / Deadly Spider / Death / Death Purger / Dragon Soldier / Dragonfly / Drake the Bandit / Earth Shaker / Erupting Chick). Hypothesis canon possible : (1) **Minimum HP floor JP very low HP mobs** (< ~40 → bumped to 50 floor) ; (2) **Scaling spécial Disc 1 fragile mobs** (+67% tier early-game) ; (3) **Data error fandom** (typo 50 = 37 actual). Pattern Damia : adopt JP 50 priority + flag pattern break MAJEUR + investiguer cross-mob low HP early-game. À investiguer Discord clarification JP scaling low HP mobs. Source: [`features/mobs/_sources/fandom-evil-spider.md`](features/mobs/_sources/fandom-evil-spider.md).

- [ ] ⭐⭐⭐ **🆕 Gnaw canon name officiel MAJEUR cross-recolor confirmation Evil Spider (fandom) ⭐⭐⭐** — Wiki ~Bite = community approximation, fandom révèle **Gnaw** name officiel ("Rushes up to target and bites them"). ⭐⭐ **CROSS-RECOLOR canon family CONFIRMATION** : Gnaw shared with Deadly Spider existing canon ✓. Pattern Damia : Gnaw = canon name shared cross-recolor family (Evil Spider + Deadly Spider both). À implémenter ability `gnaw` Damia shared cross-recolor. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Cobweb CROSS-SOURCE CONFIRMED + RÉSOUDS Deadly Spider divergence Evil Spider (fandom) ⭐⭐⭐** — "Deals magic damage by spinning a web at target" canon fandom ✓. ⚠️ Cohérent existing Deadly Spider Cobweb canon + ⭐⭐⭐ **Evil Spider fandom confirms Magic type** ✓ — **RÉSOUDS existing Deadly Spider canon wiki Physical / fandom Magic DIVERGENCE** : Cobweb = Non-Elemental magic canon (Evil Spider canonical resolves cross-recolor). Pattern Damia : `CobwebAbility { type: 'magic-single'; multiplier: 1; element: 'non-elemental' }` data-model canon shared cross-recolor confirmed. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Recolor family "cousin" canon CROSS-SOURCE CONFIRMED Evil Spider (fandom) ⭐⭐⭐** — "There is a cousin enemy found on disc 3 known as the Deadly Spider" canon fandom ✓ CONFIRMS wiki Trivia recolor canon. ⭐ "Cousin" terminology canon fandom = pattern Damia recolor family relationship canon. Cohérent existing recolor family canon Damia (3 instances : Crescent Bee/Stinger + Death/Death Purger + Evil Spider/Deadly Spider). Source: idem.

- [ ] ⭐⭐⭐ **🆕 Appearance DIVERGENCE wiki vs fandom canon Evil Spider (fandom) ⚠️⭐⭐** — Wiki : brown + yellow + sharp leg prongs + 4 pedipalps. Fandom : brown + tan + 4 red eyes + 2 fangs. Pattern Damia : adopter **union wiki + fandom** (brown + yellow/tan + 4 red eyes NEW fandom + sharp leg prongs wiki + 4 pedipalps wiki precise vs 2 fangs fandom). Pattern Damia : flag appearance source divergence canon. Source: idem.

- [ ] ⭐⭐⭐ **🆕 JP Gold 4 ✓ ÷3 systematic CONFIRMED Evil Spider (fandom) ⭐⭐⭐** — US 12 ÷ 3 = 4 ✓ matches JP exact. Pattern Damia ÷3 Gold Mob systematic confirmed cross-mob (Gold scaling normal — only HP anomaly). Source: idem.

- [ ] ⭐⭐ **🆕 "Most powerful enemy Limestone Cave" canon Evil Spider (fandom) ⭐⭐** — Top-tier Mob Limestone (excl. Urobolus boss) canon fandom. "Highest Attack + 2nd highest HP in the Cave" canon stats reference. Solo formation only canon (balance design "would pose more threat in groups"). À cross-référer `locations/Limestone Cave.md` Mob hierarchy canon. Source: idem.

- [ ] ⭐⭐ **🆕 AT 9 + MAT 7 fandom higher Evil Spider (fandom) ⭐⭐** — Wiki AT 8 vs Fandom 9 (+12% small) / Wiki MAT 6 vs Fandom 7 (+17% small). Pattern Damia adopt fandom slightly higher (JP closer probable). Source: idem.

- [ ] ⭐ **🆕 "Appears solo" canon Evil Spider (fandom) confirms wiki solo formation** — Cohérent wiki solo formation (24) only. Pattern Damia : Evil Spider solo-only formation canon (balance design). Source: idem.

### Mobs / Fairy wiki (Light Kadessa Disc 3 — Trans Light cross-mob CONFIRMED Light Family + Dancing Ray NEW + HP recovers 4ème instance + Sun Rhapsody Light Spell Item + Puck partner + Dual A-AV/M-AV NEW)

- [ ] ⭐⭐⭐ **🆕 Trans Light cross-mob canon CONFIRMED MAJEUR Light Family shared canon (wiki) ⭐⭐⭐** — Cohérent existing Crystal Golem Trans Light canon ✓ (Light element shared ability cross-mob canon). 1.5× Light magic Single. Pattern Damia : **Trans Light = Light Family shared ability canon NEW** (Crystal Golem Disc 1 + Fairy Disc 3 both). Pattern thematic "Light energy transmission attack" canon. Pattern Damia : `TransLightAbility { type: 'magic-single'; multiplier: 1.5; element: 'light' }` data-model shared Light Family. Source: [`features/mobs/_sources/lod-wiki-fairy.md`](features/mobs/_sources/lod-wiki-fairy.md).

- [ ] ⭐⭐⭐ **🆕 Dancing Ray NEW ability canon MAJEUR Fairy (wiki) ⭐⭐⭐** — 1× Light-elemental magic Party AoE (canon name officiel NO ~ marker — canonical wiki). Pattern thematic "dancing light rays Party AoE attack" canon. Pattern Damia : `DancingRayAbility { type: 'magic-party-aoe'; multiplier: 1; element: 'light' }` data-model canon NEW. À implémenter ability `dancingRay` Damia. Pattern Light Party AoE canon NEW (parallel Dragonfly Thunderbolt Wind/Thunder Party AoE). Source: idem.

- [ ] ⭐⭐⭐ **🆕 HP recovers 30% formula CONFIRMS 4ème cross-mob/boss instance Fairy MAJEUR (wiki) ⭐⭐⭐** — 30% Max HP = 96 HP (Fairy US 320 × 30% = 96 ✓). Pattern Damia : `HpRecoversAbility { type: 'self-heal'; healPercent: 0.3 }` data-model canon shared cross-mob/boss CONFIRMED **4 instances** maintenant : Crystal Golem (48/60) + Dragon Soldier (146) + Drake the Bandit (360 single-use) + Fairy (96). Source: idem.

- [ ] ⭐⭐ **🆕 Fairy Mob canon Disc 3 Kadessa ⭐⭐** — Light Minor Enemy. Stats US HP 320 / AT 43 / DF 80 / MAT 57 / MDF 150 / SPD 70 / **dual A-AV/M-AV 10%** + Gold 24 + EXP 81. Pattern "balanced magical caster" (MDF 150 high anti-magic + DF 80 moderate + MAT 57 caster). Status 4/4 standard. Counter 28 high-density. AI 4-ability ~Staff Smack/Trans Light/Dancing Ray/HP recovers. Sun Rhapsody 8% drop. À documenter `mobs/Fairy.md` (créé). Source: idem.

- [ ] ⭐⭐ **🆕 Sun Rhapsody 8% drop canon Light Spell Item source Fairy (wiki) ⭐⭐** — Sun Rhapsody item canon (Light Spell Item probable thematic). Fairy = Sun Rhapsody source canon Damia. À cross-référer `items/Sun Rhapsody.md` (à créer/vérifier) — Light Spell Item canon. Source: idem.

- [ ] ⭐⭐ **🆕 Puck partner mob canon Kadessa Fairy formation 149 (wiki) ⭐⭐** — Cohérent existing Kadessa partner mobs canon (Puck appears in mixed formation 149 avec Fairy x2). À documenter `mobs/Puck.md` (à créer) — Kadessa partner mob canon. Source: idem.

- [ ] ⭐⭐ **🆕 Dual A-AV/M-AV 10% tier NEW canon Mob Fairy (wiki) ⭐⭐** — Moderate dodge dual canon (vs single A-AV typical pattern). Pattern Damia : **dual-AV canon NEW** (Fairy = premier ingestion dual-AV Mob). À investiguer cross-mob : autres mobs avec dual A-AV/M-AV ? Source: idem.

- [ ] ⭐⭐ **🆕 AI 4-ability Mob HP phase canon Fairy (wiki) ⭐⭐** — Phase 1 (HP > 50%) ~Staff Smack / Phase 2 (HP ≤ 50%, > 25%) Trans Light / Phase 3 (HP ≤ 25%) Dancing Ray + HP recovers (equal chance). Pattern Damia : 4-ability mob with sub-phase 25-50% canon NEW. Source: idem.

- [ ] ⭐ **🆕 Light Minor Enemy 3ème ingestion canon Damia Fairy ⭐** — Pattern Light Minor Enemy rare canon (Crystal Golem Disc 1 + Fairy Disc 3). Light mobs limited canon. Source: idem.

- [ ] ⭐ **🆕 Kadessa 10 submaps Fairy spawn canon (wiki) ⭐** — Submaps 394-405 range (solo 394/399/404 10% + mixed 395/396/397/400/401/402/405 20-35%). Cohérent existing Kadessa canon (Grand Jewel + Spinninghead + Toad Stool + Gnome + Puck + S Virage partners). Source: idem.

- [ ] **🆕 JP stats Fairy à confirmer fandom future ⚠️** — Wiki US only ingéré. Pattern Damia adopt JP when available (+25% HP / Gold ÷3). Source: à ingérer.

### Mobs / Fire Spirit wiki (Fire Volcano Villude Disc 1 — 2 variants NEW MAJEUR + Status all 8 ✔ 3ème instance + Fire Immunity passive NEW MAJEUR + HP recovers 5ème instance + floor rounding NEW + Spirit Cloak NEW item + Dual A-AV/M-AV 2ème instance + Counter 19 Mid 2ème instance)

- [ ] ⭐⭐⭐ **🆕 2 variants Fire Spirit (I) / (II) canon NEW MAJEUR (wiki) ⭐⭐⭐** — Visually indistinguishable + identical otherwise except AT 8/9 + Spirit Cloak drop 10%/2%. ⭐ **Variant-conditional spawn canon NEW** : Fire Spirit (II) only appears in duo formation 47. Pattern Damia : variant-based spawn system canon NEW (Fire Spirit I solo+duo / II only duo). À implémenter Damia variant mob spawn system canon NEW. À investiguer cross-mob : autres variant-conditional mobs ? Source: [`features/mobs/_sources/lod-wiki-fire-spirit.md`](features/mobs/_sources/lod-wiki-fire-spirit.md).

- [ ] ⭐⭐⭐ **🆕 Passive Fire Immunity Mob canon NEW MAJEUR (wiki) ⭐⭐⭐** — Fire-elemental magic damage reduced to 0 canon NEW. Pattern Damia : Mob passive canon récurrent (cohérent existing Instant Death Immunity Commander Marshland + Crystal Golem). Pattern thematic "Fire Spirit immune to own element". Pattern Damia : `FireImmunityPassive { effect: 'elemental-magic-damage-zero'; element: 'fire' }` data-model canon NEW. À implémenter passive `fireImmunity` Damia. À cross-référer : autres elemental-immunity passives canon (Water/Earth/Thunder/Light/Darkness/Wind/Non-Elemental) ? Source: idem.

- [ ] ⭐⭐⭐ **🆕 HP recovers 30% formula 5ème instance + floor() rounding canon NEW MAJEUR (wiki) ⭐⭐⭐** — 30% Max HP = 7 HP (Fire Spirit US 26 × 30% = 7.8 → **floor 7 ✓** ⚠️ NEW floor behavior reveal). Pattern Damia : Crystal Golem 48/60 + Dragon Soldier 146 + Drake 360 + Fairy 96 + Fire Spirit **7 (floor canon NEW)**. Pattern Damia : `HpRecoversAbility { healPercent: 0.3; rounding: 'floor' }` data-model canon NEW floor rounding REVEAL. À cross-référer cross-mob : floor rounding pattern cross-mob ? Source: idem.

- [ ] ⭐⭐⭐ **🆕 Status all 8 ✔ Minor Boss-tier 3ème instance canon récurrent (wiki) ⭐⭐⭐** — Fire Spirit = 3ème Minor Enemy all 8 ✔ ingestion canon Damia (cohérent existing Bowling + Crystal Golem). Pattern Damia : Minor Enemy all 8 ✔ canon récurrent tier. Source: idem.

- [ ] ⭐⭐ **🆕 Fire Spirit Mob canon Disc 1 Volcano Villude ⭐⭐** — Fire Minor Enemy. Stats US HP 26 / AT 8(I)/9(II) / DF 100 / MAT 13 / MDF 160 / SPD 60 / **dual A-AV/M-AV 20%** + Gold 12 + EXP 13. Pattern "fragile dual-AV tank anti-magic" (HP 26 very low + DF 100 + MDF 160 very high + dual A-AV/M-AV 20%). 3 encounter formations (solo 43 + duo 47 + mixed Salamander 48). Escape 50%. À documenter `mobs/Fire Spirit.md` (créé). Source: idem.

- [ ] ⭐⭐ **🆕 Spirit Cloak NEW item canon (wiki) ⭐⭐** — Drop Fire Spirit 10% (I) / 2% (II) variant-based. Probable Fire equipment thematic. Pattern Damia : drop rate variant per-Mob-variant canon NEW (10% Fire Spirit I + 2% Fire Spirit II). À documenter `items/Spirit Cloak.md` (à créer/vérifier) — Fire equipment canon NEW. Source: idem.

- [ ] ⭐⭐ **🆕 Dual A-AV/M-AV 20% canon 2ème instance Fire Spirit (wiki) ⭐⭐** — Cohérent existing Fairy 10% dual-AV pattern. Fire Spirit = 2ème instance dual-AV Mob canon Damia (vs Fairy 10%). Pattern Damia : dual-AV variable tier canon. Source: idem.

- [ ] ⭐⭐ **🆕 Counter 19 Mid density tier 2ème instance Fire Spirit (wiki) ⭐⭐** — Cohérent existing Assassin Cock canon. Fire Spirit = 2ème Minor Enemy Mid density tier ingestion canon Damia. Source: idem.

- [ ] ⭐⭐ **🆕 Volcano Villude 6 submaps location canon Fire Spirit (wiki) ⭐⭐** — 6 submaps spawn (115-123 range). Cohérent existing canon database mentions. À documenter `locations/Volcano Villude.md` (à créer/vérifier) — Disc 1 location canon. Source: idem.

- [ ] ⭐⭐ **🆕 Salamander partner mob canon NEW Volcano Villude (wiki) ⭐⭐** — Fire Spirit (I) + Salamander mixed formation 48 canon. À documenter `mobs/Salamander.md` (à créer) — Volcano Villude partner mob canon NEW. Source: idem.

- [ ] ⭐ **🆕 ~Twin Slap canon name (community) Fire Spirit (wiki) ⭐** — Community approximation > 25% baseline ability. 1× physical. Source: idem.

- [ ] ⭐ **🆕 Escape rate 50% Volcano Villude canon Fire Spirit (wiki) ⭐** — Moderate-high Disc 1 pattern. Source: idem.

- [ ] **🆕 JP stats Fire Spirit à confirmer fandom future ⚠️** — Wiki US only ingéré. Pattern Damia adopt JP when available (+25% HP / Gold ÷3). ✅ **RÉSOLU fandom** : JP HP **33** ✓ +25% CONFIRMED (round 32.5 → 33) / JP Gold **4** ✓ ÷3 CONFIRMED. Source: à ingérer.

### Mobs / Fire Spirit fandom complement — JP HP 33/4 CONFIRMED + Sneak Attack canon name + Recover canon name + JP 9 HP floor REVEAL + Specter cousin 4ème recolor family NEW MAJEUR + MDF tier ranking per-element NEW + Appearance flame + Counter divergence ⚠️

- [ ] ⭐⭐⭐ **🆕 Specter recolor cousin canon NEW MAJEUR Fire Spirit (fandom) ⭐⭐⭐** — "Cousin in appearance of Specter found in Magical City Aglis" canon fandom. ⭐⭐⭐ **4ème recolor family canon Damia** : Crescent Bee/Stinger + Death/Death Purger + Evil Spider/Deadly Spider + **Fire Spirit/Specter**. Pattern Damia : Fire Spirit Disc 1 (parent ancestor probable) + Specter Disc 4 (cousin variant chronologie game). ⚠️ DIVERGENCE location Specter : database wiki Enemies "Specter Darkness Mayfil" vs fandom "Magical City Aglis" — à clarifier. À cross-référer existing Specter canon. Source: [`features/mobs/_sources/fandom-fire-spirit.md`](features/mobs/_sources/fandom-fire-spirit.md).

- [ ] ⭐⭐⭐ **🆕 MDF tier ranking per-element canon NEW MAJEUR Fire Spirit (fandom) ⭐⭐⭐** — "Fire Spirit tied with Hell Hound for **2nd highest MDF on Fire Element monster**" canon fandom. Implies **#1 Fire MDF mob existe** (à identifier cross-mob). Pattern Damia : **MDF ranking per-element canon NEW** (Fire/Water/Earth/Thunder/Wind/Light/Darkness/Non-Elemental). À investiguer cross-mob Fire : Magma Fish / Red Hot / Salamander / Sandora Soldier Fire MDF comparison pour identifier #1 Fire MDF. À documenter `combat/elements.md` MDF tier ranking per-element canon NEW. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Sneak Attack canon name officiel MAJEUR Fire Spirit (fandom) ⭐⭐⭐** — Wiki ~Twin Slap = community approximation, fandom révèle **Sneak Attack** name officiel. Effect canon : "Flies up to target + whips target with its tail" (cohérent appearance flame creature tail-like attack). Pattern thematic "sneak attack flame whip" canon. Pattern Damia : adopter **Sneak Attack** canon name officiel + flag community ~Twin Slap alias deprecated. ⚠️ Pattern interpretation divergence : fandom "whips with tail" vs wiki "twin slap" (2-hit) — à clarifier. À implémenter ability `sneakAttack` Damia. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Recover canon name + JP 9 HP floor REVEAL CONFIRMS cross-version floor() rounding canon (fandom) ⭐⭐⭐** — **Recover** = canon name officiel fandom (wiki HP recovers community-ish). Effect canon : "Heals 30% HP : 7 (US) or 9 (JAP)" ⭐⭐⭐ JP REVEAL. **US 26 × 30% = 7.8 → 7 floor ✓** + **JP 33 × 30% = 9.9 → 9 floor ✓** — Pattern Damia : **floor() rounding canon CONFIRMED cross-version** ⭐⭐⭐. Pattern Damia : `RecoverAbility { healPercent: 0.3; rounding: 'floor' }` data-model canon confirmed cross-version. Source: idem.

- [ ] ⭐⭐⭐ **🆕 JP HP 33 ✓ +25% systematic CONFIRMED Fire Spirit + round canon (fandom) ⭐⭐⭐** — US 26 × 1.25 = 32.5 → **JP 33 round** ✓. Pattern Damia : +25% HP US→JP systematic canon récurrent CONFIRMED 11 entities maintenant. ⚠️ Pattern rounding : **round** canon (vs Evil Spider 30 → 50 anomaly floor pattern) — pattern JP rounding variable canon (round vs floor) à investiguer cross-mob. Source: idem.

- [ ] ⭐⭐⭐ **🆕 JP Gold 4 ✓ ÷3 systematic CONFIRMED Fire Spirit (fandom) ⭐⭐⭐** — US 12 ÷ 3 = 4 ✓ matches JP exact. Pattern Damia ÷3 Gold Mob systematic confirmed cross-mob. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Counter DIVERGENCE wiki Yes/19 vs fandom "No" MAJEUR Fire Spirit (fandom) ⚠️⚠️** — Wiki : "Counters Additions? Yes" + Counter Opportunities (19). Fandom : "Can Counterattack: No". Pattern Damia : adopt **wiki Counter 19 precise** + flag fandom claim. À investiguer Discord pour clarification mechanic Counter Opportunities vs general counterattack. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Appearance canon DETAILED Fire Spirit (fandom) ⭐⭐⭐** — Flame larger on upper torso than bottom + 2 short arms also made of flame. Pattern thematic : floating flame creature humanoid upper-body + flame arms canon. Pattern Damia sprite design canon. Source: idem.

- [ ] ⭐⭐ **🆕 AT 11 + MAT 15 fandom CORRECTION wiki Fire Spirit (fandom) ⭐⭐** — Wiki AT 8(I)/9(II) variants vs Fandom AT 11 single value (+22-37%). Wiki MAT 13 vs Fandom 15 (+15%). Pattern Damia adopt wiki precise variant data + flag fandom higher. À investiguer : fandom 11 = autre variant ? autre source ? Source: idem.

- [ ] ⭐⭐ **🆕 Status all 8 ✔ + A-AV 20% cross-source CONFIRMED Fire Spirit (fandom) ⭐⭐** — "Immune to all Status Ailments" + "20% A-AV" canon fandom ✓ cohérent wiki. Pattern Damia cross-source validation. Source: idem.

### Mobs / Flabby Troll wiki (Earth Undersea Cavern Disc 2 — M-AV reduces status proc canon NEW MAJEUR + ~Shield Thwacking 100% Fear proc NEW + Knight Shield cross-mob 2ème source CONFIRMED + Counter 0 + Mermaid partner)

- [ ] ⭐⭐⭐ **🆕 M-AV reduces status proc canon NEW MAJEUR Flabby Troll (wiki) ⭐⭐⭐** — Premier ingestion **M-AV reduces ability canon Damia** (parallel pattern A-AV reduces canon récurrent Caterpillar/Crystal Golem/Earth Shaker). Pattern Damia : **M-AV reduces magic-based status proc** (vs A-AV reduces physical-based status proc) — pattern symmetric canon NEW (element-based reduction canon NEW). M-AV reduces Fear (magic-based Shield Thwacking) vs A-AV reduces Stun (physical-based Crystal Golem Clap). Pattern Damia : `MAVReducesStatusProc` mechanic canon NEW (parallel `AAVReducesStatusProc`). À documenter `combat/avoidance.md` (à créer) — A-AV/M-AV reduces status canon symmetric pattern NEW. Source: [`features/mobs/_sources/lod-wiki-flabby-troll.md`](features/mobs/_sources/lod-wiki-flabby-troll.md).

- [ ] ⭐⭐⭐ **🆕 ~Shield Thwacking NEW canon ability MAJEUR Flabby Troll (wiki) ⭐⭐⭐** — 1× Non-Elemental magic Party AoE + **100% Fear proc** (M-AV reduces). Pattern Damia : `ShieldThwackingAbility { type: 'magic-party-aoe'; multiplier: 1; element: 'non-elemental'; statusProc: { type: 'Fear'; chance: 1.0 } }` data-model canon NEW. **First 100% Fear proc Party canon ingestion Damia** (vs typical 50% status proc rate). Pattern thematic "troll shield thwacks Party + induces fear". À implémenter ability `shieldThwacking` Damia. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Knight Shield 2% drop CROSS-MOB source CONFIRMED MAJEUR Flabby Troll (wiki) ⭐⭐⭐** — Cohérent existing Dragon Soldier Knight Shield 2% canon ✓ (confirmed accessory classification per fandom Dragon Soldier). Flabby Troll = **2ème source Knight Shield farming canon Damia** (Dragon Soldier Disc 3 Tower of Flanvel Earth + Flabby Troll Disc 2 Undersea Cavern Earth — pattern Earth-mob Knight Shield source canon). Pattern Damia multi-source farming canon Knight Shield. À cross-référer `items/Knight Shield.md` (à créer/vérifier) — accessory canon Damia + drop sources cross-mob. Source: idem.

- [ ] ⭐⭐ **🆕 Flabby Troll Mob canon Disc 2 Undersea Cavern (wiki) ⭐⭐** — Earth Minor Enemy. Stats US HP 560 / AT 52 / DF 60 / MAT 33 / MDF 60 / SPD 50 + Gold 30 + EXP 84. Pattern "fragile high HP slow" (HP 560 moderate-high + DF/MDF 60 low + SPD 50 slow). Status 4/4 standard. Counter 0 No counter tier. AI 2-phase ~Club/~Shield Thwacking. Knight Shield 2% drop. À documenter `mobs/Flabby Troll.md` (créé). Source: idem.

- [ ] ⭐⭐ **🆕 Counter 0 No Counter tier 5ème instance Flabby Troll (wiki) ⭐⭐** — Cohérent existing canon Air Combat / Feyrbrand / Fire Bird / Canbria Dayfly / Drake bandits. Flabby Troll = 5ème Minor Enemy no counter canon Damia. Source: idem.

- [ ] ⭐⭐ **🆕 Undersea Cavern 3 submaps location canon Flabby Troll (wiki) ⭐⭐** — 3 submaps spawn (302/303/305). Cohérent existing canon Undersea (Glare + Mermaid + Screw Shell + Sea Piranha + Lenus + Regole partners). À documenter `locations/Undersea Cavern.md` (à créer/vérifier) — Disc 2 location canon. Source: idem.

- [ ] ⭐⭐ **🆕 Mermaid partner mob canon NEW Undersea Cavern Flabby Troll (wiki) ⭐⭐** — Mermaid + Flabby Troll mixed formation 128 canon. À documenter `mobs/Mermaid.md` (à créer) — Undersea Cavern partner mob canon NEW. Source: idem.

- [ ] ⭐ **🆕 ~Club canon name (community) Flabby Troll (wiki) ⭐** — Community approximation > 25% baseline ability. 1× physical. Pattern thematic "flabby troll club attack". Source: idem.

- [ ] **🆕 JP stats Flabby Troll à confirmer fandom future ⚠️** — Wiki US only ingéré. Pattern Damia adopt JP when available (+25% HP / Gold ÷3). ✅ **RÉSOLU fandom** : JP HP **700** ✓ +25% CONFIRMED exact / JP Gold **10** ✓ ÷3 CONFIRMED. Source: à ingérer.

### Mobs / Flabby Troll fandom complement — JP HP 700/10 CONFIRMED + Slow-Moving Club + Troll Tap canon names + Appearance flabby tattooed humanoid + Queen Fury naval encounters NEW MAJEUR + Knight Shield 200G shop NEW MAJEUR + Amber HP threshold UI NEW + Counter divergence ⚠️

- [ ] ⭐⭐⭐ **🆕 Queen Fury naval encounter canon NEW MAJEUR Flabby Troll (fandom) ⭐⭐⭐** — "One of two enemies in Undersea Cavern NOT also encountered on Queen Fury, the other being Sea Piranha" canon fandom. **Implies Undersea Cavern mobs ALSO encountered on Queen Fury** (naval encounters mob canon NEW Damia). Pattern Damia : ship/naval random encounters Queen Fury canon Disc 2 (Lohan→Queen Fury journey ?). Other Undersea mobs (Glare/Mermaid/Screw Shell) ALSO on Queen Fury canon. À documenter `locations/Queen Fury.md` (à créer) — naval encounters canon Disc 2. Source: [`features/mobs/_sources/fandom-flabby-troll.md`](features/mobs/_sources/fandom-flabby-troll.md).

- [ ] ⭐⭐⭐ **🆕 Knight Shield 200 Gold Bale/Fletz shop canon NEW MAJEUR (fandom) ⭐⭐⭐** — Purchasable accessory canon shop REVEAL. Pattern Damia : **3ème item purchasable confirmed** (Angel's Prayer 30G + Mind Purifier 20G + Knight Shield 200G accessory). Pattern Damia equipment items shop economy canon NEW : tier de prix accessory canon NEW. Drop farming inefficient (2+ hours vs shop 200G). À documenter `items/Knight Shield.md` (à créer/vérifier) — accessory + 200G Bale/Fletz canon NEW. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Slow-Moving Club canon name officiel MAJEUR Flabby Troll (fandom) ⭐⭐⭐** — Wiki ~Club = community approximation, fandom révèle **Slow-Moving Club** name officiel ("Walks towards single target + slowly swings club down" cohérent SPD 50 slow). Pattern thematic "slow club swing attack" canon. À implémenter ability `slowMovingClub` Damia. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Troll Tap canon name officiel MAJEUR Flabby Troll (fandom) ⭐⭐⭐** — Wiki ~Shield Thwacking = community approximation, fandom révèle **Troll Tap** name officiel ("Hits shield with spiked mace + low magic damage + Fear all targets" cohérent appearance mace + shield). Pattern thematic "troll taps shield with mace creating fear-inducing magic". À implémenter ability `trollTap` Damia avec 100% Fear Party proc + M-AV reduces canon. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Appearance canon DETAILED MAJEUR Flabby Troll (fandom) ⭐⭐⭐** — Very flabby humanoid + covered red tattoos + small patch of hair + large ears + 2 large teeth lower jaw + skulled rag + wrist band clothing (minimal) + wields spiked mace + large shield + skin beige/gold. Pattern thematic flabby tattooed humanoid troll canon Damia sprite design. Source: idem.

- [ ] ⭐⭐⭐ **🆕 "One of few non-boss enemies that can cast Fear on all targets" canon NEW MAJEUR (fandom) ⭐⭐⭐** — Pattern Damia : **Fear Party AoE Mob canon = rare canon Damia** (Flabby Troll + few others). À investiguer cross-mob : other Fear Party AoE Mobs ? Pattern canon rare ability tier. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Counter DIVERGENCE wiki Counter 0 vs fandom "Yes" MAJEUR ⚠️⚠️ (fandom) ⭐⭐⭐** — Wiki Counter 0 (No) vs Fandom "Yes". ⚠️ **INVERSE of Fire Spirit case** (wiki Yes/19 vs fandom No). Pattern Damia : adopt wiki precise Counter 0 + flag fandom claim. À investiguer Discord pour clarification Counter mechanic vs general counterattack. Pattern Damia : recurring wiki/fandom Counter divergence canon. Source: idem.

- [ ] ⭐⭐⭐ **🆕 JP HP 700 ✓ +25% systematic CONFIRMED Flabby Troll (fandom) ⭐⭐⭐** — US 560 × 1.25 = 700 ✓ exact. Pattern Damia +25% HP US→JP systematic canon récurrent CONFIRMED 12 entities maintenant. Source: idem.

- [ ] ⭐⭐⭐ **🆕 JP Gold 10 ✓ ÷3 systematic CONFIRMED Flabby Troll (fandom) ⭐⭐⭐** — US 30 ÷ 3 = 10 ✓ exact. Pattern Damia ÷3 Gold Mob systematic confirmed cross-mob. Source: idem.

- [ ] ⭐⭐ **🆕 Amber HP threshold UI canon NEW (fandom) ⭐⭐** — "Amber health (<50%) rather than Red" canon. Pattern Damia : **UI HP color tier canon NEW** : Amber (≤ 50%) ⭐ NEW canon (cohérent existing Drake "yellow or below" UI canon). Pattern Damia : 3-tier (ou 4-tier) HP color UI canon Damia à documenter. Source: idem.

- [ ] ⭐⭐ **🆕 Flabby Troll x2 rare formation canon NEW (fandom) ⭐⭐** — "You can on rare occasion find a pair of Flabby Trolls within a single battle" canon fandom. Wiki MISSING formation x2. Pattern Damia : NEW formation reveal canon — wiki incomplete. À cross-référer wiki encounter formation x2 manquante. Source: idem.

- [ ] ⭐⭐ **🆕 AT 65 + MAT 38 fandom CORRECTION wiki Flabby Troll (fandom) ⭐⭐** — Wiki AT 52 vs Fandom 65 (+25%) / Wiki MAT 33 vs Fandom 38 (+15%). Pattern Damia adopt fandom higher (JP closer probable cohérent pattern systematic). Source: idem.

- [ ] ⭐ **🆕 Encounter rate "Rare" + Farming time 2+ hours Knight Shield canon (fandom) ⭐** — Pattern Damia encounter rate descriptive terminology canon + farming time canon documentation. Source: idem.

### Locations / Flanvel Tower wiki (Disc 3 Mille Seseau dungeon — Mobile fortress 11,682 years lore NEW MAJEUR + Vanishing Stone gating CONFIRMED + 3 Moon items Lloyd NEW + Magician Faust Apparition/Real CONFIRMED + Madman/Basilisk NEW mobs + 7 chests + 12 submaps)

- [ ] ⭐⭐⭐ **🆕 Mobile fortress crashed Kashua Glacier 11,682 years ago lore canon NEW MAJEUR Flanvel Tower (wiki) ⭐⭐⭐** — "Flanvel Tower is a mobile fortress that crashed into depths of Kashua Glacier 11,682 years ago" canon. NEW lore canon Damia (cohérent ancient Dragon Campaign timeframe 11,000+ years). Pattern thematic : ancient Wingly fortress canon probable. À cross-référer `dragoons/dragon-campaign.md` 11,682 years timeframe canon. À investiguer fandom Wingly origin confirmation. Source: [`features/locations/_sources/lod-wiki-flanvel-tower.md`](features/locations/_sources/lod-wiki-flanvel-tower.md).

- [ ] ⭐⭐⭐ **🆕 Vanishing Stone gating canon CONFIRMED Flanvel Tower (wiki) ⭐⭐⭐** — Areas 1-7 accessible pre-Vanishing Stone (3 chests + Lloyd encounter + Faust Apparition). Areas 8-12 unlocked post-Vanishing Stone (4 chests + Magician Faust Real fight + 2nd save point). ✓ Cohérent existing Dragon Soldier fandom canon Vanishing Stone Tower of Flanvel optional sector. Pattern Damia : 12-area dungeon split pre/post Vanishing Stone canon. À documenter `items/Vanishing Stone.md` (à créer) — Key Item Disc 3 Flanvel gating canon. Source: idem.

- [ ] ⭐⭐⭐ **🆕 3 Moon items canon Disc 3 Lloyd defeat NEW MAJEUR Flanvel Tower (wiki) ⭐⭐⭐** — **Moon Gem + Moon Dagger + Moon Mirror** = 3 NEW items canon (Lloyd defeat reward Flanvel Tower submap 447). Pattern thematic "Moon" prefix series canon (cohérent existing Moon That Never Sets thematic Disc 4). Pattern Damia : Lloyd Flanvel Tower = source unique 3 Moon items canon. À documenter `items/Moon Gem.md` + `items/Moon Dagger.md` + `items/Moon Mirror.md` (à créer) — NEW Disc 3 Lloyd items canon. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Magician Faust 2 variants Apparition/Real CROSS-SOURCE CONFIRMED MAJEUR Flanvel Tower (wiki) ⭐⭐⭐** — Magician Faust (Apparition) submap 445 = story scripted Faust apparition pre-Vanishing (0 EXP/Gold). Magician Faust (Real) submap 452 = Dart confronts Faust real fight Vanishing Stone gated (20,000 EXP + 10,000 Gold + Phantom Shield 100% drop post-game super-boss). ✓ Cohérent existing Drake Trivia + Dragon Spirit Trivia + database Enemies wiki canon. À documenter `bosses/Magician Faust.md` (à créer) — 2 variants Apparition + Real canon. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Madman + Basilisk NEW mobs canon Disc 3 Flanvel Tower (wiki) ⭐⭐⭐** — **Madman** Earth EXP 165 / Gold 24 / Body Purifier 8% drop + **Basilisk** Earth EXP 150 / Gold 51 / Depetrifier 8% drop. Flanvel-specific Earth Disc 3 mobs. Pattern thematic Flanvel Earth mob trio (Dragon Soldier + Madman + Basilisk) cohérent stone fortress thematic. À documenter `mobs/Madman.md` + `mobs/Basilisk.md` (à créer) — NEW Flanvel-specific Earth mobs canon Damia. Source: idem.

- [ ] ⭐⭐ **🆕 Lloyd Flanvel Tower boss canon CONFIRMED Disc 3 (wiki) ⭐⭐** — Submap 447 scripted encounter — gets Moon Mirror from Lloyd defeat canon. EXP 12,000 + Gold 300. ✓ Cohérent existing Lloyd canon + Dragon Spirit Trivia "Lloyd (Flanvel Tower)" untargetable trick canon. À documenter `bosses/Lloyd.md` (à créer/vérifier) — Lloyd Flanvel Tower instance + Moon Mirror reveal canon. Source: idem.

- [ ] ⭐⭐ **🆕 7 treasure chests détaillés Flanvel Tower (wiki) ⭐⭐** — Spirit Ring (Area 1 pre-Vanishing) + Mage Ring (Area 2 pre-Vanishing) + Therapy Ring (Area 4 pre-Vanishing) + **Dragon Helm NEW** (3 teleporters room post-Vanishing) + Magical Hat (Boss room left post-Vanishing) + Dancer's Ring (Boss room lower right post-Vanishing) + **Holy Ahnk NEW** (Boss room upper right post-Vanishing). 2 NEW items canon Damia : Dragon Helm + Holy Ahnk. Source: idem.

- [ ] ⭐⭐ **🆕 Kashua Glacier mobs cross-location canon NEW Flanvel Tower (wiki) ⭐⭐** — 5 Kashua Glacier mobs spawn ALSO Flanvel Tower (Areas 1, 9, 11) : Icicle Ball + Land Skater + Freeze Knight + Rocky Turtle + Mammoth. Pattern canon NEW : cross-location mob spawn canon Damia (mobs spawn multiple locations). À cross-référer `mobs/Icicle Ball.md` + `mobs/Land Skater.md` + `mobs/Freeze Knight.md` + `mobs/Rocky Turtle.md` + `mobs/Mammoth.md` (à créer/vérifier). Source: idem.

- [ ] ⭐⭐ **🆕 Flanvel Tower location canon Disc 3 Mille Seseau (wiki) ⭐⭐** — Dungeon mobile fortress canon. Chain Disc 3 : Kashua Glacier #31 → Flanvel Tower #32 → Snowfield #33. 2 save points + No rest + No shops + 7 chests + 9 mob encounters + 2 bosses. 12 submaps (441-452 IDs). À documenter `locations/Flanvel Tower.md` (créé). Source: idem.

- [ ] ⭐⭐ **🆕 Metal Fang Thunder partner mob canon CONFIRMED Flanvel (wiki) ⭐⭐** — Cohérent existing Dragon Soldier partner mob canon ✓. Metal Fang Thunder Flanvel-specific EXP 135 / Gold 42 / Beast Fang 2% drop. À documenter `mobs/Metal Fang.md` (à créer) — Thunder Flanvel partner mob canon. Source: idem.

- [ ] ⭐ **🆕 Save points 2 + 1 Vanishing Stone gated Flanvel Tower (wiki) ⭐** — Save Point 1 (tree hollow Area 5) + Save Point 2 (3-teleporter room Area 9 Vanishing Stone gated). Pattern Damia : save point gated canon NEW (cohérent Vanishing Stone gating). Source: idem.

### Locations / Tower of Flanvel fandom complement — Wingly origin CONFIRMED MAJEUR + 108 races plan Emperor Diaz + Vanishing Stone origin Melbu Frahma + Spear Shooter Vellweb + Faust Commander 11,000 years + Land of Taboo + Story Disc 3/4 + JP stats 4 mobs CONFIRMED

- [ ] ⭐⭐⭐ **🆕 Wingly origin CONFIRMED + suppression non-Winglies pre-Dragon Campaign canon NEW MAJEUR (fandom) ⭐⭐⭐** — "Ancient mobile fort of the Winglies, used in suppression and extermination of non-Winglies BEFORE the Dragon Campaign" canon NEW MAJEUR (oppression era pre-Dragon Campaign lore). Pattern Damia : Wingly anti-Human warfare canon pré-Dragon Campaign. Cohérent existing canon Wingly era + Tower of Flanvel "floated in sky like Wingly cities". À documenter `lore/wingly-era.md` (à créer) — oppression era canon. Source: [`features/locations/_sources/fandom-tower-of-flanvel.md`](features/locations/_sources/fandom-tower-of-flanvel.md).

- [ ] ⭐⭐⭐ **🆕 108 races plan Emperor Diaz canon NEW MAJEUR (fandom) ⭐⭐⭐** — Lloyd quote canon : "**Humans = 106th in the plan / Winglies = 107th / 108th evolution = utopia final species**" canon. Pattern Damia : Soa great will + Divine Tree flow of evolution canon ✓. Emperor Diaz revolutionary plan canon = 108 races progression. À documenter `lore/108-races-plan.md` (à créer) — Emperor Diaz utopia canon Disc 3. Cohérent existing Soa + Divine Tree canon. Source: idem.

- [ ] ⭐⭐⭐ **🆕 3 Divine Moon Objects canonical terminology (fandom) ⭐⭐⭐** — Moon Gem + Moon Dagger + Moon Mirror = **"Divine Moon Objects"** canonical terminology (vs wiki "Moon items"). Lloyd gathers all 3 Tower top canon. Moon Mirror = **national treasure Mille Seseau** canon. Pattern Damia : adopter "Divine Moon Objects" terminology canonical fandom + flag "Moon items" wiki community. À cross-référer `items/Divine Moon Objects.md` (à créer) — 3 Divine Moon Objects category canon. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Vanishing Stone origin Melbu Frahma anti-Faust canon NEW MAJEUR (fandom) ⭐⭐⭐** — **Melbu Frahma created Vanishing Stone to vanquish Faust's apparitions** (feared Faust disloyalty). Pattern Damia : Vanishing Stone canon origin REVEAL — anti-Faust weapon Melbu Frahma created (vs Damia hypothesis Wingly artifact). À documenter `items/Vanishing Stone.md` (à créer) — origin Melbu Frahma anti-Faust canon NEW. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Spear Shooter Vellweb human weapon canon NEW MAJEUR (fandom) ⭐⭐⭐** — Human-designed weapon based Vellweb that disabled Faust's Tower of Flanvel (caused Kashua crash probable). Pattern Damia : anti-Wingly human weapon canon NEW (Vellweb origin). À documenter `items/Spear Shooter.md` (à créer) — Vellweb anti-Wingly weapon canon NEW. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Faust Commander Tower of Flanvel + 11,000+ years survival canon NEW MAJEUR (fandom) ⭐⭐⭐** — Faust = **Commander of Tower of Flanvel** during Wingly era + survived Dragon Campaign 11,000+ years + plot remobilize Flanvel + "king of world" ambition. Faust quotes complets canon. Pattern thematic : Wingly Commander immortal survivor canon. À documenter `bosses/Magician Faust.md` (à créer) — Commander Faust 11,000 years canon. Rose ageless canon CONFIRMED ✓ ("Not bad being human and being ageless" Faust acknowledgment). Source: idem.

- [ ] ⭐⭐⭐ **🆕 Martel 50 Stardust → Vanishing Stone trade canon NEW MAJEUR (fandom) ⭐⭐⭐** — Martel NPC (Ulara probable) gives **Vanishing Stone for 50 Stardust total collection** canon (cohérent existing Stardust feature 50 = complete collection). Pattern Damia : Stardust quest reward = Vanishing Stone canon. À documenter `npcs/Martel.md` (à créer/vérifier) — Stardust collector NPC + Vanishing Stone reward canon. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Land of Taboo canonical terminology Disc 4 (fandom) ⭐⭐⭐** — "Land of Taboo" canon terminology = Disc 4 optional area Tower of Flanvel top accessible Vanishing Stone gated (vs wiki "Areas 8-12 post-Vanishing"). Pattern Damia : adopter "Land of Taboo" canonical terminology fandom + flag wiki "Areas 8-12" terminology. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Story canon Disc 3 lore Flanvel Tower MAJEUR (fandom) ⭐⭐⭐** — Wink protects Lloyd canon (Wink NEW character) + Setie companion canon (probable Sacred Sister Mille Seseau) + Queen Theresa Moon Mirror unseal + Lloyd surrenders Divine Moon Objects to Dart + Dart punches Lloyd canon (character growth) + Lavitz killed by Lloyd CONFIRMED ✓ + Shana taken by Emperor Diaz Deningrad canon NEW MAJEUR + Emperor Diaz requests Divine Moon Objects Vellweb canon. À documenter `npcs/Wink.md` + `npcs/Setie.md` + `npcs/Queen Theresa.md` + `bosses/Emperor Diaz.md` (tous à créer/vérifier). Source: idem.

- [ ] ⭐⭐⭐ **🆕 Divine Dragon Dragoon Spirit resonance canon NEW (fandom) ⭐⭐⭐** — Top Tower : Divine Dragon Dragoon Spirit resonates with Dart's Red-Eye Dragon Spirit canon Disc 3. Pattern Damia : Dragoon Spirit resonance canon = Dragon Spirit detection mechanic canon NEW. Source: idem.

- [ ] ⭐⭐⭐ **🆕 JP stats CONFIRMED 4 mobs Flanvel Tower cross-mob (fandom) ⭐⭐⭐** — Basilisk JP HP 820 + Madman JP HP 1300 + Metal Fang JP HP 820 + Dragon Soldier JP HP 610 (all +25% pattern systematic ✓). Gold ÷3 confirmed all 4 mobs. Pattern Damia : JP stats canon CONFIRMED cross-mob Flanvel Tower mobs. ⚠️ fandom US stats divergent wiki US (Basilisk 715 vs wiki 656 / Metal Fang 715 vs wiki 656 — pattern récurrent divergence wiki/fandom US, JP base from wiki US × 1.25 canon). Source: idem.

- [ ] ⭐⭐ **🆕 Black Rain + Fatal Blizzard chests NEW canon Flanvel Tower (fandom) ⭐⭐** — 2 chests NOT in wiki 7-list (potential 9 chests total Tower). Pattern Damia : NEW chests reveal — wiki incomplete. À cross-référer wiki encounter chests précis. Source: idem.

- [ ] ⭐⭐ **🆕 Holy Ankh spelling correction ⚠️ (fandom) ⭐⭐** — Wiki "Holy Ahnk" vs fandom "Holy Ankh" (correct Egyptian symbol spelling). Pattern Damia : adopt **Holy Ankh** canon (correct spelling). Source: idem.

- [ ] ⭐⭐ **🆕 Therapy Ring sequence break canon NEW (fandom) ⭐⭐** — Possible obtain Therapy Ring pre-Vanishing Stone via careful walk avoiding Faust apparition (Land of Taboo entry). Pattern Damia : sequence break canon NEW Tower Flanvel. Source: idem.

### Locations / Fletz wiki (Disc 2 Tiberoa capital — King Zior + Twin Castle + 2 princesses + Queen Fury Port + Lenus boss + Pass Valley + 3 shops + 26 items + Knight Shield 200G CONFIRMED + Trans Light Spell Item CONFIRMED + 11 NEW equipment items + 7 Stardust + 2 chests + 48 submaps)

- [ ] ⭐⭐⭐ **🆕 King Zior + Twin Castle + 2 princesses Emille/Lisa canon NEW MAJEUR Fletz (wiki) ⭐⭐⭐** — Capital city Tiberoa southern region. King Zior ruler Tiberoa canon. Twin Castle north city = Tower of Moon (Princess Emille) + Tower of Stars (Princess Lisa). 2 princesses canon Disc 2. À documenter `npcs/King Zior.md` + `npcs/Princess Emille.md` + `npcs/Princess Lisa.md` (à créer). Source: [`features/locations/_sources/lod-wiki-fletz.md`](features/locations/_sources/lod-wiki-fletz.md).

- [ ] ⭐⭐⭐ **🆕 Queen Fury Port beneath Twin Castle canon CROSS-SOURCE CONFIRMED ⭐⭐⭐** — Submap 224 "Port for Queen Fury beneath the castle" ✓ confirme existing Flabby Troll fandom canon Queen Fury naval encounters Disc 2. Pattern Damia : Queen Fury = Tiberoa royal ship Fletz Port canon CONFIRMED. À documenter `locations/Queen Fury.md` (à créer) — naval ship canon Disc 2. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Lenus boss canon Disc 2 Fletz CONFIRMED MAJEUR Fletz (wiki) ⭐⭐⭐** — Water boss 6,000 EXP / 200 Gold / Nothing drop. Submap 236 scripted "throne room Lenus flees". Story canon : Lenus impersonating Princess Emille 6 months canon NEW MAJEUR. Story progression : Throne room confrontation → Lenus flees → King Zior asks pursuit → Prison Island. Pattern thematic Lenus = Wingly assassin canon (cohérent existing Lenus + Regole Undersea Cavern). À documenter `bosses/Lenus.md` (à créer/vérifier). Source: idem.

- [ ] ⭐⭐⭐ **🆕 Pass for the Valley of Corrupted Gravity Key Item canon NEW MAJEUR Disc 2 ⭐⭐⭐** — Key Item Disc 2 gating Valley of Corrupted Gravity (cohérent existing Valley canon Dragonfly/Erupting Chick/Roc). Acquisition : Donau quest → return Fletz → guard front castle → Fester item shop → Fester near castle entrance → Twin Castle King Zior obtain pass. Pattern Damia : Pass-gated location canon Disc 2 NEW. Pattern thematic : political gating canon (royal authorization). À documenter `items/Pass For Valley.md` (à créer) — Key Item Disc 2 canon. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Knight Shield 200G Fletz Weapon Shop CROSS-SOURCE CONFIRMED MAJEUR (wiki) ⭐⭐⭐** — ✓ Cohérent existing Flabby Troll fandom canon "Knight Shield 200G Bale OR Fletz". Fletz Weapon Shop confirme price + location. Pattern Damia cross-source CONFIRMED — Knight Shield = 200G accessory canon Tiberoa shops. Pattern Damia : drop farming inefficient (Dragon Soldier/Flabby Troll 2% drops vs shop 200G). Source: idem.

- [ ] ⭐⭐⭐ **🆕 Trans Light 10G Item Shop CROSS-SOURCE CONFIRMED Spell Item canon Fletz (wiki) ⭐⭐⭐** — ✓ Cohérent existing Fairy fandom canon "Trans Light = Spell Item". Fletz Item Shop 10G confirme Spell Item nature + price tier canon. Pattern Damia cross-source : Trans Light = Light Spell Item canon (10G shop + Fairy drop source). Source: idem.

- [ ] ⭐⭐⭐ **🆕 Black Rain Spell Item canon NEW MAJEUR Fletz Item Shop (wiki) ⭐⭐⭐** — 20G Item Shop Fletz. Cohérent existing Tower of Flanvel fandom canon "Black Rain chest" reveal. Pattern Damia : Black Rain = Spell Item canon NEW (probable Darkness element thematic "rain of darkness"). À documenter `items/Black Rain.md` (à créer) — Darkness Spell Item canon NEW. Source: idem.

- [ ] ⭐⭐⭐ **🆕 11 NEW equipment items Fletz Weapon Shop canon (wiki) ⭐⭐⭐** — Shadow Cutter (200G) + Chain Mail (150G) + Soft Boots (100G) + Poison Guard (200G) + Active Ring (200G) + Protector (200G) + Panic Guard (300G) + Stun Guard (200G) + Bravery Amulet (300G) + Magic Ego Bell (300G) + Power Wrist (200G) + Wargod Calling (1,000G). Pattern Damia : Disc 2 equipment shop tier 100-1000G canon. À documenter `items/equipment.md` 11 NEW items canon. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Jewelry Shop Fletz 1,000G tier canon (wiki) ⭐⭐⭐** — 4 jewelry accessories 1,000G : Ruby Ring + **Sapphire Pin** (✓ cohérent existing Crystal Golem drop) + Emerald Earring + **Platinum Collar** (✓ cohérent existing Succubus drop). Pattern Damia : jewelry shop economy 1,000G tier canon NEW. Source: idem.

- [ ] ⭐⭐⭐ **🆕 Story canon Disc 2 Fletz MAJEUR (wiki) ⭐⭐⭐** — Emille acting strangely 6 months (Lenus impersonation) + **Fester scholar Moon That Never Sets cultural role + teaches Lisa Astronomy** + **Kaffi bar worker** NPC + **Nello "Green Party" vegetation** host + Shana confesses Dart balcony submap 662 + Banquet for heroes throne room post-Lenus submap 238. À documenter `npcs/Fester.md` + `npcs/Kaffi.md` + `npcs/Nello.md` (à créer). Source: idem.

- [ ] ⭐⭐ **🆕 Fletz location canon Disc 2 (wiki) ⭐⭐** — Capital Tiberoa southern region (borders Aquaria Coral Reef + harbor). Architecture white + blue marble. 48 submaps détaillés (Fletz 1-24 + Twin Castle 25-48). 2 save points + Hotel/Clinic 20G + No random encounters (safe city). À documenter `locations/Fletz.md` (créé). Chain Disc 2 : Kazas #13 → Fletz #14 → Barrens #15. Source: idem.

- [ ] ⭐⭐ **🆕 7 Stardust Fletz #21-27 canon + #27 conditional Lisa quest (wiki) ⭐⭐** — Stardust détaillés Fletz : Crates bar / Roof bridges / Weapons Shop box / Jewelry Shop gems / Items Shop telescope / Twin Castle statue / Twin Castle right tower base. ⚠️ Stardust #27 conditional : NOT obtainable while assisting Princess Lisa canon NEW (sequence break conditional canon). Source: idem.

- [ ] ⭐⭐ **🆕 2 chests Twin Castle training room Fletz canon (wiki) ⭐⭐** — Moon Serenade + Sun Rhapsody chests (Knight's training room submap 225). Pattern Damia : Moon Serenade = Spell Item probable Moon thematic (cohérent existing Cursed Jar drops + Tower of Flanvel canon). Sun Rhapsody chest cohérent existing Fairy drop canon. Source: idem.

- [ ] ⭐⭐ **🆕 Magical space inside painting canon NEW Twin Castle (wiki) ⭐⭐** — Submap 669 "Magical space inside painting" NEW location canon Disc 2 (Twin Castle painting pocket dimension). Pattern Damia : magical pocket dimension canon NEW Wingly probable. Source: idem.

- [ ] ⭐⭐ **🆕 Telescope Moon That Never Sets canon Fester planetarium (wiki) ⭐⭐** — Submap 235 "Telescope view of Moon That Never Sets" canon Fester scholar + Lisa Astronomy lessons. Pattern Damia : Astronomy canon Disc 2 Fester teaching Lisa. À cross-référer Moon That Never Sets cultural lore. Source: idem.

- [ ] ⭐ **🆕 Charm Potion + Healing Breeze NEW items canon Fletz Item Shop (wiki) ⭐** — Charm Potion 4G (cheap consumable NEW) + Healing Breeze 50G (Spell Item NEW). À documenter `items/Charm Potion.md` + `items/Healing Breeze.md` (à créer). Source: idem.

- [ ] ⭐ **🆕 Hotel + Clinic 20G canon Fletz (wiki) ⭐** — Hotel restores HP/MP party + Clinic cures status ailments party (20G each). Pattern Damia rest area economy canon Disc 2. Source: idem.

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
