// Title: Nov 12, 2021: LK Killer
// Author: clover!
// Video: https://www.youtube.com/watch?v=urhFM_KWTg0
// Source: https://tinyurl.com/fftj5768

// Normal sudoku rules apply. Cages forbid repeats within the cage and sum to
// the printed value. Clues outside the grid give the sum of the digits along
// the diagonal they point into; digits may repeat on that diagonal unless
// another rule (a cage the diagonal happens to run through, or the normal
// row/column/box constraints) forbids it.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // Givens, from the payload's `grid` array.
  new Given('R1C2', 9),
  new Given('R1C8', 4),
  new Given('R2C1', 8),
  new Given('R2C9', 3),
  new Given('R4C5', 5),
  new Given('R6C2', 2),
  new Given('R6C8', 5),
  new Given('R8C1', 2),
  new Given('R8C9', 1),
  new Given('R9C2', 6),
  new Given('R9C8', 7),

  // Killer cages: cell lists and totals from the drawn `killercage` array.
  new Cage(36, 'R1C3', 'R1C4', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R4C1'),
  new Cage(34, 'R1C6', 'R1C7', 'R2C7', 'R2C8', 'R3C8', 'R3C9', 'R4C9'),
  new Cage(15, 'R2C4', 'R3C3', 'R3C4', 'R4C2', 'R4C3'),
  new Cage(35, 'R2C6', 'R3C6', 'R3C7', 'R4C7', 'R4C8'),
  new Cage(42, 'R6C1', 'R7C1', 'R7C2', 'R8C2', 'R8C3', 'R9C3', 'R9C4'),
  new Cage(39, 'R6C9', 'R7C8', 'R7C9', 'R8C7', 'R8C8', 'R9C6', 'R9C7'),

  // Outside diagonal-sum clues, from the drawn `littlekillersum` array,
  // which carries an explicit direction and cell list (no direction
  // inference needed).
  LittleKiller.fromCells(24, graph.ray('R1C7', 1, 1), geometry),
  LittleKiller.fromCells(6, graph.ray('R1C3', 1, -1), geometry),
  LittleKiller.fromCells(18, graph.ray('R6C1', 1, 1), geometry),
  LittleKiller.fromCells(30, graph.ray('R6C9', 1, -1), geometry),
];
