import { createRenderer } from './renderer.mjs';
import { CameraSession } from './camera.mjs';
import { ExposureController, adaptiveGain, meanLuminance } from './low-light.mjs';

const $=id=>document.getElementById(id);
const video=$('video'),canvas=$('output');
const renderer=createRenderer(canvas,new URLSearchParams(location.search).has('cpu'));
const camera=new CameraSession(constraints=>navigator.mediaDevices.getUserMedia(constraints));
const demo=document.createElement('canvas');demo.width=960;demo.height=540;
const dc=demo.getContext('2d');
let source=null,mode='sobel',request=0,frames=0,lastFPS=0,lastVideoTime=-1,epoch=0;
let pending=false,hasFrame=false;
let exposure=null,gain=1,luminance=null,lastMeter=-Infinity;
const meter=document.createElement('canvas');meter.width=32;meter.height=18;
const meterContext=meter.getContext('2d',{willReadFrequently:true});
function lightStatus(){
 const enabled=$('low-light').checked;
 const measured=luminance===null?'밝기 —':`밝기 ${Math.round(luminance*100)}%`;
 let text;
 if(!enabled)text='자동 보정 꺼짐';
 else if(!source)text='자동 보정 준비 · 입력 대기';
 else if(exposure?.mode==='manual')text=`실제 노출 ${(exposure.exposureTime/10).toFixed(1)} ms`;
 else if(exposure?.mode==='continuous')text='카메라 연속 자동 노출 + 소프트웨어 보정';
 else text=`소프트웨어 보정 · ${source==='demo'?'데모 · 실제 노출 제어 없음':exposure?.reason||'실제 노출 제어 미지원'}`;
 $('light-status').textContent=`${text} · ${measured} · 보정 ${gain.toFixed(1)}×${!enabled && exposure?.reason.includes('복원 실패')?' · '+exposure.reason:''}`;
 $('light-status').dataset.gain=String(gain);
}
function measureLight(input){
 const now=performance.now();if(now-lastMeter<250)return;lastMeter=now;
 meterContext.drawImage(input,0,0,32,18);
 luminance=meanLuminance(meterContext.getImageData(0,0,32,18).data);
 const active=exposure;
 if($('low-light').checked){
  gain=active?.mode==='manual'?1:adaptiveGain(luminance,gain);
  active?.update(luminance,now).then(()=>{if(active===exposure){if(active.mode==='manual')gain=1;lightStatus();}});
 }else gain=1;
 lightStatus();
}
const options=()=>({mode,intensity:Number($('intensity').value),mirror:$('mirror').checked,gain});
const status=text=>{$('status').textContent=text;};
$('engine').textContent=renderer.engine;

