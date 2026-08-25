// Title: Andy Warhol. Thermo Sudoku.
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=Gf3gemXUv2o
// Source: https://app.crackingthecryptic.com/webapp/J27gFDM7pt

// Normal sudoku rules apply (rows, columns, and the 9 boxes each contain
// 1-9 once), and digits increase along each of the 4 thermometers from the
// bulb to the tip. Thermo() enforces strictly increasing values along its
// cell list, which is exactly this rule; each list below runs bulb-first,
// per the drawn round bulb at that end.
//
// The board is also tiled with background colour, but the rules text says
// nothing about colour, so it is decorative only and is not encoded.

return [
  new Shape('9x9'),

  new Thermo('R1C4', 'R2C4', 'R3C4', 'R4C4', 'R4C3', 'R3C3', 'R2C2', 'R1C1'),
  new Thermo('R9C4', 'R8C3', 'R8C2', 'R7C3', 'R7C2', 'R8C1', 'R9C1', 'R9C2'),
  new Thermo('R6C8', 'R7C9', 'R8C9', 'R9C8', 'R9C7', 'R8C6', 'R7C6', 'R6C7'),
  new Thermo('R2C6', 'R2C7', 'R3C7', 'R4C7', 'R4C8', 'R3C9', 'R2C9'),
];
