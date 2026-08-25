// Title: Three-Sum
// Author: Swaroop Guggilam
// Video: https://www.youtube.com/watch?v=tTGXIa2IUrg
// Source: https://app.crackingthecryptic.com/sudoku/JT4R8JDjBd

// Normal sudoku rules apply (default row/column/box all-different from Shape).
// Each Arrow's first cell is the circled bulb; the remaining cells are the
// arm, which must sum to the bulb's value.
return [
  new Shape('9x9'),

  new Given('R1C4', 5),
  new Given('R1C6', 4),
  new Given('R3C2', 7),
  new Given('R4C1', 1),
  new Given('R4C9', 6),
  new Given('R6C1', 4),
  new Given('R6C9', 1),
  new Given('R7C8', 5),
  new Given('R9C4', 3),
  new Given('R9C6', 8),

  // Arrows: bulb cell first, then the two arm cells.
  new Arrow('R1C1', 'R1C2', 'R1C3'),
  new Arrow('R1C9', 'R1C8', 'R1C7'),
  new Arrow('R2C4', 'R2C5', 'R2C6'),
  new Arrow('R3C5', 'R3C6', 'R3C7'),
  new Arrow('R4C8', 'R4C7', 'R4C6'),
  new Arrow('R4C4', 'R4C3', 'R4C2'),
  new Arrow('R6C2', 'R6C3', 'R6C4'),
  new Arrow('R6C6', 'R6C7', 'R6C8'),
  new Arrow('R7C3', 'R7C4', 'R7C5'),
  new Arrow('R8C6', 'R8C5', 'R8C4'),
  new Arrow('R9C1', 'R9C2', 'R9C3'),
  new Arrow('R9C9', 'R9C8', 'R9C7'),
];
