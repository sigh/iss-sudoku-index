// Title: Converging Arrow Sudoku
// Author: Phoenix0589
// Video: https://www.youtube.com/watch?v=qGEoIDe6-HI
// Source: https://cracking-the-cryptic.web.app/sudoku/GR386pNFjB

// Normal sudoku rules apply. Digits along an arrow sum to the value in its
// circle. The two-cell circle at R9C8-R9C9 holds a 2-digit number, read
// left to right, equal to the sum of its arm.
// Where three arrows converge onto a shared tail (their arms share their
// final two cells), the three circles feeding that convergence form a set
// of consecutive numbers, not necessarily in order: encoded as Renban
// across just those three circle cells. Renban's pairwise consecutive/
// non-repeating check does not require the cells to be mutually
// grid-adjacent, so it faithfully expresses "a set of consecutive numbers"
// without implying any drawn line between them.

return [
  new Shape('9x9'),

  new Given('R2C1', 5),

  // Solo arrows (no convergence).
  new Arrow('R1C1', 'R1C2', 'R2C2', 'R3C2'),
  new Arrow('R4C2', 'R3C3'),
  new Arrow('R4C3', 'R3C4'),
  new Arrow('R6C7', 'R7C6', 'R8C5'),
  new Arrow('R7C7', 'R8C8', 'R8C9', 'R7C9'),
  new Arrow('R4C6', 'R3C7'),

  // Two-digit pill arrow: pill cells first in reading order, then arm.
  new PillArrow(2, 'R9C8', 'R9C9', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2', 'R9C1'),

  // Convergence group 1: three arrows share tail cells R6C3-R6C4.
  new Arrow('R5C1', 'R5C2', 'R6C3', 'R6C4'),
  new Arrow('R6C1', 'R6C2', 'R6C3', 'R6C4'),
  new Arrow('R7C1', 'R7C2', 'R6C3', 'R6C4'),
  new Renban('R5C1', 'R6C1', 'R7C1'),

  // Convergence group 2: three arrows share tail cells R5C7-R5C6.
  new Arrow('R4C9', 'R4C8', 'R5C7', 'R5C6'),
  new Arrow('R6C9', 'R6C8', 'R5C7', 'R5C6'),
  new Arrow('R5C9', 'R5C8', 'R5C7', 'R5C6'),
  new Renban('R4C9', 'R6C9', 'R5C9'),

  // Convergence group 3: three arrows share tail cells R3C5-R4C5.
  new Arrow('R1C4', 'R2C4', 'R3C5', 'R4C5'),
  new Arrow('R1C6', 'R2C6', 'R3C5', 'R4C5'),
  new Arrow('R1C5', 'R2C5', 'R3C5', 'R4C5'),
  new Renban('R1C4', 'R1C6', 'R1C5'),
];
