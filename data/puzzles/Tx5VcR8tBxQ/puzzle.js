// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=Tx5VcR8tBxQ
// Source: https://cracking-the-cryptic.web.app/sudoku/nGHfbN3TQN

// Normal sudoku rules apply on the 9x9 grid (default rows/columns/boxes,
// matching the payload's 9 whole-box regions). No rules text, lines, cages,
// arrows or overlays are present in the payload -- the puzzle is fully
// determined by its 22 givens below.

return [
  new Shape('9x9'),
  new Given('R1C4', 2),
  new Given('R1C7', 1),
  new Given('R2C2', 3),
  new Given('R2C5', 4),
  new Given('R2C8', 5),
  new Given('R3C3', 6),
  new Given('R3C6', 8),
  new Given('R4C1', 5),
  new Given('R4C4', 7),
  new Given('R4C7', 2),
  new Given('R5C2', 4),
  new Given('R5C5', 1),
  new Given('R5C9', 8),
  new Given('R6C6', 9),
  new Given('R6C8', 6),
  new Given('R7C2', 1),
  new Given('R7C7', 3),
  new Given('R8C1', 7),
  new Given('R8C8', 4),
  new Given('R9C3', 2),
  new Given('R9C4', 6),
  new Given('R9C9', 9),
];
