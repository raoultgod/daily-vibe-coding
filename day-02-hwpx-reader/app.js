import init,{HwpDocument} from './rhwp/rhwp.js';
import DOMPurify from './vendor/purify.es.mjs';
const $=id=>document.getElementById(id);
let doc=null, busy=false, initialized=false;
const status=text=>$('status').textContent=text;
const canvas=document.createElement('canvas');
const context=canvas.getContext('2d');
const fallbackFamily=family=>family.replace(/,\s*(sans-serif|serif|monospace)\s*$/i,', Nanum, $1');
globalThis.measureTextWidth=(font,text)=>{context.font=fallbackFamily(font);return context.measureText(text).width};

// Document SVG is untrusted: allow only embedded raster images and local fragment links.
function safePage(svg,pageIndex){
 const wrapper=document.createElement('div');wrapper.className='page';
 wrapper.innerHTML=DOMPurify.sanitize(svg,{USE_PROFILES:{svg:true,svgFilters:true}});
 for(const text of wrapper.querySelectorAll('text,tspan')){
  const family=text.getAttribute('font-family');
  if(family)text.setAttribute('font-family',fallbackFamily(family));
  if(/[\uFF62\uFF63]/u.test(text.textContent))text.setAttribute('font-family',`HwpPunctuation, ${text.getAttribute('font-family')||'Nanum, sans-serif'}`);
 }
 // Each page's SVG IDs share the HTML document namespace; isolate them per page.
 const ids=new Map();
 for(const node of wrapper.querySelectorAll('[id]')){const old=node.id;const unique=`page-${pageIndex}-${old}`;ids.set(old,unique);node.id=unique;}
 for(const node of wrapper.querySelectorAll('*')){
  for(const attr of [...node.attributes]){
   let value=attr.value.replace(/url\(\s*#([^\s)]+)\s*\)/g,(all,id)=>ids.has(id)?`url(#${ids.get(id)})`:all);
   if(value.startsWith('#') && ids.has(value.slice(1)))value='#'+ids.get(value.slice(1));
   if(value!==attr.value)node.setAttribute(attr.name,value);
  }
 }
 for(const node of wrapper.querySelectorAll('*')){
  for(const attr of [...node.attributes]){
   const name=attr.name.toLowerCase(), value=attr.value.trim();
   if((name==='href'||name==='xlink:href'||name==='src') && !value.startsWith('#') && !/^data:image\/(?:png|jpeg|gif|webp);base64,/i.test(value)) node.removeAttribute(attr.name);
   if((name==='style'||name==='fill'||name==='filter'||name==='clip-path'||name==='mask') && /url\s*\(\s*['"]?(?!#)/i.test(value)) node.removeAttribute(attr.name);
  }
 }
 return wrapper;
}
async function openFile(file){
 if(!file||busy)return;
 if(!file.name.toLowerCase().endsWith('.hwpx')){$('error').textContent='HWPX 파일을 선택해 주세요.';return;}
 busy=true;$('pdf').disabled=true;$('error').textContent='';status('문서 여는 중…');let next=null;
 try{
  if(!initialized){await init({module_or_path:new URL('./rhwp/rhwp_bg.wasm',location.href).href});initialized=true;}
  await document.fonts.load('12px Nanum');
  next=new HwpDocument(new Uint8Array(await file.arrayBuffer()));const count=next.pageCount();
  if(!count)throw new Error('표시할 페이지가 없습니다.');
  const fragment=document.createDocumentFragment();
  for(let i=0;i<count;i++){
   fragment.append(safePage(next.renderPageSvg(i),i));
   if(i%2===1){status(`문서 여는 중… ${i+1}/${count}쪽`);await new Promise(resolve=>setTimeout(resolve,0));}
  }
  const first=fragment.querySelector('svg');
  if(!first)throw new Error('문서 페이지를 표시할 수 없습니다.');
  const width=parseFloat(first.getAttribute('width')),height=parseFloat(first.getAttribute('height'));
  if(width>0 && height>0 && width<10000 && height<10000) $('print-size').textContent=`@page { size: ${width}px ${height}px; margin: 0; }`;
  if(doc)doc.free();doc=next;next=null;$('pages').replaceChildren(fragment);$('empty').classList.add('hidden');$('name').textContent=file.name;document.title=file.name.replace(/\.hwpx$/i,'');status(`${count}쪽 · 이 기기에서 처리됨`);$('pdf').disabled=false;
 }catch(e){if(next)next.free();$('error').textContent='문서를 열지 못했습니다. 파일이 손상되었거나 지원하지 않는 형식일 수 있습니다.\n'+(e.message||e);status('열기 실패');$('pdf').disabled=!doc;}
 finally{busy=false;$('file').value='';}
}
$('file').addEventListener('change',e=>openFile(e.target.files[0]));
for(const type of ['dragenter','dragover'])document.addEventListener(type,e=>{e.preventDefault();$('drop').classList.add('drag')});
for(const type of ['dragleave','drop'])document.addEventListener(type,e=>{e.preventDefault();$('drop').classList.remove('drag')});
document.addEventListener('drop',e=>openFile(e.dataTransfer.files[0]));
$('pdf').addEventListener('click',async()=>{if(!doc||busy)return;status('인쇄 창에서 PDF로 저장을 선택하세요');await document.fonts.ready;window.print();});
