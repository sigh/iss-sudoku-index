// Title: RAT RUN 33: Hot and Cold
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=1t0o6iZtvm8
// Source: https://sudokupad.app/dqu2xb1itj

// Normal sudoku rules apply.
//
// The grid splits into two zones of orthogonally connected cells, one hot and
// one cold, with no 2x2 area completely in one zone. A thick maze wall stands
// between two orthogonally adjacent cells exactly when they lie in different
// zones; a few walls are drawn and the rest follow from the zones.
//
// Finkz and Phinx each walk from a rat cell to a cupcake cell, reaching
// different cupcakes. A walk repeats no cell, the two walks share no cell, and
// neither crosses a wall. Phinx stays in the hot zone and Finkz in the cold
// zone. Neither rat marker is named, so which marker is which rat, and which
// cupcake each reaches, are part of the solve.
//
// A hot cell's value is its digit + 1 and a cold cell's value is its digit - 1.
// In each 3x3 box the total value of the hot cells equals the total value of
// the cold cells. A blackcurrant between two cells means one of their values is
// double the other; a redcurrant means one value is odd and the other even.
// Two cells joined by a currant lie in the same zone.
//
// Nothing is omitted.

const HOT = 1, COLD = 2;                 // zone overlay YY (native YinYang)
const EMPTY = 1, FINKZ = 2, PHINX = 3;   // walk-membership overlay VP

// A step is stored on the edge it crosses and records the rat taking it and the
// direction of travel. FWD means the walk runs from the first to the second of
// the two cells the step was built from.
const NOSTEP = 1, FINKZ_FWD = 2, FINKZ_BWD = 3, PHINX_FWD = 4, PHINX_BWD = 5;
const ratOfStep = {
  [FINKZ_FWD]: FINKZ, [FINKZ_BWD]: FINKZ,
  [PHINX_FWD]: PHINX, [PHINX_BWD]: PHINX,
};
const isForwardStep = value => value === FINKZ_FWD || value === PHINX_FWD;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

const zone = graph.makeOverlay('YY');
const path = graph.makeOverlay('VP');

// The drawn markers.
const ratCells = ['R5C4', 'R3C9'];
const cupcakeCells = ['R7C6', 'R8C9'];

// The two thick dark-purple strokes drawn inside the grid, as polylines on the
// corner lattice, where corner [r, c] is the top-left corner of R(r+1)C(c+1).
// The third such stroke traces the outer border and separates no two cells, so
// it is left out.
const wallPolylines = [
  [[2, 8], [3, 8]],
  [[4, 4], [4, 3], [5, 3], [5, 4]],
];

// The drawn currant dots, each naming the two cells whose shared edge it sits
// on. Black dots are blackcurrants, red dots redcurrants.
const currants = {
  black: [
    ['R1C6', 'R1C7'], ['R1C8', 'R1C9'], ['R1C9', 'R2C9'], ['R2C2', 'R3C2'],
    ['R3C2', 'R4C2'], ['R3C3', 'R4C3'], ['R4C7', 'R5C7'], ['R5C9', 'R6C9'],
    ['R6C9', 'R7C9'], ['R7C8', 'R8C8'], ['R8C2', 'R8C3'], ['R8C6', 'R8C7'],
    ['R9C2', 'R9C3'],
  ],
  red: [
    ['R2C1', 'R3C1'], ['R3C5', 'R3C6'], ['R5C8', 'R6C8'], ['R8C4', 'R8C5'],
  ],
};

