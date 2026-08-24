// Title: Little Nuts
// Author: Qodec
// Video: https://www.youtube.com/watch?v=AxFvFdEuiA0
// Source: https://app.crackingthecryptic.com/sudoku/Fqp4G8Q8mb

// Standard sudoku (rows, columns, default 3x3 boxes), no givens. Four little
// killer (diagonal-sum) clues, digits may repeat along a diagonal. Ten cells
// with a grey circle must hold an odd digit, encoded as a multi-value Given.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Grey-circle cells (odd digit), from the underlays list.
const oddCells = [
  'R1C1', 'R1C6', 'R1C7', 'R3C7', 'R4C1',
  'R4C3', 'R5C5', 'R5C6', 'R8C9', 'R9C9',
];

return [
  new Shape('9x9'),

  // Outside diagonal "55" above column 2, walking down-right from R1C3.
  LittleKiller.fromCells(55, graph.ray('R1C3', 1, 1), geometry),
  // Outside diagonal "31" left of row 4, walking down-right from R5C1.
  LittleKiller.fromCells(31, graph.ray('R5C1', 1, 1), geometry),
  // Outside diagonal "13" left of row 6, walking up-right from R5C1.
  LittleKiller.fromCells(13, graph.ray('R5C1', -1, 1), geometry),
  // Outside diagonal "15" below column 2, walking up-right from R9C3.
  LittleKiller.fromCells(15, graph.ray('R9C3', -1, 1), geometry),

  ...oddCells.map(cell => new Given(cell, 1, 3, 5, 7, 9)),
];
