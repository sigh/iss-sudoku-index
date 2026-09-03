// Title: Balanced Chaos
// Author: fritzdis
// Video: https://www.youtube.com/watch?v=QSIZ_rM3G7M
// Source: https://app.crackingthecryptic.com/sudoku/pf8979mT6F

// Rules encoded below:
//
//  1. Divide the grid into 9 regions of 9 orthogonally connected cells;
//     every row, column and region holds 1-9 once each. The grid is empty --
//     there are no givens at all, and no printed boxes.
//  2. A few region border segments are given: three drawn black unit edges,
//     each separating two cells that therefore lie in different regions.
//  3. Blue lines are region sum lines: the region borders cut each line into
//     segments, and every segment of one line sums to the same total. A line
//     that leaves a region and comes back contributes two separate segments,
//     each of which must hit the total on its own ("distinct segments within
//     the same region are not summed together"), so segments are the maximal
//     runs of the line's own walk order, not per-region groupings.
//
// Omitted: the rules say the borders separate a line into "two or more"
// segments. Read as a requirement, that forbids a line from lying wholly
// inside one region. It is encoded only where the grid forces it anyway --
// the 15-cell and 11-cell lines are longer than a 9-cell region, so they are
// necessarily cut -- and is not imposed on the four short lines (3 and 4
// cells), which are left free to sit in a single region. The equal-sum rule
// itself is encoded for all six lines.

// The six blue strokes, each in the order its stroke is drawn.
const LINES = [
  ['R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1',
    'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7'],
  ['R1C2', 'R2C2', 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2', 'R8C2',
    'R8C3', 'R8C4', 'R8C5'],
  ['R1C7', 'R2C8', 'R3C9'],
  ['R4C7', 'R4C8', 'R5C8', 'R5C7'],
  ['R4C3', 'R4C4', 'R5C4', 'R5C3'],
  ['R2C5', 'R2C6', 'R3C6', 'R3C5'],
];

// The three drawn black unit edges, as the cell pair each one separates.
const GIVEN_BORDERS = [
  ['R1C7', 'R2C7'],
  ['R4C1', 'R5C1'],
  ['R5C1', 'R6C1'],
];

// Region labels the solver assigns: CCn shadows the nth grid cell.
const cc = cellGraph('9x9').makeOverlay('CC');

// One border flag per adjacent pair of cells along a line, numbered
// consecutively across LINES in the order above. The flag says whether the
// line crosses a region border at that step; it is what lets the sum machine
// below drop the previous cell's region label out of its state.
const stepsPerLine = LINES.map(line => line.length - 1);
const flagOffsets = stepsPerLine.map(
  (_, i) => stepsPerLine.slice(0, i).reduce((a, b) => a + b, 0));
const flags = new Var(
  'F', 'Line border flags', stepsPerLine.reduce((a, b) => a + b, 0));
const flagCell = (lineIndex, step) => flags.cell(flagOffsets[lineIndex] + step + 1);

// Flag meaning, fixed here and read by both machines: 1 = the pair's two
// cells share a region, 2 = they are in different regions (a border).
const SAME_REGION = 1;
const BORDER = 2;

// Ties a flag to the region labels either side of it. Reads three cells --
// [label(a), flag, label(b)] -- and accepts only when the flag agrees with
// whether the two labels differ, in both directions. `step` is the position
// in that triple; `a` remembers the first label until the third cell arrives;
// step 3 is the accepting sink.
const borderFlagSpec = {
  startState: { step: 0, a: 0, f: 0 },
  transition({ step, a, f }, value) {
    if (step === 0) return { step: 1, a: value, f: 0 };
    if (step === 1) {
      if (value !== SAME_REGION && value !== BORDER) return undefined;
      return { step: 2, a, f: value };
    }
    if (step === 2) {
      if ((f === BORDER) !== (a !== value)) return undefined;
      return { step: 3, a: 0, f: 0 };
    }
    return undefined;
  },
  accept: ({ step }) => step === 3,
};

// A region holds 1-9 once each, so a run of line cells inside one region has
// distinct digits and can total at most 45. Nothing legal is cut off by
// refusing a bigger running total, and it bounds the machine's state.
const MAX_SEGMENT_SUM = 45;

// The equal-sum rule for one line. Reads the line interleaved with its flags
// -- [cell, flag, cell, flag, ..., cell] -- so `onValue` alternates between
// the two kinds of symbol. `sum` accumulates the segment in progress; a
// BORDER flag closes it, either fixing the line's total (`target`, 0 while
// still unknown -- no segment can total 0) or checking against it. `accept`
// checks the final, unclosed segment; a line with no border at all ends with
// target still 0 and is accepted, which is the omission noted at the top.
const segmentSumSpec = {
  startState: { onValue: true, target: 0, sum: 0 },
  transition({ onValue, target, sum }, value) {
    if (onValue) {
      const next = sum + value;
      if (target === 0 ? next > MAX_SEGMENT_SUM : next > target) return undefined;
      return { onValue: false, target, sum: next };
    }
    if (value === SAME_REGION) return { onValue: true, target, sum };
    if (value !== BORDER) return undefined;
    if (target === 0) return { onValue: true, target: sum, sum: 0 };
    if (sum !== target) return undefined;
    return { onValue: true, target, sum: 0 };
  },
  accept: ({ onValue, target, sum }) => !onValue && (target === 0 || sum === target),
};

const borderFlagNFA = NFA.encodeSpec(borderFlagSpec, 9);
const segmentSumNFA = NFA.encodeSpec(segmentSumSpec, 9);

const flagDomains = flags.cells().map(
  cell => new Given(cell, SAME_REGION, BORDER));

const borderFlags = LINES.flatMap((line, li) => line.slice(1).map(
  (cell, i) => new NFA(
    borderFlagNFA, 'BorderFlag', cc.at(line[i]), flagCell(li, i), cc.at(cell))));

const regionSumLines = LINES.map((line, li) => new NFA(
  segmentSumNFA, 'RegionSumSegments',
  ...line.flatMap((cell, i) => i === 0 ? [cell] : [flagCell(li, i - 1), cell])));

const givenBorders = GIVEN_BORDERS.map(pair => new AllDifferent(...cc.at(pair)));

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  flags,
  ...flagDomains,
  ...borderFlags,
  ...regionSumLines,
  ...givenBorders,
];
