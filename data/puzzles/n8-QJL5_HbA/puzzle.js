// Title: Liar Spiral
// Author: Niverio
// Video: https://www.youtube.com/watch?v=n8-QJL5_HbA
// Source: https://app.crackingthecryptic.com/sudoku/8hNMDjTnbM

// Normal sudoku rules apply. Twelve clue types are drawn (arrow, black dot,
// grey square, green line, outside "numbered room" clue, grey circle, white
// circle, purple line, thermometer, V, white dot, X); each type has exactly
// one liar somewhere among its own drawn instances -- an instance whose
// stated rule is violated -- and every other instance of that type is true:
// - arrow: digits along the shaft sum to the digit in the circle.
// - black dot: adjacent digits are in a 2:1 ratio.
// - grey square: the cell holds an even digit.
// - green line: adjacent digits differ by at least 5.
// - outside clue: let N be the digit in the cell nearest the clue; the
//   printed number equals the digit N cells in from there.
// - grey circle: the cell holds an odd digit.
// - white circle: every digit printed in the circle appears in at least one
//   of its four surrounding cells (both digits must hold for the circle to
//   be truthful).
// - purple line: the line's digits form a set of consecutive integers.
// - thermometer: digits strictly increase from the bulb.
// - V: adjacent digits sum to 5.
// - white dot: adjacent digits are consecutive.
// - X: adjacent digits sum to 10.
//
// Each instance gets its own truthful/liar flag Var (1 = truthful,
// 2 = liar): Or(And(flag=1, <rule>), And(flag=2, <negated rule>)). One
// ContainExact('2', ...flags) per type forces exactly one liar within that
// type -- counts are never pooled across types, matching "each of the
// following clue types has exactly one liar".

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

const ALL = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const ODD = [1, 3, 5, 7, 9];
const EVEN = [2, 4, 6, 8];
const without = (d) => ALL.filter(v => v !== d);

// Adjacent (list-order) pairs of a cell path.
const pairs = (cells) => cells.slice(0, -1).map((c, i) => [c, cells[i + 1]]);

// One flag Var per instance of a clue type. Wraps each instance's rule and
// negated rule behind the flag, and forces exactly one liar within the type.
function liarGroup(prefix, label, items, buildPos, buildNeg) {
  const flagVar = new Var(prefix, label, items.length);
  const flags = flagVar.cells();
  const rules = items.map((item, i) => new Or([
    new And([new Given(flags[i], 1), buildPos(item)]),
    new And([new Given(flags[i], 2), buildNeg(item)]),
  ]));
  return [
    flagVar,
    ...flags.map(f => new Given(f, 1, 2)),
    ...rules,
    new ContainExact('2', ...flags),
  ];
}

// ---- Arrows: shaft digits sum to the circle (control cell). Transcribed
// from the drawn arrows (circle end first, then the shaft in path order).
const arrows = [
  { control: 'R2C1', arms: ['R1C1', 'R1C2', 'R1C3'] },
  { control: 'R8C9', arms: ['R9C9', 'R9C8', 'R9C7'] },
  { control: 'R9C2', arms: ['R9C1', 'R8C1', 'R7C1'] },
  { control: 'R1C8', arms: ['R1C9', 'R2C9', 'R3C9'] },
];
// Negation: an NFA over [control, ...arms] carries the arm running sum
// against the control digit (captured as the first symbol read) and accepts
// when they differ at the end. Sum is clamped at target+1 (a "already too
// big to ever match" sink) so the compiled state space stays finite -- the
// compiler explores the transition graph without knowing the arm count is
// fixed at 3.
function arrowSumFails(item) {
  const spec = NFA.encodeSpec({
    startState: null,
    transition: (state, value) => state === null
      ? { target: value, sum: 0 }
      : { target: state.target, sum: Math.min(state.sum + value, state.target + 1) },
    accept: (state) => state !== null && state.sum !== state.target,
  }, 9);
  return new NFA(spec, 'arrow sum mismatch', item.control, ...item.arms);
}
const arrowConstraints = liarGroup(
  'LARR', 'arrow liar flags', arrows,
  (item) => new Arrow(item.control, ...item.arms),
  arrowSumFails,
);

