// Title: Thermodynamics
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=gLLnwa2Z_Pg
// Source: https://app.crackingthecryptic.com/sudoku/Lm4PT4Ht99

// Normal sudoku rules apply (standard rows/columns/3x3 boxes). Digits may not
// repeat along either diagonal: both the anti-diagonal (R1C9-R9C1) and the
// main diagonal (R1C1-R9C9) are stroked in the identical blue drawn colour
// (#34BBE6), so both are encoded even though the rules text names only "a
// main diagonal (marked in blue)". Along each thermometer, digits increase
// from the bulb end.

// Thermometers: bulb (grey circle underlay) on a main-diagonal cell
// R2C2..R8C8, shaft running straight toward the upper-right corner and
// clipped at the row-1/column-9 grid edge. Cell lists transcribed from the
// drawn grey lines and circle underlays.
const thermos = [
  ['R2C2', 'R1C3'],
  ['R3C3', 'R2C4', 'R1C5'],
  ['R4C4', 'R3C5', 'R2C6', 'R1C7'],
  ['R5C5', 'R4C6', 'R3C7', 'R2C8', 'R1C9'],
  ['R6C6', 'R5C7', 'R4C8', 'R3C9'],
  ['R7C7', 'R6C8', 'R5C9'],
  ['R8C8', 'R7C9'],
];

return [
  new Shape('9x9'),

  new Given('R3C1', 8),
  new Given('R9C1', 7),
  new Given('R9C7', 9),

  new Diagonal(1),
  new Diagonal(-1),

  ...thermos.map(cells => new Thermo(...cells)),
];
