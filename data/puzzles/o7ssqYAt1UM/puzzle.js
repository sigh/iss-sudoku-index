// Title: RAT RUN 4: Borderline
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=o7ssqYAt1UM
// Source: https://sudokupad.app/wv8l8x67dy

// Normal sudoku rules apply. There are no given digits.
//
// Finkz the rat starts on the rat cell and must reach the cupcake cell. Her path
// is a snaking line through cell centres: orthogonal steps only, no cell visited
// twice, and no thick maze wall crossed.
//
// A blackcurrant on the border between two cells means one of the two digits is
// double the other. Not all possible blackcurrants have been given, so the mark
// carries no negative constraint.
//
// A purple arrow on the border between two cells points at the smaller of the
// two digits, and Finkz may cross that border only in the direction the arrow
// points. The inequality is unconditional ("an arrow ALWAYS points to the
// smaller"); only the crossing rule is about the path.
//
// The path is a Region Sum line: the box borders cut it into segments, and every
// segment has the same sum.

const OFF = 1;  // cell not on the path
const ON = 2;   // cell on the path

// A step is stored on the border it crosses. FWD means Finkz travels from the
// first to the second of the two cells the step was built from.
const NOSTEP = 1;
const FWD = 2;
const BWD = 3;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

const path = graph.makeOverlay('VP');

const RAT = 'R2C8';       // the rat glyph's cell
const CUPCAKE = 'R5C5';   // the cupcake glyph's cell

// The thick maze walls exactly as drawn: polylines on the grid's corner lattice,
// where corner [r, c] is the top-left corner of R(r+1)C(c+1). The last entry also
// traces the outer border of the grid; segments there separate no two cells and
// are dropped below.
const wallPolylines = [
  [[6, 3], [5, 3], [5, 5], [6, 5]],
  [[5, 4], [2, 4]],
  [[5, 5], [3, 5], [3, 6]],
  [[4, 1], [3, 1], [3, 2]],
  [[4, 2], [6, 2]],
  [[7, 2], [7, 3], [8, 3]],
  [[4, 6], [4, 7], [7, 7]],
  [[3, 7], [2, 7], [2, 5], [1, 5], [1, 4]],
  [[1, 3], [1, 1]],
  [[4, 3], [2, 3], [2, 0], [9, 0], [9, 9], [0, 9], [0, 0], [2, 0]],
  [[9, 4], [8, 4]],
  [[9, 6], [8, 6]],
  [[5, 8], [8, 8], [8, 7]],
  [[3, 8], [4, 8]],
  [[1, 8], [2, 8]],
  [[1, 6], [1, 7]],
  [[5, 6], [6, 6]],
  [[7, 6], [7, 5], [8, 5]],
  [[7, 5], [7, 4], [6, 4]],
  [[5, 1], [6, 1]],
  [[7, 1], [8, 1], [8, 2]],
];

// The five drawn blackcurrants, each naming the two cells its border separates.
const blackcurrants = [
  ['R3C1', 'R3C2'],
  ['R5C2', 'R6C2'],
  ['R7C2', 'R7C3'],
  ['R7C9', 'R8C9'],
  ['R2C5', 'R3C5'],
];

// The seven drawn one-way doors, as [cell behind the arrow, cell the tip points
// into]: Finkz may cross only in that direction, and the tip's cell is smaller.
const doors = [
  ['R2C1', 'R2C2'],
  ['R3C3', 'R4C3'],
  ['R4C7', 'R4C8'],
  ['R5C8', 'R5C9'],
  ['R7C6', 'R7C7'],
  ['R9C9', 'R9C8'],
  ['R9C8', 'R9C7'],
];

// --- Maze geometry: the steps Finkz may take. ---

const edgeKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);

const walledEdges = new Set();
for (const polyline of wallPolylines) {
  for (let i = 1; i < polyline.length; i++) {
    const [r0, c0] = polyline[i - 1];
    const [r1, c1] = polyline[i];
    if (r0 === r1) {
      // Along corner row r0: separates grid rows r0 and r0 + 1. Rows 0 and 9 are
      // the outer border.
      if (r0 < 1 || r0 > 8) continue;
      for (let c = Math.min(c0, c1); c < Math.max(c0, c1); c++) {
        walledEdges.add(edgeKey(makeCellId(r0, c + 1), makeCellId(r0 + 1, c + 1)));
      }
    } else {
      // Along corner column c0: separates grid columns c0 and c0 + 1.
      if (c0 < 1 || c0 > 8) continue;
      for (let r = Math.min(r0, r1); r < Math.max(r0, r1); r++) {
        walledEdges.add(edgeKey(makeCellId(r + 1, c0), makeCellId(r + 1, c0 + 1)));
      }
    }
  }
}

