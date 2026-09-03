// Title: Frak
// Author: zetamath
// Video: https://www.youtube.com/watch?v=Sx2GQGw48Pg
// Source: https://app.crackingthecryptic.com/sudoku/8DfMHmLpqP

// Rules encoded below:
//  - Place 1-9 once each in every row, column and region. The nine regions are
//    not drawn: each is nine orthogonally connected cells holding 1-9 once.
//  - Blue lines: cut each line into maximal runs of consecutive line cells that
//    lie in one region. Every run of a given line sums to the same N (N is per
//    line), and a line that re-enters a region contributes one run per visit.
//  - Every line covers at least two regions.
//  - The digit in a circle is the number of cells in the run the circled cell
//    belongs to.
// "Not all circles are necessarily given" only denies the reader an
// exhaustiveness inference; an uncircled run has no length clue, so it adds no
// constraint here.

const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC');

const GIVENS = [
  ['R1C1', 1], ['R1C9', 2], ['R5C5', 4], ['R9C1', 3], ['R9C9', 6],
];

// Blue-line cell paths, in stroke order, transcribed from the drawn waypoints.
// The border ring's stroke returns to its first cell, so it is a closed line:
// the step from its last cell back to R8C1 is a real step of the line and its
// runs wrap across it.
const LINES = [
  {
    closed: true,
    cells: [
      'R8C1', 'R7C1', 'R6C1', 'R5C1', 'R4C1', 'R3C1', 'R2C1',
      'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8',
      'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9',
      'R9C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2',
    ],
  },
  {
    closed: false,
    cells: [
      'R8C4', 'R8C3', 'R8C2', 'R7C2', 'R6C2', 'R5C2', 'R4C2', 'R3C2', 'R2C2',
      'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R3C8', 'R4C8',
    ],
  },
  { closed: false, cells: ['R5C8', 'R6C8', 'R7C8'] },
  {
    closed: false,
    cells: [
      'R3C3', 'R3C4', 'R4C4', 'R5C4', 'R6C3', 'R6C4', 'R7C5', 'R6C5', 'R5C5',
    ],
  },
  { closed: false, cells: ['R7C4', 'R8C5'] },
  { closed: false, cells: ['R5C7', 'R6C7', 'R7C7', 'R7C6'] },
];

// Circled cells, from the six white circle overlays; each is centred on a cell
// that its line passes through.
const CIRCLE_CELLS = ['R5C1', 'R1C6', 'R3C9', 'R7C9', 'R9C5', 'R8C2'];

// A run lies inside one region, so it holds at most nine cells and, those cells
// being distinct cells of that region, at most nine distinct digits.
const MAX_RUN_CELLS = 9;
const MAX_RUN_SUM = 45;

// One border flag per step of a line: 1 = the two cells share a region, 2 = a
// region boundary falls between them. Steps are indexed per line; a closed line
// also owns the step from its last cell back to its first.
const stepsOf = line => line.cells.length - (line.closed ? 0 : 1);
const flags = new Var('F', 'line-step region borders', LINES.reduce(
  (total, line) => total + stepsOf(line), 0));

const flagBase = [];
LINES.reduce((next, line, i) => {
  flagBase[i] = next;
  return next + stepsOf(line);
}, 0);

// step(i, s) is the flag on the step out of cells[s] into cells[s + 1] (the
// closing step, for s = length - 1 of a closed line).
const step = (i, s) => flags.cell(flagBase[i] + s + 1);

// Interleave a line as [cell, flag, cell, flag, ..., cell], starting at index
// `from` and taking `count` cells, wrapping for a closed line.
const walk = (i, from, count) => {
  const { cells } = LINES[i];
  const n = cells.length;
  const out = [];
  for (let j = 0; j < count; j++) {
    const idx = (from + j) % n;
    if (j > 0) out.push(step(i, (idx + n - 1) % n));
    out.push(cells[idx]);
  }
  return out;
};

// A flag agrees with the region labels either side of its step. The machine
// reads [label, flag, label] and accepts only when flag = 2 matches a change of
// label.
const borderFlagNFA = NFA.encodeSpec({
  startState: { read: 0 },
  transition: (state, value) => {
    if (state.read === 0) return { read: 1, label: value };
    if (state.read === 1) {
      if (value !== 1 && value !== 2) return undefined;
      return { read: 2, label: state.label, isBorder: value === 2 };
    }
    if (state.read === 2) {
      return state.isBorder === (value !== state.label) ? { read: 3 } : undefined;
    }
    return undefined;
  },
  accept: state => state.read === 3,
}, 9);

const borderFlags = LINES.flatMap((line, i) => {
  const n = line.cells.length;
  return Array.from({ length: stepsOf(line) }, (_, s) => new NFA(
    borderFlagNFA, 'border',
    cc.at(line.cells[s]), step(i, s), cc.at(line.cells[(s + 1) % n])));
});

// Equal run sums along an open line, scanning [value, flag, value, ...].
// `target` is N; 0 means no run has closed yet, so requiring it to be set at the
// end is also the "every line covers at least two regions" clause. `sum` is the
// running total of the current run.
const openLineNFA = NFA.encodeSpec({
  startState: { onValue: true, target: 0, sum: 0 },
  transition: ({ onValue, target, sum }, value) => {
    if (onValue) {
      const next = sum + value;
      if (next > MAX_RUN_SUM) return undefined;
      if (target !== 0 && next > target) return undefined;
      return { onValue: false, target, sum: next };
    }
    if (value === 1) return { onValue: true, target, sum };
    if (value !== 2) return undefined;
    if (target === 0) return { onValue: true, target: sum, sum: 0 };
    if (sum !== target) return undefined;
    return { onValue: true, target, sum: 0 };
  },
  accept: ({ onValue, target, sum }) => !onValue && target !== 0 && sum === target,
}, 9);

