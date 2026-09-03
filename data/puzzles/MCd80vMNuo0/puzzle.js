// Title: Galactic Census 2
// Author: Blobz
// Video: https://www.youtube.com/watch?v=MCd80vMNuo0
// Source: https://sudokupad.app/blobz/galactic-census-2?setting-dashedgrid=1

// Rules encoded here, in full:
//  - Normal sudoku.
//  - The grid divides into galaxies: orthogonally connected groups of cells
//    with 180-degree rotational symmetry about their own centre. Every cell is
//    in exactly one galaxy and galaxies do not overlap. Digits do not repeat
//    within a galaxy.
//  - 17 small dots mark 17 galaxy centres. A dot drawn on a cell is that cell's
//    centre, a dot drawn on two cells is the midpoint of their shared edge, a
//    dot drawn on four cells is the corner they share.
//  - The one grey dot marks a "renban" galaxy: two or more cells whose digits
//    are a set of consecutive digits. Each white dot marks a galaxy whose
//    digits are not a consecutive set.
//  - One further galaxy, the "dark star", is a single cell and carries no dot.
//  - A diamond icon marks the smallest digit of a galaxy of at least 2 cells; a
//    circle icon marks the largest digit of a galaxy of at least 6 cells; a
//    census number is the digit sum of a galaxy of at least 3 cells.
// Nothing is omitted.
//
// Two readings the encoding commits to, both from the rules text:
//  - The three icon families are introduced as "Galactic Map Standards" and as
//    what the "Galactic Census requires", i.e. as a legend: an icon appears
//    exactly where the standard puts one, so a galaxy carries one diamond when
//    it has 2+ cells and none otherwise, one circle when it has 6+ cells and
//    none otherwise, one census number when it has 3+ cells and none otherwise.
//    The drawn counts agree: 17 diamonds against exactly 17 dotted galaxies,
//    each of which has 2+ cells because a one-cell digit set is consecutive and
//    so cannot carry a white dot.
//  - An icon is drawn inside the galaxy it describes; that is what makes it
//    that galaxy's indicator rather than a free-floating mark.
// Applied to the dark star, a one-cell galaxy, those give it no diamond
// (1 < 2), no circle (1 < 6) and no census number (1 < 3).

const OUT = 1, IN = 2;         // galaxy membership layers
const LIT = 1, DARK = 2;       // dark-star layer: which cell is the dark star
// Digits do not repeat within a galaxy, so no galaxy exceeds the value count.
const MAX_GALAXY_CELLS = 9;

// Drawn data. Each dot entry lists the cells the drawn dot sits on, so the dot
// is at their common centre; `renban` is true for the single grey dot.
const DOTS = [
  { cells: ['R1C1', 'R1C2', 'R2C1', 'R2C2'], renban: false },
  { cells: ['R2C3', 'R2C4'], renban: false },
  { cells: ['R3C1', 'R4C1'], renban: false },
  { cells: ['R6C1', 'R7C1'], renban: false },
  { cells: ['R1C8'], renban: false },
  { cells: ['R4C7', 'R4C8'], renban: false },
  { cells: ['R6C8', 'R6C9'], renban: false },
  { cells: ['R8C9', 'R9C9'], renban: false },
  { cells: ['R6C6', 'R6C7', 'R7C6', 'R7C7'], renban: false },
  { cells: ['R9C6', 'R9C7'], renban: false },
  { cells: ['R8C4', 'R8C5', 'R9C4', 'R9C5'], renban: false },
  { cells: ['R3C5', 'R4C5'], renban: false },
  { cells: ['R6C2', 'R7C2'], renban: false },
  { cells: ['R5C3', 'R5C4', 'R6C3', 'R6C4'], renban: false },
  { cells: ['R8C8'], renban: false },
  { cells: ['R2C7', 'R2C8'], renban: false },
  { cells: ['R8C2', 'R8C3'], renban: true },
];

