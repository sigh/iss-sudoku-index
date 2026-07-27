// Title: Galactic Census 2
// Author: Blobz
// Video: https://www.youtube.com/watch?v=MCd80vMNuo0
// Source: https://sudokupad.app/blobz/galactic-census-2?setting-dashedgrid=1

// Rules encoded here:
//   * Normal sudoku.
//   * The grid is divided into "galaxies": orthogonally connected groups of
//     cells with 180 degree rotational symmetry about a marked dot. Every
//     cell belongs to exactly one galaxy and galaxies do not overlap.
//   * A grey dot marks a Renban galaxy (its digits form an unbroken
//     consecutive set, no repeats); a white dot marks a galaxy whose digits
//     do NOT form such a set (still no repeats).
//   * Every galaxy with >= 3 cells reports its census total: the sum of its
//     digits.
//   * One single-cell "dark star" galaxy is unmarked; its location is
//     otherwise unconstrained by the rules text.
//   * Every galaxy with >= 2 cells has its smallest digit marked with a
//     diamond icon; every galaxy with >= 6 cells additionally has its
//     largest digit marked with a circle icon. Encoded as a local fact about
//     the marked cell: its digit is <= (diamond) / >= (circle) every other
//     digit that shares its galaxy, over every galaxy the marked cell could
//     belong to (which one is only discoverable from the solve, unlike the
//     census totals, whose printed position pins a unique dot). Two markers
//     can never share a galaxy (each would have to hold the other's digit,
//     contradicting "no repeats"), so with exactly as many diamonds as
//     non-dark-star galaxies this already forces one diamond per galaxy; the
//     one explicit relaxation (weaker than the rule, never stronger) is that
//     a circled galaxy's cell count is never checked to actually be >= 6.
// Nothing else is omitted.

// Model: one Var per grid cell holds the label of the galaxy that owns the
// cell. Four of the 17 dot-marked galaxies carry no census total; the rules
// force each of those to be exactly the two-cell domino its dot sits between
// (no census total means < 3 cells, and a dot needs >= 2 cells), so they
// share one label. Their zones are disjoint dominoes, so they need no
// connectivity check. The one dark star gets its own label. That keeps the
// label count at 13 (named galaxies) + 1 (shared domino) + 1 (dark star) =
// 15, within the Var value-range cap of 16.

const GRID = '9x9';
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const gridCells = cellGraph(GRID).cells();

// Transcribed from the drawn dots and census totals. `cells` are each dot's
// covered cell(s) (one cell, two adjacent cells, or the four cells around a
// shared corner, matching where the dot is drawn); census `value` is the
// printed total, matched to its dot because each total sits within
// half-cell Manhattan distance 1 of exactly one dot, with the next-nearest
// dot strictly farther; `renban` is the dot's grey (true) vs white (false)
// fill. A null value means the dot has no census total, which forces its
// galaxy to exactly the two cells the dot sits between (a galaxy needs >= 3
// cells to report a total, and every dot-marked galaxy has >= 2 cells).
const GALAXIES = [
  { cells: ['R1C1', 'R1C2', 'R2C1', 'R2C2'], renban: false, value: 16 },
  { cells: ['R2C3', 'R2C4'], renban: false, value: 43 },
  { cells: ['R3C1', 'R4C1'], renban: false, value: null },
  { cells: ['R6C1', 'R7C1'], renban: false, value: 25 },
  { cells: ['R1C8'], renban: false, value: 13 },
  { cells: ['R4C7', 'R4C8'], renban: false, value: 31 },
  { cells: ['R6C8', 'R6C9'], renban: false, value: 16 },
  { cells: ['R8C9', 'R9C9'], renban: false, value: null },
  { cells: ['R6C6', 'R6C7', 'R7C6', 'R7C7'], renban: false, value: 33 },
  { cells: ['R9C6', 'R9C7'], renban: false, value: null },
  { cells: ['R8C4', 'R8C5', 'R9C4', 'R9C5'], renban: false, value: 31 },
  { cells: ['R3C5', 'R4C5'], renban: false, value: 41 },
  { cells: ['R6C2', 'R7C2'], renban: false, value: null },
  { cells: ['R5C3', 'R5C4', 'R6C3', 'R6C4'], renban: false, value: 40 },
  { cells: ['R8C8'], renban: false, value: 8 },
  { cells: ['R2C7', 'R2C8'], renban: false, value: 30 },
  { cells: ['R8C2', 'R8C3'], renban: true, value: 21 },
];

