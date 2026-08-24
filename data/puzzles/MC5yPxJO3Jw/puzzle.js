// Title: Untitled Goose Sudoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=MC5yPxJO3Jw
// Source: https://app.crackingthecryptic.com/sudoku/QnPHbRQqbB
//
// Standard 9x9 sudoku, no givens. A hidden "goose path" of orthogonally
// connected cells runs from R9C2 to R1C8, visits every box and every cage
// below, and does not touch itself orthogonally or diagonally. Cages hold no
// repeated digits and total only their cells that are NOT on the goose path.
// Grey cells are off the path and hold an even digit equal to the count of
// goose-path cells among their up-to-8 king-move neighbours.
//
// Path membership is a Var overlay per grid cell (ON/OFF). Endpoints are
// degree-1, all other on-path cells are degree-2; combined with
// ConnectedValues (one connected region), degree-2 elsewhere plus two
// degree-1 endpoints forces exactly one simple path.

const ON = 1;
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

const path = graph.makeOverlay('VP');

const START = 'R9C2';
const END = 'R1C8';

// Grey cells: off the path, even digit counting on-path king neighbours.
// Source: SudokuPad `underlays`, the six 0.8x0.8 #CFCFCF squares.
const GREY_CELLS = ['R2C5', 'R3C1', 'R4C5', 'R7C6', 'R5C8', 'R9C8'];

// Cages: total is the sum of the cage's off-path cells; all cage cells are
// pairwise different. Source: SudokuPad `cages` array, 0-indexed cells
// converted to R#C#.
const CAGES = [
  { total: 16, cells: ['R7C8', 'R8C8', 'R8C9', 'R9C9'] },
  { total: 6, cells: ['R7C7', 'R8C7', 'R9C7'] },
  { total: 12, cells: ['R8C6', 'R9C6', 'R9C5', 'R9C4'] },
  { total: 10, cells: ['R7C4', 'R7C5', 'R8C4', 'R8C5'] },
  { total: 14, cells: ['R7C2', 'R7C3', 'R8C3', 'R9C3'] },
  { total: 17, cells: ['R8C2', 'R8C1', 'R9C1'] },
  { total: 2, cells: ['R5C1', 'R6C1', 'R7C1'] },
  { total: 16, cells: ['R4C1', 'R4C2', 'R5C2', 'R6C2', 'R6C3'] },
  { total: 8, cells: ['R5C3', 'R4C3', 'R4C4'] },
  { total: 39, cells: ['R3C3', 'R3C2', 'R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3', 'R2C3', 'R2C2'] },
  { total: 16, cells: ['R5C4', 'R5C5', 'R5C6', 'R4C6'] },
  { total: 8, cells: ['R6C4', 'R6C5', 'R6C6'] },
  { total: 7, cells: ['R6C7', 'R6C8', 'R6C9', 'R7C9'] },
  { total: 20, cells: ['R4C7', 'R4C8', 'R4C9', 'R5C9', 'R5C8', 'R5C7'] },
  { total: 12, cells: ['R2C6', 'R3C6', 'R3C5', 'R3C4'] },
  { total: 19, cells: ['R2C4', 'R1C4', 'R1C6', 'R1C5'] },
  { total: 25, cells: ['R1C7', 'R1C9', 'R2C9', 'R2C8', 'R2C7', 'R3C7', 'R3C8', 'R3C9'] },
];

// --- Path membership: every cell is on (1) or off (2); endpoints on, greys off.
const originCell = path.cells()[0];
const membership = [
  path.makeReplicate(new Given(originCell, ON, OFF)),
  new Given(path.at(START), ON),
  new Given(path.at(END), ON),
  ...path.at(GREY_CELLS).map(cell => new Given(cell, OFF)),
];

// Single connected region of on-path cells.
const connectivity = new ConnectedValues('VP', ON);

