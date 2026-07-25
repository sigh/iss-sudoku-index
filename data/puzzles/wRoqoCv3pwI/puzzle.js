// Title: When It's Time to Parity We Will Parity Hard
// Author: Calvinball and ChinStrap
// Video: https://www.youtube.com/watch?v=wRoqoCv3pwI
// Source: https://sudokupad.app/04q6z7ds83

// Normal sudoku rules apply on a 9x9 grid with no given digits.
// Parity Mirror: every cell (R,C) and its transpose (C,R) across the
// R1C1-R9C9 diagonal share parity.
// Index Lines: the value at position N along a line (starting from the
// diamond) gives the position along the line where digit N appears.

// Parity Mirror: pair each cell with its transpose once (diagonal cells
// mirror themselves and need no constraint).
const parityKey = Pair.fnToKey((a, b) => a % 2 === b % 2, 9);
const parityMirror = [];
for (let r = 1; r <= 9; r++) {
  for (let c = r + 1; c <= 9; c++) {
    parityMirror.push(
      new Pair(parityKey, 'Parity Mirror', makeCellId(r, c), makeCellId(c, r)));
  }
}

// Index Line automaton, adapted per line to its own length n. Position p
// holds value v; if v > p this commits position v to (eventually) hold value
// p, recorded in `expected`; if v < p the commitment must already have been
// recorded by position v and is checked (and cleared) now. Values outside
// 1..n cannot name a position on the line and are rejected immediately.
// Acceptance requires every commitment resolved by the end of the line.
const indexLineSpec = (n) => ({
  startState: { p: 0, expected: {} },
  maxDepth: n,
  transition: (state, value) => {
    const p = state.p + 1;
    if (value < 1 || value > n) return undefined;
    const expected = { ...state.expected };
    let resolved = false;
    if (expected[p] !== undefined) {
      if (expected[p] !== value) return undefined;
      delete expected[p];
      resolved = true;
    }
    if (value < p) {
      if (!resolved) return undefined;
    } else if (value > p) {
      if (expected[value] !== undefined && expected[value] !== p) return undefined;
      expected[value] = p;
    }
    return { p, expected };
  },
  accept: (state) => state.p === n && Object.keys(state.expected).length === 0,
});

// Drawn teal lines, diamond cell first (background diamond underlay marks
// each line's first cell).
const INDEX_LINES = [
  ['R2C1', 'R1C1', 'R2C2', 'R3C3'],
  ['R3C1', 'R4C1', 'R3C2', 'R4C2', 'R5C2', 'R6C1', 'R7C1'],
  ['R2C4', 'R2C5', 'R1C6', 'R2C7', 'R3C6', 'R4C5', 'R5C5', 'R5C4'],
  ['R6C8', 'R5C7', 'R6C7', 'R6C6', 'R7C6', 'R7C5', 'R8C6'],
  ['R7C7', 'R8C7', 'R8C8', 'R9C8', 'R8C9', 'R7C8'],
];

const indexLines = INDEX_LINES.map((cells, i) => new NFA(
  NFA.encodeSpec(indexLineSpec(cells.length), 9),
  `Index Line ${i + 1}`, ...cells));

return [
  new Shape('9x9'),
  ...parityMirror,
  ...indexLines,
];
