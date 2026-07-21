// Title: NOT ON
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=ZsqBqEUYnpk
// Source: https://sudokupad.app/9rwnig6n8g

// Two Var overlays record the zero, one, or two path edges used at each cell.
// Value 1 means no edge; values 2-9 are the eight directions. Requiring the
// first value to precede the second gives one canonical representation for an
// off-line cell, endpoint, or internal line cell. Local edge agreement, exactly
// two endpoints, and the crossing check encode every local path-shape rule. A
// single connected component and palindromic digit order are omitted because
// ISS cannot express either property on an unknown path with diagonal steps.
const shapeConstraint = new Shape('9x9');
const graph = cellGraph(shapeConstraint);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const firstEdge = graph.makeOverlay('VA');
const secondEdge = graph.makeOverlay('VB');

const NONE = 1;
const U = 2, D = 3, L = 4, R = 5;
const UL = 6, UR = 7, DL = 8, DR = 9;
const DIRECTIONS = {
  [U]: [-1, 0, D],
  [D]: [1, 0, U],
  [L]: [0, -1, R],
  [R]: [0, 1, L],
  [UL]: [-1, -1, DR],
  [UR]: [-1, 1, DL],
  [DL]: [1, -1, UR],
  [DR]: [1, 1, UL],
};
const uses = (first, second, direction) => first === direction || second === direction;

// Canonical cell states are (NONE,NONE), (NONE,direction), or two distinct
// directions in increasing numeric order.
const cellStateKey = Pair.fnToKey(
  (first, second) => first === NONE || first < second,
  geometry,
);
const cellStates = gridCells.map(cell => new Pair(
  cellStateKey,
  'canonical path cell state',
  firstEdge.at(cell), secondEdge.at(cell),
));

// Neither stored edge may leave the grid.
const boundaryDomains = gridCells.flatMap(cell => {
  const allowed = [NONE, ...Object.keys(DIRECTIONS).map(Number).filter(direction => {
    const [dRow, dCol] = DIRECTIONS[direction];
    return graph.step(cell, dRow, dCol) !== null;
  })];
  return allowed.length === 9 ? [] : [
    new Given(firstEdge.at(cell), ...allowed),
    new Given(secondEdge.at(cell), ...allowed),
  ];
});

// Both incident cells must agree whether their shared edge belongs to the line.
const edgeAgreementMachine = (direction, opposite) => NFA.encodeSpec({
  startState: { phase: 0, firstUsesEdge: false, secondUsesEdge: false },
  transition: (state, value) => {
    if (state.phase < 2) {
      return {
        ...state,
        phase: state.phase + 1,
        firstUsesEdge: state.firstUsesEdge || value === direction,
      };
    }
    const secondUsesEdge = state.secondUsesEdge || value === opposite;
    if (state.phase === 2) return { ...state, phase: 3, secondUsesEdge };
    return state.firstUsesEdge === secondUsesEdge
      ? { phase: 4, firstUsesEdge: false, secondUsesEdge: false }
      : undefined;
  },
  accept: ({ phase }) => phase === 4,
}, geometry);
const forwardDirections = [R, D, DR, DL];
const edgeAgreements = forwardDirections.flatMap(direction => {
  const [dRow, dCol, opposite] = DIRECTIONS[direction];
  const machine = edgeAgreementMachine(direction, opposite);
  return gridCells.flatMap(cell => {
    const neighbour = graph.step(cell, dRow, dCol);
    return neighbour ? [new NFA(
      machine,
      `path edge ${direction}`,
      firstEdge.at(cell), secondEdge.at(cell),
      firstEdge.at(neighbour), secondEdge.at(neighbour),
    )] : [];
  });
});

// The two diagonals of a 2x2 cross away from cell centres, so they cannot both
// be used. Other crossings and branches are excluded by the degree-0/1/2 states.
const noDiagonalCrossMachine = NFA.encodeSpec({
  startState: { phase: 0, downRight: false, downLeft: false },
  transition: (state, value) => {
    if (state.phase < 2) {
      return { ...state, phase: state.phase + 1, downRight: state.downRight || value === DR };
    }
    const downLeft = state.downLeft || value === DL;
    if (state.phase === 2) return { ...state, phase: 3, downLeft };
    return state.downRight && downLeft
      ? undefined
      : { phase: 4, downRight: false, downLeft: false };
  },
  accept: ({ phase }) => phase === 4,
}, geometry);
const noDiagonalCrossings = gridCells.flatMap(topLeft => {
  const topRight = graph.step(topLeft, 0, 1);
  const bottomLeft = graph.step(topLeft, 1, 0);
  return topRight && bottomLeft ? [new NFA(
    noDiagonalCrossMachine,
    'no diagonal crossing',
    firstEdge.at(topLeft), secondEdge.at(topLeft),
    firstEdge.at(topRight), secondEdge.at(topRight),
  )] : [];
});

