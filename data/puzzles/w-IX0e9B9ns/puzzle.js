// Title: Cosmic Balance
// Author: Nurator
// Video: https://www.youtube.com/watch?v=w-IX0e9B9ns
// Source: https://sudokupad.app/emienzh9f1

// Normal 9x9 sudoku applies. Drawn white/black dots are consecutive/1:2;
// quads contain their printed digits; grey circles are odd. The 15 circular
// clues are the centres of a complete partition into orthogonally connected,
// 180-degree-symmetric galaxies. Each galaxy has distinct digits totalling 27.
// Fog and FOGLIGHT are reveal UI, not completed-grid rules.

const GRID = '9x9';
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const gridCells = cellGraph(GRID).cells();
const gridCellSet = new Set(gridCells);

// Every circle in the drawn clue set. Coordinates are half-cell units: a cell
// centre RiCj is (2i-1, 2j-1), so edge and 2x2-corner centres are integral too.
const GALAXIES = [
  { r: 5, c: 2 }, { r: 5, c: 6 }, { r: 5, c: 12 },
  { r: 11, c: 12 }, { r: 11, c: 16 }, { r: 13, c: 6 },
  { r: 10, c: 4 }, { r: 2, c: 12 }, { r: 14, c: 14 }, { r: 16, c: 6 },
  { r: 1, c: 5 }, { r: 5, c: 17 }, { r: 9, c: 9 },
  { r: 13, c: 1 }, { r: 17, c: 13 },
];

const halfCoords = (cell) => {
  const { row, col } = parseCellId(cell);
  return { r: 2 * row - 1, c: 2 * col - 1 };
};
const rotate = (cell, galaxy) => {
  const { r, c } = halfCoords(cell);
  const image = makeCellId(
    (2 * galaxy.r - r + 1) / 2, (2 * galaxy.c - c + 1) / 2);
  return gridCellSet.has(image) ? image : null;
};

// A distinct-digit galaxy totalling 27 has at most six cells. If a cell is at
// half-Manhattan distance d from its centre, symmetry and connectivity require
// at least d+1 cells, so d <= 5 is a sound candidate-zone bound.
const zoneOf = (galaxy) => gridCells.filter(cell => {
  const { r, c } = halfCoords(cell);
  return Math.abs(r - galaxy.r) + Math.abs(c - galaxy.c) <= 5 && rotate(cell, galaxy);
});
const zones = GALAXIES.map(zoneOf);

const shape = new Shape(GRID, GALAXIES.length);
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const galaxy = graph.makeOverlay('VG');
const cellOrder = new Map(gridCells.map((cell, i) => [cell, i]));
const digitDomain = graph.makeReplicate(new Given(gridCells[0], ...DIGITS));

// One owning label per cell makes the galaxy groups disjoint and exhaustive.
const labelDomain = gridCells.map(cell => new Given(
  galaxy.at(cell), ...zones.flatMap((zone, i) => zone.includes(cell) ? [i + 1] : [])));

// A label occurs at exactly the cells paired by its 180-degree rotation.
const symmetry = GALAXIES.flatMap((g, i) => {
  const label = i + 1;
  const key = Pair.fnToKey((a, b) => (a === label) === (b === label), geometry);
  return zones[i].flatMap(cell => {
    const image = rotate(cell, g);
    if (cellOrder.get(image) <= cellOrder.get(cell)) return [];
    return [new Pair(key, `galaxy-${label}-symmetry`, ...galaxy.at([cell, image]))];
  });
});

// Each label is one non-empty orthogonally connected galaxy.
const connectivity = GALAXIES.map((_, i) => new ConnectedValues('VG', i + 1));

// Each NFA scans the fixed candidate zone as (label, digit) pairs. Its bitmask
// records the labelled cells' digits, rejecting repeats and accepting sum 27.
const galaxyContents = GALAXIES.map((_, i) => {
  const label = i + 1;
  const machine = NFA.encodeSpec({
    startState: { mask: 0, reading: false, inGalaxy: false },
    transition: (state, value) => {
      if (!state.reading) {
        return { mask: state.mask, reading: true, inGalaxy: value === label };
      }
      if (!state.inGalaxy) return { mask: state.mask, reading: false, inGalaxy: false };
      if (value > 9) return undefined;
      const bit = 1 << (value - 1);
      if (state.mask & bit) return undefined;
      return { mask: state.mask | bit, reading: false, inGalaxy: false };
    },
    accept: state => !state.reading && DIGITS.filter(d => state.mask & (1 << (d - 1)))
      .reduce((sum, digit) => sum + digit, 0) === 27,
  }, geometry);
  return new NFA(machine, `galaxy-${label}-contents`,
    ...zones[i].flatMap(cell => [galaxy.at(cell), cell]));
});

// Transcribed from the six drawn dots and four 2x2 circles; the blank quad has
// no printed digit and therefore adds no digit-membership constraint.
const whiteDots = [['R3C3', 'R3C4'], ['R3C6', 'R3C7'], ['R6C6', 'R6C7'], ['R6C8', 'R6C9']];
const blackDots = [['R3C1', 'R3C2'], ['R7C3', 'R7C4']];

return [
  shape,
  galaxy.toVar('galaxy'),
  new Given('R6C9', 6),
  digitDomain,
  ...labelDomain,
  ...symmetry,
  ...connectivity,
  ...galaxyContents,
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  new Quad('R1C6', 1, 3, 4, 6),
  new Quad('R7C7', 4),
  new Quad('R8C3', 1),
  new Given('R1C3', 1, 3, 5, 7, 9),
  new Given('R3C9', 1, 3, 5, 7, 9),
  new Given('R5C5', 1, 3, 5, 7, 9),
  new Given('R7C1', 1, 3, 5, 7, 9),
  new Given('R9C7', 1, 3, 5, 7, 9),
];
