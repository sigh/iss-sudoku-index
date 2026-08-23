// Title: Is Zipper A Zodiac Sign?
// Author: gdc
// Video: https://www.youtube.com/watch?v=qeNYQBZ5TGE
// Source: https://sudokupad.app/urcfy6f7yx

// Rules encoded here:
//   * Normal sudoku.
//   * Spiral galaxies: the grid divides into galaxies, orthogonally connected
//     groups of cells with 180 degree rotational symmetry about their centres.
//     Each centre is marked with a large circle. Every cell is in exactly one
//     galaxy and galaxies do not overlap.
//   * Digits may not repeat in a galaxy.
//   * A number orbiting a galaxy centre is the sum of all digits in that
//     galaxy.
//   * A "Z" orbiting a galaxy centre marks a zipper galaxy: each digit and the
//     digit rotationally opposite to it sum to the circled digit.
// Omitted: Fog of War, and the single-cell FOGLIGHT cage at R6C6, control what
// SudokuPad reveals while solving; they place no rule on the finished grid.
//
// Model: one label per cell naming the galaxy that owns it. Eighteen labels do
// not fit one value range, so the labels are split across two whole-grid
// overlays, VG for the first nine galaxies and VH for the last nine; the split
// is a capacity split with no puzzle meaning. In each overlay the extra value
// OTHER means "this cell's galaxy is labelled on the other overlay", and a
// per-cell Pair makes exactly one of the two overlays name a galaxy, which is
// what makes the galaxies a partition with no overlaps and nothing left over.

const GRID = '9x9';
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const gridCells = cellGraph(GRID).cells();

// Transcribed from the eighteen large circles and the small circles orbiting
// them. `at` is the cell a circle is drawn in, or the two cells an
// edge-straddling circle is drawn across. `sum` is the number in an orbiting
// circle, `zipper` marks the six centres whose orbiting circle holds a "Z".
const GALAXIES = [
  { at: ['R1C6'], sum: null, zipper: false },
  { at: ['R1C2', 'R2C2'], sum: 14, zipper: false },
  { at: ['R2C5'], sum: null, zipper: false },
  { at: ['R2C7'], sum: null, zipper: false },
  { at: ['R3C3'], sum: 45, zipper: true },
  { at: ['R4C1'], sum: 35, zipper: false },
  { at: ['R4C5'], sum: 24, zipper: true },
  { at: ['R4C9'], sum: null, zipper: true },
  { at: ['R5C5'], sum: 12, zipper: true },
  { at: ['R5C8'], sum: 28, zipper: true },
  { at: ['R6C6'], sum: 15, zipper: true },
  { at: ['R7C1', 'R7C2'], sum: null, zipper: false },
  { at: ['R7C3'], sum: 35, zipper: false },
  { at: ['R8C5'], sum: 25, zipper: false },
  { at: ['R8C7'], sum: null, zipper: false },
  { at: ['R8C8', 'R8C9'], sum: null, zipper: false },
  { at: ['R9C3'], sum: null, zipper: false },
  { at: ['R9C9'], sum: null, zipper: false },
];

// Half-cell coordinates, so a centre drawn on a cell and a centre drawn on the
// edge between two cells are alike integral: cell RiCj has centre (2i-1, 2j-1),
// and the midpoint of two cells is the mean of theirs.
const halfCoords = (cell) => {
  const { row, col } = parseCellId(cell);
  return { r: 2 * row - 1, c: 2 * col - 1 };
};
const centreOf = (g) => {
  const points = g.at.map(halfCoords);
  return {
    r: points.reduce((a, p) => a + p.r, 0) / points.length,
    c: points.reduce((a, p) => a + p.c, 0) / points.length,
  };
};
const gridCellSet = new Set(gridCells);
// The cell diametrically opposite `cell` through galaxy `g`'s centre, or null
// when that lands outside the grid.
const rotate = (cell, g) => {
  const { r, c } = halfCoords(cell);
  const centre = centreOf(g);
  const image = makeCellId((2 * centre.r - r + 1) / 2, (2 * centre.c - c + 1) / 2);
  return gridCellSet.has(image) ? image : null;
};

// Cell counts a galaxy can have. Rotation pairs its cells up, leaving only the
// cell holding a cell-drawn centre unpaired, so a galaxy is odd-sized when its
// circle is drawn on a cell and even-sized when it is drawn on an edge. Digits
// do not repeat, so there are at most nine cells; where a total is printed, n
// distinct digits reach only 1+..+n at least and 9+..+(10-n) at most.
const possibleSizes = (g) => DIGITS.filter(n => {
  if (n % 2 !== g.at.length % 2) return false;
  if (g.sum === null) return true;
  return g.sum >= (n * (n + 1)) / 2 && g.sum <= (n * (19 - n)) / 2;
});

// Which cells a galaxy could reach. A cell at half-distance d from the centre
// has its rotational image d cells away across the grid, and a path between the
// two inside a connected galaxy needs at least d+1 cells, so d <= maxSize-1. A
// cell whose image falls outside the grid cannot be in the galaxy at all.
const zoneOf = (g) => {
  const limit = Math.max(...possibleSizes(g)) - 1;
  const centre = centreOf(g);
  return gridCells.filter(cell => {
    const { r, c } = halfCoords(cell);
    return Math.abs(r - centre.r) + Math.abs(c - centre.c) <= limit && rotate(cell, g);
  });
};
const zones = GALAXIES.map(zoneOf);

