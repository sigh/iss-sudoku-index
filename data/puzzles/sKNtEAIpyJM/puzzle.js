// Title: On and Off
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=sKNtEAIpyJM
// Source: https://sudokupad.app/geypyx7wpd

// Each VS cell stores the path edges used at that grid cell. State 1 is off;
// states 2-7 are the six possible endpoint directions; states 8-15 combine
// one vertical and one diagonal edge, enforcing segment-type alternation.
// Local edge agreement plus exactly two endpoints permits one open path and
// additional disjoint cycles. ISS has no connectivity primitive for this
// vertical-plus-diagonal graph, so the single-component clause is omitted.
const shapeConstraint = new Shape('9x9', 15);
const graph = cellGraph(shapeConstraint);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const pathShape = graph.makeOverlay('VS');

const OFF = 1;
const U = 'U', D = 'D', UL = 'UL', UR = 'UR', DL = 'DL', DR = 'DR';
const DIRECTIONS = {
  [U]: [-1, 0, D],
  [D]: [1, 0, U],
  [UL]: [-1, -1, DR],
  [UR]: [-1, 1, DL],
  [DL]: [1, -1, UR],
  [DR]: [1, 1, UL],
};
const STATE_EDGES = [
  null,
  [],
  [U], [D], [UL], [UR], [DL], [DR],
  [U, UL], [U, UR], [U, DL], [U, DR],
  [D, UL], [D, UR], [D, DL], [D, DR],
];
const uses = (state, direction) => STATE_EDGES[state].includes(direction);
const isEndpoint = state => STATE_EDGES[state].length === 1;

const squares = ['R1C1', 'R4C7', 'R5C3', 'R5C5', 'R7C2', 'R7C9', 'R8C4'];
const circles = ['R1C4', 'R1C9', 'R3C1', 'R3C5', 'R4C1', 'R7C1', 'R8C1'];

// The widened alphabet is only for path states; Sudoku cells remain digits 1-9.
const gridDigitDomain = graph.makeReplicate(
  new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9),
);

// Border cells may not use an edge that leaves the grid.
const boundaryDomains = gridCells.flatMap(cell => {
  const allowed = Array.from({ length: 15 }, (_, index) => index + 1).filter(state =>
    STATE_EDGES[state].every(direction => {
      const [dRow, dCol] = DIRECTIONS[direction];
      return graph.step(cell, dRow, dCol) !== null;
    }));
  return allowed.length === 15 ? [] : [new Given(pathShape.at(cell), ...allowed)];
});

// Adjacent endpoint states must agree about every possible vertical/diagonal edge.
const forwardDirections = [D, DL, DR];
const edgeAgreementKeys = Object.fromEntries(forwardDirections.map(direction => {
  const opposite = DIRECTIONS[direction][2];
  return [direction, Pair.fnToKey(
    (a, b) => uses(a, direction) === uses(b, opposite),
    geometry,
  )];
}));
const edgeAgreements = forwardDirections.map(direction => {
  const [dRow, dCol] = DIRECTIONS[direction];
  const starts = gridCells.filter(cell => graph.step(cell, dRow, dCol));
  const origin = starts[0];
  const other = graph.step(origin, dRow, dCol);
  // Replicate shifts from R1C1. The down-left template starts at R1C2, so its
  // target anchors are one column left of the actual edge starts.
  const targetAnchors = direction === DL
    ? starts.map(cell => graph.step(cell, 0, -1))
    : starts;
  return pathShape.makeReplicate(new Pair(
    edgeAgreementKeys[direction],
    `path edge ${direction}`,
    pathShape.at(origin), pathShape.at(other),
  ), pathShape.at(targetAnchors));
});

// The two diagonals of a 2x2 meet at the same grid vertex, so they may not both
// be used. Edge agreement means testing their top endpoints is sufficient.
const noDiagonalCrossKey = Pair.fnToKey(
  (topLeft, topRight) => !(uses(topLeft, DR) && uses(topRight, DL)),
  geometry,
);
const crossingStarts = gridCells.filter(topLeft =>
  graph.step(topLeft, 0, 1) && graph.step(topLeft, 1, 0));
const crossingOrigin = crossingStarts[0];
const noDiagonalCrossings = pathShape.makeReplicate(new Pair(
    noDiagonalCrossKey,
    'no diagonal crossing',
    pathShape.at(crossingOrigin),
    pathShape.at(graph.step(crossingOrigin, 0, 1)),
  ), pathShape.at(crossingStarts));

// Exactly two cells are endpoints. Every other on-path state has degree two,
// while OFF has degree zero by construction.
const endpointCountMachine = NFA.encodeSpec({
  startState: { count: 0 },
  transition: ({ count }, state) => {
    const next = count + (isEndpoint(state) ? 1 : 0);
    return next > 2 ? undefined : { count: next };
  },
  accept: ({ count }) => count === 2,
}, geometry);
const endpointCount = new NFA(
  endpointCountMachine,
  'exactly two path endpoints',
  ...pathShape.cells(),
);

