// Title: Mensa Sudoku
// Author: Sumanta Mukherjee
// Video: https://www.youtube.com/watch?v=dDdd8iBQMQk
// Source: https://cracking-the-cryptic.web.app/sudoku/BLLGjtrb4P
//
// Normal sudoku rules apply. In cages, digits must sum to the small clue given
// in the top-left corner of the cage; digits cannot repeat in a cage. Clues
// outside the grid give the sum of cells along the indicated diagonal.
// Inequality signs in the grid point to the lower of the two cells involved.
//
// The grid is also shaded in three background colours, but the rules give
// colour no meaning and the video links an uncoloured version of the same
// puzzle, so the shading is decoration and is not encoded.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // Cages: sum + distinct.
  new Cage(27, 'R1C2', 'R1C3', 'R1C4', 'R2C3'),
  new Cage(14, 'R2C4', 'R2C5', 'R2C6', 'R1C5'),
  new Cage(25, 'R1C6', 'R1C7', 'R1C8', 'R2C7'),
  new Cage(26, 'R2C9', 'R3C9', 'R4C9', 'R3C8'),
  new Cage(20, 'R4C8', 'R5C8', 'R6C8', 'R5C9'),
  new Cage(18, 'R6C9', 'R7C9', 'R8C9', 'R7C8'),
  new Cage(25, 'R8C7', 'R9C6', 'R9C7', 'R9C8'),
  new Cage(12, 'R8C6', 'R8C5', 'R8C4', 'R9C5'),
  new Cage(25, 'R9C4', 'R9C3', 'R9C2', 'R8C3'),
  new Cage(25, 'R8C1', 'R7C1', 'R6C1', 'R7C2'),
  new Cage(12, 'R6C2', 'R5C2', 'R4C2', 'R5C1'),
  new Cage(25, 'R4C1', 'R3C1', 'R2C1', 'R3C2'),
  new Cage(23, 'R3C4', 'R3C5', 'R3C6', 'R4C5'),
  new Cage(24, 'R4C7', 'R5C7', 'R6C7', 'R5C6'),
  new Cage(27, 'R6C5', 'R7C4', 'R7C5', 'R7C6'),
  new Cage(27, 'R4C3', 'R5C3', 'R6C3', 'R5C4'),

  // Outside diagonal-sum clues: each arrow's off-grid ray commits to one
  // 3-cell corner diagonal (drawn direction), matched to its nearest text
  // overlay for the total.
  LittleKiller.fromCells(8, graph.ray('R1C3', 1, -1), geometry),
  LittleKiller.fromCells(8, graph.ray('R3C9', -1, -1), geometry),
  LittleKiller.fromCells(7, graph.ray('R9C7', -1, 1), geometry),
  LittleKiller.fromCells(9, graph.ray('R7C1', 1, 1), geometry),

  // Inequality signs: each is a 3-waypoint chevron with its flared base in
  // one cell and its point extended into the neighbour; the point marks the
  // lower cell.
  new GreaterThan('R3C4', 'R4C4'),
  new GreaterThan('R8C6', 'R8C5'),
];
