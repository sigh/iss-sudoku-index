// Title: Eroteme
// Author: Alaric Taqi A. (Crusader175)
// Video: https://www.youtube.com/watch?v=gbMY-RiVDAM
// Source: https://sudokupad.app/9t6sdzcr8b
//
// Rules encoded:
// - Normal 6x6 sudoku (rows/columns/boxes, 2x3 boxes -- the default tiling).
// - Diagonal(-1): no repeats on R1C1-R2C2-R3C3-R4C4-R5C5-R6C6 (the drawn blue
//   diagonal).
// - One circled cell per row, per column, and per box; circled digits are
//   all-different.
// - Every row has a left and a right outside clue, every column a top and a
//   bottom one: each is the sum of the first X digits counted in from that
//   edge, X being the digit on that row's/column's circled cell. Every clue
//   is drawn as question marks (source underlay text), so only the digit
//   count of the hidden sum -- one "?" (1-9) or two "??" (10-21, the max
//   reachable with six distinct digits from 1-6) -- is known, never the sum
//   itself.
//
// The shape is widened to 0-6 (still under the 16-value hard cap) only so a
// "circled value" overlay can hold 0 as a not-circled sentinel; the main grid
// is restricted back to 1-6 with Given.
const shape = new Shape('6x6', '0-6');
const graph = cellGraph(shape);
const gridCells = graph.cells();

const DIGITS = [1, 2, 3, 4, 5, 6];

// Circled-cell bookkeeping: one flag (1=not circled, 2=circled) per grid
// cell, plus a parallel "circled value" cell holding 0 when not circled and
// the grid digit when circled -- holding the digit itself on the overlay
// avoids a flag*digit product, which a linear Sum could not express.
const flags = graph.makeOverlay('VCF');
const cvals = graph.makeOverlay('VCV');

const flagCvalKey = Pair.fnToKey((f, v) => (f === 1) === (v === 0), shape);
const gridCvalKey = Pair.fnToKey((g, v) => v === 0 || v === g, shape);

const circleLinks = gridCells.flatMap(cell => [
  new Pair(flagCvalKey, 'flag matches circled value', flags.at(cell), cvals.at(cell)),
  new Pair(gridCvalKey, 'circled value matches digit', cell, cvals.at(cell)),
]);

// Exactly one circled (flag=2) cell per row/column/box: with flag in {1,2},
// a house sum of 7 forces five 1s and one 2.
const oneCirclePerHouse = graph.rowsColumnsBoxes().map(
  house => new Sum(7, ...flags.at(house)));

// The circled digit for each row and each column, read off the circled-value
// overlay: exactly one nonzero term per row/column, so the sum is that term.
const xVar = new Var('CX', 'circled digit per row', '6');
const yVar = new Var('CY', 'circled digit per column', '6');
const rowCircledDigit = graph.rows().map(
  (row, i) => new EqualSum(cvals.at(row), [xVar.cell(i + 1)]));
const colCircledDigit = graph.columns().map(
  (col, i) => new EqualSum(cvals.at(col), [yVar.cell(i + 1)]));

// "Digits may not repeat in circled cells": the six circled cells are exactly
// one per row, so the per-row circled digits are the whole set.
const circledAllDifferent = new AllDifferent(
  ...DIGITS.map(r => xVar.cell(r)));

// Restrict every auxiliary cell back to its true range (the shape itself was
// widened only to host the 0 "not circled" sentinel).
const domainGivens = [
  ...gridCells.map(c => new Given(c, ...DIGITS)),
  ...flags.cells().map(c => new Given(c, 1, 2)),
  ...cvals.cells().map(c => new Given(c, 0, ...DIGITS)),
  ...DIGITS.map(r => new Given(xVar.cell(r), ...DIGITS)),
  ...DIGITS.map(c => new Given(yVar.cell(c), ...DIGITS)),
];

// Digit-count read off the source's outside-clue underlays (number of "?"
// characters): 1 means the hidden sum is single-digit (1-9), 2 means it is
// double-digit (10-21, the max reachable with six distinct 1-6 digits).
const QCOUNT_LEFT = [1, 2, 2, 2, 1, 2];
const QCOUNT_RIGHT = [2, 2, 1, 2, 1, 2];
const QCOUNT_TOP = [2, 2, 2, 1, 1, 2];
const QCOUNT_BOTTOM = [2, 1, 2, 1, 2, 2];
const rangeFor = qcount => (qcount === 1 ? [1, 9] : [10, 21]);

// One clue = one X-sum whose total is unknown but whose digit count is
// fixed. Scans the row/column twice: first its (flag, digit) pairs in a
// fixed order to locate X (the circled cell's digit, wherever it sits);
// then its digits again, this time in the clue's own edge-to-inward order,
// accumulating a running sum. The running sum is range-checked only at the
// step whose position (k) equals X -- that is "the sum of the first X
// digits counted from this clue's edge". Later steps keep accumulating (the
// clamp bounds it) but are never checked again, so they cannot matter.
function xSumDigitCountNFA(flagCells, digitCellsForX, digitCellsFromEdge, qcount) {
  const [lo, hi] = rangeFor(qcount);
  const spec = {
    startState: { step: 0, x: null, afterFlag: false, sum: 0 },
    transition: (state, value) => {
      let { step, x, afterFlag, sum } = state;
      if (step < 12) {
        // Phase 1 (steps 0-11): alternating flag, digit, ... for the six
        // cells in a fixed order, to find X regardless of where it sits.
        if (step % 2 === 0) {
          afterFlag = value === 2;
        } else {
          if (afterFlag) x = value;
          afterFlag = false;
        }
      } else {
        // Phase 2 (steps 12-17): the same six digits, this time counted
        // from the clue's edge; k is the 1-based position in this phase.
        const k = step - 11;
        if (x !== null && k <= x) {
          sum = Math.min(sum + value, hi + 1);
          if (k === x && (sum < lo || sum > hi)) return undefined;
        }
      }
      return { step: step + 1, x, afterFlag, sum };
    },
    accept: () => true,
    // Fixed-length scan (12 phase-1 symbols + 6 phase-2 symbols): bound state
    // creation, or the ever-incrementing step field explores forever.
    maxDepth: 18,
  };
  const encoded = NFA.encodeSpec(spec, shape);
  const phase1 = flagCells.flatMap((flag, i) => [flag, digitCellsForX[i]]);
  return new NFA(encoded, 'x-sum digit count', ...phase1, ...digitCellsFromEdge);
}

const outsideClues = graph.rows().flatMap((row, i) => {
  const flagRow = flags.at(row);
  return [
    xSumDigitCountNFA(flagRow, row, row, QCOUNT_LEFT[i]),
    xSumDigitCountNFA(flagRow, row, [...row].reverse(), QCOUNT_RIGHT[i]),
  ];
}).concat(graph.columns().flatMap((col, i) => {
  const flagCol = flags.at(col);
  return [
    xSumDigitCountNFA(flagCol, col, col, QCOUNT_TOP[i]),
    xSumDigitCountNFA(flagCol, col, [...col].reverse(), QCOUNT_BOTTOM[i]),
  ];
}));

return [
  shape,
  flags.toVar('circled flags (1=not circled, 2=circled)'),
  cvals.toVar('circled value (0 if not circled)'),
  xVar,
  yVar,
  new Diagonal(-1),
  ...domainGivens,
  ...circleLinks,
  ...oneCirclePerHouse,
  ...rowCircledDigit,
  ...colCircledDigit,
  circledAllDifferent,
  ...outsideClues,
];