function drawDemo(time){
 const t=time/1000,w=demo.width,h=demo.height;
 dc.fillStyle='#14243a';dc.fillRect(0,0,w,h);
 const grad=dc.createLinearGradient(0,0,w,h);grad.addColorStop(0,'#386c80');grad.addColorStop(1,'#171c30');dc.fillStyle=grad;dc.fillRect(0,0,w,h);
 dc.strokeStyle='#5c8391';dc.lineWidth=1;
 for(let x=0;x<w;x+=48){dc.beginPath();dc.moveTo(x,0);dc.lineTo(x,h);dc.stroke();}
 for(let y=0;y<h;y+=48){dc.beginPath();dc.moveTo(0,y);dc.lineTo(w,y);dc.stroke();}
 dc.save();dc.translate(w*.32+Math.sin(t*.7)*55,h*.49);dc.rotate(t*.22);dc.fillStyle='#d5fa70';dc.fillRect(-105,-105,210,210);dc.strokeStyle='#fff';dc.lineWidth=8;dc.strokeRect(-80,-80,160,160);dc.restore();
 dc.beginPath();dc.arc(w*.7,h*.45+Math.sin(t)*65,95,0,Math.PI*2);dc.fillStyle='#ea8758';dc.fill();
 dc.beginPath();dc.moveTo(530,420);dc.lineTo(620+Math.sin(t)*35,280);dc.lineTo(760,420);dc.closePath();dc.strokeStyle='#e7eced';dc.lineWidth=6;dc.stroke();
 dc.fillStyle='#fff';dc.font='bold 29px monospace';dc.fillText('FIND YOUR EDGE.',45,470);
 dc.fillStyle='#a3b5b6';dc.font='13px monospace';dc.fillText('LIVE DEMO / NO CAMERA REQUIRED',46,499);
 if($('dark-demo').checked){dc.fillStyle='rgba(0,0,0,.94)';dc.fillRect(0,0,w,h);}
}
function render(){
 if(!source)return false;
 const input=source==='demo'?demo:video;
 measureLight(input);
 const rendered=renderer.render(input,options());
 if(rendered){hasFrame=true;$('capture').disabled=false;$('empty').hidden=true;$('resolution').textContent=`${canvas.width} × ${canvas.height}`;$('engine').textContent=renderer.engine;}
 return rendered;
}
function loop(time){
 if(!source)return;
 if(source==='demo'){drawDemo(time);if(render())frames++;}
 else if(video.readyState>=2 && video.currentTime!==lastVideoTime){lastVideoTime=video.currentTime;if(render())frames++;}
 if(time-lastFPS>=1000){$('fps').textContent=String(Math.round(frames*1000/(time-lastFPS)));frames=0;lastFPS=time;}
 request=requestAnimationFrame(loop);
}
function running(kind){
 source=kind;pending=false;$('start').disabled=false;$('stop').disabled=false;
 $('source-label').textContent=kind==='demo'?'DEMO · LIVE':'CAMERA · LIVE';$('live-dot').classList.add('active');
 frames=0;lastFPS=performance.now();lastVideoTime=-1;request=requestAnimationFrame(loop);
}
function stop(message='정지됨. 마지막 프레임은 저장할 수 있습니다.'){
 epoch++;pending=false;source=null;exposure?.dispose();exposure=null;gain=1;luminance=null;lastMeter=-Infinity;lightStatus();camera.stop();cancelAnimationFrame(request);video.pause();video.srcObject=null;
 $('start').disabled=false;$('stop').disabled=true;$('fps').textContent='—';$('source-label').textContent='STANDBY';$('live-dot').classList.remove('active');
 status(message);
}
function startDemo(){stop('데모 실행 중 · 카메라 없이 실시간 Sobel 필터를 체험하세요.');running('demo');}
const errorMessages={NotAllowedError:'카메라 권한이 거부되었습니다. 브라우저 주소창의 사이트 권한에서 카메라를 허용한 뒤 다시 시작하세요.',NotFoundError:'사용할 수 있는 카메라가 없습니다. 카메라를 연결하거나 데모를 이용하세요.',NotReadableError:'카메라를 열 수 없습니다. 다른 앱에서 카메라를 사용 중인지 확인하세요.',OverconstrainedError:'선택한 카메라를 사용할 수 없습니다. 다른 카메라를 선택하세요.',SecurityError:'브라우저 보안 설정이 카메라 접근을 차단했습니다.'};
async function startCamera(){
 stop('카메라 권한을 기다리고 있습니다. 정지를 누르면 연결을 취소합니다.');
 if(!window.isSecureContext){status('카메라는 HTTPS 또는 localhost에서만 작동합니다. 보안 주소로 접속하거나 데모를 이용하세요.');return;}
 if(!navigator.mediaDevices?.getUserMedia){status('이 브라우저는 카메라 API를 지원하지 않습니다. 최신 브라우저 또는 데모를 이용하세요.');return;}
 const current=epoch, selected=$('device').value;pending=true;$('start').disabled=true;$('stop').disabled=false;
 const selection=['user','environment'].includes(selected)?{facingMode:{ideal:selected}}:{deviceId:{exact:selected}};
 try {
   const accepted=await camera.start({audio:false,video:{...selection,width:{ideal:1280},height:{ideal:720}}},async stream=>{
     video.srcObject=stream;await video.play();
   });
   if(!accepted||current!==epoch)return;
   exposure=new ExposureController(camera.stream.getVideoTracks()[0]);
   if(!$('low-light').checked)await exposure.setEnabled(false);
   if(current!==epoch)return;
   running('camera');status('카메라 실행 중 · 영상은 기기 안에서만 처리됩니다.');
   camera.stream.getVideoTracks().forEach(track=>track.addEventListener('ended',()=>{if(current===epoch)stop('카메라 연결이 종료되었습니다. 장치를 확인하고 다시 시작하세요.');},{once:true}));
   await listDevices();
 } catch(error){if(current!==epoch)return;stop(errorMessages[error.name]||'카메라 연결에 실패했습니다. 브라우저 권한과 장치를 확인하거나 데모를 이용하세요.');}
}
async function listDevices(){
 if(!navigator.mediaDevices?.enumerateDevices)return;
 try {
  const devices=(await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==='videoinput');
  const selected=$('device').value;
  const base=[new Option('전면 카메라','user'),new Option('후면 카메라','environment')];
  devices.filter(d=>d.deviceId).forEach((d,i)=>base.push(new Option(d.label||`카메라 ${i+1}`,d.deviceId)));
  $('device').replaceChildren(...base);
  if(base.some(o=>o.value===selected))$('device').value=selected;
  else if(source==='camera'||pending)stop('선택한 카메라가 연결 해제되었습니다. 다른 장치를 선택하세요.');
 } catch { /* Enumeration may be blocked before permission; facing-mode choices remain. */ }
}
$('start').addEventListener('click',startCamera);
$('stop').addEventListener('click',()=>stop());
$('demo').addEventListener('click',startDemo);$('demo-switch').addEventListener('click',startDemo);
$('device').addEventListener('change',()=>{if(source==='camera'||pending)startCamera();});
for(const button of document.querySelectorAll('[data-mode]'))button.addEventListener('click',()=>{
 mode=button.dataset.mode;
 document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 $('mode-label').textContent={original:'ORIGINAL',sobel:'SOBEL',split:'SPLIT VIEW'}[mode];$('split-marker').hidden=mode!=='split';render();
});
$('intensity').addEventListener('input',()=>{$('intensity-value').textContent=`${Number($('intensity').value).toFixed(1)}×`;render();});
$('mirror').addEventListener('change',render);
$('low-light').addEventListener('change',()=>{
 const active=exposure;
 active?.setEnabled($('low-light').checked).then(()=>{if(active===exposure)lightStatus();});
 gain=1;lastMeter=-Infinity;lightStatus();render();
});
$('dark-demo').addEventListener('change',()=>{lastMeter=-Infinity;});
$('capture').addEventListener('click',()=>{
 if(!hasFrame)return;
 canvas.toBlob(blob=>{
  if(!blob){status('이미지 저장에 실패했습니다. 다시 시도하세요.');return;}
  const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`edge-lab-${new Date().toISOString().replace(/[:.]/g,'-')}.png`;link.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
  status('PNG 저장을 요청했습니다. 브라우저의 다운로드 목록을 확인하세요.');
 },'image/png');
});
window.addEventListener('pagehide',()=>stop('페이지를 떠나 카메라를 종료했습니다. 다시 시작할 수 있습니다.'));
navigator.mediaDevices?.addEventListener('devicechange',listDevices);
listDevices();
