// Entry point: fetch the exported index, wire up filtering + sorting, render.

import { STATUS, statusMeta } from './status.js';
import { buildRow, SORT_KEYS } from './table.js';
import { openScriptModal } from './script_modal.js';
import { DENSITIES, ISS_BASE, el, urlSafeB64 } from './util.js';

const DEFAULT_STATE = {
  filterText: '',
  activeFilters: [],
  sortBy: 'date',
  sortDesc: true,
  density: 'medium',
};

function defaultSortDesc(col) {
  return col === 'date' || col === 'constraint';
}

function countAuthors(rows) {
  const counts = new Map();
  for (const row of rows) {
    if (!row.author) continue;
    counts.set(row.author, (counts.get(row.author) || 0) + 1);
  }
  return counts;
}

function activeFilterKey(filter) {
  return `${filter.exclude ? 'not-' : ''}${filter.type}:${filter.value}`;
}

function readActiveFilters(params) {
  const filters = [
    ...params.getAll('constraint').map(value => ({ type: 'constraint', value, exclude: false })),
    ...params.getAll('author').map(value => ({ type: 'author', value, exclude: false })),
    ...params.getAll('not-constraint').map(value => ({ type: 'constraint', value, exclude: true })),
    ...params.getAll('not-author').map(value => ({ type: 'author', value, exclude: true })),
  ];
  const seen = new Set();
  return filters.filter(filter => {
    if (!filter.value) return false;
    const key = activeFilterKey(filter);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parseUrlLike(text) {
  const trimmed = text.trim();
  if (!trimmed) return null;
  try {
    return new URL(trimmed);
  } catch (_) {
    if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) && /^[^/\s]+\.[^/\s]+/i.test(trimmed)) {
      try {
        return new URL(`https://${trimmed}`);
      } catch (_) {
        return null;
      }
    }
    return null;
  }
}

function youtubeHost(url) {
  const host = url.hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, '');
  return host === 'youtu.be' || host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')
    ? host
    : '';
}

function normalizedUrlToken(text) {
  const url = parseUrlLike(text);
  if (!url) return '';
  if (youtubeHost(url)) return '';
  url.hash = '';
  url.search = '';
  return url.href.replace(/\/$/, '').toLowerCase();
}

function youtubeVideoIdToken(text) {
  const url = parseUrlLike(text);
  if (!url) return '';

  const host = youtubeHost(url);
  if (host === 'youtu.be') return url.pathname.split('/').filter(Boolean)[0] || '';
  if (!host) return '';

  const watchId = url.searchParams.get('v');
  if (watchId) return watchId;

  const parts = url.pathname.split('/').filter(Boolean);
  if (['embed', 'shorts', 'live', 'v'].includes(parts[0])) return parts[1] || '';
  return '';
}

function searchNeedles(query) {
  const needles = [];
  const q = query.trim().toLowerCase();
  if (!q) return needles;
  needles.push(q);

  const normalizedUrl = normalizedUrlToken(query);
  if (normalizedUrl && normalizedUrl !== q) needles.push(normalizedUrl);

  const youtubeId = youtubeVideoIdToken(query).toLowerCase();
  if (youtubeId && youtubeId !== q) needles.push(youtubeId);

  return needles;
}

function rowSearchHaystack(row) {
  return [
    row.puzzle_title,
    row.video_title,
    row.author,
    row.puzzle_id,
    row.video_id,
    row.video_url,
    ...(row.sources || []),
    normalizedUrlToken(row.video_url || ''),
    ...(row.sources || []).map(u => normalizedUrlToken(u)),
    ...(row.constraint_types || []),
  ]
    .filter(Boolean)
    .join('\n')
    .toLowerCase();
}

function buildSearchIndex(rows) {
  const index = new WeakMap();
  for (const row of rows) index.set(row, rowSearchHaystack(row));
  return index;
}

function matchesText(row, needles, searchIndex) {
  if (!needles.length) return true;
  const haystack = searchIndex.get(row);
  return needles.some(needle => haystack.includes(needle));
}

function matchesActiveFilter(row, filter) {
  const matched = filter.type === 'author'
    ? row.author === filter.value
    : (row.constraint_types || []).includes(filter.value);
  return filter.exclude ? !matched : matched;
}

