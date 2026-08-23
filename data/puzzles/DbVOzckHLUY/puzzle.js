// Title: Pandemonium
// Author: Testarossa
// Video: https://www.youtube.com/watch?v=DbVOzckHLUY
// Source: https://app.crackingthecryptic.com/sudoku/2gmhjNF7PF

// Normal sudoku rules apply (default 9x9 with standard 3x3 boxes). Digits
// along an arrow sum to the digit in that arrow's attached circle; digits may
// repeat along an arrow. Clues outside the grid give the sum of the diagonal
// they indicate; digits may repeat along a diagonal.
//
// LittleKiller.fromCells derives the canonical on-grid id and direction from
// the actual diagonal cells, so the drawn corner (e.g. R1C4, which is not
// itself the canonical id for that diagonal) does not need to be known.

return [
  new Shape('9x9'),

  new Given('R4C8', 2),

  new Arrow('R1C2', 'R2C1', 'R3C1'),
  new Arrow('R2C3', 'R3C3', 'R4C3'),
  new Arrow('R5C2', 'R5C1', 'R6C1'),
  new Arrow('R7C3', 'R7C2', 'R6C3'),
  new Arrow('R9C2', 'R8C1', 'R7C1'),
  new Arrow('R9C6', 'R8C6', 'R7C6'),
  new Arrow('R6C4', 'R5C4', 'R4C5'),
  new Arrow('R1C5', 'R2C5', 'R3C6'),
  new Arrow('R3C7', 'R4C6'),
  new Arrow('R5C7', 'R6C6', 'R6C5'),
  new Arrow('R1C8', 'R2C9', 'R3C9'),
  new Arrow('R6C9', 'R6C8', 'R6C7'),
  new Arrow('R9C8', 'R8C9', 'R7C9'),

  // Top outside clue: diagonal running down-right from R1C4.
  LittleKiller.fromCells(30,
    cellGraph('9x9').ray('R1C4', 1, 1).map(String), cellGeometry('9x9')),
  // Left outside clue: diagonal running down-right from R4C1.
  LittleKiller.fromCells(30,
    cellGraph('9x9').ray('R4C1', 1, 1).map(String), cellGeometry('9x9')),
];
