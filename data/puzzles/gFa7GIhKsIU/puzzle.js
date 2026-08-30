// Title: Diabolical Sudoku Masterclass: This IS Genius
// Author: Unknown
// Video: https://www.youtube.com/watch?v=gFa7GIhKsIU
// Source: https://cracking-the-cryptic.web.app/sudoku/3tR43Q7d9j

// Normal Sudoku rules apply (rows, columns and boxes; the payload's
// `regions` are the ordinary nine 3x3 boxes). The raw payload carries no
// rules text and no additional geometry -- no cages, lines, arrows, or
// overlays -- so only the givens are encoded here.
const givens = [
  new Given('R2C2', 4), new Given('R2C5', 6), new Given('R2C8', 2),
  new Given('R3C1', 7), new Given('R3C2', 6), new Given('R3C5', 4), new Given('R3C8', 9), new Given('R3C9', 5),
  new Given('R4C4', 5), new Given('R4C6', 3),
  new Given('R5C1', 2), new Given('R5C2', 1), new Given('R5C8', 4), new Given('R5C9', 8),
  new Given('R6C4', 4), new Given('R6C6', 8),
  new Given('R7C1', 4), new Given('R7C2', 2), new Given('R7C5', 7), new Given('R7C8', 1), new Given('R7C9', 9),
  new Given('R8C2', 9), new Given('R8C5', 3), new Given('R8C8', 7),
];

return [
  new Shape('9x9'),
  ...givens,
];
