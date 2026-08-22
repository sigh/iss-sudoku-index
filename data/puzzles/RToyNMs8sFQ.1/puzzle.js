// Title: Small-scale Samurai
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=RToyNMs8sFQ
// Source: https://app.crackingthecryptic.com/sudoku/68NtD2Q6B7

// Two overlapping 6x6 sudokus (values 1-6, 2x3 boxes) on a 10x9 canvas:
// Grid A occupies rows 1-6, cols 1-6; Grid B occupies rows 5-10, cols 4-9;
// they share the box at rows 5-6, cols 4-6. The remaining 24 cells (rows 1-4
// cols 7-9, and rows 7-10 cols 1-3) are drawn grey and are not part of either
// grid, so they carry no sudoku rule -- they are pinned to a fixed value
// below purely so the Raw grid (which has no holes) does not contribute a
// free, unconstrained Latin block to the search.
// Because each grid's rows/columns only span part of the canvas, and the two
// grids overlap, this cannot use the default Sudoku grid type (whose row/
// column/box groups run the full canvas): built on Raw, with every row,
// column and box of each 6x6 grid stated explicitly below.
// The digits along an arrow sum to the digit in its attached circle (the
// arrow's first/bulb cell); arm cells may repeat.

const shape = new Shape('10x9', '1-6', 'Raw');

const gridA = { rowStart: 1, rowEnd: 6, colStart: 1, colEnd: 6 };
const gridB = { rowStart: 5, rowEnd: 10, colStart: 4, colEnd: 9 };

function houses(grid) {
  const rows = [];
  for (let r = grid.rowStart; r <= grid.rowEnd; r++) {
    const cells = [];
    for (let c = grid.colStart; c <= grid.colEnd; c++) cells.push(makeCellId(r, c));
    rows.push(cells);
  }
  const cols = [];
  for (let c = grid.colStart; c <= grid.colEnd; c++) {
    const cells = [];
    for (let r = grid.rowStart; r <= grid.rowEnd; r++) cells.push(makeCellId(r, c));
    cols.push(cells);
  }
  const boxes = [];
  for (let br = grid.rowStart; br <= grid.rowEnd; br += 2) {
    for (let bc = grid.colStart; bc <= grid.colEnd; bc += 3) {
      const cells = [];
      for (let dr = 0; dr < 2; dr++) {
        for (let dc = 0; dc < 3; dc++) cells.push(makeCellId(br + dr, bc + dc));
      }
      boxes.push(cells);
    }
  }
  return [...rows, ...cols, ...boxes];
}

const houseConstraints = [
  ...houses(gridA),
  ...houses(gridB),
].map((cells) => new AllDifferent(...cells));

// Cells outside both 6x6 grids (the grey-shaded 24 cells): pin to a fixed
// value since Raw grids have no holes and nothing else constrains them.
const blockedCells = [];
for (let r = 1; r <= 10; r++) {
  for (let c = 1; c <= 9; c++) {
    const inA = r >= gridA.rowStart && r <= gridA.rowEnd && c >= gridA.colStart && c <= gridA.colEnd;
    const inB = r >= gridB.rowStart && r <= gridB.rowEnd && c >= gridB.colStart && c <= gridB.colEnd;
    if (!inA && !inB) blockedCells.push(makeCellId(r, c));
  }
}
const blockedPins = blockedCells.map((cell) => new Given(cell, 1));

const givens = [
  new Given(makeCellId(1, 1), 1),
  new Given(makeCellId(1, 2), 2),
  new Given(makeCellId(1, 4), 3),
  new Given(makeCellId(10, 6), 4),
  new Given(makeCellId(10, 8), 5),
  new Given(makeCellId(10, 9), 6),
];

// Arrow cells (bulb first, then arm) taken from the drawn arrow paths.
const arrows = [
  new Arrow(makeCellId(2, 2), makeCellId(3, 1)),
  new Arrow(makeCellId(2, 2), makeCellId(3, 2), makeCellId(4, 2)),
  new Arrow(makeCellId(2, 2), makeCellId(3, 3), makeCellId(4, 4), makeCellId(5, 5)),
  new Arrow(makeCellId(2, 2), makeCellId(2, 3), makeCellId(2, 4)),
  new Arrow(makeCellId(9, 8), makeCellId(9, 7), makeCellId(9, 6)),
  new Arrow(makeCellId(9, 8), makeCellId(8, 7), makeCellId(7, 6), makeCellId(6, 5)),
  new Arrow(makeCellId(9, 8), makeCellId(8, 8), makeCellId(7, 8)),
  new Arrow(makeCellId(9, 8), makeCellId(8, 9)),
];

return [
  shape,
  ...givens,
  ...houseConstraints,
  ...blockedPins,
  ...arrows,
];
