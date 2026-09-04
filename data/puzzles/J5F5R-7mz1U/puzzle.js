// Title: Snake Egg (Star Battle)
// Author: JinHoo Ahn
// Video: https://www.youtube.com/watch?v=J5F5R-7mz1U
// Source: https://sudokupad.app/Tqfg9qNd2L

// Rules encoded here:
//  1. A snake: a single self-avoiding, 1-cell-wide path with two distinct
//     ends. Every non-end path cell has exactly two orthogonal
//     path-neighbours and every end has exactly one; the path may not touch
//     itself beyond that (no revisits, no orthogonal touch other than
//     consecutive steps), but two non-consecutive path cells may still be
//     diagonally adjacent -- nothing here forbids that.
//  2. Three grey dots are given; each sits on a lattice corner where two
//     diagonal cell pairs cross, and the geometry offers no way to pin only
//     one of the two pairs. So each dot forces at least one of its two
//     diagonal pairs onto the snake (both members of that pair), not
//     necessarily both pairs at once.
//  3. Every row and every column holds exactly two stars, and no two stars
//     share an edge or a corner. A star may only occupy a cell the snake
//     does not occupy. One four-valued cell carries both layers at once
//     (EMPTY/STAR/BODY/END) so a cell can never be both a star and on the
//     snake.
//
// Omitted: "every region the snake's body divides the grid into holds
// exactly two stars." That partition's region count, sizes and shapes are
// not fixed by anything drawn -- they fall out of whichever path the solver
// draws -- and no known construction attaches a per-region count to a
// partition that is itself unanchored, unbounded, AND derived from a
// second, also-unknown structure (the snake). This is the rule that
// actually pins the puzzle's answer down, so the snake's shape and the
// stars' exact positions are both left far more open here than in the
// source puzzle.

const EMPTY = 1, STAR = 2, BODY = 3, END = 4;
const onPath = v => v === BODY || v === END;

const graph = cellGraph(new Shape('10x10', 4, 'Raw'));

// --- Snake shape. Each cell's own value names its required path-degree
// (BODY 2, END 1); an off-path cell (EMPTY/STAR) is unconstrained. Reads a
// cell then its orthogonal neighbours (2-4 depending on position).
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, count, target }, value) => {
    if (phase === 'start') {
      if (value === BODY) return { phase: 'count', count: 0, target: 2 };
      if (value === END) return { phase: 'count', count: 0, target: 1 };
      return { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const next = count + (onPath(value) ? 1 : 0);
    return next > target ? undefined : { phase: 'count', count: next, target };
  },
  accept: ({ phase, count, target }) => phase === 'off' || count === target,
}, 4);
// The machine's own transitions never look at *which* direction a neighbour
// came from, only how many are on-path, so cells that expose the same set of
// fixed (dRow, dCol) steps can share one Replicate template. Group cells by
// that shape (interior: all four; each edge/corner: whichever steps exist).
const FIXED_STEPS = [[0, -1], [0, 1], [-1, 0], [1, 0]];  // left, right, up, down
const shapeGroups = new Map();
for (const cell of graph.cells()) {
  const steps = FIXED_STEPS.filter(([dr, dc]) => graph.step(cell, dr, dc) !== null);
  const key = steps.map(String).join(';');
  (shapeGroups.get(key) ?? shapeGroups.set(key, { steps, cells: [] }).get(key))
    .cells.push(cell);
}
const degrees = [...shapeGroups.values()].flatMap(({ steps, cells }) => {
  const origin = cells[0];
  const template = steps.map(([dr, dc]) => graph.step(origin, dr, dc));
  const nfa = new NFA(degreeMachine, 'degree', origin, ...template);
  return cells.length === 1 ? [nfa] : [new Replicate(
    [nfa], Replicate.encodeTargetCells(cells, origin, graph), origin)];
});

// One connected path: the degree machine above makes on-path cells 1-or-2
// -regular under orthogonal adjacency; connectivity over the same adjacency
// then rules out a second, disjoint path fragment. Off-path cells are free
// to fall into as many disconnected pieces as the star layer needs.
const snakeConnected = new ConnectedValues('', [BODY, END]);

// Exactly two path ends (a path, not a closed loop).
const snakeEnds = new ContainExact(`${END}_${END}`, ...graph.cells());

// Grey-dot givens: at each corner, the mark's two candidate diagonal pairs
// are disjoined (at least one pair on-path) rather than both forced, since
// the geometry alone cannot select between them. Row/column pairs, not
// hand-written ids -- row/col 10 is not "R.C10".
const GREY_DOT_CORNERS = [
  [[[3, 2], [4, 3]], [[3, 3], [4, 2]]],
  [[[7, 9], [8, 10]], [[7, 10], [8, 9]]],
  [[[9, 6], [10, 7]], [[9, 7], [10, 6]]],
];
const onPathGiven = ([row, col]) => new Given(makeCellId(row, col), BODY, END);
const greyDots = GREY_DOT_CORNERS.map(pairs =>
  new Or(pairs.map(pair => new And(pair.map(onPathGiven)))));

// --- Star battle over whichever cells are not on the snake: two stars per
// row and per column.
const starRows = graph.rows().map(row => new ContainExact(`${STAR}_${STAR}`, ...row));
const starCols = graph.columns().map(col => new ContainExact(`${STAR}_${STAR}`, ...col));

// No two stars share an edge or a corner: one Pair template per king
// direction, replicated over every in-grid origin for that offset, so each
// king-move edge of the grid is covered exactly once.
const noStarTouchKey = Pair.fnToKey((a, b) => !(a === STAR && b === STAR), 4);
const KING_TEMPLATE_OFFSETS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const starNoTouch = KING_TEMPLATE_OFFSETS.map(([dr, dc]) => {
  const targets = graph.cells().filter(cell => graph.step(cell, dr, dc) !== null);
  const origin = targets[0];
  const template = graph.step(origin, dr, dc);
  return new Replicate(
    [new Pair(noStarTouchKey, 'star-no-touch', origin, template)],
    Replicate.encodeTargetCells(targets, origin, graph),
    origin,
  );
});

return [
  new Shape('10x10', 4, 'Raw'),
  ...degrees,
  snakeConnected,
  snakeEnds,
  ...greyDots,
  ...starRows,
  ...starCols,
  ...starNoTouch,
];
