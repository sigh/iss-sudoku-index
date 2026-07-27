// Title: Doppler Astronomy
// Author: Blobz
// Video: https://www.youtube.com/watch?v=MMUnGPSttjI
// Source: https://sudokupad.app/blobz/doppler-astronomy

// Rules encoded here:
//   * Normal sudoku.
//   * The grid is divided into "galaxies": orthogonally connected groups of
//     cells with 180 degree rotational symmetry about a marked dot. Every cell
//     belongs to exactly one galaxy and galaxies do not overlap.
//   * Each dot carries a measured value = (sum of the galaxy's digits) plus the
//     galaxy's cell count for a blue dot (blue-shifted) or minus it for a red
//     dot (red-shifted).
//   * A dot with a solid black outline marks a Renban galaxy (its digits form an
//     unbroken consecutive set); a dot without one marks a galaxy whose digits
//     do NOT form such a set.
//   * Digits do not repeat within a galaxy.
//   * Five unmarked single-cell galaxies ("Dark Stars") are placed by the
//     solver: all of their up-to-8 surrounding cells belong to marked galaxies,
//     no box holds two of them, and their five digits are all different.
// Nothing is omitted.
//
// Model: one Var per grid cell holds the label of the galaxy that owns the
// cell, and the value range is widened to make room for those labels. All five
// Dark Stars share a single label: the isolation rule already makes each one
// its own connected component, so one label loses nothing and avoids the
// permutation symmetry that five interchangeable labels would create.

const GRID = '9x9';
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const gridCells = cellGraph(GRID).cells();

// Transcribed from the drawn dots. Positions are in half-cell units so that a
// dot on a cell centre, on an edge midpoint or on a grid corner is alike
// integral: cell RiCj has centre (2i-1, 2j-1). `value` is the number printed
// beside the dot, `blue` is the cornflower-blue fill (the other fill is red)
// and `renban` is the solid black outline.
const GALAXIES = [
  { r: 1, c: 3, value: 17, blue: true, renban: false },   // R1C2
  { r: 3, c: 7, value: 44, blue: true, renban: false },   // R2C4
  { r: 4, c: 9, value: 18, blue: true, renban: false },   // R2C5|R3C5
  { r: 2, c: 17, value: 17, blue: true, renban: false },  // R1C9|R2C9
  { r: 10, c: 7, value: 44, blue: true, renban: true },   // R5C4|R6C4
  { r: 17, c: 6, value: 26, blue: true, renban: false },  // R9C3|R9C4
  { r: 15, c: 11, value: 32, blue: true, renban: false }, // R8C6
  { r: 12, c: 13, value: 49, blue: true, renban: false }, // R6C7|R7C7
  { r: 2, c: 13, value: 2, blue: false, renban: false },  // R1C7|R2C7
  { r: 6, c: 16, value: 28, blue: false, renban: true },  // R3C8/R3C9/R4C8/R4C9
  { r: 7, c: 2, value: 34, blue: false, renban: false },  // R4C1|R4C2
  { r: 8, c: 5, value: 1, blue: false, renban: true },    // R4C3|R5C3
  { r: 7, c: 13, value: 29, blue: false, renban: false }, // R4C7
  { r: 15, c: 1, value: 12, blue: false, renban: false }, // R8C1
  { r: 14, c: 7, value: 16, blue: false, renban: false }, // R7C4|R8C4
  { r: 17, c: 15, value: 6, blue: false, renban: true },  // R9C8
];

const halfCoords = (cell) => {
  const { row, col } = parseCellId(cell);
  return { r: 2 * row - 1, c: 2 * col - 1 };
};
const gridCellSet = new Set(gridCells);
// The cell diametrically opposite `cell` through galaxy `g`'s dot, or null when
// that lands outside the grid.
const rotate = (cell, g) => {
  const { r, c } = halfCoords(cell);
  const image = makeCellId((2 * g.r - r + 1) / 2, (2 * g.c - c + 1) / 2);
  return gridCellSet.has(image) ? image : null;
};

// Cell counts a galaxy can have: with n distinct digits its digit sum lies
// between 1+..+n and 9+..+(10-n), and the measured value fixes that sum.
const possibleSizes = (g) => DIGITS.filter(n => {
  const sum = g.blue ? g.value - n : g.value + n;
  return sum >= (n * (n + 1)) / 2 && sum <= (n * (19 - n)) / 2;
});

// Which cells a galaxy could reach. A cell at half-distance d from the centre
// drags its rotational image along, and a path between the two inside a
// connected galaxy needs at least d+1 cells, so d <= maxSize-1. A cell whose
// image falls outside the grid cannot be in the galaxy at all.
const zoneOf = (g) => {
  const limit = Math.max(...possibleSizes(g)) - 1;
  return gridCells.filter(cell => {
    const { r, c } = halfCoords(cell);
    return Math.abs(r - g.r) + Math.abs(c - g.c) <= limit && rotate(cell, g);
  });
};
const zones = GALAXIES.map(zoneOf);

