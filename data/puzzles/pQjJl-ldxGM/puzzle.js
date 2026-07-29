// Title: Little Killer Sandwiches
// Author: jreg
// Video: https://www.youtube.com/watch?v=pQjJl-ldxGM
// Source: https://app.crackingthecryptic.com/eennxzmcfl

// Normal 9x9 Sudoku, anti-king, and the given 8 at R3C7 apply.
// Each outside number is both its drawn diagonal's Little Killer sum and the
// sandwich sum for its row or column. The top-left 36 has no sandwich meaning.
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),
  new Given('R3C7', 8),
  new AntiKing(),

  // Drawn diagonal paths from the six outside clues.
  LittleKiller.fromCells(36, graph.ray('R1C1', 1, 1), geometry),
  LittleKiller.fromCells(33, graph.ray('R6C1', 1, 1), geometry),
  LittleKiller.fromCells(33, graph.ray('R6C9', 1, -1), geometry),
  new Sum(5, 'R9C9'),
  LittleKiller.fromCells(22, graph.ray('R6C9', -1, -1), geometry),
  LittleKiller.fromCells(7, graph.ray('R1C4', 1, -1), geometry),

  // The two R6 clues give the same sandwich sum, so one constraint covers both.
  Sandwich.fromCells(33, graph.row(5), geometry),
  Sandwich.fromCells(5, graph.row(8), geometry),
  Sandwich.fromCells(22, graph.row(7), geometry),
  Sandwich.fromCells(7, graph.column(5), geometry),
];
