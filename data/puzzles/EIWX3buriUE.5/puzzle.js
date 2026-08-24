// Title: Odd/Even Killer Sudoku
// Author: Clover
// Video: https://www.youtube.com/watch?v=EIWX3buriUE
// Source: https://app.crackingthecryptic.com/sudoku/8BqPnNG2nf

// Normal sudoku rules apply (default 9x9 grid, rows/cols/boxes all-different).
// Cages cannot contain repeat digits, and show their sums: Cage(total, ...cells).
// Grey circles show odd digits, grey squares show even digits: there is no
// Odd/Even class, so each marked cell is a candidate-restricting Given over
// its parity. Circle (odd) versus square (even) is drawn art, not printed
// text.

const cages = [
  [22, 'R1C9', 'R2C9', 'R3C9'],
  [29, 'R3C7', 'R4C6', 'R4C7', 'R4C8', 'R5C7'],
  [16, 'R2C4', 'R3C3', 'R3C4'],
  [9, 'R4C1', 'R4C2', 'R5C1'],
  [21, 'R5C3', 'R6C2', 'R6C3', 'R6C4', 'R7C3'],
  [8, 'R7C1', 'R8C1', 'R9C1'],
  [14, 'R7C6', 'R7C7', 'R8C6'],
  [21, 'R5C9', 'R6C8', 'R6C9'],
];

const oddCells = ['R3C1', 'R3C6', 'R4C1', 'R4C4', 'R6C6', 'R6C9', 'R7C4', 'R7C9'];
const evenCells = [
  'R2C4', 'R2C9', 'R3C7', 'R4C6', 'R4C8', 'R5C3', 'R5C7', 'R6C2', 'R6C4',
  'R7C3', 'R8C1', 'R8C6',
];

return [
  new Shape('9x9'),
  new Given('R5C5', 5),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
  ...oddCells.map((cell) => new Given(cell, 1, 3, 5, 7, 9)),
  ...evenCells.map((cell) => new Given(cell, 2, 4, 6, 8)),
];
