// Title: Sources
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=S5VVS9SSRek
// Source: https://sudokupad.app/n5avmxmtyt

// Normal sudoku rules apply.
//
// If a cell with an arrow contains the digit N, then the straight line
// starting in that cell and extending N cells in the arrow's direction
// (including the arrow cell) is a valid region sum line: it must cross at
// least one 3x3 box border, and box borders divide it into segments with
// equal digit sums.
//
// The line's length is not drawn: it is determined by the digit placed in
// the arrow cell itself. Each arrow cell is encoded as a disjunction over
// every digit N for which the resulting N-cell line (a) stays on the grid
// and (b) crosses at least one box border (the two side conditions the
// rule requires of a "valid" region sum line). For each such N the branch
// asserts the cell equals N and applies RegionSumLine to the exact N cells
// of that line; N values that would keep the line inside a single box, or
// run off the grid, are simply absent as branches, so Or's failure for
// those digits forces the arrow cell away from them.

const graph = cellGraph('9x9');

// Arrow cells: [origin, [dRow, dCol]].
const arrows = [
  ['R1C1', [0, 1]],
  ['R2C1', [0, 1]],
  ['R3C1', [0, 1]],
  ['R4C1', [0, 1]],
  ['R8C3', [0, 1]],
  ['R8C1', [-1, 0]],
  ['R9C2', [-1, 0]],
  ['R9C4', [-1, 0]],
  ['R5C8', [0, -1]],
  ['R3C9', [0, -1]],
  ['R4C9', [0, -1]],
  ['R1C8', [0, -1]],
  ['R2C9', [1, 0]],
];

// parseCellId/makeCellId use 1-indexed row/col (1-9).
const box = (i) => ((i - 1) / 3) | 0;

// Cells of the line of length n starting at 1-indexed (row, col) stepping
// (dRow, dCol), or null if it runs off the 9x9 grid.
function lineCells(row, col, dRow, dCol, n) {
  const cells = [];
  for (let k = 0; k < n; k++) {
    const r = row + dRow * k;
    const c = col + dCol * k;
    if (r < 1 || r > 9 || c < 1 || c > 9) return null;
    cells.push(makeCellId(r, c));
  }
  return cells;
}

function crossesBoxBorder(row, col, dRow, dCol, n) {
  const boxes = new Set();
  for (let k = 0; k < n; k++) {
    const r = row + dRow * k;
    const c = col + dCol * k;
    boxes.add(dRow !== 0 ? box(r) : box(c));
  }
  return boxes.size > 1;
}

function arrowConstraint(origin, [dRow, dCol]) {
  const { row, col } = parseCellId(origin);
  const branches = [];
  for (let n = 1; n <= 9; n++) {
    const cells = lineCells(row, col, dRow, dCol, n);
    if (!cells) continue;
    if (!crossesBoxBorder(row, col, dRow, dCol, n)) continue;
    branches.push(new And([
      new Given(origin, n),
      new RegionSumLine(...cells),
    ]));
  }
  return new Or(branches);
}

return [
  new Shape('9x9'),
  ...arrows.map(([origin, dir]) => arrowConstraint(origin, dir)),
];