const endpointCountMachine = NFA.encodeSpec({
  startState: { phase: 'first', first: null, count: 0 },
  transition: (state, value) => {
    if (state.phase === 'first') return { ...state, phase: 'second', first: value };
    const next = state.count + (state.first === NONE && value !== NONE ? 1 : 0);
    return next > 2
      ? undefined
      : { phase: 'first', first: null, count: next };
  },
  accept: ({ phase, count }) => phase === 'first' && count === 2,
}, geometry);
const endpointCount = new NFA(
  endpointCountMachine,
  'exactly two path endpoints',
  ...gridCells.flatMap(cell => [firstEdge.at(cell), secondEdge.at(cell)]),
);

// An arrow digit counts cells whose two edge values are NONE in its ray,
// excluding the arrow cell itself.
const arrowCountMachine = NFA.encodeSpec({
  startState: { phase: 'target', target: null, first: null, count: 0 },
  transition: (state, value) => {
    if (state.phase === 'target') return { ...state, phase: 'first', target: value };
    if (state.phase === 'first') return { ...state, phase: 'second', first: value };
    const next = state.count + (state.first === NONE && value === NONE ? 1 : 0);
    return next > state.target
      ? undefined
      : { ...state, phase: 'first', first: null, count: next };
  },
  accept: ({ phase, target, count }) => phase === 'first' && target !== null && count === target,
}, geometry);
const arrowClues = [
  ['R7C5', R], ['R7C6', R], ['R7C3', R], ['R8C3', R],
  ['R4C3', D], ['R1C2', D], ['R7C8', L], ['R7C9', L],
  ['R1C7', L], ['R1C1', D],
];
const arrowConstraints = arrowClues.map(([cell, direction]) => {
  const [dRow, dCol] = DIRECTIONS[direction];
  const ray = graph.ray(cell, dRow, dCol).slice(1);
  return new NFA(
    arrowCountMachine,
    'arrow off-line count',
    cell, ...ray.flatMap(rayCell => [firstEdge.at(rayCell), secondEdge.at(rayCell)]),
  );
});

const cageClues = [
  [43, ['R4C7', 'R4C8', 'R4C9', 'R5C7', 'R5C8', 'R5C9', 'R6C7', 'R6C8', 'R6C9']],
  [15, ['R7C5', 'R7C6', 'R8C6']],
  [19, ['R7C3', 'R8C3', 'R9C3']],
  [41, ['R5C3', 'R5C4', 'R5C5', 'R5C6', 'R6C3', 'R6C4', 'R6C5', 'R6C6']],
  [8, ['R4C4', 'R4C5', 'R4C6']],
  [22, ['R1C3', 'R2C3', 'R3C2', 'R3C3']],
  [13, ['R3C5', 'R3C6', 'R3C7']],
  [8, ['R1C6', 'R2C6']],
  [6, ['R1C7', 'R1C8']],
  [8, ['R5C1', 'R6C1']],
  [4, ['R5C2', 'R6C2', 'R7C2']],
  [12, ['R8C8', 'R8C9', 'R9C8']],
  [11, ['R9C1', 'R9C2']],
];
const cageSumMachine = target => NFA.encodeSpec({
  startState: { phase: 'digit', digit: null, first: null, sum: 0 },
  transition: (state, value) => {
    if (state.phase === 'digit') return { ...state, phase: 'first', digit: value };
    if (state.phase === 'first') return { ...state, phase: 'second', first: value };
    const next = state.sum + (state.first === NONE && value === NONE ? state.digit : 0);
    return next > target
      ? undefined
      : { phase: 'digit', digit: null, first: null, sum: next };
  },
  accept: ({ phase, sum }) => phase === 'digit' && sum === target,
}, geometry);
const cageSumConstraints = cageClues.map(([target, cells]) => new NFA(
  cageSumMachine(target),
  `off-line cage sum ${target}`,
  ...cells.flatMap(cell => [cell, firstEdge.at(cell), secondEdge.at(cell)]),
));

// Only the 41 cage spans cells not already pairwise distinct through one Sudoku
// row, column, or box; all other cage non-repeat rules are baseline-redundant.
const cageDistinctness = new AllDifferent(
  'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R6C3', 'R6C4', 'R6C5', 'R6C6',
);

return [
  shapeConstraint,
  firstEdge.toVar('first path edge'),
  secondEdge.toVar('second path edge'),
  ...cellStates,
  ...boundaryDomains,
  ...edgeAgreements,
  ...noDiagonalCrossings,
  endpointCount,
  ...arrowConstraints,
  cageDistinctness,
  ...cageSumConstraints,
];
