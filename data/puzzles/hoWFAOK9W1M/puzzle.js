// Title: Twisted
// Author: ThePedallingPianist
// Video: https://www.youtube.com/watch?v=hoWFAOK9W1M
// Source: https://sudokupad.app/f4e7jjoad0

// Rules encoded here:
//  - Four 4x4 Sudokus (digits 1-4 in every row, column and 2x2 box) occupy the
//    corners of a 13x13 drawing canvas.
//  - One 6x6 Sudoku (digits 1-6 in every row, column and 2x3 box) sits in the
//    middle, rotated 45 degrees, so its rows and columns run diagonally across
//    the canvas.
//  - A digit may not repeat in the same position of two different 4x4 grids.
//  - Six X-sum arrows: the shaft cell is the tens digit and the arrowhead cell
//    the ones digit of a two-digit number, which equals the sum of the first X
//    digits seen beyond the head in the arrow's direction, X being the first
//    digit seen. Canvas positions belonging to no grid hold no digit and are
//    skipped by a sight-line.
//
// Not encoded: "in the slanted 6x6 grid, digits should be entered only in the
// middle of cells" is a digit-entry instruction for the rotated cells, not a
// condition on the final grid.
//
// The 69 canvas positions that belong to no grid carry no digit (0), so the
// grid is Raw: no implicit constraints, and every rule below is stated
// explicitly.

const shape = new Shape('13x13', '0-6', 'Raw');
const graph = cellGraph(shape);
const at = ([row, col]) => makeCellId(row, col);

// Top-left corners of the four 4x4 grids, from the drawn grid outlines.
const cornerGrids = [[1, 1], [1, 10], [10, 1], [10, 10]].map(([row0, col0]) =>
  Array.from({ length: 4 }, (_, r) =>
    Array.from({ length: 4 }, (_, c) => [row0 + r, col0 + c])));

// Rows of the rotated 6x6 grid, listed from its top-right row to its
// bottom-left row; each runs down-right across the canvas. Taken from the 36
// drawn diamond cell outlines. Its columns and 2x3 boxes are derived below.
const slantedRows = [
  [[2, 7], [3, 8], [4, 9], [5, 10], [6, 11], [7, 12]],
  [[3, 6], [4, 7], [5, 8], [6, 9], [7, 10], [8, 11]],
  [[4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10]],
  [[5, 4], [6, 5], [7, 6], [8, 7], [9, 8], [10, 9]],
  [[6, 3], [7, 4], [8, 5], [9, 6], [10, 7], [11, 8]],
  [[7, 2], [8, 3], [9, 4], [10, 5], [11, 6], [12, 7]],
];

const cornerUnits = cornerGrids.flatMap(grid => [
  ...grid,
  ...Array.from({ length: 4 }, (_, c) => grid.map(row => row[c])),
  ...[0, 2].flatMap(r0 => [0, 2].map(c0 => [
    grid[r0][c0], grid[r0][c0 + 1], grid[r0 + 1][c0], grid[r0 + 1][c0 + 1],
  ])),
]);

// The six drawn 2x3 box outlines each cover two adjacent slanted rows over
// three adjacent slanted columns.
const slantedUnits = [
  ...slantedRows,
  ...Array.from({ length: 6 }, (_, c) => slantedRows.map(row => row[c])),
  ...[0, 2, 4].flatMap(r0 => [0, 3].map(c0 => [
    ...slantedRows[r0].slice(c0, c0 + 3),
    ...slantedRows[r0 + 1].slice(c0, c0 + 3),
  ])),
];

const sudoku = [
  ...cornerUnits.map(unit => new ContainExact('1_2_3_4', ...unit.map(at))),
  ...slantedUnits.map(unit => new ContainExact('1_2_3_4_5_6', ...unit.map(at))),
];

// One group per local position within a 4x4 grid.
const disjoint = Array.from({ length: 4 }, (_, r) =>
  Array.from({ length: 4 }, (_, c) =>
    new AllDifferent(...cornerGrids.map(grid => at(grid[r][c]))))).flat();

const digitKeys = new Set(
  [...cornerGrids.flat(2), ...slantedRows.flat()].map(([r, c]) => r * 100 + c));
const blanks = Array.from({ length: 13 }, (_, r) =>
  Array.from({ length: 13 }, (_, c) => [r + 1, c + 1])).flat()
  .filter(([r, c]) => !digitKeys.has(r * 100 + c));
// Values are non-negative, so a single zero sum forces every one of these
// positions to the 0 that marks "no digit here".
const blankCanvas = new Sum(0, ...blanks.map(at));

// tens = shaft cell, ones = arrowhead cell, ray = the digit-bearing canvas
// positions beyond the head in the arrow's direction, in order; positions
// belonging to no grid are left out because a sight-line does not see them.
const arrows = [
  {
    tens: [2, 1], ones: [2, 2], // rightwards along row 2
    ray: [[2, 3], [2, 4], [2, 7], [2, 10], [2, 11], [2, 12], [2, 13]],
  },
  {
    tens: [10, 3], ones: [10, 4], // rightwards along row 10
    ray: [[10, 5], [10, 7], [10, 9], [10, 10], [10, 11], [10, 12], [10, 13]],
  },
  {
    tens: [2, 4], ones: [3, 4], // downwards along column 4
    ray: [[4, 4], [5, 4], [7, 4], [9, 4], [10, 4], [11, 4], [12, 4], [13, 4]],
  },
  {
    tens: [11, 10], ones: [10, 10], // upwards along column 10
    ray: [[9, 10], [7, 10], [5, 10], [4, 10], [3, 10], [2, 10], [1, 10]],
  },
  {
    tens: [3, 12], ones: [4, 11], // down-left along the anti-diagonal
    ray: [[5, 10], [6, 9], [7, 8], [8, 7], [9, 6], [10, 5], [11, 4], [12, 3], [13, 2]],
  },
  {
    tens: [7, 12], ones: [7, 10], // leftwards along row 7
    ray: [[7, 8], [7, 6], [7, 4], [7, 2]],
  },
];

// One branch per possible value of X, the first digit seen: that branch pins
// the first ray digit to X and makes the first X ray digits sum to the arrow's
// two-digit number. X cannot exceed the number of digits the ray has to offer,
// so longer rays are the only ones with all six branches.
const xSumArrows = arrows.map(({ tens, ones, ray }) => {
  const rayCells = ray.map(at);
  return new Or(Array.from(
    { length: Math.min(6, rayCells.length) },
    (_, i) => new And([
      new Given(rayCells[0], i + 1),
      new Sum(0, ...rayCells.slice(0, i + 1), [at(tens), -10], [at(ones), -1]),
    ])));
});

return [
  shape,
  blankCanvas,
  ...sudoku,
  ...disjoint,
  ...xSumArrows,
];