function createState() {
  return {
    ...DEFAULT_STATE,
    rows: [],
    searchIndex: new WeakMap(),
    authorCounts: new Map(),
    hiddenStatuses: new Set(),
  };
}

function readStateFromUrl(params, state) {
  state.filterText = params.get('filter') || '';
  state.activeFilters = readActiveFilters(params);

  const hide = params.get('hide');
  if (hide) state.hiddenStatuses = new Set(hide.split(',').filter(s => STATUS[s]));

  const col = params.get('sort');
  if (col && SORT_KEYS[col]) {
    state.sortBy = col;
    const dir = params.get('dir');
    state.sortDesc = dir ? dir !== 'asc' : defaultSortDesc(col);
  }

  const density = params.get('density');
  if (DENSITIES.has(density)) state.density = density;
}

function writeStateToUrl(state) {
  const params = new URLSearchParams();
  if (state.filterText.trim()) params.set('filter', state.filterText.trim());
  for (const filter of state.activeFilters) {
    params.append(`${filter.exclude ? 'not-' : ''}${filter.type}`, filter.value);
  }
  if (state.hiddenStatuses.size) params.set('hide', [...state.hiddenStatuses].join(','));
  if (state.sortBy !== 'date' || state.sortDesc !== true) {
    params.set('sort', state.sortBy);
    params.set('dir', state.sortDesc ? 'desc' : 'asc');
  }
  if (state.density !== 'medium') params.set('density', state.density);

  const qs = params.toString();
  history.replaceState(null, '', location.pathname + (qs ? `?${qs}` : ''));
}

function queryRows(state) {
  const needles = searchNeedles(state.filterText);
  const sortKey = SORT_KEYS[state.sortBy];
  const dir = state.sortDesc ? -1 : 1;
  const rows = [];
  for (const row of state.rows) {
    if (state.hiddenStatuses.has(row.status)) continue;
    if (!matchesText(row, needles, state.searchIndex)) continue;
    if (!state.activeFilters.every(filter => matchesActiveFilter(row, filter))) continue;
    rows.push(row);
  }
  return rows.sort((a, b) => {
      const ka = sortKey(a);
      const kb = sortKey(b);
      if (ka < kb) return -1 * dir;
      if (ka > kb) return 1 * dir;
      return 0;
  });
}

class IndexApp {
  constructor() {
    this.state = createState();
    this.filterTimer = null;
    this.dom = this.collectDom();
  }

  collectDom() {
    return {
      controls: document.getElementById('controls'),
      table: document.getElementById('index'),
      rows: document.getElementById('rows'),
      empty: document.getElementById('empty'),
      clearEmpty: document.getElementById('clear-empty'),
      filter: document.getElementById('filter'),
      activeFilters: document.getElementById('active-filters'),
      legend: document.getElementById('legend'),
      count: document.getElementById('count'),
      resetFilters: document.getElementById('reset-filters'),
      density: [...document.querySelectorAll('input[name="density"]')],
      headers: [...document.querySelectorAll('th[data-sort]')],
    };
  }

  start() {
    this.readState();
    this.dom.filter.value = this.state.filterText;
    for (const input of this.dom.density) input.checked = input.value === this.state.density;
    this.wire();
    this.load().catch(err => this.showLoadError(err));
  }

  async load() {
    const res = await fetch('data/mappings.json');
    if (!res.ok) throw new Error(`failed to load index: ${res.status}`);
    const data = await res.json();
    this.state.rows = data.rows;
    this.state.searchIndex = buildSearchIndex(this.state.rows);
    this.state.authorCounts = countAuthors(this.state.rows);
    this.buildLegend();
    this.render();
  }

  readState() {
    readStateFromUrl(new URLSearchParams(location.search), this.state);
  }

  syncUrl() {
    writeStateToUrl(this.state);
  }

  visibleRows() {
    return queryRows(this.state);
  }

  render() {
    const rows = this.visibleRows();
    this.renderRows(rows);
    this.renderActiveFilters();
    this.renderControls(rows.length);
    this.syncBrowserState();
  }

  renderRows(rows) {
    this.dom.table.dataset.density = this.state.density;
    this.dom.rows.replaceChildren(...rows.map(row => buildRow(row, {
      density: this.state.density,
      authorCounts: this.state.authorCounts,
      onAuthorFilter: author => this.addActiveFilter('author', author),
      onConstraintFilter: name => this.addActiveFilter('constraint', name),
      onOpenScript: scriptRow => this.openScript(scriptRow),
    })));
    this.markScrollableChips();
  }

