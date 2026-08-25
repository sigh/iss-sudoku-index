// Title: Pfeilchenbeet / Arrow Farm
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=AMy-NDeJxLI
// Source: https://app.crackingthecryptic.com/webapp/GBfd7PptH8

// Normal sudoku rules apply, plus 13 single-cell circles and (omitted, see
// below) 2 double-width circles. Each circle starts an arrow: a path, one
// cell wide, that grows out from the circle and neither crosses nor touches
// itself orthogonally anywhere. The path's digits (not counting the circle)
// sum to the circle's own digit. Two arrows never share a cell. Blue cells
// can never be part of any arrow; orange cells may or may not be; every
// other cell (including every circle) must be part of exactly one arrow.
//
// Modelling an arrow whose path is entirely undrawn: every cell gets an
// "identity" (which of the 13 modelled arrows it belongs to, or none) and a
// "role" (that arrow's circle, or its 1st-9th shaft cell counting out from
// the circle, capped at 9 since a single-digit target can never need a
// longer shaft). A chain of NFAs then forces, per arrow: exactly one circle
// cell (pinned to the drawn location, not discovered); each shaft rank
// present at most once, and only contiguously above an already-present rank;
// each rank-k shaft cell orthogonally adjacent to its own rank-(k-1)
// predecessor (rank 1's predecessor is the circle); no *other* same-identity
// neighbour anywhere (closes the no-self-touch rule, since the rank chain
// already accounts for every legitimate adjacency); and the shaft digits
// summing to the circle digit. A cell's single identity value automatically
// keeps different arrows' cells disjoint ("never share a cell"); the colour
// rule is a domain restriction per cell (blue forced unused, plain cells
// forced used, orange left free).
//
// Omission: the two double-width (two-digit) circles at R7C4-R7C5 and
// R8C4-R8C5 are not modelled. Their target (10-98) makes the digit-sum NFA's
// (target, running-sum) state space exceed the 4096 compile-time state cap
// that a single-digit target keeps comfortably clear (see the capped `sum`
// comment in makeArrowSumMachine below); their arm could also legitimately
// need more shaft positions than the 16-value hard cap on a Var layer allows
// once a single-digit-target arrow's much shorter shaft is already using
// part of that budget. Both of their cells are pinned "not part of any
// modelled arrow" (identity = UNUSED_ID) instead: sound, since by the rule
// they can only ever belong to their own two arrows, never to one of the 13
// modelled ones. No sum, path-shape, or membership rule is enforced for
// these two arrows.

const shape = new Shape('9x9', 14);
const graph = cellGraph(shape);
const gridCells = graph.cells();

// Role/rank encoding shared by every layer below.
const UNUSED_RANK = 1; // paired rank value for an unused cell
const CIRCLE_RANK = 2; // rank value meaning "this arrow's circle"
const SHAFT_MIN = CIRCLE_RANK + 1; // rank value of shaft position 1
const MAX_SHAFT_LEN = 9; // a single-digit target (<=9) can never need more
const shaftRankValue = (n) => CIRCLE_RANK + n; // shaft position n (1-9) -> rank value

const NUM_ARROWS = 13;
const UNUSED_ID = NUM_ARROWS + 1; // identity value meaning "not part of any modelled arrow"

// The 13 single-cell circles, transcribed from the drawn white rounded-rect
// underlays (0.8x0.8, white fill, R#C# from their cell-centred coordinates).
const bulbs = [
  'R1C2', 'R1C3', 'R1C4', 'R2C6', 'R3C7', 'R3C8', 'R4C4', 'R4C5',
  'R5C3', 'R6C2', 'R6C3', 'R7C1', 'R8C1',
];

// The two omitted double-width circles (1.6x0.8 white rounded-rect underlays
// spanning two horizontally adjacent cells) -- see the header omission note.
const omittedDoubleCircleCells = ['R7C4', 'R7C5', 'R8C4', 'R8C5'];

// Blue underlay cells (#34BBE6): never part of any arrow.
const blueCells = ['R1C5', 'R2C8', 'R3C4', 'R4C1', 'R4C9'];

// Orange underlay cells (#EB7532): may or may not be part of an arrow.
const orangeCells = [
  'R1C8', 'R3C5', 'R4C7', 'R4C8', 'R5C1', 'R5C6', 'R5C7', 'R5C8', 'R5C9',
  'R6C1', 'R6C6', 'R6C7', 'R6C8', 'R6C9', 'R7C6', 'R7C7', 'R7C8', 'R7C9',
  'R8C6', 'R8C7', 'R8C8', 'R8C9', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9',
];

// Every other cell: plain (unmarked, not a circle) -- must be part of exactly
// one modelled arrow.
const specialCells = new Set([
  ...bulbs, ...omittedDoubleCircleCells, ...blueCells, ...orangeCells,
]);
const plainCells = gridCells.filter((cell) => !specialCells.has(cell));

const identity = graph.makeOverlay('VI');
const rank = graph.makeOverlay('VR');

// Couples the two layers per cell: identity=UNUSED iff rank=UNUSED, and a
// used identity (1-13) always carries a real role (circle or shaft rank).
const placementKey = Pair.fnToKey(
  (id, rankValue) => (id === UNUSED_ID && rankValue === UNUSED_RANK)
    || (id <= NUM_ARROWS && rankValue >= CIRCLE_RANK),
  14,
);

// Rank `level` (0 = circle, 1-9 = shaft position) occurs at most once for
// `arrowId`; level 0 occurs exactly once (the drawn circle, pinned below);
// level k>0 only when level k-1 also occurs, forcing the used shaft ranks to
// be a contiguous prefix above the circle. Scans every cell's [identity,
// rank] pair.
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
// rank-(k-1) cell of the same identity (rank 1's predecessor is the circle,
// rank 2). Combined with the count machines above this forces a genuine
// connected chain from the circle out to the far end. Scans the centre
// cell's [identity, rank], then each in-grid orthogonal neighbour's
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

