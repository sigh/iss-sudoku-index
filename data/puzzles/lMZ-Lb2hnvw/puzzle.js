// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=lMZ-Lb2hnvw
// Source: https://cracking-the-cryptic.web.app/sudoku/bBGfgjB6mf

// A star battle laid over a 9x9 sudoku with no given digits.
//
// Rules encoded:
//  - Normal sudoku: each row, column and 3x3 box holds 1-9 once.
//  - Star battle: exactly two stars per row, per column and per 3x3 box, and
//    no two stars touch, not even diagonally.
//  - The number printed outside a row or column is the sum of the digits in
//    that row's or column's two starred cells.
//
// The star count is not printed anywhere; the printed numbers fix it at two.
// Two starred cells in the same row hold distinct digits, so with one star per
// row a clue could never exceed 9 and the 16 below column 1 is unreachable,
// while with three the smallest possible clue is 1+2+3=6 and the 3 below
// column 9 is unreachable. Two spans 3..17, which covers every printed number.
//
// The clues read as a sum over the starred cells because the eighteen numbers
// total 91 down the rows and 91 along the columns -- a sum over starred cells
// counts each star once whichever way it is totalled -- and because with no
// given digits nothing else in the puzzle ties the digits to the stars.
//
// Stars are not drawn -- the solver places them -- so they live on a Var
// overlay VS1..VS81, one cell per grid cell. An overlay cell holds 0 where its
// grid cell is unstarred and the grid cell's own digit where it is starred,
// which makes a clue a plain Sum over the overlay cells of that row or column
// and a star count an exact count of 0s. The Shape is widened to 0-9 to admit
// the 0; the grid cells are pinned back to 1-9.

const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const stars = graph.makeOverlay('VS');

// Printed outside the grid: one number to the right of each row, one below
// each column.
const ROW_CLUES = [11, 6, 11, 15, 14, 4, 9, 10, 11];
const COL_CLUES = [16, 14, 6, 12, 8, 8, 14, 10, 3];

const NO_STAR = 0;
// Nine cells per house, exactly two of them starred: exactly seven 0s.
const SEVEN_UNSTARRED = '0_0_0_0_0_0_0';

// An overlay cell either records no star, or repeats its grid cell's digit.
const starsRepeatDigit = Pair.fnToKey(
  (digit, star) => star === NO_STAR || star === digit, shape);
// Two touching cells cannot both be starred.
const notBothStarred = Pair.fnToKey(
  (a, b) => a === NO_STAR || b === NO_STAR, shape);

// One offset per unordered king-move adjacency, so each touching pair is
// constrained once.
const TOUCHING_OFFSETS = [[0, 1], [1, 0], [1, 1], [1, -1]];

const houses = graph.rowsColumnsBoxes();

// One Replicate per offset: the template constrains the first pair at that
// offset and is stamped onto every other cell that has a neighbour there.
const noTouchPairs = TOUCHING_OFFSETS.map(([dr, dc]) => {
  const origins = graph.cells().filter(cell => graph.step(cell, dr, dc));
  const anchor = stars.at(origins[0]);
  const template = new Pair(
    notBothStarred, 'stars do not touch',
    anchor, stars.at(graph.step(origins[0], dr, dc)));
  return new Replicate(
    [template],
    Replicate.encodeTargetCells(stars.at(origins), anchor, stars),
    anchor);
});

return [
  shape,
  stars.toVar('star digits'),
  graph.makeReplicate(new Given(graph.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),

  ...graph.cells().map(cell => new Pair(
    starsRepeatDigit, 'star repeats digit', cell, stars.at(cell))),

  ...houses.map(house => new ContainExact(SEVEN_UNSTARRED, ...stars.at(house))),

  ...noTouchPairs,

  ...ROW_CLUES.map((total, i) => new Sum(total, ...stars.at(graph.row(i + 1)))),
  ...COL_CLUES.map((total, i) => new Sum(total, ...stars.at(graph.column(i + 1)))),
];
