// Title: Aquarium (Puzzle 1)
// Author: Chiel Beenhakker
// Video: https://www.youtube.com/watch?v=aA0sp67x9aI
// Source: https://cracking-the-cryptic.web.app/sudoku/nM4nBRHQJH

// Not a digit Sudoku: colour every cell of the 10x10 grid green or blue.
//
// Rules encoded here:
//  - Within a region, cells that lie in the same row are all one colour.
//  - In a region, when a row is blue every row below it in that region is blue
//    too; a region may be entirely green or entirely blue.
//  - The number outside the grid says how many cells of that row or column are
//    blue: "3" exactly three, ">3" more than three, "<3" fewer than three.
//  - Every row and every column contains at least one blue cell.
//
// Omitted: the rules also say "'Over 3' may not mean a multiple of 3". Read as
// a clarification ("over 3" does not necessarily denote a multiple of three) it
// adds nothing; read as a prohibition it further forbids a ">3" lane from
// holding 6 or 9 blue cells. Nothing in the rules text or the drawn art tells
// the two readings apart, so the stronger one is not imposed and the encoding
// keeps only what both readings agree on.
//
// Model: a Raw grid (no row/column/box rules of its own) with two values,
// GREEN = 1 and BLUE = 2, so a cell's value is its colour.

const GREEN = 1, BLUE = 2;
const LANE = 10;  // cells in a row or a column
const shape = new Shape('10x10', '1-2', 'Raw');
const graph = cellGraph(shape);
const rows = graph.rows();
const columns = graph.columns();

// The drawn region partition, one array of [row, col] per region, transcribed
// from the puzzle's region borders (1-indexed, row-major). Not a box layout:
// 21 irregular regions covering all 100 cells.
const regionRowCol = [
  [[1, 1], [1, 2], [1, 3], [2, 1], [3, 1], [4, 1]],
  [[1, 7], [1, 9], [2, 7], [2, 9], [3, 7], [3, 8], [3, 9], [4, 8], [5, 8]],
  [[2, 2], [2, 3], [2, 4], [3, 2], [4, 2], [5, 2], [5, 3], [5, 4]],
  [[4, 3], [4, 4], [4, 5], [4, 6], [4, 7], [5, 5], [6, 5], [7, 5], [8, 5]],
  [[6, 2], [6, 3], [6, 4], [7, 4], [8, 3], [8, 4], [9, 4], [10, 2], [10, 3],
   [10, 4]],
  [[6, 6], [6, 7], [6, 8], [7, 6], [8, 6], [9, 6], [9, 7], [9, 8]],
  [[7, 1], [7, 2], [7, 3], [8, 2]],
  [[7, 7], [7, 8], [8, 7], [8, 8]],
  [[8, 1], [9, 1], [9, 2], [9, 3], [10, 1]],
  [[9, 5], [10, 5], [10, 6], [10, 7]],
  [[5, 1], [6, 1]],
  [[1, 4], [1, 5], [1, 6]],
  [[2, 5], [2, 6]],
  [[3, 3], [3, 4], [3, 5], [3, 6]],
  [[1, 8], [2, 8]],
  [[1, 10], [2, 10], [3, 10], [4, 9], [4, 10]],
  [[5, 9], [5, 10], [6, 9]],
  [[6, 10], [7, 9], [7, 10]],
  [[8, 10], [9, 10], [10, 10]],
  [[8, 9], [9, 9], [10, 8], [10, 9]],
  [[5, 6], [5, 7]],
];
const regionCells = regionRowCol.map(
  cells => cells.map(([row, col]) => makeCellId(row, col)));

// Each region's cells grouped by grid row.
const regionRowGroups = regionCells.map(cells => {
  const byRow = new Map();
  for (const cell of cells) {
    const row = parseCellId(cell).row;
    if (!byRow.has(row)) byRow.set(row, []);
    byRow.get(row).push(cell);
  }
  return byRow;
});

const rowUniformity = regionRowGroups.flatMap(byRow =>
  [...byRow.values()]
    .filter(cells => cells.length > 1)
    .map(cells => new SameValues(cells.length, ...cells)));

// Blue never sits above green within a region. One representative cell per
// occupied row (the row is uniform by the constraint above), chained in row
// order under <=: GREEN = 1 < BLUE = 2, so non-decreasing down the region is
// exactly "once a row is blue, everything below it in the region is blue".
const notDecreasing = Pair.fnToKey((a, b) => a <= b, shape);
const rowOrdering = regionRowGroups.flatMap(byRow => {
  const occupied = [...byRow.keys()].sort((a, b) => a - b);
  const pairs = [];
  for (let i = 1; i < occupied.length; i++) {
    pairs.push(new Pair(
      notDecreasing, 'aquarium-row-order',
      byRow.get(occupied[i - 1])[0], byRow.get(occupied[i])[0]));
  }
  return pairs;
});

// Margin clues, read off the printed text overlays by their position around
// the grid: every lane carries one. Left of R1..R10, and above C1..C10.
const rowClues =    ['3', '3', '3', '3', '>3', '3', '3', '3', '3', '>3'];
const columnClues = ['<3', '<3', '<3', '3', '3', '>3', '>3', '>3', '3', '3'];

// The clue counts blue cells in its lane. ISS counts occurrences of a value,
// so "fewer than three blue" is stated as its complement over the 10-cell
// lane: at least LANE - 2 green.
const repeat = (value, n) => Array(n).fill(value).join('_');
const blueCount = (clue, cells) => {
  switch (clue) {
    case '3': return new ContainExact(repeat(BLUE, 3), ...cells);
    case '>3': return new ContainAtLeast(repeat(BLUE, 4), ...cells);
    case '<3': return new ContainAtLeast(repeat(GREEN, LANE - 2), ...cells);
  }
  throw new Error(`unknown clue ${clue}`);
};

const laneCounts = [
  ...rows.map((cells, i) => blueCount(rowClues[i], cells)),
  ...columns.map((cells, i) => blueCount(columnClues[i], cells)),
];

const bluePerLine = [...rows, ...columns]
  .map(cells => new ContainAtLeast(`${BLUE}`, ...cells));

return [
  shape,
  ...rowUniformity,
  ...rowOrdering,
  ...laneCounts,
  ...bluePerLine,
];
