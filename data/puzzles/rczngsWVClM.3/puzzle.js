// Title: Aquarium
// Author: Atanas Georgiev
// Video: https://www.youtube.com/watch?v=rczngsWVClM
// Source: https://cracking-the-cryptic.web.app/sudoku/tQqbRRTfHp

// Not a digit Sudoku: shade some cells water (WET) or dry (DRY). Within a
// tank, cells sharing a row are one uniform state, and a tank's rows never go
// dry-then-wet top to bottom (wet rows always sit below any dry row in that
// tank -- an all-one-state tank is the degenerate case). Outside numbers give
// a row's/column's wet-cell count.
//
// Model: a Raw grid (no Sudoku row/column/box rules) with DRY=1, WET=2. A
// Raw shape's value range floors to max(rows, cols) = 10 on this 10x10
// canvas, so every cell is explicitly pinned to {DRY, WET} below.

const DRY = 1, WET = 2;
const shape = new Shape('10x10', '1-2', 'Raw');
const graph = cellGraph(shape);

// Every cell is pinned to {DRY, WET} with the same Given, so one Replicate
// covers the whole grid instead of 100 identical copies.
const domainPins = graph.makeReplicate(new Given(graph.cells()[0], DRY, WET));

// Tanks, one array of [row, col] per drawn region, transcribed from the
// puzzle's drawn region outlines. This is the puzzle's own partition, not a
// Sudoku box layout. Built through makeCellId rather than hand-typed 'R#C#'
// strings, since row/col 10 is not decimal in a cell id (base-17: 'a').
//
// The last two entries are the two areas the source draws only as holes: no
// cell list of its own names them, but every tank around each one is drawn,
// and those outlines close each hole completely, so each reads as exactly one
// bounded tank. The first is the ring around the one-cell tank R4C8 and
// around the R6C8-R7C8 arm of the tank above it; the second is the pocket
// between the R6C1-R7C1 tank and the tank that wraps it. With them the 20
// tanks tile all 100 cells exactly once.
const regionRowCol = [
  [[1, 1], [2, 1], [3, 1], [4, 1], [5, 1]],
  [[6, 1], [7, 1]],
  [[8, 1], [9, 1]],
  [[10, 1], [10, 2], [10, 3]],
  [[8, 2], [9, 2], [9, 3], [8, 3], [8, 4]],
  [[7, 2], [7, 3], [7, 4], [6, 4], [5, 4], [5, 3], [5, 2], [4, 2], [3, 2], [3, 3], [3, 4]],
  [[4, 3], [4, 4], [4, 5], [3, 5], [2, 5], [5, 5], [4, 6], [5, 6]],
  [[1, 3], [2, 2], [1, 2], [2, 3], [2, 4]],
  [[1, 4], [1, 5], [1, 6]],
  [[3, 6], [2, 6], [2, 7], [1, 7], [1, 8], [1, 9]],
  [[2, 8], [2, 9], [1, 10], [2, 10], [3, 10], [4, 10], [5, 10]],
  [[9, 4], [10, 4], [10, 5], [9, 5], [8, 5]],
  [[6, 5], [6, 6]],
  [[7, 5], [7, 6], [8, 6], [8, 7], [8, 8], [7, 8], [6, 8], [9, 6], [10, 6], [10, 7]],
  [[9, 7], [9, 8]],
  [[10, 8], [10, 9], [10, 10], [9, 10], [9, 9]],
  [[8, 9], [8, 10], [7, 10], [6, 10]],
  [[4, 8]],
  [[3, 7], [3, 8], [3, 9], [4, 7], [4, 9], [5, 7], [5, 8], [5, 9], [6, 7], [6, 9], [7, 7], [7, 9]],
  [[6, 2], [6, 3]],
];
const regionCells = regionRowCol.map(
  cells => cells.map(([row, col]) => makeCellId(row, col)));

// Group each tank's cells by row.
const regionRowGroups = regionCells.map(cells => {
  const byRow = new Map();
  for (const cell of cells) {
    const row = Number(parseCellId(cell).row);
    if (!byRow.has(row)) byRow.set(row, []);
    byRow.get(row).push(cell);
  }
  return byRow;
});

// Rule: within a tank, cells in the same row share one state (water level is
// uniform across a tank).
const rowUniformity = regionRowGroups.flatMap(byRow =>
  [...byRow.values()]
    .filter(cells => cells.length > 1)
    .map(cells => new SameValues(cells.length, ...cells)));

// Rule: a tank's rows never go wet-then-dry top to bottom (gravity: water
// settles at the bottom of the tank, so dry rows are always above wet rows).
// One representative cell per occupied row, chained in row order with a <=
// relation (DRY=1 < WET=2, so non-decreasing top to bottom is exactly the
// rule).
const orderKey = Pair.fnToKey((a, b) => a <= b, shape);
const rowOrdering = regionRowGroups.flatMap(byRow => {
  const rows = [...byRow.keys()].sort((a, b) => a - b);
  const pairs = [];
  for (let i = 1; i < rows.length; i++) {
    pairs.push(new Pair(
      orderKey, 'aquarium-row-order',
      byRow.get(rows[i - 1])[0], byRow.get(rows[i])[0]));
  }
  return pairs;
});

// Outside clues: wet-cell count per row/column, read off the printed position
// -- column counts below the grid (left to right), row counts to the right of
// the grid (top to bottom). Both axes total 36, a transcription cross-check
// (every water cell is counted once by its row and once by its column).
const colClues = [3, 4, 4, 4, 4, 5, 3, 3, 3, 3];
const rowClues = [3, 3, 1, 1, 4, 4, 6, 2, 5, 7];

// Since every cell is pinned to {DRY, WET}, exactly N occurrences of WET among
// a line's 10 cells forces the remaining 10-N to DRY -- no need to spell out
// the DRY count too.
const countClue = (n, cells) =>
  new ContainExact(Array(n).fill(WET).join('_'), ...cells);

const rowCountClues = graph.rows().map((cells, i) => countClue(rowClues[i], cells));
const colCountClues = graph.columns().map((cells, i) => countClue(colClues[i], cells));

return [
  shape,
  domainPins,
  ...rowUniformity,
  ...rowOrdering,
  ...rowCountClues,
  ...colCountClues,
];
