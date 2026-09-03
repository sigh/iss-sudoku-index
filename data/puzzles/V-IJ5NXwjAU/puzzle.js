// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=V-IJ5NXwjAU
// Source: https://cracking-the-cryptic.web.app/sudoku/NNL8HBpHLp

// Rules encoded here (all of them; nothing is omitted):
//   * Normal 9x9 sudoku. No givens.
//   * The 14 circles are the centres of point-symmetric "galaxies", which act
//     as killer cages: the number printed at a circle is the sum of the digits
//     in that galaxy. Two circles print an inequality ("<9", ">12") instead of
//     an exact total.
//   * Each galaxy is also a thermometer: its cells form a non-branching path
//     along which the digits increase from the bulb end, and the bulb end is
//     not marked. Digits in a galaxy do not repeat.
//   * A galaxy is symmetrical about its circle.
//   * Not every cell has to belong to a galaxy.
//
// No galaxy outline and no thermometer stroke is drawn anywhere in the source:
// the only drawn data is the 14 circle positions and their 14 printed totals,
// so each galaxy's membership, shape and orientation is a solver deduction.
//
// Model: one widened-value overlay VG holds, per cell, the label (1-14) of the
// galaxy owning that cell, or 15 ("no galaxy"). 14 labels plus the marker is
// exactly the 16-value cell limit, so a single overlay layer suffices, and
// because each cell's Var carries exactly one label the layer is already a
// partition -- no extra one-label-per-cell rule is needed.

const GRID = '9x9';
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const NONE = 15;

// The 14 circles, transcribed from the drawn circle overlays and paired with
// the printed totals drawn beside them (every total sits at a constant offset
// from exactly one circle, so the pairing is forced). Positions use the
// source's own continuous 1-indexed convention: an integer row/column is a
// cell centre and a half-integer one is the midpoint between two cells, so a
// cell (row, col) reflects through (cr, cc) to (2*cr - row, 2*cc - col)
// whether the circle sits in a cell or on an edge.
const GALAXIES = [
  { cr: 1, cc: 4.5, cmp: 'eq', value: 13 },  // edge R1C4|R1C5
  { cr: 1, cc: 7.5, cmp: 'lt', value: 9 },   // edge R1C7|R1C8, "<9"
  { cr: 2.5, cc: 2, cmp: 'eq', value: 35 },  // edge R2C2|R3C2
  { cr: 2, cc: 3.5, cmp: 'eq', value: 20 },  // edge R2C3|R2C4
  { cr: 2, cc: 8.5, cmp: 'eq', value: 8 },   // edge R2C8|R2C9
  { cr: 5, cc: 5, cmp: 'gt', value: 12 },    // cell R5C5, ">12"
  { cr: 5.5, cc: 8, cmp: 'eq', value: 38 },  // edge R5C8|R6C8
  { cr: 5, cc: 7, cmp: 'eq', value: 7 },     // cell R5C7
  { cr: 6, cc: 1, cmp: 'eq', value: 9 },     // cell R6C1
  { cr: 5, cc: 2.5, cmp: 'eq', value: 9 },   // edge R5C2|R5C3
  { cr: 6.5, cc: 2, cmp: 'eq', value: 16 },  // edge R6C2|R7C2
  { cr: 7, cc: 5.5, cmp: 'eq', value: 15 },  // edge R7C5|R7C6
  { cr: 8.5, cc: 3, cmp: 'eq', value: 18 },  // edge R8C3|R9C3
  { cr: 8, cc: 5.5, cmp: 'eq', value: 15 },  // edge R8C5|R8C6
];

const shape = new Shape(GRID, NONE);
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const cellOrder = new Map(gridCells.map((cell, i) => [cell, i]));
const overlay = graph.makeOverlay('VG');

const totalHolds = (g, total) =>
  g.cmp === 'eq' ? total === g.value :
  g.cmp === 'gt' ? total > g.value :
  /* 'lt' */       total < g.value;

// Distance from a cell to a circle, in cell widths (half-integer for an
// edge-centred circle).
const centreDistance = (cell, g) => {
  const { row, col } = parseCellId(cell);
  return Math.abs(row - g.cr) + Math.abs(col - g.cc);
};

