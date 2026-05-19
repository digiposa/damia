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
