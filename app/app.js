// Leonida Legend — offline GTA VI trophy guide & tracker.
// Loads only its own data file (data/trophies.json); makes no network request.
// Progress lives in localStorage and can be exported/imported as a JSON file.
const STORAGE_KEY = 'leonida-legend-progress-v1';
const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

const listEl = document.getElementById('trophy-list');
const emptyEl = document.getElementById('empty');
const gradeEl = document.getElementById('grade');
const searchEl = document.getElementById('search');
const spoilerEl = document.getElementById('spoiler');
const visibleEl = document.getElementById('visible-count');

const params = new URLSearchParams(location.search);
let activeFilter = params.get('filter') || 'all';
let earned = loadProgress();
let trophies = [];
const openGuides = new Set();

function loadProgress() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'));
  } catch {
    return new Set();
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned]));
}

async function loadTrophies() {
  const doc = await (await fetch('data/trophies.json')).json();
  trophies = doc.trophies;
  seedFromParams();
  renderMissableList();
  render();
  scrollFromParams();
}

// Screenshot/demo support: ?earned=2,3,4 pre-ticks trophies by id, ?open=17 opens a guide.
function seedFromParams() {
  const seed = params.get('earned');
  if (seed) {
    for (const id of seed.split(',')) {
      const t = trophies.find((x) => String(x.id) === id.trim());
      if (t) earned.add(t.name);
    }
    saveProgress();
  }
  const open = params.get('open');
  if (open) {
    const t = trophies.find((x) => String(x.id) === open || x.name === open);
    if (t) openGuides.add(t.name);
  }
  if (params.get('spoiler') === '1') spoilerEl.checked = true;
  if (params.get('grade')) gradeEl.value = params.get('grade');
  if (params.get('q')) searchEl.value = params.get('q');
  for (const btn of document.querySelectorAll('[data-filter]')) {
    btn.classList.toggle('active', btn.dataset.filter === activeFilter);
  }
}

function scrollFromParams() {
  const target = params.get('scroll');
  if (target === 'roadmap') {
    const roadmap = document.getElementById('roadmap');
    roadmap.open = true;
    roadmap.scrollIntoView();
  } else if (target) {
    const el = document.getElementById('trophy-' + target);
    if (el) el.scrollIntoView();
  }
}

function isSpoilerHidden(t) {
  return spoilerEl.checked && t.kind === 'story' && !earned.has(t.name);
}

function matchesFilters(t) {
  if (activeFilter === 'story' && t.kind !== 'story') return false;
  if (activeFilter === 'missable' && !t.missable) return false;
  if (activeFilter === 'collectibles' && t.kind !== 'collectibles') return false;
  if (activeFilter === 'activities' && t.kind !== 'activities') return false;
  if (activeFilter === 'earned' && !earned.has(t.name)) return false;
  if (activeFilter === 'remaining' && earned.has(t.name)) return false;
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  const q = searchEl.value.trim().toLowerCase();
  if (q) {
    const hay = (t.name + ' ' + t.description + ' ' + t.guide + ' ' + t.kind).toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function renderProgress() {
  const total = trophies.length;
  const got = trophies.filter((t) => earned.has(t.name)).length;
  document.getElementById('progress-text').textContent = got + ' of ' + total + ' earned';
  document.getElementById('progress-fill').style.width = total ? (got / total) * 100 + '%' : '0%';
  const counts = document.getElementById('grade-counts');
  counts.replaceChildren();
  for (const g of GRADE_ORDER) {
    const all = trophies.filter((t) => t.grade === g);
    const have = all.filter((t) => earned.has(t.name)).length;
    const li = document.createElement('li');
    li.textContent = g[0].toUpperCase() + g.slice(1) + ': ' + have + ' / ' + all.length;
    counts.append(li);
  }
}

function renderMissableList() {
  const names = trophies.filter((t) => t.missable).map((t) => t.name);
  document.getElementById('missable-list').textContent = names.join(' · ') + ' (' + names.length + ' trophies)';
}

function badge(text, cls) {
  const s = document.createElement('span');
  s.className = 'badge ' + cls;
  s.textContent = text;
  return s;
}

function renderTrophyCard(t) {
  const card = document.createElement('li');
  card.className = 'trophy-card' + (earned.has(t.name) ? ' earned' : '');
  card.id = 'trophy-' + t.id;

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.name);
  box.setAttribute('aria-label', 'Mark earned: ' + t.name);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.name);
    else earned.delete(t.name);
    saveProgress();
    render();
  });
  card.append(box);

  const body = document.createElement('div');
  body.className = 'trophy-body';
  const hidden = isSpoilerHidden(t);
  if (hidden) card.classList.add('spoiler-hidden');

  const head = document.createElement('div');
  head.className = 'trophy-head';
  const name = document.createElement('h3');
  name.className = 'trophy-name';
  name.textContent = hidden ? 'Story trophy #' + t.id + ' — hidden by spoiler shield' : t.name;
  head.append(name);
  head.append(badge(t.grade, t.grade));
  head.append(badge(t.kind, 'kind'));
  if (t.missable) head.append(badge('Missable', 'missable'));
  if (earned.has(t.name)) head.append(badge('Earned', 'earned-tag'));
  body.append(head);

  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = hidden
    ? 'Official description hidden until earned. Earn it (or untick the spoiler shield) to reveal.'
    : '“' + t.description + '”';
  body.append(desc);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'guide-toggle';
  const isOpen = openGuides.has(t.name);
  toggle.textContent = isOpen ? 'Hide guide' : 'Show guide & sources';
  toggle.addEventListener('click', () => {
    if (openGuides.has(t.name)) openGuides.delete(t.name);
    else openGuides.add(t.name);
    render();
  });
  body.append(toggle);

  if (isOpen) {
    const guideBox = document.createElement('div');
    guideBox.className = 'guide-box';
    const guide = document.createElement('p');
    guide.textContent = t.guide;
    guideBox.append(guide);
    const sources = document.createElement('p');
    sources.className = 'sources';
    sources.textContent = 'Sources: ' + (t.sources || []).join(' · ') +
      ' — official name, description and grade as published there; guide written for this tracker.';
    guideBox.append(sources);
    body.append(guideBox);
  }

  card.append(body);
  return card;
}

function render() {
  renderProgress();
  const visible = trophies.filter(matchesFilters);
  listEl.replaceChildren();
  for (const t of visible) listEl.append(renderTrophyCard(t));
  emptyEl.hidden = visible.length > 0;
  visibleEl.textContent = 'Showing ' + visible.length + ' of ' + trophies.length + ' trophies';
}

function exportProgress() {
  const payload = JSON.stringify({ app: 'leonida-legend', earned: [...earned] }, null, 2);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importProgress(file) {
  const parsed = JSON.parse(await file.text());
  const names = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(names)) return;
  earned = new Set(names.filter((n) => trophies.some((t) => t.name === n)));
  saveProgress();
  render();
}

for (const btn of document.querySelectorAll('[data-filter]')) {
  btn.addEventListener('click', () => {
    activeFilter = btn.dataset.filter;
    for (const b of document.querySelectorAll('[data-filter]')) {
      b.classList.toggle('active', b === btn);
    }
    render();
  });
}
gradeEl.addEventListener('change', render);
searchEl.addEventListener('input', render);
spoilerEl.addEventListener('change', render);
document.getElementById('export').addEventListener('click', exportProgress);
document.getElementById('import').addEventListener('change', (e) => {
  if (e.target.files[0]) importProgress(e.target.files[0]);
});

loadTrophies();
