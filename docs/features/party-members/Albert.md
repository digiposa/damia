# Albert

> Roi de Serdio — second porteur du Jade Dragoon Spirit (héritage de Lavitz).
>
> **Source canon** : 🥈 [`_sources/lod-wiki-albert.md`](./_sources/lod-wiki-albert.md)

## Statut

🟡 **draft** — données canon ingérées. Aucune impl character-spécifique (le character utilise probablement le même archetype Jade que Lavitz côté code).

## Profil

| Attribut           | Valeur                                                       |
| ------------------ | ------------------------------------------------------------ |
| Identité           | **King Albert** (roi de Serdio)                              |
| Âge                | 26                                                           |
| Taille             | 5'7" / 175 cm                                                |
| Espèce             | Humain                                                       |
| Élément            | **Wind** (cf. [`combat/elements.md`](../combat/elements.md)) |
| Archetype Dragoon  | **Jade Dragon** (hérité de Lavitz)                           |
| Voice Artist (PS1) | David Babich                                                 |

### Apparence

Tall, slender, **golden eyes**, hair pulled into a **loose ponytail**. Style noble / scholarly.

### Caractère

**Scholarly by nature**. Roi savant, contemplatif (vs Lavitz plus guerrier).

## Story / lore (canon)

- Rencontré pour la première fois à **[Bale](../locations/Bale.md)** (capitale du royaume de Basil, nord de Serdio) dans le throne room de **Indels Castle**.
- Hérite du **Jade Dragoon Spirit** à la mort de Lavitz (Disc 2).
- Acquisition canon = pattern `inherited_from_predecessor` — Albert récupère :
  - Le Dragoon Spirit Jade
  - L'**état complet d'apprentissage** de Lavitz : additions débloquées + niveau de chaque, stats AT/DF/MAT/MDF, XP cumulé, DLV
