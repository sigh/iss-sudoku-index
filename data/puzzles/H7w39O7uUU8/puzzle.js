// Title: A Lucky Clover Leaf Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=H7w39O7uUU8
// Source: https://cracking-the-cryptic.web.app/sudoku/NdM8nq8m7M
//
// Normal sudoku rules apply. Every green cell must hold a digit from 1-7 (so
// never 8 or 9), and among the green cells the digit 7 appears at least five
// times.

// The 28 green (yellow-green underlay) cells, transcribed from the payload's
// underlay geometry.
const greenCells = [
  'R2C4', 'R2C5', 'R2C6',
  'R3C4', 'R3C6',
  'R4C2', 'R4C3', 'R4C4', 'R4C5', 'R4C6', 'R4C7', 'R4C8',
  'R5C2', 'R5C3', 'R5C4', 'R5C6', 'R5C8',
  'R6C2', 'R6C3', 'R6C4', 'R6C6', 'R6C7',
  'R7C5', 'R7C6',
  'R8C4', 'R8C5',
  'R9C3', 'R9C4',
];

return [
  new Shape('9x9'),

  new Given('R1C2', 4), new Given('R1C3', 2), new Given('R1C7', 1), new Given('R1C8', 7),
  new Given('R2C5', 2), new Given('R2C8', 6),
  new Given('R3C2', 1), new Given('R3C4', 5), new Given('R3C9', 8),
  new Given('R4C2', 6), new Given('R4C3', 1), new Given('R4C5', 4),
  new Given('R6C2', 2), new Given('R6C3', 5), new Given('R6C6', 3), new Given('R6C7', 6), new Given('R6C9', 1),
  new Given('R7C3', 8),
  new Given('R8C1', 1), new Given('R8C3', 4), new Given('R8C4', 3), new Given('R8C8', 2),
  new Given('R9C1', 2), new Given('R9C4', 4), new Given('R9C9', 5),

  // Green cells hold only 1-7 (never 8 or 9). Given intersects with any
  // digit given already on that cell, so this is safe to apply uniformly.
  ...greenCells.map(cell => new Given(cell, 1, 2, 3, 4, 5, 6, 7)),

  // At least five of the green cells contain a 7 (ContainAtLeast requires a
  // value at least as many times as it is repeated in the value list).
  new ContainAtLeast('7_7_7_7_7', ...greenCells),
];
