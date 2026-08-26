// Title: Broken 358 tears
// Author: Bha-Gu
// Video: https://www.youtube.com/watch?v=nCURkXEf87Q
// Source: https://sudokupad.app/83zpp5gwpt

// Standard Sudoku, plus: digits 3 or 8 cannot appear a king's move away from
// digit 5 (the up to 8 cells orthogonally/diagonally adjacent to a 5). This is
// a symmetric relation between every king-move-adjacent cell pair, so it is
// encoded as one custom Pair per such edge (deduped by taking each unordered
// pair once): forbid {a,b} = {5,3} or {5,8} in either order.
const givens = [
  ['R1C8', 7], ['R1C9', 2], ['R2C1', 7], ['R2C2', 1], ['R3C3', 2],
  ['R3C6', 7], ['R3C7', 1], ['R3C8', 3], ['R5C2', 4], ['R5C5', 7],
  ['R6C2', 3], ['R6C4', 1], ['R7C6', 1], ['R8C4', 6], ['R8C5', 4],
  ['R8C6', 3], ['R8C7', 2], ['R8C8', 9],
];

const graph = cellGraph('9x9');
const noKingClashKey = Pair.fnToKey(
  (a, b) => !((a === 5 && (b === 3 || b === 8)) || (b === 5 && (a === 3 || a === 8))),
  9);

// King-move adjacency has 4 distinct directions up to sign (right, down,
// down-right, down-left); each is replicated once per valid origin cell
// (one whose offset neighbour is still on the grid) instead of hand-listing
// all ~272 individual cell pairs.
const DIRECTIONS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const kingPairConstraints = DIRECTIONS.flatMap(([dRow, dCol]) => {
  const targets = graph.cells().filter(cell => graph.step(cell, dRow, dCol) !== null);
  // The Replicate origin must itself have a valid offset neighbour on the
  // grid (down-left of a top-row cell runs off it), so pick the first
  // target cell as the template's own origin rather than assuming 'R1C1'.
  const origin = targets[0];
  const template = new Pair(
    noKingClashKey, 'no 358 king clash', origin, graph.step(origin, dRow, dCol));
  const targetBitset = Replicate.encodeTargetCells(targets, origin, graph);
  // graph.makeReplicate() hardcodes origin to the grid's first cell (R1C1),
  // which has no valid down-left neighbour; this direction needs a real
  // origin cell with a valid offset neighbour, so Replicate is built directly.
  // lint-ok: bare-replicate-constructor
  return new Replicate([template], targetBitset, origin);
});

return [
  new Shape('9x9'),
  ...givens.map(([cell, v]) => new Given(cell, v)),
  ...kingPairConstraints,
];
