// Title: Galactic Union
// Author: Tacosian
// Video: https://www.youtube.com/watch?v=W3JvSpqgUoc
// Source: https://sudokupad.app/wxkk82qye4

// Rules encoded below, in full:
//  - Divide the grid into regions of nine orthogonally connected cells; each
//    row, column and region holds 1-9 once each. The board has no 3x3 boxes.
//  - One region border is given between R4C7 and R5C7.
//  - Each dot is drawn on the edge between two cells and is the centre of a
//    180-degree rotationally symmetric galaxy: a set of orthogonally connected
//    cells closed under the point rotation through that edge's midpoint.
//    Galaxies do not overlap.
//  - That rotation has no fixed cell, so it pairs the galaxy's cells off, and
//    the two halves take one cell from each pair. Each half is a killer cage
//    summing to the total printed on its side of the dot.
//  - All cells of a cage lie in one region; a galaxy's two cages lie in
//    different regions.
// Nothing is omitted. A cage's digits are not made distinct separately: a cage
// lies inside a single nine-cell region, which already holds 1-9 once each.

// Galaxy membership codes, carried one per cell on each galaxy's own Var layer.
const OUT = 1;      // this cell is not in this galaxy
const SIDE_A = 2;   // in the half containing the first listed flanking cell
const SIDE_B = 3;   // in the half containing the second listed flanking cell

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const cc = graph.makeOverlay('CC');

// Drawn data: each dot lies on the edge shared by its two listed cells, and
// each of those cells carries the printed total for the half on its side of the
// dot. `id` is the Var prefix for that galaxy's membership layer.
const GALAXIES = [
  { id: 'A', ends: ['R3C3', 'R4C3'], totals: [23, 29] },
  { id: 'B', ends: ['R4C6', 'R5C6'], totals: [16, 28] },
  { id: 'C', ends: ['R6C2', 'R7C2'], totals: [17, 26] },
  { id: 'D', ends: ['R6C7', 'R7C7'], totals: [26, 22] },
  { id: 'E', ends: ['R2C5', 'R2C6'], totals: [30, 25] },
  { id: 'F', ends: ['R8C5', 'R8C6'], totals: [28, 28] },
];

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

// The rotation is the point reflection through the midpoint of the dot's edge:
// with the two flanking cells at (rA, cA) and (rB, cB), it maps (r, c) to
// (rA + rB - r, cA + cB - c). A galaxy cell's image is a galaxy cell, so every
// galaxy cell lies in the rectangle of cells whose image is still on the grid --
// that rectangle is the galaxy's Var layer, and the rotation maps it onto
// itself.
function layout({ id, ends, totals }) {
  const [a, b] = ends.map(parseCellId);
  const rSum = a.row + b.row;
  const cSum = a.col + b.col;
  const rows = range(Math.max(1, rSum - 9), Math.min(9, rSum - 1));
  const cols = range(Math.max(1, cSum - 9), Math.min(9, cSum - 1));
  const cells = rows.flatMap(r => cols.map(c => makeCellId(r, c)));
  return {
    id, ends, totals, cells,
    dims: `${rows.length}x${cols.length}`,
    rotate: cell => {
      const { row, col } = parseCellId(cell);
      return makeCellId(rSum - row, cSum - col);
    },
    prefix: 'V' + id,   // the Var group id the layer's cells carry
    overlay: graph.makeOverlay('V' + id, cells),
  };
}

const galaxies = GALAXIES.map(layout);

// The rotation swaps the two halves: a cell and its image are either both
// outside the galaxy or in opposite halves.
const rotationKey = Pair.fnToKey(
  (x, y) => (x === OUT && y === OUT) ||
    (x === SIDE_A && y === SIDE_B) || (x === SIDE_B && y === SIDE_A),
  shape);

// Galaxies do not overlap: a cell covered by two layers is in at most one.
const disjointKey = Pair.fnToKey(
  (x, y) => x === OUT || y === OUT,
  shape);

// Cage totals. Reads the layer in [membership code, digit] pairs and adds up
// the digits of one side, rejecting as soon as the running total passes the
// printed one.
const cageSumSpec = (side, total) => NFA.encodeSpec({
  startState: { sum: 0, code: null },
  transition({ sum, code }, value) {
    if (code === null) return { sum, code: value };
    const next = sum + (code === side ? value : 0);
    return next > total ? undefined : { sum: next, code: null };
  },
  accept: ({ sum, code }) => code === null && sum === total,
}, shape);

// Cage-to-region membership. Reads the region labels of the two flanking cells
// first and carries them as the two cages' regions, then reads the layer in
// [membership code, region label] pairs and requires each galaxy cell's region
// label to be its own half's.
const cageRegionNFA = NFA.encodeSpec({
  startState: { a: null, b: null, code: null },
  transition({ a, b, code }, value) {
    if (a === null) return { a: value, b: null, code: null };
    if (b === null) return { a, b: value, code: null };
    if (code === null) return { a, b, code: value };
    if (code === SIDE_A && value !== a) return undefined;
    if (code === SIDE_B && value !== b) return undefined;
    return { a, b, code: null };
  },
  accept: ({ b, code }) => b !== null && code === null,
}, shape);

const galaxyConstraints = galaxies.flatMap(g => {
  const { id, ends, totals, cells, dims, rotate, overlay, prefix } = g;
  const at = cell => overlay.at(cell);
  const index = new Map(cells.map((cell, i) => [cell, i]));
  const rotationPairs = cells.filter(cell => index.get(cell) < index.get(rotate(cell)));

  return [
    new Var(id, `galaxy ${id} membership`, dims),
    overlay.makeReplicate(new Given(overlay.cells()[0], OUT, SIDE_A, SIDE_B)),
    // The printed totals name the halves containing the two flanking cells, so
    // both flanking cells are in the galaxy, one in each half.
    new Given(at(ends[0]), SIDE_A),
    new Given(at(ends[1]), SIDE_B),
    ...rotationPairs.map(cell =>
      new Pair(rotationKey, `galaxy ${id} rotation`, at(cell), at(rotate(cell)))),
    new ConnectedValues(prefix, `${SIDE_A}_${SIDE_B}`),
    new NFA(cageRegionNFA, `galaxy ${id} cage regions`,
      ...cc.at(ends), ...cells.flatMap(cell => [at(cell), cc.at(cell)])),
    new AllDifferent(...cc.at(ends)),
    ...[SIDE_A, SIDE_B].map((side, i) =>
      new NFA(cageSumSpec(side, totals[i]), `galaxy ${id} cage ${totals[i]}`,
        ...cells.flatMap(cell => [at(cell), cell]))),
  ];
});

// Pairs of galaxy layers that cover the same cell, derived from the layer
// rectangles above.
const overlaps = graph.cells().flatMap(cell => {
  const covering = galaxies.filter(g => g.overlay.at(cell) !== null);
  return covering.flatMap((g, i) => covering.slice(i + 1).map(h =>
    new Pair(disjointKey, 'galaxies do not overlap',
      g.overlay.at(cell), h.overlay.at(cell))));
});

return [
  shape,
  new ChaosConstruction(),
  new NoBoxes(),
  new Given('R3C9', 7),
  new Given('R8C3', 2),
  new AllDifferent(...cc.at(['R4C7', 'R5C7'])),
  ...galaxyConstraints,
  ...overlaps,
];
