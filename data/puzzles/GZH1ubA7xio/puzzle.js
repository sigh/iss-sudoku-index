// Title: Outside Fortress
// Author: S Alan/F Calapkulu
// Video: https://www.youtube.com/watch?v=GZH1ubA7xio
// Source: https://app.crackingthecryptic.com/sudoku/nPjp4Mr47P

// Normal sudoku rules apply (standard 3x3 boxes, no givens).
//
// Fortress: the outer ring of the grid (row 1, row 9, column 1, column 9,
// 32 cells) is shaded grey, matching the payload's 32 grey `underlay`
// squares, which cover exactly that ring. Wherever a grey cell is
// orthogonally adjacent to a white (unshaded) cell, the grey cell's digit
// must be greater than the white cell's. The four corner cells have no
// white orthogonal neighbour (both their neighbours are also ring cells),
// so no comparison is generated there.
//
// Outside clues: a number printed outside a row/column must appear
// somewhere among that row/column's first three cells, counting inward
// from the side it's printed on. It does not fix which of the three cells
// holds it and does not forbid the digit elsewhere in the row/column --
// ContainAtLeast is exactly this membership rule. Clue-to-lane geometry
// (which row/column and which side each number belongs to) was read from
// the payload's own overlay text coordinates against the framed board.

const graph = cellGraph('9x9');

const borderCells = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) {
    if (r === 1 || r === 9 || c === 1 || c === 9) borderCells.push(makeCellId(r, c));
  }
}
const borderSet = new Set(borderCells);

const fortressBoundary = borderCells.flatMap(cell =>
  graph.neighbours(cell)
    .filter(n => !borderSet.has(n))
    .map(n => new GreaterThan(cell, n)));

const outsideFirstThree = [
  // Top/bottom lanes (column, value), read from overlay centers above row 1
  // / below row 9.
  new ContainAtLeast('4', ...graph.ray('R1C2', 1, 0).slice(0, 3)),
  new ContainAtLeast('3', ...graph.ray('R9C2', -1, 0).slice(0, 3)),
  new ContainAtLeast('2', ...graph.ray('R1C4', 1, 0).slice(0, 3)),
  new ContainAtLeast('7', ...graph.ray('R9C4', -1, 0).slice(0, 3)),
  new ContainAtLeast('6', ...graph.ray('R1C5', 1, 0).slice(0, 3)),
  new ContainAtLeast('1', ...graph.ray('R9C5', -1, 0).slice(0, 3)),
  new ContainAtLeast('1', ...graph.ray('R1C6', 1, 0).slice(0, 3)),
  new ContainAtLeast('9', ...graph.ray('R9C6', -1, 0).slice(0, 3)),
  new ContainAtLeast('9', ...graph.ray('R1C8', 1, 0).slice(0, 3)),
  new ContainAtLeast('4', ...graph.ray('R9C8', -1, 0).slice(0, 3)),

  // Left/right lanes (row, value), read from overlay centers left of
  // column 1 / right of column 9.
  new ContainAtLeast('2', ...graph.ray('R1C1', 0, 1).slice(0, 3)),
  new ContainAtLeast('1', ...graph.ray('R1C9', 0, -1).slice(0, 3)),
  new ContainAtLeast('9', ...graph.ray('R2C1', 0, 1).slice(0, 3)),
  new ContainAtLeast('7', ...graph.ray('R2C9', 0, -1).slice(0, 3)),
  new ContainAtLeast('8', ...graph.ray('R4C1', 0, 1).slice(0, 3)),
  new ContainAtLeast('7', ...graph.ray('R4C9', 0, -1).slice(0, 3)),
  new ContainAtLeast('6', ...graph.ray('R5C1', 0, 1).slice(0, 3)),
  new ContainAtLeast('3', ...graph.ray('R5C9', 0, -1).slice(0, 3)),
  new ContainAtLeast('2', ...graph.ray('R6C1', 0, 1).slice(0, 3)),
  new ContainAtLeast('6', ...graph.ray('R6C9', 0, -1).slice(0, 3)),
  new ContainAtLeast('5', ...graph.ray('R8C1', 0, 1).slice(0, 3)),
  new ContainAtLeast('3', ...graph.ray('R8C9', 0, -1).slice(0, 3)),
];

return [
  new Shape('9x9'),
  ...fortressBoundary,
  ...outsideFirstThree,
];
