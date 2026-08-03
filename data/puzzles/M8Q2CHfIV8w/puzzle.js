// Title: Fakes in the Fog
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=M8Q2CHfIV8w
// Source: https://sudokupad.app/x56ymej4lq

// Normal sudoku (default row/column/box all-different; no given digits).
//
// Pseudo cells: exactly one per row, column and 3x3 box, and the sudoku
// digits sitting in the nine pseudo cells are 1-9, one each (not necessarily
// forced by row/column all-different alone, since the nine cells need not
// share a row or column with each other). Every other rule below reads a
// pseudo cell's "value" as its row number plus its column number instead of
// its digit; every other cell uses its digit.
//
// Lavender zipper lines (5): cells equidistant from the marked centre sum to
// the centre's value, using the value rule above.
// Turquoise same-difference lines (6): adjacent values along the line share
// one constant absolute difference, chosen independently per line.
// V marks (3): the two adjacent values sum to 5.
//
// The "foglight" cage (R4C7-R6C9) is exactly the ordinary 3x3 box already
// enforced by Shape; it adds no separate rule. Fog reveal state is solving
// UI, not a grid rule, and is not encoded.

// One Var per row: which column (1-9) holds that row's pseudo cell.
const pseudoCol = new Var('P', 'pseudo cell column per row', 9);
// One Var per row: the sudoku digit actually sitting in that pseudo cell.
const selectedDigit = new Var('D', 'pseudo cell digit per row', 9);

// Exactly one pseudo cell per row is implicit (one pseudoCol Var per row).
// Distinct columns makes it exactly one per column too.
const onePerRowAndColumn = new AllDifferent(...pseudoCol.cells());

// Exactly one pseudo cell per box: within each band of 3 rows, the three
// pseudo columns must land in three different column-stacks (1-3/4-6/7-9).
function stackOf(col) { return Math.floor((col - 1) / 3); }
const stackDiffers = Pair.fnToKey((a, b) => stackOf(a) !== stackOf(b), 9);
const bands = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
const onePerBox = bands.flatMap(rows => {
  const pairs = [];
  for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
      pairs.push(new Pair(
        stackDiffers, 'pseudo cell one per box',
        pseudoCol.cell(rows[i]), pseudoCol.cell(rows[j])));
    }
  }
  return pairs;
});

// Per row: read this row's pseudo column, then its nine digits in column
// order, then the row's selectedDigit Var; accept when selectedDigit equals
// the digit actually sitting at the chosen column. `stage` counts symbols
// consumed (0 = before the column choice; 1..9 = just read the digit in
// that column; 11 = after reading selectedDigit).
const pseudoDigitSpec = NFA.encodeSpec({
  startState: { stage: 0, target: null, captured: null },
  transition: (state, value) => {
    if (state.stage === 0) {
      return { stage: 1, target: value, captured: null };
    }
    if (state.stage <= 9) {
      const captured = (state.stage === state.target) ? value : state.captured;
      return { stage: state.stage + 1, target: state.target, captured };
    }
    return {
      stage: 11, target: state.target, captured: state.captured,
      matched: value === state.captured,
    };
  },
  accept: (state) => state.stage === 11 && state.matched,
}, 9);
const pseudoDigitLinks = Array.from({ length: 9 }, (_, i) => {
  const row = i + 1;
  const rowCells = cellGraph('9x9').row(row);
  return new NFA(
    pseudoDigitSpec, 'pseudo cell digit',
    pseudoCol.cell(row), ...rowCells, selectedDigit.cell(row));
});

// Digits 1-9 each appear once in a pseudo cell.
const pseudoDigitsAllDifferent = new AllDifferent(...selectedDigit.cells());

