// Title: Trapped By A Killer
// Author: SudokuExplorer
// Video: https://www.youtube.com/watch?v=9wM7Jgy4QL8
// Source: https://app.crackingthecryptic.com/sudoku/862N79FrfR

// Normal sudoku rules (default 9x9 with default 3x3 boxes; no repeats in a
// row, column, or box). Cages show their sums in the top-left cell (a killer
// cage: distinct digits, sum to the total). No given digits.

// Cage cells and totals, transcribed from the drawn `cages` array.
const cages = [
  [14, 'R2C2', 'R2C3', 'R2C4'],
  [21, 'R3C3', 'R3C4', 'R4C4'],
  [29, 'R2C6', 'R3C6', 'R4C6', 'R4C7', 'R4C8'],
  [20, 'R7C2', 'R7C3', 'R8C3'],
  [17, 'R4C1', 'R5C1', 'R6C1', 'R5C2', 'R5C3'],
  [22, 'R7C5', 'R8C5', 'R9C5', 'R9C4', 'R9C6'],
  [21, 'R6C6', 'R6C7', 'R7C7'],
  [18, 'R6C8', 'R7C8', 'R8C8'],
  [17, 'R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9'],
];

return [
  new Shape('9x9'),

  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