// --- Visible walls --------------------------------------------------------
// A wall exists between two adjacent cells exactly when they are in different
// zones, so each drawn wall segment is a zone inequality.
const drawnWalls = [];
for (const polyline of wallPolylines) {
  for (let i = 1; i < polyline.length; i++) {
    const [r0, c0] = polyline[i - 1];
    const [r1, c1] = polyline[i];
    if (r0 === r1) {
      // Along corner row r0: separates the cells of grid rows r0 and r0 + 1.
      for (let c = Math.min(c0, c1); c < Math.max(c0, c1); c++) {
        drawnWalls.push([makeCellId(r0, c + 1), makeCellId(r0 + 1, c + 1)]);
      }
    } else {
      // Along corner column c0: separates grid columns c0 and c0 + 1.
      for (let r = Math.min(r0, r1); r < Math.max(r0, r1); r++) {
        drawnWalls.push([makeCellId(r + 1, c0), makeCellId(r + 1, c0 + 1)]);
      }
    }
  }
}

// --- Steps ----------------------------------------------------------------
// One step Var per orthogonal adjacency, listed rightwards and downwards so
// each adjacency appears once; the listed order is what FWD refers to. Only
// orthogonal steps exist: a diagonal move would need a 2x2 area free of walls,
// i.e. wholly within one zone, which the zone rule forbids. No adjacency is
// dropped for a wall, because which adjacencies are walled is unknown until
// the zones are placed.
const steps = graph.cells().flatMap(
  cell => [[0, 1], [1, 0]]
    .map(([dR, dC]) => graph.step(cell, dR, dC))
    .filter(other => other !== null)
    .map(other => [cell, other]));

const stepVar = new Var('E', 'steps', steps.length);
const edgeKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);
const stepCellOf = new Map(
  steps.map(([a, b], i) => [edgeKey(a, b), stepVar.cell(i + 1)]));
const stepCellOfEdge = (a, b) => stepCellOf.get(edgeKey(a, b));

// A step must carry the same rat as both of its cells; NOSTEP says nothing.
// This also confines a step Var to the five values defined above. Together with
// the zone rule below it is what keeps a walk out of walls: both cells of a
// used step hold the same rat, hence the same zone, hence no wall between them.
const stepOwnerKey = Pair.fnToKey(
  (cellValue, stepValue) => stepValue === NOSTEP || ratOfStep[stepValue] === cellValue,
  geometry);
const stepOwners = steps.flatMap(([a, b], i) => [
  new Pair(stepOwnerKey, 'step-owner', path.at(a), stepVar.cell(i + 1)),
  new Pair(stepOwnerKey, 'step-owner', path.at(b), stepVar.cell(i + 1)),
]);

// A visited cell has `expected.into` steps arriving and `expected.outOf` steps
// leaving: a rat cell only leaves, a cupcake only arrives, any other visited
// cell does both once. Reads the cell's rat, then its steps, ordered so that
// the `starts` steps this cell is the FWD start of come first -- a FWD value
// there is leaving the cell, and on the remaining steps, which this cell is the
// FWD end of, a FWD value is arriving.
const degreeMachines = new Map();
const degreeMachine = (starts, expected) => {
  const key = `${starts}|${expected.into}|${expected.outOf}`;
  if (!degreeMachines.has(key)) {
    degreeMachines.set(key, NFA.encodeSpec({
      startState: { phase: 'start' },
      transition: (state, value) => {
        if (state.phase === 'start') {
          return value === EMPTY
            ? { phase: 'empty' }
            : { phase: 'walk', startsLeft: starts, into: 0, outOf: 0 };
        }
        if (state.phase === 'empty') return value === NOSTEP ? state : undefined;
        const { startsLeft, into, outOf } = state;
        const next = { phase: 'walk', startsLeft: Math.max(startsLeft - 1, 0), into, outOf };
        if (value !== NOSTEP) {
          if (isForwardStep(value) === (startsLeft > 0)) next.outOf++; else next.into++;
        }
        if (next.into > expected.into || next.outOf > expected.outOf) return undefined;
        return next;
      },
      accept: state => state.phase === 'empty'
        || (state.into === expected.into && state.outOf === expected.outOf),
    }, geometry));
  }
  return degreeMachines.get(key);
};
const stepsAt = cell => {
  const incident = graph.neighbours(cell).map(other => ({
    stepCell: stepCellOfEdge(cell, other),
    isStart: steps.some(([a, b]) => a === cell && b === other),
  }));
  const starts = incident.filter(s => s.isStart);
  return { starts: starts.length, cells: [...starts, ...incident.filter(s => !s.isStart)] };
};
const degrees = graph.cells().map(cell => {
  const { starts, cells } = stepsAt(cell);
  const expected = ratCells.includes(cell) ? { into: 0, outOf: 1 }
    : cupcakeCells.includes(cell) ? { into: 1, outOf: 0 }
      : { into: 1, outOf: 1 };
  return new NFA(degreeMachine(starts, expected), 'steps-used',
    path.at(cell), ...cells.map(s => s.stepCell));
});

