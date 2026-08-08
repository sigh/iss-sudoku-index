export const ISS_BASE = 'https://sigh.github.io/Interactive-Sudoku-Solver/';

export const DENSITIES = new Set(['compact', 'medium', 'large']);

export async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Reports a failed load in the page's loading placeholder.
export function showLoadError(element, err) {
  element.textContent = `Failed to load index: ${err.message}`;
  element.classList.add('error');
}

// Builds a link into the index page's filter state. The params mirror those
// read by readActiveFilters() in app.js; repeated `constraint` values are ANDed.
export function indexUrl({ constraints = [], text = '' } = {}) {
  const params = new URLSearchParams();
  for (const name of constraints) params.append('constraint', name);
  if (text) params.set('filter', text);
  const qs = params.toString();
  return qs ? `./?${qs}` : './';
}

export function el(tag, options = {}, ...children) {
  const node = document.createElement(tag);

  if (typeof options === 'string') {
    if (options) node.className = options;
    const [text, ...rest] = children;
    if (text != null) node.textContent = text;
    node.append(...rest.flat().filter(child => child != null));
    return node;
  }

  const { className, text, attrs, dataset } = options;
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  for (const [name, value] of Object.entries(attrs || {})) {
    if (value != null) node.setAttribute(name, value);
  }
  for (const [name, value] of Object.entries(dataset || {})) {
    if (value != null) node.dataset[name] = value;
  }
  node.append(...children.flat().filter(child => child != null));
  return node;
}

// URL-safe base64, matching ISS's Base64Codec.encodeString (btoa + -_ + no '=').
function urlSafeB64(bytes) {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// ISS marks a compressed ?code= payload with a leading '.'; without it the value
// is read as plain base64. Both forms are URL-safe as-is (no escaping by
// URLSearchParams), and deflate typically cuts a script URL to well under half.
const COMPRESSED_PREFIX = '.';

// Encode a script for ISS's ?code= param. Falls back to the uncompressed legacy
// form where CompressionStream is missing — ISS still decodes that.
// TextEncoder keeps ASCII scripts byte-identical to ISS and never throws on
// stray non-ASCII in comments.
export async function encodeCodeParam(text) {
  const utf8 = new TextEncoder().encode(text);
  if (typeof CompressionStream !== 'function') return urlSafeB64(utf8);
  const stream = new Blob([utf8]).stream().pipeThrough(
    new CompressionStream('deflate-raw'));
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  return COMPRESSED_PREFIX + urlSafeB64(bytes);
}
