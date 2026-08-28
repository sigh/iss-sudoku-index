// Title: August 31, 2021: Thermo Quads
// Author: clover!
// Video: https://www.youtube.com/watch?v=z-CQLijElrk
// Source: https://tinyurl.com/2srbw37j

// Normal sudoku (default row/col/box), no givens. Thermometers: Thermo
// (strictly increasing from the bulb, listed bulb-first as drawn). White
// circles (quad clues): Quad(topLeftCell, ...values) -- each listed digit
// must appear in at least one of the surrounding four cells; each quad's
// cells are drawn as a 2x2 block anchored at its top-left cell.

return [
  new Shape('9x9'),

  // Thermometers (grey lines, filled bulb circle at the start end).
  new Thermo('R1C1', 'R1C2', 'R2C3', 'R2C4', 'R1C5', 'R1C6'),
  new Thermo('R4C1', 'R4C2', 'R3C3', 'R3C4', 'R2C5'),
  new Thermo('R4C3', 'R4C4', 'R5C5'),
  new Thermo('R7C3', 'R7C4', 'R6C5', 'R6C6', 'R7C7', 'R7C8'),
  new Thermo('R8C8', 'R8C7', 'R7C6', 'R7C5', 'R8C4'),
  new Thermo('R8C5', 'R8C6', 'R9C7', 'R9C8'),
  new Thermo('R7C1', 'R8C2', 'R8C3'),
  new Thermo('R3C5', 'R4C6', 'R4C7'),

  // Quadruples (white circles; values from the puzzle's drawn clue text).
  new Quad('R1C3', 1, 2),
  new Quad('R2C3', 3, 4),
  new Quad('R3C3', 5, 6),
  new Quad('R4C3', 7, 8),
  new Quad('R5C3', 1, 9),
  new Quad('R6C5', 6, 7),
  new Quad('R7C7', 3, 5),
  new Quad('R7C5', 2, 4),
  new Quad('R6C7', 2, 3),
];
