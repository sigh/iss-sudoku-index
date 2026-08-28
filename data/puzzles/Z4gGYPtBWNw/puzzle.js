// Title: Thermonuclear Power Plant
// Author: Christoph Seeliger
// Video: https://www.youtube.com/watch?v=Z4gGYPtBWNw
// Source: https://cracking-the-cryptic.web.app/sudoku/H7n7NhH26M

// Normal sudoku rules (9x9, default row/column/box all-different from Shape).
// No givens.
//
// Two independent thermometer networks: digits increase strictly away from
// each drawn bulb. Neither network is a simple path -- both branch and some
// arms reconverge on a shared cell -- so each is encoded edge by edge rather
// than as one Thermo per drawn stroke. Direction along every edge is fixed by
// tracing back to the (single, or in the green case double) bulb.
//
// Outside the grid, coloured rectangles mark the first 3 cells of specific
// rows/columns, counted in from that edge. Blue ("whimsical wind") requires
// those 3 digits to be neither increasing nor decreasing; yellow ("rays of
// sunshine") requires them to increase from the innermost of the 3 to the
// outermost (nearest the marker). Only the rows/columns actually carrying a
// marker are constrained.

const greyThermoEdges = [
  // Grey thermometer, bulb at R5C5 (grey circle underlay). Each pair is
  // [closer-to-bulb, farther-from-bulb], read off the drawn grey line shape.
  ['R5C5', 'R5C4'],
  ['R5C4', 'R4C5'], // diagonal run continues through R4C5
  ['R4C5', 'R3C6'],
  ['R3C6', 'R3C7'],
  ['R3C6', 'R2C5'],
  ['R4C5', 'R3C4'],
  ['R3C4', 'R3C3'],
  ['R3C4', 'R2C5'], // R2C5 also reached from R3C6 above; consistent
  ['R5C4', 'R4C3'],
  ['R4C3', 'R3C3'], // R3C3 also reached from R3C4 above; consistent
  ['R5C4', 'R6C3'],
  ['R6C3', 'R5C2'],
  ['R6C3', 'R7C3'],
  ['R4C5', 'R5C6'],
  ['R5C6', 'R6C7'],
  ['R6C7', 'R7C7'],
  ['R6C7', 'R5C8'],
  // One drawn stroke runs R4C7 -> R5C6 -> R6C5 -> R7C4. R5C6 is
  // independently reached from the bulb via the R4C5 -> R5C6 edge above, so
  // the stroke is oriented outward from that pivot cell in both directions.
  ['R5C6', 'R4C7'],
  ['R5C6', 'R6C5'],
  ['R6C5', 'R7C4'],
  ['R4C7', 'R5C8'], // R5C8 also reached from R6C7 above; consistent
  ['R4C7', 'R3C7'], // R3C7 also reached from R3C6 above; consistent
  ['R4C3', 'R5C2'], // R5C2 also reached from R6C3 above; consistent
  ['R7C4', 'R7C3'], // R7C3 also reached from R6C3 above; consistent
  ['R7C4', 'R8C5'],
  ['R6C5', 'R7C6'],
  ['R7C6', 'R7C7'], // R7C7 also reached from R6C7 above; consistent
  ['R7C6', 'R8C5'], // R8C5 also reached from R7C4 above; consistent
];

const greenThermoEdges = [
  // Green thermometer network, bulbs at R9C4 and R9C6 (yellow-green circle
  // underlays), converging on R9C5 and then forking again.
  ['R9C4', 'R9C5'],
  ['R9C6', 'R9C5'],
  ['R9C5', 'R8C4'],
  ['R9C5', 'R8C6'],
  ['R8C4', 'R7C4'],
  ['R8C6', 'R7C6'],
];

const thermos = [...greyThermoEdges, ...greenThermoEdges]
  .map(([bulbward, tipward]) => new Thermo(bulbward, tipward));

// Cells of an outside clue's first-3 run, ordered [outer, middle, inner]:
// `outer` sits at the named edge, `inner` is the 3rd cell in from it.
function tripleCells(orientation, fixedIndex, side) {
  const near = (side === 'left' || side === 'top') ? [1, 2, 3] : [9, 8, 7];
  return near.map(n => orientation === 'row'
    ? makeCellId(fixedIndex, n)
    : makeCellId(n, fixedIndex));
}

const blueRows = [1, 3, 4, 6, 7, 9];
const blueUnordered = blueRows.flatMap(r => ['left', 'right'].map(side => {
  const [outer, mid, inner] = tripleCells('row', r, side);
  // "Unordered" (neither increasing nor decreasing) is exactly "the middle
  // cell is a strict local max or min against its two neighbours" -- the
  // only way 3 distinct values in a row can fail to be monotonic.
  // GreaterThan(a, b, c) requires a > every later cell it is grid-adjacent
  // to; middle is adjacent to both outer and inner, which are not adjacent
  // to each other, so each ordering below yields exactly the two pairwise
  // inequalities it names.
  return new Or([
    new GreaterThan(mid, outer, inner), // middle is the local max
    new GreaterThan(outer, inner, mid), // middle is the local min
  ]);
}));

const yellowRowSpecs = [2, 5, 8]
  .flatMap(r => ['left', 'right'].map(side => [r, side]));
const yellowColSpecs = [
  [2, 'top'], [2, 'bottom'],
  [5, 'top'], // no bottom marker is drawn for column 5
  [8, 'top'], [8, 'bottom'],
];
const yellowIncreasing = [
  ...yellowRowSpecs.map(([r, side]) => tripleCells('row', r, side)),
  ...yellowColSpecs.map(([c, side]) => tripleCells('col', c, side)),
].map(([outer, mid, inner]) =>
  // Increase from innermost to outermost == outer > mid > inner.
  new GreaterThan(outer, mid, inner));

return [
  new Shape('9x9'),
  ...thermos,
  ...blueUnordered,
  ...yellowIncreasing,
];
