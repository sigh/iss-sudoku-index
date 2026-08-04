// Title: Build Your Own Arrow Sudoku
// Author: No-Feet McGee
// Video: https://www.youtube.com/watch?v=1q0vMXDxigU
// Source: https://app.crackingthecryptic.com/sudoku/rbBB4tF8HL

// Normal sudoku rules apply, plus 9 arrows and 2 outside diagonal sums.
// Digits along an arrow sum to the digit in its circle. Only each arrow's
// tip is drawn (a short stub ending in an arrowhead) -- everything else
// about the arrow (its length, its turns, and its circle's cell) is left
// for the solver to determine. Arrows move orthogonally only and may not
// overlap; no row, column, or box may hold more than one arrow's circle.
// Two outside corner clues give the sum of digits on the indicated diagonal.
//
// Modelling an arrow whose only known feature is its tip: every cell gets
// an "identity" (which of the 9 arrows it belongs to, or none) and a
// "role" (that arrow's circle, or its 1st..9th shaft cell counting out from
// the circle). A chain of NFAs then forces, per arrow: exactly one circle
// cell; each shaft rank present at most once, and only contiguously above
// an already-present rank; each rank-k shaft cell orthogonally adjacent to
// its own rank-(k-1) predecessor (rank 1's predecessor is the circle); the
// shaft digits summing to the circle digit. The known tip cell is pinned to
// that arrow with no successor of its own, and its one known predecessor
// direction (read off the drawn stub) is pinned to hold the adjacent lower
// rank -- both taken from the drawn waypoints, never assumed. A cell's
// single identity value automatically keeps different arrows' cells
// disjoint ("may not overlap").

const shape = new Shape('9x9', 11);
const graph = cellGraph(shape);
const gridCells = graph.cells();

// Role/rank encoding shared by every layer below.
const UNUSED_ID = 10; // identity value meaning "not part of any arrow"
const UNUSED_RANK = 1; // paired rank value for an unused cell
const CIRCLE_RANK = 2; // rank value meaning "this arrow's circle"
const SHAFT_MIN = CIRCLE_RANK + 1; // rank value of shaft position 1
const shaftRankValue = (n) => CIRCLE_RANK + n; // shaft position n (1-9) -> rank value

// The 9 drawn arrow tips, each with the one neighbour the drawn stub shows
// the line arriving from (read off each stub's drawn waypoints, snapped to
// cell centres).
const arrows = [
  { tip: 'R1C3', predecessor: 'R1C4' },
  { tip: 'R1C8', predecessor: 'R1C9' },
  { tip: 'R5C4', predecessor: 'R4C4' },
  { tip: 'R5C5', predecessor: 'R6C5' },
  { tip: 'R5C6', predecessor: 'R4C6' },
  { tip: 'R5C7', predecessor: 'R5C8' },
  { tip: 'R8C9', predecessor: 'R7C9' },
  { tip: 'R9C2', predecessor: 'R9C1' },
  { tip: 'R7C1', predecessor: 'R6C1' },
];

const identity = graph.makeOverlay('VI');
const rank = graph.makeOverlay('VR');

// Couples the two layers per cell: identity=UNUSED iff rank=UNUSED, and a
// used identity (1-9) always carries a real role (circle or shaft rank).
const placementKey = Pair.fnToKey(
  (id, rankValue) => (id === UNUSED_ID && rankValue === UNUSED_RANK)
    || (id <= 9 && rankValue >= CIRCLE_RANK),
  11,
);

