// Title: January 11, 2023: Mathception
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=qSatXlZTaU0
// Source: https://tinyurl.com/yc72yj2d

// Normal sudoku, plus:
// - Killer cages: digits in a cage don't repeat and sum to the cage total.
// - X-Sum outside clues: on each of rows/columns 3, 5, 7 (both ends), the sum
//   of the first X digits from the clue's side equals the clue, where X is
//   the value of the first (adjacent) digit itself.
// Cage cells and X-Sum clue values are transcribed from the puzzle's drawn
// cages and outside-grid clue badges.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

const cages = [
  new Cage(8, 'R5C7', 'R5C8'),
  new Cage(14, 'R5C2', 'R5C3'),
  new Cage(7, 'R3C1', 'R3C2'),
  new Cage(14, 'R3C8', 'R3C9'),
  new Cage(7, 'R7C8', 'R7C9'),
  new Cage(4, 'R7C1', 'R7C2'),
  new Cage(15, 'R7C3', 'R8C3'),
  new Cage(12, 'R7C5', 'R8C5'),
  new Cage(17, 'R7C7', 'R8C7'),
  new Cage(9, 'R2C7', 'R3C7'),
  new Cage(7, 'R2C5', 'R3C5'),
  new Cage(5, 'R2C3', 'R3C3'),
];

// Each X-Sum clue is built from its line of cells, starting adjacent to the
// clue and continuing away from it, per the rules text.
const xsums = [
  XSum.fromCells(8, graph.ray('R1C3', 1, 0), geometry),   // top of column 3
  XSum.fromCells(42, graph.ray('R1C5', 1, 0), geometry),  // top of column 5
  XSum.fromCells(18, graph.ray('R1C7', 1, 0), geometry),  // top of column 7
  XSum.fromCells(9, graph.ray('R9C3', -1, 0), geometry),  // bottom of column 3
  XSum.fromCells(15, graph.ray('R9C5', -1, 0), geometry), // bottom of column 5
  XSum.fromCells(27, graph.ray('R9C7', -1, 0), geometry), // bottom of column 7
  XSum.fromCells(15, graph.ray('R3C1', 0, 1), geometry),  // left of row 3
  XSum.fromCells(10, graph.ray('R5C1', 0, 1), geometry),  // left of row 5
  XSum.fromCells(12, graph.ray('R7C1', 0, 1), geometry),  // left of row 7
  XSum.fromCells(34, graph.ray('R3C9', 0, -1), geometry), // right of row 3
  XSum.fromCells(19, graph.ray('R5C9', 0, -1), geometry), // right of row 5
  XSum.fromCells(27, graph.ray('R7C9', 0, -1), geometry), // right of row 7
];

return [
  new Shape('9x9'),
  ...cages,
  ...xsums,
];
