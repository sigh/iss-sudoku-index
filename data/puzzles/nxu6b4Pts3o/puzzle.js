// Title: Highway to the Danger Zone
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=nxu6b4Pts3o
// Source: https://app.crackingthecryptic.com/sudoku/b3QH7jB4FJ

// Rules encoded here:
//   * Normal sudoku.
//   * The grid is divided into killer cages: every cell belongs to exactly one
//     cage, each cage is orthogonally connected, digits do not repeat in a
//     cage, and single-cell cages are allowed.
//   * Each cage contains exactly one of the 17 printed clues, anywhere in the
//     cage, and the clue gives the cage's digit sum. A clue printed as a
//     comparison bounds that sum strictly ("<6" is sum <= 5, ">28" is sum >= 29).
//   * A single loop, with no branches or crossings, runs through the centres of
//     some cells, stepping orthogonally, and visits each cage exactly once.
//   * If two cells share an edge but lie in different cages, at least one of
//     them is on the loop.
//   * The digit in a clued cell equals the number of cells of its cage that the
//     loop visits.
// Nothing is omitted.
//
// Model. Six solver-discovered layers sit over the grid:
//   VA, VB  the cage each cell belongs to. Seventeen cages exceed the 16-value
//           ceiling, so the labels are split over two layers: VA names cages
//           1-9 and VB names cages 10-17, each layer marking the cells the
//           other one owns with its own OTHER value. One Pair per cell keeps
//           exactly one layer in charge, and one ConnectedValues per label makes
//           that label's cells a single orthogonally-connected region.
//   VS      one variable per orthogonally adjacent pair of cells, holding both
//           whether the loop uses that pair and in which direction, and whether
//           the pair straddles a cage border. Carrying the border flag on the
//           step is what lets the per-cell and per-cage machines below stay
//           small: they never have to compare two cells' labels themselves.
//   VM      what the loop does at a cell: off it, on it, and if on it whether
//           the loop arrives from another cage (so this cell is where the cage's
//           single visit begins) and whether the cell is the loop's seam.
//   VP, VQ  position along the loop mod 8 and mod 11.
// The loop is a route through cell centres that may run alongside itself, so
// degree is read from each cell's own incident steps rather than from counting
// on-loop neighbours; ConnectedValues then narrows the route to one blob and
// the seam plus the position counters cut that down to one cycle.

const GRID = '9x9';
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// The seventeen printed labels, transcribed from the single-cell cage entries
// drawn in the source. `op` is the comparison printed in front of the number,
// '=' for a bare total.
const CLUES = [
  { cell: 'R1C2', op: '=', value: 44 },
  { cell: 'R2C1', op: '=', value: 44 },
  { cell: 'R4C1', op: '=', value: 18 },
  { cell: 'R4C2', op: '<', value: 6 },
  { cell: 'R7C2', op: '>', value: 28 },
  { cell: 'R9C1', op: '>', value: 17 },
  { cell: 'R9C2', op: '=', value: 3 },
  { cell: 'R9C5', op: '<', value: 45 },
  { cell: 'R8C6', op: '<', value: 10 },
  { cell: 'R6C5', op: '=', value: 19 },
  { cell: 'R3C4', op: '=', value: 36 },
  { cell: 'R3C5', op: '>', value: 16 },
  { cell: 'R2C4', op: '>', value: 11 },
  { cell: 'R1C6', op: '=', value: 16 },
  { cell: 'R3C9', op: '=', value: 19 },
  { cell: 'R4C7', op: '>', value: 1 },
  { cell: 'R8C9', op: '>', value: 0 },
];

// Cage labels: the first nine cages live on layer VA, the rest on layer VB.
const A_COUNT = 9;
const B_COUNT = CLUES.length - A_COUNT;
const OTHER_A = A_COUNT + 1;   // VA value for a cell some VB cage owns
const OTHER_B = B_COUNT + 1;   // VB value for a cell some VA cage owns

