// Row rendering + sort comparators for the index table.
//
// The ISS links (?q=<constraint string> and ?code=<base64 script>) can be huge,
// so we DON'T bake them into the data. Instead each row knows its puzzle dir and
// we fetch <dir>/puzzle.iss / puzzle.js lazily — prefetched on hover/focus so the
// link is ready by the time it's clicked.

import { statusMeta, hueFor } from './status.js';
import { ISS_BASE, el } from './util.js';

const YOUTUBE_ICON = 'https://www.youtube.com/favicon.ico';

// GitHub Pages / Fastly rejects request URLs past ~8 KB with 414 "URI Too Long".
// The Solve URL is ISS_BASE + the .iss verbatim (its chars — . ~ - _ and URL-safe
// base64 — aren't escaped by encodeURIComponent), so gate Solve on the .iss size.
const SOLVE_URL_LIMIT = 8000;

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

function fmtSolutions(n, lowerBound) {
  if (n == null) return '';
  const text = `${n.toLocaleString('en-US')} solution${n === 1 ? '' : 's'}`;
  return lowerBound ? `≥ ${text}` : text;
}

function fmtSize(n) {
  if (n == null) return '';
  return n < 1024 ? `${n} B` : `${(n / 1024).toFixed(1)} kB`;
}

// --- sort keys, one per sortable column ---

export const SORT_KEYS = {
  status: r => statusMeta(r.status).rank,
  title: r => (r.puzzle_title || '').toLowerCase(),
  constraint: r => (r.iss_size == null ? -Infinity : r.iss_size),
  date: r => r.date || '',
  // Incomplete searches and non-unique rows aren't a clean solve magnitude -- sort
  // them to the end with the number-less ones.
  // Runtime isn't independently sortable — it tracks guesses closely enough that a
  // second sort key isn't worth the header clutter; it rides along in the same cell.
  guesses: r => (r.search_completed !== true || r.unique_solution === false || r.guesses == null ? Infinity : r.guesses),
};

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

function authorLine(author, authorCounts, actions, inline = false) {
  const wrap = el('span', `puzzle-author${inline ? ' inline' : ''}`);
  wrap.append('by ');
  if ((authorCounts.get(author) || 0) > 1) {
    const button = el('button', 'author-filter', author);
    button.type = 'button';
    button.title = `Filter by ${author}`;
    button.addEventListener('click', () => actions.onAuthorFilter?.(author));
    wrap.append(button);
  } else {
    wrap.append(author);
  }
  return wrap;
}

function puzzleCell(row, density, authorCounts, actions) {
  const td = el('td', 'col-puzzle');
  const titleRow = el('div', 'puzzle-title-row');
  if (row.source_url) {
    const icon = faviconOf(row.source_url);
    if (icon) titleRow.append(iconLink(row.source_url, icon, `Puzzle source (${row.provider || 'link'})`));
  }
  titleRow.append(el('div', 'puzzle-title', row.puzzle_title || '(untitled)'));
  if (density === 'compact' && row.author) titleRow.append(authorLine(row.author, authorCounts, actions, true));
  td.append(titleRow);
  if (density !== 'compact' && row.author) td.append(authorLine(row.author, authorCounts, actions));
  if (row.constraint_types && row.constraint_types.length) {
    const chips = el('div', 'chips');
    const chipTarget = density === 'compact' ? el('span', 'chips-clip') : chips;
    for (const name of row.constraint_types) {
      const chip = el('button', 'chip', name);
      chip.type = 'button';
      chip.title = `Filter by ${name}`;
      chip.setAttribute('aria-label', `Filter by ${name}`);
      chip.style.setProperty('--tag-hue', hueFor(name));
      chip.addEventListener('click', () => actions.onConstraintFilter?.(name));
      chipTarget.append(chip);
    }
    if (chipTarget !== chips) chips.append(chipTarget);
    td.append(chips);
  }
  return td;
}

// Guesses + runtime merged into one cell (only guesses is sortable — the two track
// each other closely enough that a second sort column isn't worth the clutter).
// Always guesses-then-runtime, each on its own line; an incomplete/non-unique run
// adds the observed solution count at the BOTTOM, so the numbers themselves still
// read first.
function statsCell(row) {
  const capped = row.hit_cap === true;
  const incomplete = row.search_completed !== true;
  const nonUnique = row.unique_solution === false;
  const bound = t => (incomplete && t ? `≥ ${t}` : t);
  const guesses = bound(fmtGuesses(row.guesses));
  const runtime = bound(fmtRuntime(row.solve_ms));
  const solutions = incomplete
    ? fmtSolutions(row.solutions_found, true)
    : (nonUnique ? fmtSolutions(row.solutions_found, false) : '');

  const td = el('td', 'col-num');
  if (!guesses && !runtime) { td.classList.add('na'); td.textContent = '—'; return td; }
  td.append(el('div', 'stat-main', guesses || '—'));
  if (runtime) td.append(el('div', 'stat-sub', runtime));

  if (incomplete) {
    td.classList.add('na');
    td.title = capped
      ? 'Search hit the backtrack cap without completing -- values are lower bounds'
      : 'Search did not complete -- values may be partial';
    if (solutions) td.append(el('div', 'qual-label', solutions));
  } else if (nonUnique) {
    td.classList.add('na');
    td.title = 'Multiple solutions exist';
    if (solutions) td.append(el('div', 'qual-label', solutions));
  }
  return td;
}

