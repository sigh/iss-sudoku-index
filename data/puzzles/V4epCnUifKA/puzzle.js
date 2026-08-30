// Title: unknown
// Author: Eric Dunn
// Video: https://www.youtube.com/watch?v=V4epCnUifKA
// Source: https://cracking-the-cryptic.web.app/sudoku/Rbd2qbRpN3

// The source states no rules text at all. Encoded from the drawn art alone:
//
//   - Normal sudoku rules apply (9x9, nine standard 3x3 boxes, no givens).
//   - Ten quadruple circles: every digit printed in a circle appears in the
//     2x2 square of cells around it. Each circle prints four digits over four
//     cells, so each 2x2 square holds exactly the printed set.
//
// Not encoded: whatever further rule the source's own rules panel states. The
// two rules above are everything the board draws, and they do not pin the
// grid down.

// Transcribed from the ten circle clues, each centred on the grid corner
// shared by the four cells it constrains; each 2x2 square is named here by its
// top-left cell, as Quad expects.
const quads = [
  ['R1C1', 1, 2, 7, 8],
  ['R1C8', 5, 6, 8, 9],
  ['R2C4', 1, 2, 7, 8],
  ['R3C3', 2, 3, 6, 7],
  ['R4C2', 1, 2, 7, 8],
  ['R5C7', 1, 3, 4, 9],
  ['R6C6', 4, 5, 8, 9],
  ['R7C5', 1, 3, 4, 9],
  ['R8C1', 2, 3, 5, 6],
  ['R8C8', 1, 3, 4, 9],
];

return [
  new Shape('9x9'),
  ...quads.map(([topLeft, ...values]) => new Quad(topLeft, ...values)),
];