// Step codes. A step is unused or used, and independently either stays inside
// one cage or straddles a cage border. FWD runs from the pair's first cell to
// its second, BWD the other way.
const S_UNUSED = 1, S_UNUSED_X = 2;
const S_FWD = 3, S_FWD_X = 4;
const S_BWD = 5, S_BWD_X = 6;
const S_MAX = S_BWD_X;
const isCrossing = (v) => v === S_UNUSED_X || v === S_FWD_X || v === S_BWD_X;
const isUsed = (v) => v >= S_FWD;

// Loop codes for a cell. ENTRY marks the cell where the loop arrives from
// another cage; SEAM marks the one cell where the position counters restart.
const M_OFF = 1, M_ON = 2, M_ENTRY = 3, M_ON_SEAM = 4, M_ENTRY_SEAM = 5;
const M_MAX = M_ENTRY_SEAM;
const isOn = (v) => v !== M_OFF;
const isEntry = (v) => v === M_ENTRY || v === M_ENTRY_SEAM;
const isSeam = (v) => v === M_ON_SEAM || v === M_ENTRY_SEAM;

// Loop position moduli. A cycle carrying no seam has to close on itself in both
// layers at once, so its length must be a multiple of lcm(8, 11) = 88; no cycle
// in an 81-cell grid is that long, which leaves the seam's cycle as the only
// one. The moduli also set the value range the whole script runs in.
const MOD_P = 8, MOD_Q = 11;

const shape = new Shape(GRID, Math.max(MOD_P, MOD_Q, OTHER_A, OTHER_B, S_MAX, M_MAX));
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const cageA = graph.makeOverlay('VA');
const cageB = graph.makeOverlay('VB');
const loop = graph.makeOverlay('VM');
const posP = graph.makeOverlay('VP');
const posQ = graph.makeOverlay('VQ');

// Which layer and label a cage uses, and the machine-readable clue test.
const cages = CLUES.map((clue, i) => ({
  ...clue,
  overlay: i < A_COUNT ? cageA : cageB,
  label: i < A_COUNT ? i + 1 : i + 1 - A_COUNT,
  name: `cage-${i + 1}`,
  sumOk: (sum) => clue.op === '=' ? sum === clue.value
    : clue.op === '<' ? sum < clue.value : sum > clue.value,
}));

// --- Steps ----------------------------------------------------------------
// One variable per orthogonally adjacent pair; right/down steps from each cell
// cover every pair once. `incidentAt` lists a cell's steps in reading order of
// the cell across the step, which the seam's direction pin below relies on.
const steps = [];
const incidentAt = new Map(gridCells.map(cell => [cell, []]));
gridCells.forEach(cell => {
  for (const [dR, dC] of [[0, 1], [1, 0]]) {
    const other = graph.step(cell, dR, dC);
    if (!other) continue;
    const id = 'VS' + (steps.length + 1);
    steps.push({ id, a: cell, b: other });
    incidentAt.get(cell).push(
      { id, other, out: [S_FWD, S_FWD_X], in: [S_BWD, S_BWD_X] });
    incidentAt.get(other).push(
      { id, other: cell, out: [S_BWD, S_BWD_X], in: [S_FWD, S_FWD_X] });
  }
});
const cellOrder = new Map(gridCells.map((cell, i) => [cell, i]));
for (const list of incidentAt.values()) {
  list.sort((x, y) => cellOrder.get(x.other) - cellOrder.get(y.other));
}

// --- Domains --------------------------------------------------------------
const digitDomain = graph.makeReplicate(new Given(gridCells[0], ...DIGITS));
const labelDomainA = cageA.makeReplicate(
  new Given(cageA.at(gridCells[0]), ...Array.from({ length: OTHER_A }, (_, i) => i + 1)));
const labelDomainB = cageB.makeReplicate(
  new Given(cageB.at(gridCells[0]), ...Array.from({ length: OTHER_B }, (_, i) => i + 1)));
const loopDomain = loop.makeReplicate(
  new Given(loop.at(gridCells[0]), ...Array.from({ length: M_MAX }, (_, i) => i + 1)));
