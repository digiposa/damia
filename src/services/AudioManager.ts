/**
 * Audio backend. SFX are still synthesized via Web Audio (zero file dependency,
 * see `playSfx`); music is streamed via howler from the MUSIC_MANIFEST.
 *
 * Volumes are persisted to localStorage so settings survive reloads.
 *
 * Swap-out path: replace any MUSIC_MANIFEST entry with a different file URL —
 * call sites only know the alias. SFX can later get the same treatment by
 * extending `playSfx` to look up a SFX_MANIFEST.
 */
import { Howl } from 'howler';
import { getLanguage } from './I18nService';
import { AVATARS_BY_ARCHETYPE } from '@data/characters';

export type SfxAlias = 'combat.swing' | 'combat.hit' | 'combat.death' | 'items.pickup' | 'ui.click';

export type MusicAlias = 'music.forestAmbient' | 'music.titleScreen';

interface MusicEntry {
  url: string;
  /** Per-track playback volume relative to the music gain (1.0 = unchanged). */
  trackVolume?: number;
}

const MUSIC_MANIFEST: Record<MusicAlias, MusicEntry> = {
  'music.forestAmbient': { url: '/audio/music/forest.ogg', trackVolume: 0.9 },
  'music.titleScreen': { url: '/audio/music/title.ogg', trackVolume: 0.85 },
};

/**
 * Voice clip registry. Built once at module init from the character data:
 * for every canonical avatar of every archetype, we register a key for each
 * addition slug the archetype owns (base unlocks + Master Addition). Lookups
 * are keyed by `<avatarId>.<additionId>`.
 *
 * Why derive vs. hardcode: this keeps the manifest in lockstep with the data
 * model. Adding a new addition slug + dropping a clip = manifest auto-updates.
 * Adding a Survival skin avatar (Shirley / Damia / Graham / Syuveh) registers
 * its keys here too — if the .ogg files don't exist yet, the play-time fetch
 * 404s and the buffer caches as 'error', so the trigger goes silent without
 * any extra wiring.
 *
 * The actual file URL is resolved at play-time via `loadVoiceBuffer` using
 * the current locale, with an 'en' fallback for any locale without a
 * recording yet.
 */
function buildVoiceManifest(): Readonly<Record<string, true>> {
  const manifest: Record<string, true> = {};
  for (const avatars of Object.values(AVATARS_BY_ARCHETYPE)) {
    for (const avatar of avatars) {
      const archetype = avatar.archetype;
      for (const slug of archetype.additionUnlocksByLevel.values()) {
        manifest[`${avatar.id}.${slug}`] = true;
      }
      if (archetype.masterAddition) {
        manifest[`${avatar.id}.${archetype.masterAddition}`] = true;
      }
    }
  }
  return manifest;
}

const VOICE_MANIFEST: Readonly<Record<string, true>> = buildVoiceManifest();

const STORAGE_KEY = 'damia.audio';

interface VolumeState {
  master: number;
  music: number;
  sfx: number;
  voice: number;
}

interface PersistedAudioState extends VolumeState {
  muted: boolean;
}

const DEFAULT_VOLUMES: VolumeState = { master: 0.7, music: 0.5, sfx: 0.6, voice: 0.8 };
/** Start muted on first load — current focus is testing and the
 *  background music interferes. Users can unmute via the in-game
 *  button; the choice is then persisted. */
const DEFAULT_MUTED = true;

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let voiceGain: GainNode | null = null;
let volumes: VolumeState = { ...DEFAULT_VOLUMES };
let muted: boolean = DEFAULT_MUTED;
const mutedListeners = new Set<(muted: boolean) => void>();
let initialized = false;
let pendingResume = false;
/** Cached Howl instances per alias so re-entering the same scene reuses the loaded buffer. */
const musicHowls = new Map<MusicAlias, Howl>();
let currentMusic: { alias: MusicAlias; howl: Howl } | null = null;
/** Decoded AudioBuffer per voice key (`<avatarId>.<additionId>`). 'pending'
 *  during the in-flight fetch+decode, 'error' if no clip exists in either the
 *  current locale or the 'en' fallback (cached so we don't re-fetch on every
 *  trigger). */
const voiceBuffers = new Map<string, AudioBuffer | 'pending' | 'error'>();

