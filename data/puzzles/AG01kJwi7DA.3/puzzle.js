// Title: 4/5/22: Windoku of Opportunity
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=AG01kJwi7DA
// Source: https://tinyurl.com/2jx4mccy

// Normal sudoku rules apply. Additionally, each marked "window" region must
// contain each of the digits 1-9 without repeats. The four drawn windows sit
// at R2-4/C2-4, R2-4/C6-8, R6-8/C2-4, R6-8/C6-8 -- exactly the cell sets the
// built-in Windoku constraint computes for a 9x9 grid, so it is used directly
// rather than re-declared as four AllDifferent groups.

return [
  new Shape('9x9'),

  // Givens, transcribed from the puzzle's printed clues.
  new Given('R1C1', 9),
  new Given('R2C3', 2), new Given('R2C4', 3),
  new Given('R2C7', 6), new Given('R2C8', 5),
  new Given('R3C2', 4), new Given('R3C4', 6),
  new Given('R3C7', 7), new Given('R3C8', 8),
  new Given('R4C2', 7), new Given('R4C3', 8), new Given('R4C4', 9),
  new Given('R6C6', 1), new Given('R6C7', 2), new Given('R6C8', 3),
  new Given('R7C2', 2), new Given('R7C3', 1),
  new Given('R7C6', 4), new Given('R7C8', 6),
  new Given('R8C2', 3), new Given('R8C3', 4),
  new Given('R8C6', 7), new Given('R8C7', 8),

  new Windoku(),
];
