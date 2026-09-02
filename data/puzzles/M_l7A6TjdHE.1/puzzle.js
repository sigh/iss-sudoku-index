// Title: Unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=M_l7A6TjdHE
// Source: https://cracking-the-cryptic.web.app/sudoku/qbQq9d9JDm

// Compass. Divide the 5x5 grid into four orthogonally-connected regions so that
// every cell belongs to exactly one region and each region contains exactly one
// of the four compass cells. Each compass cell is split by its two corner-to-
// corner diagonals into a north, east, south and west triangle; a number
// printed in a triangle counts the cells of that compass's own region lying in
// that direction from the compass cell -- north/south count every cell in a row
// above/below the compass's row (any column), west/east count every cell in a
// column left/right of the compass's column (any row). The compass cell itself
// is never counted, and a cell that lies both above and to the left is counted
// by the north clue and by the west clue. An empty triangle carries no clue.
//
// There are no digits and no sudoku layer: the board is not a Latin square, so
// it is built on the Raw grid type, and each cell's value 1-4 names the region
// it belongs to. Label k is by definition the region holding compass k, so
// pinning each compass cell to its own label names the regions rather than
// constraining them; with exactly four labels available, the four compasses
// then necessarily sit in four different regions, which is the "exactly one
// compass per region" half of the rule. Rows and columns of a band are taken
// whole, per the direction reading above -- the same-column-only reading is
// ruled out by R1C2's south clue of 5, which exceeds the 4 cells below R1C2 in
// column 2.

const shape = new Shape('5x5', 4, 'Raw');
const graph = cellGraph(shape);
const rows = graph.rows();
const cols = graph.columns();

// The cells a direction clue counts over, for a compass at (row, col).
const BANDS = {
  N: (row, col) => rows.slice(0, row - 1).flat(),
  S: (row, col) => rows.slice(row).flat(),
  W: (row, col) => cols.slice(0, col - 1).flat(),
  E: (row, col) => cols.slice(col).flat(),
};

// The drawn clues: the four cells carrying diagonals, and the numbers printed
// in their north/east/south/west triangles. Omitted directions are the
// triangles drawn empty.
const COMPASSES = [
  { cell: 'R1C2', clues: { E: 3, S: 5 } },
  { cell: 'R2C2', clues: { N: 0, W: 0, S: 0, E: 2 } },
  { cell: 'R3C3', clues: { N: 0, W: 0, S: 1, E: 2 } },
  { cell: 'R4C1', clues: { N: 3 } },
];

const label = (index) => index + 1;

const anchors = COMPASSES.map(
  (compass, i) => new Given(compass.cell, label(i)));

const regions = COMPASSES.map(
  (compass, i) => new ConnectedValues('', label(i)));

// One clue = "exactly n cells of the band hold this region's label". The
// look-and-say clue is the (count, value) pair `n` then the label, which also
// covers a clue of 0 ("this label does not appear in the band").
const counts = COMPASSES.flatMap((compass, i) => {
  const { row, col } = parseCellId(compass.cell);
  return Object.entries(compass.clues).map(
    ([direction, n]) =>
      new LookAndSay(`${n}${label(i)}`, ...BANDS[direction](row, col)));
});

return [
  shape,
  ...anchors,
  ...regions,
  ...counts,
];
