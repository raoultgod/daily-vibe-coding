function render(id) {
  const palette = recommend(id);
  if (!palette) return;
  try { sessionStorage.setItem('lastPalette', id); } catch (_) { /* Storage may be blocked. */ }
  document.getElementById('result-title').textContent = palette.title;
  document.getElementById('result-description').textContent = palette.description;
  document.getElementById('result-english').textContent = palette.english;
  document.getElementById('result-tip').textContent = palette.tip;
  const image = document.getElementById('outfit-photo');
  const hasPhoto = Boolean(palette.photo);
  document.getElementById('outfit-figure').hidden = !hasPhoto;
  document.getElementById('photo-unavailable').hidden = hasPhoto;
  document.getElementById('photo-credit').hidden = !hasPhoto;
  if (hasPhoto) {
    image.src = palette.photo.src;
    image.alt = palette.photo.alt;
    document.getElementById('photo-description').textContent = palette.photo.description;
    const source = document.getElementById('source-link');
    source.textContent = `Photo: ${palette.photo.photographer} / Pexels ↗`;
    source.href = palette.photo.url;
    document.getElementById('license-link').href = palette.photo.license;
  } else {
    image.removeAttribute('src');
    image.alt = '';
    document.getElementById('photo-description').textContent = '';
  }
  const paletteSource = document.getElementById('palette-source');
  paletteSource.textContent = `색 조합 출처: ${palette.source.name} ↗`;
  paletteSource.href = palette.source.url;
  for (const role of ['main', 'accent']) {
    const container = document.getElementById(`${role}-swatches`);
    container.replaceChildren(...palette.colors.filter(color => color.role === role).map(color => {
      const item = document.createElement('div'); item.className = 'swatch';
      const block = document.createElement('div'); block.className = 'swatch-color'; block.style.backgroundColor = color.hex;
      const name = document.createElement('span'); name.className = 'swatch-name'; name.textContent = color.name;
      item.append(block, name); return item;
    }));
  }
}
let previous = null;
try { previous = sessionStorage.getItem('lastPalette'); } catch (_) { /* Random choice still works. */ }
const initial = chooseNext(previous);
if (initial) render(initial.id);
