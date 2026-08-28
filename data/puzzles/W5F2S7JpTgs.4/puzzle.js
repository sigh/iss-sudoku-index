// Title: April 21, 2022: Nonconsec Trio
// Author: clover!
// Video: https://www.youtube.com/watch?v=W5F2S7JpTgs
// Source: https://tinyurl.com/muksw5dj

// Normal sudoku rules (default row/column/box all-different from Shape).
// Consecutive digits may never touch orthogonally -> AntiConsecutive.
// Every cell drawn with an orange circle holds 1, 2 or 3; every cell drawn
// with a blue square holds 4, 5 or 6 (per the rules sentence). By
// elimination the remaining, unmarked cells hold 7, 8 or 9: each digit
// appears 9 times over the grid, the circle and square cell counts are
// exactly 27 each (3 digits x 9), so the unmarked 27 cells are exactly
// where 7, 8 and 9 must fall.
// Circle/square cell lists transcribed from the puzzle's drawn circle and
// square overlays.

const circleCells = [
  'R1C2', 'R1C6', 'R1C9', 'R2C1', 'R2C4', 'R2C7', 'R3C3', 'R3C6', 'R3C9',
  'R4C1', 'R4C5', 'R4C8', 'R5C3', 'R5C5', 'R5C7', 'R6C2', 'R6C6', 'R6C9',
  'R7C3', 'R7C4', 'R7C7', 'R8C2', 'R8C5', 'R8C8', 'R9C1', 'R9C4', 'R9C8',
];

const squareCells = [
  'R1C3', 'R1C5', 'R1C7', 'R2C2', 'R2C5', 'R2C8', 'R3C2', 'R3C4', 'R3C7',
  'R4C3', 'R4C6', 'R4C9', 'R5C1', 'R5C4', 'R5C8', 'R6C3', 'R6C5', 'R6C8',
  'R7C1', 'R7C6', 'R7C9', 'R8C1', 'R8C4', 'R8C7', 'R9C2', 'R9C6', 'R9C9',
];

// The unmarked cells are derived, not transcribed: every grid cell that
// carries neither mark.
const markedCells = new Set([...circleCells, ...squareCells]);
const unmarkedCells = cellGraph('9x9').cells().filter(c => !markedCells.has(c));

return [
  new Shape('9x9'),

  // Givens.
  new Given('R2C2', 6),
  new Given('R4C6', 6),
  new Given('R5C5', 1),
  new Given('R6C4', 9),
  new Given('R8C8', 3),

  ...circleCells.map(c => new Given(c, 1, 2, 3)),
  ...squareCells.map(c => new Given(c, 4, 5, 6)),
  ...unmarkedCells.map(c => new Given(c, 7, 8, 9)),

  new AntiConsecutive(),
];
