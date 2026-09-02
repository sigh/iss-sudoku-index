// Title: Domino Trails 3
// Author: Blobz
// Video: https://www.youtube.com/watch?v=DzjEPIMyZRc
// Source: https://app.crackingthecryptic.com/sudoku/QtHJR7mqh9

// Rules encoded:
//  * Normal sudoku.
//  * Some cells are shaded (the "hedges"); the unshaded cells (the "trails")
//    form one orthogonally connected area with no loops.
//  * No 2x2 group of cells is entirely shaded or entirely unshaded.
//  * The trail cells are completely tiled by non-overlapping dominoes.
//  * Every caged cell is a trail cell; the digit placed in it is the number of
//    trail cells seen orthogonally from it, itself included, with hedges
//    blocking the view; the number printed in the cage corner is the sum of
//    the domino covering that cell.
//
// Three sentences of the rules are permissions rather than restrictions, so
// they add no constraint: "different parts of the trail may touch diagonally",
// "hedges do not need to connect to the edge of the grid" (hedges are given no
// connectivity or border rule at all), and "not all dominoes are marked with a
// cage" (an unclued domino gets no sum). Nothing else is omitted.

const HEDGE = 1;
const TRAIL = 2;

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const cells = graph.cells();

// The 22 single-cell cages: [row, column, the number printed in the corner].
// Each is a cage drawn around one cell, carrying one number; that number is a
// domino total, not a cage total -- 16 and 17 appear, which no single digit
// and no two-cell killer cage of distinct digits under 9 could show as a cage
// sum of its own cell.
const CLUES = [
  [1, 1, 16], [1, 2, 4], [1, 8, 3],
  [2, 6, 11], [2, 7, 15],
  [3, 1, 9], [3, 4, 5],
  [4, 3, 8], [4, 5, 10], [4, 7, 11], [4, 9, 12],
  [5, 2, 14],
  [6, 2, 6], [6, 4, 13], [6, 6, 12],
  [7, 7, 5],
  [8, 2, 17], [8, 3, 13], [8, 5, 7], [8, 8, 8], [8, 9, 16],
  [9, 7, 5],
];
const clueCells = CLUES.map(([row, col]) => makeCellId(row, col));

// --- The hedge / trail shading -------------------------------------------
const shade = graph.makeOverlay('VS');
const shadeVar = shade.toVar('hedge or trail');

const shading = [
  shade.makeReplicate(new Given(shade.cells()[0], HEDGE, TRAIL)),
  ...shade.at(clueCells).map(cell => new Given(cell, TRAIL)),
  new ConnectedValues('VS', TRAIL),
];

// No 2x2 group entirely one colour: each 2x2 window holds at least one hedge
// and at least one trail.
const no2x2 = [];
for (let row = 1; row < 9; row++) {
  for (let col = 1; col < 9; col++) {
    no2x2.push(new ContainAtLeast(
      `${HEDGE}_${TRAIL}`,
      shadeVar.cell(row, col), shadeVar.cell(row, col + 1),
      shadeVar.cell(row + 1, col), shadeVar.cell(row + 1, col + 1)));
  }
}

// --- "with no loops": the trail is a tree --------------------------------
// ConnectedValues already makes the trail cells exactly one component. A
// connected graph is acyclic precisely when its vertex count exceeds its edge
// count by one, so counting both closes the no-loop clause.
//
// VX holds, per cell, one more than the number of trail-trail edges running
// from that cell to its right and lower neighbours -- each orthogonal
// adjacency is counted at exactly one of its two endpoints, so summing VX over
// the grid counts every trail edge once. VS sums to 81 + (trail cells) and VX
// to 81 + (trail edges), so requiring the two sums to differ by one is
// vertices - edges = 1.
const edgeCount = graph.makeOverlay('VX');

