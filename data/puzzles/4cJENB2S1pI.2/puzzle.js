// Title: December 20, 2021: Wolverine
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=4cJENB2S1pI
// Source: https://tinyurl.com/2p8r447b
//
// Normal sudoku rules apply. Digits along thermometers must increase from
// bulb to tip. Digits along the indicated diagonals cannot repeat. Both
// diagonals are drawn, so both get a Diagonal all-different constraint.
// Each thermometer's cells are listed bulb-first, matching Thermo's
// bulb-first argument order.

return [
  new Shape('9x9'),

  new Given('R1C1', 8),
  new Given('R1C9', 6),
  new Given('R9C1', 4),
  new Given('R9C9', 7),

  // diagonal- (payload flag): top-left to bottom-right, R1C1..R9C9.
  new Diagonal(-1),
  // diagonal+ (payload flag): bottom-left to top-right, R9C1..R1C9.
  new Diagonal(1),

  new Thermo('R8C3', 'R7C3', 'R6C3', 'R5C3', 'R4C3', 'R3C3', 'R2C3'),
  new Thermo('R8C5', 'R7C5', 'R6C5', 'R5C5', 'R4C5', 'R3C5', 'R2C5'),
  new Thermo('R8C7', 'R7C7', 'R6C7', 'R5C7', 'R4C7', 'R3C7', 'R2C7'),
];
