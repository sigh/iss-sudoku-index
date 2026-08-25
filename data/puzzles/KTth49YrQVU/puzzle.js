// Title: Thermo Sudoku
// Author: Jonas Gleim
// Video: https://www.youtube.com/watch?v=KTth49YrQVU
// Source: https://app.crackingthecryptic.com/DBFdgmG6mq
//
// Normal sudoku rules apply. Digits along a thermometer increase from bulb to
// tip. Three bulb circles (R4C4, R5C5, R8C9) sit on an interior cell of a
// two-armed strand rather than at either end, so each is encoded as two
// Thermo constraints sharing that bulb cell, one per arm; the drawing gives
// no relation between the two arms beyond both increasing away from the
// shared bulb.

return [
  new Shape('9x9'),

  // Forked bulb at R4C4: two arms.
  new Thermo('R4C4', 'R4C3', 'R4C2', 'R4C1', 'R3C1', 'R2C1', 'R1C1'),
  new Thermo('R4C4', 'R3C4', 'R2C4', 'R1C4', 'R1C3', 'R1C2'),

  // Single-tip thermo, bulb R1C6.
  new Thermo('R1C6', 'R2C6'),

  // Single-tip thermo, bulb R1C7.
  new Thermo('R1C7', 'R1C8', 'R2C8', 'R3C8', 'R3C7', 'R3C6'),

  // Forked bulb at R5C5: two arms.
  new Thermo('R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9'),
  new Thermo('R5C5', 'R6C5', 'R7C5', 'R8C5'),

  // Forked bulb at R8C9: two arms.
  new Thermo('R8C9', 'R7C9', 'R6C9'),
  new Thermo('R8C9', 'R9C9', 'R9C8', 'R9C7', 'R9C6', 'R9C5'),

  // Single-tip thermo, bulb R8C1.
  new Thermo('R8C1', 'R7C1', 'R6C1', 'R6C2'),

  // Single-tip thermo, bulb R8C2.
  new Thermo('R8C2', 'R8C3'),

  // Single-tip thermo, bulb R7C3.
  new Thermo('R7C3', 'R6C3'),
];
