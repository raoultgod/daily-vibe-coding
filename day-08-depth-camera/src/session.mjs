export async function loadWithFallback(load, hasGpu) {
  if (hasGpu) {
    try { return { model: await load('webgpu'), device: 'webgpu' }; }
    catch (error) { console.warn('WebGPU unavailable, falling back to WASM', error); }
  }
  return { model: await load('wasm'), device: 'wasm' };
}
export function createSession(acquire) {
  let generation = 0, stream = null;
  const release = value => value?.getTracks().forEach(track => track.stop());
  return {
    async start() {
      const id = ++generation;
      release(stream); stream = null;
      const next = await acquire();
      if (id !== generation) { release(next); return null; }
      stream = next;
      return stream;
    },
    stop() { generation++; release(stream); stream = null; },
  };
}
