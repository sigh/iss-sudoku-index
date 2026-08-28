// Title: Oct 20, 2021: Killer Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=bHhinEJrUxg
// Source: https://tinyurl.com/vtmf6tv3

// Normal sudoku rules apply (rows, columns and boxes all-different --
// standard for a plain 9x9 Shape). Digits in a cage cannot repeat and must
// sum to the cage's printed total: Cage(sum, ...cells) enforces both parts
// at once. No givens are drawn on the board.

// Cages (16), cells and totals from the payload's killercage entries.
const cages = [
  [3, 'R1C1', 'R1C2'],
  [4, 'R1C4', 'R2C4'],
  [3, 'R9C8', 'R9C9'],
  [6, 'R8C1', 'R9C1'],
  [4, 'R8C6', 'R9C6'],
  [6, 'R1C9', 'R2C9'],
  [7, 'R4C8', 'R4C9'],
  [7, 'R6C1', 'R6C2'],
  [11, 'R3C1', 'R4C1'],
  [5, 'R4C4', 'R4C5'],
  [6, 'R6C5', 'R6C6'],
  [11, 'R6C9', 'R7C9'],
  [12, 'R1C6', 'R1C7'],
  [12, 'R9C3', 'R9C4'],
  [14, 'R7C3', 'R7C4'],
  [10, 'R3C6', 'R3C7'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
