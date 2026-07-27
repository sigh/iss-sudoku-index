// Title: Spreading Through The Fog
// Author: Rab3aron
// Video: https://www.youtube.com/watch?v=Zb4OEMqW2dc
// Source: https://sudokupad.app/f4ec7xtau8

// Rules encoded here:
//   Chaos construction: divide the grid into 9 orthogonally connected regions;
//     1-9 once each per row, column and region (no boxes).
//   Circles: a circled digit is the number of distinct columns its region occupies.
//   Squares: a squared digit is the number of distinct rows its region occupies.
//   Diamonds: a diamond digit is the number of distinct regions appearing anywhere
//     in its row or column, counting a region seen in both only once.
//   Circle/square repeats: among the 9 circled digits exactly one pair is equal,
//     and likewise among the 9 squared digits.
//   Equal sums: every region has the same total over the marks it contains.
// Nothing is omitted. Fog is a presentation device: it hides marks and digits
// until they are found, and does not change the finished grid.
//
// R7C8 and R8C7 each carry a circle *and* a square, so they take part in both
// clue sets.

const N = 9;
const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC');   // region label of each grid cell
const indices = Array.from({ length: N }, (_, i) => i + 1);

// Drawn marks, read off the puzzle art.
const CIRCLES = ['R1C1', 'R1C8', 'R2C6', 'R3C4', 'R7C8', 'R8C7', 'R8C6', 'R9C4', 'R9C3'];
const SQUARES = ['R9C1', 'R7C2', 'R5C3', 'R9C7', 'R8C7', 'R7C8', 'R5C9', 'R4C9', 'R1C2'];
const DIAMONDS = ['R5C5', 'R4C6'];

// Auxiliary state. occCol/occRow are 9x9 flag layers addressed as
// [region label][grid line] via makeCellId(label, line); both hold 2 for "this
// region has a cell on that line" and 1 for "it does not".
const OCCUPIED = 2;
const EMPTY = 1;
const occCol = graph.makeOverlay('VOC');
const occRow = graph.makeOverlay('VOR');
const flagAt = (layer, label, line) => layer.at(makeCellId(label, line));
const colCount = new Var('NC', 'distinct columns per region', N);
const rowCount = new Var('NR', 'distinct rows per region', N);
// The shared per-region mark total, stored with an offset of 8 (see below).
const SUM_OFFSET = 8;
const markSum = new Var('SM', 'region mark total, minus 8', 1);
// Control cell for the two "exactly one repeated pair" counts.
const eight = new Var('EI', 'eight distinct', 1);

// Line occupancy: reads the flag cell, then the 9 region labels of one grid line,
// and requires the flag to say whether label `label` occurs among them.
const occupancySpec = (label) => NFA.encodeSpec({
  startState: { flag: 0, seen: false },
  transition({ flag, seen }, value) {
    if (flag === 0) {
      if (value !== EMPTY && value !== OCCUPIED) return undefined;
      return { flag: value, seen: false };
    }
    return { flag, seen: seen || value === label };
  },
  accept: ({ flag, seen }) => flag !== 0 && seen === (flag === OCCUPIED),
}, N);

// Counting: reads a count cell, then 9 occupancy flags, and requires the count to
// be how many of them are OCCUPIED. `target === 0` marks the pre-read state.
const countSpec = NFA.encodeSpec({
  startState: { target: 0, count: 0 },
  transition({ target, count }, value) {
    if (target === 0) return { target: value, count: 0 };
    const next = count + (value === OCCUPIED ? 1 : 0);
    if (next > target) return undefined;
    return { target, count: next };
  },
  accept: ({ target, count }) => target !== 0 && count === target,
}, N);

