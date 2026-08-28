// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=IDp1EjkerR0
// Source: https://cracking-the-cryptic.web.app/sudoku/8LdPpmbNg6

// Normal sudoku rules apply. There is one snake of odd numbers in the grid,
// whose ends are given, and another snake of even numbers. The snakes cannot
// touch themselves or each other, even diagonally.
//
// The four orange cells/blue cells drawn on the board are the two snakes' ends:
// orange R1C1 (given 9) and R6C6 (given 3) are the odd snake's ends, blue R4C4
// (given 6) and R9C9 (given 8) are the even snake's ends.
//
// Omitted: the four numbers printed outside the grid (above C5 "5", above C6
// "4", left of R5 "2", left of R8 "4"). No rules sentence mentions an outside
// clue and nothing drawn says what they measure, so no reading of them is
// encoded.

// Snake membership, one Var cell per grid cell.
const OFF = 1;
const ODD = 2;   // on the odd-digit snake
const EVEN = 3;  // on the even-digit snake

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

const snake = graph.makeOverlay('VS');

// Drawn givens, read off the board row by row.
const givens = [
  ['R1C1', 9], ['R1C6', 8], ['R1C8', 7],
  ['R2C7', 4],
  ['R3C6', 1], ['R3C8', 5],
  ['R4C4', 6],
  ['R5C5', 9],
  ['R6C1', 1], ['R6C3', 2], ['R6C6', 3],
  ['R7C2', 3],
  ['R8C1', 4], ['R8C3', 5],
  ['R9C9', 8],
].map(([cell, value]) => new Given(cell, value));

// Drawn snake ends: the two orange cells and the two blue cells.
const oddEnds = ['R1C1', 'R6C6'];
const evenEnds = ['R4C4', 'R9C9'];
const ends = new Map([
  ...oddEnds.map(cell => [cell, ODD]),
  ...evenEnds.map(cell => [cell, EVEN]),
]);

const membership = [
  snake.makeReplicate(new Given(snake.cells()[0], OFF, ODD, EVEN)),
  ...[...ends].map(([cell, value]) => new Given(snake.at(cell), value)),
];

// A snake cell's digit has the snake's parity; off-snake cells are unrestricted.
// Reads (membership, digit) for one cell.
const parityKey = Pair.fnToKey(
  (state, digit) => (state === ODD ? digit % 2 === 1
    : state === EVEN ? digit % 2 === 0
      : true),
  geometry.numValues);
const parities = gridCells.map(
  cell => new Pair(parityKey, 'snake-parity', snake.at(cell), cell));

// The snakes cannot touch each other, even diagonally: no odd-snake cell is a
// king neighbour of an even-snake cell.
const apartKey = Pair.fnToKey(
  (a, b) => !((a === ODD && b === EVEN) || (a === EVEN && b === ODD)),
  geometry.numValues);
// Right/down/both diagonals only, so each king pair is covered once. One
// Replicate per direction stamps the pair across every cell the step fits.
const snakesApart = [[0, 1], [1, 0], [1, 1], [1, -1]].map(([dR, dC]) => {
  const targets = snake.cells().filter(cell => snake.step(cell, dR, dC));
  const origin = targets[0];   // reading-order first, so the lowest target index
  return new Replicate(
    [new Pair(apartKey, 'snakes-apart', origin, snake.step(origin, dR, dC))],
    Replicate.encodeTargetCells(targets, origin, snake),
    origin);
});

// Degree: a snake cell has exactly `target` orthogonal neighbours on the same
// snake -- 1 at a drawn end, 2 elsewhere. Reads the cell's own membership, then
// each orthogonal neighbour's. Off cells are unconstrained.
const degreeMachine = target => NFA.encodeSpec({
  startState: { own: null, count: 0 },
  transition: ({ own, count }, state) => {
    if (own === null) return { own: state, count: 0 };
    if (own === OFF) return { own, count };
    const next = count + (state === own ? 1 : 0);
    return next > target ? undefined : { own, count: next };
  },
  accept: ({ own, count }) => own === OFF || count === target,
}, geometry.numValues);
const degreeMachines = new Map([[1, degreeMachine(1)], [2, degreeMachine(2)]]);
const degrees = gridCells.map(cell => new NFA(
  degreeMachines.get(ends.has(cell) ? 1 : 2), 'degree',
  ...snake.at([cell, ...graph.neighbours(cell)])));

// A snake cannot touch itself diagonally. Two diagonally opposite cells on the
// same snake are legal only where the snake bends through one of the other two
// cells of their 2x2 block, so forbid a 2x2 in which one snake occupies just a
// diagonal pair. (Reading it as "no two non-consecutive snake cells are
// diagonally adjacent at all" leaves the snakes unable to bend, and neither
// end pair shares a row or column, so that reading has no solution.)
// Reads the four membership cells of a 2x2 block, left to right, top to bottom.
const noSelfTouchMachine = NFA.encodeSpec({
  // `block` accumulates the 2x2's membership values, and becomes null once the
  // block has passed the check (all further symbols are absorbed).
  startState: { block: [] },
  transition: ({ block }, state) => {
    if (block === null) return { block: null };
    const next = [...block, state];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const bare = (a, b, c, d) =>
      (a === ODD || a === EVEN) && a === b && c !== a && d !== a;
    return bare(topLeft, bottomRight, topRight, bottomLeft)
      || bare(topRight, bottomLeft, topLeft, bottomRight)
      ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, geometry.numValues);
// Cells on the bottom/right edge start no 2x2 block.
const blockOrigins = snake.cells().filter(cell => snake.block(cell, 2, 2));
const noSelfTouches = snake.makeReplicate(
  new NFA(noSelfTouchMachine, 'no-self-touch',
    ...snake.block(blockOrigins[0], 2, 2)),
  blockOrigins);

return [
  new Shape('9x9'),
  snake.toVar('snake'),
  ...givens,
  ...membership,
  // Each snake is one orthogonally connected region; with degree 1 at its two
  // drawn ends and 2 elsewhere that region is a single simple path.
  new ConnectedValues('VS', ODD),
  new ConnectedValues('VS', EVEN),
  ...degrees,
  noSelfTouches,
  ...parities,
  ...snakesApart,
];
