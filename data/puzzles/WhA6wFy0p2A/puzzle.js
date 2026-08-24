// Title: Coordinate Sudoku
// Author: Shye
// Video: https://www.youtube.com/watch?v=WhA6wFy0p2A
// Source: https://app.crackingthecryptic.com/sudoku/M7N3GPRjtJ

// Normal sudoku rules apply. The digits XYZ in pills (reading left to right)
// signify that rowX, columnY = Z.
//
// The pills carry no printed digits: each is a one-cell-high rounded rectangle
// outlining three horizontally adjacent cells, and every cell it covers is
// empty in the givens. So X, Y and Z are the solver's own digits in those three
// cells, read left to right, and the rule is self-referential. Nothing is
// omitted.

// Givens, transcribed row by row from the printed digits ('.' = empty).
const GIVENS = [
  '.289...4.',
  '9...7...8',
  '.....3...',
  '4.....6..',
  '.1.....7.',
  '..6.....4',
  '...8.....',
  '6...5...7',
  '.9...485.',
];

// The five pills, as the cells each one covers, left to right.
const PILLS = [
  ['R3C2', 'R3C3', 'R3C4'],
  ['R4C3', 'R4C4', 'R4C5'],
  ['R5C4', 'R5C5', 'R5C6'],
  ['R6C5', 'R6C6', 'R6C7'],
  ['R7C6', 'R7C7', 'R7C8'],
];

const VAR_PREFIX = ['A', 'B', 'C', 'D', 'E'];

const rowCells = (r) =>
  Array.from({ length: 9 }, (_, i) => makeCellId(r, i + 1));

// ValueIndexing(valueCell, controlCell, ...indexedCells) enforces
// valueCell === indexedCells[controlCell - 1] -- a dereference whose index is
// itself a digit. Reaching rowX/columnY needs two of them, because both
// coordinates are unknown, so each pill gets a 9-cell scratch column:
//   step 1: proj[r] is the digit at (r, Y), indexing row r by the pill's
//           middle cell;
//   step 2: the pill's last cell is proj[X], indexing that column by the
//           pill's first cell -- i.e. the digit at (X, Y) is Z.
// proj is fully determined by step 1, so it adds no free search space.
const coordinates = PILLS.flatMap(([xCell, yCell, zCell], k) => {
  const proj = new Var(VAR_PREFIX[k], `pill ${k + 1} column`, 9);
  return [
    proj,
    ...Array.from({ length: 9 }, (_, i) =>
      new ValueIndexing(proj.cell(i + 1), yCell, ...rowCells(i + 1))),
    new ValueIndexing(zCell, xCell, ...proj.cells()),
  ];
});

return [
  new Shape('9x9'),
  ...GIVENS.flatMap((row, r) =>
    [...row].flatMap((ch, c) =>
      ch === '.' ? [] : [new Given(makeCellId(r + 1, c + 1), +ch)])),
  ...coordinates,
];
