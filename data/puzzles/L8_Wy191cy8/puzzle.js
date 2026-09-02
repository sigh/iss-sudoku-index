// Title: Cosmic Cages
// Author: yangang
// Video: https://www.youtube.com/watch?v=L8_Wy191cy8
// Source: https://sudokupad.app/gyouoafcwb

// Rules encoded here:
//   * Normal sudoku. The grid carries no givens.
//   * The grid is divided into non-overlapping "galaxies" of orthogonally
//     connected cells; every cell belongs to exactly one galaxy.
//   * Each galaxy is 180 degree rotationally symmetric about its own centre.
//   * Each drawn circle is the centre of a galaxy and the number printed with
//     it is the sum of that galaxy's digits. Digits may repeat in a galaxy.
//
// Two clauses are deliberately not encoded:
//   * "Orthogonally adjacent galaxies cannot be congruent (i.e. they cannot
//     have the same shape and size, even if they are rotated or reflected)."
//   * "Not all galaxy centers are necessarily given." Cells belonging to a
//     galaxy with no drawn circle are left free here: they are not required to
//     form further connected, 180 degree symmetric galaxies.
// Everything the encoding does assert is therefore weaker than the rules, never
// stronger.

// Model: one Var per grid cell holds the label of the galaxy owning the cell.
// The 13 drawn circles take labels 1..13; label 14 (OTHER) means "in some
// galaxy whose centre is not drawn", and carries no constraint of its own,
// which is exactly the omission above. One label per cell is what makes the
// drawn galaxies non-overlapping.

const GRID = '9x9';
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const GRID_CELLS = 81;
const FULL_SUM = 405;  // nine rows of 1..9
const gridCells = cellGraph(GRID).cells();

// Transcribed from the 13 white circle overlays and their 13 number texts.
// `cells` are the cells the circle is drawn on: one cell for a circle at a cell
// centre, the two cells sharing the edge for an edge circle, the four cells
// meeting at the point for a vertex circle -- the circle's centre point is
// their centroid. `value` is the number drawn with that circle; the pairing is
// forced by position, each text sitting either exactly on its circle (edge and
// vertex circles) or one quarter cell up and left of it, in the top-left corner
// of the circled cell, as the rules paragraph states.
const GALAXIES = [
  { cells: ['R7C2', 'R7C3', 'R8C2', 'R8C3'], value: 21 },
  { cells: ['R8C6', 'R8C7'], value: 27 },
  { cells: ['R7C8', 'R7C9', 'R8C8', 'R8C9'], value: 19 },
  { cells: ['R3C2', 'R3C3'], value: 23 },
  { cells: ['R2C5', 'R3C5'], value: 21 },
  { cells: ['R6C4'], value: 96 },
  { cells: ['R5C2'], value: 21 },
  { cells: ['R5C5'], value: 9 },
  { cells: ['R9C5'], value: 15 },
  { cells: ['R4C7'], value: 20 },
  { cells: ['R4C9'], value: 30 },
  { cells: ['R2C7'], value: 21 },
  { cells: ['R1C3'], value: 14 },
];

// Positions in half-cell units, so a cell centre, an edge midpoint and a grid
// vertex are alike integral: cell RiCj has centre (2i-1, 2j-1).
const halfCoords = (cell) => {
  const { row, col } = parseCellId(cell);
  return { r: 2 * row - 1, c: 2 * col - 1 };
};
const centerOf = (cells) => {
  const pts = cells.map(halfCoords);
  return {
    r: pts.reduce((a, p) => a + p.r, 0) / pts.length,
    c: pts.reduce((a, p) => a + p.c, 0) / pts.length,
  };
};
const gridCellSet = new Set(gridCells);
// The cell diametrically opposite `cell` through half-coord point `g`, or null
// when that image lands outside the grid.
const rotate = (cell, g) => {
  const { r, c } = halfCoords(cell);
  const image = makeCellId((2 * g.r - r + 1) / 2, (2 * g.c - c + 1) / 2);
  return gridCellSet.has(image) ? image : null;
};

for (const g of GALAXIES) g.center = centerOf(g.cells);

// Cell counts a galaxy can have, given its printed total. Digits run 1..9 and
// may repeat, so a total S over n cells needs only ceil(S/9) <= n <= S. Parity
// is fixed by where the circle is drawn: the half-turn fixes the circled cell
// when the circle is at a cell centre (odd size) and fixes no cell when it is
// on an edge or at a vertex (even size).
const parityOf = (g) => (g.cells.length === 1 ? 1 : 0);
const sizesUpTo = (g, cap) => {
  const out = [];
  for (let n = Math.ceil(g.value / 9); n <= Math.min(g.value, cap); n++) {
    if (n % 2 === parityOf(g)) out.push(n);
  }
  return out;
};
const minSize = (g) => sizesUpTo(g, GRID_CELLS)[0];

