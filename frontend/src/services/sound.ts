/**
 * COMMUNIQ Audio Service
 * Strict Calm Sound Architecture:
 * - Zero interface sounds (no pops, clicks, or reward sounds).
 * - Only allowed audio: Speech synthesis, deliberate user-activated "Get attention" chime, and voice tests.
 */
class SoundService {
  public enabled: boolean = false;
  private audioCtx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  /**
   * Tap sounds are strictly disabled across all modes.
   */
  public playTap(): void {
    // Intentionally no-op: zero interface sounds on tap
  }

  /**
   * Reward sounds are strictly disabled across all modes.
   * Rewards are visual-only and quiet.
   */
  public playCelebration(): void {
    // Intentionally no-op: rewards are visual only
  }

  /**
   * Deliberate gentle two-tone chime played ONLY when the user intentionally
   * presses the "Get attention" action in the Board right rail.
   */
  public playAttentionChime(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25]; // C5, E5 gentle chime
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + idx * 0.12;
        const duration = 0.3;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.08, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch {
      // Audio context policy fallback
    }
  }
}

export const soundService = new SoundService();
