// Title: Moderation
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=I3fPFGC9G1k
// Source: https://sudokupad.app/2h5u92i2v9

// Rows and columns are all-different (digits 1-6); the rules never mention
// boxes, so NoBoxes drops them.
//
// Neighbour-difference rule: every cell has exactly two orthogonal neighbours
// (2 at a corner, 3 on an edge, 4 inside) whose digit differs from its own by
// at least 3. One NFA per cell scans [cell, ...its neighbours] (from
// cellGraph('6x6').neighbours, in-grid orthogonal cells only); `target` holds
// the scanned cell's own value and `count` the number of neighbours seen so
// far differing by >= 3, clamped at 3 so "more than two" collapses to one
// rejecting state instead of growing without bound.
//
// Grey line (R2C4-R3C5-R4C6, from the drawn diagonal stroke): one cell is the
// sum of the other two. The rules do not say which is the sum, so the three
// possible assignments are disjoined.

const graph = cellGraph('6x6');

const neighbourDiffSpec = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (value === SEGMENT_BREAK) return { target, count };
    if (target === null) return { target: value, count: 0 };
    const hit = Math.abs(value - target) >= 3 ? 1 : 0;
    return { target, count: Math.min(count + hit, 3) };
  },
  accept: ({ count }) => count === 2,
  maxDepth: 10,
}, 6, { multiSegment: true });

const neighbourDiffConstraints = graph.cells().map(
  cell => new NFA(
    neighbourDiffSpec, `nbr-${cell}`,
    [cell], ...graph.neighbours(cell).map(n => [n])));

const [a, b, c] = ['R2C4', 'R3C5', 'R4C6'];
const greyLineSum = new Or([
  new Arrow(a, b, c),
  new Arrow(b, a, c),
  new Arrow(c, a, b),
]);

return [
  new Shape('6x6'),
  new NoBoxes(),
  ...neighbourDiffConstraints,
  greyLineSum,
];
