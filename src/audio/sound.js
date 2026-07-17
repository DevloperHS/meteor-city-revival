export const Sound = {
  ctx: null,
  master: null,
  noiseBuffer: null,

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
      // Pre-render white noise buffer for reuse
      const len = this.ctx.sampleRate * 2;
      this.noiseBuffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    } catch (e) { console.warn('Audio init failed', e); }
  },

  playMeteor() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // Descending whoosh tone
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 2.5);
    oscGain.gain.setValueAtTime(0.001, t);
    oscGain.gain.exponentialRampToValueAtTime(0.15, t + 0.3);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 2.5);
    osc.connect(oscGain).connect(this.master);
    osc.start(t); osc.stop(t + 2.5);

    // Noise wind
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const nf = this.ctx.createBiquadFilter();
    nf.type = 'bandpass'; nf.frequency.value = 400; nf.Q.value = 0.5;
    const ng = this.ctx.createGain();
    ng.gain.setValueAtTime(0.001, t);
    ng.gain.exponentialRampToValueAtTime(0.08, t + 0.5);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 2.5);
    noise.connect(nf).connect(ng).connect(this.master);
    noise.start(t); noise.stop(t + 2.5);
  },

  playImpact() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // Deep boom
    const osc = this.ctx.createOscillator();
    const og = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(20, t + 1.5);
    og.gain.setValueAtTime(0.8, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
    osc.connect(og).connect(this.master);
    osc.start(t); osc.stop(t + 1.5);

    // Rumble (low noise)
    const rumble = this.ctx.createBufferSource();
    rumble.buffer = this.noiseBuffer;
    rumble.loop = true;
    const rf = this.ctx.createBiquadFilter();
    rf.type = 'lowpass'; rf.frequency.value = 100;
    const rg = this.ctx.createGain();
    rg.gain.setValueAtTime(0.6, t);
    rg.gain.exponentialRampToValueAtTime(0.001, t + 2);
    rumble.connect(rf).connect(rg).connect(this.master);
    rumble.start(t); rumble.stop(t + 2);

    // Crash (bright noise burst)
    const crash = this.ctx.createBufferSource();
    crash.buffer = this.noiseBuffer;
    const cf = this.ctx.createBiquadFilter();
    cf.type = 'highpass'; cf.frequency.value = 1000;
    const cg = this.ctx.createGain();
    cg.gain.setValueAtTime(0.5, t);
    cg.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    crash.connect(cf).connect(cg).connect(this.master);
    crash.start(t); crash.stop(t + 0.8);
  },

  playPowerup() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // Ascending arpeggio
    const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const start = t + i * 0.08;
      g.gain.setValueAtTime(0.001, start);
      g.gain.exponentialRampToValueAtTime(0.2, start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
      osc.connect(g).connect(this.master);
      osc.start(start); osc.stop(start + 0.3);
    });
  },
};
