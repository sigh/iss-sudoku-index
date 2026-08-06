// Title: The Slowest Snake
// Author: Dorlir
// Video: https://www.youtube.com/watch?v=d_dFW9Gp6Pc
// Source: https://sudokupad.app/vw1q7megqm

// Rules encoded: normal sudoku; the three killer cages; and the snake, which
// runs between the two grey circles, steps orthogonally or diagonally, may
// cross itself, never enters a grey square, passes through at least 27 cells,
// and reads non-decreasing from one end to the other (which end is the low end
// is left to the solver).
//
// The snake is not drawn, so this script enumerates every snake the rules
// permit and encodes the disjunction over them. The enumeration:
//
//  * Non-decreasing means the cells holding one digit form a single unbroken
//    stretch of the snake.
//  * Two cells consecutive within such a stretch hold the same digit, so they
//    are diagonally adjacent and lie in different boxes: a shared row, column
//    or box could not repeat the digit.
//  * A digit's stretch is therefore a diagonal run of cells whose every step
//    crosses a box border. `runLength` below measures the longest such run on
//    the 9x9 grid; it is 3, so a snake covers at most 9 * 3 = 27 cells and the
//    "at least 27" clue pins it to exactly 27: three cells for every digit,
//    with the digits met in the order 1..9 along the snake.
//  * Crossing lets the snake re-meet a cell or a corner it has already used; it
//    does not let the snake travel one body segment twice. So a run of three is
//    entered at one end and left at the other.
//  * Consecutive runs are one king step apart, runs holding a grey square are
//    barred, and the two circles are the outer ends of the digit-1 and digit-9
//    runs.
//
// Exactly two snakes survive, mirror images in the direction of travel.

const graph = cellGraph('9x9');

// The five drawn grey marks.
const CIRCLES = ['R6C2', 'R7C8'];
const SQUARES = ['R4C3', 'R4C6', 'R7C7'];

// Rules text: "the snake passes through at least 27 cells".
const MIN_CELLS = 27;

const boxOf = new Map();
graph.boxes().forEach((cells, box) => cells.forEach(cell => boxOf.set(cell, box)));

// The one step two cells of a single digit may take between them.
const sameDigitStep = (cell, dC) => {
  const next = graph.step(cell, 1, dC);
  return next && boxOf.get(next) !== boxOf.get(cell) ? next : null;
};

// Every run of same-digit cells, taken as far as it will extend.
const runFrom = (cell, dC) => {
  const run = [cell];
  for (let next = sameDigitStep(cell, dC); next; next = sameDigitStep(next, dC)) {
    run.push(next);
  }
  return run;
};
const allRuns = graph.cells().flatMap(
  cell => [1, -1].map(dC => runFrom(cell, dC)));
const runLength = Math.max(...allRuns.map(run => run.length));
if (runLength * 9 !== MIN_CELLS) throw new Error('run bound does not match the clue');

const runs = allRuns.filter(
  run => run.length === runLength && !run.some(cell => SQUARES.includes(cell)));

// Nine of those runs, cell-disjoint, each traversed end to end, consecutive
// runs a king step apart, from one circle to the other.
const chains = [];
const extend = (chain, exit) => {
  if (chain.length === 9) {
    if (exit === CIRCLES[1]) chains.push(chain);
    return;
  }
  const used = new Set(chain.flat());
  const reachable = graph.kingNeighbours(exit);
  for (const run of runs) {
    if (run.some(cell => used.has(cell))) continue;
    for (const [entry, far] of [[run[0], run[runLength - 1]],
                                [run[runLength - 1], run[0]]]) {
      if (reachable.includes(entry)) extend([...chain, run], far);
    }
  }
};
for (const run of runs) {
  if (run[0] === CIRCLES[0]) extend([run], run[runLength - 1]);
  if (run[runLength - 1] === CIRCLES[0]) extend([run], run[0]);
}

// Reversing a chain is the snake read the other way, the direction the rules
// leave to the solver.
const snakes = chains.flatMap(chain => [chain, [...chain].reverse()]);

// Cage cells and totals as drawn, each marked non-repeating in the source.
return [
  new Shape('9x9'),
  new Cage(6, 'R1C2', 'R2C2'),
  new Cage(6, 'R7C1', 'R8C1'),
  new Cage(6, 'R8C8', 'R9C8'),
  new Or(snakes.map(snake => new And(
    snake.flatMap((run, i) => run.map(cell => new Given(cell, i + 1)))))),
];