// For every geometrically possible four-cell alternating walk, conditionally
// require its four digits to occupy four different modulo-4 classes when all
// three edges of that walk are selected. Reverse copies are deduplicated.
const remainderMachineCache = new Map();
const remainderMachine = directions => {
  const cacheKey = directions.join(',');
  if (remainderMachineCache.has(cacheKey)) return remainderMachineCache.get(cacheKey);
  const machine = NFA.encodeSpec({
    startState: { phase: 0, active: true, remainders: [] },
    transition: ({ phase, active, remainders }, value) => {
      if (phase === 0 || phase === 2 || phase === 4) {
        const direction = directions[phase / 2];
        return { phase: phase + 1, active: active && uses(value, direction), remainders };
      }
      const nextRemainders = active ? [...remainders, value % 4] : remainders;
      if (phase < 6) return { phase: phase + 1, active, remainders: nextRemainders };
      if (!active) return { phase: 7, active: false, remainders: [] };
      return new Set(nextRemainders).size === 4
        ? { phase: 7, active: true, remainders: [] }
        : undefined;
    },
    accept: ({ phase }) => phase === 7,
    maxDepth: 7,
  }, geometry);
  remainderMachineCache.set(cacheKey, machine);
  return machine;
};

const directionType = direction => direction === U || direction === D ? 'vertical' : 'diagonal';
const directionsOfType = type => Object.keys(DIRECTIONS).filter(direction =>
  directionType(direction) === type);
const walkKeys = new Set();
const moduloWindows = [];
for (const start of gridCells) {
  for (const firstDirection of Object.keys(DIRECTIONS)) {
    const secondType = directionType(firstDirection) === 'vertical' ? 'diagonal' : 'vertical';
    for (const secondDirection of directionsOfType(secondType)) {
      for (const thirdDirection of directionsOfType(directionType(firstDirection))) {
        const directions = [firstDirection, secondDirection, thirdDirection];
        const cells = [start];
        for (const direction of directions) {
          const [dRow, dCol] = DIRECTIONS[direction];
          const next = graph.step(cells[cells.length - 1], dRow, dCol);
          if (!next) break;
          cells.push(next);
        }
        if (cells.length !== 4 || new Set(cells).size !== 4) continue;
        const forwardKey = cells.join('-');
        const reverseKey = [...cells].reverse().join('-');
        const walkKey = forwardKey < reverseKey ? forwardKey : reverseKey;
        if (walkKeys.has(walkKey)) continue;
        walkKeys.add(walkKey);
        moduloWindows.push(new NFA(
          remainderMachine(directions),
          'four path remainders',
          pathShape.at(cells[0]), cells[0],
          pathShape.at(cells[1]), cells[1],
          pathShape.at(cells[2]), cells[2],
          cells[3],
        ));
      }
    }
  }
}

// Per target digit, detect whether that digit occurs in a marker of the given
// type, then count matching digits on the corresponding side of the path.
const makeMarkerCountMachine = (target, markerCount, countOnPath) => NFA.encodeSpec({
  startState: { phase: 'markers', markersLeft: markerCount, active: false, onPath: false, count: 0 },
  transition: (state, value) => {
    if (state.phase === 'markers') {
      const markersLeft = state.markersLeft - 1;
      return {
        ...state,
        phase: markersLeft === 0 ? 'shape' : 'markers',
        markersLeft,
        active: state.active || value === target,
      };
    }
    if (state.phase === 'shape') {
      return { ...state, phase: 'digit', onPath: value !== OFF };
    }
    const selected = countOnPath ? state.onPath : !state.onPath;
    const count = state.active
      ? state.count + (selected && value === target ? 1 : 0)
      : 0;
    if (count > target) return undefined;
    return { ...state, phase: 'shape', count };
  },
  accept: state => state.phase === 'shape' && (!state.active || state.count === target),
}, geometry);

const markerCounts = Array.from({ length: 9 }, (_, index) => index + 1).flatMap(target => [
  new NFA(
    makeMarkerCountMachine(target, squares.length, true),
    `square count for ${target}`,
    ...squares,
    ...gridCells.flatMap(cell => [pathShape.at(cell), cell]),
  ),
  new NFA(
    makeMarkerCountMachine(target, circles.length, false),
    `circle count for ${target}`,
    ...circles,
    ...gridCells.flatMap(cell => [pathShape.at(cell), cell]),
  ),
]);

return [
  shapeConstraint,
  gridDigitDomain,
  pathShape.toVar('path edge shape'),
  ...boundaryDomains,
  ...pathShape.at(squares).map(cell => new Given(cell, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15)),
  ...pathShape.at(circles).map(cell => new Given(cell, OFF)),
  ...edgeAgreements,
  noDiagonalCrossings,
  endpointCount,
  ...moduloWindows,
  ...markerCounts,
];