// Rank `level` (0 = circle, 1-9 = shaft position) occurs at most once for
// `arrowId`; level 0 occurs exactly once, and level k>0 only when level k-1
// also occurs, forcing the used shaft ranks to be a contiguous prefix above
// the circle. Scans every cell's [identity, rank] pair.
function makeRankCountMachine(arrowId, level) {
  const rankValue = level === 0 ? CIRCLE_RANK : shaftRankValue(level);
  const prevRankValue = level === 0 ? null
    : level === 1 ? CIRCLE_RANK : shaftRankValue(level - 1);
  return NFA.encodeSpec({
    startState: { phase: 0, id: null, prevCount: 0, curCount: 0 },
    transition: (state, value) => {
      if (state.phase === 0) return { ...state, phase: 1, id: value };
      const matches = state.id === arrowId;
      const prevCount = state.prevCount
        + (prevRankValue !== null && matches && value === prevRankValue ? 1 : 0);
      const curCount = state.curCount + (matches && value === rankValue ? 1 : 0);
      if (prevCount > 1 || curCount > 1) return undefined;
      return { phase: 0, id: null, prevCount, curCount };
    },
    accept: (state) => state.phase === 0 && (
      level === 0 ? state.curCount === 1 : state.curCount <= state.prevCount
    ),
  }, shape);
}

// A rank-k (k>=1) cell of `arrowId` must have an orthogonally-adjacent
// rank-(k-1) cell of the same identity (rank 1's predecessor is the
// circle, rank 0). Combined with the count machines above this forces a
// genuine connected chain from the circle out to the far end. Scans the
// centre cell's [identity, rank], then each in-grid orthogonal neighbour's
// [identity, rank].
function makePredecessorMachine(arrowId) {
  return NFA.encodeSpec({
    startState: {
      phase: 0, centerMatches: false, centerRank: null, neighbourId: null, ok: true,
    },
    transition: (state, value) => {
      if (state.phase === 0) return { ...state, phase: 1, centerMatches: value === arrowId };
      if (state.phase === 1) return { ...state, phase: 2, centerRank: value };
      if (state.phase === 2) return { ...state, phase: 3, neighbourId: value };
      const found = state.centerMatches && state.centerRank > CIRCLE_RANK
        && state.neighbourId === arrowId && value === state.centerRank - 1;
      return { ...state, phase: 2, neighbourId: null, ok: state.ok || found };
    },
    accept: (state) => state.phase === 2
      && (!state.centerMatches || state.centerRank <= CIRCLE_RANK || state.ok),
    maxDepth: 10,
  }, shape);
}

// Pins one drawn tip to its arrow: the tip cell holds `arrowId` at some
// shaft rank (never the circle itself); the known predecessor direction
// holds the adjacent lower rank; and no neighbour (any direction) holds the
// next rank up, so the tip is truly the arrow's far end. Scans the tip
// cell's [identity, rank], the predecessor's [identity, rank], then each
// remaining neighbour's [identity, rank].
function makeTipMachine(arrowId) {
  return NFA.encodeSpec({
    startState: { phase: 0, tipRank: null, ok: true },
    transition: (state, value) => {
      if (state.phase === 0) return { ...state, phase: 1, ok: value === arrowId };
      if (state.phase === 1) {
        return { ...state, phase: 2, tipRank: value, ok: state.ok && value >= SHAFT_MIN };
      }
      if (state.phase === 2) return { ...state, phase: 3, predId: value };
      if (state.phase === 3) {
        const predOk = state.predId === arrowId && value === state.tipRank - 1;
        return { ...state, phase: 4, ok: state.ok && predOk };
      }
      if (state.phase === 4) return { ...state, phase: 5, othId: value };
      const noSuccessor = !(state.othId === arrowId && value === state.tipRank + 1);
      return { ...state, phase: 4, ok: state.ok && noSuccessor };
    },
    accept: (state) => state.phase === 4 && state.ok,
    maxDepth: 12,
  }, shape);
}

