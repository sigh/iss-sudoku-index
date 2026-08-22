// Title: Two Truths And A Lie
// Author: zetamath
// Video: https://www.youtube.com/watch?v=dDXl-yin5D4
// Source: https://app.crackingthecryptic.com/sudoku/NFhHj2bQ2g

// Normal sudoku rules apply (Shape('9x9') gives rows, columns and the
// default 3x3 boxes for free -- the payload's regions match those boxes).
//
// Twelve standard clue types are drawn, each occurring exactly three times:
// white dots, black dots, arrows, sandwiches, Xs, Vs, thermometers,
// quadruples, odd (grey circle), even (grey square), renban (purple line)
// and German whisper (green line). Within each type exactly two of the
// three drawn instances are fully correct and the third is not fully
// correct (a clue counts as incorrect the moment any part of it fails --
// e.g. a wrong quadruple may still show one of its two digits).
//
// Each clue instance gets a flag Var (1 = correct, 2 = incorrect), globally
// restricted to {1, 2}. Or(And(flag=1, rule), And(flag=2, negation)) then
// ties the flag to whether that instance's own rule actually holds, and
// ContainExact('1_1_2', ...) per type forces exactly two correct and one
// incorrect flag among that type's three clues: each clue needs both its
// rule and its rule's negation. Two-cell edge clues use their named class
// plus Pair.fnToKey for the negation; parity clues (odd/even) need only a
// multi-value Given on each side; the rest (arrow, thermo, whisper, renban,
// quad, sandwich) have no dedicated negated form, so both directions are
// one hand-written NFA.

const shape = new Shape('9x9');

function flagVarGroup(prefix, count) {
  const flags = new Var(prefix, prefix + ' clue flags', count);
  const flagCells = flags.cells();
  return { flags, flagCells };
}

// Ordered 3-cell chain where every adjacent pair must satisfy edgeOk
// (thermometer: strictly increasing; German whisper: differ by >= 5).
// Sequence [flag, c1, c2, c3].
function chainSpec(edgeOk) {
  return NFA.encodeSpec({
    startState: {},
    transition: (state, value) => {
      if (state.flag === undefined) return { flag: value, prev: null, ok: true };
      if (state.prev === null) return { flag: state.flag, prev: value, ok: true };
      return {
        flag: state.flag,
        prev: value,
        ok: state.ok && edgeOk(state.prev, value),
      };
    },
    accept: (state) =>
      (state.flag === 1 && state.ok) || (state.flag === 2 && !state.ok),
  }, 9);
}

// Arrow: bulb + 3 arm cells, arm must sum to the bulb. Sequence
// [flag, bulb, arm1, arm2, arm3]. Sum is clamped at bulb+1 (Bounded Sums):
// once it can only fail it collapses to one sink value instead of growing.
const arrowSpec = NFA.encodeSpec({
  startState: {},
  transition: (state, value) => {
    if (state.flag === undefined) {
      return { flag: value, bulb: null, sum: 0 };
    }
    if (state.bulb === null) {
      return { flag: state.flag, bulb: value, sum: 0 };
    }
    return {
      flag: state.flag,
      bulb: state.bulb,
      sum: Math.min(state.sum + value, state.bulb + 1),
    };
  },
  accept: (state) => {
    const ok = state.sum === state.bulb;
    return (state.flag === 1 && ok) || (state.flag === 2 && !ok);
  },
}, 9);

// Renban: 3 cells form a non-repeating consecutive set, any order.
// Sequence [flag, c1, c2, c3]. Values are kept sorted (order-irrelevant
// state canonicalized) so the small 3-value multiset is the whole state.
// maxDepth caps the otherwise-unbounded `vals` growth at the 4 symbols
// (flag + 3 cells) this spec is ever actually fed.
const renbanSpec = NFA.encodeSpec({
  startState: {},
  transition: (state, value) => {
    if (state.flag === undefined) return { flag: value, vals: [] };
    const vals = [...state.vals, value].sort((a, b) => a - b);
    return { flag: state.flag, vals };
  },
  accept: (state) => {
    if (!state.vals || state.vals.length !== 3) return false;
    const [a, b, c] = state.vals;
    const ok = a !== b && b !== c && (c - a === 2);
    return (state.flag === 1 && ok) || (state.flag === 2 && !ok);
  },
  maxDepth: 4,
}, 9);

