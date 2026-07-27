// Title: RAT RUN 32: Veracity
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=6CjhriJCPtQ
// Source: https://sudokupad.app/o2u3rfkurb

// Normal sudoku rules apply.
//
// Finkz and Phinx each walk from a rat cell to a cupcake cell. A walk takes
// orthogonal steps only, never crosses a thick maze wall, never repeats a cell,
// and the two walks share no cell. Which rat is which is part of the solve.
//
// Berry clues sit on the edge between two cells:
//   blackcurrant (black) - one digit is double the other
//   redcurrant (red)     - one digit is odd and the other even
//   goldenberry (gold)   - the digits are non-consecutive
//   grape (green)        - the digits differ by at least 5
// A motion sensor is a cell clue: its digit is how many of the "(up to 9)
// surrounding cells" are visited by a rat. Nine is the size of a 3x3 block, so
// that neighbourhood includes the sensor's own cell; the eight cells around it
// would be up to 8.
//
// Every clue Phinx passes through is fake, meaning the relation above must FAIL
// for it; every other clue (Finkz's, and any clue neither rat reaches) holds. A
// rat passes through a motion sensor by visiting its cell, and through a berry
// by stepping across the edge it sits on: the berries are drawn on the boundary
// between two cells, which a path through cell centres meets exactly when it
// takes that step.
//
// Not encoded: "In this experiment, some clues are fake" is read as introducing
// the mechanic that the following paragraph states exactly, not as an extra
// requirement that the fake set be non-empty.

const EMPTY = 1;   // cell visited by neither rat
const FINKZ = 2;   // the rat whose clues are truthful
const PHINX = 3;   // the rat whose clues are fake

// A step is stored on the edge it crosses, and records both the rat that takes
// it and the direction of travel. FWD means the walk runs from the first to the
// second of the two cells the step is built from.
const NOSTEP = 1;
const FINKZ_FWD = 2;
const FINKZ_BWD = 3;
const PHINX_FWD = 4;
const PHINX_BWD = 5;
const ratOfStep = { [FINKZ_FWD]: FINKZ, [FINKZ_BWD]: FINKZ, [PHINX_FWD]: PHINX, [PHINX_BWD]: PHINX };
const isForwardStep = value => value === FINKZ_FWD || value === PHINX_FWD;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

// Per grid cell: which rat visits it, or EMPTY.
const path = graph.makeOverlay('VP');

const ratCells = ['R8C6', 'R4C7'];      // the two mouse markers
const cupcakeCells = ['R9C5', 'R4C8'];  // the two cupcake markers

// The thick maze walls, as drawn: polylines on the grid's corner lattice, where
// corner [r, c] is the top-left corner of R(r+1)C(c+1). The outer border is left
// out; it blocks no move between two grid cells.
const wallPolylines = [
  [[1, 8], [1, 7], [2, 7]],
  [[1, 7], [1, 6]],
  [[2, 1], [1, 1], [1, 4], [3, 4], [3, 8], [2, 8]],
  [[3, 4], [5, 4], [5, 2], [4, 2]],
  [[3, 6], [2, 6]],
  [[4, 6], [6, 6], [6, 5], [7, 5]],
  [[3, 2], [3, 3]],
  [[1, 5], [2, 5]],
  [[2, 2], [2, 3]],
  [[3, 1], [4, 1]],
  [[5, 1], [7, 1]],
  [[6, 3], [8, 3], [8, 4]],
  [[8, 3], [8, 1]],
  [[8, 7], [9, 7]],
  [[4, 5], [5, 5]],
  [[6, 2], [7, 2]],
  [[5, 7], [7, 7], [7, 6], [8, 6], [8, 5]],
  [[4, 8], [5, 8]],
  [[6, 8], [7, 8]],
  [[6, 4], [7, 4]],
];

