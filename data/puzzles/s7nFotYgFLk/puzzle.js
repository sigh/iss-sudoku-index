// Title: Liar Odd-Even
// Author: Bastien Vial-Jaime
// Video: https://www.youtube.com/watch?v=s7nFotYgFLk
// Source: https://app.crackingthecryptic.com/sudoku/H93NDn6Jrg

// Normal sudoku rules apply. A circled cell holds an odd digit and a
// squared cell holds an even digit, except that exactly one of the 26
// drawn symbols is a "liar": a square holding an odd digit or a circle
// holding an even digit (never any other mismatch, and never zero or more
// than one liar).
//
// One flag Var per symbol records whether that symbol is truthful (1) or
// the liar (2); ContainExact('2', ...) over every flag forces exactly one
// liar among the 26. Each symbol's own constraint reads its flag and picks
// the matching parity restriction on its cell: Or(And(flag=1, stated
// parity), And(flag=2, opposite parity)).

const ODD = [1, 3, 5, 7, 9];
const EVEN = [2, 4, 6, 8];

// Circle cells (odd unless the liar), from the drawn grey circles.
const circles = [
  'R1C3', 'R1C4', 'R3C5', 'R3C6', 'R4C1', 'R4C2', 'R5C7', 'R5C8',
  'R6C3', 'R6C4', 'R7C9', 'R8C5', 'R8C6',
];
// Square cells (even unless the liar), from the drawn grey squares.
const squares = [
  'R2C4', 'R2C5', 'R3C1', 'R4C6', 'R4C7', 'R5C2', 'R5C3', 'R6C8',
  'R6C9', 'R7C4', 'R7C5', 'R9C6', 'R9C7',
];

// Transcribed from the puzzle's printed given digits.
const givens = [
  ['R1C5', 7], ['R1C6', 6], ['R1C7', 1], ['R2C6', 2], ['R2C7', 3],
  ['R2C8', 5], ['R3C7', 7], ['R3C8', 6], ['R3C9', 2], ['R4C8', 7],
  ['R4C9', 1], ['R5C1', 6], ['R5C9', 3], ['R6C1', 5], ['R6C2', 1],
  ['R7C1', 3], ['R7C2', 4], ['R7C3', 1], ['R8C2', 2], ['R8C3', 5],
  ['R8C4', 3], ['R9C3', 9], ['R9C4', 4], ['R9C5', 1],
].map(([cell, value]) => new Given(cell, value));

const symbols = [
  ...circles.map(cell => ({ cell, statedParity: ODD, liarParity: EVEN })),
  ...squares.map(cell => ({ cell, statedParity: EVEN, liarParity: ODD })),
];

const liarFlags = new Var('VL', 'symbol liar flags', symbols.length);
const flagCells = liarFlags.cells();

const symbolConstraints = symbols.map(({ cell, statedParity, liarParity }, i) => new Or([
  new And([new Given(flagCells[i], 1), new Given(cell, ...statedParity)]),
  new And([new Given(flagCells[i], 2), new Given(cell, ...liarParity)]),
]));

return [
  new Shape('9x9'),
  ...givens,
  liarFlags,
  ...flagCells.map(flag => new Given(flag, 1, 2)),
  ...symbolConstraints,
  new ContainExact('2', ...flagCells),
];
