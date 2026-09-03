// Title: Nurikabe Sight Lines
// Author: Blobz
// Video: https://www.youtube.com/watch?v=LSSStVjLfvc
// Source: https://sudokupad.app/blobz/nurikabe-sight-lines

// Rules encoded, in full:
//  - Normal Sudoku.
//  - Every cell is either an island cell or a waterway cell. The islands are
//    the orthogonally connected groups of island cells; each holds exactly one
//    circled cell, and the digit in that circle is the number of cells in the
//    island.
//  - The waterway is a single orthogonally connected group of cells.
//  - Every caged cell is a waterway cell, and its digit is the number of
//    waterway cells seen orthogonally from it, itself included, with island
//    cells (and the grid edge) blocking the view.
//  - No 2x2 area of the grid is entirely waterway.
// Nothing is omitted. "The islands are surrounded by a waterway" is read as
// naming the complement of the islands -- the rules give the waterway its own
// connectivity clause in the same sentence and never say an island may not
// reach the grid edge.

// Neither the islands nor the waterway are drawn, so a label overlay carries
// them: one extra cell per grid cell, holding 1..10 for "in the island of
// circle n" (circles numbered in reading order) or WATER. Eleven values need a
// widened alphabet, so the grid cells are restricted back to 1..9.
const WATER = 11;
const shape = new Shape('9x9', WATER);
const graph = cellGraph(shape);
const label = graph.makeOverlay('VL');
const gridCells = graph.cells();
const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Drawn data: the ten circles, in reading order, with the digit each one is
// given. Every circle already carries its given digit, so each island's cell
// count is the constant listed here.
const CIRCLES = [
  { cell: 'R1C5', size: 4 },
  { cell: 'R1C9', size: 2 },
  { cell: 'R2C2', size: 1 },
  { cell: 'R3C4', size: 3 },
  { cell: 'R4C2', size: 3 },
  { cell: 'R4C9', size: 4 },
  { cell: 'R6C6', size: 4 },
  { cell: 'R6C9', size: 5 },
  { cell: 'R8C1', size: 2 },
  { cell: 'R9C5', size: 5 },
];

// Drawn data: the eighteen cages, every one of them a single cell carrying no
// cage total. They are the sight-line clues; none holds a given digit.
const CAGED = [
  'R1C1', 'R2C6', 'R2C8', 'R2C9', 'R3C1', 'R3C3', 'R4C4', 'R5C5', 'R5C7',
  'R5C8', 'R6C1', 'R6C2', 'R7C9', 'R8C2', 'R8C6', 'R9C3', 'R9C8', 'R9C9',
];

// Drawn data: the eleven given digits. Ten sit in the circles above; R8C7
// carries no marker.
const GIVENS = [
  ['R1C5', 4], ['R1C9', 2], ['R2C2', 1], ['R3C4', 3], ['R4C2', 3],
  ['R4C9', 4], ['R6C6', 4], ['R6C9', 5], ['R8C1', 2], ['R8C7', 8],
  ['R9C5', 5],
];

// Two orthogonally adjacent island cells are always in the same island, so
// distinct labels never share an edge. With this holding on every orthogonal
// pair, the label classes are exactly the orthogonally connected components of
// the island cells.
const separationKey = Pair.fnToKey(
  (a, b) => a === b || a === WATER || b === WATER, shape);

// A 2x2 block reads its four labels; four WATER is rejected.
const no2x2Spec = NFA.encodeSpec({
  startState: 0,
  transition: (waterSoFar, value) => {
    const count = waterSoFar + (value === WATER ? 1 : 0);
    return count === 4 ? undefined : count;
  },
  accept: () => true,
}, shape);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));

// One machine per caged cell: its own digit is the first segment, then each of
// the four rays away from it in turn, read over the label overlay. `target` is
// the caged digit, `count` the waterway cells seen so far along the rays, and
// `blocked` records that the current ray has already met an island cell, so
// nothing beyond it is visible. The break between segments starts the next ray
// with sight restored. The caged cell counts itself and is pinned to WATER
// below, so the rays must supply exactly `target - 1` cells; passing that is a
// dead branch, which also bounds `count`.
const sightSpec = NFA.encodeSpec({
  startState: { target: 0, count: 0, blocked: false },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      return { target: state.target, count: state.count, blocked: false };
    }
    if (state.target === 0) return { target: value, count: 0, blocked: false };
    if (state.blocked || value !== WATER) {
      return { target: state.target, count: state.count, blocked: true };
    }
    const count = state.count + 1;
    if (count >= state.target) return undefined;
    return { target: state.target, count: count, blocked: false };
  },
  accept: (state) => state.target !== 0 && state.count === state.target - 1,
  maxDepth: 21,   // 17 cells (the clue and its two full lines) plus 4 breaks
}, shape, { multiSegment: true });

const RAY_DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

const sightCounts = CAGED.map(cell => new NFA(
  sightSpec, 'sight', [cell],
  ...RAY_DIRECTIONS
    .map(([dRow, dCol]) => label.at(graph.ray(cell, dRow, dCol).slice(1)))
    .filter(ray => ray.length)));

return [
  shape,
  label.toVar('island label'),
  // Grid cells hold digits; only the overlay uses the tenth and eleventh
  // values.
  graph.makeReplicate(new Given(gridCells[0], ...digits)),

  ...GIVENS.map(([cell, digit]) => new Given(cell, digit)),

  // Each circled cell names its own island; each caged cell is waterway.
  ...CIRCLES.map((circle, i) => new Given(label.at(circle.cell), i + 1)),
  ...CAGED.map(cell => new Given(label.at(cell), WATER)),

  ...[...label.rows(), ...label.columns()].map(
    line => new Pair(separationKey, 'island separation', ...line)),

  // Each island is one orthogonally connected region of its circle's size, and
  // the waterway is one orthogonally connected region.
  ...CIRCLES.map((circle, i) => new ConnectedValues('VL', i + 1, circle.size)),
  new ConnectedValues('VL', WATER),

  label.makeReplicate(
    new NFA(no2x2Spec, 'no-water-2x2',
      ...label.at(graph.block(gridCells[0], 2, 2))),
    label.at(blockOrigins)),

  ...sightCounts,
];
