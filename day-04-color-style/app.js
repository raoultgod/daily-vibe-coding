const moodButtons = [...document.querySelectorAll('[data-mood]')];
function render(id) {
  const palette = recommend(id);
  if (!palette) return;
  moodButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mood === id)));
  document.getElementById('result-title').textContent = palette.title;
  document.getElementById('result-description').textContent = palette.description;
  document.getElementById('result-english').textContent = palette.english;
  document.getElementById('result-tip').textContent = palette.tip;
  const image = document.getElementById('outfit-photo');
  image.src = palette.photo.src;
  image.alt = palette.photo.alt;
  document.getElementById('photo-description').textContent = palette.photo.description;
  const paletteSource = document.getElementById('palette-source');
  paletteSource.textContent = `색 조합 출처: ${palette.source.name} ↗`;
  paletteSource.href = palette.source.url;
  const source = document.getElementById('source-link');
  source.textContent = `Photo: ${palette.photo.photographer} / Pexels ↗`;
  source.href = palette.photo.url;
  document.getElementById('license-link').href = palette.photo.license;
  const swatches = document.getElementById('swatches');
  swatches.replaceChildren(...palette.colors.map(color => {
    const item = document.createElement('div'); item.className = 'swatch';
    const block = document.createElement('div'); block.className = 'swatch-color'; block.style.backgroundColor = color.hex;
    const label = document.createElement('div'); label.className = 'swatch-label';
    const name = document.createElement('strong'); name.textContent = color.name;
    const role = document.createElement('span'); role.textContent = color.role === 'main' ? 'MAIN COLOR' : 'ACCENT COLOR';
    label.append(name, role); item.append(block, label); return item;
  }));
}
moodButtons.forEach(button => button.addEventListener('click', () => render(button.dataset.mood)));
render('classic');
