# Party Members

> Profils des **characters jouables** de Damia — au-delà de leur aspect Dragoon (mécanique partagée par archetype documentée dans [`../dragoons/`](../dragoons/)).
>
> Chaque fichier character couvre : lore narratif, apparence, stats canon par level, équipement, particularités gameplay.

## Statut par character

Ordre alphabétique. Acquisition narrative (Story) vs unlock méta-progression (Survival) — cf. [SCOPE §7](../../SCOPE.md#7-modes-de-jeu).

| Character  | Élément  | Archetype Dragoon   | Disc rejoint (Story)   | Statut profil |
| ---------- | -------- | ------------------- | ---------------------- | ------------- |
| **Albert** | Wind     | Jade Dragon         | Disc 2 (hérite Lavitz) | 🟡 draft      |
| Dart       | Fire     | Red-Eye Dragon      | Disc 1                 | ⚪ à spec     |
| Haschel    | Thunder  | Violet Dragon       | Disc 1/2               | ⚪ à spec     |
| Kongol     | Earth    | Gold Dragon         | Disc 2                 | ⚪ à spec     |
| Lavitz     | Wind     | Jade Dragon         | Disc 1                 | ⚪ à spec     |
| Meru       | Water    | Blue-Sea Dragon     | Disc 2                 | ⚪ à spec     |
| Miranda    | Light    | White-Silver Dragon | Disc 3 (hérite Shana)  | ⚪ à spec     |
| Rose       | Darkness | Darkness Dragon     | Disc 1 (Hoax)          | ⚪ à spec     |
| Shana      | Light    | White-Silver Dragon | Disc 1                 | ⚪ à spec     |

Légende : ⚪ à spec — 🟡 draft — 🟢 validé — 🔵 implémenté

## Skins (Survival mode)

En mode Survival, les avatars hors canon principal deviennent **skins de l'archetype** (méta-progression). Liste (à compléter au fil) :

| Skin           | Archetype partagé   | Origine canon          |
| -------------- | ------------------- | ---------------------- |
| Greham         | Jade Dragon         | Boss Story disc 1      |
| Syuveil        | Jade Dragon         | Lore (Dragon Campaign) |
| Shirley        | White-Silver Dragon | Lore (Dragon Campaign) |
| Damia          | Blue-Sea Dragon     | Lore (Dragon Campaign) |
| _(autres TBD)_ | —                   | —                      |

> Détails archetype `Archetype + Avatar` → [VISION §6.6](../../VISION.md#66-personnages-partagés-skins) et [`../dragoons/README.md`](../dragoons/README.md).

## Convention par fichier character

Chaque fichier suit :

```markdown
# {Character}

## Profil

{age, height, élément, voix, apparence physique}

## Story / lore

{trame narrative TLoD, motivations, arc de progression}

## Combat

### Stats par level

### Additions (lien vers combat/additions.md)

### Arme & équipement

## Dragoon Form

{archetype, DLV thresholds, multipliers, spells}

## Vision Damia

{adaptations, particularités impl}

## Liens code & doc

{src/...}

## Questions ouvertes
```

## Liens transverses

- [`combat/`](../combat/) — additions, formules, AI mob
- [`dragoons/`](../dragoons/) — mécaniques Dragoon partagées par archetype
- [`items/`](../items/) (à venir) — équipement, armes élémentales
- [`bosses/`](../bosses/) (à venir) — bosses qui sont des skins potentiels (Greham, etc.)
