# Equipment — système 5 slots canon

> **Master reference équipement TLoD** : 5 slots, restrictions character/genre, stats, effets spéciaux.
>
> **Sources** :
>
> - 🥈 [`_sources/lod-wiki-equipment.md`](./_sources/lod-wiki-equipment.md) — wiki LoD (tables complètes weapons/headwear/body armor/footwear/accessories + acquisition)

## Statut

🟡 **Draft post-ingestion wiki LoD** — fandom à ingérer pour cross-check, Discord cadors restant à consulter pour formules exactes (gain stats par level, etc.). Décisions Damia à trancher.

## 1. Système canon (récap haut niveau)

### Slots (5 par membre, jamais changeable en combat)

| Slot       | Stat principal | Restriction principale                 |
| ---------- | -------------- | -------------------------------------- |
| Weapon     | AT             | **100% character-locked**              |
| Headwear   | MAT            | Men / Women / character-specific / All |
| Body Armor | DF + MDF       | Men / Women / character-specific / All |
| Footwear   | DF / SPD       | Men / Women / All                      |
| Accessory  | varie          | Majoritairement All + 4 restricted     |

### Inventaire

- **255 items max** total all categories combined canon
- Tri / discard depuis Inventory option System Screen
- Equip uniquement depuis Equipment option (pas Inventory)

## 2. Weapons — character-locked

### Tables récap (sans détails déjà dans source)

7 wielders canon, 6-8 weapons chacun, **chaque ligne sword/spear/bow/dagger/fist/hammer/axe**.

**Ranges AT canon** :

