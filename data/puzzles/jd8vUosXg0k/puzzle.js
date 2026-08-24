// Title: Miracle Squares
// Author: Peter Veenis
// Video: https://www.youtube.com/watch?v=jd8vUosXg0k
// Source: https://app.crackingthecryptic.com/sudoku/HP83P4q2Pr
//
// Normal sudoku rules apply (Shape's default rows/columns/boxes). Digits
// joined by an X sum to 10, and by a V sum to 5 -- X/V bind grid-adjacent
// dominoes only. The rules text explicitly says there is no negative
// constraint: an unmarked domino may still sum to 5 or 10.
//
// Three boxes (top-left, centre, bottom-right) are drawn shaded yellow. For
// every orthogonally adjacent pair of cells that are both yellow, the rules
// forbid: a sum of 5, a sum of 10, a difference of 1 (consecutive), and a
// 1:2 ratio (one digit double the other). No dedicated class covers this
// four-way negative, so it is one `Pair` per such edge, keyed by a predicate
// combining all four exclusions.

const graph = cellGraph('9x9');

// Drawn gold cells (27 total): the three diagonal boxes, R1C1-R3C3,
// R4C4-R6C6, R7C7-R9C9.
const yellowCells = [
  'R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R3C3',
  'R4C4', 'R4C5', 'R4C6', 'R5C4', 'R5C5', 'R5C6', 'R6C4', 'R6C5', 'R6C6',
  'R7C7', 'R7C8', 'R7C9', 'R8C7', 'R8C8', 'R8C9', 'R9C7', 'R9C8', 'R9C9',
];
const yellowSet = new Set(yellowCells);

const yellowKey = Pair.fnToKey(
  (a, b) => a + b !== 5 && a + b !== 10 && Math.abs(a - b) !== 1 &&
    a !== 2 * b && b !== 2 * a,
  9);

// Walk right/down from each yellow cell so every grid-adjacent yellow-yellow
// edge is added exactly once.
const yellowPairs = [];
for (const cell of yellowCells) {
  for (const [dRow, dCol] of [[0, 1], [1, 0]]) {
    const neighbour = graph.step(cell, dRow, dCol);
    if (neighbour && yellowSet.has(neighbour)) {
      yellowPairs.push(new Pair(yellowKey, 'yellow pair', cell, neighbour));
    }
  }
}

// X dominoes (sum to 10); cell pairs from the drawn "X" edge markers.
const xDominoes = [
  ['R2C5', 'R2C6'],
  ['R3C5', 'R3C6'],
  ['R5C3', 'R6C3'],
  ['R7C4', 'R8C4'],
  ['R7C6', 'R8C6'],
  ['R5C8', 'R6C8'],
];

// V dominoes (sum to 5); cell pairs from the drawn "V" edge markers.
const vDominoes = [
  ['R2C7', 'R2C8'],
  ['R4C2', 'R5C2'],
  ['R4C3', 'R5C3'],
  ['R8C5', 'R8C6'],
];

return [
  new Shape('9x9'),
  ...xDominoes.map(([a, b]) => new X(a, b)),
  ...vDominoes.map(([a, b]) => new V(a, b)),
  ...yellowPairs,
];
