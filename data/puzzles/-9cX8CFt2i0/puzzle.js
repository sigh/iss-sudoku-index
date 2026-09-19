// Title: Slithering Heights
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=-9cX8CFt2i0
// Source: https://sudokupad.app/x6z9xkvdjb

// Rules encoded here:
//  1. Normal sudoku rules apply (default row/column/3x3-box all-different).
//  2. Draw a loop that travels along cell edges and does not touch itself.
//  3. Every cell is surrounded by eight dots (its four edges and its four
//     corners). A cell carrying a gold circle: its solution digit equals how
//     many of that cell's eight dots the loop visits.
//  4. A black dot between two orthogonally adjacent cells: one digit is
//     double the other (built-in BlackDot).
// Nothing is omitted.
//
// The gold circles carry no printed value of their own: "the digit in a gold
// circle" is the digit the solver places there, read against the loop.
//
// The loop is modelled as the boundary of an IN/OUT side per cell (outside
// the 9x9 board is fixed OUT): a unit edge is on the loop exactly when the
// two cells it separates differ, and a lattice corner is "visited" exactly
// when its (up to four) surrounding cells are not all equal. A corner where
// the two cells diagonally IN are the only ones IN (the other two diagonal
// OUT) is where the loop would cross itself -- the only 2x2 pattern that
// gives a lattice point degree four -- so that pattern is forbidden outright.
// Every corner is also classified convex (exactly one of its cells IN) or
// concave (exactly three IN); summing +1 per convex corner and -1 per concave
// corner over all 100 lattice points to a fixed total of 4 is the standard
// "one simply-connected region, no enclosed hole" closure (a lone rectangle's
// four corners are its only convex points, giving exactly this total). That,
// together with IN being a single connected region (ConnectedValues), pins
// the boundary to exactly one simple closed loop, matching "a loop ... that
// does not touch itself".

const OFF = 1, ON = 2;
const shape = new Shape('9x9');
const graph = cellGraph(shape);

// Cells carrying a gold circle, drawn with no digit of their own (see above).
const CIRCLES = [
  'R9C1', 'R8C1', 'R7C1', 'R3C1', 'R2C1', 'R1C1', 'R6C1', 'R6C2', 'R6C3',
  'R5C3', 'R9C3', 'R9C4', 'R4C4', 'R7C4', 'R2C4', 'R1C5', 'R8C5', 'R8C6',
  'R1C6', 'R8C2', 'R2C3', 'R3C3', 'R4C5', 'R9C9', 'R4C3', 'R3C4', 'R4C2',
  'R2C7', 'R7C7', 'R6C8', 'R1C9', 'R4C8', 'R5C9',
];

// Black-dot pairs (Kropki doubling), read off the six drawn black dots.
const BLACK_DOTS = [
  ['R2C1', 'R2C2'], ['R7C1', 'R7C2'], ['R7C2', 'R7C3'],
  ['R3C1', 'R4C1'], ['R3C4', 'R3C5'], ['R6C4', 'R6C5'],
];

// --- Loop side overlay: IN cells are enclosed by the loop. ---
const side = graph.makeOverlay('VIO');
const sideVar = side.toVar('loopSide');
const sideDomain = side.makeReplicate(new Given(side.cells()[0], OFF, ON));

// --- Geometry: the dots (edges + corners) drawn round every cell. ---
// A "part" is one edge or one corner of the lattice, named by the cells that
// meet there; a cell off the 9x9 board is implicitly OUT rather than a Var.
const makePart = (key, coords) => ({
  key,
  cells: coords
    .filter(([r, c]) => r >= 1 && r <= 9 && c >= 1 && c <= 9)
    .map(([r, c]) => sideVar.cell(r, c)),
});
const hEdge = (r, c) => makePart('H' + r + '_' + c, [[r, c], [r + 1, c]]);
const vEdge = (r, c) => makePart('V' + r + '_' + c, [[r, c], [r, c + 1]]);
const corner = (r, c) => makePart('P' + r + '_' + c,
  [[r, c], [r, c + 1], [r + 1, c], [r + 1, c + 1]]);

// The eight dots a gold circle in `cell` counts: its four edges, then its
// four corners.
const dotsAround = (cell) => {
  const { row, col } = parseCellId(cell);
  return {
    edges: [hEdge(row - 1, col), hEdge(row, col), vEdge(row, col - 1), vEdge(row, col)],
    corners: [corner(row - 1, col - 1), corner(row - 1, col),
    corner(row, col - 1), corner(row, col)],
  };
};