| Wielder           | AT initial → final                        | Notes                                                                         |
| ----------------- | ----------------------------------------- | ----------------------------------------------------------------------------- |
| **Dart**          | +2 (Broad) → +75 (Soul Eater)             | Soul Eater = unique trade-off (10% max HP self/turn)                          |
| **Lavitz/Albert** | +4 (Spear) → +65 (Halberd)                | Halberd drop 50% Lavitz's Spirit Disc 2 Phantom Ship                          |
| **Shana/Miranda** | +3 (Short Bow) → +50 (Detonate Arrow)     | **A-HIT bonus** +20/+30 systématique + 1 bow AoE all enemies (Detonate Arrow) |
| **Rose**          | +13 (Rapier) → +100 (Dragon Buster)       | Dragon Buster = story reward Moon, +100 AT massif                             |
| **Haschel**       | +20 (Iron Knuckle) → +55 (Destroyer Mace) | Destroyer Mace scaling HP ≤50% (×1.5) / ≤25% (×2)                             |
| **Meru**          | +15 (Mace) → +40 (Basher)                 | Pretty Hammer = +15 AT mais +50% SP (Last Kraken drop)                        |
| **Kongol**        | +45 (Axe) → +88 (Indora's Axe)            | Range AT plus haut canon (initial déjà +45)                                   |

### Patterns d'effets spéciaux weapons canon

| Pattern                                       | Weapons                                                                                                                                                                                                                                                                                                                                    |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Elemental physical (Additions)**            | Heat Blade (Fire/Dart), Twister Glaive (Wind/Lavitz-Albert), Shadow Cutter (Dark/Rose), Thunder Fist (Thunder/Haschel)                                                                                                                                                                                                                     |
| **Elemental physical (Attacks)** ⚠️ exception | Sparkle Arrow (Light/Shana-Miranda) — **"Attacks deal Light"** vs autres "Additions deal"                                                                                                                                                                                                                                                  |
| **SP gain +50% on Additions**                 | Fairy Sword (Dart), Arrow of Force (Shana/Miranda), Pretty Hammer (Meru)                                                                                                                                                                                                                                                                   |
| **Status proc % chance**                      | Mind Crush (Confusion 20%), Spear of Terror (Fear 20%), Bemusing Arrow (Confusion 20%), Virulent Arrow (Poison 20%), Beast Fang (Stun 20%), Brass Knuckle (Instant Death 10%), Flamberge (Stun 10%), Gladius (Instant Death 10%), Heavy Mace (Stun 20%), Indora's Axe (Instant Death 10%), Great Axe (Stun 20%), Demon Stiletto (Fear 20%) |
| **AoE physical all enemies**                  | Detonate Arrow (Shana/Miranda) — **unique** weapon AoE phys                                                                                                                                                                                                                                                                                |
| **HP scaling damage**                         | Destroyer Mace (Haschel) ×1.5 ≤50% HP / ×2 ≤25% HP                                                                                                                                                                                                                                                                                         |
| **Self-damage trade-off**                     | Soul Eater (Dart) -10% max HP/turn pour +75 AT                                                                                                                                                                                                                                                                                             |

⚠️ Note canon Thunder Fist : "Although the Thunder element has no opposite, the Thunder Fist can still apply bonus damage to Haschel's D-attack when he initiates Special." → confirmes **Thunder = standalone element sans pair opposite** mais **interaction Special command bonus damage** existe quand même.

⚠️ Divergence canon Sparkle Arrow : seul weapon "Light" canon disant "Attacks deal" plutôt que "Additions deal" → **possible Light proc même sur attaque normale Shana (qui n'a pas d'Addition canon)** car Shana attaque par physical arrow auto sans system Addition. À vérifier sur fandom + Discord.

## 3. Headwear — split Men/Women + character + All

### Patterns

| Pattern                                        | Headwear                                                                                                                                              |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **+20 SP on magical damage** (pattern utility) | Knight Helm, Giganto Helm, Jeweled Crown, Soul Headband                                                                                               |
| **Defensive halo "All"**                       | Dragon Helm (+50% max HP), Magical Hat (+50% max MP), Phoenix Plume (prevents 4 mental ailments), Legend Casque (halves magic damage + huge MDF +127) |
| **Status prevention**                          | Phoenix Plume (Fear+Bewitchment+Confusion+Dispiriting), Rose's Hairband (Instant Death exclusive Rose)                                                |
| **Character-locked headwear**                  | Soul Headband (Haschel), Giganto Helm (Kongol), Rose's Hairband (Rose)                                                                                |
| **Restricted to Dragoon "magic-type"**         | Jeweled Crown (Shana, Miranda, Meru) — pattern caster Women                                                                                           |

⚠️ **Legend Casque** = item 10,000G top-tier "All" — halves magic damage + +127 MDF + +50 MAT + +50 M-AV.

## 4. Body Armor — DF + MDF principal + élémental DG armors

### 7 Dragoon (DG) armors elemental immunity canon

| DG Armor        | Element immunity (reduces to **0**) | Equipped by    | Cost shop                       |
| --------------- | ----------------------------------- | -------------- | ------------------------------- |
| Red DG Armor    | **Fire**                            | Dart           | 800G Zenebatos + Moon           |
| Jade DG Armor   | **Wind**                            | Lavitz, Albert | 800G Zenebatos + Moon           |
| Silver DG Armor | **Light**                           | Shana, Miranda | 800G Moon / Sparkle Divine Tree |
| Dark DG Armor   | **Darkness**                        | Rose           | 800G Zenebatos + Moon           |
| Blue DG Armor   | **Water**                           | Meru           | 800G Zenebatos + Moon           |
| Violet DG Armor | **Thunder**                         | Haschel        | 800G Moon                       |
| Gold DG Armor   | **Earth**                           | Kongol         | 800G Moon / Chest Moon          |

→ Pattern canon : chaque Dragoon a son armor counter-élément attendu (Red=Fire, Jade=Wind, etc.). Cohérent avec [`combat/elements.md`](../combat/elements.md) 8 éléments + dragoon assignments.

**Note** : 1 DG armor par membre Dragoon → **7 armures** mais **Albert récupère Jade DG de Lavitz** (Lavitz mort Disc 1 → Albert hérite Wind Dragoon spirit + DG armor) → 7 slots pour 8 membres car Lavitz+Albert partagent.

### Patterns body armor

| Pattern                                            | Body armor                                                                           |
| -------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **+20 SP on physical damage**                      | Sparkle Dress, Master's Vest, Giganto Armor, Saint Armor                             |
| **+20 SP on magical damage**                       | Robe (Women)                                                                         |
| **SP gain +50% on Additions**                      | Energy Girdle (Haschel)                                                              |
| **Prevents Poison/Stun/Arm-Blocking** (3 ailments) | Armor of Yore (Men+Kongol), Satori Vest (Haschel), Rainbow Dress (Women)             |
| **Revive on death 40% half HP**                    | Angel Robe (Women only)                                                              |
| **Halves physical damage**                         | Armor of Legend (All, 10,000G top-tier)                                              |
| **Kongol-exclusive**                               | Lion Fur (initial +46/+20), Giganto Helm, Giganto Armor, Breast Plate, Gold DG Armor |

⚠️ **Angel Robe stacks additivement avec Holy Ahnk** → 40% + 40% = **80% revive chance half HP**.

## 5. Footwear — minor stats only (pas d'effets)

Footwear canon n'a **JAMAIS** d'effets spéciaux, juste DF/SPD/A-AV/M-AV stat boosts.

| Pattern                | Footwear                                           |
| ---------------------- | -------------------------------------------------- |
| **+20 SPD pure speed** | Dancer's Shoes (Women), Bandit's Shoes (Men)       |
| **+10 SPD + utility**  | Magical Greaves (All, +10 SPD + +5 A-AV + +5 M-AV) |

→ Footwear = slot **secondary**, choix souvent stat dominant + un peu de variété SPD vs DF.

## 6. Accessories — slot le plus varié

### Patterns canon

| Pattern                              | Accessory                                                                                                                                                                                                                                                                            |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Status ailment prevention single** | Poison Guard (Poison), Active Ring (Dispiriting), Panic Guard (Confusion), Stun Guard (Stun), Bravery Amulet (Fear), Magic Ego Bell (Bewitchment), Protector (Arm-Blocking), Talisman (Instant Death), Destone Amulet (Petrification)                                                |
| **Status ailment prevention ALL**    | **Rainbow Earring** ⚠️ Martel 40 Stardust — prevents ALL ailments                                                                                                                                                                                                                    |
| **Elemental magic damage -50%**      | Red-Eye Stone (Fire), Silver Stone (Light), Darkness Stone, Jade Stone (Wind), Blue Sea Stone (Water), Violet Stone (Thunder), Golden Stone (Earth) — **7 stones canon** = 1 par élément non-Light non-Dark + Light/Dark (pas Non-Elemental)                                         |
| **Auto Additions**                   | Wargod Calling (auto mais dmg/SP halved + no Addition level-up), Ultimate Wargod (auto full power)                                                                                                                                                                                   |
| **HP/MP regen/turn**                 | Therapy Ring (+10% HP/turn), Mage Ring (+10% MP/turn)                                                                                                                                                                                                                                |
| **SP regen/turn**                    | Spirit Ring (+20 SP/turn)                                                                                                                                                                                                                                                            |
| **MP restore on damage**             | Sapphire Pin (+10% MP on mag dmg), Platinum Collar (+10% MP on phys dmg)                                                                                                                                                                                                             |
| **SP on damage**                     | Ruby Ring (+20 SP mag dmg), Emerald Ring (+20 SP phys dmg)                                                                                                                                                                                                                           |
| **Revive on death 40% half HP**      | Holy Ahnk / Holy Ankh ⚠️ orthographe divergente same page                                                                                                                                                                                                                            |
| **Damage reduction global**          | Phantom Shield (-50% all damage 10,000G Lohan + Faust drop), Dragon Shield (-50% phys), Angel Scarf (-50% magic)                                                                                                                                                                     |
| **Stat boost pure**                  | Power Wrist (+10 AT), Knight Shield (+10 DF), Attack Badge (+20 AT + +20 MAT), Magical Ring (+30 MAT), Spiritual Ring (+30 MDF), Guard Badge (+20 DF + +20 MDF), Giganto Ring (+20 AT + +20 DF), Sage's Cloak (+20 A-AV + +20 M-AV), Spirit Cloak (+20 M-AV), Elude Cloak (+20 A-AV) |
| **Speed boost**                      | Bandit's Ring (Men +20 SPD), Dancer's Ring (Women +20 SPD)                                                                                                                                                                                                                           |
| **Initial empty slot**               | Bracelet — all members initial equip, 0 stats                                                                                                                                                                                                                                        |

### 7 elemental damage reduction stones drop pattern canon ⚠️ IMPORTANT

Tous **drop 100% des bosses Dragoon** (boss originaux Dragon Campaign 11k ans pre-game) :

| Stone              | Element  | Drop 100% from                                       |
| ------------------ | -------- | ---------------------------------------------------- |
| **Silver Stone**   | Light    | **Shirley**                                          |
| **Jade Stone**     | Wind     | **Syuveil**                                          |
| **Blue Sea Stone** | Water    | **Damia** ⭐ project namesake                        |
| **Violet Stone**   | Thunder  | **Kanzas**                                           |
| **Golden Stone**   | Earth    | **Belzac**                                           |
| **Darkness Stone** | Darkness | **Kamuy** (Black Monster form Rose) ? À vérifier     |
| **Red-Eye Stone**  | Fire     | **Fire Bird** (Dart Dragoon test bird?) ? À vérifier |

→ Pattern canon : **7 ancient Dragoons defeated → 7 elemental stones recovered** = **7 element resistance "endgame" recipes**. Cohérent design canon "post-Dragon Campaign legacy".

### Martel Stardust rewards (Disc 2-4 progression)

4 items debloqués via collecte des 50 Stardust totaux (mini-game progression canon) :

| Item            | Stardust cost | Effet                                  |
| --------------- | ------------- | -------------------------------------- |
| Physical Ring   | 10            | +50% max HP                            |
| Amulet          | 20            | +100% max MP                           |
| Wargod's Sash   | 30            | Additions award +50% more SP           |
| Rainbow Earring | 40            | Prevents ALL status ailments ⚠️ broken |

→ **Cumulé = 100 Stardust** (mais canon collect 50 max ?). À vérifier source canon.

## 7. Vision Damia (implémentation)

### Décisions immédiates (à valider)

1. **Conserver les 5 slots canon stricts** — pas d'ajout de slots (genre "second weapon", "shield slot") car ferait fragmenter le système canon.
2. **Conserver les restrictions character/genre** — fait partie de l'identité canon (genre Kongol n'a pas le DG Earth élément correspondant à un sword, etc.). Genre split mature à conserver pour respect canon (même si pratique gameplay limitante).
3. **Conserver les acquisition canon "story-locked"** — Halberd via Lavitz Spirit Phantom Ship Disc 2, Indora's Axe via Indora boss, etc. Donne sens narratif aux drops.
4. **Modulariser les effets** : structures de données distinctes pour
   - `stats: { AT, DF, MAT, MDF, A_HIT, M_HIT, A_AV, M_AV, SPD }`
   - `passives: { onTurnStart, onPhysicalDamageTaken, onMagicalDamageTaken, onDeath, statusPrevention[], elementalReduction{element: factor} }`
   - `weaponEffect: { type: 'addition_element' | 'attack_element' | 'addition_sp_bonus' | 'status_proc' | 'aoe_physical' | 'hp_scaling' | 'self_damage', payload }`

