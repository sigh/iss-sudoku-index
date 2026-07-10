// Title: Lupin's Loop 2 - Space Invasion
// Author: Rab3aron
// Video: https://www.youtube.com/watch?v=LYNLwiEYIYA
// Source: https://sudokupad.app/l00604nlbr

// Partial ISS model: all local loop-shape rules are encoded, but ISS has no
// native single-component connectivity constraint for the unknown loop.

const OFF = 1;
const HORIZ = 2;
const VERT = 3;
const UL = 4;
const UR = 5;
const DL = 6;
const DR = 7;

const ODD_TURNS = 1;
const EVEN_TURNS = 2;

const usesUp = shape => shape === VERT || shape === UL || shape === UR;
const usesDown = shape => shape === VERT || shape === DL || shape === DR;
const usesLeft = shape => shape === HORIZ || shape === UL || shape === DL;
const usesRight = shape => shape === HORIZ || shape === UR || shape === DR;
const isTurn = shape => shape === UL || shape === UR || shape === DL || shape === DR;
const isStraight = shape => shape === HORIZ || shape === VERT;
const isOnLoop = shape => shape !== OFF;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shape = graph.makeOverlay('VS');
const shapeCell = cell => shape.at(cell);
const gridCells = graph.cells();

const constraints = [
  new Shape('9x9'),
  shape.toVar('loop shape'),
];
const add = (...items) => constraints.push(...items);

const whiteDotEdges = [
  ['R5C6', 'R5C7'],
  ['R3C3', 'R4C3'],
  ['R3C7', 'R3C8'],
];

const blockedEdges = [
  ['R2C7', 'R2C8'],
  ['R3C1', 'R4C1'],
  ['R3C8', 'R4C8'],
  ['R4C5', 'R5C5'],
  ['R5C4', 'R6C4'],
  ['R5C8', 'R6C8'],
  ['R6C2', 'R7C2'],
  ['R6C6', 'R6C7'],
  ['R6C8', 'R7C8'],
  ['R7C3', 'R8C3'],
  ['R8C2', 'R8C3'],
  ['R8C7', 'R8C8'],
];

const planets = [
  'R9C9', 'R9C8', 'R9C7', 'R9C6', 'R9C5',
  'R7C9', 'R6C9', 'R2C9', 'R7C8', 'R4C8', 'R2C7',
  'R9C4', 'R9C3', 'R9C2', 'R9C1', 'R8C2', 'R6C1', 'R1C4',
];

const satelliteDishes = ['R4C3', 'R5C5'];

function edgeKey(a, b) {
  return [a, b].sort().join('|');
}

const whiteDotKeys = new Set(whiteDotEdges.map(([a, b]) => edgeKey(a, b)));
const blockedKeys = new Set(blockedEdges.map(([a, b]) => edgeKey(a, b)));

function pointsTo(shapeValue, dR, dC) {
  if (dR === -1 && dC === 0) return usesUp(shapeValue);
  if (dR === 1 && dC === 0) return usesDown(shapeValue);
  if (dR === 0 && dC === -1) return usesLeft(shapeValue);
  if (dR === 0 && dC === 1) return usesRight(shapeValue);
  throw new Error(`unsupported direction ${dR},${dC}`);
}

function allowedShapes(cell) {
  const candidates = [OFF, HORIZ, VERT, UL, UR, DL, DR];
  return candidates.filter(shapeValue => {
    for (const [dR, dC] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      if (!pointsTo(shapeValue, dR, dC)) continue;
      const other = graph.step(cell, dR, dC);
      if (!other || blockedKeys.has(edgeKey(cell, other))) return false;
    }
    return true;
  });
}

// Every shape Var uses only loop-shape codes compatible with the border and
// black-hole borders. Planets must be on the loop.
for (const cell of gridCells) add(new Given(shapeCell(cell), ...allowedShapes(cell)));
for (const cell of planets) add(new Given(shapeCell(cell), HORIZ, VERT, UL, UR, DL, DR));

