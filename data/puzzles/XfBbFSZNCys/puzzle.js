// Title: Mind the Gap
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=XfBbFSZNCys
// Source: https://sudokupad.app/tl8tkze8mn

// Normal sudoku rules apply.
//
// SAFETY STRIPS - Digits separated by a yellow safety strip are in a 2:1 ratio
// (ie one is double the other.)
//
// GAP LOOP - Extend the 'gap' (ie the grey lines) along cell edges so that it
// forms a single loop, which cannot touch itself. Even and odd digits may not
// touch except across the gap.
//
// PATHFINDER - Draw a path from cell centre to cell centre from the blue dot
// (R4C1) to the red pin (R4C4), which may move orthogonally or diagonally. It
// can't cross or touch the gap, except at yellow safety strips. Adjacent digits
// on the path differ by at least 3.
//
// Every clause above is encoded; no rule is omitted.

const IN = 1;                 // VG codes: the two sides of the gap loop.
const OUT = 2;                // The area beyond the grid border counts as OUT.
const CONVEX = 1;             // VC codes: how many of a lattice corner's four
const PLAIN = 2;              // surrounding cells are IN - exactly one, exactly
const CONCAVE = 3;            // three, or neither (zero, two or four).
const NONE = 9;               // VP code: this cell makes no outgoing path step.

// The eight king directions in row-major order, so a VP direction code is the
// index + 1 and a direction and its reverse always sum to 9.
const DIRS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

const START = 'R4C1';         // blue dot
const END = 'R4C4';           // red pin

const graph = cellGraph('9x9');
const numValues = graph.gridGeometry().numValues;
const gridCells = graph.cells();

const side = graph.makeOverlay('VG');
const sideVar = side.toVar('gap side');
const stepCode = graph.makeOverlay('VP');
const posLow = graph.makeOverlay('VJ');
const posHigh = graph.makeOverlay('VK');
// The 10x10 lattice of cell corners, indexed (row, col) from 0 to 9. That graph
// is a locator only: VC1..VC100 run row-major over the corners.
const corner = cellGraph('10x10').makeOverlay('VC');
const cornerAt = (row, col) => corner.cells()[row * 10 + col];

// --- Drawn data -------------------------------------------------------------

// The grey bars, read as the cell edges they lie along. Nineteen lie between two
// cells; the twentieth is on the right grid border of R2C9.
const drawnGapEdges = [
  ['R2C1', 'R3C1'], ['R2C5', 'R3C5'], ['R2C6', 'R3C6'], ['R2C9', 'R3C9'],
  ['R4C4', 'R5C4'], ['R5C1', 'R6C1'], ['R6C8', 'R7C8'], ['R7C1', 'R8C1'],
  ['R2C1', 'R2C2'], ['R2C4', 'R2C5'], ['R2C6', 'R2C7'], ['R5C4', 'R5C5'],
  ['R6C1', 'R6C2'], ['R6C8', 'R6C9'], ['R7C1', 'R7C2'], ['R7C4', 'R7C5'],
  ['R7C7', 'R7C8'], ['R8C4', 'R8C5'], ['R9C4', 'R9C5'],
];
const drawnGapBorderCells = ['R2C9'];

// The six yellow strips, read as the cell edges they straddle.
const safetyStrips = [
  ['R1C2', 'R2C2'], ['R1C6', 'R2C6'], ['R2C4', 'R2C5'],
  ['R6C6', 'R6C7'], ['R8C6', 'R9C6'], ['R9C8', 'R9C9'],
];

// --- Gap loop ---------------------------------------------------------------

// The gap is held as a side code per cell rather than a flag per edge: an edge
// between two cells carries gap exactly when their side codes differ, and a
// border edge carries gap exactly when its cell is IN. The edge sets reachable
// this way are exactly those in which every lattice corner meets an even number
// of gap edges, which a closed loop does.
//
// With only two side codes, AllDifferent over an edge's two cells is exactly
// "the gap runs between them".
const drawnGap = [
  ...drawnGapEdges.map(([a, b]) => new AllDifferent(side.at(a), side.at(b))),
  ...drawnGapBorderCells.map(cell => new Given(side.at(cell), IN)),
];