function readPersisted(): PersistedAudioState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_VOLUMES, muted: DEFAULT_MUTED };
    const parsed = JSON.parse(raw) as Partial<PersistedAudioState>;
    return {
      master: clamp(parsed.master ?? DEFAULT_VOLUMES.master),
      music: clamp(parsed.music ?? DEFAULT_VOLUMES.music),
      sfx: clamp(parsed.sfx ?? DEFAULT_VOLUMES.sfx),
      voice: clamp(parsed.voice ?? DEFAULT_VOLUMES.voice),
      muted: parsed.muted ?? DEFAULT_MUTED,
    };
  } catch {
    return { ...DEFAULT_VOLUMES, muted: DEFAULT_MUTED };
  }
}

function writePersisted(): void {
  try {
    const state: PersistedAudioState = { ...volumes, muted };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors (private mode etc.)
  }
}

function clamp(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function ensureCtx(): void {
  if (initialized) return;
  initialized = true;
  const persisted = readPersisted();
  volumes = {
    master: persisted.master,
    music: persisted.music,
    sfx: persisted.sfx,
    voice: persisted.voice,
  };
  muted = persisted.muted;
  try {
    ctx = new AudioContext();
    masterGain = ctx.createGain();
    sfxGain = ctx.createGain();
    musicGain = ctx.createGain();
    voiceGain = ctx.createGain();
    sfxGain.connect(masterGain);
    musicGain.connect(masterGain);
    voiceGain.connect(masterGain);
    masterGain.connect(ctx.destination);
    applyGains();
  } catch {
    ctx = null;
  }
}

function applyGains(): void {
  const masterEffective = muted ? 0 : volumes.master;
  if (masterGain && sfxGain && musicGain && voiceGain) {
    masterGain.gain.value = masterEffective;
    sfxGain.gain.value = volumes.sfx;
    musicGain.gain.value = volumes.music;
    voiceGain.gain.value = volumes.voice;
  }
  // Howler has its own audio graph (HTMLAudioElement-backed by default),
  // independent from our Web Audio context. Mirror our gains onto it so the
  // settings sliders affect both pipelines.
  syncMusicHowlVolume();
}

function syncMusicHowlVolume(): void {
  if (!currentMusic) return;
  const entry = MUSIC_MANIFEST[currentMusic.alias];
  const trackVol = entry.trackVolume ?? 1;
  const masterEffective = muted ? 0 : volumes.master;
  currentMusic.howl.volume(masterEffective * volumes.music * trackVol);
}

/**
 * Browsers block AudioContext until a user gesture. Call this from a click handler
 * once at startup; subsequent calls are no-ops.
 */
export function unlockAudio(): void {
  ensureCtx();
  if (ctx && ctx.state === 'suspended') {
    void ctx.resume();
  }
  pendingResume = false;
}

export function initAudioManager(): void {
  ensureCtx();
  // Pause/resume on tab visibility.
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) void ctx.suspend();
    else if (!pendingResume) void ctx.resume();
  });
}

export function getVolumes(): VolumeState {
  return { ...volumes };
}

export function setMasterVolume(v: number): void {
  volumes.master = clamp(v);
  applyGains();
  writePersisted();
}
export function setMusicVolume(v: number): void {
  volumes.music = clamp(v);
  applyGains();
  writePersisted();
}
export function setSfxVolume(v: number): void {
  volumes.sfx = clamp(v);
  applyGains();
  writePersisted();
}
export function setVoiceVolume(v: number): void {
  volumes.voice = clamp(v);
  applyGains();
  writePersisted();
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  if (muted === value) return;
  muted = value;
  applyGains();
  writePersisted();
  for (const l of mutedListeners) l(muted);
}

export function toggleMute(): void {
  setMuted(!muted);
}

/** Subscribe to mute-state changes. Returns the unsubscribe fn. */
export function onMuteChange(listener: (muted: boolean) => void): () => void {
  mutedListeners.add(listener);
  return () => mutedListeners.delete(listener);
}

export function playSfx(alias: SfxAlias): void {
  ensureCtx();
  if (!ctx || !sfxGain) return;
  const now = ctx.currentTime;
  switch (alias) {
    case 'combat.swing':
      tone(now, 220, 80, 'sawtooth', 0.25);
      tone(now + 0.02, 110, 60, 'sawtooth', 0.2);
      break;
    case 'combat.hit':
      noiseBurst(now, 90, 0.4);
      tone(now, 320, 60, 'square', 0.15);
      break;
    case 'combat.death':
      tone(now, 330, 120, 'square', 0.3);
      tone(now + 0.1, 220, 180, 'square', 0.25);
      tone(now + 0.25, 110, 240, 'square', 0.2);
      break;
    case 'items.pickup':
      tone(now, 660, 80, 'sine', 0.3);
      tone(now + 0.06, 990, 120, 'sine', 0.3);
      break;
    case 'ui.click':
      tone(now, 800, 30, 'square', 0.18);
      break;
  }
}

