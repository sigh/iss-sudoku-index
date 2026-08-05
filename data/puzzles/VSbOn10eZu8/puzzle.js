// Title: 12 12
// Author: Florian Wortmann
// Video: https://www.youtube.com/watch?v=VSbOn10eZu8
// Source: https://app.crackingthecryptic.com/sudoku/F4nDB4d9h7

// Normal Sudoku rules apply. Equal digits cannot be a knight's move or a king's
// move apart. Orthogonally adjacent digits cannot sum to 5 or 10.
const graph = cellGraph('9x9');
const allowedAdjacentSum = Pair.fnToKey((a, b) => a + b !== 5 && a + b !== 10, 9);
const horizontalStarts = graph.cells().filter(cell => graph.step(cell, 0, 1));
const verticalStarts = graph.cells().filter(cell => graph.step(cell, 1, 0));

return [
  new Shape('9x9'),
  // The four givens transcribed from the source grid.
  new Given('R4C3', 1),
  new Given('R5C4', 2),
  new Given('R5C6', 1),
  new Given('R6C7', 2),
  new AntiKnight(),
  new AntiKing(),
  // One template is translated to every right/down edge start, covering each
  // orthogonal adjacency once.
  graph.makeReplicate(
    new Pair(allowedAdjacentSum, '', 'R1C1', 'R1C2'), horizontalStarts),
  graph.makeReplicate(
    new Pair(allowedAdjacentSum, '', 'R1C1', 'R2C1'), verticalStarts),
];
