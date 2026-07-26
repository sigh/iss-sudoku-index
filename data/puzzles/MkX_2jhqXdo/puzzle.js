// Title: Limited Occupancy
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=MkX_2jhqXdo
// Source: https://sudokupad.app/v21z84ftei

// Normal sudoku rules apply (default row/column/box all-different, no givens).
// Killer cages: digits in a cage do not repeat and sum to the cage total.
// Renban lines: digits on a line do not repeat and form a consecutive set,
// in any order.

return [
  new Shape('9x9'),

  // Killer cages -- cells and totals as drawn.
  new Cage(8, 'R1C3', 'R1C4', 'R2C4'),
  new Cage(11, 'R1C6', 'R1C7', 'R2C6'),
  new Cage(20, 'R4C5', 'R5C5', 'R6C5'),
  new Cage(20, 'R6C7', 'R6C8', 'R7C8'),
  new Cage(10, 'R7C7', 'R8C6', 'R8C7', 'R9C6'),
  new Cage(12, 'R4C3', 'R5C2', 'R5C3'),

  // Renban lines -- cells as drawn (the same four lines are redrawn a second
  // time as a purely visual stroke layer, not four more clues). The 9-cell
  // line forces all nine digits onto it.
  new Renban('R8C3', 'R9C2', 'R9C1', 'R8C1'),
  new Renban('R9C3', 'R8C4', 'R8C5', 'R9C5'),
  new Renban('R5C7', 'R4C8'),
  new Renban('R2C2', 'R2C3', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R2C7', 'R3C7', 'R4C7'),
];
