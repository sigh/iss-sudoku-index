// Title: Farore's Pearl
// Author: Wei-Hwa Huang
// Video: https://www.youtube.com/watch?v=83J-IuhRL2M
// Source: https://sudokupad.app/nNqmrtN2Lb

// Normal sudoku rules apply (standard 3x3 boxes -- Shape('9x9') default).
//
// "Orange bars in the grid sit between ALL adjacent pairs of consecutive
// digits" is a global negative constraint: every orthogonally adjacent pair
// of cells whose digits are consecutive is marked with a bar, so any
// adjacent pair without a bar must NOT be consecutive. This is the
// "scoped/global negative Kropki" pattern, restricted to the consecutive
// (white-dot) relation only -- there is no ratio (black-dot) rule here, so
// StrictKropki (which also bans unmarked ratio-2 pairs) is not the right
// class; explicit Pair constraints over marked vs. unmarked edges are used
// instead.
//
// The bar geometry is transcribed from the payload's `lines` wayPoints
// (color #EB7532). Per the SudokuPad coordinate convention, an integer
// waypoint is a grid corner, not a cell center (a cell center carries a
// `.5`), so each polyline is a path across grid corners; several bars that
// share a corner get drawn as one continuous stroke. Decoding them therefore
// requires walking each polyline and mapping every unit corner-to-corner
// segment to the pair of cells it separates -- a horizontal segment at
// row-corner r spanning col c..c+1 separates cell (r-1,c) from (r,c); a
// vertical segment at col-corner c spanning row r..r+1 separates cell
// (r,c-1) from (r,c) (0-indexed cell coordinates).
const barWaypoints = [
  [[3, 1], [4, 1]],
  [[5, 1], [5, 2]],
  [[4, 3], [4, 4]],
  [[6, 3], [6, 4]],
  [[7, 3], [7, 5], [2, 5], [2, 2]],
  [[1, 4], [1, 8], [8, 8], [8, 5]],
];

// barWaypoints is transcribed directly from the payload's 0-indexed corner
// coordinates (see convention note above); converting to a hand-written
// 1-indexed R/C table would just move the +1 arithmetic into error-prone
// manual transcription instead of code.
// lint-ok: zero-indexed-cell-math
const cellId = (r, c) => makeCellId(r + 1, c + 1);

const barEdges = [];
for (const path of barWaypoints) {
  for (let i = 0; i + 1 < path.length; i++) {
    const [r1, c1] = path[i];
    const [r2, c2] = path[i + 1];
    if (r1 === r2) {
      const lo = Math.min(c1, c2), hi = Math.max(c1, c2);
      for (let c = lo; c < hi; c++) barEdges.push([cellId(r1 - 1, c), cellId(r1, c)]);
    } else if (c1 === c2) {
      const lo = Math.min(r1, r2), hi = Math.max(r1, r2);
      for (let r = lo; r < hi; r++) barEdges.push([cellId(r, c1 - 1), cellId(r, c1)]);
    } else {
      throw new Error('non-axis-aligned bar segment');
    }
  }
}

const barKey = (a, b) => [a, b].sort().join('-');
const barredEdges = new Set(barEdges.map(([a, b]) => barKey(a, b)));

// Marked bars use the native WhiteDot (consecutive) constraint directly.
const whiteDots = barEdges.map(([a, b]) => new WhiteDot(a, b));

// Every other orthogonally adjacent cell pair must NOT be consecutive. Two
// Replicate templates (right-neighbour and down-neighbour, anchored at the
// grid's first cell) cover the two possible edge orientations; each is
// translated only to the left/top cell of each unbarred edge.
const graph = cellGraph('9x9');
const origin = graph.cells()[0];
const notConsecutiveKey = Pair.fnToKey((a, b) => a !== b + 1 && a !== b - 1, 9);

const unbarredOrigins = (step) => graph.cells().filter(cell => {
  const neighbour = step(cell);
  return neighbour && !barredEdges.has(barKey(cell, neighbour));
});
const rightStep = cell => graph.step(cell, 0, 1);
const downStep = cell => graph.step(cell, 1, 0);

const noBarHorizontal = graph.makeReplicate(
  new Pair(notConsecutiveKey, 'NoBar', origin, rightStep(origin)),
  unbarredOrigins(rightStep));
const noBarVertical = graph.makeReplicate(
  new Pair(notConsecutiveKey, 'NoBar', origin, downStep(origin)),
  unbarredOrigins(downStep));

return [
  new Shape('9x9'),

  new Given('R4C2', 2),
  new Given('R4C3', 7),
  new Given('R5C2', 4),
  new Given('R5C3', 1),
  new Given('R5C4', 5),
  new Given('R6C3', 9),
  new Given('R6C4', 1),

  ...whiteDots,
  noBarHorizontal,
  noBarVertical,
];
