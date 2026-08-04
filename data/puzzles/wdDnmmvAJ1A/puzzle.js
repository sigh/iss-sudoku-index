// Title: The Begging Man
// Author: Lizzy01
// Video: https://www.youtube.com/watch?v=wdDnmmvAJ1A
// Source: https://app.crackingthecryptic.com/sudoku/hmBgghH63m

// Normal sudoku rules apply. Along thermometers, digits increase from the
// bulb end, so each Thermo call below lists cells bulb-first.
//
// The drawn line for T3 (R3C6-R4C6-R5C6-R5C5-R6C5-R6C4-R5C4) is one
// continuous 6-waypoint path, but its bulb circle is centred on R4C6, the
// path's second cell rather than either endpoint. A bulb drawn mid-path
// marks two arms radiating from it, so T3 is encoded as two Thermo
// constraints sharing the R4C6 bulb cell: a short arm to R3C6 and a long
// arm through R5C6-R5C5-R6C5-R6C4-R5C4.

return [
  new Shape('9x9'),

  new Thermo('R2C3', 'R3C2', 'R3C1'),
  new Thermo('R4C3', 'R3C4', 'R3C5'),
  new Thermo('R4C6', 'R3C6'),
  new Thermo('R4C6', 'R5C6', 'R5C5', 'R6C5', 'R6C4', 'R5C4'),
  new Thermo('R1C7', 'R2C7', 'R1C8', 'R2C9', 'R3C8', 'R3C9'),
  new Thermo('R6C7', 'R7C8', 'R7C9'),
  new Thermo('R9C7', 'R8C7', 'R7C6', 'R7C5'),
  new Thermo('R6C3', 'R7C4'),
  new Thermo('R8C3', 'R7C2', 'R7C1'),
  new Thermo('R8C1', 'R9C1', 'R8C2'),
];
