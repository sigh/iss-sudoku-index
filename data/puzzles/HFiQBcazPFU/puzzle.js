// Title: Lupin's Loop 3 - Successorless
// Author: Rab3aron
// Video: https://www.youtube.com/watch?v=HFiQBcazPFU
// Source: https://sudokupad.app/zsmtekox43

// Partial ISS encoding. It models the local loop shape, hut cells, water
// borders, white dots, and loop-adjacent digit rule. It omits the global
// single-component loop requirement and the hut-to-hut segment length clues.
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
const constraints = [new Shape('9x9'), loop.toVar('loop shape')];
const add = (...items) => constraints.push(...items);

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

for (const [a, b] of whiteDots) add(new WhiteDot(a, b));

const ALL_SHAPES = [OFF, HORIZ, VERT, UL, UR, DL, DR];
const directionChecks = [
  [-1, 0, usesUp],
  [1, 0, usesDown],
  [0, -1, usesLeft],
  [0, 1, usesRight],
];

for (const cell of gridCells) {
  const allowed = ALL_SHAPES.filter(shape => {
    for (const [dRow, dCol, usesDirection] of directionChecks) {
      if (!usesDirection(shape)) continue;
      const neighbour = graph.step(cell, dRow, dCol);
      if (!neighbour || blockedEdges.has(edgeKey(cell, neighbour))) return false;
    }
    return true;
  });
  add(new Given(loopCell(cell), ...allowed));
}

for (const hut of huts) {
  add(new Given(loopCell(hut), HORIZ, VERT, UL, UR, DL, DR));
}

const edgeAgree = (fromA, fromB) => NFA.encodeSpec({
  startState: { aUses: null },
  transition: ({ aUses }, value) => {
    if (aUses === null) return { aUses: fromA(value) };
    return aUses === fromB(value) ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);

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

const edgeRight = edgeAgree(usesRight, usesLeft);
const edgeDown = edgeAgree(usesDown, usesUp);
const notConsecutiveRight = nonConsecutiveWhenJoined(usesRight);
const notConsecutiveDown = nonConsecutiveWhenJoined(usesDown);

for (const cell of gridCells) {
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  if (right) {
    add(new NFA(edgeRight, 'loop edge agreement h', loopCell(cell), loopCell(right)));
    if (!whiteDotEdges.has(edgeKey(cell, right))) {
      add(new NFA(notConsecutiveRight, 'loop nonconsecutive h', loopCell(cell), cell, right));
    }
  }
  if (down) {
    add(new NFA(edgeDown, 'loop edge agreement v', loopCell(cell), loopCell(down)));
    if (!whiteDotEdges.has(edgeKey(cell, down))) {
      add(new NFA(notConsecutiveDown, 'loop nonconsecutive v', loopCell(cell), cell, down));
    }
  }
}

return constraints;
