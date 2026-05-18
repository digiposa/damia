# Additions

> Système d'attaques chaînées TLoD — QTE-based en canon PS1, adapté real-time en Damia.
>
> **Sources canon** :
>
> - 🥈 [`_sources/lod-wiki-additions.md`](./_sources/lod-wiki-additions.md) — wiki LoD, **source la plus exhaustive** (28 additions, formules, counters, groups, tables hit/multiplier)
> - 🥇 [`_sources/wulves-tlod-damage-formulas.md`](./_sources/wulves-tlod-damage-formulas.md) — Wulves, formules numériques

## Statut

🟡 **draft** — partiellement implémenté côté code Damia. Données complètes (28 additions, hit data, multipliers per level) en `src/data/balance.ts`. Système simplifié vs canon (pas de QTE, pas de counterattacks).

## Canon PS1 — résumé

### Définition

**Additions** = attaques nommées chaînant plusieurs hits via **quick time events** successifs. Chaque input réussi :

- Augmente les dégâts (via multiplier per-level)
- Augmente le SP gagné (uniquement pour characters ayant Dragoon Spirit)

**Exceptions** :

- **Shana & Miranda** n'ont **pas** d'Additions
- **Lavitz & Albert** partagent les **mêmes Additions** (différent rhythm + counter opportunities)

Initiated par la **commande "Attack"** en battle.

### QTE — timing sight

Quand une Addition commence :

1. Carré bleu **stationnaire** sur la cible
2. Carré plus grand qui **rotate et collapse** vers le premier
3. **Input** (généralement **X**) au moment de l'overlap
4. **Feedback couleur** :
   - **Blanc** = perfect
   - **Bleu** = too slow
   - **Gris** = too fast
5. **Failure** → fin du chain, dégâts perdus
6. Alternative : icône bouton qui change → presser au bon moment

### Levels

- Démarrent **level 1**, max **level 5**
- **20 successful performances** = +1 level
- Level applied **après la fin du combat** (pas during) — important : entrer en combat à 19 perfs reste level 1 quoi que tu fasses
- Niveau ↑ peut augmenter **dégâts**, **SP gain**, ou **les deux**
- Pas changeable in-battle (uniquement Additions menu en System Screen)

### Accessoires Wargod

| Accessoire          | Effet                                                                             |
| ------------------- | --------------------------------------------------------------------------------- |
| **Wargod Calling**  | Auto-complete Addition mais : **½ damage**, **½ SP**, **ne level pas** l'Addition |
| **Ultimate Wargod** | Auto-complete Addition avec **full damage + SP + leveling** retenus               |

### Counterattacks

Enemies peuvent **counter** une Addition mid-chain :

- Signaux : **flash rouge**, **whooshing sound**, **pause**, timing sight devient **rouge**
- Bouton requis : **O (Circle)** au lieu de X
- **Success** → l'Addition reprend
- **Failure** → l'Addition se termine + character prend les dégâts du counter

**Formule Addition Counter** :

```
floor{floor[floor{floor[(AT² × 250 / DF)] / 100} × Target Fear × Attacker Fear] × Power}
```

(_attacker_ = enemy countering ; _target_ = character countered)

**Règles de comportement** :

- Max **1 counter par Addition**
- **Jamais** sur le first ou last press → Additions ≤ 2 presses ne sont **jamais** counter
- Certains enemies refusent de counter même quand possible
- Certains enemies ne peuvent pas counter du tout

### Groupes de counters

10 groupes : **28** (toutes opportunities), 23, 19, 16, 13, 9, 4, 3, 2, 1. Higher group = superset des lower groups. Détails complets dans [`_sources/lod-wiki-additions.md`](./_sources/lod-wiki-additions.md) (28 opportunités sur 6 characters).

**Mob counters Damia déjà connus** (canon wiki) :

| Mob (Damia)         | Group canon | Counters possibles                                                                                                                                                                       |
| ------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Berserk Mouse       | 28          | Tous                                                                                                                                                                                     |
| Goblin              | 28          | Tous                                                                                                                                                                                     |
| Trent               | 28          | Tous                                                                                                                                                                                     |
| Assassin Cock       | 19          | Subset (Volcano:2, Crush Dance:2, Hard Blade:2, Cool Boogie:2-3, Cat's Cradle:3, Perky Step:2, Summon 4 Gods:2, Gust of Wind Dance:2, Flower Storm:2-3-4-5-6 partial, Demon's Dance:4-5) |
| Fruegel (1st & 2nd) | 28          | Tous (boss)                                                                                                                                                                              |

### Formule de dégâts

```
floor[floor{floor[floor{floor[round{floor[floor{[hit 1 + ... + hit n] × Multiplier / 100} × AT / 100] × (LV + 5) × 5 / DF} × Target Fear × Attacker Fear] × Power} × Field] × Element} × Destroyer Mace]
```

**Variables** :

- `hit n` = valeur per-hit canon (Damia : déjà en `balance.ts`, table complète dans `_sources/`)
- `Multiplier` = valeur cachée per-level (table per archetype × level 1-5)
- `AT`, `DF`, `LV` = stats joueur classiques
- Modifiers wrapper standard ([`elements.md`](./elements.md), [`damage-modifiers.md`](./damage-modifiers.md) à venir)

