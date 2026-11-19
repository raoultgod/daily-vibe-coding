const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const url=process.env.TEST_URL||'http://localhost:8033';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:chromium.executablePath(),args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
 try {
 const page=await browser.newPage();
 await page.goto(url);
 const pixels=await page.evaluate(async()=>{
  const {createRenderer}=await import('./renderer.mjs');
  const {sobelRGBA}=await import('./filter.mjs');
  const src=document.createElement('canvas');src.width=8;src.height=8;
  const c=src.getContext('2d');c.fillStyle='#000';c.fillRect(0,0,8,8);c.fillStyle='rgb(40,40,40)';c.fillRect(4,0,4,8);
  const data=c.getImageData(0,0,8,8).data;
  const expected=[...sobelRGBA(data,8,8,1)];
  const result=[];
  for(const cpu of [false,true]){
   const out=document.createElement('canvas'),r=createRenderer(out,cpu);
   r.render(src,{mode:'sobel',intensity:1});const actual=[...out.getContext('2d').getImageData(0,0,8,8).data];
   r.render(src,{mode:'sobel',intensity:0});const zero=[...out.getContext('2d').getImageData(0,0,8,8).data];
   r.render(src,{mode:'original',mirror:true});const mirrored=[...out.getContext('2d').getImageData(0,0,8,8).data];
   result.push({engine:r.engine,maxError:Math.max(...actual.map((n,i)=>Math.abs(n-expected[i]))),zero:zero[12],mirrorLeft:mirrored[0],mirrorRight:mirrored[28]});
  }return result;
 });
 assert.match(pixels[0].engine,/GPU/);
 for(const p of pixels){assert.ok(p.maxError<=1,JSON.stringify(p));assert.equal(p.zero,0);assert.equal(p.mirrorLeft,40);assert.equal(p.mirrorRight,0);}
 console.log('PASS: GPU + CPU pixels match Sobel reference within 1/255; zero intensity and mirror correct',JSON.stringify(pixels));
 await page.getByRole('button',{name:'카메라 시작'}).click();
 await page.waitForFunction(()=>document.querySelector('#source-label').textContent==='CAMERA · LIVE');
 await page.waitForFunction(()=>document.querySelector('#capture').disabled===false);
 assert.ok(await page.locator('#video').evaluate(v=>v.srcObject.getVideoTracks().every(t=>t.readyState==='live')));
 await page.evaluate(()=>window.oldTracks=document.querySelector('#video').srcObject.getTracks());
 await page.locator('#device').selectOption('environment');
 await page.waitForFunction(()=>document.querySelector('#source-label').textContent==='CAMERA · LIVE');
 assert.ok(await page.evaluate(()=>window.oldTracks.every(t=>t.readyState==='ended')));
 await page.evaluate(()=>{window.activeTracks=document.querySelector('#video').srcObject.getTracks();window.dispatchEvent(new Event('pagehide'));});
 assert.ok(await page.evaluate(()=>window.activeTracks.every(t=>t.readyState==='ended')));
 console.log('PASS: fake camera start, active device switch stops prior tracks, pagehide stops all tracks');
 for(const [name,text] of [['NotAllowedError','권한이 거부'],['NotFoundError','카메라가 없습니다'],['NotReadableError','카메라를 열 수 없습니다']]){
  await page.evaluate(name=>{navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException('test',name)}},name);
  await page.getByRole('button',{name:'카메라 시작'}).click();
  await page.waitForFunction(text=>document.querySelector('#status').textContent.includes(text),text);
 }
 console.log('PASS: denied permission, missing camera and busy camera messages');
 await page.evaluate(()=>{window.lateStops=0;navigator.mediaDevices.getUserMedia=()=>new Promise(resolve=>{window.resolveCamera=()=>resolve({getTracks:()=>[{stop(){window.lateStops++}}]})});});
 await page.getByRole('button',{name:'카메라 시작'}).click();
 await page.getByRole('button',{name:'정지',exact:true}).click();
 await page.evaluate(()=>window.resolveCamera());await page.waitForTimeout(100);
 assert.equal(await page.evaluate(()=>window.lateStops),1);assert.equal(await page.locator('#source-label').textContent(),'STANDBY');
 console.log('PASS: pending permission cancellation disposes late stream');
 await page.goto(url+'?cpu');await page.getByRole('button',{name:'데모 체험'}).click();
 await page.waitForFunction(()=>document.querySelector('#fps').textContent!=='—');
 assert.match(await page.locator('#engine').textContent(),/CPU/);assert.ok(await page.locator('#output').evaluate(c=>c.width<=480));
 console.log('PASS: CPU fallback animated demo at capped resolution');
 const contextLoss=await page.evaluate(async()=>{
  const {createRenderer}=await import('./renderer.mjs');
  const original=HTMLCanvasElement.prototype.getContext;let gl;
  HTMLCanvasElement.prototype.getContext=function(type,...args){const value=original.call(this,type,...args);if(type==='webgl')gl=value;return value;};
  const out=document.createElement('canvas');const renderer=createRenderer(out);
  HTMLCanvasElement.prototype.getContext=original;
  const source=document.createElement('canvas');source.width=8;source.height=8;
  source.getContext('2d').fillRect(0,0,8,8);
  gl.getExtension('WEBGL_lose_context').loseContext();await new Promise(r=>setTimeout(r,100));
  renderer.render(source);return renderer.engine;
 });
 assert.match(contextLoss,/CPU/);console.log('PASS: WebGL context loss falls back to CPU');
 await page.reload();
 await page.evaluate(()=>Object.defineProperty(window,'isSecureContext',{value:false,configurable:true}));
 await page.getByRole('button',{name:'카메라 시작'}).click();
 assert.match(await page.locator('#status').textContent(),/HTTPS 또는 localhost/);
 await page.reload();
 await page.evaluate(()=>Object.defineProperty(navigator,'mediaDevices',{value:undefined,configurable:true}));
 await page.getByRole('button',{name:'카메라 시작'}).click();
 assert.match(await page.locator('#status').textContent(),/API를 지원하지/);
 console.log('PASS: insecure-origin and missing-camera-API guidance');
 await page.setViewportSize({width:1440,height:1000});await page.goto(url);await page.screenshot({path:'tests/desktop.png',fullPage:true});
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
