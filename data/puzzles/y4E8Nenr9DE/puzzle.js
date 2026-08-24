// Title: X-Sums Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=y4E8Nenr9DE
// Source: https://app.crackingthecryptic.com/sudoku/qTJppjtp3b

// Normal sudoku rules apply (standard 3x3 boxes; no given digits). Every
// clue in the puzzle is an outside X-Sum badge: the sum of the first X
// digits in the corresponding direction, where X is the first digit placed
// in that direction. All 11 drawn badges read the same value, 28.
const geometry = cellGeometry('9x9');
const clueCells = (axis, index, direction) => Array.from({length: 9}, (_, offset) => (
  axis === 'C'
    ? makeCellId(direction > 0 ? offset + 1 : 9 - offset, index)
    : makeCellId(index, direction > 0 ? offset + 1 : 9 - offset)
));
const xSum = (axis, index, direction) => XSum.fromCells(28, clueCells(axis, index, direction), geometry);

return [
  new Shape('9x9'),
  xSum('C', 7, 1),   // top C7, reads down
  xSum('R', 1, 1),   // left R1, reads right
  xSum('R', 1, -1),  // right R1, reads left
  xSum('R', 3, 1),   // left R3, reads right
  xSum('R', 4, 1),   // left R4, reads right
  xSum('R', 4, -1),  // right R4, reads left
  xSum('R', 5, -1),  // right R5, reads left
  xSum('R', 7, 1),   // left R7, reads right
  xSum('R', 8, -1),  // right R8, reads left
  xSum('C', 3, -1),  // bottom C3, reads up
  xSum('C', 4, -1),  // bottom C4, reads up
];
