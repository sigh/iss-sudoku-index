// Title: Homogeneous
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=kM6Kwwkv3aM
// Source: https://sudokupad.app/0htle6wxey

// Rules encoded here, in full:
//  - Divide the 10x10 grid into 10 regions, each of 10 orthogonally connected
//    cells; every cell of a region holds the same digit; all of 0-9 appear.
//  - Digits along an arrow sum to the digit in the attached circle.
//  - A black dot between two digits: one is double the other.
//  - A green dot between two digits: they differ by at least 5.
// Nothing else is clued: there are no givens and no row, column or box rule.
//
// The region rule is encoded as its per-digit equivalent. Ten monochromatic
// regions covering 100 cells must carry ten different digits (otherwise some
// digit is absent), so each digit occupies exactly 10 cells and those cells are
// exactly one region -- i.e. for every digit: exactly ten cells, forming one
// orthogonally connected group. The converse holds too, so this is the same
// rule, not a weakening of it.
//
// Every digit repeats ten times, which a Sudoku grid's implicit row/column
// all-different would reject, so the grid is Raw: no implicit constraints.
const shape = new Shape('10x10', '0-9', 'Raw');
const graph = cellGraph(shape);
const at = (row, col) => makeCellId(row, col);
const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const regions = [
  // One connected group per digit. An empty group prefix targets the main
  // grid.
  ...digits.map(d => new ConnectedValues('', d)),
  // Ten cells per digit, over the whole board.
  new ContainExact(
    digits.flatMap(d => Array(10).fill(d)).join('_'), ...graph.cells()),
];

// Arrows, transcribed from the drawn strokes: circle cell first, then the arm
// cells in drawn order from the circle to the arrowhead. Arms run diagonally in
// places, and a stroke drawn straight from R6C2 to R8C2 passes through R7C2.
const arrows = [
  [[6, 2], [7, 2], [8, 2], [7, 3]],
  [[6, 6], [7, 5], [8, 6]],
  [[2, 6], [3, 6], [3, 5], [4, 4], [5, 3]],
  [[5, 5], [4, 6]],
  [[5, 6], [5, 7], [4, 7]],
].map(cells => new Arrow(...cells.map(rc => at(...rc))));

// Dotted edges, transcribed from the drawn dots (each between two
// orthogonally adjacent cells).
const blackDots = [
  [[1, 1], [2, 1]],
  [[1, 9], [1, 10]],
  [[7, 10], [8, 10]],
  [[10, 3], [10, 4]],
  [[10, 9], [10, 10]],
].map(([p, q]) => new BlackDot(at(...p), at(...q)));

const greenDots = [
  [[1, 2], [1, 3]],
  [[1, 8], [1, 9]],
  [[1, 10], [2, 10]],
  [[3, 1], [4, 1]],
].map(([p, q]) => new Whisper(5, at(...p), at(...q)));

return [
  shape,
  ...regions,
  ...arrows,
  ...blackDots,
  ...greenDots,
];
