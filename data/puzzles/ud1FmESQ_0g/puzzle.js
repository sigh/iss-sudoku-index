// Title: The Blue Square
// Author: Adem Jaziri
// Video: https://www.youtube.com/watch?v=ud1FmESQ_0g
// Source: https://app.crackingthecryptic.com/sudoku/7ttN3TmD7M

// Rules encoded here, in full:
//  - 7x7, digits 1-7 once per row and once per column. There are no boxes on a
//    7x7 grid.
//  - The grid splits into seven orthogonally-connected seven-cell regions,
//    found by the solver, each holding 1-7 once (ChaosConstruction).
//  - Blue line: within each region the line passes through, the digits of that
//    visit sum to the same total; each line has its own total. Two blue lines
//    are drawn - the closed perimeter loop and the interior column segment.
//  - Green line: adjacent digits on the line differ by at least 4. All five
//    green lines are single two-cell segments.
// Nothing is omitted. A sixth green-styled entry in the source carries no
// coordinates, draws no stroke, and is not a clue.
//
// Reading of the blue rule: a region the line enters more than once contributes
// one total per visit, not one total for all its cells on the line. That is the
// standard reading of this line type, and the rules' worked example
// (r2r3r4c6 against r5r6c6) describes visits, naming two runs of consecutive
// line cells rather than two cell sets.

const graph = cellGraph('7x7');

// Drawn geometry, as the source draws it.
// The blue loop is one closed stroke through these four corner waypoints.
const BLUE_LOOP_CORNERS = ['R1C7', 'R1C1', 'R7C1', 'R7C7'];
// The other blue line is one straight stroke, top to bottom.
const BLUE_SEGMENT = ['R2C6', 'R3C6', 'R4C6', 'R5C6', 'R6C6'];
// Each green stroke joins exactly two cells; the first two run diagonally.
const GREEN_PAIRS = [
  ['R2C1', 'R1C2'],
  ['R6C1', 'R7C2'],
  ['R2C2', 'R3C2'],
  ['R3C4', 'R3C5'],
  ['R4C5', 'R5C5'],
];

// Expand a straight drawn stroke into its cells, excluding the far corner, so
// that a closed polyline concatenates into a cycle with no repeated cell.
const strokeCells = (from, to) => {
  const a = parseCellId(from);
  const b = parseCellId(to);
  const dR = Math.sign(b.row - a.row);
  const dC = Math.sign(b.col - a.col);
  const cells = [];
  for (let r = a.row, c = a.col; r !== b.row || c !== b.col; r += dR, c += dC) {
    cells.push(makeCellId({ row: r, col: c }));
  }
  return cells;
};

// The 24 perimeter cells in loop order, starting at R1C7.
const BLUE_LOOP = BLUE_LOOP_CORNERS.flatMap((corner, i) =>
  strokeCells(corner, BLUE_LOOP_CORNERS[(i + 1) % BLUE_LOOP_CORNERS.length]));

const cc = graph.makeOverlay('CC');

// One 0/1 flag per step of a blue line, saying whether that step crosses a
// region border. Scanning the region labels themselves inside the sum machine
// would have to carry the previous label in state; the flag carries it instead.
// Value 1 means "same region as the previous cell", value 2 means "different".
const loopFlagVars = new Var('B', 'BlueLoopStepBorder', BLUE_LOOP.length);
const segmentFlagVars = new Var('S', 'BlueSegmentStepBorder', BLUE_SEGMENT.length - 1);
const loopFlag = i => loopFlagVars.cell(i + 1);
const segmentFlag = i => segmentFlagVars.cell(i + 1);

// [label(a), flag, label(b)]: the flag must report whether the two labels
// differ. This is what makes the flags mean what the sum machines assume.
const borderFlagNFA = NFA.encodeSpec({
  startState: { step: 0, labelA: null, flag: null },
  transition({ step, labelA, flag }, value) {
    if (step === 0) return { step: 1, labelA: value, flag: null };
    if (step === 1) {
      if (value !== 1 && value !== 2) return undefined;
      return { step: 2, labelA, flag: value };
    }
    if (step === 2) {
      const differs = value !== labelA;
      return (flag === 2) === differs ? { step: 3, labelA: null, flag: null } : undefined;
    }
    return undefined;
  },
  accept: ({ step }) => step === 3,
  maxDepth: 3,
}, 7);

const loopBorderFlags = BLUE_LOOP.map((cell, i) => new NFA(
  borderFlagNFA, 'LoopRegionBorder',
  cc.at(cell), loopFlag(i), cc.at(BLUE_LOOP[(i + 1) % BLUE_LOOP.length])));

const segmentBorderFlags = BLUE_SEGMENT.slice(0, -1).map((cell, i) => new NFA(
  borderFlagNFA, 'SegmentRegionBorder',
  cc.at(cell), segmentFlag(i), cc.at(BLUE_SEGMENT[i + 1])));

