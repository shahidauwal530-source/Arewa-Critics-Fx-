/**
 * Sound Alert Engine using Web Audio API (no external asset dependencies)
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Play a high-probability trade alert chime (ascending chord)
 */
export function playSignalAlert(type: 'STRONG' | 'MEDIUM' | 'TICK') {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    if (type === 'STRONG') {
      // Triad chime in C Major: 523.25Hz (C5), 659.25Hz (E5), 783.99Hz (G5)
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.1);

        gain.gain.setValueAtTime(0, now + index * 0.1);
        gain.gain.linearRampToValueAtTime(0.2, now + index * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.1);
        osc.stop(now + index * 0.1 + 0.45);
      });
    } else if (type === 'MEDIUM') {
      // Double warning tone
      [440, 554.37].forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.15);

        gain.gain.setValueAtTime(0, now + index * 0.15);
        gain.gain.linearRampToValueAtTime(0.15, now + index * 0.15 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.15 + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.15);
        osc.stop(now + index * 0.15 + 0.35);
      });
    }
  } catch {
    // Ignore audio autoplay restrictions
  }
}