**Note canon** : pour un perfect addition maxed, on peut remplacer `{[hits] × Multiplier / 100}` par le **DMG%** affiché dans le menu Additions.

### Liste des Additions par character

Les 28 additions canon réparties sur 6 archetypes. **Wulves doc** + **wiki LoD** sont alignés sur :

- Liste exacte
- Number of presses
- Acquisition (per character level threshold)
- DMG% maxed
- SP maxed
- Hit data tables
- Multiplier tables (per level)

Détails complets dans [`_sources/lod-wiki-additions.md`](./_sources/lod-wiki-additions.md).

**Note** : `*` dans le wiki = Addition jamais counter (généralement les 1-2 press qui n'ont pas d'opportunity, OU certaines marquées explicitement). Cette info est utile pour le design Damia (priorisation des additions safe).

## Vision Damia

### État actuel (impl partielle)

**Déjà en code** (cf. inventaire combat) :

- 28 Additions définies dans `src/data/balance.ts:L246–551` (6 archetypes)
- Component `Addition` : `{ kind, targetId, elapsedMs, totalMs, hitsApplied, hitsLanded, level, dirX/dirY }`
- `AdditionSystem` : drives animation, applique damage à chaque hit timing (~200ms intervals)
- `SkillCooldown` per-skill (mécanique Damia, pas canon)
- Multipliers per level 1-5 + SP gain per level snapshot au trigger
- 20-uses-per-level threshold (aligné canon)
- Voice line à la complétion si final hit landed
- Formule `computeAdditionDamage` per-hit dans `src/gameplay/damage.ts`

**Pas en code** (gaps vs canon) :

- ❌ QTE / timing sight (real-time = pas de QTE possible — décision design)
- ❌ Feedback white/blue/gray (sans QTE, sans pertinence)
- ❌ **Counterattacks** (mécanique majeure canon)
- ❌ **Wargod Calling / Ultimate Wargod** accessoires
- ❌ Level applied **after battle** (Damia : probablement immediate — à vérifier code)
- ❌ Différenciation Lavitz vs Albert (rhythm + counters) — en canon ils ont mêmes additions mais opportunities différentes
- ❌ Performances continuent à être tracked au-delà du seuil (level max = 5, mais comportement post-cap pas spec)

### Discussion impl (à trancher)

#### 1. QTE timing en real-time — comment ?

Canon : presser X au moment où les carrés overlap. **Damia n'a pas de QTE**. Options :

- **Option A** : Auto-complete toutes les additions (Damia version), comme Ultimate Wargod canon. Dégâts max systématique. Simple, fun, pas de friction.
- **Option B** : QTE adapté pour iso temps réel — e.g. click-to-attack initie addition, puis hold/release rythmique pour scaler dégâts (sans casser le flow temps réel)
- **Option C** : Combo input séquentiel (presser X N fois dans une fenêtre temporelle), avec dégâts scalant sur N successful inputs
- **Option D** : Modern Survival = auto-complete ; Classic Survival / Story = QTE (option B ou C)

