// Title: Propellers
// Author: Nordy
// Video: https://www.youtube.com/watch?v=2ZwM7RJSBlo
// Source: https://app.crackingthecryptic.com/sudoku/29hgDNf2qq

// Normal sudoku rules apply (standard rows/columns/boxes, no givens). Each
// gray dot is the midpoint of a straight, 3-cell line segment -- horizontal,
// vertical, or either diagonal -- whose three digits are distinct and sum to
// the number shown at the dot. No two of the 14 lines may cross, overlap, or
// share a cell: on this integer cell grid two straight 3-cell segments can
// only cross or overlap where they occupy a common cell, so all three verbs
// reduce to one "cell-disjoint" condition, encoded below as a single
// no-shared-cell rule between every pair of lines.
//
// The rules leave each line's orientation for the solver to find, so it is
// modelled as a solver choice (one selector Var per dot, holding which of
// that dot's candidate axes is actually drawn) rather than assumed from the
// answer.

// Dots: [midpoint cell, sum]. Each is drawn as a small grey circle with a
// white sum label centred on the cell.
const DOTS = [
  ['R2C2', 10], ['R2C4', 18], ['R2C8', 13],
  ['R3C5', 6], ['R3C6', 6],
  ['R4C3', 9], ['R4C7', 7],
  ['R6C2', 22], ['R6C4', 10], ['R6C5', 18], ['R6C7', 7],
  ['R7C8', 10],
  ['R8C2', 20], ['R8C4', 20],
];

// The 4 axis directions a straight 3-cell line can take through its
// midpoint, as the offset of one arm (the other arm is the negated offset).
const AXES = [
  [0, -1],  // horizontal
  [-1, 0],  // vertical
  [-1, -1], // diagonal "\"
  [-1, 1],  // diagonal "/"
];

const geo = cellGeometry('9x9');
const inBounds = ({ row, col }) =>
  row >= 1 && row <= geo.numRows && col >= 1 && col <= geo.numCols;

// For each dot, its candidate cell-triples: one per axis that stays on the
// grid (every dot here is far enough inside the grid for all 4 to fit).
// `axis` is the fixed AXES index, kept through filtering so it stays a
// stable code for that direction.
const candidatesFor = ([cell, sum]) => {
  const { row, col } = parseCellId(cell);
  return AXES
    .map(([dr, dc], axis) => ({
      axis,
      sum,
      cells: [
        makeCellId(row - dr, col - dc),
        cell,
        makeCellId(row + dr, col + dc),
      ],
    }))
    .filter(c => c.cells.every(id => inBounds(parseCellId(id))));
};
const allCandidates = DOTS.map(candidatesFor);

// One selector Var per dot, holding the AXES index (1-based) of the axis it
// actually uses.
const axisVar = new Var('A', 'axis', DOTS.length);

// Each dot's line: one of its candidate axes holds, tying the Cage (digit
// distinctness + sum over that axis's 3 cells) to the selector taking that
// axis's code.
const lineConstraints = allCandidates.map((candidates, i) => new Or(
  candidates.map(c => new And([
    new Given(axisVar.cell(i + 1), c.axis + 1),
    new Cage(c.sum, ...c.cells),
  ]))
));

// Restrict each selector to the axis codes it actually has a candidate for.
const axisDomainGivens = allCandidates.map((candidates, i) =>
  new Given(axisVar.cell(i + 1), ...candidates.map(c => c.axis + 1)));

// No two lines may share a cell: for every pair of dots, forbid selecting
// axis combinations whose candidate cell-triples intersect. Only pairs with
// at least one such combination need a constraint.
const noOverlapConstraints = [];
for (let i = 0; i < DOTS.length; i++) {
  for (let j = i + 1; j < DOTS.length; j++) {
    const forbidden = new Set();
    for (const a of allCandidates[i]) {
      for (const b of allCandidates[j]) {
        if (a.cells.some(id => b.cells.includes(id))) {
          forbidden.add(`${a.axis}_${b.axis}`);
        }
      }
    }
    if (forbidden.size === 0) continue;
    // Axis codes outside 1..4 never occur (axisDomainGivens excludes them);
    // the fn must still be total over the grid's value range for fnToKey.
    const fn = (u, v) => {
      if (u < 1 || u > 4 || v < 1 || v > 4) return true;
      return !forbidden.has(`${u - 1}_${v - 1}`);
    };
    noOverlapConstraints.push(new Pair(
      Pair.fnToKey(fn, geo), 'no-shared-cell',
      axisVar.cell(i + 1), axisVar.cell(j + 1)));
  }
}

return [
  new Shape('9x9'),
  axisVar,
  ...axisDomainGivens,
  ...lineConstraints,
  ...noOverlapConstraints,
];
