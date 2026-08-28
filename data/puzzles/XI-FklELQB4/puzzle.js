// Title: 6/10
// Author: HawkAvatar
// Video: https://www.youtube.com/watch?v=XI-FklELQB4
// Source: https://tinyurl.com/2p8p7ewk

// "This puzzle uses 6 of the digits 0-9 to be determined by the solver.
// Place one copy of each digit in each row/column/box." -- a widened 0-9
// alphabet on the default 6x6 grid (2x3 boxes, unaffected by the widened
// range), with every row/column/box holding the same unknown 6-digit
// subset: RegionSameValues over the default (size-6) regions.
// "Digits along thermometers increase from the bulb": Thermo per line,
// bulb cell first.
// "Digits along an arrow sum to the digit in that arrow's circle": Arrow
// per line, circle cell first (it is also the line's first waypoint).
// "Cells separated by a V sum to 5, all possible Vs are given": V per
// marked pair, plus a scoped negative over every other orthogonally
// adjacent pair (no X marks are defined by this ruleset, so only the V
// family is exhaustive).
const shape = new Shape('6x6', '0-9');
const graph = cellGraph(shape);

// Thermometers -- transcribed from the drawn thermometer lines, bulb (round end) first.
const thermos = [
  new Thermo('R6C1', 'R5C1', 'R4C1', 'R3C1'),
  new Thermo('R5C6', 'R4C6'),
];

// Arrows -- transcribed from the drawn arrow lines; each line's first cell
// is the drawn circle.
const arrows = [
  new Arrow('R1C6', 'R1C5', 'R2C5', 'R2C4', 'R2C3'),
  new Arrow('R3C4', 'R3C5', 'R3C6'),
  new Arrow('R6C2', 'R5C2', 'R4C2', 'R3C2', 'R3C3'),
];

// V marks -- transcribed from the drawn V marks (no X marks are drawn
// anywhere in the puzzle).
const vPairs = [
  ['R2C5', 'R2C6'],
  ['R2C4', 'R1C4'],
  ['R3C4', 'R4C4'],
  ['R5C1', 'R6C1'],
  ['R4C2', 'R4C3'],
  ['R3C6', 'R3C5'],
  ['R2C3', 'R2C4'],
];
const vs = vPairs.map(([a, b]) => new V(a, b));

// Every orthogonally adjacent pair not drawn as a V does not sum to 5.
// Built from the grid's own row/column adjacency, minus the marked pairs.
const edgeKey = ([a, b]) => [a, b].sort().join('-');
const markedEdges = new Set(vPairs.map(edgeKey));
const allEdges = [...graph.rows(), ...graph.columns()].flatMap(house =>
  house.slice(1).map((cell, index) => [house[index], cell]));
const unmarkedEdges = allEdges.filter(edge => !markedEdges.has(edgeKey(edge)));
const notV = Pair.fnToKey((a, b) => a + b !== 5, shape);
const notVs = unmarkedEdges.map(([a, b]) => new Pair(notV, 'not-V', a, b));

return [
  shape,
  new RegionSameValues(),
  ...thermos,
  ...arrows,
  ...vs,
  ...notVs,
];
