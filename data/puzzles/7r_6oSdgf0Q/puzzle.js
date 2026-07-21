// Title: Killer Kropki Sequel
// Author: Ryx
// Video: https://www.youtube.com/watch?v=7r_6oSdgf0Q
// Source: https://sudokupad.app/otm4zq3o5a

// Cages have no repeated digits. A dot requires its Kropki relation to hold
// both for the adjacent digits and for their cage totals; all such dots are
// given. Each inequality likewise compares both digits and cage totals.

const graph = cellGraph('9x9');

const cages = [
  ['R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C8', 'R9C9'],
  ['R4C8', 'R5C8', 'R6C8', 'R7C8', 'R8C7', 'R8C8'],
  ['R5C7', 'R6C7', 'R7C5', 'R7C6', 'R7C7'],
  ['R5C5', 'R5C6', 'R6C5', 'R6C6'],
  ['R5C3', 'R6C3', 'R6C4', 'R7C3', 'R7C4'],
  ['R4C3', 'R4C4', 'R4C5', 'R4C6', 'R4C7', 'R5C4'],
  ['R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7'],
  ['R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R3C8'],
  ['R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C9'],
  ['R2C2', 'R2C3', 'R3C2', 'R4C2', 'R5C2', 'R6C2'],
  ['R1C1', 'R1C2', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1'],
  ['R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7'],
  ['R7C2', 'R8C2', 'R8C3', 'R8C4', 'R8C5', 'R8C6'],
];

const whiteDots = [
  ['R6C2', 'R7C2'], ['R7C1', 'R8C1'], ['R3C9', 'R2C9'],
  ['R5C2', 'R5C1'], ['R6C5', 'R7C5'], ['R6C8', 'R6C7'],
  ['R5C8', 'R5C7'], ['R7C3', 'R8C3'], ['R5C4', 'R5C3'],
];

const blackDots = [
  ['R4C7', 'R3C7'], ['R8C8', 'R8C9'],
  ['R3C7', 'R2C7'], ['R3C7', 'R3C8'],
];

// In each pair the first cell is on the open (greater) side.
const inequalities = [
  ['R8C4', 'R7C4'], ['R4C9', 'R4C8'],
  ['R6C4', 'R5C4'], ['R6C1', 'R6C2'],
];

const cageOf = new Map();
cages.forEach((cage, index) => cage.forEach(cell => cageOf.set(cell, index)));

const edgeKey = (a, b) => [a, b].sort().join('-');
const whiteKeys = new Set(whiteDots.map(([a, b]) => edgeKey(a, b)));
const blackKeys = new Set(blackDots.map(([a, b]) => edgeKey(a, b)));

// Undotted cross-cage edges need three conditional exclusions: consecutive
// digits cannot accompany totals differing by 1, and ratio-2 digits cannot
// accompany either orientation of a ratio-2 total pair.
function exclusionSpec(digitRelation, coefficientA, coefficientB, forbiddenDelta) {
  return NFA.encodeSpec({
    startState: { phase: 'digit-a', digitA: null, matched: false, delta: 0 },
    transition: (state, value) => {
      if (state.phase === 'digit-a') {
        return { phase: 'break-a', digitA: value, matched: false, delta: 0 };
      }
      if (state.phase === 'break-a') {
        return value === SEGMENT_BREAK
          ? { ...state, phase: 'digit-b' }
          : undefined;
      }
      if (state.phase === 'digit-b') {
        return {
          phase: 'break-b',
          digitA: null,
          matched: digitRelation(state.digitA, value),
          delta: 0,
        };
      }
      if (state.phase === 'break-b') {
        return value === SEGMENT_BREAK
          ? { ...state, phase: 'cage-a' }
          : undefined;
      }
      if (state.phase === 'cage-a') {
        if (value === SEGMENT_BREAK) return { ...state, phase: 'cage-b' };
        return { ...state, delta: state.delta + coefficientA * value };
      }
      if (state.phase === 'cage-b') {
        if (value === SEGMENT_BREAK) return undefined;
        return { ...state, delta: state.delta + coefficientB * value };
      }
      return undefined;
    },
    accept: state => state.phase === 'cage-b' &&
      (!state.matched || !forbiddenDelta(state.delta)),
    // Two digit cells, two cage segments of at most eight cells, and 3 breaks.
    maxDepth: 21,
  }, 9, { multiSegment: true });
}

const consecutive = (a, b) => Math.abs(a - b) === 1;
const doubled = (a, b) => a === 2 * b || b === 2 * a;
const noWhiteDot = exclusionSpec(consecutive, 1, -1, delta => Math.abs(delta) === 1);
const noBlackDotAB = exclusionSpec(doubled, 1, -2, delta => delta === 0);
const noBlackDotBA = exclusionSpec(doubled, 2, -1, delta => delta === 0);

const boundaryEdges = graph.cells().flatMap(cell =>
  graph.neighbours(cell)
    .filter(neighbour => cell < neighbour && cageOf.get(cell) !== cageOf.get(neighbour))
    .map(neighbour => [cell, neighbour]));

const negativeDotConstraints = boundaryEdges.flatMap(([a, b]) => {
  const key = edgeKey(a, b);
  const cageA = cages[cageOf.get(a)];
  const cageB = cages[cageOf.get(b)];
  return [
    ...(!whiteKeys.has(key) ? [
      new NFA(noWhiteDot, 'no unmarked white dot', [a], [b], cageA, cageB),
    ] : []),
    ...(!blackKeys.has(key) ? [
      new NFA(noBlackDotAB, 'no unmarked black dot', [a], [b], cageA, cageB),
      new NFA(noBlackDotBA, 'no unmarked black dot', [a], [b], cageA, cageB),
    ] : []),
  ];
});

const differenceOne = (cageA, cageB) => new Or([
  new Sum(1, ...cageA, ...cageB.map(cell => [cell, -1])),
  new Sum(-1, ...cageA, ...cageB.map(cell => [cell, -1])),
]);

const ratioTwo = (cageA, cageB) => new Or([
  new Sum(0, ...cageA, ...cageB.map(cell => [cell, -2])),
  new Sum(0, ...cageA.map(cell => [cell, 2]), ...cageB.map(cell => [cell, -1])),
]);

const whiteDotConstraints = whiteDots.flatMap(([a, b]) => [
  new WhiteDot(a, b),
  differenceOne(cages[cageOf.get(a)], cages[cageOf.get(b)]),
]);

const blackDotConstraints = blackDots.flatMap(([a, b]) => [
  new BlackDot(a, b),
  ratioTwo(cages[cageOf.get(a)], cages[cageOf.get(b)]),
]);

const greaterTotalSpec = NFA.encodeSpec({
  startState: { phase: 'greater', delta: 0 },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) return { phase: 'lesser', delta: state.delta };
    const sign = state.phase === 'greater' ? 1 : -1;
    return { ...state, delta: state.delta + sign * value };
  },
  accept: state => state.phase === 'lesser' && state.delta > 0,
  maxDepth: 17,
}, 9, { multiSegment: true });

const inequalityConstraints = inequalities.flatMap(([greater, lesser]) => [
  new GreaterThan(greater, lesser),
  new NFA(
    greaterTotalSpec,
    'greater cage total',
    cages[cageOf.get(greater)],
    cages[cageOf.get(lesser)],
  ),
]);

return [
  new Shape('9x9'),
  ...cages.map(cage => new AllDifferent(...cage)),
  ...whiteDotConstraints,
  ...blackDotConstraints,
  ...negativeDotConstraints,
  ...inequalityConstraints,
];
