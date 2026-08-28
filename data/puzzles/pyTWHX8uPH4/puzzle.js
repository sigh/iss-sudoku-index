// Title: Unknown
// Author: Eric Fox
// Video: https://www.youtube.com/watch?v=pyTWHX8uPH4
// Source: https://cracking-the-cryptic.web.app/sudoku/pLdgG4Q9R8

// Standard 9x9 sudoku (default row/column/box all-different, no givens),
// plus:
// - Sandwich clues written by the solver: each row and column's own
//   sandwich sum (sum of the digits strictly between the 1 and the 9 in
//   that row/column) is held by that row/column's perimeter cell instead of
//   a printed number.
// - Ten thermometers: strictly increasing from the bulb.
// - Thermometer cells that sit in the perimeter band cannot be 0.
//
// A sandwich sum can reach 35, past the 16-value cap on a single ISS
// cell/Var, so each perimeter clue's value is split base-9 across two
// parallel Var cells, `hi` (0-3) and `lo` (0-8): value = 9*hi + lo, a
// bijection onto 0-35. The Shape itself only needs to admit 0-9 (10
// values): the real grid's 1-9, plus 0 for hi/lo.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const gridCells = graph.cells();

const ALL_DIGITS = Array.from({ length: 9 }, (_, i) => i + 1); // 1..9

// Restrict the real grid back to ordinary sudoku digits: one Given template
// stamped over every grid cell via Replicate.
const gridDigitReplicate = new Replicate(
  [new Given(gridCells[0], ...ALL_DIGITS)],
  Replicate.encodeTargetCells(gridCells, gridCells[0], graph),
  gridCells[0],
);

// 18 clue slots: 1-9 = column 1-9's sandwich sum, 10-18 = row 1-9's.
const hiVar = new Var('H', 'sandwich clue value, base-9 high digit (0-3)', 18);
const loVar = new Var('L', 'sandwich clue value, base-9 low digit (0-8)', 18);
const hi = n => hiVar.cell(n);
const lo = n => loVar.cell(n);
const colClueIndex = col => col;
const rowClueIndex = row => 9 + row;

// hi in 0-3, lo in 0-8 (never 9) keeps 9*hi+lo a bijection onto 0-35 -- two
// different (hi, lo) pairs must never encode the same sandwich sum, or the
// all-solutions search would see spurious extra solutions differing only in
// this internal split.
const hiLoDomainGivens = [
  ...hiVar.cells().map(cell => new Given(cell, 0, 1, 2, 3)),
  ...loVar.cells().map(cell => new Given(cell, 0, 1, 2, 3, 4, 5, 6, 7, 8)),
];

// Perimeter clue cells that also sit on a thermometer (see the thermometer
// table below) cannot be 0, per the video description ("Any thermometer
// cell in the perimeter cannot contain a 0"). 0 = hi=0 and lo=0, so forbid
// it as "hi is nonzero, or lo is nonzero".
const noZeroClueIndices = [
  colClueIndex(1), colClueIndex(2), colClueIndex(3), colClueIndex(6),
  rowClueIndex(4), rowClueIndex(7), rowClueIndex(8), rowClueIndex(9),
];
const noZeroConstraints = noZeroClueIndices.map(n => new Or([
  new Given(hi(n), 1, 2, 3),
  new Given(lo(n), 1, 2, 3, 4, 5, 6, 7, 8),
]));

// Sandwich-sum state machine: scans a row/column's 9 grid cells (segment 1),
// then that row/column's own clue's [hi, lo] pair (segment 2, after a
// SEGMENT_BREAK), and requires 9*hi + lo to equal the sandwich sum of the 9
// cells.
//
// `phase` tracks whether the scan is before the first of {1, 9}, between the
// two (accumulating `sum`), or after the second -- once 'after', `sum` is
// frozen and any remaining row/column cells are ignored. At SEGMENT_BREAK,
// `phase`/`found` are dropped (no longer needed) and `sum` carries over into
// the 2-cell tail, which reconstructs 9*hi + lo and compares it to `sum`.
const sandwichSumSpec = {
  startState: { phase: 'before', found: null, sum: 0 },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) return { tail: 'hi', sum: state.sum };
    if (state.tail === 'hi') return { tail: 'lo', sum: state.sum, hi: value };
    if (state.tail === 'lo') {
      return { tail: 'done', match: (state.hi * 9 + value) === state.sum };
    }
    if (state.phase === 'before') {
      if (value === 1 || value === 9) return { phase: 'inside', found: value, sum: 0 };
      return { phase: 'before', found: null, sum: 0 };
    }
    if (state.phase === 'inside') {
      const other = state.found === 1 ? 9 : 1;
      if (value === other) return { phase: 'after', found: null, sum: state.sum };
      return { phase: 'inside', found: state.found, sum: state.sum + value };
    }
    return { phase: 'after', found: null, sum: state.sum }; // phase 'after': frozen
  },
  accept: state => state.tail === 'done' && state.match,
  maxDepth: 12, // 9 row/col cells + 1 break + 2 tail cells
};
const sandwichSumNFA = NFA.encodeSpec(sandwichSumSpec, shape, { multiSegment: true });

