// Title: Messier 43
// Author: Memeristor ('purpl')
// Video: https://www.youtube.com/watch?v=4PiIYSSzjW0
// Source: https://app.crackingthecryptic.com/sudoku/ThQmPfrLmT

// Normal sudoku rules apply.
//
// Every drawn dot is the centre of a "galaxy": a non-empty, orthogonally
// connected set of cells carried onto itself by the 180-degree rotation about
// that dot. Galaxies do not overlap, and a cell need not belong to any galaxy.
// Each galaxy is a Region Sum Area: the digits it holds inside each 3x3 box it
// visits sum to the same total, that total being the galaxy's own, and it
// visits more than one box.
//
// Two things the rules text leaves open, with the ground for the reading taken:
//  - "Rotationally symmetric" is read as 180 degrees. The galaxy worked through
//    in the rules text -- r6c6, r5c6, r5c7, r4c7, r4c8, r3c8 -- has that
//    symmetry and no other.
//  - A galaxy holds the cell or cells its dot is drawn on. That same worked
//    example does: it is centred on the border between r4c7 and r5c7 and holds
//    both of them. Symmetry with connectivity alone would also allow a ring
//    around the dot that leaves the dot's own cells out of the galaxy.
//
// Model. One Var overlay per galaxy, laid over just the cells whose 180-degree
// image about that dot is still on the grid; that set is the rectangle centred
// on the dot, which is what keeps the twelve layers to 259 cells in total. An
// overlay cell holds 0 when its grid cell is outside the galaxy and otherwise
// repeats the grid cell's digit, so a galaxy's total in a box is the plain sum
// of its overlay values there. Digit 0 is therefore part of the alphabet, and
// every grid cell is restricted back to 1-9.

// Each dot as the cell or cells it is drawn on: a dot centred in a cell, on the
// border between two cells, or on the corner where four meet. Read off the
// drawn dot positions in reading order.
const DOTS = [
  ['R1C6'],
  ['R2C9', 'R3C9'],
  ['R2C2', 'R3C2'],
  ['R3C4'],
  ['R4C1', 'R5C1'],
  ['R4C4', 'R4C5', 'R5C4', 'R5C5'],
  ['R4C7', 'R5C7'],
  ['R6C7'],
  ['R7C9'],
  ['R7C4', 'R7C5', 'R8C4', 'R8C5'],
  ['R8C6', 'R8C7', 'R9C6', 'R9C7'],
  ['R9C3'],
];

// Drawn givens.
const GIVENS = [['R2C5', 4], ['R9C1', 3]];

const OUTSIDE = 0;                                  // overlay value: not in the galaxy
const INSIDE = [1, 2, 3, 4, 5, 6, 7, 8, 9];         // overlay value: the cell's digit
const MAX_BOX_SUM = 45;                             // nine distinct digits in a box

const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);

// Doubled coordinates, so a dot on a border or a corner still has an integer
// centre: the image of (row, col) under the rotation is (row2 - row, col2 - col).
const galaxies = DOTS.map((dotCells, index) => {
  const dotRowCols = dotCells.map(parseCellId);
  const row2 = dotRowCols.reduce((a, p) => a + p.row, 0) * 2 / dotCells.length;
  const col2 = dotRowCols.reduce((a, p) => a + p.col, 0) * 2 / dotCells.length;
  const inGrid = n => n >= 1 && n <= 9;
  const rows = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(r => inGrid(row2 - r));
  const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(c => inGrid(col2 - c));
  const cells = rows.flatMap(r => cols.map(c => makeCellId(r, c)));
  const prefix = 'V' + String.fromCharCode('A'.charCodeAt(0) + index);

  return {
    dotCells,
    cells,
    overlay: graph.makeOverlay(prefix, cells),
    // The layer is declared with the rectangle's dimensions so that its own
    // adjacency -- which is what ConnectedValues walks -- matches the grid's.
    varConstraint: new Var(
      prefix.slice(1), `g${index + 1}`, `${rows.length}x${cols.length}`),
    prefix,
    rotate: cell => {
      const { row, col } = parseCellId(cell);
      return makeCellId(row2 - row, col2 - col);
    },
  };
});

