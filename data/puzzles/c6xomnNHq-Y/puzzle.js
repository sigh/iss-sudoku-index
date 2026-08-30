// Title: Unequal Length Maze
// Author: Eric Fox
// Video: https://www.youtube.com/watch?v=c6xomnNHq-Y
// Source: https://tinyurl.com/pw63xfe3

// Draw a single non-branching path through the centres of every empty cell,
// starting at S and ending at G, stepping between orthogonally adjacent
// cells, visiting each cell exactly once. Split the path into its maximal
// straight runs (a run ends where the path turns); no two runs adjacent
// along the path may share a length. "Length" is measured here in unit
// steps; a run's cell count is its step count plus one, so comparing step
// counts and comparing cell counts reject exactly the same grids.
// Every clause is encoded; nothing is omitted.
//
// The grid carries no digit meaning, so it uses the Raw grid type (no
// row/column/box rules) and every main-grid cell is pinned to a fixed dummy
// value. The whole answer lives in five Var overlays over the 81 non-wall
// cells:
//   - VPH/VPL: visit order 1..81 (position = 9*(VPH-1)+VPL). Every cell but
//     S has an open neighbour exactly one position earlier, chained from S
//     (position 1) to G (position 81): with both ends pinned this forces a
//     bijection onto 1..81, so no subtour elimination is needed on top of it.
//   - VD: the step direction the path arrives from (one of four codes), for
//     every cell but S.
//   - VR: the length, in steps, of the straight run ending at this cell.
//   - VP: the length of the *previous* straight run once this one closes
//     (10 = sentinel, no previous run yet).
// A run closes at a cell whose arrival direction differs from its
// predecessor's; the inequality is then checked on the predecessor's own
// VR/VP (the run that just closed vs. the one before it). G's own run is
// never closed by a later turn, so it is checked once more explicitly.

// Shaded/blocked cells, drawn as a single shade in the source.
const WALL_COORDS = [
  [10, 6], [10, 7], [1, 5], [1, 6], [2, 1], [3, 1], [3, 3], [3, 4], [3, 7],
  [3, 8], [4, 1], [7, 3], [7, 4], [7, 5], [7, 9], [8, 7], [9, 10], [9, 4],
  [9, 9],
];

const shape = new Shape('10x10', '', 'Raw');
const graph = cellGraph(shape);
const WALLS = WALL_COORDS.map(([r, c]) => makeCellId(r, c));
const wallSet = new Set(WALLS);
const START = makeCellId(1, 1);   // R1C1 = S
const GOAL = makeCellId(10, 10);  // R10C10 = G

const OPEN = graph.cells().filter(cell => !wallSet.has(cell));
const NONFIRST = OPEN.filter(cell => cell !== START);
const openNeighbours = cell => graph.neighbours(cell).filter(n => !wallSet.has(n));

const N = 9;              // 81 open cells = 9x9, so position fits two base-9 layers
const MAX_RUN = 9;        // longest possible straight run of steps on a 10-wide/tall grid
const NONE = MAX_RUN + 1; // VP sentinel: no previous run has closed yet

const posHigh = graph.makeOverlay('VPH', OPEN);
const posLow = graph.makeOverlay('VPL', OPEN);
const dir = graph.makeOverlay('VD', NONFIRST);
const runLen = graph.makeOverlay('VR', NONFIRST);
const prevRun = graph.makeOverlay('VP', NONFIRST);

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

// position(c) - position(b) = 1, i.e. b is c's predecessor on the path.
const isPredecessor = (c, b) => new Sum(1,
  [posHigh.at(c), N], [posLow.at(c), 1], [posHigh.at(b), -N], [posLow.at(b), -1]);

// The four unit steps, coded 1-4; only equality/inequality of the code is
// ever tested, so the mapping itself is arbitrary.
const DIR_CODES = { '-1,0': 1, '1,0': 2, '0,-1': 3, '0,1': 4 };
const directionCode = (from, to) => {
  const a = parseCellId(from), b = parseCellId(to);
  return DIR_CODES[`${b.row - a.row},${b.col - a.col}`];
};