// Reads [shade(cell), shade(n1), ..., shade(nk), edgeCount(cell)] for the k
// forward neighbours the cell has. Out-of-range shade values are rejected on
// sight so the compiled state stays (2 shades x 3 counts).
const edgeCountSpec = k => NFA.encodeSpec({
  startState: { i: 0, mine: null, count: 0 },
  transition: (state, value) => {
    if (state.i === 0) {
      if (value !== HEDGE && value !== TRAIL) return undefined;
      return { i: 1, mine: value, count: 0 };
    }
    if (state.i <= k) {
      if (value !== HEDGE && value !== TRAIL) return undefined;
      const edge = (state.mine === TRAIL && value === TRAIL) ? 1 : 0;
      return { i: state.i + 1, mine: state.mine, count: state.count + edge };
    }
    if (state.i === k + 1 && value === state.count + 1) {
      return { i: k + 2, mine: null, count: 0 };
    }
    return undefined;
  },
  accept: state => state.i === k + 2,
}, shape);
const edgeCountSpecs = [0, 1, 2].map(edgeCountSpec);

const edgeCounts = [
  edgeCount.makeReplicate(new Given(edgeCount.cells()[0], 1, 2, 3)),
  ...cells.map(cell => {
    const forward = [graph.step(cell, 0, 1), graph.step(cell, 1, 0)].filter(Boolean);
    // R9C9 has neither, so it can start no edge and its count is fixed.
    if (forward.length === 0) return new Given(edgeCount.at(cell), 1);
    return new NFA(edgeCountSpecs[forward.length], 'trail edges leaving cell',
      shade.at(cell), ...shade.at(forward), edgeCount.at(cell));
  }),
  new Sum(1,
    ...shade.cells().map(cell => [cell, 1]),
    ...edgeCount.cells().map(cell => [cell, -1])),
];

// --- The domino tiling ---------------------------------------------------
// VD names, for each cell, the direction of the other half of its domino, or
// NO_DOMINO for a hedge. `back` is the value the neighbour in that direction
// must hold to point back.
const NO_DOMINO = 1;
const DIRS = [
  { code: 2, back: 3, dRow: -1, dCol: 0 },
  { code: 3, back: 2, dRow: 1, dCol: 0 },
  { code: 4, back: 5, dRow: 0, dCol: -1 },
  { code: 5, back: 4, dRow: 0, dCol: 1 },
];
const domino = graph.makeOverlay('VD');

// A cell is a hedge exactly when it is in no domino: the dominoes cover every
// trail cell and nothing else.
const hedgeIffUnpaired = Pair.fnToKey(
  (shadeValue, dirValue) => (shadeValue === HEDGE) === (dirValue === NO_DOMINO),
  shape);

// Mutual agreement across one orthogonal edge: the near cell points along it
// exactly when the far cell points back. Applying this to every edge makes VD
// a partner map that is its own inverse, i.e. a perfect matching.
const agreementKey = dir => Pair.fnToKey(
  (near, far) => (near === dir.code) === (far === dir.back), shape);
const agreementKeys = new Map(DIRS.map(dir => [dir.code, agreementKey(dir)]));

const dominoes = [
  // A cell may only point at a direction that stays on the grid.
  ...cells.map(cell => new Given(domino.at(cell), NO_DOMINO,
    ...DIRS.filter(dir => graph.step(cell, dir.dRow, dir.dCol)).map(dir => dir.code))),
  ...cells.map(cell => new Pair(hedgeIffUnpaired, 'hedge iff in no domino',
    shade.at(cell), domino.at(cell))),
  // One Replicate per direction, stamped over every cell that has a neighbour
  // that way; between them they cover each orthogonal edge exactly once.
  ...DIRS
    .filter(dir => dir.dRow > 0 || dir.dCol > 0)
    .map(dir => domino.makeReplicate(
      new Pair(agreementKeys.get(dir.code), 'domino partners agree',
        domino.at(cells[0]), domino.at(graph.step(cells[0], dir.dRow, dir.dCol))),
      domino.at(cells.filter(cell => graph.step(cell, dir.dRow, dir.dCol))))),
];

// The corner number is the total of the two digits of the clued cell's domino,
// so it applies to whichever neighbour VD selected.
const dominoTotals = CLUES.map(([row, col, total]) => {
  const cell = makeCellId(row, col);
  return new Or(DIRS.flatMap(dir => {
    const other = graph.step(cell, dir.dRow, dir.dCol);
    return other ? [new And([
      new Given(domino.at(cell), dir.code),
      new Sum(total, cell, other),
    ])] : [];
  }));
});