**Recommandation** : commencer par **Option A** (déjà l'état actuel, simple). Iter vers Option B/C si on veut plus de skill expression côté joueur.

#### 2. Counterattacks — porter ?

Mécanique signature canon (timing-based bouton O). **Sans QTE, comment porter ?**

Options :

- **Option α** : Skip totalement (Modern simplification)
- **Option β** : "Random interrupt" : pendant l'addition animation, l'enemy peut placer un counter selon ses opportunities ; le joueur doit appuyer sur une touche dans une fenêtre courte (ex : Espace) pour parry. Sinon, dégâts du Counter formula.
- **Option γ** : Counter automatique passif : enemy a x% chance de counter (depending on group), inflige dégâts du Counter formula. Pas d'input joueur.
- **Option δ** : Skip Story / activable Modern Survival (perk to unlock).

**Recommandation** : reposer cette question quand on aura tranché QTE. Le counter dépend du flow d'input principal.

#### 3. Wargod accessories

Wargod Calling auto-complete mais nerf 50% / Ultimate Wargod auto-complete full.

Si on choisit **Option A (auto-complete par défaut)** pour les additions Damia : ces accessoires deviennent **redondants** (puisque tout est auto-complete déjà). Soit on :

- ❌ Skip ces items (perdent leur sens design)
- ✅ Reframe : Ultimate Wargod = bonus damage / SP multiplier, Wargod Calling = trade-off (less damage but less SP cost or similar)
- ✅ Garder pour le mode "QTE optionnel" si on implémente l'Option B/C

→ Décision liée à Q1.

#### 4. Per-hit vs sum-first damage formula

Canon : `[Σhits] × Multiplier × AT × ...` (sum first, multiplier après).
Damia : per-hit (chaque hit applique son propre damage individuel).

**Délibéré pour UX** (cf. damage-formula.md §Décisions) : montrer un floating number par hit, accumulation floor truncation = ±1 vs canon perfect. Trade-off acceptable.

#### 5. Lavitz vs Albert différenciation

Canon : mêmes additions, **rythmes différents** (donc QTE différent) + **counter opportunities différentes** (Lavitz Rod Typhoon counter Group 28 only / Albert Gust of Wind Dance et Flower Storm ont opportunities différentes).

Damia : si pas de QTE, le rythme disparait. Reste les counters → si on porte les counters, alors Lavitz et Albert ont des "courbes de risque" différentes selon les enemies.

**Si on skip counters** : Lavitz et Albert deviennent fonctionnellement identiques (mêmes additions, mêmes dégâts). Différencier via stats ou autre serait nécessaire pour qu'ils gardent du caractère.

#### 6. Level applied after battle vs immediate

Canon : level up après battle end (préserve la cohérence d'un seul battle).
Damia : à vérifier en code. Probablement immediate.

**Question design** : importance de respecter ce détail ? Si Damia level up immediate → c'est plus permissif (gameplay arena Survival favorable). En Story Classic, on pourrait respecter le delay pour la fidélité.

## Décisions & rationale

| Décision                                               | Pourquoi                                                                                                |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Per-hit damage (au lieu de sum-first canon)            | UX temps réel : 1 floating number par hit = feedback visuel meilleur (déjà acté dans damage-formula.md) |
| 28 additions complètes par archetype                   | Respect canon. Données déjà en `balance.ts`.                                                            |
| Skill cooldown per-addition (innovation Damia)         | Pas de canon. Nécessaire en RT pour éviter spam. Pas un nerf, juste un fit avec le gameplay temps réel. |
| Décision QTE / counters / Wargod = à trancher ensemble | Ces 3 mécaniques sont liées au flow d'input — décision atomique recommandée.                            |

## Spec technique (impl actuelle)

### Components

```ts
Addition {
  kind: AdditionKind,  // 28 enum values
  targetId: EntityId,
  elapsedMs: number,
  totalMs: number,
  hitsApplied: number,
  hitsLanded: number,
  level: 1 | 2 | 3 | 4 | 5,
  dirX: number,
  dirY: number,
}

SkillCooldown {
  remainingMs: Partial<Record<AdditionKind, number>>,
}
```

### Systems

- **AdditionSystem** (`src/gameplay/systems/AdditionSystem.ts:L19-117`) : drives animation, applique damage à chaque `hitTiming` checkpoint (~200ms intervals). Per-hit `computeAdditionDamage` call. Tick SkillCooldown. Voice line à la complétion iff final hit landed.

### Data

- **`src/data/balance.ts:L246-551`** : 28 additions × 6 archetypes
  - `hits[]` per addition (table verbatim wiki)
  - `multipliers[1..5]` per addition (table verbatim wiki)
  - `spGains[1..5]` per addition
  - `timings`, `cooldown`, etc.

### Formule (rappel)

```ts
computeAdditionDamage(world, attackerId, targetId, hitValue, multiplier): number
// Per-hit ; somme finale ≈ canon perfect à ±1 (floor truncation)
```

## Liens code

- **Component Addition** : `src/gameplay/components/Addition.ts`
- **AdditionSystem** : `src/gameplay/systems/AdditionSystem.ts`
- **SkillCooldown** : `src/gameplay/components/SkillCooldown.ts`
- **Data** : `src/data/balance.ts:L246` (Addition definitions)
- **Damage formula** : `src/gameplay/damage.ts` (`computeAdditionDamage`)

## Liens doc

- **Source canon wiki** 🥈 : [`_sources/lod-wiki-additions.md`](./_sources/lod-wiki-additions.md)
- **Source canon Wulves** 🥇 : [`_sources/wulves-tlod-damage-formulas.md`](./_sources/wulves-tlod-damage-formulas.md)
- **Damage formula** : [`damage-formula.md`](./damage-formula.md)
- **Elements** : [`elements.md`](./elements.md) (modifier Element & Field)
- **Dragoons** : [`../dragoons/`](../dragoons/) (Dragoon Additions séparées en form Dragoon, autre mécanique)
- **Items / Wargod accessories** : [`../items/equipment.md`](../items/equipment.md) (à créer)
- **Bosses / counter groups** : `../bosses/` (à créer — counter group par boss)

## Questions ouvertes (à trancher pour impl complète)

- [ ] **QTE / timing mechanic en real-time** (option A/B/C/D) — voir §Vision Damia Q1
- [ ] **Counterattacks** — porter (α/β/γ/δ) ou skip ? — voir Q2
- [ ] **Wargod Calling / Ultimate Wargod** — porter, reframer, ou skip ? Dépend Q1.
- [ ] **Lavitz vs Albert différenciation** — si pas de counters → fonctionnellement identiques. Désirable ?
- [ ] **Level applied after battle vs immediate** — vérifier code Damia + acter design
- [ ] **Performances tracked past cap** (level 5) — comportement canon vs Damia ?
- [ ] **Albert Dmg% / SP table** : wiki avait colonnes inversées (Dmg vs SP) — vraisemblablement preserved bug ; à vérifier
