// Title: Nostalgia
// Author: Sartor
// Video: https://www.youtube.com/watch?v=3FNc6mO0l5o
// Source: https://sudokupad.app/vjn0pdempw

// Each non-circle cell has an arrow identity and a rank along that arrow.
// Identity is encoded by two base-5 cells: (1,1)..(5,4) are arrows 1..24,
// and (5,5) is unused. Ranks 1-9 are path positions and 10 is unused. Since
// an arrow sums to one positive digit, it cannot be longer than 9 cells.

const shape = new Shape('9x9', 10);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const UNUSED_IDENTITY = 25;
const UNUSED_RANK = 10;

const circles = [
  'R7C1', 'R8C1', 'R9C1', 'R7C4', 'R8C4', 'R9C4',
  'R8C3', 'R6C2', 'R6C4', 'R6C5', 'R6C6', 'R9C7',
  'R9C8', 'R9C9', 'R4C7', 'R5C7', 'R4C9', 'R6C9',
  'R3C8', 'R2C5', 'R5C3', 'R4C3', 'R3C4', 'R3C1',
];
const circleSet = new Set(circles);
const identityHigh = graph.makeOverlay('VH');
const identityLow = graph.makeOverlay('VL');
const rank = graph.makeOverlay('VK');
const decodeIdentity = (high, low) => (high - 1) * 5 + low;

// One scan supplies all auxiliary domains and attachment semantics. Occupied
// cells have identity 1-24 and rank 1-9; unused cells are identity 25/rank 10.
// Circle cells are unused, and rank 1 must be beside its identity's circle.
function makePlacementMachine(cell) {
  return NFA.encodeSpec({
    startState: { phase: 0, high: null, low: null },
    transition: ({ phase, high, low }, value) => {
      if (phase === 3) return undefined;
      if (phase === 0) {
        return value <= 5 ? { phase: 1, high: value, low: null } : undefined;
      }
      if (phase === 1) {
        return value <= 5 ? { phase: 2, high, low: value } : undefined;
      }

      const arrowIdentity = decodeIdentity(high, low);
      const bothUnused = arrowIdentity === UNUSED_IDENTITY && value === UNUSED_RANK;
      const bothUsed = arrowIdentity < UNUSED_IDENTITY && value <= 9;
      if (!bothUnused && !bothUsed) return undefined;
      if (circleSet.has(cell) && !bothUnused) return undefined;
      if (value === 1 && !graph.kingNeighbours(circles[arrowIdentity - 1]).includes(cell)) {
        return undefined;
      }
      return { phase: 3, high: null, low: null };
    },
    accept: state => state.phase === 3,
    maxDepth: 3,
  }, shape);
}

function makeRankCountMachine(arrowIdentity, currentRank) {
  // Rank 1 occurs exactly once. For k>1, rank k occurs at most once and only
  // when rank k-1 occurs, forcing the used ranks to be one contiguous prefix.
  const previousRank = currentRank - 1;
  return NFA.encodeSpec({
    startState: { phase: 0, high: null, low: null, previousCount: 0, currentCount: 0 },
    transition: (state, value) => {
      if (state.phase === 0) {
        return value <= 5 ? { ...state, phase: 1, high: value } : undefined;
      }
      if (state.phase === 1) {
        return value <= 5 ? { ...state, phase: 2, low: value } : undefined;
      }
      const matchesIdentity = decodeIdentity(state.high, state.low) === arrowIdentity;
      const previousCount = state.previousCount + (
        matchesIdentity && value === previousRank ? 1 : 0
      );
      const currentCount = state.currentCount + (
        matchesIdentity && value === currentRank ? 1 : 0
      );
      if (previousCount > 1 || currentCount > 1) return undefined;
      return { phase: 0, high: null, low: null, previousCount, currentCount };
    },
    accept: state => state.phase === 0 && (
      currentRank === 1
        ? state.currentCount === 1
        : state.currentCount <= state.previousCount
    ),
  }, shape);
}

