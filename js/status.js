// Status tier metadata: display icon, label, CSS class, and a sort rank
// (best → worst) shared by the table sort and the legend order.

export const STATUS = {
  validated: { icon: '●', label: 'Solved', cls: 'ok', rank: 0 },
  // Solved and unique, but the answer lives in Var cells, not the main grid.
  'off-grid': { icon: '◉', label: 'Solved off-grid', cls: 'ok', rank: 1 },
  partial: { icon: '◐', label: 'Partial', cls: 'warn', rank: 2 },
  'too-slow': { icon: '◑', label: 'Too slow', cls: 'warn', rank: 3 },
  unsupported: { icon: '✕', label: 'Unsupported', cls: 'bad', rank: 4 },
  'decode-failed': { icon: '⚠', label: 'Decode failed', cls: 'bad', rank: 5 },
  'no-source': { icon: '∅', label: 'No source', cls: 'idle', rank: 6 },
  pending: { icon: '○', label: 'Pending', cls: 'idle', rank: 7 },
};

export function statusMeta(status) {
  return STATUS[status] || STATUS.pending;
}

// Stable hue per constraint-type name, so a given constraint always gets the
// same chip colour (mirrors the ISS puzzle-selector chips).
export function hueFor(name) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}
