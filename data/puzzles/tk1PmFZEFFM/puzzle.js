// Title: Give me five!
// Author: Artham
// Video: https://www.youtube.com/watch?v=tk1PmFZEFFM
// Source: https://sudokupad.app/2u2x4hgw67

// Classic Sudoku rules do not apply: only rows and columns are all-different
// (NoBoxes drops the default 3x3 boxes). Instead, every cell whose own value
// is 5 anchors a 3x3 neighbourhood of itself (wrapping toroidally past any
// edge or corner), and that neighbourhood must itself be all-different.
// Encoded as one conditional group per grid cell: either the cell is not 5,
// or it is 5 and its wrapped neighbourhood is all-different.

const graph = cellGraph('9x9');
const NOT_FIVE = [1, 2, 3, 4, 6, 7, 8, 9];

// The 9 cells of the 3x3 block centred on `cell`, each offset wrapped modulo
// the 9x9 grid so a block anchored on an edge or corner cell wraps to the
// opposite side(s), per the rules' torus note.
function wrappedBox(cell) {
  const { row, col } = parseCellId(cell);
  const cells = [];
  for (let dRow = -1; dRow <= 1; dRow++) {
    for (let dCol = -1; dCol <= 1; dCol++) {
      const r = ((row - 1 + dRow + 9) % 9) + 1;
      const c = ((col - 1 + dCol + 9) % 9) + 1;
      cells.push(makeCellId(r, c));
    }
  }
  return cells;
}

const fiveBoxes = graph.cells().map(cell => new Or([
  new Given(cell, ...NOT_FIVE),
  new And([new Given(cell, 5), new AllDifferent(...wrappedBox(cell))]),
]));

// Givens, as printed on the board.
const givens = [
  ['R1C1', 5], ['R1C5', 8],
  ['R2C5', 1],
  ['R3C2', 4], ['R3C3', 8], ['R3C6', 3], ['R3C8', 9],
  ['R4C1', 2], ['R4C3', 3], ['R4C6', 6], ['R4C9', 9],
  ['R5C2', 5], ['R5C4', 7],
  ['R6C2', 8], ['R6C4', 2], ['R6C5', 4], ['R6C7', 6], ['R6C8', 7],
  ['R7C1', 9], ['R7C8', 4],
];

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...fiveBoxes,
];
