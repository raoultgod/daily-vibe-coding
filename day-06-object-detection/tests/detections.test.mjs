import test from 'node:test';
import assert from 'node:assert/strict';
import { filterDetections, mapBoxToCanvas } from '../src/detections.mjs';

test('filters detections below the confidence threshold and sorts strongest first', () => {
  const boxes = [
    { name: 'cup', conf: 0.51, x1: 0, y1: 0, x2: 10, y2: 10 },
    { name: 'book', conf: 0.89, x1: 0, y1: 0, x2: 10, y2: 10 },
    { name: 'cat', conf: 0.49, x1: 0, y1: 0, x2: 10, y2: 10 },
  ];
  assert.deepEqual(filterDetections(boxes, 0.5).map(({ name }) => name), ['book', 'cup']);
});

test('maps model coordinates to a differently sized canvas', () => {
  assert.deepEqual(
    mapBoxToCanvas({ x1: 10, y1: 20, x2: 90, y2: 80, name: 'cup', conf: 0.876 }, 100, 100, 200, 150),
    { x: 20, y: 30, width: 160, height: 90, label: 'cup 88%' },
  );
});

test('clamps boxes to the visible canvas and rejects invalid source dimensions', () => {
  assert.deepEqual(
    mapBoxToCanvas({ x1: -10, y1: 5, x2: 120, y2: 90, name: 'person', conf: 0.5 }, 100, 100, 100, 100),
    { x: 0, y: 5, width: 100, height: 85, label: 'person 50%' },
  );
  assert.equal(mapBoxToCanvas({ x1: 0, y1: 0, x2: 1, y2: 1, name: 'x', conf: 1 }, 0, 100, 100, 100), null);
});