// The drawn berries, each naming the two cells its edge separates.
const berries = {
  black: [
    ['R1C6', 'R1C7'], ['R1C7', 'R1C8'], ['R1C8', 'R1C9'], ['R2C7', 'R3C7'],
    ['R5C2', 'R6C2'], ['R5C6', 'R6C6'], ['R5C7', 'R6C7'], ['R7C2', 'R8C2'],
    ['R7C4', 'R8C4'],
  ],
  red: [
    ['R1C1', 'R1C2'], ['R1C2', 'R1C3'], ['R1C3', 'R1C4'], ['R1C4', 'R1C5'],
    ['R1C5', 'R1C6'], ['R2C4', 'R3C4'], ['R4C5', 'R4C6'], ['R4C5', 'R5C5'],
    ['R6C3', 'R7C3'], ['R8C7', 'R9C7'],
  ],
  gold: [
    ['R2C5', 'R3C5'], ['R2C6', 'R3C6'], ['R3C5', 'R3C6'], ['R4C2', 'R5C2'],
    ['R4C3', 'R4C4'], ['R6C3', 'R6C4'], ['R7C8', 'R8C8'], ['R8C1', 'R8C2'],
  ],
  green: [
    ['R2C2', 'R2C3'], ['R2C2', 'R3C2'], ['R2C8', 'R3C8'], ['R3C2', 'R3C3'],
    ['R4C3', 'R5C3'], ['R4C4', 'R5C4'], ['R5C1', 'R6C1'], ['R5C3', 'R5C4'],
    ['R6C1', 'R7C1'], ['R6C7', 'R7C7'], ['R8C9', 'R9C9'],
  ],
};

// The drawn motion sensors.
const sensorCells = ['R2C2', 'R4C1', 'R4C5', 'R7C1'];

// --- Maze geometry: which cell-to-cell steps a rat may take. ---
const edgeKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);

const walledEdges = new Set();
for (const polyline of wallPolylines) {
  for (let i = 1; i < polyline.length; i++) {
    const [r0, c0] = polyline[i - 1];
    const [r1, c1] = polyline[i];
    if (r0 === r1) {
      // Along corner row r0: separates the cells of grid rows r0 and r0 + 1.
      for (let c = Math.min(c0, c1); c < Math.max(c0, c1); c++) {
        walledEdges.add(edgeKey(makeCellId(r0, c + 1), makeCellId(r0 + 1, c + 1)));
      }
    } else {
      // Along corner column c0: separates the cells of grid columns c0 and c0 + 1.
      for (let r = Math.min(r0, r1); r < Math.max(r0, r1); r++) {
        walledEdges.add(edgeKey(makeCellId(r + 1, c0), makeCellId(r + 1, c0 + 1)));
      }
    }
  }
}

// One step per unwalled adjacency, listed rightwards and downwards so that each
// adjacency appears once. The listed order fixes what FWD means for that step.
const steps = graph.cells().flatMap(
  cell => [[0, 1], [1, 0]]
    .map(([dR, dC]) => graph.step(cell, dR, dC))
    .filter(other => other !== null && !walledEdges.has(edgeKey(cell, other)))
    .map(other => [cell, other]));

const stepVar = new Var('E', 'steps', steps.length);
const stepCellOf = new Map(steps.map(([a, b], i) => [edgeKey(a, b), stepVar.cell(i + 1)]));
const stepCellOfEdge = (a, b) => stepCellOf.get(edgeKey(a, b));

// --- Walk structure. ---

// A rat's step must carry that same rat in both of its cells; NOSTEP says
// nothing. This also confines the step values to the five defined above.
const stepOwnerKey = Pair.fnToKey(
  (cellValue, stepValue) => stepValue === NOSTEP || ratOfStep[stepValue] === cellValue,
  geometry);
const stepOwners = steps.flatMap(([a, b], i) => [
  new Pair(stepOwnerKey, 'step-owner', path.at(a), stepVar.cell(i + 1)),
  new Pair(stepOwnerKey, 'step-owner', path.at(b), stepVar.cell(i + 1)),
]);