// Quadruple: both printed digits (d1, d2) must appear among the 4 window
// cells. Sequence [flag, c1, c2, c3, c4]. One spec per digit pair since the
// target digits are compile-time constants, not scanned values.
function quadSpec(d1, d2) {
  return NFA.encodeSpec({
    startState: {},
    transition: (state, value) => {
      if (state.flag === undefined) {
        return { flag: value, sawD1: false, sawD2: false };
      }
      return {
        flag: state.flag,
        sawD1: state.sawD1 || value === d1,
        sawD2: state.sawD2 || value === d2,
      };
    },
    accept: (state) => {
      const ok = state.sawD1 && state.sawD2;
      return (state.flag === 1 && ok) || (state.flag === 2 && !ok);
    },
  }, 9);
}

// Sandwich: sum strictly between the row/column's 1 and 9 equals K.
// Sequence [flag, ...9 row-or-column cells in order]. Running sum is
// clamped at K+1 once it can only fail. Scan direction does not matter:
// the phase machine treats whichever of {1, 9} appears first as the start
// marker and the other as the end marker.
function sandwichSpec(K) {
  return NFA.encodeSpec({
    startState: {},
    transition: (state, value) => {
      if (state.flag === undefined) {
        return { flag: value, phase: 'searching', sum: 0 };
      }
      if (state.phase === 'searching') {
        if (value === 1 || value === 9) {
          return { flag: state.flag, phase: 'between', sum: 0 };
        }
        return state;
      }
      if (state.phase === 'between') {
        if (value === 1 || value === 9) {
          return { flag: state.flag, phase: 'done', sum: state.sum };
        }
        return {
          flag: state.flag,
          phase: 'between',
          sum: Math.min(state.sum + value, K + 1),
        };
      }
      return state; // phase 'done': absorb the rest of the row/column
    },
    accept: (state) =>
      state.phase === 'done' &&
      ((state.flag === 1 && state.sum === K) ||
        (state.flag === 2 && state.sum !== K)),
  }, 9);
}

// ---- flag-group helpers --------------------------------------------------

// Multi-cell clues with no dedicated negated form: one NFA per instance
// scanning [flag, ...clueCells], accepting iff the flag matches whether the
// clue's own rule holds. `spec` may be one shared spec or a per-instance
// array of specs (quad, sandwich need per-instance specs).
function nfaFlaggedGroup(prefix, spec, instances) {
  const { flags, flagCells } = flagVarGroup(prefix, instances.length);
  return [
    flags,
    ...instances.flatMap((cells, i) => [
      new Given(flagCells[i], 1, 2),
      new NFA(
        Array.isArray(spec) ? spec[i] : spec, prefix, flagCells[i], ...cells),
    ]),
    new ContainExact('1_1_2', ...flagCells),
  ];
}

// Two-cell edge clues with a named positive class: the negation is the
// same relation's complement, applied with Pair.fnToKey.
function pairFlaggedGroup(prefix, ruleClass, negationFn, instances) {
  const { flags, flagCells } = flagVarGroup(prefix, instances.length);
  const negKey = Pair.fnToKey(negationFn, 9);
  return [
    flags,
    ...instances.flatMap(([a, b], i) => [
      new Given(flagCells[i], 1, 2),
      new Or([
        new And([new Given(flagCells[i], 1), new ruleClass(a, b)]),
        new And([new Given(flagCells[i], 2), new Pair(negKey, prefix, a, b)]),
      ]),
    ]),
    new ContainExact('1_1_2', ...flagCells),
  ];
}