### Questions ouvertes pour décision

À ouvrir / valider plus tard via discussion :

- **Tradeoff Soul Eater** (10% HP/turn self-damage pour +75 AT) : conserver tel quel ou rééquilibrer ? Original quasi-unusable hors boss farming.
- **Detonate Arrow AoE** : seul AoE physique du jeu canon → unique au gameplay Shana/Miranda → conserver l'unicité.
- **Dragon Buster +100 AT** : weapon de fin de jeu Rose, donne reward bossfinal. Conserver.
- **Wargod Calling / Ultimate Wargod** auto-Additions : utility pour casual play. Conserver mais flagger comme "auto" pour analytics.
- **Mode Survival ports** : équipement canon transposable ? Cf. [SCOPE §7](../../SCOPE.md) Survival a-t-il les 5 slots ? Probablement allégé / random drops style roguelite.

### Spec technique provisoire

Voir [TODO.md](../../TODO.md) section Items pour items à designer en détail (formules, distribution shops par disc, etc.).

## 8. Liens transverses

- [`combat/additions.md`](../combat/additions.md) — Additions trigger elemental weapons + SP bonus weapons
- [`combat/elements.md`](../combat/elements.md) — 8 éléments + opposing pairs (sauf Thunder)
- [`combat/damage-formula.md`](../combat/damage-formula.md) — application AT/DF/MAT/MDF
- [`dragoons/mechanics.md`](../dragoons/mechanics.md) — D-attack interaction Thunder Fist Special
- [`bosses/Damia.md`](../bosses/Damia.md) — drops Blue Sea Stone 100%
- [`party-members/`](../party-members/) — character-locked weapons par membre
- [`locations/`](../locations/) — shops par ville (Bale/Lohan/Fletz/Furni/Deningrad/Kashua Glacier/Vellweb/Ulara/Zenebatos/Moon That Never Sets)

## 9. Gaps / TODO

Voir [`docs/TODO.md`](../../TODO.md) section Items.
