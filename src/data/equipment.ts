/**
 * Equipment registry — TLoD-canon weapons / helmets / armor / boots.
 * Source: the author's Dart weapon table + the equipment Fandom wiki
 * page (helmets, armor, boots). Rings (accessories) are pending and
 * will land in a follow-up when the data ships.
 *
 * Each definition holds its passive stat bonuses (ATK / DEF / MAT /
 * MDF / SPD / hit / avoid) plus an optional `effect` string that
 * names a non-stat mechanic to be implemented by the system that
 * owns it (elemental damage by `gameplay/damage.ts`, SP-gain
 * modifier by `gameplay/sp.ts`, status-on-hit by the future status
 * system, +Max HP / +Max MP by their gauge owners, etc.). Today only
 * the stat bonuses are wired; effects are noted so the data is
 * canon-complete and the behaviours can plug in incrementally.
 *
 * Bonuses are added on top of the archetype's per-level row at spawn
 * time and re-applied on every level-up (DeathSystem.awardXp) so the
 * row reset doesn't wipe them. Mirrors the Survival upgrade-reapply
 * pattern. Equipment swap (drops, shop, inventory UI) is a follow-up
 * — for now `CharacterAvatar.startingEquipment` is the only entry
 * point, and items declared here can be referenced from there.
 */
import type { ArchetypeId } from './characters/types';

export type EquipmentSlot = 'weapon' | 'helmet' | 'armor' | 'boots' | 'ring';

export interface EquipmentBonuses {
  atk?: number;
  def?: number;
  magicAtk?: number;
  magicDef?: number;
  /** TLoD SPD turn-order stat. Stored on `Stats.speed`; not used by
   *  the action-RPG move-speed (which lives on the `Speed` component
   *  in px/ms). Bonus from boots / accessories. */
  speed?: number;
  /** Physical hit rate %. Bonus from helmets like Sallet (+10). */
  attackHit?: number;
  /** Magical hit rate %. Bonus from helmets like Tiara (+10). */
  magicHit?: number;
  /** Physical avoidance %. Bonus from boots / late-game armor. */
  attackAvoid?: number;
  /** Magical avoidance %. Bonus from boots / late-game helmets
   *  (Legend Casque +50, Magical Greaves +5). */
  magicAvoid?: number;
}

export interface EquipmentDefinition {
  name: string;
  slot: EquipmentSlot;
  /** Archetypes allowed to equip this item. Undefined = universal
   *  (typical for late-game shared items). Weapons + most armor are
   *  class-locked in TLoD canon. */
  archetypes?: ReadonlyArray<ArchetypeId>;
  bonuses: EquipmentBonuses;
  /** Free-form note for non-stat mechanics. Owning system reads this
   *  when it ships. Examples: 'fire-elemental', 'confusion-on-hit',
   *  'sp-gain-x1.5', 'self-hp-drain-10pct-per-turn', '+50%-max-hp',
   *  'avoid-poison-stun-arm-blocking', 'nullify-fire'. */
  effect?: string;
  /** Shop price (Gold). Undefined = found-only / unbuyable. */
  price?: number;
}

// Archetype-set shorthands — keep individual item entries readable.
const MALE_REGULAR: ReadonlyArray<ArchetypeId> = [
  'redEyeDragoon', // Dart
  'jadeDragoon', // Lavitz / Albert
  'violetDragoon', // Haschel
  'goldenDragoon', // Kongol
];
const FEMALE_REGULAR: ReadonlyArray<ArchetypeId> = [
  'whiteSilverDragoon', // Shana / Miranda
  'darkBurstDragoon', // Rose
  'blueSeaDragoon', // Meru
];
/** "Male except Haschel" — Knight Helm restriction. */
const MALE_NO_HASCHEL: ReadonlyArray<ArchetypeId> = [
  'redEyeDragoon',
  'jadeDragoon',
  'goldenDragoon',
];
/** Dart + Lavitz/Albert share the male regular armor line. */
const DART_AND_JADE: ReadonlyArray<ArchetypeId> = ['redEyeDragoon', 'jadeDragoon'];
/** Female "non-Rose" — Jeweled Crown restriction. */
const FEMALE_NO_ROSE: ReadonlyArray<ArchetypeId> = ['whiteSilverDragoon', 'blueSeaDragoon'];
/** Female Leather Jacket: Shana/Miranda or Rose only (Meru excluded). */
const FEMALE_NO_MERU: ReadonlyArray<ArchetypeId> = ['whiteSilverDragoon', 'darkBurstDragoon'];
/** Female Angel Robe: Shana/Miranda or Meru only (Rose excluded). */
const FEMALE_NO_ROSE_2: ReadonlyArray<ArchetypeId> = ['whiteSilverDragoon', 'blueSeaDragoon'];

