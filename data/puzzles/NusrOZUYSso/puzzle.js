// Title: Arrow Sandwich: Do Not Eat
// Author: Thomas Occhipinti
// Video: https://www.youtube.com/watch?v=NusrOZUYSso
// Source: https://app.crackingthecryptic.com/sudoku/Rt2NJGtt7b

// Normal sudoku (default row/column/box all-different), plus:
//
// Arrows: the digits along each arrow sum to the digit in its circle.
// Digits may repeat along an arrow (the rules text says so explicitly) --
// the plain Arrow class already allows this except where sudoku itself
// forces distinctness, so no extra encoding is needed for that clause.
//
// Sandwich: an outside clue gives the sum of the digits strictly between
// the 1 and the 9 in its row/column (0-35: the max is achieved when 1 and 9
// are the row/column's two end cells and every digit 2-8 sits between them).
// Some clues are literal numbers; others name an unknown shared value:
//   - "y" (left of R1, R5, R9): those three rows have the same sandwich sum.
//   - "x" (top of C5): column 5's sandwich sum.
//   - "x^2" (top of C7): column 7's sandwich sum equals x squared.
//   - "35 - x" (top of C1, three stacked overlays at column offsets
//     0.2/0.5/0.8, read left to right): column 1's sandwich sum equals
//     35 minus x.
//   - ">30" (left of R2), ">19" (top of C9): literal inequalities.
//   - "min" (left of R8): row 8's sandwich sum is the unique lowest among
//     *every* row's and column's sandwich sum -- "across the entire grid",
//     not just the clued lines, since a sandwich sum is well-defined for
//     every row/column whether or not a clue is printed for it.
// Rows/columns with no printed clue (R3,R4,R6,R7; C2,C3,C4,C6,C8) carry no
// stated numeric constraint beyond entering the "min" comparison above.
//
// A sandwich sum (0-35) exceeds the 16-value cap on a single Sudoku Shape
// alphabet, so it can't live in one Var next to the 1-9 grid digits. Instead
// each row/column gets a base-6 split into two Vars, H (tens) and L (ones),
// each restricted to 0-5, so sum = 6*H + L covers 0-35 exactly with no gaps
// or overlaps. All the numeric relations between clues (equal, squared,
// summed to 35, greater-than, less-than) are then linear or small-state
// relations over these H/L pairs instead of over one wide-range cell.

const graph = cellGraph('9x9~0-9');
const geometry = graph.gridGeometry();
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const BASE = [0, 1, 2, 3, 4, 5];

// Real sudoku digit: restrict every main-grid cell back to 1-9 (the widened
// shape defaults every cell to 0-9).
const digitGivens = graph.makeReplicate(new Given('R1C1', ...DIGITS));

// Base-6 split Var groups: H (0-5, contributes 6*H) and L (0-5, contributes
// L) for each row's and each column's sandwich sum.
const rowH = new Var('HR', 'row sandwich sum, sixes place', 9);
const rowL = new Var('LR', 'row sandwich sum, ones place', 9);
const colH = new Var('HC', 'column sandwich sum, sixes place', 9);
const colL = new Var('LC', 'column sandwich sum, ones place', 9);
const splitDomainGivens = [rowH, rowL, colH, colL]
  .flatMap(v => v.cells().map(c => new Given(c, ...BASE)));

// Tie each row's/column's H,L pair to the actual grid: scan [H, L, ...line
// cells]. H and L set the target sum (6*H + L); the remaining cells are
// scanned for the digit strictly between the first 1/9 and the next 1/9
// (repeats of 1 or 9 cannot occur in a sudoku line, so "the next 1/9" is
// unambiguous), accumulating a running sum that is rejected as soon as it
// would exceed the target, and requiring the accumulated sum to exactly
// equal the target once the "between" span closes.
function sandwichToPair(hCell, lCell, lineCells, name) {
  const spec = {
    startState: null,
    transition: (state, value) => {
      // Reject H/L values outside their declared 0-5 domain in-machine (not
      // just via the Given elsewhere) so the compiler doesn't explore a
      // target range wider than 0-35, which would blow the NFA state cap.
      if (state === null) return value > 5 ? undefined : { stage: 'l', h: value };
      if (state.stage === 'l') {
        if (value > 5) return undefined;
        return { stage: 'scan', target: 6 * state.h + value, phase: 'before', sum: 0 };
      }
      if (state.phase === 'before') {
        return (value === 1 || value === 9)
          ? { ...state, phase: 'between', sum: 0 }
          : state;
      }
      if (state.phase === 'between') {
        if (value === 1 || value === 9) return { ...state, phase: 'after' };
        const sum = state.sum + value;
        if (sum > state.target) return undefined;
        return { ...state, sum };
      }
      return state; // phase 'after': ignore any remaining cells.
    },
    accept: state => state !== null && state.phase === 'after' && state.sum === state.target,
  };
  return new NFA(NFA.encodeSpec(spec, geometry), name, hCell, lCell, ...lineCells);
}

const rowSandwiches = graph.rows().map((row, i) =>
  sandwichToPair(rowH.cell(i + 1), rowL.cell(i + 1), row, `row ${i + 1} sandwich`));
const colSandwiches = graph.columns().map((col, j) =>
  sandwichToPair(colH.cell(j + 1), colL.cell(j + 1), col, `col ${j + 1} sandwich`));

