// Run with HWPX_FIXTURES=/path/to/samples node tests/render-regression.mjs
// Required fixtures: msit.hwpx and uiwang.hwpx (public agency documents).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const app=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const fixtures=process.env.HWPX_FIXTURES;
if(!fixtures) throw Error('Set HWPX_FIXTURES to the directory containing msit.hwpx and uiwang.hwpx');
const {default:init,HwpDocument}=await import('../rhwp/rhwp.js');
globalThis.measureTextWidth=(_font,text)=>Array.from(text).length*8;
await init({module_or_path:fs.readFileSync(path.join(app,'rhwp/rhwp_bg.wasm'))});
const open=bytes=>{const doc=new HwpDocument(bytes);return {pages:doc.pageCount(),svg:i=>doc.renderPageSvg(i),free:()=>doc.free()}};
const countImages=s=>(s.match(/<image\b/g)||[]).length;
for(const [name,minimum] of [['msit',7],['uiwang',12]]){
 const d=open(new Uint8Array(fs.readFileSync(path.join(fixtures,name+'.hwpx'))),name+'.hwpx');
 let count=0;for(let i=0;i<d.pages;i++) count+=countImages(d.svg(i));
 d.free();console.log(name,'images',count,'expected >=',minimum);assert.ok(count>=minimum,`${name}: embedded images were lost`);
}