  renderControls(visibleCount) {
    this.renderSearchSummary(visibleCount);
    this.syncLegendButtons();
    this.syncSortHeaders();
  }

  syncBrowserState() {
    this.syncUrl();
  }

  renderSearchSummary(visibleCount) {
    this.dom.empty.hidden = visibleCount > 0;
    this.dom.count.textContent = visibleCount === this.state.rows.length
      ? `${this.state.rows.length} puzzles`
      : `${visibleCount} of ${this.state.rows.length} puzzles`;
    this.dom.resetFilters.hidden = !this.hasSearchState();
  }

  hasSearchState() {
    return !!this.state.filterText.trim()
      || this.state.activeFilters.length > 0
      || this.state.hiddenStatuses.size > 0;
  }

  renderActiveFilters() {
    this.dom.activeFilters.replaceChildren(...this.state.activeFilters.map(filter => {
      const value = `${filter.exclude ? 'NOT ' : ''}${filter.value}`;
      return el('span', {
        className: `active-filter${filter.exclude ? ' negative' : ''}`,
        dataset: { key: activeFilterKey(filter) },
      },
      el('button', {
        className: 'active-filter-toggle',
        text: value,
        attrs: {
          type: 'button',
          title: `${filter.exclude ? 'Include' : 'Exclude'} ${filter.value}`,
          'aria-label': `${filter.exclude ? 'Include' : 'Exclude'} ${filter.value}`,
        },
      }),
      el('button', {
        className: 'active-filter-remove',
        text: '×',
        attrs: {
          type: 'button',
          title: `Remove ${filter.value}`,
          'aria-label': `Remove ${filter.value}`,
        },
      }));
    }));
    this.dom.activeFilters.hidden = this.state.activeFilters.length === 0;
  }

  markScrollableChips() {
    for (const chips of this.dom.rows.querySelectorAll('tr[data-density="medium"] .chips, tr[data-density="compact"] .chips')) {
      const horizontal = chips.closest('tr')?.dataset.density === 'compact';
      const update = () => {
        const hasOverflow = horizontal
          ? chips.scrollWidth > chips.clientWidth + 1
          : chips.scrollHeight > chips.clientHeight + 1;
        const atEnd = horizontal
          ? chips.scrollLeft + chips.clientWidth >= chips.scrollWidth - 1
          : chips.scrollTop + chips.clientHeight >= chips.scrollHeight - 1;
        chips.classList.toggle('overflowing', hasOverflow && !atEnd);
      };
      update();
      chips.addEventListener('scroll', update);
    }
  }

  buildLegend() {
    const counts = {};
    for (const row of this.state.rows) counts[row.status] = (counts[row.status] || 0) + 1;
    const tiers = Object.keys(STATUS)
      .filter(status => counts[status])
      .sort((a, b) => statusMeta(a).rank - statusMeta(b).rank);

    this.dom.legend.replaceChildren(...tiers.map(status => {
      const meta = statusMeta(status);
      const item = el('button', {
        className: `legend-item ${meta.cls}`,
        attrs: {
          type: 'button',
          title: `Toggle ${meta.label}`,
        },
        dataset: { status },
      },
      el('span', { className: 'dot', text: meta.icon }),
      meta.label,
      el('span', { className: 'count', text: counts[status] }));

      item.addEventListener('click', () => this.toggleStatus(status));
      return item;
    }));
    this.syncLegendButtons();
  }

  syncLegendButtons() {
    for (const item of this.dom.legend.querySelectorAll('.legend-item')) {
      const meta = statusMeta(item.dataset.status);
      const hidden = this.state.hiddenStatuses.has(item.dataset.status);
      item.classList.toggle('off', hidden);
      item.setAttribute('aria-pressed', hidden ? 'false' : 'true');
      item.title = hidden ? `Show ${meta.label}` : `Hide ${meta.label}`;
      item.setAttribute('aria-label', item.title);
    }
  }

  syncSortHeaders() {
    for (const th of this.dom.headers) {
      const on = th.dataset.sort === this.state.sortBy;
      th.classList.toggle('sorted', on);
      th.classList.toggle('desc', on && this.state.sortDesc);
      th.setAttribute('aria-sort', on ? (this.state.sortDesc ? 'descending' : 'ascending') : 'none');
    }
  }

