// Title: 24 Trios!
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=7FdNel1uFF4
// Source: https://sudokupad.app/gn1gqsglle

// Normal sudoku rules apply (rows/cols/boxes all-different, from the
// baseline). Along each length-3 line, the digits ascend from one end of
// the line to the other, i.e. reading either direction the three digits are
// strictly monotonic (equivalently the middle cell's value lies strictly
// between the other two). In every 3x3 box, the digits in every
// horizontal-within-box or vertical-within-box threesome are never three
// consecutive digits in some order.

const givens = [
  new Given('R4C7', 9),
  new Given('R7C5', 7),
  new Given('R8C3', 5),
  new Given('R8C9', 1),
  new Given('R9C3', 3),
  new Given('R9C6', 8),
];

// "Ascend from one end to the other" NFA: reading the three cells in the
// order given, the values must be strictly increasing or strictly
// decreasing throughout (direction is not fixed, but must be consistent).
const monotonicSpec = {
  startState: { prev: null, dir: null },
  transition: ({ prev, dir }, value) => {
    if (prev === null) return { prev: value, dir: null };
    if (dir === null) {
      if (value > prev) return { prev: value, dir: 1 };
      if (value < prev) return { prev: value, dir: -1 };
      return undefined;
    }
    if (dir === 1 && value > prev) return { prev: value, dir: 1 };
    if (dir === -1 && value < prev) return { prev: value, dir: -1 };
    return undefined;
  },
  accept: (state) => state.dir !== null,
};
const monotonicNFA = NFA.encodeSpec(monotonicSpec, /* numValues= */ 9);

const trioLines = [
  // Corner-box diagonals.
  ['R1C1', 'R2C2', 'R3C3'],
  ['R1C9', 'R2C8', 'R3C7'],
  ['R7C3', 'R8C2', 'R9C1'],
  ['R7C7', 'R8C8', 'R9C9'],
  // Top-middle box: one line per column.
  ['R1C4', 'R2C4', 'R3C4'],
  ['R1C5', 'R2C5', 'R3C5'],
  ['R1C6', 'R2C6', 'R3C6'],
  // Bottom-middle box: one line per column.
  ['R7C4', 'R8C4', 'R9C4'],
  ['R7C5', 'R8C5', 'R9C5'],
  ['R7C6', 'R8C6', 'R9C6'],
  // Left-middle box: one line per row.
  ['R4C1', 'R4C2', 'R4C3'],
  ['R5C1', 'R5C2', 'R5C3'],
  ['R6C1', 'R6C2', 'R6C3'],
  // Right-middle box: one line per row.
  ['R4C7', 'R4C8', 'R4C9'],
  ['R5C7', 'R5C8', 'R5C9'],
  ['R6C7', 'R6C8', 'R6C9'],
  // Centre box: every row, column, and diagonal.
  ['R4C4', 'R4C5', 'R4C6'],
  ['R5C4', 'R5C5', 'R5C6'],
  ['R6C4', 'R6C5', 'R6C6'],
  ['R4C4', 'R5C4', 'R6C4'],
  ['R4C5', 'R5C5', 'R6C5'],
  ['R4C6', 'R5C6', 'R6C6'],
  ['R4C4', 'R5C5', 'R6C6'],
  ['R4C6', 'R5C5', 'R6C4'],
];

const trioNFAs = trioLines.map(
  (cells) => new NFA(monotonicNFA, 'ASCEND_TRIO', ...cells)
);

// "Never three consecutive digits in some order" NFA over an unordered
// 3-cell set: tracks the running min/max (box all-different already
// guarantees the three digits are distinct), and rejects when the final
// range is exactly 2 (three distinct digits with range 2 must be a
// consecutive run).
const noConsecSetSpec = {
  startState: { min: null, max: null },
  transition: ({ min, max }, value) => {
    if (min === null) return { min: value, max: value };
    return { min: Math.min(min, value), max: Math.max(max, value) };
  },
  accept: ({ min, max }) => max - min !== 2,
};
const noConsecSetNFA = NFA.encodeSpec(noConsecSetSpec, /* numValues= */ 9);

const boxRowColTrios = [];
for (let br = 0; br < 3; br++) {
  for (let bc = 0; bc < 3; bc++) {
    const r0 = br * 3 + 1;
    const c0 = bc * 3 + 1;
    for (let i = 0; i < 3; i++) {
      // Row-within-box.
      boxRowColTrios.push([
        makeCellId(r0 + i, c0),
        makeCellId(r0 + i, c0 + 1),
        makeCellId(r0 + i, c0 + 2),
      ]);
      // Column-within-box.
      boxRowColTrios.push([
        makeCellId(r0, c0 + i),
        makeCellId(r0 + 1, c0 + i),
        makeCellId(r0 + 2, c0 + i),
      ]);
    }
  }
}

const noConsecConstraints = boxRowColTrios.map(
  (cells) => new NFA(noConsecSetNFA, 'NO_CONSEC_TRIO', ...cells)
);

return [
  new Shape('9x9'),
  ...givens,
  ...trioNFAs,
  ...noConsecConstraints,
];
