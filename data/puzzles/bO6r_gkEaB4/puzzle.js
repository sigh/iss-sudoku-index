// Title: Deja Vu Part 1: Doublers
// Author: Scojo
// Video: https://www.youtube.com/watch?v=bO6r_gkEaB4
// Source: https://sudokupad.app/pnyv6sn7qm

// VD is a parallel flag layer: 1 means an ordinary cell and 2 means a
// Doubler. Every value-sensitive constraint scans grid digit / VD flag pairs
// and uses digit * flag as the cell's effective value.

const graph = cellGraph('6x6');
const flags = graph.makeOverlay('VD');
const cells = graph.cells();
const flag = cell => flags.at(cell);
const interleave = clueCells => clueCells.flatMap(cell => [cell, flag(cell)]);

const doubledDigitSpec = digit => NFA.encodeSpec({
  startState: { phase: 'digit', count: 0 },
  transition: (state, value) => {
    if (state.phase === 'digit') {
      return { phase: 'flag', digit: value, count: state.count };
    }
    if (value !== 1 && value !== 2) return undefined;
    const count = state.count + (state.digit === digit && value === 2 ? 1 : 0);
    if (count > 1) return undefined;
    return { phase: 'digit', count };
  },
  accept: state => state.phase === 'digit' && state.count === 1,
}, 6);

const effectivePairSpec = predicate => NFA.encodeSpec({
  startState: { phase: 'first-digit' },
  transition: (state, value) => {
    if (state.phase === 'first-digit') {
      return { phase: 'first-flag', digit: value };
    }
    if (state.phase === 'first-flag') {
      if (value !== 1 && value !== 2) return undefined;
      return { phase: 'second-digit', first: state.digit * value };
    }
    if (state.phase === 'second-digit') {
      return { phase: 'second-flag', first: state.first, digit: value };
    }
    if (state.phase === 'second-flag') {
      if (value !== 1 && value !== 2) return undefined;
      return predicate(state.first, state.digit * value) ? { phase: 'done' } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 'done',
}, 6);

const renbanSpec = NFA.encodeSpec({
  startState: { phase: 'digit', values: [] },
  transition: (state, value) => {
    if (state.phase === 'digit') {
      return { phase: 'flag', digit: value, values: state.values };
    }
    if (value !== 1 && value !== 2) return undefined;
    const effective = state.digit * value;
    if (state.values.includes(effective)) return undefined;
    const values = [...state.values, effective].sort((a, b) => a - b);
    if (values.length > 3 || values.at(-1) - values[0] >= 3) return undefined;
    return { phase: 'digit', values };
  },
  accept: state => state.phase === 'digit'
    && state.values.length === 3
    && state.values[2] - state.values[0] === 2,
  maxDepth: 6,
}, 6);

// The Region Sum Line crosses four box segments of lengths 1, 1, 3, 1.
// Its first one-cell segment fixes the target sum. The later segments must
// respectively equal that value, total it, and equal it again.
const regionSumSpec = NFA.encodeSpec({
  startState: { index: 0, phase: 'digit', target: 0, middle: 0 },
  transition: (state, value) => {
    if (state.phase === 'digit') {
      return { ...state, phase: 'flag', digit: value };
    }
    if (value !== 1 && value !== 2) return undefined;
    const effective = state.digit * value;
    if (state.index === 0) {
      return { index: 1, phase: 'digit', target: effective, middle: 0 };
    }
    if (state.index === 1 && effective !== state.target) return undefined;
    if (state.index >= 2 && state.index <= 4) {
      const middle = state.middle + effective;
      if (middle > state.target) return undefined;
      return { index: state.index + 1, phase: 'digit', target: state.target, middle };
    }
    if (state.index === 5) {
      if (state.middle !== state.target || effective !== state.target) return undefined;
      return { index: 6, phase: 'done', target: state.target, middle: state.middle };
    }
    return { index: 2, phase: 'digit', target: state.target, middle: 0 };
  },
  accept: state => state.phase === 'done' && state.index === 6,
  maxDepth: 12,
}, 6);

const containsTwoSpec = NFA.encodeSpec({
  startState: { phase: 'digit', found: false },
  transition: (state, value) => {
    if (state.phase === 'digit') {
      return { phase: 'flag', digit: value, found: state.found };
    }
    if (value !== 1 && value !== 2) return undefined;
    return { phase: 'digit', found: state.found || state.digit * value === 2 };
  },
  accept: state => state.phase === 'digit' && state.found,
}, 6);

const consecutiveSpec = effectivePairSpec((a, b) => Math.abs(a - b) === 1);
const ratioSpec = effectivePairSpec((a, b) => a === 2 * b || b === 2 * a);
const vSpec = effectivePairSpec((a, b) => a + b === 5);
const nabnerSpec = effectivePairSpec((a, b) => Math.abs(a - b) >= 2);
const thermoSpec = effectivePairSpec((bulb, tip) => tip > bulb);

const regionSumLine = ['R3C3', 'R2C4', 'R3C4', 'R3C5', 'R4C5', 'R5C6'];
const renban = ['R3C2', 'R4C3', 'R5C4'];

return [
  new Shape('6x6'),
  flags.toVar('doubler flags'),
  flags.makeReplicate(new Given(flag(cells[0]), 1, 2), flags.at(cells)),

  // Six flags sum to 7 exactly when one cell in the group is doubled.
  ...graph.rows().map(row => new Sum(7, ...flags.at(row))),
  ...graph.columns().map(column => new Sum(7, ...flags.at(column))),
  ...graph.boxes().map(box => new Sum(7, ...flags.at(box))),

  // The six Doubler cells contain different digits: each digit 1-6 occurs
  // exactly once beneath a flag of 2.
  ...Array.from({ length: 6 }, (_, i) => new NFA(
    doubledDigitSpec(i + 1), `doubled digit ${i + 1}`, ...interleave(cells))),

  new NFA(regionSumSpec, 'region sum values', ...interleave(regionSumLine)),
  new NFA(renbanSpec, 'renban values', ...interleave(renban)),
  new NFA(nabnerSpec, 'nabner values', ...interleave(['R1C4', 'R1C5'])),
  new NFA(thermoSpec, 'thermo values', ...interleave(['R1C1', 'R1C2'])),
  new NFA(consecutiveSpec, 'white dot values', ...interleave(['R1C6', 'R2C6'])),
  new NFA(ratioSpec, 'black dot values', ...interleave(['R3C2', 'R3C3'])),
  new NFA(ratioSpec, 'black dot values', ...interleave(['R5C5', 'R6C5'])),
  new NFA(vSpec, 'V values', ...interleave(['R1C3', 'R1C4'])),
  new NFA(
    containsTwoSpec,
    'quadruple value 2',
    ...interleave(['R1C1', 'R1C2', 'R2C1', 'R2C2']),
  ),
];
