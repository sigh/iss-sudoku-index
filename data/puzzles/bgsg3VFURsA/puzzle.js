// Title: Befuddlement
// Author: Oddlyeven
// Video: https://www.youtube.com/watch?v=bgsg3VFURsA
// Source: https://sudokupad.app/w6uzuj1m0m

// VD flags use 1 for an ordinary cell and 2 for a doubler. Value-sensitive
// NFAs scan digit/flag pairs and compare digit * flag. This avoids widening
// the ISS alphabet even though a doubled 9 has value 18.

const graph = cellGraph('9x9');
const flags = graph.makeOverlay('VD');
const gridCells = graph.cells();
const flag = cell => flags.at(cell);
const interleaveFlags = cells => {
  const clueFlags = flags.at(cells);
  return cells.flatMap((cell, i) => [cell, clueFlags[i]]);
};

const doubledDigitNFA = digit => NFA.encodeSpec({
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
}, 9);

const effectivePairNFA = (predicate) => NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, firstDigit: value };
    if (state.phase === 1) {
      if (value !== 1 && value !== 2) return undefined;
      return { phase: 2, firstValue: state.firstDigit * value };
    }
    if (state.phase === 2) return { ...state, phase: 3, secondDigit: value };
    if (state.phase === 3) {
      if (value !== 1 && value !== 2) return undefined;
      return predicate(state.firstValue, state.secondDigit * value)
        ? { phase: 4 }
        : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 4,
  maxDepth: 4,
}, 9);

const renbanNFA = length => NFA.encodeSpec({
  startState: { phase: 'digit', values: [] },
  transition: (state, value) => {
    if (state.phase === 'digit') {
      if (state.values.length >= length) return undefined;
      return { phase: 'flag', values: state.values, digit: value };
    }
    if (value !== 1 && value !== 2) return undefined;
    const effective = state.digit * value;
    if (state.values.includes(effective)) return undefined;
    const values = [...state.values, effective].sort((a, b) => a - b);
    if (values.at(-1) - values[0] >= length) return undefined;
    return { phase: 'digit', values };
  },
  accept: state => state.phase === 'digit'
    && state.values.length === length
    && state.values.at(-1) - state.values[0] === length - 1,
  maxDepth: 2 * length,
}, 9);

const unequalValues = effectivePairNFA((a, b) => a !== b);
const whisperValues = effectivePairNFA((a, b) => Math.abs(a - b) >= 5);
const alternatingParity = effectivePairNFA((a, b) => (a & 1) !== (b & 1));
const highValue = Pair.fnToKey(
  (digit, flagValue) => digit * flagValue > 5, graph.gridGeometry());
const lowValue = Pair.fnToKey(
  (digit, flagValue) => digit * flagValue < 5, graph.gridGeometry());

const whisper = [
  'R8C5', 'R9C5', 'R9C4', 'R9C3', 'R9C2', 'R9C1', 'R8C1',
  'R7C1', 'R6C1', 'R6C2', 'R5C2', 'R5C1', 'R6C1',
];
const renbans = [
  ['R1C3', 'R2C3', 'R3C3', 'R4C3'],
  ['R9C8', 'R9C9', 'R8C9'],
  ['R6C5', 'R5C5', 'R5C6'],
];
const parityLines = [
  ['R2C5', 'R3C5', 'R4C5'],
  ['R4C7', 'R4C8', 'R4C9'],
  ['R5C8', 'R6C8'],
  ['R8C7', 'R8C8'],
];
const highCells = ['R1C2', 'R1C8', 'R2C7', 'R2C9'];
const lowCells = ['R2C3', 'R4C1', 'R5C1', 'R8C1'];

const unique = cells => {
  const distinctCells = [...new Set(cells)];
  return distinctCells.flatMap((a, i) => distinctCells.slice(i + 1).map(b =>
    new NFA(unequalValues, 'different values', ...interleaveFlags([a, b]))));
};

const adjacentValuePairs = (cells, encodedNFA, name) => cells.slice(1).map((cell, i) =>
  new NFA(encodedNFA, name, ...interleaveFlags([cells[i], cell])));

const flagTargets = flags.at(gridCells);
const flagOrigin = flagTargets[0];

return [
  new Shape('9x9'),
  flags.toVar('doubler flags'),
  flags.makeReplicate(new Given(flagOrigin, 1, 2), flagTargets),

  // Nine flags sum to 10 exactly when one is 2 and the other eight are 1.
  ...graph.rows().map(row => new Sum(10, ...flags.at(row))),
  ...graph.columns().map(column => new Sum(10, ...flags.at(column))),
  ...graph.boxes().map(box => new Sum(10, ...flags.at(box))),
  ...Array.from({ length: 9 }, (_, i) => new NFA(
    doubledDigitNFA(i + 1), `doubled digit ${i + 1}`, ...interleaveFlags(gridCells))),

  ...adjacentValuePairs(whisper, whisperValues, 'whisper values'),
  ...renbans.map(line => new NFA(
    renbanNFA(line.length), 'renban values', ...interleaveFlags(line))),
  ...parityLines.flatMap(line => adjacentValuePairs(
    line, alternatingParity, 'alternating value parity')),
  ...highCells.map(cell => new Pair(highValue, 'high value', cell, flag(cell))),
  ...lowCells.map(cell => new Pair(lowValue, 'low value', cell, flag(cell))),

  // Value uniqueness is global within each named clue family, not across
  // unrelated families.
  ...unique(whisper),
  ...unique(renbans.flat()),
  ...unique(parityLines.flat()),
  ...unique(highCells),
  ...unique(lowCells),
];
