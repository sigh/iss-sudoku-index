// Title: Three in the Corner
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=DE--lZUBAYM
// Source: https://app.crackingthecryptic.com/sudoku/mNjQBPt2QF

// Normal sudoku rules apply. Identical digits cannot appear a chess king's
// move away from each other (AntiKing, global). Along thermometers, digits
// increase from the bulb to the ends (Thermo per branch).
//
// Each corner of the grid carries one forked thermometer: a shared bulb and
// stem that splits into two arms. The payload draws each arm as its own
// `lines` entry sharing the bulb/stem cells, so each arm below is a separate
// Thermo starting at the same bulb: both readings agree on the shared cells'
// relative order and the two arms are otherwise independent past the split.

return [
  new Shape('9x9'),
  new Given('R5C4', 4),
  new Given('R5C6', 1),

  new AntiKing(),

  // Top-left corner thermometer, bulb R2C2.
  new Thermo('R2C2', 'R2C3', 'R3C3', 'R3C2', 'R3C1'),
  new Thermo('R2C2', 'R2C3', 'R1C3', 'R1C2', 'R1C1'),

  // Top-right corner thermometer, bulb R1C7.
  new Thermo('R1C7', 'R1C8', 'R1C9', 'R2C9', 'R2C8'),
  new Thermo('R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9', 'R3C8', 'R3C7'),

  // Bottom-right corner thermometer, bulb R8C8.
  new Thermo('R8C8', 'R8C9', 'R9C9', 'R9C8', 'R9C7'),
  new Thermo('R8C8', 'R8C9', 'R7C9', 'R7C8', 'R7C7'),

  // Bottom-left corner thermometer, bulb R7C1.
  new Thermo('R7C1', 'R7C2', 'R7C3', 'R8C3', 'R8C2'),
  new Thermo('R7C1', 'R7C2', 'R7C3', 'R8C3', 'R9C3', 'R9C2', 'R9C1'),
];
