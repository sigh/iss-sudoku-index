// Title: Eureka!
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=n4PYNDrvOns
// Source: https://sudokupad.app/jx80un5ofh

// Normal sudoku rules apply. Shade some additional cells grey ("walls") and
// leave some unshaded ("cave"). The cave is one orthogonally-connected group,
// and walls form orthogonally-connected groups that touch an edge of the grid.
// Draw a 1-cell wide loop that moves orthogonally, entering every cave cell
// (and no wall cells). Each digit on the loop in row N differs from its
// neighbours on the loop by at least N. Gold is found in wall cells with digits
// larger than their row number. All possible gold has been given. Digits
// separated by a white dot have consecutive values.
//
// All of it is encoded. Two readings the code commits to:
//   * "1-cell wide" describes the drawn loop: a closed circuit through cell
//     centres that never branches. It is not read as forbidding a 2x2 block of
//     loop cells -- the loop may run alongside itself, so two loop cells can be
//     orthogonally adjacent with no loop step between them.
//   * "its neighbours on the loop" are the two cells the loop steps to. A step
//     inside row N needs a difference of at least N; a step between rows N and
//     N+1 must satisfy the requirement of both cells, so it needs N+1. No two
//     digits differ by 9, so no loop step touches row 9 at all.
// The cave being one orthogonally-connected group is not stated separately
// below: the loop is a single cycle covering exactly the cave, so its cells are
// connected already.

// Every cell either is a wall (OFF) or is on the loop, in which case its value
// names the direction of the loop step leaving it. One step out plus (below)
// one step in gives each loop cell the two loop edges the rules ask for, and
// orients the loop so that it can be numbered.
const OFF = 1, UP = 2, DOWN = 3, LEFT = 4, RIGHT = 5;
const DIRECTIONS = [UP, DOWN, LEFT, RIGHT];
// A cell graph lists neighbours left, right, up, down, so every rule below
// reads them in that order. POINTS_BACK[i] is the value the ith neighbour holds
// when its own step comes into this cell.
const NEIGHBOUR_ORDER = [LEFT, RIGHT, UP, DOWN];
const POINTS_BACK = [RIGHT, LEFT, DOWN, UP];
const NEIGHBOUR_INDEX = Object.fromEntries(
  NEIGHBOUR_ORDER.map((direction, i) => [direction, i]));

const UNFLAGGED = 1, FLAGGED = 2;

const grid = cellGraph('9x9');
const geometry = grid.gridGeometry();
const gridCells = grid.cells();
const numValues = geometry.numValues;

// Each auxiliary layer is the 9x9 board with one ring of cells around it, so
// that every board cell has four neighbours inside the layer and the ring can
// stand for "outside the grid". The ring is wall in the step layer, which is
// what turns "the walls plus the ring are one connected region" into "every
// wall group touches an edge of the grid", with any number of groups allowed.
const PADDED = geometry.numRows + 2;
const padded = cellGraph(`${PADDED}x${PADDED}`);
const paddedOrigin = padded.cells()[0];
// The board sits one row and one column into the padded layer.
const paddedCell = (cell) => {
  const { row, col } = parseCellId(cell);
  return padded.step(paddedOrigin, row, col);
};
const boardPadded = gridCells.map(paddedCell);
const ringPadded = padded.cells().filter(cell => {
  const { row, col } = parseCellId(cell);
  return row === 1 || row === PADDED || col === 1 || col === PADDED;
});

const stepLayer = padded.makeOverlay('VD');
const seamLayer = padded.makeOverlay('VF');
// Three loop-position counters, read modulo 5, 7 and 8. Their lcm (280) exceeds
// any possible loop length, which is what rules out a second loop; see the
// counter rule below. Each layer's spare value m+1 marks a wall cell.
const MODULI = [5, 7, 8];
const counterLayers = ['VP', 'VQ', 'VR'].map(prefix => padded.makeOverlay(prefix));
const stepAt = (cell) => stepLayer.at(paddedCell(cell));
const seamAt = (cell) => seamLayer.at(paddedCell(cell));

// --- Layer domains and the ring. A board cell's step may not leave the board;
// ring cells are wall, carry no seam and hold each counter's wall value.
const layerDomains = [
  ...gridCells.map(cell => {
    const { row, col } = parseCellId(cell);
    const allowed = [OFF, ...DIRECTIONS].filter(direction =>
      !(row === 1 && direction === UP) &&
      !(row === geometry.numRows && direction === DOWN) &&
      !(col === 1 && direction === LEFT) &&
      !(col === geometry.numCols && direction === RIGHT));
    return new Given(stepAt(cell), ...allowed);
  }),
  ...stepLayer.at(ringPadded).map(cell => new Given(cell, OFF)),
  ...seamLayer.at(ringPadded).map(cell => new Given(cell, UNFLAGGED)),
  ...counterLayers.flatMap((layer, i) =>
    layer.at(ringPadded).map(cell => new Given(cell, MODULI[i] + 1))),
];

