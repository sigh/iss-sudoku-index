// Title: Broken Gift
// Author: Peter C Hayward
// Video: https://www.youtube.com/watch?v=mKDDqBasEMs
// Source: https://app.crackingthecryptic.com/sudoku/9jtdPrNnq4

// Standard rows/columns (1-9 once each). Regions are NOT given: the solver
// must discover nine orthogonally-connected, 9-cell regions, each holding
// 1-9 once (ChaosConstruction + NoBoxes in place of fixed 3x3 boxes).
// Cages: digits sum to the printed total and cannot repeat within a cage
// (killer-cage semantics -- Cage). Outside diagonal clues sum every cell on
// the indicated diagonal ray to the grid edge; repeats are explicitly
// allowed on that diagonal (LittleKiller semantics).
//
// "A black line in the grid always separates different regions": wherever a
// black line runs along a cell border, the two cells it separates must be
// in different discovered regions. Encoded as a two-cell AllDifferent
// between the two cells' region-label (CC) vars for every such border.
// Absence of a black line is not encoded as a constraint -- the rules only
// state what a drawn line forces, never what its absence forces.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');
const cc = graph.makeOverlay('CC');

// Cages: cell lists and totals from the drawn `cages` array.
const cages = [
  new Cage(15, 'R2C4', 'R1C4', 'R1C5'),
  new Cage(15, 'R1C6', 'R2C6'),
  new Cage(11, 'R2C5', 'R3C5'),
  new Cage(7, 'R3C7', 'R3C6'),
  new Cage(13, 'R4C7', 'R5C7'),
  new Cage(5, 'R4C6', 'R4C5'),
  new Cage(3, 'R4C4', 'R5C4'),
  new Cage(9, 'R3C4', 'R3C3'),
  new Cage(17, 'R4C3', 'R5C3', 'R6C3'),
];

// Outside diagonal-sum clues. Direction of each diagonal is read from the
// drawn arrow stroke's entry cell and travel direction (down-right,
// down-left, up-left, up-right); each ray runs to the grid edge.
const diagonals = [
  LittleKiller.fromCells(10, graph.ray('R1C7', 1, 1), geometry),
  LittleKiller.fromCells(2, graph.ray('R1C8', 1, 1), geometry),
  LittleKiller.fromCells(12, graph.ray('R7C9', 1, -1), geometry),
  LittleKiller.fromCells(4, graph.ray('R8C9', 1, -1), geometry),
  LittleKiller.fromCells(14, graph.ray('R9C3', -1, -1), geometry),
  LittleKiller.fromCells(6, graph.ray('R9C2', -1, -1), geometry),
  LittleKiller.fromCells(16, graph.ray('R3C1', -1, 1), geometry),
  LittleKiller.fromCells(8, graph.ray('R2C1', -1, 1), geometry),
];

// Region-separating black-line segments, decomposed from the payload's
// `lines` waypoints (lattice-corner edge paths along cell borders) into the
// individual grid-cell-border unit segments they cover. One of the eight
// drawn strokes traces the entire outer grid border plus one extra internal
// notch cut into the same stroke (from lattice corner [5,0] to [5,3] to
// [2,3] to [2,6]); the outer-border portion is decorative (it only borders
// "outside the grid", not a region-adjacency question) and is omitted here,
// leaving its internal notch's three segments below.
const WALLS = [
  // stroke separating R2C1|R2C2, R3C1|R3C2, R4C1|R4C2 (vertical, col1|col2)
  ['R2C1', 'R2C2'], ['R3C1', 'R3C2'], ['R4C1', 'R4C2'],
  // internal notch cut into the border-tracing stroke
  ['R5C1', 'R6C1'], ['R5C2', 'R6C2'], ['R5C3', 'R6C3'],
  ['R3C3', 'R3C4'], ['R4C3', 'R4C4'], ['R5C3', 'R5C4'],
  ['R2C4', 'R3C4'], ['R2C5', 'R3C5'], ['R2C6', 'R3C6'],
  // separates R2C4|R2C5
  ['R2C4', 'R2C5'],
  // separates R7C4|R7C5, R8C4|R8C5, R9C4|R9C5
  ['R7C4', 'R7C5'], ['R8C4', 'R8C5'], ['R9C4', 'R9C5'],
  // separates R7C2|R8C2, R7C3|R8C3, R7C4|R8C4
  ['R7C2', 'R8C2'], ['R7C3', 'R8C3'], ['R7C4', 'R8C4'],
  // separates R6C9|R7C9, R5C8|R5C9, R6C8|R6C9, R4C6|R5C6, R4C7|R5C7,
  // R4C8|R5C8, R5C5|R5C6, R6C5|R6C6, R7C5|R7C6
  ['R6C9', 'R7C9'], ['R5C8', 'R5C9'], ['R6C8', 'R6C9'],
  ['R4C6', 'R5C6'], ['R4C7', 'R5C7'], ['R4C8', 'R5C8'],
  ['R5C5', 'R5C6'], ['R6C5', 'R6C6'], ['R7C5', 'R7C6'],
  // separates R8C7|R9C7
  ['R8C7', 'R9C7'],
  // separates R3C7|R3C8
  ['R3C7', 'R3C8'],
];

// "Region labels differ" for a pair of cells is a two-cell all-different.
const wallConstraints = WALLS.map(
  ([a, b]) => new AllDifferent(cc.at(a), cc.at(b)));

return [
  new Shape('9x9'),
  new ChaosConstruction(),
  new NoBoxes(),
  ...cages,
  ...diagonals,
  ...wallConstraints,
];
