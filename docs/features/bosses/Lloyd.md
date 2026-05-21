# Lloyd — Main antagonist canon Disc 1-4 (Wingly platinum-haired swordsman)

> **Main antagonist canon TLoD** : Wingly swordsman platinum-haired, **invincible** Disc 1 Hero Competition final (Phantom Swordsmanship, 6-strike combo, after-images), recurring antagonist Disc 2-4. **Lloyd long con canon** : Moon Mirror (Disc 3), Dragon Buster (canon weapon), saves Wink Evergreen Forest, Moon Object collection plot endgame.
>
> **Sources** :
>
> - 🥉 [`_sources/fandom-hero-competition.md`](./_sources/fandom-hero-competition.md) — fandom Hero Competition Final Round (stats + Phantom Swordsmanship + cryptic dialogue)
> - Cross-référer aussi : [`../locations/Evergreen Forest.md`](../locations/Evergreen Forest.md) Disc 4 Lloyd saves Wink + Dragon Buster Younger Bardel + Queen Theresa kidnap pour Moon Mirror plot

## Identity canon

- **Espèce** : Wingly (cohérent canon "Lloyd fellow Wingly" Bardel brothers Evergreen)
- **Appearance** : **Platinum-haired swordsman** + **black clothing swirly white designs**
- **Weapon** : Sword (canon **Dragon Buster** = Lloyd's signature weapon, Rose inherits Disc 4 final after Lloyd's defeat)
- **Combat skill** : **Phantom Swordsmanship** canon (after-images + 6-strike combo + invincible Disc 1)
- **Recurring antagonist** Disc 1-4 (main villain TLoD primary)

## Hero Competition Final Round canon (Disc 1)

### Stats canon (Hero Competition Final)

| Stat    | Value (US/EU)        | Value (JP) |
| ------- | -------------------- | ---------- |
| HP      | 6,000                | **8,500**  |
| AT      | 100                  | -          |
| DF      | 100                  | -          |
| MAT     | 79                   | -          |
| MDF     | 150                  | -          |
| SPD     | 65                   | -          |
| Element | none (Non-Elemental) | -          |

| EXP    | Gold | Drops |
| ------ | ---- | ----- |
| 12,000 | 300  | none  |

⚠️ **HP 6,000 Disc 1 = highest mob/boss Disc 1 canon** (vs Feyrbrand 480, Fire Bird 640). Pattern showcase boss "unbeatable" canon.

### Mécanique unwinnable canon ⚠️ MAJEUR

⚠️ **Lloyd Hero Competition Final = scripted defeat canon** :

- **Invincible canon** : easily evades Dart attacks
- **Magic items no effect canon**
- **Dart cannot win** = story scripted
- Final cinematic : Lloyd **counters with 3 quick slashes to chest** → Dart unable to keep fighting → scripted defeat

### Abilities canon

