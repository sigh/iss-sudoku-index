// Entry point for stats.html: fetch the exported index and render
// constraint-type statistics — frequency, co-occurrence, and solver cost.

import { el, fetchJson, indexUrl, showLoadError } from './util.js';

const TOP_BARS = 40;
const TOP_MATRIX = 20;
const TOP_COST = 30;
// Below this many completed searches a median/p90 is mostly noise.
const MIN_COST_SAMPLE = 10;
// Guess counts only mean something for a faithful encoding whose search ran to
// completion, so the cost chart counts these statuses and nothing else.
const SOLVED = new Set(['validated', 'off-grid']);
// …and the too-slow rate is over the puzzles that got that far: the ones whose
// encoding pinned down a grid, leaving only the question of finishing.
const SEARCHED = new Set([...SOLVED, 'too-slow']);
// Steps in the matrix's sequential ramp; the colours are --ramp-N in style.css,
// selected by the `data-bin` attribute this file sets.
const RAMP_STEPS = 6;

// Grid-size (6x6) and value-range (1-9) tags describe geometry, not a
// constraint, so they are excluded from every chart.
const META_TAG = /^(\d+x\d+|\d+-\d+)$/;

const baseOf = tag => tag.split(':')[0].trim();
const fmtInt = n => n.toLocaleString('en-US');
const fmtTick = n => n >= 1e6 ? `${n / 1e6}M` : n >= 1e3 ? `${n / 1e3}k` : `${n}`;
const fmtPct = n => n ? `${n.toFixed(0)}%` : '–';
const pairKey = (a, b) => a < b ? `${a}\n${b}` : `${b}\n${a}`;

// Nearest-rank percentile of an ascending-sorted array.
function percentile(sorted, q) {
  return sorted[Math.max(0, Math.ceil(q * sorted.length) - 1)];
}

function aggregate(rows) {
  const types = new Map();
  const pairs = new Map();
  const parametrized = new Set();
  let typedRows = 0;

  for (const row of rows) {
    const bases = new Set();
    for (const tag of row.constraint_types || []) {
      const base = baseOf(tag);
      if (META_TAG.test(base)) continue;
      bases.add(base);
      if (tag.includes(':')) parametrized.add(base);
    }
    if (!bases.size) continue;
    typedRows++;

    for (const base of bases) {
      let s = types.get(base);
      if (!s) types.set(base, s = { count: 0, searched: 0, tooSlow: 0, guesses: [] });
      s.count++;
      if (SEARCHED.has(row.status)) s.searched++;
      if (row.status === 'too-slow') s.tooSlow++;
      if (SOLVED.has(row.status) && row.search_completed && row.guesses != null) {
        s.guesses.push(row.guesses);
      }
    }

    const names = [...bases];
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        const key = pairKey(names[i], names[j]);
        pairs.set(key, (pairs.get(key) || 0) + 1);
      }
    }
  }

  for (const [name, s] of types) {
    s.guesses.sort((a, b) => a - b);
    s.parametrized = parametrized.has(name);
  }
  const ranked = [...types.entries()].sort((a, b) => b[1].count - a[1].count);
  return { ranked, pairs, typedRows };
}

// --- Shared pieces ---

// Index-page link showing a type's puzzles. Exact tags use the constraint
// filter; parametrized bases (NFA: …) fall back to a text search on "base:",
// which matches all of their tags.
function typeHref(name, meta) {
  return meta.parametrized
    ? indexUrl({ text: `${name}:` })
    : indexUrl({ constraints: [name] });
}

// Constraint filters compose on the index page but the text filter is single,
// so a pair of parametrized bases has no faithful link.
function pairHref(a, aMeta, b, bMeta) {
  if (aMeta.parametrized && bMeta.parametrized) return null;
  if (aMeta.parametrized) [a, aMeta, b, bMeta] = [b, bMeta, a, aMeta];
  return bMeta.parametrized
    ? indexUrl({ constraints: [a], text: `${b}:` })
    : indexUrl({ constraints: [a, b] });
}

function typeLink(name, meta, className) {
  return el('a', {
    className,
    text: name,
    attrs: { href: typeHref(name, meta), title: `Show ${name} puzzles in the index` },
  });
}

function setMeta(id, text) {
  document.getElementById(id).textContent = text;
}

