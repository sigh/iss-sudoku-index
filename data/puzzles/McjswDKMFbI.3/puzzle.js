// Title: September 7, 2021: Windoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=McjswDKMFbI
// Source: https://tinyurl.com/jr9a3hmw

// Normal sudoku rules apply. Additionally, each shaded region must contain
// each of the digits 1-9 without repeats. The four drawn regions sit at
// R2-4/C2-4, R2-4/C6-8, R6-8/C2-4, R6-8/C6-8 -- exactly the cell sets the
// built-in Windoku constraint computes for a 9x9 grid, so it is used
// directly rather than re-declared as four AllDifferent groups.

return [
  new Shape('9x9'),

  // Givens, transcribed from the puzzle's printed clues.
  new Given('R1C1', 2), new Given('R1C3', 3), new Given('R1C7', 8),
  new Given('R2C4', 5), new Given('R2C6', 7),
  new Given('R3C1', 1), new Given('R3C9', 9),
  new Given('R4C2', 4), new Given('R4C6', 2), new Given('R4C8', 6),
  new Given('R6C2', 6), new Given('R6C4', 1), new Given('R6C6', 4), new Given('R6C8', 3),
  new Given('R7C1', 7), new Given('R7C9', 1),
  new Given('R8C4', 8), new Given('R8C6', 1),
  new Given('R9C3', 8), new Given('R9C7', 4), new Given('R9C9', 5),

  new Windoku(),
];