// A rank k>1 cell must touch rank k-1 of the same arrow by a king move.
// Rank uniqueness makes that predecessor unique.
function makePredecessorMachine(arrowIdentity) {
  // Compile one small conditional machine per identity; retaining both base-5
  // identity digits for every possible centre/neighbour exceeds NFA's state cap.
  const targetHigh = Math.floor((arrowIdentity - 1) / 5) + 1;
  const targetLow = ((arrowIdentity - 1) % 5) + 1;
  return NFA.encodeSpec({
    startState: {
      phase: 0, centerHighMatches: false, centerMatches: false,
      centerRank: null, neighbourHighMatches: false,
      neighbourMatches: false, found: false,
    },
    transition: (state, value) => {
      if (state.phase === 0) {
        return { ...state, phase: 1, centerHighMatches: value === targetHigh };
      }
      if (state.phase === 1) {
        return {
          ...state, phase: 2,
          centerMatches: state.centerHighMatches && value === targetLow,
        };
      }
      if (state.phase === 2) return { ...state, phase: 3, centerRank: value };
      if (state.phase === 3) {
        return { ...state, phase: 4, neighbourHighMatches: value === targetHigh };
      }
      if (state.phase === 4) {
        return {
          ...state, phase: 5,
          neighbourMatches: state.neighbourHighMatches && value === targetLow,
        };
      }
      const found = state.found || (
        state.centerMatches && state.centerRank > 1 && state.centerRank <= 9 &&
        state.neighbourMatches && value === state.centerRank - 1
      );
      return {
        ...state, phase: 3, neighbourHighMatches: false,
        neighbourMatches: false, found,
      };
    },
    accept: state => state.phase === 3 && (
      !state.centerMatches || state.centerRank === 1 || state.found
    ),
    maxDepth: 27,
  }, shape);
}

function makeArrowSumMachine(arrowIdentity) {
  // Scan [circle digit, identity-high, identity-low, grid digit, ...].
  return NFA.encodeSpec({
    startState: { phase: 0, target: null, sum: 0, high: null, low: null },
    transition: (state, value) => {
      if (state.phase === 0) return { ...state, phase: 1, target: value };
      if (state.phase === 1) {
        return value <= 5 ? { ...state, phase: 2, high: value } : undefined;
      }
      if (state.phase === 2) {
        return value <= 5 ? { ...state, phase: 3, low: value } : undefined;
      }
      const next = decodeIdentity(state.high, state.low) === arrowIdentity
        ? state.sum + value
        : state.sum;
      if (next > state.target) return undefined;
      return { phase: 1, target: state.target, sum: next, high: null, low: null };
    },
    accept: state => state.phase === 1 && state.sum === state.target,
  }, shape);
}

const layerCells = gridCells.flatMap(cell => [
  identityHigh.at(cell), identityLow.at(cell), rank.at(cell),
]);
const arrowConstraints = circles.flatMap((circle, index) => {
  const arrowIdentity = index + 1;
  const sumCells = [circle, ...gridCells.flatMap(cell => [
    identityHigh.at(cell), identityLow.at(cell), cell,
  ])];
  return [
    ...Array.from({ length: 9 }, (_, rankIndex) => new NFA(
      makeRankCountMachine(arrowIdentity, rankIndex + 1),
      'arrow rank occurrence',
      ...layerCells,
    )),
    new NFA(
      makeArrowSumMachine(arrowIdentity),
      'arrow sum',
      ...sumCells,
    ),
  ];
});

const predecessorConstraints = circles.flatMap((circle, index) => {
  const arrowIdentity = index + 1;
  const predecessorMachine = makePredecessorMachine(arrowIdentity);
  return gridCells.map(cell => new NFA(
    predecessorMachine,
    'consecutive arrow ranks touch',
    identityHigh.at(cell), identityLow.at(cell), rank.at(cell),
    ...graph.kingNeighbours(cell).flatMap(other => [
      identityHigh.at(other), identityLow.at(other), rank.at(other),
    ]),
  ));
});

return [
  shape,
  // Widening is only for arrow state; puzzle digits remain 1-9.
  graph.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  identityHigh.toVar('arrow identity high digit'),
  identityLow.toVar('arrow identity low digit'),
  rank.toVar('rank along arrow'),
  ...gridCells.map(cell => new NFA(
    makePlacementMachine(cell),
    'arrow placement and attachment',
    identityHigh.at(cell), identityLow.at(cell), rank.at(cell),
  )),
  ...arrowConstraints,
  ...predecessorConstraints,
];
