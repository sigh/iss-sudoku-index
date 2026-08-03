// Title: The Odd Road to 200
// Author: Nordy
// Video: https://www.youtube.com/watch?v=57-5-Oec5nY
// Source: https://app.crackingthecryptic.com/sudoku/gJJJdH8TdN
//
// Standard 9x9 sudoku. The digits along each of two drawn lines multiply to
// 200, each encoded with a running-product NFA capped once the product
// exceeds 200. A solver-discovered 1-cell-wide, non-branching road connects
// the two circled givens R2C1 and R8C6; it may not pass through the other two
// givens (R2C9, R9C1) or through any product-line cell; its digits are all
// odd and sum to 200.
//
// Road membership is a Var cell per grid cell (ON=1, OFF=2): connected + each
// on-cell's count of on orthogonal neighbours equal to its target degree
// (1 at the two given endpoints, 2 elsewhere) forces a single simple path
// between the endpoints, with no separate no-touch check needed -- any
// orthogonal self-touch or branch would push some cell's on-neighbour count
// past its target and is rejected by the degree check itself. Diagonal
// touches are uncounted, matching the rule's explicit exception.

const ON = 1;
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

const road = graph.makeOverlay('VRD');

// --- Givens. R2C1/R8C6 are also the road's circled endpoints; R2C9/R9C1 are
// plain givens the road must avoid.
const roadStart = 'R2C1';
const roadEnd = 'R8C6';
const givens = [
  new Given(roadStart, 9),
  new Given('R2C9', 3),
  new Given(roadEnd, 7),
  new Given('R9C1', 6),
];

// --- Product lines (drawn geometry; both colour layers of each line trace
// the same cells -- one drawn line each): digits multiply to 200.
const productLines = [
  ['R2C6', 'R3C5', 'R4C6', 'R5C7', 'R6C7', 'R6C6'],
  ['R9C3', 'R9C2', 'R8C1', 'R7C1', 'R6C1'],
];
const lineCells = productLines.flat();

function productLineNFA(target) {
  return NFA.encodeSpec({
    startState: 1,
    transition: (state, value) => {
      if (state > target) return; // dead branch: already over target
      return state * value;
    },
    accept: state => state === target,
  }, 9);
}
const productLine200 = productLineNFA(200);
const products = productLines.map(
  cells => new NFA(productLine200, 'product-200', ...cells));

// --- Road membership: every cell is on (1) or off (2). Line cells and the
// two non-endpoint givens are forced off; the endpoints are forced on.
const originCell = road.cells()[0];
const membership = [
  road.makeReplicate(new Given(originCell, ON, OFF)),
  ...road.at(lineCells).map(cell => new Given(cell, OFF)),
  new Given(road.at('R2C9'), OFF),
  new Given(road.at('R9C1'), OFF),
  new Given(road.at(roadStart), ON),
  new Given(road.at(roadEnd), ON),
];

// --- Degree: an on-cell's count of on orthogonal neighbours must equal its
// target (1 at the two endpoints, 2 elsewhere); off cells are unconstrained.
// Connected + this degree sequence forces exactly one simple path between the
// two degree-1 cells (the loop analogue uses degree 2 everywhere).
function degreeMachine(target) {
  return NFA.encodeSpec({
    startState: { phase: 'start' },
    transition: ({ phase, onNeighbours }, membershipValue) => {
      if (phase === 'start') {
        return membershipValue === ON
          ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
      }
      if (phase === 'off') return { phase: 'off' };
      const count = onNeighbours + (membershipValue === ON ? 1 : 0);
      return count > target ? undefined : { phase: 'on', onNeighbours: count };
    },
    accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === target,
  }, geometry.numValues);
}
const endpointDegree = degreeMachine(1);
const pathDegree = degreeMachine(2);
const endpoints = new Set([roadStart, roadEnd]);
const degrees = gridCells.map(cell => new NFA(
  endpoints.has(cell) ? endpointDegree : pathDegree, 'degree',
  ...road.at([cell, ...graph.neighbours(cell)])));

// --- Only odd digits on the road: a per-cell (membership, digit) relation.
const oddIfOnKey = Pair.fnToKey(
  (membershipValue, digit) => membershipValue === OFF || digit % 2 === 1, 9);
const oddOnRoad = gridCells.map(
  cell => new Pair(oddIfOnKey, 'road-odd', road.at(cell), cell));

// --- Road digits sum to 200: a global running sum over all 81 cells (fixed
// row-major order), reading (membership, digit) per cell and adding the digit
// only when on-road. Clamped at target+1 once the running sum can only fail,
// to bound the state count.
const ROAD_TOTAL = 200;
const roadSumMachine = NFA.encodeSpec({
  startState: { phase: 'mem', sum: 0 },
  transition: ({ phase, sum, pendingOn }, value) => {
    if (phase === 'mem') return { phase: 'digit', sum, pendingOn: value === ON };
    const nextSum = pendingOn ? Math.min(sum + value, ROAD_TOTAL + 1) : sum;
    return { phase: 'mem', sum: nextSum };
  },
  accept: ({ phase, sum }) => phase === 'mem' && sum === ROAD_TOTAL,
}, 9);
const roadSum = new NFA(roadSumMachine, 'road-sum-200',
  ...gridCells.flatMap(cell => [road.at(cell), cell]));

return [
  new Shape('9x9'),
  ...givens,
  ...products,
  road.toVar('road'),
  ...membership,
  new ConnectedValues('VRD', ON),
  ...degrees,
  ...oddOnRoad,
  roadSum,
];