// One step per unwalled adjacency, listed rightwards and downwards so each
// adjacency appears once; that listed order is what FWD means for the step.
const steps = graph.cells().flatMap(
  cell => [[0, 1], [1, 0]]
    .map(([dR, dC]) => graph.step(cell, dR, dC))
    .filter(other => other !== null && !walledEdges.has(edgeKey(cell, other)))
    .map(other => [cell, other]));

const stepVar = new Var('E', 'steps', steps.length);
const stepCellOf = new Map(steps.map(([a, b], i) => [edgeKey(a, b), stepVar.cell(i + 1)]));
const stepCellOfEdge = (a, b) => stepCellOf.get(edgeKey(a, b));

// A door's step may only be unused or travel the way the arrow points. Every
// other step is left with all three values, which the degree machine below
// confines to the three defined above.
const doorSteps = doors.map(([from, to]) => {
  const [a, b] = steps.find(([x, y]) => edgeKey(x, y) === edgeKey(from, to));
  return new Given(stepCellOfEdge(a, b), NOSTEP, a === from ? FWD : BWD);
});

// --- The walk. ---

// Reads the cell's own on/off value, then the values of its incident steps: the
// `starts` steps it is the FWD origin of come first, so a FWD value there is a
// step leaving the cell and on the remaining steps a FWD value is one arriving.
// An OFF cell has no incident step; an ON cell has exactly the arriving and
// leaving counts the rule gives it.
const degreeMachines = new Map();
const degreeMachine = (starts, expected) => {
  const key = `${starts}|${expected.into}|${expected.outOf}`;
  if (!degreeMachines.has(key)) {
    degreeMachines.set(key, NFA.encodeSpec({
      startState: { phase: 'start' },
      transition: (state, value) => {
        if (state.phase === 'start') {
          if (value === OFF) return { phase: 'off' };
          if (value === ON) return { phase: 'on', startsLeft: starts, into: 0, outOf: 0 };
          return undefined;
        }
        if (state.phase === 'off') return value === NOSTEP ? state : undefined;
        const { startsLeft, into, outOf } = state;
        const next = { phase: 'on', startsLeft: Math.max(startsLeft - 1, 0), into, outOf };
        if (value !== NOSTEP) {
          if (value !== FWD && value !== BWD) return undefined;
          if ((value === FWD) === (startsLeft > 0)) next.outOf++; else next.into++;
        }
        if (next.into > expected.into || next.outOf > expected.outOf) return undefined;
        return next;
      },
      accept: state => state.phase === 'off'
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
// The same rule for a cell with a single legal step, where a machine would be
// reading only two cells: the cupcake sits in a dead end, so its one border must
// be the one the path arrives across.
const degreeKeys = new Map();
const degreeKey = (isStart, expected) => {
  const key = `${isStart}|${expected.into}|${expected.outOf}`;
  if (!degreeKeys.has(key)) {
    degreeKeys.set(key, Pair.fnToKey((cellValue, stepValue) => {
      if (cellValue === OFF) return stepValue === NOSTEP;
      if (cellValue !== ON) return false;
      if (stepValue === NOSTEP) return expected.into === 0 && expected.outOf === 0;
      if (stepValue !== FWD && stepValue !== BWD) return false;
      const leaves = (stepValue === FWD) === isStart;
      return (leaves ? 0 : 1) === expected.into && (leaves ? 1 : 0) === expected.outOf;
    }, geometry));
  }
  return degreeKeys.get(key);
};
const degrees = graph.cells().map(cell => {
  const { starts, cells } = stepsAt(cell);
  const expected = cell === RAT ? { into: 0, outOf: 1 }
    : cell === CUPCAKE ? { into: 1, outOf: 0 }
      : { into: 1, outOf: 1 };
  if (cells.length === 1) {
    return new Pair(degreeKey(cells[0].isStart, expected), 'steps-used',
      path.at(cell), cells[0].stepCell);
  }
  return new NFA(degreeMachine(starts, expected), 'steps-used',
    path.at(cell), ...cells.map(s => s.stepCell));
});

// --- Closing the walk: no stray loop of steps. ---
// The arriving/leaving counts alone leave the used steps as one walk plus any
// number of closed loops. Two position counters, read modulo 9 and modulo 8
// along the direction of travel, exist on any genuine walk (label its cells
// 1, 2, 3, ... and reduce) and force a closed loop's length to be divisible by
// both, i.e. by 72. The longest closed loop this maze admits, once the one-way
// doors are respected, is 60 cells, so no loop survives.
const counterModuli = [9, 8];
const counters = ['VA', 'VB'].map(prefix => graph.makeOverlay(prefix));

// Reads the step, then the counter of each of its two cells; the arriving cell's
// counter is the leaving cell's plus one, wrapping at the modulus.
const advanceMachine = m => NFA.encodeSpec({
  startState: { phase: 'step' },
  transition: (state, value) => {
    if (state.phase === 'step') {
      if (value === NOSTEP) return { phase: 'skip', left: 2 };
      return { phase: 'first', forward: value === FWD };
    }
    if (state.phase === 'skip') {
      return state.left > 1 ? { phase: 'skip', left: state.left - 1 } : { phase: 'done' };
    }
    if (state.phase === 'first') return { phase: 'second', forward: state.forward, a: value };
    const [from, to] = state.forward ? [state.a, value] : [value, state.a];
    return to === (from % m) + 1 ? { phase: 'done' } : undefined;
  },
  accept: state => state.phase === 'done',
}, geometry);

// Counting from 1 at the rat cell, and parking every unvisited cell at 1, leaves
// each counter with one value per walk rather than a free choice of offset.
const idleCounterKey = Pair.fnToKey(
  (cellValue, counterValue) => cellValue === ON || counterValue === 1, geometry);
const counterLayers = counterModuli.flatMap((m, i) => {
  const counter = counters[i];
  const machine = advanceMachine(m);
  return [
    counter.toVar(`position-mod-${m}`),
    ...(m < geometry.numValues
      ? [counter.makeReplicate(
        new Given(counter.cells()[0], ...Array.from({ length: m }, (_, v) => v + 1)))]
      : []),
    new Given(counter.at(RAT), 1),
    ...graph.cells().map(cell => new Pair(
      idleCounterKey, 'idle-counter', path.at(cell), counter.at(cell))),
    ...steps.map(([a, b], j) => new NFA(machine, `mod-${m}`,
      stepVar.cell(j + 1), counter.at(a), counter.at(b))),
  ];
});

// --- The Region Sum line. ---
// Each cell on the path carries the running total of its box segment: the sum of
// the digits from the cell where the path last entered this box up to and
// including itself. The segment totals are compared against one target held in a
// Var pair.
//
// A segment lies inside a single box and repeats no cell, so its digits are
// distinct and its total is between 1 and 45. Two totals in that range are equal
// exactly when they agree modulo 5 and modulo 9, since 5 * 9 = 45 is the width of
// the range. So the running total is carried as its two residues, one whole-grid
// layer each, with value = (total mod m) + 1.
const sumModuli = [5, 9];
const sums = ['VS', 'VT'].map(prefix => graph.makeOverlay(prefix));
const targetVar = new Var('G', 'segment-total', sumModuli.length);

const boxOf = new Map(graph.boxes().flatMap((cells, i) => cells.map(cell => [cell, i])));
const residue = (total, m) => (total % m) + 1;
const addResidue = (value, digit, m) => ((value - 1 + digit) % m) + 1;
const subResidue = (value, digit, m) => (((value - 1 - digit) % m) + m) % m + 1;

// Both machines read the step, then the two cells' digits, then their two
// running totals. Values above the modulus never occur on the layer and are
// rejected so the machine stays total.
//
// Within a box the arriving cell continues the segment: its total is the leaving
// cell's plus the arriving cell's own digit.
const withinBoxMachine = m => NFA.encodeSpec({
  startState: { phase: 'step' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'step':
        if (value === NOSTEP) return { phase: 'skip', left: 4 };
        return { phase: 'digitA', forward: value === FWD };
      case 'skip':
        return state.left > 1 ? { phase: 'skip', left: state.left - 1 } : { phase: 'done' };
      case 'digitA':
        // Forward travel arrives at b, so it is b's digit that is added.
        return state.forward
          ? { phase: 'digitB', forward: true }
          : { phase: 'digitB', forward: false, digit: value };
      case 'digitB':
        return state.forward
          ? { phase: 'totalA', forward: true, digit: value }
          : { phase: 'totalA', forward: false, digit: state.digit };
      case 'totalA':
        if (value > m) return undefined;
        return {
          phase: 'totalB',
          want: state.forward
            ? addResidue(value, state.digit, m)
            : subResidue(value, state.digit, m),
        };
      default:
        return value === state.want ? { phase: 'done' } : undefined;
    }
  },
  accept: state => state.phase === 'done',
}, geometry);

// Across a box border the leaving cell ends its segment, so its total must equal
// the target, and the arriving cell starts a fresh segment holding just its own
// digit. The target Var is read last.
const acrossBoxMachine = m => NFA.encodeSpec({
  startState: { phase: 'step' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'step':
        if (value === NOSTEP) return { phase: 'skip', left: 5 };
        return { phase: 'digitA', forward: value === FWD };
      case 'skip':
        return state.left > 1 ? { phase: 'skip', left: state.left - 1 } : { phase: 'done' };
      case 'digitA':
        // Backward travel arrives at a, so a's total restarts at a's digit.
        return state.forward
          ? { phase: 'digitB', forward: true }
          : { phase: 'digitB', forward: false, want: residue(value, m) };
      case 'digitB':
        return state.forward
          ? { phase: 'totalA', forward: true, want: residue(value, m) }
          : { phase: 'totalA', forward: false, want: state.want };
      case 'totalA':
        if (value > m) return undefined;
        // Forward travel leaves a, so a's total is the one that ends a segment.
        if (state.forward) return { phase: 'totalB', want: state.want, ends: value };
        return value === state.want ? { phase: 'totalB' } : undefined;
      case 'totalB':
        if (value > m) return undefined;
        if (state.ends === undefined) return { phase: 'target', ends: value };
        return value === state.want ? { phase: 'target', ends: state.ends } : undefined;
      default:
        return value === state.ends ? { phase: 'done' } : undefined;
    }
  },
  accept: state => state.phase === 'done',
}, geometry);

// The rat cell opens the first segment; the cupcake cell closes the last one.
const seedKey = m => Pair.fnToKey(
  (digit, total) => total === residue(digit, m), geometry);
const idleSumKey = Pair.fnToKey(
  (cellValue, total) => cellValue === ON || total === 1, geometry);

const regionSumLayers = sumModuli.flatMap((m, i) => {
  const sum = sums[i];
  const within = withinBoxMachine(m);
  const across = acrossBoxMachine(m);
  const target = targetVar.cell(i + 1);
  return [
    sum.toVar(`segment-total-mod-${m}`),
    ...(m < geometry.numValues
      ? [
        sum.makeReplicate(
          new Given(sum.cells()[0], ...Array.from({ length: m }, (_, v) => v + 1))),
        new Given(target, ...Array.from({ length: m }, (_, v) => v + 1)),
      ]
      : []),
    ...graph.cells().map(cell => new Pair(
      idleSumKey, 'idle-total', path.at(cell), sum.at(cell))),
    new Pair(seedKey(m), 'first-segment', RAT, sum.at(RAT)),
    new SameValues(2, sum.at(CUPCAKE), target),
    ...steps.map(([a, b], j) => (boxOf.get(a) === boxOf.get(b)
      ? new NFA(within, `within-box-mod-${m}`,
        stepVar.cell(j + 1), a, b, sum.at(a), sum.at(b))
      : new NFA(across, `across-box-mod-${m}`,
        stepVar.cell(j + 1), a, b, sum.at(a), sum.at(b), target))),
  ];
});

return [
  new Shape('9x9'),
  path.toVar('on-path'),
  path.makeReplicate(new Given(path.cells()[0], OFF, ON)),
  new Given(path.at(RAT), ON),
  new Given(path.at(CUPCAKE), ON),
  stepVar,
  ...doorSteps,
  ...degrees,
  // The walk's cells are a single orthogonally-connected group. Implied by the
  // step model above, and stated here as its own constraint.
  new ConnectedValues('VP', ON),
  ...counterLayers,
  targetVar,
  ...regionSumLayers,
  ...blackcurrants.map(([a, b]) => new BlackDot(a, b)),
  // GreaterThan puts each cell above the adjacent cells listed after it, so the
  // arrow's own cell comes first and the cell its tip points at comes second.
  ...doors.map(([from, to]) => new GreaterThan(from, to)),
];