// --- Given grey cells: walls drawn by the setter (the seven #bababa squares).
const givenWalls = ['R1C1', 'R1C2', 'R1C7', 'R5C1', 'R5C5', 'R5C9', 'R6C5'];
const givenWallRules = givenWalls.map(cell => new Given(stepAt(cell), OFF));

// --- One step in per loop cell, none into a wall. With one step out already in
// the cell's own value, the loop cells become a set of disjoint directed
// cycles: exactly two loop edges at each, and none at a wall.
// Reads the cell's own step, then its four neighbours' steps.
const inDegreeMachine = NFA.encodeSpec({
  startState: { phase: 'self' },
  transition: (state, value) => {
    if (state.phase === 'self') {
      return { phase: 'neighbours', index: 0, count: 0, wanted: value === OFF ? 0 : 1 };
    }
    if (state.phase === 'done') return undefined;
    const count = state.count + (value === POINTS_BACK[state.index] ? 1 : 0);
    if (count > state.wanted) return undefined;
    const index = state.index + 1;
    if (index < NEIGHBOUR_ORDER.length) {
      return { phase: 'neighbours', index, count, wanted: state.wanted };
    }
    return count === state.wanted ? { phase: 'done' } : undefined;
  },
  accept: ({ phase }) => phase === 'done',
}, numValues);
// Stamped over every board cell. The template sits on the first of them rather
// than on the layer's first cell, which is a ring corner with no neighbours.
const inDegreeTargets = stepLayer.at(boardPadded);
const inDegreeOrigin = inDegreeTargets[0];
const inDegrees = new Replicate(
  [new NFA(inDegreeMachine, 'in-degree',
    inDegreeOrigin, ...stepLayer.neighbours(inDegreeOrigin))],
  Replicate.encodeTargetCells(inDegreeTargets, inDegreeOrigin, stepLayer),
  inDegreeOrigin);

// --- The loop leaves a cell by a different edge than it entered by, so two
// cells never step into each other. Read left-to-right along a row and
// top-to-bottom down a column, one Pair covers every shared edge once.
const noReversalKey = (forward, back) => Pair.fnToKey(
  (a, b) => !(a === forward && b === back), geometry);
const noReversals = [
  ...grid.rows().map(row => new Pair(
    noReversalKey(RIGHT, LEFT), 'no-reversal-h', ...row.map(stepAt))),
  ...grid.columns().map(col => new Pair(
    noReversalKey(DOWN, UP), 'no-reversal-v', ...col.map(stepAt))),
];

// --- The seam. The counters below number the loop, so one edge of it has to be
// exempt from the numbering or the loop could not close; the seam cell's
// incoming edge is that one. To keep the choice canonical -- otherwise every
// loop cell in turn would give the same puzzle a fresh solution -- the seam is
// the first loop cell in reading order, and reading order also forces its up
// and left neighbours to be walls, so its two loop edges run right and down.
// Fixing its step to RIGHT then picks one of the two ways round the loop, again
// so that the mirror image is not counted twice.
// Reads the board in reading order, each cell's step then its seam flag.
const seamMachine = NFA.encodeSpec({
  startState: { phase: 'before', pending: null },
  transition: (state, value) => {
    if (state.pending === null) return { phase: state.phase, pending: value };
    if (value !== UNFLAGGED && value !== FLAGGED) return undefined;
    if (state.phase === 'after') {
      return value === FLAGGED ? undefined : { phase: 'after', pending: null };
    }
    if (value === FLAGGED) {
      return state.pending === RIGHT ? { phase: 'after', pending: null } : undefined;
    }
    return state.pending === OFF ? { phase: 'before', pending: null } : undefined;
  },
  accept: ({ phase, pending }) => phase === 'after' && pending === null,
}, numValues);
const seamRule = new NFA(seamMachine, 'seam',
  ...gridCells.flatMap(cell => [stepAt(cell), seamAt(cell)]));

