// Title: Yoda's Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=KrzIDnDxJqY
// Source: https://tinyurl.com/ybyl6lv5
//
// 9x9 grid, digits 0-9. Every row/column/box shows each of the ten digits
// once: eight cells hold a single digit, the ninth holds a 2-digit number
// (10-98) made of the two remaining digits, tens digit > ones digit. Outside
// clues give the sandwich sum: the total of the numbers positioned strictly
// between the cell holding the row/column's smallest number and the cell
// holding its largest, reading along the row/column (the worked example in
// the rules -- 4,1,5,8,2,7,60,3,9 sandwiching to 5+8+2+7=22 -- sums by
// position, not by which values happen to fall between 1 and 60 in size).
// The 2-digit number is always the row/column's largest number, since even
// the smallest 2-digit number (10) exceeds every 1-digit number.
//
// Model: the main grid holds the tens digit at the "pill" cell and the plain
// digit everywhere else (Shape('9x9','0-9'); standard Sudoku semantics give
// 9 distinct values per unit for free). A parallel VB overlay holds the ones
// digit only at the pill cell and otherwise mirrors the main grid. A VF
// overlay flags which single cell per row/column/box is the pill (2 = pill,
// 1 = plain), tied to VB by two per-cell Or's: not-pill forces VB to equal
// the main digit (SameValues); pill forces the main digit strictly greater
// than VB (Pair). VB's own row/column/box AllDifferent then keeps the ones
// digit distinct from the row's other eight digits, which -- combined with
// the strict tens>ones ordering -- forces VB to be exactly the value missing
// from the main grid's nine shown digits.
//
// For each clued row/column a second, line-scoped flag overlay marks which
// of its eight non-pill cells holds the smallest single digit ("the min
// cell"; placement mirrors VF: exactly one flagged, via ContainExact). Two
// small NFAs scan the line's (min-flag, pill-flag, digit) triples in order:
// one confirms the flagged cell's digit really is the minimum among the
// line's non-pill digits, the other walks the line tracking whether it is
// before/inside/after the span between the pill cell and the min cell,
// summing digits seen while inside, and accepts when that sum equals the
// printed clue.

const graph = cellGraph('9x9');
const gB = graph.makeOverlay('VB');     // ones digit, meaningful only at the pill cell
const flags = graph.makeOverlay('VF');  // 1 = plain cell, 2 = pill cell

const cells = graph.cells();

// Strict greater-than over the 0-9 alphabet (valueOffset -1 shifts the
// 1-based enumeration down to 0-9).
const GT_KEY = Pair.fnToKey((a, b) => a > b, 10, -1);

const flagDomain = flags.makeReplicate(new Given(flags.cells()[0], 1, 2));

// Not pill (flag=2 branch absent) => main digit equals the VB digit.
const equalityLinks = cells.map(cell => new Or([
  new Given(flags.at(cell), 2),
  new SameValues(2, cell, gB.at(cell)),
]));

// Pill (flag=1 branch absent) => main digit (tens) strictly exceeds VB (ones).
const orderLinks = cells.map(cell => new Or([
  new Given(flags.at(cell), 1),
  new Pair(GT_KEY, 'pill tens > ones', cell, gB.at(cell)),
]));

// VB is an auxiliary grid: it needs its own row/column/box distinctness.
const vbGroups = gB.rowsColumnsBoxes().map(group => new AllDifferent(...group));

// Exactly one pill cell per row, column and box; reused below for the
// per-clue "exactly one min cell" placement too.
const PLACEMENT_VALUES = Array(8).fill(1).concat([2]).join('_');
const flagPlacement = graph.rowsColumnsBoxes().map(
  group => new ContainExact(PLACEMENT_VALUES, ...flags.at(group)));

