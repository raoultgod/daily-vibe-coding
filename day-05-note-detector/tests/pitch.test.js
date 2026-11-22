const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
test('pitch detector identifies A4', () => {
  assert.ok(fs.existsSync(require('node:path').join(__dirname, '../pitch.js')), 'pitch detector exists');
  const { detectPitch } = require('../pitch.js');
  const sampleRate = 44100;
  const samples = Float32Array.from({ length: 4096 }, (_, i) => 0.4 * Math.sin(2 * Math.PI * 440 * i / sampleRate));
  assert.ok(Math.abs(detectPitch(samples, sampleRate) - 440) < 1);
});
const { detectPitch, noteFromFrequency } = require('../pitch.js');
test('silence and steady offsets do not produce a pitch', () => {
  assert.equal(detectPitch(new Float32Array(4096), 44100), null);
  assert.equal(detectPitch(new Float32Array(4096).fill(0.2), 44100), null);
});
test('detects low and high notes at common sample rates', () => {
  for (const sampleRate of [44100, 48000]) for (const frequency of [82.41, 146.83, 261.63, 880]) {
    const samples = Float32Array.from({ length: 4096 }, (_, i) => 0.3 * Math.sin(2 * Math.PI * frequency * i / sampleRate));
    assert.ok(Math.abs(detectPitch(samples, sampleRate) - frequency) < frequency * 0.01, `${frequency} Hz at ${sampleRate}`);
  }
});
test('rejects deterministic broadband noise', () => {
  let state = 12345;
  const noise = Float32Array.from({ length: 4096 }, () => { state = (state * 1664525 + 1013904223) >>> 0; return (state / 2 ** 32 - 0.5) * 0.5; });
  assert.equal(detectPitch(noise, 44100), null);
});
test('maps frequency to pitch name, octave and cents', () => {
  assert.deepEqual(noteFromFrequency(440), { name: 'A', octave: 4, cents: 0 });
  assert.deepEqual(noteFromFrequency(261.625565), { name: 'C', octave: 4, cents: 0 });
  assert.equal(noteFromFrequency(0), null);
});
