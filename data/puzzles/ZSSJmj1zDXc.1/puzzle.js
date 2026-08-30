// Title: Battleships
// Author: Tyrgannus
// Video: https://www.youtube.com/watch?v=ZSSJmj1zDXc
// Source: https://tinyurl.com/2p8uy8wz

// Pure Battleships, no sudoku rules: a Raw 7x6 grid whose own cell value
// *is* the ship/water flag (SHIP=1, WATER=2) -- there is no separate digit
// meaning here, so no overlay is needed for that flag itself.
// Rules encoded: the fleet drawn in the payload's fleet-key legend (three
// 1-cell ships, two 2-cell ships, one 3-cell ship) placed straight (H or V),
// no two ships touching -- not even diagonally -- masked row/column
// occupied-cell-count clues (only some rows/columns carry one), and four
// wave cells forced to water.
//
// The payload's `symbol` layer carries two disjoint code families: the four
// board-interior marks (raw rows 4-5, inside the board) all use code 7,
// while the ten fleet-key marks below the board (raw rows 9-10, past the
// board's last row) use only codes 1/2/3/5. The sibling puzzle from the same
// setter and video (ZSSJmj1zDXc.2, same payload template) carries the
// identical split and settled it by internal row-clue arithmetic: its
// board-interior code-7 marks had to be wave cells, not hull segments,
// because one of them sat in a row whose printed clue was 0 occupied cells.
// That reading is applied here on the strength of the same code split, so
// this puzzle's board draws no shaped (bow/mid/stern/single) given
// ship-segment marker at all -- the rule text's "a given ship segment must
// be used as the part of a ship its shape represents" clause has nothing to
// encode on this board; the legend is reference art for the fleet
// composition only.
//
// Board width: the same sibling's legend runs exactly one raw column past
// its board's last column (legend reaches raw C12, board stops at raw C11).
// This puzzle's legend also reaches one raw column past raw C7 (to C8,
// R9C8/R10C8's stern piece), so by the same template the board's last
// column is raw C7, not C8 -- a 7-row by 6-column board, board-relative
// R1-R7 x C1-C6.

const grid = cellGraph(new Shape('7x6', '1-2', 'Raw'));
const SHIP = 1, WATER = 2;
const START = 1, NO_START = 2;

// One start-indicator overlay per (length, orientation): 1 = a ship of that
// length starts here (occupying this cell and the next length-1 cells in
// that direction), 2 = no. Length 1 has no orientation -- a single-cell ship
// "starts" and ends at the same cell.
const FLEET = [
  { length: 1, count: 3 },
  { length: 2, count: 2 },
  { length: 3, count: 1 },
];

const overlayDomain = (overlay) =>
  overlay.makeReplicate(new Given(overlay.cells()[0], START, NO_START));

// Var prefixes must be plain letters, so each (length, orientation) gets its
// own letter pair rather than an interpolated digit.
const PREFIXES = {
  1: { single: 'VA' },
  2: { h: 'VB', v: 'VC' },
  3: { h: 'VD', v: 'VE' },
};

const starts = {};
const domains = [];
for (const { length } of FLEET) {
  if (length === 1) {
    starts[1] = { single: grid.makeOverlay(PREFIXES[1].single) };
    domains.push(overlayDomain(starts[1].single));
  } else {
    starts[length] = {
      h: grid.makeOverlay(PREFIXES[length].h),
      v: grid.makeOverlay(PREFIXES[length].v),
    };
    domains.push(overlayDomain(starts[length].h));
    domains.push(overlayDomain(starts[length].v));
  }
}

// footprint() reads the same block()-returns-null board-edge check every
// rule below needs, so the bound lives in one place.
function footprint(cell, length, orientation) {
  if (length === 1) return [cell];
  return orientation === 'h'
    ? grid.block(cell, 1, length)
    : grid.block(cell, length, 1);
}

// A start flag is forced NO_START wherever its footprint would run off the
// board.
const startBounds = [];
for (const { length } of FLEET) {
  if (length === 1) continue;
  for (const cell of grid.cells()) {
    if (footprint(cell, length, 'h') === null) {
      startBounds.push(new Given(starts[length].h.at(cell), NO_START));
    }
    if (footprint(cell, length, 'v') === null) {
      startBounds.push(new Given(starts[length].v.at(cell), NO_START));
    }
  }
}