// --- Per-corner state machine: reads the (1, 2 or 4) real cells at a lattice
// point, forbids the self-touch pattern at a fully-interior point, then reads
// back visited/convex/concave so those flags live in Vars other constraints
// can read. Memoized by real-cell count, since only three shapes occur. ---
const memoSpec = (build) => {
  const cache = new Map();
  return (n) => (cache.has(n) ? cache : cache.set(n, build(n))).get(n);
};
const cornerSpecFor = memoSpec((realCount) => NFA.encodeSpec({
  startState: { phase: 0, vals: [] },
  transition(state, value) {
    // Reduce each read to IN/OUT immediately: carrying the raw 1-9 digit
    // would blow up the compiled-state count (9^4 combinations at a fully
    // interior corner) for no benefit -- only IN-or-not is ever read again.
    if (state.phase < realCount) {
      const vals = [...state.vals, value === ON];
      // The last real-cell read also computes the flags in the same step --
      // there is no symbol left over to spend on a separate "compute" phase.
      if (vals.length < realCount) return { phase: state.phase + 1, vals };
      if (realCount === 4) {
        const [nw, ne, sw, se] = vals;
        // Diagonal IN pair with the other two OUT: the loop would cross
        // itself here. Forbid it outright.
        if (nw === se && ne === sw && nw !== ne) return undefined;
      }
      const inCount = vals.filter(Boolean).length;
      return {
        phase: realCount,
        visited: (inCount !== 0 && inCount !== 4) ? ON : OFF,
        convex: inCount === 1 ? ON : OFF,
        concave: inCount === 3 ? ON : OFF,
      };
    }
    if (state.phase === realCount) {
      return value === state.visited
        ? { phase: realCount + 1, convex: state.convex, concave: state.concave }
        : undefined;
    }
    if (state.phase === realCount + 1) {
      return value === state.convex
        ? { phase: realCount + 2, concave: state.concave }
        : undefined;
    }
    if (state.phase === realCount + 2) {
      return value === state.concave ? { phase: realCount + 3 } : undefined;
    }
    return undefined;
  },
  accept: (state) => state.phase === realCount + 3,
}, shape));

// --- Per-edge state machine for an interior edge (two real cells): reads
// both sides, then reads back whether the edge is used (the two sides
// differ). A border edge (one real cell, the other side implicitly OUT) needs
// no machine at all -- "used" there is just that cell's own OFF/ON value, so
// the edge-visited map below points straight at the side cell. ---
const edgeSpec2 = NFA.encodeSpec({
  startState: { phase: 0 },
  transition(state, value) {
    if (state.phase === 0) return { phase: 1, a: value === ON };
    if (state.phase === 1) return { phase: 2, used: (value === ON) !== state.a ? ON : OFF };
    if (state.phase === 2) return value === state.used ? { phase: 3 } : undefined;
    return undefined;
  },
  accept: (state) => state.phase === 3,
}, shape);

// --- Every one of the 100 lattice corners: visited/convex/concave flags. ---
const cornerFlags = new Map(); // key -> { visited, convex, concave }
const cornerVisitedVar = new Var('CV', 'cornerVisited', 100);
const cornerConvexVar = new Var('CX', 'cornerConvex', 100);
const cornerConcaveVar = new Var('CN', 'cornerConcave', 100);
const cornerNfas = [];
{
  let i = 0;
  for (let r = 0; r <= 9; r++) {
    for (let c = 0; c <= 9; c++) {
      const part = corner(r, c);
      i++;
      const visited = cornerVisitedVar.cell(i);
      const convex = cornerConvexVar.cell(i);
      const concave = cornerConcaveVar.cell(i);
      cornerFlags.set(part.key, { visited, convex, concave });
      cornerNfas.push(new NFA(
        cornerSpecFor(part.cells.length), 'corner-' + part.key,
        ...part.cells, visited, convex, concave));
    }
  }
}

// --- Only the edges some gold circle actually counts. ---
const edgeParts = new Map(); // key -> part
for (const cell of CIRCLES) {
  for (const part of dotsAround(cell).edges) {
    if (!edgeParts.has(part.key)) edgeParts.set(part.key, part);
  }
}
const edgePartList = [...edgeParts.values()];
const interiorEdgeParts = edgePartList.filter(part => part.cells.length === 2);
const edgeVisitedVar = new Var('DE', 'edgeVisited', interiorEdgeParts.length);
const edgeVisited = new Map(); // key -> cell id
edgePartList.forEach((part) => {
  // A border edge's one real cell already carries the OFF/ON "used" value.
  if (part.cells.length === 1) edgeVisited.set(part.key, part.cells[0]);
});
interiorEdgeParts.forEach((part, i) => edgeVisited.set(part.key, edgeVisitedVar.cell(i + 1)));
const edgeNfas = interiorEdgeParts.map(part => new NFA(
  edgeSpec2, 'edge-' + part.key, ...part.cells, edgeVisited.get(part.key)));

// --- Gold-circle digit = count of visited dots. Each flag is OFF/ON (1/2),
// so summing the 8 flags reads 8 + (visited count); subtracting the digit
// must then leave the constant 8. ---
const circleSums = CIRCLES.map((cell) => {
  const dots = dotsAround(cell);
  const parts = [
    ...dots.edges.map(p => edgeVisited.get(p.key)),
    ...dots.corners.map(p => cornerFlags.get(p.key).visited),
  ];
  return new Sum(8, [cell, -1], ...parts);
});

// --- No-hole closure: sum convex(+1)/concave(-1) over all 100 corners. Both
// flag sets have 100 cells at the same OFF/ON offset, so the offset cancels
// and this sum is exactly (#convex - #concave); target 4 is a single simple
// closed boundary with no enclosed hole. ---
const allConvex = [...cornerFlags.values()].map(f => f.convex);
const allConcave = [...cornerFlags.values()].map(f => f.concave);
const holeClosure = new Sum(4, ...allConvex, ...allConcave.map(c => [c, -1]));

return [
  shape,
  sideVar,
  sideDomain,
  new ConnectedValues('VIO', ON),
  cornerVisitedVar, cornerConvexVar, cornerConcaveVar,
  ...cornerNfas,
  edgeVisitedVar,
  ...edgeNfas,
  holeClosure,
  ...circleSums,
  ...BLACK_DOTS.map(([a, b]) => new BlackDot(a, b)),
];