// The drawn totals leave FULL_SUM - 337 = 68 for the galaxies with no drawn
// circle, so at least ceil(68/9) cells lie outside every drawn galaxy. Those
// cells, plus the other twelve galaxies at their smallest, cap this galaxy.
const undrawnCells =
  Math.ceil((FULL_SUM - GALAXIES.reduce((a, g) => a + g.value, 0)) / 9);
const maxSize = (g) => {
  const others = GALAXIES.reduce((a, h) => a + (h === g ? 0 : minSize(h)), 0);
  const sizes = sizesUpTo(g, GRID_CELLS - undrawnCells - others);
  return sizes[sizes.length - 1];
};

// Which cells a galaxy could reach. A cell at half-coord Manhattan distance d
// from the centre lies d cells away from its own rotational image, so a path
// joining the two inside a connected galaxy uses at least d+1 cells, giving
// d <= maxSize - 1. A cell whose image falls off the grid cannot be in the
// galaxy at all, since the image would have to be in it too.
const zoneOf = (g) => {
  const limit = maxSize(g) - 1;
  return gridCells.filter(cell => {
    const { r, c } = halfCoords(cell);
    return Math.abs(r - g.center.r) + Math.abs(c - g.center.c) <= limit &&
      rotate(cell, g.center);
  });
};
const zones = GALAXIES.map(zoneOf);

const OTHER = GALAXIES.length + 1;
const shape = new Shape(GRID, OTHER);
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const galaxy = graph.makeOverlay('VG');
const cellOrder = new Map(gridCells.map((cell, i) => [cell, i]));

// Grid cells hold digits; the widened value range exists only for the labels.
const digitDomain = graph.makeReplicate(new Given(gridCells[0], ...DIGITS));

// Every cell carries exactly one label. A circled cell is pinned to its own
// galaxy: the circle is the centre of that galaxy, so it lies inside it, and a
// circle drawn on an edge or a vertex lies inside all of the cells it touches.
const centerLabel = new Map(
  GALAXIES.flatMap((g, i) => g.cells.map(cell => [cell, i + 1])));
const labelDomain = gridCells.map(cell => new Given(
  galaxy.at(cell),
  ...(centerLabel.has(cell)
    ? [centerLabel.get(cell)]
    : [OTHER, ...zones.flatMap((zone, i) => zone.includes(cell) ? [i + 1] : [])])));

// 180 degree symmetry: a cell is in the galaxy exactly when its image is.
const symmetry = GALAXIES.flatMap((g, i) => {
  const label = i + 1;
  const key = Pair.fnToKey((a, b) => (a === label) === (b === label), geometry);
  return zones[i].flatMap(cell => {
    const image = rotate(cell, g.center);
    if (cellOrder.get(image) <= cellOrder.get(cell)) return [];
    return [new Pair(key, `galaxy-${label}-symmetry`, ...galaxy.at([cell, image]))];
  });
});

const connectivity =
  GALAXIES.map((g, i) => new ConnectedValues('VG', i + 1));

// The printed total: one machine per galaxy scans that galaxy's zone as
// (label, digit) pairs and adds up the digits of the cells carrying its label.
// `reading` is true while the next cell read is the digit belonging to the
// label just seen; `inGalaxy` says whether that label was this galaxy's. The
// running sum is bounded by rejecting as soon as it passes the printed total,
// so the machine never holds more than value+1 sum states.
const galaxyTotals = GALAXIES.map((g, i) => {
  const label = i + 1;
  const machine = NFA.encodeSpec({
    startState: { sum: 0, reading: false, inGalaxy: false },
    transition: (state, value) => {
      if (!state.reading) {
        return { sum: state.sum, reading: true, inGalaxy: value === label };
      }
      if (!state.inGalaxy) {
        return { sum: state.sum, reading: false, inGalaxy: false };
      }
      if (value > DIGITS.length) return undefined;  // grid cells never exceed 9
      const sum = state.sum + value;
      if (sum > g.value) return undefined;  // past the printed total
      return { sum, reading: false, inGalaxy: false };
    },
    accept: (state) => !state.reading && state.sum === g.value,
  }, geometry);
  return new NFA(machine, `galaxy-${label}-total`,
    ...zones[i].flatMap(cell => [galaxy.at(cell), cell]));
});

return [
  shape,
  galaxy.toVar('galaxy'),
  digitDomain,
  ...labelDomain,
  ...symmetry,
  ...connectivity,
  ...galaxyTotals,
];
