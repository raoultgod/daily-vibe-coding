import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Netlify dependency installation skips unnecessary Node CUDA binaries', async () => {
  const config = await readFile(new URL('../netlify.toml', import.meta.url), 'utf8');
  assert.match(config, /ONNXRUNTIME_NODE_INSTALL_CUDA\s*=\s*["']skip["']/);
});
