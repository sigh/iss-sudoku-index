// Title: Nov 4, 2021: Parity Lines
// Author: clover!
// Video: https://www.youtube.com/watch?v=w-5nFQO26Wk
// Source: https://tinyurl.com/52p3w653

// Normal sudoku rules apply. Digits on the same line have the same parity:
// every digit on a line is odd, or every digit on that line is even (repeats
// on a line are otherwise unrestricted, so long as row/column/box sudoku
// rules hold). There is no dedicated same-parity-line class, so each line is
// Or(all cells restricted to odd candidates, all cells restricted to even
// candidates), built from per-cell multi-value Givens.

const givens = [
  new Given('R1C1', 1), new Given('R1C3', 2), new Given('R1C7', 6), new Given('R1C9', 7),
  new Given('R3C1', 4), new Given('R3C3', 3), new Given('R3C7', 9), new Given('R3C9', 8),
  new Given('R4C4', 2),
  new Given('R5C4', 8), new Given('R5C6', 6),
  new Given('R6C6', 1),
  new Given('R7C1', 5), new Given('R7C3', 6), new Given('R7C7', 2), new Given('R7C9', 3),
  new Given('R9C1', 8), new Given('R9C3', 7), new Given('R9C7', 5), new Given('R9C9', 4),
];

const ODD = [1, 3, 5, 7, 9];
const EVEN = [2, 4, 6, 8];

// Drawn grey lines; cell order is draw order, not meaningful to the
// symmetric parity rule.
const lines = [
  ['R2C1', 'R2C2', 'R2C3'],
  ['R1C8', 'R2C8', 'R3C8'],
  ['R8C9', 'R8C8', 'R8C7'],
  ['R7C2', 'R8C2', 'R9C2'],
  ['R5C7', 'R6C7'],
  ['R5C3', 'R4C3'],
  ['R7C6', 'R7C5', 'R6C4', 'R5C3'],
  ['R3C4', 'R3C5', 'R4C6', 'R5C7'],
  ['R2C4', 'R2C5', 'R3C6', 'R4C7', 'R5C8', 'R6C8'],
  ['R4C2', 'R5C2', 'R6C3', 'R7C4', 'R8C5', 'R8C6'],
];

const parityLines = lines.map(cells => new Or([
  new And(cells.map(c => new Given(c, ...ODD))),
  new And(cells.map(c => new Given(c, ...EVEN))),
]));

return [
  new Shape('9x9'),
  ...givens,
  ...parityLines,
];