// An overlay cell either sits out (0) or copies its grid cell's digit.
const maskKey = Pair.fnToKey(
  (mask, digit) => mask === OUTSIDE || mask === digit, shape);
// Membership is preserved by the rotation about the dot.
const symmetryKey = Pair.fnToKey(
  (a, b) => (a === OUTSIDE) === (b === OUTSIDE), shape);
// No cell is in two galaxies at once.
const disjointKey = Pair.fnToKey(
  (a, b) => a === OUTSIDE || b === OUTSIDE, shape);

// Scans one galaxy's overlay, one segment per 3x3 box it can reach. `total` is
// the sum the galaxy must make in every box it visits, unset until the first
// visited box closes; `sum` accumulates inside the box being read; `boxes`
// counts the boxes visited, saturating at two, since "more than one" is all the
// rule asks. A box with sum 0 holds none of the galaxy and is not a visit.
const regionSumSpec = {
  startState: { total: null, sum: 0, boxes: 0 },
  transition({ total, sum, boxes }, value) {
    if (value === SEGMENT_BREAK) {
      if (sum === 0) return { total, sum: 0, boxes };
      if (total === null) return { total: sum, sum: 0, boxes: 1 };
      if (sum !== total) return undefined;
      return { total, sum: 0, boxes: Math.min(boxes + 1, 2) };
    }
    const newSum = sum + value;
    if (newSum > (total === null ? MAX_BOX_SUM : total)) return undefined;
    return { total, sum: newSum, boxes };
  },
  // accept runs on the final state only, so the last box is closed here.
  accept({ total, sum, boxes }) {
    if (sum === 0) return boxes >= 2;
    return (total === null || sum === total) && boxes + 1 >= 2;
  },
};
const regionSumNFA = NFA.encodeSpec(regionSumSpec, shape, { multiSegment: true });

const galaxyConstraints = galaxies.flatMap((galaxy, index) => {
  const { cells, overlay, rotate } = galaxy;
  const name = `galaxy${index + 1}`;
  const cellSet = new Set(cells);
  const boxSegments = graph.boxes()
    .map(box => box.filter(cell => cellSet.has(cell)).map(cell => overlay.at(cell)))
    .filter(segment => segment.length > 0);

  return [
    new ConnectedValues(galaxy.prefix, INSIDE),
    ...cells.map(cell => new Pair(maskKey, name, overlay.at(cell), cell)),
    // One constraint per rotation-swapped pair; a cell fixed by the rotation
    // (the dot's own cell) is its own image and needs none.
    ...cells.filter((cell, i) => cells.indexOf(rotate(cell)) > i)
      .map(cell => new Pair(symmetryKey, name, overlay.at(cell), overlay.at(rotate(cell)))),
    ...galaxy.dotCells.map(cell => new Given(overlay.at(cell), ...INSIDE)),
    new NFA(regionSumNFA, name, ...boxSegments),
  ];
});

const disjointness = graph.cells().flatMap(cell => {
  const overlayCells = galaxies
    .map(galaxy => galaxy.overlay.at(cell))
    .filter(overlayCell => overlayCell !== null);
  return overlayCells.flatMap((a, i) => overlayCells.slice(i + 1)
    .map(b => new Pair(disjointKey, 'disjoint', a, b)));
});

return [
  shape,
  // The alphabet carries 0 for the overlays; the grid itself is 1-9.
  graph.makeReplicate(new Given(graph.cells()[0], ...INSIDE)),
  ...galaxies.map(galaxy => galaxy.varConstraint),
  ...GIVENS.map(([cell, digit]) => new Given(cell, digit)),
  ...galaxyConstraints,
  ...disjointness,
];
