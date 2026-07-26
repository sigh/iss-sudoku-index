// Title: Rapuzzle
// Author: Scojo
// Video: https://www.youtube.com/watch?v=-L9qq8cyQ5M
// Source: https://sudokupad.app/annx3u5j3p

// Normal sudoku rules apply (standard rows/columns/boxes, the ISS default).
// Anti-knight: cells a chess knight's move apart cannot repeat a digit.
// Tower: a grey tower is drawn over part of the grid; every cell it even
// partially covers is a tower cell, and every tower cell must be greater
// than each of its orthogonally adjacent non-tower cells.
// Hair: an entropic line along Rapunzel's drawn hair strand -- every 3
// consecutive cells along it (sliding window, the standard reading of
// "every group of 3 cells along a line") must hold one low digit (1-3),
// one medium (4-6), and one high (7-9).

const graph = cellGraph('9x9');

// Tower cells: read off the drawn grey underlay polygon, fractional grid
// (row, col) vertices [[8.5,2.5],[9,2.5],[9,0.5],[1.5,0.5],[0.75,1.25],
// [0,1.5],[0.75,1.75],[1.5,2.5],[8.5,2.5]]. That polygon's edges run through
// the centre-lines of C1 and C3 (not their outer borders), so it covers all
// of C2 (rows R1-R9) plus the inner half of C1 and C3 (rows R2-R9) and a
// pointed-roof sliver of R1C2 -- all counted as full tower cells per the
// rule's "even partially covers" note. A smaller, darker-grey polygon
// (rows ~R3-R4, cols within C2) is a decorative window entirely inside this
// footprint and adds no new cells.
const TOWER_CELLS = [
  'R1C2',
  'R2C1', 'R2C2', 'R2C3',
  'R3C1', 'R3C2', 'R3C3',
  'R4C1', 'R4C2', 'R4C3',
  'R5C1', 'R5C2', 'R5C3',
  'R6C1', 'R6C2', 'R6C3',
  'R7C1', 'R7C2', 'R7C3',
  'R8C1', 'R8C2', 'R8C3',
  'R9C1', 'R9C2', 'R9C3',
];
const towerSet = new Set(TOWER_CELLS);

// Derive the tower's boundary pairs from the cell list above rather than
// hand-listing them: every orthogonal neighbour of a tower cell that is
// itself not a tower cell must be smaller than it.
const towerBoundary = TOWER_CELLS.flatMap(cell =>
  graph.neighbours(cell)
    .filter(n => !towerSet.has(n))
    .map(n => new GreaterThan(cell, n)));

// Hair path: the drawn yellow strand is a freehand curve in pixel space, not
// grid-aligned waypoints. Calibrated at 64px/cell (the only common cell size
// whose lattice error is low and whose path stays fully in-grid), its
// cubic-bezier arc-length occupancy per cell is cleanly bimodal (every real
// cell >= 0.58 cell-widths, every corner graze <= 0.03), giving these 12
// real cells, read start-to-end per the rules' "Rapunzel's hair begins in
// row 4 column 2" (a decode aid pinning which end of the curl-heavy
// artwork is the start; a sliding window is direction-symmetric, so it
// does not affect the constraint either way). The strand draws two small
// ringlets (each briefly grazes one cell's corner before its long dwell in
// the next cell, then doubles back): near R5C3/R5C4, and again near
// R8C6/R7C6/R8C6, so R8C6 is crossed twice -- a short corner-clip right
// after R8C5, then its real, much longer dwell after R7C6. Ordering by
// each cell's dominant (longest) dwell along the curve, not by first
// touch, places R8C6 after R7C6.
const HAIR_PATH = [
  'R4C2', 'R4C3', 'R4C4',
  'R5C3', 'R5C4', 'R6C3',
  'R7C4', 'R8C5', 'R7C6',
  'R8C6', 'R8C7', 'R9C8',
];

return [
  new Shape('9x9'),
  new Given('R1C5', 2),
  new AntiKnight(),
  ...towerBoundary,
  new Entropic(...HAIR_PATH),
];
