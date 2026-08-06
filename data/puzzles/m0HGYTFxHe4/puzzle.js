// Title: Renban Snakes
// Author: Chad
// Video: https://www.youtube.com/watch?v=m0HGYTFxHe4
// Source: https://sudokupad.app/kb9l12ce0e

// Rules encoded here:
//  - Normal sudoku.
//  - Each of the 18 arrow cells starts a snake whose first step is in the
//    arrow's direction and whose length is the digit in the arrow cell. A
//    snake is a non-branching orthogonal path of distinct cells, and snakes
//    may not overlap themselves or each other.
//  - Each snake is a renban: its digits are a set of non-repeating consecutive
//    values.
//  - The white dot between R8C9 and R9C9.
//
// Omitted:
//  - "One-cell wide", if that is meant to forbid a snake from running
//    alongside itself, i.e. two of its cells orthogonally adjacent without
//    being consecutive along the path. Only branching and self-overlap are
//    encoded, so a snake here may touch itself.
//  - Fog and the FOGLIGHT cages are reveal mechanics, not final-grid rules.
//
// The arrow direction is read as the snake's first step, not as the whole
// snake's heading. A straight-line reading is unsatisfiable: R2C7, R2C8 and
// R2C9 all point up, so each of their snakes could reach at most row 1, giving
// three cells of row 2 digits of at most 2.

// Snake overlay. Each grid cell carries eight codes:
//   VP  predecessor: OFF, START, or which neighbour precedes it
//   VS  successor:   OFF, END, or which neighbour follows it
//   VR  cells remaining from here to the snake's tail, inclusive (OFF = 10)
//   VL  lowest value of its snake's renban run                  (OFF = 10)
//   VH  highest value of its snake's renban run                 (OFF = 10)
//   VA/VB/VC  base-8 digits of the running digit mask (see below)
// VP and VS are kept in step by the per-edge link rules, so a cell has at most
// one predecessor and at most one successor: paths cannot branch, cross
// themselves, or merge, and no cell lies on two snakes. VR counts down along
// every step, so a chain cannot close into a loop and every snake cell traces
// back to a START cell.
const P_OFF = 1, P_START = 2;
const P_FROM = { U: 3, D: 4, L: 5, R: 6 };   // the neighbour that precedes me
const S_OFF = 1, S_END = 2;
const S_TO = { U: 3, D: 4, L: 5, R: 6 };     // the neighbour that follows me
const OFF_VALUE = 10;                        // VR / VL / VH "not on a snake"

// VA/VB/VC hold one base-8 digit each of MASK = sum of 2^(digit-1) over the
// snake cells from its start up to this cell, so 0 <= MASK <= 511. A cell
// value of v stores the base-8 digit v - 1.
const BASE = 8;
const MASK_ZERO = 1;                         // the cell value standing for 0

const STEP = { U: [-1, 0], D: [1, 0], L: [0, -1], R: [0, 1] };
const OPPOSITE = { U: 'D', D: 'U', L: 'R', R: 'L' };
const ALL_DIRS = ['U', 'D', 'L', 'R'];

// Every arrow in the puzzle, with the direction it points.
const arrows = {
  R1C3: 'L', R1C4: 'L', R2C3: 'L', R5C4: 'L', R5C7: 'L',
  R3C2: 'R', R4C6: 'R', R9C2: 'R',
  R3C9: 'D', R6C7: 'D',
  R2C7: 'U', R2C8: 'U', R2C9: 'U', R3C1: 'U', R3C4: 'U',
  R6C2: 'U', R7C5: 'U', R7C8: 'U',
};

// Value 10 is state-only: it is the OFF marker for VR/VL/VH. Grid cells are
// pinned back to 1-9 below.
const shape = new Shape('9x9', 10);
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

const pred = graph.makeOverlay('VP');
const succ = graph.makeOverlay('VS');
const rem = graph.makeOverlay('VR');
const lo = graph.makeOverlay('VL');
const hi = graph.makeOverlay('VH');
const maskDigits = [graph.makeOverlay('VA'), graph.makeOverlay('VB'),
graph.makeOverlay('VC')];
const maskAt = cell => maskDigits.map(layer => layer.at(cell));

const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
const gridDomain = graph.makeReplicate(new Given(gridCells[0], ...range(1, 9)));
const maskDomains = maskDigits.map(layer => layer.makeReplicate(
  new Given(layer.at(gridCells[0]), ...range(1, BASE))));

// --- Overlay domains. A cell may only point at a neighbour that exists, and
// only an arrow cell may be a snake start.
const predDomains = gridCells.map(cell => {
  if (arrows[cell]) return new Given(pred.at(cell), P_START);
  const dirs = ALL_DIRS.filter(d => graph.step(cell, ...STEP[d]));
  return new Given(pred.at(cell), P_OFF, ...dirs.map(d => P_FROM[d]));
});
const succDomains = gridCells.map(cell => {
  const dirs = arrows[cell]
    ? [arrows[cell]]
    : ALL_DIRS.filter(d => graph.step(cell, ...STEP[d]));
  const values = arrows[cell] ? [S_END] : [S_OFF, S_END];
  return new Given(succ.at(cell), ...values, ...dirs.map(d => S_TO[d]));
});