// The closed line's runs wrap, so a straight left-to-right scan would split the
// run that spans its ends. Two extra var cells carry that run's tail total as
// base-9 digits: `carry` is the total of the cells from the last border round to
// the line's last cell.
//   - closing step is a border: that tail is a complete run, so it fixes N, and
//     the scan starts a fresh run at the first cell;
//   - closing step is not a border: the tail continues into the first cell, so
//     the scan starts with `sum` seeded to `carry`.
// Either way the scan ends inside that same tail, so re-reading the two carry
// cells at the end and demanding they spell the final `sum` both closes the wrap
// and pins the carry cells to the value they claim.
const CARRY_BASE = 9;
const carry = new Var('W', 'wrapped run total, base 9', 2);
const closedLineNFA = NFA.encodeSpec({
  startState: { phase: 'high' },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      if (state.phase !== 'body') return undefined;
      if (state.onValue) return state;                    // header/body boundary
      if (state.target === 0) return undefined;           // only one region
      return { phase: 'tailHigh', need: state.sum };
    }
    switch (state.phase) {
      case 'high':
        return { phase: 'low', high: value - 1 };
      case 'low': {
        const total = state.high * CARRY_BASE + (value - 1);
        if (total > MAX_RUN_SUM) return undefined;
        return { phase: 'wrap', carry: total };
      }
      case 'wrap':
        if (value === 1) {
          return { phase: 'body', onValue: true, target: 0, sum: state.carry };
        }
        if (value === 2 && state.carry > 0) {
          return { phase: 'body', onValue: true, target: state.carry, sum: 0 };
        }
        return undefined;
      case 'body': {
        const { onValue, target, sum } = state;
        if (onValue) {
          const next = sum + value;
          if (next > MAX_RUN_SUM) return undefined;
          if (target !== 0 && next > target) return undefined;
          return { phase: 'body', onValue: false, target, sum: next };
        }
        if (value === 1) return { phase: 'body', onValue: true, target, sum };
        if (value !== 2) return undefined;
        if (target === 0) return { phase: 'body', onValue: true, target: sum, sum: 0 };
        if (sum !== target) return undefined;
        return { phase: 'body', onValue: true, target, sum: 0 };
      }
      case 'tailHigh': {
        const low = state.need - (value - 1) * CARRY_BASE;
        if (low < 0 || low >= CARRY_BASE) return undefined;
        return { phase: 'tailLow', low: low + 1 };
      }
      case 'tailLow':
        return value === state.low ? { phase: 'done' } : undefined;
      default:
        return undefined;
    }
  },
  accept: state => state.phase === 'done',
}, 9, { multiSegment: true });

const lineSums = LINES.map((line, i) => {
  const n = line.cells.length;
  if (!line.closed) {
    return new NFA(openLineNFA, 'runsums', walk(i, 0, n));
  }
  return new NFA(
    closedLineNFA, 'runsums',
    [carry.cell(1), carry.cell(2), step(i, n - 1)],
    walk(i, 0, n),
    [carry.cell(1), carry.cell(2)]);
});

// A circled digit counts the cells of its own run. The scan is split so the
// machine knows where the circle is: cells before it (ending with the flag that
// steps into it), the circled cell itself, then the rest of the line.
// `count` is how much of the run precedes the circle; `need` is how much must
// still follow it.
const circleNFA = NFA.encodeSpec({
  startState: { phase: 'before', onValue: true, count: 0 },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      if (state.phase === 'before') {
        return state.onValue ? { phase: 'circle', count: state.count } : undefined;
      }
      if (state.phase === 'sized') {
        return { phase: 'after', onValue: false, need: state.need };
      }
      return undefined;
    }
    switch (state.phase) {
      case 'before':
        if (state.onValue) {
          return {
            phase: 'before', onValue: false,
            count: Math.min(state.count + 1, MAX_RUN_CELLS + 1),
          };
        }
        if (value === 1) return { phase: 'before', onValue: true, count: state.count };
        if (value === 2) return { phase: 'before', onValue: true, count: 0 };
        return undefined;
      case 'circle': {
        const need = value - state.count - 1;
        return need < 0 ? undefined : { phase: 'sized', need };
      }
      case 'after':
        if (state.onValue) {
          if (state.need === 0) return undefined;
          return { phase: 'after', onValue: false, need: state.need - 1 };
        }
        if (value === 1) return { phase: 'after', onValue: true, need: state.need };
        if (value === 2) return state.need === 0 ? { phase: 'done' } : undefined;
        return undefined;
      case 'done':
        return state;
      default:
        return undefined;
    }
  },
  accept: state => state.phase === 'done'
    || (state.phase === 'after' && !state.onValue && state.need === 0),
}, 9, { multiSegment: true });

const circleCounts = CIRCLE_CELLS.map(circle => {
  const i = LINES.findIndex(line => line.cells.includes(circle));
  const { cells, closed } = LINES[i];
  const n = cells.length;
  // A run holds at most nine cells, so on the closed line the circle's run
  // cannot reach either end of a scan that starts half a lap away from it: the
  // rotation makes the wrap irrelevant for this machine.
  const from = closed ? (cells.indexOf(circle) - (n >> 1) + n) % n : 0;
  const at = closed ? n >> 1 : cells.indexOf(circle);
  return new NFA(
    circleNFA, 'runlength',
    walk(i, from, at + 1).slice(0, -1),
    [circle],
    walk(i, from + at, n - at).slice(1));
});

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  flags,
  carry,
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
  ...borderFlags,
  ...lineSums,
  ...circleCounts,
];
