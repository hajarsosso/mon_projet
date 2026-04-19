
const DAYS = 28;
const TODAY = DAYS - 1;

const PALETTE = [
  { color: '#c8f55a', dim: 'rgba(200,245,90,0.15)' },
  { color: '#5ac8f5', dim: 'rgba(90,200,245,0.15)' },
  { color: '#f55a9a', dim: 'rgba(245,90,154,0.15)' },
  { color: '#f5a55a', dim: 'rgba(245,165,90,0.15)' },
  { color: '#a55af5', dim: 'rgba(165,90,245,0.15)' },
  { color: '#5af5b2', dim: 'rgba(90,245,178,0.15)' },
];

let habits = JSON.parse(localStorage.getItem('habit_app_v2') || 'null') || [];
let selColor = PALETTE[0];
let uid = Date.now();
let editingId = null;
let activeFilter = 'all';
let showArchived = false;
let openNotes = {};
let dragId = null;

function save() { localStorage.setItem('habit_app_v2', JSON.stringify(habits)); }

function streak(log) {
  let s = 0;
  for (let i = TODAY; i >= 0; i--) { if (log[i]) s++; else break; }
  return s;
}
function best(log) {
  let b = 0, c = 0;
  log.forEach(v => { c = v ? c + 1 : 0; if (c > b) b = c; });
  return b;
}

/* ── FILTER BAR ── */
function buildFilterBar() {
  const usedCats = [...new Set(
    habits.filter(h => !!h.archived === showArchived && h.cat).map(h => h.cat)
  )];
  const all = ['all', ...usedCats];
  document.getElementById('filterBar').innerHTML =
    '<span class="filter-label">filter</span>' +
    all.map(c => `<button class="cat-chip${activeFilter===c?' active':''}" onclick="setFilter('${c}')">${c}</button>`).join('');
}

function setFilter(cat) { activeFilter = cat; render(); }

/* ── ARCHIVE VIEW ── */
function toggleArchiveView() {
  showArchived = !showArchived;
  activeFilter = 'all';
  const btn = document.getElementById('archiveBtn');
  btn.textContent = showArchived ? 'active' : 'archived';
  btn.classList.toggle('on', showArchived);
  render();
}

/* ── RENDER ── */
function render() {
  buildFilterBar();
  const el = document.getElementById('main');
  let list = habits.filter(h => !!h.archived === showArchived);
  if (activeFilter !== 'all') list = list.filter(h => h.cat === activeFilter);

  if (!list.length) {
    el.innerHTML = showArchived
      ? `<div class="empty"><p>No archived habits.</p></div>`
      : `<div class="empty"><p>No habits yet.</p><strong>Click "+ new habit" to get started.</strong></div>`;
    return;
  }

  el.innerHTML = list.map(h => {
    const s = streak(h.log), b = best(h.log), total = h.log.filter(Boolean).length;
    const pct = Math.round((total / DAYS) * 100);
    const fire = s >= 3 ? ' 🔥' : '';
    const cells = h.log.map((done, i) => {
      const bg = done ? `background:${h.color.color};` : '';
      return `<div class="cell${done?' done':''}${i===TODAY?' today':''}" style="${bg}"
        onclick="toggle('${h.id}',${i})"
        title="Day ${i+1}${i===TODAY?' — today':''}${done?' ✓':''}"></div>`;
    }).join('');

    const noteOpen = openNotes[h.id];
    let notesHtml = '';
    if (noteOpen) {
      notesHtml = `<div class="notes-row visible"><textarea class="notes-input" id="note-${h.id}"
        onblur="saveNote('${h.id}',this.value)"
        placeholder="Add a note…">${h.notes || ''}</textarea></div>`;
    } else if (h.notes) {
      notesHtml = `<div class="notes-preview" onclick="toggleNotes('${h.id}')" title="Click to edit">"${h.notes}"</div>`;
    }

    const archIcon = h.archived ? '↩' : '⊙';
    const archTitle = h.archived ? 'Unarchive' : 'Archive';

    return `<div class="habit-card${h.archived?' archived':''}" id="card-${h.id}"
      draggable="true"
      ondragstart="dStart('${h.id}')"
      ondragover="dOver(event,'${h.id}')"
      ondrop="dDrop('${h.id}')"
      ondragend="dEnd()">
      <div class="card-top">
        <div class="card-left">
          <span class="drag-handle" title="Drag to reorder">⠿</span>
          <div class="dot" style="background:${h.color.color}"></div>
          <div class="name-tag-wrap">
            <span class="habit-name">${h.name}</span>
            ${h.cat ? `<span class="tag-badge">${h.cat}</span>` : ''}
          </div>
        </div>
        <div class="card-right">
          <span class="streak-pill" style="background:${h.color.dim};color:${h.color.color}">${s}d streak${fire}</span>
          <button class="card-action" onclick="toggleNotes('${h.id}')" title="${noteOpen?'Close note':'Add/edit note'}">✎</button>
          <button class="card-action" onclick="editHabit('${h.id}')" title="Edit">⚙</button>
          <button class="card-action" onclick="archiveHabit('${h.id}')" title="${archTitle}">${archIcon}</button>
          <button class="card-action del" onclick="del('${h.id}')" title="Delete">×</button>
        </div>
      </div>
      ${notesHtml}
      <div class="grid-label"><span>28 days</span><span>today ▸</span></div>
      <div class="day-grid">${cells}</div>
      <div class="stats">
        <div class="stat"><div class="stat-label">Streak</div><div class="stat-val" style="color:${h.color.color}">${s}</div></div>
        <div class="stat"><div class="stat-label">Best</div><div class="stat-val">${b}</div></div>
        <div class="stat"><div class="stat-label">Done</div><div class="stat-val">${total}</div></div>
        <div class="stat"><div class="stat-label">Rate</div><div class="stat-val">${pct}%</div></div>
      </div>
    </div>`;
  }).join('');

  // autofocus open note textareas
  list.forEach(h => {
    if (openNotes[h.id]) {
      const ta = document.getElementById('note-' + h.id);
      if (ta) setTimeout(() => { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }, 30);
    }
  });
}

