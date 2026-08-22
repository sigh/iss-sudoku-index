// Entry point: fetch the exported index, wire up filtering + sorting, render.

import { STATUS, statusMeta } from './status.js';
import { buildRow, SORT_KEYS } from './table.js';
import { openScriptModal } from './script_modal.js';
import { ISS_BASE, el, encodeCodeParam, fetchJson, showLoadError } from './util.js';
import { DEFAULT_STATE, UrlState, activeFilterKey, defaultSortDesc } from './url_state.js';
import { Timeline, inRange, monthDomain, monthOf } from './timeline.js';

// Rows are appended to the table in chunks as the user scrolls (windowed
// rendering) so a large index doesn't stall filtering/sorting re-renders.
const RENDER_CHUNK = 200;

// The export omits fields derivable from puzzle_id (see export_web.py): the
// canonical video URL, video_id when it matches, and the default artifact dir.
function rehydrateRow(row) {
  if (row.video_id == null) row.video_id = row.puzzle_id;
  if (row.video_url == null) row.video_url = `https://www.youtube.com/watch?v=${row.video_id}`;
  if (row.dir == null && row.iss_size) row.dir = `data/puzzles/${row.puzzle_id}`;
  return row;
}

function countAuthors(rows) {
  const counts = new Map();
  for (const row of rows) {
    if (!row.author) continue;
    counts.set(row.author, (counts.get(row.author) || 0) + 1);
  }
  return counts;
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
    // False while only the recent shard has loaded (see load()).
    rowsComplete: false,
    searchIndex: new WeakMap(),
    authorCounts: new Map(),
    monthDomain: [],
    hiddenStatuses: new Set(),
  };
}

// Each control's own counts ignore that control: statusCounts ignores
// hiddenStatuses and monthCounts ignores the date range, so every chip and bar
// reports what selecting it would show rather than what is showing now.
function queryRows(state) {
  const needles = searchNeedles(state.filterText);
  const sortKey = SORT_KEYS[state.sortBy];
  const dir = state.sortDesc ? -1 : 1;
  const rows = [];
  const statusCounts = {};
  const monthCounts = new Map();
  for (const row of state.rows) {
    if (!matchesText(row, needles, state.searchIndex)) continue;
    if (!state.activeFilters.every(filter => matchesActiveFilter(row, filter))) continue;
    const statusHidden = state.hiddenStatuses.has(row.status);
    if (!statusHidden) {
      const month = monthOf(row);
      if (month) monthCounts.set(month, (monthCounts.get(month) || 0) + 1);
    }
    if (!inRange(row, state.dateFrom, state.dateTo)) continue;
    statusCounts[row.status] = (statusCounts[row.status] || 0) + 1;
    if (statusHidden) continue;
    rows.push(row);
  }
  rows.sort((a, b) => {
      const ka = sortKey(a);
      const kb = sortKey(b);
      if (ka < kb) return -1 * dir;
      if (ka > kb) return 1 * dir;
      return 0;
  });
  return { rows, statusCounts, monthCounts };
}

class IndexApp {
  constructor() {
    this.state = createState();
    this.filterTimer = null;
    this.dom = this.collectDom();
    this.pendingRows = [];
    this.legendStatuses = [];
    this.renderedCount = 0;
    this.sentinelObserver = null;
    this.chipObserver = null;
    this.skipUrlSync = false;
    this.visibleFrame = 0;
    this.url = new UrlState(this.state, () => this.restoreView());
    this.timeline = new Timeline(this.dom.timeline, {
      onChange: range => this.setDateRange(range),
      onCommit: () => this.url.sync(),
    });
  }

