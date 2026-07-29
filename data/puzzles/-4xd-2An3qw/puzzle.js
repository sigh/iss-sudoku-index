// Title: Foggy Nonsense
// Author: Oddlyeven
// Video: https://www.youtube.com/watch?v=-4xd-2An3qw
// Source: https://sudokupad.app/lvxh3flv0i

// Digits 0-8 fill each row, column, and box. A VD flag of 1 is ordinary and
// 2 is a doubler; every VALUE-based clue below uses digit * flag. Fog of War
// is solving UI, not a final-grid constraint. The unnumbered R1C1-R3C3 cage
// only says its digits do not repeat, which is already the standard box rule.

const graph = cellGraph('9x9');
const flags = graph.makeOverlay('VD');
const cells = graph.cells();
const flag = cell => flags.at(cell);
const interleave = clueCells => clueCells.flatMap(cell => [cell, flag(cell)]);

// One 2 and eight 1s total 10, so every row, column, and box has one doubler.
const placementSums = graph.rowsColumnsBoxes().map(group =>
  new Sum(10, ...flags.at(group)));

// The interleaved scan sees [digit, flag] pairs. One machine for each digit
// makes it occur under a doubler exactly once across the grid.
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
}, 9, { valueOffset: -1 });

// A two-cell scan accepts when their effective values meet one marked XV rule.
const effectivePairSpec = predicate => NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    switch (state.phase) {
      case 0: return { phase: 1, digit: value };
      case 1:
        if (value !== 1 && value !== 2) return undefined;
        return { phase: 2, first: state.digit * value };
      case 2: return { phase: 3, first: state.first, digit: value };
      case 3:
        if (value !== 1 && value !== 2) return undefined;
        return predicate(state.first, state.digit * value) ? { phase: 'done' } : undefined;
      case 'done': return { phase: 'done' };
    }
  },
  accept: state => state.phase === 'done',
}, 9, { valueOffset: -1 });

// This scans a cage's interleaved digit/flag pairs, summing its effective
// values while rejecting a partial sum above the drawn total.
const effectiveCageSpec = target => NFA.encodeSpec({
  startState: { phase: 'digit', sum: 0 },
  transition: (state, value) => {
    if (state.phase === 'digit') return { phase: 'flag', digit: value, sum: state.sum };
    if (value !== 1 && value !== 2) return undefined;
    const sum = state.sum + state.digit * value;
    return sum <= target ? { phase: 'digit', sum } : undefined;
  },
  accept: state => state.phase === 'digit' && state.sum === target,
}, 9, { valueOffset: -1 });

// Cages, provenance: the seven numbered entries in the drawn cages array.
const cages = [
  { cells: ['R1C3', 'R1C4', 'R2C4', 'R2C5', 'R2C6'], total: 21 },
  { cells: ['R3C5', 'R3C6', 'R4C5', 'R4C6'], total: 14 },
  { cells: ['R6C1', 'R6C2', 'R6C3'], total: 12 },
  { cells: ['R7C5', 'R8C5'], total: 11 },
  { cells: ['R9C1', 'R9C2', 'R9C3'], total: 15 },
  { cells: ['R4C7', 'R4C8'], total: 8 },
  { cells: ['R1C7', 'R1C8', 'R1C9', 'R2C8'], total: 13 },
];

// XV marks, provenance: the 14 text overlays on adjacent cell edges.
const xMarks = [
  ['R1C1', 'R1C2'], ['R3C1', 'R3C2'], ['R6C4', 'R7C4'], ['R5C8', 'R5C9'],
  ['R7C9', 'R8C9'], ['R3C3', 'R3C4'], ['R4C2', 'R5C2'], ['R6C5', 'R6C6'],
];
const vMarks = [
  ['R1C1', 'R2C1'], ['R2C2', 'R3C2'], ['R2C3', 'R3C3'], ['R5C3', 'R5C4'],
  ['R8C2', 'R8C3'], ['R6C6', 'R6C7'],
];

return [
  new Shape('9x9', '0-8'),
  flags.toVar('doubler flags'),
  flags.makeReplicate(new Given(flag(cells[0]), 1, 2), flags.at(cells)),
  ...placementSums,
  ...Array.from({ length: 9 }, (_, digit) =>
    new NFA(doubledDigitSpec(digit), `doubled-digit-${digit}`, ...interleave(cells))),
  ...cages.flatMap(({ cells: cageCells, total }) => [
    new AllDifferent(...cageCells),
    new NFA(effectiveCageSpec(total), `cage-sum-${total}`, ...interleave(cageCells)),
  ]),
  ...xMarks.map(pair => new NFA(effectivePairSpec((a, b) => a + b === 10),
    'X-value-sum-10', ...interleave(pair))),
  ...vMarks.map(pair => new NFA(effectivePairSpec((a, b) => a + b === 5),
    'V-value-sum-5', ...interleave(pair))),
];
