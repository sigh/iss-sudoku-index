// Title: Renbanage
// Author: Celery
// Video: https://www.youtube.com/watch?v=z7ikqv1GoMw
// Source: https://app.crackingthecryptic.com/sudoku/R9JdLhd3p8

// Normal sudoku rules apply (default 3x3 boxes, from `regions` in the source).
// Each purple line is a Renban: non-repeating consecutive digits, any order.
// Each cage sums to the total shown in its top-left cell, with no repeats
// within the cage.

const renbanCells = [
  // Provenance: `lines` array (purple, #D23BE7, thickness 10), waypoints
  // interpolated per describe-json-puzzle's geometry helper.
  ['R1C1', 'R2C2', 'R2C3'],
  ['R3C2', 'R4C2', 'R4C1'],
  ['R4C3', 'R5C2', 'R6C1'],
  ['R5C3', 'R6C3', 'R6C2'],
  ['R4C4', 'R4C5'],
  ['R5C5', 'R6C4'],
  ['R2C4', 'R3C4', 'R3C5'],
  ['R1C4', 'R2C5', 'R3C6'],
  ['R1C6', 'R2C6', 'R2C7'],
  ['R2C8', 'R3C7'],
  ['R5C7', 'R4C7', 'R4C8'],
  ['R4C9', 'R5C8', 'R6C7'],
  ['R6C9', 'R6C8', 'R7C8'],
  ['R9C9', 'R8C8', 'R8C7'],
  ['R7C4', 'R8C5', 'R9C6'],
  ['R7C5', 'R7C6', 'R8C6'],
  ['R9C4', 'R8C4', 'R8C3'],
  ['R7C3', 'R8C2'],
];

// Provenance: `cages` array entries with `cells`/`value` (the three
// metadata-stub entries -- rules/author/title -- are not cages).
const cages = [
  [12, 'R1C5', 'R1C6', 'R1C7', 'R2C7'],
  [10, 'R4C5', 'R5C5', 'R5C6'],
  [12, 'R8C3', 'R9C3', 'R9C4', 'R9C5'],
  [14, 'R3C1', 'R3C2', 'R4C1', 'R5C1'],
  [14, 'R5C9', 'R6C9', 'R7C9', 'R7C8'],
];

return [
  new Shape('9x9'),
  new Given('R7C1', 3),
  ...renbanCells.map(cells => new Renban(...cells)),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
