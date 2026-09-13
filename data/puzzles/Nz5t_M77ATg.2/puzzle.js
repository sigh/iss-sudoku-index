// Title: Slitherlink
// Author: TeaTime
// Video: https://www.youtube.com/watch?v=Nz5t_M77ATg
// Source: http://pzv.jp/p.html?slither/10/10/22c3d6dcg1dbh83dg3bhcd8d8ddah1dg17dhc3dgb8c1c32d

// Draw a single loop along the grid's lattice edges (no branching, no
// self-touch). Each numbered cell's clue counts how many of that cell's
// four edges the loop uses, an outer-border edge counting the same as any
// interior one. No Sudoku digit layer at all.
//
// The loop is modelled as the boundary of a two-coloured (IN/OUT) side per
// cell -- the main 10x10 Raw grid itself (widened to a 3-value alphabet so
// the corner-type Var below fits the same value range; every real board
// cell is restricted straight back to {IN, OUT}) -- rather than one Var per
// edge: an edge between two orthogonally adjacent cells is on the loop
// exactly when they differ, and an outer-border edge is on the loop exactly
// when its own cell is IN (the area beyond the grid is implicitly OUT).
//
// A single connected IN region (ConnectedValues) plus a global
// convex/concave lattice-corner count forcing zero enclosed holes (Euler
// characteristic: for a connected region with H holes, convex - concave =
// 4*(1-H); requiring the total equal 4 forces H = 0) together pin IN's
// boundary to exactly one simple closed curve -- one loop, not several, and
// not a loop enclosing a hole. A lattice corner whose only IN cells are a
// diagonal pair is rejected outright, since there all four of its edges
// would carry the loop, which is the loop touching itself.

const IN = 1, OUT = 2;
const CONVEX = 1, PLAIN = 2, CONCAVE = 3;

const N = 10;
const shape = new Shape('10x10', 3, 'Raw');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// Real board cells (the loop's side) take only IN/OUT; the third value
// exists solely for the corner-type Var group below.
const sideDomain = graph.makeReplicate(new Given(gridCells[0], IN, OUT));

// The 11x11 lattice of cell corners (rows/cols 0..10), addressed through a
// locator-only overlay graph -- it names cells, it is not itself a puzzle
// grid.
const cornerGraph = cellGraph('11x11');
const corner = cornerGraph.makeOverlay('VC');
const allCorners = corner.cells();
const cornerAt = (row, col) => allCorners[row * (N + 1) + col];
const cornerDomain = corner.makeReplicate(new Given(allCorners[0], CONVEX, PLAIN, CONCAVE));

// --- Corner classification ---------------------------------------------
// Reads the corner's own code, then the side codes of the (up to four) grid
// cells around it, top-left to bottom-right; cells beyond the border are
// simply absent from the read (there is no virtual cell to classify against
// there -- the corner's own arity already reflects the border).
const cornerClass = inCount => (inCount === 1 ? CONVEX : inCount === 3 ? CONCAVE : PLAIN);

const cornerMachine = (arity, checkDiagonal) => NFA.encodeSpec({
  startState: { i: 0 },
  transition: (state, value) => {
    if (state.i === -1) return undefined;     // -1 is the accepting sink
    if (state.i === 0) return { i: 1, code: value, seen: [] };
    const seen = [...state.seen, value === IN];
    if (seen.length < arity) return { i: state.i + 1, code: state.code, seen };
    if (checkDiagonal) {
      const [topLeft, topRight, bottomLeft, bottomRight] = seen;
      if ((topLeft && bottomRight && !topRight && !bottomLeft)
        || (topRight && bottomLeft && !topLeft && !bottomRight)) return undefined;
    }
    return state.code === cornerClass(seen.filter(Boolean).length) ? { i: -1 } : undefined;
  },
  accept: ({ i }) => i === -1,
}, geometry.numValues);
// Only a fully interior corner has all four cells on the grid, so only it
// can show the diagonal self-touch pattern.
const cornerMachines = new Map([2, 4].map(arity => [arity, cornerMachine(arity, arity === 4)]));
// The four grid corners have a single cell beside them, so their
// classification is a relation between two cells rather than a scan.
const gridCornerKey = Pair.fnToKey(
  (code, sideValue) => code === cornerClass(sideValue === IN ? 1 : 0), geometry.numValues);

