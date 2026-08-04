// Title: Modifier Mystery
// Author: Mnasti2
// Video: https://www.youtube.com/watch?v=lKgilSm14-g
// Source: https://app.crackingthecryptic.com/sudoku/B44HPbbdfn

// Normal sudoku rules apply. One cell in each row, column, and box holds a
// modifier (9 modifier cells total); their nine digits are all different, so
// each of the digits 1-9 is modified exactly once. Four modifiers double
// their cell's digit, four increase it by 1, and one ("broken") leaves it
// unchanged. Every clue type below except normal sudoku (the dots, V, the
// grey-square parity check, the cage, the arrow, the thermometer, and the
// green/orange/purple lines) reads each cell's *effective* value -- its raw
// digit transformed by that cell's modifier, if any -- rather than the raw
// digit. Row/column/box all-different and the given both use raw digits.
// Which cells hold a modifier, and which effect each has, is solver-deduced
// state, not drawn -- that is the "mystery" the title names.
//
// Role state per cell (Var overlay 'VR'): 1 = none, 2 = doubler, 3 = +1,
// 4 = broken. Chosen arbitrarily; only used internally by the NFAs below.

const graph = cellGraph('9x9');
const cells = graph.cells();
const roles = graph.makeOverlay('VR');
const role = cell => roles.at(cell);

const NONE = 1, DOUBLE = 2, PLUS = 3, BROKEN = 4;

const roleDomain = roles.makeReplicate(new Given(role(cells[0]), NONE, DOUBLE, PLUS, BROKEN));

// ---- Placement: exactly one modifier cell (role != NONE) per row, column,
// and box. The role of that one cell varies, so this is a small NFA (count
// of non-NONE roles among the 9 cells == 1) rather than a fixed-multiset
// ContainExact.
const oneModifierSpec = NFA.encodeSpec({
  startState: { count: 0 },
  transition(state, value) {
    const count = state.count + (value === NONE ? 0 : 1);
    return count > 1 ? undefined : { count };
  },
  accept: state => state.count === 1,
}, 9);
const placement = [
  ...graph.rows(),
  ...graph.columns(),
  ...graph.boxes(),
].map(houseCells => new NFA(oneModifierSpec, 'one modifier', ...roles.at(houseCells)));

// ---- Global role counts: four doublers, four +1's, one broken -- 9
// modifier cells total, matching the 9 per-house placements above.
const roleCounts = new ContainExact(
  [DOUBLE, DOUBLE, DOUBLE, DOUBLE, PLUS, PLUS, PLUS, PLUS, BROKEN].join('_'),
  ...roles.at(cells));

// ---- Selector NFA: given a row (exactly one modifier cell, by `placement`
// above), pin an aux Var to that cell's digit. Scans [digit1, role1, digit2,
// role2, ...]; the first non-NONE role seen must carry a digit equal to the
// aux Var.
const modifierDigitSelectorSpec = NFA.encodeSpec({
  startState: { stage: 'target' },
  transition(state, value) {
    if (state.stage === 'target') return { stage: 'digit', target: value, found: false };
    if (state.stage === 'digit') return { ...state, stage: 'role', pending: value };
    // state.stage === 'role'
    if (value === NONE) return { stage: 'digit', target: state.target, found: state.found };
    if (state.found || state.pending !== state.target) return undefined;
    return { stage: 'digit', target: state.target, found: true };
  },
  accept: (state) => state.stage === 'digit' && state.found,
}, 9);
const selectorScan = houseCells => houseCells.flatMap(cell => [cell, role(cell)]);

const modifierDigitByRow = new Var('VM', 'digit of the row modifier cell', 9);
const rowSelectors = graph.rows().map((rowCells, i) =>
  new NFA(modifierDigitSelectorSpec, 'row modifier digit',
    modifierDigitByRow.cell(i + 1), ...selectorScan(rowCells)));

// "Each of the digits 1-9 is modified once": the 9 row-modifier digits form
// a set of 1-9 (9 distinct values in a 1-9 domain is exactly that set).
const modifiedDigitsAllDifferent = new AllDifferent(
  ...Array.from({ length: 9 }, (_, i) => modifierDigitByRow.cell(i + 1)));

// ---- Effective value: raw digit, doubled, +1'd, or unchanged (NONE or
// BROKEN both leave it as-is -- a broken modifier still occupies the cell
// for placement/counting purposes, but has no numeric effect).
function effectiveValue(digit, roleVal) {
  if (roleVal === DOUBLE) return digit * 2;
  if (roleVal === PLUS) return digit + 1;
  return digit;
}
const stream = clueCells => clueCells.flatMap(cell => [cell, role(cell)]);

