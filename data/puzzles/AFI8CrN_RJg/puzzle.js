// Title: Lupin's Loop 5 - Countercount
// Author: Rab3aron
// Video: https://www.youtube.com/watch?v=AFI8CrN_RJg
// Source: https://sudokupad.app/ybaev4x39i

// The VS overlay records which two edges the route uses in every visited cell.
// The nine countercount NFAs each enforce one possible digit N: if N occurs on
// the route, exactly N copies of N occur off the route.

const OFF = 1;
const HORIZ = 2;
const VERT = 3;
const UL = 4;
const UR = 5;
const DL = 6;
const DR = 7;
const ROUTE_SHAPES = [HORIZ, VERT, UL, UR, DL, DR];

const usesUp = value => value === VERT || value === UL || value === UR;
const usesDown = value => value === VERT || value === DL || value === DR;
const usesLeft = value => value === HORIZ || value === UL || value === DL;
const usesRight = value => value === HORIZ || value === UR || value === DR;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const route = graph.makeOverlay('VS');
const routeCell = cell => route.at(cell);
const gridCells = graph.cells();

const airplane = 'R4C6';
const countries = [
  'R1C5', 'R1C7', 'R2C8', 'R2C9', 'R3C3', 'R4C7', 'R4C9', 'R5C6',
  'R7C1', 'R7C7', 'R8C1', 'R8C2', 'R8C4', 'R8C5', 'R9C2', 'R9C3',
];
const turbulenceEdges = [
  ['R4C5', 'R5C5'],
  ['R6C1', 'R7C1'],
  ['R8C5', 'R9C5'],
];

const edgeKey = (a, b) => [a, b].sort().join('|');
const turbulenceKeys = new Set(turbulenceEdges.map(([a, b]) => edgeKey(a, b)));

function pointsTo(value, dRow, dCol) {
  if (dRow === -1) return usesUp(value);
  if (dRow === 1) return usesDown(value);
  if (dCol === -1) return usesLeft(value);
  return usesRight(value);
}

function allowedShapes(cell) {
  return [OFF, ...ROUTE_SHAPES].filter(value => {
    for (const [dRow, dCol] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      if (!pointsTo(value, dRow, dCol)) continue;
      const other = graph.step(cell, dRow, dCol);
      if (!other || turbulenceKeys.has(edgeKey(cell, other))) return false;
    }
    return true;
  });
}

const markedSet = new Set([airplane, ...countries]);
const shapeConstraints = gridCells.map(cell => {
  const allowed = allowedShapes(cell).filter(value =>
    !markedSet.has(cell) || value !== OFF);
  return new Given(routeCell(cell), ...allowed);
});

const edgeAgreeKey = (fromA, fromB) =>
  Pair.fnToKey((a, b) => fromA(a) === fromB(b), geometry.numValues);
const horizontalKey = edgeAgreeKey(usesRight, usesLeft);
const verticalKey = edgeAgreeKey(usesDown, usesUp);
const horizontalStarts = route.at(gridCells
  .filter(cell => graph.step(cell, 0, 1)));
const verticalStarts = route.at(gridCells
  .filter(cell => graph.step(cell, 1, 0)));
const edgeAgreementConstraints = [
  route.makeReplicate(
    new Pair(horizontalKey, 'route-horizontal', routeCell('R1C1'), routeCell('R1C2')),
    horizontalStarts),
  route.makeReplicate(
    new Pair(verticalKey, 'route-vertical', routeCell('R1C1'), routeCell('R2C1')),
    verticalStarts),
];

// The input alternates [digit, membership] for all 81 cells. Counts above N
// collapse immediately to rejection, keeping each target machine small.
function countercountMachine(target) {
  return NFA.encodeSpec({
    startState: { phase: 'digit', onSeen: false, offCount: 0 },
    transition: (state, value) => {
      if (state.phase === 'digit') {
        return { ...state, phase: 'membership', isTarget: value === target };
      }
      const onSeen = state.onSeen || (state.isTarget && value !== OFF);
      const offCount = state.offCount + (state.isTarget && value === OFF ? 1 : 0);
      return offCount > target
        ? undefined
        : { phase: 'digit', onSeen, offCount };
    },
    accept: state => state.phase === 'digit' &&
      (!state.onSeen || state.offCount === target),
  }, geometry.numValues);
}

const digitAndMembership = gridCells.flatMap(cell => [cell, routeCell(cell)]);
const countercountConstraints = Array.from({ length: 9 }, (_, index) => {
  const target = index + 1;
  return new NFA(countercountMachine(target), `countercount-${target}`,
    ...digitAndMembership);
});

return [
  new Shape('9x9'),
  route.toVar('route'),
  ...shapeConstraints,
  ...edgeAgreementConstraints,
  new ConnectedValues('VS', ROUTE_SHAPES),
  new GreaterThan('R5C9', 'R5C8'),
  new GreaterThan('R8C6', 'R8C7'),
  ...countercountConstraints,
];
