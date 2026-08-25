// Title: Equal Sum Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=nkSXluRoV0w
// Source: https://app.crackingthecryptic.com/974h2rBNf9

// Normal sudoku rules apply: standard 3x3 box regions, rows/columns/boxes
// all-different (Shape's default). "Every line in the grid sums to the same
// total": the 7 gray lines carry no printed total, so this is one EqualSum
// constraint over all 7 as segments -- it forces them to a common (otherwise
// unstated) sum without fixing what that sum is.

return [
  new Shape('9x9'),

  // Givens, from the puzzle's printed digits.
  new Given('R1C4', 3), new Given('R1C7', 7), new Given('R1C8', 9),
  new Given('R2C4', 5), new Given('R2C7', 3), new Given('R2C9', 2),
  new Given('R3C4', 2), new Given('R3C6', 7), new Given('R3C8', 1), new Given('R3C9', 4),
  new Given('R4C3', 4), new Given('R4C7', 8),
  new Given('R5C2', 1),
  new Given('R6C1', 9), new Given('R6C7', 6), new Given('R6C8', 2), new Given('R6C9', 5),
  new Given('R7C1', 2), new Given('R7C2', 7), new Given('R7C6', 3),
  new Given('R8C3', 3), new Given('R8C5', 2),
  new Given('R9C3', 6), new Given('R9C4', 4),

  // The 7 drawn gray lines, each a segment.
  new EqualSum(
    ['R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1'],
    ['R1C2', 'R2C2', 'R3C2', 'R4C2'],
    ['R1C3', 'R2C3', 'R3C3'],
    ['R7C7', 'R7C8', 'R7C9'],
    ['R8C6', 'R8C7', 'R8C8', 'R8C9'],
    ['R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
    ['R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1'],
  ),
];