// Single-cell parity clues (odd/even): both directions are a plain
// multi-value Given, per the catalog's "no Odd/Even class" guidance.
function parityFlaggedGroup(prefix, oddMeansCorrect, instances) {
  const { flags, flagCells } = flagVarGroup(prefix, instances.length);
  const [correctValues, incorrectValues] = oddMeansCorrect
    ? [[1, 3, 5, 7, 9], [2, 4, 6, 8]]
    : [[2, 4, 6, 8], [1, 3, 5, 7, 9]];
  return [
    flags,
    ...instances.flatMap(([cell], i) => [
      new Given(flagCells[i], 1, 2),
      new Or([
        new And([new Given(flagCells[i], 1), new Given(cell, ...correctValues)]),
        new And([new Given(flagCells[i], 2), new Given(cell, ...incorrectValues)]),
      ]),
    ]),
    new ContainExact('1_1_2', ...flagCells),
  ];
}

// ---- clue geometry (transcribed from the decoded puzzle payload) ------

const whiteDots = [
  ['R7C5', 'R8C5'],
  ['R5C6', 'R5C7'],
  ['R5C3', 'R5C4'],
];
const blackDots = [
  ['R1C4', 'R1C5'],
  ['R1C5', 'R1C6'],
  ['R8C5', 'R9C5'],
];
const xs = [
  ['R3C3', 'R3C4'],
  ['R3C6', 'R3C7'],
  ['R7C8', 'R7C9'],
];
const vs = [
  ['R1C5', 'R2C5'],
  ['R8C8', 'R9C8'],
  ['R8C2', 'R9C2'],
];
const arrows = [
  ['R2C3', 'R1C3', 'R1C2', 'R1C1'],
  ['R2C7', 'R1C7', 'R1C8', 'R1C9'],
  ['R9C5', 'R8C4', 'R7C5', 'R8C6'],
];
const thermos = [
  ['R2C9', 'R3C9', 'R3C8'],
  ['R2C1', 'R3C1', 'R3C2'],
  ['R6C7', 'R5C7', 'R4C7'],
];
const renbans = [
  ['R4C5', 'R5C5', 'R6C5'],
  ['R8C1', 'R8C2', 'R8C3'],
  ['R8C7', 'R8C8', 'R8C9'],
];
const whispers = [
  ['R4C4', 'R5C4', 'R6C4'],
  ['R4C6', 'R5C6', 'R6C6'],
  ['R3C4', 'R3C5', 'R3C6'],
];
const quads = [
  { cells: ['R4C1', 'R4C2', 'R5C1', 'R5C2'], digits: [3, 4] },
  { cells: ['R5C8', 'R5C9', 'R6C8', 'R6C9'], digits: [2, 3] },
  { cells: ['R6C4', 'R6C5', 'R7C4', 'R7C5'], digits: [4, 5] },
];
const odds = [['R1C5'], ['R9C2'], ['R9C8']];
const evens = [['R2C5'], ['R3C4'], ['R3C6']];
// Sandwich rows/columns in natural order, and the printed target sum.
const sandwiches = [
  { cells: ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'], target: 13 },
  { cells: ['R8C1', 'R8C2', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8', 'R8C9'], target: 3 },
  { cells: ['R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9'], target: 24 },
];

return [
  shape,

  ...pairFlaggedGroup('WD', WhiteDot, (a, b) => Math.abs(a - b) !== 1, whiteDots),
  ...pairFlaggedGroup(
    'BD', BlackDot, (a, b) => b !== 2 * a && a !== 2 * b, blackDots),
  ...pairFlaggedGroup('XS', X, (a, b) => a + b !== 10, xs),
  ...pairFlaggedGroup('VS', V, (a, b) => a + b !== 5, vs),
  ...nfaFlaggedGroup('AR', arrowSpec, arrows),
  ...nfaFlaggedGroup('TH', chainSpec((a, b) => a < b), thermos),
  ...nfaFlaggedGroup('RB', renbanSpec, renbans),
  ...nfaFlaggedGroup('GW', chainSpec((a, b) => Math.abs(a - b) >= 5), whispers),
  ...nfaFlaggedGroup('QD', quads.map((q) => quadSpec(q.digits[0], q.digits[1])),
    quads.map((q) => q.cells)),
  ...parityFlaggedGroup('OD', true, odds),
  ...parityFlaggedGroup('EV', false, evens),
  ...nfaFlaggedGroup('SW', sandwiches.map((s) => sandwichSpec(s.target)),
    sandwiches.map((s) => s.cells)),
];
