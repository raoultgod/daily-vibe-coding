(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Pitch = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function detectPitch(samples, sampleRate) {
    if (!samples || !Number.isFinite(sampleRate) || sampleRate <= 0) return null;
    let mean = 0;
    for (const x of samples) mean += x;
    mean /= samples.length || 1;
    let power = 0;
    for (const x of samples) power += (x - mean) ** 2;
    if (Math.sqrt(power / (samples.length || 1)) < 0.01) return null;
    const minLag = Math.max(2, Math.floor(sampleRate / 1200));
    const maxLag = Math.min(Math.floor(sampleRate / 60), Math.floor(samples.length / 2) - 1);
    if (maxLag <= minLag) return null;
    const diff = new Float32Array(maxLag + 1);
    const window = samples.length - maxLag;
    for (let lag = 1; lag <= maxLag; lag++) {
      let sum = 0;
      for (let i = 0; i < window; i++) {
        const d = samples[i] - samples[i + lag];
        sum += d * d;
      }
      diff[lag] = sum;
    }
    let running = 0;
    for (let lag = 1; lag <= maxLag; lag++) {
      running += diff[lag];
      diff[lag] = running ? diff[lag] * lag / running : 1;
    }
    let lag = minLag;
    while (lag < maxLag && diff[lag] >= 0.15) lag++;
    if (lag === maxLag) return null;
    while (lag + 1 <= maxLag && diff[lag + 1] < diff[lag]) lag++;
    const left = diff[lag - 1], center = diff[lag], right = diff[lag + 1] ?? center;
    const denominator = left - 2 * center + right;
    const refined = lag + (denominator ? 0.5 * (left - right) / denominator : 0);
    return sampleRate / refined;
  }
  function noteFromFrequency(frequency) {
    if (!Number.isFinite(frequency) || frequency <= 0) return null;
    const midi = Math.round(69 + 12 * Math.log2(frequency / 440));
    const names = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
    return { name: names[((midi % 12) + 12) % 12], octave: Math.floor(midi / 12) - 1, cents: Math.round(1200 * Math.log2(frequency / (440 * 2 ** ((midi - 69) / 12)))) || 0 };
  }
  return { detectPitch, noteFromFrequency };
});
