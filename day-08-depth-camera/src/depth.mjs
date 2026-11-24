// Purple (far) → cyan → yellow (near). Values are relative, not meters.
export function colorizeDepth(values) {
  const output = new Uint8ClampedArray(values.length * 4);
  for (let i = 0; i < values.length; i++) {
    const t = values[i] / 255;
    const stops = t < 0.5 ? [[32, 13, 77], [30, 200, 210], t * 2] : [[30, 200, 210], [255, 229, 90], (t - 0.5) * 2];
    for (let c = 0; c < 3; c++) output[i * 4 + c] = stops[0][c] * (1 - stops[2]) + stops[1][c] * stops[2];
    output[i * 4 + 3] = 255;
  }
  return output;
}
