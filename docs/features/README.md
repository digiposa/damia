# Features — documentation fonctionnelle

Documentation par thématique de gameplay. Chaque feature couvre :

1. **Canon PS1** — comment ça marche dans _The Legend of Dragoon_ d'origine
2. **Vision Damia** — comment on l'implémente dans notre projet
3. **Décisions & rationale** — tradeoffs, alternatives écartées
4. **Spec technique** — event chains, flags, structures (quand pertinent)
5. **Liens code** — pointeurs vers `src/` une fois implémenté
6. **Questions ouvertes** — ce qui reste à trancher

## Catégories

| Catégorie                           | Statut      | Description                                        |
| ----------------------------------- | ----------- | -------------------------------------------------- |
| [`dragoons/`](./dragoons/README.md) | 🟡 en cours | Dragoons : obtention, transformation, stats, magic |
| `party-members/`                    | ⚪ planifié | Profils characters au-delà du Dragoon              |
| `bosses/`                           | ⚪ planifié | Encounters bosses (canon + adaptation Damia)       |
| `combat/`                           | ⚪ planifié | Additions, counter, guard, items                   |
| `magic-system/`                     | ⚪ planifié | Sorts non-Dragoon, MP, éléments                    |
| `items/`                            | ⚪ planifié | Équipement, consommables, key items                |
| `locations/`                        | ⚪ planifié | Donjons, villes, world map                         |
| `quests/`                           | ⚪ planifié | Story beats, side quests                           |

## Convention

- **Création paresseuse** : un fichier par aspect n'est créé qu'au moment où on traite l'aspect. Pas de fichiers vides.
- **Index par catégorie** : chaque sous-dossier a son propre `README.md` listant le statut détaillé.
- **Liens code** : ajoutés au fur et à mesure de l'implémentation, format `src/path/file.ts:line`.
