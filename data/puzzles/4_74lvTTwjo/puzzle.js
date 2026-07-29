// Title: Across the Lines
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=4_74lvTTwjo
// Source: https://sudokupad.app/rnj2zdy7zu

// Normal sudoku rules apply. White dots are consecutive and black dots are in
// a 2:1 ratio; dots are not negative.
//
// A single non-self-touching Redline joins the two drawn dollar signs along cell
// edges. It cannot cross a dot or the train tracks. Each region it creates may
// contain low digits (1-4) or high digits (6-9), but not both; 5 is neutral.
// The words in the grid are decorative. Every rule is encoded.

const LOW = 1;
const HIGH = 2;

// VP is an outgoing step at a lattice vertex. Opposite direction codes sum to 5.
const UP = 1;
const RIGHT = 2;
const LEFT = 3;
const DOWN = 4;
const NONE = 5;
const DIRS = [
  [UP, -1, 0],
  [RIGHT, 0, 1],
  [LEFT, 0, -1],
  [DOWN, 1, 0],
];

const shape = new Shape('9x9', 11);
const graph = cellGraph('9x9');
const vertices = cellGraph('10x10');
const side = graph.makeOverlay('VS');
const step = vertices.makeOverlay('VP');
const pos10 = vertices.makeOverlay('VJ');
const pos11 = vertices.makeOverlay('VK');
const numValues = 11;

const vertexAt = (row, col) => vertices.cells()[row * 10 + col];
const START = vertexAt(2, 0);  // left dollar sign, between rows 2 and 3
const END = vertexAt(0, 4);    // top dollar sign, between columns 4 and 5
const interiorVertices = vertices.cells().filter(vertex => {
  const { row, col } = parseCellId(vertex);
  return row > 1 && row < 10 && col > 1 && col < 10;
});

// Drawn white and black dot edges.
const whiteDots = [
  ['R4C2', 'R5C2'], ['R4C2', 'R4C3'], ['R4C3', 'R5C3'],
  ['R8C1', 'R9C1'], ['R9C1', 'R9C2'], ['R8C4', 'R8C5'],
  ['R8C5', 'R8C6'], ['R1C5', 'R1C6'], ['R1C6', 'R1C7'],
  ['R6C9', 'R7C9'], ['R3C3', 'R3C4'], ['R3C3', 'R4C3'],
  ['R2C2', 'R3C2'], ['R6C8', 'R6C9'], ['R1C8', 'R2C8'],
  ['R2C5', 'R2C6'],
];
const blackDots = [
  ['R4C1', 'R5C1'], ['R4C9', 'R5C9'], ['R5C8', 'R5C9'],
  ['R1C3', 'R2C3'], ['R1C3', 'R1C4'], ['R8C7', 'R8C8'],
  ['R1C2', 'R1C3'], ['R7C7', 'R8C7'],
];

// The grey-and-white train-track drawing, transcribed as its cell-centre path.
const trainTrack = [
  'R9C3', 'R8C3', 'R8C2', 'R7C2', 'R6C2', 'R6C3', 'R6C4',
  'R6C5', 'R5C5', 'R5C6', 'R4C6', 'R4C7', 'R3C7', 'R3C8',
  'R3C9', 'R2C9', 'R1C9',
];

const pairKey = (a, b) => [a, b].sort().join('~');
const blockedCellEdges = new Set([
  ...whiteDots.map(cells => pairKey(...cells)),
  ...blackDots.map(cells => pairKey(...cells)),
  ...trainTrack.slice(1).map((cell, i) => pairKey(trainTrack[i], cell)),
]);

// Convert a lattice segment to the two grid cells it separates. Boundary
// segments have no pair because they border only one grid cell.
const separatedCells = (a, b) => {
  const A = parseCellId(a);
  const B = parseCellId(b);
  if (A.row === B.row) {
    const latticeRow = A.row - 1;
    const col = Math.min(A.col, B.col);
    if (latticeRow === 0 || latticeRow === 9) return [];
    return [makeCellId(latticeRow, col), makeCellId(latticeRow + 1, col)];
  }
  const row = Math.min(A.row, B.row);
  const latticeCol = A.col - 1;
  if (latticeCol === 0 || latticeCol === 9) return [];
  return [makeCellId(row, latticeCol), makeCellId(row, latticeCol + 1)];
};

