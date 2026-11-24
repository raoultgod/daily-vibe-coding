import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
test('provides camera controls, comparison, save and privacy guidance', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  for (const id of ['start', 'stop', 'save', 'compare', 'video', 'depth', 'status']) assert.match(html, new RegExp(`id="${id}"`));
  assert.match(html, /서버로 전송하지/);
  assert.match(html, /상대/);
});
