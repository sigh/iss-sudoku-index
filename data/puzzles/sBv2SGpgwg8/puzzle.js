// Title: Daily Killer Sudoku 18471
// Author: dailykillersudoku.com
// Video: https://www.youtube.com/watch?v=sBv2SGpgwg8
// Source: https://www.dailykillersudoku.com/puzzle/18471

// Rules: normal Sudoku, plus killer cages: digits may not repeat in a cage,
// and a cage with a printed total sums to it. All 23 cages carry a total and
// they partition the grid. No givens; no other clues.

// Cage table transcribed from the source page's cage map and printed totals,
// in the source's cage order: [total, ...cells].
const cages = [
  [13, 'R1C1', 'R1C2', 'R2C1'],
  [27, 'R1C3', 'R1C4', 'R1C5', 'R2C5'],
  [6, 'R1C7', 'R1C8'],
  [19, 'R2C2', 'R2C3', 'R2C4', 'R3C2', 'R4C2'],
  [14, 'R1C6', 'R2C6'],
  [17, 'R2C7', 'R2C8'],
  [31, 'R1C9', 'R2C9', 'R3C9', 'R4C8', 'R4C9', 'R5C9'],
  [19, 'R3C3', 'R3C4', 'R3C5', 'R4C3', 'R5C3'],
  [16, 'R3C7', 'R3C8', 'R4C7'],
  [22, 'R3C1', 'R4C1', 'R5C1', 'R5C2'],
  [32, 'R3C6', 'R4C4', 'R4C5', 'R4C6', 'R5C4', 'R6C3', 'R6C4'],
  [31, 'R5C5', 'R5C6', 'R5C7', 'R6C5', 'R7C5'],
  [12, 'R5C8', 'R6C8'],
  [8, 'R6C1', 'R6C2'],
  [9, 'R6C9', 'R7C9'],
  [7, 'R7C1', 'R8C1'],
  [9, 'R7C2', 'R8C2'],
  [14, 'R7C3', 'R7C4', 'R8C3'],
  [10, 'R8C5', 'R8C6'],
  [30, 'R6C6', 'R6C7', 'R7C6', 'R7C7', 'R7C8', 'R8C7'],
  [35, 'R8C4', 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5'],
  [7, 'R9C6', 'R9C7'],
  [17, 'R8C8', 'R8C9', 'R9C8', 'R9C9'],
];

return [
  new Shape('9x9'),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
];