// The rules say an arrow "neither crosses nor touches itself orthogonally":
// no same-identity neighbour of a cell may sit at any rank other than one
// more or one less than that cell's own rank. The predecessor machine above
// only requires the *correct* adjacency to exist somewhere; this machine
// forbids every *other* same-identity adjacency, which is exactly what turns
// the rank chain into a genuinely self-avoiding, non-self-touching path
// (rank values are already unique per arrow, so same-identity same-rank
// cannot occur). Scans the centre cell's [identity, rank], then each
// neighbour's [identity, rank].
function makeNoSelfTouchMachine(arrowId) {
  return NFA.encodeSpec({
    startState: {
      phase: 0, centerMatches: false, centerRank: null, neighbourId: null, ok: true,
    },
    transition: (state, value) => {
      if (state.phase === 0) return { ...state, phase: 1, centerMatches: value === arrowId };
      if (state.phase === 1) return { ...state, phase: 2, centerRank: value };
      if (state.phase === 2) return { ...state, phase: 3, neighbourId: value };
      const bothMatch = state.centerMatches && state.neighbourId === arrowId;
      const violation = bothMatch && Math.abs(value - state.centerRank) !== 1;
      return {
        ...state, phase: 2, neighbourId: null, ok: state.ok && !violation,
      };
    },
    accept: (state) => state.phase === 2 && state.ok,
    maxDepth: 10,
  }, shape);
}

// Scans every cell's [identity, rank, digit]: sums the digits of
// `arrowId`'s shaft cells and separately reads its circle cell's digit,
// then requires the two to match.
function makeArrowSumMachine(arrowId) {
  // Collapses each cell's [identity, rank] into two booleans (isCircle,
  // isShaft) as soon as both are read, rather than carrying the raw
  // identity/rank values alongside the running target/sum -- the cross
  // product of those would blow the NFA state cap. This is what a
  // single-digit target (<=9) keeps small enough to stay under the cap; a
  // two-digit target (10-98, the omitted double-width circles) would not.
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
      // Cap sum at the largest possible circle digit even before the circle
      // cell is scanned -- otherwise it grows unboundedly while target is
      // still null, and the compiler must track every value.
      if (sum > 9) return undefined;
      if (target !== null && sum > target) return undefined;
      return {
        phase: 0, matches: false, isCircle: false, isShaft: false, target, sum,
      };
    },
    accept: (state) => state.phase === 0 && state.target !== null && state.sum === state.target,
  }, shape);
}

const arrowIds = Array.from({ length: NUM_ARROWS }, (_, i) => i + 1);

const rankCountConstraints = arrowIds.flatMap((arrowId) => Array.from(
  { length: MAX_SHAFT_LEN + 1 },
  (_, level) => new NFA(
    makeRankCountMachine(arrowId, level),
    'arrow rank occurrence',
    ...gridCells.flatMap((cell) => [identity.at(cell), rank.at(cell)]),
  ),
));

const predecessorConstraints = arrowIds.flatMap((arrowId) => {
  const machine = makePredecessorMachine(arrowId);
  return gridCells.map((cell) => new NFA(
    machine,
    'consecutive arrow ranks touch',
    identity.at(cell), rank.at(cell),
    ...graph.neighbours(cell).flatMap((other) => [identity.at(other), rank.at(other)]),
  ));
});

const noSelfTouchConstraints = arrowIds.flatMap((arrowId) => {
  const machine = makeNoSelfTouchMachine(arrowId);
  return gridCells.map((cell) => new NFA(
    machine,
    'arrow does not touch itself',
    identity.at(cell), rank.at(cell),
    ...graph.neighbours(cell).flatMap((other) => [identity.at(other), rank.at(other)]),
  ));
});

const sumConstraints = arrowIds.map((arrowId) => new NFA(
  makeArrowSumMachine(arrowId),
  'arrow sum',
  ...gridCells.flatMap((cell) => [identity.at(cell), rank.at(cell), cell]),
));

// Pin each drawn circle to its arrow.
const circleGivens = bulbs.flatMap((cell, index) => {
  const arrowId = index + 1;
  return [
    new Given(identity.at(cell), arrowId),
    new Given(rank.at(cell), CIRCLE_RANK),
  ];
});

// Colour-rule domain restrictions.
const blueGivens = blueCells.map((cell) => new Given(identity.at(cell), UNUSED_ID));
const omittedDoubleCircleGivens = omittedDoubleCircleCells.map(
  (cell) => new Given(identity.at(cell), UNUSED_ID),
);
const plainGivens = plainCells.map(
  (cell) => new Given(identity.at(cell), ...arrowIds),
);
// Orange cells are left with their default full domain (free to be used or
// unused).

return [
  shape,
  // Widening is only for arrow identity/role state; puzzle digits stay 1-9.
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  identity.toVar('arrow identity (1-13), or 14 if not part of a modelled arrow'),
  rank.toVar('role: 1 unused, 2 circle, 3-11 shaft position 1-9 out from the circle'),
  ...gridCells.map((cell) => new Pair(
    placementKey, 'identity/rank coupling', identity.at(cell), rank.at(cell),
  )),
  ...circleGivens,
  ...blueGivens,
  ...omittedDoubleCircleGivens,
  ...plainGivens,
  ...rankCountConstraints,
  ...predecessorConstraints,
  ...noSelfTouchConstraints,
  ...sumConstraints,
];
