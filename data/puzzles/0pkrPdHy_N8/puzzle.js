// Title: The Knights are Ill
// Author: Unknown
// Video: https://www.youtube.com/watch?v=0pkrPdHy_N8
// Source: https://cracking-the-cryptic.web.app/sudoku/jbgNqdM3HR

// Standard sudoku rules (default rows/cols/boxes; payload regions match the
// default 3x3 boxes exactly). Anti-knight: identical digits cannot be a
// knight's move apart. Four thermometers: digits increase from the bulb to
// the end.
//
// Two of the four thermometer lines are drawn tip-first in the payload (the
// bulb underlay sits on the last waypoint-derived cell, not the first); those
// two are entered here bulb-first, i.e. in the reverse of their drawn order.

return [
  new Shape('9x9'),

  new Given('R4C6', 4),
  new Given('R6C4', 6),

  new AntiKnight(),

  new Thermo('R4C1', 'R4C2', 'R4C3', 'R4C4', 'R3C4', 'R3C5'),
  new Thermo('R5C2', 'R6C2', 'R6C3', 'R7C3', 'R8C3'),
  new Thermo('R5C8', 'R5C7', 'R4C7', 'R3C7'),
  new Thermo('R8C7', 'R7C7', 'R7C8'),
];
