// Title: The Devil's Skywalker Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=GUs0h3YRhaw
// Source: https://cracking-the-cryptic.web.app/sudoku/HGNm8jbpND

// Rules encoded here:
//   * Normal sudoku.
//   * 15 dots mark the centres of "galaxies": orthogonally connected groups of
//     cells with 180 degree rotational symmetry about the dot. Each galaxy
//     acts as a killer cage -- its digits sum to the printed number (or, for
//     the one dot printed ">9", exceed 9) and do not repeat. Not every cell
//     has to belong to a galaxy.
// Nothing is omitted.
//
// Model: one Var per grid cell holds the label of the galaxy that owns the
// cell, or a NONE sentinel, on a value range widened to fit 15 galaxy labels
// plus NONE: a bounded reachable zone per galaxy (from the largest cage size
// the printed sum admits), a per-cell domain restriction to NONE plus the
// zones that could reach it, a Pair per mirrored cell pair enforcing the
// symmetry, one ConnectedValues per galaxy, and one NFA per galaxy reading
// (label, digit) pairs across its zone to check the sum and no-repeat
// conditions together.

const GRID = '9x9';
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const gridCells = cellGraph(GRID).cells();

// Dot positions in half-cell units, so a cell-centred dot and an edge-centred
// dot are alike integral: cell RiCj (1-indexed) has centre (2i-1, 2j-1); an
// edge dot sits at the midpoint of its two cells' centres. Transcribed from
// the drawn dot markers, each matched to its nearest printed sum label by
// distance -- unambiguous, every dot's nearest label is far closer than the
// next candidate. `sum` is the printed cage total; `min` marks the one dot
// printed ">9" (sum must exceed `min`, no exact target given).
const GALAXIES = [
  { r: 5, c: 4, sum: 26 },   // A: edge R3C2/R3C3
  { r: 4, c: 9, sum: 31 },   // B: edge R2C5/R3C5
  { r: 3, c: 13, sum: 9 },   // C: R2C7
  { r: 7, c: 15, sum: 7 },   // D: R4C8
  { r: 8, c: 13, sum: 15 },  // E: edge R4C7/R5C7
  { r: 9, c: 11, sum: 17 },  // F: R5C6
  { r: 7, c: 8, sum: 15 },   // G: edge R4C4/R4C5
  { r: 10, c: 7, sum: 30 },  // H: edge R5C4/R6C4
  { r: 9, c: 3, sum: 7 },    // I: R5C2
  { r: 13, c: 4, sum: 28 },  // J: edge R7C2/R7C3
  { r: 15, c: 6, sum: 10 },  // K: edge R8C3/R8C4
  { r: 13, c: 9, min: 9 },   // L: R7C5, printed ">9"
  { r: 15, c: 11, sum: 8 },  // M: R8C6
  { r: 13, c: 14, sum: 17 }, // N: edge R7C7/R7C8
  { r: 11, c: 15, sum: 7 },  // O: R6C8
];

const halfCoords = (cell) => {
  const { row, col } = parseCellId(cell);
  return { r: 2 * row - 1, c: 2 * col - 1 };
};
const gridCellSet = new Set(gridCells);
// The cell diametrically opposite `cell` through galaxy `g`'s dot, or null
// when that lands outside the grid.
const rotate = (cell, g) => {
  const { r, c } = halfCoords(cell);
  const image = makeCellId((2 * g.r - r + 1) / 2, (2 * g.c - c + 1) / 2);
  return gridCellSet.has(image) ? image : null;
};

// Cell counts a galaxy's cage could have. A cage of n distinct 1-9 digits
// sums between 1+..+n and 9+..+(10-n); a dot printed ">9" only needs its
// largest reachable sum to clear 9, which every size from 2 up already does
// (no single digit exceeds 9), so its size is bounded only by the no-repeat
// cap of 9 cells.
const possibleSizes = (g) => DIGITS.filter(n => {
  if (g.min !== undefined) return (n * (19 - n)) / 2 > g.min;
  return g.sum >= (n * (n + 1)) / 2 && g.sum <= (n * (19 - n)) / 2;
});

