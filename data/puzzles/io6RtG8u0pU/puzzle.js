// Title: How Good Is Your Logic?
// Author: Ahaupt
// Video: https://www.youtube.com/watch?v=io6RtG8u0pU
// Source: https://cracking-the-cryptic.web.app/sudoku/qjGQffjL6B

// Normal sudoku rules (default row/column/box all-different on Shape('9x9')).
// Digits are high-rise building heights. Where an arrow is drawn in a cell,
// that cell's own digit gives the count of buildings visible strictly beyond
// it, looking outward from that cell in the arrow's direction to the grid
// edge: a building is seen only if it is taller than every building already
// passed (taller buildings hide shorter ones behind them). The arrowed
// cell's own building is neither counted nor a blocker for its own clue: the
// arrow marks where the observer is standing, and "in this direction" reads
// as strictly outward from them.

// visSpec: visible-skyscraper-count NFA where the target count is not an
// external clue but the sightline's own first cell (the arrowed/bulb cell).
// State: `target` is that first cell's digit (null until read); `tallest`
// and `count` start at 0 on that first cell, since it sets the target but is
// not itself part of the counted, blockable sightline. `count` is clamped at
// target+1 as a sink once it can only fail. Accepts iff the final count
// equals the target.
const visSpec = NFA.encodeSpec({
  startState: { target: null, tallest: 0, count: 0 },
  transition: ({ target, tallest, count }, value) => {
    if (target === null) return { target: value, tallest: 0, count: 0 };
    if (value > tallest) {
      return { target, tallest: value, count: Math.min(count + 1, target + 1) };
    }
    return { target, tallest, count };
  },
  accept: ({ target, count }) => target !== null && count === target,
  maxDepth: 9,  // longest sightline is a full row/column: 9 cells
}, 9);

const DIRS = { right: [0, 1], left: [0, -1], up: [-1, 0], down: [1, 0] };

// sightline(row, col, dir): ordered cell ids from the bulb cell (row, col)
// to the grid edge along dir, bulb cell first. The line to the edge is a
// mechanical extension of the drawn (bulb, direction) pair, not a separate
// clue to transcribe.
function sightline(row, col, dir) {
  const [dr, dc] = DIRS[dir];
  const cells = [];
  while (row >= 1 && row <= 9 && col >= 1 && col <= 9) {
    cells.push(makeCellId(row, col));
    row += dr;
    col += dc;
  }
  return cells;
}

// Arrowed cells: [row, col, direction], one per drawn arrow bulb. One drawn
// arrow entry carries no coordinates and renders nothing (decorative), so it
// is omitted here -- 15 of the 16 drawn entries are real clues.
//
// Each bulb cell is the single grid cell whose square fully contains the
// drawn two-point waypoint segment (both endpoints, in each dimension, fall
// within one cell's [k, k+1) span) -- unambiguous once the segment's own
// bounding box is checked, unlike a per-endpoint nearest-cell snap, which
// mis-picks the neighbour on 8 of these 15 arrows because both endpoints of
// a one-cell-wide segment sit exactly on a shared cell boundary.
const arrowClues = [
  [1, 1, 'right'],  // arrow #0
  [3, 3, 'right'],  // arrow #1
  [3, 7, 'left'],   // arrow #3
  [4, 6, 'left'],   // arrow #4
  [4, 5, 'up'],     // arrow #5
  [4, 4, 'down'],   // arrow #6
  [6, 3, 'right'],  // arrow #7
  [6, 4, 'down'],   // arrow #8
  [6, 6, 'down'],   // arrow #9
  [6, 7, 'left'],   // arrow #10
  [7, 3, 'up'],     // arrow #11
  [8, 2, 'up'],     // arrow #12
  [7, 7, 'left'],   // arrow #13
  [8, 8, 'left'],   // arrow #14
  [1, 9, 'left'],   // arrow #15
];

const skyscraperConstraints = arrowClues.map(
  ([row, col, dir]) => new NFA(visSpec, 'sky', ...sightline(row, col, dir)));

return [
  new Shape('9x9'),
  ...skyscraperConstraints,
];