const posPDomain = posP.makeReplicate(
  new Given(posP.at(gridCells[0]), ...Array.from({ length: MOD_P }, (_, i) => i + 1)));
// VQ's modulus is the whole value range, so that layer needs no restriction.
// The step layer needs none either: the step machine below rejects any value
// past S_MAX.

// Exactly one of the two label layers owns each cell.
const oneLayerKey = Pair.fnToKey(
  (a, b) => a <= OTHER_A && b <= OTHER_B && ((a === OTHER_A) !== (b === OTHER_B)),
  geometry);
const oneLayer = gridCells.map(
  cell => new Pair(oneLayerKey, 'one-cage-layer', cageA.at(cell), cageB.at(cell)));

// A cage's own clued cell is in it, which is also what anchors each label to a
// distinct region and stops the labels from permuting.
const anchors = cages.flatMap(cage => [
  new Given(cageA.at(cage.cell), cage.overlay === cageA ? cage.label : OTHER_A),
  new Given(cageB.at(cage.cell), cage.overlay === cageB ? cage.label : OTHER_B),
]);

const connectivity = cages.map(
  cage => new ConnectedValues(cage.overlay === cageA ? 'VA' : 'VB', cage.label));

// --- Cage contents --------------------------------------------------------
// Digit sum and no repeats are both functions of the set of digits a cage
// holds, so one machine per cage scans its layer as (label, digit) pairs and
// accumulates that set as a bitmask.
const sumOfMask = (mask) =>
  DIGITS.reduce((total, d) => total + (mask & (1 << (d - 1)) ? d : 0), 0);
const cageContents = cages.map(cage => {
  const machine = NFA.encodeSpec({
    startState: { mask: 0, reading: false, inCage: false },
    transition: (state, value) => {
      if (!state.reading) {
        return { mask: state.mask, reading: true, inCage: value === cage.label };
      }
      if (!state.inCage) {
        return { mask: state.mask, reading: false, inCage: false };
      }
      if (value > DIGITS.length) return undefined;  // labels use the wider range
      const bit = 1 << (value - 1);
      if (state.mask & bit) return undefined;       // digits do not repeat
      return { mask: state.mask | bit, reading: false, inCage: false };
    },
    accept: (state) =>
      !state.reading && state.mask !== 0 && cage.sumOk(sumOfMask(state.mask)),
  }, geometry);
  return new NFA(machine, `${cage.name}-sum`,
    ...gridCells.flatMap(cell => [cage.overlay.at(cell), cell]));
});

// --- Step semantics -------------------------------------------------------
// A step's crossing flag has to agree with its two cells' labels. Both layers
// are read because two cells are in the same cage only when they agree on both.
const stepLabels = steps.map(s => {
  const machine = NFA.encodeSpec({
    startState: { k: 0 },
    transition: (state, value) => {
      switch (state.k) {
        case 0:
          if (value > S_MAX) return undefined;
          return { k: 1, crossing: isCrossing(value) };
        case 1: return { k: 2, crossing: state.crossing, seen: value };
        case 2:
          return { k: 3, crossing: state.crossing, sameA: value === state.seen };
        case 3:
          return { k: 4, crossing: state.crossing, sameA: state.sameA, seen: value };
        case 4: {
          const same = state.sameA && value === state.seen;
          return same === state.crossing ? undefined : { k: 5 };
        }
        default: return undefined;
      }
    },
    accept: (state) => state.k === 5,
  }, geometry);
  return new NFA(machine, 'step-cage-border',
    s.id, cageA.at(s.a), cageA.at(s.b), cageB.at(s.a), cageB.at(s.b));
});

