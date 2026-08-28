// Title: March 15, 2021: Quadruples
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=-pInDSLVfCo
// Source: https://tinyurl.com/2p8897tt

// Normal sudoku rules apply, plus one quadruple circle per 2x2 intersection.
// `Quad`'s "must appear at least count times" semantics for a repeated value
// match the rules text verbatim, so each circle is a direct `new
// Quad(topLeftCell, ...values)` call, using the drawn circle's own listed
// digits and its 2x2 square's top-left cell.
const quads = [
  ['R3C3', 1, 1, 2, 2],
  ['R3C6', 3, 3, 4, 4],
  ['R6C6', 7, 7, 8, 8],
  ['R6C8', 3, 3, 4],
  ['R8C3', 7, 7, 8],
  ['R3C1', 5, 5, 6],
  ['R6C3', 5, 5, 6, 6],
  ['R1C6', 1, 1, 2],
  ['R4C4', 2, 4],
  ['R5C5', 6, 9],
  ['R7C7', 8, 9],
  ['R4C7', 6, 7],
  ['R5C2', 3, 4],
  ['R2C2', 6, 8],
];

return [
  new Shape('9x9'),
  ...quads.map(([topLeftCell, ...values]) => new Quad(topLeftCell, ...values)),
];
