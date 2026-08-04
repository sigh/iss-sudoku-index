// Title: December 13, 2022: Two Sudokus
// Author: clover!
// Video: https://www.youtube.com/watch?v=oh_RAQFadik
// Source: https://tinyurl.com/2gz8fx85

// No rules text is present in the source payload. It draws two independent
// 6x6 sudoku grids side by side (a blank column in the source separates
// them, carries no clue, and is dropped here). Each grid's only geometry
// beyond the givens is its drawn box borders (Penpa `lineE` edges); no
// cages, lines, thermometers, arrows or shading are present. Each grid is
// read as normal sudoku -- every row, column and drawn box holds 1-6 once
// -- and nothing in the payload relates the two grids to each other.
//
// ISS always makes every row all-different across the *whole* grid width,
// with no per-puzzle way to scope it (js/solver/sudoku_builder.js
// `_rowColHandlers` runs unconditionally over `numCols`). Two 6-wide boards
// placed in one 12-wide row would then wrongly force every left-board digit
// to differ from every right-board digit. To avoid that without touching
// solver code, the alphabet is widened to 1-12 and every right-board value
// is shifted by a constant +6, so the two boards' domains never overlap:
// the whole-row all-different factors exactly into "left 6 distinct" and
// "right 6 distinct", with no real cross-board relation enforced. Every
// non-given cell gets a `Given` candidate list restricting it to its own
// board's 6-value range, so the widened alphabet cannot leak a value from
// the other board. `RegionSize(6)` then tiles the widened 6x12 grid into
// 2-row x 3-col boxes, which land exactly on the drawn borders in both
// boards (checked against the payload's `lineE` marks).

// Left grid, decoded from the payload's `number` map (Penpa point-index,
// 2-cell margin, nx0=17). [row, col, digit], 1-indexed within the grid.
const boardAGivens = [
  [1, 3, 2], [1, 6, 4],
  [2, 1, 1], [2, 4, 3],
  [5, 1, 3], [5, 4, 6],
  [6, 3, 4], [6, 6, 5],
];

// Right grid, same source and decode, local column 1-6; placed at global
// column local+6. Digit is the drawn value (1-6); the +6 shift to reach
// the widened board-B range is applied below.
const boardBGivens = [
  [1, 1, 3], [1, 4, 5],
  [2, 3, 4], [2, 6, 6],
  [4, 1, 2], [4, 5, 1],
  [5, 2, 3], [5, 6, 2],
];

const boardAGivenCells = new Set(boardAGivens.map(([r, c]) => makeCellId(r, c)));
const boardBGivenCells = new Set(boardBGivens.map(([r, c]) => makeCellId(r, c + 6)));

const boardACells = [];
for (let r = 1; r <= 6; r++) for (let c = 1; c <= 6; c++) boardACells.push(makeCellId(r, c));
const boardBCells = [];
for (let r = 1; r <= 6; r++) for (let c = 7; c <= 12; c++) boardBCells.push(makeCellId(r, c));

const givens = [
  ...boardAGivens.map(([r, c, v]) => new Given(makeCellId(r, c), v)),
  ...boardBGivens.map(([r, c, v]) => new Given(makeCellId(r, c + 6), v + 6)),
];

// Non-given cells: restrict to the board's own 6-value range so the widened
// alphabet stays board-local (see the header note).
const domainRestrictions = [
  ...boardACells.filter(c => !boardAGivenCells.has(c))
    .map(c => new Given(c, 1, 2, 3, 4, 5, 6)),
  ...boardBCells.filter(c => !boardBGivenCells.has(c))
    .map(c => new Given(c, 7, 8, 9, 10, 11, 12)),
];

return [
  new Shape('6x12', 12),
  new RegionSize(6),
  ...givens,
  ...domainRestrictions,
];
