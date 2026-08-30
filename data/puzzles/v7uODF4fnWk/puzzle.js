// Title: This Puzzle Will Self-Destruct In 5 Minutes
// Author: David McNeill
// Video: https://www.youtube.com/watch?v=v7uODF4fnWk
// Source: https://cracking-the-cryptic.web.app/sudoku/BDnqQjb3GN

// Rules encoded here:
//   - Normal sudoku: each row, column and 3x3 box contains 1-9 once each.
//   - Killer cages: the digits in a dashed cage sum to its small clue and do
//     not repeat within the cage.
// There are no given digits.
//
// Not encoded: the 24 light-grey shaded cells. The shading marks exactly the
// set of cells that lie in no cage (its complement is the union of the 14
// cages, cell for cell), and no accompanying text assigns it any further
// meaning, so it is read as decoration.

// Cage totals and cell lists transcribed from the 14 dashed cages drawn on the
// board, in the order they are drawn (a spiral running inwards from R1C1).
const cages = [
  [20, 'R1C1', 'R1C2', 'R2C1', 'R2C2'],
  [7, 'R1C3', 'R1C4'],
  [28, 'R1C5', 'R1C6', 'R2C5', 'R2C6', 'R2C7'],
  [26, 'R1C7', 'R1C8', 'R1C9', 'R2C8', 'R2C9'],
  [17, 'R3C5', 'R3C6', 'R3C7', 'R4C6'],
  [23, 'R4C5', 'R5C4', 'R5C5', 'R5C6', 'R6C5'],
  [12, 'R6C6', 'R6C7', 'R7C6', 'R7C7'],
  [30, 'R6C8', 'R6C9', 'R7C8', 'R7C9'],
  [21, 'R8C6', 'R8C7', 'R9C6', 'R9C7'],
  [13, 'R8C8', 'R8C9', 'R9C8', 'R9C9'],
  [29, 'R7C1', 'R8C1', 'R8C2', 'R9C1', 'R9C2'],
  [28, 'R5C3', 'R6C3', 'R6C4', 'R7C3'],
  [24, 'R5C1', 'R5C2', 'R6C1', 'R6C2', 'R7C2'],
  [7, 'R3C1', 'R4C1'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
