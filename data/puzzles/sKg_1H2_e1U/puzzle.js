// Title: Dutch Flat Mates: Split Ends
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=sKg_1H2_e1U
// Source: https://sudokupad.app/n44kqgll5s

// Normal sudoku rules apply.
//
// Every 5 in the grid must have a 1 directly above it or a 9 directly below
// it (it may have both). This is exactly the native DutchFlatmates global.
//
// Each horizontal "blonde" line sums to a two-digit number; the two digits of
// that number are the first and last cells of the line's own row, in either
// order. Each vertical "brunette" line sums to a two-digit number; the two
// digits are the top and bottom cells of the line's own column, in either
// order. Some columns/rows carry more than one such line (the drawn lines
// have literal "split ends"); every line still refers to the same pair of
// end cells for its row/column.
//
// A line's own cells may include one of its row/column's end cells (e.g. the
// R4 line runs C1-C8, so R4C1 is both a summed cell and one of the two
// digits) -- this is handled generically below, not special-cased.

function twoDigitLineSum(lineCells, endA, endB) {
  // sum(lineCells) must equal the two-digit number formed by endA and endB,
  // in either order: 10*endA + endB == sum, or 10*endB + endA == sum.
  // Coefficients for repeated cells (an end cell that is also on the line)
  // are merged so each cell appears once in the resulting Sum.
  function build(tensCell, onesCell) {
    const coeffs = new Map();
    for (const c of lineCells) coeffs.set(c, (coeffs.get(c) || 0) + 1);
    coeffs.set(tensCell, (coeffs.get(tensCell) || 0) - 10);
    coeffs.set(onesCell, (coeffs.get(onesCell) || 0) - 1);
    const pairs = [...coeffs.entries()].map(([cell, coeff]) => [cell, coeff]);
    return new Sum(0, ...pairs);
  }
  return new Or([build(endA, endB), build(endB, endA)]);
}

// Blonde (horizontal) lines: [row, [cols...]].
const blondeLines = [
  [2, [2, 3, 4, 5, 6, 7]],
  [4, [1, 2, 3, 4, 5, 6, 7, 8]],
  [6, [5, 6, 7, 8, 9]],
  [9, [3, 4, 5, 6, 7, 8, 9]],
];

// Brunette (vertical) lines: [col, [rows...]]. Column 4 and column 9 each
// have their line split into multiple separate segments (the "split ends"),
// but every segment still refers to that column's own top/bottom cells.
const brunetteLines = [
  [2, [1, 2, 3, 4, 5, 6, 7]],
  [4, [1, 2, 3, 4, 5]],
  [4, [6, 7, 8]],
  [6, [3, 4, 5, 6, 7, 8, 9]],
  [9, [1, 2, 3]],
  [9, [4, 5, 6]],
  [9, [7, 8, 9]],
];

const cellId = (r, c) => makeCellId(r, c);

const blondeConstraints = blondeLines.map(([row, cols]) => {
  const cells = cols.map(c => cellId(row, c));
  return twoDigitLineSum(cells, cellId(row, 1), cellId(row, 9));
});

const brunetteConstraints = brunetteLines.map(([col, rows]) => {
  const cells = rows.map(r => cellId(r, col));
  return twoDigitLineSum(cells, cellId(1, col), cellId(9, col));
});

return [
  new Shape('9x9'),
  new DutchFlatmates(),
  ...blondeConstraints,
  ...brunetteConstraints,
];