// Eighteen labels exceed the value range, so they are split over two overlays
// of nine, each carrying one extra value for "laid out on the other overlay".
const LAYERS = 2;
const PER_LAYER = Math.ceil(GALAXIES.length / LAYERS);
const OTHER = PER_LAYER + 1;
const layerOf = (i) => Math.floor(i / PER_LAYER);
const labelOf = (i) => (i % PER_LAYER) + 1;

const shape = new Shape(GRID, OTHER);
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const PREFIXES = ['VG', 'VH'];
const overlays = PREFIXES.map(prefix => graph.makeOverlay(prefix));
const overlayOf = (i) => overlays[layerOf(i)];
const cellOrder = new Map(gridCells.map((cell, i) => [cell, i]));

// Grid cells hold digits; the extra value exists only to mark a cell whose
// galaxy is labelled on the other overlay.
const digitDomain = graph.makeReplicate(new Given(gridCells[0], ...DIGITS));

// Each overlay cell names a galaxy of that overlay whose zone covers the cell,
// or OTHER.
const labelDomain = overlays.flatMap((overlay, layer) => gridCells.map(cell =>
  new Given(overlay.at(cell), OTHER,
    ...GALAXIES.flatMap((g, i) =>
      layerOf(i) === layer && zones[i].includes(cell) ? [labelOf(i)] : []))));

// Exactly one of the two overlays names a galaxy for each cell.
const oneLabelKey = Pair.fnToKey((a, b) => (a === OTHER) !== (b === OTHER), geometry);
const oneLabel = gridCells.map(cell => new Pair(
  oneLabelKey, 'one-galaxy-per-cell', overlays[0].at(cell), overlays[1].at(cell)));

// A galaxy contains its own centre: the large circle is drawn inside the cell,
// or across the edge shared by the two cells, that it marks.
const anchors = GALAXIES.flatMap((g, i) =>
  g.at.map(cell => new Given(overlayOf(i).at(cell), labelOf(i))));

// 180 degree symmetry: a cell is in the galaxy exactly when its image is.
const symmetry = GALAXIES.flatMap((g, i) => {
  const label = labelOf(i);
  const key = Pair.fnToKey((a, b) => (a === label) === (b === label), geometry);
  return zones[i].flatMap(cell => {
    const image = rotate(cell, g);
    if (cellOrder.get(image) <= cellOrder.get(cell)) return [];
    return [new Pair(key, `galaxy-${i + 1}-symmetry`,
      ...overlayOf(i).at([cell, image]))];
  });
});

const connectivity = GALAXIES.map(
  (g, i) => new ConnectedValues(PREFIXES[layerOf(i)], labelOf(i)));

// The printed total and the no-repeats rule are both functions of the set of
// digits a galaxy holds, so one machine per galaxy scans its zone as
// (label, digit) pairs and accumulates that set as a bitmask. `reading` is true
// while the next cell read is the digit belonging to the label just seen.
const galaxyContents = GALAXIES.flatMap((g, i) => {
  // A one-cell zone with no printed total leaves nothing for the machine to
  // check: a single digit can neither repeat nor miss a total.
  if (g.sum === null && zones[i].length < 2) return [];
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
      if (value > DIGITS.length) return undefined;  // OTHER is not a digit
      const bit = 1 << (value - 1);
      if (state.mask & bit) return undefined;  // digits do not repeat
      return { mask: state.mask | bit, reading: false, inGalaxy: false };
    },
    accept: (state) => {
      if (state.reading) return false;
      if (g.sum === null) return true;
      const sum = DIGITS.reduce(
        (total, d) => total + (state.mask & (1 << (d - 1)) ? d : 0), 0);
      return sum === g.sum;
    },
  }, geometry);
  return [new NFA(machine, `galaxy-${i + 1}-contents`,
    ...zones[i].flatMap(cell => [overlayOf(i).at(cell), cell]))];
});

// Zipper galaxies. Every "Z" centre is drawn on a cell, and that cell's digit
// is the circled digit; it is the total the pairs make, so it is not itself
// paired with anything (a cell is its own rotational image only there). One
// machine per rotational pair reads [label, digit, opposite digit, centre
// digit] and, when the label puts the pair in the galaxy, requires the two
// digits to sum to the centre digit.
const zippers = GALAXIES.flatMap((g, i) => {
  if (!g.zipper) return [];
  const label = labelOf(i);
  const machine = NFA.encodeSpec({
    startState: 'label',
    transition: (state, value) => {
      if (state === 'label') return value === label ? 'first' : 'skip1';
      if (state === 'skip1') return 'skip2';
      if (state === 'skip2') return 'skip3';
      if (state === 'skip3') return 'done';
      if (value > DIGITS.length) return undefined;  // OTHER is not a digit
      if (state === 'first') return { half: value };
      if (state.half !== undefined) return { total: state.half + value };
      return state.total === value ? 'done' : undefined;
    },
    accept: (state) => state === 'done',
  }, geometry);
  return zones[i].flatMap(cell => {
    const image = rotate(cell, g);
    if (cellOrder.get(image) <= cellOrder.get(cell)) return [];
    return [new NFA(machine, `galaxy-${i + 1}-zipper`,
      overlayOf(i).at(cell), cell, image, g.at[0])];
  });
});

return [
  shape,
  ...overlays.map((overlay, layer) => overlay.toVar(`galaxy-labels-${layer + 1}`)),
  digitDomain,
  ...labelDomain,
  ...oneLabel,
  ...anchors,
  ...symmetry,
  ...connectivity,
  ...galaxyContents,
  ...zippers,
];
