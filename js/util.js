export const ISS_BASE = 'https://sigh.github.io/Interactive-Sudoku-Solver/';

export const DENSITIES = new Set(['compact', 'medium', 'large']);

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
// TextEncoder keeps ASCII scripts byte-identical to ISS and never throws on
// stray non-ASCII in comments.
export function urlSafeB64(str) {
  let bin = '';
  for (const b of new TextEncoder().encode(str)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
