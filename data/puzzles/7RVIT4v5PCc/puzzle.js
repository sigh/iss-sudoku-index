// Title: Chaos CaveSudoku
// Author: MagnusJosefsson
// Video: https://www.youtube.com/watch?v=7RVIT4v5PCc
// Source: https://app.crackingthecryptic.com/sudoku/49MN7MfH37

// Rule (a) only: somewhere in this 16x16 canvas there is an axis-aligned 9x9
// window, filled with digits 1-9, that forms a valid standard sudoku (its own
// rows, columns and 3x3 boxes, tiled from its own top-left corner -- not the
// canvas's). The window's position is not given; the solver finds it. Every
// cell outside the window stays blank (0) in this model.
//
// Rule (b) -- the "cave" covering every cell except the window's own interior
// 7x7 (shading, view-count and shaded-group-size clues) -- is deliberately
// OMITTED (see omitted_rules): it is the rule that would actually pin the
// window to one place and give each of the 25 printed numbers its real
// meaning outside the window. Without it, whichever of the 25 numbers land
// inside the window in a given placement are still checked as sudoku digits
// below; the rest are simply unused by this encoding.
//
// The unknown-window placement follows the corner/coverage technique of
// Mondrian's Revenge (pGPuqmK0WtE): a VT cell is 1 at the window's chosen
// top-left corner (2 elsewhere), and every other per-cell/per-box membership
// indicator is a Sum reading the (small, fixed) set of VT cells whose window
// would cover that position -- never an Or branching over all 64 placements.

const shape = new Shape('16x16', '0-9', 'Raw');
const grid = cellGraph(shape);
const geom = grid.gridGeometry();
const cells = grid.cells();

// Positions where a 9x9 window (resp. a 3x3 box) actually fits on the board,
// reading off the top-left corner. 8x8 = 64 window corners; 14x14 = 196 box
// corners (a box corner need not be a window corner -- only 9 of the 196 are,
// for whichever window is chosen).
const windowCorners = cells.filter(cell => grid.block(cell, 9, 9) !== null);
const boxCorners = cells.filter(cell => grid.block(cell, 3, 3) !== null);

// VT: 1 = the window's top-left corner is here, 2 = no. Exactly one of the 64
// candidates is 1. VF: 1 = this cell lies inside the chosen window, 2 = no.
// VB: 1 = a box (3x3 within the window's own tiling) has its top-left corner
// here, 2 = no.
const VT = grid.makeOverlay('VT', windowCorners);
const VF = grid.makeOverlay('VF');
const VB = grid.makeOverlay('VB', boxCorners);
// VF spans the whole grid, so its Var carries declared 16x16 dimensions and
// cell(row, col) can address it directly (no id round-trip through at()).
const VFVar = VF.toVar('F');

// Every overlay cell keeps the same {1, 2} domain across its whole group.
const overlayDomain = (overlay) =>
  overlay.makeReplicate(new Given(overlay.cells()[0], 1, 2));
const domains = [overlayDomain(VT), overlayDomain(VF), overlayDomain(VB)];

// Exactly one window corner is chosen: VT sums to 1*1 + 63*2 = 127.
const oneWindow = new Sum(2 * windowCorners.length - 1, ...VT.cells());

// A cell is inside the window exactly when one window corner sits in the 9x9
// block that would cover it from up to 8 rows/columns back; VF reads that
// count the same way Mondrian's VF reads its 3x3 coverage window.
const windowFilled = cells.map(cell => {
  const window = [];
  for (let dRow = -8; dRow <= 0; dRow++) for (let dCol = -8; dCol <= 0; dCol++) {
    const corner = grid.step(cell, dRow, dCol);
    const vt = corner === null ? null : VT.at(corner);
    if (vt !== null) window.push(vt);
  }
  return window.length === 1
    ? new SameValues(2, window[0], VF.at(cell))
    : new Sum(2 * window.length - 2, ...window, [VF.at(cell), -1]);
});

// A box corner (3x3, relative to the window's own tiling) sits at offsets
// (0, 3, 6) from the window's corner in each direction, so VB reads the same
// kind of coverage sum over that 3x3 sparse set of possible parent corners
// instead of a contiguous block.
const boxFilled = boxCorners.map(cell => {
  const window = [];
  for (let k = 0; k <= 2; k++) for (let m = 0; m <= 2; m++) {
    const corner = grid.step(cell, -3 * k, -3 * m);
    const vt = corner === null ? null : VT.at(corner);
    if (vt !== null) window.push(vt);
  }
  return window.length === 1
    ? new SameValues(2, window[0], VB.at(cell))
    : new Sum(2 * window.length - 2, ...window, [VB.at(cell), -1]);
});

// Where a box actually starts (VB = 1), its 9 cells -- always wholly inside
// the window when VB is genuinely derived from the chosen VT -- hold 1-9.
const boxDigits = boxCorners.map(cell => new Or([
  new Given(VB.at(cell), 2),
  new AllDifferent(...grid.block(cell, 3, 3)),
]));

// Every cell of the main grid holds its window digit (1-9) exactly when VF=1,
// and 0 (blank) otherwise -- ties the digit layer to the derived membership.
const filledKey = Pair.fnToKey((d, f) => (d !== 0) === (f === 1), geom);
const filled = cells.map(cell => new Pair(filledKey, 'filled', cell, VF.at(cell)));

// Rows and columns of the 16-wide canvas hold at most one of each digit;
// blanks may repeat (any number of them, anywhere outside the window), which
// no AllDifferent can say, so the pairwise relation states it directly. Once
// a row's window cells are the only non-blanks and are pairwise distinct
// digits 1-9, they are forced to be a permutation of 1-9 by pigeonhole.
const rowColKey = PairX.fnToKey((a, b) => a !== b || a === 0, geom);
const rowsAndColumns = [...grid.rows(), ...grid.columns()].map(
  house => new PairX(rowColKey, 'no-repeat', ...house));

// The 25 printed numbers of the puzzle (row/col below are 1-indexed). Each is
// a sudoku digit only if its cell ends up inside the window; otherwise this
// encoding leaves it unconstrained (see the omission note at the top of the
// file).
const GIVENS = [
  [1, 2, 6], [1, 16, 3],
  [2, 1, 5], [2, 10, 4], [2, 12, 2], [2, 15, 2],
  [3, 3, 2],
  [5, 8, 1],
  [6, 3, 1], [6, 6, 2],
  [7, 10, 7], [7, 12, 2],
  [8, 1, 1],
  [9, 2, 2], [9, 6, 6],
  [10, 13, 6], [10, 16, 5],
  [11, 7, 9],
  [12, 4, 4], [12, 12, 2],
  [15, 1, 5], [15, 16, 3],
  [16, 2, 5], [16, 5, 2], [16, 14, 1],
];
const chaosGivens = GIVENS.map(([row, col, value]) => new Or([
  new Given(VFVar.cell(row, col), 2),
  new Given(makeCellId(row, col), value),
]));

return [
  shape,
  VT.toVar('T'), VFVar, VB.toVar('B'),
  ...domains,
  oneWindow,
  ...windowFilled,
  ...boxFilled,
  ...boxDigits,
  ...filled,
  ...rowsAndColumns,
  ...chaosGivens,
];