// The cell diametrically opposite `cell` through galaxy `g`, or null when that
// image lands outside the grid.
const rotate = (cell, g) => {
  const { row, col } = parseCellId(cell);
  const imageRow = 2 * g.cr - row;
  const imageCol = 2 * g.cc - col;
  if (!Number.isInteger(imageRow) || !Number.isInteger(imageCol)) return null;
  if (imageRow < 1 || imageRow > 9 || imageCol < 1 || imageCol > 9) return null;
  return makeCellId(imageRow, imageCol);
};

// How many cells a galaxy may hold. n non-repeating digits from 1-9 sum to
// between n(n+1)/2 and n(19-n)/2, which the printed total -- or the open side
// of a printed inequality -- narrows. Parity is forced too: 180-degree
// rotation about a cell centre fixes that one cell and rotation about an edge
// midpoint fixes none, while the rotation must reverse the thermometer path
// and so fix its middle. So a cell-centred galaxy holds an odd number of cells
// and an edge-centred one an even number.
const sizesFor = (g) => {
  const oddSized = Number.isInteger(g.cr) && Number.isInteger(g.cc);
  const sizes = [];
  for (let n = 1; n <= DIGITS.length; n++) {
    if ((n % 2 === 1) !== oddSized) continue;
    const lowest = (n * (n + 1)) / 2;       // 1 + 2 + ... + n
    const highest = (n * (19 - n)) / 2;     // 9 + 8 + ... + (10 - n)
    const reachable =
      g.cmp === 'eq' ? lowest <= g.value && g.value <= highest :
      g.cmp === 'gt' ? highest > g.value :
      /* 'lt' */       lowest < g.value;
    if (reachable) sizes.push(n);
  }
  return sizes;
};

// Which cells a galaxy can reach. Its cells form a path through the circle, so
// a cell at distance d from the circle is at least d path steps from the
// middle and drags its rotational image the same distance the other way: the
// path needs more than 2d cells. A cell whose image falls off the grid cannot
// be in the galaxy at all, since that image would have no partner of its own.
const zoneOf = (g) => {
  const limit = (Math.max(...sizesFor(g)) - 1) / 2;
  return gridCells.filter(
    cell => centreDistance(cell, g) <= limit && rotate(cell, g) !== null);
};
const zones = GALAXIES.map(zoneOf);
const zoneSets = zones.map(zone => new Set(zone));

// The cells the circle itself sits on: the one cell holding a cell-centred
// circle, or the two cells flanking an edge-centred one. The rotation reverses
// the galaxy's path and therefore fixes its middle -- the single middle cell
// when the count is odd, and the two adjacent middle cells, whose shared edge
// the circle marks, when it is even -- so those cells are in the galaxy.
const middleOf = (g) => gridCells.filter(cell => centreDistance(cell, g) <= 0.5);

// Grid cells hold digits 1-9; the widened value range exists only for VG.
const digitDomain = graph.makeReplicate(new Given(gridCells[0], ...DIGITS));

// Each cell's label: fixed for a galaxy's middle cells, otherwise "no galaxy"
// or any galaxy whose zone reaches the cell.
const middleLabel = new Map(
  GALAXIES.flatMap((g, i) => middleOf(g).map(cell => [cell, i + 1])));
const labelDomain = gridCells.map(cell => new Given(overlay.at(cell),
  ...(middleLabel.has(cell) ? [middleLabel.get(cell)]
    : [NONE, ...GALAXIES.flatMap((g, i) => zoneSets[i].has(cell) ? [i + 1] : [])])));

// 180-degree symmetry: within a galaxy's zone a cell carries its label exactly
// when its rotational image does.
const symmetry = GALAXIES.flatMap((g, i) => {
  const label = i + 1;
  const key = Pair.fnToKey((a, b) => (a === label) === (b === label), NONE);
  return zones[i].flatMap(cell => {
    const image = rotate(cell, g);
    if (cellOrder.get(image) <= cellOrder.get(cell)) return [];
    return [new Pair(key, `galaxy-${label}-symmetry`,
                     overlay.at(cell), overlay.at(image))];
  });
});

// Each galaxy is one orthogonally connected group of cells.
const connectivity = GALAXIES.map((g, i) => new ConnectedValues('VG', i + 1));