for (const [a, b] of whiteDotEdges) add(new WhiteDot(a, b));

const edgeAgree = (fromA, fromB) => NFA.encodeSpec({
  startState: { aUses: null },
  transition: ({ aUses }, value) => aUses === null
    ? { aUses: fromA(value) }
    : (aUses === fromB(value) ? { done: true } : undefined),
  accept: ({ done }) => done === true,
}, geometry.numValues);

const edgeRight = edgeAgree(usesRight, usesLeft);
const edgeDown = edgeAgree(usesDown, usesUp);

const loopNonConsecutive = (fromA, isWhiteDot) => NFA.encodeSpec({
  startState: { phase: 'shape' },
  transition: (state, value) => {
    if (state.phase === 'shape') return { phase: 'aDigit', joined: fromA(value) };
    if (state.phase === 'aDigit') return { phase: 'bDigit', joined: state.joined, aDigit: value };
    if (!state.joined || isWhiteDot) return { done: true };
    return Math.abs(state.aDigit - value) === 1 ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);

const nonConsecutiveRight = [
  loopNonConsecutive(usesRight, false),
  loopNonConsecutive(usesRight, true),
];
const nonConsecutiveDown = [
  loopNonConsecutive(usesDown, false),
  loopNonConsecutive(usesDown, true),
];

for (const cell of gridCells) {
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  if (right) {
    const isWhiteDot = whiteDotKeys.has(edgeKey(cell, right));
    add(new NFA(edgeRight, 'edge-h', shapeCell(cell), shapeCell(right)));
    add(new NFA(nonConsecutiveRight[isWhiteDot ? 1 : 0], 'loop-nc-h', shapeCell(cell), cell, right));
  }
  if (down) {
    const isWhiteDot = whiteDotKeys.has(edgeKey(cell, down));
    add(new NFA(edgeDown, 'edge-v', shapeCell(cell), shapeCell(down)));
    add(new NFA(nonConsecutiveDown[isWhiteDot ? 1 : 0], 'loop-nc-v', shapeCell(cell), cell, down));
  }
}

// The Or makes the parity-to-turn mapping global:
//   ODD_TURNS means odd digits turn and even digits go straight.
//   EVEN_TURNS means even digits turn and odd digits go straight.
const parityMachine = selector => NFA.encodeSpec({
  startState: { phase: 'shape' },
  transition: (state, value) => {
    if (state.phase === 'shape') return { phase: 'digit', shapeValue: value };
    const { shapeValue } = state;
    if (shapeValue === OFF) return { done: true };
    const digitIsOdd = value % 2 === 1;
    if (selector === ODD_TURNS) {
      return (isTurn(shapeValue) && digitIsOdd) || (isStraight(shapeValue) && !digitIsOdd)
        ? { done: true }
        : undefined;
    }
    return (isTurn(shapeValue) && !digitIsOdd) || (isStraight(shapeValue) && digitIsOdd)
      ? { done: true }
      : undefined;
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);

const oddTurnsParity = parityMachine(ODD_TURNS);
const evenTurnsParity = parityMachine(EVEN_TURNS);
add(new Or([
  new And(gridCells.map(cell => new NFA(oddTurnsParity, 'odd-turns', shapeCell(cell), cell))),
  new And(gridCells.map(cell => new NFA(evenTurnsParity, 'even-turns', shapeCell(cell), cell))),
]));

const satelliteMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (isOnLoop(value) ? 1 : 0);
    return next > target ? [] : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry.numValues);

function centeredBlock(cell) {
  const { row, col } = parseCellId(cell);
  return graph.block(makeCellId(row - 1, col - 1), 3, 3);
}

for (const cell of satelliteDishes) {
  add(new NFA(satelliteMachine, 'satellite', cell, ...centeredBlock(cell).map(shapeCell)));
}

return constraints;
