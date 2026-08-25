// Title: Quadruples
// Author: jetalix
// Video: https://www.youtube.com/watch?v=5BAon3r5Rv8
// Source: https://app.crackingthecryptic.com/sudoku/8qGnNTT2bq

// Normal sudoku rules apply (standard rows/columns/3x3 boxes, no givens).
// Thermometers: digits must increase from the bulb end.
// Quadruple circles: each listed digit must appear in at least one of the
// four cells the circle touches.

const thermos = [
  ['R1C6', 'R2C6'],
  ['R3C8', 'R3C7'],
  ['R3C4', 'R3C3'],
  ['R6C1', 'R5C1'],
  ['R9C8', 'R8C8'],
  ['R9C4', 'R9C5'],
].map(cells => new Thermo(...cells));

// Each entry is [top-left cell of the 2x2, ...required digits], read from the
// circle's corner position and printed digit list.
const quads = [
  ['R1C1', 2, 5, 7],
  ['R2C4', 1, 4, 6, 8],
  ['R4C2', 1, 2, 7, 9],
  ['R5C5', 5, 6, 7, 9],
  ['R7C1', 2, 3, 5, 6],
  ['R8C6', 1, 3, 5, 7],
  ['R1C7', 3, 4, 8],
  ['R4C7', 1, 5, 8, 9],
  ['R7C8', 2, 4, 8],
].map(([topLeft, ...values]) => new Quad(topLeft, ...values));

return [
  new Shape('9x9'),
  ...thermos,
  ...quads,
];
