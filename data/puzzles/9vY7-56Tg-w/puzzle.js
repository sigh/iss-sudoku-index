// Title: The Power of Goodliffing
// Author: Emre Kolotoglu
// Video: https://www.youtube.com/watch?v=9vY7-56Tg-w
// Source: https://tinyurl.com/8bfzstss
//
// Normal sudoku rules apply. Digits along a thermometer increase from bulb to
// tip. Six of the nine bulb circles fork into two or more arms rather than
// running to a single tip; each arm is encoded as its own Thermo constraint
// starting at the shared bulb cell (two arms may also share a run of cells
// before diverging further out -- e.g. R6C8's two long arms coincide through
// R5C8-R4C8 before splitting to R4C7/R4C9 -- which is still faithfully
// captured by giving each full arm path its own Thermo).

return [
  new Shape('9x9'),

  // Non-forked, bulb R6C1.
  new Thermo('R6C1', 'R6C2', 'R5C3', 'R4C2', 'R4C1', 'R5C1'),

  // Non-forked, bulb R4C4.
  new Thermo('R4C4', 'R5C4', 'R6C4', 'R6C5', 'R6C6'),

  // Forked bulb at R1C1: two arms.
  new Thermo('R1C1', 'R1C2', 'R1C3'),
  new Thermo('R1C1', 'R2C1', 'R3C1', 'R3C2', 'R3C3', 'R2C3', 'R2C2'),

  // Forked bulb at R3C4: two arms.
  new Thermo('R3C4', 'R2C4', 'R1C4'),
  new Thermo('R3C4', 'R3C5', 'R3C6', 'R2C6', 'R1C6', 'R1C5'),

  // Forked bulb at R3C9: two arms.
  new Thermo('R3C9', 'R3C8', 'R3C7'),
  new Thermo('R3C9', 'R2C9', 'R1C9', 'R1C8', 'R1C7', 'R2C7'),

  // Forked bulb at R6C8: four arms (two long arms share R6C8-R5C8-R4C8
  // before diverging to R4C7 / R4C9; two short arms run directly to R6C7
  // and R6C9).
  new Thermo('R6C8', 'R5C8', 'R4C8', 'R4C7'),
  new Thermo('R6C8', 'R5C8', 'R4C8', 'R4C9'),
  new Thermo('R6C8', 'R6C7'),
  new Thermo('R6C8', 'R6C9'),

  // Forked bulb at R7C1: three arms (two share R7C1-R8C1 before diverging to
  // R9C1 / R8C2).
  new Thermo('R7C1', 'R8C1', 'R9C1'),
  new Thermo('R7C1', 'R7C2', 'R7C3'),
  new Thermo('R7C1', 'R8C1', 'R8C2'),

  // Forked bulb at R7C4: three arms (two share R7C4-R8C4 before diverging to
  // R9C4 / R8C5).
  new Thermo('R7C4', 'R8C4', 'R9C4'),
  new Thermo('R7C4', 'R8C4', 'R8C5'),
  new Thermo('R7C4', 'R7C5', 'R7C6'),

  // Forked bulb at R8C7: three arms.
  new Thermo('R8C7', 'R7C7', 'R7C8', 'R7C9'),
  new Thermo('R8C7', 'R9C7', 'R9C8', 'R9C9'),
  new Thermo('R8C7', 'R8C8'),
];
