// Title: Aquarium (Puzzle 1)
// Author: Chiel Beenhakker
// Video: https://www.youtube.com/watch?v=aA0sp67x9aI
// Source: https://cracking-the-cryptic.web.app/sudoku/nM4nBRHQJH

// Not a digit Sudoku: colour every cell green or blue. Within a region, cells
// sharing a row are one uniform colour, and once a row in a region is blue
// every row below it in that region is blue too (a region may be entirely one
// colour). Outside numbers give a row's/column's blue-cell count compared to
// 3 ("<3", "3", ">3" -- ">3" is literally "more than 3", not "a multiple of
// 3"). Every row and column has at least one blue cell.
//
// Model: a Raw grid (no Sudoku row/column/box rules) with GREEN=1, BLUE=2.
// A Raw shape's value range floors to max(rows, cols) = 10 on this 10x10
// canvas, so every cell is explicitly pinned to {GREEN, BLUE} below.

const GREEN = 1, BLUE = 2;
const shape = new Shape('10x10', '1-2', 'Raw');
const graph = cellGraph(shape);

// Every cell is pinned to {GREEN, BLUE} with the same Given, so one
// Replicate covers the whole grid instead of 100 identical copies.
const domainPins = graph.makeReplicate(new Given(graph.cells()[0], GREEN, BLUE));

// Regions, one array of [row, col] per drawn region, transcribed from the
// puzzle's region overlay (row-major, 1-indexed). This is the puzzle's own
// region partition of the grid, not a Sudoku box layout. Built through
// makeCellId rather than hand-typed 'R#C#' strings, since row/col 10 is not
// decimal in a cell id (base-17: 'a').
const regionRowCol = [
  [[1, 1], [1, 2], [1, 3], [2, 1], [3, 1], [4, 1]],
  [[1, 7], [1, 9], [2, 7], [2, 9], [3, 9], [3, 8], [3, 7], [4, 8], [5, 8]],
  [[3, 2], [4, 2], [2, 2], [2, 3], [2, 4], [5, 2], [5, 3], [5, 4]],
  [[4, 6], [4, 7], [4, 5], [4, 4], [4, 3], [5, 5], [6, 5], [7, 5], [8, 5]],
  [[6, 2], [6, 3], [6, 4], [7, 4], [8, 4], [8, 3], [9, 4], [10, 4], [10, 3], [10, 2]],
  [[6, 6], [7, 6], [8, 6], [6, 7], [6, 8], [9, 6], [9, 7], [9, 8]],
  [[7, 1], [7, 2], [7, 3], [8, 2]],
  [[7, 7], [7, 8], [8, 8], [8, 7]],
  [[9, 1], [9, 2], [9, 3], [10, 1], [8, 1]],
  [[10, 6], [10, 7], [9, 5], [10, 5]],
  [[5, 1], [6, 1]],
  [[1, 4], [1, 5], [1, 6]],
  [[2, 5], [2, 6]],
  [[3, 3], [3, 4], [3, 5], [3, 6]],
  [[1, 8], [2, 8]],
  [[1, 10], [2, 10], [3, 10], [4, 10], [4, 9]],
  [[5, 10], [5, 9], [6, 9]],
  [[6, 10], [7, 10], [7, 9]],
  [[8, 10], [9, 10], [10, 10]],
  [[8, 9], [9, 9], [10, 9], [10, 8]],
  [[5, 6], [5, 7]],
];
const regionCells = regionRowCol.map(
  cells => cells.map(([row, col]) => makeCellId(row, col)));

// Group each region's cells by row.
const regionRowGroups = regionCells.map(cells => {
  const byRow = new Map();
  for (const cell of cells) {
    const row = Number(parseCellId(cell).row);
    if (!byRow.has(row)) byRow.set(row, []);
    byRow.get(row).push(cell);
  }
  return byRow;
});

// Rule: within a region, cells in the same row share one colour.
const rowUniformity = regionRowGroups.flatMap(byRow =>
  [...byRow.values()]
    .filter(cells => cells.length > 1)
    .map(cells => new SameValues(cells.length, ...cells)));

// Rule: a region's rows never go blue-then-green top to bottom (blue rows are
// always below any green row in that region; an all-one-colour region is the
// degenerate case). One representative cell per occupied row, chained in row
// order with a <= relation (GREEN=1 < BLUE=2, so non-decreasing top to
// bottom is exactly the rule).
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

// Outside clues, read off their printed position: left-of-grid text is that
// row's blue-cell count vs 3; above-grid text is that column's.
const rowClues = ['3', '3', '3', '3', '>3', '3', '3', '3', '3', '>3'];
const colClues = ['<3', '<3', '<3', '3', '3', '>3', '>3', '>3', '3', '3'];

const countClue = (clue, cells) => {
  if (clue === '3') return new ContainExact('2_2_2', ...cells);
  if (clue === '>3') return new ContainAtLeast('2_2_2_2', ...cells);
  // '<3': fewer than 3 blue == at least 8 (of 10) green.
  return new ContainAtLeast('1_1_1_1_1_1_1_1', ...cells);
};

const rowCountClues = graph.rows().map((cells, i) => countClue(rowClues[i], cells));
const colCountClues = graph.columns().map((cells, i) => countClue(colClues[i], cells));

// Rule: every row and column has at least one blue cell.
const atLeastOneBlue = [...graph.rows(), ...graph.columns()]
  .map(cells => new ContainAtLeast('2', ...cells));

return [
  shape,
  domainPins,
  ...rowUniformity,
  ...rowOrdering,
  ...rowCountClues,
  ...colCountClues,
  ...atLeastOneBlue,
];
