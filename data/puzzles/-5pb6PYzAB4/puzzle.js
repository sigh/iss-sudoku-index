// Title: Lost
// Author: Joseph Nehme
// Video: https://www.youtube.com/watch?v=-5pb6PYzAB4
// Source: https://app.crackingthecryptic.com/sudoku/qmFmHfmH2q

// Normal sudoku rules apply (standard 3x3 box regions, no non-standard
// shapes -- Shape('9x9') supplies rows/columns/boxes). No given digits.
// Digits along an arrow sum to the digit in the arrow's bulb cell (the
// first cell of each Arrow below); the arm permits repeated digits.
// Two bulb cells (R9C4 and R3C6) each anchor two separate arrows with
// different arms; ISS's Arrow class has no UNIQUENESS_KEY_FIELD, so both
// instances at a shared bulb are kept.

return [
  new Shape('9x9'),

  new Arrow('R4C2', 'R3C3', 'R2C4'),
  new Arrow('R4C3', 'R3C4'),
  new Arrow('R4C4', 'R5C3', 'R5C2', 'R5C1'),
  new Arrow('R7C1', 'R6C1', 'R6C2'),
  new Arrow('R6C3', 'R7C2'),
  new Arrow('R9C1', 'R9C2', 'R9C3'),
  new Arrow('R9C4', 'R9C5', 'R8C5'),
  new Arrow('R9C4', 'R8C4', 'R7C4', 'R7C3'),
  new Arrow('R9C8', 'R9C9', 'R8C9'),
  new Arrow('R5C5', 'R6C6', 'R5C7', 'R6C8'),
  new Arrow('R3C6', 'R4C7'),
  new Arrow('R3C6', 'R3C7', 'R3C8', 'R3C9'),
  new Arrow('R2C6', 'R1C7', 'R1C8'),
];
