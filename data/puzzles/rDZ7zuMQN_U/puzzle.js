// Title: Roots in the Fog
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=rDZ7zuMQN_U
// Source: https://sudokupad.app/jbliq30p6u

// VR is a parallel flag layer: 1 means ordinary, 2 means rooter. Exact
// square-root values are represented as coefficient * sqrt(squarefree basis).
// Comparisons use their numeric values; equalities use the exact representation.

const graph = cellGraph('9x9');
const rootFlags = graph.makeOverlay('VR');
const gridCells = graph.cells();
const rootFlag = cell => rootFlags.at(cell);
const interleaveFlags = cells => cells.flatMap(cell => [cell, rootFlag(cell)]);

const rootTerms = [
  null,
  { basis: 1, coefficient: 1 },
  { basis: 2, coefficient: 1 },
  { basis: 3, coefficient: 1 },
  { basis: 1, coefficient: 2 },
  { basis: 5, coefficient: 1 },
  { basis: 6, coefficient: 1 },
  { basis: 7, coefficient: 1 },
  { basis: 2, coefficient: 2 },
  { basis: 1, coefficient: 3 },
];

function effectiveTerm(digit, flag) {
  return flag === 1
    ? { basis: 1, coefficient: digit }
    : rootTerms[digit];
}

const numericValue = term => term.coefficient * Math.sqrt(term.basis);

function effectivePairNFA(predicate) {
  return NFA.encodeSpec({
    startState: { phase: 0 },
    transition: (state, value) => {
      if (state.phase === 0) return { phase: 1, digit: value };
      if (state.phase === 1) {
        return { phase: 2, first: effectiveTerm(state.digit, value) };
      }
      if (state.phase === 2) return { phase: 3, first: state.first, digit: value };
      if (state.phase !== 3) return undefined;
      return predicate(state.first, effectiveTerm(state.digit, value))
        ? { phase: 4 }
        : undefined;
    },
    accept: state => state.phase === 4,
    maxDepth: 4,
  }, 9);
}

const doubledValues = effectivePairNFA((a, b) =>
  a.basis === b.basis
  && (a.coefficient === 2 * b.coefficient
    || b.coefficient === 2 * a.coefficient));
const increasingValues = effectivePairNFA((a, b) => numericValue(a) < numericValue(b));
const whisperValues = effectivePairNFA((a, b) =>
  Math.abs(numericValue(a) - numericValue(b)) >= 5);

const rootDigitNFA = digit => NFA.encodeSpec({
  startState: { phase: 0, count: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, count: state.count, digit: value };
    const count = state.count + (state.digit === digit && value === 2 ? 1 : 0);
    return count <= 1 ? { phase: 0, count } : undefined;
  },
  accept: state => state.phase === 0 && state.count === 1,
  maxDepth: 162,
}, 9);

const renbanValuesNFA = length => NFA.encodeSpec({
  startState: { phase: 0, values: [] },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, values: state.values, digit: value };
    const term = effectiveTerm(state.digit, value);
    if (term.basis !== 1 || state.values.includes(term.coefficient)) return undefined;
    const values = [...state.values, term.coefficient].sort((a, b) => a - b);
    return values.at(-1) - values[0] < length ? { phase: 0, values } : undefined;
  },
  accept: state => state.phase === 0
    && state.values.length === length
    && state.values.at(-1) - state.values[0] === length - 1,
  maxDepth: 2 * length,
}, 9);

// The arrow equality is exact in the basis 1, sqrt(2), sqrt(3), sqrt(5),
// sqrt(6), sqrt(7). One small NFA per basis adds the four arm coefficients
// and subtracts the bulb coefficient, avoiding a cross-product state space.
const bases = [1, 2, 3, 5, 6, 7];
const arrowBasisNFA = basis => NFA.encodeSpec({
  startState: { phase: 0, index: 0, total: 0 },
  transition: (state, value) => {
    if (state.phase === 0) {
      return { phase: 1, index: state.index, total: state.total, digit: value };
    }
    const term = effectiveTerm(state.digit, value);
    const coefficient = term.basis === basis ? term.coefficient : 0;
    const sign = state.index < 4 ? 1 : -1;
    return { phase: 0, index: state.index + 1, total: state.total + sign * coefficient };
  },
  accept: state => state.phase === 0 && state.index === 5 && state.total === 0,
  maxDepth: 10,
}, 9);