// --- The Hamiltonian path itself: every cell but S has an open neighbour
// exactly one position earlier. Chained from G (position 81) down to S
// (position 1), it forces every position 1..81 to be used exactly once.
const endpoints = [
  new Given(posHigh.at(START), 1), new Given(posLow.at(START), 1),
  new Given(posHigh.at(GOAL), N), new Given(posLow.at(GOAL), N),
];
const path = NONFIRST.map(cell => new Or(
  openNeighbours(cell).map(b => isPredecessor(cell, b))));

// --- Arrival direction: VD(cell) is the geometric step from whichever open
// neighbour is cell's predecessor.
const arrival = NONFIRST.map(cell => new Or(
  openNeighbours(cell).map(b => new And([
    isPredecessor(cell, b),
    new Given(dir.at(cell), directionCode(b, cell)),
  ]))));

// --- Run length / previous run length, threaded from predecessor to
// successor along the path.
const runsFrom = cell => openNeighbours(cell).map(pred => {
  if (pred === START) {
    // The path's first edge: a run of length 1, no previous run yet.
    return new And([
      isPredecessor(cell, pred),
      new Given(runLen.at(cell), 1),
      new Given(prevRun.at(cell), NONE),
    ]);
  }
  // Same arrival direction as the predecessor: the run continues.
  const straight = new Sum(0, [dir.at(cell), 1], [dir.at(pred), -1]);
  // Different arrival direction: the predecessor closes its run here.
  const turns = new AllDifferent(dir.at(cell), dir.at(pred));
  return new And([
    isPredecessor(cell, pred),
    new Or([
      new And([
        straight,
        new Sum(1, [runLen.at(cell), 1], [runLen.at(pred), -1]),
        new Sum(0, [prevRun.at(cell), 1], [prevRun.at(pred), -1]),
      ]),
      new And([
        turns,
        // The run that just closed at `pred` must differ from the one
        // before it, unless there wasn't one yet.
        new Or([
          new Given(prevRun.at(pred), NONE),
          new AllDifferent(runLen.at(pred), prevRun.at(pred)),
        ]),
        new Given(runLen.at(cell), 1),
        new Sum(0, [prevRun.at(cell), 1], [runLen.at(pred), -1]),
      ]),
    ]),
  ]);
});
const runs = NONFIRST.map(cell => new Or(runsFrom(cell)));

// --- G's own run never gets closed by a later turn, so check it here.
const finalRun = new Or([
  new Given(prevRun.at(GOAL), NONE),
  new AllDifferent(runLen.at(GOAL), prevRun.at(GOAL)),
]);

return [
  shape,
  // No digit meaning anywhere on the main grid; the answer lives entirely
  // in the Var overlays below.
  graph.makeReplicate(new Given(graph.cells()[0], 1)),

  posHigh.toVar('position high'), posLow.toVar('position low'),
  dir.toVar('arrival direction'), runLen.toVar('run length'),
  prevRun.toVar('previous run length'),

  // Domains: position layers base 9 (exact for 81 open cells); direction one
  // of 4 codes; run length 1..9 (the longest possible straight run); previous
  // run length the same plus the "none yet" sentinel. Same template at every
  // overlay cell, so Replicate instead of one Given per cell.
  posHigh.makeReplicate(new Given(posHigh.cells()[0], ...range(1, N))),
  posLow.makeReplicate(new Given(posLow.cells()[0], ...range(1, N))),
  dir.makeReplicate(new Given(dir.cells()[0], 1, 2, 3, 4)),
  runLen.makeReplicate(new Given(runLen.cells()[0], ...range(1, MAX_RUN))),
  prevRun.makeReplicate(
    new Given(prevRun.cells()[0], ...range(1, MAX_RUN), NONE)),

  ...endpoints,
  ...path,
  ...arrival,
  ...runs,
  finalRun,
];
