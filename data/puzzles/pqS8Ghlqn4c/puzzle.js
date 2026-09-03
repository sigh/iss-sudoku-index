// Title: Anti-Ratio Astronomy
// Author: Scojo
// Video: https://www.youtube.com/watch?v=pqS8Ghlqn4c
// Source: https://app.crackingthecryptic.com/sudoku/fmDD3m73nh

// Rules encoded here:
//   * Normal 9x9 sudoku, with 12 given digits.
//   * The grid divides into "galaxies": orthogonally connected groups of cells,
//     each mapped onto itself by a 180-degree rotation about its own centre.
//     Galaxies do not overlap and every cell belongs to one.
//   * The centre of every galaxy is marked by a red dot; 14 dots are drawn, so
//     there are 14 galaxies, one per dot.
//   * Digits do not repeat within a galaxy.
//   * No two orthogonally adjacent cells (no domino) hold digits in a 1:2
//     ratio.
// Nothing is omitted.
//
// Model: a Var overlay holds, per cell, the label of the galaxy that owns it.
// Which cells form which galaxy is the puzzle's central deduction and is left
// to the solver; nothing here computes a division.

const GRID = '9x9';
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Transcribed from the 12 filled cells of the grid.
const GIVENS = [
  ['R1C4', 1], ['R1C6', 6], ['R2C2', 4], ['R2C8', 1],
  ['R4C6', 3], ['R5C4', 2], ['R5C8', 5], ['R6C9', 4],
  ['R7C1', 1], ['R7C7', 7], ['R8C5', 2], ['R9C1', 7],
];

// The 14 drawn red dots, transcribed from the art. Positions are in half-cell
// units so that a dot on a cell centre, one on a shared edge and one on a grid
// corner are alike integral: cell RiCj has centre (2i-1, 2j-1), so an odd/odd
// pair is a cell centre, an even/odd or odd/even pair an edge midpoint, and an
// even/even pair a grid corner.
const DOTS = [
  { r: 3, c: 1 },    // R2C1
  { r: 4, c: 3 },    // edge R2C2|R3C2
  { r: 1, c: 13 },   // R1C7
  { r: 3, c: 16 },   // edge R2C8|R2C9
  { r: 5, c: 14 },   // edge R3C7|R3C8
  { r: 5, c: 9 },    // R3C5
  { r: 7, c: 7 },    // R4C4
  { r: 10, c: 3 },   // edge R5C2|R6C2
  { r: 11, c: 15 },  // R6C8
  { r: 16, c: 15 },  // edge R8C8|R9C8
  { r: 17, c: 11 },  // R9C6
  { r: 14, c: 10 },  // corner R7C5|R7C6|R8C5|R8C6
  { r: 14, c: 7 },   // edge R7C4|R8C4
  { r: 15, c: 3 },   // R8C2
];

// One label per dot, carried on a single overlay; the value range is widened to
// hold them.
const LABELS = DOTS.map((_, i) => i + 1);
const NUM_VALUES = DOTS.length;

const shape = new Shape(GRID, NUM_VALUES);
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const overlay = graph.makeOverlay('VG');
const cellOrder = new Map(gridCells.map((cell, i) => [cell, i]));

const halfCoords = (cell) => {
  const { row, col } = parseCellId(cell);
  return { r: 2 * row - 1, c: 2 * col - 1 };
};
// The cell diametrically opposite `cell` through dot `dot`, or null when that
// lands outside the grid.
const rotate = (cell, dot) => {
  const { r, c } = halfCoords(cell);
  const image = makeCellId((2 * dot.r - r + 1) / 2, (2 * dot.c - c + 1) / 2);
  return cellOrder.has(image) ? image : null;
};

// Which cells a galaxy could reach. Its digits are distinct and drawn from 1-9,
// so it holds at most 9 cells. A cell at half-cell distance d from the dot
// drags its rotational image along, and those two cells are d apart in the
// grid, so a connected galaxy holding both needs at least d+1 cells: d <= 8.
// A cell whose image falls off the grid cannot be in the galaxy at all. Both
// bounds follow from the rules encoded below, so this only prunes.
const zoneOf = (dot) => gridCells.filter(cell => {
  const { r, c } = halfCoords(cell);
  return Math.abs(r - dot.r) + Math.abs(c - dot.c) <= DIGITS.length - 1 &&
    rotate(cell, dot);
});
const zones = DOTS.map(zoneOf);
const zoneSets = zones.map(zone => new Set(zone));

const givens = GIVENS.map(([cell, digit]) => new Given(cell, digit));

// Grid cells hold digits; the widened value range exists only for the labels.
const digitDomain = graph.makeReplicate(new Given(gridCells[0], ...DIGITS));

// Every cell carries exactly one label, which is the partition: galaxies
// neither overlap nor leave a cell uncovered. Only labels whose zone reaches
// the cell are allowed.
const labelDomain = gridCells.map(cell => new Given(overlay.at(cell),
  ...LABELS.filter(label => zoneSets[label - 1].has(cell))));

// 180-degree symmetry about the dot: a cell is in the galaxy exactly when its
// image through the dot is.
const symmetry = DOTS.flatMap((dot, i) => {
  const label = LABELS[i];
  const key = Pair.fnToKey((a, b) => (a === label) === (b === label), geometry);
  return zones[i].flatMap(cell => {
    const image = rotate(cell, dot);
    if (cellOrder.get(image) <= cellOrder.get(cell)) return [];
    return [new Pair(key, `galaxy-${label}-symmetry`,
      ...overlay.at([cell, image]))];
  });
});

// Each galaxy is orthogonally connected, and non-empty: each of the 14 drawn
// dots is the centre of a galaxy.
const connectivity = LABELS.map(label => new ConnectedValues('VG', label));

// Digits do not repeat within a galaxy. One machine per galaxy scans its zone
// as (label, digit) pairs and accumulates the galaxy's digits as a 9-bit mask,
// rejecting a repeat as it happens. `reading` is true while the next symbol is
// the digit belonging to the label just seen, and `inGalaxy` records whether
// that label was this galaxy's.
const galaxyContents = DOTS.map((dot, i) => {
  const label = LABELS[i];
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
      if (state.mask & bit) return undefined;
      return { mask: state.mask | bit, reading: false, inGalaxy: false };
    },
    accept: (state) => !state.reading,
  }, geometry);
  return new NFA(machine, `galaxy-${label}-contents`,
    ...zones[i].flatMap(cell => [overlay.at(cell), cell]));
});

// No domino holds digits in a 1:2 ratio. Nothing is drawn for this rule, so it
// applies to every orthogonally adjacent pair: a Pair over a whole row or
// column relates exactly its consecutive cells.
const antiRatio = (() => {
  const key = Pair.fnToKey((a, b) => a !== 2 * b && b !== 2 * a, geometry);
  return [
    ...graph.rows().map((cells, i) =>
      new Pair(key, `no-ratio-row-${i + 1}`, ...cells)),
    ...graph.columns().map((cells, i) =>
      new Pair(key, `no-ratio-col-${i + 1}`, ...cells)),
  ];
})();

return [
  shape,
  overlay.toVar('galaxy'),
  digitDomain,
  ...givens,
  ...labelDomain,
  ...symmetry,
  ...connectivity,
  ...galaxyContents,
  ...antiRatio,
];
