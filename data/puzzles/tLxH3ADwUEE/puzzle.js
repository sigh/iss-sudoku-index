// Title: A 'Majestic' Queen Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=tLxH3ADwUEE
// Source: https://cracking-the-cryptic.web.app/sudoku/gdN9RgNqBB

// Normal sudoku (rows/columns/boxes) plus the 19 givens. Queen: digit 9 may
// not repeat anywhere on a shared diagonal, of either direction, at any
// distance -- not just the two main diagonals, so the built-in `Diagonal`
// class (main/anti only, all values) does not fit; encoded below as one
// small NFA per maximal diagonal line, scoped to the value 9.

const graph = cellGraph('9x9');

// Givens (19 total). From the payload's `cells[row][col].value` entries.
const givens = [
  ['R2C4', 2], ['R2C5', 1], ['R2C6', 3],
  ['R3C3', 1], ['R3C7', 4],
  ['R4C2', 8], ['R4C8', 3],
  ['R5C2', 6], ['R5C5', 2], ['R5C8', 1],
  ['R6C2', 4], ['R6C6', 5], ['R6C8', 2],
  ['R7C3', 7], ['R7C7', 1],
  ['R8C4', 3], ['R8C5', 4], ['R8C6', 8], ['R8C8', 6],
];

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
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...queenNines,
];
