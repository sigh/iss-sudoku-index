// Title: Mosaic
// Author: Suspicious Door
// Video: https://www.youtube.com/watch?v=MLpPeXT1t6I
// Source: https://app.crackingthecryptic.com/sudoku/Bfp4nqt444

// Normal sudoku rules apply (default row/column/box all-different; no givens).
// Six 9-cell cages carry no printed total, so each is all-different only
// (Cage with an empty sum). Nine thermometers require strictly increasing
// digits starting from the bulb end.

// Cages: no-total, all-different only. Cell lists transcribed from the
// drawn cage outlines, six 9-cell cages tiling a symmetric pattern.
const CAGES = [
  ['R4C1', 'R4C4', 'R5C1', 'R5C2', 'R5C3', 'R5C4', 'R6C1', 'R6C4', 'R6C5'],
  ['R4C5', 'R4C6', 'R4C9', 'R5C6', 'R5C7', 'R5C8', 'R5C9', 'R6C6', 'R6C9'],
  ['R6C7', 'R6C8', 'R7C6', 'R7C7', 'R8C7', 'R8C8', 'R8C9', 'R9C7', 'R9C8'],
  ['R1C7', 'R1C8', 'R2C7', 'R2C8', 'R2C9', 'R3C6', 'R3C7', 'R4C7', 'R4C8'],
  ['R1C2', 'R1C3', 'R2C1', 'R2C2', 'R2C3', 'R3C3', 'R3C4', 'R4C2', 'R4C3'],
  ['R6C2', 'R6C3', 'R7C3', 'R7C4', 'R8C1', 'R8C2', 'R8C3', 'R9C2', 'R9C3'],
];

// Thermometers: cell order runs bulb-first (Thermo enforces strictly
// increasing starting at its first argument). Bulb end for each line was
// identified as the drawn endpoint carrying the circular bulb marker.
const THERMOS = [
  ['R2C1', 'R1C1'],
  ['R3C6', 'R3C5', 'R4C4'],
  ['R4C7', 'R5C6'],
  ['R5C4', 'R6C3'],
  ['R6C1', 'R6C2', 'R7C3'],
  ['R8C4', 'R8C3', 'R9C2'],
  ['R8C5', 'R8C6'],
  ['R6C9', 'R7C8'],
  ['R1C5', 'R2C5', 'R2C6'],
];

return [
  new Shape('9x9'),

  ...CAGES.map((cells) => new Cage('', ...cells)),

  ...THERMOS.map((cells) => new Thermo(...cells)),
];
