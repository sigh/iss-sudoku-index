// Title: Harbor
// Author: Bert
// Video: https://www.youtube.com/watch?v=PlReR38_LYw
// Source: https://app.crackingthecryptic.com/7moj9pjur7

// Normal Sudoku applies. The outlined cells are pier/quay cells with ordinary
// digits; every other cell is water (1-6) or ship (7-9). Ships are straight,
// length two or three, and do not touch, even diagonally. Circled water cells
// count visible water cells in all four directions; ships and pier/quay block.
// Black dots mark some, but not necessarily all, 1:2 ratios. Thermometers rise
// from bulb to tip.

const graph = cellGraph('9x9');
const status = graph.makeOverlay('VH');
const statusVar = status.toVar('harbor status');
const PIER = 1;
const WATER = 2;
const SHIP = 3;

// Pier/quay membership transcribed from the single outlined no-total cage.
const PIER_CELLS = [
  'R4C1', 'R5C1', 'R6C1', 'R6C4', 'R7C1', 'R7C4', 'R7C8', 'R8C1',
  'R8C4', 'R8C8', 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6',
  'R9C7', 'R9C8', 'R9C9',
];
const pierSet = new Set(PIER_CELLS);
const BUOYS = [
  'R1C1', 'R1C5', 'R1C9', 'R3C3', 'R3C7', 'R5C4', 'R6C2', 'R6C8',
  'R7C9', 'R7C6', 'R8C5', 'R8C3',
];
const BLACK_DOTS = [['R3C3', 'R4C3'], ['R4C4', 'R3C4']];
const THERMOS = [
  ['R6C1', 'R5C1'],
  ['R9C7', 'R8C7', 'R7C7', 'R6C7'],
  ['R8C4', 'R7C4', 'R6C4'],
];

// The status layer says pier/quay, water, or ship; its relation to each digit
// is the stated 1-6 / 7-9 classification outside the drawn pier cells.
const digitStatusKey = Pair.fnToKey((digit, state) =>
  state === PIER || (state === WATER && digit <= 6) ||
  (state === SHIP && digit >= 7), 9);
const NON_PIER_CELLS = graph.cells().filter(cell => !pierSet.has(cell));
const statusConstraints = [
  ...PIER_CELLS.map(cell => new Given(status.at(cell), PIER)),
  status.makeReplicate(
    new Given(status.at(NON_PIER_CELLS[0]), WATER, SHIP),
    status.at(NON_PIER_CELLS)),
  ...graph.cells().map(cell =>
    new Pair(digitStatusKey, 'digit status', cell, status.at(cell))),
];

const inBounds = (row, col) => row >= 1 && row <= 9 && col >= 1 && col <= 9;

// For each possible ship cell, enumerate every in-bounds horizontal or vertical
// two/three-cell segment containing it. Its whole eight-neighbour boundary is
// non-ship, which makes the selected segment one complete non-touching ship.
const nonShipSpec = NFA.encodeSpec({
  startState: null,
  transition: (state, value) => state === null && value !== SHIP ? 'ok' : undefined,
  accept: state => state === 'ok',
}, 9);
const nonShip = cell => new NFA(nonShipSpec, 'non-ship status', status.at(cell));

function shipAlternatives(cell) {
  const { row, col } = parseCellId(cell);
  const alternatives = [nonShip(cell)];
  for (const [dr, dc] of [[0, 1], [1, 0]]) {
    for (const length of [2, 3]) {
      for (let offset = 0; offset < length; offset++) {
        const startRow = row - offset * dr;
        const startCol = col - offset * dc;
        const coordinates = Array.from({ length }, (_, i) =>
          [startRow + i * dr, startCol + i * dc]);
        if (!coordinates.every(([r, c]) => inBounds(r, c))) continue;
        const cells = coordinates.map(([r, c]) => makeCellId(r, c));
        const segment = new Set(cells);
        const boundary = [...new Set(cells.flatMap(id => graph.kingNeighbours(id)))]
          .filter(id => !segment.has(id));
        alternatives.push(new And([
          ...cells.map(id => new Given(status.at(id), SHIP)),
          ...boundary.map(nonShip),
        ]));
      }
    }
  }
  return new Or(alternatives);
}

// A directional count Var is one plus the initial water run from its buoy.
// Each NFA reads [count, buoy status, outward statuses] and stops counting at
// the first ship or pier/quay cell.
const sightCounts = new Var('C', 'buoy directional counts', `${BUOYS.length}x4`);
const countVar = (buoyIndex, directionIndex) =>
  sightCounts.cell(buoyIndex + 1, directionIndex + 1);
const sightSpec = NFA.encodeSpec({
  startState: { phase: 'count' },
  transition: (state, value) => {
    if (state.phase === 'count') return { phase: 'centre', remaining: value - 1 };
    if (state.phase === 'centre') {
      return value === WATER ? { phase: 'visible', remaining: state.remaining } : undefined;
    }
    if (state.phase === 'blocked') return state;
    if (value !== WATER) return state.remaining === 0 ? { phase: 'blocked' } : undefined;
    if (state.remaining === 0) return undefined;
    return { phase: 'visible', remaining: state.remaining - 1 };
  },
  accept: state =>
    (state.phase === 'visible' && state.remaining === 0) || state.phase === 'blocked',
}, 9);
const DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const buoyConstraints = BUOYS.flatMap((cell, buoyIndex) => {
  const directional = DIRECTIONS.map(([dr, dc], directionIndex) =>
    new NFA(sightSpec, `buoy sight ${cell} direction ${directionIndex + 1}`,
      countVar(buoyIndex, directionIndex), status.at(cell),
      ...status.at(graph.ray(cell, dr, dc).slice(1))));
  return [
    new Given(cell, 1, 2, 3, 4, 5, 6),
    ...directional,
    new Sum(3, ...DIRECTIONS.map((_, i) => countVar(buoyIndex, i)), [cell, -1]),
  ];
});

return [
  new Shape('9x9'),
  new Given('R1C1', 5),
  statusVar,
  sightCounts,
  ...statusConstraints,
  ...NON_PIER_CELLS.map(shipAlternatives),
  ...buoyConstraints,
  ...BLACK_DOTS.map(cells => new BlackDot(...cells)),
  ...THERMOS.map(cells => new Thermo(...cells)),
];
