// Title: Galactic Map
// Author: Blobz
// Video: https://www.youtube.com/watch?v=OL_2WkMwA64
// Source: https://sudokupad.app/blobz/galactic-map

// Rules encoded here: normal Sudoku; a complete partition into the 19 marked,
// orthogonally connected, 180-degree-symmetric galaxies; no repeated digit in
// a galaxy; grey galaxies are Renban and have at least two cells; white
// galaxies are singleton or non-Renban. The diamond-minimum and large-circle-
// maximum rules are omitted.

const GRID = '9x9';
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const gridCells = cellGraph(GRID).cells();
const gridCellSet = new Set(gridCells);

// Transcribed from the 19 small dots. Coordinates are in half-cell units; a
// cell centre RrCc is (2r-1, 2c-1). `renban` is the #888888 grey fill.
const GALAXIES = [
  { r: 4, c: 3, renban: false }, { r: 12, c: 1, renban: false },
  { r: 17, c: 1, renban: false }, { r: 17, c: 9, renban: false },
  { r: 15, c: 9, renban: false }, { r: 17, c: 15, renban: false },
  { r: 14, c: 17, renban: false }, { r: 13, c: 12, renban: false },
  { r: 3, c: 17, renban: false }, { r: 1, c: 4, renban: true },
  { r: 1, c: 13, renban: true }, { r: 4, c: 15, renban: true },
  { r: 5, c: 11, renban: true }, { r: 5, c: 1, renban: true },
  { r: 7, c: 4, renban: true }, { r: 10, c: 10, renban: true },
  { r: 11, c: 5, renban: true }, { r: 15, c: 6, renban: true },
  { r: 12, c: 15, renban: false },
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

// Distinct digits cap a galaxy at nine cells. A symmetric connected galaxy
// containing a cell at half-Manhattan distance d has at least d+1 cells.
const zoneOf = (galaxy) => gridCells.filter(cell => {
  const { r, c } = halfCoords(cell);
  return Math.abs(r - galaxy.r) + Math.abs(c - galaxy.c) <= 8 && rotate(cell, galaxy);
});
const zones = GALAXIES.map(zoneOf);

// A Var alphabet holds at most 16 values. VG labels galaxies 1-15; cells of
// galaxies 16-19 carry the VG escape value 16 and their VH value 1-4 instead.
// VH is 5 everywhere in the first fifteen galaxies.
const shape = new Shape(GRID, 16);
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const vg = graph.makeOverlay('VG');
const vh = graph.makeOverlay('VH');
const cellOrder = new Map(gridCells.map((cell, i) => [cell, i]));
const digitDomain = graph.makeReplicate(new Given(gridCells[0], ...DIGITS));

const codeOf = (index) => index < 15
  ? { layer: vg, value: index + 1 }
  : { layer: vh, value: index - 14 };
// The two overlays encode exactly one of the nineteen labels at every cell.
const codeKey = Pair.fnToKey((a, b) =>
  (a >= 1 && a <= 15 && b === 5) || (a === 16 && b >= 1 && b <= 4), geometry);
const codeDomains = gridCells.map(cell => new Pair(
  codeKey, 'galaxy-label-code', vg.at(cell), vh.at(cell)));

// A label is allowed only where its rotational image is on-grid and within the
// nine-cell connected-galaxy distance bound derived above.
const labelDomains = gridCells.map(cell => {
  const allowed = GALAXIES.flatMap((_, index) => zones[index].includes(cell)
    ? [codeOf(index)] : []);
  const vgValues = allowed.filter(x => x.layer === vg).map(x => x.value);
  const vhValues = allowed.filter(x => x.layer === vh).map(x => x.value);
  return [
    new Given(vg.at(cell), ...vgValues, ...(vhValues.length ? [16] : [])),
    new Given(vh.at(cell), ...vhValues, ...(vgValues.length ? [5] : [])),
  ];
}).flat();

// 180-degree symmetry: membership of each label is equal at rotational pairs.
const symmetry = GALAXIES.flatMap((galaxy, index) => {
  const code = codeOf(index);
  const key = Pair.fnToKey((a, b) => (a === code.value) === (b === code.value), geometry);
  return zones[index].flatMap(cell => {
    const image = rotate(cell, galaxy);
    if (cellOrder.get(image) <= cellOrder.get(cell)) return [];
    return [new Pair(key, `galaxy-${index + 1}-symmetry`, ...code.layer.at([cell, image]))];
  });
});

// Each labelled set is one non-empty orthogonally connected galaxy.
const connectivity = GALAXIES.map((_, index) => {
  const code = codeOf(index);
  return new ConnectedValues(code.layer === vg ? 'VG' : 'VH', code.value);
});

// One NFA per galaxy scans its owning label and digit over its fixed candidate
// zone. Its mask implements the no-repeat and Renban/non-Renban predicates.
const digitsOfMask = (mask) => DIGITS.filter(digit => mask & (1 << (digit - 1)));
const galaxyContents = GALAXIES.flatMap((galaxy, index) => {
  // Galaxy 3's zone is only R9C1, so its white singleton rule and distinctness
  // are already forced by its label domain and need no two-cell state machine.
  if (zones[index].length === 1) return [];
  const code = codeOf(index);
  const machine = NFA.encodeSpec({
    startState: { mask: 0, reading: false, inGalaxy: false },
    transition: (state, value) => {
      if (!state.reading) {
        return { mask: state.mask, reading: true, inGalaxy: value === code.value };
      }
      if (!state.inGalaxy) return { mask: state.mask, reading: false, inGalaxy: false };
      if (value > 9) return undefined;
      const bit = 1 << (value - 1);
      if (state.mask & bit) return undefined;
      return { mask: state.mask | bit, reading: false, inGalaxy: false };
    },
    accept: (state) => {
      if (state.reading) return false;
      const digits = digitsOfMask(state.mask);
      const consecutive = digits.length > 0 &&
        digits[digits.length - 1] - digits[0] + 1 === digits.length;
      return galaxy.renban ? digits.length >= 2 && consecutive
        : digits.length === 1 || !consecutive;
    },
  }, geometry);
  return [new NFA(machine, `galaxy-${index + 1}-contents`,
    ...zones[index].flatMap(cell => [code.layer.at(cell), cell]))];
});

return [
  shape,
  vg.toVar('galaxy labels 1-15'),
  vh.toVar('galaxy labels 16-19'),
  new Given('R9C1', 7),
  digitDomain,
  ...codeDomains,
  ...labelDomains,
  ...symmetry,
  ...connectivity,
  ...galaxyContents,
];
