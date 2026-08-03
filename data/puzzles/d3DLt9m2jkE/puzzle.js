// Title: R is for arrows
// Author: Chameleon
// Video: https://www.youtube.com/watch?v=d3DLt9m2jkE
// Source: https://app.crackingthecryptic.com/sudoku/mM7R76NrpR

// Normal sudoku rules apply. Digits along an arrow must sum to the digit in
// that arrow's circle. Standard 3x3 boxes and no givens, so only Shape and
// the 15 Arrow constraints are needed; ISS applies row/column/box
// all-different by default. Arrow() takes the circle cell first followed by
// the shaft cells, per js/solver/sudoku_builder.js's 'Arrow' case.
return [
  new Shape('9x9'),

  // Circle R1C4 (1 arrow).
  new Arrow('R1C4', 'R1C5', 'R2C6'),

  // Circle R2C8 (3 arrows).
  new Arrow('R2C8', 'R2C9', 'R3C9'),
  new Arrow('R2C8', 'R3C8', 'R3C7'),
  new Arrow('R2C8', 'R2C7', 'R1C6'),

  // Circle R3C3 (3 arrows).
  new Arrow('R3C3', 'R2C4'),
  new Arrow('R3C3', 'R4C2'),
  new Arrow('R3C3', 'R4C3', 'R4C4', 'R3C4'),

  // Circle R5C8 (1 arrow).
  new Arrow('R5C8', 'R5C7', 'R5C6', 'R6C6'),

  // Circle R8C2 (3 arrows).
  new Arrow('R8C2', 'R7C2', 'R6C1'),
  new Arrow('R8C2', 'R9C2', 'R9C3'),
  new Arrow('R8C2', 'R8C3', 'R7C3'),

  // Circle R8C5 (1 arrow).
  new Arrow('R8C5', 'R7C5', 'R6C5', 'R5C5'),

  // Circle R8C8 (3 arrows).
  new Arrow('R8C8', 'R8C9', 'R7C9'),
  new Arrow('R8C8', 'R9C8', 'R9C7'),
  new Arrow('R8C8', 'R7C7', 'R8C6'),
];
