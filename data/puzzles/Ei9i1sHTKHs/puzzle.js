// Title: Untitled
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=Ei9i1sHTKHs
// Source: https://cracking-the-cryptic.web.app/sudoku/Qtd84QLnMr

// Rules encoded here:
//  - Normal sudoku.
//  - Sixteen dots mark the centres of "galaxies": orthogonally connected
//    groups of cells with 180-degree rotational symmetry about their own
//    dot. Each galaxy is a killer cage: its digits sum to the dot's printed
//    value and do not repeat. A galaxy's shape and size are not drawn -- the
//    solver finds them. Not every cell has to belong to a galaxy, and
//    galaxies may not overlap.
// Nothing is omitted.
//
// Model: one label Var per grid cell names which galaxy owns it, or FREE
// when it belongs to none. Fifteen of the sixteen dots need this search --
// they get one label each (1-15); the sixteenth (the sum-4 dot, below) is
// pinned outright, so 15 real labels plus FREE fits one 16-value overlay
// (CellGeometry.MAX_SIZE), unlike the two-layer split larger galaxy counts
// have needed elsewhere. Overlap is impossible by construction: a cell's
// label is a single Var, so it can name at most one galaxy.

const GRID = '9x9';
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Transcribed from the drawn dots and each dot's nearest free-floating sum
// label. Positions are in half-cell units, so a dot
// on a cell centre or an edge midpoint is alike integral: cell RiCj has
// centre (2i-1, 2j-1), and an edge dot sits at the two cells' averaged
// centre. `parity` records which centre type the dot has: a cell-centred
// dot's shape has that cell as a 180-degree fixed point, so its size is
// always odd; an edge-centred dot pairs every cell (no fixed point), so its
// size is always even. This bounds each galaxy's candidate zone below; it
// does not choose the galaxy's actual cells.
const GALAXIES = [
  { r: 2, c: 3, value: 18, parity: 'even' },   // edge R1C2-R2C2
  { r: 1, c: 7, value: 10, parity: 'odd' },    // cell R1C4
  { r: 3, c: 11, value: 45, parity: 'odd' },   // cell R2C6
  { r: 5, c: 15, value: 36, parity: 'odd' },   // cell R3C8
  { r: 7, c: 16, value: 17, parity: 'even' },  // edge R4C8-R4C9
  { r: 10, c: 15, value: 14, parity: 'even' }, // edge R5C8-R6C8
  { r: 13, c: 15, value: 10, parity: 'odd' },  // cell R7C8
  { r: 15, c: 13, value: 7, parity: 'odd' },   // cell R8C7
  { r: 17, c: 13, value: 18, parity: 'odd' },  // cell R9C7
  { r: 15, c: 9, value: 7, parity: 'odd' },    // cell R8C5
  { r: 13, c: 8, value: 25, parity: 'even' },  // edge R7C4-R7C5
  { r: 11, c: 7, value: 45, parity: 'odd' },   // cell R6C4
  { r: 7, c: 8, value: 30, parity: 'even' },   // edge R4C4-R4C5
  { r: 8, c: 3, value: 20, parity: 'even' },   // edge R4C2-R5C2
  { r: 5, c: 3, value: 23, parity: 'odd' },    // cell R3C2
  { r: 12, c: 1, value: 4, parity: 'even' },   // edge R6C1-R7C1
];

const graph = cellGraph(GRID);
const gridCells = graph.cells();
const gridCellSet = new Set(gridCells);
const cellOrder = new Map(gridCells.map((cell, i) => [cell, i]));

const halfCoords = (cell) => {
  const { row, col } = parseCellId(cell);
  return { r: 2 * row - 1, c: 2 * col - 1 };
};

// The cell diametrically opposite `cell` through galaxy `g`'s dot, or null
// when that lands outside the grid.
const rotate = (cell, g) => {
  const { r, c } = halfCoords(cell);
  const ir = 2 * g.r - r, ic = 2 * g.c - c;
  if ((ir + 1) % 2 !== 0 || (ic + 1) % 2 !== 0) return null;
  const image = makeCellId((ir + 1) / 2, (ic + 1) / 2);
  return gridCellSet.has(image) ? image : null;
};

// Cell counts a galaxy can have: with n distinct digits its sum lies between
// 1+..+n and 9+..+(10-n); the printed value fixes that range, and the dot's
// centre type fixes n's parity (see GALAXIES above).
const possibleSizes = (value, parity) => DIGITS.filter(n => {
  const lo = (n * (n + 1)) / 2, hi = (n * (19 - n)) / 2;
  if (value < lo || value > hi) return false;
  return parity === 'odd' ? n % 2 === 1 : n % 2 === 0;
});

// Which cells a galaxy could reach. A cell at half-distance d from the
// centre drags its rotational image along, and a connected galaxy holding
// both needs at least d+1 cells -- used only to bound the candidate set. A
// cell whose image falls outside the grid cannot be in the galaxy at all.
const zoneOf = (g) => {
  const sizes = possibleSizes(g.value, g.parity);
  if (sizes.length === 0) throw new Error(`no valid size for value ${g.value}`);
  const limit = Math.max(...sizes) - 1;
  return gridCells.filter(cell => {
    const { r, c } = halfCoords(cell);
    const dist = (Math.abs(r - g.r) + Math.abs(c - g.c)) / 2;
    return dist <= limit && rotate(cell, g) !== null;
  });
};
const zones = GALAXIES.map(zoneOf);

