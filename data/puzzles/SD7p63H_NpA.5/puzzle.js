// Title: Small Samurai
// Author: Tyrgannus
// Video: https://www.youtube.com/watch?v=SD7p63H_NpA
// Source: https://app.crackingthecryptic.com/sudoku/GLFmHPbrmh

// Rules: In each of the 5 4x4 grids, 1-4 must be placed in each row, column
// and 2x2 region. Digits along the between line must have values between
// those of the ends of the line. Digits joined by a black dot have a 1:2
// ratio; digits joined by a white dot are consecutive. Not all dots are
// given, so no negative inference is drawn from an undotted adjacent pair.
// Digits along an arrow must sum to the digit in the circle. Digits along a
// thermo must increase from the bulb.
//
// Canvas: a 10x10 Raw grid (no implicit sudoku rules) holding 5 overlapping
// 4x4 grids, samurai-style: four corner grids (top-left, top-right,
// bottom-left, bottom-right) plus a diamond-shaped Center grid where their
// inner corners meet. Each bounding box below is [minRow, minCol, maxRow,
// maxCol], 1-indexed, read off the drawn background shading (each grid is
// one flat fill color: deepskyblue, red, gold, yellowgreen, and 8 grey
// cells belonging only to Center).
//
// The drawn thick region outlines give 16 clean 4-cell boxes plus 4 stray
// 2-cell fragments. The 16 clean ones are exactly: 3 of each corner grid's
// 4 quadrants, plus all 4 of Center's quadrants. Each corner grid's 4th
// (inner-corner) quadrant is genuinely a 4-cell square of that grid's own
// cells, but its outline is drawn split into a same-row/column 2-cell
// fragment plus a 2-cell half of one of Center's boxes, because the same
// two cells also close off Center's own box outline. The rule ("each of
// the 5 4x4 grids ... 2x2 region") requires this quadrant as its own
// AllDifferent regardless of how its outline was drawn, so it is built
// here by tiling each grid's own bounding box into standard quadrants
// rather than by reading the outline fragments directly.
const GRIDS = {
  topLeft: [2, 1, 5, 4],
  topRight: [1, 6, 4, 9],
  bottomLeft: [7, 2, 10, 5],
  bottomRight: [6, 7, 9, 10],
  center: [4, 4, 7, 7],
};

const cellsInBox = (r0, c0, r1, c1) => {
  const cells = [];
  for (let r = r0; r <= r1; r++)
    for (let c = c0; c <= c1; c++)
      cells.push(makeCellId(r, c));
  return cells;
};

// Rows, columns, and the 4 standard 2x2-quadrant boxes of one 4x4 grid.
const gridConstraints = ([r0, c0, r1, c1]) => {
  const rows = [];
  for (let r = r0; r <= r1; r++)
    rows.push(new AllDifferent(...cellsInBox(r, c0, r, c1)));
  const cols = [];
  for (let c = c0; c <= c1; c++)
    cols.push(new AllDifferent(...cellsInBox(r0, c, r1, c)));
  const boxes = [
    cellsInBox(r0, c0, r0 + 1, c0 + 1),
    cellsInBox(r0, c0 + 2, r0 + 1, c1),
    cellsInBox(r0 + 2, c0, r1, c0 + 1),
    cellsInBox(r0 + 2, c0 + 2, r1, c1),
  ].map(cells => new AllDifferent(...cells));
  return [...rows, ...cols, ...boxes];
};

const allGridCells = new Set();
const gridConstraintList = [];
for (const bbox of Object.values(GRIDS)) {
  for (const c of cellsInBox(...bbox)) allGridCells.add(c);
  gridConstraintList.push(...gridConstraints(bbox));
}

// 28 of the 100 canvas cells belong to no grid (no colored fill drawn for
// that cell). Raw has no implicit rules, so pin each to a sentinel value
// rather than leaving it a free 1-4 branch.
const inactiveGivens = [];
for (let r = 1; r <= 10; r++) {
  for (let c = 1; c <= 10; c++) {
    const id = makeCellId(r, c);
    if (!allGridCells.has(id)) inactiveGivens.push(new Given(id, 1));
  }
}

// Givens, transcribed from the puzzle grid.
const givens = [
  new Given(makeCellId(4, 2), 2),
  new Given(makeCellId(5, 7), 3),
  new Given(makeCellId(7, 8), 2),
];

// Between line: drawn path R3C3-R3C2-R3C1-R4C1, with a circle marking each
// end (R4C1 and R3C3).
const between = new Between(
  makeCellId(3, 3), makeCellId(3, 2), makeCellId(3, 1), makeCellId(4, 1));

// Kropki dots: edge marks in the top-right grid. White = consecutive,
// black = 1:2 ratio.
const dots = [
  new WhiteDot(makeCellId(1, 7), makeCellId(1, 8)),
  new WhiteDot(makeCellId(1, 8), makeCellId(1, 9)),
  new BlackDot(makeCellId(4, 7), makeCellId(4, 8)),
  new BlackDot(makeCellId(4, 6), makeCellId(4, 7)),
];

// Arrows: bulb cell first (circled, on R7C4 and R7C2), then the arm.
const arrows = [
  new Arrow(makeCellId(7, 4), makeCellId(7, 5), makeCellId(8, 5)),
  new Arrow(
    makeCellId(7, 2), makeCellId(8, 2), makeCellId(9, 3), makeCellId(9, 4)),
];

// Thermometers: bulb cell first (circled, on R6C8 and R7C10).
const thermos = [
  new Thermo(makeCellId(6, 8), makeCellId(7, 7)),
  new Thermo(makeCellId(7, 10), makeCellId(8, 9), makeCellId(9, 8)),
];

return [
  new Shape('10x10', '1-4', 'Raw'),
  ...gridConstraintList,
  ...inactiveGivens,
  ...givens,
  between,
  ...dots,
  ...arrows,
  ...thermos,
];
