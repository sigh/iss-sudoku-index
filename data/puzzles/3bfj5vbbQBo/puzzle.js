// Title: Spiral Galaxies
// Author: Murat Can Tonta
// Video: https://www.youtube.com/watch?v=3bfj5vbbQBo
// Source: https://cracking-the-cryptic.web.app/sudoku/H348FJq4fD

// Rules encoded here:
//   * 11x11 grid, no digits, no rows/columns/boxes -- no Sudoku layer at all.
//   * Spiral Galaxies: the grid divides into 22 "galaxies" of orthogonally
//     connected cells, one per drawn dot, each 180-degree rotationally
//     symmetric about its own dot. Every cell belongs to exactly one galaxy.
// Nothing is omitted: no dot carries a total, and there is no other clue type.
//
// Model: two Var overlays hold, per cell, the label of the galaxy that owns
// it (22 labels split across the two overlays -- see "Widening for auxiliary
// state" / "Region-label overlays", CellGeometry.MAX_SIZE = 16). The division
// itself is never computed here -- it is the puzzle's entire content, and the
// solver makes it. The main grid carries no puzzle content of its own, so it
// is pinned to a dummy value everywhere; the real answer lives in the two
// overlay groups (`solution_group: ["VA", "VB"]`).

const GRID = '11x11';

// The 22 drawn dots, transcribed from the puzzle's own drawn geometry in
// index order ("# N" comments name that index). Positions are in half-cell
// units so a dot painted on a cell centre, a shared edge, and a grid-vertex
// corner are all alike integral: cell RiCj has centre (2i-1, 2j-1).
const DOTS = [
  { r: 3, c: 1 },   // #0  cell R2C1
  { r: 1, c: 11 },  // #1  cell R1C6
  { r: 4, c: 3 },   // #2  edge R2C2 / R3C2
  { r: 4, c: 7 },   // #3  edge R2C4 / R3C4
  { r: 5, c: 11 },  // #4  cell R3C6
  { r: 7, c: 15 },  // #5  cell R4C8
  { r: 10, c: 21 }, // #6  edge R5C11 / R6C11
  { r: 9, c: 2 },   // #7  edge R5C1 / R5C2
  { r: 11, c: 3 },  // #8  cell R6C2
  { r: 11, c: 5 },  // #9  cell R6C3
  { r: 13, c: 2 },  // #10 edge R7C1 / R7C2
  { r: 15, c: 1 },  // #11 cell R8C1
  { r: 15, c: 7 },  // #12 cell R8C4
  { r: 17, c: 9 },  // #13 cell R9C5
  { r: 17, c: 13 }, // #14 cell R9C7
  { r: 17, c: 15 }, // #15 cell R9C8
  { r: 17, c: 19 }, // #16 cell R9C10
  { r: 20, c: 17 }, // #17 edge R10C9 / R11C9
  { r: 18, c: 4 },  // #18 corner R9C2 / R9C3 / R10C2 / R10C3
  { r: 21, c: 9 },  // #19 cell R11C5
  { r: 21, c: 13 }, // #20 cell R11C7
  { r: 13, c: 15 }, // #21 cell R7C8
];

// A label overlay holds at most 15 labels plus a marker, so the 22 galaxies
// split over two overlays, one real label per cell on exactly one of them and
// the OTHER marker on the other. Alternating keeps the two halves equal.
const LAYERS = ['VA', 'VB'];
const layerOf = (index) => index % LAYERS.length;
const labelOf = (index) => Math.floor(index / LAYERS.length) + 1;
const OTHER = Math.max(...DOTS.map((_, i) => labelOf(i))) + 1;

const shape = new Shape(GRID, OTHER, 'Raw');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const overlays = LAYERS.map(prefix => graph.makeOverlay(prefix));
const cellOrder = new Map(gridCells.map((cell, i) => [cell, i]));

const halfCoords = (cell) => {
  const { row, col } = parseCellId(cell);
  return { r: 2 * row - 1, c: 2 * col - 1 };
};
// The cell diametrically opposite `cell` through dot `dot`, or null when that
// lands outside the grid.
const rotate = (cell, dot) => {
  const { r, c } = halfCoords(cell);
  const imageR = 2 * dot.r - r;
  const imageC = 2 * dot.c - c;
  if (imageR < 1 || imageR > 21 || imageC < 1 || imageC > 21) return null;
  const image = makeCellId((imageR + 1) / 2, (imageC + 1) / 2);
  return cellOrder.has(image) ? image : null;
};

// Which cells a galaxy could possibly reach: no printed total exists to bound
// a galaxy's size here (unlike 3qJu_cp1gVE), so the only available bound is
// the rule itself -- a connected symmetric galaxy holding a cell must also
// hold that cell's rotational image, so a cell whose image falls off the grid
// can never belong to this dot's galaxy. This only prunes; it does not assume
// a size.
const zoneOf = (dot) => gridCells.filter(cell => rotate(cell, dot) !== null);
const zones = DOTS.map(zoneOf);
const zoneSets = zones.map(zone => new Set(zone));

// Each cell carries one label per overlay, and only labels whose zone reaches
// it.
const labelDomain = LAYERS.flatMap((prefix, layer) => gridCells.map(cell =>
  new Given(overlays[layer].at(cell), OTHER, ...DOTS.flatMap((dot, i) =>
    layerOf(i) === layer && zoneSets[i].has(cell) ? [labelOf(i)] : []))));

// Exactly one of the two overlays names a galaxy for a cell, which is what
// makes the galaxies a partition with no overlaps and nothing left over.
const partition = (() => {
  const key = Pair.fnToKey((a, b) => (a === OTHER) !== (b === OTHER), geometry);
  return gridCells.map(cell => new Pair(key, 'one-galaxy-per-cell',
    overlays[0].at(cell), overlays[1].at(cell)));
})();

// 180-degree symmetry: a cell is in the galaxy exactly when its image is.
const symmetry = DOTS.flatMap((dot, i) => {
  const label = labelOf(i);
  const overlay = overlays[layerOf(i)];
  const key = Pair.fnToKey((a, b) => (a === label) === (b === label), geometry);
  return zones[i].flatMap(cell => {
    const image = rotate(cell, dot);
    if (cellOrder.get(image) <= cellOrder.get(cell)) return [];
    return [new Pair(key, `galaxy-${i + 1}-symmetry`,
      ...overlay.at([cell, image]))];
  });
});

// Each galaxy is one connected region (every dot is a genuine galaxy centre,
// so every label is realised).
const connectivity = DOTS.map(
  (dot, i) => new ConnectedValues(LAYERS[layerOf(i)], labelOf(i)));

return [
  shape,
  // The main grid carries no puzzle content; pin it so it does not widen the
  // search or multiply the solution count.
  graph.makeReplicate(new Given(gridCells[0], 1)),
  ...overlays.map((overlay, layer) => overlay.toVar(`galaxy-${LAYERS[layer]}`)),
  ...labelDomain,
  ...partition,
  ...symmetry,
  ...connectivity,
];
