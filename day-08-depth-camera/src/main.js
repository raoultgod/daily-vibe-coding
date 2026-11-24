import { pipeline, RawImage, env } from '@huggingface/transformers';
import { colorizeDepth } from './depth.mjs';
import { createSession, loadWithFallback } from './session.mjs';
import './style.css';

const $ = id => document.getElementById(id);
const video = $('video'), depth = $('depth'), original = $('original');
const context = depth.getContext('2d'), originalContext = original.getContext('2d');
const frame = document.createElement('canvas'), frameContext = frame.getContext('2d');
const session = createSession(() => navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false }));
let generation = 0, active = false, estimator = null, device = '', loading = null, hasFrame = false;
env.allowLocalModels = false;
function status(text) { $('status').textContent = text; }
function buttons() { $('start').disabled = active; $('stop').disabled = !active; $('save').disabled = !hasFrame; }
function compare() { $('view').classList.toggle('compare', $('compare').checked && hasFrame); original.hidden = !$('compare').checked || !hasFrame; }
async function load(deviceName) {
  status(deviceName === 'webgpu' ? 'WebGPU로 모델을 불러오는 중이에요…' : 'WASM으로 모델을 불러오는 중이에요. 처음에는 시간이 걸릴 수 있어요…');
  return pipeline('depth-estimation', 'onnx-community/depth-anything-v2-small-ONNX', { device: deviceName, dtype: 'fp32' });
}
async function getModel() {
  if (estimator) return;
  if (!loading) loading = loadWithFallback(load, !!navigator.gpu).then(result => { estimator = result.model; device = result.device; }).finally(() => { loading = null; });
  await loading;
}
function stop(message = '카메라가 꺼졌어요.') {
  generation++; active = false; session.stop(); video.pause(); video.srcObject = null;
  $('backend').textContent = '대기 중'; status(message); buttons();
}
async function render(id) {
  while (active && id === generation) {
    if (!video.videoWidth) { await new Promise(resolve => setTimeout(resolve, 100)); continue; }
    const width = 384, height = Math.max(1, Math.round(width * video.videoHeight / video.videoWidth));
    frame.width = width; frame.height = height; frameContext.drawImage(video, 0, 0, width, height);
    let result;
    try { result = await estimator(RawImage.fromCanvas(frame)); }
    catch (error) {
      if (device !== 'webgpu' || id !== generation) throw error;
      status('WebGPU 추론에 실패해 WASM으로 다시 시도합니다…');
      estimator = await load('wasm'); device = 'wasm';
      if (!active || id !== generation) return;
      result = await estimator(RawImage.fromCanvas(frame));
    }
    if (!active || id !== generation) return;
    const image = result.depth;
    depth.width = image.width; depth.height = image.height;
    context.putImageData(new ImageData(colorizeDepth(image.data), image.width, image.height), 0, 0);
    original.width = width; original.height = height; originalContext.drawImage(frame, 0, 0);
    hasFrame = true; $('placeholder').hidden = true; $('backend').textContent = device.toUpperCase() + ' · 실행 중';
    status('깊이를 분석하고 있어요. 색상은 상대적인 거리입니다.'); buttons(); compare();
    await new Promise(resolve => requestAnimationFrame(resolve));
  }
}
$('start').addEventListener('click', async () => {
  if (active) return;
  active = true; const id = ++generation; hasFrame = false; buttons(); compare(); $('placeholder').hidden = false;
  try {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('이 환경에서는 카메라를 사용할 수 없어요. HTTPS 또는 localhost에서 열어 주세요.');
    status('카메라 권한을 확인하고 있어요…');
    const stream = await session.start();
    if (!stream || id !== generation) return;
    video.srcObject = stream; await video.play();
    if (id !== generation) return;
    await getModel();
    if (id !== generation) return;
    await render(id);
  } catch (error) {
    if (id !== generation) return;
    console.error(error);
    const message = error.name === 'NotAllowedError' ? '카메라 권한이 거부되었어요. 브라우저 설정에서 권한을 허용해 주세요.' : error.name === 'NotFoundError' ? '카메라를 찾을 수 없어요. 연결을 확인해 주세요.' : `실행하지 못했어요: ${error.message || '다시 시도해 주세요.'}`;
    stop(message);
  }
});
$('stop').addEventListener('click', () => stop());
$('compare').addEventListener('change', compare);
$('save').addEventListener('click', () => {
  if (!hasFrame) return;
  const output = document.createElement('canvas');
  output.width = depth.width * ($('compare').checked ? 2 : 1); output.height = depth.height;
  const ctx = output.getContext('2d');
  if ($('compare').checked) ctx.drawImage(original, 0, 0, depth.width, depth.height);
  ctx.drawImage(depth, $('compare').checked ? depth.width : 0, 0);
  const link = document.createElement('a'); link.download = 'depth-camera.png'; link.href = output.toDataURL('image/png'); link.click();
});
window.addEventListener('pagehide', () => stop());
buttons();