// The 17 diamond icons, one per cell.
const DIAMONDS = [
  'R1C7', 'R2C1', 'R2C7', 'R3C4', 'R4C1', 'R4C2', 'R4C8', 'R5C1', 'R5C5',
  'R6C2', 'R6C6', 'R6C9', 'R7C3', 'R8C8', 'R8C9', 'R9C4', 'R9C6',
];

// The 8 circle icons, one per cell.
const CIRCLES = ['R1C4', 'R2C8', 'R3C8', 'R4C5', 'R6C3', 'R7C6', 'R8C6', 'R9C2'];

// The 13 printed census numbers, each in one cell.
const CENSUS = [
  { cell: 'R1C8', total: 13 },
  { cell: 'R2C2', total: 16 },
  { cell: 'R2C4', total: 43 },
  { cell: 'R2C8', total: 30 },
  { cell: 'R4C5', total: 41 },
  { cell: 'R4C8', total: 31 },
  { cell: 'R6C4', total: 40 },
  { cell: 'R6C9', total: 16 },
  { cell: 'R7C1', total: 25 },
  { cell: 'R7C7', total: 33 },
  { cell: 'R8C3', total: 21 },
  { cell: 'R8C8', total: 8 },
  { cell: 'R9C5', total: 31 },
];

// A galaxy of at most 9 cells cannot avoid the cells its own dot touches: if it
// did, its cells would still pair off under the half-turn, and joining any cell
// to its image inside the galaxy and applying the half-turn to that path gives
// a closed circuit around the dot. The smallest such circuit avoiding a cell is
// 8 cells, avoiding an edge's two cells is 10, avoiding a corner's four is 12.
// So only a cell-centre dot can sit outside its galaxy, and only when its 8
// surrounding cells are all on the board -- true here only for dot 15 (R8C8).
const DOT_OUTSIDE_GALAXY_POSSIBLE = 14;

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const gridCells = graph.cells();
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

// Twice the dot's centre in cell coordinates, so it is an integer whether the
// dot sits on a cell, an edge or a corner. The half-turn about the dot maps
// (row, col) to (rSum - row, cSum - col).
const doubledCentre = (cells, axis) =>
  2 * cells.reduce((t, c) => t + parseCellId(c)[axis], 0) / cells.length;

function layout({ cells, renban }, i) {
  const rSum = doubledCentre(cells, 'row');
  const cSum = doubledCentre(cells, 'col');
  // A galaxy cell's image must be on the board, which confines the galaxy to
  // this rectangle; the half-turn maps the rectangle onto itself.
  const rows = range(Math.max(1, rSum - 9), Math.min(9, rSum - 1));
  const cols = range(Math.max(1, cSum - 9), Math.min(9, cSum - 1));
  const rect = rows.flatMap(r => cols.map(c => makeCellId(r, c)));
  // A cell and its image are |2*row - rSum| + |2*col - cSum| apart, and a
  // connected galaxy holding both spans at least that many cells plus one.
  const reachable = (cell) => {
    const { row, col } = parseCellId(cell);
    return Math.abs(2 * row - rSum) + Math.abs(2 * col - cSum)
      <= MAX_GALAXY_CELLS - 1;
  };
  const prefix = 'VG' + String.fromCharCode('A'.charCodeAt(0) + i);
  const iconsIn = (icons) => icons.filter(cell => rect.includes(cell) && reachable(cell));
  return {
    index: i, dots: cells, renban, rect, prefix,
    dims: `${rows.length}x${cols.length}`,
    overlay: graph.makeOverlay(prefix, rect),
    zone: rect.filter(reachable),
    unreachable: rect.filter(cell => !reachable(cell)),
    diamonds: iconsIn(DIAMONDS),
    circles: iconsIn(CIRCLES),
    census: CENSUS.filter(({ cell }) => iconsIn([cell]).length),
  };
}

