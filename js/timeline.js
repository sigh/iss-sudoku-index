// A month-resolution density strip over the whole index, doubling as the date
// range selector. Bar heights count the rows that pass every *other* filter, so
// the shape stays informative while a range is selected -- the same convention
// the status legend's counts use.

import { el } from './util.js';

export function monthOf(row) {
  return (row.date || '').slice(0, 7);
}

// Inclusive on both ends; a null edge means unbounded. Month strings compare
// correctly as plain strings, so no date parsing is needed anywhere here.
export function inRange(row, from, to) {
  const month = monthOf(row);
  if (!month) return true;
  return (!from || month >= from) && (!to || month <= to);
}

export function nextMonth(month) {
  const [y, m] = month.split('-').map(Number);
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
}

// Every month between the earliest and latest row, including the empty ones:
// the 2019-07..2020-09 gap in the published index is a fact about coverage, and
// collapsing it would hide that.
export function monthDomain(rows) {
  let min = '';
  let max = '';
  for (const row of rows) {
    const month = monthOf(row);
    if (!month) continue;
    if (!min || month < min) min = month;
    if (!max || month > max) max = month;
  }
  if (!min) return [];
  const months = [];
  for (let m = min; m <= max; m = nextMonth(m)) months.push(m);
  return months;
}

function monthLabel(month) {
  const [y, m] = month.split('-');
  return `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(m) - 1]} ${y}`;
}

// Distance from the window edges, in px, that grabs a handle rather than
// starting a fresh selection.
const HANDLE_GRAB = 7;

export class Timeline {
  // onChange({ from, to } | null) -- null clears the range. onCommit() marks the
  // end of a drag gesture, which is what earns a history entry.
  constructor(container, { onChange, onCommit }) {
    this.container = container;
    this.onChange = onChange;
    this.onCommit = onCommit;
    this.months = [];
    this.range = { from: null, to: null };
    this.counts = new Map();
    this.visible = new Set();
    this.drag = null;
    this.build();
  }

  build() {
    this.bars = el('div', { className: 'tl-bars' });
    this.window = el('div', { className: 'tl-window', attrs: { hidden: '' } });
    this.years = el('div', { className: 'tl-years' });
    this.track = el('div', {
      className: 'tl-track',
      attrs: {
        tabindex: '0',
        role: 'group',
        'aria-label': 'Filter by publication date',
        // The strip has no caption line, so the affordance lives here.
        title: 'Drag to filter by date (Esc clears)',
      },
    }, this.bars, this.window);
    this.container.replaceChildren(this.track, this.years);

    this.track.addEventListener('pointerdown', e => this.onPointerDown(e));
    this.track.addEventListener('pointermove', e => this.onHover(e));
    this.track.addEventListener('keydown', e => this.onKeyDown(e));
  }

  // Rebuilds the bar elements. Only the domain (not the counts) changes shape,
  // so this runs on load and when the archive shard merges in, not per render.
  setDomain(months) {
    if (months.length === this.months.length && months[0] === this.months[0]) return;
    this.months = months;
    this.visible = new Set();
    this.bars.replaceChildren(...months.map(month => el('div', {
      className: 'tl-bar',
      dataset: { month },
    }, el('i'))));
    this.renderYears();
  }

  renderYears() {
    const n = this.months.length;
    const ticks = [];
    this.months.forEach((month, i) => {
      if (i && !month.endsWith('-01')) return;
      const tick = el('span', { className: 'tl-year', text: month.slice(0, 4) });
      tick.style.left = `${(i / n) * 100}%`;
      // The first year rarely starts on January; its label would sit off-axis.
      if (i === 0 && !month.endsWith('-01')) tick.classList.add('partial');
      ticks.push(tick);
    });
    this.years.replaceChildren(...ticks);
  }

  update(counts, range) {
    this.counts = counts;
    this.range = range;
    const max = Math.max(1, ...counts.values());
    for (const bar of this.bars.children) {
      const month = bar.dataset.month;
      const count = counts.get(month) || 0;
      // sqrt, not linear: the published index runs 1..~86 rows a month, and on a
      // linear axis the early sparse years read as noise on the baseline. Not
      // log -- log(1) is 0, which would make a one-puzzle month look empty.
      bar.style.setProperty('--h', count ? `${Math.sqrt(count / max) * 100}%` : '0');
      // Namespaced modifiers: bare `empty`/`out` would collide with the page's
      // existing .empty rule (the no-results placeholder) and its padding.
      bar.classList.toggle('tl-zero', !count);
      bar.classList.toggle('tl-out', !this.contains(month));
      bar.title = `${monthLabel(month)} · ${count} puzzle${count === 1 ? '' : 's'}`;
    }
    this.renderWindow();
  }

  // The months with rows currently on screen. Visible rows are always inside
  // the selected range, so this is a third fill tier on the same bars rather
  // than a separate marker: grey = filtered out, pale = in range, solid = on
  // screen right now.
  setVisible(months) {
    for (const month of this.visible) {
      if (!months.has(month)) this.barFor(month)?.classList.remove('tl-live');
    }
    for (const month of months) {
      if (!this.visible.has(month)) this.barFor(month)?.classList.add('tl-live');
    }
    this.visible = months;
  }

  barFor(month) {
    return this.bars.querySelector(`[data-month="${month}"]`);
  }

  contains(month) {
    const { from, to } = this.range;
    return (!from || month >= from) && (!to || month <= to);
  }

