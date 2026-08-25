// Title: Turducken Sudoku
// Author: Scott Strosahl
// Video: https://www.youtube.com/watch?v=V_ZZmzfpj0U
// Source: https://app.crackingthecryptic.com/webapp/m3tfr2RD8J

// Normal sudoku rules apply; the puzzle's own regions are the standard 3x3
// boxes, so no custom region constraint is needed.
//
// Red cells are the outer ring -- row 1, row 9, col 1, col 9 -- (32 cells).
// No orthogonally adjacent pair with at least one red cell may hold
// consecutive digits; this reaches red-red pairs along the border and
// red-blue pairs into the second ring.
//
// Blue cells are the second ring (24 cells). Every blue cell carries a
// parity marker: a drawn circle is odd, a drawn square is even, per the
// rules text "in blue cells squares are even and circles are odd".
//
// The white cells are the remaining interior 5x5 block (rows/cols 3-7, 25
// cells, undrawn/white). Somewhere within them is a contiguous 3x3 magic
// square: digits 1-9 once each, every row/column/diagonal summing equally.
// The rules do not fix which of the 9 possible 3x3 placements inside the
// 5x5 holds it, so this is a disjunction over all 9 candidate placements
// (an unknown position, never resolved out-of-band).

const graph = cellGraph('9x9');

const isRed = ({ row, col }) => row === 1 || row === 9 || col === 1 || col === 9;

// Orthogonally-adjacent pairs touching at least one red cell -- each cell's
// right and down neighbour, so every edge is visited exactly once.
const redAdjacentPairs = [];
for (const cell of graph.cells()) {
  const pos = parseCellId(cell);
  for (const [dr, dc] of [[0, 1], [1, 0]]) {
    const other = graph.step(cell, dr, dc);
    if (!other) continue;
    if (isRed(pos) || isRed(parseCellId(other))) {
      redAdjacentPairs.push([cell, other]);
    }
  }
}
const antiConsecutiveKey = Pair.fnToKey(
  (a, b) => (a !== b + 1 && a !== b - 1), 9);
const redAntiConsecutive = redAdjacentPairs.map(
  ([a, b]) => new Pair(antiConsecutiveKey, 'RedAntiConsecutive', a, b));

// Parity markers on blue cells, cell recovered from each drawn marker's
// grid position.
const oddCells = [
  'R2C2', 'R2C3', 'R3C2', 'R5C2', 'R6C2', 'R8C2', 'R8C3',
  'R7C8', 'R6C8', 'R5C8', 'R2C8', 'R2C5', 'R8C5', 'R8C6',
];
const evenCells = [
  'R8C8', 'R8C7', 'R8C4', 'R7C2', 'R4C2',
  'R2C4', 'R2C6', 'R2C7', 'R3C8', 'R4C8',
];
const oddGivens = oddCells.map(cell => new Given(cell, 1, 3, 5, 7, 9));
const evenGivens = evenCells.map(cell => new Given(cell, 2, 4, 6, 8));

// The 9 candidate 3x3 placements for the magic square, entirely inside the
// white interior (rows/cols 3-7).
function magicSquareAt(topLeft) {
  const flat = graph.block(topLeft, 3, 3);
  const grid = [0, 1, 2].map(dr => flat.slice(dr * 3, dr * 3 + 3));
  const cols = [0, 1, 2].map(dc => grid.map(row => row[dc]));
  const diag1 = [0, 1, 2].map(i => grid[i][i]);
  const diag2 = [0, 1, 2].map(i => grid[i][2 - i]);
  return new And([
    new AllDifferent(...flat),
    new EqualSum(...grid, ...cols, diag1, diag2),
  ]);
}

const magicSquarePlacements = [];
for (const r0 of [3, 4, 5]) {
  for (const c0 of [3, 4, 5]) {
    magicSquarePlacements.push(magicSquareAt(makeCellId(r0, c0)));
  }
}

return [
  new Shape('9x9'),
  new Given('R1C2', 6),
  new Given('R1C9', 9),
  new Given('R3C1', 4),
  new Given('R4C6', 7),
  new Given('R4C9', 4),
  new Given('R6C1', 1),
  new Given('R6C4', 9),
  new Given('R7C9', 3),
  new Given('R9C1', 6),
  new Given('R9C8', 2),
  ...redAntiConsecutive,
  ...oddGivens,
  ...evenGivens,
  new Or(magicSquarePlacements),
];