// --- Loop position counters. Along every loop step the counter advances by one
// modulo m, except into the seam cell, and the seam cell itself starts at 1. A
// second loop would contain no seam, so its length would have to be divisible
// by every modulus, hence by lcm(5, 7, 8) = 280 -- more cells than the board
// has. So there is exactly one loop.
// Reads [step, seam flag, own counter] then, per neighbour, [seam flag, counter].
const counterMachine = (m) => NFA.encodeSpec({
  startState: { phase: 'step' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'step':
        return { phase: 'seam', direction: value };
      case 'seam':
        return { phase: 'count', direction: state.direction, flagged: value === FLAGGED };
      case 'count': {
        // Wall cells hold the layer's spare value and impose nothing.
        if (state.direction === OFF) {
          return value === m + 1
            ? { phase: 'flag', index: 0, target: -1, wanted: 0 } : undefined;
        }
        if (value > m) return undefined;
        if (state.flagged && value !== 1) return undefined;
        return {
          phase: 'flag', index: 0,
          target: NEIGHBOUR_INDEX[state.direction],
          wanted: value === m ? 1 : value + 1,
        };
      }
      case 'flag':
        return { ...state, phase: 'value', skip: value === FLAGGED };
      case 'value': {
        if (state.index === state.target && !state.skip && value !== state.wanted) {
          return undefined;
        }
        const index = state.index + 1;
        return index === NEIGHBOUR_ORDER.length ? { phase: 'done' }
          : { phase: 'flag', index, target: state.target, wanted: state.wanted };
      }
      default:
        return undefined;
    }
  },
  accept: ({ phase }) => phase === 'done',
}, numValues);
const counterRules = counterLayers.flatMap((layer, i) => {
  const machine = counterMachine(MODULI[i]);
  return gridCells.map(cell => {
    const seamCell = seamAt(cell);
    const counterCell = layer.at(paddedCell(cell));
    return new NFA(machine, `position-${MODULI[i]}`,
      stepAt(cell), seamCell, counterCell,
      ...seamLayer.neighbours(seamCell).flatMap(
        (flag, j) => [flag, layer.neighbours(counterCell)[j]]));
  });
});

// --- Every wall group touches an edge of the grid: the wall cells and the ring
// around the board are a single orthogonally-connected region.
const wallRegions = new ConnectedValues('VD', OFF);

// --- Loop differences: two cells joined by a loop step differ by at least the
// larger of their two row numbers. Reads [stepA, stepB, digitA, digitB]; the
// step is taken when either cell's own step crosses the shared edge.
const diffEdge = (fromA, fromB, minDifference) => NFA.encodeSpec({
  startState: { phase: 'stepA' },
  transition: (state, value) => {
    if (state.phase === 'stepA') return { phase: 'stepB', joined: value === fromA };
    if (state.phase === 'stepB') {
      return { phase: 'digitA', joined: state.joined || value === fromB };
    }
    if (state.phase === 'digitA') {
      return state.joined ? { phase: 'digitB', digitA: value } : { phase: 'skip' };
    }
    if (state.phase === 'skip') return { phase: 'done' };
    return Math.abs(state.digitA - value) >= minDifference
      ? { phase: 'done' } : undefined;
  },
  accept: ({ phase }) => phase === 'done',
}, numValues);
const memo = (fn) => {
  const cache = new Map();
  return key => (cache.has(key) ? cache : cache.set(key, fn(key))).get(key);
};
const diffRight = memo(minDifference => diffEdge(RIGHT, LEFT, minDifference));
const diffDown = memo(minDifference => diffEdge(DOWN, UP, minDifference));

// Right and down steps from every cell cover each orthogonal pair exactly once.
const diffRules = gridCells.flatMap(cell => {
  const { row } = parseCellId(cell);
  const right = grid.step(cell, 0, 1);
  const down = grid.step(cell, 1, 0);
  return [
    ...(right ? [new NFA(diffRight(row), 'diff-h',
      stepAt(cell), stepAt(right), cell, right)] : []),
    ...(down ? [new NFA(diffDown(row + 1), 'diff-v',
      stepAt(cell), stepAt(down), cell, down)] : []),
  ];
});

// --- Gold. A wall cell carries gold exactly when its digit is larger than its
// row number, and all the gold is drawn, so the five marked cells are above
// their row number and every other cell is at most its row number if it turns
// out to be shaded. Row 9 needs no such pair: no digit exceeds 9.
const goldCells = ['R1C2', 'R1C7', 'R5C1', 'R5C9', 'R6C5'];
const aboveRow = row =>
  Array.from({ length: numValues - row }, (_, i) => row + 1 + i);
const goldRules = goldCells.map(
  cell => new Given(cell, ...aboveRow(parseCellId(cell).row)));

const noGoldKey = memo(row => Pair.fnToKey(
  (direction, digit) => direction !== OFF || digit <= row, geometry));
const noGoldRules = gridCells
  .filter(cell => !goldCells.includes(cell))
  .map(cell => ({ cell, row: parseCellId(cell).row }))
  .filter(({ row }) => row < numValues)
  .map(({ cell, row }) =>
    new Pair(noGoldKey(row), 'no-gold', stepAt(cell), cell));

// --- White dots.
const whiteDots = [
  new WhiteDot('R9C1', 'R9C2'),
  new WhiteDot('R9C2', 'R9C3'),
];

return [
  new Shape('9x9'),
  stepLayer.toVar('step'),
  seamLayer.toVar('seam'),
  ...counterLayers.map((layer, i) => layer.toVar(`position-mod-${MODULI[i]}`)),
  ...layerDomains,
  ...givenWallRules,
  inDegrees,
  ...noReversals,
  seamRule,
  ...counterRules,
  wallRegions,
  ...diffRules,
  ...goldRules,
  ...noGoldRules,
  ...whiteDots,
];
