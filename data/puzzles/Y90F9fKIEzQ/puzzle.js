// Title: A Sudoku For A Beautiful Mind
// Author: Unknown
// Video: https://www.youtube.com/watch?v=Y90F9fKIEzQ
// Source: https://cracking-the-cryptic.web.app/sudoku/PQ7L6gGrP7

// Normal sudoku rules apply (nine ordinary 3x3 boxes). The outside corner
// arrow is a Little Killer clue: the digits along the diagonal it points
// into sum to the printed total, and may repeat (50 exceeds the maximum
// possible sum of nine distinct digits, so this diagonal is not an
// all-different Sudoku diagonal). Two drawn grey lines are not encoded;
// their rule is not stated anywhere in the available evidence.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // Givens.
  new Given('R1C6', 2), new Given('R1C7', 1), new Given('R1C8', 7), new Given('R1C9', 5),
  new Given('R2C6', 1), new Given('R2C7', 3), new Given('R2C8', 2), new Given('R2C9', 8),
  new Given('R4C5', 1),
  new Given('R5C5', 2),
  new Given('R6C5', 3),
  new Given('R8C1', 7), new Given('R8C2', 9), new Given('R8C3', 2), new Given('R8C4', 5),
  new Given('R9C1', 6), new Given('R9C2', 3), new Given('R9C3', 4), new Given('R9C4', 1),

  // Outside corner arrow + "50" overlay: Little Killer diagonal sum, from
  // R1C1 down-right to R9C9 (the arrow's shaft enters the grid at R1C1's
  // corner and its ray is the whole main diagonal).
  LittleKiller.fromCells(50, graph.ray('R1C1', 1, 1), geometry),
];
