// Title: Wrogn Fogn
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=nkLVEKgkg4o
// Source: https://app.crackingthecryptic.com/sudoku/RRPttN2Dg2

// Normal sudoku rules apply, but every clue below is "wrong": the drawn
// object is *not* satisfied by the digits, in the specific way the rules
// text states for that object type. Each helper below builds the stated
// negation directly (not the ordinary/right-way rule), following one style
// per clue family:
//   - cage / arrow / outside-diagonal sum: an NFA over the running total
//     (clamped once it cannot recover), accepting everything but an exact
//     equal split (arrow) or exact match to the printed total.
//   - thermometer / orange / green line: "at least one adjacent pair breaks
//     the ordinary rule" -> Or of one failing-predicate Pair per edge.
//   - large circle: read as a quadruple (concatenated-digit text is the
//     usual SudokuPad rendering for a 2-digit-listed quadruple), so its
//     negation is "at least one listed digit is absent" from the 4 cells.
//   - shaded circle / V / X / white dot / black dot: direct negation of the
//     ordinary clue (even instead of odd; sum != 5/10; not consecutive;
//     not a 1:2 ratio).
// A clue with an arithmetically unreachable target (cage total 45 over 3
// cells whose box already forces distinctness, max reachable 27; a few
// outside diagonals) is still encoded faithfully -- it happens to hold
// unconditionally.

const ALL_DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
function except(...exclude) {
  return ALL_DIGITS.filter(v => !exclude.includes(v));
}

// --- sum-based negations (cages, arrow, outside diagonals) ---

function wrongSumNFA(total) {
  return NFA.encodeSpec({
    startState: 0,
    transition: (state, value) => Math.min(state + value, total + 1),
    accept: state => state !== total,
  }, 9);
}
// "Digits must not sum to N": a single cell is a plain exclusion, 2 cells
// is a Pair (sum != N), and 3+ cells is an NFA carrying the running total,
// clamped once it can only miss, accepting everything but an exact match.
function wrongSum(name, cells, total) {
  if (cells.length === 1) return new Given(cells[0], ...except(total));
  if (cells.length === 2) {
    return new Pair(Pair.fnToKey((a, b) => a + b !== total, 9), name, ...cells);
  }
  return new NFA(wrongSumNFA(total), name, ...cells);
}

// "Digits on arrows must not sum to the number in the connected circle":
// the arrow's own bulb cell carries that number (classic arrow-sudoku
// reading -- the bulb is drawn as a plain, un-numbered circle, so its own
// solved digit is the target). A single-arm cell reduces to "bulb != arm"
// (AllDifferent); 2+ arm cells need an NFA reading the bulb first, then
// carrying (bulb, running-arm-sum clamped at bulb+1), rejecting only the
// bulb/arm-sum-equal case.
const ARROW_WRONG = NFA.encodeSpec({
  startState: { bulb: null, sum: 0 },
  transition: (state, value) => {
    if (state.bulb === null) return { bulb: value, sum: 0 };
    return { bulb: state.bulb, sum: Math.min(state.sum + value, state.bulb + 1) };
  },
  accept: state => state.sum !== state.bulb,
}, 9);
function arrowWrong(name, bulb, arm) {
  if (arm.length === 1) return new AllDifferent(bulb, arm[0]);
  return new NFA(ARROW_WRONG, name, bulb, ...arm);
}

// --- "at least one adjacent pair fails" line negations (thermo/orange/green) ---

function wrongLine(name, cells, failsFn) {
  const key = Pair.fnToKey(failsFn, 9);
  const edges = [];
  for (let i = 0; i + 1 < cells.length; i++) {
    edges.push(new Pair(key, name, cells[i], cells[i + 1]));
  }
  return new Or(edges);
}
// Thermometer: "digits must not increase from the bulb to the tip" ->
// at least one step (in bulb-to-tip order) fails to increase.
const thermoFails = (a, b) => a >= b;
// Orange line: "at least one pair of adjacent digits must not differ by
// at least 4" -- stated directly as the existential failure already.
const orangeFails = (a, b) => Math.abs(a - b) < 4;
// Green line: same shape, threshold 5.
const greenFails = (a, b) => Math.abs(a - b) < 5;

// --- large circle (quadruple), negated ---

// "Large circles contain at least one digit which does not appear in the
// four surrounding cells": the circle's printed text lists the quadruple's
// digit(s) (SudokuPad's usual concatenated rendering for 2 digits, e.g.
// "39" = {3, 9}); negation is "at least one listed digit is missing from
// the 4 cells".
function largeCircleWrong(cells, digits) {
  if (digits.length === 1) {
    return cells.map(c => new Given(c, ...except(digits[0])));
  }
  return [new Or(digits.map(d =>
    new And(cells.map(c => new Given(c, ...except(d))))))];
}

