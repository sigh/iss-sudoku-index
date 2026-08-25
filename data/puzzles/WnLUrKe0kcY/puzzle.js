// Title: Glass90Sweeper
// Author: RockyRoer
// Video: https://www.youtube.com/watch?v=WnLUrKe0kcY
// Source: https://app.crackingthecryptic.com/sudoku/TnPqrGrR4T

// Normal sudoku rules apply. A "mine" is a digit that is a factor of 90
// (1, 2, 3, 5, 6, 9 -- the divisors of 90 = 2*3^2*5 that fall in 1-9; 4, 7,
// 8 are not). Each circled cell's own digit counts the mines among its
// up-to-8 king-move neighbours, not including the circle cell itself. All
// circles are drawn (rules text: "All such circles are provided").

const MINES = new Set([1, 2, 3, 5, 6, 9]);

// Circle cells, transcribed from the drawn blue circles. Two further
// circles are drawn outside the playable board entirely and mark no cell,
// so they are omitted as decoration.
const circles = [
  'R1C1', 'R2C1', 'R2C2', 'R4C2', 'R6C1', 'R7C2', 'R8C1', 'R9C1', 'R9C3',
  'R6C4', 'R7C5', 'R8C5', 'R8C7', 'R9C8', 'R9C9', 'R5C8', 'R1C9',
];

const graph = cellGraph('9x9');

// One NFA per circle, reading [circle, ...kingNeighbours(circle)]. The
// first symbol (the circle's own digit) is stored as `target`; every later
// symbol adds 1, clamped at target+1, to `count` when it is a mine. Accept
// iff the final count equals the target -- the circle's digit is exactly
// the mine count among its neighbours.
const mineCountSpec = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const hit = MINES.has(value) ? 1 : 0;
    return { target, count: Math.min(count + hit, target + 1) };
  },
  accept: ({ target, count }) => target !== null && count === target,
  maxDepth: 9, // longest sequence: circle + 8 neighbours
}, 9);

const mineCounts = circles.map((circle, i) => new NFA(
  mineCountSpec, `mine${i}`, circle, ...graph.kingNeighbours(circle)));

return [
  new Shape('9x9'),
  ...mineCounts,
];