- **Single sword strike** : basic attack
- ⚠️ **6-strike combo "inhumanly fast"** canon (per Dart commentary)
- ⚠️ **After-images** canon : leaves multiple visual when attacking OR evading
- ⚠️ **Phantom Swordsmanship** canon name (signature technique)
- **Counter** : 3 quick slashes to chest (Dart's final attack triggers this)

### Dialogue canon Lloyd post-defeat Dart

> "**You haven't reached your limits. You will be stronger. You will have to be. You too. You'll become stronger.**"
> — Lloyd to Dart and Haschel

⚠️ Pattern lore canon : Lloyd recognize Dart + Haschel **future strength**, cryptic prophecy fate.

## Story arc Lloyd canon Disc 1-4

### Disc 1 — Hero Competition Lohan (1st place)

- Defeats Haschel semi-finals + Dart final
- **Title canon** : "**toughest and strongest man in all of Endiness**"
- Cryptic dialogue + leaves
- Introduction main antagonist canon

### Disc 2-3 — Long con canon (Tiberoa + Mille Seseau)

- ⚠️ Lloyd "long con" pattern canon (cf. Donau Disc 2 / Evergreen Forest Disc 3-4)
- Disc 3 Evergreen Forest : **Lloyd saves Wink** (Sacred Sister) from Younger Bardel
  - Uses **Dragon Buster** vs Younger Bardel canon
  - Younger Bardel self-destruct → Lloyd lightly injured
  - Wink gives him trust → Lloyd **kidnaps Queen Theresa** Deningrad
- Goal canon : **Moon Mirror** (Divine Moon Object Mille Seseau)
- Pattern : Lloyd collects Moon Objects across Tesfer Realm

### Disc 4 — Final confrontation canon

- Lloyd defeated by Dart canon (probable Moon endgame)
- **Dragon Buster** transitions à Rose après défaite Lloyd (cohérent equipment.md "Story: Moon")
- À documenter détaillé `bosses/Lloyd-final.md` (à créer future si stats Disc 4 disponibles)

## Combat strategy Hero Competition Final canon

⚠️ **Aucune** — combat unwinnable canon. Story scripted defeat.

- Magic items no effect canon
- Physical attacks evaded canon
- Pattern : player tries → Lloyd counter → fight ends → cinematic

⚠️ **Glitch canon** : Save-over glitch transform Dart Dragoon form Final = **soft-lock when Lloyd counterattack**. Pattern retail bug canon.

## Vision Damia (implémentation)

### Décisions canon à conserver

1. **Lloyd = main antagonist canon TLoD** : presence Disc 1-4
2. **Hero Competition Final unwinnable** : scripted defeat + cryptic dialogue
3. **Phantom Swordsmanship + after-images + 6-strike combo** : visual canon
4. **Dragon Buster Lloyd's signature** → Rose inherits Disc 4
5. **Long con pattern canon** : Lloyd manipulates story Disc 2-4 (Wink trust → Queen Theresa kidnap → Moon Mirror)
6. **HP 6000 Disc 1 / 8500 JP** : highest mob/boss Disc 1
7. **Cryptic dialogue "You'll become stronger"** : preserve canon prophetic

### Implementation tech

- Data-model `BossFight { unwinnable: boolean, scriptedDefeat: { cinematic: string, dialogueAfter: string } }`
- Lloyd has multiple encounters Disc 2-4 (separate boss configs canon)

### Questions ouvertes

- **Lloyd Wingly canon confirmed** ? Bardel "fellow Wingly" Evergreen Forest implique oui canon
- **Dragon Buster Lloyd's exact original ownership** : Wingly artifact ? Or self-crafted ?
- **Moon Objects 3 canon** : Moon Mirror (Mille Seseau) + Moon Dagger (Tiberoa) + Moon Gem (Serdio probable) ?

## Liens transverses

- [`../quests/disc1-hero-competition.md`](../quests/disc1-hero-competition.md) — tournament Disc 1 introduction
- [`../locations/Evergreen Forest.md`](../locations/Evergreen Forest.md) — Disc 3 Lloyd saves Wink + Dragon Buster + Bardel brothers
- [`../locations/Donau.md`](../locations/Donau.md) — Disc 2 Lloyd-Wink-Lynn long con
- [`../items/equipment.md`](../items/equipment.md) — **Dragon Buster** weapon (Rose +100 AT, "Story: Moon" canon)
- [`../party-members/Rose.md`](../party-members/Rose.md) (à créer) — inherits Dragon Buster post-Lloyd defeat Disc 4
- [`../npcs/Younger Bardel.md`](../npcs/Younger Bardel.md) (à créer) — fellow Wingly subordinate
- [`../npcs/Wink.md`](../npcs/Wink.md) (à créer) — Sacred Sister Mille Seseau Disc 3 saved by Lloyd
- [`../npcs/Queen Theresa.md`](../npcs/Queen Theresa.md) (à créer) — Mille Seseau queen kidnapped Disc 3
