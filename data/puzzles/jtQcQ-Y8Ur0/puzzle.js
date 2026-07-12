// Title: Sub-Zero
// Author: M.K.
// Video: https://www.youtube.com/watch?v=jtQcQ-Y8Ur0
// Source: https://sudokupad.app/2mcr6exf3p

// Normal sudoku, but with digits 0-8 instead of 1-9.
//
// Killer cages: digits don't repeat and sum to the small corner number.
// Blue lines are split into segments by the box borders they cross; every
// segment on the same line sums to the same total.
//
// Both kinds of sum are "signed": a digit sitting directly below a 0 (same
// column, one row down) counts as negative in every sum it belongs to.
// Standard column-uniqueness means exactly one cell per column can be a "0",
// so there are always exactly 8 such below-a-0 ("sub-zero") cells -- one per
// column, except the column whose 0 lands in row 9. The puzzle requires
// those 8 sub-zero digits to be pairwise distinct, and no row, column, or
// 3x3 box may contain more than one sub-zero cell.

const shape = new Shape('9x9', '0-8');
const graph = cellGraph('9x9');
const DIGIT_MAX = 8;

const constraints = [shape];

// Sub-zero flag overlay: 1 iff the cell directly above holds 0, else 0.
const flags = graph.makeOverlay('VF');
const flag = cell => flags.at(cell);
constraints.push(flags.toVar('sub-zero flags'));

// A signed sum can't live in one 0-8 Var (the range 16-16..16 needed exceeds
// ISS's 16-value cap), so split each cell's signed contribution into two
// non-negative halves that are never both nonzero: posVal (the digit, when
// not sub-zero) and negVal (the digit, when sub-zero). signedValue =
// posVal - negVal, and both halves stay within the grid's own 0-8 range.
const posVals = graph.makeOverlay('VP');
const posVal = cell => posVals.at(cell);
const negVals = graph.makeOverlay('VN');
const negVal = cell => negVals.at(cell);
constraints.push(posVals.toVar('positive half'));
constraints.push(negVals.toVar('negative half'));

// Row 1 has no cell above it, so it can never be sub-zero.
for (const cell of graph.row(1)) constraints.push(new Given(flag(cell), 0));

// Every other cell's flag is boolean and tied to the cell above it.
for (let r = 2; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) {
    constraints.push(new Given(flag(makeCellId(r, c)), 0, 1));
  }
}
const subZeroKey = Pair.fnToKey((above, f) => (above === 0) === (f === 1), shape);
for (let r = 2; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) {
    const cell = makeCellId(r, c);
    const above = makeCellId(r - 1, c);
    constraints.push(new Pair(subZeroKey, 'sub-zero flag', above, flag(cell)));
  }
}

// Tie posVal/negVal to [digit, flag]: (posVal, negVal) = (digit, 0) when not
// sub-zero, (0, digit) when sub-zero. A 4-step scan over
// [digit, flag, posVal, negVal] checks both halves against the pending
// digit/flag.
const halvesMachine = NFA.encodeSpec({
  startState: { phase: 0, digit: null, isSubZero: null },
  transition(state, value) {
    if (state.phase === 0) return { phase: 1, digit: value, isSubZero: null };
    if (state.phase === 1) {
      if (value !== 0 && value !== 1) return undefined;
      return { phase: 2, digit: state.digit, isSubZero: value === 1 };
    }
    if (state.phase === 2) {
      const expectedPos = state.isSubZero ? 0 : state.digit;
      return value === expectedPos
        ? { phase: 3, digit: state.digit, isSubZero: state.isSubZero }
        : undefined;
    }
    const expectedNeg = state.isSubZero ? state.digit : 0;
    return value === expectedNeg ? { phase: 4 } : undefined;
  },
  accept: (state) => state.phase === 4,
  maxDepth: 4,
}, shape);
for (const cell of graph.cells()) {
  constraints.push(new NFA(
    halvesMachine, 'signed halves', cell, flag(cell), posVal(cell), negVal(cell)));
}

