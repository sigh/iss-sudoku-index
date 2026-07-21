// Title: Blind Date
// Author: Ul-Rhymm
// Video: https://www.youtube.com/watch?v=D6hZjkJLZBg
// Source: https://sudokupad.app/9q8gyvfhpm

// Each cage is all-different. VE cells are derived flags for side-sharing cage
// pairs: 1 means unequal totals and 2 means equal totals. If a cage has degree
// d in the cage-adjacency graph, a flag sum of d+1 means exactly one neighbour
// has the same total.

const graph = cellGraph('9x9');

const cages = [
  ['R4C2', 'R5C2', 'R6C1', 'R6C2', 'R6C3'],
  ['R4C1', 'R5C1'],
  ['R4C3', 'R5C3'],
  ['R7C1'],
  ['R7C2'],
  ['R8C2', 'R8C3', 'R8C4'],
  ['R8C1', 'R9C1', 'R9C2'],
  ['R7C9', 'R8C9'],
  ['R7C4', 'R7C5', 'R7C6', 'R7C7', 'R7C8'],
  ['R6C7', 'R6C8', 'R6C9'],
  ['R5C8'],
  ['R4C7', 'R4C8', 'R4C9', 'R5C9'],
  ['R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C6', 'R2C9', 'R3C9'],
  ['R3C5', 'R4C5', 'R4C6', 'R5C6', 'R5C7'],
  ['R5C4', 'R5C5'],
  ['R6C5', 'R6C6'],
  ['R9C3', 'R9C4'],
  ['R9C5', 'R9C6'],
  ['R9C7'],
  ['R9C8', 'R9C9'],
  ['R2C3', 'R3C3'],
  ['R1C2', 'R1C3'],
  ['R3C1', 'R3C2'],
  ['R1C1', 'R2C1'],
  ['R2C8'],
  ['R2C7', 'R3C7'],
  ['R1C5'],
  ['R1C4', 'R2C4'],
];

const adjacentPairs = cages.flatMap((first, firstIndex) =>
  cages.slice(firstIndex + 1).map((second, offset) => ({
    first: firstIndex,
    second: firstIndex + offset + 1,
    touches: first.some(cell =>
      graph.neighbours(cell).some(neighbour => second.includes(neighbour))),
  })).filter(pair => pair.touches));

const equalTotalEdges = new Var('E', 'Equal cage-total edge', adjacentPairs.length);
const edgeFlags = equalTotalEdges.cells();
const edgeFlag = edgeIndex => edgeFlags[edgeIndex];

// The first one-cell segment holds the equality flag. The next two segments
// are the cages; their running difference determines the flag at acceptance.
const equalityFlagSpec = NFA.encodeSpec({
  startState: { phase: 'flag', flag: null, difference: 0 },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      if (state.phase === 'flag' && state.flag !== null) {
        return { ...state, phase: 'first' };
      }
      if (state.phase === 'first') return { ...state, phase: 'second' };
      return undefined;
    }
    if (state.phase === 'flag') {
      return state.flag === null ? { ...state, flag: value } : undefined;
    }
    const sign = state.phase === 'first' ? 1 : -1;
    return { ...state, difference: state.difference + sign * value };
  },
  accept: state => state.phase === 'second'
    && (state.flag === 2) === (state.difference === 0),
  // One flag, two segment breaks, and at most seven cells in each cage.
  maxDepth: 17,
}, 9, { multiSegment: true });

const cageUniqueness = cages
  .filter(cage => cage.length > 1)
  .map(cage => new AllDifferent(...cage));

const flagDomains = edgeFlags.map(flag => new Given(flag, 1, 2));

const flagDefinitions = adjacentPairs.map(({ first, second }, edgeIndex) =>
  new NFA(
    equalityFlagSpec,
    'equal cage-total flag',
    [edgeFlag(edgeIndex)],
    cages[first],
    cages[second],
  ));

const oneMatchPerCage = cages.map((_, cageIndex) => {
  const incidentFlags = adjacentPairs.flatMap(({ first, second }, edgeIndex) =>
    first === cageIndex || second === cageIndex ? [edgeFlag(edgeIndex)] : []);
  return new Sum(incidentFlags.length + 1, ...incidentFlags);
});

return [
  new Shape('9x9'),
  equalTotalEdges,
  ...flagDomains,
  ...cageUniqueness,
  ...flagDefinitions,
  ...oneMatchPerCage,
];