  collectDom() {
    return {
      controls: document.getElementById('controls'),
      loading: document.getElementById('loading'),
      table: document.getElementById('index'),
      rows: document.getElementById('rows'),
      sentinel: document.getElementById('sentinel'),
      toTop: document.getElementById('to-top'),
      empty: document.getElementById('empty'),
      clearEmpty: document.getElementById('clear-empty'),
      filter: document.getElementById('filter'),
      activeFilters: document.getElementById('active-filters'),
      legend: document.getElementById('legend'),
      timeline: document.getElementById('timeline'),
      count: document.getElementById('count'),
      resetFilters: document.getElementById('reset-filters'),
      density: [...document.querySelectorAll('input[name="density"]')],
      headers: [...document.querySelectorAll('th[data-sort]')],
    };
  }

  start() {
    this.url.start();
    this.syncControls();
    this.wire();
    this.load().catch(err => showLoadError(this.dom.loading, err));
  }

  // The index is exported as two shards, both ordered date desc: a small
  // "recent" one sized to the first render chunk, and the archive with the
  // rest. Both are fetched in parallel; the recent shard renders as soon as it
  // arrives (partial, loading message still showing) and the archive merges in
  // behind it. Because the sort is stable, the merged re-render reproduces the
  // partial rows in place.
  async load() {
    const archivePromise = this.fetchShard('data/mappings-archive.json');
    // A rejection here must surface via the await below, not as an unhandled one
    // if the recent fetch throws first.
    archivePromise.catch(() => {});
    this.setRows(await this.fetchShard('data/mappings-recent.json'), false);
    this.buildLegend();
    this.render();
    this.setRows(this.state.rows.concat(await archivePromise), true);
    this.dom.loading.hidden = true;
    this.buildLegend();
    this.render();
  }

  async fetchShard(url) {
    return (await fetchJson(url)).rows.map(rehydrateRow);
  }

  setRows(rows, complete) {
    this.state.rows = rows;
    this.state.rowsComplete = complete;
    this.state.searchIndex = buildSearchIndex(rows);
    this.state.authorCounts = countAuthors(rows);
    this.state.monthDomain = monthDomain(rows);
    this.timeline.setDomain(this.state.monthDomain);
  }

  // Back/Forward, once UrlState has read the entry back into state. The URL
  // already matches, so the render's own sync() is a no-op.
  restoreView() {
    this.syncControls();
    this.render();
  }

  // The controls the user drives directly rather than through a re-render, so
  // they have to be pushed back when state changes underneath them.
  syncControls() {
    this.dom.filter.value = this.state.filterText;
    for (const input of this.dom.density) input.checked = input.value === this.state.density;
  }

  render() {
    // Partial data is only trustworthy in the shards' own order (date desc);
    // for any other sort hold the loading state until the archive arrives.
    if (!this.state.rowsComplete && !this.isDateDescSort()) {
      this.renderRows([]);
      this.renderActiveFilters();
      this.dom.count.textContent = '';
      this.dom.empty.hidden = true;
      this.syncSortHeaders();
      this.url.sync();
      return;
    }
    const { rows, statusCounts, monthCounts } = queryRows(this.state);
    this.renderRows(rows);
    this.renderActiveFilters();
    this.renderControls(rows.length, statusCounts, monthCounts);
    if (!this.skipUrlSync) this.url.sync();
  }

  isDateDescSort() {
    return this.state.sortBy === 'date' && this.state.sortDesc;
  }

  renderRows(rows) {
    this.dom.table.dataset.density = this.state.density;
    this.pendingRows = rows;
    this.renderedCount = 0;
    this.chipObserver?.disconnect();
    this.dom.rows.replaceChildren();
    this.appendNextChunk();
  }