// "y": R1, R5, R9 sandwich sums are equal. Linear equality on 6*H + L.
function equalSums(hA, lA, hB, lB, name) {
  return new Sum(0, [hA, 6], [lA, 1], [hB, -6], [lB, -1]);
}
const yEqualities = [
  equalSums(rowH.cell(1), rowL.cell(1), rowH.cell(5), rowL.cell(5), 'R1 sandwich = R5 sandwich (y)'),
  equalSums(rowH.cell(5), rowL.cell(5), rowH.cell(9), rowL.cell(9), 'R5 sandwich = R9 sandwich (y)'),
];

// "35 - x": C1 sandwich + C5 sandwich = 35.
const complementRule = new Sum(35, [colH.cell(1), 6], [colL.cell(1), 1], [colH.cell(5), 6], [colL.cell(5), 1]);

// ">30" (R2) and ">19" (C9): direct arithmetic predicate on the H/L pair.
function sumThreshold(hCell, lCell, k, name) {
  const key = Pair.fnToKey((h, l) => (6 * h + l) > k, geometry);
  return new Pair(key, name, hCell, lCell);
}
const r2GreaterThan30 = sumThreshold(rowH.cell(2), rowL.cell(2), 30, 'R2 sandwich > 30');
const c9GreaterThan19 = sumThreshold(colH.cell(9), colL.cell(9), 19, 'C9 sandwich > 19');

// "x^2": C7 sandwich equals C5 sandwich squared. Nonlinear, so scan
// [h5, l5, h7, l7] and compare the two reconstructed sums directly.
function squareRelation(h5, l5, h7, l7, name) {
  const spec = {
    startState: { stage: 'h5' },
    // Reject any H/L symbol above 5 in-machine (see sandwichToPair) to keep
    // the compiled state space bounded to the declared 0-35 sum range.
    transition: (state, value) => {
      if (value > 5) return undefined;
      if (state.stage === 'h5') return { stage: 'l5', h: value };
      if (state.stage === 'l5') return { stage: 'h7', sum5: 6 * state.h + value };
      if (state.stage === 'h7') return { stage: 'l7', sum5: state.sum5, h: value };
      if (state.stage === 'l7') return { stage: 'done', sum5: state.sum5, sum7: 6 * state.h + value };
      return state;
    },
    accept: state => state.stage === 'done' && state.sum7 === state.sum5 * state.sum5,
  };
  return new NFA(NFA.encodeSpec(spec, geometry), name, h5, l5, h7, l7);
}
const squareRule = squareRelation(
  colH.cell(5), colL.cell(5), colH.cell(7), colL.cell(7), 'C7 sandwich = (C5 sandwich)^2');

// "min": R8's sandwich sum is strictly less than every other row's and
// column's sandwich sum (17 comparisons over all 9 rows + 9 columns except
// R8 itself). Scan [hA, lA, hB, lB] and compare the two reconstructed sums.
function lessThanRelation(hA, lA, hB, lB, name) {
  const spec = {
    startState: { stage: 'hA' },
    // Reject any H/L symbol above 5 in-machine (see sandwichToPair) to keep
    // the compiled state space bounded to the declared 0-35 sum range.
    transition: (state, value) => {
      if (value > 5) return undefined;
      if (state.stage === 'hA') return { stage: 'lA', h: value };
      if (state.stage === 'lA') return { stage: 'hB', sumA: 6 * state.h + value };
      if (state.stage === 'hB') return { stage: 'lB', sumA: state.sumA, h: value };
      if (state.stage === 'lB') return { stage: 'done', sumA: state.sumA, sumB: 6 * state.h + value };
      return state;
    },
    accept: state => state.stage === 'done' && state.sumA < state.sumB,
  };
  return new NFA(NFA.encodeSpec(spec, geometry), name, hA, lA, hB, lB);
}
const otherLines = [
  ...[1, 2, 3, 4, 5, 6, 7, 9].map(i => [rowH.cell(i), rowL.cell(i), `R${i}`]),
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map(j => [colH.cell(j), colL.cell(j), `C${j}`]),
];
const minRules = otherLines.map(([h, l, label]) =>
  lessThanRelation(rowH.cell(8), rowL.cell(8), h, l, `R8 sandwich < ${label} sandwich (min)`));

// Arrows: bulb cell first, then the path cells to sum (cell lists derived
// from the payload's snapped arrow waypoints).
const arrows = [
  new Arrow('R2C1', 'R1C2', 'R1C3'),
  new Arrow('R2C4', 'R3C3', 'R4C3', 'R5C2'),
  new Arrow('R3C9', 'R3C8', 'R3C7', 'R3C6'),
  new Arrow('R3C9', 'R4C9', 'R5C9', 'R6C9'),
  new Arrow('R7C6', 'R6C5', 'R6C4', 'R7C4'),
  new Arrow('R8C7', 'R7C7', 'R6C7'),
  new Arrow('R8C7', 'R8C6', 'R8C5'),
  new Arrow('R9C2', 'R8C2', 'R7C2', 'R6C2'),
];

return [
  new Shape('9x9', '0-9'),
  digitGivens,
  rowH, rowL, colH, colL,
  ...splitDomainGivens,
  ...rowSandwiches,
  ...colSandwiches,
  ...yEqualities,
  complementRule,
  r2GreaterThan30,
  c9GreaterThan19,
  squareRule,
  ...minRules,
  ...arrows,
];