// ---- Grey square: the single cell's own effective value is even. Only two
// Var cells (the grid cell and its own role overlay cell) are involved, so
// this is a plain Pair rather than an NFA.
const evenEffectiveKey = Pair.fnToKey((digit, roleVal) => effectiveValue(digit, roleVal) % 2 === 0, 9);
// Drawn grey squares (underlay marks).
const GREY_EVEN_CELLS = ['R4C7', 'R4C8', 'R4C9'];
const greyEven = GREY_EVEN_CELLS.map(cell => new Pair(evenEffectiveKey, 'grey even', cell, role(cell)));

// ---- Two-cell effective-value relations (dots, V): scans [digitA, roleA,
// digitB, roleB] and applies `predicate` to the two effective values.
function pairSpec(predicate) {
  return NFA.encodeSpec({
    startState: { stage: 0 },
    transition(state, value) {
      if (state.stage === 0) return { stage: 1, digitA: value };
      if (state.stage === 1) return { stage: 2, digitA: state.digitA, roleA: value };
      if (state.stage === 2) return { stage: 3, digitA: state.digitA, roleA: state.roleA, digitB: value };
      // state.stage === 3: value is roleB.
      const effA = effectiveValue(state.digitA, state.roleA);
      const effB = effectiveValue(state.digitB, value);
      return predicate(effA, effB) ? { stage: 4 } : undefined;
    },
    accept: state => state.stage === 4,
  }, 9);
}
const consecutiveSpec = pairSpec((a, b) => Math.abs(a - b) === 1);
const ratioSpec = pairSpec((a, b) => a === 2 * b || b === 2 * a);
const vSumSpec = pairSpec((a, b) => a + b === 5);

// Drawn dot edges (overlay marks): fill white = consecutive,
// fill black = ratio 1:2.
const WHITE_DOTS = [['R4C1', 'R5C1']];
const BLACK_DOTS = [['R1C1', 'R2C1'], ['R2C1', 'R3C1'], ['R6C1', 'R7C1'], ['R7C1', 'R8C1']];
const V_PAIRS = [['R7C7', 'R8C7'], ['R9C8', 'R9C9']];

// ---- Effective-value sum, for a fixed total: scans [digit1, role1, digit2,
// role2, ...] and accumulates effective values, rejecting early once the
// running sum exceeds the total.
const sumCache = new Map();
function effectiveSumSpec(total) {
  if (sumCache.has(total)) return sumCache.get(total);
  const spec = NFA.encodeSpec({
    startState: { phase: 0, digit: 0, sum: 0 },
    transition: (state, value) => {
      if (state.phase === 0) return { phase: 1, digit: value, sum: state.sum };
      const sum = state.sum + effectiveValue(state.digit, value);
      return sum > total ? undefined : { phase: 0, digit: 0, sum };
    },
    accept: state => state.phase === 0 && state.sum === total,
  }, 9);
  sumCache.set(total, spec);
  return spec;
}
// Drawn cage.
const CAGE_CELLS = ['R5C3', 'R6C3'];
const CAGE_TOTAL = 18;

// ---- Arrow: [circle, ...arms]. The circle is named under the same "Arrow"
// clue-type sentence as the line cells, so its own reading is modified too
// (not just compared against as a plain digit) -- the circle's reading is
// lifted the same way as an arm cell's. Scans
// [digitCircle, roleCircle, digitArm1, roleArm1, ...]; the circle's
// effective value seeds `remaining`, each arm's effective value is
// subtracted, and `remaining` must land on exactly 0.
function effectiveArrowSpec(length) {
  return NFA.encodeSpec({
    startState: { phase: 0, digit: 0, position: 0, remaining: 0 },
    transition: (state, value) => {
      if (state.phase === 0) return { ...state, phase: 1, digit: value };
      const contribution = effectiveValue(state.digit, value);
      const remaining = state.position === 0 ? contribution : state.remaining - contribution;
      if (remaining < 0) return undefined;
      return { phase: 0, digit: 0, position: state.position + 1, remaining };
    },
    accept: state => state.phase === 0 && state.position === length && state.remaining === 0,
    maxDepth: length * 2,
  }, 9);
}
// Drawn arrow: circle at the bulb, arm
// cells to the arrowhead.
const ARROW_CIRCLE = 'R9C5';
const ARROW_ARMS = ['R8C4', 'R7C4', 'R6C4', 'R5C5'];

// ---- Thermometer: strictly increasing effective values from bulb to tip.
function effectiveThermoSpec(length) {
  return NFA.encodeSpec({
    startState: { phase: 0, digit: 0, prev: null },
    transition: (state, value) => {
      if (state.phase === 0) return { ...state, phase: 1, digit: value };
      const eff = effectiveValue(state.digit, value);
      if (state.prev !== null && eff <= state.prev) return undefined;
      return { phase: 0, digit: 0, prev: eff };
    },
    accept: state => state.phase === 0,
    maxDepth: length * 2,
  }, 9);
}
// Drawn thermometer: bulb R3C4, tip R4C6.
const THERMO_CELLS = ['R3C4', 'R2C5', 'R3C5', 'R4C6'];