// --- Degree: each on-path cell has exactly `target` on-path orthogonal
// neighbours (1 for the two endpoints, 2 elsewhere); off cells are free.
// Reads the cell's own membership, then each neighbour's.
function makeDegreeMachine(target) {
  return NFA.encodeSpec({
    startState: { phase: 'start' },
    transition: ({ phase, onNeighbours }, value) => {
      if (phase === 'start') {
        return value === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
      }
      if (phase === 'off') return { phase: 'off' };
      const count = onNeighbours + (value === ON ? 1 : 0);
      return count > target ? undefined : { phase: 'on', onNeighbours: count };
    },
    accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === target,
  }, geometry.numValues);
}
const endpointDegree = makeDegreeMachine(1);
const throughDegree = makeDegreeMachine(2);
const degrees = gridCells.map(cell => new NFA(
  (cell === START || cell === END) ? endpointDegree : throughDegree,
  'degree', ...path.at([cell, ...graph.neighbours(cell)])));

// --- No diagonal self-touch: forbid a 2x2 block whose only on-path cells are
// a diagonal pair. Reads the four membership cells of a 2x2 block in order.
const noDiagonalTouchMachine = NFA.encodeSpec({
  startState: { block: [] },
  transition: ({ block }, value) => {
    if (block === null) return { block: null };
    const next = [...block, value === ON];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    return diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, geometry.numValues);
// One template NFA anchored at the grid's first cell, replicated (shifted) to
// every other valid 2x2-block top-left, instead of one stamped NFA per block.
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2) !== null);
const noDiagonalTouchTemplate = new NFA(noDiagonalTouchMachine, 'no-touch',
  ...path.at(graph.block(gridCells[0], 2, 2)));
const noDiagonalTouches = path.makeReplicate(noDiagonalTouchTemplate, path.at(blockOrigins));

// --- Coverage: the path visits every box and every cage (>=1 on-path cell).
const boxCoverage = graph.boxes().map(cells =>
  new Or(cells.map(cell => new Given(path.at(cell), ON))));
const cageCoverage = CAGES.map(({ cells }) =>
  new Or(cells.map(cell => new Given(path.at(cell), ON))));

// --- Cage rules: all cells in a cage differ; the total counts only off-path
// cells. The sum NFA reads each cage's cells as (digit, membership) pairs in
// cage order, accumulating digits whose membership is OFF, clamped at
// target+1 so the state stays bounded.
// Skip a cage whose cells are exactly one box's cells: the box's own
// all-different already covers it (the R1-3C1-3 cage below).
const boxCellSets = graph.boxes().map(cells => new Set(cells));
const isWholeBox = cells => boxCellSets.some(box =>
  box.size === cells.length && cells.every(cell => box.has(cell)));
const cageDistinct = CAGES
  .filter(({ cells }) => !isWholeBox(cells))
  .map(({ cells }) => new AllDifferent(...cells));
const cageSumNFAs = CAGES.map(({ total, cells }) => {
  const machine = NFA.encodeSpec({
    startState: { phase: 'digit', sum: 0, pending: null },
    transition: ({ phase, sum, pending }, value) => {
      if (phase === 'digit') return { phase: 'membership', sum, pending: value };
      // phase === 'membership': add the pending digit only if this cell is off-path.
      const next = Math.min(sum + (value === OFF ? pending : 0), total + 1);
      return { phase: 'digit', sum: next, pending: null };
    },
    accept: ({ phase, sum }) => phase === 'digit' && sum === total,
  }, geometry.numValues);
  return new NFA(machine, 'cage-sum', ...cells.flatMap(cell => [cell, path.at(cell)]));
});

// --- Grey cells: even digit equal to the count of on-path king neighbours.
const greyParity = GREY_CELLS.map(cell => new Given(cell, 2, 4, 6, 8));
const countMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (value === ON ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry.numValues);
const greyCounts = GREY_CELLS.map(cell => new NFA(
  countMachine, 'grey-count', cell, ...path.at(graph.kingNeighbours(cell))));

return [
  new Shape('9x9'),
  path.toVar('goose path'),
  ...membership,
  connectivity,
  ...degrees,
  noDiagonalTouches,
  ...boxCoverage,
  ...cageCoverage,
  ...cageDistinct,
  ...cageSumNFAs,
  ...greyParity,
  ...greyCounts,
];
