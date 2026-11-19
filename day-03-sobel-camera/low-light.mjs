// exposureTime uses 100 microseconds per unit (1000 units = 100 ms).
export function clampExposure(value,range) {
 const step=range.step>0?range.step:1;
 const max=Math.max(range.min,Math.min(range.max,1000));
 const steps=Math.floor((max-range.min)/step);
 return range.min+Math.max(0,Math.min(steps,Math.round((value-range.min)/step)))*step;
}
export class ExposureController {
 constructor(track) {
  this.track=track;this.enabled=true;this.mode='software';this.last=-Infinity;
  this.original={};this.caps={};this.changed=false;this.pending=null;this.disposed=false;this.revision=0;
  this.reason='실제 노출 제어 미지원';
  try {this.original={...track?.getSettings?.()};this.caps=track?.getCapabilities?.()||{};}catch { /* Optional API. */ }
  const r=this.caps.exposureTime;
  // Without readable original settings we cannot promise restoration.
  this.manual=!!(track?.applyConstraints && this.original.exposureMode && Number.isFinite(this.original.exposureTime) && this.caps.exposureMode?.includes('manual') && r && Number.isFinite(r.min) && Number.isFinite(r.max) && r.min>0 && r.max>=r.min);
  this.continuous=!!(track?.applyConstraints && this.original.exposureMode && this.caps.exposureMode?.includes('continuous'));
  if(this.manual)this.reason='밝기 감시 중 · 어두워지면 실제 노출 조절';
 }
 async restore() {
  if(!this.changed || this.track?.readyState==='ended')return;
  try {
   // Restore time in manual mode first; auto modes may reject exposureTime.
   if(this.manual && Number.isFinite(this.original.exposureTime))await this.track.applyConstraints({advanced:[{exposureMode:'manual',exposureTime:this.original.exposureTime}]});
   if(this.original.exposureMode)await this.track.applyConstraints({advanced:[{exposureMode:this.original.exposureMode}]});
   const restored=this.track.getSettings();
   if(restored.exposureMode!==this.original.exposureMode || (this.original.exposureMode==='manual' && Math.abs(restored.exposureTime-this.original.exposureTime)>Math.max(1,this.caps.exposureTime?.step||1)/2))throw Error('restore ignored');
   this.changed=false;
  }catch {this.reason='원래 노출 복원 실패 · 카메라를 다시 시작하세요.';}
 }
 async update(luminance,now) {
  if(!this.enabled || this.disposed || this.pending || this.failed || now-this.last<1200 || this.track?.readyState==='ended')return;
  this.last=now;const revision=this.revision;
  const work=async()=>{
   try {
    let settings=this.track?.getSettings?.()||{};
    if(this.manual) {
     // Leave the device's existing auto exposure alone until dark.
     if(this.mode!=='manual' && luminance>=.14)return;
     const current=settings.exposureTime||this.caps.exposureTime.min;
     const range=this.caps.exposureTime,step=range.step>0?range.step:1;
     const target=luminance<.14?Math.max(current*1.4,current+step):luminance>.26?Math.min(current/1.4,current-step):current;
     const value=clampExposure(target,range);
     if(value===current && this.mode==='manual')return;
     this.changed=true;
     await this.track.applyConstraints({advanced:[{exposureMode:'manual',exposureTime:value}]});
     settings=this.track.getSettings();
     if(settings.exposureMode!=='manual' || !Number.isFinite(settings.exposureTime) || Math.abs(settings.exposureTime-value)>Math.max(1,this.caps.exposureTime.step||1)/2)throw Error('확인');
     if(this.enabled && !this.disposed && revision===this.revision){this.mode='manual';this.exposureTime=settings.exposureTime;}
    }else if(this.continuous && this.mode!=='continuous') {
     if(settings.exposureMode!=='continuous'){this.changed=true;await this.track.applyConstraints({advanced:[{exposureMode:'continuous'}]});}
     if(this.track.getSettings().exposureMode!=='continuous')throw Error('확인');
     if(this.enabled && !this.disposed && revision===this.revision)this.mode='continuous';
    }
   }catch {
    this.failed=true;this.reason='실제 노출 적용/확인 실패';
    await this.restore();
    if(this.enabled && !this.disposed && revision===this.revision)this.mode='software';
   }
  };
  const pending=work();this.pending=pending;
  try{await pending;}finally{if(this.pending===pending)this.pending=null;}
 }
 async setEnabled(enabled) {
  this.revision++;this.enabled=enabled && !this.disposed;
  if(this.enabled){this.mode='software';this.last=-Infinity;return;}
  this.mode='off';
  const previous=this.pending;
  const restoring=(async()=>{await previous;await this.restore();})();
  this.pending=restoring;
  try{await restoring;}finally{if(this.pending===restoring)this.pending=null;}
 }
 dispose(){this.disposed=true;return this.setEnabled(false);}
}

// Normalized encoded-video luminance, not a calibrated lux measurement.
export function meanLuminance(data) {
 let sum=0;
 for(let i=0;i<data.length;i+=4)sum+=.299*data[i]+.587*data[i+1]+.114*data[i+2];
 return data.length ? sum/(data.length/4*255) : 0;
}
export function adaptiveGain(luminance, previous=1) {
 const target=Math.max(1,Math.min(4,.18/Math.max(.01,luminance)));
 return previous+(target-previous)*.2;
}
// Linear bounded gain keeps zero black and does not disproportionately lift noise.
export const compensate=(value,gain=1)=>Math.min(1,Math.max(0,value)*gain);