  appendNextChunk() {
    // Re-observing after each append makes the sentinel re-fire if it is still
    // within range, so one long scroll keeps pulling chunks until it isn't.
    this.sentinelObserver?.unobserve(this.dom.sentinel);
    const limit = this.sentinelObserver ? RENDER_CHUNK : Infinity;
    const chunk = this.pendingRows.slice(this.renderedCount, this.renderedCount + limit);
    this.renderedCount += chunk.length;
    const els = chunk.map(row => {
      const rowEl = buildRow(row, {
      density: this.state.density,
      authorCounts: this.state.authorCounts,
      onAuthorFilter: author => this.addActiveFilter('author', author),
      onConstraintFilter: name => this.addActiveFilter('constraint', name),
      onIdFilter: id => this.setFilter(id),
      onOpenScript: scriptRow => this.openScript(scriptRow),
      });
      // Read back by syncVisibleMonths() to mark the timeline.
      rowEl.dataset.month = monthOf(row);
      return rowEl;
    });
    this.dom.rows.append(...els);
    for (const rowEl of els) this.observeRowChips(rowEl);
    this.queueVisibleSync();
    if (this.renderedCount < this.pendingRows.length) {
      this.sentinelObserver.observe(this.dom.sentinel);
    }
  }

  // Coalesced to one measure per frame: scroll fires far faster than the strip
  // can usefully change, and the scan below forces layout.
  queueVisibleSync() {
    if (this.visibleFrame) return;
    this.visibleFrame = requestAnimationFrame(() => {
      this.visibleFrame = 0;
      this.timeline.setVisible(this.visibleMonths());
    });
  }

