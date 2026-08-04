// Title: Battleship Sums Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=ZJvrVG4XJn4
// Source: https://tinyurl.com/2duj274x

// Normal sudoku (default 9x9 rows/columns/boxes) plus a Battleship fleet:
// eight length-3 ships (horizontal or vertical), no two touching -- not even
// diagonally -- and five row/column clues giving the sum of the digits that
// fall on ship segments in that row/column. The other four rows and four
// columns carry no ship-sum clue at all.
// The grid's own drawn regions are the standard boxes, so no explicit
// Regions/Jigsaw constraint is needed.
// Three extra grey glyphs drawn on the board (R1C3, R1C7, R7C5) don't match
// the fleet-key shape and aren't named by the rules text; treated as
// decoration and not encoded.

const grid = cellGraph('9x9');

// Ship modelling: which cell starts a length-3 ship, and whether any cell
// holds a ship segment at all, are both solver-discovered. Three overlays:
//   VH -- 1 = a horizontal ship starts here (occupies this cell and the two
//         cells to its right), 2 = no.
//   VD -- 1 = a vertical ship starts here (this cell and the two below), 2 = no.
//   VS -- 1 = this cell holds a ship segment, 2 = open water.
const HSTART = grid.makeOverlay('VH');
const VSTART = grid.makeOverlay('VD');
const SHIP = grid.makeOverlay('VS');
const START = 1, NO_START = 2;
const SEGMENT = 1, WATER = 2;

// Every overlay cell keeps the same 2-value domain across the whole layer.
const overlayDomain = (overlay, ...values) =>
  overlay.makeReplicate(new Given(overlay.cells()[0], ...values));
const domains = [
  overlayDomain(HSTART, START, NO_START),
  overlayDomain(VSTART, START, NO_START),
  overlayDomain(SHIP, SEGMENT, WATER),
];

// A ship can only start where its full length-3 footprint stays on the grid;
// block() returns null past the edge, so this is read off the grid shape
// rather than hand-picked columns/rows.
const startBounds = [
  ...grid.cells()
    .filter(cell => grid.block(cell, 1, 3) === null)
    .map(cell => new Given(HSTART.at(cell), NO_START)),
  ...grid.cells()
    .filter(cell => grid.block(cell, 3, 1) === null)
    .map(cell => new Given(VSTART.at(cell), NO_START)),
];

// A cell is a ship segment exactly when exactly one candidate ship (at most
// 3 horizontal starts to its left/at it, at most 3 vertical starts above
// it/at it) is active; two active candidates covering the same cell has no
// consistent SHIP value, so this equation also forbids overlapping ships.
// Candidates whose own footprint runs off the grid are always NO_START (see
// startBounds), so including them here is harmless.
// Same trick as a 3x3-box tiling equation: raw 1/2 values sum to
// 2*n - 2 exactly when one candidate in the window is active (see
// Mondrian's Revenge, $ISS_REPO's pGPuqmK0WtE, for the derivation).
const coverage = grid.cells().map(cell => {
  const window = [];
  for (let back = 0; back <= 2; back++) {
    const start = grid.step(cell, 0, -back);
    if (start !== null) window.push(HSTART.at(start));
  }
  for (let back = 0; back <= 2; back++) {
    const start = grid.step(cell, -back, 0);
    if (start !== null) window.push(VSTART.at(start));
  }
  return new Sum(2 * window.length - 2, ...window, [SHIP.at(cell), -1]);
});

// Eight ships of three cells each is 24 segment cells total; combined with
// the per-cell coverage equation above (no overlaps, no partial ships) this
// is exactly "eight ships", without separately counting active starts.
const shipCount = new Sum(2 * grid.cells().length - 24, ...SHIP.cells());

// No ship touches another, not even diagonally: for every candidate start,
// if it is active then every cell king-adjacent to its footprint (excluding
// the footprint itself) must be water. This is checked per candidate rather
// than per pair of ship cells, so it needs no "same ship" bookkeeping.
const footprintBuffer = (footprint) => {
  const buffer = new Set();
  for (const cell of footprint) {
    for (const neighbour of grid.kingNeighbours(cell)) buffer.add(neighbour);
  }
  for (const cell of footprint) buffer.delete(cell);
  return buffer;
};
const noTouch = grid.cells().flatMap(cell => {
  const rules = [];
  const hFootprint = grid.block(cell, 1, 3);
  if (hFootprint !== null) {
    for (const b of footprintBuffer(hFootprint)) {
      rules.push(new Or([
        new Given(HSTART.at(cell), NO_START),
        new Given(SHIP.at(b), WATER),
      ]));
    }
  }
  const vFootprint = grid.block(cell, 3, 1);
  if (vFootprint !== null) {
    for (const b of footprintBuffer(vFootprint)) {
      rules.push(new Or([
        new Given(VSTART.at(cell), NO_START),
        new Given(SHIP.at(b), WATER),
      ]));
    }
  }
  return rules;
});

// Row/column ship-sum clues: the sum of digits on ship segments only, read
// as an NFA scanning `digit, shipFlag, digit, shipFlag, ...` down the house
// -- a digit is added to the running total only when its cell's own flag
// says SEGMENT.
const geom = grid.gridGeometry();
const maskedSumSpec = (target) => NFA.encodeSpec({
  startState: { pendingDigit: null, sum: 0 },
  transition: ({ pendingDigit, sum }, value) => {
    if (pendingDigit === null) return { pendingDigit: value, sum };
    const added = value === SEGMENT ? pendingDigit : 0;
    return { pendingDigit: null, sum: Math.min(sum + added, target + 1) };
  },
  accept: ({ pendingDigit, sum }) => pendingDigit === null && sum === target,
}, geom);
const shipSumClue = (cells, target) => new NFA(
  maskedSumSpec(target), `ship-sum-${target}`,
  ...cells.flatMap(cell => [cell, SHIP.at(cell)]));

// Read off the top/left outside-clue lanes; unlisted rows/columns carry no
// ship-sum clue at all.
const rowClues = { 2: 6, 4: 24, 6: 1, 7: 14, 8: 5 };
const colClues = { 1: 17, 3: 9, 5: 35, 7: 7, 9: 12 };

// Givens transcribed from the payload's `cells` values.
const givens = [
  ['R1C1', 1], ['R1C3', 2], ['R1C5', 3], ['R1C7', 4], ['R1C9', 5],
  ['R2C2', 6], ['R2C4', 7], ['R2C6', 8], ['R2C8', 9],
  ['R4C3', 5], ['R4C7', 6],
  ['R5C2', 7], ['R5C8', 8],
  ['R7C3', 9], ['R7C7', 7],
  ['R8C4', 6], ['R8C6', 4],
  ['R9C3', 8], ['R9C7', 3],
];

return [
  new Shape('9x9'),
  HSTART.toVar('horizontal ship starts'),
  VSTART.toVar('vertical ship starts'),
  SHIP.toVar('ship segments'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...domains,
  ...startBounds,
  ...coverage,
  shipCount,
  ...noTouch,
  ...Object.entries(rowClues).map(
    ([row, target]) => shipSumClue(grid.row(Number(row)), target)),
  ...Object.entries(colClues).map(
    ([col, target]) => shipSumClue(grid.column(Number(col)), target)),
];