const galaxies = DOTS.map(layout);
const darkStar = graph.makeOverlay('VDS');

// Is `mask` a set of consecutive digits? Adding its lowest bit carries the
// whole run away in one step exactly when the bits are unbroken.
const isRun = (mask) => mask !== 0 && ((mask + (mask & -mask)) & mask) === 0;
const twoOrMore = (mask) => (mask & (mask - 1)) !== 0;

// A galaxy's digits, read off its layer interleaved with the grid: for each
// zone cell, its membership flag then its digit. Rejects a repeated digit, and
// `accept` then tests the collected set for the dot's colour.
const digitSetSpec = (accepts) => NFA.encodeSpec({
  startState: { mask: 0, member: null },
  transition({ mask, member }, value) {
    if (member === null) return { mask, member: value === IN };
    if (!member) return { mask, member: null };
    const bit = 1 << (value - 1);
    if (mask & bit) return undefined;
    return { mask: mask | bit, member: null };
  },
  accept: ({ mask, member }) => member === null && accepts(mask),
}, shape);

// Renban: two or more cells whose digits are consecutive. Not-renban: a
// non-empty digit set that is not consecutive, which already needs two cells.
const renbanSpec = digitSetSpec(mask => isRun(mask) && twoOrMore(mask));
const notRenbanSpec = digitSetSpec(mask => mask !== 0 && !isRun(mask));

// One icon family against the galaxy's size. Reads the membership flags of the
// `numIcons` icon cells in the zone, then the flags of the whole zone: the
// galaxy carries exactly one of these icons when it has `threshold` or more
// cells, and none when it has fewer.
const iconCountSpec = (numIcons, threshold) => NFA.encodeSpec({
  startState: { read: 0, icons: 0, size: 0 },
  transition({ read, icons, size }, value) {
    const hit = value === IN ? 1 : 0;
    if (read < numIcons) {
      return icons + hit > 1 ? undefined
        : { read: read + 1, icons: icons + hit, size: 0 };
    }
    return { read, icons, size: Math.min(size + hit, threshold) };
  },
  accept: ({ size, icons }) => (size >= threshold) === (icons === 1),
}, shape);

// An icon cell's digit against the galaxy's other digits. Reads the icon cell's
// membership flag; if it is not in this galaxy the machine idles, otherwise it
// reads the icon's digit and then requires every digit of the galaxy to be on
// the stated side of it. `beats` is the rejected relation.
const iconExtremeSpec = (beats) => NFA.encodeSpec({
  startState: { phase: 'flag', digit: 0, member: false },
  transition({ phase, digit, member }, value) {
    switch (phase) {
      case 'flag':
        return { phase: value === IN ? 'icon' : 'off', digit: 0, member: false };
      case 'off':
        return { phase: 'off', digit: 0, member: false };
      case 'icon':
        return { phase: 'member', digit: value, member: false };
      case 'member':
        return { phase: 'digit', digit, member: value === IN };
      default:
        if (member && beats(value, digit)) return undefined;
        return { phase: 'member', digit, member: false };
    }
  },
  accept: ({ phase }) => phase === 'off' || phase === 'member',
}, shape);

const smallestSpec = iconExtremeSpec((v, d) => v < d);
const largestSpec = iconExtremeSpec((v, d) => v > d);

// A census number against its galaxy's digit sum, read the same way: the census
// cell's membership flag, then the zone as flag/digit pairs.
const censusSpec = (total) => NFA.encodeSpec({
  startState: { phase: 'flag', sum: 0, member: false },
  transition({ phase, sum, member }, value) {
    switch (phase) {
      case 'flag':
        return { phase: value === IN ? 'member' : 'off', sum: 0, member: false };
      case 'off':
        return { phase: 'off', sum: 0, member: false };
      case 'member':
        return { phase: 'digit', sum, member: value === IN };
      default: {
        const next = sum + (member ? value : 0);
        return next > total
          ? undefined : { phase: 'member', sum: next, member: false };
      }
    }
  },
  accept: ({ phase, sum }) => phase === 'off' || (phase === 'member' && sum === total),
}, shape);

