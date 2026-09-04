// Title: Killer Sudoku
// Author: Serkan Yurekli
// Video: https://www.youtube.com/watch?v=ZdbtPLI5q4I
// Source: https://gmpuzzles.com/s/170819KSSY

// Rules (from the Grandmaster Puzzles posting): standard Sudoku rules; the
// sum of the numbers in each cage must equal the value given in the
// upper-left corner of that cage; numbers cannot repeat inside a cage.
// The bold borders drawn in the source are the standard 3x3 boxes, which the
// plain 9x9 Shape already carries. No digits are given, and cells outside
// every cage carry no clue.

// The 15 dashed cages and their corner totals, from the drawn cage layer and
// its small corner numbers. Each entry is [total, ...cells], with the cell
// that carries the printed total listed first.
const cages = [
  [22, 'R1C1', 'R2C1', 'R3C1'],
  [7, 'R1C2', 'R1C3'],
  [8, 'R1C5', 'R2C5'],
  [6, 'R1C8', 'R2C8', 'R2C9'],
  [33, 'R2C4', 'R3C2', 'R3C4', 'R4C2', 'R4C3', 'R4C4'],
  [20, 'R2C7', 'R3C6', 'R3C7', 'R3C8', 'R4C7'],
  [41, 'R3C5', 'R4C5', 'R5C4', 'R5C5', 'R5C6', 'R6C5', 'R7C5'],
  [15, 'R5C1', 'R5C2'],
  [9, 'R5C8', 'R5C9'],
  [33, 'R6C3', 'R7C2', 'R7C3', 'R7C4', 'R8C3'],
  [35, 'R6C6', 'R6C7', 'R6C8', 'R7C6', 'R7C8', 'R8C6'],
  [7, 'R7C9', 'R8C9', 'R9C9'],
  [21, 'R8C1', 'R8C2', 'R9C2'],
  [11, 'R8C5', 'R9C5'],
  [13, 'R9C7', 'R9C8'],
];

return [
  new Shape('9x9'),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
];