const isBlocked = cells =>
  cells.length === 2 && blockedCellEdges.has(pairKey(...cells));

// Grid digits remain 1-9 although the two position counters require value 11.
const domains = [
  graph.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  side.makeReplicate(new Given(side.cells()[0], LOW, HIGH)),
  pos10.makeReplicate(new Given(pos10.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9, 10)),
  pos11.makeReplicate(new Given(pos11.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11)),
];

// A vertex's code selects one in-grid outgoing lattice step, or NONE. The start
// must leave the grid-boundary marker and the end must have no outgoing step.
const stepDomainFor = vertex => {
  const legal = DIRS
    .filter(([, dRow, dCol]) => vertices.step(vertex, dRow, dCol))
    .map(([code]) => code);
  if (vertex === START) return new Given(step.at(vertex), ...legal);
  if (vertex === END) return new Given(step.at(vertex), NONE);
  return new Given(step.at(vertex), ...legal, NONE);
};
const interiorStepOrigin = interiorVertices[0];
const allStepDomains = step.makeReplicate(
  new Given(step.cells()[0], UP, RIGHT, LEFT, DOWN, NONE),
);
const boundaryStepDomains = vertices.cells()
  .filter(vertex => !interiorVertices.includes(vertex))
  .map(stepDomainFor);

// Reads a vertex's own outgoing code followed by its neighbours' codes. The
// first endpoint has no incoming step, the second has one, and every other
// vertex has one incoming step exactly when it has an outgoing step.
const inDegreeMachine = (arrivals, fixedWant) => NFA.encodeSpec({
  startState: { i: 0 },
  transition: (state, value) => {
    if (state.i === 0) {
      const want = fixedWant === null ? (value === NONE ? 0 : 1) : fixedWant;
      return { i: 1, want, count: 0 };
    }
    if (state.i > arrivals.length) return undefined;
    const count = state.count + (value === arrivals[state.i - 1] ? 1 : 0);
    return count > state.want
      ? undefined : { i: state.i + 1, want: state.want, count };
  },
  accept: state => state.i === arrivals.length + 1 && state.count === state.want,
}, numValues);

const directionCode = (from, to) => {
  const A = parseCellId(from);
  const B = parseCellId(to);
  return DIRS.find(([, dRow, dCol]) =>
    A.row + dRow === B.row && A.col + dCol === B.col)[0];
};

const inDegreeFor = vertex => {
  const neighbours = vertices.neighbours(vertex);
  const arrivals = neighbours.map(other => 5 - directionCode(vertex, other));
  const fixedWant = vertex === START ? 0 : vertex === END ? 1 : null;
  return new NFA(inDegreeMachine(arrivals, fixedWant), 'redline-degree',
    step.at(vertex), ...step.at(neighbours));
};
// The template is centred one row and column after VP1. Stamping it at the
// top-left 8x8 targets therefore centres its 64 copies on the interior vertices.
const interiorDegreeTargets = vertices.cells().filter(vertex => {
  const { row, col } = parseCellId(vertex);
  return row < 9 && col < 9;
});
const interiorInDegrees = step.makeReplicate(
  inDegreeFor(interiorStepOrigin),
  step.at(interiorDegreeTargets),
);
const boundaryInDegrees = vertices.cells()
  .filter(vertex => !interiorVertices.includes(vertex))
  .map(inDegreeFor);

const advance = (value, modulus) => value === modulus ? 1 : value + 1;

