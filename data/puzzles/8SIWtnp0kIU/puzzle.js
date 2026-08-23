// Title: Galactic Skirmish
// Author: AnalyticalNinja & Clocksmith
// Video: https://www.youtube.com/watch?v=8SIWtnp0kIU
// Source: https://app.crackingthecryptic.com/sudoku/m7Grm47T9H

// Rules encoded here:
//   * Normal sudoku.
//   * The 18 drawn dots are the centres of "galaxies": orthogonally connected
//     groups of cells that are 180-degree rotationally symmetric about their
//     own dot. Every cell belongs to exactly one galaxy.
//   * Each row, column and 3x3 box holds exactly 2 stars, every galaxy holds
//     exactly 1 star, and no two stars are a king's move apart.
//   * Digits do not repeat within a galaxy.
//   * A galaxy holding one of the 14 small number clues sums to that number,
//     with the galaxy's star cell excluded from the total.
// Nothing is omitted.
//
// Model: the galaxy division is not drawn, so it is a solver choice here, not
// something worked out in advance -- one label Var per grid cell names the
// galaxy that owns it, and a second Var per cell flags the stars. Which galaxy
// a number clue belongs to is likewise unknown, so each clue is applied to
// every galaxy that could hold its cell, conditioned on that cell's label.
// The value range tops out at 16 labels, so the 18 galaxies are split over two
// label layers, VA and VB, each carrying 9 galaxies plus a sentinel meaning
// "this cell's galaxy is on the other layer".

const GRID = '9x9';
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const LAYER_SIZE = 9;              // galaxies per label layer
const SENTINEL = LAYER_SIZE + 1;   // label value: galaxy lives on the other layer
const NO_STAR = 1, STAR = 2;
// Digits do not repeat within a galaxy, so a galaxy holds at most 9 cells.
const MAX_GALAXY_CELLS = DIGITS.length;

// The 18 dots, transcribed from the drawn circles. Coordinates are in
// half-cell units, so that a dot on a cell centre, on an edge midpoint or on a
// grid corner is alike integral: cell RiCj has centre (2i-1, 2j-1). The
// comment names the cells each dot is drawn on.
const DOTS = [
  { r: 5, c: 1 },    // R3C1
  { r: 4, c: 4 },    // R2C2/R2C3/R3C2/R3C3
  { r: 1, c: 6 },    // R1C3|R1C4
  { r: 2, c: 11 },   // R1C6|R2C6
  { r: 5, c: 9 },    // R3C5
  { r: 1, c: 15 },   // R1C8
  { r: 5, c: 14 },   // R3C7|R3C8
  { r: 5, c: 17 },   // R3C9
  { r: 11, c: 16 },  // R6C8|R6C9
  { r: 10, c: 11 },  // R5C6|R6C6
  { r: 10, c: 6 },   // R5C3/R5C4/R6C3/R6C4
  { r: 10, c: 2 },   // R5C1/R5C2/R6C1/R6C2
  { r: 14, c: 3 },   // R7C2|R8C2
  { r: 16, c: 5 },   // R8C3|R9C3
  { r: 17, c: 9 },   // R9C5
  { r: 13, c: 12 },  // R7C6|R7C7
  { r: 16, c: 14 },  // R8C7/R8C8/R9C7/R9C8
  { r: 16, c: 17 },  // R8C9|R9C9
];

// The 14 small number clues, transcribed from the drawn text overlays; each is
// printed inside one cell.
const CLUES = [
  { cell: 'R2C1', sum: 16 },
  { cell: 'R7C3', sum: 16 },
  { cell: 'R2C6', sum: 6 },
  { cell: 'R2C8', sum: 28 },
  { cell: 'R4C9', sum: 30 },
  { cell: 'R5C7', sum: 15 },
  { cell: 'R4C6', sum: 37 },
  { cell: 'R4C4', sum: 29 },
  { cell: 'R5C3', sum: 22 },
  { cell: 'R6C1', sum: 30 },
  { cell: 'R7C5', sum: 31 },
  { cell: 'R8C8', sum: 23 },
  { cell: 'R9C6', sum: 9 },
  { cell: 'R9C1', sum: 22 },
];