// Builds a table view. `columns` is [{text, num}]; `cellsFor(item, index)`
// returns one cell per column, as a string or a node. The first column is the
// row's header.
function statsTable(columns, items, cellsFor) {
  const numClass = i => columns[i].num ? 'num' : null;
  return el('table', { className: 'stats-table' },
    el('thead', {}, el('tr', {},
      columns.map((column, i) => el('th', { className: numClass(i), text: column.text })))),
    el('tbody', {}, items.map((item, index) => el('tr', {},
      cellsFor(item, index).map((cell, i) => el(i ? 'td' : 'th',
        { className: numClass(i), attrs: i ? null : { scope: 'row' } }, cell))))));
}

// Wires a section's chart/table toggle. The table is built the first time it is
// selected, rather than adding ~1,100 rows to a load that may never show them.
function wireViewToggle(key, buildTable) {
  const chart = document.getElementById(`${key}-view-chart`);
  const table = document.getElementById(`${key}-view-table`);
  for (const input of document.querySelectorAll(`input[name="${key}-view"]`)) {
    input.addEventListener('change', () => {
      if (!input.checked) return;
      const showTable = input.value === 'table';
      if (showTable && !table.firstChild) table.append(buildTable());
      chart.hidden = showTable;
      table.hidden = !showTable;
    });
  }
}

// --- Frequency bars ---

function renderFrequency(agg) {
  const top = agg.ranked.slice(0, TOP_BARS);
  const max = top[0][1].count;
  const half = Math.ceil(top.length / 2);

  const barRow = ([name, meta]) => el('div', { className: 'bar-row' },
    typeLink(name, meta, 'bar-label'),
    el('div', { className: 'bar-track' },
      el('div', {
        className: 'bar-fill',
        attrs: { style: `width: ${(meta.count / max * 100).toFixed(2)}%` },
      },
      el('span', { className: 'bar-value', text: fmtInt(meta.count) }))));

  // Column-major: the ranking reads down the left column, then down the right.
  document.getElementById('freq-chart').replaceChildren(
    ...[top.slice(0, half), top.slice(half)].map(
      column => el('div', { className: 'bar-column' }, column.map(barRow))));

  setMeta('freq-meta', `${agg.ranked.length} types · top ${top.length} shown`);

  wireViewToggle('freq', () => statsTable(
    [{ text: 'Type' }, { text: 'Puzzles', num: true }, { text: '% of encoded', num: true }],
    agg.ranked,
    ([name, meta]) => [
      typeLink(name, meta),
      fmtInt(meta.count),
      `${(meta.count / agg.typedRows * 100).toFixed(1)}%`,
    ]));
}

// --- Co-occurrence matrix ---

// Log-spaced ramp bins over [1, max]: edges at (max+1)^(i/steps).
function binEdges(max) {
  const edges = [];
  for (let i = 0; i <= RAMP_STEPS; i++) {
    edges.push(Math.max(i ? edges[i - 1] + 1 : 1, Math.round((max + 1) ** (i / RAMP_STEPS))));
  }
  edges[RAMP_STEPS] = max + 1;
  return edges;
}

function binOf(value, edges) {
  for (let i = RAMP_STEPS - 1; i >= 0; i--) {
    if (value >= edges[i]) return i;
  }
  return 0;
}

