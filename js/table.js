// Row rendering + sort comparators for the index table.
//
// The ISS links (?q=<constraint string> and ?code=<base64 script>) can be huge,
// so we DON'T bake them into the data. Instead each row knows its puzzle dir and
// we fetch <dir>/puzzle.iss / puzzle.js lazily — prefetched on hover/focus so the
// link is ready by the time it's clicked.

import { statusMeta, hueFor } from './status.js';

const YOUTUBE_ICON = 'https://www.youtube.com/favicon.ico';
const ISS_BASE = 'https://sigh.github.io/Interactive-Sudoku-Solver/';

// --- formatting helpers ---

function faviconOf(url) {
  try { return new URL(url).origin + '/favicon.ico'; } catch { return null; }
}

function fmtRuntime(ms) {
  if (ms == null) return '';
  return ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(2)} s`;
}

function fmtGuesses(n) {
  return n == null ? '' : n.toLocaleString('en-US');
}

function fmtSize(n) {
  if (n == null) return '';
  return n < 1024 ? `${n} B` : `${(n / 1024).toFixed(1)} kB`;
}

// URL-safe base64, matching ISS's Base64Codec.encodeString (btoa + -_ + no '=').
// TextEncoder keeps ASCII scripts byte-identical to ISS and never throws on
// stray non-ASCII in comments.
function urlSafeB64(str) {
  let bin = '';
  for (const b of new TextEncoder().encode(str)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// --- sort keys, one per sortable column ---

export const SORT_KEYS = {
  status: r => statusMeta(r.status).rank,
  title: r => (r.puzzle_title || '').toLowerCase(),
  constraint: r => (r.iss_size == null ? -Infinity : r.iss_size),
  date: r => r.date || '',
  // Capped (didn't finish) and non-unique (counters are for a 2nd solution) rows
  // aren't a clean solve magnitude — sort them to the end with the number-less ones.
  guesses: r => (r.hit_cap || r.unique_solution === false || r.guesses == null ? Infinity : r.guesses),
  runtime: r => (r.hit_cap || r.unique_solution === false || r.solve_ms == null ? Infinity : r.solve_ms),
};

// --- element builders ---

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function iconLink(href, iconSrc, title) {
  const a = el('a');
  a.href = href;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.title = title;
  const img = el('img', 'favicon');
  img.src = iconSrc;
  img.alt = title;
  img.loading = 'lazy';
  img.addEventListener('error', () => { a.textContent = title[0]; });
  a.append(img);
  return a;
}

// Turn a placeholder <a> into one whose href is built from a fetched file, loaded
// on first hover/focus (or on click, as a fallback for keyboard/touch).
function lazyIssLink(label, title, fileUrl, buildHref, variant) {
  const a = el('a', 'iss-link', label);
  if (variant) a.classList.add(variant);
  a.href = '#';
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.title = title;
  a.classList.add('lazy');

  let ready = false;
  let loading = null;
  const ensure = () => {
    if (ready) return Promise.resolve();
    if (!loading) {
      loading = fetch(fileUrl)
        .then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
        .then(text => { a.href = buildHref(text); ready = true; a.classList.remove('lazy'); })
        .catch(() => { a.classList.add('error'); a.title = 'Failed to load script'; });
    }
    return loading;
  };
  a.addEventListener('pointerenter', ensure);
  a.addEventListener('focus', ensure);
  a.addEventListener('click', e => {
    if (ready) return;              // href resolved — let the browser open it
    e.preventDefault();
    ensure().then(() => { if (ready) window.open(a.href, '_blank', 'noopener'); });
  });
  return a;
}

function statusCell(status) {
  const m = statusMeta(status);
  const td = el('td', 'col-status');
  const badge = el('span', `badge ${m.cls}`);
  badge.title = m.label;
  badge.append(el('span', 'dot', m.icon), el('span', 'label', m.label));
  td.append(badge);
  return td;
}

function puzzleCell(row) {
  const td = el('td', 'col-puzzle');
  td.append(el('div', 'puzzle-title', row.puzzle_title || '(untitled)'));
  if (row.author) td.append(el('div', 'puzzle-author', `by ${row.author}`));
  if (row.constraint_types && row.constraint_types.length) {
    const chips = el('div', 'chips');
    for (const name of row.constraint_types) {
      const chip = el('span', 'chip', name);
      chip.dataset.name = name;               // click-to-filter (delegated in app.js)
      chip.title = `Filter by ${name}`;
      chip.style.setProperty('--tag-hue', hueFor(name));
      chips.append(chip);
    }
    td.append(chips);
  }
  return td;
}

function numCell(text) {
  const td = el('td', 'col-num', text || '—');
  if (!text) td.classList.add('na');
  return td;
}

// A muted two-line cell for counters that aren't a clean "solved uniquely"
// magnitude: a status label over the (qualified) number. Used for capped runs
// (didn't finish -> lower bound) and non-unique runs (counters are for finding a
// 2nd solution, not a uniqueness proof).
function qualifiedNumCell(label, text, title) {
  const td = el('td', 'col-num');
  td.classList.add('na');
  td.title = title;
  td.append(el('div', 'qual-label', label));
  if (text) td.append(el('div', 'qual-bound', text));
  return td;
}

// Pick the right cell for a counter given how the solve ended.
function counterCell(row, text) {
  if (row.hit_cap) {
    return qualifiedNumCell('capped', text ? `≥ ${text}` : '',
      'Solve hit the backtrack cap without finishing — value is a lower bound');
  }
  if (row.unique_solution === false) {
    return qualifiedNumCell('non-unique', text,
      'Multiple solutions exist — counters are for finding a 2nd solution, not a uniqueness proof');
  }
  return numCell(text);
}

// One ISS link plus a muted size label beside it.
function issRow(link, size) {
  const row = el('span', 'iss-row');
  row.append(link);
  if (size != null) row.append(el('span', 'size', fmtSize(size)));
  return row;
}

// Video + puzzle-source favicons.
function linksCell(row) {
  const td = el('td', 'col-links');
  const icons = el('div', 'favicons');
  icons.append(iconLink(row.video_url, YOUTUBE_ICON, 'YouTube video'));
  if (row.source_url) {
    const icon = faviconOf(row.source_url);
    if (icon) icons.append(iconLink(row.source_url, icon, `Puzzle source (${row.provider || 'link'})`));
  }
  td.append(icons);
  return td;
}

// The two ISS actions (Solve / Script) with their sizes.
function constraintCell(row) {
  const td = el('td', 'col-constraint');
  if (row.iss_size && row.dir) {
    const stack = el('div', 'iss-links');
    stack.append(
      issRow(lazyIssLink('Solve', 'Open the puzzle in ISS', `${row.dir}/puzzle.iss`,
        t => ISS_BASE + '?q=' + encodeURIComponent(t.trim())), row.iss_size),
      issRow(lazyIssLink('Script', 'Open the sandbox script in ISS', `${row.dir}/puzzle.js`,
        t => ISS_BASE + '?code=' + urlSafeB64(t), 'script'), row.script_size),
    );
    td.append(stack);
  }
  return td;
}

export function buildRow(row) {
  const tr = document.createElement('tr');
  tr.append(
    statusCell(row.status),
    puzzleCell(row),
    el('td', 'col-date', row.date || ''),
    // A capped solve didn't finish — show "capped ≥ <counter>", not a plain number.
    counterCell(row, fmtGuesses(row.guesses)),
    counterCell(row, fmtRuntime(row.solve_ms)),
    linksCell(row),
    constraintCell(row),
  );
  return tr;
}
