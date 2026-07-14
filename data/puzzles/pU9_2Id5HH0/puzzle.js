// Title: Ubiquity
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=pU9_2Id5HH0
// Source: https://sudokupad.app/bx62hwgndg

// Standard sudoku rules, digits 1-9, on a "skewed" 9x9 grid: each of the 9
// boxes is a normal 3x3 block, but successive box-columns are staggered
// down by one row, giving a staircase layout. Columns stay straight (each
// spans 9 consecutive physical rows); physical "rows" are what's left of a
// row after the stagger, so the rendered grid is an 11-row x 9-column
// parallelogram with 18 unused corner cells (81 real cells total).
// Checked against the source solution: the straight-column groups and the
// physical-row groups (whatever real cells share a rendered row, 3/6/9
// cells) are each genuinely all-different; a naive "un-skewed logical row"
// (same row index throughout, ignoring the stagger) is NOT all-different in
// the solution, so the physical row -- not that logical row -- is the real
// row unit here.
//
// Arrows: digits on an arrow sum to the attached circle. Per the rule's own
// clarifying note, an arrow that crosses a box-column boundary continues at
// the same logical row rather than the same physical row (the physical row
// for a fixed logical row jumps by +1 at each box-column boundary) -- see
// the two multi-cell arrows below.
//
// Encoding: the ISS main grid always enforces row/column all-different, so
// Shape is the literal 11x9 parallelogram bounding box, with the value
// range extended to 15 so the 18 unused cells can each be pinned to a
// placeholder (10-15) that never collides with another placeholder sharing
// its real row or column. Real cells are then restricted back to 1-9.
// Boxes don't match the grid's default box tiling, so it's NoBoxes plus an
// explicit AllDifferent per given 3x3 region.

const NUM_VALUES = 15;

// Real cell footprint per physical row: [firstRealCol, lastRealCol].
const ROW_REAL_COLS = {
  1: [1, 3], 2: [1, 6], 3: [1, 9], 4: [1, 9], 5: [1, 9],
  6: [1, 9], 7: [1, 9], 8: [1, 9], 9: [1, 9], 10: [4, 9], 11: [7, 9],
};

// Placeholder values for the 18 unused cells. Any assignment works as long
// as no two placeholders share a real row or column; this one is verified
// against the source solution.
const DEAD_CELLS = {
  '1,4': 10, '1,5': 11, '1,6': 12, '1,7': 13, '1,8': 14, '1,9': 15,
  '2,7': 10, '2,8': 11, '2,9': 12,
  '10,1': 10, '10,2': 11, '10,3': 12,
  '11,1': 13, '11,2': 14, '11,3': 15, '11,4': 11, '11,5': 12, '11,6': 10,
};

const shape = new Shape('11x9', NUM_VALUES);
const graph = cellGraph(shape);

const realCells = [];
const deadGivens = [];
for (let r = 1; r <= 11; r++) {
  const [lo, hi] = ROW_REAL_COLS[r];
  for (let c = 1; c <= 9; c++) {
    const cell = makeCellId(r, c);
    if (c >= lo && c <= hi) {
      realCells.push(cell);
    } else {
      deadGivens.push(new Given(cell, DEAD_CELLS[`${r},${c}`]));
    }
  }
}

// The same 1-9 restriction on all 81 real cells: one Given as the template,
// stamped onto each real cell by Replicate (which shifts the template so the
// origin lands on the target).
const realCellRange = graph.makeReplicate(
  new Given(realCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9), realCells);

// 9 boxes: rowBand/colBand each 0-2, a normal 3x3 block staggered down by
// one row per box-column (box(rowBand, colBand) starts at physical row
// 3*rowBand + colBand + 1, per the puzzle's given regions).
const boxConstraints = [];
for (let rowBand = 0; rowBand < 3; rowBand++) {
  for (let colBand = 0; colBand < 3; colBand++) {
    const startRow = 3 * rowBand + colBand + 1;
    const startCol = 3 * colBand + 1;
    const cells = [];
    for (let dr = 0; dr < 3; dr++) {
      for (let dc = 0; dc < 3; dc++) {
        cells.push(makeCellId(startRow + dr, startCol + dc));
      }
    }
    boxConstraints.push(new AllDifferent(...cells));
  }
}

// Arrows: circle first, then the arrow cells (their digits sum to the
// circle). Cells given as [row, col] in the physical (rendered) grid.
const ARROWS = [
  { circle: [9, 8], cells: [[7, 8], [8, 8]] },
  { circle: [8, 4], cells: [[6, 4], [7, 4]] },
  { circle: [7, 2], cells: [[5, 2], [6, 2]] },
  { circle: [5, 1], cells: [[7, 1], [6, 1]] },
  { circle: [6, 9], cells: [[4, 9], [5, 9]] },
  { circle: [4, 7], cells: [[6, 7], [5, 7]] },
  { circle: [6, 5], cells: [[8, 5], [7, 5]] },
  // Crosses two box-column boundaries (C3->C4, C5->C6); each hop stays at
  // the same logical (un-skewed) row rather than the same physical row.
  { circle: [2, 6], cells: [[1, 1], [1, 2], [1, 3], [2, 4], [2, 5]] },
  // Crosses one box-column boundary (C4->C3), same un-skewed handling.
  { circle: [4, 2], cells: [[5, 4], [4, 3]] },
  // This circle has two separate arrows feeding it (drawn geometry shows
  // two distinct bulb+shaft groups, and both sums check out against the
  // source solution): one along row 11, one along row 10.
  { circle: [11, 7], cells: [[11, 9], [11, 8]] },
  { circle: [11, 7], cells: [[10, 5], [10, 6]] },
];

const arrowConstraints = ARROWS.map(({ circle, cells }) =>
  new Arrow(makeCellId(...circle), ...cells.map(rc => makeCellId(...rc))));

return [
  shape,
  new NoBoxes(),
  realCellRange,
  ...deadGivens,
  ...boxConstraints,
  ...arrowConstraints,
];