// --- Per-cell state agreement.
const key = fn => Pair.fnToKey(fn, geometry);
const offSync = target => key((p, x) => (p === P_OFF) === (x === target));
const keyOffSucc = offSync(S_OFF);
const keyOffState = offSync(OFF_VALUE);
// One-directional: an on-snake cell may still have a zero base-8 mask digit.
const keyOffMask = key((p, x) => p !== P_OFF || x === MASK_ZERO);
const keyTail = key((s, r) => (s === S_END) === (r === 1));
// The digit sits inside its snake's run; an off-snake cell has no run.
const keyAtLeastLo = key((d, l) => l === OFF_VALUE || d >= l);
const keyAtMostHi = key((d, h) => h === OFF_VALUE || d <= h);

const cellRules = gridCells.flatMap(cell => [
  new Pair(keyOffSucc, 'off', pred.at(cell), succ.at(cell)),
  new Pair(keyOffState, 'off', pred.at(cell), rem.at(cell)),
  new Pair(keyOffState, 'off', pred.at(cell), lo.at(cell)),
  new Pair(keyOffState, 'off', pred.at(cell), hi.at(cell)),
  ...maskAt(cell).map(m => new Pair(keyOffMask, 'off', pred.at(cell), m)),
  new Pair(keyTail, 'tail', succ.at(cell), rem.at(cell)),
  new Pair(keyAtLeastLo, 'run', cell, lo.at(cell)),
  new Pair(keyAtMostHi, 'run', cell, hi.at(cell)),
]);

// --- Per-edge rules, applied to every ordered pair of adjacent cells.
// Link: this cell steps to that neighbour exactly when the neighbour is
// entered from this cell.
const linkKeys = Object.fromEntries(ALL_DIRS.map(d =>
  [d, key((s, p) => (s === S_TO[d]) === (p === P_FROM[OPPOSITE[d]]))]));

// Carry: across a used step the remaining count drops by one and the renban
// run is unchanged. Reads [succ, rem, rem', lo, lo', hi, hi'].
const carrySpecs = Object.fromEntries(ALL_DIRS.map(d => [d, NFA.encodeSpec({
  startState: { phase: 'step' },
  transition: (state, value) => {
    switch (state.phase) {
      // Not a used step: consume the six carried values without testing them.
      case 'step':
        return value === S_TO[d] ? { phase: 'remA' } : { phase: 'skip', left: 6 };
      case 'skip':
        return state.left > 1 ? { phase: 'skip', left: state.left - 1 } : { phase: 'done' };
      // A cell with one cell remaining is a tail, so it has no successor.
      case 'remA':
        return value >= 2 && value <= 9 ? { phase: 'remB', v: value } : undefined;
      case 'remB':
        return value === state.v - 1 ? { phase: 'loA' } : undefined;
      case 'loA':
        return { phase: 'loB', v: value };
      case 'loB':
        return value === state.v ? { phase: 'hiA' } : undefined;
      case 'hiA':
        return { phase: 'hiB', v: value };
      case 'hiB':
        return value === state.v ? { phase: 'done' } : undefined;
      default:
        return undefined;
    }
  },
  accept: state => state.phase === 'done',
}, geometry)]));

// Accumulate: across a used step the successor's own bit 2^(digit-1) is added
// to the running mask, in base 8 with carries. Reads
// [succ, digit', maskA, maskA', maskB, maskB', maskC, maskC']. A total above
// 511 cannot be a renban run, so an overflow out of the top digit is rejected.
const accumSpecs = Object.fromEntries(ALL_DIRS.map(d => [d, NFA.encodeSpec({
  startState: { phase: 'step' },
  transition: (state, value) => {
    const digit = v => v - 1;   // cell value -> stored base-8 digit
    switch (state.phase) {
      case 'step':
        return value === S_TO[d] ? { phase: 'digit' } : { phase: 'skip', left: 7 };
      case 'skip':
        return state.left > 1 ? { phase: 'skip', left: state.left - 1 } : { phase: 'done' };
      case 'digit':
        return { phase: 'lowA', add: 1 << (value - 1) };
      case 'lowA':
        return { phase: 'lowB', sum: digit(value) + (state.add % BASE), rest: (state.add / BASE) | 0 };
      case 'lowB': {
        if (state.sum % BASE !== digit(value)) return undefined;
        return { phase: 'midA', rest: state.rest + ((state.sum / BASE) | 0) };
      }
      case 'midA':
        return { phase: 'midB', sum: digit(value) + (state.rest % BASE), rest: (state.rest / BASE) | 0 };
      case 'midB': {
        if (state.sum % BASE !== digit(value)) return undefined;
        return { phase: 'topA', rest: state.rest + ((state.sum / BASE) | 0) };
      }
      case 'topA': {
        const sum = digit(value) + state.rest;
        return sum < BASE ? { phase: 'topB', sum } : undefined;
      }
      case 'topB':
        return state.sum === digit(value) ? { phase: 'done' } : undefined;
      default:
        return undefined;
    }
  },
  accept: state => state.phase === 'done',
}, geometry)]));

