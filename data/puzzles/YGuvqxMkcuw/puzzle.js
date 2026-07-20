// Title: Double Entendre
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=YGuvqxMkcuw
// Source: https://sudokupad.app/james-sinclair/double-entendre

// VD flags use 1 for an ordinary cell and 2 for a doubler. Each clue's NFA
// independently chooses digit or 2 * digit when it reads a doubler flag.

const graph = cellGraph('9x9');
const flags = graph.makeOverlay('VD');
const gridCells = graph.cells();
const interleaveFlags = (cells) => {
  const clueFlags = flags.at(cells);
  return cells.flatMap((cell, index) => [cell, clueFlags[index]]);
};

const effectiveChoices = (digit, flagValue) => {
  if (flagValue === 1) return [digit];
  if (flagValue === 2) return [digit, 2 * digit];
  return [];
};

const doubledDigitNFA = (digit) => NFA.encodeSpec({
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
  accept: (state) => state.phase === 'digit' && state.count === 1,
}, 9);

// Linear effective-value relations. Each coefficient belongs to one clue cell.
const linearNFA = (coefficients, target) => NFA.encodeSpec({
  startState: { phase: 'digit', index: 0, total: 0 },
  transition: (state, value) => {
    if (state.phase === 'digit') {
      if (state.index >= coefficients.length) return undefined;
      return { ...state, phase: 'flag', digit: value };
    }
    const coefficient = coefficients[state.index];
    return effectiveChoices(state.digit, value).map(effective => ({
      phase: 'digit',
      index: state.index + 1,
      total: state.total + coefficient * effective,
    }));
  },
  accept: (state) => state.phase === 'digit'
    && state.index === coefficients.length
    && state.total === target,
  maxDepth: 2 * coefficients.length,
}, 9);

const pairRelationNFA = (predicate) => NFA.encodeSpec({
  startState: { phase: 'digit', index: 0 },
  transition: (state, value) => {
    if (state.phase === 'digit') {
      if (state.index >= 2) return undefined;
      return { ...state, phase: 'flag', digit: value };
    }
    return effectiveChoices(state.digit, value).flatMap(effective => {
      if (state.index === 0) {
        return [{ phase: 'digit', index: 1, first: effective }];
      }
      return predicate(state.first, effective)
        ? [{ phase: 'digit', index: 2 }]
        : [];
    });
  },
  accept: (state) => state.phase === 'digit' && state.index === 2,
  maxDepth: 4,
}, 9);

const renbanNFA = (length) => NFA.encodeSpec({
  startState: { phase: 'digit', values: [] },
  transition: (state, value) => {
    if (state.phase === 'digit') {
      if (state.values.length >= length) return undefined;
      return { phase: 'flag', values: state.values, digit: value };
    }
    return effectiveChoices(state.digit, value).flatMap(effective => {
      if (state.values.includes(effective)) return [];
      const values = [...state.values, effective].sort((a, b) => a - b);
      if (values.at(-1) - values[0] >= length) return [];
      return [{ phase: 'digit', values }];
    });
  },
  accept: (state) => state.phase === 'digit'
    && state.values.length === length
    && state.values.at(-1) - state.values[0] === length - 1,
  maxDepth: 2 * length,
}, 9);

const flagTargets = flags.at(gridCells);
const flagOrigin = flagTargets[0];

const cages = [
  [10, ['R4C1', 'R4C2']],
  [4, ['R8C6', 'R9C6']],
];

// Bulb first, followed by every arm cell; bulb - arm sum = 0.
const arrows = [
  ['R1C5', 'R1C4', 'R1C3'],
  ['R5C9', 'R6C9', 'R7C9'],
  ['R2C8', 'R3C7', 'R3C6'],
  ['R8C2', 'R8C1', 'R7C2'],
  ['R8C2', 'R9C3', 'R9C4', 'R8C4'],
];

// Each path has two box-delimited segments: first two cells versus the third.
const regionSumLines = [
  ['R1C5', 'R1C4', 'R1C3'],
  ['R5C9', 'R6C9', 'R7C9'],
  ['R2C8', 'R3C7', 'R3C6'],
];

const whispers = [
  ['R7C3', 'R6C4'],
  ['R3C3', 'R4C4'],
  ['R6C6', 'R7C7'],
];

const renbans = [
  ['R7C3', 'R6C4'],
  ['R7C7', 'R6C6'],
  ['R3C3', 'R4C4'],
  ['R6C1', 'R6C2'],
  ['R4C1', 'R4C2'],
  ['R8C6', 'R9C6'],
  ['R9C7', 'R8C8', 'R8C9'],
  ['R1C2', 'R2C1', 'R3C1'],
];

const blackDots = [
  ['R1C8', 'R1C9'],
  ['R9C1', 'R9C2'],
  ['R2C2', 'R2C3'],
];

return [
  new Shape('9x9'),
  flags.toVar('doubler flags'),

  flags.makeReplicate(new Given(flagOrigin, 1, 2), flagTargets),

  // Eight 1s and one 2 sum to 10, enforcing one doubler in each unit.
  ...Array.from({ length: 9 }, (_, r) =>
    new Sum(10, ...flags.at(graph.row(r + 1)))),
  ...Array.from({ length: 9 }, (_, c) =>
    new Sum(10, ...flags.at(graph.column(c + 1)))),
  ...graph.boxes().map(box => new Sum(10, ...flags.at(box))),

  ...Array.from({ length: 9 }, (_, digit) =>
    new NFA(
      doubledDigitNFA(digit + 1),
      `doubled-${digit + 1}`,
      ...interleaveFlags(gridCells),
    )),

  ...cages.map(([total, cells]) => {
    const nfa = linearNFA(cells.map(() => 1), total);
    return new NFA(nfa, `cage-${total}`, ...interleaveFlags(cells));
  }),

  ...arrows.map(cells => {
    const coefficients = [1, ...cells.slice(1).map(() => -1)];
    return new NFA(linearNFA(coefficients, 0), 'arrow-values', ...interleaveFlags(cells));
  }),

  ...regionSumLines.map(cells => {
    return new NFA(linearNFA([1, 1, -1], 0), 'region-sum-values', ...interleaveFlags(cells));
  }),

  ...whispers.map(cells => {
    const nfa = pairRelationNFA((a, b) => Math.abs(a - b) >= 5);
    return new NFA(nfa, 'whisper-values', ...interleaveFlags(cells));
  }),

  ...renbans.map(cells => {
    return new NFA(renbanNFA(cells.length), `renban-${cells.length}`, ...interleaveFlags(cells));
  }),

  ...blackDots.map(cells => {
    const nfa = pairRelationNFA((a, b) => a === 2 * b || b === 2 * a);
    return new NFA(nfa, 'black-dot-values', ...interleaveFlags(cells));
  }),
];