// --- simple pairwise negations ---

const V_KEY = Pair.fnToKey((a, b) => a + b !== 5, 9);
const X_KEY = Pair.fnToKey((a, b) => a + b !== 10, 9);
const WHITE_DOT_KEY = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);
const BLACK_DOT_KEY = Pair.fnToKey((a, b) => a !== 2 * b && b !== 2 * a, 9);

// ============================= Clue data ==============================

// Killer cages (dashed-border cages with a corner total):
//  - R2C8/R2C9 and R9C1/R9C2 are same-row, so already forced distinct;
//    the negation reduces to sum != total.
//  - R3C3/R3C4/R4C3 has no total; the negation is just "not all-different".
//    Of its 3 pairs, only R3C4/R4C3 share neither row, column nor box, so
//    it is the only pair that *can* repeat -- forcing it equal.
//  - R5C6/R6C5/R6C6 all share one box (forced distinct already); its total
//    (45) exceeds the max reachable sum for 3 cells (27), so this cage's
//    negation holds unconditionally.
const cages = [
  wrongSum('cage 13', ['R2C8', 'R2C9'], 13),
  wrongSum('cage 7', ['R9C1', 'R9C2'], 7),
  new SameValues(2, 'R3C4', 'R4C3'),
  wrongSum('cage 45', ['R5C6', 'R6C5', 'R6C6'], 45),
];

// Arrows (grey arrowed lines; bulb cell first).
// R7C2 is a shared bulb for two separate arms (R6C1/R6C2 and R6C3/R6C2).
const arrows = [
  arrowWrong('arrow R5C5', 'R5C5', ['R4C4']),
  arrowWrong('arrow R3C9', 'R3C9', ['R4C9', 'R4C8']),
  arrowWrong('arrow R7C2a', 'R7C2', ['R6C1', 'R6C2']),
  arrowWrong('arrow R7C2b', 'R7C2', ['R6C3', 'R6C2']),
  arrowWrong('arrow R9C9', 'R9C9', ['R9C8', 'R9C7', 'R9C6', 'R9C5', 'R8C4']),
];

// Thermometers (thick grey lines; bulb-first, matching the large
// shaded-circle marker at each bulb cell).
const thermos = [
  wrongLine('thermo R4C2', ['R4C2', 'R4C3'], thermoFails),
  wrongLine('thermo R3C4', ['R3C4', 'R2C4'], thermoFails),
  wrongLine('thermo R1C6', ['R1C6', 'R2C6', 'R2C5'], thermoFails),
];

// Orange (gold) line: drawn as 5 stroke entries, but each consecutive pair
// shares an endpoint (line ends R7C1, next starts R7C1; two lines both end
// R8C7; two lines both end R4C7; two lines both end R4C6; the last starts
// back at R2C2), so the 5 strokes are one closed orange loop, not 5
// independent lines -- the existential ("at least one pair") applies once,
// over the whole loop.
const orangeLoop = [
  'R2C2', 'R3C2', 'R3C1', 'R4C1', 'R5C1', 'R5C2', 'R6C1', 'R7C1',
  'R8C2', 'R8C3', 'R7C4', 'R8C5', 'R8C6', 'R8C7',
  'R7C8', 'R6C7', 'R5C8', 'R5C7', 'R4C7',
  'R4C8', 'R3C8', 'R3C7', 'R3C6', 'R4C6',
  'R4C5', 'R3C4', 'R2C3', 'R2C2',
];
const orangeLines = [wrongLine('orange loop', orangeLoop, orangeFails)];

// Green (yellow-green) lines.
const greenLines = [
  ['R3C3', 'R4C2', 'R5C3'],
  ['R1C4', 'R1C5'],
  ['R4C3', 'R4C4', 'R3C4'],
  ['R3C5', 'R3C6'],
  ['R1C7', 'R2C8', 'R3C9'],
].map((cells, i) => wrongLine(`green ${i}`, cells, greenFails));

// Large circles (black-bordered circles straddling 4 cells at a box
// corner; text read as concatenated quadruple digits, e.g. "39" = {3, 9}).
const largeCircles = [
  [['R1C1', 'R1C2', 'R2C1', 'R2C2'], [6]],
  [['R1C2', 'R1C3', 'R2C2', 'R2C3'], [4]],
  [['R1C5', 'R1C6', 'R2C5', 'R2C6'], [3, 9]],
  [['R2C1', 'R2C2', 'R3C1', 'R3C2'], [4]],
  [['R3C1', 'R3C2', 'R4C1', 'R4C2'], [6, 9]],
  [['R5C2', 'R5C3', 'R6C2', 'R6C3'], [2, 6]],
].flatMap(([cells, digits]) => largeCircleWrong(cells, digits));