// Every cell belongs to exactly one galaxy: the dark star's cell to none of the
// dotted ones, every other cell to exactly one. Reads the cell's dark-star flag
// then its membership flag on each galaxy layer that reaches it.
const coverSpec = NFA.encodeSpec({
  startState: { dark: null, count: 0 },
  transition({ dark, count }, value) {
    if (dark === null) return { dark: value === DARK, count: 0 };
    const next = count + (value === IN ? 1 : 0);
    return next > 1 ? undefined : { dark, count: next };
  },
  accept: ({ dark, count }) => dark !== null && count === (dark ? 0 : 1),
}, shape);

const galaxyConstraints = galaxies.flatMap((g) => {
  const at = cell => g.overlay.at(cell);
  const flagsAndDigits = g.zone.flatMap(cell => [at(cell), cell]);
  const scanIcons = (icons) => [...icons.map(at), ...g.zone.map(at)];
  return [
    new Var(g.prefix.slice(1), `galaxy ${g.index + 1} membership`, g.dims),
    g.overlay.makeReplicate(new Given(g.overlay.cells()[0], OUT, IN)),
    ...g.unreachable.map(cell => new Given(at(cell), OUT)),
    ...(g.index === DOT_OUTSIDE_GALAXY_POSSIBLE
      ? [] : g.dots.map(cell => new Given(at(cell), IN))),
    // The rectangle is listed in reading order and the half-turn reverses that
    // order, so the layer read as a line is the galaxy's rotational symmetry.
    new Palindrome(...g.overlay.cells()),
    new ConnectedValues(g.prefix, IN),
    new NFA(g.renban ? renbanSpec : notRenbanSpec,
      `galaxy-${g.index + 1}-digits`, ...flagsAndDigits),
    new NFA(iconCountSpec(g.diamonds.length, 2),
      `galaxy-${g.index + 1}-diamond-count`, ...scanIcons(g.diamonds)),
    new NFA(iconCountSpec(g.circles.length, 6),
      `galaxy-${g.index + 1}-circle-count`, ...scanIcons(g.circles)),
    new NFA(iconCountSpec(g.census.length, 3),
      `galaxy-${g.index + 1}-census-count`, ...scanIcons(g.census.map(c => c.cell))),
    ...g.diamonds.map(cell => new NFA(smallestSpec,
      `galaxy-${g.index + 1}-smallest-${cell}`, at(cell), cell, ...flagsAndDigits)),
    ...g.circles.map(cell => new NFA(largestSpec,
      `galaxy-${g.index + 1}-largest-${cell}`, at(cell), cell, ...flagsAndDigits)),
    ...g.census.map(({ cell, total }) => new NFA(censusSpec(total),
      `galaxy-${g.index + 1}-census-${cell}`, at(cell), ...flagsAndDigits)),
  ];
});

const coverage = gridCells.map(cell => new NFA(
  coverSpec, `one-galaxy-${cell}`, darkStar.at(cell),
  ...galaxies.flatMap(g => (g.zone.includes(cell) ? [g.overlay.at(cell)] : []))));

// The dark star is one cell, so it is below all three icon thresholds and can
// be none of the cells carrying an icon.
const iconCells = [...new Set([...DIAMONDS, ...CIRCLES, ...CENSUS.map(c => c.cell)])];

return [
  shape,
  darkStar.toVar('dark star'),
  darkStar.makeReplicate(new Given(darkStar.cells()[0], LIT, DARK)),
  new ContainExact(`${DARK}`, ...darkStar.cells()),
  ...iconCells.map(cell => new Given(darkStar.at(cell), LIT)),
  ...galaxyConstraints,
  ...coverage,
];
