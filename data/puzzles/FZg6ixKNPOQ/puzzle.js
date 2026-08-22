// Title: The Miracle Reborn
// Author: Matyas Martinka
// Video: https://www.youtube.com/watch?v=FZg6ixKNPOQ
// Source: https://app.crackingthecryptic.com/sudoku/2ftJ4jLbDG

// Normal sudoku rules apply (default 9x9 rows/cols/boxes).
// Anti-knight and anti-king: no repeated digit a knight's or king's move away.
// Column indexing: for every column N in a row, the digit there gives the
// column of digit N in that same row (R3C2=5 => R3C5=2). This holds for
// every column of every row, so every grid cell is passed as a control cell
// for `Indexing('C', ...)`, which builds one full-row indexing handler per
// control cell (js/solver/sudoku_builder.js `case 'Indexing'`).
const graph = cellGraph('9x9');

return [
  new AntiKnight(),
  new AntiKing(),
  new Indexing('C', ...graph.cells()),
  new Given('R5C3', 1),
  new Given('R6C7', 2),
];