// Shaded circles (small filled grey circles, 0.6-cell): must be even. The
// larger filled grey circles (0.7-cell, at R3C4/R1C6/R4C2) are the
// thermometer bulb markers above, not this clue -- the two sizes are
// distinct drawn elements sharing only a colour.
const shadedCircles = ['R1C1', 'R1C4', 'R2C2']
  .map(c => new Given(c, 2, 4, 6, 8));

// V edge (drawn "V" mark on a cell edge).
const vClues = [new Pair(V_KEY, 'wrong V', 'R4C9', 'R5C9')];

// X edges (drawn "X" marks on cell edges).
const xClues = [
  ['R2C3', 'R3C3'], ['R3C1', 'R4C1'], ['R1C3', 'R1C4'], ['R1C6', 'R2C6'],
  ['R1C7', 'R1C8'], ['R4C8', 'R5C8'], ['R5C4', 'R6C4'], ['R7C2', 'R8C2'],
].map(([a, b]) => new Pair(X_KEY, 'wrong X', a, b));

// White dots (small white-fill/black-border edge marks).
const whiteDots = [
  ['R1C1', 'R2C1'], ['R1C1', 'R1C2'], ['R1C2', 'R2C2'], ['R2C2', 'R2C3'],
  ['R1C4', 'R1C5'], ['R1C5', 'R2C5'], ['R2C6', 'R3C6'], ['R2C7', 'R2C8'],
  ['R2C8', 'R2C9'], ['R3C3', 'R3C4'], ['R3C4', 'R4C4'], ['R4C1', 'R4C2'],
  ['R4C2', 'R4C3'], ['R4C3', 'R5C3'], ['R4C4', 'R5C4'], ['R4C4', 'R4C5'],
  ['R4C6', 'R4C7'], ['R5C9', 'R6C9'], ['R6C1', 'R7C1'],
].map(([a, b]) => new Pair(WHITE_DOT_KEY, 'wrong white dot', a, b));

// Black dots (small black-fill/black-border edge marks).
const blackDots = [
  ['R1C3', 'R2C3'], ['R2C4', 'R2C5'], ['R2C7', 'R3C7'], ['R3C3', 'R4C3'],
  ['R4C8', 'R4C9'], ['R5C1', 'R6C1'], ['R6C4', 'R7C4'], ['R7C1', 'R7C2'],
  ['R9C2', 'R9C3'], ['R8C9', 'R9C9'],
].map(([a, b]) => new Pair(BLACK_DOT_KEY, 'wrong black dot', a, b));

// Outside diagonal sums (off-grid diagonal arrow + paired number; each
// diagonal walked in from the entry cell to the far edge).
const outsideDiagonals = [
  [['R1C1'], 4],
  [['R2C1', 'R1C2'], 1],
  [['R3C1', 'R2C2', 'R1C3'], 24],
  [['R4C1', 'R3C2', 'R2C3', 'R1C4'], 15],
  [['R5C1', 'R4C2', 'R3C3', 'R2C4', 'R1C5'], 26],
  [['R6C1', 'R5C2', 'R4C3', 'R3C4', 'R2C5', 'R1C6'], 32],
  [['R7C1', 'R6C2', 'R5C3', 'R4C4', 'R3C5', 'R2C6', 'R1C7'], 13],
  [['R1C9'], 3],
  [['R2C9', 'R1C8'], 75],
  [['R3C9', 'R2C8', 'R1C7'], 18],
  [['R4C9', 'R3C8', 'R2C7', 'R1C6'], 15],
  [['R5C9', 'R4C8', 'R3C7', 'R2C6', 'R1C5'], 7],
  [['R6C9', 'R5C8', 'R4C7', 'R3C6', 'R2C5', 'R1C4'], 11],
  [['R7C9', 'R6C8', 'R5C7', 'R4C6', 'R3C5', 'R2C4', 'R1C3'], 9],
].map(([cells, total], i) => wrongSum(`outside diagonal ${i}`, cells, total));

return [
  new Shape('9x9'),
  ...cages,
  ...arrows,
  ...thermos,
  ...orangeLines,
  ...greenLines,
  ...largeCircles,
  ...shadedCircles,
  ...vClues,
  ...xClues,
  ...whiteDots,
  ...blackDots,
  ...outsideDiagonals,
];
