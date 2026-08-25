// Title: Why Can't We Be Friends?
// Author: ryokousha; Philip Newman
// Video: https://www.youtube.com/watch?v=wblIQ4VW8fk
// Source: https://app.crackingthecryptic.com/sudoku/8mrQmDf69T

// Normal sudoku rules apply. A cell is "friendly" when its digit equals its
// own row number, column number, or box number (box numbered 1-9 in reading
// order; the rules' own example, R1C7, admits 1/3/7). The green-shaded "lawn"
// cells are given as friendly. An orthogonally-connected, one-cell-wide path
// (self-avoiding: it cannot touch itself orthogonally) runs between the two
// circled cells, every cell on it -- including the circles -- friendly but
// not lawn; other friendly cells may exist off the path and off the lawn.
// Along each of the two diagonal arrows, the friendly cells' digits sum to
// the same total as the non-friendly cells' digits (both arrows carry a
// blank outside total, so this compares the two groups to each other, not to
// a printed number).
//
// Friendliness is modelled with a parallel Var flag per grid cell: flag 2
// means friendly, flag 1 means not (same shape as the "Friends^2" encoding).
// A per-cell Pair ties the grid digit to its flag using that cell's own
// {row, column, box} set as the truth table.
//
// The path is a second parallel Var flag per grid cell: 1 means on-path, 2
// means off. Endpoints are given on; lawn cells are given off. Each cell's
// on/off degree among its orthogonal neighbours is checked by an NFA -- the
// two circle cells must have exactly one on-path neighbour, every other cell
// exactly two if it is on-path itself (off cells are unconstrained) -- so
// connected (via ConnectedValues) + this degree profile forces exactly one
// simple path between the two circles, and forbids any non-consecutive
// on-path cell from touching another (a self-touch would push some cell's
// on-neighbour count past its allowed degree). A further per-cell Pair
// requires on-path to imply friendly, so the path can only run through
// friendly cells; lawn cells are excluded from it directly by their given
// off flag.
//
// Each arrow's equal-sum rule is one NFA scanning the line's cells
// interleaved with their friendly flags (digit, flag, digit, flag, ...),
// carrying a running signed total: a friendly cell's digit adds, a
// non-friendly cell's digit subtracts. Accepting only a final total of zero
// is exactly "the friendly cells' digits sum to the same total as the
// non-friendly cells' digits". The one spec is compiled once and shared by
// both arrows, so it carries an explicit `maxDepth` (2 symbols per cell,
// bounding the longer 7-cell line) -- without it the compiler treats the
// running total as unbounded and never stops exploring it.
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const cells = graph.cells();

const friendly = graph.makeOverlay('VF');
const path = graph.makeOverlay('VP');

const FRIENDLY = 2;
const UNFRIENDLY = 1;
const ON = 1;
const OFF = 2;

const box = (row, col) =>
  3 * Math.floor((row - 1) / 3) + Math.floor((col - 1) / 3) + 1;

function friendlyPair(cell, flagCell) {
  const { row, col } = parseCellId(cell);
  const friendlySet = new Set([row, col, box(row, col)]);
  const key = Pair.fnToKey(
    (digit, f) => (f === FRIENDLY ? friendlySet.has(digit) : !friendlySet.has(digit)),
    9);
  return new Pair(key, 'friendly', cell, flagCell);
}

function pathImpliesFriendly(pathCell, friendlyCell) {
  const key = Pair.fnToKey((p, f) => p === OFF || f === FRIENDLY, 9);
  return new Pair(key, 'on-path-implies-friendly', pathCell, friendlyCell);
}

// Green "lawn" cells, read from the underlay layer's 1x1 swatches.
const lawnCells = [
  'R1C7', 'R1C8', 'R2C8', 'R2C9', 'R4C7', 'R5C7', 'R4C8', 'R5C8',
  'R5C2', 'R5C3', 'R6C3', 'R6C2', 'R8C1', 'R9C1', 'R9C2',
];

// Circled path endpoints, read from the underlay layer's ring markers.
const endpoints = ['R2C3', 'R8C7'];
const endpointSet = new Set(endpoints);

// Each cell's on/off degree among its orthogonal neighbours: the two circle
// endpoints need exactly one on-path neighbour, every other cell exactly two
// if it is itself on-path (off cells are unconstrained either way).
function makeDegreeMachine(target) {
  return NFA.encodeSpec({
    startState: { phase: 'start' },
    transition: ({ phase, onNeighbours }, membership) => {
      if (phase === 'start') {
        return membership === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
      }
      if (phase === 'off') return { phase: 'off' };
      const count = onNeighbours + (membership === ON ? 1 : 0);
      return count > target ? undefined : { phase: 'on', onNeighbours: count };
    },
    accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === target,
  }, geometry.numValues);
}
const degreeOneMachine = makeDegreeMachine(1);
const degreeTwoMachine = makeDegreeMachine(2);
const degrees = cells.map(cell => new NFA(
  endpointSet.has(cell) ? degreeOneMachine : degreeTwoMachine,
  'path-degree',
  ...path.at([cell, ...graph.neighbours(cell)])));

// Equal-sum split over one arrow's line: reads (digit, friendly-flag) pairs
// in order, accumulating +digit when friendly, -digit otherwise, and accepts
// only a final total of zero.
const equalSumMachine = NFA.encodeSpec({
  startState: { phase: 'digit', sum: 0, pending: null },
  transition: (state, value) => {
    if (state.phase === 'digit') return { phase: 'flag', sum: state.sum, pending: value };
    const contribution = value === FRIENDLY ? state.pending : -state.pending;
    return { phase: 'digit', sum: state.sum + contribution, pending: null };
  },
  accept: (state) => state.phase === 'digit' && state.sum === 0,
  maxDepth: 14,
}, geometry.numValues);
function friendlyVsUnfriendlySum(lineCells) {
  const scan = lineCells.flatMap(cell => [cell, friendly.at(cell)]);
  return new NFA(equalSumMachine, 'friendly-vs-unfriendly-sum', ...scan);
}

// Diagonal arrow lines, read from the arrows' snapped waypoints.
const arrowA = ['R1C7', 'R2C6', 'R3C5', 'R4C4', 'R5C3', 'R6C2', 'R7C1'];
const arrowB = ['R7C9', 'R8C8', 'R9C7'];

return [
  new Shape('9x9'),

  friendly.toVar('friendly flags'),
  friendly.makeReplicate(new Given(friendly.cells()[0], UNFRIENDLY, FRIENDLY)),
  ...cells.map(cell => friendlyPair(cell, friendly.at(cell))),
  ...friendly.at(lawnCells).map(cell => new Given(cell, FRIENDLY)),

  path.toVar('path flags'),
  path.makeReplicate(new Given(path.cells()[0], ON, OFF)),
  ...path.at(endpoints).map(cell => new Given(cell, ON)),
  ...path.at(lawnCells).map(cell => new Given(cell, OFF)),
  new ConnectedValues('VP', ON),
  ...degrees,
  ...cells.map(cell => pathImpliesFriendly(path.at(cell), friendly.at(cell))),

  friendlyVsUnfriendlySum(arrowA),
  friendlyVsUnfriendlySum(arrowB),
];
