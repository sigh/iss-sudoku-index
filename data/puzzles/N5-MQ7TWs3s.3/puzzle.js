// Title: July 14, 2022: Pastel Day
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=N5-MQ7TWs3s
// Source: https://tinyurl.com/8c6pxkd3

// Rules encoded:
// - Normal sudoku rules (9x9, rows/columns/3x3 boxes all-different -- ISS
//   default).
// - Digits in non-white (coloured) cells must be greater than digits in
//   orthogonally adjacent white cells. The payload shades exactly 24 cells,
//   in 4 pastel colours (6 cells each), and those 24 cells are precisely the
//   24 given cells -- no other cell is shaded, matching the rules' own note
//   that "every given digit is in a non-white cell, and all other cells are
//   white". The colours themselves group cells but carry no separate rule
//   (no clone/parity/etc. text refers to them), so only the shaded/white
//   partition is encoded.

const graph = cellGraph('9x9');

// Givens, with the payload's shading colour for provenance (not used below
// beyond confirming every given is shaded and vice versa).
const GIVENS = [
  ['R1C2', 7, '#FFD0D0'], ['R1C8', 5, '#D0D0FF'],
  ['R2C1', 4, '#D0D0FF'], ['R2C3', 8, '#FFFFB0'],
  ['R2C7', 9, '#B0FFB0'], ['R2C9', 7, '#FFD0D0'],
  ['R3C2', 9, '#B0FFB0'], ['R3C8', 8, '#FFFFB0'],
  ['R4C4', 4, '#D0D0FF'], ['R4C5', 9, '#B0FFB0'],
  ['R4C6', 2, '#FFFFB0'], ['R5C4', 8, '#FFFFB0'],
  ['R5C6', 6, '#FFD0D0'], ['R6C4', 3, '#FFD0D0'],
  ['R6C5', 5, '#D0D0FF'], ['R6C6', 7, '#B0FFB0'],
  ['R7C2', 8, '#FFFFB0'], ['R7C8', 9, '#B0FFB0'],
  ['R8C1', 7, '#FFD0D0'], ['R8C3', 9, '#B0FFB0'],
  ['R8C7', 8, '#FFFFB0'], ['R8C9', 5, '#D0D0FF'],
  ['R9C2', 5, '#D0D0FF'], ['R9C8', 6, '#FFD0D0'],
];
const SHADED = new Set(GIVENS.map(([cell]) => cell));

const givenConstraints = GIVENS.map(([cell, value]) => new Given(cell, value));

// Each shaded cell must be greater than each of its orthogonally adjacent
// *white* neighbours (shaded-shaded adjacencies, which occur around the
// centre box, get no constraint -- the rule only speaks of non-white vs.
// white).
const greaterThanConstraints = GIVENS.flatMap(([cell]) =>
  graph.neighbours(cell)
    .filter(n => !SHADED.has(n))
    .map(n => new GreaterThan(cell, n))
);

return [
  new Shape('9x9'),
  ...givenConstraints,
  ...greaterThanConstraints,
];
