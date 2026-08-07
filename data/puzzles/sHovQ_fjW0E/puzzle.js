// Title: 4DoES
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=sHovQ_fjW0E
// Source: https://app.crackingthecryptic.com/sudoku/pbj4b4j7DN

// Rules: normal sudoku, plus each 3x3 box contains 4 non-overlapping dominoes
// (orthogonally-adjacent cell pairs, wholly inside the box) all sharing one
// sum; the 9th box cell is unpaired. Sums may differ box to box. The rules
// never say which 8 of a box's 9 cells pair up or how, so every legal pairing
// is offered as an alternative: for each box, Or() over every way to choose 4
// disjoint dominoes covering 8 of its 9 cells, each alternative requiring its
// 4 dominoes to share a sum via EqualSum.

// Givens, transcribed from the payload's per-cell `value` fields.
const givens = [
  ['R2C2', 5], ['R2C3', 1], ['R2C4', 2], ['R2C6', 6], ['R2C7', 7], ['R2C8', 3],
  ['R3C2', 2], ['R3C8', 9],
  ['R4C2', 7], ['R4C8', 1],
  ['R6C2', 9], ['R6C8', 7],
  ['R7C2', 6], ['R7C8', 2],
  ['R8C2', 4], ['R8C3', 7], ['R8C4', 6], ['R8C6', 8], ['R8C7', 9], ['R8C8', 5],
];

// Every way to choose 4 disjoint edges (dominoes) of a 3x3 grid graph that
// together cover 8 of its 9 vertices (cells), leaving exactly one uncovered.
// boxCells is a box's 9 cells in row-major order; returns an array of
// matchings, each a list of 4 [cellA, cellB] pairs.
function boxDominoMatchings(boxCells) {
  const idx = (r, c) => r * 3 + c;
  const edges = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (c + 1 < 3) edges.push([idx(r, c), idx(r, c + 1)]);
      if (r + 1 < 3) edges.push([idx(r, c), idx(r + 1, c)]);
    }
  }
  const matchings = [];
  const combo = [];
  const recurse = (start) => {
    if (combo.length === 4) {
      const used = new Set();
      for (const [a, b] of combo) { used.add(a); used.add(b); }
      if (used.size === 8) {
        matchings.push(combo.map(([a, b]) => [boxCells[a], boxCells[b]]));
      }
      return;
    }
    for (let i = start; i < edges.length; i++) {
      const [a, b] = edges[i];
      if (combo.some(([x, y]) => x === a || x === b || y === a || y === b)) continue;
      combo.push(edges[i]);
      recurse(i + 1);
      combo.pop();
    }
  };
  recurse(0);
  return matchings;
}

const graph = cellGraph('9x9');
const boxDominoSums = graph.boxes().map(
  boxCells => new Or(boxDominoMatchings(boxCells).map(m => new EqualSum(...m)))
);

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...boxDominoSums,
];
