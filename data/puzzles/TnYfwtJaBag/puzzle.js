// Title: 9-Center Regions
// Author: qyz
// Video: https://www.youtube.com/watch?v=TnYfwtJaBag
// Source: https://tinyurl.com/Center9s
//
// Standard row/column all-different only -- no standard 3x3 boxes, since the
// rules name only rows and columns as fixed regions.
// Extra rule: any area (the cell itself plus its up-to-8 king-move neighbours)
// immediately surrounding a cell containing 9 has no repeated digits. This is
// a value-conditional region, not a fixed one: it applies wherever a 9 lands,
// so it is encoded per candidate center cell C as the material implication
// "C = 9 -> AllDifferent(C plus its king neighbours)", i.e.
// Or(Given(C, 1..8), AllDifferent(C, kingNeighbours(C))) -- true whenever C is
// not 9, and otherwise requiring the neighbourhood to be all-different.
// Corner/edge/interior centers give 4/6/9-cell areas, matching the rule text.

const graph = cellGraph('9x9');

const givens = [
  ['R1C1', 7], ['R1C7', 4], ['R1C8', 2],
  ['R2C2', 7], ['R2C7', 3], ['R2C9', 6],
  ['R3C3', 7], ['R3C8', 3], ['R3C9', 2],
  ['R7C1', 2], ['R7C2', 8], ['R7C7', 6],
  ['R8C1', 3], ['R8C3', 5], ['R8C8', 7],
  ['R9C2', 4], ['R9C3', 2], ['R9C9', 8],
];

const centerRegions = graph.cells().map(cell => {
  const area = [cell, ...graph.kingNeighbours(cell)];
  return new Or([
    new Given(cell, 1, 2, 3, 4, 5, 6, 7, 8),
    new AllDifferent(...area),
  ]);
});

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...givens.map(([cell, v]) => new Given(cell, v)),
  ...centerRegions,
];
