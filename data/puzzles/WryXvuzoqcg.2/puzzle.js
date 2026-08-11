// Title: Coordinate Sudoku
// Author: shye
// Video: https://www.youtube.com/watch?v=WryXvuzoqcg
// Source: https://tinyurl.com/y8u94mnk

// Rules: Normal Sudoku rules apply. The digits X, Y and Z in pill shapes
// (reading left to right) signify that rXcY = Z: read the pill's three
// cells left to right as X, Y, Z; then the cell at row X, column Y must
// hold digit Z. Four pills, each three ordinary (unfilled) grid cells in
// a row, read left to right in the payload's own cell order (ascending
// column), matching "reading left to right".
//
// Each pill is encoded as a two-step dereference, since ISS has no single
// class for a two-coordinate lookup:
//   step 1: for every row r, a Var colPick_r is tied to the value at
//     (row r, column Y) via ValueIndexing(colPick_r, Y-cell, ...row r),
//     i.e. colPick_r = grid[r][Y] for whatever Y the puzzle settles on;
//   step 2: ValueIndexing(Z-cell, X-cell, ...colPick_1..9) ties
//     colPick_X to the Z-cell, i.e. grid[X][Y] = Z.
// Fixture-tested in isolation on a Raw grid before use here: accepts the
// correct dereferenced value and rejects a wrong one.

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const rows = graph.rows();

// Givens transcribed from the source payload's grid givens (24 cells).
const givens = [
  new Given('R2C1', 7), new Given('R2C2', 2), new Given('R2C3', 3),
  new Given('R2C4', 8), new Given('R2C5', 1), new Given('R2C9', 6),
  new Given('R4C1', 8), new Given('R4C2', 9), new Given('R4C3', 2),
  new Given('R4C4', 7), new Given('R4C8', 5), new Given('R4C9', 4),
  new Given('R6C1', 3), new Given('R6C2', 6), new Given('R6C6', 4),
  new Given('R6C7', 7), new Given('R6C8', 9), new Given('R6C9', 8),
  new Given('R8C1', 4), new Given('R8C5', 6), new Given('R8C6', 5),
  new Given('R8C7', 2), new Given('R8C8', 1), new Given('R8C9', 9),
];

// Pills transcribed from the source payload's pill array (cells, no
// lines -- each is a 3-cell pill, not a real arrow). Cell order is
// already left to right (ascending column) in the payload.
const pills = [
  ['R2C6', 'R2C7', 'R2C8'],
  ['R4C5', 'R4C6', 'R4C7'],
  ['R6C3', 'R6C4', 'R6C5'],
  ['R8C2', 'R8C3', 'R8C4'],
];

function pillConstraint(tag, [xCell, yCell, zCell]) {
  const colPick = new Var(tag, 'colPick', 9);
  const step1 = [];
  for (let r = 1; r <= 9; r++) {
    step1.push(new ValueIndexing(colPick.cell(r), yCell, ...rows[r - 1]));
  }
  const step2 = new ValueIndexing(zCell, xCell, ...colPick.cells());
  return [colPick, ...step1, step2];
}

const pillTags = ['A', 'B', 'C', 'D'];
const pillConstraints = pills.flatMap((p, i) => pillConstraint(pillTags[i], p));

return [
  shape,
  ...givens,
  ...pillConstraints,
];
