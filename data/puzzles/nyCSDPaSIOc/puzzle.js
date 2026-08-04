// Title: 159 Bullseye
// Author: Luda3
// Video: https://www.youtube.com/watch?v=nyCSDPaSIOc
// Source: https://app.crackingthecryptic.com/sudoku/nrGFdm38Mb

// Normal sudoku rules apply on the 9x9 grid with standard 3x3 boxes; no
// givens. Columns 1, 5 and 9 are shaded to mark them as the special columns
// for the indexing rule below; the shading is decorative and adds nothing
// else.
//
// Each digit in columns 1, 5 and 9 indicates the column location of the
// numbers 1, 5 and 9 (respectively) in the row in which it appears --
// `Indexing('C', ...)` states exactly this for each control cell: a column-C
// cell holding value V forces the cell at (row, V) to hold value C.
//
// A clue outside the grid gives the sum of the first N digits of the row or
// column, read from the clue's direction, where N is the first digit from
// that direction -- `XSum`.
//
// Digits on a purple line form a consecutive set, in any order -- `Renban`.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Every cell in columns 1, 5, 9 (27 cells total) is a control cell for the
// column-indexing rule.
const indexingCells = [1, 5, 9].flatMap(col => graph.column(col));

return [
  new Shape('9x9'),

  new Indexing('C', ...indexingCells),

  // Outside sum clues, cell order read from each badge's direction into the
  // grid: above/below column 5, left/right of row 5.
  XSum.fromCells(18, graph.ray('R1C5', 1, 0), geometry),   // above column 5
  XSum.fromCells(19, graph.ray('R9C5', -1, 0), geometry),  // below column 5
  XSum.fromCells(20, graph.ray('R5C1', 0, 1), geometry),   // left of row 5
  XSum.fromCells(30, graph.ray('R5C9', 0, -1), geometry),  // right of row 5

  // Renban lines (cell lists transcribed from the drawn purple lines).
  new Renban('R3C1', 'R2C2', 'R3C3', 'R4C4', 'R3C5', 'R2C6'),
  new Renban('R4C1', 'R5C2', 'R4C3'),
  new Renban('R8C1', 'R9C1', 'R9C2', 'R8C3'),
  new Renban('R6C8', 'R6C9', 'R7C9'),
  new Renban('R8C9', 'R7C8', 'R6C7', 'R5C8', 'R4C9'),
];
