# Damage formula

> Formules de calcul des dégâts — port fidèle du canon TLoD PS1, étendu pour notre real-time iso.

## Statut

🟡 **draft** — implémenté en code, en attente de relecture user.

## Canon PS1

TLoD distingue **trois sources de dégâts**, chacune avec sa propre formule de base, suivie d'un **wrapper de modifiers** (Guard, Fear, Power, Field, Element, Destroyer Mace) appliqué à la fin.

### Formules de base

| Source                            | Formule (notation canon)                                                      |
| --------------------------------- | ----------------------------------------------------------------------------- |
| Physical — player (Archer Attack) | `round[AT × (LV + 5) × 5 / DF]`                                               |
| Physical — enemy                  | `floor[AT² × 5 / DF]`                                                         |
| Addition per-hit                  | `round[floor[floor[hitValue × Multiplier/100] × AT/100] × (LV + 5) × 5 / DF]` |
| Item Magic                        | `floor[(LV + 5) × MAT × 5 / MDF] × BID / 100`                                 |

Notations :

- `AT`, `DF`, `MAT`, `MDF` : Attack / Defense / Magic Attack / Magic Defense de l'attaquant et de la cible
- `LV` : niveau du **player** (les mobs n'ont pas de notion de level en canon)
- `round{x/y}` : arrondi entier canon TLoD = `floor[(x + y/2) / y]` pour `y > 0`
- `floor{}` : troncature entière standard
- `hitValue` : valeur per-hit de l'addition (e.g. Harpoon = 75 + 25)
- `Multiplier` : multiplicateur de l'addition au level courant (100-based : 100 = 1×, 135 = 1.35×)
- `BID` : BID Data de l'item magic (100-based : 150 = "Single Target Multi", 300 = "All Target Powerful")

### Wrapper de modifiers

Appliqué en cascade après la formule de base, **avec `floor` à chaque étape** (comportement canon, accumule la troncature) :

| Modifier           | Quand actif                                        | Multiplicateur           |
| ------------------ | -------------------------------------------------- | ------------------------ |
| **Target Fear**    | Cible sous statut Fear                             | × 2                      |
| **Attacker Fear**  | Attaquant sous statut Fear                         | × 0.5                    |
| **Power**          | Power items / chaînes Rose Storm                   | variable                 |
| **Field**          | Élément du field × élément de l'attaque            | variable (0.5 / 1 / 1.5) |
| **Element**        | Élément de la cible × élément de l'attaque         | variable (0.5 / 1 / 1.5) |
| **Guard**          | Cible en posture Guard                             | × 0.5                    |
| **Destroyer Mace** | Arme spécifique Haschel × HP cible (jaune / rouge) | × 1.5 / × 2              |

## Vision Damia

Implémentation fidèle dans `src/gameplay/damage.ts`. Trois points d'entrée (`computePhysicalDamage`, `computeAdditionDamage`, `computeMagicalItemDamage`) qui calculent la valeur brute via la formule canon, puis convergent vers un **wrapper de modifiers unifié** (`applyModifiers`).

Points clés :

- **Lecture des stats via helpers `effective*`** (`src/gameplay/stats.ts`) : `effectiveAtk(world, entityId)` retourne `Stats.atk × DragoonMultiplier.atk`. Le multiplier Dragoon est appliqué **au read-time** (pas persisté dans `Stats`), ce qui le rend robuste aux level-ups et upgrades pris mid-transformation (cf. [VISION §6.2](../../VISION.md#62-dlv-dragoon-level--progression)).
- **`LV` lu depuis le component `Progression`** (champ `level`). Default `1` pour toute entité sans `Progression` (mob, prop) — comportement canon (les mobs ont stats fixes, pas de courbe de level).
- **`tlodRound(num, div)` helper** : `floor((num + div/2) / div)` — reproduit la sémantique `round{}` du canon. Évite les edge cases de `Math.round` (qui fait du banker's rounding pour les .5).
- **Détection player vs enemy** pour la formule physique : `world.hasComponent(attackerId, 'Character')` — seuls les playables ont un `Character` component, donc bascule automatique sur la formule Archer Attack (player) ou la formule quadratique (enemy).
- **Dégât minimum plancher : `MIN_DAMAGE = 1`** appliqué en sortie de wrapper. Le canon TLoD peut produire 0 sur des ratios AT/DF extrêmes ; on plancher à 1 pour UX (un "0 dmg" floating number lit comme un hit cassé en temps réel).

## Décisions & rationale

| Décision                                                   | Pourquoi                                                                                                                   |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Plancher MIN_DAMAGE = 1 (vs canon 0 possible)              | UX temps réel : "0 dmg" affiché = ressenti hit broken                                                                      |
| Multiplier Dragoon read-time, pas persisté                 | Robuste aux level-ups / upgrades mid-transform (VISION §6.2)                                                               |
| Modifier wrapper unifié, 5 fields prêts mais non wirés     | Infrastructure pré-câblée pour status effects / éléments / équipements futurs — zéro refactor le jour où on les implémente |
| `LV = 1` pour mobs sans `Progression`                      | Canon : mobs n'ont pas de level. Cohérent avec stats fixes.                                                                |
| Sum addition per-hit ≠ canon "perfect addition" total à ±1 | Floor truncation accumule par hit. Assumé pour UX per-hit damage numbers (chaque hit affiche son nombre flottant).         |

## Spec technique

### API publique (`src/gameplay/damage.ts`)

```ts
computePhysicalDamage(world, attackerId, targetId): number
computeAdditionDamage(world, attackerId, targetId, hitValue, multiplier): number
computeMagicalItemDamage(world, casterId, targetId, bid): number
```

Toutes retournent l'entier final post-wrapper, clamp à `MIN_DAMAGE`.

### Constantes (`src/data/balance.ts`)

```ts
COMBAT = {
  defendingDamageMul: 0.5, // Guard modifier
  minDamage: 1, // Floor (UX)
};
```

### Modifiers actuellement wirés

| Modifier | Source d'activation                         | Valeur |
| -------- | ------------------------------------------- | ------ |
| `guard`  | `world.hasComponent(targetId, 'Defending')` | 0.5    |

Les 6 autres modifiers (`targetFear`, `attackerFear`, `power`, `field`, `element`, `destroyerMace`) ont leur slot dans `DamageModifiers` mais **aucun système ne les active actuellement**.

### Helper interne

```ts
tlodRound(num, div): number  // floor((num + div/2) / div), div > 0
```

## Liens code

- **Formules** : `src/gameplay/damage.ts` (entier — 168 lignes commentées)
- **Helpers effective\*** : `src/gameplay/stats.ts`
- **Constantes** : `src/data/balance.ts:3` (`COMBAT`), `src/data/balance.ts:26` (`PLAYER_BASE`)
- **Stats mobs** : `src/data/balance.ts:66` (`MOBS` — 5 kinds)
- **Component `Stats`** : `src/gameplay/components/Stats.ts`
- **Component `Progression`** : `src/gameplay/components/Progression.ts`

## Questions ouvertes

- **Wirer les modifiers infrastructure-ready** — Fear, Power, Field, Element, Destroyer Mace, etc. → 🟡 **doc d'abord, code après**. On documente leurs règles canon dans [`status-effects.md`](./status-effects.md) (à créer) + [`damage-modifiers.md`](./damage-modifiers.md) (à créer) ; l'implémentation suit quand la feature porteuse est traitée (status / éléments / équipement). Cette doc-ci (`damage-formula.md`) intégrera leur interaction au moment du wiring.
- **Mob spells / mob magic formula** — ⏳ user cherche la formule canon (TLoD n'a pas d'enemy magic formula explicite côté wiki standard ; à confirmer). Une fois trouvée → ajouter un 4ᵉ entry point `computeEnemyMagicalDamage` ou étendre l'existant.
- **Critical hits** — ✅ **tranché** : **pas de crits en canon TLoD**. Considérés comme **feature potentielle exclusive du Survival Modern** (cf. [SCOPE §7.2](../../SCOPE.md#72-mode-survival--fun-first)). À ré-évaluer quand on traitera spécifiquement le ruleset Modern.
- **Resistance par élément** — ⏳ user fournit la doc canon. Une fois reçue → wirer `element` modifier + définir le data-model côté entités (champ sur `Stats` ? component dédié `Elemental` ?). Doc dédiée : [`damage-modifiers.md`](./damage-modifiers.md) (à créer).

### Note transverse — interaction avec status effects

Les statuts canon TLoD (Fear, Poison, Stun, Sleep, etc.) doivent **passer par le wrapper de modifiers** existant quand on les wirera. Le slot `targetFear` / `attackerFear` est déjà prévu pour ça. Voir future [`status-effects.md`](./status-effects.md) — l'intégration dans la damage formula y sera spécifiée pour préserver la cohérence canon.
