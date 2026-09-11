// Title: Valtari
// Author: shye
// Video: https://www.youtube.com/watch?v=-kjnNt8ClIA
// Source: https://app.crackingthecryptic.com/sudoku/P6phpMtQfN

// Normal sudoku rules apply: 1-9 once in every row, column and 3x3 box.
// That is the whole ruleset -- the source draws no cages, lines, arrows,
// dots or overlays, and nothing else is stated. Shape('9x9') supplies the
// row/column/box all-different baseline, and the source's own nine regions
// were checked to be exactly the standard 3x3 boxes, so no explicit region
// partition is needed.

// The 25 givens, transcribed from the source grid's filled cells.
const givens = [
  ['R1C1', 4], ['R1C9', 2],
  ['R2C3', 5], ['R2C5', 8], ['R2C6', 2], ['R2C7', 9],
  ['R3C2', 2], ['R3C8', 3],
  ['R4C3', 8], ['R4C5', 1],
  ['R5C1', 5], ['R5C2', 6], ['R5C5', 9], ['R5C8', 7], ['R5C9', 8],
  ['R6C5', 6], ['R6C7', 5],
  ['R7C2', 1], ['R7C8', 6],
  ['R8C3', 6], ['R8C4', 1], ['R8C5', 5], ['R8C7', 7],
  ['R9C1', 3], ['R9C9', 4],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