// Which cells a galaxy could reach. A cell at half-distance d from the centre
// drags its rotational image along, and a connected galaxy joining the two
// needs at least d+1 cells, so d <= maxSize-1. A cell whose image falls
// outside the grid cannot be in the galaxy at all.
const zoneOf = (g) => {
  const limit = Math.max(...possibleSizes(g)) - 1;
  return gridCells.filter(cell => {
    const { r, c } = halfCoords(cell);
    return Math.abs(r - g.r) + Math.abs(c - g.c) <= limit && rotate(cell, g);
  });
};
const zones = GALAXIES.map(zoneOf);

// One label (1..15) per galaxy plus a NONE sentinel for cells outside every
// galaxy -- the puzzle explicitly allows cells with no galaxy.
const labels = GALAXIES.map((_, i) => i + 1);
const NONE = GALAXIES.length + 1; // 16

const shape = new Shape(GRID, NONE);
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const galaxy = graph.makeOverlay('VG');
const cellOrder = new Map(gridCells.map((cell, i) => [cell, i]));

// Grid cells hold digits; the widened value range exists only for the labels.
const digitDomain = graph.makeReplicate(new Given(gridCells[0], ...DIGITS));

// Every cell's label is NONE, or the label of a galaxy whose zone reaches it.
const labelDomain = gridCells.map(cell => new Given(
  galaxy.at(cell),
  NONE,
  ...zones.flatMap((zone, i) => zone.includes(cell) ? [labels[i]] : [])));

// The dot marks the centre of its own galaxy, so the cell(s) it sits on
// belong to that galaxy (never NONE, never another galaxy). For an
// edge-centred dot this pins one of the pair; the symmetry constraint below
// forces its mirror partner to the same label. Every zone contains its own
// anchor cell(s) (distance 0 for a cell-centred dot, 1 for an edge-centred
// one), so the search below always finds a match.
const anchors = GALAXIES.map((g, i) => {
  const cell = zones[i].find(c => {
    const { r, c: cc } = halfCoords(c);
    return Math.abs(r - g.r) + Math.abs(cc - g.c) <= 1;
  });
  return new Given(galaxy.at(cell), labels[i]);
});

// 180 degree symmetry: a cell is in galaxy i exactly when its rotational
// image is.
const symmetry = GALAXIES.flatMap((g, i) => {
  const label = labels[i];
  const key = Pair.fnToKey((a, b) => (a === label) === (b === label), geometry);
  return zones[i].flatMap(cell => {
    const image = rotate(cell, g);
    if (cellOrder.get(image) <= cellOrder.get(cell)) return [];
    return [new Pair(key, `galaxy-${i + 1}-symmetry`, ...galaxy.at([cell, image]))];
  });
});

// Every galaxy label is forced onto at least its anchor cell, so each of
// these 15 groups is always non-empty.
const connectivity = GALAXIES.map((g, i) => new ConnectedValues('VG', labels[i]));

// Cage sum and no-repeat are both functions of the set of digits a galaxy
// holds, so one machine per galaxy scans its zone as (label, digit) pairs and
// accumulates that set as a bitmask. `reading` is true while the next value
// is the digit belonging to the label just seen.
const digitsOfMask = (mask) => DIGITS.filter(d => mask & (1 << (d - 1)));
const galaxyContents = GALAXIES.map((g, i) => {
  const label = labels[i];
  const machine = NFA.encodeSpec({
    startState: { mask: 0, reading: false, inGalaxy: false },
    transition: (state, value) => {
      if (!state.reading) {
        return { mask: state.mask, reading: true, inGalaxy: value === label };
      }
      if (!state.inGalaxy) {
        return { mask: state.mask, reading: false, inGalaxy: false };
      }
      // Grid cells never exceed 9; the wider alphabet is only for labels.
      if (value > DIGITS.length) return undefined;
      const bit = 1 << (value - 1);
      if (state.mask & bit) return undefined; // digits do not repeat
      return { mask: state.mask | bit, reading: false, inGalaxy: false };
    },
    accept: (state) => {
      if (state.reading) return false;
      const digits = digitsOfMask(state.mask);
      if (!digits.length) return false;
      const sum = digits.reduce((a, b) => a + b, 0);
      return g.min !== undefined ? sum > g.min : sum === g.sum;
    },
  }, geometry);
  return new NFA(machine, `galaxy-${i + 1}-contents`,
    ...zones[i].flatMap(cell => [galaxy.at(cell), cell]));
});

return [
  shape,
  galaxy.toVar('galaxy'),
  digitDomain,
  ...labelDomain,
  ...anchors,
  ...symmetry,
  ...connectivity,
  ...galaxyContents,
];
