// Title: The Devil's Whirlpool
// Author: Marvin Kannhauser
// Video: https://www.youtube.com/watch?v=41jt639Z4Uk
// Source: https://app.crackingthecryptic.com/sudoku/9TMjF3FbRH

// Normal sudoku rules apply (default row/column/box regions match the 9
// drawn regions, so no explicit Regions constraint is needed).
// Cages: digits sum to the small clue in the cage's top-left corner.
// Arrows: digits along the arrow sum to the digit in the arrow's circle
// (the circle is the arrow's own first/bulb cell).
// Large circles (no arrow): the printed digit must appear in one of the
// four cells the circle straddles.
// White dots: the two cells it sits between hold consecutive digits.

return [
  new Shape('9x9'),

  // Cages (top-left corner clue = sum), each a 2x2 block.
  new Cage(22, 'R1C1', 'R1C2', 'R2C1', 'R2C2'),
  new Cage(27, 'R8C8', 'R8C9', 'R9C8', 'R9C9'),

  // Arrows: bulb (circle) cell first, then the arm cells it sums.
  new Arrow('R3C3', 'R3C4', 'R3C5', 'R3C6'),
  new Arrow('R3C7', 'R4C7', 'R5C7'),
  new Arrow('R7C7', 'R7C6', 'R7C5', 'R7C4'),
  new Arrow('R7C3', 'R6C3', 'R5C3'),

  // Large circles: single value that must appear somewhere in the 2x2
  // square the circle straddles (Quad with one value expresses "must be
  // present", not "all values present" -- a single value is exactly this
  // rule's "the indicated digit must appear in one of the surrounding
  // cells").
  new Quad('R1C8', 9),
  new Quad('R8C1', 8),

  // White dots: consecutive digits between the two named cells.
  new WhiteDot('R1C3', 'R2C3'),
  new WhiteDot('R1C4', 'R2C4'),
  new WhiteDot('R2C5', 'R3C5'),
  new WhiteDot('R1C7', 'R1C8'),
  new WhiteDot('R2C9', 'R3C9'),
  new WhiteDot('R4C1', 'R5C1'),
  new WhiteDot('R5C1', 'R6C1'),
  new WhiteDot('R4C1', 'R4C2'),
  new WhiteDot('R5C3', 'R5C4'),
  new WhiteDot('R5C4', 'R6C4'),
  new WhiteDot('R6C4', 'R6C5'),
  new WhiteDot('R6C5', 'R7C5'),
  new WhiteDot('R9C4', 'R9C5'),
  new WhiteDot('R9C5', 'R9C6'),
  new WhiteDot('R8C6', 'R9C6'),
  new WhiteDot('R7C8', 'R7C9'),
  new WhiteDot('R6C9', 'R7C9'),
  new WhiteDot('R6C8', 'R6C9'),
];