// The value range tops out at 16, one short of 16 galaxies plus a Dark Star
// label. A galaxy whose zone is only the pair of cells its dot sits between is
// already pinned to that adjacent pair, so it can neither be disconnected nor
// need a ConnectedValues constraint; those galaxies have disjoint zones and
// share one label between them.
const isPinned = (zone) => zone.length <= 2;
let labelCount = 0;
const labels = zones.map(zone => isPinned(zone) ? 0 : ++labelCount);
const PINNED = ++labelCount;
const DARK = ++labelCount;
const labelOf = (index) => labels[index] || PINNED;

const shape = new Shape(GRID, labelCount);
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const galaxy = graph.makeOverlay('VG');
const cellOrder = new Map(gridCells.map((cell, i) => [cell, i]));

// Grid cells hold digits; the widened value range exists only for the labels.
const digitDomain = graph.makeReplicate(new Given(gridCells[0], ...DIGITS));

// Every cell carries exactly one label, which is what makes the galaxies a
// partition of the grid with no overlaps and nothing left over.
const labelDomain = gridCells.map(cell => new Given(
  galaxy.at(cell),
  DARK,
  ...zones.flatMap((zone, i) => zone.includes(cell) ? [labelOf(i)] : [])));

// 180 degree symmetry: a cell is in the galaxy exactly when its image is.
const symmetry = GALAXIES.flatMap((g, i) => {
  const label = labelOf(i);
  const key = Pair.fnToKey((a, b) => (a === label) === (b === label), geometry);
  return zones[i].flatMap(cell => {
    const image = rotate(cell, g);
    if (cellOrder.get(image) <= cellOrder.get(cell)) return [];
    return [new Pair(key, `galaxy-${i + 1}-symmetry`,
      ...galaxy.at([cell, image]))];
  });
});

const connectivity = GALAXIES.flatMap(
  (g, i) => labels[i] ? [new ConnectedValues('VG', labels[i])] : []);

// Measured value, no repeated digits, and Renban / not-Renban are all functions
// of the set of digits a galaxy holds, so one machine per galaxy scans its zone
// as (label, digit) pairs and accumulates that set as a bitmask. `reading` is
// true while the next cell read is the digit belonging to the label just seen.
const digitsOfMask = (mask) => DIGITS.filter(d => mask & (1 << (d - 1)));
const galaxyContents = GALAXIES.map((g, i) => {
  const label = labelOf(i);
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
      if (state.mask & bit) return undefined;  // digits do not repeat
      return { mask: state.mask | bit, reading: false, inGalaxy: false };
    },
    accept: (state) => {
      if (state.reading) return false;
      const digits = digitsOfMask(state.mask);
      if (!digits.length) return false;
      const sum = digits.reduce((a, b) => a + b, 0);
      const measured = g.blue ? sum + digits.length : sum - digits.length;
      if (measured !== g.value) return false;
      const consecutive =
        digits[digits.length - 1] - digits[0] + 1 === digits.length;
      return consecutive === g.renban;
    },
  }, geometry);
  return new NFA(machine, `galaxy-${i + 1}-contents`,
    ...zones[i].flatMap(cell => [galaxy.at(cell), cell]));
});

const darkStarCount = new ContainExact(
  Array(5).fill(DARK).join('_'), ...galaxy.cells());

const atMostOneDark = NFA.encodeSpec({
  startState: 0,
  transition: (count, value) => {
    const next = count + (value === DARK ? 1 : 0);
    return next > 1 ? undefined : next;
  },
  accept: () => true,
}, geometry);

// Every cell touching a Dark Star belongs to a marked galaxy, so no two Dark
// Stars are king-adjacent -- equivalently, no 2x2 block holds two of them,
// since two cells are king-adjacent exactly when some 2x2 block holds both.
const darkStarsIsolated = galaxy.makeReplicate(
  new NFA(atMostOneDark, 'dark-stars-isolated',
    ...galaxy.at(graph.block(gridCells[0], 2, 2))),
  galaxy.at(gridCells.filter(cell => graph.block(cell, 2, 2))));

const darkStarsPerBox = graph.boxes().map(
  box => new NFA(atMostOneDark, 'one-dark-star-per-box', ...galaxy.at(box)));

// The Dark Stars' digits are all different: for each digit, at most one cell is
// both a Dark Star and holds that digit. One small machine per digit rather
// than a single machine carrying the whole digit set.
const darkStarDigits = DIGITS.map(digit => {
  const machine = NFA.encodeSpec({
    startState: { count: 0, reading: false, isDark: false },
    transition: (state, value) => {
      if (!state.reading) {
        return { count: state.count, reading: true, isDark: value === DARK };
      }
      const count = state.count + (state.isDark && value === digit ? 1 : 0);
      if (count > 1) return undefined;
      return { count, reading: false, isDark: false };
    },
    accept: (state) => !state.reading,
  }, geometry);
  return new NFA(machine, `dark-star-digit-${digit}`,
    ...gridCells.flatMap(cell => [galaxy.at(cell), cell]));
});

return [
  shape,
  galaxy.toVar('galaxy'),
  new Given('R1C4', 5),
  new Given('R5C5', 4),
  new Given('R9C6', 9),
  digitDomain,
  ...labelDomain,
  ...symmetry,
  ...connectivity,
  ...galaxyContents,
  darkStarsIsolated,
  darkStarCount,
  ...darkStarsPerBox,
  ...darkStarDigits,
];
