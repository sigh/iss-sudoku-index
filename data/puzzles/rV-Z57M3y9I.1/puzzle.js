// Title: Gobble Gobble
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=rV-Z57M3y9I
// Source: https://tinyurl.com/4km5x7zj
//
// Normal sudoku rules apply. Each outside clue gives the sum of the digits
// along the diagonal ray it points into; digits may repeat along a ray
// except where sudoku's own row/column/box rules forbid it.

const geometry = cellGeometry('9x9');

// Little-killer diagonal sums: (ray cells outer -> inner, sum). Cell lists
// and sums are taken verbatim from the payload's littlekillersum entries.
const littleKillers = [
  [['R1C3', 'R2C4', 'R3C5', 'R4C6', 'R5C7', 'R6C8', 'R7C9'], 9],
  [['R3C9', 'R4C8', 'R5C7', 'R6C6', 'R7C5', 'R8C4', 'R9C3'], 14],
  [['R9C7', 'R8C6', 'R7C5', 'R6C4', 'R5C3', 'R4C2', 'R3C1'], 19],
  [['R7C1', 'R6C2', 'R5C3', 'R4C4', 'R3C5', 'R2C6', 'R1C7'], 24],
  [['R1C4', 'R2C5', 'R3C6', 'R4C7', 'R5C8', 'R6C9'], 29],
  [['R4C9', 'R5C8', 'R6C7', 'R7C6', 'R8C5', 'R9C4'], 34],
  [['R9C6', 'R8C5', 'R7C4', 'R6C3', 'R5C2', 'R4C1'], 39],
];

return [
  new Shape('9x9'),

  new Given('R3C6', 6),
  new Given('R4C4', 4),
  new Given('R4C9', 8),
  new Given('R5C5', 6),
  new Given('R6C1', 8),
  new Given('R6C6', 2),
  new Given('R7C4', 8),

  ...littleKillers.map(([cells, sum]) =>
    LittleKiller.fromCells(sum, cells, geometry)),
];
