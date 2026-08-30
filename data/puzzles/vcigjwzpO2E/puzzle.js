// Title: NYT Hard 22/10
// Author: Unknown
// Video: https://www.youtube.com/watch?v=vcigjwzpO2E
// Source: https://cracking-the-cryptic.web.app/sudoku/8gNbLdB3Dg

// Normal Sudoku rules apply (rows, columns and boxes; the payload's
// `regions` are the ordinary nine 3x3 boxes). The raw payload carries no
// rules text and no other geometry at all, so only the 25 givens are
// encoded here.
const givens = [
  new Given('R1C8', 1),
  new Given('R2C4', 6), new Given('R2C6', 4), new Given('R2C7', 2), new Given('R2C9', 8),
  new Given('R3C2', 9), new Given('R3C7', 7), new Given('R3C8', 4),
  new Given('R4C2', 6),
  new Given('R5C2', 8), new Given('R5C5', 5), new Given('R5C6', 1),
  new Given('R6C3', 5), new Given('R6C4', 2), new Given('R6C5', 6), new Given('R6C9', 7),
  new Given('R7C5', 4), new Given('R7C9', 1),
  new Given('R8C1', 9), new Given('R8C3', 8), new Given('R8C6', 5), new Given('R8C7', 3),
  new Given('R9C2', 2), new Given('R9C5', 7), new Given('R9C9', 9),
];

return [
  new Shape('9x9'),
  ...givens,
];
