// Title: TectonicPlus
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=nztupTYjw08
// Source: https://app.crackingthecryptic.com/MhP4ft29rq

// Rules: digits 1-5 appear once each in every one of the ten marked 5-cell
// regions -- there is no row or column rule at all, so the grid is built on
// a Raw shape and every rule below is stated explicitly. No digit repeats
// within a chess king's move of an identical digit. No three orthogonally or
// diagonally adjacent cells hold an arithmetic sequence in their drawn order
// (123, 531, 345 forbidden; 132, 513, 245 allowed) -- arithmetic progression
// is symmetric under reversal, so one scan direction per line suffices.

const shape = new Shape('5x10', 5, 'Raw');
const graph = cellGraph(shape);

// Regions -- transcribed from the payload's `regions` array (1-indexed
// [row, col] pairs here; the payload itself is 0-indexed). Column 10 needs
// makeCellId rather than a literal `R#C10` id (base-17 column letters past
// 9).
const regionCoords = [
  [[1,1], [1,2], [2,2], [2,3], [3,2]],
  [[1,3], [1,4], [1,5], [2,4], [3,4]],
  [[2,5], [2,6], [1,6], [1,7], [1,8]],
  [[3,7], [2,7], [2,8], [2,9], [1,9]],
  [[1,10], [2,10], [3,10], [3,9], [4,10]],
  [[2,1], [3,1], [4,1], [5,1], [5,2]],
  [[4,2], [3,3], [4,3], [5,3], [4,4]],
  [[3,5], [4,5], [3,6], [4,6], [4,7]],
  [[3,8], [4,8], [4,9], [5,9], [5,10]],
  [[5,4], [5,5], [5,6], [5,7], [5,8]],
];
const regions = regionCoords.map(
  coords => coords.map(([r, c]) => makeCellId(r, c)));
const regionConstraints = regions.map(cells => new AllDifferent(...cells));

// Givens -- transcribed from the payload's per-cell `value` entries.
const givens = [
  new Given('R2C3', 1),
  new Given('R3C2', 5),
  new Given('R3C6', 3),
  new Given('R4C9', 1),
];

// AntiKing is a Sudoku-grid-only layout checkbox and throws on this Raw
// shape, so the rule is stated explicitly: one inequality per unordered
// king-adjacent cell pair (each of the 4 step directions below visits every
// pair exactly once, since the reverse direction from the other cell would
// revisit it).
const antiKingPairs = [];
for (const [dRow, dCol] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
  for (const cell of graph.cells()) {
    const other = graph.step(cell, dRow, dCol);
    if (other !== null) antiKingPairs.push(new AllDifferent(cell, other));
  }
}

// One NFA per maximal line (rows, columns, and both diagonal directions),
// carrying the previous two values; a transition completing an arithmetic
// run (value - prev1 === prev1 - prev2) is rejected.
const apSpec = NFA.encodeSpec({
  startState: { prev2: null, prev1: null },
  transition: ({ prev2, prev1 }, value) => {
    if (prev1 === null) return { prev2: null, prev1: value };
    if (prev2 === null) return { prev2: prev1, prev1: value };
    if (value - prev1 === prev1 - prev2) return undefined;
    return { prev2: prev1, prev1: value };
  },
  accept: () => true,
}, 5);

const lineConstraints = [];
for (const [dRow, dCol] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
  for (const cell of graph.cells()) {
    if (graph.step(cell, -dRow, -dCol) !== null) continue;  // not a line start
    const line = graph.ray(cell, dRow, dCol);
    if (line.length >= 3) {
      lineConstraints.push(new NFA(apSpec, 'no-ap', ...line));
    }
  }
}

return [
  shape,
  ...regionConstraints,
  ...givens,
  ...antiKingPairs,
  ...lineConstraints,
];
