// Title: Colour Coordinated Sums
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=VeBBsKiwTVE
// Source: https://sudokupad.app/gcme2530d6

// Each arrow is [shaft, tip, colour]. The shaft digit names the target row,
// the tip digit names the target column, and their sum belongs at that address.
// Nine row-specific NFAs per arrow implement this two-axis value lookup.

const graph = cellGraph('9x9');

const arrows = [
  ['R9C7', 'R9C8', 'black'],
  ['R8C9', 'R9C9', 'black'],
  ['R7C9', 'R6C9', 'black'],
  ['R8C1', 'R7C2', 'green'],
  ['R4C2', 'R3C3', 'green'],
  ['R2C4', 'R3C3', 'green'],
  ['R2C3', 'R1C3', 'green'],
  ['R6C2', 'R5C2', 'yellow'],
  ['R4C7', 'R4C6', 'yellow'],
  ['R8C4', 'R7C5', 'yellow'],
  ['R5C7', 'R6C8', 'yellow'],
  ['R9C3', 'R9C2', 'pink'],
  ['R4C4', 'R4C5', 'pink'],
];

// For candidate row r, scan [shaft, tip, RrC1, ..., RrC9]. If the shaft
// is not r this candidate row is irrelevant. Otherwise the tip selects the
// column whose value must equal r + tip.
const rowScanCache = new Map();
const rowScanNFA = (r) => {
  if (rowScanCache.has(r)) return rowScanCache.get(r);

  const spec = NFA.encodeSpec({
    startState: { phase: 'shaft' },
    transition: (state, value) => {
      switch (state.phase) {
        case 'shaft':
          return value === r ? { phase: 'tip' } : { phase: 'skip' };
        case 'tip':
          if (r + value > 9) return undefined;
          return { phase: 'scan', remaining: value - 1, sum: r + value };
        case 'scan':
          if (state.remaining === 0) {
            return value === state.sum ? { phase: 'matched' } : undefined;
          }
          return { phase: 'scan', remaining: state.remaining - 1, sum: state.sum };
        case 'skip':
          return { phase: 'skip' };
        case 'matched':
          return { phase: 'matched' };
      }
    },
    accept: (state) => state.phase === 'skip' || state.phase === 'matched',
  }, 9);

  rowScanCache.set(r, spec);
  return spec;
};

// Scan [shaft_i, tip_i, shaft_j, tip_j] and reject exactly when the two
// arrows name the same (row, column) address.
const distinctTargetNFA = NFA.encodeSpec({
  startState: { phase: 'row-i' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'row-i':
        return { phase: 'col-i', row: value };
      case 'col-i':
        return { phase: 'row-j', row: state.row, col: value };
      case 'row-j':
        return value === state.row
          ? { phase: 'col-j', col: state.col }
          : { phase: 'different' };
      case 'col-j':
        return value === state.col ? undefined : { phase: 'different' };
      case 'different':
        return { phase: 'different' };
    }
  },
  accept: (state) => state.phase === 'different',
}, 9);

const colourKeys = {
  green: Pair.fnToKey((a, b) => Math.abs(a - b) >= 5, 9),
  yellow: Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9),
};

const colourConstraint = ([shaft, tip, colour]) => {
  if (colour === 'black') return new BlackDot(shaft, tip);
  if (colour === 'pink') return new WhiteDot(shaft, tip);
  return new Pair(colourKeys[colour], `${colour}-arrow`, shaft, tip);
};

const arrowPairs = [];
for (let i = 0; i < arrows.length; i++) {
  for (let j = i + 1; j < arrows.length; j++) {
    arrowPairs.push([arrows[i], arrows[j]]);
  }
}

return [
  new Shape('9x9'),

  ...arrows.map(colourConstraint),

  ...arrows.flatMap(([shaft, tip]) =>
    Array.from({ length: 9 }, (_, index) => index + 1).map(r =>
      new NFA(
        rowScanNFA(r),
        `coordinate-arrow-row-${r}`,
        shaft,
        tip,
        ...graph.row(r),
      ))),

  ...arrowPairs.map(([[shaftI, tipI], [shaftJ, tipJ]]) =>
    new NFA(
      distinctTargetNFA,
      'coordinate-arrow-distinct',
      shaftI,
      tipI,
      shaftJ,
      tipJ,
    )),
];
