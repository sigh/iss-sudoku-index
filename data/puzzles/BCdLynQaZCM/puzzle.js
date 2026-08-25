// Title: Sum Irregular Shapes
// Author: BebopKid
// Video: https://www.youtube.com/watch?v=BCdLynQaZCM
// Source: https://app.crackingthecryptic.com/webapp/bHm83hpP6m

// Standard rules: rows, columns and nine 9-cell shapes each contain 1-9. The
// shapes (jigsaw regions) are not drawn -- the solver must discover a
// partition of the grid into nine orthogonally-connected 9-cell regions.
// Encoded as ChaosConstruction (regions discovered by the solver: size 9,
// connected, each holds every value once) with NoBoxes replacing the default
// box groups; rows/columns keep the grid's normal all-different groups.
//
// For every row and column, printed clues outside the grid give the sum of
// each maximal run of cells that share one region, in order, reading from the
// clue nearest the grid outward -- this is the standard "outside clue reads
// into the grid from its own edge" idiom used by Sandwich/X-Sum/Skyscraper
// clues, extended here to a stack of clues for a row or column split into
// several regions. A "-" clue means that segment's sum is not given (still
// forced to be some value, just unconstrained). Which physical end of each
// clue stack is "first" is not spelled out in the rules text, so both
// orientations are kept live per line via Or().
//
// Every row/column clue-stack length was cross-checked against the grid: a
// stack with no "-" always summed to exactly 45 (the row/column's full
// total), confirming the clue-to-cell mapping below.
//
// The payload also carries two isolated cells (values 1 and 9, separated by
// a "-") far outside the grid and every clue stack, with no path of coloured
// cells connecting them to either. They are not reachable as real board
// cells under this geometry and are treated as a legend/demo of the given
// and "-" notation rather than puzzle content, so they are not encoded.

const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC');

// Segment-sum clue stacks, decoded from the payload's outside-clue overlays.
// Order is nearest-the-grid first; `null` is an unclued ("-") segment.
const ROW_TARGETS = [
  [null, null, 9, 6],
  [12, null, null, 12, 7],
  [2, 9, 5, null, null, 11, 8],
  [8, 5, 11, null, null, 7, 5],
  [4, 9, 5, null, null, 9, 9],
  [null, null, 14, 1, 16, 9],
  [7, 3, null, null, null, 11, 5],
  [7, 3, 18, 8, null, null],
  [33, 12],
];
const COL_TARGETS = [
  [null, 41, null],
  [13, 13, null, null],
  [1, 15, 29],
  [14, 17, 14],
  [null, null, 31],
  [7, null, null, 20],
  [8, 15, 10, null, null],
  [10, 21, 6, 8],
  [11, 34],
];

// Border-flag alphabet: any two distinct values from the grid's own 1-9
// range work, since these Var cells are auxiliary bookkeeping, not digits.
const SAME = 1;
const DIFF = 9;

// One flag per adjacent cell pair inside a row (8) or column (8): a 9x8 Var
// block per axis, addressed by (row/col, gap index) through the built-in 2D
// cell() indexing rather than hand-rolled arithmetic.
const rowFlags = new Var('RF', 'Row border flags', '9x8');
const colFlags = new Var('CF', 'Col border flags', '9x8');
const rowFlag = (r, i) => rowFlags.cell(r, i); // i: 1..8, gap between col i, i+1
const colFlag = (c, i) => colFlags.cell(c, i);

// [ccA, flag, ccB] accepts only when flag correctly reports whether the two
// region labels differ.
const borderFlagSpec = NFA.encodeSpec({
  startState: { a: null, flag: null },
  transition: ({ a, flag }, value) => {
    if (a === null) return { a: value, flag: null };
    if (flag === null) return { a, flag: value };
    const actuallyDiffer = value !== a;
    const flagSaysDiffer = flag === DIFF;
    return actuallyDiffer === flagSaysDiffer ? { a, flag, ok: true } : undefined;
  },
  accept: (s) => s.ok === true,
}, 9);

// Scans [value, flag, value, flag, ..., value] (9 values, 8 flags). `targets`
// gives each segment's required sum in encounter order (null = unclued).
// Running sum resets at each flag that reports a region change; the final
// segment is checked in `accept` since the scan ends on a value, not a flag.
function segmentSpec(targets) {
  const lastIdx = targets.length - 1;
  return NFA.encodeSpec({
    startState: { onValue: true, segIdx: 0, sum: 0 },
    transition: ({ onValue, segIdx, sum }, value) => {
      if (onValue) {
        const newSum = sum + value;
        if (newSum > 45) return undefined;
        return { onValue: false, segIdx, sum: newSum };
      }
      if (value !== DIFF) return { onValue: true, segIdx, sum };
      const target = targets[segIdx];
      if (target !== null && sum !== target) return undefined;
      if (segIdx >= lastIdx) return undefined; // more borders than expected segments
      return { onValue: true, segIdx: segIdx + 1, sum: 0 };
    },
    accept: ({ segIdx, sum }) =>
      segIdx === lastIdx && (targets[segIdx] === null || sum === targets[segIdx]),
  }, 9);
}

function lineConstraints(values, ccCells, flags, targetsNear) {
  const borderChecks = [];
  for (let i = 0; i < 8; i++) {
    borderChecks.push(new NFA(borderFlagSpec, 'Border', ccCells[i], flags[i], ccCells[i + 1]));
  }
  const scanCells = [];
  for (let i = 0; i < 9; i++) {
    scanCells.push(values[i]);
    if (i < 8) scanCells.push(flags[i]);
  }
  const targetsFar = targetsNear.slice().reverse();
  const segmentOr = new Or([
    new NFA(segmentSpec(targetsNear), 'SegNear', ...scanCells),
    new NFA(segmentSpec(targetsFar), 'SegFar', ...scanCells),
  ]);
  return [...borderChecks, segmentOr];
}

const rowConstraints = [];
for (let r = 1; r <= 9; r++) {
  const flags = Array.from({ length: 8 }, (_, i) => rowFlag(r, i + 1));
  rowConstraints.push(
    ...lineConstraints(graph.row(r), cc.row(r), flags, ROW_TARGETS[r - 1])
  );
}

const colConstraints = [];
for (let c = 1; c <= 9; c++) {
  const flags = Array.from({ length: 8 }, (_, i) => colFlag(c, i + 1));
  colConstraints.push(
    ...lineConstraints(graph.column(c), cc.column(c), flags, COL_TARGETS[c - 1])
  );
}

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  rowFlags,
  colFlags,
  ...rowConstraints,
  ...colConstraints,
];