export const EQUIPMENT = {
  // ====================================================================
  // WEAPONS
  // ====================================================================

  // --- Dart (Red-Eye Dragoon) — two-handed swords -------------------------
  broadSword: {
    name: 'Broad Sword',
    slot: 'weapon',
    archetypes: ['redEyeDragoon'],
    bonuses: { atk: 2 },
  },
  bastardSword: {
    name: 'Bastard Sword',
    slot: 'weapon',
    archetypes: ['redEyeDragoon'],
    bonuses: { atk: 7 },
    price: 60,
  },
  heatBlade: {
    name: 'Heat Blade',
    slot: 'weapon',
    archetypes: ['redEyeDragoon'],
    bonuses: { atk: 18 },
    effect: 'fire-elemental',
    price: 150,
  },
  falchion: {
    name: 'Falchion',
    slot: 'weapon',
    archetypes: ['redEyeDragoon'],
    bonuses: { atk: 26 },
    price: 250,
  },
  mindCrush: {
    name: 'Mind Crush',
    slot: 'weapon',
    archetypes: ['redEyeDragoon'],
    bonuses: { atk: 34 },
    effect: 'confusion-on-hit',
    price: 350,
  },
  fairySword: {
    name: 'Fairy Sword',
    slot: 'weapon',
    archetypes: ['redEyeDragoon'],
    bonuses: { atk: 39 },
    effect: 'sp-gain-x1.5',
    price: 400,
  },
  claymore: {
    name: 'Claymore',
    slot: 'weapon',
    archetypes: ['redEyeDragoon'],
    bonuses: { atk: 44 },
    price: 500,
  },
  soulEater: {
    name: 'Soul Eater',
    slot: 'weapon',
    archetypes: ['redEyeDragoon'],
    bonuses: { atk: 75 },
    effect: 'self-hp-drain-10pct-per-turn',
  },

  // --- Lavitz / Albert (Jade Dragoon) — spears + lances -------------------
  spear: {
    name: 'Spear',
    slot: 'weapon',
    archetypes: ['jadeDragoon'],
    bonuses: { atk: 4 },
  },
  lance: {
    name: 'Lance',
    slot: 'weapon',
    archetypes: ['jadeDragoon'],
    bonuses: { atk: 19 },
    price: 100,
  },
  twisterGlaive: {
    name: 'Twister Glaive',
    slot: 'weapon',
    archetypes: ['jadeDragoon'],
    bonuses: { atk: 28 },
    effect: 'wind-elemental',
    price: 140,
  },
  glaive: {
    name: 'Glaive',
    slot: 'weapon',
    archetypes: ['jadeDragoon'],
    bonuses: { atk: 37 },
    price: 250,
  },
  spearOfTerror: {
    name: 'Spear of Terror',
    slot: 'weapon',
    archetypes: ['jadeDragoon'],
    bonuses: { atk: 45 },
    effect: 'fear-on-hit',
    price: 300,
  },
  partisan: {
    name: 'Partisan',
    slot: 'weapon',
    archetypes: ['jadeDragoon'],
    bonuses: { atk: 56 },
    price: 400,
  },
  halberd: {
    name: 'Halberd',
    slot: 'weapon',
    archetypes: ['jadeDragoon'],
    bonuses: { atk: 65 },
    price: 500,
  },

  // --- Shana / Miranda (White-Silver Dragoon) — bows + arrows ------------
  shortBow: {
    name: 'Short Bow',
    slot: 'weapon',
    archetypes: ['whiteSilverDragoon'],
    bonuses: { atk: 3 },
  },
  sparkleArrow: {
    name: 'Sparkle Arrow',
    slot: 'weapon',
    archetypes: ['whiteSilverDragoon'],
    bonuses: { atk: 9 },
    effect: 'light-elemental',
    price: 50,
  },
  longBow: {
    name: 'Long Bow',
    slot: 'weapon',
    archetypes: ['whiteSilverDragoon'],
    bonuses: { atk: 18, attackHit: 10 },
    price: 150,
  },
  bemusingArrow: {
    name: 'Bemusing Arrow',
    slot: 'weapon',
    archetypes: ['whiteSilverDragoon'],
    bonuses: { atk: 24 },
    effect: 'confusion-on-hit',
    price: 250,
  },
  virulentArrow: {
    name: 'Virulent Arrow',
    slot: 'weapon',
    archetypes: ['whiteSilverDragoon'],
    bonuses: { atk: 30 },
    effect: 'poison-on-hit',
    price: 350,
  },
  arrowOfForce: {
    name: 'Arrow of Force',
    slot: 'weapon',
    archetypes: ['whiteSilverDragoon'],
    bonuses: { atk: 40 },
    effect: 'sp-gain-x1.5',
    price: 500,
  },
  detonateArrow: {
    name: 'Detonate Arrow',
    slot: 'weapon',
    archetypes: ['whiteSilverDragoon'],
    bonuses: { atk: 50 },
    effect: 'attacks-all-enemies',
  },

  // --- Rose (Dark Burst Dragoon) — one-handed swords + daggers -----------
  rapier: {
    name: 'Rapier',
    slot: 'weapon',
    archetypes: ['darkBurstDragoon'],
    bonuses: { atk: 13 },
  },
  demonStiletto: {
    name: 'Demon Stiletto',
    slot: 'weapon',
    archetypes: ['darkBurstDragoon'],
    bonuses: { atk: 18 },
    effect: 'fear-on-hit',
  },
  shadowCutter: {
    name: 'Shadow Cutter',
    slot: 'weapon',
    archetypes: ['darkBurstDragoon'],
    bonuses: { atk: 24 },
    effect: 'dark-elemental',
    price: 200,
  },
  dancingDagger: {
    name: 'Dancing Dagger',
    slot: 'weapon',
    archetypes: ['darkBurstDragoon'],
    bonuses: { atk: 30 },
    price: 300,
  },
  flamberge: {
    name: 'Flamberge',
    slot: 'weapon',
    archetypes: ['darkBurstDragoon'],
    bonuses: { atk: 35 },
    effect: 'stun-on-hit',
    price: 350,
  },
  gladius: {
    name: 'Gladius',
    slot: 'weapon',
    archetypes: ['darkBurstDragoon'],
    bonuses: { atk: 40 },
    effect: 'cant-combat-on-hit',
    price: 400,
  },
  dragonBuster: {
    name: 'Dragon Buster',
    slot: 'weapon',
    archetypes: ['darkBurstDragoon'],
    bonuses: { atk: 100 },
  },

  // --- Haschel (Violet Dragoon) — knuckles + claws -----------------------
  ironKnuckle: {
    name: 'Iron Knuckle',
    slot: 'weapon',
    archetypes: ['violetDragoon'],
    bonuses: { atk: 20 },
  },
  beastFang: {
    name: 'Beast Fang',
    slot: 'weapon',
    archetypes: ['violetDragoon'],
    bonuses: { atk: 31 },
    effect: 'stun-on-hit',
    price: 250,
  },
  diamondClaw: {
    name: 'Diamond Claw',
    slot: 'weapon',
    archetypes: ['violetDragoon'],
    bonuses: { atk: 37 },
    price: 300,
  },
  brassKnuckle: {
    name: 'Brass Knuckle',
    slot: 'weapon',
    archetypes: ['violetDragoon'],
    bonuses: { atk: 43 },
    effect: 'cant-combat-on-hit',
  },
  thunderFist: {
    name: 'Thunder Fist',
    slot: 'weapon',
    archetypes: ['violetDragoon'],
    bonuses: { atk: 49 },
    effect: 'thunder-elemental',
    price: 450,
  },
  destroyerMace: {
    name: 'Destroyer Mace',
    slot: 'weapon',
    archetypes: ['violetDragoon'],
    bonuses: { atk: 55 },
    effect: 'damage-x1.5-yellow-hp-x2-red-hp',
    price: 500,
  },

  // --- Meru (Blue-Sea Dragoon) — hammers + maces -------------------------
  mace: {
    name: 'Mace',
    slot: 'weapon',
    archetypes: ['blueSeaDragoon'],
    bonuses: { atk: 15 },
  },
  morningStar: {
    name: 'Morning Star',
    slot: 'weapon',
    archetypes: ['blueSeaDragoon'],
    bonuses: { atk: 20 },
    price: 250,
  },
  warHammer: {
    name: 'War Hammer',
    slot: 'weapon',
    archetypes: ['blueSeaDragoon'],
    bonuses: { atk: 25 },
    price: 300,
  },
  heavyMace: {
    name: 'Heavy Mace',
    slot: 'weapon',
    archetypes: ['blueSeaDragoon'],
    bonuses: { atk: 30 },
    effect: 'stun-on-hit',
    price: 400,
  },
  prettyHammer: {
    name: 'Pretty Hammer',
    slot: 'weapon',
    archetypes: ['blueSeaDragoon'],
    bonuses: { atk: 15 },
    effect: 'sp-gain-x2',
  },
  basher: {
    name: 'Basher',
    slot: 'weapon',
    archetypes: ['blueSeaDragoon'],
    bonuses: { atk: 40 },
    price: 500,
  },

  // --- Kongol (Golden Dragoon) — huge axes -------------------------------
  axe: {
    name: 'Axe',
    slot: 'weapon',
    archetypes: ['goldenDragoon'],
    bonuses: { atk: 45 },
  },
  tomahawk: {
    name: 'Tomahawk',
    slot: 'weapon',
    archetypes: ['goldenDragoon'],
    bonuses: { atk: 59 },
    price: 300,
  },
  battleAxe: {
    name: 'Battle Axe',
    slot: 'weapon',
    archetypes: ['goldenDragoon'],
    bonuses: { atk: 67 },
    price: 350,
  },
  greatAxe: {
    name: 'Great Axe',
    slot: 'weapon',
    archetypes: ['goldenDragoon'],
    bonuses: { atk: 79 },
    effect: 'stun-on-hit',
    price: 400,
  },
  indorasAxe: {
    name: "Indora's Axe",
    slot: 'weapon',
    archetypes: ['goldenDragoon'],
    bonuses: { atk: 88 },
    effect: 'cant-combat-on-hit',
  },

  // ====================================================================
  // HELMETS
  // ====================================================================

  // --- Male helmets -------------------------------------------------------
  bandana: {
    name: 'Bandana',
    slot: 'helmet',
    archetypes: MALE_REGULAR,
    bonuses: { magicAtk: 3 },
  },
  sallet: {
    name: 'Sallet',
    slot: 'helmet',
    archetypes: MALE_REGULAR,
    bonuses: { magicAtk: 8, attackHit: 10 },
    price: 40,
  },
  armet: {
    name: 'Armet',
    slot: 'helmet',
    archetypes: MALE_REGULAR,
    bonuses: { magicAtk: 23, magicDef: 5 },
    price: 100,
  },
  knightHelm: {
    name: 'Knight Helm',
    slot: 'helmet',
    archetypes: MALE_NO_HASCHEL,
    bonuses: { def: 5, magicAtk: 37 },
    effect: 'gain-sp-from-magic-damage',
    price: 150,
  },
  gigantoHelm: {
    name: 'Giganto Helm',
    slot: 'helmet',
    archetypes: ['goldenDragoon'],
    bonuses: { def: 10, magicAtk: 14, magicDef: 5 },
    effect: 'gain-sp-from-magic-damage',
    price: 200,
  },
  soulHeadband: {
    name: 'Soul Headband',
    slot: 'helmet',
    archetypes: ['violetDragoon'],
    bonuses: { def: 5, magicAtk: 25, magicDef: 5 },
    effect: 'gain-sp-from-magic-damage',
    price: 200,
  },

  // --- Female helmets -----------------------------------------------------
  feltHat: {
    name: 'Felt Hat',
    slot: 'helmet',
    archetypes: FEMALE_REGULAR,
    bonuses: { magicAtk: 5 },
  },
  cape: {
    name: 'Cape',
    slot: 'helmet',
    archetypes: FEMALE_REGULAR,
    bonuses: { magicAtk: 17 },
    price: 60,
  },
  tiara: {
    name: 'Tiara',
    slot: 'helmet',
    archetypes: FEMALE_REGULAR,
    bonuses: { def: 5, magicAtk: 29, magicHit: 10 },
    price: 150,
  },
  jeweledCrown: {
    name: 'Jeweled Crown',
    slot: 'helmet',
    archetypes: FEMALE_NO_ROSE,
    bonuses: { magicAtk: 24, magicDef: 5 },
    effect: 'gain-sp-from-magic-damage',
    price: 200,
  },
  rosesHairband: {
    name: "Rose's Hairband",
    slot: 'helmet',
    archetypes: ['darkBurstDragoon'],
    bonuses: { magicAtk: 36 },
    effect: 'avoid-cant-combat',
  },

  // --- Universal helmets --------------------------------------------------
  legendCasque: {
    name: 'Legend Casque',
    slot: 'helmet',
    bonuses: { magicAtk: 50, magicDef: 127, magicAvoid: 50 },
    price: 10000,
  },
  dragonHelm: {
    name: 'Dragon Helm',
    slot: 'helmet',
    bonuses: { def: 12, magicAtk: 50 },
    effect: '+50pct-max-hp',
  },
  magicalHat: {
    name: 'Magical Hat',
    slot: 'helmet',
    bonuses: { magicAtk: 50, magicDef: 10 },
    effect: '+50pct-max-mp',
  },
  phoenixPlume: {
    name: 'Phoenix Plume',
    slot: 'helmet',
    bonuses: { magicAtk: 30, magicDef: 10 },
    effect: 'avoid-fear-confusion-bewitchment-dispiriting',
  },

  // ====================================================================
  // ARMOR
  // ====================================================================

  // --- Dart / Lavitz / Albert (shared male regular line) -----------------
  leatherArmor: {
    name: 'Leather Armor',
    slot: 'armor',
    archetypes: DART_AND_JADE,
    bonuses: { def: 2, magicDef: 2 },
  },
  scaleArmor: {
    name: 'Scale Armor',
    slot: 'armor',
    archetypes: DART_AND_JADE,
    bonuses: { def: 8, magicDef: 8 },
    price: 50,
  },
  chainMail: {
    name: 'Chain Mail',
    slot: 'armor',
    archetypes: DART_AND_JADE,
    bonuses: { def: 20, magicDef: 24 },
    price: 150,
  },
  plateMail: {
    name: 'Plate Mail',
    slot: 'armor',
    archetypes: DART_AND_JADE,
    bonuses: { def: 27, magicDef: 20 },
    price: 200,
  },
  saintArmor: {
    name: 'Saint Armor',
    slot: 'armor',
    archetypes: DART_AND_JADE,
    bonuses: { def: 34, magicDef: 34 },
    effect: 'gain-sp-from-physical-damage',
    price: 300,
  },
  armorOfYore: {
    name: 'Armor of Yore',
    slot: 'armor',
    archetypes: DART_AND_JADE,
    bonuses: { def: 35, magicDef: 35 },
    effect: 'avoid-poison-stun-arm-blocking',
  },
  jadeDgArmor: {
    name: 'Jade DG Armor',
    slot: 'armor',
    archetypes: ['jadeDragoon'],
    bonuses: { def: 54, magicDef: 27 },
    effect: 'nullify-wind',
    price: 800,
  },
  redDgArmor: {
    name: 'Red DG Armor',
    slot: 'armor',
    archetypes: ['redEyeDragoon'],
    bonuses: { def: 41, magicDef: 40 },
    effect: 'nullify-fire',
    price: 800,
  },

  // --- Haschel (Violet Dragoon) ------------------------------------------
  discipleVest: {
    name: 'Disciple Vest',
    slot: 'armor',
    archetypes: ['violetDragoon'],
    bonuses: { def: 13, magicDef: 8 },
  },
  warriorDress: {
    name: 'Warrior Dress',
    slot: 'armor',
    archetypes: ['violetDragoon'],
    bonuses: { def: 25, magicDef: 23 },
    effect: 'def-+5pct',
    price: 150,
  },
  mastersVest: {
    name: "Master's Vest",
    slot: 'armor',
    archetypes: ['violetDragoon'],
    bonuses: { def: 30, magicDef: 29 },
    effect: 'gain-sp-from-physical-damage',
    price: 250,
  },
  energyGirdle: {
    name: 'Energy Girdle',
    slot: 'armor',
    archetypes: ['violetDragoon'],
    bonuses: { def: 37, magicDef: 26 },
    effect: 'gain-sp-x1.5',
    price: 300,
  },
  satoriVest: {
    name: 'Satori Vest',
    slot: 'armor',
    archetypes: ['violetDragoon'],
    bonuses: { def: 40, magicDef: 31 },
    effect: 'avoid-poison-stun-arm-blocking',
  },
  violetDgArmor: {
    name: 'Violet DG Armor',
    slot: 'armor',
    archetypes: ['violetDragoon'],
    bonuses: { def: 45, magicDef: 40 },
    effect: 'nullify-thunder',
    price: 800,
  },

  // --- Kongol (Golden Dragoon) -------------------------------------------
  lionFur: {
    name: 'Lion Fur',
    slot: 'armor',
    archetypes: ['goldenDragoon'],
    bonuses: { def: 46, magicDef: 20 },
  },
  breastplate: {
    name: 'Breastplate',
    slot: 'armor',
    archetypes: ['goldenDragoon'],
    bonuses: { def: 59, magicDef: 14 },
    price: 250,
  },
  gigantoArmor: {
    name: 'Giganto Armor',
    slot: 'armor',
    archetypes: ['goldenDragoon'],
    bonuses: { def: 75, magicDef: 25 },
    effect: 'gain-sp-from-physical-damage',
    price: 400,
  },
  goldenDgArmor: {
    name: 'Golden DG Armor',
    slot: 'armor',
    archetypes: ['goldenDragoon'],
    bonuses: { def: 88, magicDef: 23 },
    effect: 'nullify-earth',
    price: 800,
  },

  // --- Female regular line (Shana / Miranda / Rose / Meru) ---------------
  clothes: {
    name: 'Clothes',
    slot: 'armor',
    archetypes: FEMALE_REGULAR,
    bonuses: { def: 4, magicDef: 5 },
  },
  leatherJacket: {
    name: 'Leather Jacket',
    slot: 'armor',
    archetypes: FEMALE_NO_MERU,
    bonuses: { def: 7, magicDef: 12 },
    price: 50,
  },
  angelRobe: {
    name: 'Angel Robe',
    slot: 'armor',
    archetypes: FEMALE_NO_ROSE_2,
    bonuses: {},
    effect: 'may-revive-from-death',
    price: 500,
  },
  silverVest: {
    name: 'Silver Vest',
    slot: 'armor',
    archetypes: FEMALE_REGULAR,
    bonuses: { def: 13, magicDef: 17 },
    price: 150,
  },
  sparkleDress: {
    name: 'Sparkle Dress',
    slot: 'armor',
    archetypes: FEMALE_REGULAR,
    bonuses: { def: 19, magicDef: 45 },
    effect: 'gain-sp-from-physical-damage',
    price: 200,
  },
  robe: {
    name: 'Robe',
    slot: 'armor',
    archetypes: FEMALE_REGULAR,
    bonuses: { def: 25, magicDef: 35 },
    effect: 'gain-sp-from-magical-damage',
    price: 500,
  },
  rainbowDress: {
    name: 'Rainbow Dress',
    slot: 'armor',
    archetypes: FEMALE_REGULAR,
    bonuses: { def: 32, magicDef: 55 },
    effect: 'avoid-poison-stun-arm-blocking',
  },
  blueDgArmor: {
    name: 'Blue DG Armor',
    slot: 'armor',
    archetypes: ['blueSeaDragoon'],
    bonuses: { def: 30, magicDef: 54 },
    effect: 'nullify-water',
    price: 800,
  },
  darkDgArmor: {
    name: 'Dark DG Armor',
    slot: 'armor',
    archetypes: ['darkBurstDragoon'],
    bonuses: { def: 41, magicDef: 42 },
    effect: 'nullify-dark',
    price: 800,
  },
  silverDgArmor: {
    name: 'Silver DG Armor',
    slot: 'armor',
    archetypes: ['whiteSilverDragoon'],
    bonuses: { def: 27, magicDef: 80 },
    effect: 'nullify-light',
    price: 800,
  },

  // --- Universal armor ---------------------------------------------------
  armorOfLegend: {
    name: 'Armor of Legend',
    slot: 'armor',
    bonuses: { def: 127, attackAvoid: 50 },
    price: 10000,
  },

  // ====================================================================
  // BOOTS
  // ====================================================================

  // --- Male boots ---------------------------------------------------------
  leatherBoots: {
    name: 'Leather Boots',
    slot: 'boots',
    archetypes: MALE_REGULAR,
    bonuses: {},
  },
  ironKneepiece: {
    name: 'Iron Kneepiece',
    slot: 'boots',
    archetypes: MALE_REGULAR,
    bonuses: { def: 5 },
    price: 100,
  },
  combatShoes: {
    name: 'Combat Shoes',
    slot: 'boots',
    archetypes: MALE_REGULAR,
    bonuses: { def: 5, attackAvoid: 5 },
    price: 150,
  },
  banditsShoes: {
    name: "Bandit's Shoes",
    slot: 'boots',
    archetypes: MALE_REGULAR,
    bonuses: { speed: 20 },
  },

  // --- Female boots -------------------------------------------------------
  leatherShoes: {
    name: 'Leather Shoes',
    slot: 'boots',
    archetypes: FEMALE_REGULAR,
    bonuses: {},
  },
  softBoots: {
    name: 'Soft Boots',
    slot: 'boots',
    archetypes: FEMALE_REGULAR,
    bonuses: { def: 5 },
    price: 100,
  },
  stardustBoots: {
    name: 'Stardust Boots',
    slot: 'boots',
    archetypes: FEMALE_REGULAR,
    bonuses: { def: 5, magicAvoid: 5 },
    price: 150,
  },
  dancersShoes: {
    name: "Dancer's Shoes",
    slot: 'boots',
    archetypes: FEMALE_REGULAR,
    bonuses: { speed: 20 },
  },

  // --- Universal boots ----------------------------------------------------
  magicalGreaves: {
    name: 'Magical Greaves',
    slot: 'boots',
    bonuses: { speed: 10, attackAvoid: 5, magicAvoid: 5 },
    price: 300,
  },
} as const satisfies Record<string, EquipmentDefinition>;

