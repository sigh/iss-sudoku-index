// Title: Save the Date
// Author: Thunderkey
// Video: https://www.youtube.com/watch?v=pFscdkE58nQ
// Source: https://app.crackingthecryptic.com/T3bdb6nJ83

// Normal Sudoku rules apply. The four yellow-green underlays have no stated
// rule meaning, so only the given digits are encoded.
const givens = [
  new Given('R1C1', 1), new Given('R1C7', 3), new Given('R1C8', 7),
  new Given('R2C2', 2), new Given('R2C3', 9), new Given('R2C5', 5),
  new Given('R2C7', 6), new Given('R2C8', 8), new Given('R2C9', 4),
  new Given('R3C3', 3), new Given('R3C4', 7), new Given('R3C5', 4),
  new Given('R3C7', 9), new Given('R4C2', 7), new Given('R4C3', 2),
  new Given('R4C5', 1), new Given('R4C7', 4), new Given('R4C8', 9),
  new Given('R6C1', 6), new Given('R6C6', 8), new Given('R7C1', 4),
  new Given('R7C3', 6), new Given('R7C5', 8), new Given('R7C7', 7),
  new Given('R7C9', 3), new Given('R8C2', 5), new Given('R8C4', 3),
  new Given('R8C6', 7), new Given('R9C1', 9), new Given('R9C5', 2),
  new Given('R9C6', 1), new Given('R9C9', 5),
];

return [
  new Shape('9x9'),
  ...givens,
];
