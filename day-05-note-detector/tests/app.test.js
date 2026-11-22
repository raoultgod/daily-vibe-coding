const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
test('mounted app schedules and cancels frames with the window receiver', async () => {
  const { mount } = require('../app.js');
  const saved = {};
  for (const key of ['window', 'document', 'navigator', 'Pitch', 'requestAnimationFrame', 'cancelAnimationFrame']) {
    saved[key] = Object.getOwnPropertyDescriptor(globalThis, key);
  }
  const elements = Object.fromEntries(['toggle', 'status', 'note', 'frequency', 'tuning'].map(id => [id, {
    textContent: '', setAttribute() {}, addEventListener(type, handler) { this[type] = handler; }
  }]));
  let cancelled = 0, stopped = 0;
  const win = {
    isSecureContext: true,
    addEventListener() {},
    requestAnimationFrame(callback) { assert.equal(this, win, 'requestAnimationFrame receiver'); return 42; },
    cancelAnimationFrame(id) { assert.equal(this, win, 'cancelAnimationFrame receiver'); assert.equal(id, 42); cancelled++; },
    AudioContext: class {
      createMediaStreamSource() { return { connect() {}, disconnect() {} }; }
      createAnalyser() { return { disconnect() {} }; }
      close() { return Promise.resolve(); }
    }
  };
  const globals = {
    window: win, document: { getElementById: id => elements[id] },
    navigator: { mediaDevices: { getUserMedia: async () => ({ getTracks: () => [{ stop() { stopped++; } }] }) } },
    Pitch: { detectPitch() {}, noteFromFrequency() {} },
    requestAnimationFrame: win.requestAnimationFrame, cancelAnimationFrame: win.cancelAnimationFrame
  };
  try {
    for (const [key, value] of Object.entries(globals)) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    mount();
    elements.toggle.click();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(elements.status.textContent, '소리를 기다리는 중');
    elements.toggle.click();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(cancelled, 1);
    assert.equal(stopped, 1);
    assert.equal(elements.status.textContent, '마이크가 꺼져 있습니다');
  } finally {
    for (const [key, descriptor] of Object.entries(saved)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});

test('app exposes microphone controller', () => {
  assert.ok(fs.existsSync(path.join(__dirname, '../app.js')), 'microphone controller exists');
  assert.equal(typeof require('../app.js').createController, 'function');
});
test('stopping releases microphone tracks and audio context', async () => {
  const { createController } = require('../app.js');
  let stopped = 0, closed = 0;
  const stream = { getTracks: () => [{ stop: () => stopped++ }] };
  const context = { createMediaStreamSource: () => ({ connect() {}, disconnect() {} }), createAnalyser: () => ({ fftSize: 0, disconnect() {}, getFloatTimeDomainData() {} }), close: () => { closed++; return Promise.resolve(); }, sampleRate: 44100 };
  const controller = createController({ getStream: async () => stream, makeContext: () => context, requestFrame: () => 1, cancelFrame() {}, onState() {} });
  await controller.start();
  await controller.stop();
  assert.equal(stopped, 1);
  assert.equal(closed, 1);
});
test('permission errors are surfaced', async () => {
  const { createController } = require('../app.js');
  const states = [];
  const controller = createController({ getStream: async () => { throw Object.assign(new Error(), { name: 'NotAllowedError' }); }, onState: state => states.push(state) });
  await controller.start();
  assert.equal(states.at(-1).error, 'NotAllowedError');
});
test('a microphone acquired after stopping is immediately released', async () => {
  const { createController } = require('../app.js');
  let resolve, stopped = 0;
  const controller = createController({ getStream: () => new Promise(r => { resolve = r; }), onState() {} });
  const starting = controller.start();
  await controller.stop();
  resolve({ getTracks: () => [{ stop: () => stopped++ }] });
  await starting;
  assert.equal(stopped, 1);
});
