// The URL is the canonical form of the view state: which filters are on, how the
// table is sorted, how dense the rows are. This module owns that mapping in both
// directions, plus the history policy that makes Back undo a change.

import { STATUS } from './status.js';
import { SORT_KEYS } from './table.js';
import { DENSITIES } from './util.js';

// Every field that survives in a URL, at its default. Anything at its default is
// left out of the query string, so a pristine view has a bare URL.
export const DEFAULT_STATE = {
  filterText: '',
  activeFilters: [],
  sortBy: 'date',
  sortDesc: true,
  density: 'medium',
  dateFrom: null,
  dateTo: null,
};

export function defaultSortDesc(col) {
  return col === 'date' || col === 'constraint';
}

// Also the query-param spelling of a filter, which is what makes it a usable
// identity for de-duping and for the active-filter pills' dataset keys.
export function activeFilterKey(filter) {
  return `${filter.exclude ? 'not-' : ''}${filter.type}:${filter.value}`;
}

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

function readMonth(params, name) {
  const value = params.get(name);
  return value && MONTH_RE.test(value) ? value : null;
}

// The range is a pair: a half-written URL (one edge valid, the other junk) is
// dropped whole rather than silently becoming an open-ended range.
function readDateRange(state, params) {
  const from = readMonth(params, 'from');
  const to = readMonth(params, 'to');
  if ((params.has('from') && !from) || (params.has('to') && !to)) {
    state.dateFrom = null;
    state.dateTo = null;
    return;
  }
  state.dateFrom = from && to && from > to ? to : from;
  state.dateTo = from && to && from > to ? from : to;
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

// Overwrites every URL-backed field, including the ones the URL omits -- going
// Back to an entry without a `hide` param has to clear the hidden statuses, not
// leave the current ones in place.
function readInto(state, params) {
  state.filterText = params.get('filter') || '';
  state.activeFilters = readActiveFilters(params);

  const hide = params.get('hide');
  state.hiddenStatuses = new Set(hide ? hide.split(',').filter(s => STATUS[s]) : []);

  const col = params.get('sort');
  state.sortBy = col && SORT_KEYS[col] ? col : DEFAULT_STATE.sortBy;
  const dir = params.get('dir');
  state.sortDesc = dir ? dir !== 'asc' : defaultSortDesc(state.sortBy);

  const density = params.get('density');
  state.density = DENSITIES.has(density) ? density : DEFAULT_STATE.density;

  readDateRange(state, params);
}

function urlFor(state) {
  const params = new URLSearchParams();
  if (state.filterText.trim()) params.set('filter', state.filterText.trim());
  for (const filter of state.activeFilters) {
    params.append(`${filter.exclude ? 'not-' : ''}${filter.type}`, filter.value);
  }
  if (state.hiddenStatuses.size) params.set('hide', [...state.hiddenStatuses].join(','));
  if (state.sortBy !== DEFAULT_STATE.sortBy || state.sortDesc !== DEFAULT_STATE.sortDesc) {
    params.set('sort', state.sortBy);
    params.set('dir', state.sortDesc ? 'desc' : 'asc');
  }
  if (state.density !== DEFAULT_STATE.density) params.set('density', state.density);
  if (state.dateFrom) params.set('from', state.dateFrom);
  if (state.dateTo) params.set('to', state.dateTo);

  const qs = params.toString();
  return location.pathname + (qs ? `?${qs}` : '');
}

// Keeps the address bar and the session history in step with `state`. The caller
// mutates state freely and calls sync() after each render; this decides whether
// that amounts to a new history entry.
export class UrlState {
  // onRestore runs after Back/Forward has been read into state, to re-render.
  constructor(state, onRestore) {
    this.state = state;
    this.typing = false;
    this.lastWasTyping = false;
    window.addEventListener('popstate', () => {
      this.read();
      onRestore();
    });
  }

  read() {
    readInto(this.state, new URLSearchParams(location.search));
  }

  // Read the entry the user arrived on, then rewrite it in normalized form so a
  // hand-typed or stale URL isn't the thing Back returns them to.
  start() {
    this.read();
    history.replaceState(null, '', urlFor(this.state));
  }

  // Marks the next sync as a search-box keystroke. Those replace each other
  // rather than stacking, so a typed word costs one history entry, not one per
  // character -- but the first keystroke of a run still gets its own entry, so
  // Back returns to the view from before the word was typed.
  markTyping() {
    this.typing = true;
  }

  sync() {
    const typing = this.typing;
    this.typing = false;
    const url = urlFor(this.state);
    if (url === location.pathname + location.search) return;
    const coalesce = typing && this.lastWasTyping;
    history[coalesce ? 'replaceState' : 'pushState'](null, '', url);
    this.lastWasTyping = typing;
  }
}