// --- Loop degree ----------------------------------------------------------
// A cell off the loop uses no step; a cell on it is entered once and left once,
// which is what makes the route non-branching and crossing-free. The same scan
// settles the cell's ENTRY flag, since that is a property of the step the loop
// arrives on.
const degrees = gridCells.map(cell => {
  const incident = incidentAt.get(cell);
  const machine = NFA.encodeSpec({
    startState: { k: 0 },
    transition: (state, value) => {
      if (state.k === 0) {
        if (value > M_MAX) return undefined;
        return { k: 1, mode: value, in: 0, out: 0, crossIn: false };
      }
      const step = incident[state.k - 1];
      if (!step) return undefined;
      let { in: nIn, out: nOut, crossIn } = state;
      if (step.in.includes(value)) {
        nIn++;
        crossIn = isCrossing(value);
      } else if (step.out.includes(value)) {
        nOut++;
      } else if (value !== S_UNUSED && value !== S_UNUSED_X) {
        return undefined;
      }
      if (nIn > 1 || nOut > 1) return undefined;
      return { k: state.k + 1, mode: state.mode, in: nIn, out: nOut, crossIn };
    },
    accept: (state) => {
      if (state.k !== incident.length + 1) return false;
      if (!isOn(state.mode)) return state.in === 0 && state.out === 0;
      return state.in === 1 && state.out === 1 &&
        isEntry(state.mode) === state.crossIn;
    },
  }, geometry);
  return new NFA(machine, 'loop-degree',
    loop.at(cell), ...incident.map(step => step.id));
});

// --- The cage border rule -------------------------------------------------
// Only an unused crossing step needs checking: a used one already has both of
// its cells on the loop.
const borders = steps.map(s => {
  const machine = NFA.encodeSpec({
    startState: { k: 0 },
    transition: (state, value) => {
      switch (state.k) {
        case 0: return { k: 1, mustCover: value === S_UNUSED_X };
        case 1:
          return { k: 2, mustCover: state.mustCover && !isOn(value) };
        case 2: return state.mustCover && !isOn(value) ? undefined : { k: 3 };
        default: return undefined;
      }
    },
    accept: (state) => state.k === 3,
  }, geometry);
  return new NFA(machine, 'cage-border-visited',
    s.id, loop.at(s.a), loop.at(s.b));
});

// --- Each cage visited exactly once, for as many cells as its clue says -----
// One machine per cage scans its layer as (label, loop code) pairs, having read
// the clued cell's digit first. ENTRY cells are where a visit begins, so
// requiring exactly one of them is "visits each cage exactly once".
const cageVisits = cages.map(cage => {
  const machine = NFA.encodeSpec({
    startState: { k: 0 },
    transition: (state, value) => {
      if (state.k === 0) {
        if (value > DIGITS.length) return undefined;
        return { k: 1, digit: value, visited: 0, entries: 0, inCage: false };
      }
      if (state.k === 1) {
        return { k: 2, digit: state.digit, visited: state.visited,
          entries: state.entries, inCage: value === cage.label };
      }
      let { visited, entries } = state;
      if (state.inCage) {
        if (isOn(value)) visited++;
        if (isEntry(value)) entries++;
      }
      if (visited > state.digit || entries > 1) return undefined;
      return { k: 1, digit: state.digit, visited, entries, inCage: false };
    },
    accept: (state) =>
      state.k === 1 && state.entries === 1 && state.visited === state.digit,
  }, geometry);
  return new NFA(machine, `${cage.name}-loop-visit`, cage.cell,
    ...gridCells.flatMap(cell => [cage.overlay.at(cell), loop.at(cell)]));
});

// --- One loop -------------------------------------------------------------
// Consecutive cells of a route are orthogonally adjacent, so the cells of a
// single loop are one connected region. This rules out separate blobs but not
// two routes running alongside each other, which the seam and the position
// counters below finish off.
const loopConnected = new ConnectedValues(
  'VM', [M_ON, M_ENTRY, M_ON_SEAM, M_ENTRY_SEAM]);