const columnSandwichConstraints = ALL_DIGITS.map(col => new NFA(
  sandwichSumNFA, `col ${col} sandwich`,
  graph.column(col), [hi(colClueIndex(col)), lo(colClueIndex(col))]));
const rowSandwichConstraints = ALL_DIGITS.map(row => new NFA(
  sandwichSumNFA, `row ${row} sandwich`,
  graph.row(row), [hi(rowClueIndex(row)), lo(rowClueIndex(row))]));

// Three small comparator NFAs for a thermometer step where one or both
// sides is a perimeter clue's (hi, lo) pair rather than a plain grid digit,
// so ordinary `Thermo` (which only compares raw cell values) cannot express
// the step directly. Each reconstructs 9*hi + lo and checks a strict `<`.
const digitLtCombined = NFA.encodeSpec({ // D < 9*hi + lo
  startState: { step: 0 },
  transition: (state, value) => {
    if (state.step === 0) return { step: 1, d: value };
    if (state.step === 1) return { step: 2, d: state.d, partial: value * 9 };
    return { step: 3, less: state.d < state.partial + value };
  },
  accept: state => state.step === 3 && state.less,
  maxDepth: 3,
}, shape);
const combinedLtDigit = NFA.encodeSpec({ // 9*hi + lo < D
  startState: { step: 0 },
  transition: (state, value) => {
    if (state.step === 0) return { step: 1, combined: value * 9 };
    if (state.step === 1) return { step: 2, combined: state.combined + value };
    return { step: 3, less: state.combined < value };
  },
  accept: state => state.step === 3 && state.less,
  maxDepth: 3,
}, shape);
const combinedLtCombined = NFA.encodeSpec({ // 9*hiA + loA < 9*hiB + loB
  startState: { step: 0 },
  transition: (state, value) => {
    if (state.step === 0) return { step: 1, a: value * 9 };
    if (state.step === 1) return { step: 2, a: state.a + value };
    if (state.step === 2) return { step: 3, a: state.a, b: value * 9 };
    return { step: 4, less: state.a < state.b + value };
  },
  accept: state => state.step === 4 && state.less,
  maxDepth: 4,
}, shape);

// Ten thermometers, bulb (increasing end) first, transcribed from the drawn
// thermometer lines. A perimeter waypoint is its clue's (hi, lo) pair; a
// plain grid-cell run between two perimeter waypoints (or with none) is an
// ordinary `Thermo`, and a step touching a perimeter waypoint uses one of
// the three comparator NFAs above instead.
const thermos = [
  new NFA(combinedLtCombined, 'thermo 1',
    hi(colClueIndex(1)), lo(colClueIndex(1)), hi(colClueIndex(2)), lo(colClueIndex(2))),
  new NFA(combinedLtDigit, 'thermo 2',
    hi(colClueIndex(3)), lo(colClueIndex(3)), 'R1C3'),
  new NFA(combinedLtDigit, 'thermo 3 (diagonal)',
    hi(colClueIndex(6)), lo(colClueIndex(6)), 'R1C7'),
  new Thermo('R3C5', 'R3C6', 'R3C7', 'R3C8'),
  new Thermo('R4C5', 'R4C4', 'R4C3', 'R4C2', 'R4C1'),
  new NFA(digitLtCombined, 'thermo 5 tail',
    'R4C1', hi(rowClueIndex(4)), lo(rowClueIndex(4))),
  new Thermo('R5C7', 'R5C6'),
  new Thermo('R6C5', 'R7C5'),
  new NFA(combinedLtDigit, 'thermo 8 head',
    hi(rowClueIndex(7)), lo(rowClueIndex(7)), 'R7C1'),
  new Thermo('R7C1', 'R8C1'),
  new Thermo('R8C9', 'R7C9'),
  new Thermo('R9C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2', 'R9C1'),
  new NFA(digitLtCombined, 'thermo 10 tail 1',
    'R9C1', hi(rowClueIndex(9)), lo(rowClueIndex(9))),
  new NFA(combinedLtCombined, 'thermo 10 tail 2',
    hi(rowClueIndex(9)), lo(rowClueIndex(9)), hi(rowClueIndex(8)), lo(rowClueIndex(8))),
];

return [
  shape,
  hiVar,
  loVar,
  gridDigitReplicate,
  ...hiLoDomainGivens,
  ...noZeroConstraints,
  ...columnSandwichConstraints,
  ...rowSandwichConstraints,
  ...thermos,
];
