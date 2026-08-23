// Title: Boomerang
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=zR-ngVP0kVg
// Source: https://app.crackingthecryptic.com/sudoku/783gJP776Q

// Normal sudoku rules apply: standard 9x9 grid with default row, column, and
// 3x3 box constraints (all supplied by Shape('9x9')). No cages, lines, or
// other overlays are drawn; "Boomerang" names the logical solving technique
// the puzzle showcases, not an additional constraint.

return [
  new Shape('9x9'),
  new Given('R1C4', 1),
  new Given('R1C6', 2),
  new Given('R2C3', 8),
  new Given('R2C5', 6),
  new Given('R2C7', 7),
  new Given('R2C9', 5),
  new Given('R3C2', 9),
  new Given('R3C8', 8),
  new Given('R4C1', 4),
  new Given('R4C5', 1),
  new Given('R5C2', 8),
  new Given('R5C4', 3),
  new Given('R5C6', 4),
  new Given('R5C8', 6),
  new Given('R6C1', 3),
  new Given('R6C5', 2),
  new Given('R6C7', 8),
  new Given('R7C2', 6),
  new Given('R7C6', 5),
  new Given('R7C7', 4),
  new Given('R7C8', 7),
  new Given('R8C3', 5),
  new Given('R8C5', 7),
  new Given('R8C7', 6),
  new Given('R8C9', 9),
  new Given('R9C2', 7),
  new Given('R9C8', 5),
];
