// Title: Christmas Tree Sudoku
// Author: Gert Hana
// Video: https://www.youtube.com/watch?v=gcIOWM9LhlY
// Source: https://app.crackingthecryptic.com/sudoku/p6NnM6QggD

// Normal sudoku rules apply. Digits increase along thermometers away from the
// bulb (the filled circle end). Colours are irrelevant: the shaded tree/star
// artwork behind the thermometers is decorative only.
//
// Three bulbs (R1C5, R3C5, R4C5) each grow two arms instead of one -- a single
// bulb followed by a fork, both arms increasing from that same bulb with no
// order required between the two arms. R1C5 forks one cell after the bulb, at
// R2C5; R3C5 and R4C5 fork at the bulb cell itself. Encoded below as two
// Thermo calls per forked bulb, sharing the common prefix cells.
//
// Three thermometers (bulbs R6C4, R6C6, R9C5) are drawn tip-first in the
// source payload -- the bulb overlay sits on the last waypoint, not the
// first -- so the cell lists below are already reversed to run bulb-first.

return [
  new Shape('9x9'),

  // Givens.
  new Given('R2C8', 9),
  new Given('R3C9', 3),
  new Given('R4C2', 5),
  new Given('R5C1', 1),
  new Given('R9C3', 6),

  // Bulb R1C5, forking at R2C5.
  new Thermo('R1C5', 'R2C5', 'R3C4', 'R4C3'),
  new Thermo('R1C5', 'R2C5', 'R3C6', 'R4C7'),

  // Bulb R3C5, forking at the bulb.
  new Thermo('R3C5', 'R4C6', 'R5C7'),
  new Thermo('R3C5', 'R4C4', 'R5C3', 'R6C2', 'R7C2'),

  // Bulb R4C2.
  new Thermo('R4C2', 'R5C2'),

  // Bulb R4C8.
  new Thermo('R4C8', 'R5C8', 'R6C8'),

  // Bulb R4C5, forking at the bulb.
  new Thermo('R4C5', 'R5C4', 'R6C3'),
  new Thermo('R4C5', 'R5C6', 'R6C7', 'R7C8'),

  // Bulb R7C9.
  new Thermo('R7C9', 'R8C9'),

  // Bulb R7C1.
  new Thermo('R7C1', 'R8C1'),

  // Bulb R6C4.
  new Thermo('R6C4', 'R7C3', 'R8C2'),

  // Bulb R6C6.
  new Thermo('R6C6', 'R7C7', 'R8C8'),

  // Bulb R8C3.
  new Thermo('R8C3', 'R8C4', 'R7C4', 'R7C5'),

  // Bulb R9C5.
  new Thermo('R9C5', 'R8C5', 'R8C6', 'R8C7', 'R7C6', 'R6C5', 'R5C5'),
];
