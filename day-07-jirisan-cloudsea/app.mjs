import { buildEnsembleForecast } from './ensemble.mjs';

const ensembleEndpoint = 'https://ensemble-api.open-meteo.com/v1/ensemble';
const forecastEndpoint = 'https://api.open-meteo.com/v1/forecast';
const variables = 'relative_humidity_700hPa,cloud_cover_low,cloud_cover_high,wind_speed_10m,precipitation';
const point = { latitude: 35.337, longitude: 127.733 };
const status = document.querySelector('#status');
const results = document.querySelector('#results');
const button = document.querySelector('#refresh');
const updated = document.querySelector('#updated');

async function fetchData(endpoint, params) {
  const url = new URL(endpoint);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));
  const response = await fetch(url);
  if (!response.ok) throw new Error(`예보 서버 응답 ${response.status}`);
  const data = await response.json();
  if (data.error) throw new Error(data.reason || '예보 서버 오류');
  return data;
}
function el(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}
function kst(date) {
  return new Intl.DateTimeFormat('ko-KR', { timeZone:'Asia/Seoul', month:'long', day:'numeric',
    weekday:'long', hour:'2-digit', minute:'2-digit', hour12:false }).format(date);
}
function render(rows) {
  results.replaceChildren();
  const groups = Map.groupBy(rows, row => row.time.slice(0, 10));
  for (const [day, hours] of groups) {
    const section = el('section', 'day');
    const head = el('div', 'day-heading');
    head.append(el('h3', '', new Intl.DateTimeFormat('ko-KR', { month:'long', day:'numeric', weekday:'long', timeZone:'Asia/Seoul' }).format(new Date(`${day}T12:00:00+09:00`))),
      el('span', '', `일출 ${hours[0].sunrise.slice(11)} · 천왕봉 인근 격자`));
    section.append(head);
    const grid = el('div', 'hours');
    for (const row of hours) {
      const label = row.percent === null ? '자료 부족' : row.percent >= 60 ? '모델 다수 일치' : row.percent >= 30 ? '모델 일부 일치' : '모델 일치 적음';
      const card = el('article', `hour ${row.percent >= 60 ? 'high' : row.percent >= 30 ? 'medium' : ''}`);
      card.append(el('div', 'clock', `${row.time.slice(11)} KST`));
      const score = el('div', `score ${row.percent === null ? 'na' : ''}`, row.percent === null ? '—' : `${row.percent}%`);
      card.append(score, el('div', 'level', label),
        el('p', 'detail', `운해 유사 조건: ${row.favorable} / ${row.valid}개 유효 멤버`));
      if (row.unavailable) card.append(el('p', 'detail', `결측 멤버 ${row.unavailable}개 제외`));
      grid.append(card);
    }
    section.append(grid); results.append(section);
  }
}
async function refresh() {
  button.disabled = true;
  status.textContent = '앙상블 예보를 가져오는 중입니다…';
  try {
    const common = { ...point, timezone:'Asia/Seoul', forecast_days:3 };
    const [ensemble, sunrise] = await Promise.all([
      fetchData(ensembleEndpoint, { ...common, models:'ecmwf_ifs025', hourly:variables }),
      fetchData(forecastEndpoint, { ...common, daily:'sunrise' }),
    ]);
    const rows = buildEnsembleForecast(ensemble, sunrise);
    render(rows);
    status.textContent = rows.length ? '' : '앞으로 3일 안에 표시할 일출 시간대가 없습니다.';
    updated.textContent = `확인 ${kst(new Date())}`;
  } catch (error) {
    results.replaceChildren();
    status.textContent = `예보를 불러오지 못했습니다: ${error.message}. 잠시 후 다시 시도해 주세요.`;
  } finally { button.disabled = false; }
}
button.addEventListener('click', refresh);
refresh();
