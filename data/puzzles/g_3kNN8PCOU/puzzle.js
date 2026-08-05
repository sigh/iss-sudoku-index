// Title: Nothing Is Wrogn
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=g_3kNN8PCOU
// Source: https://app.crackingthecryptic.com/sudoku/MfTr4pRMgF

// Digits 0-8 occur once in each row, column, and 3x3 box. A clue is normal
// exactly when none of its cells is 0; a clue containing 0 violates its normal rule.
const shape = new Shape('9x9', '0-8');
const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

const zeroFree = cells => cells.map(cell => new Given(cell, ...range(1, 8)));
const hasZero = cells => new Or(cells.map(cell => new Given(cell, 0)));

// These automata retain whether their ordinary line rule has held and whether a
// 0 has appeared, then require those two conditions to be opposites.
const zeroThermo = NFA.encodeSpec({
  startState: { prev: null, normal: true, zero: false },
  transition: ({ prev, normal, zero }, value) => ({
    prev: value,
    normal: normal && (prev === null || prev < value),
    zero: zero || value === 0,
  }),
  accept: ({ normal, zero }) => normal !== zero,
}, shape);

const zeroWhisper = NFA.encodeSpec({
  startState: { prev: null, normal: true, zero: false },
  transition: ({ prev, normal, zero }, value) => ({
    prev: value,
    normal: normal && (prev === null || Math.abs(prev - value) >= 5),
    zero: zero || value === 0,
  }),
  accept: ({ normal, zero }) => normal !== zero,
}, shape);

const zeroRenban = NFA.encodeSpec({
  startState: { values: [] },
  transition: ({ values }, value) => ({ values: [...values, value].sort((a, b) => a - b) }),
  accept: ({ values }) => {
    const zero = values.includes(0);
    const normal = new Set(values).size === values.length &&
      values.at(-1) - values[0] + 1 === values.length;
    return normal !== zero;
  },
  maxDepth: 4,
}, shape);

// The drawn cage cell lists and totals are transcribed from the four cage outlines.
const cages = [
  [36, ['R1C2', 'R1C3', 'R2C3', 'R2C4', 'R2C2', 'R2C1', 'R3C1', 'R4C1', 'R5C1']],
  [16, ['R2C5', 'R3C5']],
  [14, ['R4C4', 'R4C5', 'R4C6', 'R4C7']],
  [5, ['R7C8', 'R7C9']],
];
const invertedCage = (total, cells) => new Or([
  new And([new Cage(total, ...cells), ...zeroFree(cells)]),
  new And([
    hasZero(cells),
    // A zero-cage is wrong if its sum is not its label or any two cage cells repeat.
    new Or([
      ...range(0, cells.length * 8).filter(sum => sum !== total)
        .map(sum => new Sum(sum, ...cells)),
      ...cells.flatMap((cell, i) => cells.slice(i + 1)
        .map(other => new SameValues(2, cell, other))),
    ]),
  ]),
]);

// Green paths, including the repeated endpoint on the closed drawn line.
const greenLines = [
  ['R9C1', 'R9C2', 'R9C3'], ['R9C4', 'R9C5', 'R9C6'], ['R9C7', 'R9C8', 'R9C9'],
  ['R5C4', 'R6C5', 'R5C6', 'R5C5', 'R5C4'], ['R1C8', 'R1C9', 'R2C9'],
];
// Purple line cell sets are transcribed once; their repeated drawn endpoints do not
// add a renban member.
const purpleLines = [
  ['R3C7', 'R4C8', 'R4C9'], ['R5C2', 'R6C1', 'R6C2', 'R6C3'],
];
// The grey circular underlays mark the first cells of these thermometer paths.
const thermos = [
  ['R1C2', 'R1C3', 'R2C3', 'R3C3'],
  ['R6C4', 'R7C3', 'R7C2', 'R7C1'],
  ['R6C6', 'R7C7', 'R8C8'],
];

const zeroWhiteKey = Pair.fnToKey((a, b) => {
  const normal = Math.abs(a - b) === 1;
  return normal !== (a === 0 || b === 0);
}, shape);
const zeroBlackKey = Pair.fnToKey((a, b) => {
  const normal = a === 2 * b || b === 2 * a;
  return normal !== (a === 0 || b === 0);
}, shape);
// Dot pairs are transcribed from the filled (black) and unfilled (white) edge marks.
const whiteDots = [
  ['R2C3', 'R2C4'], ['R2C4', 'R2C5'], ['R2C8', 'R2C9'],
  ['R4C3', 'R5C3'], ['R3C1', 'R4C1'],
];
const blackDots = [
  ['R1C7', 'R1C8'], ['R3C2', 'R4C2'], ['R4C2', 'R5C2'],
  ['R7C4', 'R7C5'], ['R7C5', 'R7C6'], ['R8C1', 'R8C2'], ['R8C2', 'R8C3'],
];

return [
  shape,
  ...cages.map(([total, cells]) => invertedCage(total, cells)),
  ...greenLines.map((cells, i) => new NFA(zeroWhisper, `green ${i + 1}`, cells)),
  ...purpleLines.map((cells, i) => new NFA(zeroRenban, `purple ${i + 1}`, cells)),
  ...thermos.map((cells, i) => new NFA(zeroThermo, `thermo ${i + 1}`, cells)),
  ...whiteDots.map(cells => new Pair(zeroWhiteKey, 'white dot', ...cells)),
  ...blackDots.map(cells => new Pair(zeroBlackKey, 'black dot', ...cells)),
];
