// Title: Wickerwork
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=Fb1oDVYythc
// Source: https://sudokupad.app/20ag6yhrrg

// Rules: normal sudoku rules, standard 3x3 boxes.
// Killer cages: digits in a cage do not repeat and sum to the cage total.

// Givens as drawn.
const givens = [['R2C8', 4], ['R8C2', 4]];

// Cages transcribed from the drawn cage outlines and their corner totals.
const cages = [
  [6, 'R1C3', 'R1C4'],
  [6, 'R9C3', 'R9C4'],
  [11, 'R1C6', 'R1C7'],
  [14, 'R9C6', 'R9C7'],
  [5, 'R3C1', 'R4C1'],
  [7, 'R6C1', 'R7C1'],
  [7, 'R3C9', 'R4C9'],
  [5, 'R6C9', 'R7C9'],
  [15, 'R3C3', 'R3C4', 'R4C3', 'R4C4'],
  [10, 'R3C6', 'R3C7', 'R4C7'],
  [15, 'R6C6', 'R6C7', 'R7C6', 'R7C7'],
  [10, 'R6C3', 'R7C3', 'R7C4'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
