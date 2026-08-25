// Title: Killer Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=U0oaw0eRVTE
// Source: https://sudokupad.app/BqLb9nf9q2

// Normal sudoku rules (default rows/cols/boxes). No givens. 23 killer cages
// (distinct + sum), transcribed from the drawn `cages` array.
//
// The 23 cages tile the grid exactly once each (81 cells total, no overlap,
// no gaps), so the payload's totals must sum to 405 (nine rows x (1+...+9))
// for any valid completion. The payload's printed total for the 5-cell
// R7C7/R7C8/R7C9/R8C9/R8C8 cage is 220, which cannot hold for any valid grid
// (five distinct digits sum to at most 35): only its no-repeat requirement is
// encoded below, and its total is not enforced. See blocker #1444.
const cages = [
  [21, 'R1C1', 'R1C2', 'R1C3', 'R2C3'],
  [24, 'R2C1', 'R3C1', 'R3C2', 'R2C2', 'R3C3'],
  [10, 'R1C4', 'R2C4', 'R2C5', 'R1C5'],
  [8, 'R1C6', 'R1C7'],
  [20, 'R1C8', 'R2C8', 'R1C9'],
  [15, 'R2C9', 'R3C9'],
  [10, 'R2C6', 'R2C7', 'R3C7'],
  [30, 'R3C8', 'R4C8', 'R5C8', 'R6C8', 'R6C9', 'R5C9', 'R4C9'],
  [18, 'R3C6', 'R4C6', 'R4C7'],
  [17, 'R3C4', 'R3C5'],
  [12, 'R4C3', 'R4C4', 'R4C5'],
  [38, 'R4C1', 'R5C1', 'R6C1', 'R4C2', 'R5C2', 'R6C2', 'R7C2'],
  [29, 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7'],
  [12, 'R6C3', 'R6C4', 'R7C4'],
  [12, 'R6C5', 'R6C6', 'R6C7'],
  [11, 'R7C1', 'R8C1'],
  [11, 'R9C1', 'R9C2', 'R8C2'],
  [18, 'R7C3', 'R8C3', 'R8C4'],
  [17, 'R9C3', 'R9C4'],
  [16, 'R7C5', 'R7C6'],
  [11, 'R8C5', 'R8C6', 'R9C6', 'R9C5'],
  ['', 'R7C7', 'R7C8', 'R7C9', 'R8C9', 'R8C8'],
  [23, 'R8C7', 'R9C7', 'R9C8', 'R9C9'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
