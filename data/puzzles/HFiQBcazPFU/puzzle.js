// Title: Lupin's Loop 3 - Successorless
// Author: Rab3aron
// Video: https://www.youtube.com/watch?v=HFiQBcazPFU
// Source: https://sudokupad.app/zsmtekox43

// Partial ISS encoding. It models the local loop shape, hut cells, water
// borders, white dots, loop-adjacent digit rule, and global single-region
// loop connectivity. It omits the hut-to-hut segment length clues (distance
// along an unknown discovered loop is not expressible).
const OFF = 1, HORIZ = 2, VERT = 3, UL = 4, UR = 5, DL = 6, DR = 7;
const usesUp = s => s === VERT || s === UL || s === UR;
const usesDown = s => s === VERT || s === DL || s === DR;
const usesLeft = s => s === HORIZ || s === UL || s === DL;
const usesRight = s => s === HORIZ || s === UR || s === DR;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const loop = graph.makeOverlay('VL');
const loopCell = cell => loop.at(cell);
const gridCells = graph.cells();

const huts = [
  'R1C5',
  'R3C1', 'R3C2', 'R3C6', 'R3C7',
  'R5C5', 'R5C9',
  'R6C2',
  'R7C6',
  'R8C1', 'R8C2', 'R8C5', 'R8C7', 'R8C8',
  'R9C1', 'R9C2', 'R9C5', 'R9C6', 'R9C7',
];

const whiteDots = [
  ['R1C1', 'R1C2'],
  ['R2C4', 'R3C4'],
  ['R2C5', 'R3C5'],
  ['R3C8', 'R4C8'],
];

const waterBorders = [
  ['R1C3', 'R1C4'],
  ['R4C6', 'R5C6'],
  ['R5C4', 'R6C4'],
  ['R6C9', 'R7C9'],
  ['R8C6', 'R8C7'],
];

const edgeKey = (a, b) => [a, b].sort().join('|');
const whiteDotEdges = new Set(whiteDots.map(([a, b]) => edgeKey(a, b)));
const blockedEdges = new Set(waterBorders.map(([a, b]) => edgeKey(a, b)));

const ALL_SHAPES = [OFF, HORIZ, VERT, UL, UR, DL, DR];
const directionChecks = [
  [-1, 0, usesUp],
  [1, 0, usesDown],
  [0, -1, usesLeft],
  [0, 1, usesRight],
];

// 2-cell relation: the first cell uses the edge (fromA) iff the second uses
// it back (fromB).
const edgeAgreeKey = (fromA, fromB) =>
  Pair.fnToKey((a, b) => fromA(a) === fromB(b), geometry.numValues);

const nonConsecutiveWhenJoined = fromA => NFA.encodeSpec({
  startState: { phase: 'shape' },
  transition: (state, value) => {
    if (state.phase === 'shape') return { phase: 'digitA', joined: fromA(value) };
    if (state.phase === 'digitA') return { phase: 'digitB', joined: state.joined, digitA: value };
    if (!state.joined || Math.abs(state.digitA - value) !== 1) return { done: true };
    return undefined;
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);

const edgeRightKey = edgeAgreeKey(usesRight, usesLeft);
const edgeDownKey = edgeAgreeKey(usesDown, usesUp);
const notConsecutiveRight = nonConsecutiveWhenJoined(usesRight);
const notConsecutiveDown = nonConsecutiveWhenJoined(usesDown);

// Degree here comes from each on-loop cell's shape code (always exactly two
// directions) plus the edge-agreement Pairs above, not from a count of all
// orthogonally-adjacent on-loop neighbours. So two on-loop cells can be plain
// orthogonal neighbours without their shared edge being "used" (both sides
// mutually agree not to use it) -- a loop strand running directly alongside
// another without the shapes joining them. ConnectedValues sees such cells as
// connected (it is cell connectivity, not loop-edge connectivity), so it
// rules out fully separate loop components but does not by itself prove a
// single simple cycle when strands can touch this way.

return [
  new Shape('9x9'),
  loop.toVar('loop shape'),
  // --- Global loop connectivity: the on-loop cells (shape != OFF) must form a
  // single orthogonally-connected region. `loop` is a whole grid layer (one Var
  // per cell), so ConnectedValues applies directly. This is CELL connectivity,
  // not edge/loop connectivity, so it rules out entirely separate (fully
  // non-adjacent) loop components but does not by itself prove one simple
  // cycle -- see the note near the bottom of this file for why the residual
  // gap is narrowed rather than closed here.
  new ConnectedValues('VL', [HORIZ, VERT, UL, UR, DL, DR]),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  ...gridCells.map(cell => {
    const allowed = ALL_SHAPES.filter(shape => {
      for (const [dRow, dCol, usesDirection] of directionChecks) {
        if (!usesDirection(shape)) continue;
        const neighbour = graph.step(cell, dRow, dCol);
        if (!neighbour || blockedEdges.has(edgeKey(cell, neighbour))) return false;
      }
      return true;
    });
    return new Given(loopCell(cell), ...allowed);
  }),
  ...huts.map(hut => new Given(loopCell(hut), HORIZ, VERT, UL, UR, DL, DR)),
  loop.makeReplicate(
    new Pair(edgeRightKey, 'loop edge agreement h', loopCell('R1C1'), loopCell('R1C2')),
    gridCells.filter(cell => graph.step(cell, 0, 1)).map(loopCell)),
  loop.makeReplicate(
    new Pair(edgeDownKey, 'loop edge agreement v', loopCell('R1C1'), loopCell('R2C1')),
    gridCells.filter(cell => graph.step(cell, 1, 0)).map(loopCell)),
  ...gridCells.flatMap(cell => {
    const right = graph.step(cell, 0, 1);
    const down = graph.step(cell, 1, 0);
    return [
      ...(right && !whiteDotEdges.has(edgeKey(cell, right)) ? [new NFA(notConsecutiveRight, 'loop nonconsecutive h', loopCell(cell), cell, right)] : []),
      ...(down && !whiteDotEdges.has(edgeKey(cell, down)) ? [new NFA(notConsecutiveDown, 'loop nonconsecutive v', loopCell(cell), cell, down)] : []),
    ];
  }),
];
