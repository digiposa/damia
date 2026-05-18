# Elements

> Système élémental TLoD — gouverne les modifiers `Field` et `Element` du wrapper de dégâts ([`damage-formula.md`](./damage-formula.md)).
>
> **Sources canon** :
>
> - [`_sources/fandom-tlod-elements.md`](./_sources/fandom-tlod-elements.md) — fandom wiki (vue narrative + listing enemies par élément)
> - [`_sources/wulves-tlod-damage-formulas.md`](./_sources/wulves-tlod-damage-formulas.md) — Wulves (formules numériques)

## Statut

🟡 **draft** — système canon documenté. **Pas câblé en code** : les modifiers `Field` et `Element` ont un slot dans `DamageModifiers` mais aucun système ne les active. Aucun champ `element` sur les composants.

## Canon PS1

### Les 8 éléments

1. **Fire**
2. **Water**
3. **Wind**
4. **Earth**
5. **Light**
6. **Darkness**
7. **Thunder**
8. **Non-Elemental** (a.k.a. Unbased)

### Relations canoniques

| Source       | Vs same element         | Vs opposed element                                                           | Vs anyone (modifier Element wrapper) |
| ------------ | ----------------------- | ---------------------------------------------------------------------------- | ------------------------------------ |
| **Fire**     | Resists itself (×0.5)   | × ? vs Water (voir divergence ci-dessous)                                    |                                      |
| **Water**    | Resists itself          | × ? vs Fire                                                                  |                                      |
| **Wind**     | Resists itself          | × ? vs Earth                                                                 |                                      |
| **Earth**    | Resists itself          | × ? vs Wind                                                                  |                                      |
| **Light**    | Resists itself          | × ? vs Darkness                                                              |                                      |
| **Darkness** | Resists itself          | × ? vs Light                                                                 |                                      |
| **Thunder**  | Resists itself          | **Aucun opposing** (×1 vs tous sauf Non-Elemental, voir ci-dessous)          |                                      |
| **Non-Elem** | **Ne résiste PAS** (×1) | **×2 vs TOUS les autres éléments** — ⚠️ **fandom-only**, non confirmé Wulves |                                      |

> ⚠️ **Caveat Non-Elemental ×2** : cette règle vient **uniquement de la doc fandom** (🥉). La doc Wulves (🥇) **ne traite pas explicitement Non-Elemental** dans sa table de modifiers — appliquer strictement le modifier Element de Wulves à un attaquant Non-Elemental contre n'importe quelle cible donnerait modifier = ×1 (ni match, ni opposite). Le ×2 observé en jeu est **probablement hardcodé** sur les items concernés (Psychedelic Bomb, Divine Dragon attacks) plutôt que dérivé du modifier Element standard. **À confirmer** auprès source tier 1 (Discord communauté ou legendofdragoon.org).

### ⚠️ Divergence entre sources — résolution

- **Fandom** (🥉) : opposing element deals **×2 damage**
- **Wulves** (🥇) : Element modifier table = opposite `+1/2` ⇒ modifier `1 + (+1/2) = 1.5` ⇒ **×1.5 damage**

