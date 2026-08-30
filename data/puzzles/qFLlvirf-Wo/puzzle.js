// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=qFLlvirf-Wo
// Source: https://cracking-the-cryptic.web.app/sudoku/jJfdL7BDmp

// Normal Sudoku rules apply.
// Even: every shaded (grey) cell contains an even digit.
// Linked start: this is No 4 of four linked sudokus, and the digits standing in
// puzzle No 3's circled cells are additional givens here at the same
// coordinates -- the digits the video shows on screen before the solve begins.
// This puzzle draws no circles of its own, so nothing is exported onward.

// Printed in the source grid.
const givens = [
  ['R2C5', 6], ['R3C4', 9], ['R3C6', 2], ['R4C3', 1], ['R4C4', 7],
  ['R4C7', 5], ['R5C2', 3], ['R5C8', 7], ['R6C3', 6], ['R6C6', 5],
  ['R6C7', 9], ['R7C4', 2], ['R7C6', 6], ['R8C5', 3],
];

// Carried in from puzzle No 3's circled cells, per the linked-sudoku rule.
const importedGivens = [
  ['R1C1', 5], ['R1C9', 9], ['R2C2', 7], ['R2C8', 5],
  ['R8C2', 5], ['R8C8', 9], ['R9C1', 1], ['R9C9', 8],
];

// The eight 1x1 grey squares drawn as cell backgrounds.
const shadedCells = [
  'R1C5', 'R3C3', 'R3C7', 'R5C1', 'R5C9', 'R7C3', 'R7C7', 'R9C5',
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...importedGivens.map(([cell, value]) => new Given(cell, value)),
  // Parity has no dedicated class; a multi-value Given restricts the candidates.
  ...shadedCells.map((cell) => new Given(cell, 2, 4, 6, 8)),
];
