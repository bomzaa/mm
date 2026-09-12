/**
 * Event bus and state manager for the Pixel Art Companion
 */

export type CompanionMood = 'idle' | 'walk' | 'happy' | 'sad' | 'sleep' | 'excited' | 'relax';

export interface CompanionConfig {
  enabled: boolean;
  size: 'sm' | 'md' | 'lg'; // sm: 52px, md: 68px, lg: 84px
  speed: 'slow' | 'normal' | 'fast'; // 0.6x, 1x, 1.4x
  soundEnabled: boolean;
  encouragementEnabled: boolean;
}

export const DEFAULT_COMPANION_CONFIG: CompanionConfig = {
  enabled: true,
  size: 'md',
  speed: 'normal',
  soundEnabled: true,
  encouragementEnabled: true,
};

export interface CompanionReactionPayload {
  mood: CompanionMood;
  message?: string;
  durationMs?: number;
  priority?: 'low' | 'high';
}

type ReactionListener = (payload: CompanionReactionPayload) => void;
type ConfigListener = (config: CompanionConfig) => void;

const reactionListeners: Set<ReactionListener> = new Set();
const configListeners: Set<ConfigListener> = new Set();

const STORAGE_KEY_CONFIG = 'ai_exam_companion_config';

export const CompanionService = {
  getConfig(): CompanionConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (stored) {
        return { ...DEFAULT_COMPANION_CONFIG, ...JSON.parse(stored) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_COMPANION_CONFIG;
  },

  saveConfig(newConfig: CompanionConfig) {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(newConfig));
    } catch {
      // ignore
    }
    configListeners.forEach((l) => l(newConfig));
  },

  subscribeConfig(listener: ConfigListener): () => void {
    configListeners.add(listener);
    return () => {
      configListeners.delete(listener);
    };
  },

  triggerReaction(mood: CompanionMood, message?: string, durationMs: number = 3500, priority: 'low' | 'high' = 'high') {
    reactionListeners.forEach((l) => l({ mood, message, durationMs, priority }));
  },

  subscribeReaction(listener: ReactionListener): () => void {
    reactionListeners.add(listener);
    return () => {
      reactionListeners.delete(listener);
    };
  },

  // Audio effects synthesizer using native Web Audio API
  playSound(type: 'pop' | 'success' | 'cheer' | 'relax_chime' | 'soft_bell') {
    const config = this.getConfig();
    if (!config.soundEnabled) return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'pop') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'success') {
        // Bright arpeggio: C5 -> E5 -> G5 -> C6
        const freqs = [523.25, 659.25, 783.99, 1046.5];
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, ctx.currentTime + idx * 0.07);
          gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.28);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.07);
          osc.stop(ctx.currentTime + idx * 0.07 + 0.28);
        });
      } else if (type === 'relax_chime') {
        // Calming resonant bowl / chime
        const freqs = [432, 648];
        freqs.forEach((f) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, ctx.currentTime);
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 1.8);
        });
      }
    } catch {
      // AudioContext muted or unsupported
    }
  },
};
