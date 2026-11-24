import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSession, loadWithFallback } from '../src/session.mjs';
test('falls back to wasm when webgpu initialization fails', async () => {
  const calls = [];
  const result = await loadWithFallback(async device => { calls.push(device); if (device === 'webgpu') throw Error('no gpu'); return 'model'; }, true);
  assert.deepEqual(calls, ['webgpu', 'wasm']);
  assert.deepEqual(result, { model: 'model', device: 'wasm' });
});
test('stopping while permission is pending releases the late stream', async () => {
  let resolve; let stopped = 0;
  const session = createSession(() => new Promise(r => { resolve = r; }));
  const start = session.start();
  session.stop();
  resolve({ getTracks: () => [{ stop: () => stopped++ }] });
  assert.equal(await start, null);
  assert.equal(stopped, 1);
});
test('stop releases an active camera', async () => {
  let stopped = 0;
  const session = createSession(async () => ({ getTracks: () => [{ stop: () => stopped++ }] }));
  await session.start(); session.stop(); session.stop();
  assert.equal(stopped, 1);
});
