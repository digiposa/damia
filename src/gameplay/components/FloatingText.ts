/** Short-lived in-world text bubble (damage numbers, XP gained). */
export interface FloatingText {
  text: string;
  color: number;
  elapsedMs: number;
  durationMs: number;
}
