// A month-resolution density strip over the whole index, doubling as the date
// range selector. Bar heights count the rows that pass every *other* filter, so
// the shape stays informative while a range is selected -- the same convention
// the status legend's counts use.

import { el } from './util.js';
import { monthInRange, monthLabel } from './months.js';

// Distance from the window edges, in px, that grabs a handle rather than
// starting a fresh selection.
const HANDLE_GRAB = 7;

export class Timeline {
  // onChange({ from, to } | null) -- null clears the range. onCommit() marks the
  // end of a drag gesture, which is what earns a history entry. Neither has to
  // call update() synchronously: the strip de-dupes against what it last
  // emitted, not against what it was last given.
  constructor(container, { onChange, onCommit }) {
    this.onChange = onChange;
    this.onCommit = onCommit;
    this.months = [];
    // month -> index, so nothing here scans the axis or queries the DOM.
    this.index = new Map();
    this.bars = [];
    this.range = { from: null, to: null };
    this.emitted = { from: null, to: null };
    this.visible = new Set();
    this.drag = null;
    this.build(container);
  }

  build(container) {
    this.barsBox = el('div', { className: 'tl-bars' });
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
    }, this.barsBox, this.window);
    container.replaceChildren(this.track, this.years);

    this.track.addEventListener('pointerdown', e => this.onPointerDown(e));
    this.track.addEventListener('pointermove', e => this.onHover(e));
    this.track.addEventListener('keydown', e => this.onKeyDown(e));
  }

  // Rebuilds the bar elements. Only the domain (not the counts) changes shape,
  // so this runs on load and when the archive shard merges in, not per render.
  setDomain(months) {
    if (months.length === this.months.length && months[0] === this.months[0]) return;
    this.months = months;
    this.index = new Map(months.map((month, i) => [month, i]));
    this.visible = new Set();
    this.bars = months.map(month => el('div', {
      className: 'tl-bar',
      dataset: { month },
    }, el('i')));
    this.barsBox.replaceChildren(...this.bars);
    this.renderYears();
  }

  renderYears() {
    const n = this.months.length;
    const ticks = this.months.flatMap((month, i) => {
      if (i && !month.endsWith('-01')) return [];
      const tick = el('span', { className: 'tl-year', text: month.slice(0, 4) });
      tick.style.left = `${(i / n) * 100}%`;
      // The first year rarely starts on January; its label would sit off-axis.
      if (i === 0 && !month.endsWith('-01')) tick.classList.add('partial');
      return [tick];
    });
    this.years.replaceChildren(...ticks);
  }

  update(counts, range) {
    this.range = range;
    this.emitted = range;
    const max = Math.max(1, ...counts.values());
    this.months.forEach((month, i) => {
      const bar = this.bars[i];
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
    });
    this.renderWindow();
  }

  // The months with rows currently on screen. Visible rows are always inside
  // the selected range, so this is a third fill tier on the same bars rather
  // than a separate marker: grey = filtered out, pale = in range, solid = on
  // screen right now.
  setVisible(months) {
    for (const month of this.visible) {
      if (!months.has(month)) this.barAt(month)?.classList.remove('tl-live');
    }
    for (const month of months) {
      if (!this.visible.has(month)) this.barAt(month)?.classList.add('tl-live');
    }
    this.visible = months;
  }

  barAt(month) {
    return this.bars[this.index.get(month)];
  }

  contains(month) {
    return monthInRange(month, this.range.from, this.range.to);
  }

  // The selection as bar indices, or null when nothing is selected. An open
  // edge clamps to the end of the axis.
  windowEdges() {
    const { from, to } = this.range;
    if (!from && !to) return null;
    return {
      start: from ? this.index.get(from) ?? 0 : 0,
      end: to ? this.index.get(to) ?? this.months.length - 1 : this.months.length - 1,
    };
  }

  renderWindow() {
    const n = this.months.length;
    const edges = n ? this.windowEdges() : null;
    if (!edges) {
      this.window.hidden = true;
      return;
    }
    this.window.hidden = false;
    this.window.style.left = `${(edges.start / n) * 100}%`;
    this.window.style.width = `${((edges.end - edges.start + 1) / n) * 100}%`;
  }

  // The track rect is stable for the duration of a pointer-captured gesture, so
  // the drag caches it: re-reading it per pointermove would force a layout of a
  // document whose table was just re-rendered underneath.
  trackRect() {
    return this.drag?.rect || this.track.getBoundingClientRect();
  }

  indexAt(clientX) {
    const rect = this.trackRect();
    const ratio = (clientX - rect.left) / rect.width;
    return Math.min(this.months.length - 1,
      Math.max(0, Math.floor(ratio * this.months.length)));
  }

  // Which part of an existing selection the pointer is over: an edge handle, the
  // interior (pan), or nothing (start a new selection). Returns the edges too,
  // so a caller that needs both doesn't derive them twice.
  hitTest(clientX) {
    const edges = this.windowEdges();
    if (!edges) return { mode: 'new', edges };
    const rect = this.trackRect();
    const per = rect.width / this.months.length;
    const left = rect.left + edges.start * per;
    const right = rect.left + (edges.end + 1) * per;
    let mode = 'new';
    if (Math.abs(clientX - left) <= HANDLE_GRAB) mode = 'start';
    else if (Math.abs(clientX - right) <= HANDLE_GRAB) mode = 'end';
    else if (clientX > left && clientX < right) mode = 'pan';
    return { mode, edges };
  }

  onHover(e) {
    if (this.drag || !this.months.length) return;
    const { mode } = this.hitTest(e.clientX);
    // Unconditional writes would invalidate style for the track and every bar
    // under it on each pointermove; the value rarely changes.
    if (this.track.dataset.hover !== mode) this.track.dataset.hover = mode;
  }

  onPointerDown(e) {
    if (e.button !== 0 || !this.months.length) return;
    e.preventDefault();
    this.track.focus();
    this.track.setPointerCapture(e.pointerId);

    const { mode, edges } = this.hitTest(e.clientX);
    const rect = this.track.getBoundingClientRect();
    const origin = this.indexAt(e.clientX);
    this.drag = { mode, origin, edges, rect, moved: false };
    if (mode === 'new') this.apply(origin, origin);

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
    const { mode, edges, origin } = this.drag;
    if (index !== origin) this.drag.moved = true;

    if (mode === 'new') {
      this.apply(Math.min(origin, index), Math.max(origin, index));
    } else if (mode === 'pan') {
      const width = edges.end - edges.start;
      const start = Math.max(0,
        Math.min(this.months.length - 1 - width, edges.start + (index - origin)));
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
      const soleMonth = this.emitted.from === month && this.emitted.to === month;
      this.commit(soleMonth ? null : { from: month, to: month });
      return;
    }
    this.commit(this.emitted);
  }

  // Live update during a drag: repaints without asking for a history entry. A
  // move that lands on the same months is dropped -- each emit re-renders the
  // whole table, and bars are only a few pixels wide.
  apply(startIndex, endIndex) {
    this.emit({ from: this.months[startIndex], to: this.months[endIndex] });
  }

  emit(range) {
    const from = range ? range.from : null;
    const to = range ? range.to : null;
    if (from === this.emitted.from && to === this.emitted.to) return false;
    this.emitted = { from, to };
    this.onChange(range);
    return true;
  }

  commit(range) {
    this.emit(range);
    this.onCommit();
  }

  onKeyDown(e) {
    if (!this.months.length) return;
    const n = this.months.length;
    if (e.key === 'Escape') {
      if (this.emitted.from || this.emitted.to) {
        e.preventDefault();
        this.commit(null);
      }
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
