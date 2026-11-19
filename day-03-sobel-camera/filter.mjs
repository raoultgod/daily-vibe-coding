// CPU reference and fallback. Clamp sampling at the image boundary.
export function sobelRGBA(data, width, height, intensity = 1) {
  const out = new Uint8ClampedArray(data.length);
  const gray = new Float32Array(width * height);
  for (let p=0; p<gray.length; p++) gray[p] = .299*data[p*4]+.587*data[p*4+1]+.114*data[p*4+2];
  const at=(x,y)=>gray[Math.max(0,Math.min(height-1,y))*width+Math.max(0,Math.min(width-1,x))];
  for(let y=0;y<height;y++) for(let x=0;x<width;x++) {
    const a=at(x-1,y-1), b=at(x,y-1), c=at(x+1,y-1), d=at(x-1,y), f=at(x+1,y), g=at(x-1,y+1), h=at(x,y+1), i=at(x+1,y+1);
    const edge=Math.hypot(-a+c-2*d+2*f-g+i,-a-2*b-c+g+2*h+i)*intensity;
    const p=(y*width+x)*4; out[p]=out[p+1]=out[p+2]=edge; out[p+3]=255;
  }
  return out;
}
