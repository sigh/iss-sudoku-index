// Title: Go the Right way.
// Author: Panthera
// Video: https://www.youtube.com/watch?v=ruu87b2LrjM
// Source: https://tinyurl.com/5xvnzfv6

// Normal sudoku, plus:
// - Kropki dots: white dots (difference, default 1, two carry an explicit
//   override) and black dots (ratio 1:2), all payload "difference"/"ratio"
//   pairs. "Not all dots are given" means no anti-Kropki inference, so only
//   the drawn dots are constrained.
// - Japanese sums over the 6x6 area in boxes 5689 (R4-9,C4-9): for each of
//   its 6 rows and 6 columns, the #D0D0FF-highlighted cells in boxes 2347
//   (R1-3,C4-9 above a column; R4-9,C1-3 left of a row) are themselves
//   ordinary unfilled sudoku cells. Read top-to-bottom (column) or
//   left-to-right (row), their solved digits spell that lane's one Japanese
//   sum target (1 or 2 digits, per how many highlighted cells sit in the
//   lane).
//   Within the 6x6 area no cell is pre-shaded -- blue/not-blue is
//   solver-discovered per-cell state -- and each lane must contain exactly
//   one contiguous run of shaded cells whose digits sum to its target, all
//   other lane cells unshaded.
//
// The whole-6x6-area outline (payload cage, no total) and the single-cell
// "FOW" tag are decoration/fog scaffolding, not modelled.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const numValues = geometry.numValues;

// ---- Kropki dots ----

const differencePairs = [
  ['R1C6', 'R1C7'], ['R2C7', 'R2C6'], ['R3C8', 'R3C7'], ['R3C5', 'R3C6'],
  ['R1C4', 'R1C5'], ['R2C1', 'R2C2'], ['R2C2', 'R2C3'], ['R3C1', 'R3C2'],
  ['R4C1', 'R4C2'], ['R8C2', 'R8C3'], ['R2C9', 'R2C8'], ['R1C7', 'R2C7'],
  ['R1C6', 'R2C6'], ['R7C1', 'R8C1'], ['R3C8', 'R4C8'], ['R3C6', 'R4C6'],
  ['R4C5', 'R4C4'], ['R5C5', 'R5C6'], ['R5C6', 'R4C6'], ['R5C9', 'R4C9'],
  ['R4C8', 'R4C9'], ['R6C7', 'R6C8'], ['R9C5', 'R9C4'], ['R5C8', 'R5C9'],
  ['R8C7', 'R8C8'], ['R9C8', 'R9C7'], ['R7C7', 'R7C8'], ['R7C4', 'R6C4'],
  ['R6C8', 'R7C8'], ['R7C7', 'R6C7'],
];
// Explicit non-default differences (payload "value" overrides).
const overriddenDifferences = { 'R2C7,R2C8': 5, 'R1C9,R1C8': 6 };
const defaultWhiteDots = differencePairs.map(pair =>
  new WhiteDot(...pair));
const customDifferenceDots = Object.entries(overriddenDifferences).map(
  ([pair, n]) => {
    const cells = pair.split(',');
    return new Pair(Pair.fnToKey((a, b) => Math.abs(a - b) === n, numValues),
      `difference-${n}`, ...cells);
  });

const ratioPairs = [
  ['R1C7', 'R1C8'], ['R2C5', 'R2C6'], ['R1C5', 'R1C6'], ['R2C2', 'R3C2'],
  ['R1C3', 'R1C2'], ['R2C8', 'R3C8'], ['R5C3', 'R6C3'], ['R8C5', 'R8C6'],
  ['R7C5', 'R7C6'], ['R8C7', 'R9C7'], ['R6C4', 'R5C4'], ['R7C8', 'R8C8'],
];
const blackDots = ratioPairs.map(pair => new BlackDot(...pair));

// ---- Japanese sums over the 6x6 area ----

const SHADED = 1;
const UNSHADED = 2;

const innerCells = [];
for (let r = 4; r <= 9; r++) {
  for (let c = 4; c <= 9; c++) innerCells.push(makeCellId(r, c));
}
const shade = graph.makeOverlay('VS', innerCells);
// Every shade Var is either shaded or unshaded.
const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], SHADED, UNSHADED));

