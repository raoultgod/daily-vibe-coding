const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
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
