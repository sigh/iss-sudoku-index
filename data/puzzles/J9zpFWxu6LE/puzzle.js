// Title: Anti-Diagonal Sudoku
// Author: Silke Berendes
// Video: https://www.youtube.com/watch?v=J9zpFWxu6LE
// Source: https://cracking-the-cryptic.web.app/sudoku/RBh8T4LRT2

// Standard Sudoku (rows, columns, 3x3 boxes). The payload also draws two
// grey lines corner-to-corner (R1C1-R9C9 and R1C9-R9C1) with no rules text
// anywhere stating what they mean, so no diagonal rule is encoded for them.
return [
  new Shape('9x9'),

  new Given('R1C3', 9), new Given('R1C5', 3), new Given('R1C7', 1),
  new Given('R2C1', 5), new Given('R2C9', 9),
  new Given('R3C1', 1), new Given('R3C5', 2), new Given('R3C9', 5),
  new Given('R4C2', 7), new Given('R4C8', 5),
  new Given('R5C3', 3), new Given('R5C7', 7),
  new Given('R6C2', 4), new Given('R6C8', 1),
  new Given('R7C1', 7), new Given('R7C5', 8), new Given('R7C9', 3),
  new Given('R8C1', 2), new Given('R8C9', 1),
  new Given('R9C3', 1), new Given('R9C5', 6), new Given('R9C7', 5),
];
