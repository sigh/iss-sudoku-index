// Title: Meandering Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=glCWGqNR2U0
// Source: https://tinyurl.com/39y9bpcw

// Normal Sudoku rules apply. In each blue region it must be possible to draw
// a path visiting the region's cells in the order of their values -- the
// cell holding 1, then the cell holding 2, ..., then the cell holding 9 --
// moving only horizontally/vertically between consecutive steps.
//
// A box is a permutation of 1-9, so "a path 1->9 exists" holds exactly when
// every pair of cells that are NOT orthogonally adjacent avoid holding
// consecutive values: if two non-adjacent cells held consecutive values v
// and v+1, the path could not step directly between them; and conversely,
// once every non-adjacent pair avoids consecutive values, every pair that
// *does* hold consecutive values is forced to be adjacent, which is exactly
// the walk from 1 up to 9. So the rule is encoded as one non-consecutive
// `Pair` per non-adjacent cell pair within each blue box, computed below
// from the box geometry rather than hand-enumerated.
//
// The blue regions are the three diagonal boxes -- top-left, centre, and
// bottom-right -- read from the puzzle's shaded cells (fill #D0D0FF).

const givens = [
  ['R1C4', 2], ['R1C5', 3],
  ['R2C2', 1], ['R2C4', 5], ['R2C8', 2],
  ['R3C7', 6],
  ['R4C1', 1], ['R4C2', 3],
  ['R5C2', 9], ['R5C5', 5], ['R5C8', 3],
  ['R6C8', 7], ['R6C9', 4],
  ['R7C3', 6],
  ['R8C2', 5], ['R8C6', 3], ['R8C8', 9],
  ['R9C5', 9], ['R9C6', 5],
];

// Top-left corner of each blue (meandering) box.
const blueBoxOrigins = [[1, 1], [4, 4], [7, 7]];

// Two cells share a value pair that must NOT be consecutive integers.
const nonConsecutiveKey = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);

const meanderPairs = [];
for (const [r0, c0] of blueBoxOrigins) {
  const cells = [];
  for (let dr = 0; dr < 3; dr++) {
    for (let dc = 0; dc < 3; dc++) {
      cells.push({ row: r0 + dr, col: c0 + dc });
    }
  }
  for (let i = 0; i < cells.length; i++) {
    for (let j = i + 1; j < cells.length; j++) {
      const a = cells[i], b = cells[j];
      const orthAdjacent =
        (a.row === b.row && Math.abs(a.col - b.col) === 1) ||
        (a.col === b.col && Math.abs(a.row - b.row) === 1);
      if (!orthAdjacent) {
        meanderPairs.push(new Pair(
          nonConsecutiveKey, 'Meander', makeCellId(a), makeCellId(b)));
      }
    }
  }
}

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...meanderPairs,
];
