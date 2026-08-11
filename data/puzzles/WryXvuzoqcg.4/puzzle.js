// Title: Search Nine
// Author: Freddie Hand
// Video: https://www.youtube.com/watch?v=WryXvuzoqcg
// Source: https://app.crackingthecryptic.com/sudoku/r84n6GgQfd

// Normal sudoku rules (default Shape('9x9') row/col/box all-different; the
// payload's 9 regions are the standard 3x3 boxes, verified against the
// default partition).
//
// Variant rule: digits in arrow-marked cells indicate how far it is to the
// digit 9 in that direction. Rules text worked example: a 2 at R1C3 means a
// 9 appears two cells to its right, at R1C5. There is exactly one 9 per row
// and per column (sudoku), so for each arrow cell this is a direct dereference:
// the arrow cell's own digit, used as a 1-based index into the run of cells
// in the arrow's direction, must land on the cell holding 9.
// Encoded with ValueIndexing(valueCell, controlCell, ...indexedCells): the
// handler forces valueCell's digit == indexedCells[controlCell.value - 1]'s
// digit, and (as a side effect that is also a true consequence of the rule)
// masks controlCell's domain to 1..indexedCells.length, since the 9 cannot be
// farther away than the grid edge in that direction. valueCell is an
// off-grid Var (VN) pinned to the constant 9, reused across all 12 arrows.

// Arrow cell + direction, read from the drawn in-cell direction glyphs: a
// row-fixed/column-changing stroke is a left/right arrow, a
// column-fixed/row-changing stroke is an up/down arrow.
const ARROWS = [
  ['R1C2', 'down'],
  ['R1C3', 'right'],
  ['R3C2', 'right'],
  ['R4C1', 'right'],
  ['R4C2', 'right'],
  ['R4C3', 'right'],
  ['R5C4', 'up'],
  ['R6C1', 'up'],
  ['R7C1', 'right'],
  ['R7C3', 'up'],
  ['R9C3', 'up'],
  ['R9C4', 'up'],
];

const DIRS = {
  right: [0, 1], left: [0, -1], down: [1, 0], up: [-1, 0],
};

// Build the run of cells strictly beyond the arrow cell, in the arrow's
// direction, out to the grid edge.
function runCells(cellId, direction) {
  const { row, col } = parseCellId(cellId);
  const [dr, dc] = DIRS[direction];
  const cells = [];
  let r = row + dr, c = col + dc;
  while (r >= 1 && r <= 9 && c >= 1 && c <= 9) {
    cells.push(makeCellId(r, c));
    r += dr; c += dc;
  }
  return cells;
}

const nine = new Var('N', 'Nine', 1);

return [
  new Shape('9x9'),

  // Givens, transcribed from the puzzle's clued cells.
  new Given('R1C7', 6),
  new Given('R1C8', 7),
  new Given('R3C8', 5),
  new Given('R4C7', 7),
  new Given('R4C8', 8),
  new Given('R4C9', 4),
  new Given('R5C6', 7),
  new Given('R6C9', 5),
  new Given('R7C7', 5),
  new Given('R7C9', 1),
  new Given('R9C6', 3),
  new Given('R9C7', 8),

  nine,
  new Given(nine.cell(1), 9),

  ...ARROWS.map(([cell, dir]) =>
    new ValueIndexing(nine.cell(1), cell, ...runCells(cell, dir))),
];
