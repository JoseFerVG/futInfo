// js/audio.js - Motor de Sonido Web Audio API para futInfo (Estilo EA SPORTS FIFA FUT)
// Cero dependencias externas, 100% sintetizado en tiempo real en el navegador

class FUTAudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('fut_audio_muted') === 'true';
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('fut_audio_muted', this.muted);
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  // Sonido de clic sutil al tocar o seleccionar una carta
  playCardSelect() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(1400, t + 0.04);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.05);
    } catch (_) {}
  }

  // Sonido de swap o intercambio de carta (whoosh + thud táctil)
  playCardSwap() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Whoosh bajo
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(320, t);
      osc1.frequency.exponentialRampToValueAtTime(120, t + 0.12);

      gain1.gain.setValueAtTime(0.25, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.13);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.13);

      // Snap agudo de encaje
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(900, t + 0.04);
      osc2.frequency.exponentialRampToValueAtTime(1600, t + 0.09);

      gain2.gain.setValueAtTime(0.15, t + 0.04);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.11);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(t + 0.04);
      osc2.stop(t + 0.11);
    } catch (_) {}
  }

  // Chime armónico de cálculo de química (tríada mayor resplandeciente)
  playChemChime() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // Do, Mi, Sol, Do agudo

      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.04);

        gain.gain.setValueAtTime(0, t + idx * 0.04);
        gain.gain.linearRampToValueAtTime(0.08, t + idx * 0.04 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t + idx * 0.04);
        osc.stop(t + idx * 0.04 + 0.35);
      });
    } catch (_) {}
  }

  // Sonido de confirmación / guardado exitoso
  playSuccess() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.setValueAtTime(880, t + 0.08);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.22);
    } catch (_) {}
  }

  // Tictac rápido del contador de media (Rating counter tick)
  playRatingTick() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, t);
      osc.frequency.exponentialRampToValueAtTime(1800, t + 0.02);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.025);
    } catch (_) {}
  }

  // Explosión cinematográfica de Walkout / Revelación de sobre
  playWalkoutExplosion() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // 1. Sub-bass cañonazo de estadio
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(140, t);
      sub.frequency.exponentialRampToValueAtTime(35, t + 0.6);

      subGain.gain.setValueAtTime(0.45, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

      sub.connect(subGain);
      subGain.connect(this.ctx.destination);
      sub.start(t);
      sub.stop(t + 0.7);

      // 2. Chispas doradas / fuegos artificiales
      const freqs = [784, 987.77, 1318.51, 1567.98];
      freqs.forEach((f, idx) => {
        const chime = this.ctx.createOscillator();
        const chimeGain = this.ctx.createGain();

        chime.type = 'triangle';
        chime.frequency.setValueAtTime(f, t + idx * 0.06);

        chimeGain.gain.setValueAtTime(0, t + idx * 0.06);
        chimeGain.gain.linearRampToValueAtTime(0.12, t + idx * 0.06 + 0.03);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.5);

        chime.connect(chimeGain);
        chimeGain.connect(this.ctx.destination);
        chime.start(t + idx * 0.06);
        chime.stop(t + idx * 0.06 + 0.5);
      });
    } catch (_) {}
  }

  // Fanfarria triunfal de fichaje completado
  playFanfare() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const notes = [
        { f: 523.25, time: 0, dur: 0.15 },
        { f: 659.25, time: 0.12, dur: 0.15 },
        { f: 783.99, time: 0.24, dur: 0.2 },
        { f: 1046.50, time: 0.4, dur: 0.6 }
      ];

      notes.forEach(({ f, time, dur }) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, t + time);

        // Suave filtro pasa-bajos para tono cálido de metal
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2200, t + time);

        gain.gain.setValueAtTime(0, t + time);
        gain.gain.linearRampToValueAtTime(0.12, t + time + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t + time + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t + time);
        osc.stop(t + time + dur);
      });
    } catch (_) {}
  }
}

export const futAudio = new FUTAudioEngine();
