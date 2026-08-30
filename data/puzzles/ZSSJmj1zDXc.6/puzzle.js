// Title: Square Jam
// Author: Eric Fox
// Video: https://www.youtube.com/watch?v=ZSSJmj1zDXc
// Source: https://tinyurl.com/msx7j4bd

// Rules encoded here:
//  - Divide the grid into square regions of orthogonally connected cells;
//    every cell lies in exactly one square. A number gives the side length
//    of the square it's in.
//  - Region borders may not form a four-way intersection: at an internal
//    grid point, the four cells around it may not all belong to squares that
//    border that point on all four of its sides.
// Nothing is omitted.
//
// The main grid holds the printed side length (1-10) of the square containing
// each cell, not a sudoku digit, so it is Raw: no row/column/box
// all-different (a row or column may repeat a side length freely -- two
// unrelated squares can both be size 3). 10 is the largest square the grid
// admits, so 1-10 is the full range a side length can take.
const SIZE = 10;
const shape = new Shape('10x10', '1-10', 'Raw');
const graph = cellGraph(shape);
const geom = graph.gridGeometry();

// Two boolean overlays (1 = yes, 2 = no), pinned only by the run-scan NFAs
// below, never given directly: RE(cell) = this cell is the rightmost column
// of its square; BE(cell) = this cell is the bottom row of its square.
const RE = graph.makeOverlay('VE');
const BE = graph.makeOverlay('VD');
const overlayDomain = (overlay, ...values) =>
  overlay.makeReplicate(new Given(overlay.cells()[0], ...values));

// A run-scan: reading a line of cells' side lengths interleaved with their
// edge flags, a run of s consecutive same-length cells must close exactly
// after s cells (the flag reads 1 on the closing cell, 2 on every other cell
// of the run), and the next cell always starts a fresh run -- the flag being
// forced by the countdown, not read freely, is what stops two same-size
// squares in a row from merging into one long run. Applied along every row
// (with RE) and every column (with BE) using the one shared side-length
// value, this is the condition that the grid partitions into distinct
// axis-aligned squares of the printed size: a maximal same-square run is
// s cells long in every row and every column it meets, which is a solid
// s-by-s block.
// State: p is the phase ('sz' expects a side length, 'edge' expects the flag
// for the cell just read); L is how many cells of the current run are still
// to come (0 = a fresh run starts here); after is L minus the cell just read.
const runSpec = {
  startState: { p: 'sz', L: 0 },
  transition: (state, value) => {
    if (state.p === 'sz') {
      if (state.L === 0) return { p: 'edge', sz: value, after: value - 1 };
      if (value !== state.sz) return undefined;
      return { p: 'edge', sz: value, after: state.L - 1 };
    }
    // state.p === 'edge': value is the flag for the cell just read above.
    const expected = state.after === 0 ? 1 : 2;
    if (value !== expected) return undefined;
    return state.after === 0
      ? { p: 'sz', L: 0 }
      : { p: 'sz', L: state.after, sz: state.sz };
  },
  accept: (state) => state.p === 'sz' && state.L === 0,
};
const runNFA = NFA.encodeSpec(runSpec, geom);

const interleave = (values, flags) => values.flatMap((v, i) => [v, flags[i]]);

const lines = [];
for (let i = 1; i <= SIZE; i++) {
  lines.push(new NFA(runNFA, `row${i}`, ...interleave(graph.row(i), RE.row(i))));
  lines.push(
    new NFA(runNFA, `col${i}`, ...interleave(graph.column(i), BE.column(i))));
}

// No four-way intersection: at every internal grid point (between rows R,R+1
// and columns C,C+1), at least one of the point's four incident borders must
// be absent, i.e. at least one adjacent pair around the point shares a
// square. A border exists exactly where the "earlier" cell's edge flag is
// set: RE between a cell and its right neighbour, BE between a cell and its
// neighbour below.
const noCross = [];
for (let r = 1; r < SIZE; r++) {
  for (let c = 1; c < SIZE; c++) {
    const nw = makeCellId(r, c);
    const ne = makeCellId(r, c + 1);
    const sw = makeCellId(r + 1, c);
    noCross.push(new Or([
      new Given(RE.at(nw), 2),   // no border between NW and NE
      new Given(BE.at(nw), 2),   // no border between NW and SW
      new Given(RE.at(sw), 2),   // no border between SW and SE
      new Given(BE.at(ne), 2),   // no border between NE and SE
    ]));
  }
}

// The nine printed side-length clues, as [row, col, side length] (pu_q
// "number" layer, penpa point index -> row/column per the payload's cell-layer
// formula).
const givens = [
  [1, 4, 3], [2, 6, 1], [3, 8, 3], [5, 9, 3], [7, 9, 2],
  [9, 8, 2], [10, 2, 1], [10, 4, 1], [10, 6, 3],
].map(([r, c, size]) => new Given(makeCellId(r, c), size));

return [
  shape,
  RE.toVar('RightEdge'), BE.toVar('BottomEdge'),
  overlayDomain(RE, 1, 2), overlayDomain(BE, 1, 2),
  ...givens,
  ...lines,
  ...noCross,
];