// A visited cell has `expected.into` steps arriving and `expected.outOf` steps
// leaving: a rat cell only leaves, a cupcake only arrives, any other visited
// cell does both once. Reads the cell's rat, then its steps, ordered so that the
// `starts` steps this cell is the FWD start of come first -- a FWD value there
// is leaving the cell, and on the remaining steps, which this cell is the FWD
// end of, a FWD value is arriving.
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
  const incident = graph.neighbours(cell)
    .filter(other => stepCellOfEdge(cell, other))
    .map(other => ({
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

// --- Closing the walks: no stray loop of steps. ---
// The in/out counts alone leave each rat's steps as one walk plus any number of
// closed loops. Two position counters, read modulo 9 and modulo 8 along the
// direction of travel, are always available on a genuine walk (label its cells
// 1, 2, 3, ... and reduce), and force any closed loop to have a length divisible
// by both, i.e. by 72. The maze's longest closed loop of cells is 66, so no loop
// survives and each rat is left with exactly one walk.
const counterModuli = [9, 8];
const counters = ['VA', 'VB'].map(prefix => graph.makeOverlay(prefix));

// Reads the step, then the counter of each of its two cells; the arriving cell's
// counter is the leaving cell's plus one, wrapping at the modulus.
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

// Counting from 1 at each rat cell, and parking every cell no rat visits at 1,
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
  // One rat per walk, so the two rat cells belong to different rats and likewise
  // the two cupcakes: that is what makes each walk run from a rat to a cupcake.
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

// --- Clues. ---

// Reads the step between the two clued cells, then their two digits. `relation`
// must hold when the step is not Phinx's and fail when it is.
const berryMachine = relation => NFA.encodeSpec({
  startState: { phase: 'step' },
  transition: (state, value) => {
    if (state.phase === 'step') {
      return { phase: 'first', fake: ratOfStep[value] === PHINX };
    }
    if (state.phase === 'first') return { phase: 'second', fake: state.fake, a: value };
    return relation(state.a, value) !== state.fake ? { phase: 'done' } : undefined;
  },
  accept: state => state.phase === 'done',
}, geometry);
const berryRelations = {
  black: (a, b) => a === 2 * b || b === 2 * a,
  red: (a, b) => (a + b) % 2 === 1,
  gold: (a, b) => Math.abs(a - b) !== 1,
  green: (a, b) => Math.abs(a - b) >= 5,
};
const berryClues = Object.entries(berries).flatMap(([kind, edges]) => {
  const machine = berryMachine(berryRelations[kind]);
  return edges.map(([a, b]) => new NFA(machine, kind, stepCellOfEdge(a, b), a, b));
});

// Reads the sensor cell's rat (which both sets the fake flag and is the first
// cell counted), then the rat of each other cell of the neighbourhood, then the
// sensor's own digit. `size` is the neighbourhood size, so the machine knows
// which symbol is the digit.
const sensorMachine = size => NFA.encodeSpec({
  startState: { phase: 'sensor' },
  transition: (state, value) => {
    if (state.phase === 'sensor') {
      return {
        phase: 'count',
        fake: value === PHINX,
        visited: value === EMPTY ? 0 : 1,
        left: size - 1,
      };
    }
    if (state.phase === 'count') {
      const visited = state.visited + (value === EMPTY ? 0 : 1);
      const left = state.left - 1;
      return left > 0
        ? { phase: 'count', fake: state.fake, visited, left }
        : { phase: 'digit', fake: state.fake, visited };
    }
    return (value === state.visited) !== state.fake ? { phase: 'done' } : undefined;
  },
  accept: state => state.phase === 'done',
}, geometry);
const sensorClues = sensorCells.map(cell => {
  const neighbourhood = [cell, ...graph.kingNeighbours(cell)];
  return new NFA(sensorMachine(neighbourhood.length), 'motion-sensor',
    ...path.at(neighbourhood), cell);
});

return [
  new Shape('9x9'),
  path.toVar('rats'),
  stepVar,
  ...walks,
  ...stepOwners,
  ...berryClues,
  ...sensorClues,
];