// Shared scan: reads [pseudoCol(row), digit] for each listed cell in order,
// computing that cell's effective value (row+col if it is that row's pseudo
// cell, else its digit) and folding the sequence of effective values with
// `foldEff(acc, effectiveValue, isFirstCell)`. `foldEff` returns `undefined`
// to reject immediately; `accept` reads the final accumulator.
function effScan(name, cells, foldEff, accept) {
  const cellsInfo = cells.map(parseCellId);
  const spec = NFA.encodeSpec({
    startState: { i: 0, pending: null, acc: null },
    transition: (state, value) => {
      // The compiler explores states past the intended sequence length;
      // reject rather than index off the end (never reached in real use,
      // since `new NFA` below is always given exactly this many cells).
      if (state.i >= cellsInfo.length) return undefined;
      const { row, col } = cellsInfo[state.i];
      if (state.pending === null) {
        return { i: state.i, pending: value, acc: state.acc };
      }
      const eff = (state.pending === col) ? (row + col) : value;
      const acc = foldEff(state.acc, eff, state.i === 0);
      if (acc === undefined) return undefined;
      return { i: state.i + 1, pending: null, acc };
    },
    // `accept` reads the fold's accumulator, not the wrapping scan state.
    accept: (state) => accept(state.acc),
  }, 9);
  const readCells = cellsInfo.flatMap(({ row, col }) =>
    [pseudoCol.cell(row), makeCellId(row, col)]);
  return new NFA(spec, name, ...readCells);
}

// Lavender zipper lines: pairs equidistant from the drawn centre sum to the
// centre's (effective) value. Provenance: the drawn lavender line paths;
// drawn centre = the violet circle on each line.
const zipperLines = [
  ['R6C9', 'R6C8', 'R6C7', 'R5C7', 'R4C7', 'R4C8', 'R4C9', 'R5C9', 'R5C8'],
  ['R6C4', 'R6C5', 'R6C6'],
  ['R4C5', 'R4C4', 'R5C3', 'R4C2', 'R4C1', 'R3C1', 'R2C2'],
  ['R2C4', 'R1C3', 'R1C4'],
  ['R9C5', 'R8C4', 'R7C4', 'R8C5', 'R7C6'],
];
function pairSumFold(acc, eff, isFirst) {
  if (isFirst) return { vals: [eff] };
  if (acc.vals.length === 1) return { vals: [...acc.vals, eff] };
  const sum = acc.vals[0] + acc.vals[1];
  return sum === eff ? { done: true } : undefined;
}
const zipperAccept = (acc) => !!(acc && acc.done);
const zippers = zipperLines.flatMap((line, li) => {
  const centre = (line.length - 1) / 2;
  const pairs = [];
  for (let d = 0; d < centre; d++) {
    pairs.push(effScan(
      `zipper ${li} pair ${d}`, [line[d], line[line.length - 1 - d], line[centre]],
      pairSumFold, zipperAccept));
  }
  return pairs;
});

// Turquoise same-difference lines: adjacent (effective) values share one
// constant absolute difference along the whole line. Provenance: the drawn
// turquoise line paths.
const sameDiffLines = [
  ['R5C6', 'R5C5', 'R5C4', 'R6C3', 'R5C2'],
  ['R6C1', 'R5C1', 'R6C2'],
  ['R3C2', 'R3C3', 'R2C3', 'R1C2', 'R1C1'],
  ['R3C5', 'R3C6', 'R2C7'],
  ['R8C3', 'R7C2', 'R8C1', 'R9C1', 'R8C2'],
  ['R9C6', 'R8C7', 'R7C8'],
];
function sameDiffFold(acc, eff, isFirst) {
  if (isFirst) return { prev: eff, diff: null };
  const d = Math.abs(eff - acc.prev);
  if (acc.diff === null) return { prev: eff, diff: d };
  return d === acc.diff ? { prev: eff, diff: acc.diff } : undefined;
}
const sameDiffs = sameDiffLines.map(
  (line, li) => effScan(`same-difference ${li}`, line, sameDiffFold, () => true));

// V marks: the two (effective) values sum to 5. Provenance: overlays array,
// edge-centred "V" text marks.
const vPairs = [
  ['R5C7', 'R5C8'],
  ['R4C6', 'R5C6'],
  ['R3C3', 'R3C4'],
];
function vFold(acc, eff, isFirst) {
  if (isFirst) return { a: eff };
  return acc.a + eff === 5 ? { done: true } : undefined;
}
const vs = vPairs.map(
  (pair, vi) => effScan(`V ${vi}`, pair, vFold, (acc) => !!(acc && acc.done)));

return [
  new Shape('9x9'),
  pseudoCol,
  selectedDigit,
  onePerRowAndColumn,
  ...onePerBox,
  ...pseudoDigitLinks,
  pseudoDigitsAllDifferent,
  ...zippers,
  ...sameDiffs,
  ...vs,
];
