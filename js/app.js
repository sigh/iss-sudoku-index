// Entry point: fetch the exported index, wire up filtering + sorting, render.

import { STATUS, statusMeta } from './status.js';
import { buildRow, SORT_KEYS } from './table.js';

const DENSITIES = new Set(['compact', 'medium', 'spacious']);

const state = {
  rows: [],
  authorCounts: new Map(),
  filterText: '',
  hidden: new Set(),      // status tiers toggled off in the legend
  sortBy: 'date',
  sortDesc: true,
  density: 'medium',      // medium thumbnails by default
};

const dom = {
  controls: document.getElementById('controls'),
  table: document.getElementById('index'),
  rows: document.getElementById('rows'),
  empty: document.getElementById('empty'),
  filter: document.getElementById('filter'),
  legend: document.getElementById('legend'),
  count: document.getElementById('count'),
  density: [...document.querySelectorAll('input[name="density"]')],
  headers: [...document.querySelectorAll('th[data-sort]')],
};

function syncStickyOffset() {
  document.documentElement.style.setProperty(
    '--sticky-controls-height',
    `${Math.ceil(dom.controls.getBoundingClientRect().height)}px`,
  );
}

async function load() {
  const res = await fetch('data/mappings.json');
  if (!res.ok) throw new Error(`failed to load index: ${res.status}`);
  const data = await res.json();
  state.rows = data.rows;
  state.authorCounts = countAuthors(state.rows);
  buildLegend();
  render();
}

function countAuthors(rows) {
  const counts = new Map();
  for (const row of rows) {
    if (!row.author) continue;
    counts.set(row.author, (counts.get(row.author) || 0) + 1);
  }
  return counts;
}

// --- shareable URL state: filter / sort / hidden tiers live in the query string ---

function readState() {
  const p = new URLSearchParams(location.search);
  state.filterText = p.get('filter') || '';
  const hide = p.get('hide');
  if (hide) state.hidden = new Set(hide.split(',').filter(s => STATUS[s]));
  const col = p.get('sort');
  if (col && SORT_KEYS[col]) {
    state.sortBy = col;
    const dir = p.get('dir');
    // No explicit dir -> the column's natural default (date/constraint read
    // largest-first, others ascending), matching a header click.
    state.sortDesc = dir ? dir !== 'asc' : (col === 'date' || col === 'constraint');
  }
  const density = p.get('density');
  if (DENSITIES.has(density)) state.density = density;
}

function syncUrl() {
  const p = new URLSearchParams();
  if (state.filterText.trim()) p.set('filter', state.filterText.trim());
  if (state.hidden.size) p.set('hide', [...state.hidden].join(','));
  if (state.sortBy !== 'date' || state.sortDesc !== true) {  // non-default sort
    p.set('sort', state.sortBy);
    p.set('dir', state.sortDesc ? 'desc' : 'asc');
  }
  if (state.density !== 'medium') p.set('density', state.density);
  const qs = p.toString();
  history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''));
}

function matchesText(r, q) {
  if (!q) return true;
  return (r.puzzle_title || '').toLowerCase().includes(q)
    || (r.author || '').toLowerCase().includes(q)
    || (r.constraint_types || []).some(c => c.toLowerCase().includes(q));
}

function visibleRows() {
  const q = state.filterText.trim().toLowerCase();
  const key = SORT_KEYS[state.sortBy];
  const dir = state.sortDesc ? -1 : 1;
  return state.rows
    .filter(r => !state.hidden.has(r.status))
    .filter(r => matchesText(r, q))
    .sort((a, b) => {
      const ka = key(a), kb = key(b);
      if (ka < kb) return -1 * dir;
      if (ka > kb) return 1 * dir;
      return 0;
    });
}

function render() {
  const rows = visibleRows();
  dom.table.className = `density-${state.density}`;
  dom.rows.replaceChildren(...rows.map(r => buildRow(r, {
    density: state.density,
    authorCounts: state.authorCounts,
  })));
  dom.empty.hidden = rows.length > 0;
  dom.count.textContent = rows.length === state.rows.length
    ? `${state.rows.length} puzzles`
    : `${rows.length} of ${state.rows.length} puzzles`;
  for (const th of dom.headers) {
    const on = th.dataset.sort === state.sortBy;
    th.classList.toggle('sorted', on);
    th.classList.toggle('desc', on && state.sortDesc);
  }
  syncUrl();   // every state change flows through render, so mirror it to the URL here
}

function buildLegend() {
  const counts = {};
  for (const r of state.rows) counts[r.status] = (counts[r.status] || 0) + 1;
  const tiers = Object.keys(STATUS)
    .filter(s => counts[s])
    .sort((a, b) => statusMeta(a).rank - statusMeta(b).rank);

  dom.legend.replaceChildren(...tiers.map(status => {
    const m = statusMeta(status);
    const item = document.createElement('span');
    item.className = `legend-item ${m.cls}`;
    item.title = `Toggle ${m.label}`;
    if (state.hidden.has(status)) item.classList.add('off');   // restore from URL
    item.innerHTML =
      `<span class="dot">${m.icon}</span>${m.label}<span class="count">${counts[status]}</span>`;
    item.addEventListener('click', () => {
      state.hidden.has(status) ? state.hidden.delete(status) : state.hidden.add(status);
      item.classList.toggle('off', state.hidden.has(status));
      render();
    });
    return item;
  }));
}

function setFilter(text) {
  state.filterText = text;
  dom.filter.value = text;
  render();
}

function wire() {
  syncStickyOffset();
  if ('ResizeObserver' in window) {
    new ResizeObserver(syncStickyOffset).observe(dom.controls);
  } else {
    window.addEventListener('resize', syncStickyOffset);
  }

  dom.filter.addEventListener('input', () => setFilter(dom.filter.value));

  for (const input of dom.density) {
    input.addEventListener('change', () => {
      if (!input.checked) return;
      state.density = input.value;
      render();
    });
  }

  // Click a constraint chip to filter by that type.
  dom.rows.addEventListener('click', e => {
    const author = e.target.closest('.author-filter');
    if (author) {
      setFilter(author.dataset.author);
      return;
    }

    const chip = e.target.closest('.chip');
    if (chip) setFilter(chip.dataset.name);
  });

  for (const th of dom.headers) {
    th.addEventListener('click', () => {
      const col = th.dataset.sort;
      if (state.sortBy === col) {
        state.sortDesc = !state.sortDesc;
      } else {
        state.sortBy = col;
        // Date and constraint-length read best largest-first; others ascending.
        state.sortDesc = col === 'date' || col === 'constraint';
      }
      render();
    });
  }
}

readState();
dom.filter.value = state.filterText;
for (const input of dom.density) input.checked = input.value === state.density;
wire();
load().catch(err => {
  dom.empty.hidden = false;
  dom.empty.textContent = err.message;
});
