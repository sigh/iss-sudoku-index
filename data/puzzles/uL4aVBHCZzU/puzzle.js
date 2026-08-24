// Title: SVS (307) - Sum Snake Sudoku
// Author: Richard Stolk
// Video: https://www.youtube.com/watch?v=uL4aVBHCZzU
// Source: https://app.crackingthecryptic.com/sudoku/QTJhB83Bfh
//
// Standard 9x9 sudoku (default row/column/box regions match the payload's own
// regions). A snake starts and ends at the two circled cells, steps only
// orthogonally, and never touches itself, not even diagonally. Each outside
// clue gives the sum of the snake's digits in that row/column.
//
// Snake membership is a Var cell per grid cell (1 = on the snake, 2 = off),
// shaped into a simple path by: degree-1 at the two given endpoints,
// degree-2 at every other on-snake cell (both over orthogonal adjacency), a
// no-diagonal-touch NFA per 2x2 block, and single connectivity of the
// on-snake cells -- together these force exactly one simple path between
// the two endpoints (never a branch, never a second disjoint loop/path).
//
// Each row/column sum clue is one NFA scanning that line's (membership,
// digit) pairs and totalling the digit only where membership is on-snake.

const ON = 1;
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// Endpoints: drawn circle underlays at [5.5, 2.5] and [4.5, 8.5] (row-first,
// 0-indexed centers) -> R6C3 and R5C9.
const endpoints = ['R6C3', 'R5C9'];

const snake = graph.makeOverlay('VS');
const originCell = snake.cells()[0];

const membership = [
  snake.makeReplicate(new Given(originCell, ON, OFF)),
  ...endpoints.map(cell => new Given(snake.at(cell), ON)),
];

// --- Degree: on-snake endpoints have exactly one on-snake neighbour; every
// other on-snake cell has exactly two. Off cells are unconstrained.
function degreeMachine(requiredDegree) {
  return NFA.encodeSpec({
    startState: { phase: 'start' },
    transition: ({ phase, onNeighbours }, value) => {
      if (phase === 'start') {
        return value === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
      }
      if (phase === 'off') return { phase: 'off' };
      const count = onNeighbours + (value === ON ? 1 : 0);
      return count > requiredDegree ? undefined : { phase: 'on', onNeighbours: count };
    },
    accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === requiredDegree,
  }, geometry.numValues);
}
const endpointDegree = degreeMachine(1);
const pathDegree = degreeMachine(2);
const degrees = gridCells.map(cell => new NFA(
  endpoints.includes(cell) ? endpointDegree : pathDegree,
  'degree', ...snake.at([cell, ...graph.neighbours(cell)])));

// --- No diagonal self-touch: forbid a 2x2 block whose only on-snake cells
// are a diagonal pair.
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
// Every 2x2 block is the same 4-cell shape shifted around the grid, so stamp
// one template (anchored at the grid's first cell) onto every valid anchor
// with Replicate instead of building 64 near-identical NFA constraints.
const blockAnchors = gridCells.filter(cell => graph.block(cell, 2, 2));
const noDiagonalTouchTemplate = new NFA(
  noDiagonalTouchMachine, 'no-touch', ...snake.at(graph.block(blockAnchors[0], 2, 2)));
const noDiagonalTouches = snake.makeReplicate(
  noDiagonalTouchTemplate, snake.at(blockAnchors));

// --- Row/column snake-sum clues. One NFA per line, reading (membership,
// digit) for each of the line's 9 cells and totalling the digit wherever
// membership is on-snake. Targets are the drawn outside-clue numbers.
function lineSumMachine(target) {
  return NFA.encodeSpec({
    startState: { phase: 'wait', sum: 0 },
    transition: ({ phase, sum, onFlag }, value) => {
      if (phase === 'wait') return { phase: 'digit', sum, onFlag: value === ON };
      const nextSum = sum + (onFlag ? value : 0);
      return nextSum > target ? undefined : { phase: 'wait', sum: nextSum };
    },
    accept: ({ phase, sum }) => phase === 'wait' && sum === target,
  }, geometry.numValues);
}
const lineSymbols = cells => cells.flatMap(cell => [snake.at(cell), cell]);

const rowTargets = [13, 12, 20, 15, 27, 30, 41, 5, 33];
const columnTargets = [22, 15, 13, 22, 17, 38, 42, 7, 20];
const rowSums = rowTargets.map((target, i) => new NFA(
  lineSumMachine(target), 'row-sum', ...lineSymbols(graph.row(i + 1))));
const columnSums = columnTargets.map((target, i) => new NFA(
  lineSumMachine(target), 'column-sum', ...lineSymbols(graph.column(i + 1))));

return [
  new Shape('9x9'),
  snake.toVar('snake'),
  ...membership,
  new ConnectedValues('VS', ON),
  ...degrees,
  noDiagonalTouches,
  ...rowSums,
  ...columnSums,
];
