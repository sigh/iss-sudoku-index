// Title: Orwellian
// Author: The Chiropractor
// Video: https://www.youtube.com/watch?v=20ZlHGHO9DY
// Source: https://app.crackingthecryptic.com/sudoku/MdTTpQD3dM

// Normal sudoku (default row/column/box all-different). "Numbers in circles
// show the difference between the cells they join" gives every drawn circle
// its meaning regardless of printed value. "All possible differences of 4
// and 8 are given" is a completeness clause scoped to those two values only
// (it does not claim every circle shows 4 or 8): one drawn circle prints 1,
// which the first sentence still covers, and the second sentence does not
// promise exhaustive marking of 1s. So every orthogonally adjacent pair
// without a 4-circle must not differ by 4, and every pair without an
// 8-circle must not differ by 8; pairs are otherwise unconstrained.

const graph = cellGraph('9x9');

// Every drawn circle: printed value and the two cells it joins, transcribed
// from the puzzle's edge markers.
const circles = [
  { value: 1, cells: ['R5C1', 'R5C2'] },
  { value: 4, cells: ['R6C2', 'R6C3'] },
  { value: 4, cells: ['R8C3', 'R8C4'] },
  { value: 4, cells: ['R8C4', 'R9C4'] },
  { value: 4, cells: ['R2C2', 'R3C2'] },
  { value: 4, cells: ['R2C3', 'R2C4'] },
  { value: 4, cells: ['R1C4', 'R1C5'] },
  { value: 4, cells: ['R2C5', 'R3C5'] },
  { value: 4, cells: ['R3C5', 'R3C6'] },
  { value: 4, cells: ['R4C6', 'R5C6'] },
  { value: 4, cells: ['R4C6', 'R4C7'] },
  { value: 4, cells: ['R6C6', 'R6C7'] },
  { value: 4, cells: ['R9C6', 'R9C7'] },
  { value: 4, cells: ['R8C9', 'R9C9'] },
  { value: 4, cells: ['R7C8', 'R8C8'] },
  { value: 4, cells: ['R3C8', 'R3C9'] },
  { value: 4, cells: ['R2C7', 'R2C8'] },
  { value: 4, cells: ['R1C8', 'R1C9'] },
  { value: 8, cells: ['R5C9', 'R6C9'] },
  { value: 8, cells: ['R8C8', 'R9C8'] },
  { value: 8, cells: ['R3C6', 'R4C6'] },
  { value: 8, cells: ['R3C6', 'R3C7'] },
  { value: 8, cells: ['R6C2', 'R7C2'] },
  { value: 4, cells: ['R1C2', 'R1C3'] },
  { value: 4, cells: ['R3C7', 'R4C7'] },
];

// The single circle printing 1 is exactly a Kropki white dot (consecutive
// digits); it is the whole of that value's group, so it canonicalizes to the
// native class instead of a hand-keyed Pair.
const whiteDots = circles
  .filter(({ value }) => value === 1)
  .map(({ cells }) => new WhiteDot(...cells));

const diffKeyCache = new Map();
const diffKey = (value) => {
  if (!diffKeyCache.has(value)) {
    diffKeyCache.set(
      value, Pair.fnToKey((a, b) => Math.abs(a - b) === value, 9));
  }
  return diffKeyCache.get(value);
};

const diffCircles = circles
  .filter(({ value }) => value !== 1)
  .map(({ value, cells }) => new Pair(diffKey(value), `diff ${value}`, ...cells));

// Scoped negatives (see header). Every grid edge not carrying its own
// 4-circle gets "not 4"; every edge not carrying its own 8-circle gets
// "not 8". Computed from the drawn edge list above, not hand-enumerated.
const markedValue = new Map(
  circles.map(({ value, cells }) => [[...cells].sort().join('|'), value]));

// Every edge, split by direction: each direction shares one relative offset,
// so each (direction, excluded value) group replicates from a single
// template instead of one Pair per edge (~264 individually).
const horizontalEdges = [];
const verticalEdges = [];
for (const cell of graph.cells()) {
  const right = graph.step(cell, 0, 1);
  if (right) horizontalEdges.push([cell, right]);
  const down = graph.step(cell, 1, 0);
  if (down) verticalEdges.push([cell, down]);
}

const notFourKey = Pair.fnToKey((a, b) => Math.abs(a - b) !== 4, 9);
const notEightKey = Pair.fnToKey((a, b) => Math.abs(a - b) !== 8, 9);

const excludingValue = (edges, value) =>
  edges.filter(([a, b]) => markedValue.get([a, b].slice().sort().join('|')) !== value);

const replicateNotValue = (edges, value) => {
  if (!edges.length) return [];
  const key = value === 4 ? notFourKey : notEightKey;
  const origin = edges[0][0];
  const template = new Pair(key, `no diff ${value}`, ...edges[0]);
  const starts = edges.map(([a]) => a);
  return [new Replicate(
    [template], Replicate.encodeTargetCells(starts, origin, graph), origin)];
};

const negatives = [
  ...replicateNotValue(excludingValue(horizontalEdges, 4), 4),
  ...replicateNotValue(excludingValue(verticalEdges, 4), 4),
  ...replicateNotValue(excludingValue(horizontalEdges, 8), 8),
  ...replicateNotValue(excludingValue(verticalEdges, 8), 8),
];

return [
  new Shape('9x9'),
  new Given('R3C3', 8),
  new Given('R5C3', 4),
  new Given('R5C5', 8),
  new Given('R5C7', 6),
  new Given('R7C7', 3),
  ...whiteDots,
  ...diffCircles,
  ...negatives,
];
