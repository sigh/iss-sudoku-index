// Title: Wekiera
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=-1o9QtxG91E
// Source: https://sudokupad.app/9mnu386ybb

// Rules encoded:
// - Six distinct digits from 1-9, the same six in every row, column and
//   region: a 6x6 grid over 1-9 with RegionSameValues.
// - Six orthogonally connected 6-cell regions, deduced: ChaosConstruction.
// - The pill R1C1-R1C3 read left to right equals the sum of the shaft.
// - Region borders divide the shaft into segments of equal sum: a division
//   falls between consecutive shaft cells exactly when they lie in different
//   regions, including on a diagonal step where the shaft crosses from one
//   region to another through a cell corner. A border that merely touches the
//   shaft at a corner (both cells in one region) does not divide it.
// - Within each segment digits strictly increase toward the arrowhead (R2C1).

const shape = new Shape('6x6', 9);
const graph = cellGraph(shape);
const cc = graph.makeOverlay('CC');

// Arrow shaft from the drawn arrow's waypoints, pill end first, head last.
const SHAFT = [
  'R1C4', 'R1C5', 'R1C6', 'R2C5', 'R2C6', 'R3C6', 'R4C6', 'R5C6', 'R6C6',
  'R5C5', 'R4C4', 'R4C5', 'R3C4', 'R3C5', 'R2C4', 'R2C3', 'R2C2', 'R3C3',
  'R4C2', 'R4C3', 'R5C4', 'R6C5', 'R6C4', 'R5C3', 'R5C2', 'R6C3', 'R6C2',
  'R6C1', 'R5C1', 'R4C1', 'R3C2', 'R3C1', 'R2C1',
];
// Pill overlay cells, left to right.
const PILL = ['R1C1', 'R1C2', 'R1C3'];

// One flag Var per shaft step: SAME = no division, BORDER = division.
const SAME = 1;
const BORDER = 2;
const steps = SHAFT.slice(1).map((b, i) => ({ a: SHAFT[i], b }));
const flags = new Var('F', 'Shaft divisions', steps.length);
const flag = (i) => flags.cell(i + 1);

// Reads [label(a), flag, label(b)]: BORDER exactly when the labels differ.
const borderSpec = NFA.encodeSpec({
  startState: { phase: 'la' },
  transition: (state, value) => {
    if (state.phase === 'la') return { phase: 'flag', la: value };
    if (state.phase === 'flag') {
      if (value !== SAME && value !== BORDER) return undefined;
      return { phase: 'lb', la: state.la, f: value };
    }
    if (state.phase === 'lb') {
      return (state.f === BORDER) === (value !== state.la) ? { phase: 'done' } : undefined;
    }
    return undefined;
  },
  accept: ({ phase }) => phase === 'done',
}, shape);

// Reads [a, flag, b]: unless the step is a division, b > a.
const increaseSpec = NFA.encodeSpec({
  startState: { phase: 'a' },
  transition: (state, value) => {
    if (state.phase === 'a') return { phase: 'flag', a: value };
    if (state.phase === 'flag') return { phase: 'b', a: state.a, f: value };
    if (state.phase === 'b') {
      return state.f === BORDER || value > state.a ? { phase: 'done' } : undefined;
    }
    return undefined;
  },
  accept: ({ phase }) => phase === 'done',
}, shape);

// Reads [v1, f1, v2, f2, ..., v33]. `target` is the first segment's sum,
// fixed at the first division; `run` is the current segment's sum.
// A segment is strictly increasing, so its sum is at most 1+2+...+9 = 45;
// sums past that are rejected early to bound the state.
const MAX_SEGMENT = 45;
const equalSumSpec = NFA.encodeSpec({
  startState: { onValue: true, target: null, run: 0 },
  transition: ({ onValue, target, run }, value) => {
    if (onValue) {
      const next = run + value;
      if (next > (target ?? MAX_SEGMENT)) return undefined;
      return { onValue: false, target, run: next };
    }
    if (value === SAME) return { onValue: true, target, run };
    if (value !== BORDER) return undefined;
    if (target !== null && run !== target) return undefined;
    return { onValue: true, target: run, run: 0 };
  },
  accept: ({ onValue, target, run }) => !onValue && (target === null || run === target),
}, shape);

const flagRules = steps.map(({ a, b }, i) =>
  new NFA(borderSpec, 'RegionBorder', cc.at(a), flag(i), cc.at(b)));
const increases = steps.map(({ a, b }, i) =>
  new NFA(increaseSpec, 'SegmentIncrease', a, flag(i), b));
const scan = SHAFT.flatMap((cell, i) => i < steps.length ? [cell, flag(i)] : [cell]);

return [
  shape,
  new NoBoxes(),
  new ChaosConstruction(),
  new RegionSameValues(),
  new PillArrow(3, ...PILL, ...SHAFT),
  flags,
  ...flagRules,
  ...increases,
  new NFA(equalSumSpec, 'EqualSegments', ...scan),
];