// Even and odd digits may not touch except across the gap: two orthogonally
// adjacent cells on the same side of the gap share their parity. Reads
// (side, digit) for each cell; once the two sides are seen to differ the rest of
// the read is unconstrained.
const parityMachine = NFA.encodeSpec({
  startState: { phase: 'sideA' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'sideA': return { phase: 'digitA', sideA: value };
      case 'digitA': return { phase: 'sideB', sideA: state.sideA, parityA: value % 2 };
      case 'sideB':
        return value === state.sideA
          ? { phase: 'digitB', parityA: state.parityA }
          : { phase: 'done' };
      case 'digitB': return value % 2 === state.parityA ? { phase: 'done' } : undefined;
      case 'done': return { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, numValues);

// Right and down steps only, so each orthogonally adjacent pair is read once.
const orthogonalPairs = gridCells.flatMap(cell => [graph.step(cell, 0, 1), graph.step(cell, 1, 0)]
  .filter(Boolean)
  .map(other => [cell, other]));

const parity = orthogonalPairs.map(([a, b]) =>
  new NFA(parityMachine, 'parity', side.at(a), a, side.at(b), b));

// Corner classification. Reads the corner's own code, then the side codes of the
// grid cells around it, top-left to bottom-right; cells beyond the border are OUT
// and are simply absent from the read. A corner whose only IN cells are a
// diagonal pair is rejected: there all four of its edges carry gap, which is the
// gap touching itself.
const cornerClass = inCount =>
  (inCount === 1 ? CONVEX : inCount === 3 ? CONCAVE : PLAIN);

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
    return state.code === cornerClass(seen.filter(Boolean).length)
      ? { i: -1 } : undefined;
  },
  accept: ({ i }) => i === -1,
}, numValues);
// Only a fully interior corner has all four cells on the grid, so only it can
// show the diagonal pattern.
const cornerMachines = new Map([2, 4].map(
  arity => [arity, cornerMachine(arity, arity === 4)]));
// The four grid corners have a single cell beside them, so their classification
// is a relation between two cells rather than a scan.
const gridCornerKey = Pair.fnToKey(
  (code, sideValue) => code === cornerClass(sideValue === IN ? 1 : 0), numValues);

const cornerCells = [];
const cornerCodes = [];
for (let row = 0; row <= 9; row++) {
  for (let col = 0; col <= 9; col++) {
    const around = [[row, col], [row, col + 1], [row + 1, col], [row + 1, col + 1]]
      .filter(([r, c]) => r >= 1 && r <= 9 && c >= 1 && c <= 9)
      .map(([r, c]) => sideVar.cell(r, c));
    cornerCells.push(cornerAt(row, col));
    cornerCodes.push(around.length === 1
      ? new Pair(gridCornerKey, 'corner', cornerAt(row, col), around[0])
      : new NFA(cornerMachines.get(around.length), 'corner',
        cornerAt(row, col), ...around));
  }
}

// A single loop. For a set of cells with no diagonal-pair corner,
//   (convex corners) - (concave corners) = 4 * (components - holes),
// so one connected IN region plus a corner total that forces that difference to 4
// leaves the gap as one simple closed loop. Sum reads the VC codes, which sit at
// 2 - 1 on a convex corner, 2 - 0 on a plain one and 2 + 1 on a concave one, so
// the required total is 2 * 100 - 4.
const singleLoop = [
  new ConnectedValues('VG', IN),
  new Sum(2 * cornerCells.length - 4, ...cornerCells),
];

// --- Pathfinder -------------------------------------------------------------

const dirValue = (from, to) => {
  const a = parseCellId(from);
  const b = parseCellId(to);
  return 1 + DIRS.findIndex(([dR, dC]) => a.row + dR === b.row && a.col + dC === b.col);
};

const pathDomains = gridCells.map(cell => {
  const directions = DIRS
    .map(([dR, dC], i) => [i + 1, graph.step(cell, dR, dC)])
    .filter(([, other]) => other)
    .map(([value]) => value);
  if (cell === END) return new Given(stepCode.at(cell), NONE);
  if (cell === START) return new Given(stepCode.at(cell), ...directions);
  return new Given(stepCode.at(cell), ...directions, NONE);
});

// Incoming steps. Reads the cell's own step code, then each king neighbour's;
// `arrivals` holds, per neighbour, the direction code that would step it onto
// this cell. The start takes no incoming step, the end takes one, and every other
// cell takes one exactly when it makes an outgoing step.
const inDegreeMachine = (arrivals, want) => NFA.encodeSpec({
  startState: { i: 0 },
  transition: (state, value) => {
    if (state.i === 0) {
      return { i: 1, want: want === null ? (value === NONE ? 0 : 1) : want, count: 0 };
    }
    if (state.i > arrivals.length) return undefined;
    const count = state.count + (value === arrivals[state.i - 1] ? 1 : 0);
    return count > state.want
      ? undefined : { i: state.i + 1, want: state.want, count };
  },
  accept: state => state.i === arrivals.length + 1 && state.count === state.want,
}, numValues);

const inDegrees = gridCells.map(cell => {
  const neighbours = graph.kingNeighbours(cell);
  const arrivals = neighbours.map(other => 9 - dirValue(cell, other));
  const want = cell === START ? 0 : cell === END ? 1 : null;
  return new NFA(inDegreeMachine(arrivals, want), 'path-degree',
    stepCode.at(cell), ...stepCode.at(neighbours));
});

// Position along the path, in base 9: VJ is the units and VK the nines, both
// 1-based, so the pair counts modulo 81. The start is pinned to the first
// position and each step advances the pair by one, so a set of steps closing into
// a cycle would need a length that is a multiple of 81; the start and the end are
// on the path and not on such a cycle, leaving it at most 79 cells.
const advance = value => (value === 9 ? 1 : value + 1);

