// Title: Crooked Kropki
// Author: Charlie Pugh
// Video: https://www.youtube.com/watch?v=ToC39GUmg5g
// Source: https://app.crackingthecryptic.com/sudoku/PHtnGmT7QF

// 1-9 once each in every row, column and marked (jigsaw) region -- no
// standard 3x3 boxes. Cells joined by a white dot hold consecutive digits;
// cells joined by a black dot are in a 1:2 ratio. The rules state "not all
// dots are given", so absence of a dot carries no information: only the
// drawn dots are encoded (no StrictKropki-style negative).

return [
  new Shape('9x9'),
  new NoBoxes(),

  // Jigsaw regions, transcribed from the payload's `regions` array
  // (nine 9-cell partitions of the grid).
  new Jigsaw('9x9', 'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R2C2', 'R2C3', 'R3C3', 'R3C4', 'R4C4'),
  new Jigsaw('9x9', 'R2C1', 'R3C1', 'R3C2', 'R4C1', 'R4C2', 'R4C3', 'R5C1', 'R5C2', 'R6C1'),
  new Jigsaw('9x9', 'R6C2', 'R7C1', 'R7C2', 'R7C3', 'R8C1', 'R8C2', 'R9C1', 'R9C2', 'R9C3'),
  new Jigsaw('9x9', 'R1C5', 'R2C4', 'R2C5', 'R2C6', 'R3C5', 'R4C5', 'R5C4', 'R5C5', 'R5C6'),
  new Jigsaw('9x9', 'R5C3', 'R5C7', 'R6C3', 'R6C4', 'R6C5', 'R6C6', 'R6C7', 'R7C4', 'R7C6'),
  new Jigsaw('9x9', 'R7C5', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R9C4', 'R9C5', 'R9C6'),
  new Jigsaw('9x9', 'R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C7', 'R2C8', 'R3C6', 'R3C7', 'R4C6'),
  new Jigsaw('9x9', 'R2C9', 'R3C8', 'R3C9', 'R4C7', 'R4C8', 'R4C9', 'R5C8', 'R5C9', 'R6C9'),
  new Jigsaw('9x9', 'R6C8', 'R7C7', 'R7C8', 'R7C9', 'R8C8', 'R8C9', 'R9C7', 'R9C8', 'R9C9'),

  // Givens
  new Given('R1C4', 4),
  new Given('R1C6', 6),
  new Given('R7C5', 2),
  new Given('R8C3', 6),
  new Given('R8C7', 8),
  new Given('R9C5', 1),

  // White dots (consecutive), from overlays with white fill.
  new WhiteDot('R1C1', 'R1C2'),
  new WhiteDot('R2C2', 'R2C3'),
  new WhiteDot('R3C3', 'R3C4'),
  new WhiteDot('R3C4', 'R4C4'),
  new WhiteDot('R3C5', 'R4C5'),
  new WhiteDot('R3C6', 'R4C6'),
  new WhiteDot('R3C6', 'R3C7'),
  new WhiteDot('R2C7', 'R2C8'),
  new WhiteDot('R1C8', 'R1C9'),
  new WhiteDot('R4C7', 'R4C8'),
  new WhiteDot('R5C7', 'R6C7'),
  new WhiteDot('R6C6', 'R7C6'),
  new WhiteDot('R7C7', 'R7C8'),
  new WhiteDot('R5C3', 'R6C3'),

  // Black dots (1:2 ratio), from overlays with black fill.
  new BlackDot('R6C1', 'R6C2'),
  new BlackDot('R6C8', 'R6C9'),
];
