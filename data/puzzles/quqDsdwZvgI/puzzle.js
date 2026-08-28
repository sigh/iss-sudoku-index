// Title: Arrow Sudoku
// Author: Tom Presto
// Video: https://www.youtube.com/watch?v=quqDsdwZvgI
// Source: https://cracking-the-cryptic.web.app/sudoku/PDF4Gr8HJD

// Normal sudoku rules apply (standard 3x3 box regions -- Shape('9x9')
// supplies rows/columns/boxes). Digits along an arrow sum to the digit in
// the arrow's circle -> one Arrow(bulb, ...arm) per arrow below. One bulb
// cell (R5C5) anchors two separate arrows; both instances are kept since
// Arrow has no UNIQUENESS_KEY_FIELD.
return [
  new Shape('9x9'),

  new Given('R1C1', 8),
  new Given('R1C9', 3),
  new Given('R2C2', 4),
  new Given('R3C4', 2),
  new Given('R4C1', 1),
  new Given('R4C8', 9),
  new Given('R4C9', 5),
  new Given('R5C6', 3),
  new Given('R6C2', 8),
  new Given('R6C8', 6),
  new Given('R8C2', 2),
  new Given('R8C3', 3),
  new Given('R8C4', 1),
  new Given('R9C4', 8),
  new Given('R9C8', 1),

  new Arrow('R1C1', 'R1C2', 'R2C1'),
  new Arrow('R1C9', 'R1C8', 'R2C9'),
  new Arrow('R9C9', 'R9C8', 'R8C9'),
  new Arrow('R9C1', 'R9C2', 'R8C1'),
  new Arrow('R4C4', 'R4C3', 'R3C4'),
  new Arrow('R4C6', 'R4C7', 'R3C6'),
  new Arrow('R6C6', 'R6C7', 'R7C6'),
  new Arrow('R6C4', 'R6C3', 'R7C4'),
  new Arrow('R5C5', 'R5C6', 'R4C5'),
  new Arrow('R5C5', 'R5C4', 'R6C5'),
];
