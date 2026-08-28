// Title: Pfeilchenbeet / Arrow Farm
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=AMy-NDeJxLI
// Source: https://app.crackingthecryptic.com/webapp/GBfd7PptH8

// Normal sudoku rules apply. There are no given digits: the whole puzzle is
// 15 arrow circles plus cell shading, and every arrow's path is unknown.
//
// An arrow grows out of its circle as a one-cell-wide path which neither
// crosses nor touches itself orthogonally (the setter's clarification: it
// behaves like a snake, so a 2x2 block is a self-touch and is illegal). The
// digits on the path, excluding the circle, add up to the number in the
// circle. A two-cell circle holds a two-digit number read left to right, and
// its arrow may start from either of the two circle cells. Two arrows must not
// intersect anywhere. A white cell must be part of exactly one arrow, a blue
// cell may not be part of any arrow, and an orange cell may or may not be.
// "All circles are given" is the setter's statement that no further circles
// (and so no further arrows) exist -- this encoding has exactly these 15.
//
// Model: one identity Var per cell saying which arrow owns it (1-15) or that
// it is unowned (16). A single identity per cell is what makes arrows
// cell-disjoint. The shape of one arrow then needs only three facts:
// ConnectedValues for its identity, a maximum induced degree of 2, and a
// degree-1 cell at the circle end. Connected + degree <= 2 forces a path or a
// cycle; a degree-1 vertex rules out the cycle and is an endpoint of the
// resulting simple path, and "no cell has three arrow neighbours" is exactly
// the no-self-touch rule. So no path-order/rank overlay is needed at all.

const NUM_ARROWS = 15;
const UNUSED = NUM_ARROWS + 1; // identity value for a cell on no arrow
const shape = new Shape('9x9', UNUSED);
const graph = cellGraph(shape);
const gridCells = graph.cells();

// Drawn geometry, transcribed from the 1x1 background squares and the circle
// overlays of the source grid.
const BLUE = ['R1C5', 'R2C8', 'R3C4', 'R4C1', 'R4C9'];
const ORANGE = [
  'R1C8', 'R3C5', 'R4C7', 'R4C8',
  'R5C1', 'R5C6', 'R5C7', 'R5C8', 'R5C9',
  'R6C1', 'R6C6', 'R6C7', 'R6C8', 'R6C9',
  'R7C6', 'R7C7', 'R7C8', 'R7C9',
  'R8C6', 'R8C7', 'R8C8', 'R8C9',
  'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9',
];
// Each arrow's circle cells. A one-cell circle is a single digit; a two-cell
// circle is a horizontal pill, listed tens cell first (read left to right).
const ARROWS = [
  ['R1C2'], ['R1C3'], ['R1C4'], ['R2C6'], ['R3C7'], ['R3C8'], ['R4C4'],
  ['R4C5'], ['R5C3'], ['R6C2'], ['R6C3'], ['R7C1'], ['R8C1'],
  ['R7C4', 'R7C5'], ['R8C4', 'R8C5'],
];

const shaded = new Set([...BLUE, ...ORANGE]);
const white = gridCells.filter((cell) => !shaded.has(cell));
const circleCells = new Set(ARROWS.flat());
const arrowIdOf = (cell) => ARROWS.findIndex((cells) => cells.includes(cell)) + 1;

const identity = graph.makeOverlay('VI');
const arrowValues = Array.from({ length: NUM_ARROWS }, (_, i) => i + 1);

// Counts, among a cell's orthogonal neighbours, how many carry the same arrow
// identity as the cell itself -- that cell's degree within its own arrow. The
// scan is [centre identity, then each in-grid neighbour's identity]. `limit`
// is the largest degree allowed; `exact` additionally demands that degree.
// An unowned centre constrains nothing.
const makeDegreeMachine = (limit, exact) => NFA.encodeSpec({
  startState: { id: null, count: 0 },
  transition: (state, value) => {
    if (state.id === null) return { id: value, count: 0 };
    if (state.id === UNUSED) return state;
    const count = state.count + (value === state.id ? 1 : 0);
    return count > limit ? undefined : { id: state.id, count };
  },
  accept: (state) => !exact || state.id === UNUSED || state.count === exact,
  maxDepth: 5, // a centre plus at most 4 orthogonal neighbours
}, shape);

