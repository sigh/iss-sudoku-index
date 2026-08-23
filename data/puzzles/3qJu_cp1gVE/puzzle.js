// Title: Dynamic Nebula
// Author: gdc
// Video: https://www.youtube.com/watch?v=3qJu_cp1gVE
// Source: https://sudokupad.app/b1sckx3s0b

// Rules encoded here:
//   * Normal 9x9 sudoku. The grid has no givens.
//   * Spiral Galaxies: the grid divides into "galaxies" of orthogonally
//     connected cells, each 180-degree rotationally symmetric about its own
//     centre. Every galaxy centre is marked with a square, and every cell
//     belongs to exactly one galaxy.
//   * Digits do not repeat within a galaxy.
//   * Where the square carries a number, the galaxy's digits sum to it. A
//     square reading ">0" carries no number, and its galaxy therefore has no
//     stated total (every galaxy's digits already sum to something positive).
//   * A circled digit equals the number of cells in the galaxy holding it.
// Fog is solving UI: it hides cells until they are deduced and places no
// condition on the finished grid, so it is not encoded.
// Nothing is omitted.
//
// Model: two Var overlays hold, per cell, the label of the galaxy that owns
// it. The division itself is never computed here -- it is the puzzle's central
// deduction, and the solver makes it.

const GRID = '9x9';
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// The 26 drawn yellow squares, transcribed from the art. Positions are in
// half-cell units so that a square painted on a cell centre and one painted on
// a shared edge are alike integral: cell RiCj has centre (2i-1, 2j-1).
// `sum` is the number printed on the square, null where it reads ">0".
const SQUARES = [
  { r: 1, c: 4, sum: null },   // edge R1C2|R1C3
  { r: 1, c: 10, sum: 10 },    // edge R1C5|R1C6
  { r: 2, c: 1, sum: 4 },      // edge R1C1|R2C1
  { r: 3, c: 7, sum: 21 },     // R2C4
  { r: 3, c: 11, sum: null },  // R2C6
  { r: 3, c: 13, sum: 39 },    // R2C7
  { r: 4, c: 15, sum: 14 },    // edge R2C8|R3C8
  { r: 5, c: 2, sum: null },   // edge R3C1|R3C2
  { r: 7, c: 4, sum: 18 },     // edge R4C2|R4C3
  { r: 7, c: 13, sum: null },  // R4C7
  { r: 7, c: 16, sum: 35 },    // edge R4C8|R4C9
  { r: 9, c: 1, sum: null },   // R5C1
  { r: 9, c: 6, sum: 37 },     // edge R5C3|R5C4
  { r: 9, c: 17, sum: null },  // R5C9
  { r: 10, c: 9, sum: 29 },    // edge R5C5|R6C5
  { r: 11, c: 11, sum: null }, // R6C6
  { r: 13, c: 2, sum: null },  // edge R7C1|R7C2
  { r: 13, c: 5, sum: null },  // R7C3
  { r: 13, c: 11, sum: null }, // R7C6
  { r: 13, c: 16, sum: null }, // edge R7C8|R7C9
  { r: 16, c: 1, sum: 13 },    // edge R8C1|R9C1
  { r: 16, c: 5, sum: null },  // edge R8C3|R9C3
  { r: 16, c: 13, sum: null }, // edge R8C7|R9C7
  { r: 16, c: 17, sum: null }, // edge R8C9|R9C9
  { r: 17, c: 7, sum: null },  // R9C4
  { r: 17, c: 11, sum: null }, // R9C6
];

// The 5 drawn turquoise circles.
const CIRCLES = ['R3C3', 'R3C5', 'R4C8', 'R6C2', 'R6C7'];

// A label overlay holds at most 15 labels plus a marker, so the 26 galaxies are
// split over two overlays; a cell carries a real label on exactly one of them
// and the OTHER marker on the other. Alternating keeps the two halves equal.
const LAYERS = ['VA', 'VB'];
const layerOf = (index) => index % LAYERS.length;
const labelOf = (index) => Math.floor(index / LAYERS.length) + 1;
const OTHER = Math.max(...SQUARES.map((_, i) => labelOf(i))) + 1;

const shape = new Shape(GRID, OTHER);
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const overlays = LAYERS.map(prefix => graph.makeOverlay(prefix));
const cellOrder = new Map(gridCells.map((cell, i) => [cell, i]));

const halfCoords = (cell) => {
  const { row, col } = parseCellId(cell);
  return { r: 2 * row - 1, c: 2 * col - 1 };
};
// The cell diametrically opposite `cell` through square `sq`, or null when that
// lands outside the grid.
const rotate = (cell, sq) => {
  const { r, c } = halfCoords(cell);
  const image = makeCellId((2 * sq.r - r + 1) / 2, (2 * sq.c - c + 1) / 2);
  return cellOrder.has(image) ? image : null;
};

// Cell counts a galaxy can have. Its digits are distinct and drawn from 1-9, so
// there are at most 9 of them; with n of them the sum lies between 1+..+n and
// 9+..+(10-n), which a printed total narrows further.
const maxSize = (sq) => Math.max(...DIGITS.filter(n =>
  sq.sum === null ||
  (sq.sum >= (n * (n + 1)) / 2 && sq.sum <= (n * (19 - n)) / 2)));

