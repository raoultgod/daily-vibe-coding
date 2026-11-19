import test from 'node:test';
import assert from 'node:assert/strict';

function fakeTrack(caps={exposureMode:['continuous','manual'],exposureTime:{min:10,max:2000,step:10}}) {
 const settings={exposureMode:'continuous',exposureTime:100};
 return {settings,calls:[],readyState:'live',getCapabilities:()=>caps,getSettings:()=>({...settings}),async applyConstraints(c){this.calls.push(c);Object.assign(settings,c.advanced[0]);}};
}
test('darkness changes real exposure in bounded steps, throttles, uses hysteresis and restores original settings',async()=>{
 const {ExposureController,clampExposure}=await import('../low-light.mjs');
 assert.equal(clampExposure(147,{min:10,max:2000,step:10}),150);
 assert.equal(clampExposure(9999,{min:10,max:2000,step:10}),1000,'100 ms practical cap');
 assert.equal(clampExposure(-1,{min:10,max:100,step:10}),10);
 const track=fakeTrack(),c=new ExposureController(track);
 await c.update(.03,0);assert.equal(c.mode,'manual');assert.equal(track.settings.exposureTime,140);
 await c.update(.03,100);assert.equal(track.calls.length,1);
 await c.update(.20,1300);assert.equal(track.calls.length,1,'dead band');
 await c.update(.8,2600);assert.ok(track.settings.exposureTime<140);
 await c.setEnabled(false);assert.deepEqual(track.settings,{exposureMode:'continuous',exposureTime:100});
 assert.equal(c.mode,'off');
});

test('coarse exposure steps still increase a dark scene and decrease a bright scene',async()=>{
 const {ExposureController}=await import('../low-light.mjs');
 const track=fakeTrack({exposureMode:['manual'],exposureTime:{min:1,max:101,step:10}});track.settings.exposureTime=1;
 const c=new ExposureController(track);await c.update(.01,0);assert.equal(track.settings.exposureTime,11);
 await c.update(.9,1300);assert.equal(track.settings.exposureTime,1);
});

test('capability absence, invalid ranges, exceptions and ignored constraints safely use software',async()=>{
 const {ExposureController}=await import('../low-light.mjs');
 for(const track of [{}, {getCapabilities(){throw Error('blocked')}},fakeTrack({exposureMode:['manual'],exposureTime:{min:100,max:10}}),fakeTrack({})]) {
  const c=new ExposureController(track);await c.update(.01,0);assert.equal(c.mode,'software');
 }
 for(const ignored of [false,true]) {
  const track=fakeTrack();track.applyConstraints=async()=>{if(!ignored)throw Error('unsupported')};
  const c=new ExposureController(track);await c.update(.01,0);assert.equal(c.mode,'software');assert.match(c.reason,/실패|확인/);
  await c.setEnabled(false);assert.equal(c.mode,'off');
 }
});
test('native continuous exposure is requested when manual is unavailable and original mode is restored',async()=>{
 const {ExposureController}=await import('../low-light.mjs');
 const track=fakeTrack({exposureMode:['continuous']});track.settings.exposureMode='single-shot';
 const c=new ExposureController(track);await c.update(.02,0);
 assert.equal(c.mode,'continuous');assert.equal(track.settings.exposureMode,'continuous');
 await c.setEnabled(false);assert.equal(track.settings.exposureMode,'single-shot');
});
test('pending adjustments are serialized and disabled or disposed sessions cannot publish stale modes',async()=>{
 const {ExposureController}=await import('../low-light.mjs');
 const track=fakeTrack();let finish;const apply=track.applyConstraints.bind(track);
 track.applyConstraints=c=>new Promise(resolve=>{finish=async()=>{await apply(c);resolve();};});
 const c=new ExposureController(track);const pending=c.update(.01,0);
 await c.update(.01,3000);assert.equal(track.calls.length,0);
 const disable=c.setEnabled(false);track.applyConstraints=apply;await finish();await pending;
 // Restoration is queued after the in-flight adjustment.
 await disable;
 assert.equal(c.mode,'off');assert.equal(track.settings.exposureMode,'continuous');
 track.applyConstraints=apply;await c.setEnabled(true);await c.update(.01,5000);assert.equal(c.mode,'manual');
 await c.dispose();await c.update(.01,9000);assert.equal(c.mode,'off');
 assert.equal(track.settings.exposureTime,100);
});

test('ignored restoration is reported rather than claiming original settings were restored',async()=>{
 const {ExposureController}=await import('../low-light.mjs');
 const track=fakeTrack();const c=new ExposureController(track);
 await c.update(.01,0);
 track.applyConstraints=async()=>{};
 await c.setEnabled(false);
 assert.match(c.reason,/복원 실패/);assert.equal(c.changed,true);
});

test('rapid off/on cannot publish stale exposure or overlap restoration with new adjustments',async()=>{
 const {ExposureController}=await import('../low-light.mjs');
 const track=fakeTrack(),resolvers=[];let calls=0;
 const apply=track.applyConstraints.bind(track);
 track.applyConstraints=c=>{calls++;return new Promise(resolve=>resolvers.push(async()=>{await apply(c);resolve();}));};
 const c=new ExposureController(track),old=c.update(.01,0);
 const off=c.setEnabled(false);await c.setEnabled(true);
 await resolvers.shift()();await old;await new Promise(r=>setImmediate(r));
 assert.equal(c.mode,'software','old completion cannot advertise manual');
 const during=c.update(.01,5000);assert.equal(calls,2,'restoration owns the constraint queue');
 track.applyConstraints=apply;await resolvers.shift()();await off;await during;
 await c.update(.01,7000);assert.equal(c.mode,'manual');
});

test('adaptive gain brightens dark detail smoothly but caps gain and never creates light from black', async()=>{
 const {adaptiveGain, compensate, meanLuminance}=await import('../low-light.mjs');
 let gain=1;
 for(let i=0;i<50;i++)gain=adaptiveGain(.03,gain);
 assert.ok(gain>2 && gain<=4);
 assert.equal(compensate(0,gain),0);
 assert.ok(compensate(.04,gain)>.04);
 assert.ok(adaptiveGain(.8,gain)<gain);
 assert.equal(adaptiveGain(.8,1),1);
 assert.ok(adaptiveGain(.01,1)<=1.6,'no abrupt gain jump');
 assert.equal(meanLuminance(new Uint8ClampedArray([0,0,0,255,255,255,255,255])),.5);
});
