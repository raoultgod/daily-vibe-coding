import { YOLO } from '@ultralytics/yolo';
import wasmUrl from '@ultralytics/yolo/pkg/ultralytics_inference_web_bg.wasm?url';
import { filterDetections, mapBoxToCanvas } from './detections.mjs';

const $ = (id) => document.getElementById(id);
const video = $('video');
const canvas = $('overlay');
const ctx = canvas.getContext('2d');
const startButton = $('toggleCamera');
const buttonLabel = $('buttonLabel');
const status = $('status');
const loading = $('loading');
const loadingText = $('loadingText');
const threshold = $('threshold');
const modelUrl = `${import.meta.env.BASE_URL}models/yolo26n.onnx`;
let model;
let stream;
let active = false;
let inferenceBusy = false;
let animationFrame = 0;
let lastFpsAt = 0;
let frameCount = 0;
let latestBoxes = [];

function setStatus(text) {
  status.textContent = text;
}

function drawBoxes(boxes) {
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = Math.max(2, width / 480);
  ctx.font = `600 ${Math.max(12, width / 42)}px "Space Grotesk", sans-serif`;
  ctx.textBaseline = 'top';
  for (const box of boxes) {
    const mapped = mapBoxToCanvas(box, video.videoWidth, video.videoHeight, width, height);
    if (!mapped || mapped.width <= 1 || mapped.height <= 1) continue;
    ctx.strokeStyle = '#c8f169';
    ctx.fillStyle = '#c8f169';
    ctx.strokeRect(mapped.x, mapped.y, mapped.width, mapped.height);
    const labelWidth = ctx.measureText(mapped.label).width + 12;
    const labelHeight = Math.max(23, width / 25);
    const labelY = Math.max(0, mapped.y - labelHeight);
    ctx.fillRect(mapped.x, labelY, labelWidth, labelHeight);
    ctx.fillStyle = '#10140c';
    ctx.fillText(mapped.label, mapped.x + 6, labelY + (labelHeight - parseFloat(ctx.font)) / 2);
  }
}

function updateDetectionList(boxes) {
  const list = $('detections');
  $('count').textContent = String(boxes.length);
  if (!boxes.length) {
    list.innerHTML = '<li class="no-detections">아직 감지된 물체가 없습니다</li>';
    return;
  }
  const counts = new Map();
  for (const box of boxes) counts.set(box.name, (counts.get(box.name) ?? 0) + 1);
  list.replaceChildren(...[...counts].map(([name, count]) => {
    const item = document.createElement('li');
    item.className = 'detection-item';
    const label = document.createElement('span');
    label.className = 'detection-name';
    const swatch = document.createElement('i');
    swatch.className = 'detection-swatch';
    const text = document.createElement('span');
    text.textContent = name;
    label.append(swatch, text);
    const amount = document.createElement('span');
    amount.className = 'detection-score';
    amount.textContent = `${count}개`;
    item.append(label, amount);
    return item;
  }));
}

async function loadModel() {
  if (model) return model;
  loadingText.textContent = 'YOLO 모델 다운로드 중… (약 10 MB)';
  model = await YOLO.load(modelUrl, { wasmUrl });
  $('device').textContent = `YOLO26n · ${model.device ?? '브라우저'}`;
  return model;
}

async function detectFrame() {
  if (!active) return;
  animationFrame = requestAnimationFrame(detectFrame);
  if (inferenceBusy || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
  inferenceBusy = true;
  try {
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
    const result = await model.predict(video, { conf: Number(threshold.value) / 100 });
    if (!active) return;
    latestBoxes = filterDetections(result.boxes ?? [], Number(threshold.value) / 100);
    drawBoxes(latestBoxes);
    updateDetectionList(latestBoxes);
    frameCount += 1;
    const now = performance.now();
    if (now - lastFpsAt >= 1000) {
      $('fps').textContent = `${Math.round(frameCount * 1000 / (now - lastFpsAt))} FPS`;
      frameCount = 0;
      lastFpsAt = now;
    }
  } catch (error) {
    stopCamera();
    setStatus(`인식 중 오류: ${error.message || '모델 실행 실패'}`);
  } finally {
    inferenceBusy = false;
  }
}

async function startCamera() {
  startButton.disabled = true;
  $('empty').hidden = true;
  loading.hidden = false;
  try {
    setStatus('카메라 권한을 기다리는 중…');
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
    video.srcObject = stream;
    await video.play();
    setStatus('모델을 준비하는 중…');
    await loadModel();
    active = true;
    video.style.display = 'block';
    loading.hidden = true;
    buttonLabel.textContent = '카메라 정지';
    startButton.querySelector('.button-icon').textContent = '■';
    startButton.classList.add('is-running');
    setStatus('실시간 인식 중');
    lastFpsAt = performance.now();
    frameCount = 0;
    detectFrame();
  } catch (error) {
    stopTracks();
    video.srcObject = null;
    video.style.display = 'none';
    loading.hidden = true;
    $('empty').hidden = false;
    setStatus(error.name === 'NotAllowedError' ? '카메라 권한을 허용해 주세요' : error.name === 'NotFoundError' ? '사용 가능한 카메라가 없습니다' : `시작 실패: ${error.message || '카메라/모델을 확인해 주세요'}`);
  } finally {
    startButton.disabled = false;
  }
}

function stopTracks() {
  stream?.getTracks().forEach((track) => track.stop());
  stream = null;
}

function stopCamera() {
  active = false;
  cancelAnimationFrame(animationFrame);
  stopTracks();
  video.pause();
  video.srcObject = null;
  video.style.display = 'none';
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  $('empty').hidden = false;
  $('fps').textContent = '-- FPS';
  latestBoxes = [];
  updateDetectionList([]);
  buttonLabel.textContent = '카메라 시작';
  startButton.querySelector('.button-icon').textContent = '▶';
  startButton.classList.remove('is-running');
  setStatus('카메라가 꺼져 있습니다');
}

startButton.addEventListener('click', () => active ? stopCamera() : startCamera());
threshold.addEventListener('input', () => {
  $('thresholdValue').textContent = `${threshold.value}%`;
  if (active) {
    latestBoxes = filterDetections(latestBoxes, Number(threshold.value) / 100);
    drawBoxes(latestBoxes);
    updateDetectionList(latestBoxes);
  }
});
window.addEventListener('pagehide', stopTracks);
if (!navigator.mediaDevices?.getUserMedia) {
  startButton.disabled = true;
  setStatus('이 브라우저는 카메라를 지원하지 않습니다. HTTPS 페이지에서 열어 주세요.');
}
