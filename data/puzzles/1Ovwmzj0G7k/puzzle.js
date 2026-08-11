// Title: Anti-Four
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=1Ovwmzj0G7k
// Source: https://app.crackingthecryptic.com/sudoku/qT84jPJ8b2

// Normal sudoku rules apply (standard 3x3 boxes). No two orthogonal
// neighbours can sum to 4 or a multiple of 4. Any line in the grid has a
// sequence of consecutive digits, not in any particular order (Renban
// semantics).

const graph = cellGraph('9x9');

// Anti-Four: forbid orthogonal pairs whose digits sum to a multiple of 4.
// Stamped over every orthogonal edge (144 on a 9x9 grid: 72 horizontal + 72
// vertical) via one custom Pair template translated to every edge with
// Replicate.
const antiFourKey = Pair.fnToKey((a, b) => (a + b) % 4 !== 0, 9);

const horizontalOrigins = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 8; c++) horizontalOrigins.push(makeCellId(r, c));
}
const verticalOrigins = [];
for (let c = 1; c <= 9; c++) {
  for (let r = 1; r <= 8; r++) verticalOrigins.push(makeCellId(r, c));
}

const antiFourHorizontal = graph.makeReplicate(
  new Pair(antiFourKey, 'anti-four', 'R1C1', 'R1C2'), horizontalOrigins);
const antiFourVertical = graph.makeReplicate(
  new Pair(antiFourKey, 'anti-four', 'R1C1', 'R2C1'), verticalOrigins);

// The three drawn strokes (one per colour: purple, grey, gold) meet/cross at
// shared cells but are three separate coloured entries, not one split line
// -- each is its own Renban line (all-different, consecutive-set semantics
// is exactly what the class enforces).
const renbanLines = [
  ['R5C6', 'R4C6', 'R3C6', 'R2C6'], // purple, column 6
  ['R2C6', 'R3C5', 'R4C4'], // grey, diagonal
  ['R4C4', 'R4C5', 'R4C6', 'R4C7'], // gold, row 4
];

return [
  new Shape('9x9'),

  new Given('R5C2', 8),
  new Given('R5C4', 1),
  new Given('R6C8', 7),
  new Given('R7C6', 7),
  new Given('R8C5', 9),

  antiFourHorizontal,
  antiFourVertical,

  ...renbanLines.map(cells => new Renban(...cells)),
];
