// Title: Handshake
// Author: Niverio
// Video: https://www.youtube.com/watch?v=JmRXPwxZL1k
// Source: https://app.crackingthecryptic.com/sudoku/d6LrT33G7f

// Normal sudoku rules apply (standard 3x3 boxes, no givens). Digits along
// an arrow sum to the digit in that arrow's circle. Twelve circles are
// drawn; six have two arrows growing from the same circle, so that circle's
// digit is the sum of each arm separately. Every Arrow below lists the
// circle cell first, then its own arm cells, matching the drawn geometry.
return [
  new Shape('9x9'),

  // 1
  new Arrow('R1C2', 'R2C1', 'R3C2'),
  // 2, 3: two arrows share the R1C3 circle
  new Arrow('R1C3', 'R2C4'),
  new Arrow('R1C3', 'R2C3', 'R3C3'),
  // 4, 5: two arrows share the R4C2 circle
  new Arrow('R4C2', 'R3C3'),
  new Arrow('R4C2', 'R5C3', 'R6C3'),
  // 6
  new Arrow('R6C1', 'R7C2'),
  // 7, 8: two arrows share the R7C1 circle
  new Arrow('R7C1', 'R6C2'),
  new Arrow('R7C1', 'R8C1', 'R9C1'),
  // 9, 10: two arrows share the R9C4 circle
  new Arrow('R9C4', 'R9C5', 'R8C5'),
  new Arrow('R9C4', 'R8C3'),
  // 11
  new Arrow('R7C4', 'R6C5', 'R5C4'),
  // 12, 13: two arrows share the R5C6 circle
  new Arrow('R5C6', 'R5C5', 'R4C5'),
  new Arrow('R5C6', 'R4C7'),
  // 14
  new Arrow('R3C7', 'R2C6', 'R1C6'),
  // 15
  new Arrow('R1C8', 'R1C7', 'R2C7'),
  // 16, 17: two arrows share the R7C7 circle
  new Arrow('R7C7', 'R7C8', 'R7C9'),
  new Arrow('R7C7', 'R8C6', 'R9C6'),
  // 18
  new Arrow('R9C9', 'R9C8', 'R9C7'),
];