// --- Closing the walks: no stray loop of steps ----------------------------
// The in/out counts alone leave each rat's steps as one walk plus any number of
// closed loops. Two position counters, read modulo 9 and modulo 8 along the
// direction of travel, exist on a genuine walk (label its cells 1, 2, 3, ...
// and reduce), and force any closed loop of steps to have a length divisible by
// both, i.e. by 72. Every step joins two cells holding the same rat and hence
// the same zone, so a closed loop lies inside one zone; and each of the sixteen
// disjoint 2x2 areas at rows/columns 1-2, 3-4, 5-6, 7-8 must contain a cell of
// each zone, so neither zone exceeds 81 - 16 = 65 cells. No loop of 72 fits.
const counterModuli = [9, 8];
const counters = ['VA', 'VB'].map(prefix => graph.makeOverlay(prefix));

// Reads the step, then the counter of each of its two cells; the arriving
// cell's counter is the leaving cell's plus one, wrapping at the modulus.
const advanceMachine = m => NFA.encodeSpec({
  startState: { phase: 'step' },
  transition: (state, value) => {
    if (state.phase === 'step') {
      return value === NOSTEP
        ? { phase: 'skip', left: 2 }
        : { phase: 'first', forward: isForwardStep(value) };
    }
    if (state.phase === 'skip') {
      return state.left > 1 ? { phase: 'skip', left: 1 } : { phase: 'done' };
    }
    if (state.phase === 'first') return { phase: 'second', forward: state.forward, a: value };
    const [from, to] = state.forward ? [state.a, value] : [value, state.a];
    return to === (from % m) + 1 ? { phase: 'done' } : undefined;
  },
  accept: state => state.phase === 'done',
}, geometry);

// Counting from 1 at each rat cell, and parking every unvisited cell at 1,
// leaves the counters with exactly one value per walk rather than a free choice
// of starting offset.
const idleCounterKey = Pair.fnToKey(
  (cellValue, counterValue) => cellValue !== EMPTY || counterValue === 1, geometry);
const counterLayers = counterModuli.flatMap((m, i) => {
  const counter = counters[i];
  const machine = advanceMachine(m);
  return [
    counter.toVar(`position-mod-${m}`),
    ...(m < geometry.numValues
      ? [counter.makeReplicate(
        new Given(counter.cells()[0], ...Array.from({ length: m }, (_, v) => v + 1)))]
      : []),
    ...ratCells.map(cell => new Given(counter.at(cell), 1)),
    ...graph.cells().map(cell => new Pair(
      idleCounterKey, 'idle-counter', path.at(cell), counter.at(cell))),
    ...steps.map(([a, b], j) => new NFA(machine, `mod-${m}`,
      stepVar.cell(j + 1), counter.at(a), counter.at(b))),
  ];
});

