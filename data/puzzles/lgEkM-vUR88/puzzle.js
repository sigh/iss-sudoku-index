// Title: Miracle Junior
// Author: Just Kirb
// Video: https://www.youtube.com/watch?v=lgEkM-vUR88
// Source: https://app.crackingthecryptic.com/sudoku/BLJqNdB389

// Normal sudoku, plus: no two cells a king's move apart share a digit; no two
// cells a knight's move apart share a digit; no orthogonally adjacent pair of
// cells (domino) sums to 5 or 10.

// Every horizontal and vertical grid edge, as two Replicate templates (one
// per offset: right-neighbour and down-neighbour), stamped onto every origin
// cell that has that neighbour on the grid.
const graph = cellGraph('9x9');
const notFiveOrTen = Pair.fnToKey((a, b) => a + b !== 5 && a + b !== 10, 9);
const rightOrigins = graph.cells().filter(c => graph.step(c, 0, 1));
const downOrigins = graph.cells().filter(c => graph.step(c, 1, 0));

const rightDominoes = graph.makeReplicate(
  new Pair(notFiveOrTen, '', 'R1C1', 'R1C2'), rightOrigins);
const downDominoes = graph.makeReplicate(
  new Pair(notFiveOrTen, '', 'R1C1', 'R2C1'), downOrigins);

return [
  new Shape('9x9'),

  // Givens (payload cells[row][col].value, 0-indexed converted to 1-indexed).
  new Given('R3C6', 3),
  new Given('R4C7', 1),
  new Given('R6C5', 2),

  new AntiKing(),
  new AntiKnight(),
  rightDominoes,
  downDominoes,
];
