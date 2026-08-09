// Title: 6x6 Fog Pseudoku
// Author: starwarigami
// Video: https://www.youtube.com/watch?v=SbYIiyYF3wY
// Source: https://sudokupad.app/0zkbctsdwi

// Baseline is "digits 0-6 in a 6x6 grid, (almost) all-different": each row,
// column, and 2x3 box independently may contain at most one digit that
// repeats (never a triple, never two different repeated digits in the same
// unit), and a given digit may be the repeated one in at most one unit in
// the whole grid ("may appear twice in exactly one row, column OR box" - a
// digit that doubles in one unit cannot also double in a different one). A
// digit may otherwise recur freely across cells that share no unit, exactly
// as in ordinary Sudoku, where only row/column/box pairs are constrained at
// all. The solver's default row/column all-different cannot be disabled or
// loosened (unlike boxes, which NoBoxes/RegionSize can change), so the grid
// is Raw: no implicit constraints, and every rule -- rows, columns, boxes
// included -- is stated explicitly below.
//
// The baseline is realised with a widened 0-7 value range (7 is a sentinel,
// never a real digit) and an 18-cell Var group L, one label per row/column/
// box. For each unit, one NFA scans that unit's 6 cells followed by its own
// label cell: it tracks which digit (if any) has repeated within the unit
// so far, rejects a triple or a second distinct repeated digit, and requires
// the label to equal that repeated digit (or the sentinel if the unit has no
// repeat) once all 6 cells are read. A second NFA scans all 18 labels and
// rejects a real digit that labels more than one unit, capping each digit to
// at most one doubling-event grid-wide. Board cells are restricted back to
// 0-6 (never the sentinel) via Given.
//
// Fog is solving UI, not a grid rule, and is not encoded.
// Pink line "non-repeating set of consecutive digits" = Renban.
// Black dot = 2:1 ratio, white dot = consecutive; dot colour read from each
// overlay's backgroundColor (fill), not its color (text/border) field.
// Outside numbers sum the digits on the drawn down-right diagonal, repeats
// allowed (no distinctness stated for the diagonal) = Sum, not Cage.

const SENTINEL = 7; // widened-range placeholder meaning "this unit has no repeat"
const shape = new Shape('6x6', '0-7', 'Raw'); // widened so labels can hold the sentinel
const graph = cellGraph(shape);
const cell = (r, c) => makeCellId(r, c); // r, c are 1-indexed

// Real answer cells only ever hold a digit 0-6, never the label sentinel.
const boardDomain = graph.cells().map(c => new Given(c, 0, 1, 2, 3, 4, 5, 6));

const rows = graph.rows();
const cols = graph.columns();
const boxOf = (r, c) => Math.floor(r / 2) * 2 + Math.floor(c / 3); // 0-indexed r,c -> box 0-5
const boxes = Array.from({ length: 6 }, () => []);
for (let r = 0; r < 6; r++)
  for (let c = 0; c < 6; c++)
    boxes[boxOf(r, c)].push(cell(r + 1, c + 1));

const L = new Var('L', 'Unit repeat labels', 18); // one label per row/column/box, in that order
const labels = L.cells();

// Scans a unit's 6 cells then its label. State tracks which digits have been
// seen (bitmask) and which single digit (if any) has already repeated;
// `step` distinguishes the 6 cell positions from the trailing label position
// so the two phases use different transition rules.
const unitLabelNFA = NFA.encodeSpec({
  startState: { seen: 0, repeatDigit: -1, step: 0 },
  transition: ({ seen, repeatDigit, step }, v) => {
    if (step >= 7) return undefined; // fixed 7-symbol sequence: 6 cells + label
    if (step < 6) {
      if (v === SENTINEL) return undefined; // unit cells never take the sentinel
      const bit = 1 << v;
      if (seen & bit) {
        if (repeatDigit !== -1) return undefined; // a second distinct repeat, or a triple
        return { seen, repeatDigit: v, step: step + 1 };
      }
      return { seen: seen | bit, repeatDigit, step: step + 1 };
    }
    // step === 6: the label must record this unit's repeated digit, or the
    // sentinel if it has none.
    const wantSentinel = repeatDigit === -1;
    const ok = wantSentinel ? v === SENTINEL : v === repeatDigit;
    return ok ? { seen, repeatDigit, step: step + 1 } : undefined;
  },
  accept: ({ step }) => step === 7,
}, shape);

const unitGroups = [...rows, ...cols, ...boxes];
const unitBudgets = unitGroups.map((cells, i) =>
  new NFA(unitLabelNFA, `unit-budget-${i}`, ...cells, labels[i]));

// Scans all 18 labels and rejects a real digit that labels more than one
// unit (the sentinel is unrestricted), so each digit doubles in at most one
// row, column, or box grid-wide.
const globalLabelNFA = NFA.encodeSpec({
  startState: 0, // bitmask of digits already used as some unit's repeat label
  transition: (usedMask, v) => {
    if (v === SENTINEL) return usedMask;
    const bit = 1 << v;
    if (usedMask & bit) return undefined;
    return usedMask | bit;
  },
  accept: () => true,
}, shape);
const globalOnce = new NFA(globalLabelNFA, 'global-label-once', ...labels);

// Outside diagonal sums, down-right from the labelled cell to the grid edge.
// Repeats allowed (no distinctness stated for the diagonal).
const diagonalSums = [
  new Sum(11, cell(5, 1), cell(6, 2)),
  new Sum(15, cell(4, 1), cell(5, 2), cell(6, 3)),
  new Sum(18, cell(3, 1), cell(4, 2), cell(5, 3), cell(6, 4)),
];

// Pink lines: non-repeating consecutive set.
const pinkLines = [
  new Renban(cell(2, 3), cell(3, 3), cell(4, 3), cell(5, 3), cell(5, 2)),
  new Renban(cell(3, 6), cell(4, 6), cell(5, 6), cell(6, 6)),
  new Renban(cell(1, 2), cell(1, 3), cell(1, 4)),
];

// Black dots (2:1 ratio) and white dots (consecutive); edge marks classified
// by fill colour: black fill = black dot, white fill with black border =
// white dot.
const blackDots = [
  new BlackDot(cell(3, 1), cell(3, 2)),
  new BlackDot(cell(3, 3), cell(3, 4)),
  new BlackDot(cell(3, 5), cell(3, 6)),
  new BlackDot(cell(2, 5), cell(3, 5)),
];
const whiteDots = [
  new WhiteDot(cell(5, 3), cell(5, 4)),
  new WhiteDot(cell(5, 4), cell(5, 5)),
  new WhiteDot(cell(4, 5), cell(5, 5)),
];

return [
  shape,
  L,
  ...boardDomain,
  ...unitBudgets,
  globalOnce,
  ...diagonalSums,
  ...pinkLines,
  ...blackDots,
  ...whiteDots,
];