const walks = [
  path.makeReplicate(new Given(path.cells()[0], EMPTY, FINKZ, PHINX)),
  ...[...ratCells, ...cupcakeCells].map(cell => new Given(path.at(cell), FINKZ, PHINX)),
  // One rat per walk, so the two rat cells belong to different rats and
  // likewise the two cupcakes: that is what makes each walk run from a rat to a
  // cupcake, and the two cupcakes reached different.
  new AllDifferent(...path.at(ratCells)),
  new AllDifferent(...path.at(cupcakeCells)),
  ...degrees,
  ...counterLayers,
  // Implied by the above -- a walk's cells are orthogonally connected -- and
  // kept because it rejects a scattered set of cells long before the step
  // counts do.
  new ConnectedValues('VP', FINKZ),
  new ConnectedValues('VP', PHINX),
];

// --- Zones ----------------------------------------------------------------
// Phinx walks only on hot cells and Finkz only on cold cells; an unvisited cell
// may be either zone.
const testConstraintKey = Pair.fnToKey(
  (pathValue, zoneValue) =>
    (pathValue !== PHINX || zoneValue === HOT) &&
    (pathValue !== FINKZ || zoneValue === COLD), geometry);

const zones = [
  ...drawnWalls.map(([a, b]) => new AllDifferent(zone.at(a), zone.at(b))),
  ...graph.cells().map(cell => new Pair(
    testConstraintKey, 'rat-zone', path.at(cell), zone.at(cell))),
];

// --- Box balance ----------------------------------------------------------
// A box holds the nine digits 1-9, summing to 45. Writing H for its hot cells,
// sum(d + 1 for H) = sum(d - 1 for the rest) becomes
// sumH + |H| = (45 - sumH) - (9 - |H|), so |H| cancels and sumH = 18: the hot
// digits of every box total 18, however many hot cells the box has.
const HOT_DIGIT_TOTAL = 18;
// Reads each of the box's nine cells as its zone followed by its digit.
const boxBalanceMachine = NFA.encodeSpec({
  startState: { hot: null, sum: 0 },
  transition: (state, value) => {
    if (state.hot === null) {
      if (value !== HOT && value !== COLD) return undefined;
      return { hot: value === HOT, sum: state.sum };
    }
    const sum = state.sum + (state.hot ? value : 0);
    return sum > HOT_DIGIT_TOTAL ? undefined : { hot: null, sum };
  },
  accept: state => state.hot === null && state.sum === HOT_DIGIT_TOTAL,
}, geometry);
const boxBalance = graph.boxes().map((cells, i) => new NFA(
  boxBalanceMachine, `box-balance-${i + 1}`,
  ...cells.flatMap(cell => [zone.at(cell), cell])));

// --- Currants -------------------------------------------------------------
// Reads the two cells' zones, which must match, then their two digits. The
// shared zone turns each digit into a value: +1 when hot, -1 when cold.
const currantMachine = relation => NFA.encodeSpec({
  startState: { phase: 'zoneA' },
  transition: (state, value) => {
    if (state.phase === 'zoneA') {
      if (value !== HOT && value !== COLD) return undefined;
      return { phase: 'zoneB', zone: value };
    }
    if (state.phase === 'zoneB') {
      return value === state.zone ? { phase: 'digitA', zone: state.zone } : undefined;
    }
    if (state.phase === 'digitA') {
      return { phase: 'digitB', zone: state.zone, a: value };
    }
    const offset = state.zone === HOT ? 1 : -1;
    return relation(state.a + offset, value + offset) ? { phase: 'done' } : undefined;
  },
  accept: state => state.phase === 'done',
}, geometry);
const currantRelations = {
  black: (x, y) => x === 2 * y || y === 2 * x,
  red: (x, y) => (x + y) % 2 === 1,
};
const currantClues = Object.entries(currants).flatMap(([kind, edges]) => {
  const machine = currantMachine(currantRelations[kind]);
  return edges.map(([a, b]) => new NFA(machine, kind, zone.at(a), zone.at(b), a, b));
});

return [
  new Shape('9x9'),
  new YinYang(),
  path.toVar('rats'),
  stepVar,
  ...zones,
  ...walks,
  ...stepOwners,
  ...boxBalance,
  ...currantClues,
];
