// Title: Toothbrushes
// Author: Krangune
// Video: https://www.youtube.com/watch?v=kk07GTHBifk
// Source: https://app.crackingthecryptic.com/sudoku/mJbnFrPFBg

// Place 1-9 in each row, column and marked region (irregular jigsaw
// regions -- no standard 3x3 boxes, so NoBoxes() drops the default box
// groups and nine Jigsaw() constraints supply the drawn regions instead).
// No given digits.
// Digits along an arrow sum to the digit in the arrow's bulb cell (the
// first cell of each Arrow below); the arm permits repeated digits.
// One bulb cell (R6C5) anchors two separate drawn arrows with different
// arms; ISS's Arrow class has no UNIQUENESS_KEY_FIELD, so both instances
// at the shared bulb are kept as independent constraints (payload has two
// separate arrow entries there, each with its own arrowhead).

return [
  new Shape('9x9'),
  new NoBoxes(),

  new Jigsaw('9x9', 'R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6'),
  new Jigsaw('9x9', 'R3C1', 'R3C2', 'R3C3', 'R4C1', 'R4C2', 'R4C3', 'R4C4', 'R4C5', 'R4C6'),
  new Jigsaw('9x9', 'R6C1', 'R6C2', 'R6C3', 'R7C1', 'R7C2', 'R8C1', 'R8C2', 'R9C1', 'R9C2'),
  new Jigsaw('9x9', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R2C7', 'R3C4', 'R3C5', 'R3C6', 'R3C7'),
  new Jigsaw('9x9', 'R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9'),
  new Jigsaw('9x9', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R8C3', 'R9C3', 'R9C4', 'R9C5', 'R9C6'),
  new Jigsaw('9x9', 'R1C8', 'R1C9', 'R2C8', 'R2C9', 'R3C8', 'R3C9', 'R4C7', 'R4C8', 'R4C9'),
  new Jigsaw('9x9', 'R6C4', 'R6C5', 'R6C6', 'R6C7', 'R6C8', 'R6C9', 'R7C7', 'R7C8', 'R7C9'),
  new Jigsaw('9x9', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8', 'R8C9', 'R9C7', 'R9C8', 'R9C9'),

  new Arrow('R2C4', 'R1C3', 'R1C2', 'R1C1'),
  new Arrow('R3C7', 'R3C8', 'R4C9'),
  new Arrow('R4C4', 'R3C3', 'R3C2', 'R3C1'),
  new Arrow('R5C6', 'R5C7', 'R5C8'),
  new Arrow('R6C5', 'R5C5', 'R4C6'),
  new Arrow('R6C5', 'R7C6'),
  new Arrow('R6C6', 'R7C7', 'R7C8', 'R7C9'),
  new Arrow('R7C3', 'R6C3', 'R5C3'),
  new Arrow('R8C1', 'R7C2', 'R6C1'),
  new Arrow('R8C6', 'R9C7', 'R9C8', 'R9C9'),
  new Arrow('R9C3', 'R9C4', 'R9C5'),
];
