// Title: Diabolical Sudoku Guide
// Author: Unknown
// Video: https://www.youtube.com/watch?v=aY1w_S1TOFs
// Source: https://cracking-the-cryptic.web.app/sudoku/gDpQ6gMrdb

// Normal Sudoku rules apply (rows, columns and boxes; the payload's
// `regions` are the ordinary nine 3x3 boxes). The raw payload carries no
// rules text at all and no geometry beyond the givens, so only the givens
// are encoded here.
const givens = [
  new Given('R1C2', 3), new Given('R1C4', 6), new Given('R1C9', 4),
  new Given('R2C6', 5), new Given('R2C7', 8),
  new Given('R3C1', 2), new Given('R3C3', 8), new Given('R3C5', 3), new Given('R3C8', 1),
  new Given('R4C6', 9), new Given('R4C7', 4),
  new Given('R5C2', 4), new Given('R5C4', 5), new Given('R5C9', 7),
  new Given('R6C6', 1), new Given('R6C7', 9),
  new Given('R7C1', 1), new Given('R7C3', 7), new Given('R7C5', 5), new Given('R7C8', 9),
  new Given('R8C6', 2), new Given('R8C7', 3),
  new Given('R9C2', 8), new Given('R9C4', 1), new Given('R9C9', 6),
];

return [
  new Shape('9x9'),
  ...givens,
];