/**
 * Play the voice clip that goes with `<avatarId>` performing `<additionId>`
 * (e.g. Dart shouting "Double Slash"). Lazy-loads + caches the decoded
 * AudioBuffer on first call; the clip plays from the second trigger onward
 * and is fire-and-forget thereafter. No-op when no clip is registered for the
 * pair, when audio init failed, or while the buffer is still loading.
 *
 * Locale resolution: we try the current i18n language first, then fall back
 * to 'en' (the placeholder VO source). Both 404s are cached as 'error' so we
 * stop hammering the network on every addition trigger.
 */
export function playAdditionVoice(avatarId: string, additionId: string): void {
  ensureCtx();
  if (!ctx || !voiceGain) return;
  const key = `${avatarId}.${additionId}`;
  if (!VOICE_MANIFEST[key]) return;
  const cached = voiceBuffers.get(key);
  if (cached === 'pending' || cached === 'error') return;
  if (!cached) {
    voiceBuffers.set(key, 'pending');
    void loadVoiceBuffer(key, avatarId, additionId);
    return;
  }
  const src = ctx.createBufferSource();
  src.buffer = cached;
  src.connect(voiceGain);
  src.start();
}

async function loadVoiceBuffer(key: string, avatarId: string, additionId: string): Promise<void> {
  if (!ctx) {
    voiceBuffers.set(key, 'error');
    return;
  }
  const base = import.meta.env.BASE_URL || '/';
  const lang = getLanguage();
  const candidates = lang === 'en' ? ['en'] : [lang, 'en'];
  for (const locale of candidates) {
    const url = `${base}audio/voice/${locale}/${avatarId}/${additionId}.ogg`;
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const ab = await res.arrayBuffer();
      const buf = await ctx.decodeAudioData(ab);
      voiceBuffers.set(key, buf);
      return;
    } catch {
      // try next candidate
    }
  }
  voiceBuffers.set(key, 'error');
}

function tone(
  startTime: number,
  freq: number,
  durationMs: number,
  type: OscillatorType,
  vol: number,
): void {
  if (!ctx || !sfxGain) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const dur = durationMs / 1000;
  gain.gain.setValueAtTime(vol, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);
  osc.connect(gain).connect(sfxGain);
  osc.start(startTime);
  osc.stop(startTime + dur + 0.02);
}

function noiseBurst(startTime: number, durationMs: number, vol: number): void {
  if (!ctx || !sfxGain) return;
  const dur = durationMs / 1000;
  const sampleCount = Math.floor(ctx.sampleRate * dur);
  const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < sampleCount; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);
  src.connect(gain).connect(sfxGain);
  src.start(startTime);
  src.stop(startTime + dur + 0.02);
}

/**
 * Start a looping music track. If another track is already playing it's faded
 * out and replaced. Re-calling with the same alias is a no-op (avoids restart
 * when the scene re-enters via continue/quick-load).
 */
export function playMusic(alias: MusicAlias): void {
  ensureCtx();
  if (currentMusic?.alias === alias && currentMusic.howl.playing()) return;

  if (currentMusic && currentMusic.alias !== alias) {
    fadeOutAndStop(currentMusic.howl);
    currentMusic = null;
  }

  let howl = musicHowls.get(alias);
  if (!howl) {
    // Prepend Vite's BASE_URL so the asset URL works under the GitHub Pages
    // subpath (`/damia/`). In dev BASE_URL = `/` so behaviour is unchanged.
    const base = import.meta.env.BASE_URL || '/';
    const src = base + MUSIC_MANIFEST[alias].url.replace(/^\//, '');
    howl = new Howl({
      src: [src],
      loop: true,
      html5: true, // stream large files without decoding the whole buffer
      preload: true,
      volume: 0,
    });
    musicHowls.set(alias, howl);
  }

  currentMusic = { alias, howl };
  syncMusicHowlVolume();
  if (!howl.playing()) howl.play();
}

export function stopMusic(): void {
  if (!currentMusic) return;
  fadeOutAndStop(currentMusic.howl);
  currentMusic = null;
}

function fadeOutAndStop(howl: Howl): void {
  const from = howl.volume();
  howl.fade(from, 0, 400);
  setTimeout(() => howl.stop(), 450);
}