// One machine per border-clue digit count (1 or 2 border cells). It first
// reads the border cell(s) to build the lane's target (target = target*10 +
// digit per cell, so a 1-cell border leaves target as that single digit),
// then scans the lane's 6 (shade, digit) pairs, tracking target-minus-sum
// across the one contiguous shaded run it must find. The 6 lane cells share
// a sudoku row or column with the border cells, so (row/column
// all-different) they are pairwise distinct: the largest possible run sum
// is the 6 largest digits, 4+5+6+7+8+9 = 39. diff saturates at that bound
// (an "already unreachable" sink, never revisited once entered, since diff
// only ever decreases) and at -1 (an "overshot" sink) so the compiled state
// count stays small instead of tracking every two-digit target exactly.
// Reused across every lane with that border count, since the target is read
// from the scan itself, not baked into the machine.
const MAX_RUN_SUM = 4 + 5 + 6 + 7 + 8 + 9;
function laneMachine(borderCount) {
  return NFA.encodeSpec({
    startState: {
      bordersLeft: borderCount, target: 0,
      parity: 'shade', pendingShade: null,
      runState: 'before', diff: null,
    },
    transition: (state, value) => {
      if (state.bordersLeft > 0) {
        // Border phase: 'target' is dropped from the state shape the moment
        // it turns into 'diff' below, so it cannot inflate the post-border
        // state count.
        const target = state.target * 10 + value;
        const bordersLeft = state.bordersLeft - 1;
        if (bordersLeft === 0) {
          return {
            parity: 'shade', pendingShade: null,
            runState: 'before',
            diff: Math.min(target, MAX_RUN_SUM + 1),
          };
        }
        return { bordersLeft, target };
      }
      if (state.parity === 'shade') {
        return { parity: 'digit', pendingShade: value, runState: state.runState, diff: state.diff };
      }
      // parity === 'digit': value is this lane cell's grid digit.
      const shaded = state.pendingShade === SHADED;
      let { runState, diff } = state;
      const step = (d) =>
        d > MAX_RUN_SUM ? MAX_RUN_SUM + 1 : Math.max(d - value, -1);
      if (runState === 'before') {
        if (shaded) { runState = 'in'; diff = step(diff); }
      } else if (runState === 'in') {
        if (shaded) {
          diff = step(diff);
        } else {
          if (diff !== 0) return undefined;
          runState = 'after';
        }
      } else {
        // runState === 'after': a second shaded run is not allowed.
        if (shaded) return undefined;
      }
      return { parity: 'shade', pendingShade: null, runState, diff };
    },
    // Post-border states carry 'parity'; mid-border ones do not, so this
    // also confirms the border phase finished.
    accept: (state) =>
      state.parity === 'shade' &&
      (state.runState === 'after' ||
        (state.runState === 'in' && state.diff === 0)),
  }, numValues);
}
const machine1 = laneMachine(1);
const machine2 = laneMachine(2);

function laneCells(borderCells, laneInnerCells) {
  const interleaved = laneInnerCells.flatMap(cell => [shade.at(cell), cell]);
  return [...borderCells, ...interleaved];
}

const columnLanes = [
  { col: 4, border: ['R3C4'] },
  { col: 5, border: ['R3C5'] },
  { col: 6, border: ['R1C6', 'R2C6'] },
  { col: 7, border: ['R2C7', 'R3C7'] },
  { col: 8, border: ['R1C8', 'R2C8'] },
  { col: 9, border: ['R2C9'] },
].map(({ col, border }) => {
  const inner = [4, 5, 6, 7, 8, 9].map(r => makeCellId(r, col));
  return new NFA(
    border.length === 1 ? machine1 : machine2, `column-${col}-sum`,
    ...laneCells(border, inner));
});

const rowLanes = [
  { row: 4, border: ['R4C1'] },
  { row: 5, border: ['R5C1', 'R5C2'] },
  { row: 6, border: ['R6C1', 'R6C2'] },
  { row: 7, border: ['R7C2', 'R7C3'] },
  { row: 8, border: ['R8C2'] },
  { row: 9, border: ['R9C2', 'R9C3'] },
].map(({ row, border }) => {
  const inner = [4, 5, 6, 7, 8, 9].map(c => makeCellId(row, c));
  return new NFA(
    border.length === 1 ? machine1 : machine2, `row-${row}-sum`,
    ...laneCells(border, inner));
});

return [
  new Shape('9x9'),
  ...defaultWhiteDots,
  ...customDifferenceDots,
  ...blackDots,
  shadeDomain,
  shade.toVar('shade'),
  ...columnLanes,
  ...rowLanes,
];
