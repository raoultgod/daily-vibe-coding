import test from 'node:test';
import assert from 'node:assert/strict';

test('Sobel detects a vertical edge and leaves a flat field black', async () => {
  const { sobelRGBA } = await import('../filter.mjs');
  const data = new Uint8ClampedArray(5 * 5 * 4);
  for (let y=0;y<5;y++) for(let x=0;x<5;x++) {
    const i=(y*5+x)*4; data[i]=data[i+1]=data[i+2]=x>=3?255:0; data[i+3]=255;
  }
  const result=sobelRGBA(data,5,5,1);
  assert.equal(result[(2*5+2)*4],255);
  assert.equal(result[(2*5)*4],0);
  assert.equal(result[(2*5+2)*4+3],255);
});
