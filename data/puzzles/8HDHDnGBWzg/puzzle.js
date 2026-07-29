// Title: Consecutive Killers II
// Author: RedBarchetta
// Video: https://www.youtube.com/watch?v=8HDHDnGBWzg
// Source: https://app.crackingthecryptic.com/aejjn7fm52

// Normal sudoku. The 27 drawn killer cages contain no repeated digit and have
// different sums. Draw one non-looping, non-self-intersecting orthogonal line
// through every cell: each cage occupies one contiguous visit, successive
// cages have consecutive sums progressing in one direction, and the two line
// endpoints hold the same digit. R4C1 is greater than R3C1.
//
// The directed representation chooses increasing cage sums as the line's
// orientation. Reversing any valid undirected line gives this representative.
// Nothing is omitted.

const graph = cellGraph('9x9');
const cells = graph.cells();
const SIDE = 9;
const LAST = SIDE * SIDE;

// The drawn killer-cage cell sets, in source order; none has a printed total.
const CAGES = [
  ['R1C5'],
  ['R1C6'],
  ['R1C7'],
  ['R1C8'],
  ['R1C9'],
  ['R2C9'],
  ['R2C8'],
  ['R2C7'],
  ['R3C7', 'R3C8', 'R3C9', 'R4C9'],
  ['R4C7', 'R4C8', 'R5C7'],
  ['R5C8', 'R5C9'],
  ['R6C7', 'R6C8'],
  ['R6C9', 'R7C9', 'R8C9'],
  ['R9C7', 'R9C8', 'R9C9'],
  ['R7C5', 'R7C6', 'R7C7', 'R7C8', 'R8C8'],
  ['R8C6', 'R8C7', 'R9C6'],
  ['R8C5', 'R9C4', 'R9C5'],
  ['R7C3', 'R7C4', 'R8C3', 'R8C4'],
  ['R8C1', 'R9C1', 'R9C2', 'R9C3'],
  ['R7C1', 'R7C2', 'R8C2'],
  ['R5C6', 'R6C3', 'R6C4', 'R6C5', 'R6C6'],
  ['R2C6', 'R3C6', 'R4C6'],
  ['R2C5', 'R3C5', 'R4C5', 'R5C5'],
  ['R1C4', 'R2C4', 'R3C4', 'R4C4', 'R5C4'],
  ['R1C1', 'R1C2', 'R1C3', 'R2C1'],
  ['R3C1', 'R4C1', 'R5C1', 'R5C2', 'R6C1', 'R6C2'],
  ['R2C2', 'R2C3', 'R3C2', 'R3C3', 'R4C2', 'R4C3', 'R5C3'],
];

const high = graph.makeOverlay('VH');
const low = graph.makeOverlay('VL');
const entry = graph.makeOverlay('VI');
const end = graph.makeOverlay('VZ');
const position = (h, l) => (h - 1) * SIDE + l;
const posCells = cell => [high.at(cell), low.at(cell)];

const cageOf = new Map();
CAGES.forEach((cage, index) => cage.forEach(cell => cageOf.set(cell, index)));

// Every non-first position has an orthogonal neighbour one position earlier.
// Position 81 is required below; following predecessors from it visits 81
// distinct positions, so all cells receive a different position and the result
// is one Hamiltonian path rather than a path plus subtours.
const predecessorSpec = NFA.encodeSpec({
  startState: { phase: 'ownHigh' },
  transition: (state, value) => {
    if (state.phase === 'ownHigh') {
      return { phase: 'ownLow', high: value };
    }
    if (state.phase === 'ownLow') {
      const own = position(state.high, value);
      return own === 1
        ? { phase: 'found' }
        : { phase: 'neighbourHigh', want: own - 1 };
    }
    if (state.phase === 'neighbourHigh') {
      return { phase: 'neighbourLow', want: state.want, high: value };
    }
    if (state.phase === 'neighbourLow') {
      return position(state.high, value) === state.want
        ? { phase: 'found' }
        : { phase: 'neighbourHigh', want: state.want };
    }
    if (state.phase === 'found') return state;
    return undefined;
  },
  accept: state => state.phase === 'found',
}, SIDE);
const path = cells.map(cell => new NFA(
  predecessorSpec,
  'orthogonal path predecessor',
  ...posCells(cell),
  ...graph.neighbours(cell).flatMap(posCells),
));