// Scans every cell's [identity, rank, digit]: sums the digits of
// `arrowId`'s shaft cells and separately reads its circle cell's digit,
// then requires the two to match.
function makeArrowSumMachine(arrowId) {
  // Collapses each cell's [identity, rank] into two booleans (isCircle,
  // isShaft) as soon as both are read, rather than carrying the raw
  // 1-11 identity and rank values alongside the running target/sum --
  // the cross product of those would blow the NFA state cap.
  return NFA.encodeSpec({
    startState: {
      phase: 0, matches: false, isCircle: false, isShaft: false, target: null, sum: 0,
    },
    transition: (state, value) => {
      if (state.phase === 0) return { ...state, phase: 1, matches: value === arrowId };
      if (state.phase === 1) {
        return {
          ...state,
          phase: 2,
          isCircle: state.matches && value === CIRCLE_RANK,
          isShaft: state.matches && value >= SHAFT_MIN,
        };
      }
      const target = state.isCircle ? value : state.target;
      const sum = state.sum + (state.isShaft ? value : 0);
      // Cap sum at the largest possible circle digit even before the
      // circle cell is scanned -- otherwise it grows unboundedly while
      // target is still null, and the compiler must track every value.
      if (sum > 9) return undefined;
      if (target !== null && sum > target) return undefined;
      return {
        phase: 0, matches: false, isCircle: false, isShaft: false, target, sum,
      };
    },
    accept: (state) => state.phase === 0 && state.target !== null && state.sum === state.target,
  }, shape);
}

// At most one circle (rank = CIRCLE_RANK) per group; scans the group's rank
// values. Reused for every row, column and box.
const circleCountMachine = NFA.encodeSpec({
  startState: { count: 0 },
  transition: (state, value) => {
    const count = state.count + (value === CIRCLE_RANK ? 1 : 0);
    return count > 1 ? undefined : { count };
  },
  accept: () => true,
  maxDepth: 9,
}, shape);

const rankCountConstraints = arrows.flatMap((_, index) => {
  const arrowId = index + 1;
  return Array.from(
    { length: 10 },
    (_, level) => new NFA(
      makeRankCountMachine(arrowId, level),
      'arrow rank occurrence',
      ...gridCells.flatMap((cell) => [identity.at(cell), rank.at(cell)]),
    ),
  );
});

const predecessorConstraints = arrows.flatMap((_, index) => {
  const arrowId = index + 1;
  const machine = makePredecessorMachine(arrowId);
  return gridCells.map((cell) => new NFA(
    machine,
    'consecutive arrow ranks touch',
    identity.at(cell), rank.at(cell),
    ...graph.neighbours(cell).flatMap((other) => [identity.at(other), rank.at(other)]),
  ));
});

const tipConstraints = arrows.map(({ tip, predecessor }, index) => {
  const arrowId = index + 1;
  const others = graph.neighbours(tip).filter((cell) => cell !== predecessor);
  return new NFA(
    makeTipMachine(arrowId),
    'arrow tip anchor',
    identity.at(tip), rank.at(tip),
    identity.at(predecessor), rank.at(predecessor),
    ...others.flatMap((cell) => [identity.at(cell), rank.at(cell)]),
  );
});

const sumConstraints = arrows.map((_, index) => {
  const arrowId = index + 1;
  return new NFA(
    makeArrowSumMachine(arrowId),
    'arrow sum',
    ...gridCells.flatMap((cell) => [identity.at(cell), rank.at(cell), cell]),
  );
});

const circleUniquenessConstraints = graph.rowsColumnsBoxes().map(
  (group) => new NFA(circleCountMachine, 'one circle per row/column/box', ...rank.at(group)),
);

// Outside diagonal sum clues (drawn as off-grid arrows into the two top
// corners, paired with the "30"/"45" overlay text).
const mainDiagonal = ['R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9'];
const antiDiagonal = ['R1C9', 'R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1'];

return [
  shape,
  // Widening is only for arrow identity/role state; puzzle digits stay 1-9.
  graph.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  identity.toVar('arrow identity (1-9), or 10 if not part of any arrow'),
  rank.toVar('role: 1 unused, 2 circle, 3-11 shaft position 1-9 out from the circle'),
  ...gridCells.map((cell) => new Pair(
    placementKey, 'identity/rank coupling', identity.at(cell), rank.at(cell),
  )),
  ...rankCountConstraints,
  ...predecessorConstraints,
  ...tipConstraints,
  ...sumConstraints,
  ...circleUniquenessConstraints,
  new Sum(30, ...mainDiagonal),
  new Sum(45, ...antiDiagonal),
];