/* ── NOTES ── */
function toggleNotes(id) {
  openNotes[id] = !openNotes[id];
  render();
}

function saveNote(id, val) {
  const h = habits.find(x => x.id === id);
  if (h) h.notes = val.trim();
  openNotes[id] = false;
  save(); render();
}

/* ── TOGGLE ── */
function toggle(id, day) {
  const h = habits.find(x => x.id === id);
  if (!h) return;
  h.log[day] = !h.log[day];
  save(); render();
}

/* ── ARCHIVE ── */
function archiveHabit(id) {
  const h = habits.find(x => x.id === id);
  if (!h) return;
  h.archived = !h.archived;
  save(); render();
}

/* ── DELETE ── */
function del(id) {
  if (!confirm('Delete this habit? All history will be lost.')) return;
  habits = habits.filter(x => x.id !== id);
  save(); render();
}

/* ── DRAG & DROP ── */
function dStart(id) {
  dragId = id;
  setTimeout(() => { const el = document.getElementById('card-'+id); if (el) el.classList.add('dragging'); }, 0);
}
function dOver(e, id) {
  e.preventDefault();
  document.querySelectorAll('.habit-card').forEach(c => c.classList.remove('drag-over'));
  if (id !== dragId) { const el = document.getElementById('card-'+id); if (el) el.classList.add('drag-over'); }
}
function dDrop(targetId) {
  if (!dragId || dragId === targetId) return;
  const from = habits.findIndex(x => x.id === dragId);
  const to = habits.findIndex(x => x.id === targetId);
  if (from < 0 || to < 0) return;
  const [item] = habits.splice(from, 1);
  habits.splice(to, 0, item);
  dragId = null;
  save(); render();
}
function dEnd() {
  dragId = null;
  document.querySelectorAll('.habit-card').forEach(c => { c.classList.remove('dragging'); c.classList.remove('drag-over'); });
}

/* ── MODAL ── */
function openModal() {
  editingId = null;
  document.getElementById('modalTitle').textContent = 'New habit';
  document.getElementById('modalSaveBtn').textContent = 'Add';
  document.getElementById('nameInput').value = '';
  document.getElementById('catSelect').value = '';
  document.getElementById('notesInput').value = '';
  selColor = PALETTE[0];
  renderSwatches();
  document.getElementById('overlay').classList.add('open');
  setTimeout(() => document.getElementById('nameInput').focus(), 80);
}

function closeModal() { document.getElementById('overlay').classList.remove('open'); editingId = null; }
function overlayClick(e) { if (e.target === document.getElementById('overlay')) closeModal(); }

function renderSwatches() {
  document.getElementById('swatches').innerHTML = PALETTE.map((c, i) =>
    `<div class="swatch${c===selColor?' sel':''}" style="background:${c.color}" onclick="pickColor(${i})"></div>`
  ).join('');
}
function pickColor(i) { selColor = PALETTE[i]; renderSwatches(); }

function editHabit(id) {
  const h = habits.find(x => x.id === id);
  if (!h) return;
  editingId = id;
  document.getElementById('modalTitle').textContent = 'Edit habit';
  document.getElementById('modalSaveBtn').textContent = 'Save';
  document.getElementById('nameInput').value = h.name;
  document.getElementById('catSelect').value = h.cat || '';
  document.getElementById('notesInput').value = h.notes || '';
  selColor = PALETTE.find(p => p.color === h.color.color) || h.color;
  renderSwatches();
  document.getElementById('overlay').classList.add('open');
  setTimeout(() => document.getElementById('nameInput').focus(), 80);
}

function saveHabit() {
  const name = document.getElementById('nameInput').value.trim();
  if (!name) { document.getElementById('nameInput').focus(); return; }
  const cat = document.getElementById('catSelect').value;
  const notes = document.getElementById('notesInput').value.trim();
  if (editingId) {
    const h = habits.find(x => x.id === editingId);
    if (h) { h.name = name; h.cat = cat; h.notes = notes; h.color = selColor; }
  } else {
    habits.push({ id: String(uid++), name, cat, notes, color: selColor, log: Array(DAYS).fill(false), archived: false });
  }
  save(); render(); closeModal();
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
  if (e.key === 'Enter' && document.getElementById('overlay').classList.contains('open')) {
    if (document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'SELECT') saveHabit();
  }
});

/* ── THEME ── */
let isLight = localStorage.getItem('habit_theme') === 'light';
function applyTheme() {
  document.documentElement.classList.toggle('light', isLight);
  document.getElementById('themeBtn').textContent = isLight ? '☽ dark' : '☀ light';
}
function toggleTheme() {
  isLight = !isLight;
  localStorage.setItem('habit_theme', isLight ? 'light' : 'dark');
  applyTheme();
}
applyTheme();

/* ── DATE ── */
document.getElementById('dateLabel').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

render();
