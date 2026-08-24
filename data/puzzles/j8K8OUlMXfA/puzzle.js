// Title: Lunch With 5 Odd Friends
// Author: Andy Petersen
// Video: https://www.youtube.com/watch?v=j8K8OUlMXfA
// Source: https://app.crackingthecryptic.com/sudoku/FpgHg9jn7h

// Standard sudoku (9x9, standard boxes, no givens). One thermometer:
// digits increase from the bulb (R7C5) through R7C6, R6C6, R5C5, R4C4, to
// R3C3. The centre box (R4C4..R6C6) is a magic square: its 3 rows, 3
// columns, and 2 diagonals all share the same sum (EqualSum's segments
// forced equal; the box's own all-different then forces that sum to 15, per
// the standard magic-square construction). Eight sandwich clues (outside
// the grid) give the sum of the digits strictly between the 1 and the 9 in
// their row/column. "5s never have even neighbours, even considering the
// grid as a torus": no cell holding 5 may have an orthogonal neighbour
// holding an even digit, where orthogonal adjacency wraps row 1/row 9 and
// column 1/column 9 together (torus), in addition to every ordinary
// in-grid adjacency. "Neighbour" is read as orthogonal (no stated
// diagonal/king qualifier).

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Sandwich (outside) clues -- row/column, total, from the outside-clue
// overlays' grid-boundary positions (each overlay's row/column index and
// printed total).
const sandwiches = [
  Sandwich.fromCells(23, graph.row(1), geometry),
  Sandwich.fromCells(4, graph.row(2), geometry),
  Sandwich.fromCells(27, graph.row(6), geometry),
  Sandwich.fromCells(30, graph.row(7), geometry),
  Sandwich.fromCells(12, graph.row(9), geometry),
  Sandwich.fromCells(15, graph.column(3), geometry),
  Sandwich.fromCells(27, graph.column(5), geometry),
  Sandwich.fromCells(16, graph.column(8), geometry),
];

// Thermo, bulb first (drawn line #0, bulb marked by the filled circle
// overlay at its first way-point).
const thermo = new Thermo('R7C5', 'R7C6', 'R6C6', 'R5C5', 'R4C4', 'R3C3');

// Magic square over the centre box (R4C4..R6C6): 3 rows + 3 columns + 2
// diagonals all forced to the same sum.
const magicSquare = new EqualSum(
  ['R4C4', 'R4C5', 'R4C6'],
  ['R5C4', 'R5C5', 'R5C6'],
  ['R6C4', 'R6C5', 'R6C6'],
  ['R4C4', 'R5C4', 'R6C4'],
  ['R4C5', 'R5C5', 'R6C5'],
  ['R4C6', 'R5C6', 'R6C6'],
  ['R4C4', 'R5C5', 'R6C6'],
  ['R4C6', 'R5C5', 'R6C4'],
);

// "5s never have even neighbours, even considering the grid as a torus":
// one Pair per orthogonal torus edge (row/col adjacency mod 9, so R1/R9 and
// C1/C9 count as neighbours too, alongside every ordinary in-grid edge).
// Only the "right" (dr=0,dc=1) and "down" (dr=1,dc=0) step per origin is
// used, so each of the 81*2 = 162 undirected edges is covered exactly once.
// Edges whose target stays on the grid without wrapping are shifted copies
// of one template per direction, so those are stamped with Replicate; the
// 18 edges that wrap (row 9->1, column 9->1) are emitted as individual
// Pairs, matching bMlMnsKH4zs's torus-knight pattern.
const noFiveEven = Pair.fnToKey(
  (a, b) => !((a === 5 && b % 2 === 0) || (b === 5 && a % 2 === 0)), 9);

function allCells() {
  const cells = [];
  for (let r = 1; r <= 9; r++) {
    for (let c = 1; c <= 9; c++) cells.push({ row: r, col: c, cell: makeCellId(r, c) });
  }
  return cells;
}

// Cell (dr, dc) away without wrapping, or null off the grid.
function inGridCell(row, col, dr, dc) {
  const r = row + dr, c = col + dc;
  return (r >= 1 && r <= 9 && c >= 1 && c <= 9) ? makeCellId(r, c) : null;
}

const DIRECTIONS = [[0, 1], [1, 0]]; // right, down

const fiveEvenReplicated = DIRECTIONS.map(([dr, dc]) => {
  const origins = allCells()
    .map(({ row, col, cell }) => ({ cell, target: inGridCell(row, col, dr, dc) }))
    .filter(({ target }) => target !== null);
  const anchor = origins[0].cell;
  const { row: anchorRow, col: anchorCol } = parseCellId(anchor);
  const template = new Pair(
    noFiveEven, 'No 5-even neighbour (torus)', anchor,
    inGridCell(anchorRow, anchorCol, dr, dc));
  const targetBitset = Replicate.encodeTargetCells(
    origins.map(o => o.cell), anchor, graph);
  // lint-ok: bare-replicate-constructor
  return new Replicate([template], targetBitset, anchor);
});

// The wrapping edges: row 9 -> row 1 in every column (down-wrap), and
// column 9 -> column 1 in every row (right-wrap).
const fiveEvenWrapped = [
  ...Array.from({ length: 9 }, (_, i) => i + 1).map(c => new Pair(
    noFiveEven, 'No 5-even neighbour (torus)', makeCellId(9, c), makeCellId(1, c))),
  ...Array.from({ length: 9 }, (_, i) => i + 1).map(r => new Pair(
    noFiveEven, 'No 5-even neighbour (torus)', makeCellId(r, 9), makeCellId(r, 1))),
];

const fiveEvenPairs = [...fiveEvenReplicated, ...fiveEvenWrapped];

return [
  new Shape('9x9'),
  thermo,
  magicSquare,
  ...sandwiches,
  ...fiveEvenPairs,
];
