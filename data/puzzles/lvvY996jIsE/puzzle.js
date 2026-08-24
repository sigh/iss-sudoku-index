// Title: Shapes
// Author: Thomas Occhipinti
// Video: https://www.youtube.com/watch?v=lvvY996jIsE
// Source: https://app.crackingthecryptic.com/sudoku/gtTmd2Qgd3

// Normal sudoku rules apply on the 9x9 grid (standard 3x3 boxes, no givens).
//
// X markers: the two adjacent cells sum to 10 (ISS `X`).
// V markers: the two adjacent cells sum to 5 (ISS `V`).
// Rules state "Not all Xs and Vs are shown", so no negative constraint is
// placed on unmarked adjacent pairs.
//
// Orange/purple/green cells: each colour's cells are all different
// (`AllDifferent`). The rules also require each colour group to sum to a
// 2-digit total shown in that colour's pill in row 1, but every pill overlay
// in the payload has empty text -- the totals are not present anywhere in
// the source -- so only the all-different half of each colour rule is
// encoded; the sum is an omitted rule.

const xPairs = [
  ['R6C1', 'R7C1'],
  ['R9C3', 'R9C4'],
  ['R9C5', 'R9C6'],
  ['R6C5', 'R6C6'],
  ['R4C7', 'R5C7'],
  ['R3C6', 'R4C6'],
  ['R2C8', 'R3C8'],
  ['R3C4', 'R4C4'],
  ['R4C2', 'R5C2'],
];

const vPairs = [
  ['R8C5', 'R9C5'],
  ['R6C1', 'R6C2'],
];

// Colour groups, transcribed from the 1x1 coloured underlays.
const orangeCells = ['R2C9', 'R4C6', 'R3C4', 'R7C1', 'R9C3', 'R9C5', 'R8C5'];
const purpleCells = ['R8C1', 'R4C1', 'R4C4', 'R9C4', 'R5C7', 'R7C9', 'R1C7', 'R6C2'];
const greenCells = ['R3C6', 'R3C3', 'R4C7', 'R9C6', 'R7C3', 'R6C1', 'R5C4'];

return [
  new Shape('9x9'),
  ...xPairs.map(([a, b]) => new X(a, b)),
  ...vPairs.map(([a, b]) => new V(a, b)),
  new AllDifferent(...orangeCells),
  new AllDifferent(...purpleCells),
  new AllDifferent(...greenCells),
];
