// Title: Sandwich-X-Sums, King and Queen Sudoku
// Author: Alexander Rappa
// Video: https://www.youtube.com/watch?v=74j7xJ1i9hU
// Source: https://cracking-the-cryptic.web.app/sudoku/N6Jdp8Ndgp

// Normal sudoku (rows/columns/boxes). One given (R8C2=5). Every outside-grid
// clue is read as BOTH an X-Sums clue and a Sandwich clue for its row/column
// (rules 1-2). King: AntiKing (no equal digits a king's move apart, all
// values, rule 3). Queen: digit 9 may not repeat anywhere on a shared
// diagonal, of either direction, at any distance (rule 4) -- not just the two
// main diagonals, so the built-in `Diagonal` class (main/anti only, all
// values) does not fit; encoded below as one small NFA per maximal diagonal
// line, scoped to the value 9.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// Outside clues (5 total). Each pair reads the same row/column, X-Sums
// directional (from the clue's side into the grid), Sandwich
// order-independent.
const outsideClues = [
  // [value, cells from the clue's side into the grid]
  [16, graph.row('R3C1')],                         // left of R3
  [10, graph.row('R4C1').slice().reverse()],        // right of R4
  [30, graph.column('R1C3')],                       // top of C3
  [3, graph.column('R1C4')],                        // top of C4
  [17, graph.column('R1C7')],                       // top of C7
];

const xSums = outsideClues.map(
  ([value, cells]) => XSum.fromCells(value, cells, geometry));
const sandwiches = outsideClues.map(
  ([value, cells]) => Sandwich.fromCells(value, cells, geometry));

// Queen: at most one 9 per maximal diagonal line. One diagonal group per
// direction, gathered from each line's own extreme corner so every diagonal
// (length >= 2) is covered exactly once.
function diagonalLines(dRow, dCol) {
  const seen = new Set();
  const lines = [];
  for (const cell of graph.cells()) {
    const back = graph.ray(cell, -dRow, -dCol);
    const start = back[back.length - 1];
    if (seen.has(start)) continue;
    seen.add(start);
    const line = graph.ray(start, dRow, dCol);
    if (line.length >= 2) lines.push(line);
  }
  return lines;
}
const diagonals = [...diagonalLines(1, 1), ...diagonalLines(1, -1)];

// State: has a 9 already been seen on this diagonal? A second 9 has no
// transition (rejected). accept is unconditional -- rejection is entirely
// mid-scan, at the second 9.
const noRepeatNineSpec = NFA.encodeSpec({
  startState: { seenNine: false },
  transition: ({ seenNine }, value) => {
    if (value !== 9) return { seenNine };
    if (seenNine) return undefined;
    return { seenNine: true };
  },
  accept: () => true,
}, 9);
const queenNines = diagonals.map(
  line => new NFA(noRepeatNineSpec, 'Queen9', ...line));

return [
  new Shape('9x9'),
  new Given('R8C2', 5),
  new AntiKing(),
  ...xSums,
  ...sandwiches,
  ...queenNines,
];