// Interleave a line's cells with the flags for its steps, so a machine reading
// [value, flag, value, flag, ..., value] sees each step's border status right
// after the cell it follows. The loop version appends its closing step's flag,
// which reports the join from the last cell back to the first.
const withFlags = (cells, flag, closed) => {
  const seq = cells.flatMap((cell, i) => (
    i < cells.length - 1 || closed ? [cell, flag(i)] : [cell]));
  return seq;
};

// Blue interior line: equal totals per visit, over an open line.
// `target` is unset until the first border is crossed; the run just finished
// then fixes it, and every later run - including the unterminated final one -
// must match. A line that never leaves its region has one visit and so no
// second total to disagree with, which is why a null target accepts.
const segmentSumNFA = NFA.encodeSpec({
  startState: { onValue: true, sum: 0, target: null },
  transition({ onValue, sum, target }, value) {
    if (onValue) {
      const newSum = sum + value;
      if (target !== null && newSum > target) return undefined;
      return { onValue: false, sum: newSum, target };
    }
    if (value !== 1 && value !== 2) return undefined;
    if (value === 1) return { onValue: true, sum, target };
    if (target === null) return { onValue: true, sum: 0, target: sum };
    if (sum !== target) return undefined;
    return { onValue: true, sum: 0, target };
  },
  accept: ({ target, sum }) => target === null || sum === target,
  maxDepth: BLUE_SEGMENT.length * 2 - 1,
}, 7);

const blueSegment = new NFA(
  segmentSumNFA, 'BlueSegmentRegionSums',
  ...withFlags(BLUE_SEGMENT, segmentFlag, false));

// Blue loop: the same rule on a closed cycle. Two things differ from the open
// line.
//
// First, the scan starts mid-visit whenever the join from R2C7 back to R1C7 is
// inside a region, so the run the scan opens with and the run it ends with are
// halves of one visit. `first` stores the opening run's total at the moment the
// scan meets its first border, and `accept` adds it back onto the closing run.
// When the join is itself a border, that closing run has already been checked
// and reset to 0, so `first` alone must equal the target - the same test.
//
// Second, the running total needs a bound or the compiled machine grows without
// limit over a 48-symbol scan, and the target has to be known to supply one.
// The loop's total is fixed by the grid: rows 1 and 7 and columns 1 and 7 each
// hold 1-7 once, and the loop is their union with the four corners counted
// twice, so its digits sum to 4*28 - (7 + 1 + 2 + 4) = 98. Each visit's digits
// lie in one region and are therefore distinct, so a visit totals at most
// 1+2+...+7 = 28; and the loop's 24 cells hold at most 24 visits. With
// visits * target = 98 and 98/24 <= target <= 28, the only divisors of 98 left
// are 7 and 14, which is the choice the machine offers.
const LOOP_TARGETS = [7, 14];
const LOOP_MAX_TARGET = Math.max(...LOOP_TARGETS);

const loopSumNFA = NFA.encodeSpec({
  startState: { onValue: true, sum: 0, first: null, target: null },
  transition({ onValue, sum, first, target }, value) {
    if (onValue) {
      const newSum = sum + value;
      if (newSum > (target === null ? LOOP_MAX_TARGET : target)) return undefined;
      return { onValue: false, sum: newSum, first, target };
    }
    if (value !== 1 && value !== 2) return undefined;
    if (value === 1) return { onValue: true, sum, first, target };
    // A border: the run that just ended is complete unless it is the run the
    // scan opened with, which is only a fragment of the visit spanning the join.
    if (first === null) return { onValue: true, sum: 0, first: sum, target: null };
    if (target === null) {
      if (!LOOP_TARGETS.includes(sum)) return undefined;
      return { onValue: true, sum: 0, first, target: sum };
    }
    if (sum !== target) return undefined;
    return { onValue: true, sum: 0, first, target };
  },
  // A target is only set once two borders have been seen. Fewer than two means
  // the whole loop is at most one visit, which seven-cell regions cannot cover.
  accept: ({ sum, first, target }) => target !== null && first + sum === target,
  maxDepth: BLUE_LOOP.length * 2,
}, 7);

const blueLoop = new NFA(
  loopSumNFA, 'BlueLoopRegionSums',
  ...withFlags(BLUE_LOOP, loopFlag, true));

const greenWhispers = GREEN_PAIRS.map(([a, b]) => new Whisper(4, a, b));

return [
  new Shape('7x7'),
  loopFlagVars,
  segmentFlagVars,
  new Given('R1C1', 7),
  new Given('R1C7', 1),
  new Given('R6C4', 2),
  new Given('R7C1', 2),
  new Given('R7C7', 4),
  new ChaosConstruction(),
  ...loopBorderFlags,
  ...segmentBorderFlags,
  blueLoop,
  blueSegment,
  ...greenWhispers,
];
