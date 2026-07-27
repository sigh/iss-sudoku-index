// Title: Pair of Docks
// Author: Kennet's Dad
// Video: https://www.youtube.com/watch?v=0YU89jcMzcU
// Source: https://sudokupad.app/ch4h3yxrhh

// Standard 6x6 sudoku (2x3 boxes, matches the drawn regions), plus:
// orthogonally adjacent digits cannot be consecutive; each purple line's
// digits form a non-repeating consecutive set in any order (Renban); and the
// two off-grid diagonal arrows each sum their in-grid diagonal to the same
// (unstated) total X, enforced as equal, unknown segment sums.
//
// Line cells from the drawn waypoints (three separate strokes):
const renbans = [
  new Renban('R1C1', 'R1C2', 'R2C3'),
  new Renban('R2C5', 'R2C4', 'R3C3'),
  new Renban('R5C3', 'R6C2'),
];

// Diagonal cells walked from each off-grid arrow's anchor point to the grid
// edge it runs into: arrow 1 is anchored above the R1C4/R1C5 corner and
// points down-right (R1C4-R2C5-R3C6); arrow 2 is anchored left of the
// R5C1/R6C1 corner and points down-right (R5C1-R6C2).
return [
  new Shape('6x6'),
  new AntiConsecutive(),
  ...renbans,
  new EqualSum(['R1C4', 'R2C5', 'R3C6'], ['R5C1', 'R6C2']),
];
