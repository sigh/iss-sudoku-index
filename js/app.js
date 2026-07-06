// Entry point: fetch the exported index, wire up filtering + sorting, render.

import { STATUS, statusMeta } from './status.js';
import { buildRow, SORT_KEYS } from './table.js';

const state = {
  rows: [],
  filterText: '',
  hidden: new Set(),      // status tiers toggled off in the legend
  sortBy: 'date',
  sortDesc: true,
};

const dom = {
  rows: document.getElementById('rows'),
  empty: document.getElementById('empty'),
  filter: document.getElementById('filter'),
  legend: document.getElementById('legend'),
  count: document.getElementById('count'),
  headers: [...document.querySelectorAll('th[data-sort]')],
};

async function load() {
  const res = await fetch('data/mappings.json');
  if (!res.ok) throw new Error(`failed to load index: ${res.status}`);
  const data = await res.json();
  state.rows = data.rows;
  buildLegend();
  render();
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
  dom.rows.replaceChildren(...rows.map(buildRow));
  dom.empty.hidden = rows.length > 0;
  dom.count.textContent = rows.length === state.rows.length
    ? `${state.rows.length} puzzles`
    : `${rows.length} of ${state.rows.length} puzzles`;
  for (const th of dom.headers) {
    const on = th.dataset.sort === state.sortBy;
    th.classList.toggle('sorted', on);
    th.classList.toggle('desc', on && state.sortDesc);
  }
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
  dom.filter.addEventListener('input', () => setFilter(dom.filter.value));

  // Click a constraint chip to filter by that type.
  dom.rows.addEventListener('click', e => {
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

wire();
load().catch(err => {
  dom.empty.hidden = false;
  dom.empty.textContent = err.message;
});
