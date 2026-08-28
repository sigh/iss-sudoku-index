// Title: Nonconsecutive Sandwich Killer
// Author: spxtr
// Video: https://www.youtube.com/watch?v=lG5XPsGoxBU
// Source: https://cracking-the-cryptic.web.app/sudoku/nmrpHGn4FR

// Standard 9x9 sudoku (default regions: rows, columns, boxes). No givens.
// Nonconsecutive applies to every orthogonally adjacent pair in the grid
// (AntiConsecutive, global). Sandwich clues give the sum strictly between the
// 1 and the 9 in that row/column. Killer cages sum to their total with no
// repeated digit.
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Cage cells transcribed from the payload's `cages` array.
const cages = [
  [13, ['R1C4', 'R1C5', 'R1C6']],
  [25, ['R2C2', 'R3C2', 'R3C3', 'R2C3']],
  [23, ['R4C1', 'R5C1', 'R6C1', 'R7C1']],
  [23, ['R5C2', 'R6C2', 'R7C2', 'R7C3']],
  [20, ['R8C2', 'R9C2', 'R9C3', 'R8C3']],
  [21, ['R7C4', 'R7C5', 'R7C6', 'R7C7', 'R6C7']],
  [14, ['R4C7', 'R5C7']],
  [14, ['R2C8', 'R3C8', 'R3C9', 'R2C9']],
  [22, ['R8C8', 'R9C8', 'R9C9', 'R8C9']],
];

// Sandwich (outside) clues, from the payload's overlay text boxes.
const sandwiches = [
  Sandwich.fromCells(20, graph.column(1), geometry),
  Sandwich.fromCells(35, graph.column(7), geometry),
  Sandwich.fromCells(21, graph.row(1), geometry),
];

return [
  new Shape('9x9'),
  ...cages.map(([value, cells]) => new Cage(value, ...cells)),
  ...sandwiches,
  new AntiConsecutive(),
];
