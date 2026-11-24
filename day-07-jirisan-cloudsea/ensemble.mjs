// The event is a modelled low-cloud profile, NOT an observed sea of clouds.
const variables = ['relative_humidity_700hPa', 'cloud_cover_low',
  'cloud_cover_high', 'wind_speed_10m', 'precipitation'];

export function ensembleRate(members) {
  let favorable = 0;
  let valid = 0;
  for (const m of members) {
    if (variables.some(key => !Number.isFinite(m[key]))) continue;
    valid++;
    if (m.relative_humidity_700hPa <= 70 && m.cloud_cover_low >= 60 &&
      m.cloud_cover_high <= 80 && m.wind_speed_10m <= 30 &&
      m.precipitation <= 0.2) favorable++;
  }
  return { percent: valid ? Math.round(100 * favorable / valid) : null,
    favorable, valid, unavailable: members.length - valid };
}

export function buildEnsembleForecast(ensemble, sunrise, now = new Date()) {
  const hourly = ensemble?.hourly;
  if (!Array.isArray(hourly?.time) || variables.some(key => !Array.isArray(hourly[key]) || hourly[key].length !== hourly.time.length))
    throw new Error('missing ensemble forecast');
  const memberNumbers = Object.keys(hourly).filter(key => /^relative_humidity_700hPa_member\d+$/.test(key))
    .map(key => key.split('member')[1]).sort();
  if (!memberNumbers.length || memberNumbers.some(n => variables.some(k =>
    !Array.isArray(hourly[`${k}_member${n}`]) || hourly[`${k}_member${n}`].length !== hourly.time.length)))
    throw new Error('missing ensemble member data');
  if (!Array.isArray(sunrise?.daily?.time) || !Array.isArray(sunrise.daily.sunrise) ||
      sunrise.daily.time.length !== sunrise.daily.sunrise.length) throw new Error('missing sunrise data');
  const suns = new Map(sunrise.daily.time.map((date, i) => [date, sunrise.daily.sunrise[i]]));
  return hourly.time.flatMap((time, index) => {
    const sun = suns.get(time.slice(0, 10));
    if (!sun) return [];
    const atMs = Date.parse(`${time}+09:00`);
    const sunMs = Date.parse(`${sun}+09:00`);
    if (!Number.isFinite(atMs) || !Number.isFinite(sunMs) || atMs < now.getTime() ||
        atMs < sunMs - 30 * 60000 || atMs > sunMs + 3 * 3600000) return [];
    const members = [Object.fromEntries(variables.map(k => [k, hourly[k][index]])),
      ...memberNumbers.map(n => Object.fromEntries(variables.map(k => [k, hourly[`${k}_member${n}`][index]])))];
    return [{ time, sunrise: sun, ...ensembleRate(members) }];
  });
}
