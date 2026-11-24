import test from 'node:test';
import assert from 'node:assert/strict';
import { ensembleRate, buildEnsembleForecast } from '../ensemble.mjs';

const member = { relative_humidity_700hPa: 35,
  cloud_cover_low: 80, cloud_cover_high: 20, wind_speed_10m: 25, precipitation: 0 };

test('counts only complete ensemble members meeting every proxy criterion', () => {
  const result = ensembleRate([member, { ...member, cloud_cover_low: 10 }, { ...member, wind_speed_10m: null }]);
  assert.deepEqual(result, { percent: 50, favorable: 1, valid: 2, unavailable: 1 });
});

test('does not report zero percent when all members are missing', () => {
  assert.deepEqual(ensembleRate([{ ...member, relative_humidity_700hPa: null }]),
    { percent: null, favorable: 0, valid: 0, unavailable: 1 });
});

test('pairs hourly ensemble data to sunrise and excludes past hours', () => {
  const time = ['2026-11-24T06:00', '2026-11-24T07:00', '2026-11-24T08:00', '2026-11-24T11:00'];
  const hourly = { time };
  for (const [key, value] of Object.entries(member)) {
    hourly[key] = time.map(() => value);
    hourly[`${key}_member01`] = time.map(() => value);
    hourly[`${key}_member02`] = time.map(() => value);
  }
  hourly.cloud_cover_low_member02[2] = 0;
  const sunrise = { daily: { time: ['2026-11-24'], sunrise: ['2026-11-24T07:12'] } };
  const result = buildEnsembleForecast({ hourly }, sunrise, new Date('2026-11-23T21:00:00+09:00'));
  assert.deepEqual(result.map(x => x.time), ['2026-11-24T07:00', '2026-11-24T08:00']);
  assert.deepEqual([result[0].percent, result[0].valid, result[1].percent], [100, 3, 67]);
});

test('does not silently count a truncated ensemble as the full set', () => {
  assert.throws(() => buildEnsembleForecast({hourly:{time:[]}}, {daily:{time:[],sunrise:[]}}), /missing|ensemble/i);
});
