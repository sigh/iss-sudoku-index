// Title: Atoll
// Author: Math Pesto
// Video: https://www.youtube.com/watch?v=aANrohhFJ2g
// Source: https://app.crackingthecryptic.com/sudoku/m73tnQmbbd

// Normal sudoku rules apply. Draw a loop through the centres of some cells,
// moving orthogonally cell to cell; every cell is INSIDE the loop, OUTSIDE
// it, or ON it (part of the loop). No 2x2 area is entirely one type. Inside
// cells form one orthogonally-connected area. A circled cell's colour fixes
// its type (green=INSIDE, blue=OUTSIDE, yellow=ON); the digit written there
// -- whether given or solved -- equals the count of same-type cells it sees
// in the 4 orthogonal directions, including itself, where a different-type
// cell blocks the sightline. Adjacent cells that are both non-loop (either
// type) differ by 5 or more.
//
// OMITTED: "Cells outside the loop are orthogonally connected to the edge of
// the grid." Unlike inside ("form one ... area"), the rules text does not
// require outside to be a single region -- it may be several separate
// bodies, each merely touching the border. ISS's ConnectedValues only
// asserts one connected region per value; no primitive for per-component
// border-reachability exists. Left unconstrained; see blockers.

const INSIDE = 1;
const OUTSIDE = 2;
const LOOP = 3;

const graph = cellGraph('9x9');
const numValues = graph.gridGeometry().numValues; // 9
const gridCells = graph.cells();

const type = graph.makeOverlay('VT');
const typeVar = type.toVar('cell type');

// Every VT cell holds one of the three types.
const typeDomain = type.makeReplicate(
  new Given(type.cells()[0], INSIDE, OUTSIDE, LOOP));

// --- Givens -----------------------------------------------------------------
// Plain digit (no circle): R1C6=5. Circled digits: R8C7=7 (yellow), R9C5=2
// (blue). Circled, no digit given: R3C8, R4C2 (green) -- their digits are
// left for the solver but still obey the self-referential visibility rule
// below.
const digitGivens = [
  new Given('R1C6', 5),
  new Given('R8C7', 7),
  new Given('R9C5', 2),
];

// Circle colour fixes cell type (transcribed from the payload's overlays).
const circleTypes = [
  new Given(type.at('R9C5'), OUTSIDE), // blue
  new Given(type.at('R8C7'), LOOP),    // yellow
  new Given(type.at('R3C8'), INSIDE),  // green
  new Given(type.at('R4C2'), INSIDE),  // green
];

// --- Single loop: ON cells form one connected, 2-regular cycle -------------
// LOOP-type membership plus degree-2 counted over orthogonal neighbours,
// combined with single connectivity, closes a simple non-self-touching
// cycle: connected + every loop cell having exactly two loop neighbours
// rules out both extra components and any branch or self-crossing. The
// rules text only says the loop "never intersects with itself" (no
// diagonal-touch restriction), so none is added.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, value) => {
    if (phase === 'start') {
      return value === LOOP ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (value === LOOP ? 1 : 0);
    return count > 2 ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === 2,
}, numValues);
const loopDegrees = gridCells.map(cell => new NFA(degreeMachine, 'loop-degree',
  ...type.at([cell, ...graph.neighbours(cell)])));

const singleLoop = [
  new ConnectedValues('VT', LOOP),
  ...loopDegrees,
];

// --- Inside: one connected region -------------------------------------------
// Non-empty is guaranteed by the two green circle givens above.
const insideConnected = new ConnectedValues('VT', INSIDE);

// --- No 2x2 area is entirely one type ---------------------------------------
// Reads the 4 cells of a 2x2 block; rejects only if all four match.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    const allSame = next.every(v => v === next[0]);
    return allSame ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = type.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...type.at(graph.block(gridCells[0], 2, 2))),
  type.at(blockOrigins));

// --- Circle visibility: digit = 1 (self) + same-type run in each direction -
// One NFA, reused per circled cell: reads the cell's own digit (target) and
// own type (ref, also counting itself), then each of the 4 rays' types,
// incrementing on a type match and blocking (no further increments) at the
// first mismatch in that ray; SEGMENT_BREAK resets "blocked" per ray so the
// count still accumulates across all 4 directions.
const sightMachine = NFA.encodeSpec({
  startState: { phase: 'digit' },
  transition: (state, value) => {
    if (state.phase === 'digit') return { phase: 'ref', target: value };
    if (state.phase === 'ref') {
      return { phase: 'count', target: state.target, ref: value, count: 1, blocked: false };
    }
    // phase === 'count'
    if (value === SEGMENT_BREAK) return { ...state, blocked: false };
    if (state.blocked) return state;
    if (value === state.ref) {
      return { ...state, count: Math.min(state.count + 1, state.target + 1) };
    }
    return { ...state, blocked: true };
  },
  accept: (state) => state.phase === 'count' && state.count === state.target,
}, numValues, { multiSegment: true });

function visibilityConstraint(cellId) {
  const { row, col } = parseCellId(cellId);
  const ray = (dr, dc) => {
    const cells = [];
    for (let r = row + dr, c = col + dc; r >= 1 && r <= 9 && c >= 1 && c <= 9; r += dr, c += dc) {
      cells.push(typeVar.cell(r, c));
    }
    return cells;
  };
  const rays = [ray(-1, 0), ray(1, 0), ray(0, -1), ray(0, 1)].filter(r => r.length > 0);
  return new NFA(sightMachine, 'sight', [cellId, type.at(cellId)], ...rays);
}

const circleCells = ['R9C5', 'R8C7', 'R3C8', 'R4C2'];
const visibility = circleCells.map(visibilityConstraint);

// --- Adjacent non-loop cells differ by >= 5 ---------------------------------
// Reads (typeA, digitA, typeB, digitB) for one orthogonal edge. If either
// cell is ON the loop the pair is unconstrained (absorb the rest of the
// tokens via a skip countdown, as in nordschleife.js's multipleMachine).
const diffMachine = NFA.encodeSpec({
  startState: { phase: 'aType' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'aType':
        return value === LOOP ? { phase: 'skip', left: 3 } : { phase: 'aDigit' };
      case 'aDigit':
        return { phase: 'bType', aDigit: value };
      case 'bType':
        return value === LOOP
          ? { phase: 'skip', left: 1 }
          : { phase: 'bDigit', aDigit: state.aDigit };
      case 'bDigit': {
        const diff = Math.abs(state.aDigit - value);
        return diff >= 5 ? { phase: 'done' } : undefined;
      }
      case 'skip':
        return state.left > 1 ? { phase: 'skip', left: state.left - 1 } : { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, numValues);
// Right/down steps only: each orthogonal edge covered once.
const nonLoopDiffs = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dR, dC]) => graph.step(cell, dR, dC))
  .filter(Boolean)
  .map(other => new NFA(diffMachine, 'non-loop-diff',
    type.at(cell), cell, type.at(other), other)));

return [
  new Shape('9x9'),
  typeVar,
  typeDomain,
  ...digitGivens,
  ...circleTypes,
  ...singleLoop,
  insideConnected,
  noMono2x2,
  ...visibility,
  ...nonLoopDiffs,
];
