// Title: Aquarium (Puzzle 2)
// Author: Chiel Beenhakker
// Video: https://www.youtube.com/watch?v=aA0sp67x9aI
// Source: https://cracking-the-cryptic.web.app/sudoku/Bq6HJrg9p7

// Not a digit Sudoku: colour every cell of the 9x9 grid green or blue.
//
// Rules encoded here:
//  - Within a region, cells in the same row are all one colour.
//  - In a region, when a row is blue every row below it in that region is blue
//    too; a region may be entirely one colour.
//  - A clue N outside the grid means a change of colour occurs after the Nth
//    cell of that lane, counted from the clue's own side.
//  - Zeros are cosmetic and mean nothing, so the two printed 0s mark nothing.
//  - Every row and every column contains at least one green cell.
//  - Regions entirely surrounded by cells of one colour must be the other
//    colour -- encoded in the weakened form described at that constraint.
//
// Model: a Raw grid (no row/column/box rules of its own) with two values,
// GREEN = 1 and BLUE = 2, so a cell's value is its colour.

const GREEN = 1, BLUE = 2;
const shape = new Shape('9x9', '1-2', 'Raw');
const graph = cellGraph(shape);
const rows = graph.rows();
const columns = graph.columns();

// The drawn region partition, one array of [row, col] per region, transcribed
// from the puzzle's region borders (1-indexed, row-major). Not a box layout:
// 16 irregular regions covering all 81 cells.
const regionRowCol = [
  [[1, 1], [2, 1], [3, 1], [3, 2], [3, 3], [4, 1], [4, 3], [5, 1], [5, 3]],
  [[4, 2], [5, 2]],
  [[6, 1], [6, 2], [6, 3], [7, 1], [8, 1], [9, 1], [9, 2], [9, 3]],
  [[1, 4], [2, 4], [3, 4], [3, 5], [3, 6], [4, 4], [4, 6], [5, 4], [5, 5], [5, 6]],
  [[6, 4], [6, 5], [6, 6], [7, 5], [8, 5]],
  [[7, 3], [7, 4], [7, 6], [8, 4], [8, 6], [9, 4], [9, 5], [9, 6]],
  [[1, 5], [1, 6], [1, 7], [1, 8], [1, 9], [2, 5], [2, 8]],
  [[2, 9], [3, 9], [4, 7], [4, 8], [4, 9], [5, 7], [5, 9], [6, 7], [6, 8], [6, 9]],
  [[7, 7], [7, 8], [7, 9], [8, 7], [9, 7], [9, 8], [9, 9]],
  [[8, 8], [8, 9]],
  [[7, 2], [8, 2], [8, 3]],
  [[2, 2], [2, 3]],
  [[1, 2], [1, 3]],
  [[4, 5]],
  [[5, 8]],
  [[2, 6], [2, 7], [3, 7], [3, 8]],
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
// the grid; null where no clue is printed on that lane.
const topClues =    [null, 1, 1, null, 6, null, 1, 7, null];  // C1..C9
const bottomClues = [null, 1, 1, null, 6, null, null, 1, 7];  // C1..C9
const leftClues =   [1, 1, null, null, 6, null, 2, 0, null];  // R1..R9
const rightClues =  [null, 1, 1, null, null, 6, null, 2, 0];  // R1..R9

// A clue N puts a colour change immediately after the Nth cell of its lane,
// so cells N and N+1 of that lane -- ordered away from the clue -- differ.
// On a two-colour grid "differ" is AllDifferent over the two cells. A printed
// 0 names no such boundary, matching the rule that zeros are cosmetic.
const changeAfter = (clue, laneFromClue) =>
  clue ? [new AllDifferent(laneFromClue[clue - 1], laneFromClue[clue])] : [];
const reversed = cells => [...cells].reverse();

const colourChanges = [
  ...columns.flatMap((cells, i) => changeAfter(topClues[i], cells)),
  ...columns.flatMap((cells, i) => changeAfter(bottomClues[i], reversed(cells))),
  ...rows.flatMap((cells, i) => changeAfter(leftClues[i], cells)),
  ...rows.flatMap((cells, i) => changeAfter(rightClues[i], reversed(cells))),
];

const greenPerLine = [...rows, ...columns]
  .map(cells => new ContainAtLeast(`${GREEN}`, ...cells));

// "Regions entirely surrounded by cells of one colour must be the other
// colour." The rules text does not say which cells count as surrounding a
// region: whether diagonal neighbours are part of the ring, and whether a
// region that runs to the grid edge can be surrounded at all. Rather than
// pick a reading, this encodes the part every reading agrees on -- a region
// that touches no grid edge, whose full eight-neighbour ring is one colour --
// which every candidate reading implies. The stronger readings are declared
// as an omission.
//
// Stated as a negative so it needs no conditional: for a cell x of such a
// region, "ring all green and x green" is forbidden, and likewise for blue.
// Requiring at least one blue among (ring + x) forbids the first, at least
// one green forbids the second; over every x this is exactly "if the ring is
// one colour then the whole region is the other".
const RING_STEPS = [
  [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
const touchesEdge = ([row, col]) =>
  row === 1 || row === 9 || col === 1 || col === 9;

const enclosedRegions = regionRowCol.flatMap((cells, i) => {
  if (cells.some(touchesEdge)) return [];
  const own = new Set(regionCells[i]);
  const ring = new Set();
  for (const [row, col] of cells) {
    for (const [dr, dc] of RING_STEPS) {
      const cell = makeCellId(row + dr, col + dc);
      if (!own.has(cell)) ring.add(cell);
    }
  }
  const ringCells = [...ring];
  return regionCells[i].flatMap(cell => [
    new ContainAtLeast(`${BLUE}`, ...ringCells, cell),
    new ContainAtLeast(`${GREEN}`, ...ringCells, cell),
  ]);
});

return [
  shape,
  ...rowUniformity,
  ...rowOrdering,
  ...colourChanges,
  ...greenPerLine,
  ...enclosedRegions,
];