// --- The seam -------------------------------------------------------------
// Numbering a closed loop is free to start anywhere and to run either way, an
// artifact of the counters rather than of the puzzle. The start is pinned by
// making the seam the first on-loop cell in reading order.
const seamPlacement = new NFA(NFA.encodeSpec({
  startState: { seen: false },
  transition: (state, value) => {
    if (value > M_MAX) return undefined;
    if (isSeam(value)) return state.seen ? undefined : { seen: true };
    if (!state.seen && isOn(value)) return undefined;
    return state;
  },
  accept: (state) => state.seen,
}, geometry), 'loop-seam', ...loop.at(gridCells));

// The direction is pinned by making the seam leave along the first of its steps
// in the order used by `incidentAt`. The seam has one step in and one step out,
// so exactly one of the two ways round satisfies this.
const seamDirection = gridCells.map(cell => {
  const incident = incidentAt.get(cell);
  const machine = NFA.encodeSpec({
    startState: { k: 0 },
    transition: (state, value) => {
      if (state.k === 0) return { k: 1, seam: isSeam(value), settled: false };
      const step = incident[state.k - 1];
      if (!step) return undefined;
      if (!state.seam || state.settled || !isUsed(value)) {
        return { k: state.k + 1, seam: state.seam, settled: state.settled };
      }
      if (!step.out.includes(value)) return undefined;
      return { k: state.k + 1, seam: true, settled: true };
    },
    accept: (state) =>
      state.k === incident.length + 1 && (!state.seam || state.settled),
  }, geometry);
  return new NFA(machine, 'loop-seam-direction',
    loop.at(cell), ...incident.map(step => step.id));
});

// --- Position counters ----------------------------------------------------
// Every step the loop uses moves one place on, except at the seam where the
// count restarts.
const nextPos = (value, mod) => 1 + (value % mod);
// A cell the loop misses, and the seam itself, both take position 1.
const restKey = Pair.fnToKey(
  (mode, value) => isOn(mode) && !isSeam(mode) || value === 1, geometry);
const counters = [[posP, MOD_P], [posQ, MOD_Q]].flatMap(([pos, mod]) => {
  const machine = NFA.encodeSpec({
    startState: { k: 0 },
    transition: (state, value) => {
      switch (state.k) {
        case 0:
          if (value > S_MAX) return undefined;
          return { k: 1, code: value };
        case 1: return { k: 2, code: state.code, aSeam: isSeam(value) };
        case 2: {
          const forward = state.code === S_FWD || state.code === S_FWD_X;
          const backward = state.code === S_BWD || state.code === S_BWD_X;
          const mode = forward ? (isSeam(value) ? 'free' : 'fwd')
            : backward ? (state.aSeam ? 'free' : 'bwd') : 'free';
          return { k: 3, mode };
        }
        case 3: return { k: 4, mode: state.mode, first: value };
        case 4: {
          if (state.mode === 'fwd' && value !== nextPos(state.first, mod)) {
            return undefined;
          }
          if (state.mode === 'bwd' && state.first !== nextPos(value, mod)) {
            return undefined;
          }
          return { k: 5 };
        }
        default: return undefined;
      }
    },
    accept: (state) => state.k === 5,
  }, geometry);
  return [
    ...steps.map(s => new NFA(machine, `loop-position-mod-${mod}`,
      s.id, loop.at(s.a), loop.at(s.b), pos.at(s.a), pos.at(s.b))),
    ...gridCells.map(cell => new Pair(restKey, `loop-position-rest-mod-${mod}`,
      loop.at(cell), pos.at(cell))),
  ];
});

return [
  shape,
  cageA.toVar('cage label 1-9'),
  cageB.toVar('cage label 10-17'),
  new Var('S', 'loop steps', steps.length),
  loop.toVar('loop at cell'),
  posP.toVar('loop position mod ' + MOD_P),
  posQ.toVar('loop position mod ' + MOD_Q),
  digitDomain,
  labelDomainA,
  labelDomainB,
  loopDomain,
  posPDomain,
  ...oneLayer,
  ...anchors,
  ...connectivity,
  ...cageContents,
  ...stepLabels,
  ...degrees,
  ...borders,
  ...cageVisits,
  loopConnected,
  seamPlacement,
  ...seamDirection,
  ...counters,
];
