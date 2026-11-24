import { test } from 'node:test';
import assert from 'node:assert/strict';
import { colorizeDepth } from '../src/depth.mjs';
test('colorizes a grayscale depth image with opaque distinguishable colors', () => {
  const rgba = colorizeDepth(Uint8Array.of(0, 128, 255));
  assert.equal(rgba.length, 12);
  assert.equal(rgba[3], 255);
  assert.equal(rgba[11], 255);
  assert.notDeepEqual([...rgba.slice(0, 3)], [...rgba.slice(8, 11)]);
});
