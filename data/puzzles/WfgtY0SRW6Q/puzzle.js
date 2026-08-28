// Title: Star Wars Day - Anti(Jedi)Knight Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=WfgtY0SRW6Q
// Source: https://cracking-the-cryptic.web.app/sudoku/dFrPBpjpbP

// Standard sudoku rules (default rows/columns/3x3 boxes; the payload's nine
// regions are the default box tiling, listed column-major). Global
// anti-knight: identical digits may not be a chess knight's move apart, per
// the video description (the payload carries no in-app rules text).

return [
  new Shape('9x9'),

  // Givens: R2-R8 values from the payload's cells array.
  new Given('R2C2', 5),
  new Given('R2C3', 3),
  new Given('R2C4', 2),
  new Given('R3C2', 9),
  new Given('R4C2', 6),
  new Given('R4C3', 7),
  new Given('R4C4', 4),
  new Given('R4C6', 8),
  new Given('R4C7', 9),
  new Given('R4C8', 5),
  new Given('R5C2', 1),
  new Given('R5C4', 7),
  new Given('R5C6', 9),
  new Given('R6C2', 8),
  new Given('R6C3', 9),
  new Given('R6C4', 6),
  new Given('R6C6', 5),
  new Given('R6C7', 7),
  new Given('R6C8', 4),
  new Given('R7C6', 7),
  new Given('R7C8', 9),
  new Given('R8C6', 2),
  new Given('R8C7', 8),
  new Given('R8C8', 6),

  new AntiKnight(),
];
