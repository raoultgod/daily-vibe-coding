import {initEngine,HwpDoc,resetEngine} from './engine/index.js';
const $=id=>document.getElementById(id); let doc=null, currentName='', fontBytes, busy=false;
const status=t=>$('status').textContent=t;
async function openFile(file){
 if(!file||busy)return; if(!file.name.toLowerCase().endsWith('.hwpx')){$('error').textContent='HWPX 파일을 선택해 주세요.';return;}
 busy=true; $('pdf').disabled=true; $('error').textContent=''; status('문서 여는 중…');
 let next=null;
 try{
  await initEngine(new URL('./engine/pkg/hwp_wasm_bg.wasm',location.href).href);
  if(!fontBytes){const res=await fetch('./font.ttf');if(!res.ok)throw new Error('글꼴을 불러오지 못했습니다.');fontBytes=new Uint8Array(await res.arrayBuffer());}
  next=HwpDoc.open(new Uint8Array(await file.arrayBuffer()),file.name); next.registerFont('NanumGothic',fontBytes);
  const count=next.pageCount(); if(!count)throw new Error('표시할 페이지가 없습니다.');
  const fragment=document.createDocumentFragment();for(let i=0;i<count;i++){const page=document.createElement('div');page.className='page';page.innerHTML=next.renderPageSvgSanitized(i);fragment.append(page);}
  if(doc)doc.free();doc=next;next=null;currentName=file.name;$('pages').replaceChildren(fragment);$('empty').classList.add('hidden');$('name').textContent=file.name;status(`${count}쪽 · 이 기기에서 처리됨`);$('pdf').disabled=false;
 }catch(e){if(next)next.free();if(e.code==='wasm_trap'){try{await resetEngine(new URL('./engine/pkg/hwp_wasm_bg.wasm',location.href).href)}catch{}doc=null;$('pages').replaceChildren();$('empty').classList.remove('hidden');} $('error').textContent='문서를 열지 못했습니다. 파일이 손상되었거나 지원하지 않는 형식일 수 있습니다.\n'+(e.message||e);status('열기 실패');$('pdf').disabled=!doc;}
 finally{busy=false;$('file').value='';}
}
$('file').addEventListener('change',e=>openFile(e.target.files[0]));
for(const type of ['dragenter','dragover'])document.addEventListener(type,e=>{e.preventDefault();$('drop').classList.add('drag')});for(const type of ['dragleave','drop'])document.addEventListener(type,e=>{e.preventDefault();$('drop').classList.remove('drag')});document.addEventListener('drop',e=>openFile(e.dataTransfer.files[0]));
$('pdf').addEventListener('click',async()=>{if(!doc||busy)return;busy=true;$('pdf').disabled=true;status('PDF 만드는 중…');await new Promise(r=>setTimeout(r,30));try{const bytes=doc.exportPdf();const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));const a=document.createElement('a');a.href=url;a.download=currentName.replace(/\.hwpx$/i,'')+'.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);status(`${doc.pageCount()}쪽 · PDF 저장 완료`);}catch(e){$('error').textContent='PDF 변환에 실패했습니다. '+(e.message||e);status('변환 실패');if(e.code==='wasm_trap'){doc=null;await resetEngine(new URL('./engine/pkg/hwp_wasm_bg.wasm',location.href).href);}}finally{busy=false;$('pdf').disabled=!doc;}});
