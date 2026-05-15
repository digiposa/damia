/**
 * TLoD-style UI theme — single source of truth for colors, text
 * presets, spacing tokens, modal dimensions, breakpoints and touch
 * ergonomics. Every UI module reads from here; never hardcode a hex
 * literal or a font-size in a panel file.
 *
 * Palette aim: parchment + brown accents reminiscent of the PS1
 * status / menu screens. Refine in passes — call out a new token
 * the moment you reach for an inline literal.
 */
import type { TextStyleOptions } from 'pixi.js';

/** Background, border, accent and text colors. */
export const COLORS = {
  /** Full-screen dim under modals. */
  dim: 0x000000,
  /** Main panel background (the outer frame of a modal). */
  panelBg: 0x1a1f2b,
  /** Sub-panel / card-frame background — slightly darker than panelBg. */
  subPanelBg: 0x0e1320,
  /** Standalone card / picker tile background. */
  cardBg: 0x101010,
  /** Default UI button face. */
  buttonBg: 0x2a2f3b,
  /** Active / pressed UI button face — same hue as the accent border. */
  buttonActive: 0xa08050,
  /** Touch / choice "tile" face — semi-transparent navy used by the
   *  touch buttons (joystick siblings) and the level-up choice cards.
   *  Sits darker than `panelBg` so the tile reads against the game
   *  world without an extra backdrop. */
  tileBg: 0x1c2840,
  /** Tile pressed / hover state — one shade lighter than `tileBg`. */
  tilePressed: 0x2c3a52,

  /** Default border / divider line. */
  border: 0xa08050,
  /** Active / highlighted border (selected card, focus state, gold). */
  borderActive: 0xeec040,
  /** Gold accent for XP / titles / rare-pip rarity. */
  gold: 0xeec040,
  /** Drop-shadow / outline stroke used by overlay Text to stay
   *  readable against the game world. */
  textStroke: 0x000000,
  /** Portrait frame background — neutral dark gray, so the avatar
   *  reads even on busy zones. Distinct from the bluish panelBg. */
  portraitBg: 0x202020,
  /** Hotbar / inventory slot index label — dim brown, half a shade
   *  darker than `border`, so the digit fades behind the icon. */
  slotKeyLabel: 0x806040,

  /** High-contrast white for numeric values, names. */
  textValue: 0xffffff,
  /** Mid-contrast label color for field captions. */
  textLabel: 0xccd2dd,
  /** Low-contrast color for placeholder / disabled / "—" values. */
  textMuted: 0x808a9a,
  /** Parchment cream — used by the HUD portrait + bar labels. */
  textCream: 0xfaf6e8,
  /** Sand muted — secondary text on cards. */
  textSand: 0xc8b58a,

  /** HP gauge foreground. */
  hpFg: 0xd03030,
  /** HP gauge background (depleted portion). */
  hpBg: 0x3a0808,
  /** SP gauge foreground. */
  spFg: 0x4a8fff,
  /** SP gauge background. */
  spBg: 0x0a1a3a,
  /** MP gauge foreground. */
  mpFg: 0xb574ff,
  /** MP gauge background. */
  mpBg: 0x1a0a3a,
  /** XP bar / level number color. */
  xpFg: 0xeec040,

  /** Damage floating-text color. */
  damage: 0xff4040,
  /** Heal floating-text color. */
  heal: 0x40c060,
} as const;

/** Named text style presets — pick a role rather than rolling sizes
 *  / colors / weights ad hoc. Plain object literals so they can be
 *  spread into a `new Text({ style: TEXT.title })` call. */
export const TEXT: Record<
  | 'title'
  | 'header'
  | 'label'
  | 'value'
  | 'muted'
  | 'cellLabel'
  | 'cellValue'
  | 'cellMuted'
  | 'gauge',
  TextStyleOptions
> = {
  /** 18 px bold — modal titles, character name + LV strip. */
  title: { fill: COLORS.textValue, fontSize: 18, fontWeight: 'bold' },
  /** 14 px bold — sub-panel headers (Magic, Equipment …). */
  header: { fill: COLORS.textValue, fontSize: 14, fontWeight: 'bold' },
  /** 13 px regular — captions in left columns. */
  label: { fill: COLORS.textLabel, fontSize: 13 },
  /** 14 px bold — values shown to the player (HP/MP/EXP numerics). */
  value: { fill: COLORS.textValue, fontSize: 14, fontWeight: 'bold' },
  /** 13 px muted — placeholder / empty-slot / "—". */
  muted: { fill: COLORS.textMuted, fontSize: 13 },
  /** 12 px bold — left column of dense tables (stats table labels). */
  cellLabel: { fill: COLORS.textLabel, fontSize: 12, fontWeight: 'bold' },
  /** 12 px regular — dense table values. */
  cellValue: { fill: COLORS.textValue, fontSize: 12 },
  /** 12 px muted — dense table placeholders ("—"). */
  cellMuted: { fill: COLORS.textMuted, fontSize: 12 },
  /** Small parchment-cream — HUD bar labels, hotbar slot index. */
  gauge: { fill: COLORS.textCream, fontSize: 11, fontWeight: 'bold' },
};

/** Spacing tokens (in pixels). Stick to these — the layout system
 *  rounds odd offsets to integers and avoiding ad-hoc paddings keeps
 *  the screens visually consistent. */
export const SPACING = {
  /** Default padding inside a panel / sub-panel. */
  pad: 10,
  /** Default gap between flex children. */
  gap: 10,
  /** Larger padding — outer modal margin. */
  padLarge: 20,
  /** Smaller gap — inside a tight cell / between tightly packed lines. */
  gapSmall: 4,
  /** Comfortable gap — between distinct sections. */
  gapLarge: 16,
} as const;

/** Modal dimensions. The actual rendered size clamps these against
 *  the viewport at open() time so they shrink gracefully on mobile. */
export const MODAL = {
  /** Max width an outer modal can grow to on a large viewport. */
  maxWidth: 700,
  /** Max height an outer modal can grow to on a large viewport. */
  maxHeight: 720,
  /** Minimum horizontal margin between the modal edge and the screen edge. */
  margin: 20,
  /** Minimum sub-panel width before the 2-column grid wraps to one
   *  column. Yoga's flex-wrap fires when `2 × this + gap` overflows. */
  subPanelMinWidth: 280,
} as const;

/** Responsive viewport breakpoints (CSS px / Pixi screen units).
 *  Mobile <= mobile, tablet > mobile && <= tablet, desktop > tablet. */
export const BREAKPOINTS = {
  mobile: 540,
  tablet: 1024,
  desktop: 1440,
} as const;

/** Touch-friendly minimum tap size. Apple HIG 44 pt, Material 48 dp —
 *  we go 44 to keep the on-screen footprint reasonable. */
export const TOUCH = {
  minTapSize: 44,
} as const;