function renderMatrix(agg) {
  const top = agg.ranked.slice(0, TOP_MATRIX);
  const counts = top.map(([a]) => top.map(([b]) =>
    a === b ? 0 : (agg.pairs.get(pairKey(a, b)) || 0)));
  const max = Math.max(...counts.flat());
  const edges = binEdges(max);

  const chart = document.getElementById('cooc-chart');
  chart.style.gridTemplateColumns = `auto repeat(${top.length}, var(--cell-size))`;

  const cells = [el('div')];   // corner spacer
  for (const [name] of top) {
    cells.push(el('div', { className: 'matrix-colhead', text: name, attrs: { title: name } }));
  }
  top.forEach(([rowName, rowMeta], i) => {
    cells.push(typeLink(rowName, rowMeta, 'matrix-rowhead'));
    top.forEach(([colName, colMeta], j) => {
      if (i === j) {
        cells.push(el('div', { className: 'matrix-cell diag' }));
        return;
      }
      const value = counts[i][j];
      if (!value) {
        cells.push(el('div', { className: 'matrix-cell' }));
        return;
      }
      const href = pairHref(rowName, rowMeta, colName, colMeta);
      const tip = `${rowName} × ${colName}: ${fmtInt(value)} puzzle${value === 1 ? '' : 's'}`;
      cells.push(el(href ? 'a' : 'div', {
        className: 'matrix-cell',
        attrs: { href, 'aria-label': tip, tabindex: href ? null : '0' },
        dataset: { bin: binOf(value, edges), tip },
      }));
    });
  });
  chart.replaceChildren(...cells);
  attachTooltip(chart);

  setMeta('cooc-meta', `top ${top.length} types · max ${fmtInt(max)} shared puzzles`);

  document.getElementById('cooc-legend').replaceChildren(
    el('span', { className: 'cooc-legend-label', text: 'Puzzles with both:' }),
    el('span', { className: 'cooc-legend-swatch', text: '0' }),
    ...edges.slice(0, RAMP_STEPS).map((lo, i) => {
      const hi = edges[i + 1] - 1;
      return el('span', {
        className: 'cooc-legend-swatch',
        text: hi > lo ? `${lo}–${hi}` : `${lo}`,
        dataset: { bin: i },
      });
    }),
  );

  wireViewToggle('cooc', () => statsTable(
    [{ text: '' }, ...top.map(([name]) => ({ text: name, num: true }))],
    top,
    ([rowName], i) => [rowName, ...counts[i].map((v, j) => i === j ? '—' : fmtInt(v))]));
}

// One tooltip for the page, shared by every chart that attaches to it. Only one
// mark can be hovered at a time, so a single element and cursor suffice.
const tooltip = (() => {
  const PAD = 12;
  let node = null;
  let current = null;
  let size = { width: 0, height: 0 };

  return {
    show(target, x, y) {
      node ||= document.body.appendChild(
        el('div', { className: 'chart-tooltip', attrs: { hidden: '', role: 'status' } }));
      // Measuring forces layout, so only re-measure when the content changes.
      if (target !== current) {
        current = target;
        node.textContent = target.dataset.tip;
        node.hidden = false;
        size = node.getBoundingClientRect();
      }
      const left = Math.min(x + PAD, window.innerWidth - size.width - PAD);
      const top = Math.min(y + PAD, window.innerHeight - size.height - PAD);
      node.style.left = `${Math.max(PAD, left)}px`;
      node.style.top = `${Math.max(PAD, top)}px`;
    },
    hide() {
      current = null;
      if (node) node.hidden = true;
    },
  };
})();

// Shows the tooltip for any mark in `container` carrying a data-tip.
function attachTooltip(container) {
  container.addEventListener('pointermove', e => {
    const mark = e.target.closest('[data-tip]');
    if (mark) tooltip.show(mark, e.clientX, e.clientY);
    else tooltip.hide();
  }, { passive: true });
  container.addEventListener('pointerleave', () => tooltip.hide(), { passive: true });
  container.addEventListener('focusin', e => {
    const mark = e.target.closest('[data-tip]');
    if (!mark) return;
    const rect = mark.getBoundingClientRect();
    tooltip.show(mark, rect.right, rect.bottom);
  });
  container.addEventListener('focusout', () => tooltip.hide());
}

// --- Solver cost dumbbells ---

function costStats(agg) {
  return agg.ranked
    .filter(([, meta]) => meta.guesses.length >= MIN_COST_SAMPLE)
    .map(([name, meta]) => ({
      name,
      meta,
      n: meta.guesses.length,
      p10: percentile(meta.guesses, 0.1),
      p25: percentile(meta.guesses, 0.25),
      median: percentile(meta.guesses, 0.5),
      p75: percentile(meta.guesses, 0.75),
      p90: percentile(meta.guesses, 0.9),
      slowPct: meta.searched ? meta.tooSlow / meta.searched * 100 : 0,
    }))
    .sort((a, b) => (b.median - a.median) || (b.p90 - a.p90));
}

