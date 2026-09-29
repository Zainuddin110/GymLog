// Web Audio API Synthesized Sound Generator
// Transmits directly to Bluetooth headphones without requiring external audio files.

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch (e) {
    console.warn('AudioContext not supported or blocked:', e);
    return null;
  }
}

export function playBeep(frequency = 880, duration = 0.15, type: OscillatorType = 'sine', volume = 0.2) {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (err) {
    console.warn('Web Audio synthesis error:', err);
  }
}

// Rest timer completion alert: 3 distinct ascending tones
export function playRestCompleteSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [659.25, 880, 1318.51]; // E5, A5, E6
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      playBeep(freq, 0.25, 'triangle', 0.25);
    }, idx * 180);
  });
}

// Set completion feedback
export function playSetCompleteSound() {
  playBeep(880, 0.12, 'sine', 0.18);
  setTimeout(() => {
    playBeep(1174.66, 0.2, 'sine', 0.2); // D6
  }, 100);
}

// Haptic feedback via Vibration API
export function triggerHaptic(pattern: number | number[] = [120, 60, 180]) {
  if (typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration errors on unsupported platforms (e.g. iOS Safari)
    }
  }
}