// ---- Green line: neighbouring effective values differ by at least 5.
function effectiveMinDiffSpec(minDiff, length) {
  return NFA.encodeSpec({
    startState: { phase: 0, digit: 0, prev: null },
    transition: (state, value) => {
      if (state.phase === 0) return { ...state, phase: 1, digit: value };
      const eff = effectiveValue(state.digit, value);
      if (state.prev !== null && Math.abs(eff - state.prev) < minDiff) return undefined;
      return { phase: 0, digit: 0, prev: eff };
    },
    accept: state => state.phase === 0,
    maxDepth: length * 2,
  }, 9);
}
// Drawn green line: the whole of row 1.
const GREEN_LINE_CELLS = graph.row(1);

// ---- Orange line: palindrome over effective values. Only the first `half`
// effective values need to be remembered; each later cell is checked
// against its mirror as it arrives.
function effectivePalindromeSpec(length) {
  const half = Math.floor(length / 2);
  return NFA.encodeSpec({
    startState: { phase: 0, digit: 0, index: 0, values: [] },
    transition: (state, value) => {
      if (state.phase === 0) return { ...state, phase: 1, digit: value };
      const eff = effectiveValue(state.digit, value);
      const index = state.index;
      let values = state.values;
      if (index < half) {
        values = [...values, eff];
      } else if (index >= length - half && values[length - 1 - index] !== eff) {
        return undefined;
      }
      return { phase: 0, digit: 0, index: index + 1, values };
    },
    accept: state => state.phase === 0 && state.index === length,
    maxDepth: length * 2,
  }, 9);
}
// Drawn orange line.
const ORANGE_LINE_CELLS = ['R2C2', 'R2C3', 'R2C4'];

// ---- Purple line: effective values form a set of consecutive integers (all
// distinct, max - min == length - 1), in any order -- a bitmask "seen" set
// widened for an effective range up to 18 (a doubled 9).
function effectiveRenbanSpec(length) {
  return NFA.encodeSpec({
    startState: { phase: 0, digit: 0, count: 0, min: 99, max: 0, seen: 0 },
    transition: (state, value) => {
      if (state.phase === 0) return { ...state, phase: 1, digit: value };
      const eff = effectiveValue(state.digit, value);
      const bit = 1 << eff;
      if (state.seen & bit) return undefined;
      const count = state.count + 1;
      const min = Math.min(state.min, eff);
      const max = Math.max(state.max, eff);
      if (count > length || max - min >= length) return undefined;
      return { phase: 0, digit: 0, count, min, max, seen: state.seen | bit };
    },
    accept: state => state.phase === 0 && state.count === length && state.max - state.min === length - 1,
    maxDepth: length * 2,
  }, 9);
}
// Drawn purple line.
const PURPLE_LINE_CELLS = ['R5C8', 'R6C9', 'R6C8', 'R6C7'];

return [
  new Shape('9x9'),
  new Given('R4C6', 4),

  roles.toVar('modifier role'),
  modifierDigitByRow,
  roleDomain,
  ...placement,
  roleCounts,
  ...rowSelectors,
  modifiedDigitsAllDifferent,

  ...greyEven,
  ...WHITE_DOTS.map(pair => new NFA(consecutiveSpec, 'white dot', ...stream(pair))),
  ...BLACK_DOTS.map(pair => new NFA(ratioSpec, 'black dot', ...stream(pair))),
  ...V_PAIRS.map(pair => new NFA(vSumSpec, 'V sum', ...stream(pair))),
  new NFA(effectiveSumSpec(CAGE_TOTAL), 'cage', ...stream(CAGE_CELLS)),
  new NFA(effectiveArrowSpec(ARROW_ARMS.length + 1), 'arrow',
    ...stream([ARROW_CIRCLE, ...ARROW_ARMS])),
  new NFA(effectiveThermoSpec(THERMO_CELLS.length), 'thermometer', ...stream(THERMO_CELLS)),
  new NFA(effectiveMinDiffSpec(5, GREEN_LINE_CELLS.length), 'green line', ...stream(GREEN_LINE_CELLS)),
  new NFA(effectivePalindromeSpec(ORANGE_LINE_CELLS.length), 'orange palindrome', ...stream(ORANGE_LINE_CELLS)),
  new NFA(effectiveRenbanSpec(PURPLE_LINE_CELLS.length), 'purple renban', ...stream(PURPLE_LINE_CELLS)),
];