- En Damia mode Story : substitution canonique (cf. [SCOPE §7.1](../../SCOPE.md#71-mode-story--fidélité-maximale-tlod)).
- En Damia mode Survival : Albert et Lavitz sont des **skins du Jade Dragoon archetype** (cf. [README skins](./README.md#skins-survival-mode)).

> _Lore narratif détaillé — section "Story" du wiki LoD non développée ici, à compléter quand on traitera quests/cutscenes._

## Combat

### Stats par level (canon)

Joins party au level de Lavitz à sa mort (donc niveau dépend du progress du joueur).

**Constants** (ne montent pas avec le level, seulement via équipement) :

| Speed | A-Hit | M-Hit | A-AV | M-AV |
| ----- | ----- | ----- | ---- | ---- |
| 40    | 100%  | 100%  | 0    | 0    |

**Progression Lv 1-60** : table complète dans [`_sources/lod-wiki-albert.md`](./_sources/lod-wiki-albert.md#stats). Exemples clés :

| Level | HP   | AT  | DF  | MAT | MDF |
| ----- | ---- | --- | --- | --- | --- |
| 1     | 35   | 3   | 4   | 2   | 2   |
| 10    | 330  | 34  | 31  | 14  | 10  |
| 20    | 1184 | 71  | 64  | 30  | 20  |
| 30    | 2384 | 108 | 97  | 48  | 45  |
| 40    | 3686 | 146 | 131 | 66  | 58  |
| 50    | 6381 | 183 | 164 | 86  | 85  |
| 60    | 8250 | 225 | 199 | 108 | 97  |

XP cumulé pour level 60 = **387,730**.

### Additions (Jade Dragon)

Identiques à Lavitz (archetype partagé). Détail dans [`combat/additions.md`](../combat/additions.md).

| Addition           | Inputs | Dmg% (Maxed) | SP (Maxed) | Acquisition                 |
| ------------------ | ------ | ------------ | ---------- | --------------------------- |
| Harpoon            | 1      | 150%         | 50         | Initial                     |
| Spinning Cane      | 2      | 200%         | 35         | Level 5                     |
| Rod Typhoon        | 4      | 202%         | 100        | Level 7                     |
| Gust of Wind Dance | 6      | 350%         | 35         | Level 11                    |
| Flower Storm       | 7      | 405%         | 202        | Maîtriser toutes les autres |

> **Trivia voice canon** : pour l'addition **Flower Storm** (texte affiché), Albert dit **"Blossom Storm"** vocalement, tandis que Lavitz dit **"Rose Storm"**. Différence de voice line uniquement, mêmes mécaniques. → Damia : si on veut respecter ce détail, mapper voice clip distinct par avatar.

## Dragoon Form — Jade Dragon

### DLV thresholds & multipliers (canon)

| DLV | SP lifetime (cumul threshold) | AT bonus | DF bonus | MAT bonus | MDF bonus |
| --- | ----------------------------- | -------- | -------- | --------- | --------- |
| 1   | -                             | 150%     | 200%     | 200%      | 200%      |
| 2   | 1,000                         | 155%     | 210%     | 205%      | 210%      |
| 3   | 6,000                         | 160%     | 220%     | 210%      | 220%      |
| 4   | 12,000                        | 165%     | 230%     | 215%      | 230%      |
| 5   | 20,000                        | 170%     | 250%     | 220%      | 250%      |

> Multipliers appliqués aux stats character **uniquement en form Dragoon** (transformés). Cohérent avec [VISION §6.2](../../VISION.md#62-dlv-dragoon-level--progression) — DLV progresse via SP lifetime cumulé.

### Sorts Dragoon Magic — Jade Dragon

| Spell        | Multiplier | Target       | Coût MP | DLV unlock  | Effet                                                  |
| ------------ | ---------- | ------------ | ------- | ----------- | ------------------------------------------------------ |
| Wing Blaster | 100        | All Enemies  | 20      | 1 (initial) | **Wind** magic damage                                  |
| Rose Storm   | —          | All Allies   | 20      | 2           | **Power Up** modifier sur allies (cf. note ci-dessous) |
| Gaspless     | 300        | Single Enemy | 30      | 3           | **Wind** magic damage                                  |
| Jade Dragon  | 300        | All Enemies  | 80      | 5           | **Wind** magic damage                                  |

> **Note Rose Storm** — important pour l'archi modifier : Rose Storm **active le Power Up modifier sur les party members**. Conséquences canon :
>
> - Item Power Up et Rose Storm **ne stack pas** (même variable)
> - Attaques qui **ignorent Power** dans leur formule (Rare Monster Rare Attack, Ghost Commander Haunting Bolt) **ignorent aussi Rose Storm**
> - Persiste pendant **3 tours** (canon turn-based — à adapter en RT Damia)
> - Persiste même à HP=0, donc reste actif si l'allié est ressuscité
>
> → Implication code Damia : le **Power modifier** doit être un état per-entity, pas global. Cohérent avec le wrapper de modifiers documenté dans [`combat/damage-formula.md`](../combat/damage-formula.md). Tracé dans [`TODO.md`](../../TODO.md).

### Arme élémentale

**Twister Glaive** (Wind) — partagée Lavitz/Albert (cf. [`combat/elements.md`](../combat/elements.md#armes-élémentales-physical)).

## Vision Damia

### Story mode

- Substitution **canon** Lavitz → Albert (héritage complet état apprentissage). Pattern `inherited_from_predecessor`.
- Mêmes mécaniques que Lavitz (additions identiques, Dragoon Magic identiques, Twister Glaive shared).
- Voice line distincte (Blossom Storm) si on veut respecter le détail canon.

### Survival mode

- Albert = **skin** du Jade Dragon archetype, unlockable via méta-progression.
- Aucune divergence mécanique vs Lavitz (skin = changement visuel + voice line uniquement).
- Cf. [`README.md`](./README.md#skins-survival-mode).

### À implémenter / vérifier

- Pattern `Archetype + Avatar` côté code (cf. [VISION §6.6](../../VISION.md#66-personnages-partagés-skins)) — état actuel à vérifier (probablement partiellement en place via `DragoonArchetype` + `CharacterAvatar`).
- Transfert d'état Lavitz → Albert au death event (additions levels, stats, XP, DLV, MP) — à wirer.
- Voice line par avatar (distinct Blossom/Rose Storm).
- DLV thresholds + multipliers Jade Dragon → câbler dans data archetype (1k, 6k, 12k, 20k SP ; AT 150-170%, DF 200-250%, MAT 200-220%, MDF 200-250%).

## Liens code & doc

- **Source canon (wiki)** : [`_sources/lod-wiki-albert.md`](./_sources/lod-wiki-albert.md)
- **Additions Jade** : [`../combat/additions.md`](../combat/additions.md) (table Lavitz / Albert)
- **Élément Wind** : [`../combat/elements.md`](../combat/elements.md)
- **Mécaniques Dragoon partagées** : [`../dragoons/README.md`](../dragoons/README.md)
- **Damage modifier Power (Rose Storm)** : [`../combat/damage-formula.md`](../combat/damage-formula.md) et `damage-modifiers.md` (à créer)
- **Code archetype** : `src/data/characters/types.ts` (à vérifier) — `DragoonArchetype`, `CharacterAvatar`
- **Code balance** : `src/data/balance.ts` (stats curve, additions)

## Questions ouvertes

- **Confirmer "Lavitz=Albert exactly"** côté stats : la table Lavitz canon wiki doit être identique. À vérifier quand on ingère Lavitz page.
- **Rose Storm 3 turns** — comment porter en real-time Damia ? Timer (3 × N secondes ?) ou X attaques reçues ? À trancher au moment du status effects design.
- **Voice line par avatar** — décision design : on map des voice clips par avatar (Blossom/Rose Storm) ou on accepte une voice line unique par addition (simplification) ?
- **Transition Lavitz → Albert** mode Story : moment exact dans la trame, cutscene, état préservé/transféré. À couvrir avec quests/lore docs.