  // The months of the rows on screen. Rows stack vertically in document order,
  // so the first one below the fold can be found by binary search rather than
  // by walking the whole rendered list. Deliberately not derived from the sort
  // order: under a non-date sort the on-screen rows are scattered across the
  // axis, and the strip should show that honestly.
  visibleMonths() {
    const rows = this.dom.rows.children;
    const months = new Set();
    if (!rows.length) return months;
    // The controls block is sticky, so rows behind it are not really on screen.
    const top = this.dom.controls.getBoundingClientRect().bottom;
    const bottom = window.innerHeight;

    let lo = 0;
    let hi = rows.length - 1;
    let first = rows.length;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (rows[mid].getBoundingClientRect().bottom >= top) {
        first = mid;
        hi = mid - 1;
      } else {
        lo = mid + 1;
      }
    }
    for (let i = first; i < rows.length; i++) {
      if (rows[i].getBoundingClientRect().top > bottom) break;
      const month = rows[i].dataset.month;
      if (month) months.add(month);
    }
    return months;
  }

  renderControls(visibleCount, statusCounts, monthCounts) {
    this.renderSearchSummary(visibleCount);
    this.syncLegendButtons(statusCounts);
    this.timeline.update(monthCounts, { from: this.state.dateFrom, to: this.state.dateTo });
    this.queueVisibleSync();
    this.syncSortHeaders();
  }

  renderSearchSummary(visibleCount) {
    // While only the recent shard is loaded, totals are a lower bound and an
    // empty match is inconclusive — the loading message is still showing.
    const total = `${this.state.rows.length}${this.state.rowsComplete ? '' : '+'}`;
    this.dom.empty.hidden = visibleCount > 0 || !this.state.rowsComplete;
    this.dom.count.textContent = visibleCount === this.state.rows.length
      ? `${total} puzzles`
      : `${visibleCount} of ${total} puzzles`;
    this.dom.resetFilters.hidden = !this.hasSearchState();
  }

  hasSearchState() {
    return !!this.state.filterText.trim()
      || this.state.activeFilters.length > 0
      || this.state.hiddenStatuses.size > 0
      || !!this.state.dateFrom
      || !!this.state.dateTo;
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

  // Overflow detection reads scrollWidth/Height (forced layout), so it only
  // runs once a row's chips approach the viewport, not for every rendered row.
  observeRowChips(rowEl) {
    if (rowEl.dataset.density === 'large') return;
    for (const chips of rowEl.querySelectorAll('.chips')) {
      if (this.chipObserver) this.chipObserver.observe(chips);
      else this.setupChipOverflow(chips);
    }
  }

  setupChipOverflow(chips) {
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
    chips.addEventListener('scroll', update, { passive: true });
  }

  buildLegend() {
    const counts = {};
    for (const row of this.state.rows) counts[row.status] = (counts[row.status] || 0) + 1;
    const tiers = Object.keys(STATUS)
      .filter(status => counts[status])
      .sort((a, b) => statusMeta(a).rank - statusMeta(b).rank);
    // Only the tiers that actually have rows are selectable, so solo/reset
    // reason about these rather than every status in STATUS.
    this.legendStatuses = tiers;

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

  syncLegendButtons(statusCounts) {
    for (const item of this.dom.legend.querySelectorAll('.legend-item')) {
      const meta = statusMeta(item.dataset.status);
      const hidden = this.state.hiddenStatuses.has(item.dataset.status);
      if (statusCounts) {
        item.querySelector('.count').textContent = statusCounts[item.dataset.status] || 0;
      }
      item.classList.toggle('off', hidden);
      item.setAttribute('aria-pressed', hidden ? 'false' : 'true');
      item.title = {
        solo: `Show only ${meta.label}`,
        all: 'Show all statuses',
        show: `Show ${meta.label}`,
        hide: `Hide ${meta.label}`,
      }[this.legendAction(item.dataset.status)];
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
    this.filterTimer = setTimeout(() => {
      this.url.markTyping();
      this.setFilter(text);
    }, 100);
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

  // A legend click acts as a solo control at the extremes: from all-shown it
  // narrows to that status alone, and clicking the sole shown status widens back
  // to all. In between it's a plain toggle, so multi-status views stay reachable.
  legendAction(status) {
    const hidden = this.state.hiddenStatuses;
    if (!hidden.size) return 'solo';
    if (!hidden.has(status)
      && this.legendStatuses.every(s => s === status || hidden.has(s))) return 'all';
    return hidden.has(status) ? 'show' : 'hide';
  }

  toggleStatus(status) {
    const hidden = this.state.hiddenStatuses;
    switch (this.legendAction(status)) {
      case 'solo':
        for (const s of this.legendStatuses) if (s !== status) hidden.add(s);
        break;
      case 'all': hidden.clear(); break;
      case 'show': hidden.delete(status); break;
      case 'hide': hidden.add(status); break;
    }
    this.render();
  }

  // The timeline repaints live as the pointer moves, so its onChange must not
  // reach UrlState -- otherwise a single drag would push a history entry per
  // month crossed. The gesture's end (onCommit) writes the one entry.
  setDateRange(range) {
    this.state.dateFrom = range ? range.from : null;
    this.state.dateTo = range ? range.to : null;
    this.skipUrlSync = true;
    this.render();
    this.skipUrlSync = false;
  }

  clearFilters() {
    this.state.hiddenStatuses.clear();
    this.state.activeFilters = [];
    this.state.dateFrom = null;
    this.state.dateTo = null;
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
    if ('IntersectionObserver' in window) {
      this.sentinelObserver = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) this.appendNextChunk();
      }, { rootMargin: '1200px 0px' });
      this.chipObserver = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          this.chipObserver.unobserve(entry.target);
          this.setupChipOverflow(entry.target);
        }
      }, { rootMargin: '200px 0px' });
    }

    if ('ResizeObserver' in window) {
      new ResizeObserver(() => this.syncStickyOffset()).observe(this.dom.controls);
    } else {
      window.addEventListener('resize', () => this.syncStickyOffset());
    }

    const syncToTop = () => {
      this.dom.toTop.hidden = window.scrollY <= 0;
      this.queueVisibleSync();
    };
    window.addEventListener('scroll', syncToTop, { passive: true });
    window.addEventListener('resize', () => this.queueVisibleSync(), { passive: true });
    syncToTop();
    this.dom.toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

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
      buildIssHref: async text => ISS_BASE + '?code=' + await encodeCodeParam(text),
    });
  }
}

new IndexApp().start();
