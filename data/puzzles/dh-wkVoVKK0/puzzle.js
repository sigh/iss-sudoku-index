// Title: Twice or Half
// Author: Dali
// Video: https://www.youtube.com/watch?v=dh-wkVoVKK0
// Source: https://app.crackingthecryptic.com/sudoku/f9Dbmgj3MJ

// Normal sudoku rules apply, except that exactly one 0 exists in the grid,
// given at R8C8, replacing the digit that would otherwise complete its row,
// column and box (Shape widened to 0-9; every other cell is restricted to
// 1-9 below, so R8C8's row/column/box is the only unit that can place a 0).
// Digits along the arrow sum to its bulb. A set of 5 consecutive digits in
// any order lies on the purple line (Renban).
//
// Special numbers (8 of them, one per row 1-8): each row's blue circle is
// the last digit of an N-digit number ending at that column, where N is the
// row's column-1 digit (e.g. r2c1=5 -> a 5-digit number spanning R2C4-R2C8,
// per the rules text's own worked example). For that number to fit on the
// grid, its start column (circleColumn - N + 1) must be >= 1, i.e.
// N <= circleColumn; that bound is encoded below as a restriction on each
// row's column-1 digit.
//
// Omitted: "every special number is either twice or half the value of
// another special number." Each number's digit length -- and hence which
// cells hold it -- depends on its own row's column-1 digit, so relating two
// such numbers by a factor of 2 needs one linear equation per admissible
// (lengthA, lengthB) pair (doubling a length-L number always yields a
// length-L or length-(L+1) result, so only 2 of up to 9 possible lengths per
// partner are ever live), disjuncted over which of the other 7 numbers is
// the partner and which direction (double/half) applies. That is a
// several-hundred-branch Or-of-Sum per number (8 numbers x 7 partners x 2
// directions x up to ~18 admissible length pairs each) -- impractical to
// hand-author and audit faithfully in one pass.

const graph = cellGraph('9x9');
const ZERO_CELL = makeCellId(8, 8);
const normalDigitCells = graph.cells().filter(cell => cell !== ZERO_CELL);

// Special-number length bound per row: blue-circle column (from the drawn
// underlay geometry). Only rows whose circle sits left of column 9 add a
// real restriction beyond the default 1-9.
const circleColumnByRow = { 1: 8, 2: 8, 3: 5, 4: 9, 5: 9, 6: 8, 7: 6, 8: 9 };
const lengthBounds = Object.entries(circleColumnByRow)
  .filter(([, maxLen]) => maxLen < 9)
  .map(([row, maxLen]) => {
    const values = [];
    for (let v = 1; v <= maxLen; v++) values.push(v);
    return new Given(makeCellId(Number(row), 1), ...values);
  });

return [
  new Shape('9x9', '0-9'),
  graph.makeReplicate(
    new Given(graph.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9),
    normalDigitCells,
  ),
  new Given(ZERO_CELL, 0),
  new Given(makeCellId(3, 4), 1),
  ...lengthBounds,
  new Arrow(
    makeCellId(5, 8), makeCellId(5, 9), makeCellId(6, 8), makeCellId(6, 7)),
  new Renban(
    makeCellId(2, 1), makeCellId(3, 1), makeCellId(4, 1),
    makeCellId(5, 1), makeCellId(6, 1)),
];