// One step, read as the unordered pair of its two cells: the step is in use when
// either cell's code points at the other. Symbols are the two step codes, the two
// digits, then the side codes this step type has to agree on, then VJ and VK for
// each cell. `held` carries whichever single earlier symbol the next check needs.
const stepMachine = (forward, sideCount) => {
  const backward = 9 - forward;
  const total = 8 + sideCount;
  return NFA.encodeSpec({
    startState: { i: 0 },
    transition: (state, value) => {
      const { i, dir } = state;
      if (i === 0) return { i: 1, dir: value === forward ? 'fwd' : 'unused' };
      if (i === 1) {
        if (value !== backward) return { i: 2, dir };
        // Each code pointing at the other is a two-cell cycle, not a path step.
        return dir === 'fwd' ? undefined : { i: 2, dir: 'back' };
      }
      if (i === 2) return { i: 3, dir, held: dir === 'unused' ? 0 : value };
      if (i === 3) {
        if (dir !== 'unused' && Math.abs(state.held - value) < 3) return undefined;
        return { i: 4, dir };
      }
      if (i < 4 + sideCount) {
        if (dir === 'unused') return { i: i + 1, dir };
        if (i === 4) return { i: 5, dir, held: value };
        return value === state.held ? { i: i + 1, dir, held: state.held } : undefined;
      }
      if (i >= total) return undefined;
      if (dir === 'unused') return { i: i + 1, dir };
      switch (i - (4 + sideCount)) {
        case 0: return { i: i + 1, dir, held: value };          // VJ of the first cell
        case 1: {                                               // VJ of the second
          const [before, after] = dir === 'fwd' ? [state.held, value] : [value, state.held];
          return after === advance(before)
            ? { i: i + 1, dir, carry: before === 9 } : undefined;
        }
        case 2: return { i: i + 1, dir, carry: state.carry, held: value };
        default: {                                              // VK of the second
          const [before, after] = dir === 'fwd' ? [state.held, value] : [value, state.held];
          return after === (state.carry ? advance(before) : before)
            ? { i: i + 1, dir } : undefined;
        }
      }
    },
    accept: ({ i }) => i === total,
  }, numValues);
};

const stripEdges = new Set(safetyStrips.map(cells => cells.join('~')));
const stepMachines = new Map();
const stepMachineFor = (forward, sideCount) => {
  const key = `${forward}_${sideCount}`;
  if (!stepMachines.has(key)) stepMachines.set(key, stepMachine(forward, sideCount));
  return stepMachines.get(key);
};

// Which side codes a step has to agree on. An orthogonal step crosses the shared
// edge, so its two cells must be on the same side of the gap - unless a safety
// strip lies on that edge, where crossing is allowed. A diagonal step passes
// through the shared corner, so all four cells around that corner must be on the
// same side, which is the same as no gap edge meeting that corner at all.
const stepSideCells = (cell, other) => {
  if (stripEdges.has([cell, other].join('~'))) return [];
  const a = parseCellId(cell);
  const b = parseCellId(other);
  if (a.row === b.row || a.col === b.col) return [cell, other];
  return [cell, other, makeCellId(a.row, b.col), makeCellId(b.row, a.col)];
};

const pathSteps = gridCells.flatMap(cell => [[0, 1], [1, 0], [1, -1], [1, 1]]
  .map(([dR, dC]) => graph.step(cell, dR, dC))
  .filter(Boolean)
  .map(other => {
    const sides = side.at(stepSideCells(cell, other));
    return new NFA(stepMachineFor(dirValue(cell, other), sides.length), 'path-step',
      stepCode.at(cell), stepCode.at(other), cell, other, ...sides,
      posLow.at(cell), posLow.at(other), posHigh.at(cell), posHigh.at(other));
  }));

// A cell off the path holds the first position, so the position pair is a
// function of the path rather than free state. The end is on the path even though
// it makes no outgoing step, so it is left out.
const offPathMachine = NFA.encodeSpec({
  startState: { i: 0 },
  transition: (state, value) => {
    if (state.i === 0) return { i: 1, off: value === NONE };
    if (state.i > 2) return undefined;
    if (state.off && value !== 1) return undefined;
    return { i: state.i + 1, off: state.off };
  },
  accept: ({ i }) => i === 3,
}, numValues);

const offPathPositions = gridCells.filter(cell => cell !== END).map(cell =>
  new NFA(offPathMachine, 'path-position',
    stepCode.at(cell), posLow.at(cell), posHigh.at(cell)));

return [
  new Shape('9x9'),
  sideVar,
  corner.toVar('gap corner type'),
  stepCode.toVar('path step'),
  posLow.toVar('path position units'),
  posHigh.toVar('path position nines'),
  side.makeReplicate(new Given(side.cells()[0], IN, OUT)),
  corner.makeReplicate(new Given(cornerCells[0], CONVEX, PLAIN, CONCAVE)),

  ...safetyStrips.map(cells => new BlackDot(...cells)),

  ...drawnGap,
  ...parity,
  ...cornerCodes,
  ...singleLoop,

  ...pathDomains,
  new Given(posLow.at(START), 1),
  new Given(posHigh.at(START), 1),
  ...inDegrees,
  ...offPathPositions,
  ...pathSteps,
];