// The 17 diamond (smallest-digit) and 8 circle (largest-digit) marker cells,
// transcribed from the payload's `rectangle` and (0.55-wide) `circle`
// entries respectively.
const DIAMOND_CELLS = [
  'R1C7', 'R2C1', 'R2C7', 'R3C4', 'R4C1', 'R4C2', 'R4C8', 'R5C1',
  'R5C5', 'R6C2', 'R6C6', 'R6C9', 'R7C3', 'R8C8', 'R8C9', 'R9C4', 'R9C6',
];
const CIRCLE_CELLS = [
  'R1C4', 'R2C8', 'R3C8', 'R4C5', 'R6C3', 'R7C6', 'R8C6', 'R9C2',
];

// Positions in half-cell units, so a dot on a cell centre, an edge midpoint
// or a grid corner is alike integral: cell RiCj has centre (2i-1, 2j-1).
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
// The cell diametrically opposite `cell` through half-coord point `g`, or
// null when that image lands outside the grid.
const rotate = (cell, g) => {
  const { r, c } = halfCoords(cell);
  const image = makeCellId((2 * g.r - r + 1) / 2, (2 * g.c - c + 1) / 2);
  return gridCellSet.has(image) ? image : null;
};

for (const g of GALAXIES) g.center = centerOf(g.cells);

// Cell counts a galaxy can have. With n distinct digits the digit sum lies
// between 1+..+n and 9+..+(10-n), and the census total fixes that sum
// directly. A null value (no census total) means the rules force exactly 2
// cells, per the GALAXIES comment above.
const possibleSizes = (g) => g.value === null ? [2] : DIGITS.filter(n =>
  n >= 3 && g.value >= (n * (n + 1)) / 2 && g.value <= (n * (19 - n)) / 2);

// Which cells a galaxy could reach. A cell at half-distance d from the centre
// drags its rotational image along, and a path between the two inside a
// connected galaxy needs at least d+1 cells, so d <= maxSize-1. A cell whose
// image falls outside the grid cannot be in the galaxy at all.
const zoneOf = (g) => {
  const limit = Math.max(...possibleSizes(g)) - 1;
  return gridCells.filter(cell => {
    const { r, c } = halfCoords(cell);
    return Math.abs(r - g.center.r) + Math.abs(c - g.center.c) <= limit &&
      rotate(cell, g.center);
  });
};
const zones = GALAXIES.map(zoneOf);

// Four galaxies have no census total, so the rules force each to be exactly
// the two-cell domino its dot sits between; their zones (computed above)
// come out at exactly those 2 cells. They cannot be disconnected, need no
// ConnectedValues, and -- since their zones are pairwise disjoint -- can
// share one label, keeping the total label count within the Var value-range
// cap of 16.
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
// partition of the grid with no overlaps and nothing left over. A diamond or
// circle marker cell is excluded from the dark-star option: the dark star is
// explicitly unmarked, so a marked cell can never be it (this also keeps
// every marker's captured galaxy index a real candidate, never "none").
const markerCells = new Set([...DIAMOND_CELLS, ...CIRCLE_CELLS]);
const labelDomain = gridCells.map(cell => new Given(
  galaxy.at(cell),
  ...(markerCells.has(cell) ? [] : [DARK]),
  ...zones.flatMap((zone, i) => zone.includes(cell) ? [labelOf(i)] : [])));

// 180 degree symmetry: a cell is in the galaxy exactly when its image is.
const symmetry = GALAXIES.flatMap((g, i) => {
  const label = labelOf(i);
  const key = Pair.fnToKey((a, b) => (a === label) === (b === label), geometry);
  return zones[i].flatMap(cell => {
    const image = rotate(cell, g.center);
    if (cellOrder.get(image) <= cellOrder.get(cell)) return [];
    return [new Pair(key, `galaxy-${i + 1}-symmetry`, ...galaxy.at([cell, image]))];
  });
});

const connectivity = GALAXIES.flatMap(
  (g, i) => labels[i] ? [new ConnectedValues('VG', labels[i])] : []);