**Résolution selon la [hiérarchie de fiabilité](../README.md#hiérarchie-de-fiabilité-des-sources-canon-tlod)** : **Wulves prime** (testing formel par cadors communauté). Le ×2 du fandom est une **simplification narrative** ; la valeur correcte côté formule est ×1.5.

Note : la perception "×2" peut venir de la combinaison **Field + Element** quand les deux s'appliquent (`×1.5 × ×1.5 = ×2.25`), notamment en Element Dimension matchant l'attaque.

→ **Source de vérité** : Wulves pour les **nombres**. Fandom utilisé uniquement pour les **relations qualitatives** (qui résiste qui, listing enemies par élément, lore).

### Application du système

L'élément intervient dans **deux modifiers distincts** du wrapper de dégâts :

| Modifier    | Compare                                 | Match                   | Opposite                | Neither |
| ----------- | --------------------------------------- | ----------------------- | ----------------------- | ------- |
| **Field**   | Attack Element vs Special Field Element | `1 + (+1/2)` = **×1.5** | `1 + (-1/2)` = **×0.5** | ×1      |
| **Element** | Target Element vs Attack Element        | `1 + (-1/2)` = **×0.5** | `1 + (+1/2)` = **×1.5** | ×1      |

**Lecture** :

- Field favorise quand ton attaque matche le terrain. Punit quand opposite.
- Element favorise quand ta cible est l'opposite de ton attaque. Punit quand match (canon "same element resists itself").

### Magic vs Physical

- **Magical attacks** (Dragoon Magic, Item Magic, monster magic) : Element modifier s'applique systématiquement
- **Physical attacks** : Element modifier s'applique seulement si l'arme est **élémentale** (Heat Blade, Twister Glaive, Sparkle Arrow, Shadow Cutter, Thunder Fist)

### Élément du character / Dragoon

| Character       | Élément Dragoon | Dragoon              |
| --------------- | --------------- | -------------------- |
| Dart            | Fire            | Red-Eye Dragon       |
| Lavitz / Albert | Wind            | Jade Dragon          |
| Shana / Miranda | Light           | White-Silver Dragon  |
| Rose            | Darkness        | Darkness Dragon      |
| Haschel         | Thunder         | Violet Dragon        |
| Meru            | Water           | Blue-Sea Dragon      |
| Kongol          | Earth           | Gold / Golden Dragon |

> **Note** : Kongol et Meru n'ont **pas d'arme élémentale dédiée** (les 5 autres en ont une, table dans le doc fandom).

### Element des enemies

Chaque enemy a un élément. Le listing complet (~140 enemies par éléments) est dans [`_sources/fandom-tlod-elements.md`](./_sources/fandom-tlod-elements.md).

**Pour les mobs déjà présents dans Damia** (`src/data/balance.ts`) :

| Mob (Damia)    | Élément canon                 |
| -------------- | ----------------------------- |
| Berserk Mouse  | Darkness                      |
| Goblin         | Fire                          |
| Assassin Cock  | Wind                          |
| Trent          | Earth                         |
| Fruegel (boss) | ❓ à vérifier — boss-specific |

### Element Dimensions (Special Battle Command)

Mécanique canon PS1 : la commande **"Special"** en combat permet l'enchaînement suivant — **les 3 membres actifs du party se transforment simultanément en Dragoon**. L'**initiateur de la transformation crée une Element Dimension** correspondant à **son** élément, qui :

- Renforce les dégâts des attaques élémentales matchant le field
- Réduit les dégâts élémentaux reçus (à confirmer en termes de quel élément + combien)

**Effets damage canon (sources)** :

| Effet                                           | Source             | Statut         |
| ----------------------------------------------- | ------------------ | -------------- |
| Dragoon Magic et Additions **×2 damage**        | Fandom 🥉          | À confirmer 🥇 |
| Dragoon Additions **auto-complétées (perfect)** | Fandom 🥉          | À confirmer 🥇 |
| **Diminution dégâts reçus** (% inconnu)         | User (mémoire PS1) | À confirmer 🥇 |
| Visual : terrain coloré de l'élément initiateur | Fandom 🥉 + user   | ✅             |

> ⚠️ Les pourcentages exacts (×2 damage, % défense) viennent du fandom (🥉) et de la mémoire user — à valider avec une source tier 1 (Discord ou legendofdragoon.org). Cf. [`TODO.md`](../../TODO.md).

**Visuel uniquement** : Level 5 Dragoon Magic invoque aussi l'Element Dimension le temps de l'animation, **sans bonus damage** (fandom 🥉).

## Vision Damia

### À court terme

Le système élémental n'est **pas câblé** côté code aujourd'hui. Pas d'élément sur les entités, modifiers `Field` et `Element` muets.

Avant câblage, décisions à prendre :

1. **Data-model "element"** côté entité — où ?
   - Champ optionnel sur `Stats` (`element?: Element`) ?
   - Composant dédié `Elemental` ?
   - Sur `Character.avatar.archetype` (déjà existant pour les Dragoons) + un nouveau pour les mobs ?
2. **Source de l'élément de l'attaque** — selon le type d'attaque :
   - Archer Attack physique → arme équipée (élémentale ou non)
   - Addition → ?
   - Dragoon Archer / Addition → élément du Dragoon
   - Dragoon Magic → élément du sort (généralement = élément du Dragoon)
   - Item Magic → BID + élément de l'item
   - Enemy → élément de l'enemy
3. **Field (Special Battle Command)** — quoi en Damia ?
   - On n'a pas de "Battle Command" en real-time
   - Option A : skip totalement (Field modifier inactif en permanence)
   - Option B : Dragoon form = auto-Field correspondant à l'élément (cohérent canon level 5 Dragoon Magic + transformation visual)
   - Option C : Special skill / item à activer manuellement
4. **Élémentaire weapons** — Heat Blade etc. → quand on traitera l'équipement, ces armes auront un flag `element`

### Mode Classic vs Modern (Survival)

- **Classic** : respect strict — 8 éléments, relations canon, Field/Element comme Wulves
- **Modern** : potentielles modifications (e.g. crit vs même élément, nouveaux éléments hybrides, etc.) — à voir lors du design Survival Modern (cf. [SCOPE §7.2](../../SCOPE.md))

## Décisions & rationale

| Décision                                                                              | Pourquoi                                                                                                 |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Suivre les nombres **Wulves** (×0.5 / ×1.5 / ×1) plutôt que la perception fandom (×2) | Testing formel > description narrative. La perception ×2 vient probablement de Field + Element combinés. |
| Documenter le canon **avant** de câbler le code                                       | Évite de bricoler un système qui devra être refait. Le data-model attend décision design.                |
| Non-Elemental traité comme **8ᵉ élément à part**, pas une absence                     | Canon : il a des règles spécifiques (×2 vs tous, pas de résistance), donc un type énuméré dédié.         |
| Kongol et Meru sans arme élémentale dédiée — assumé canon                             | Si on les laisse comme canon, ça implique qu'ils ne bénéficient pas de bonus élémental en physical.      |

## Spec technique (proposition)

Pas encore validée. À discuter au moment du câblage.

```ts
// Proposition data-model
export type Element =
  | 'fire'
  | 'water'
  | 'wind'
  | 'earth'
  | 'light'
  | 'darkness'
  | 'thunder'
  | 'non-elemental';

// Option champ sur Stats
interface Stats {
  // … champs existants
  element?: Element; // élément de l'entité (pour cible)
}

// Option : élément de l'attaque (au moment de l'attaque, pas persistant)
interface AttackContext {
  element?: Element; // élément de cette attaque spécifique (depuis arme / Dragoon / spell)
}

// Modifier wrapper étendu
function elementModifier(attackElem: Element, targetElem?: Element): number {
  if (!targetElem || !attackElem) return 1;
  if (areOpposites(attackElem, targetElem)) return 1.5; // Wulves
  if (attackElem === targetElem) return 0.5;
  return 1;
}

const OPPOSITES: Record<Element, Element | null> = {
  fire: 'water',
  water: 'fire',
  wind: 'earth',
  earth: 'wind',
  light: 'darkness',
  darkness: 'light',
  thunder: null,
  'non-elemental': null,
};

// Cas spécial Non-Elemental
function nonElementalModifier(attackElem: Element, targetElem?: Element): number {
  if (attackElem === 'non-elemental' && targetElem && targetElem !== 'non-elemental') {
    return 2; // ×2 vs tout
  }
  return 1;
}
```

## Liens code

Pas de code encore. Quand câblé, prévoir :

- `src/data/elements.ts` (enum + OPPOSITES + helpers)
- Champ `Stats.element` ou nouveau component `Elemental`
- Extension `damage.ts` `readModifiers` pour incorporer Element et Field
- Items : flag `element` sur weapons / spells

## Liens doc

- **Source canon (fandom)** : [`_sources/fandom-tlod-elements.md`](./_sources/fandom-tlod-elements.md)
- **Source canon (Wulves)** : [`_sources/wulves-tlod-damage-formulas.md`](./_sources/wulves-tlod-damage-formulas.md) (modifiers Field/Element)
- **Formule de base** : [`damage-formula.md`](./damage-formula.md)
- **Modifiers détaillés** : [`damage-modifiers.md`](./damage-modifiers.md) (à créer)
- **Armes élémentales** : `items/equipment.md` (à créer — `Heat Blade`, `Twister Glaive`, `Sparkle Arrow`, `Shadow Cutter`, `Thunder Fist`)
- **Dragoon par élément** : `dragoons/README.md` (déjà mappé dans la table characters)
- **Special Battle Command (Element Dimensions)** : à terme dans `dragoons/transformations.md`

## Questions ouvertes

- **Data-model element côté entité** — Stats.element ? component dédié ? À trancher avant câblage.
- **Special Battle Command (Field)** — porter ou skip ? Si oui, comment en real-time (Dragoon form = field auto ? skill séparé ?) ?
- **Resolution divergence fandom/Wulves** — confirmer que la valeur canon code est bien ×1.5 et que le ×2 fandom = combiné Field+Element. À tester en émulateur si doute.
- **Tagging des mobs custom Damia** (Fruegel etc.) — quel élément ? Probablement à choisir au cas par cas (Fruegel = Earth thématiquement ? boss-specific ?).