// Scans a line's (minFlag, pillFlag, digit) triples, one segment per cell.
// Confirms the min-flagged cell's digit equals the true minimum among the
// line's non-pill digits (and that no cell is flagged both pill and min).
const MIN_CORRECTNESS_SPEC = NFA.encodeSpec({
  startState: { step: 0, isM: false, isPill: false, runningMin: null, flaggedVal: null },
  transition: (s, v) => {
    if (v === SEGMENT_BREAK) {
      return { step: 0, isM: false, isPill: false, runningMin: s.runningMin, flaggedVal: s.flaggedVal };
    }
    // Collapse the flag reads to booleans immediately: carrying the raw
    // 0-9 symbol in state (instead of just whether it was 2) makes the
    // compiler enumerate all ten branches instead of two, and blows the
    // 4096-state cap once combined with runningMin/flaggedVal.
    if (s.step === 0) return { ...s, step: 1, isM: v === 2 };
    if (s.step === 1) return { ...s, step: 2, isPill: v === 2 };
    // step === 2: the digit.
    if (s.isPill && s.isM) return undefined;
    let runningMin = s.runningMin;
    let flaggedVal = s.flaggedVal;
    if (!s.isPill) runningMin = (runningMin === null) ? v : Math.min(runningMin, v);
    if (s.isM) flaggedVal = v;
    return { step: 0, isM: false, isPill: false, runningMin, flaggedVal };
  },
  accept: (s) => s.flaggedVal !== null && s.flaggedVal === s.runningMin,
}, 10, { valueOffset: -1, multiSegment: true });

// Same scan, but tracks the before/inside/after span between the pill cell
// and the min cell (in whichever order they occur) and sums digits seen
// while inside. One spec per clue since the target sum is baked into accept.
function sandwichSumSpec(target) {
  const cap = target + 1;
  return NFA.encodeSpec({
    startState: { step: 0, isM: false, isPill: false, phase: 0, sum: 0 },
    transition: (s, v) => {
      if (v === SEGMENT_BREAK) {
        return { step: 0, isM: false, isPill: false, phase: s.phase, sum: s.sum };
      }
      if (s.step === 0) return { ...s, step: 1, isM: v === 2 };
      if (s.step === 1) return { ...s, step: 2, isPill: v === 2 };
      // step === 2: the digit. phase: 0 = before, 1 = inside, 2 = after.
      const isBoundary = s.isPill || s.isM;
      let phase = s.phase;
      let sum = s.sum;
      if (phase === 0) {
        if (isBoundary) phase = 1;
      } else if (phase === 1) {
        if (isBoundary) phase = 2;
        else sum = Math.min(sum + v, cap);
      }
      return { step: 0, isM: false, isPill: false, phase, sum };
    },
    accept: (s) => s.phase === 2 && s.sum === target,
  }, 10, { valueOffset: -1, multiSegment: true });
}

let nextSuffixIndex = 0;
function sandwichClue(unitCells, target) {
  const prefix = 'VM' + String.fromCharCode(65 + nextSuffixIndex++);   // VMA, VMB, ...
  const mFlag = graph.makeOverlay(prefix, unitCells);
  const mDomain = mFlag.makeReplicate(new Given(mFlag.cells()[0], 1, 2));
  const placement = new ContainExact(PLACEMENT_VALUES, ...mFlag.cells());

  const segments = unitCells.map(cell => [mFlag.at(cell), flags.at(cell), cell]);
  const minCheck = new NFA(MIN_CORRECTNESS_SPEC, 'sandwich min', ...segments);
  const sumCheck = new NFA(sandwichSumSpec(target), 'sandwich sum', ...segments);

  return [mFlag.toVar('sandwich min flag'), mDomain, placement, minCheck, sumCheck];
}

// Column sandwich clues (top of the grid); C5 has no printed clue.
const COLUMN_CLUES = [[1, 1], [2, 25], [3, 41], [4, 17], [6, 11], [7, 7], [8, 5], [9, 3]];
// Row sandwich clues (left of the grid); R1 and R9 have no printed clue.
const ROW_CLUES = [[2, 9], [3, 42], [4, 35], [5, 40], [6, 19], [7, 23], [8, 9]];

const sandwichClues = [
  ...COLUMN_CLUES.flatMap(([c, t]) => sandwichClue(graph.column(c), t)),
  ...ROW_CLUES.flatMap(([r, t]) => sandwichClue(graph.row(r), t)),
];

return [
  new Shape('9x9', '0-9'),
  gB.toVar('ones digit'),
  flags.toVar('pill flag'),
  flagDomain,
  ...equalityLinks,
  ...orderLinks,
  ...vbGroups,
  ...flagPlacement,
  ...sandwichClues,
];