// Which cells a galaxy could reach. A cell at half-distance d from the square
// drags its rotational image along, and a connected galaxy holding both needs
// at least d+1 cells, so d <= maxSize-1; a cell whose image falls off the grid
// cannot be in the galaxy at all. Both bounds follow from the rules encoded
// below, so this only prunes.
const zoneOf = (sq) => {
  const limit = maxSize(sq) - 1;
  return gridCells.filter(cell => {
    const { r, c } = halfCoords(cell);
    return Math.abs(r - sq.r) + Math.abs(c - sq.c) <= limit && rotate(cell, sq);
  });
};
const zones = SQUARES.map(zoneOf);
const zoneSets = zones.map(zone => new Set(zone));

// Grid cells hold digits; the widened value range exists only for the labels.
const digitDomain = graph.makeReplicate(new Given(gridCells[0], ...DIGITS));

// Each cell carries one label per overlay, and only labels whose zone reaches
// it.
const labelDomain = LAYERS.flatMap((prefix, layer) => gridCells.map(cell =>
  new Given(overlays[layer].at(cell), OTHER, ...SQUARES.flatMap((sq, i) =>
    layerOf(i) === layer && zoneSets[i].has(cell) ? [labelOf(i)] : []))));

// Exactly one of the two overlays names a galaxy for a cell, which is what
// makes the galaxies a partition with no overlaps and nothing left over.
const partition = (() => {
  const key = Pair.fnToKey((a, b) => (a === OTHER) !== (b === OTHER), geometry);
  return gridCells.map(cell => new Pair(key, 'one-galaxy-per-cell',
    overlays[0].at(cell), overlays[1].at(cell)));
})();

// 180-degree symmetry: a cell is in the galaxy exactly when its image is.
const symmetry = SQUARES.flatMap((sq, i) => {
  const label = labelOf(i);
  const overlay = overlays[layerOf(i)];
  const key = Pair.fnToKey((a, b) => (a === label) === (b === label), geometry);
  return zones[i].flatMap(cell => {
    const image = rotate(cell, sq);
    if (cellOrder.get(image) <= cellOrder.get(cell)) return [];
    return [new Pair(key, `galaxy-${i + 1}-symmetry`,
      ...overlay.at([cell, image]))];
  });
});

const connectivity = SQUARES.map(
  (sq, i) => new ConnectedValues(LAYERS[layerOf(i)], labelOf(i)));

// No repeated digit, and the printed total, are both functions of the set of
// digits a galaxy holds, so one machine per galaxy scans its zone as
// (label, digit) pairs and accumulates that set as a 9-bit mask. `reading` is
// true while the next symbol is the digit belonging to the label just seen.
const digitsOfMask = (mask) => DIGITS.filter(d => mask & (1 << (d - 1)));
const galaxyContents = SQUARES.map((sq, i) => {
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
      if (sq.sum === null) return true;
      const digits = digitsOfMask(state.mask);
      return digits.reduce((a, b) => a + b, 0) === sq.sum;
    },
  }, geometry);
  return new NFA(machine, `galaxy-${i + 1}-contents`,
    ...zones[i].flatMap(cell => [overlays[layerOf(i)].at(cell), cell]));
});

// A circled digit counts the cells of its own galaxy. Which galaxy that is, is
// unknown, so there is one machine per galaxy whose zone reaches the circle. It
// counts the galaxy's cells; the circle's own (label, digit) pair is scanned
// first, so `first` marks it and `circleDigit` records its digit -- staying 0
// when the circle turned out not to be in this galaxy.
const circleCounts = SQUARES.flatMap((sq, i) => {
  const label = labelOf(i);
  const overlay = overlays[layerOf(i)];
  return CIRCLES.filter(circle => zoneSets[i].has(circle)).map(circle => {
    const machine = NFA.encodeSpec({
      startState:
        { count: 0, circleDigit: 0, reading: false, inGalaxy: false, first: true },
      transition: (state, value) => {
        if (!state.reading) {
          return { ...state, reading: true, inGalaxy: value === label };
        }
        if (!state.inGalaxy) {
          return { ...state, reading: false, first: false };
        }
        // Grid cells never exceed 9; the wider alphabet is only for labels.
        if (value > DIGITS.length) return undefined;
        const count = state.count + 1;
        if (count > DIGITS.length) return undefined;  // digits do not repeat
        return {
          count,
          circleDigit: state.first ? value : state.circleDigit,
          reading: false,
          inGalaxy: false,
          first: false,
        };
      },
      accept: (state) => !state.reading &&
        (state.circleDigit === 0 || state.circleDigit === state.count),
    }, geometry);
    const scanned = [circle, ...zones[i].filter(cell => cell !== circle)];
    return new NFA(machine, `galaxy-${i + 1}-circle-${circle}`,
      ...scanned.flatMap(cell => [overlay.at(cell), cell]));
  });
});

return [
  shape,
  ...overlays.map((overlay, layer) => overlay.toVar(`galaxy-${LAYERS[layer]}`)),
  digitDomain,
  ...labelDomain,
  ...partition,
  ...symmetry,
  ...connectivity,
  ...galaxyContents,
  ...circleCounts,
];
