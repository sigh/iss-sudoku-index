// Title: CALLERLAB 50th
// Author: Jeremy Butler
// Video: https://www.youtube.com/watch?v=b12R8GgW_js
// Source: https://sudokupad.app/ir0498bsgu

// Rules: shaded cells hold odd digits. A drawn > or < between two horizontally
// adjacent cells orders that pair. Cells sharing a letter label must hold the
// same digit ("each letter corresponds to a number"); the rule does not state
// that different letters must differ, so no cross-letter distinctness is
// encoded here.

const oddCells = [
  'R2C2', 'R2C3', 'R2C4',
  'R3C2',
  'R4C2', 'R4C3', 'R4C4',
  'R5C4', 'R5C6', 'R5C7', 'R5C8',
  'R6C2', 'R6C3', 'R6C4', 'R6C6', 'R6C8',
  'R7C6', 'R7C8',
  'R8C6', 'R8C8',
  'R9C6', 'R9C7', 'R9C8',
];

// Drawn > / < signs between horizontally adjacent cells, read left-to-right
// as an ordinary inequality (leftCell OP rightCell); the payload's own
// per-pair cell-list order is not a reliable indicator of direction here (no
// rotation "angle" field is present, unlike other puzzles' text overlays).
const greaterThanPairs = [
  ['R8C1', 'R8C2'], // "R8C1 > R8C2"
  ['R8C4', 'R8C3'], // "R8C3 < R8C4"
  ['R6C2', 'R6C1'], // "R6C1 < R6C2"
  ['R5C2', 'R5C1'], // "R5C1 < R5C2"
  ['R5C3', 'R5C2'], // "R5C2 < R5C3"
  ['R7C4', 'R7C3'], // "R7C3 < R7C4"
  ['R2C6', 'R2C7'], // "R2C6 > R2C7"
];

// Diagonal R1C1..R9C9 spells CALLERLAB; R8C2/R8C3 add a second "S"/"C". Group
// cells that share a letter so each group is forced to one common digit.
const letterGroups = {
  C: ['R1C1', 'R8C3'],
  A: ['R2C2', 'R8C8'],
  L: ['R3C3', 'R4C4', 'R7C7'],
  // E, R, B, S each label a single cell, so no extra constraint applies.
};

return [
  new Shape('9x9'),
  new Given('R3C9', 1),
  new Given('R4C9', 9),
  new Given('R5C9', 7),
  new Given('R6C9', 4),
  new Given('R9C4', 2),
  new Given('R9C5', 5),
  ...oddCells.map(cell => new Given(cell, 1, 3, 5, 7, 9)),
  ...greaterThanPairs.map(([a, b]) => new GreaterThan(a, b)),
  ...Object.values(letterGroups).map(cells => new SameValues(cells.length, ...cells)),
];