const edgeRules = gridCells.flatMap(cell => ALL_DIRS.flatMap(d => {
  const next = graph.step(cell, ...STEP[d]);
  if (!next) return [];
  return [
    new Pair(linkKeys[d], `link-${d}`, succ.at(cell), pred.at(next)),
    new NFA(carrySpecs[d], `carry-${d}`,
      succ.at(cell),
      rem.at(cell), rem.at(next),
      lo.at(cell), lo.at(next),
      hi.at(cell), hi.at(next)),
    new NFA(accumSpecs[d], `mask-${d}`,
      succ.at(cell), next,
      ...maskAt(cell).flatMap((m, i) => [m, maskAt(next)[i]])),
  ];
}));

// --- Renban. At the tail the running mask must be exactly the run VL..VH,
// which has VH - VL + 1 = (the start digit) = (the snake's cell count) bits
// set. A sum of that many powers of two can only equal a number with that many
// bits set if the powers are all different, so the snake's digits are the
// distinct values VL..VH. Reads [rem, lo, hi, maskA, maskB, maskC].
const renbanSpec = NFA.encodeSpec({
  startState: { phase: 'rem' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'rem':
        return value === 1 ? { phase: 'lo' } : { phase: 'skip', left: 5 };
      case 'skip':
        return state.left > 1 ? { phase: 'skip', left: state.left - 1 } : { phase: 'done' };
      case 'lo':
        return value <= 9 ? { phase: 'hi', lo: value } : undefined;
      case 'hi':
        return value >= state.lo && value <= 9
          ? { phase: 'maskA', mask: (1 << value) - (1 << (state.lo - 1)) }
          : undefined;
      case 'maskA':
        return state.mask % BASE === value - 1
          ? { phase: 'maskB', mask: (state.mask / BASE) | 0 } : undefined;
      case 'maskB':
        return state.mask % BASE === value - 1
          ? { phase: 'maskC', mask: (state.mask / BASE) | 0 } : undefined;
      case 'maskC':
        return state.mask === value - 1 ? { phase: 'done' } : undefined;
      default:
        return undefined;
    }
  },
  accept: state => state.phase === 'done',
}, geometry);

const renbanRules = gridCells.map(cell => new NFA(renbanSpec, 'renban',
  rem.at(cell), lo.at(cell), hi.at(cell), ...maskAt(cell)));

// --- Snake starts. The arrow's digit is the snake's length: the cells
// remaining from the start, and the width of its renban run. A one-cell snake
// ends immediately; any longer one steps the way the arrow points. The
// running mask starts as the start cell's own bit.
const firstStepKeys = Object.fromEntries(ALL_DIRS.map(d =>
  [d, key((r, s) => r === 1 ? s === S_END : s === S_TO[d])]));
const seedSpec = NFA.encodeSpec({
  startState: { phase: 'digit' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'digit':
        return { phase: 'maskA', mask: 1 << (value - 1) };
      case 'maskA':
        return state.mask % BASE === value - 1
          ? { phase: 'maskB', mask: (state.mask / BASE) | 0 } : undefined;
      case 'maskB':
        return state.mask % BASE === value - 1
          ? { phase: 'maskC', mask: (state.mask / BASE) | 0 } : undefined;
      case 'maskC':
        return state.mask === value - 1 ? { phase: 'done' } : undefined;
      default:
        return undefined;
    }
  },
  accept: state => state.phase === 'done',
}, geometry);

const startRules = Object.entries(arrows).flatMap(([cell, d]) => [
  new SameValues(2, cell, rem.at(cell)),
  new Pair(firstStepKeys[d], `start-${d}`, rem.at(cell), succ.at(cell)),
  // digit - hi + lo = 1, i.e. the run holds exactly `digit` values.
  new Sum(1, cell, [hi.at(cell), -1], [lo.at(cell), 1]),
  new NFA(seedSpec, 'seed', cell, ...maskAt(cell)),
]);

return [
  shape,
  gridDomain,
  pred.toVar('snake predecessor'),
  succ.toVar('snake successor'),
  rem.toVar('snake cells remaining'),
  lo.toVar('snake run low'),
  hi.toVar('snake run high'),
  maskDigits[0].toVar('snake mask 1s'),
  maskDigits[1].toVar('snake mask 8s'),
  maskDigits[2].toVar('snake mask 64s'),
  ...maskDomains,
  ...predDomains,
  ...succDomains,
  ...cellRules,
  ...edgeRules,
  ...renbanRules,
  ...startRules,
  new WhiteDot('R8C9', 'R9C9'),
];
