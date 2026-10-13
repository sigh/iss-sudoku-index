// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=wIvjsPrWUSA
// Source: https://app.crackingthecryptic.com/webapp/3pB4RRnb6n

// LookAir: shaded orthogonal components are squares; equal-size squares cannot
// see each other through unshaded cells. Numbers count shading in their crosses.
const shape = new Shape('9x16', '0-9', 'Raw');
const graph = cellGraph(shape);
// Zero is unshaded; each shaded cell records its component's side length.
// A row/column run must have that length. The last completed run remains visible
// across zeros; any intervening shaded run replaces it and blocks its sightline.
const runSpec = NFA.encodeSpec({
  startState: { side: 0, length: 0, last: 0 },
  transition: ({ side, length, last }, value) => {
    if (value === 0) {
      if (side !== 0 && length !== side) return undefined;
      return { side: 0, length: 0, last: side || last };
    }
    if (side === 0) {
      if (value === last) return undefined;
      return { side: value, length: 1, last: 0 };
    }
    if (value !== side || length >= side) return undefined;
    return { side, length: length + 1, last: 0 };
  },
  accept: ({ side, length }) => side === 0 || length === side,
}, shape);
const runs = [...graph.rows(), ...graph.columns()].map(
  line => new NFA(runSpec, 'square runs and sightlines', line));
// Adjacent shaded cells belong to one component, so carry the same side length.
const adjacentKey = Pair.fnToKey((a, b) => a === 0 || b === 0 || a === b, shape);
const geometry = cellGeometry(shape);
const agreement = [
  [graph.rows(), makeCellId(1,2)],
  [graph.columns(), makeCellId(2,1)],
].map(([lines, next]) => new Replicate(
  [new Pair(adjacentKey, 'component side', makeCellId(1,1), next)],
  Replicate.encodeTargetCells(lines.flatMap(line => line.slice(0,-1)), makeCellId(1,1), geometry),
  makeCellId(1,1)));
// Excluding three shaded cells in a 2x2 makes every connected shaded component
// rectangular; the row/column run lengths then make both its dimensions equal.
const rectangleSpec = NFA.encodeSpec({
  startState: 0,
  transition: (count, value) => Math.min(4, count + (value !== 0 ? 1 : 0)),
  accept: count => count !== 3,
}, shape);
const rectangleTargets = graph.rows().slice(0,-1).flatMap(row => row.slice(0,-1));
const rectangles = [new Replicate(
  [new NFA(rectangleSpec, 'rectangular components',
    [makeCellId(1,1), makeCellId(1,2), makeCellId(2,1), makeCellId(2,2)])],
  Replicate.encodeTargetCells(rectangleTargets, makeCellId(1,1), geometry), makeCellId(1,1))];
// Number positions and cross totals from the printed grid.
const clues = [[2, 2, 5], [2, 5, 3], [2, 8, 2], [2, 9, 1], [2, 13, 1], [2, 14, 2], [3, 2, 4], [3, 5, 1], [3, 7, 3], [3, 10, 3], [3, 12, 3], [3, 15, 2], [4, 2, 1], [4, 5, 1], [4, 7, 3], [4, 10, 2], [4, 12, 3], [4, 15, 3], [5, 3, 1], [5, 4, 2], [5, 5, 1], [5, 7, 1], [5, 10, 3], [5, 12, 1], [5, 15, 3], [6, 5, 2], [6, 7, 1], [6, 10, 3], [6, 12, 1], [6, 15, 1], [7, 5, 2], [7, 7, 4], [7, 10, 1], [7, 12, 1], [7, 15, 2], [8, 5, 2], [8, 8, 4], [8, 9, 1], [8, 13, 1], [8, 14, 1]];
const crosses = clues.map(([r,c,total]) => {
  const cells = [makeCellId(r,c), ...graph.neighbours(makeCellId(r,c))];
  const spec = NFA.encodeSpec({
    startState: 0,
    transition: (count, value) => {
      const next = count + (value !== 0 ? 1 : 0);
      return next <= total ? next : undefined;
    },
    accept: count => count === total,
  }, shape);
  return new NFA(spec, 'cross shading count', cells);
});
return [shape, ...runs, ...agreement, ...rectangles, ...crosses];
