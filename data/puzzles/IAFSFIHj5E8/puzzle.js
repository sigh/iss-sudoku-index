// Title: The River
// Author: Jakhob and wooferzfg
// Video: https://www.youtube.com/watch?v=IAFSFIHj5E8
// Source: https://app.crackingthecryptic.com/sudoku/q43qr34LLd

// Rules
// -----
// Place the digits 1-9 once each in every row, column and region. Regions must
// be determined by the solver and each region is an orthogonally connected
// group of 9 cells. Regions cannot overlap. Digits on the blue line have an
// equal sum N within each region it passes through. If the line passes through
// the same region more than once, each individual segment of the line within
// that region sums to N separately.
//
// The grid is drawn without boxes: NoBoxes drops the default 3x3 groups, and
// ChaosConstruction supplies the nine solver-determined regions (size 9,
// orthogonally connected, non-overlapping, each holding 1-9 once). Nothing in
// the rules text is omitted.

// Transcribed from the drawn givens.
const GIVENS = {
  R1C6: 3,
  R2C3: 7, R2C4: 9,
  R6C2: 2, R6C3: 5, R6C5: 8,
  R7C3: 1,
};

// The blue line in drawn order: the payload's single waypoint polyline expanded
// cell by cell. Its runs are horizontal, vertical or 45-degree diagonal, so
// consecutive entries are king-adjacent, and the whole river visits 67 distinct
// cells.
const LINE = [
  'R1C1', 'R1C2', 'R1C3', 'R2C4', 'R2C3', 'R2C2', 'R2C1', 'R3C2', 'R3C3',
  'R3C4', 'R2C5', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R2C6', 'R2C7', 'R1C8',
  'R1C9', 'R2C8', 'R3C7', 'R3C6', 'R4C6', 'R3C5', 'R4C4', 'R4C5', 'R5C4',
  'R4C3', 'R4C2', 'R3C1', 'R4C1', 'R5C1', 'R5C2', 'R5C3', 'R6C3', 'R6C4',
  'R6C5', 'R5C5', 'R5C6', 'R4C7', 'R5C7', 'R4C8', 'R3C8', 'R2C9', 'R3C9',
  'R4C9', 'R5C8', 'R6C8', 'R6C7', 'R7C7', 'R7C8', 'R7C9', 'R8C8', 'R9C8',
  'R9C7', 'R9C6', 'R8C6', 'R8C5', 'R8C4', 'R8C3', 'R7C2', 'R6C2', 'R6C1',
  'R7C1', 'R8C1', 'R8C2', 'R9C2',
];

// A "segment" is a maximal run of consecutive line cells lying in one region,
// so the segments are fixed by where the drawn order crosses a region boundary.
// One border flag per step of the line records exactly that crossing; it lets
// the segment scan below split the line without carrying region labels in its
// own state.
const SAME = 1;    // both cells of the step lie in the same region
const BORDER = 2;  // the step crosses into a different region

// A segment lies inside a single region, whose nine cells hold 1-9 once each,
// so its digits are distinct and it can sum to at most 1+2+...+9.
const MAX_SEGMENT_SUM = 45;

const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC');
const borderVar = new Var('B', 'Line region borders', LINE.length - 1);
const flagCells = borderVar.cells();

// [regionLabel(a), flag, regionLabel(b)]: accepts only when the flag agrees
// with whether the two labels differ, in both directions. This is also what
// confines each flag cell to {SAME, BORDER}: every flag is read by exactly one
// of these machines, and any other value is rejected here. States are
// {labelA, flag} while reading, with 0 meaning "not read yet"; region labels
// are 1-9, so 0 cannot collide with a real label.
const borderNFA = NFA.encodeSpec({
  startState: { labelA: 0, flag: 0 },
  transition({ labelA, flag }, value) {
    if (labelA === 0) return { labelA: value, flag: 0 };
    if (flag === 0) {
      if (value !== SAME && value !== BORDER) return undefined;
      return { labelA, flag: value };
    }
    const differ = value !== labelA;
    return ((flag === BORDER) === differ) ? { ok: true } : undefined;
  },
  accept: (state) => state.ok === true,
}, 9);

// [digit, flag, digit, flag, ..., digit] along the whole river. State is
// {target, sum, atFlag}: `sum` accumulates the current segment, `target` is N,
// which is 0 until the first BORDER closes the first segment and fixes it.
// Every later segment must close on the same N, which is the equal-sum rule.
// `atFlag` alternates because the scan interleaves digits and border flags.
const riverNFA = NFA.encodeSpec({
  startState: { target: 0, sum: 0, atFlag: false },
  transition({ target, sum, atFlag }, value) {
    if (!atFlag) {
      const next = sum + value;
      // Bound the running total so the state count stays finite: once N is
      // known nothing may exceed it, and before then no segment can beat
      // MAX_SEGMENT_SUM.
      if (next > (target || MAX_SEGMENT_SUM)) return undefined;
      return { target, sum: next, atFlag: true };
    }
    if (value === SAME) return { target, sum, atFlag: false };
    if (value !== BORDER) return undefined;
    if (target === 0) return { target: sum, sum: 0, atFlag: false };
    if (sum !== target) return undefined;
    return { target, sum: 0, atFlag: false };
  },
  // The scan ends on a digit, so the final segment is still open and must
  // close on N here. target === 0 would mean the line never left one region.
  accept: ({ target, sum, atFlag }) => atFlag && (target === 0 || sum === target),
}, 9);

const givens = Object.entries(GIVENS).map(([cell, value]) => new Given(cell, value));

const borderChecks = flagCells.map((flag, i) =>
  new NFA(borderNFA, 'Border', cc.at(LINE[i]), flag, cc.at(LINE[i + 1])));

const riverScan = LINE.flatMap(
  (cell, i) => (i === 0 ? [cell] : [flagCells[i - 1], cell]));

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  borderVar,
  ...givens,
  ...borderChecks,
  new NFA(riverNFA, 'RiverSegments', ...riverScan),
];
