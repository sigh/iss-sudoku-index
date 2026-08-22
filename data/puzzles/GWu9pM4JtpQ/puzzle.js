// Title: Supernova
// Author: Nahileon
// Video: https://www.youtube.com/watch?v=GWu9pM4JtpQ
// Source: https://app.crackingthecryptic.com/sudoku/MF3rQB3Tgr

// Normal sudoku rules apply (default row/column/box all-different).
//
// Each circle sits on a grid intersection; every digit written in the circle
// must appear in at least one of the four surrounding cells -- a standard
// Quadruple clue, so each is `Quad(topLeftCell, ...digits)`.
//
// Every even digit must see an identical digit via a knight's move: for
// every cell, either its value is odd, or some knight-move-away cell holds
// the same value. Encoded per cell as `Or(Given(odd), ...SameValues(2, cell,
// neighbour) for each knight neighbour)` -- any one matching neighbour, or
// an odd value, satisfies the disjunction.

const graph = cellGraph('9x9');

// Quadruple circles: [topLeftCell, ...digits]. topLeftCell is the top-left
// cell of the circle's surrounded 2x2 block; digits are those drawn in the
// circle (each character one digit).
const quads = [
  ['R1C1', 2, 3],
  ['R2C2', 5],
  ['R3C3', 8, 9],
  ['R3C6', 5, 6],
  ['R6C3', 4, 5],
  ['R6C6', 1, 2],
  ['R7C2', 1],
  ['R8C1', 6, 7],
  ['R8C8', 8],
  ['R7C7', 2, 5],
  ['R2C7', 8, 9],
  ['R1C8', 3, 4],
];

const KNIGHT_OFFSETS = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1],
];

const knightRule = graph.cells().map(cell => {
  const neighbours = KNIGHT_OFFSETS
    .map(([dRow, dCol]) => graph.step(cell, dRow, dCol))
    .filter(n => n !== null);
  return new Or([
    new Given(cell, 1, 3, 5, 7, 9),
    ...neighbours.map(n => new SameValues(2, cell, n)),
  ]);
});

return [
  new Shape('9x9'),
  ...quads.map(([topLeft, ...values]) => new Quad(topLeft, ...values)),
  ...knightRule,
];
