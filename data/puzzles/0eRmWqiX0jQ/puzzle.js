// Title: Odd Pentomino/Killer/X-Sums
// Author: Dying Flutchman
// Video: https://www.youtube.com/watch?v=0eRmWqiX0jQ
// Source: https://cracking-the-cryptic.web.app/sudoku/LhBdm9D7Nf

// Normal sudoku rows/columns/boxes (default Shape('9x9') regions), plus 12
// outside X-Sum clues: the sum of the first X cells seen from the clue,
// where X is the value of the first (nearest) cell.
//
// OMITTED: the rules also require the whole grid to be tiled by the twelve
// distinct free pentominoes (each used once, crossing a box boundary) plus
// tetrominoes filling the rest, with per-shape all-different digits and an
// odd/even sum by shape size, and three drawn bar-line edges forced as
// shape boundaries. That rule needs both an unanchored/unbounded region
// partition and component-shape congruence up to rotation/reflection --
// ISS has no primitive for either. It is not encoded here.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const xsums = [
  // [value, ray start, dRow, dCol] -- cell order runs from the clue inward.
  [17, 'R1C1', 1, 0],   // top of column 1, downward
  [10, 'R1C9', 1, 0],   // top of column 9, downward
  [20, 'R1C1', 0, 1],   // left of row 1, rightward
  [21, 'R2C1', 0, 1],   // left of row 2, rightward
  [7, 'R4C1', 0, 1],    // left of row 4, rightward
  [12, 'R1C9', 0, -1],  // right of row 1, leftward
  [36, 'R5C9', 0, -1],  // right of row 5, leftward
  [6, 'R6C9', 0, -1],   // right of row 6, leftward
  [12, 'R9C9', 0, -1],  // right of row 9, leftward
  [34, 'R9C2', -1, 0],  // bottom of column 2, upward
  [29, 'R9C3', -1, 0],  // bottom of column 3, upward
  [8, 'R9C8', -1, 0],   // bottom of column 8, upward
];

return [
  new Shape('9x9'),
  ...xsums.map(([value, start, dRow, dCol]) =>
    XSum.fromCells(value, graph.ray(start, dRow, dCol), geometry)),
];