const shape = new Shape(GRID, SENTINEL);
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const LAYER_PREFIXES = ['VA', 'VB'];
const labelLayers = LAYER_PREFIXES.map(prefix => graph.makeOverlay(prefix));
const stars = graph.makeOverlay('VS');

// Galaxy g is label `labelOf(g)` on layer `layerOf(g)`; the split into two
// layers is by drawing order and carries no meaning.
const layerIndex = (g) => Math.floor(g / LAYER_SIZE);
const layerOf = (g) => labelLayers[layerIndex(g)];
const labelOf = (g) => (g % LAYER_SIZE) + 1;
const labelCell = (g, cell) => layerOf(g).at(cell);

const halfCoords = (cell) => {
  const { row, col } = parseCellId(cell);
  return { r: 2 * row - 1, c: 2 * col - 1 };
};
const gridCellSet = new Set(gridCells);
const cellOrder = new Map(gridCells.map((cell, i) => [cell, i]));
// The cell diametrically opposite `cell` through dot `dot`, or null off-grid.
const rotate = (cell, dot) => {
  const { r, c } = halfCoords(cell);
  const image = makeCellId((2 * dot.r - r + 1) / 2, (2 * dot.c - c + 1) / 2);
  return gridCellSet.has(image) ? image : null;
};

// Which cells a galaxy could reach: a cell at half-cell distance d from the
// dot drags its rotational image along, and those two are d cells apart, so a
// connected galaxy containing them holds at least d+1 cells. A cell whose
// image falls outside the grid cannot be in the galaxy at all.
const zoneOf = (dot) => gridCells.filter(cell => {
  const { r, c } = halfCoords(cell);
  return Math.abs(r - dot.r) + Math.abs(c - dot.c) <= MAX_GALAXY_CELLS - 1
    && rotate(cell, dot);
});
const zones = DOTS.map(zoneOf);

// Grid cells hold digits; the extra value exists only for the label sentinel.
const digitDomain = graph.makeReplicate(new Given(gridCells[0], ...DIGITS));
const starDomain = stars.makeReplicate(
  new Given(stars.cells()[0], NO_STAR, STAR));

// A cell's label on each layer is the sentinel or one of the galaxies on that
// layer whose zone reaches it.
const labelDomain = labelLayers.flatMap((layer, i) => gridCells.map(
  cell => new Given(
    layer.at(cell), SENTINEL,
    ...zones.flatMap((zone, g) => (layerOf(g) === layer && zone.includes(cell))
      ? [labelOf(g)] : []))));

// Every cell belongs to exactly one galaxy: exactly one of its two label cells
// names a galaxy, and the other is the sentinel.
const oneLayerKey = Pair.fnToKey(
  (a, b) => (a === SENTINEL) !== (b === SENTINEL), geometry);
const oneGalaxyPerCell = gridCells.map(cell => new Pair(
  oneLayerKey, 'one-galaxy-per-cell',
  labelLayers[0].at(cell), labelLayers[1].at(cell)));

// 180-degree symmetry: a cell is in the galaxy exactly when its image is.
const symmetry = DOTS.flatMap((dot, g) => {
  const label = labelOf(g);
  const key = Pair.fnToKey((a, b) => (a === label) === (b === label), geometry);
  return zones[g].flatMap(cell => {
    const image = rotate(cell, dot);
    // one constraint per rotational pair, and none for a self-paired cell
    if (cellOrder.get(image) <= cellOrder.get(cell)) return [];
    return [new Pair(key, `galaxy-${g + 1}-symmetry`,
      labelCell(g, cell), labelCell(g, image))];
  });
});

const connectivity = DOTS.map(
  (dot, g) => new ConnectedValues(LAYER_PREFIXES[layerIndex(g)], labelOf(g)));

// Exactly one star per galaxy: scan the galaxy's zone as (label, star) pairs
// and count the stars whose cell carries this galaxy's label.
const starPerGalaxy = DOTS.map((dot, g) => {
  const label = labelOf(g);
  const machine = NFA.encodeSpec({
    startState: { count: 0, inGalaxy: null },
    transition: (state, value) => {
      if (state.inGalaxy === null) {
        return { count: state.count, inGalaxy: value === label };
      }
      const count = state.count + (state.inGalaxy && value === STAR ? 1 : 0);
      if (count > 1) return undefined;
      return { count, inGalaxy: null };
    },
    accept: (state) => state.inGalaxy === null && state.count === 1,
  }, geometry);
  return new NFA(machine, `galaxy-${g + 1}-one-star`,
    ...zones[g].flatMap(cell => [labelCell(g, cell), stars.at(cell)]));
});

