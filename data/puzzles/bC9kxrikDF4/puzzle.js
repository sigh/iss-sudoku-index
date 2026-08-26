// Title: The Great Divide
// Author: sujoyku and Marty Sears
// Video: https://www.youtube.com/watch?v=bC9kxrikDF4
// Source: https://sudokupad.app/u5hbzubozt

// Rules encoded here, in full:
//  - ISOFILL: divide the 10x10 grid into 10 regions, each of 10 orthogonally
//    connected cells; every cell of a region holds the same digit; all of
//    0-9 appear.
//  - NABNERS: no two digits on a yellow line may be equal or consecutive.
//  - ZIPPERS: the two end digits of a lavender line sum to the digit on its
//    central spot.
// Nothing else is clued: there are no givens and no row, column or box rule.
//
// The isofill rule is encoded as its per-digit equivalent: ten monochromatic
// regions covering 100 cells must carry ten different digits (else some
// digit is absent), so each digit occupies exactly 10 cells and those cells
// form one orthogonally connected group -- the converse holds too, so this
// is the same rule.
//
// Every digit repeats ten times, which a Sudoku grid's implicit row/column
// all-different would reject, so the grid is Raw: no implicit constraints.
const shape = new Shape('10x10', '0-9', 'Raw');
const graph = cellGraph(shape);
const at = (row, col) => makeCellId(row, col);
const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const regions = [
  // One connected group per digit. An empty group prefix targets the main grid.
  ...digits.map(d => new ConnectedValues('', d)),
  // Ten cells per digit, over the whole board.
  new ContainExact(
    digits.flatMap(d => Array(10).fill(d)).join('_'), ...graph.cells()),
];

// NABNERS (yellow): the rule applies to every pair of cells on a line, not
// just adjacent ones, so it is PairX (all-pairs), not Pair (adjacent-only).
// Equal (diff 0) and consecutive (diff 1) are both forbidden.
const nabnerKey = PairX.fnToKey((a, b) => Math.abs(a - b) > 1, shape);
const nabnerLines = [
  [[2, 7], [2, 8], [3, 8], [3, 9], [4, 9]],
  [[7, 2], [8, 2], [8, 3], [9, 3], [9, 4]],
  [[7, 6], [6, 5], [5, 5]],
].map(cells => new PairX(nabnerKey, 'nabner', ...cells.map(rc => at(...rc))));

// ZIPPERS (lavender): all seven drawn lines are exactly 3 cells (endpoint,
// center, endpoint), which is exactly what the native Zipper class enforces
// for an odd-length line: the two end digits sum to the center digit. Two of
// the seven (center R3C7, center R8C4) are drawn as a single straight stroke
// between the endpoints with the center cell implied by the midpoint; the
// rest are drawn bent through the center explicitly.
const zippers = [
  [[4, 8], [3, 7], [2, 6]],
  [[1, 9], [2, 9], [2, 10]],
  [[5, 9], [4, 10], [3, 10]],
  [[7, 3], [8, 4], [7, 5]],
  [[5, 8], [6, 8], [7, 8]],
  [[10, 4], [10, 5], [10, 6]],
  [[1, 3], [1, 4], [2, 4]],
].map(cells => new Zipper(...cells.map(rc => at(...rc))));

return [
  shape,
  ...regions,
  ...nabnerLines,
  ...zippers,
];
