// Title: #sudoku
// Author: Matyas Martinka
// Video: https://www.youtube.com/watch?v=1_5IBJ2MUzo
// Source: https://app.crackingthecryptic.com/sudoku/N8nqb36Hr9

// Normal sudoku rules apply (default 9x9 grid, rows/columns/boxes). In cages,
// digits must sum to the small clue in the top left corner of the cage
// (Cage enforces both the sum and the standard cage no-repeat convention).
// Digits along an arrow must sum to the digit in that arrow's circle
// (Arrow's first cell is the circle).
//
// The gold "#"-shaped shading (rows 3 & 6, columns 3 & 6) and the five white
// circles at the arrow bulbs are decoration only -- the rules text states no
// constraint tied to them, so they are not encoded.

return [
  new Shape('9x9'),

  // Cages: coordinates transcribed from the drawn cage outlines.
  new Cage(12, 'R1C1', 'R2C2', 'R1C2', 'R2C1'),
  new Cage(14, 'R1C4', 'R1C5', 'R2C5', 'R2C4'),
  new Cage(14, 'R4C1', 'R5C1', 'R5C2', 'R4C2'),
  new Cage(25, 'R7C1', 'R8C1', 'R8C2', 'R7C2'),
  new Cage(17, 'R8C5', 'R9C5', 'R9C6'),
  new Cage(29, 'R8C8', 'R9C8', 'R9C9', 'R8C9'),
  new Cage(17, 'R5C8', 'R5C9', 'R6C9'),
  new Cage(24, 'R1C7', 'R2C7', 'R2C8', 'R1C8'),

  // Arrows: bulb cell first, transcribed from the drawn arrow paths (off-centre
  // waypoints snapped to nearest cell centre). Three arrows share the R3C3
  // bulb and three share the R6C6 bulb.
  new Arrow('R3C3', 'R2C2', 'R2C1'),
  new Arrow('R3C3', 'R3C2', 'R4C1'),
  new Arrow('R3C6', 'R3C7', 'R3C8', 'R3C9'),
  new Arrow('R6C6', 'R6C7', 'R6C8', 'R6C9'),
  new Arrow('R6C6', 'R5C5', 'R5C4'),
  new Arrow('R6C3', 'R7C3', 'R8C3', 'R9C3'),
  new Arrow('R9C9', 'R8C8', 'R7C7'),
  new Arrow('R3C3', 'R4C4', 'R4C5'),
  new Arrow('R6C6', 'R7C6', 'R8C6', 'R9C6'),
];