// Killer cages: distinct digits, signed sum equals the corner total.
const cages = [
  [['R2C5', 'R3C5', 'R3C6'], -1],
  [['R5C3', 'R5C4', 'R6C4'], -4],
  [['R5C6', 'R5C7', 'R6C6'], -7],
  [['R7C1', 'R7C2', 'R8C1', 'R8C2'], -1],
  [['R8C4', 'R9C3', 'R9C4'], -3],
  [['R7C6', 'R7C7', 'R8C6'], 0],
];
for (const [cells, total] of cages) {
  constraints.push(new AllDifferent(...cells));
  constraints.push(new Sum(
    total,
    ...cells.map(posVal),
    ...cells.map(cell => [negVal(cell), -1])));
}

// Blue equal-sum lines, split into segments at box-border crossings. Chain
// each consecutive pair of segments with a signed-sum equality; transitively
// that forces every segment on the line to share one total.
function boxKey(cellId) {
  const { row, col } = parseCellId(cellId);
  return `${Math.ceil(row / 3)}-${Math.ceil(col / 3)}`;
}
function splitByBox(cells) {
  const segments = [];
  let current = [];
  let currentBox = null;
  for (const cell of cells) {
    const box = boxKey(cell);
    if (box !== currentBox) {
      if (current.length) segments.push(current);
      current = [];
      currentBox = box;
    }
    current.push(cell);
  }
  if (current.length) segments.push(current);
  return segments;
}

const lines = [
  ['R2C4', 'R2C3', 'R3C2', 'R4C2'],
  ['R2C6', 'R1C7'],
  ['R3C5', 'R3C6', 'R4C6', 'R5C6', 'R6C6', 'R7C7', 'R8C8'],
  ['R5C5', 'R6C5', 'R7C4', 'R8C4', 'R8C3', 'R8C2'],
  ['R8C7', 'R8C6', 'R9C6'],
  ['R2C8', 'R3C8', 'R4C8', 'R5C8'],
  ['R5C9', 'R4C9', 'R3C9'],
];

for (const [i, line] of lines.entries()) {
  const segments = splitByBox(line);
  for (let s = 1; s < segments.length; s++) {
    const segA = segments[s - 1];
    const segB = segments[s];
    constraints.push(new Sum(
      0,
      ...segA.map(posVal),
      ...segA.map(cell => [negVal(cell), -1]),
      ...segB.map(cell => [posVal(cell), -1]),
      ...segB.map(negVal)));
  }
}

// No row, column, or box may contain more than one sub-zero (flag=1) cell.
const atMostOneFlagMachine = NFA.encodeSpec({
  startState: 0,
  transition(state, value) {
    if (value !== 0 && value !== 1) return undefined;
    const count = state + value;
    return count <= 1 ? count : undefined;
  },
  accept: () => true,
  maxDepth: 9, // one row/column/box has 9 cells
}, shape);
for (let n = 1; n <= 9; n++) {
  constraints.push(new NFA(
    atMostOneFlagMachine, `row ${n} sub-zero`, ...graph.row(n).map(flag)));
  constraints.push(new NFA(
    atMostOneFlagMachine, `col ${n} sub-zero`, ...graph.column(n).map(flag)));
  constraints.push(new NFA(
    atMostOneFlagMachine, `box ${n} sub-zero`, ...graph.box(n).map(flag)));
}

// The (up to) 8 sub-zero digits must be pairwise distinct: for each digit v,
// at most one flagged cell may hold v. Tracking only "is pending == v" (not
// the full pending digit) keeps this machine's state space tiny.
const interleave = cells => cells.flatMap(cell => [cell, flag(cell)]);
const allCellsInterleaved = interleave(graph.cells());
for (let v = 0; v <= DIGIT_MAX; v++) {
  const machine = NFA.encodeSpec({
    startState: { phase: 0, isV: false, seen: false },
    transition(state, value) {
      if (state.phase === 0) return { phase: 1, isV: value === v, seen: state.seen };
      if (value !== 0 && value !== 1) return undefined;
      if (value === 1 && state.isV) {
        if (state.seen) return undefined; // digit v is sub-zero twice
        return { phase: 0, isV: false, seen: true };
      }
      return { phase: 0, isV: false, seen: state.seen };
    },
    accept: () => true,
    maxDepth: allCellsInterleaved.length,
  }, shape);
  constraints.push(new NFA(machine, `sub-zero digit ${v} at most once`, ...allCellsInterleaved));
}

return constraints;