// Digits do not repeat within a galaxy: scan the zone as (label, digit) pairs
// and collect the galaxy's digits as a bitmask, rejecting a repeat.
const galaxyDigits = DOTS.map((dot, g) => {
  const label = labelOf(g);
  const machine = NFA.encodeSpec({
    startState: { mask: 0, inGalaxy: null },
    transition: (state, value) => {
      if (state.inGalaxy === null) {
        return { mask: state.mask, inGalaxy: value === label };
      }
      if (!state.inGalaxy) return { mask: state.mask, inGalaxy: null };
      const bit = 1 << (value - 1);
      if (state.mask & bit) return undefined;
      return { mask: state.mask | bit, inGalaxy: null };
    },
    accept: (state) => state.inGalaxy === null,
  }, geometry);
  return new NFA(machine, `galaxy-${g + 1}-distinct`,
    ...zones[g].flatMap(cell => [labelCell(g, cell), cell]));
});

// A number clue constrains whichever galaxy holds its cell, and that is not
// drawn either. So each clue gets one machine per galaxy whose zone reaches
// the clue cell, and the clue cell's own label -- read as the machine's first
// symbol, by putting its cell first in the scan -- switches the machine on:
// off, it accepts anything; on, the galaxy's non-star digits must total the
// clue. `member` tracks whether the cell being read belongs to the galaxy and
// is not its star, so only those cells add to the running sum.
const clueSums = CLUES.flatMap(({ cell, sum }) => DOTS.flatMap((dot, g) => {
  if (!zones[g].includes(cell)) return [];
  const label = labelOf(g);
  const machine = NFA.encodeSpec({
    startState: { stage: 'first', sum: 0, member: false },
    transition: (state, value) => {
      if (state.stage === 'first') {
        return value === label
          ? { stage: 'star', sum: 0, member: true }
          : { stage: 'off', sum: 0, member: false };
      }
      if (state.stage === 'off') return state;
      if (state.stage === 'label') {
        return { stage: 'star', sum: state.sum, member: value === label };
      }
      if (state.stage === 'star') {
        return {
          stage: 'digit', sum: state.sum,
          member: state.member && value === NO_STAR,
        };
      }
      const total = state.sum + (state.member ? value : 0);
      if (total > sum) return undefined;
      return { stage: 'label', sum: total, member: false };
    },
    accept: (state) => state.stage === 'off'
      || (state.stage === 'label' && state.sum === sum),
  }, geometry);
  const scan = [cell, ...zones[g].filter(other => other !== cell)];
  return [new NFA(machine, `galaxy-${g + 1}-sum-${cell}`,
    ...scan.flatMap(other => [labelCell(g, other), stars.at(other), other]))];
}));

const starCounts = graph.rowsColumnsBoxes().map(
  unit => new ContainExact(`${STAR}_${STAR}`, ...stars.at(unit)));

// No two stars a king's move apart: two cells are a king's move apart exactly
// when some 2x2 block holds both, so no 2x2 block may hold two stars.
const atMostOneStar = NFA.encodeSpec({
  startState: 0,
  transition: (count, value) => {
    const next = count + (value === STAR ? 1 : 0);
    return next > 1 ? undefined : next;
  },
  accept: () => true,
}, geometry);
const starsNotAdjacent = stars.makeReplicate(
  new NFA(atMostOneStar, 'stars-not-adjacent',
    ...stars.at(graph.block(gridCells[0], 2, 2))),
  stars.at(gridCells.filter(cell => graph.block(cell, 2, 2))));

return [
  shape,
  ...labelLayers.map((layer, i) => layer.toVar(`galaxy-labels-${i + 1}`)),
  stars.toVar('stars'),
  digitDomain,
  starDomain,
  ...labelDomain,
  ...oneGalaxyPerCell,
  ...symmetry,
  ...connectivity,
  ...starPerGalaxy,
  ...galaxyDigits,
  ...clueSums,
  ...starCounts,
  starsNotAdjacent,
];