  hasRange() {
    return !!(this.range.from || this.range.to);
  }

  renderWindow() {
    const n = this.months.length;
    if (!n || !this.hasRange()) {
      this.window.hidden = true;
      return;
    }
    const start = Math.max(0, this.months.indexOf(this.range.from));
    const endMonth = this.range.to;
    const end = endMonth ? this.months.indexOf(endMonth) : n - 1;
    this.window.hidden = false;
    this.window.style.left = `${(start / n) * 100}%`;
    this.window.style.width = `${((end - start + 1) / n) * 100}%`;
  }

  indexAt(clientX) {
    const rect = this.track.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    return Math.min(this.months.length - 1,
      Math.max(0, Math.floor(ratio * this.months.length)));
  }

  windowEdges() {
    const n = this.months.length;
    if (!this.hasRange()) return null;
    const start = Math.max(0, this.months.indexOf(this.range.from));
    const end = this.range.to ? this.months.indexOf(this.range.to) : n - 1;
    return { start, end };
  }

  // Which part of an existing selection the pointer is over: an edge handle, the
  // interior (pan), or nothing (start a new selection).
  hitTest(clientX) {
    const edges = this.windowEdges();
    if (!edges) return 'new';
    const rect = this.track.getBoundingClientRect();
    const per = rect.width / this.months.length;
    const left = rect.left + edges.start * per;
    const right = rect.left + (edges.end + 1) * per;
    if (Math.abs(clientX - left) <= HANDLE_GRAB) return 'start';
    if (Math.abs(clientX - right) <= HANDLE_GRAB) return 'end';
    if (clientX > left && clientX < right) return 'pan';
    return 'new';
  }

  onHover(e) {
    if (this.drag) return;
    const mode = this.months.length ? this.hitTest(e.clientX) : 'new';
    this.track.dataset.hover = mode;
  }

  onPointerDown(e) {
    if (e.button !== 0 || !this.months.length) return;
    e.preventDefault();
    this.track.focus();
    this.track.setPointerCapture(e.pointerId);

    const index = this.indexAt(e.clientX);
    const mode = this.hitTest(e.clientX);
    const edges = this.windowEdges();
    this.drag = { mode, anchor: index, moved: false, edges, origin: index };
    if (mode === 'new') {
      this.drag.anchor = index;
      this.apply(index, index);
    }

    const move = ev => this.onPointerMove(ev);
    const up = ev => {
      this.track.releasePointerCapture(ev.pointerId);
      this.track.removeEventListener('pointermove', move);
      this.track.removeEventListener('pointerup', up);
      this.track.removeEventListener('pointercancel', up);
      this.finishDrag();
    };
    this.track.addEventListener('pointermove', move);
    this.track.addEventListener('pointerup', up);
    this.track.addEventListener('pointercancel', up);
  }

  onPointerMove(e) {
    if (!this.drag) return;
    const index = this.indexAt(e.clientX);
    const { mode, anchor, edges, origin } = this.drag;
    if (index !== origin) this.drag.moved = true;

    if (mode === 'new') {
      this.apply(Math.min(anchor, index), Math.max(anchor, index));
    } else if (mode === 'pan') {
      const width = edges.end - edges.start;
      let start = edges.start + (index - origin);
      start = Math.max(0, Math.min(this.months.length - 1 - width, start));
      this.apply(start, start + width);
    } else {
      const fixed = mode === 'start' ? edges.end : edges.start;
      this.apply(Math.min(fixed, index), Math.max(fixed, index));
    }
  }

  // A click that never moved is a month toggle: it selects that month alone, or
  // clears when that month was already the whole selection. This mirrors the
  // legend chips, where clicking the sole shown status widens back out.
  finishDrag() {
    const drag = this.drag;
    this.drag = null;
    if (!drag) return;
    if (!drag.moved && drag.mode !== 'new') {
      const month = this.months[drag.origin];
      const soleMonth = this.range.from === month && this.range.to === month;
      this.commit(soleMonth ? null : { from: month, to: month });
      return;
    }
    this.commit(this.range);
  }

  // Live update during a drag: repaints without asking for a history entry.
  // A pointermove that stays inside the same month is dropped -- each apply()
  // re-renders the whole table, and bars are only a few pixels wide.
  apply(startIndex, endIndex) {
    const from = this.months[startIndex];
    const to = this.months[endIndex];
    if (from === this.range.from && to === this.range.to) return;
    this.onChange({ from, to });
  }

  commit(range) {
    this.onChange(range);
    this.onCommit();
  }

  onKeyDown(e) {
    if (!this.months.length) return;
    const n = this.months.length;
    if (e.key === 'Escape') {
      if (!this.hasRange()) return;
      e.preventDefault();
      this.commit(null);
      return;
    }
    const step = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0;
    if (!step) return;
    e.preventDefault();

    const edges = this.windowEdges() || { start: n - 1, end: n - 1 };
    if (e.shiftKey) {
      // Shift moves the trailing edge, growing or shrinking the window.
      const end = Math.max(edges.start, Math.min(n - 1, edges.end + step));
      this.commit({ from: this.months[edges.start], to: this.months[end] });
    } else {
      const width = edges.end - edges.start;
      const start = Math.max(0, Math.min(n - 1 - width, edges.start + step));
      this.commit({ from: this.months[start], to: this.months[start + width] });
    }
  }
}