// A two-cell circle's shaft leaves from one of the two circle cells, so that
// cell has degree 2 (the other circle cell plus the first shaft cell) and the
// other circle cell is the far end of the path, with degree 1. Scans the first
// circle cell's identity and its neighbours' identities, then the second
// cell's and its neighbours'; `firstLen` is where the second block starts.
// (A multi-segment scan would need a 17th symbol, one past this shape's
// 16-value alphabet, so the block boundary is carried as a position instead.)
const makePillEndpointMachine = (firstLen) => NFA.encodeSpec({
  startState: { pos: 0, id: null, count: 0, ok: false },
  transition: (state, value) => {
    if (state.pos === 0) return { pos: 1, id: value, count: 0, ok: false };
    if (state.pos === firstLen) {
      return { pos: state.pos + 1, id: value, count: 0, ok: state.count === 1 };
    }
    return {
      ...state,
      pos: state.pos + 1,
      count: state.count + (value === state.id ? 1 : 0),
    };
  },
  accept: (state) => state.ok || state.count === 1,
  maxDepth: 10, // two circle cells, each with at most 4 orthogonal neighbours
}, shape);

// The arrow sum, counted down rather than up: the circle digits are read
// first and set `remaining`, and every later cell owned by this arrow
// subtracts its digit. Counting down keeps the state bounded by the target
// (at most 98 for a two-digit circle) with no separate target field, which a
// running-sum machine could not do within the compiled-state limit.
// Scan order: the circle digit(s), then [identity, digit] for every other cell.
const makeSumMachine = (arrowId, numCircleCells) => NFA.encodeSpec({
  startState: { phase: 0, remaining: 0, owned: false },
  transition: (state, value) => {
    // Phase 0..numCircleCells-1 accumulate the circle's decimal digits.
    if (state.phase < numCircleCells) {
      return {
        phase: state.phase + 1,
        remaining: state.remaining * 10 + value,
        owned: false,
      };
    }
    // Then alternate: identity of a cell, then that cell's digit.
    if (state.phase === numCircleCells) {
      return { ...state, phase: numCircleCells + 1, owned: value === arrowId };
    }
    const remaining = state.remaining - (state.owned ? value : 0);
    if (remaining < 0) return undefined;
    return { phase: numCircleCells, remaining, owned: false };
  },
  accept: (state) => state.phase === numCircleCells && state.remaining === 0,
}, shape);

const atMostTwoMachine = makeDegreeMachine(2, null);
const exactlyOneMachine = makeDegreeMachine(1, 1);

const degreeConstraints = gridCells
  // A one-cell circle gets the stronger exact-degree constraint below.
  .filter((cell) => !(circleCells.has(cell) && ARROWS[arrowIdOf(cell) - 1].length === 1))
  .map((cell) => new NFA(
    atMostTwoMachine, 'arrow cells have at most two arrow neighbours',
    identity.at(cell), ...identity.at(graph.neighbours(cell)),
  ));

// The circle is the end the arrow grows out of, so it has exactly one arrow
// neighbour. Grounds: the rule calls the circle the start of a single path,
// and the two-digit clarification ("the arrow can start from the 'ones' digit
// or the 'tens' digit") only has content if an arrow has one growth point.
const circleEndpointConstraints = ARROWS
  .filter((cells) => cells.length === 1)
  .map(([cell]) => new NFA(
    exactlyOneMachine, 'one-cell circle is the end of its arrow',
    identity.at(cell), ...identity.at(graph.neighbours(cell)),
  ));

const pillEndpointConstraints = ARROWS
  .filter((cells) => cells.length === 2)
  .map((cells) => {
    const blocks = cells.map(
      (cell) => [identity.at(cell), ...identity.at(graph.neighbours(cell))]);
    return new NFA(
      makePillEndpointMachine(blocks[0].length),
      'two-cell circle: the arrow leaves from one of its cells',
      ...blocks.flat(),
    );
  });

const sumConstraints = ARROWS.map((cells, index) => {
  const others = gridCells.filter((cell) => !cells.includes(cell));
  return new NFA(
    makeSumMachine(index + 1, cells.length), 'arrow sum',
    ...cells,
    ...others.flatMap((cell) => [identity.at(cell), cell]),
  );
});

return [
  shape,
  // The alphabet is widened only to hold 15 arrow identities plus "unowned";
  // the puzzle's digits stay 1-9.
  graph.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  identity.toVar('arrow identity (1-15), or 16 if on no arrow'),
  ...ARROWS.flatMap((cells, index) => cells.map(
    (cell) => new Given(identity.at(cell), index + 1))),
  ...BLUE.map((cell) => new Given(identity.at(cell), UNUSED)),
  ...white.filter((cell) => !circleCells.has(cell)).map(
    (cell) => new Given(identity.at(cell), ...arrowValues)),
  ...arrowValues.map((id) => new ConnectedValues('VI', id)),
  ...degreeConstraints,
  ...circleEndpointConstraints,
  ...pillEndpointConstraints,
  ...sumConstraints,
];