function renderCost(agg) {
  const all = costStats(agg);
  const shown = all.slice(0, TOP_COST);

  const axisMax = 10 ** Math.ceil(Math.log10(Math.max(...all.map(t => t.p90))));
  const pos = v => Math.log10(v + 1) / Math.log10(axisMax + 1) * 100;
  const at = v => `${pos(v).toFixed(3)}%`;
  const span = (lo, hi) => `${(pos(hi) - pos(lo)).toFixed(3)}%`;

  const ticks = [0];
  for (let t = 10; t <= axisMax; t *= 10) ticks.push(t);

  const chart = document.getElementById('cost-chart');
  // One gradient stack of hairline gridlines, shared by every track.
  chart.style.setProperty('--cost-grid', ticks.slice(1).map(t =>
    `linear-gradient(90deg, transparent calc(${at(t)} - 1px), var(--border) calc(${at(t)} - 1px),`
    + ` var(--border) ${at(t)}, transparent ${at(t)})`).join(', '));

  chart.append(
    el('div', { className: 'cost-row cost-head' },
      el('span', { className: 'cost-label-head', text: 'Type' }),
      el('div', { className: 'cost-track-head' },
        el('div', { className: 'cost-keys' },
          el('span', { className: 'cost-key' },
            el('span', { className: 'cost-key-median' }), 'median guesses'),
          el('span', { className: 'cost-key' },
            el('span', { className: 'cost-key-box' }), 'p25–p75'),
          el('span', { className: 'cost-key' },
            el('span', { className: 'cost-key-whisker' }), 'p10–p90')),
        el('div', { className: 'cost-axis' }, ticks.map(t => el('span', {
          className: 'cost-tick',
          text: fmtTick(t),
          attrs: { style: `left: ${at(t)}` },
        })))),
      el('span', { className: 'cost-num-head', text: 'Median' }),
      el('span', { className: 'cost-num-head', text: 'p90' }),
      el('span', { className: 'cost-num-head', text: 'n' }),
      el('span', { className: 'cost-num-head', text: 'Too slow' })),
    ...shown.map(t => el('div', { className: 'cost-row' },
      typeLink(t.name, t.meta, 'cost-label'),
      el('div', {
        className: 'cost-track',
        dataset: {
          tip: `${t.name} — median ${fmtInt(t.median)} guesses`
            + ` · p25–p75 ${fmtInt(t.p25)}–${fmtInt(t.p75)}`
            + ` · p10–p90 ${fmtInt(t.p10)}–${fmtInt(t.p90)} · n=${fmtInt(t.n)}`,
        },
      },
      el('div', {
        className: 'cost-whisker',
        attrs: { style: `left: ${at(t.p10)}; width: ${span(t.p10, t.p90)}` },
      }),
      el('div', {
        className: 'cost-box',
        attrs: { style: `left: ${at(t.p25)}; width: ${span(t.p25, t.p75)}` },
      }),
      el('span', { className: 'cost-median', attrs: { style: `left: ${at(t.median)}` } })),
      el('span', { className: 'cost-num', text: fmtInt(t.median) }),
      el('span', { className: 'cost-num', text: fmtInt(t.p90) }),
      el('span', { className: 'cost-num muted', text: fmtInt(t.n) }),
      el('span', { className: 'cost-num muted', text: fmtPct(t.slowPct) }),
    )),
  );

  attachTooltip(chart);

  setMeta('cost-meta', `${all.length} types with n ≥ ${MIN_COST_SAMPLE} · top ${shown.length} by median`);

  // Carries every quantile the chart draws, not just the two in the columns.
  wireViewToggle('cost', () => statsTable(
    [{ text: 'Type' }, { text: 'p10', num: true }, { text: 'p25', num: true },
      { text: 'Median', num: true }, { text: 'p75', num: true }, { text: 'p90', num: true },
      { text: 'n', num: true }, { text: 'Too slow', num: true }],
    all,
    t => [
      typeLink(t.name, t.meta),
      fmtInt(t.p10), fmtInt(t.p25), fmtInt(t.median), fmtInt(t.p75), fmtInt(t.p90),
      fmtInt(t.n), fmtPct(t.slowPct),
    ]));
}

// --- Load ---

async function load() {
  const data = await fetchJson('data/mappings.json');
  const agg = aggregate(data.rows);

  renderFrequency(agg);
  renderMatrix(agg);
  renderCost(agg);

  const generated = (data.generated_at || '').slice(0, 10);
  if (generated) {
    document.getElementById('stats-footnote').append(
      ` Data generated ${generated} over ${fmtInt(agg.typedRows)} encoded puzzles.`);
  }

  document.getElementById('loading').hidden = true;
  document.getElementById('stats-body').hidden = false;
}

load().catch(err => showLoadError(document.getElementById('loading'), err));
