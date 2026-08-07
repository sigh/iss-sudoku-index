// Title: August 8, 2022: Hexagonal Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=G5q9Vlwk7As
// Source: https://tinyurl.com/2q6dg4a3

// Normal sudoku rules do not apply. Rules encoded here:
//   - The board is 49 hexagons in nine rows of 2, 5, 7, 7, 7, 7, 7, 5, 2 cells.
//     Every cell holds one of the digits 1-7.
//   - Seven bold-outlined regions, each a hexagon together with its six
//     neighbours, hold 1-7 once each.
//   - Digits that see each other -- along a row, or along either of the two
//     hexagonal diagonals -- may not repeat, so every maximal straight line in
//     each of the three directions is all-different.
// Nothing is omitted.
//
// The answer cannot live on the ISS main grid. Main-grid rows and columns are
// unconditionally all-different, and the only seven-cell sets these rules force
// apart are the seven regions and the fifteen full-length lines; those 22 sets
// admit exactly one partition of the 49 cells (the regions themselves), so no
// placement on a 7x7 grid makes both the grid's rows and its columns
// rule-forced groups. The board is therefore the var group VH on a 9x7 canvas,
// one canvas row per board row, and the main grid is reduced to one pinned
// cell. The board's rows are ragged, so the canvas has 14 cells that are not
// hexagons; the value range is widened to 8 to mark them.

const OFF_BOARD = 8;

// Board outline, read off the drawn grid: one [x, width] per row, top to
// bottom, where x locates the row's first cell in half-hexagon widths. Cells in
// a row are 2 apart and consecutive rows are offset by 1, so a hexagon's six
// neighbours sit at x+-2 in its own row and x+-1 in the rows above and below.
// Each row is held left-aligned in the canvas, in columns 1..width.
const ROWS = [
  [5, 2], [4, 5], [1, 7], [0, 7], [1, 7], [2, 7], [1, 7], [2, 5], [7, 2],
];

// The seven bold regions, each named by the hexagon at the centre of its
// flower, as [row, position within that row].
const REGION_CENTRES = [
  [2, 2], [3, 6], [4, 2], [5, 4], [6, 6], [7, 2], [8, 4],
];

// The twelve printed digits, as [row, position within that row, digit].
const GIVENS = [
  [2, 3, 5], [3, 2, 5], [3, 4, 7], [4, 3, 3], [4, 5, 6], [5, 2, 1],
  [5, 6, 7], [6, 3, 4], [6, 5, 2], [7, 4, 1], [7, 6, 5], [8, 3, 5],
];

const canvas = cellGraph('9x7');
const overlay = canvas.makeOverlay('VH');
const board = overlay.toVar('hexagonal board');

const xOf = (row, position) => ROWS[row - 1][0] + 2 * (position - 1);
// The var cell at board coordinates (row, x), or null when x is off the board
// or has the wrong parity for that row.
const cellAt = (row, x) => {
  if (row < 1 || row > ROWS.length) return null;
  const [first, width] = ROWS[row - 1];
  const offset = x - first;
  if (offset < 0 || offset > 2 * (width - 1) || offset % 2) return null;
  return board.cell(row, offset / 2 + 1);
};

const hexagons = ROWS.flatMap(([first, width], i) =>
  Array.from({ length: width }, (_, j) => cellAt(i + 1, first + 2 * j)));
const spare = overlay.cells().filter(cell => !hexagons.includes(cell));

// A flower: its centre and the six neighbours around it.
const FLOWER = [[0, 0], [0, 2], [0, -2], [1, 1], [1, -1], [-1, 1], [-1, -1]];
const regions = REGION_CENTRES.map(([row, position]) => FLOWER.map(
  ([dRow, dX]) => cellAt(row + dRow, xOf(row, position) + dX)));

// The three seeing directions: along a row, and the two diagonals. Each maximal
// run of cells in one direction is one all-different group, started from the
// cell whose predecessor in that direction is off the board.
const DIRECTIONS = [[0, 2], [1, 1], [1, -1]];
const lines = DIRECTIONS.flatMap(([dRow, dX]) => ROWS.flatMap(([first, width], i) =>
  Array.from({ length: width }, (_, j) => first + 2 * j)
    .filter(x => !cellAt(i + 1 - dRow, x - dX))
    .map(x => {
      const line = [];
      for (let row = i + 1, cx = x; cellAt(row, cx); row += dRow, cx += dX) {
        line.push(cellAt(row, cx));
      }
      return line;
    })));

return [
  new Shape('1x1', OFF_BOARD),
  new Given('R1C1', 1),
  board,
  // Hexagons hold 1-7; the canvas cells that are not hexagons hold 8 alone, so
  // they add nothing to the search.
  overlay.makeReplicate(new Given(hexagons[0], 1, 2, 3, 4, 5, 6, 7), hexagons),
  ...spare.map(cell => new Given(cell, OFF_BOARD)),
  ...GIVENS.map(([row, position, digit]) => new Given(cellAt(row, xOf(row, position)), digit)),
  ...regions.map(cells => new AllDifferent(...cells)),
  ...lines.map(cells => new AllDifferent(...cells)),
];
