const test = require('node:test');
const assert = require('node:assert/strict');
test('moods resolve to a published three-color palette', () => {
  const { palettes, recommend } = require('../palette.js');
  assert.ok(palettes.length >= 4);
  assert.equal(new Set(palettes.map(p => p.id)).size, palettes.length);
  for (const palette of palettes) {
    const result = recommend(palette.id);
    assert.ok(result.source && /^https:\/\//.test(result.source.url), 'published palette source required');
    assert.equal(result.colors.length, 3);
    assert.equal(result.colors.filter(color => color.role === 'main').length, 2);
    assert.equal(result.colors.filter(color => color.role === 'accent').length, 1);
    assert.match(result.photo.url, /^https:\/\/www\.pexels\.com\/photo\//);
    assert.equal(result.photo.license, 'https://www.pexels.com/license/');
    assert.ok(result.photo.photographer && result.photo.alt && result.photo.description);
    assert.ok(require('node:fs').existsSync(require('node:path').join(__dirname, '..', result.photo.src)));
  }
});
test('refresh chooses a different existing palette from the current one', () => {
  const { palettes, chooseNext } = require('../palette.js');
  for (const current of palettes) {
    assert.notEqual(chooseNext(current.id, () => 0).id, current.id);
    assert.notEqual(chooseNext(current.id, () => 0.999).id, current.id);
  }
  assert.equal(chooseNext(null, () => 0).id, palettes[0].id);
});
test('unknown mood does not invent a recommendation', () => {
  assert.equal(require('../palette.js').recommend('missing'), null);
});
test('page has no mood controls and offers a real outfit photo', () => {
  const fs = require('node:fs');
  const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
  assert.match(html, /lang="ko"/);
  assert.doesNotMatch(html, /data-mood|id="moods"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /id="outfit-photo"/);
  assert.match(html, /id="main-swatches"/);
  assert.match(html, /id="accent-swatches"/);
  assert.ok(html.indexOf('id="main-swatches"') < html.indexOf('id="accent-swatches"'));
  assert.ok(html.indexOf('id="accent-swatches"') < html.indexOf('id="outfit-photo"'));
  assert.match(html, /id="license-link"/);
});
