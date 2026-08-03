// Title: Crevices
// Author: Celery
// Video: https://www.youtube.com/watch?v=38_raz_RUj0
// Source: https://app.crackingthecryptic.com/sudoku/TrP3GQTJ7h

// Normal sudoku rules apply (default row/column/box all-different, no givens).
// Blue lines: box borders (the default 3x3 boxes) divide each line into
// segments with equal sum; a segment that re-enters an already-visited box
// sums to the same value too; different lines may have different sums.
// RegionSumLine implements exactly this semantics against the default boxes.
//
// Lines are listed in source draw order, except the last: two of the nine
// drawn strokes (a 5-cell line through box 3, and a 3-cell line ending at
// R3C7) touch at the shared cell R3C7, so they are treated as one line whose
// box-3 segment is the union of both strokes' box-3 cells. RegionSumLine
// splits its cell list by box on consecutive cells, so listing box 2's two
// cells first and all five box-3 cells contiguously afterwards (order among
// same-box cells does not affect the sum) reproduces that segment split.
const lines = [
  ['R6C9', 'R7C9', 'R8C8', 'R9C7'],
  ['R8C7', 'R7C7', 'R6C6', 'R5C7', 'R5C8'],
  ['R7C8', 'R6C8', 'R5C9'],
  ['R8C5', 'R9C4', 'R9C3', 'R9C2', 'R8C3', 'R7C4', 'R6C5', 'R5C5'],
  ['R5C1', 'R6C2', 'R7C3'],
  ['R6C3', 'R5C3', 'R4C3', 'R3C2'],
  ['R2C1', 'R1C1', 'R1C2', 'R1C3', 'R2C4', 'R1C5'],
  ['R3C5', 'R3C6', 'R3C7', 'R2C7', 'R1C7', 'R3C8', 'R3C9'],
];

return [
  new Shape('9x9'),
  ...lines.map(cells => new RegionSumLine(...cells)),
];
