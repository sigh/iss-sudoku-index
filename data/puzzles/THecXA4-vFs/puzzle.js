// Title: Snake Egg
// Author: Serkan Yurekli
// Video: https://www.youtube.com/watch?v=THecXA4-vFs
// Source: https://cracking-the-cryptic.web.app/sudoku/bMgDT4PhpT

// Draw a snake (a 1-cell-wide path) whose head and tail are the two circled
// cells; it may touch itself diagonally, but not orthogonally, and may not
// revisit a cell. Besides the snake, the remaining cells form exactly nine
// white areas, one of each size 1-9; a numbered cell belongs to a white area
// of that size.
//
// There is no Sudoku rule here (no row/column/box digit sets), so the puzzle
// lives on a raw grid whose own values double as area labels: 0 marks a
// snake cell, and 1-9 on a non-snake cell is that area's own size -- so a
// given number already reads as the rule's own "numbers in the grid" clue,
// with no extra mapping. Snake endpoints (circled in the source):
// R8C6, R8C10. Numbered givens (source cells[1][6]/[5][6]): R2C7=1, R6C7=2.
// Cell ids beyond 9 use the base-17 single-character convention (10 = 'a'),
// so column/row 10 is written 'a', e.g. R8C10 is 'R8Ca'.
const shape = new Shape('10x10', '0-9', 'Raw');
const SNAKE = 0;
// cellGraph(shape), not cellGraph('10x10'): the bare dims default to
// valueOffset 0, but the declared 0-9 range carries valueOffset -1, and the
// degree NFA below needs the real offset to read grid values correctly.
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

const head = 'R8C6';
const tail = 'R8Ca';

const givens = [
  new Given(head, SNAKE),
  new Given(tail, SNAKE),
  new Given('R2C7', 1),
  new Given('R6C7', 2),
];

// Each label 1-9 is its own area's size, so "one white area of each size
// 1-9" is nine ConnectedValues, one per label, each sized to match its own
// value -- the same label-is-the-size pattern as an Isofill/Fillomino
// region. The snake is one connected path of unspecified length (whatever
// remains once the nine white areas are placed).
const areas = [
  ...Array.from({ length: 9 }, (_, i) => i + 1)
    .map(size => new ConnectedValues('', size, size)),
  new ConnectedValues('', SNAKE),
];

// Path shape: one degree machine per target degree (1 at the two endpoints,
// 2 at every other snake cell -- non-snake cells are unconstrained). Each
// machine reads a cell's own value, then each orthogonal neighbour's value,
// and accepts iff the count of SNAKE neighbours equals its target. This
// both forbids branching and forbids an orthogonal self-touch (a self-touch
// would give some snake cell a third SNAKE neighbour); diagonal neighbours
// are never read, so a diagonal touch stays legal, matching the rules text.
const degreeMachineCache = new Map();
const degreeMachine = (target) => {
  if (degreeMachineCache.has(target)) return degreeMachineCache.get(target);
  const machine = NFA.encodeSpec({
    startState: { phase: 'start' },
    transition: ({ phase, snakeNeighbours }, value) => {
      if (phase === 'start') {
        return value === SNAKE ? { phase: 'on', snakeNeighbours: 0 } : { phase: 'off' };
      }
      if (phase === 'off') return { phase: 'off' };
      const count = snakeNeighbours + (value === SNAKE ? 1 : 0);
      return count > target ? undefined : { phase: 'on', snakeNeighbours: count };
    },
    accept: ({ phase, snakeNeighbours }) => phase === 'off' || snakeNeighbours === target,
  }, geometry);
  degreeMachineCache.set(target, machine);
  return machine;
};

// Interior cells (rows/cols 2-9) always have all four orthogonal neighbours,
// in the same [left, right, up, down] order regardless of position, so a
// target-2 machine at one interior cell is a pure grid-shift of the same
// machine at any other -- replicate the template instead of restating it
// 63 times. `head` is interior but wants target 1, so it is excluded and
// handled below with the other target-1/target-2 special cases.
const interiorCells = [];
for (let r = 2; r <= 9; r++) {
  for (let c = 2; c <= 9; c++) interiorCells.push(makeCellId(r, c));
}
const origin = interiorCells[0]; // R2C2, first interior cell in reading order
const bodyTargets = interiorCells.filter(cell => cell !== head);
const bodyTemplate = new NFA(
  degreeMachine(2), 'degree', origin, ...graph.neighbours(origin));
const bodyDegree = new Replicate(
  [bodyTemplate], Replicate.encodeTargetCells(bodyTargets, origin, graph), origin);

// Every other cell (the grid border, plus the two endpoints) gets its own
// explicit machine: border cells have fewer than four neighbours, so they
// are not shifted copies of the interior template.
const explicitCells = gridCells.filter(cell => !bodyTargets.includes(cell));
const explicitDegrees = explicitCells.map(cell => {
  const target = (cell === head || cell === tail) ? 1 : 2;
  return new NFA(degreeMachine(target), 'degree', cell, ...graph.neighbours(cell));
});

return [shape, ...givens, ...areas, bodyDegree, ...explicitDegrees];