// ---- Black dots (2:1 ratio). One sits on the purple line R8C7-R8C8-R7C8's
// first edge; the other is a standalone dot.
const blackDots = [['R8C7', 'R8C8'], ['R6C9', 'R7C9']];
const notRatioKey = Pair.fnToKey((a, b) => !(a === 2 * b || b === 2 * a), 9);
const blackDotConstraints = liarGroup(
  'LBLK', 'black dot liar flags', blackDots,
  ([a, b]) => new BlackDot(a, b),
  ([a, b]) => new Pair(notRatioKey, 'BlackDotFail', a, b),
);

// ---- Grey squares (even digit), from the drawn grey square underlays.
const greySquares = ['R4C3', 'R6C7', 'R7C4', 'R3C6'];
const evenConstraints = liarGroup(
  'LEVN', 'grey square liar flags', greySquares,
  (cell) => new Given(cell, ...EVEN),
  (cell) => new Given(cell, ...ODD),
);

// ---- Grey circles (odd digit), from the drawn grey circle underlays --
// distinct from the smaller grey thermometer-bulb circles and from the
// white/grey-bordered arrow bulbs.
const greyCircles = ['R3C4', 'R4C7', 'R7C6', 'R6C3'];
const oddConstraints = liarGroup(
  'LODD', 'grey circle liar flags', greyCircles,
  (cell) => new Given(cell, ...ODD),
  (cell) => new Given(cell, ...EVEN),
);

// ---- Green lines (adjacent digits differ by >= 5). Both lines are also an
// arrow's shaft; the arrow and green-line liar flags are independent.
const greenLines = [
  ['R1C1', 'R1C2', 'R1C3'],
  ['R9C7', 'R9C8', 'R9C9'],
];
const notDiff5Key = Pair.fnToKey((a, b) => Math.abs(a - b) < 5, 9);
const whisperConstraints = liarGroup(
  'LWHS', 'green line liar flags', greenLines,
  (cells) => new Whisper(5, ...cells),
  (cells) => new Or(pairs(cells).map(([a, b]) =>
    new Pair(notDiff5Key, 'GreenLineFail', a, b))),
);

// ---- Purple lines (digits form a set of consecutive integers). Each
// line's 3 cells already share a row, column or box (verified per line), so
// ordinary sudoku already forces them distinct; the negation is therefore a
// span-only test, via an NFA carrying the running (min, max).
const purpleLines = [
  ['R1C9', 'R2C9', 'R3C9'],
  ['R7C1', 'R8C1', 'R9C1'],
  ['R3C2', 'R2C2', 'R2C3'],
  ['R8C7', 'R8C8', 'R7C8'],
];
function spanNotTwo(cells) {
  const spec = NFA.encodeSpec({
    startState: null,
    transition: (state, value) => state === null
      ? { min: value, max: value }
      : { min: Math.min(state.min, value), max: Math.max(state.max, value) },
    accept: (state) => state !== null && (state.max - state.min) !== 2,
  }, 9);
  return new NFA(spec, 'purple span != 2', ...cells);
}
const renbanConstraints = liarGroup(
  'LREN', 'purple line liar flags', purpleLines,
  (cells) => new Renban(...cells),
  spanNotTwo,
);

// ---- Thermometers (strictly increasing from the bulb, listed first). Each
// thermometer's 3 cells already share a row/column and a box, so equal
// adjacent digits cannot occur; failing to increase on an edge is exactly
// GreaterThan the wrong way on that edge.
const thermometers = [
  ['R2C7', 'R2C8', 'R3C8'],
  ['R8C3', 'R8C2', 'R7C2'],
];
const thermoConstraints = liarGroup(
  'LTHM', 'thermometer liar flags', thermometers,
  (cells) => new Thermo(...cells),
  (cells) => new Or(pairs(cells).map(([a, b]) => new GreaterThan(a, b))),
);

// ---- V (adjacent digits sum to 5).
const vClues = [['R3C1', 'R4C1'], ['R9C3', 'R9C4']];
const notSum5Key = Pair.fnToKey((a, b) => a + b !== 5, 9);
const vConstraints = liarGroup(
  'LVEE', 'V liar flags', vClues,
  ([a, b]) => new V(a, b),
  ([a, b]) => new Pair(notSum5Key, 'VFail', a, b),
);

