// Title: 3/25
// Author: Thomas Snyder
// Video: https://www.youtube.com/watch?v=SLYa0GFgG-0
// Source: https://app.crackingthecryptic.com/sudoku/2gBrMpJp78

// Normal sudoku rules apply. Along thermometers, digits must increase from
// the bulb end. Twelve thermometers are drawn (grey, thickness 12, each with
// one bulb underlay). Nine are simple chains. Three (R2C2, R8C1, R5C5 bulbs)
// are Y-shaped: the wayPoints revisit a cell, showing a single shaft off the
// bulb that then forks into two increasing arms; the R5C5 one forks on both
// sides of the bulb, giving four arms. Each arm (including the shared shaft)
// is encoded as its own Thermo call over the bulb-to-tip cell order, so the
// shared prefix is asserted once per arm -- redundant, not conflicting.

return [
  new Shape('9x9'),

  new Thermo('R1C5', 'R1C6', 'R2C6', 'R2C5', 'R3C5', 'R3C6'),
  new Thermo('R1C9', 'R1C8', 'R2C8', 'R2C9', 'R3C9', 'R3C8'),
  new Thermo('R4C1', 'R4C2'),
  new Thermo('R6C1', 'R5C1', 'R5C2'),
  new Thermo('R6C4', 'R6C3', 'R6C2'),
  new Thermo('R4C6', 'R4C7', 'R4C8', 'R4C9'),
  new Thermo('R6C8', 'R5C8', 'R5C9', 'R6C9'),
  new Thermo('R7C4', 'R7C5', 'R8C5', 'R8C4', 'R9C4', 'R9C5'),
  new Thermo('R7C8', 'R7C7', 'R8C7', 'R8C8', 'R9C8', 'R9C7'),

  // Y-thermo, bulb R2C2.
  new Thermo('R2C2', 'R2C3', 'R1C3', 'R1C2'),
  new Thermo('R2C2', 'R2C3', 'R3C3', 'R3C2'),

  // Y-thermo, bulb R8C1.
  new Thermo('R8C1', 'R8C2', 'R7C2', 'R7C1'),
  new Thermo('R8C1', 'R8C2', 'R9C2', 'R9C1'),

  // Double-Y thermo, bulb R5C5, forking on both sides.
  new Thermo('R5C5', 'R5C4', 'R4C4', 'R4C5'),
  new Thermo('R5C5', 'R5C4', 'R4C4', 'R4C3'),
  new Thermo('R5C5', 'R5C6', 'R6C6', 'R6C5'),
  new Thermo('R5C5', 'R5C6', 'R6C6', 'R6C7'),
];
