const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const url=process.env.TEST_URL||'http://localhost:8033';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:chromium.executablePath(),args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try {
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url);
 const results=await page.evaluate(async()=>{
  const {createRenderer}=await import('./renderer.mjs');
  const src=document.createElement('canvas');src.width=8;src.height=8;const ctx=src.getContext('2d');
  ctx.fillStyle='rgb(4,4,4)';ctx.fillRect(0,0,8,8);ctx.fillStyle='rgb(12,12,12)';ctx.fillRect(4,0,4,8);
  const result=[];
  for(const cpu of [false,true]){
   const out=document.createElement('canvas'),r=createRenderer(out,cpu);
   const pixel=(x,y=3)=>out.getContext('2d').getImageData(x,y,1,1).data[0];
   r.render(src,{gain:1});const base=pixel(3);
   r.render(src,{gain:3});const boosted=pixel(3),flat=pixel(0);
   r.render(src,{mode:'original',gain:3});const original=pixel(0);
   r.render(src,{mode:'split',gain:3});const splitLeft=pixel(0),splitRight=pixel(4);
   ctx.save();ctx.fillStyle='black';ctx.fillRect(0,0,8,8);r.render(src,{gain:4});const black=pixel(3);ctx.restore();
   ctx.fillStyle='rgb(4,4,4)';ctx.fillRect(0,0,8,8);ctx.fillStyle='rgb(12,12,12)';ctx.fillRect(4,0,4,8);
   result.push({engine:r.engine,base,boosted,flat,original,splitLeft,splitRight,black});
  }return result;
 });
 assert.match(results[0].engine,/GPU/);
 for(const r of results){assert.equal(r.base,32);assert.ok(Math.abs(r.boosted-96)<=1,JSON.stringify(r));assert.equal(r.flat,0);assert.equal(r.original,4);assert.equal(r.splitLeft,4);assert.ok(Math.abs(r.splitRight-96)<=1);assert.equal(r.black,0);}
 console.log('PASS: compensation BEFORE Sobel on GPU/CPU, original/split raw, flat/black stay black',JSON.stringify(results));
 for(const suffix of ['', '?cpu']){
  await page.goto(url+suffix);
  assert.equal(await page.getByLabel('자동 저조도 보정',{exact:true}).isChecked(),true);
  await page.getByRole('button',{name:'데모 체험'}).click();
  await page.getByLabel('어두운 데모',{exact:true}).check();
  await page.waitForFunction(()=>/소프트웨어/.test(document.querySelector('#light-status').textContent) && /밝기 \d/.test(document.querySelector('#light-status').textContent) && Number(document.querySelector('#light-status').dataset.gain)>2);
  assert.match(await page.locator('#light-status').textContent(),/실제 노출.*미지원|데모/);
  await page.getByLabel('자동 저조도 보정',{exact:true}).uncheck();
  await page.waitForFunction(()=>document.querySelector('#light-status').textContent.includes('꺼짐'));
  assert.equal(await page.locator('#light-status').getAttribute('data-gain'),'1');
  await page.getByLabel('자동 저조도 보정',{exact:true}).check();
  await page.waitForFunction(()=>Number(document.querySelector('#light-status').dataset.gain)>2);
  for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`no overflow at ${width}`);}
 }
 // Canvas streams exercise app wiring; exposure APIs below are simulated, not hardware.
 for(const scenario of ['manual','unsupported','rejected','ignored','delayed']){
  await page.goto(url);
  await page.evaluate(scenario=>{
   const canvas=document.createElement('canvas');canvas.width=64;canvas.height=48;
   const ctx=canvas.getContext('2d');ctx.fillStyle='#080808';ctx.fillRect(0,0,64,48);
   const stream=canvas.captureStream(30),track=stream.getVideoTracks()[0];
   window.testTrack=track;window.testSettings={exposureMode:'continuous',exposureTime:100};
   track.getCapabilities=()=>scenario==='unsupported'?{}:{exposureMode:['manual','continuous'],exposureTime:{min:10,max:2000,step:10}};
   track.getSettings=()=>({...window.testSettings});
   track.applyConstraints=async c=>{
    if(scenario==='rejected')throw new DOMException('test','OverconstrainedError');
    if(scenario==='ignored')return;
    if(scenario==='delayed')await new Promise(resolve=>window.finishExposure=resolve);
    Object.assign(window.testSettings,c.advanced[0]);
   };
   navigator.mediaDevices.getUserMedia=async()=>stream;
  },scenario);
  await page.getByRole('button',{name:'카메라 시작'}).click();
  await page.waitForFunction(()=>document.querySelector('#source-label').textContent==='CAMERA · LIVE');
  if(scenario==='manual'){
   await page.waitForFunction(()=>/실제 노출 \d/.test(document.querySelector('#light-status').textContent));
   assert.match(await page.locator('#light-status').textContent(),/14.0 ms/);
   await page.getByLabel('자동 저조도 보정',{exact:true}).uncheck();
   await page.waitForFunction(()=>window.testSettings.exposureMode==='continuous');
   assert.equal(await page.evaluate(()=>window.testSettings.exposureTime),100);
  }else if(scenario==='delayed'){
   await page.waitForFunction(()=>!!window.finishExposure);
   await page.locator('#demo-switch').click();await page.evaluate(()=>window.finishExposure());
   await page.waitForFunction(()=>document.querySelector('#light-status').textContent.includes('데모'));
   assert.equal(await page.evaluate(()=>window.testTrack.readyState),'ended');
   assert.doesNotMatch(await page.locator('#light-status').textContent(),/실제 노출 \d/);
  }else{
   await page.waitForFunction(()=>document.querySelector('#light-status').textContent.includes('소프트웨어'));
   assert.doesNotMatch(await page.locator('#light-status').textContent(),/실제 노출 \d/);
  }
 }
 console.log('PASS: simulated camera manual 14 ms + restoration, unsupported/rejected/ignored fallback, delayed exposure cannot overwrite demo session');
 assert.deepEqual(errors,[]);console.log('PASS: GPU/CPU default auto toggle, dark demo luminance/gain status, off/on, 320/390/768/1440 layouts, no page errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