// Each lattice segment reads its endpoint step codes, the side codes of the two
// separated cells when internal, then both modular position counters. A segment
// is used exactly when one endpoint points along it. On internal segments that
// is also exactly when its two cells have different side codes. Dot and track
// crossings are rejected.
const segmentMachine = (forward, sideCount, blocked) => {
  const backward = 5 - forward;
  const total = 6 + sideCount;
  return NFA.encodeSpec({
    startState: { i: 0 },
    transition: (state, value) => {
      if (state.i >= total) return undefined;
      if (state.i === 0) {
        return { i: 1, direction: value === forward ? 'forward' : 'unused' };
      }
      if (state.i === 1) {
        if (value === backward) {
          if (state.direction === 'forward') return undefined;
          if (blocked) return undefined;
          return { i: 2, direction: 'backward' };
        }
        if (blocked && state.direction === 'forward') return undefined;
        return { i: 2, direction: state.direction };
      }
      if (state.i < 2 + sideCount) {
        if (state.i === 2) return { i: 3, direction: state.direction, held: value };
        const differs = value !== state.held;
        const used = state.direction !== 'unused';
        return differs === used
          ? { i: state.i + 1, direction: state.direction } : undefined;
      }
      const counterIndex = state.i - (2 + sideCount);
      if (counterIndex === 0) {
        return { i: state.i + 1, direction: state.direction, held: value };
      }
      if (counterIndex === 1) {
        if (state.direction === 'unused') {
          return { i: state.i + 1, direction: state.direction };
        }
        const [before, after] = state.direction === 'forward'
          ? [state.held, value] : [value, state.held];
        return after === advance(before, 10)
          ? { i: state.i + 1, direction: state.direction } : undefined;
      }
      if (counterIndex === 2) {
        return { i: state.i + 1, direction: state.direction, held: value };
      }
      if (state.direction === 'unused') {
        return { i: state.i + 1, direction: state.direction };
      }
      const [before, after] = state.direction === 'forward'
        ? [state.held, value] : [value, state.held];
      return after === advance(before, 11)
        ? { i: state.i + 1, direction: state.direction } : undefined;
    },
    accept: state => state.i === total,
  }, numValues);
};

const segmentMachines = new Map();
const machineFor = (forward, sideCount, blocked) => {
  const key = `${forward}_${sideCount}_${blocked}`;
  if (!segmentMachines.has(key)) {
    segmentMachines.set(key, segmentMachine(forward, sideCount, blocked));
  }
  return segmentMachines.get(key);
};

// Right and down segments enumerate every lattice edge once.
const segments = vertices.cells().flatMap(vertex => [[0, 1], [1, 0]]
  .map(([dRow, dCol]) => vertices.step(vertex, dRow, dCol))
  .filter(Boolean)
  .map(other => {
    const cells = separatedCells(vertex, other);
    const sideCells = side.at(cells);
    const blocked = isBlocked(cells);
    return new NFA(
      machineFor(directionCode(vertex, other), sideCells.length, blocked),
      'redline-segment',
      step.at(vertex), step.at(other), ...sideCells,
      pos10.at(vertex), pos10.at(other), pos11.at(vertex), pos11.at(other),
    );
  }));

// A vertex outside the path has canonical counter values 1/1. The end is used
// despite having NONE as its outgoing code, so it is the sole exception.
const offPathMachine = NFA.encodeSpec({
  startState: { i: 0 },
  transition: (state, value) => {
    if (state.i === 0) return { i: 1, off: value === NONE };
    if (state.i > 2) return undefined;
    if (state.off && value !== 1) return undefined;
    return { i: state.i + 1, off: state.off };
  },
  accept: state => state.i === 3,
}, numValues);
const offPathPositions = vertices.cells()
  .filter(vertex => vertex !== END)
  .map(vertex => new NFA(offPathMachine, 'redline-position',
    step.at(vertex), pos10.at(vertex), pos11.at(vertex)));

// The start counter anchors path orientation and removes the modular-offset
// symmetry. Advancing both moduli eliminates every detached cycle because their
// least common multiple (110) exceeds the vertex count (100).
const positionAnchor = [
  new Given(pos10.at(START), 1),
  new Given(pos11.at(START), 1),
];

// LOW/HIGH side labels are semantic, so no label-permutation pin is needed.
const digitSideKey = Pair.fnToKey(
  (digit, regionSide) =>
    digit === 5 || (digit <= 4 ? regionSide === LOW : regionSide === HIGH),
  numValues,
);
const digitSides = graph.cells().map(cell =>
  new Pair(digitSideKey, 'redline region', cell, side.at(cell)));

return [
  shape,
  side.toVar('redline side'),
  step.toVar('redline outgoing step'),
  pos10.toVar('redline position modulo 10'),
  pos11.toVar('redline position modulo 11'),
  ...domains,
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  allStepDomains,
  ...boundaryStepDomains,
  interiorInDegrees,
  ...boundaryInDegrees,
  ...segments,
  ...offPathPositions,
  ...positionAnchor,
  ...digitSides,
];