// --- What a caged cell sees ----------------------------------------------
// Four directional run-length overlays carry the sightlines:
//   run(c) = 1                  if c is a hedge (a dummy, never read on)
//   run(c) = 1                  if c is a trail and the next cell that way is
//                                a hedge or off the grid
//   run(c) = 1 + run(next)      if c and the next cell that way are trails
// so run(c) counts the trail cells from c to the first blocked view. A caged
// cell's digit is then its four runs less 3, the cell itself being counted
// once per direction.
//
// Reads [shade(cell), shade(next), run(next), run(cell)]. Non-shade values are
// rejected in the first two phases: carrying all 9 grid values through both
// shade fields would multiply out past the compiler's state limit.
const runSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) {
      return (value === HEDGE || value === TRAIL)
        ? { phase: 1, mine: value } : undefined;
    }
    if (state.phase === 1) {
      return (value === HEDGE || value === TRAIL)
        ? { phase: 2, mine: state.mine, next: value } : undefined;
    }
    if (state.phase === 2) {
      return { phase: 3, mine: state.mine, next: state.next, nextRun: value };
    }
    if (state.phase === 3) {
      const expected = (state.mine === TRAIL && state.next === TRAIL)
        ? state.nextRun + 1 : 1;
      return value === expected ? { phase: 4 } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 4,
}, shape);

// A run overlay is only needed from each clued cell out to the grid edge, so
// each direction covers just the cells between a clue and that edge.
const rowRange = new Map();
const colRange = new Map();
for (const [row, col] of CLUES) {
  const r = rowRange.get(row) || { min: col, max: col };
  rowRange.set(row, { min: Math.min(r.min, col), max: Math.max(r.max, col) });
  const c = colRange.get(col) || { min: row, max: row };
  colRange.set(col, { min: Math.min(c.min, row), max: Math.max(c.max, row) });
}
const span = (from, to) => Array.from(
  { length: to - from + 1 }, (_, i) => from + i);

// `dRow`/`dCol` steps towards the grid edge this direction looks at, and
// `isEdge` marks the last cell before it.
const buildRun = (prefix, label, coveredCells, dRow, dCol, isEdge) => {
  const overlay = graph.makeOverlay(prefix, coveredCells);
  return {
    overlay,
    constraints: [
      overlay.toVar(label),
      ...coveredCells.map(cell => {
        if (isEdge(cell)) return new Given(overlay.at(cell), 1);
        const next = graph.step(cell, dRow, dCol);
        return new NFA(runSpec, 'trail run length',
          shade.at(cell), shade.at(next), overlay.at(next), overlay.at(cell));
      }),
    ],
  };
};

const runs = [
  buildRun('VRN', 'trail run looking up',
    [...colRange.entries()].flatMap(([col, { max }]) =>
      span(1, max).map(row => makeCellId(row, col))),
    -1, 0, cell => parseCellId(cell).row === 1),
  buildRun('VRT', 'trail run looking down',
    [...colRange.entries()].flatMap(([col, { min }]) =>
      span(min, 9).map(row => makeCellId(row, col))),
    1, 0, cell => parseCellId(cell).row === 9),
  buildRun('VRW', 'trail run looking left',
    [...rowRange.entries()].flatMap(([row, { max }]) =>
      span(1, max).map(col => makeCellId(row, col))),
    0, -1, cell => parseCellId(cell).col === 1),
  buildRun('VRE', 'trail run looking right',
    [...rowRange.entries()].flatMap(([row, { min }]) =>
      span(min, 9).map(col => makeCellId(row, col))),
    0, 1, cell => parseCellId(cell).col === 9),
];

const visibility = clueCells.map(cell => new Sum(3,
  ...runs.map(run => [run.overlay.at(cell), 1]),
  [cell, -1]));

return [
  shape,
  shadeVar,
  edgeCount.toVar('trail edges leaving cell'),
  domino.toVar('domino partner direction'),
  ...runs.flatMap(run => run.constraints),
  ...shading,
  ...no2x2,
  ...edgeCounts,
  ...dominoes,
  ...dominoTotals,
  ...visibility,
];
