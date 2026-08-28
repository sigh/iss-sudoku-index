// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=V-IJ5NXwjAU
// Source: https://cracking-the-cryptic.web.app/sudoku/NNL8HBpHLp

// Rules encoded here:
//   * Normal 9x9 sudoku, no givens.
//   * 14 circles mark the centres of "galaxies": orthogonally connected,
//     180-degree point-symmetric groups of cells that function as killer
//     cages (digits inside sum to the printed total, no repeats). Two
//     circles print an inequality ("<9", ">12") instead of an exact total.
//     Not every cell has to belong to a galaxy.
//   * Each galaxy is also a branch-free "thermometer" -- digits strictly
//     increase from an unmarked bulb end -- and is symmetrical about its
//     circle. THIS CLAUSE IS OMITTED: see the note below "GALAXIES".
//
// No galaxy shape, cage outline, or thermometer stroke is drawn in the
// payload; every galaxy's membership is a solver deduction anchored only by
// its circle's position and total.
//
// Model: one widened-value overlay VG holds, per cell, the label (1-14) of
// the galaxy owning it, or 15 ("OTHER") for a cell in no galaxy. 14 labels
// plus one marker is exactly CellGeometry.MAX_SIZE (16), so a single layer
// suffices (contrast the split layers other galaxy puzzles in this pipeline
// need past 15 labels). Because each cell's Var carries exactly one label,
// the layer already is a partition -- no separate one-label-per-cell rule is
// needed the way a 2-layer split requires.

const GRID = '9x9';
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const OTHER = 15;

// The 14 circles, transcribed from the drawn overlay positions and matched
// to their printed totals by nearest cell. Position uses the source's own
// convention: an integer row/col is a cell centre, a half-integer row/col is
// the midpoint between two cells, so `cr`/`cc` are continuous 1-indexed
// coordinates and a cell (row, col) reflects through (cr, cc) to
// (2*cr - row, 2*cc - col) whether the centre is cell- or edge-anchored.
//
// GALAXIES do not encode the "thermometer" clause: that the galaxy's cells
// must additionally form a single branch-free path (degree <= 2 under
// orthogonal adjacency within the galaxy) with digits strictly increasing
// from one endpoint (which endpoint is unmarked). What is encoded below
// (label partition, 180-degree symmetry, orthogonal connectivity, cage
// sum/inequality, no repeated digit) is the full galaxy topology minus that
// clause.
const GALAXIES = [
  { cr: 1, cc: 4.5, sum: { type: 'eq', value: 13 } },  // edge R1C4|R1C5
  { cr: 1, cc: 7.5, sum: { type: 'lt', value: 9 } },   // edge R1C7|R1C8, "<9"
  { cr: 2.5, cc: 2, sum: { type: 'eq', value: 35 } },  // edge R2C2|R3C2
  { cr: 2, cc: 3.5, sum: { type: 'eq', value: 20 } },  // edge R2C3|R2C4
  { cr: 2, cc: 8.5, sum: { type: 'eq', value: 8 } },   // edge R2C8|R2C9
  { cr: 5, cc: 5, sum: { type: 'gt', value: 12 } },    // cell R5C5, ">12"
  { cr: 5.5, cc: 8, sum: { type: 'eq', value: 38 } },  // edge R5C8|R6C8
  { cr: 5, cc: 7, sum: { type: 'eq', value: 7 } },     // cell R5C7
  { cr: 6, cc: 1, sum: { type: 'eq', value: 9 } },     // cell R6C1
  { cr: 5, cc: 2.5, sum: { type: 'eq', value: 9 } },   // edge R5C2|R5C3
  { cr: 6.5, cc: 2, sum: { type: 'eq', value: 16 } },  // edge R6C2|R7C2
  { cr: 7, cc: 5.5, sum: { type: 'eq', value: 15 } },  // edge R7C5|R7C6
  { cr: 8.5, cc: 3, sum: { type: 'eq', value: 18 } },  // edge R8C3|R9C3
  { cr: 8, cc: 5.5, sum: { type: 'eq', value: 15 } },  // edge R8C5|R8C6
];

const shape = new Shape(GRID, OTHER);
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const cellOrder = new Map(gridCells.map((cell, i) => [cell, i]));
const overlay = graph.makeOverlay('VG');

// The cell diametrically opposite `cell` through galaxy `g`, or null when
// that lands outside the grid.
const rotate = (cell, g) => {
  const { row, col } = parseCellId(cell);
  const imageRow = 2 * g.cr - row;
  const imageCol = 2 * g.cc - col;
  if (!Number.isInteger(imageRow) || !Number.isInteger(imageCol)) return null;
  if (imageRow < 1 || imageRow > 9 || imageCol < 1 || imageCol > 9) return null;
  return makeCellId(imageRow, imageCol);
};