// ---- X (adjacent digits sum to 10). One sits on the purple line
// R3C2-R2C2-R2C3's second edge; the rest are standalone.
const xClues = [
  ['R1C4', 'R1C5'], ['R4C9', 'R5C9'], ['R9C5', 'R9C6'],
  ['R5C1', 'R6C1'], ['R2C2', 'R2C3'],
];
const notSum10Key = Pair.fnToKey((a, b) => a + b !== 10, 9);
const xConstraints = liarGroup(
  'LTEN', 'X liar flags', xClues,
  ([a, b]) => new X(a, b),
  ([a, b]) => new Pair(notSum10Key, 'XFail', a, b),
);

// ---- White dots (adjacent digits consecutive). Two sit on the two
// thermometers' second edges; one is standalone.
const whiteDots = [['R1C6', 'R1C7'], ['R2C8', 'R3C8'], ['R7C2', 'R8C2']];
const notConsecKey = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);
const whiteDotConstraints = liarGroup(
  'LWHD', 'white dot liar flags', whiteDots,
  ([a, b]) => new WhiteDot(a, b),
  ([a, b]) => new Pair(notConsecKey, 'WhiteDotFail', a, b),
);

// ---- White circles: every printed digit must appear in >= 1 of the 4
// surrounding cells for the circle to be truthful; failing on either digit
// makes it the liar. Transcribed from the two-digit circle overlays.
const whiteCircles = [
  { digits: [6, 8], cells: ['R3C3', 'R3C4', 'R4C3', 'R4C4'] },
  { digits: [1, 8], cells: ['R3C6', 'R3C7', 'R4C6', 'R4C7'] },
  { digits: [1, 3], cells: ['R6C3', 'R6C4', 'R7C3', 'R7C4'] },
  { digits: [3, 6], cells: ['R6C6', 'R6C7', 'R7C6', 'R7C7'] },
];
const digitAbsent = (cells, d) => new And(cells.map(c => new Given(c, ...without(d))));
const whiteCircleConstraints = liarGroup(
  'LWCI', 'white circle liar flags', whiteCircles,
  (item) => new Quad(item.cells[0], ...item.digits),
  (item) => new Or(item.digits.map(d => digitAbsent(item.cells, d))),
);

// ---- Outside "numbered room" clues: let N be the digit in the cell
// nearest the clue; the printed value equals the digit N cells in from
// there. All three clues sit below the grid, so the ray runs upward from
// row 9 (matches NumberedRoom's own dir=-1 cell ordering).
const outsideClues = [
  { value: 1, ray: graph.ray('R9C2', -1, 0) },
  { value: 1, ray: graph.ray('R9C5', -1, 0) },
  { value: 1, ray: graph.ray('R9C8', -1, 0) },
];
// For N=1 the "Nth cell" the rule points at is the first cell itself, so a
// naive And of two Givens on that one cell would self-intersect (dropped
// live only when N itself already differs from the printed value).
function outsideClueLiarBranch(item, n) {
  const firstCell = item.ray[0];
  const nthCell = item.ray[n - 1];
  if (nthCell === firstCell) {
    return n === item.value ? null : new Given(firstCell, n);
  }
  return new And([
    new Given(firstCell, n),
    new Given(nthCell, ...without(item.value)),
  ]);
}
const outsideConstraints = liarGroup(
  'LOUT', 'outside clue liar flags', outsideClues,
  (item) => NumberedRoom.fromCells(item.value, item.ray, geometry),
  (item) => new Or(ALL.map(n => outsideClueLiarBranch(item, n)).filter(Boolean)),
);

return [
  new Shape('9x9'),
  ...arrowConstraints,
  ...blackDotConstraints,
  ...evenConstraints,
  ...oddConstraints,
  ...whisperConstraints,
  ...renbanConstraints,
  ...thermoConstraints,
  ...vConstraints,
  ...xConstraints,
  ...whiteDotConstraints,
  ...whiteCircleConstraints,
  ...outsideConstraints,
];