// Per-cell coverage: the main grid value at a cell is SHIP exactly when
// exactly one candidate start (any length/orientation) whose footprint
// covers it is active; two active candidates covering the same cell has no
// consistent grid value, so this equation also forbids overlaps between any
// two ships (same length or not, adjacent-in-line or crossing). Raw 1/2
// start values sum to 2*n - 1 when exactly one of the n candidates covering
// this cell is active, 2*n when none is -- a linear box-tiling trick
// generalized here to three lengths and both orientations scanned together
// per cell.
const coverage = grid.cells().map(cell => {
  const window = [];
  for (const { length } of FLEET) {
    if (length === 1) {
      window.push(starts[1].single.at(cell));
      continue;
    }
    for (let back = 0; back < length; back++) {
      const hStart = grid.step(cell, 0, -back);
      if (hStart !== null) window.push(starts[length].h.at(hStart));
      const vStart = grid.step(cell, -back, 0);
      if (vStart !== null) window.push(starts[length].v.at(vStart));
    }
  }
  return new Sum(2 * window.length - 2, ...window, [cell, -1]);
});

// Exact fleet composition: across a whole start-flag layer (42 cells, both
// orientations together for length > 1), the raw 1/2 values sum to
// 2*|cells| - (# active), so pinning that sum pins the active count exactly
// -- three 1s, two 2s, one 3, with no separate "count ships" bookkeeping
// needed.
const fleetCounts = FLEET.map(({ length, count }) => {
  const cells = length === 1
    ? starts[1].single.cells()
    : [...starts[length].h.cells(), ...starts[length].v.cells()];
  return new Sum(2 * cells.length - count, ...cells);
});

// No ship touches another, not even diagonally: for every candidate start,
// if it is active then every cell king-adjacent to its footprint (excluding
// the footprint itself) must be water. Checked per candidate rather than
// per pair of ship cells, so it needs no "same ship" bookkeeping -- this
// also forces a cell just beyond a ship's own end to water, so a real ship
// can never be mistaken for part of a longer run.
function footprintBuffer(cells) {
  const buffer = new Set();
  for (const cell of cells) {
    for (const neighbour of grid.kingNeighbours(cell)) buffer.add(neighbour);
  }
  for (const cell of cells) buffer.delete(cell);
  return buffer;
}
const noTouch = [];
for (const { length } of FLEET) {
  for (const cell of grid.cells()) {
    if (length === 1) {
      for (const b of footprintBuffer([cell])) {
        noTouch.push(new Or([
          new Given(starts[1].single.at(cell), NO_START),
          new Given(b, WATER),
        ]));
      }
      continue;
    }
    const hFoot = footprint(cell, length, 'h');
    if (hFoot !== null) {
      for (const b of footprintBuffer(hFoot)) {
        noTouch.push(new Or([
          new Given(starts[length].h.at(cell), NO_START),
          new Given(b, WATER),
        ]));
      }
    }
    const vFoot = footprint(cell, length, 'v');
    if (vFoot !== null) {
      for (const b of footprintBuffer(vFoot)) {
        noTouch.push(new Or([
          new Given(starts[length].v.at(cell), NO_START),
          new Given(b, WATER),
        ]));
      }
    }
  }
}

// Outside clues: number of ship-occupied cells in a row/column. Only rows
// 1, 3, 6 and columns 1, 3, 6 carry one; every other row/column carries
// none. `2*width - target` is the same raw-value-sum trick as above,
// applied to a whole row (6 cells) or column (7 cells) of the main grid.
const rowClues = { 1: 2, 3: 1, 6: 5 };
const colClues = { 1: 2, 3: 4, 6: 2 };
const rows = grid.rows();
const columns = grid.columns();
const houseClues = [
  ...Object.entries(rowClues).map(
    ([row, target]) => new Sum(2 * 6 - target, ...rows[Number(row) - 1])),
  ...Object.entries(colClues).map(
    ([col, target]) => new Sum(2 * 7 - target, ...columns[Number(col) - 1])),
];

// Wave cells, transcribed from the payload's board-interior code-7 symbol
// marks (see the header note on the code split). A wave cell cannot be
// occupied.
const waveCells = ['R3C3', 'R3C6', 'R4C1', 'R4C4'];

return [
  new Shape('7x6', '1-2', 'Raw'),
  ...Object.values(starts).flatMap(s => Object.values(s)).map(o => o.toVar('shipStart')),
  ...domains,
  ...startBounds,
  ...coverage,
  ...fleetCounts,
  ...noTouch,
  ...houseClues,
  ...waveCells.map(cell => new Given(cell, WATER)),
];
