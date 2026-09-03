// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=CZV8IrlxHOs
// Source: https://cracking-the-cryptic.web.app/sudoku/hg764Pd67f

// Normal sudoku rules apply; the grid has no given digits.
//
// Every cell is coloured blue (water) or green (land). This is the VS overlay:
// WATER and LAND below.
//
// Arrow cells: the digit in a cell holding an arrow counts the cells in that
// arrow's direction, from the arrow cell to the grid edge, that share the arrow
// cell's colour. The arrow cell itself is not counted and the counted cells need
// not be contiguous with it. Not all arrows are given, so an unmarked cell
// carries no count clue -- there is nothing to encode for the undrawn positions.
//
// The water cells form a single orthogonally connected region, and no 2x2 area
// is entirely water.
//
// An island is an orthogonally connected group of at least 3 land cells; every
// land cell belongs to one. ("Islands may touch each other diagonally" adds no
// constraint: diagonal contact never joins two islands under orthogonal
// connectivity.)
//
// OMITTED: "Land cells forming any island must contain different digits" is not
// encoded in general. Only the fragment that a single cell certifies is encoded
// below: when two cells a diagonal step apart and one of their two common
// orthogonal neighbours are all three land, the three lie in one island, so the
// two cells must differ. The general rule needs a per-cell island-identity
// overlay and one comparison per cell pair.

const WATER = 1;
const LAND = 2;

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const shade = graph.makeOverlay('VS');

// Arrow cell and direction for each drawn arrow: every arrow is drawn from a
// cell centre to the midpoint of one of that cell's four edges.
const arrows = [
  ['R1C2', 'down'], ['R1C3', 'left'], ['R1C4', 'left'], ['R1C8', 'left'],
  ['R2C4', 'left'],
  ['R3C2', 'right'], ['R3C4', 'left'], ['R3C5', 'right'], ['R3C7', 'up'],
  ['R3C9', 'up'],
  ['R4C2', 'left'], ['R4C6', 'down'], ['R4C8', 'left'],
  ['R5C1', 'down'], ['R5C2', 'down'], ['R5C4', 'down'],
  ['R6C1', 'right'], ['R6C3', 'up'], ['R6C9', 'left'],
  ['R7C1', 'down'], ['R7C6', 'up'], ['R7C8', 'up'],
  ['R8C3', 'left'], ['R8C7', 'up'],
  ['R9C1', 'right'], ['R9C2', 'up'], ['R9C4', 'right'], ['R9C7', 'left'],
  ['R9C8', 'left'],
];

const STEPS = {
  up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1],
};

// Reads the arrow cell's digit, then the arrow cell's colour, then the colours
// of the ray cells. `count` tallies ray cells matching the arrow cell's colour
// and dead branches are dropped as soon as it passes the digit, so the state
// stays bounded. The scan is at most 2 + 8 cells long.
const arrowSpec = NFA.encodeSpec({
  startState: { digit: null, colour: null, count: 0 },
  transition: ({ digit, colour, count }, value) => {
    if (digit === null) return { digit: value, colour: null, count: 0 };
    if (colour === null) return { digit, colour: value, count: 0 };
    const next = count + (value === colour ? 1 : 0);
    return next > digit ? undefined : { digit, colour, count: next };
  },
  accept: ({ digit, colour, count }) => colour !== null && count === digit,
  maxDepth: 10,
}, shape);

const arrowCounts = arrows.map(([cell, direction]) => {
  const [dR, dC] = STEPS[direction];
  const ray = graph.ray(cell, dR, dC).slice(1);  // ray() includes the arrow cell
  return new NFA(
    arrowSpec, `${direction} same-colour count`,
    cell, shade.at(cell), ...shade.at(ray));
});

// No 2x2 area is entirely water: at least one cell of each 2x2 block is land.
const blockTopLefts = graph.cells().filter(c => graph.block(c, 2, 2) !== null);
const noWaterSquare = shade.makeReplicate(
  new Or(graph.block('R1C1', 2, 2).map(c => new Given(shade.at(c), LAND))),
  shade.at(blockTopLefts));

const orthogonalPairs = graph.cells().flatMap(
  cell => [graph.step(cell, 0, 1), graph.step(cell, 1, 0)]
    .filter(other => other !== null)
    .map(other => [cell, other]));

// Every land cell is in an island of at least 3 cells. A land component is
// smaller than 3 exactly when it is a lone land cell, or two adjacent land
// cells whose only land neighbours are each other, so the rule is these two
// forbidden neighbourhoods.
const noLoneLand = graph.cells().map(cell => new Or([
  new Given(shade.at(cell), WATER),
  ...graph.neighbours(cell).map(n => new Given(shade.at(n), LAND))]));

const noLandDomino = orthogonalPairs.map(([a, b]) => new Or([
  new Given(shade.at(a), WATER),
  new Given(shade.at(b), WATER),
  ...graph.neighbours(a).filter(n => n !== b).map(
    n => new Given(shade.at(n), LAND)),
  ...graph.neighbours(b).filter(n => n !== a).map(
    n => new Given(shade.at(n), LAND))]));

// Fragment of the island-distinctness rule (see OMITTED above). Two cells a
// diagonal step apart have two common orthogonal neighbours; if a common
// neighbour and both cells are land then all three are in one island, so the
// two cells differ. Pairs inside one box are dropped: sudoku already separates
// them.
const differentDigits = Pair.fnToKey((a, b) => a !== b, shape);
const boxOf = cell => {
  const { row, col } = parseCellId(cell);
  return `${Math.ceil(row / 3)}.${Math.ceil(col / 3)}`;
};

const diagonalPairs = graph.cells().flatMap(
  cell => [graph.step(cell, 1, 1), graph.step(cell, 1, -1)]
    .filter(other => other !== null && boxOf(other) !== boxOf(cell))
    .map(other => [cell, other]));

const islandDigitsDifferL = diagonalPairs.flatMap(([a, b]) => {
  const bNeighbours = new Set(graph.neighbours(b));
  return graph.neighbours(a).filter(n => bNeighbours.has(n)).map(
    corner => new Or([
      new Given(shade.at(a), WATER),
      new Given(shade.at(b), WATER),
      new Given(shade.at(corner), WATER),
      new Pair(differentDigits, 'different digits', a, b)]));
});

return [
  shape,
  shade.toVar('water / land'),
  shade.makeReplicate(new Given(shade.at('R1C1'), WATER, LAND)),
  ...arrowCounts,
  new ConnectedValues('VS', WATER),
  noWaterSquare,
  ...noLoneLand,
  ...noLandDomino,
  ...islandDigitsDifferL,
];
