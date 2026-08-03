// Title: Galactic Whispers
// Author: Knickolas
// Video: https://www.youtube.com/watch?v=kZT5Hs5O6Co
// Source: https://app.crackingthecryptic.com/sudoku/H26FG6Bnjp

// Rules encoded here:
//   * Normal sudoku.
//   * Four dots mark the centres of 180-degree-rotationally-symmetric
//     "galaxies": orthogonally connected, non-overlapping sets of cells. A
//     cell not claimed by any galaxy is simply outside every galaxy -- unlike
//     some galaxy variants, this puzzle does not require the grid to be
//     fully partitioned.
//   * Orthogonally adjacent cells that belong to the same galaxy differ by
//     at least 5.
//   * Six named cells ("caged cells" in the rules) each belong to one of the
//     four galaxies -- which one is left for the solver.
// Nothing is omitted.
//
// Model: one Var per grid cell holds the label of the galaxy owning that
// cell (or NONE), over the default 9x9 value range -- five label codes fit
// well inside 1-9, so no widened Shape is needed. A cell's candidate labels
// are restricted to NONE plus every galaxy whose 180-degree image of the
// cell still lands on the grid (a cell whose image falls off the grid can
// never be part of that galaxy, since its mirror partner would have to sit
// outside the board). Symmetry, connectivity/existence and the digit rule
// are then layered on top.

const GRID = '9x9';
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const graph = cellGraph(GRID);
const gridCells = graph.cells();
const gridCellSet = new Set(gridCells);

// Transcribed from the four drawn dots (all four are edge-midpoint marks).
// Positions are in half-cell units so a dot on a cell centre, edge midpoint
// or grid corner is alike integral: cell RiCj has centre (2i-1, 2j-1).
const GALAXIES = [
  { name: 'G1', r: 9, c: 10 },   // edge R5C5 / R5C6
  { name: 'G2', r: 10, c: 5 },   // edge R5C3 / R6C3
  { name: 'G3', r: 5, c: 10 },   // edge R3C5 / R3C6
  { name: 'G4', r: 14, c: 15 },  // edge R7C8 / R8C8
];

// Transcribed from the six real (non-stub, no-total) single-cell cages.
const CAGED_CELLS = ['R9C2', 'R8C5', 'R4C2', 'R8C9', 'R3C7', 'R5C4'];

const halfCoords = (cell) => {
  const { row, col } = parseCellId(cell);
  return { r: 2 * row - 1, c: 2 * col - 1 };
};
// The cell diametrically opposite `cell` through galaxy `g`'s dot, or null
// when that lands outside the grid.
const rotate = (cell, g) => {
  const { r, c } = halfCoords(cell);
  const image = makeCellId((2 * g.r - r + 1) / 2, (2 * g.c - c + 1) / 2);
  return gridCellSet.has(image) ? image : null;
};

// Every cell whose rotational image (through this galaxy's dot) also lands on
// the grid. No other size bound applies: unlike puzzles that pair a measured
// sum to each galaxy, this rule only constrains adjacent digits, so a galaxy
// may grow to any size its symmetry and connectivity allow.
const zones = GALAXIES.map(g => new Set(gridCells.filter(cell => rotate(cell, g))));

const NONE = 1;
const labelOf = (i) => i + 2; // G1..G4 -> 2..5

const shape = new Shape(GRID);
const galaxy = graph.makeOverlay('VG');

// One label per cell: NONE, or any galaxy whose zone includes the cell. A
// caged cell additionally drops NONE -- the rules name it as belonging to a
// galaxy with a given centre, so it may not sit outside every galaxy.
const cagedSet = new Set(CAGED_CELLS);
const labelDomain = gridCells.map(cell => {
  const candidates = GALAXIES.flatMap(
    (g, i) => zones[i].has(cell) ? [labelOf(i)] : []);
  const values = cagedSet.has(cell) ? candidates : [NONE, ...candidates];
  return new Given(galaxy.at(cell), ...values);
});

// 180-degree symmetry: a cell holds a galaxy's label exactly when its image
// does too. Each rotational pair is asserted once.
const cellOrder = new Map(gridCells.map((cell, i) => [cell, i]));
const geometry = graph.gridGeometry();
const symmetry = GALAXIES.flatMap((g, i) => {
  const label = labelOf(i);
  const key = Pair.fnToKey((a, b) => (a === label) === (b === label), geometry);
  return [...zones[i]].flatMap(cell => {
    const image = rotate(cell, g);
    if (cellOrder.get(image) <= cellOrder.get(cell)) return [];
    return [new Pair(key, `${g.name}-symmetry`, ...galaxy.at([cell, image]))];
  });
});

// Each dot is stated to be the centre of an actual galaxy, so every galaxy is
// non-empty; ConnectedValues also enforces the "orthogonally connected" part
// of the rule.
const connectivity = GALAXIES.map(
  (g, i) => new ConnectedValues('VG', labelOf(i)));

// "Adjacent digits in the same galaxy differ by at least 5": one small NFA
// per orthogonal edge, reading (labelA, digitA, labelB, digitB) in order.
// Reused identically everywhere since the label/digit codes are the same
// across the whole grid.
const adjacencyMachine = NFA.encodeSpec({
  startState: { i: 0 },
  transition: (state, value) => {
    if (state.i === 0) return { i: 1, labelA: value };
    if (state.i === 1) return { i: 2, labelA: state.labelA, digitA: value };
    if (state.i === 2) {
      return { i: 3, labelA: state.labelA, digitA: state.digitA, labelB: value };
    }
    // i === 3: value is digitB.
    const sameGalaxy = state.labelA === state.labelB && state.labelA !== NONE;
    if (sameGalaxy && Math.abs(state.digitA - value) < 5) return undefined;
    return { i: 4 };
  },
  accept: (state) => state.i === 4,
}, geometry);

const edges = gridCells.flatMap(cell => {
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  return [
    ...(right ? [[cell, right]] : []),
    ...(down ? [[cell, down]] : []),
  ];
});
const adjacency = edges.map(([a, b]) => new NFA(
  adjacencyMachine, 'galaxy-adjacency', galaxy.at(a), a, galaxy.at(b), b));

return [
  shape,
  galaxy.toVar('galaxy'),
  new Given('R2C4', 4),
  new Given('R4C7', 6),
  new Given('R7C6', 9),
  new Given('R8C1', 5),
  new Given('R9C2', 3),
  ...labelDomain,
  ...symmetry,
  ...connectivity,
  ...adjacency,
];
