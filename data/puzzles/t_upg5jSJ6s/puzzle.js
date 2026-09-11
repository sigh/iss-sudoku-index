// Title: Lighthouse
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=t_upg5jSJ6s
// Source: https://app.crackingthecryptic.com/sudoku/fLtm97H9GD

// Rules encoded here:
//  - Every digit 1-9 appears once in every row, column and region.
//  - The regions are not drawn: each is a set of nine orthogonally connected
//    cells that the solver must determine (ChaosConstruction, NoBoxes).
//  - A digit in a circle equals the number of borders between regions it sees
//    in its row and its column; the edge of the grid does not count.
//  - "Not all possible circles are necessarily given" states that there is no
//    negative constraint: an uncircled cell may also equal its own count, so
//    nothing is encoded for the uncircled cells.
// Nothing is omitted.

// Circled cells, from the 16 white 0.7x0.7 circle underlays.
const CIRCLES = [
  'R1C1', 'R1C3', 'R1C7', 'R1C8', 'R1C9',
  'R2C6',
  'R3C4',
  'R4C1', 'R4C3', 'R4C9',
  'R6C5',
  'R7C2',
  'R8C9',
  'R9C2', 'R9C4', 'R9C9',
];

// Given digits, from the four filled cells of the payload's grid.
const GIVENS = [
  ['R1C1', 9],
  ['R2C1', 2],
  ['R4C6', 2],
  ['R5C2', 3],
];

// Border counter. Segment 1 is the circled grid cell, which sets the target;
// segments 2 and 3 are the region labels of that cell's row and column, read in
// order. Two consecutive labels that differ are a region border, so `count` is
// the number of borders in the row plus the number in the column. `prev` is
// reset to null at each segment break so the join between the row and the
// column is never compared, and the grid edge is never a border because only
// in-grid adjacent pairs are read.
const borderCountSpec = NFA.encodeSpec({
  startState: { target: null, prev: null, count: 0 },
  transition: ({ target, prev, count }, value) => {
    // Break first: one break precedes every later segment.
    if (value === SEGMENT_BREAK) {
      if (target === null) return undefined;
      return { target, prev: null, count };
    }
    if (target === null) return { target: value, prev: null, count: 0 };
    const border = (prev !== null && value !== prev) ? 1 : 0;
    const newCount = count + border;
    if (newCount > target) return undefined;  // clamp: can only fail from here
    return { target, prev: value, count: newCount };
  },
  accept: ({ target, count }) => target !== null && count === target,
  maxDepth: 21,  // 1 + 9 + 9 cells, plus 2 segment breaks
}, 9, { multiSegment: true });

// The chaos-construction region-label cell paired with each grid cell.
const cc = cellGraph('9x9').makeOverlay('CC');

const circles = CIRCLES.map(cell => {
  const { row, col } = parseCellId(cell);
  return new NFA(
    borderCountSpec, `Lighthouse ${cell}`,
    [cell], cc.row(row), cc.column(col));
});

return [
  new Shape('9x9'),
  new ChaosConstruction(),
  new NoBoxes(),
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
  ...circles,
];