// Census total, no repeated digits, and Renban / not-Renban are all
// functions of the *set* of digits a galaxy holds, so one machine per galaxy
// scans its zone as (label, digit) pairs and accumulates that set as a
// bitmask. `reading` is true while the next cell read is the digit belonging
// to the label just seen. A galaxy's cell count is checked explicitly (>= 3
// when it has a census total, exactly 2 when it does not) rather than left to
// fall out of the sum alone: a sum can be hit by more than one cardinality
// (e.g. 8 = {8} = {1,7} = {1,2,5}), so the sum check by itself would not
// enforce "this galaxy has at least three cells" the way the rules require.
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
      if (value > DIGITS.length) return undefined;  // grid cells never exceed 9
      const bit = 1 << (value - 1);
      if (state.mask & bit) return undefined;  // digits do not repeat
      return { mask: state.mask | bit, reading: false, inGalaxy: false };
    },
    accept: (state) => {
      if (state.reading) return false;
      const digits = digitsOfMask(state.mask);
      if (g.value === null) {
        if (digits.length !== 2) return false;
      } else {
        if (digits.length < 3) return false;
        const sum = digits.reduce((a, b) => a + b, 0);
        if (sum !== g.value) return false;
      }
      const consecutive =
        digits[digits.length - 1] - digits[0] + 1 === digits.length;
      return consecutive === g.renban;
    },
  }, geometry);
  return new NFA(machine, `galaxy-${i + 1}-contents`,
    ...zones[i].flatMap(cell => [galaxy.at(cell), cell]));
});

const darkStarCount = new ContainExact(String(DARK), ...galaxy.cells());

// Diamond/circle markers name a specific cell, not a specific galaxy (which
// galaxy each belongs to is only discoverable from the solve): the marked
// cell's digit must be no larger (diamond, wantMin) / no smaller (circle) than
// every other digit that shares its galaxy's label. Scanned as (label, digit)
// pairs over the union of every zone that could contain the marked cell -- a
// safe superset of its true galaxy's own zone -- with the marked cell first,
// so its own label and digit are captured before any comparison runs.
//
// A marker cell's own zone list (`candidates`) is always small (at most 3 in
// this puzzle), so the label just read is remapped to its index in that
// short list (or -1) before going into the NFA state -- tracking the raw
// label (up to 15 distinct values) instead would multiply the state count by
// the whole label range for no benefit, since only membership in this small
// candidate list is ever tested.
const markerConstraint = (cell, wantMin) => {
  const idxs = zones.reduce(
    (acc, zone, i) => zone.includes(cell) ? [...acc, i] : acc, []);
  const candidates = idxs.map(labelOf);
  const union = new Set(idxs.flatMap(i => zones[i]));
  union.delete(cell);
  const order = [cell, ...union];
  const machine = NFA.encodeSpec({
    startState: { reading: false, pendingIdx: null, capturedIdx: null, digit: null },
    transition: (state, value) => {
      if (!state.reading) {
        return { ...state, reading: true, pendingIdx: candidates.indexOf(value) };
      }
      if (state.capturedIdx === null) {
        // First pair read: the marked cell itself. Capture unconditionally.
        return {
          reading: false, pendingIdx: null,
          capturedIdx: state.pendingIdx, digit: value,
        };
      }
      if (value > DIGITS.length) return undefined;  // grid cells never exceed 9
      if (state.pendingIdx === state.capturedIdx) {
        const ok = wantMin ? value >= state.digit : value <= state.digit;
        if (!ok) return undefined;
      }
      return { ...state, reading: false, pendingIdx: null };
    },
    accept: (state) => !state.reading,
  }, geometry);
  return new NFA(machine, `${wantMin ? 'min' : 'max'}-marker-${cell}`,
    ...order.flatMap(c => [galaxy.at(c), c]));
};
const minMarkers = DIAMOND_CELLS.map(cell => markerConstraint(cell, true));
const maxMarkers = CIRCLE_CELLS.map(cell => markerConstraint(cell, false));

return [
  shape,
  galaxy.toVar('galaxy'),
  digitDomain,
  ...labelDomain,
  ...symmetry,
  ...connectivity,
  ...galaxyContents,
  darkStarCount,
  ...minMarkers,
  ...maxMarkers,
];
