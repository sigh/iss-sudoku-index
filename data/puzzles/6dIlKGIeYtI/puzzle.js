// Title: The Aquarium Puzzle
// Author: Unknown
// Video: https://www.youtube.com/watch?v=6dIlKGIeYtI
// Source: https://cracking-the-cryptic.web.app/sudoku/79G7jP6Dpf

// Not a digit Sudoku: colour every cell of the 10x10 grid water or air. The
// grid is divided into irregular drawn regions ("tanks"). Within a tank,
// cells sharing a row are all one colour, and once a row of a tank is water
// every row below it in that same tank is water too (a tank may be entirely
// air or entirely water). A number left of a row gives that row's count of
// water cells; a number above a column gives that column's count of water
// cells.
//
// The payload carries no rules text (no metadata.rules at all), so this is
// the standard WPC "Aquarium" genre convention, not a rule read off this
// puzzle's own text -- the video title names the genre, and the outside-clue
// layout and count arithmetic below match that convention.

const AIR = 1, WATER = 2;
const shape = new Shape('10x10', '1-2', 'Raw');
const graph = cellGraph(shape);
const rows = graph.rows();
const columns = graph.columns();

// Every cell is pinned to {AIR, WATER} with one Given, replicated across the
// grid instead of 100 identical copies.
const domainPins = graph.makeReplicate(new Given(graph.cells()[0], AIR, WATER));

// The drawn region partition, one array of [row, col] per tank, transcribed
// from the payload's `regions` array (1-indexed, row-major). 18 drawn
// regions cover 99 of the 100 cells; R4C8 is not listed in any of them (the
// payload's 19th region entry is an empty stub), and since the genre tiles
// the whole grid into tanks with no other region claiming it, R4C8 is
// modelled as its own one-cell tank (last entry below).
const regionRowCol = [
  [[1, 2], [1, 3], [1, 4], [2, 4], [3, 4]],
  [[2, 2], [3, 2]],
  [[1, 1], [2, 1], [3, 1], [4, 1], [4, 2], [4, 3], [3, 3], [2, 3], [4, 4], [4, 5], [3, 5], [2, 5], [1, 5]],
  [[1, 6], [2, 6], [3, 6], [2, 7], [2, 8]],
  [[1, 7], [1, 8], [1, 9], [1, 10], [2, 9]],
  [[2, 10], [3, 10], [4, 10], [5, 10], [6, 10]],
  [[3, 9], [3, 8], [3, 7], [4, 7], [5, 7], [5, 8], [5, 9], [4, 9], [6, 7], [7, 7]],
  [[6, 9], [6, 8], [7, 8], [8, 8], [8, 7]],
  [[7, 9], [8, 9], [8, 10], [7, 10], [9, 10]],
  [[9, 8], [10, 8], [9, 9], [10, 9], [10, 10]],
  [[9, 7], [10, 7], [9, 6], [8, 6], [8, 5]],
  [[8, 1], [9, 1], [10, 1]],
  [[7, 1], [6, 1], [5, 1], [5, 2], [5, 3]],
  [[5, 4], [5, 5], [5, 6], [4, 6], [6, 5]],
  [[6, 6], [7, 6], [7, 5], [7, 4], [7, 3]],
  [[6, 4], [6, 3], [6, 2], [7, 2], [8, 2], [8, 3], [8, 4], [9, 2], [10, 2]],
  [[9, 3], [9, 4], [9, 5], [10, 5], [10, 6]],
  [[10, 3], [10, 4]],
  [[4, 8]],
];
const regionCells = regionRowCol.map(
  cells => cells.map(([row, col]) => makeCellId(row, col)));

// Group each tank's cells by grid row.
const regionRowGroups = regionCells.map(cells => {
  const byRow = new Map();
  for (const cell of cells) {
    const row = Number(parseCellId(cell).row);
    if (!byRow.has(row)) byRow.set(row, []);
    byRow.get(row).push(cell);
  }
  return byRow;
});

// Rule: within a tank, cells in the same row share one colour.
const rowUniformity = regionRowGroups.flatMap(byRow =>
  [...byRow.values()]
    .filter(cells => cells.length > 1)
    .map(cells => new SameValues(cells.length, ...cells)));

// Rule: a tank's rows never go water-then-air top to bottom (water rows are
// always below any air row in that tank). One representative cell per
// occupied row, chained in row order with a <= relation (AIR=1 < WATER=2,
// so non-decreasing top to bottom is exactly "water settles at the bottom").
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

// Outside clues, read off the printed overlay text by position: left-of-grid
// is that row's water-cell count, above-grid is that column's.
const rowClues = [5, 4, 5, 6, 7, 3, 5, 5, 5, 8];   // R1..R10, left
const colClues = [6, 6, 6, 5, 5, 6, 5, 6, 4, 4];   // C1..C10, top

const countClue = (n, cells) =>
  new ContainExact(Array(n).fill(WATER).join('_'), ...cells);

const rowCountClues = rows.map((cells, i) => countClue(rowClues[i], cells));
const colCountClues = columns.map((cells, i) => countClue(colClues[i], cells));

return [
  shape,
  domainPins,
  ...rowUniformity,
  ...rowOrdering,
  ...rowCountClues,
  ...colCountClues,
];
