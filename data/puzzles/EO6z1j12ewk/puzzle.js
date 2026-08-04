// Title: Polka Dot
// Author: PotatoHead21
// Video: https://www.youtube.com/watch?v=EO6z1j12ewk
// Source: https://app.crackingthecryptic.com/sudoku/tDpBjNN8nL

// Normal sudoku rules apply. Digits in circles must appear in at least one of
// the four cells surrounding that circle. This is exactly Quad's semantics
// (topLeftCell of the 2x2 square, followed by the required values), so each
// circle becomes one Quad anchored at the top-left cell of its 2x2 block.
// Circle positions and digit lists transcribed from the drawn circle overlays
// (each circle's four-cell corner and printed digit text).
const quads = [
  ['R1C3', 1, 2, 3],
  ['R3C5', 1, 2, 3],
  ['R5C1', 4, 5, 6],
  ['R6C8', 7, 8, 9],
  ['R4C8', 4, 5, 6],
  ['R7C3', 7, 8, 9],
  ['R6C2', 1, 2, 3],
  ['R6C6', 4, 5, 6],
  ['R3C3', 4, 5, 6],
  ['R1C1', 7, 8, 9],
  ['R2C2', 2],
  ['R1C8', 7],
  ['R1C6', 1, 2, 3, 8],
  ['R7C7', 2],
  ['R7C1', 3, 4],
  ['R2C5', 6],
  ['R2C7', 1, 5],
];

return [
  new Shape('9x9'),
  ...quads.map(([topLeftCell, ...values]) => new Quad(topLeftCell, ...values)),
];
