// Title: Right Angles Wrong Quads
// Author: Scojo
// Video: https://www.youtube.com/watch?v=bOcMD06DNV4
// Source: https://sudokupad.app/mwz7l2lvoi

// Normal sudoku rules (standard 3x3 boxes, no givens).
//
// Anti-Quadruples: each red-circled 2x2 block lists digits that may not
// appear in any of its four cells. Encoded as a per-cell candidate
// restriction (Given with the complement of the excluded set) on every cell
// of the block, since the rule bars each listed digit from all four cells
// with no per-cell assignment.
//
// Zipper Lines: on each lavender line, digits equidistant from the center
// cell sum to the center digit. Zipper(...) takes the cells in path order and
// handles the odd-length center-sum rule directly.

const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const excludeDigits = (excluded) => digits.filter(d => !excluded.includes(d));

// Anti-Quadruple clue cells, from the drawn 2x2 blocks.
const antiQuads = [
  { cells: ['R2C2', 'R2C3', 'R3C2', 'R3C3'], excluded: [4, 8] },
  { cells: ['R5C5', 'R5C6', 'R6C5', 'R6C6'], excluded: [1, 2, 7, 9] },
  { cells: ['R7C5', 'R7C6', 'R8C5', 'R8C6'], excluded: [1, 2, 4, 9] },
  { cells: ['R5C7', 'R5C8', 'R6C7', 'R6C8'], excluded: [1, 2, 9] },
  { cells: ['R7C7', 'R7C8', 'R8C7', 'R8C8'], excluded: [1, 2, 6, 9] },
];

const antiQuadGivens = antiQuads.flatMap(
  ({ cells, excluded }) => cells.map(
    cell => new Given(cell, ...excludeDigits(excluded))));

// Zipper line paths, from the drawn lavender lines and their center dots.
const zipperPaths = [
  ['R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3'],
  ['R1C4', 'R2C4', 'R3C4', 'R4C4', 'R4C3', 'R4C2', 'R4C1'],
  ['R8C4', 'R9C4', 'R9C5'],
  ['R4C8', 'R4C9', 'R5C9'],
  ['R8C9', 'R9C9', 'R9C8'],
  ['R9C1', 'R9C2', 'R8C2'],
  ['R1C8', 'R2C8', 'R2C7'],
  ['R7C6', 'R6C6', 'R6C7'],
  ['R5C1', 'R6C1', 'R6C2'],
  ['R2C5', 'R2C6', 'R3C6'],
];

const zippers = zipperPaths.map(cells => new Zipper(...cells));

return [
  new Shape('9x9'),
  ...antiQuadGivens,
  ...zippers,
];
