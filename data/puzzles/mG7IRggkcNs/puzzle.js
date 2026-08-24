// Title: The Suducku King
// Author: Aspartagcus
// Video: https://www.youtube.com/watch?v=mG7IRggkcNs
// Source: https://app.crackingthecryptic.com/sudoku/TFfjT3TjgQ
//
// Normal sudoku rules apply (standard rows/cols/boxes, default in ISS).
// Thermometers: digits increase from the bulb end -- Thermo(bulb, ...rest).
// Blue lines: renban -- a set of consecutive, non-repeating digits, any
// order -- Renban(...cells).
//
// Thermometer and renban cell paths are transcribed from the drawn line
// geometry (interpolated stroke paths); bulb ends are confirmed by the
// filled-circle underlays at R5C3, R5C7, R6C4, R6C6, which coincide with
// each thermo's first listed cell.

return [
  new Shape('9x9'),

  // Thermometers (bulb first, increasing outward).
  new Thermo('R5C3', 'R5C4', 'R4C4', 'R3C4', 'R3C3', 'R4C2', 'R5C2'),
  new Thermo('R5C7', 'R5C6', 'R4C6', 'R3C6', 'R3C7', 'R4C8', 'R5C8'),
  new Thermo('R6C4', 'R7C3', 'R7C2', 'R8C2'),
  new Thermo('R6C6', 'R7C7', 'R7C8', 'R8C8'),

  // Renban (blue) lines.
  new Renban('R2C3', 'R1C3', 'R2C4', 'R1C5', 'R2C6', 'R1C7', 'R2C7'),
  new Renban('R3C2', 'R4C1', 'R5C1', 'R6C2'),
  new Renban('R3C8', 'R4C9'),
  new Renban('R5C9', 'R6C8'),
  new Renban('R8C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R8C8'),
];