// One ISS link plus a size label beside it — coloured as a warning when that size
// is *why* the link is disabled (oversizedReason), so the number visibly explains
// the greyed-out button next to it.
function issRow(link, size, oversizedReason) {
  const row = el('span', 'iss-row');
  row.append(link);
  if (size != null) {
    const sizeEl = el('span', 'size', fmtSize(size));
    if (oversizedReason) {
      sizeEl.classList.add('oversized');
      sizeEl.title = oversizedReason;
    }
    row.append(sizeEl);
  }
  return row;
}

// The thumbnail itself IS the video link; spacious mode uses maxresdefault for a
// clearer puzzle preview, while medium keeps the lighter mqdefault image.
function thumbnailLink(row, density) {
  const a = el('a', 'thumb-link');
  a.href = row.video_url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.title = row.video_title || 'YouTube video';
  const img = el('img', 'thumb');
  const thumbQuality = density === 'spacious' ? 'maxresdefault' : 'mqdefault';
  img.src = `https://img.youtube.com/vi/${row.video_id}/${thumbQuality}.jpg`;
  img.alt = '';
  img.loading = 'lazy';
  a.append(img);
  return a;
}

// Video cell: video link plus the date — sortable by date. Medium/spacious show
// a thumbnail; compact keeps the old favicon-sized row.
function videoCell(row, density) {
  const td = el('td', 'col-video');
  if (density !== 'compact') {
    td.append(thumbnailLink(row, density));
    td.append(el('div', 'video-date', row.date || ''));
  } else {
    const icons = el('div', 'favicons');
    icons.append(iconLink(row.video_url, YOUTUBE_ICON, 'YouTube video'));
    td.append(icons);
  }
  if (density === 'compact') td.append(el('div', 'video-date', row.date || ''));
  return td;
}

// Script action: table.js renders the control; app.js decides how to open it.
// A button, not a link, because large script ?code= URLs can exceed URL limits.
function scriptButton(row, onOpenScript) {
  const btn = el('button', 'iss-link script', 'Script');
  btn.type = 'button';
  btn.title = 'View the sandbox script';
  btn.addEventListener('click', () => onOpenScript?.(row));
  return btn;
}

// A non-clickable, muted stand-in for an action that can't work (with a reason).
function disabledLink(label, title) {
  const span = el('span', 'iss-link disabled', label);
  span.title = title;
  return span;
}

// Solve opens the constraint string as a ?q= URL — unless that URL would be too
// long for the server (large .iss), in which case it's disabled with a pointer to
// the Script, whose modal stays usable via Copy.
function solveAction(row) {
  if (row.iss_size > SOLVE_URL_LIMIT) {
    return disabledLink('Solve',
      `Constraint string too large for a URL (${fmtSize(row.iss_size)}) — use Script instead`);
  }
  return lazyIssLink('Solve', 'Open the puzzle in ISS', `${row.dir}/puzzle.iss`,
    t => ISS_BASE + '?q=' + encodeURIComponent(t.trim().replace(/\n/g, '')));
}

// The two ISS actions (Solve link / Script button) with their sizes.
function constraintCell(row, actions) {
  const td = el('td', 'col-constraint');
  if (row.iss_size && row.dir) {
    const oversized = row.iss_size > SOLVE_URL_LIMIT;
    const stack = el('div', 'iss-links');
    stack.append(
      issRow(solveAction(row), row.iss_size,
        oversized && 'Too large for a URL — this is why Solve is disabled'),
      issRow(scriptButton(row, actions.onOpenScript), row.script_size),
    );
    td.append(stack);
  }
  return td;
}

export function buildRow(row, {
  density = 'medium',
  authorCounts = new Map(),
  onAuthorFilter,
  onConstraintFilter,
  onOpenScript,
} = {}) {
  const actions = { onAuthorFilter, onConstraintFilter, onOpenScript };
  const tr = document.createElement('tr');
  tr.dataset.density = density;
  tr.append(
    videoCell(row, density),
    puzzleCell(row, density, authorCounts, actions),
    statusCell(row.status),
    statsCell(row),
    constraintCell(row, actions),
  );
  return tr;
}
