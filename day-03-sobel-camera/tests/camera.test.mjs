import test from 'node:test';
import assert from 'node:assert/strict';
test('stopping pending camera acquisition stops late tracks and never adopts them', async()=>{
 const { CameraSession }=await import('../camera.mjs');
 let resolve,stopped=0,adopted=0;
 const camera=new CameraSession(()=>new Promise(r=>resolve=r));
 const pending=camera.start({},()=>adopted++);
 camera.stop(); resolve({getTracks:()=>[{stop(){stopped++}}]});
 await pending;
 assert.equal(stopped,1);assert.equal(adopted,0);assert.equal(camera.stream,null);
});