// Mark lookup: reads a marked cell's digit, then that cell's region label, then
// the 9 per-region counts in label order, and requires the count belonging to the
// cell's own label to equal the digit. Stage 3 is the satisfied sink.
const lookupSpec = NFA.encodeSpec({
  startState: { stage: 0, digit: 0, label: 0, pos: 0 },
  transition(state, value) {
    if (state.stage === 0) return { stage: 1, digit: value, label: 0, pos: 0 };
    if (state.stage === 1) return { stage: 2, digit: state.digit, label: value, pos: 0 };
    if (state.stage === 3) return state;
    const pos = state.pos + 1;
    if (pos !== state.label) {
      return { stage: 2, digit: state.digit, label: state.label, pos };
    }
    if (value !== state.digit) return undefined;
    return { stage: 3, digit: 0, label: 0, pos: 0 };
  },
  accept: (state) => state.stage === 3,
}, N);

// Equal sums: reads the shared total, then a (region label, digit) pair for each
// of the 18 marks, and totals the digits of the marks lying in region `label`.
// The total is stored offset by 8 because it cannot fit in a 1-9 cell: each of the
// nine circled digits and each of the nine squared digits is eight distinct digits
// plus one repeat, so both sets sum to at least 1+2+...+8+1 = 37, and nine equal
// region totals must therefore each be at least (37+37)/9 > 8.
const equalSumSpec = (label) => NFA.encodeSpec({
  startState: { total: 0, phase: 0, sum: 0, hit: 0 },
  transition(state, value) {
    if (state.total === 0) {
      return { total: value + SUM_OFFSET, phase: 0, sum: 0, hit: 0 };
    }
    if (state.phase === 0) {
      return {
        total: state.total, phase: 1, sum: state.sum, hit: value === label ? 1 : 0,
      };
    }
    const sum = state.sum + (state.hit ? value : 0);
    if (sum > state.total) return undefined;
    return { total: state.total, phase: 0, sum, hit: 0 };
  },
  accept: (state) => state.total !== 0 && state.phase === 0 && state.sum === state.total,
}, N);

const occupancyFlags = indices.flatMap(label => [
  ...indices.map(col => new NFA(
    occupancySpec(label), 'regionOnLine',
    flagAt(occCol, label, col), ...cc.at(graph.column(col)))),
  ...indices.map(row => new NFA(
    occupancySpec(label), 'regionOnLine',
    flagAt(occRow, label, row), ...cc.at(graph.row(row)))),
]);

const flagDomains = [occCol, occRow].map(layer =>
  layer.makeReplicate(new Given(layer.cells()[0], EMPTY, OCCUPIED)));

const spanCounts = indices.flatMap(label => [
  new NFA(countSpec, 'regionSpan',
    colCount.cell(label), ...indices.map(col => flagAt(occCol, label, col))),
  new NFA(countSpec, 'regionSpan',
    rowCount.cell(label), ...indices.map(row => flagAt(occRow, label, row))),
]);

const circles = CIRCLES.map(cell => new NFA(
  lookupSpec, 'circle', cell, cc.at(cell), ...colCount.cells()));

const squares = SQUARES.map(cell => new NFA(
  lookupSpec, 'square', cell, cc.at(cell), ...rowCount.cells()));

const diamonds = DIAMONDS.map(cell => {
  const seen = [...new Set([...graph.row(cell), ...graph.column(cell)])];
  return new CountDistinct(cell, ...cc.at(seen));
});

// Nine circles with exactly one repeated pair hold exactly eight distinct digits.
const repeatedPairs = [
  new Given(eight.cell(1), 8),
  new CountDistinct(eight.cell(1), ...CIRCLES),
  new CountDistinct(eight.cell(1), ...SQUARES),
];

const markCells = [...CIRCLES, ...SQUARES];
const equalSums = indices.map(label => new NFA(
  equalSumSpec(label), 'regionMarkSum',
  markSum.cell(1), ...markCells.flatMap(cell => [cc.at(cell), cell])));

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  occCol.toVar('region occupies column'),
  occRow.toVar('region occupies row'),
  colCount,
  rowCount,
  markSum,
  eight,
  ...flagDomains,
  ...occupancyFlags,
  ...spanCounts,
  ...circles,
  ...squares,
  ...diamonds,
  ...repeatedPairs,
  ...equalSums,
];
