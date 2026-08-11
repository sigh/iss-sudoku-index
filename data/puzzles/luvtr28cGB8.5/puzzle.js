// Title: June 12, 2022: Mathrax
// Author: clover!
// Video: https://www.youtube.com/watch?v=luvtr28cGB8
// Source: https://tinyurl.com/2s4hsfze

// Normal sudoku rules apply. Each "+" sign is centred on the intersection of
// four cells (a 2x2 block); the two pairs of cells diagonally opposite each
// other across that intersection must have equal sums. Below, each block's
// cells are found by row/column position (min/max row, min/max col from the
// drawn cell list), independent of the source array's listing order:
// TL=(minRow,minCol), TR=(minRow,maxCol), BL=(maxRow,minCol), BR=(maxRow,maxCol).
// The diagonal pairs are TL/BR and TR/BL. EqualSum enforces equal segment
// totals without requiring the four cells to be mutually distinct, matching
// the rule as stated (only the worked example's 1/7 and 3/5 happen to be
// distinct).

return [
  new Shape('9x9'),

  // Givens.
  new Given('R1C7', 9),
  new Given('R1C9', 1),
  new Given('R2C2', 6),
  new Given('R2C8', 8),
  new Given('R3C3', 1),
  new Given('R3C9', 5),
  new Given('R4C4', 3),
  new Given('R4C6', 6),
  new Given('R6C4', 1),
  new Given('R6C6', 9),
  new Given('R7C1', 1),
  new Given('R7C7', 7),
  new Given('R8C2', 8),
  new Given('R8C8', 6),
  new Given('R9C1', 3),
  new Given('R9C3', 9),

  // "+" markers (drawn cells -> block):
  //   1. R2C2,R2C3,R3C2,R3C3
  new EqualSum(['R2C2', 'R3C3'], ['R2C3', 'R3C2']),
  //   2. R7C7,R7C8,R8C7,R8C8
  new EqualSum(['R7C7', 'R8C8'], ['R7C8', 'R8C7']),
  //   3. R4C3,R4C4,R3C3,R3C4
  new EqualSum(['R3C3', 'R4C4'], ['R3C4', 'R4C3']),
  //   4. R6C7,R6C6,R7C7,R7C6
  new EqualSum(['R6C6', 'R7C7'], ['R6C7', 'R7C6']),
  //   5. R1C9,R1C8,R2C9,R2C8
  new EqualSum(['R1C8', 'R2C9'], ['R1C9', 'R2C8']),
  //   6. R9C1,R9C2,R8C1,R8C2
  new EqualSum(['R8C1', 'R9C2'], ['R8C2', 'R9C1']),
  //   7. R4C7,R4C6,R3C7,R3C6
  new EqualSum(['R3C6', 'R4C7'], ['R3C7', 'R4C6']),
  //   8. R6C4,R6C3,R7C4,R7C3
  new EqualSum(['R6C3', 'R7C4'], ['R6C4', 'R7C3']),
];