const cornerCodes = [];
for (let row = 0; row <= N; row++) {
  for (let col = 0; col <= N; col++) {
    const around = [[row, col], [row, col + 1], [row + 1, col], [row + 1, col + 1]]
      .filter(([r, c]) => r >= 1 && r <= N && c >= 1 && c <= N)
      .map(([r, c]) => makeCellId(r, c));
    cornerCodes.push(around.length === 1
      ? new Pair(gridCornerKey, 'corner', cornerAt(row, col), around[0])
      : new NFA(cornerMachines.get(around.length), 'corner', cornerAt(row, col), ...around));
  }
}

// A single loop. For a set of cells with no diagonal-pair corner,
//   (convex corners) - (concave corners) = 4 * (components - holes),
// so one connected IN region plus a corner total that forces that
// difference to 4 leaves the loop as one simple closed curve. Codes sit at
// 2 - 1 on a convex corner, 2 - 0 on a plain one and 2 + 1 on a concave one,
// so the required literal total is 2 * cornerCount - 4.
const singleLoop = [
  new ConnectedValues('', IN),
  new Sum(2 * allCorners.length - 4, ...allCorners),
];

// --- Per-cell edge-count clues ------------------------------------------
// Transcribed from the payload's own clue-cell array (r, c 1-indexed; a
// clueless cell is omitted here). Row/column 10 has no single-character
// cell id (row 10 would be base-17 'a'), so clues are keyed by [row, col]
// pairs rather than hand-written `RxC10` strings, and converted with
// makeCellId.
const CLUES = [
  [[1, 1], 2], [[1, 2], 2], [[1, 3], 2], [[1, 6], 3], [[1, 7], 3], [[1, 10], 1],
  [[2, 2], 3], [[2, 5], 2], [[2, 9], 1], [[2, 10], 3],
  [[3, 3], 1], [[3, 8], 3], [[3, 10], 3],
  [[4, 1], 3], [[4, 5], 3], [[4, 6], 1],
  [[5, 1], 2], [[5, 4], 3], [[5, 7], 3], [[5, 9], 3],
  [[6, 2], 3], [[6, 4], 3], [[6, 7], 3], [[6, 10], 0],
  [[7, 5], 1], [[7, 6], 3], [[7, 10], 1],
  [[8, 1], 2], [[8, 3], 3], [[8, 8], 2],
  [[9, 1], 3], [[9, 2], 3], [[9, 6], 1], [[9, 9], 3],
  [[10, 1], 2], [[10, 4], 1], [[10, 5], 2], [[10, 8], 3], [[10, 9], 2], [[10, 10], 3],
];

// Reads (own side, then each existing orthogonal neighbour's side) and
// counts edges where the neighbour differs from the cell's own side. A
// missing neighbour (the grid border) is a virtual OUT cell, so it
// contributes `borderCount` edges up front whenever the cell itself is IN.
const clueMachines = new Map();
const clueMachine = (target, borderCount) => {
  const key = `${target}_${borderCount}`;
  if (!clueMachines.has(key)) {
    clueMachines.set(key, NFA.encodeSpec({
      startState: { phase: 'own' },
      transition: (state, value) => {
        if (state.phase === 'own') {
          const initial = borderCount * (value === IN ? 1 : 0);
          return initial > target ? undefined : { phase: 'count', own: value, count: initial };
        }
        const next = state.count + (value !== state.own ? 1 : 0);
        return next > target ? undefined : { phase: 'count', own: state.own, count: next };
      },
      accept: ({ phase, count }) => phase === 'count' && count === target,
    }, geometry.numValues));
  }
  return clueMachines.get(key);
};

const clueConstraints = CLUES.map(([[row, col], target]) => {
  const cellId = makeCellId(row, col);
  const neighbourIds = graph.neighbours(cellId);
  const borderCount = 4 - neighbourIds.length;
  return new NFA(clueMachine(target, borderCount), 'clue-count', cellId, ...neighbourIds);
});

return [
  shape,
  corner.toVar('corner type'),
  sideDomain,
  cornerDomain,
  ...cornerCodes,
  ...singleLoop,
  ...clueConstraints,
];
