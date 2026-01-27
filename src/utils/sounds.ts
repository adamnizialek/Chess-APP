// ============================================
// EFEKTY DŹWIĘKOWE DLA GRY SZACHOWEJ
// Realistyczne dźwięki drewnianych figur
// ============================================

let audioContext: AudioContext | null = null;
let isMuted: boolean = localStorage.getItem('chessSoundMuted') === 'true';

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

// Funkcje do zarządzania wyciszeniem
export function isSoundMuted(): boolean {
  return isMuted;
}

export function setSoundMuted(muted: boolean): void {
  isMuted = muted;
  localStorage.setItem('chessSoundMuted', muted.toString());
}

export function toggleSoundMuted(): boolean {
  setSoundMuted(!isMuted);
  return isMuted;
}

export type SoundType = 'move' | 'capture' | 'check' | 'castle' | 'promote' | 'gameEnd' | 'illegal';

export function playSound(type: SoundType): void {
  if (isMuted) return;

  try {
    const ctx = getAudioContext();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    switch (type) {
      case 'move':
        playWoodClick(ctx, 0.35, 180);
        break;
      case 'capture':
        playWoodClick(ctx, 0.5, 140);
        setTimeout(() => playWoodClick(ctx, 0.25, 220), 50);
        break;
      case 'check':
        playWoodClick(ctx, 0.45, 160);
        setTimeout(() => playWoodClick(ctx, 0.3, 200), 90);
        break;
      case 'castle':
        playWoodClick(ctx, 0.35, 180);
        setTimeout(() => playWoodClick(ctx, 0.3, 190), 130);
        break;
      case 'promote':
        playWoodClick(ctx, 0.45, 150);
        break;
      case 'gameEnd':
        playWoodClick(ctx, 0.5, 120);
        break;
      case 'illegal':
        playWoodClick(ctx, 0.15, 250);
        break;
    }
  } catch (e) {
    // Cicho ignoruj błędy audio
  }
}

/**
 * Realistyczny dźwięk drewnianej figury
 */
function playWoodClick(ctx: AudioContext, volume: number, baseFreq: number): void {
  const now = ctx.currentTime;

  // 1. Szum - symuluje uderzenie (atak dźwięku)
  const noiseLength = 0.04;
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * noiseLength, ctx.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);

  for (let i = 0; i < noiseBuffer.length; i++) {
    // Szybko zanikający szum
    const env = Math.exp(-i / (ctx.sampleRate * 0.008));
    noiseData[i] = (Math.random() * 2 - 1) * env;
  }

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuffer;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.value = 2000;
  noiseFilter.Q.value = 1;

  const noiseGain = ctx.createGain();
  noiseGain.gain.value = volume * 0.8;

  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);

  noiseSource.start(now);
  noiseSource.stop(now + noiseLength);

  // 2. Niski ton - rezonans drewna
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(baseFreq, now);
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, now + 0.06);

  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(volume * 0.5, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  osc.connect(oscGain);
  oscGain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.06);

  // 3. Wyższy harmonik - dodaje "klik"
  const osc2 = ctx.createOscillator();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(baseFreq * 2.5, now);
  osc2.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.025);

  const osc2Gain = ctx.createGain();
  osc2Gain.gain.setValueAtTime(volume * 0.2, now);
  osc2Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

  osc2.connect(osc2Gain);
  osc2Gain.connect(ctx.destination);

  osc2.start(now);
  osc2.stop(now + 0.025);
}