// Largest cell count a galaxy could have. Distinct digits from 1-9 cap it at
// 9; with n of them the achievable sum range is [n(n+1)/2, n(19-n)/2], which
// a printed total (or the feasible side of a printed inequality) narrows.
const maxSize = (sum) => {
  let best = 0;
  for (let n = 1; n <= 9; n++) {
    const lo = (n * (n + 1)) / 2;
    const hi = (n * (19 - n)) / 2;
    const feasible =
      sum.type === 'eq' ? lo <= sum.value && sum.value <= hi :
      sum.type === 'gt' ? hi > sum.value :
      /* 'lt' */           lo < sum.value;
    if (feasible) best = n;
  }
  return best;
};

// Which cells a galaxy could reach. A cell at Manhattan distance d from the
// centre drags its rotational image along (the image sits at distance d on
// the far side), so any connected path holding both needs at least 2d+1
// cells -- bounding d by (maxSize-1)/2. A cell whose image falls off the
// grid cannot be in the galaxy at all (that image cell would have no
// on-grid partner for its own symmetry requirement).
const zoneOf = (g) => {
  const limit = (maxSize(g.sum) - 1) / 2;
  return gridCells.filter(cell => {
    const { row, col } = parseCellId(cell);
    if (Math.abs(row - g.cr) + Math.abs(col - g.cc) > limit) return false;
    return rotate(cell, g) !== null;
  });
};
const zones = GALAXIES.map(zoneOf);
const zoneSets = zones.map(zone => new Set(zone));

// Grid cells hold digits 1-9; the widened value range exists only for VG.
const digitDomain = graph.makeReplicate(new Given(gridCells[0], ...DIGITS));

// Each cell's label is OTHER, or any galaxy whose zone reaches it.
const labelDomain = gridCells.map(cell => new Given(overlay.at(cell), OTHER,
  ...GALAXIES.flatMap((g, i) => zoneSets[i].has(cell) ? [i + 1] : [])));

// 180-degree symmetry: within galaxy i's zone, a cell carries label i+1
// exactly when its rotational image does.
const symmetry = GALAXIES.flatMap((g, i) => {
  const label = i + 1;
  const key = Pair.fnToKey((a, b) => (a === label) === (b === label), OTHER);
  return zones[i].flatMap(cell => {
    const image = rotate(cell, g);
    if (cellOrder.get(image) <= cellOrder.get(cell)) return [];
    return [new Pair(key, `galaxy-${label}-symmetry`, overlay.at(cell), overlay.at(image))];
  });
});

// Orthogonal connectivity: every galaxy is exactly one non-empty connected
// region (weaker than "forms a branch-free path" -- see the omission above).
const connectivity = GALAXIES.map((g, i) => new ConnectedValues('VG', i + 1));

// No repeated digit and the printed total/inequality are both functions of
// the set of digits a galaxy holds, so one NFA per galaxy scans its zone as
// (label, digit) pairs and accumulates that set as a 9-bit mask. `reading`
// is true while the next symbol is the digit belonging to the label cell
// just seen; `inGalaxy` gates whether that digit counts.
const digitsOfMask = (mask) => DIGITS.filter(d => mask & (1 << (d - 1)));
const galaxyContents = GALAXIES.map((g, i) => {
  const label = i + 1;
  const machine = NFA.encodeSpec({
    startState: { mask: 0, reading: false, inGalaxy: false },
    transition: (state, value) => {
      if (!state.reading) {
        return { mask: state.mask, reading: true, inGalaxy: value === label };
      }
      if (!state.inGalaxy) {
        return { mask: state.mask, reading: false, inGalaxy: false };
      }
      if (value > DIGITS.length) return undefined;  // VG label symbol, not a digit
      const bit = 1 << (value - 1);
      if (state.mask & bit) return undefined;  // digits do not repeat
      return { mask: state.mask | bit, reading: false, inGalaxy: false };
    },
    accept: (state) => {
      if (state.reading) return false;
      const total = digitsOfMask(state.mask).reduce((a, b) => a + b, 0);
      return g.sum.type === 'eq' ? total === g.sum.value :
             g.sum.type === 'gt' ? total > g.sum.value :
             /* 'lt' */             total < g.sum.value;
    },
  }, geometry);
  return new NFA(machine, `galaxy-${label}-contents`,
    ...zones[i].flatMap(cell => [overlay.at(cell), cell]));
});

return [
  shape,
  overlay.toVar('galaxy membership'),
  digitDomain,
  ...labelDomain,
  ...symmetry,
  ...connectivity,
  ...galaxyContents,
];