const cages = [
  ['R8C6', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6'],
  ['R7C8', 'R7C9', 'R8C7', 'R8C8', 'R9C8'],
  ['R4C7', 'R4C8', 'R4C9', 'R5C7'],
];
const cageCells = [...new Set(cages.flat())];
const cageIndex = new Map(cageCells.map((cell, index) => [cell, index]));

// Twice each prime exponent is integral: an ordinary digit contributes twice
// its factor exponent, while a rooter contributes it once. Equal products are
// therefore four EqualSums, one for each prime in 1-9. Stored values are
// exponent+1; padding each cage to six terms cancels that offset.
const primeFactors = [
  [2, 'A', [0, 1, 0, 2, 0, 1, 0, 3, 0]],
  [3, 'B', [0, 0, 1, 0, 0, 1, 0, 0, 2]],
  [5, 'C', [0, 0, 0, 0, 1, 0, 0, 0, 0]],
  [7, 'D', [0, 0, 0, 0, 0, 0, 1, 0, 0]],
];

const productLayers = primeFactors.map(([prime, code, exponents]) => {
  const vars = new Var(`E${code}`, `twice exponent of ${prime}`, cageCells.length + 2);
  const exponentNFA = NFA.encodeSpec({
    startState: { phase: 0 },
    transition: (state, value) => {
      if (state.phase === 0) return { phase: 1, digit: value };
      if (state.phase === 1) return { phase: 2, digit: state.digit, flag: value };
      if (state.phase !== 2) return undefined;
      const exponent = exponents[state.digit - 1] * (state.flag === 1 ? 2 : 1);
      return value === exponent + 1 ? { phase: 3 } : undefined;
    },
    accept: state => state.phase === 3,
    maxDepth: 3,
  }, 9);
  const values = cageCells.map((cell, index) => vars.cell(index + 1));
  const padding = [vars.cell(cageCells.length + 1), vars.cell(cageCells.length + 2)];
  const paddedCages = cages.map(cage => [
    ...cage.map(cell => values[cageIndex.get(cell)]),
    ...padding.slice(0, 6 - cage.length),
  ]);
  return {
    vars,
    constraints: [
      ...padding.map(cell => new Given(cell, 1)),
      ...cageCells.map((cell, index) => new NFA(
        exponentNFA, `${prime}-exponent`, cell, rootFlag(cell), values[index])),
      new EqualSum(...paddedCages),
    ],
  };
});

const thermometers = [
  ['R1C6', 'R1C5', 'R1C4', 'R2C4', 'R2C3'],
  ['R1C6', 'R2C6', 'R3C5', 'R3C4', 'R3C3'],
];
const whispers = [
  ['R6C2', 'R6C1', 'R5C1', 'R5C2', 'R6C3'],
  ['R4C1', 'R4C2'],
  ['R4C3', 'R5C3'],
];
const renbans = [
  ['R5C5', 'R5C4', 'R6C4'],
  ['R6C5', 'R6C6', 'R5C6'],
  ['R4C4', 'R4C5', 'R4C6'],
];
const blackDots = [
  ['R1C1', 'R1C2'],
  ['R1C2', 'R1C3'],
  ['R2C1', 'R3C1'],
  ['R2C2', 'R3C2'],
];

const adjacentValueConstraints = (lines, nfa, label) => lines.flatMap(line =>
  line.slice(1).map((cell, index) => new NFA(
    nfa, label, ...interleaveFlags([line[index], cell]))));

return [
  new Shape('9x9'),
  rootFlags.toVar('rooter flags'),
  rootFlags.makeReplicate(
    new Given(rootFlag(gridCells[0]), 1, 2),
    rootFlags.at(gridCells),
  ),

  // Exactly one rooter in every row, column, and box.
  ...graph.rows().map(row => new Sum(10, ...rootFlags.at(row))),
  ...graph.columns().map(column => new Sum(10, ...rootFlags.at(column))),
  ...graph.boxes().map(box => new Sum(10, ...rootFlags.at(box))),
  ...Array.from({ length: 9 }, (_, i) => new NFA(
    rootDigitNFA(i + 1), `rooted digit ${i + 1}`, ...interleaveFlags(gridCells))),

  ...adjacentValueConstraints(blackDots, doubledValues, 'double values'),
  ...adjacentValueConstraints(thermometers, increasingValues, 'increasing values'),
  ...adjacentValueConstraints(whispers, whisperValues, 'whisper values'),
  ...renbans.map(line => new NFA(
    renbanValuesNFA(line.length), 'renban values', ...interleaveFlags(line))),
  ...bases.map(basis => new NFA(
    arrowBasisNFA(basis), `arrow sqrt(${basis}) coefficient`,
    ...interleaveFlags(['R1C8', 'R2C8', 'R2C7', 'R3C7', 'R1C9']))),

  ...productLayers.map(layer => layer.vars),
  ...productLayers.flatMap(layer => layer.constraints),
];
