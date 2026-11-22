(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.NoteApp = api; api.mount(); }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function createController(env) {
    let stream, context, source, analyser, frame, generation = 0, active = false;
    async function stop() {
      generation++;
      active = false;
      if (frame != null) env.cancelFrame(frame);
      frame = null;
      if (source) source.disconnect();
      if (analyser) analyser.disconnect();
      source = analyser = null;
      if (stream) stream.getTracks().forEach(track => track.stop());
      stream = null;
      const old = context; context = null;
      if (old) await old.close();
      env.onState({ status: 'stopped' });
    }
    async function start() {
      if (active) return;
      active = true;
      const id = ++generation;
      env.onState({ status: 'pending' });
      try {
        const acquired = await env.getStream();
        if (id !== generation) { acquired.getTracks().forEach(track => track.stop()); return; }
        stream = acquired;
        context = env.makeContext();
        source = context.createMediaStreamSource(stream);
        analyser = context.createAnalyser();
        analyser.fftSize = 4096;
        source.connect(analyser);
        const samples = new Float32Array(analyser.fftSize);
        let last = 0;
        env.onState({ status: 'listening' });
        function update(time) {
          if (id !== generation) return;
          if (time - last >= 100) {
            analyser.getFloatTimeDomainData(samples);
            env.onState({ status: 'listening', frequency: env.detectPitch(samples, context.sampleRate) });
            last = time;
          }
          frame = env.requestFrame(update);
        }
        frame = env.requestFrame(update);
      } catch (error) {
        if (id !== generation) return;
        await stop();
        env.onState({ status: 'error', error: error.name || 'Error' });
      }
    }
    return { start, stop };
  }
  function mount() {
    const button = document.getElementById('toggle');
    const status = document.getElementById('status');
    const note = document.getElementById('note');
    const frequency = document.getElementById('frequency');
    const tuning = document.getElementById('tuning');
    let running = false;
    const controller = createController({
      getStream: () => {
        if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) throw Object.assign(new Error(), { name: 'NotSupportedError' });
        return navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }, video: false });
      },
      makeContext: () => new (window.AudioContext || window.webkitAudioContext)(),
      detectPitch: Pitch.detectPitch,
      requestFrame: requestAnimationFrame,
      cancelFrame: cancelAnimationFrame,
      onState: state => {
        running = state.status === 'pending' || state.status === 'listening';
        button.textContent = running ? '중지' : '마이크 시작';
        button.setAttribute('aria-pressed', String(running));
        if (state.status === 'pending') status.textContent = '마이크 권한을 기다리는 중';
        else if (state.status === 'stopped') status.textContent = '마이크가 꺼져 있습니다';
        else if (state.status === 'error') {
          const messages = { NotAllowedError: '마이크 권한이 거부되었습니다. 브라우저 설정에서 허용해 주세요.', NotFoundError: '마이크를 찾을 수 없습니다.', NotReadableError: '마이크를 사용할 수 없습니다. 다른 앱을 확인해 주세요.', NotSupportedError: '마이크를 사용할 수 없습니다. HTTPS 또는 localhost에서 열어 주세요.' };
          status.textContent = messages[state.error] || '마이크를 시작하지 못했습니다. 설정을 확인해 주세요.';
        } else if (state.status === 'listening') status.textContent = state.frequency ? '소리 감지 중' : '소리를 기다리는 중';
        const value = state.frequency && Pitch.noteFromFrequency(state.frequency);
        note.textContent = value ? value.name + value.octave : '—';
        frequency.textContent = value ? state.frequency.toFixed(1) + ' Hz' : '— Hz';
        tuning.textContent = value ? (value.cents > 0 ? '+' : '') + value.cents + ' cent' : '— cent';
      }
    });
    button.addEventListener('click', () => running ? controller.stop() : controller.start());
    window.addEventListener('pagehide', () => { controller.stop(); });
  }
  return { createController, mount };
});