// A galaxy whose zone is only the pair of cells its dot sits between is
// already pinned to that adjacent pair (nothing else can reach it either),
// so it needs no label, no symmetry pair, no NFA and no ConnectedValues --
// both cells are simply given a direct Sum, below.
const isPinned = (zone) => zone.length <= 2;

const bigIndices = GALAXIES.map((g, i) => i).filter(i => !isPinned(zones[i]));
const labelOf = new Map(); // galaxy index -> label (1..bigIndices.length)
bigIndices.forEach((galaxyIndex, k) => labelOf.set(galaxyIndex, k + 1));
const FREE = bigIndices.length + 1; // "this cell belongs to no galaxy"
const numValues = FREE;
if (numValues > 16) throw new Error(`need ${numValues} values, only 16 fit`);

const shape = new Shape(GRID, numValues);
const wideGraph = cellGraph(shape);
const geometry = wideGraph.gridGeometry();
const layer = wideGraph.makeOverlay('VG');

// Grid cells hold digits; the widened value range exists only for labels.
const digitDomain = wideGraph.makeReplicate(new Given(gridCells[0], ...DIGITS));

const pinnedCells = new Set();
GALAXIES.forEach((g, i) => {
  if (isPinned(zones[i])) zones[i].forEach(cell => pinnedCells.add(cell));
});

// Every cell's label is FREE or one of the big-galaxy labels whose zone
// reaches it (grouping, never overwriting: different galaxies' zones can
// overlap even though at most one can actually claim any one cell). Pinned
// cells are forced to FREE directly -- their real membership is handled by
// the direct Sum below, not by this label layer.
const candidatesByCell = new Map();
for (const i of bigIndices) {
  const label = labelOf.get(i);
  for (const cell of zones[i]) {
    if (pinnedCells.has(cell)) continue;
    if (!candidatesByCell.has(cell)) candidatesByCell.set(cell, []);
    candidatesByCell.get(cell).push(label);
  }
}
const customCells = gridCells.filter(cell => !pinnedCells.has(cell) && candidatesByCell.has(cell));
const defaultCells = gridCells.filter(cell => !customCells.includes(cell));

const labelDomain = [
  layer.makeReplicate(new Given(layer.cells()[0], FREE), layer.at(defaultCells)),
  ...customCells.map(cell => new Given(layer.at(cell), FREE, ...candidatesByCell.get(cell))),
];

// 180-degree symmetry: a cell carries a given big galaxy's label exactly
// when its rotational image does.
const symmetry = bigIndices.flatMap(i => {
  const label = labelOf.get(i);
  const key = Pair.fnToKey((a, b) => (a === label) === (b === label), geometry);
  return zones[i].flatMap(cell => {
    const image = rotate(cell, GALAXIES[i]);
    if (image === cell) return []; // dot sits on this cell's own centre
    if (cellOrder.get(image) <= cellOrder.get(cell)) return []; // dedupe pair
    return [new Pair(key, `galaxy-${i + 1}-symmetry`, ...layer.at([cell, image]))];
  });
});

// Every galaxy is orthogonally connected: exactly one connected region of
// cells carrying that galaxy's label.
const connectivity = bigIndices.map(i => new ConnectedValues('VG', labelOf.get(i)));

// Sum and no-repeat: one machine per big galaxy scans its own zone as
// interleaved (label, digit) pairs and accumulates the digits seen under
// that galaxy's label as a bitmask, accepting when the set is non-empty,
// has no repeat (mask never gains an already-set bit) and sums to the
// printed value.
const digitsOfMask = (mask) => DIGITS.filter(d => mask & (1 << (d - 1)));
const galaxyContents = bigIndices.map(i => {
  const label = labelOf.get(i);
  const machine = NFA.encodeSpec({
    startState: { mask: 0, reading: false, inGalaxy: false },
    transition: (state, value) => {
      if (!state.reading) {
        return { mask: state.mask, reading: true, inGalaxy: value === label };
      }
      if (!state.inGalaxy) {
        return { mask: state.mask, reading: false, inGalaxy: false };
      }
      if (value > DIGITS.length) return undefined; // labels never appear here
      const bit = 1 << (value - 1);
      if (state.mask & bit) return undefined; // digits do not repeat
      return { mask: state.mask | bit, reading: false, inGalaxy: false };
    },
    accept: (state) => {
      if (state.reading) return false;
      const digits = digitsOfMask(state.mask);
      if (!digits.length) return false;
      const sum = digits.reduce((a, b) => a + b, 0);
      return sum === GALAXIES[i].value;
    },
  }, geometry);
  return new NFA(machine, `galaxy-${i + 1}-contents`,
    ...zones[i].flatMap(cell => [layer.at(cell), cell]));
});

// The one pinned galaxy: both cells forced into it (isPinned above), summed
// directly. Its two cells always share a row or column (they sit either
// side of one dot), so sudoku's own all-different already keeps their
// digits apart -- no explicit AllDifferent needed.
const pinnedSums = GALAXIES
  .map((g, i) => ({ g, zone: zones[i] }))
  .filter(({ zone }) => zone.length <= 2)
  .map(({ g, zone }) => new Sum(g.value, ...zone));

return [
  shape,
  layer.toVar('galaxyLabels'),
  digitDomain,
  ...labelDomain,
  ...symmetry,
  ...connectivity,
  ...galaxyContents,
  ...pinnedSums,
];
