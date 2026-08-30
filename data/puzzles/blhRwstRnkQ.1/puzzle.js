// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=blhRwstRnkQ
// Source: https://cracking-the-cryptic.web.app/sudoku/MQbhMHdtr9

// Rules: draw seven snakes in the grid, each of them seven cells long and none
// of them intersecting. A snake is a path, which is one cell wide, does not
// branch and does not touch itself orthogonally. The circles drawn in the grid
// are endpoints of snakes. Not all endpoints of snakes are given. A snake can
// contain no circle, one circle or two circles.
//
// This is not a sudoku: there are no digits and no row/column/box rules, so the
// grid is Raw and each cell instead holds the index 1-7 of the snake covering
// it. Seven disjoint seven-cell snakes use 7 * 7 = 49 cells and the grid has 49,
// so every cell is covered and the snakes are exactly a partition of the grid.
//
// Because a snake never touches itself orthogonally, two orthogonally adjacent
// cells with the same index are always consecutive along that snake. The snake
// shape is therefore entirely local: a cell has one same-index neighbour at an
// end of its snake and two in the middle, and never three or more (which would
// be a branch or a self-touch). Together with each index occupying one
// connected region of exactly seven cells, that makes each index a seven-cell
// path -- a connected graph of seven cells with all degrees at most two is a
// path or a seven-cycle, and the grid has no odd cycles.
//
// The last two sentences of the rules add no constraint: they say the circles
// are not an exhaustive marking of the ends, and that a snake carrying two
// circles is allowed.
//
// The snake indices are an artifact of this encoding rather than puzzle
// content, since permuting them redraws nothing. The final constraint pins one
// representative by requiring index k to first appear before index k + 1 in
// reading order.

const shape = new Shape('7x7', 7, 'Raw');
const graph = cellGraph(shape);
const NUM_SNAKES = 7;
const SNAKE_LENGTH = 7;

// The eight circled cells, transcribed from the eight white circles drawn in
// the grid.
const circles = ['R1C5', 'R2C2', 'R3C5', 'R4C2', 'R5C5', 'R6C2', 'R7C3', 'R7C7'];

// Counts how many of a cell's orthogonal neighbours share its snake index. The
// scan is [cell, ...its neighbours]: the first symbol read fixes `label` to the
// cell's own index, and each later symbol adds one to `n` when it repeats that
// index. `n` saturates at 3, which is already past every accepted degree.
const degreeSpec = (isAllowedDegree) => NFA.encodeSpec({
  startState: { label: null, n: 0 },
  transition: ({ label, n }, value) => {
    if (label === null) return { label: value, n: 0 };
    return { label, n: Math.min(n + (value === label ? 1 : 0), 3) };
  },
  accept: ({ label, n }) => label !== null && isAllowedDegree(n),
}, shape);

// One or two same-snake neighbours: no branch, no orthogonal self-touch.
const SNAKE_CELL = degreeSpec(n => n === 1 || n === 2);
// Exactly one: the cell is an end of its snake.
const SNAKE_END = degreeSpec(n => n === 1);

const degreeScan = (cell) => [cell, ...graph.neighbours(cell)];

// `used` is the largest index seen so far; an index may exceed it by at most
// one, so the indices are introduced in order 1, 2, ... down the reading order.
const CANONICAL_INDICES = NFA.encodeSpec({
  startState: { used: 0 },
  transition: ({ used }, value) =>
    value > used + 1 ? undefined : { used: Math.max(used, value) },
  accept: () => true,
}, shape);

return [
  shape,

  ...Array.from({ length: NUM_SNAKES },
    (_, i) => new ConnectedValues('', i + 1, SNAKE_LENGTH)),

  ...graph.cells().map(
    cell => new NFA(SNAKE_CELL, 'snake cell', degreeScan(cell))),

  ...circles.map(
    cell => new NFA(SNAKE_END, 'circle is a snake end', degreeScan(cell))),

  new NFA(CANONICAL_INDICES, 'canonical snake indices', graph.cells()),
];