export type EquipmentSlug = keyof typeof EQUIPMENT;

/**
 * Sum every stat bonus from the avatar's equipped items. Returns a
 * fresh `EquipmentBonuses` with all fields defaulted to 0 so call
 * sites can add unconditionally. Items whose `archetypes` list
 * doesn't include the entity's archetype are silently skipped — a
 * defensive guard since `startingEquipment` is author-curated and
 * shouldn't include illegal pairings in practice.
 */
export function totalEquipmentBonuses(
  slugs: ReadonlyArray<EquipmentSlug> | undefined,
  archetypeId: ArchetypeId,
): Required<EquipmentBonuses> {
  const total: Required<EquipmentBonuses> = {
    atk: 0,
    def: 0,
    magicAtk: 0,
    magicDef: 0,
    speed: 0,
    attackHit: 0,
    magicHit: 0,
    attackAvoid: 0,
    magicAvoid: 0,
  };
  if (!slugs) return total;
  for (const slug of slugs) {
    // The `as const satisfies` on EQUIPMENT narrows each entry to its
    // literal shape, which TS rejects for uniform field reads here.
    // Cast back to the interface — the satisfies clause already
    // proved every entry conforms.
    const def: EquipmentDefinition = EQUIPMENT[slug];
    if (def.archetypes && !def.archetypes.includes(archetypeId)) continue;
    total.atk += def.bonuses.atk ?? 0;
    total.def += def.bonuses.def ?? 0;
    total.magicAtk += def.bonuses.magicAtk ?? 0;
    total.magicDef += def.bonuses.magicDef ?? 0;
    total.speed += def.bonuses.speed ?? 0;
    total.attackHit += def.bonuses.attackHit ?? 0;
    total.magicHit += def.bonuses.magicHit ?? 0;
    total.attackAvoid += def.bonuses.attackAvoid ?? 0;
    total.magicAvoid += def.bonuses.magicAvoid ?? 0;
  }
  return total;
}
