// Title: 159 RSL
// Author: Blobz
// Video: https://www.youtube.com/watch?v=XFPaeHQsgHs
// Source: https://app.crackingthecryptic.com/sudoku/mR3GPBqGnT

// 159: for a cell in column 1, 5, or 9 with value V, digit C (the column's own
// number: 1, 5 or 9) sits at column V of that row (r4c1=6 => r4c6=1).
// `Indexing('C', ...cells)` derives C from each passed cell's own column, so
// restricting the cell set to columns 1, 5, 9 -- the columns the rules text
// names, matching the red-highlighted cells in the source -- scopes the rule
// to exactly those three digits.
// Region Sum Lines: equal sum per box segment on each blue line.

const indexingCells = [];
for (const col of [1, 5, 9]) {
  for (let row = 1; row <= 9; row++) {
    indexingCells.push(makeCellId(row, col));
  }
}

return [
  new Shape('9x9'),

  new Indexing('C', ...indexingCells),

  // Region sum lines, cells from the source `lines` geometry.
  new RegionSumLine('R4C1', 'R3C2'),
  new RegionSumLine('R6C9', 'R7C8'),
  new RegionSumLine('R6C6', 'R5C7', 'R6C8'),
  new RegionSumLine('R5C3', 'R4C3', 'R4C4'),
  new RegionSumLine(
    'R9C5', 'R8C5', 'R8C4', 'R7C3', 'R7C2', 'R6C2', 'R6C3', 'R6C4', 'R5C4',
    'R5C5', 'R5C6', 'R4C6', 'R4C7', 'R4C8', 'R3C8', 'R3C7', 'R2C6', 'R2C5',
    'R1C5'),
];