// VI is 2 exactly at the first cell of a cage's path block, and 1 elsewhere.
// Exactly one such cell per cage therefore means the line enters the cage only
// once and passes through all of its cells before leaving.
const predecessorRelationSpec = expected => NFA.encodeSpec({
  startState: { phase: 'ownHigh' },
  transition: (state, value) => {
    if (state.phase === 'ownHigh') return { phase: 'ownLow', high: value };
    if (state.phase === 'ownLow') {
      return { phase: 'otherHigh', want: position(state.high, value) - 1 };
    }
    if (state.phase === 'otherHigh') {
      return { phase: 'otherLow', want: state.want, high: value };
    }
    if (state.phase === 'otherLow') {
      const isPredecessor = position(state.high, value) === state.want;
      return isPredecessor === expected ? { phase: 'done' } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 'done',
}, SIDE);
const isPredecessorSpec = predecessorRelationSpec(true);
const isNotPredecessorSpec = predecessorRelationSpec(false);
const entryDefinitions = CAGES.flatMap(cage => cage.map(cell => {
  // A predecessor on the orthogonal line can only be an orthogonal neighbour,
  // so non-neighbouring cells of the same cage need not enter this machine.
  const cageSet = new Set(cage);
  const others = graph.neighbours(cell).filter(other => cageSet.has(other));
  if (others.length === 0) return new Given(entry.at(cell), 2);
  const earlierInside = others.map(other => new And([
    new Given(entry.at(cell), 1),
    new NFA(isPredecessorSpec, 'inside predecessor',
      ...posCells(cell), ...posCells(other)),
  ]));
  const noEarlierInside = new And([
    new Given(entry.at(cell), 2),
    ...others.map(other => new NFA(isNotPredecessorSpec, 'outside predecessor',
      ...posCells(cell), ...posCells(other))),
  ]);
  return new Or([noEarlierInside, ...earlierInside]);
}));
const oneEntryPerCage = CAGES.map(cage =>
  new ContainExact('2', ...entry.at(cage)));

// When two orthogonally adjacent cells from different cages are consecutive on
// the line, the later cage's sum is one greater. The machine state carries the
// difference sum(B)-sum(A), not either full sum.
const sumStepSpecs = new Map();
const sumStepSpec = (sizeA, sizeB) => {
  const key = sizeA + ':' + sizeB;
  if (!sumStepSpecs.has(key)) {
    sumStepSpecs.set(key, NFA.encodeSpec({
      startState: { phase: 'aHigh' },
      transition: (state, value) => {
        if (state.phase === 'aHigh') {
          return { phase: 'aLow', high: value };
        }
        if (state.phase === 'aLow') {
          return { phase: 'bHigh', posA: position(state.high, value) };
        }
        if (state.phase === 'bHigh') {
          return { phase: 'bLow', posA: state.posA, high: value };
        }
        if (state.phase === 'bLow') {
          const posB = position(state.high, value);
          const direction = posB === state.posA + 1 ? 1
            : (state.posA === posB + 1 ? -1 : 0);
          return { phase: 'digitsA', direction, remaining: sizeA, diff: 0 };
        }
        if (state.phase === 'digitsA') {
          const remaining = state.remaining - 1;
          return {
            phase: remaining === 0 ? 'digitsB' : 'digitsA',
            direction: state.direction,
            remaining: remaining === 0 ? sizeB : remaining,
            diff: state.direction === 0 ? 0 : state.diff - value,
          };
        }
        if (state.phase === 'digitsB') {
          const remaining = state.remaining - 1;
          return {
            phase: remaining === 0 ? 'done' : 'digitsB',
            direction: state.direction,
            remaining,
            diff: state.direction === 0 ? 0 : state.diff + value,
          };
        }
        return undefined;
      },
      accept: state => state.phase === 'done' &&
        (state.direction === 0 || state.diff === state.direction),
    }, SIDE));
  }
  return sumStepSpecs.get(key);
};

const crossCageEdges = [];
const cellIndex = new Map(cells.map((cell, index) => [cell, index]));
for (const a of cells) {
  for (const b of graph.neighbours(a)) {
    if (cellIndex.get(a) >= cellIndex.get(b)) continue;
    const cageA = cageOf.get(a), cageB = cageOf.get(b);
    if (cageA === cageB) continue;
    crossCageEdges.push(new NFA(
      sumStepSpec(CAGES[cageA].length, CAGES[cageB].length),
      'consecutive cage sums',
      ...posCells(a),
      ...posCells(b),
      ...CAGES[cageA],
      ...CAGES[cageB],
    ));
  }
}

// VE is the common digit of the two path endpoints.
const endpointSpec = NFA.encodeSpec({
  startState: { phase: 'high' },
  transition: (state, value) => {
    if (state.phase === 'high') return { phase: 'low', high: value };
    if (state.phase === 'low') {
      const pos = position(state.high, value);
      return { phase: 'digit', endpoint: pos === 1 || pos === LAST };
    }
    if (state.phase === 'digit') {
      return { phase: 'endpointDigit', endpoint: state.endpoint, digit: value };
    }
    if (state.phase === 'endpointDigit') {
      return !state.endpoint || value === state.digit
        ? { phase: 'done' }
        : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 'done',
}, SIDE);
const endpointDigits = cells.map(cell => new NFA(
  endpointSpec,
  'equal endpoint digits',
  ...posCells(cell),
  cell,
  'VE',
));

// VZ is 2 exactly at position 81. Requiring one such flag supplies the top of
// the predecessor chain without choosing which puzzle cell is the endpoint.
const endSpec = NFA.encodeSpec({
  startState: { phase: 'high' },
  transition: (state, value) => {
    if (state.phase === 'high') return { phase: 'low', high: value };
    if (state.phase === 'low') {
      return { phase: 'flag', isEnd: position(state.high, value) === LAST };
    }
    if (state.phase === 'flag') {
      return value === (state.isEnd ? 2 : 1)
        ? { phase: 'done' }
        : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 'done',
}, SIDE);
const endDefinitions = cells.map(cell => new NFA(
  endSpec, 'path end', ...posCells(cell), end.at(cell)));

return [
  new Shape('9x9'),
  high.toVar('path position high'),
  low.toVar('path position low'),
  entry.toVar('cage entry flag'),
  end.toVar('path end flag'),
  new Var('E', 'endpoint digit'),
  // The drawn cages have no totals, so their direct killer rule is distinctness.
  ...CAGES.filter(cage => cage.length > 1).map(cage =>
    new AllDifferent(...cage)),
  // The drawn inequality's point is on the R3C1 side.
  new GreaterThan('R4C1', 'R3C1'),
  entry.makeReplicate(new Given(entry.at(cells[0]), 1, 2)),
  end.makeReplicate(new Given(end.at(cells[0]), 1, 2)),
  ...path,
  ...entryDefinitions,
  ...oneEntryPerCage,
  ...crossCageEdges,
  ...endpointDigits,
  ...endDefinitions,
  new ContainExact('2', ...end.at(cells)),
];