  setFilter(text) {
    clearTimeout(this.filterTimer);
    this.filterTimer = null;
    this.state.filterText = text;
    this.dom.filter.value = text;
    this.render();
  }

  queueFilter(text) {
    clearTimeout(this.filterTimer);
    this.filterTimer = setTimeout(() => this.setFilter(text), 100);
  }

  addActiveFilter(type, value) {
    const filter = { type, value };
    const key = activeFilterKey(filter);
    if (!this.state.activeFilters.some(existing => activeFilterKey(existing) === key)) {
      this.state.activeFilters.push(filter);
    }
    this.render();
  }

  removeActiveFilter(key) {
    this.state.activeFilters = this.state.activeFilters
      .filter(filter => activeFilterKey(filter) !== key);
    this.render();
  }

  toggleActiveFilter(key) {
    const index = this.state.activeFilters.findIndex(filter => activeFilterKey(filter) === key);
    if (index !== -1) {
      const filter = this.state.activeFilters[index];
      const next = { ...filter, exclude: !filter.exclude };
      const duplicate = this.state.activeFilters
        .findIndex((item, i) => i !== index && activeFilterKey(item) === activeFilterKey(next));
      if (duplicate === -1) {
        this.state.activeFilters[index] = next;
      } else {
        this.state.activeFilters.splice(index, 1);
      }
    }
    this.render();
  }

  toggleStatus(status) {
    this.state.hiddenStatuses.has(status)
      ? this.state.hiddenStatuses.delete(status)
      : this.state.hiddenStatuses.add(status);
    this.render();
  }

  clearFilters() {
    this.state.hiddenStatuses.clear();
    this.state.activeFilters = [];
    this.setFilter('');
    this.dom.filter.focus();
  }

  sortByHeader(th) {
    const col = th.dataset.sort;
    if (this.state.sortBy === col) {
      this.state.sortDesc = !this.state.sortDesc;
    } else {
      this.state.sortBy = col;
      this.state.sortDesc = defaultSortDesc(col);
    }
    this.render();
  }

  syncStickyOffset() {
    document.documentElement.style.setProperty(
      '--sticky-controls-height',
      `${Math.ceil(this.dom.controls.getBoundingClientRect().height)}px`,
    );
  }

  wire() {
    this.syncStickyOffset();
    if ('ResizeObserver' in window) {
      new ResizeObserver(() => this.syncStickyOffset()).observe(this.dom.controls);
    } else {
      window.addEventListener('resize', () => this.syncStickyOffset());
    }

    this.dom.filter.addEventListener('input', () => this.queueFilter(this.dom.filter.value));
    this.dom.activeFilters.addEventListener('click', e => this.handleActiveFilterClick(e));
    this.dom.resetFilters.addEventListener('click', () => this.clearFilters());
    this.dom.clearEmpty.addEventListener('click', () => this.clearFilters());

    for (const input of this.dom.density) {
      input.addEventListener('change', () => {
        if (!input.checked) return;
        this.state.density = input.value;
        this.render();
      });
    }

    for (const th of this.dom.headers) {
      th.tabIndex = 0;
      th.addEventListener('click', () => this.sortByHeader(th));
      th.addEventListener('keydown', e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        this.sortByHeader(th);
      });
    }
  }

  handleActiveFilterClick(e) {
    const pill = e.target.closest('.active-filter');
    if (!pill) return;
    if (e.target.closest('.active-filter-remove')) {
      this.removeActiveFilter(pill.dataset.key);
      return;
    }
    if (e.target.closest('.active-filter-toggle')) this.toggleActiveFilter(pill.dataset.key);
  }

  openScript(row) {
    openScriptModal({
      title: row.puzzle_title || 'Sandbox script',
      fileUrl: `${row.dir}/puzzle.js`,
      buildIssHref: text => ISS_BASE + '?code=' + urlSafeB64(text),
    });
  }

  showLoadError(err) {
    this.dom.empty.hidden = false;
    this.dom.empty.firstElementChild.textContent = err.message;
    this.dom.clearEmpty.hidden = true;
    this.dom.resetFilters.hidden = true;
  }
}

new IndexApp().start();
