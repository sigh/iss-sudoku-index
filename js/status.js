// Status tier metadata: display icon, label, CSS class, and a sort rank
// (best → worst) shared by the table sort and the legend order.

export const STATUS = {
  validated:       { icon: '●', label: 'Validated',     cls: 'ok',   rank: 0 },
  partial:         { icon: '◐', label: 'Partial',       cls: 'warn', rank: 1 },
  'too-slow':      { icon: '◑', label: 'Too slow',      cls: 'warn', rank: 2 },
  unsupported:     { icon: '✕', label: 'Unsupported',   cls: 'bad',  rank: 3 },
  'decode-failed': { icon: '⚠', label: 'Decode failed', cls: 'bad',  rank: 4 },
  'no-source':     { icon: '∅', label: 'No source',     cls: 'idle', rank: 5 },
  pending:         { icon: '○', label: 'Pending',       cls: 'idle', rank: 6 },
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
