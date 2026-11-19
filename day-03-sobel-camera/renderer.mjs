import { sobelRGBA } from './filter.mjs';

const vertex = `attribute vec2 position; varying vec2 uv; void main(){uv=(position+1.0)*.5; gl_Position=vec4(position,0,1);}`;
const fragment = `precision mediump float;
uniform sampler2D image; uniform vec2 pixel; uniform float strength; uniform int mode; uniform bool mirror;
varying vec2 uv;
float gray(vec2 p){return dot(texture2D(image,p).rgb,vec3(.299,.587,.114));}
void main(){
 vec2 p=vec2(mirror ? 1.0-uv.x : uv.x,uv.y);
 vec4 original=texture2D(image,p);
 if(mode==0 || (mode==2 && uv.x<.5)){gl_FragColor=original;return;}
 float a=gray(p+pixel*vec2(-1,-1)),b=gray(p+pixel*vec2(0,-1)),c=gray(p+pixel*vec2(1,-1));
 float d=gray(p+pixel*vec2(-1,0)),f=gray(p+pixel*vec2(1,0));
 float g=gray(p+pixel*vec2(-1,1)),h=gray(p+pixel*vec2(0,1)),i=gray(p+pixel*vec2(1,1));
 vec2 gradient=vec2(-a+c-2.0*d+2.0*f-g+i,-a-2.0*b-c+g+2.0*h+i);
 gl_FragColor=vec4(vec3(clamp(length(gradient)*strength,0.0,1.0)),1);
}`;

export function createRenderer(canvas, forceCPU = false) {
  // Keep GPU rendering offscreen so context loss can fall back on the same UI canvas.
  const gpu=document.createElement('canvas');
  const gl=forceCPU ? null : gpu.getContext('webgl',{alpha:false,antialias:false,preserveDrawingBuffer:true});
  const ctx=canvas.getContext('2d',{alpha:false});
  const scratch=document.createElement('canvas');
  const scratchCtx=scratch.getContext('2d',{willReadFrequently:true});
  let program, uniforms, gpuOK=false;
  if(gl) try {
    const compile=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;};
    program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const pos=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
    gl.bindTexture(gl.TEXTURE_2D,gl.createTexture());
    for(const p of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D,p,gl.CLAMP_TO_EDGE);
    for(const p of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D,p,gl.NEAREST);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
    uniforms=Object.fromEntries(['image','pixel','strength','mode','mirror'].map(n=>[n,gl.getUniformLocation(program,n)]));
    gl.uniform1i(uniforms.image,0);gpuOK=true;
  } catch(error) { console.warn('WebGL 초기화 실패. CPU 모드로 전환합니다.',error); }
  gpu.addEventListener('webglcontextlost',event=>{event.preventDefault();gpuOK=false;});
  return {
    get engine(){return gpuOK ? 'WEBGL · GPU' : 'CPU · 절전 해상도';},
    render(source,{mode='sobel',intensity=1,mirror=false}={}) {
      const sw=source.videoWidth||source.width, sh=source.videoHeight||source.height;
      if(!sw||!sh)return false;
      const scale=Math.min(1,(gpuOK?1280:480)/sw,(gpuOK?720:360)/sh);
      const width=Math.max(1,Math.round(sw*scale)),height=Math.max(1,Math.round(sh*scale));
      if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
      if(gpuOK && !gl.isContextLost()) {
        if(gpu.width!==width||gpu.height!==height){gpu.width=width;gpu.height=height;}
        gl.viewport(0,0,width,height);gl.useProgram(program);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);
        gl.uniform2f(uniforms.pixel,1/sw,1/sh);gl.uniform1f(uniforms.strength,intensity);
        gl.uniform1i(uniforms.mode,{original:0,sobel:1,split:2}[mode]);gl.uniform1i(uniforms.mirror,mirror?1:0);
        gl.drawArrays(gl.TRIANGLES,0,6);ctx.drawImage(gpu,0,0);return true;
      }
      gpuOK=false;
      if(scratch.width!==width||scratch.height!==height){scratch.width=width;scratch.height=height;}
      scratchCtx.setTransform(mirror?-1:1,0,0,1,mirror?width:0,0);scratchCtx.drawImage(source,0,0,width,height);scratchCtx.resetTransform();
      const original=scratchCtx.getImageData(0,0,width,height);
      if(mode==='original'){ctx.putImageData(original,0,0);return true;}
      const edges=sobelRGBA(original.data,width,height,intensity);
      if(mode==='split') for(let y=0;y<height;y++) for(let x=0;x<width/2;x++){const p=(y*width+x)*4;edges.set(original.data.subarray(p,p+4),p);}
      ctx.putImageData(new ImageData(edges,width,height),0,0);return true;
    }
  };
}