// The printed total and the no-repeats rule are both properties of the set of
// digits a galaxy holds, so one machine per galaxy scans its zone as
// (label, digit) pairs and accumulates that set as a 9-bit mask. `reading` is
// true while the next symbol is the digit of the label cell just seen, and
// `inGalaxy` says whether that digit belongs to this galaxy.
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
      if (value > DIGITS.length) return undefined;  // a label, not a digit
      const bit = 1 << (value - 1);
      if (state.mask & bit) return undefined;  // digits do not repeat
      return { mask: state.mask | bit, reading: false, inGalaxy: false };
    },
    accept: (state) => !state.reading &&
      totalHolds(g, digitsOfMask(state.mask).reduce((a, b) => a + b, 0)),
  }, geometry);
  return new NFA(machine, `galaxy-${label}-contents`,
                 ...zones[i].flatMap(cell => [overlay.at(cell), cell]));
});

// The thermometer rule, stated locally. A galaxy's cells form a path with the
// digits increasing from one end exactly when, inside the galaxy, every cell
// has at most one orthogonal neighbour holding a smaller digit and at most one
// holding a larger one:
//   * it forces degree <= 2, which is the no-branching rule;
//   * with connectivity that leaves a path or a cycle, and a cycle is excluded
//     because its largest digit would have two smaller neighbours;
//   * on a path, "each interior cell's digit lies between its two neighbours'"
//     propagates from the first step to the last, which is exactly "the digits
//     run monotonically from one end to the other", with the direction (which
//     end is the bulb) left free as the unmarked bulb requires.
// One machine per galaxy cell scans [own label, own digit, then each
// neighbour's label and digit]. Only neighbours inside the galaxy's zone are
// scanned, as no other cell can carry the label; a cell with fewer than two of
// them cannot break the rule and gets no machine. `p` is the scan phase: 0
// awaits the cell's own label, 1 its digit, 2 the next neighbour's label, 3 a
// same-galaxy neighbour's digit, 4 a neighbour's digit to ignore, and 5 is the
// sink for a cell this galaxy does not own. `d` is the cell's own digit, `lo`
// and `hi` the smaller and larger same-galaxy neighbours counted so far.
const thermoStep = (label) => NFA.encodeSpec({
  startState: { p: 0, d: 0, lo: 0, hi: 0 },
  transition: (s, value) => {
    switch (s.p) {
      case 0:
        return value === label ? { p: 1, d: 0, lo: 0, hi: 0 }
                               : { p: 5, d: 0, lo: 0, hi: 0 };
      case 1:
        if (value > DIGITS.length) return undefined;  // grid cells hold 1-9
        return { p: 2, d: value, lo: 0, hi: 0 };
      case 2:
        return { p: value === label ? 3 : 4, d: s.d, lo: s.lo, hi: s.hi };
      case 3: {
        if (value === s.d) return undefined;  // a galaxy's digits do not repeat
        const lo = s.lo + (value < s.d ? 1 : 0);
        const hi = s.hi + (value > s.d ? 1 : 0);
        if (lo > 1 || hi > 1) return undefined;
        return { p: 2, d: s.d, lo, hi };
      }
      case 4:
        return { p: 2, d: s.d, lo: s.lo, hi: s.hi };
      default:
        return s;  // p === 5: sink, this cell is not in this galaxy
    }
  },
  accept: (s) => s.p === 5 || s.p === 2,
}, geometry);

const thermoPaths = GALAXIES.flatMap((g, i) => {
  const label = i + 1;
  const machine = thermoStep(label);
  return zones[i].flatMap(cell => {
    const neighbours = graph.neighbours(cell).filter(n => zoneSets[i].has(n));
    if (neighbours.length < 2) return [];
    return [new NFA(machine, `galaxy-${label}-thermo`,
                    overlay.at(cell), cell,
                    ...neighbours.flatMap(n => [overlay.at(n), n]))];
  });
});

return [
  shape,
  overlay.toVar('galaxy membership'),
  digitDomain,
  ...labelDomain,
  ...symmetry,
  ...connectivity,
  ...galaxyContents,
  ...thermoPaths,
];
