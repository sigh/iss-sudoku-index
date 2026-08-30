// Title: Thermo Sudoku
// Author: Wang Mingyi
// Video: https://www.youtube.com/watch?v=HbLrCj2tObQ
// Source: https://cracking-the-cryptic.web.app/sudoku/R7MnnTBFd3

// Standard sudoku (default boxes). Each grey line is a thermometer: digits
// strictly increase starting from the round bulb end (Thermo semantics).
//
// Eight bulbs are drawn (circle underlays); six are simple bulb-to-tip
// thermometers. The remaining two bulbs, at R9C7 and R6C7, sit on one
// connected drawing: the line starting at R9C7 meets another line's stroke
// at a shared cell centre rather than at an endpoint (a T-junction, i.e. one
// branching figure), and R6C7 -- itself circled -- is where that figure
// forks a second time. Modelled as a branching thermometer tree rooted at
// R9C7: one Thermo per root-to-tip arm, split at the R6C7 fork so no edge is
// asserted twice.
return [
  new Shape('9x9'),

  new Thermo('R8C2', 'R9C3', 'R8C4', 'R7C4', 'R6C4', 'R5C4', 'R4C4', 'R3C3', 'R2C2'),
  new Thermo('R5C2', 'R4C3', 'R3C4'),
  new Thermo('R7C2', 'R6C3'),
  new Thermo('R2C4', 'R1C4'),
  new Thermo('R6C6', 'R6C5', 'R5C5'),
  new Thermo('R5C9', 'R4C9', 'R4C8', 'R4C7', 'R4C6', 'R4C5'),

  new Thermo('R9C7', 'R9C6', 'R9C5'),
  new Thermo('R9C7', 'R9C8', 'R9C9', 'R8C9', 'R7C9', 'R7C8'),
  new Thermo('R9C7', 'R8C7', 'R7C7', 'R6C7', 'R6C8', 'R6C9'),
  new Thermo('R6C7', 'R5C7', 'R4C7', 'R3C7', 'R2C7', 'R1C7'),
];
