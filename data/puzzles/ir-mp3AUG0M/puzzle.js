// Title: Anticamel Coloring Book
// Author: gdc
// Video: https://www.youtube.com/watch?v=ir-mp3AUG0M
// Source: https://sudokupad.app/tiea0253j6

// Rules encoded here, in full; nothing is omitted.
//
// Chaos Construction: divide the grid into 9 regions of orthogonally connected
//   cells; the digits 1-9 appear once each in every row, column and region.
// Anti-Camel: two cells a camel move apart (3 steps one way, 1 step the other)
//   may not hold the same digit.
// Internal X-Sums: a digit in a circle counts the cells it sees of its own
//   region along its row and column combined, itself included. Region borders
//   and elephants block vision. Where a two-digit number is printed in a
//   rectangle, that number is the sum of all the seen digits.
//
// There are no givens and no drawn region borders.

const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC');

// Drawn clues, transcribed from the art.
// The 11 grey-bordered circles.
const CIRCLES = [
  'R1C1', 'R1C4', 'R2C1', 'R2C3', 'R2C4', 'R6C4',
  'R6C9', 'R7C1', 'R7C2', 'R8C7', 'R8C9',
];
// The 5 two-digit rectangles, each drawn in the corner of the circled cell it
// belongs to.
const SEEN_SUMS = [
  ['R1C1', 7],
  ['R2C1', 11],
  ['R2C4', 10],
  ['R7C1', 21],
  ['R7C2', 15],
];
// The 3 elephants, each drawn straddling the border between these two cells.
const ELEPHANT_EDGES = [
  ['R2C5', 'R2C6'],
  ['R4C3', 'R5C3'],
  ['R4C9', 'R5C9'],
];

// A camel move is (1,3) or (3,1). Listing only the downward halves visits every
// unordered camel pair exactly once.
const CAMEL_STEPS = [[1, 3], [1, -3], [3, 1], [3, -1]];

const DIRECTIONS = [[0, -1], [0, 1], [-1, 0], [1, 0]];

const edgeKey = (a, b) => [a, b].sort().join('|');
const blockedEdges = new Set(ELEPHANT_EDGES.map(([a, b]) => edgeKey(a, b)));

// How far a circle can possibly see in one direction: out to the grid edge, but
// never across an elephant. The other blocker, the region border, is not known
// in advance, so it is left to the constraints below to cut the ray down to the
// run of cells that actually share the circle's region.
const visionRay = (cell, dRow, dCol) => {
  const ray = [cell];
  for (; ;) {
    const prev = ray[ray.length - 1];
    const next = graph.step(prev, dRow, dCol);
    if (next === null || blockedEdges.has(edgeKey(prev, next))) return ray;
    ray.push(next);
  }
};
// Rays of just the circle itself carry no information, so drop them.
const visionRays = (cell) => DIRECTIONS
  .map(([dRow, dCol]) => visionRay(cell, dRow, dCol))
  .filter((ray) => ray.length > 1);

// Sum of the seen digits, one machine per rectangle. The first segment is the
// circle's own region label and digit; each later segment is one vision ray
// beyond the circle, interleaved [region label, digit] per cell.
// State: `ctrl` is the circle's region label, `sum` the seen digits so far, and
// `phase` says what the next symbol is. A segment break restarts the run for the
// next ray; `blocked` swallows the remainder of a ray once its run has ended, so
// a cell of the circle's region lying beyond a border is not counted.
const seenSumSpec = (total) => NFA.encodeSpec({
  startState: { ctrl: null, sum: 0, phase: 'label' },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      return { ctrl: state.ctrl, sum: state.sum, phase: 'region' };
    }
    switch (state.phase) {
      case 'label':
        return { ctrl: value, sum: 0, phase: 'self' };
      case 'self':
        return value > total
          ? undefined : { ctrl: state.ctrl, sum: value, phase: 'region' };
      case 'region':
        return {
          ctrl: state.ctrl, sum: state.sum,
          phase: value === state.ctrl ? 'digit' : 'blocked',
        };
      case 'digit': {
        const sum = state.sum + value;
        return sum > total
          ? undefined : { ctrl: state.ctrl, sum, phase: 'region' };
      }
      case 'blocked':
        return state;
    }
  },
  accept: (state) => state.sum === total,
}, 9, { multiSegment: true });

const antiCamel = CAMEL_STEPS.flatMap(([dRow, dCol]) => graph.cells()
  .map((cell) => [cell, graph.step(cell, dRow, dCol)])
  .filter(([, other]) => other !== null)
  .map(([cell, other]) => new AllDifferent(cell, other)));

const seenCounts = CIRCLES.map((cell) => new ChaosArrow(
  cell, 0, ...cc.at(visionRays(cell))));

const seenSums = SEEN_SUMS.map(([cell, total]) => new NFA(
  seenSumSpec(total), `SeenSum${total}`,
  [cc.at(cell), cell],
  ...visionRays(cell).map((ray) => cc.at(ray.slice(1)).flatMap(
    (label, index) => [label, ray[index + 1]]))));

return [
  new Shape('9x9'),
  new ChaosConstruction(),
  new NoBoxes(),
  ...antiCamel,
  ...seenCounts,
  ...seenSums,
];
