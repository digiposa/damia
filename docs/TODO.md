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

- [ ] **Performances tracked past level cap (Q6)** — Une fois Addition au max level 5, continue-t-on à compter les uses ? Options : (a) cap dur à 100 / (b) compteur continue (utile pour stats / méta-progression Survival ?). À trancher. Source: additions.md §Q6.

- [x] **Albert Dmg%/SP table wiki** — ✅ **RÉSOLU** : typo wiki, Albert = Lavitz (mêmes stats / additions / SP, archetype Jade Dragoon partagé). Utiliser table Lavitz comme référence. Source: additions.md §Q7.

- [ ] **Mob counter groups** — Si on implémente jamais les counters (cf. idée future), il faudra le data-model. Canon : ~140 enemies sortés en 10 groupes (1, 2, 3, 4, 9, 13, 16, 19, 23, 28). Damia mobs identifiés : Berserk Mouse=28, Goblin=28, Trent=28, Assassin Cock=19, Fruegel=28. Source: additions.md. Priorité: basse (dépend idée future Q2).

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
