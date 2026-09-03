// Title: The Hardest Sudoku Ever
// Author: Matyas Martinka
// Video: https://www.youtube.com/watch?v=u9XWZfwWGUs
// Source: https://cracking-the-cryptic.web.app/sudoku/H9Jr7gQHtm

// Partial encoding. The grid has no given digits at all; every clue is one of
// the 33 drawn arrows, read against a water/land colouring the solver must find.
// The colouring lives in the VS overlay, WATER = 1 and LAND = 2.
//
// Encoded here:
//  - Normal sudoku (the solver's own row/column/box rules).
//  - Each cell is water or land.
//  - An arrow cell's digit counts the cells of the arrow cell's own colour
//    along the ray running from the arrow to the grid edge in the arrow's
//    direction, excluding the arrow cell itself; those cells need not be
//    contiguous. Arrows are not exhaustive, so an unmarked cell has no
//    counting rule.
//  - The water cells form a single orthogonally connected region.
//  - No 2x2 area is entirely water.
//  - Every land cell belongs to an island: an orthogonally connected group of
//    at least three land cells. Diagonal contact does not join two islands.
//
// Omitted: "land cells forming any island must contain different digits" is
// encoded only for the land groups of at most three cells, which is where it
// bites locally. Two land cells in one island that are joined only through a
// longer land path are left unconstrained.

const WATER = 1;
const LAND = 2;

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const shade = graph.makeOverlay('VS');

const STEP = { U: [-1, 0], D: [1, 0], L: [0, -1], R: [0, 1] };

// The 33 drawn arrows: the cell each one sits in, and the neighbour its half-cell
// stroke points at.
const arrows = [
  ['R1C1', 'D'], ['R1C2', 'R'], ['R1C4', 'D'], ['R1C6', 'D'], ['R1C8', 'D'],
  ['R1C9', 'D'], ['R2C1', 'R'], ['R2C2', 'D'], ['R2C8', 'D'], ['R2C9', 'L'],
  ['R3C6', 'R'], ['R4C1', 'D'], ['R4C2', 'D'], ['R4C5', 'U'], ['R4C8', 'D'],
  ['R4C9', 'U'], ['R5C6', 'L'], ['R6C1', 'R'], ['R6C2', 'R'], ['R6C5', 'D'],
  ['R6C8', 'L'], ['R6C9', 'L'], ['R7C4', 'U'], ['R7C6', 'R'], ['R8C1', 'R'],
  ['R8C7', 'U'], ['R8C9', 'L'], ['R9C1', 'U'], ['R9C2', 'U'], ['R9C4', 'U'],
  ['R9C6', 'U'], ['R9C8', 'L'], ['R9C9', 'U'],
];

// The colouring is a free two-valued choice on every cell.
const colouring = [
  shade.toVar('shade'),
  shade.makeReplicate(new Given(shade.cells()[0], WATER, LAND)),
];

// One machine per arrow, reading [digit, arrow cell's colour, ray colours...].
// The first symbol fixes the count the ray must produce, the second fixes which
// colour is being counted, and the rest count matches, dying as soon as the
// count passes the target so the state stays bounded. Only colour values reach
// the machine after the first symbol, so anything else is a dead branch.
const arrowSpec = NFA.encodeSpec({
  startState: { target: null, colour: null, count: 0 },
  transition: ({ target, colour, count }, value) => {
    if (target === null) return { target: value, colour: null, count: 0 };
    if (value !== WATER && value !== LAND) return undefined;
    if (colour === null) return { target, colour: value, count: 0 };
    const next = count + (value === colour ? 1 : 0);
    return next > target ? undefined : { target, colour, count: next };
  },
  accept: ({ count, target }) => count === target,
  maxDepth: 10,   // digit + own colour + at most 8 ray cells
}, shape);

const arrowCounts = arrows.map(([cell, dir]) => {
  const [dRow, dCol] = STEP[dir];
  const ray = graph.ray(cell, dRow, dCol).slice(1);   // drop the arrow cell
  return new NFA(arrowSpec, `count ${dir}`, cell, shade.at(cell), ...shade.at(ray));
});

const waterIsOneRegion = new ConnectedValues('VS', WATER);

const noWater2x2 = graph.cells()
  .map(cell => graph.block(cell, 2, 2))
  .filter(block => block)
  .map(block => new ContainAtLeast(String(LAND), ...shade.at(block)));

// A land cell with no land neighbour is an island of one.
const noLoneLand = graph.cells().map(cell => new Or([
  new Given(shade.at(cell), WATER),
  new ContainAtLeast(String(LAND), ...shade.at(graph.neighbours(cell))),
]));

// Two adjacent land cells are an island of two exactly when neither has any
// other land neighbour, so at least one of them must have one.
const adjacentPairs = graph.cells().flatMap(
  cell => [graph.step(cell, 0, 1), graph.step(cell, 1, 0)]
    .filter(other => other).map(other => [cell, other]));

const noLandDomino = adjacentPairs.map(([a, b]) => new Or([
  new Given(shade.at(a), WATER),
  new Given(shade.at(b), WATER),
  new ContainAtLeast(
    String(LAND), ...shade.at(graph.neighbours(a).filter(c => c !== b))),
  new ContainAtLeast(
    String(LAND), ...shade.at(graph.neighbours(b).filter(c => c !== a))),
]));

// The island digit rule, for islands of at most three cells. Orthogonally
// adjacent cells and cells three apart in a line already share a row or a
// column, so the sudoku rules cover every land group of two or three except
// the bent one: a diagonal pair joined through one of its two elbow cells.
// Those pairs matter only across a box boundary; inside a box the box rule
// already separates them.
const boxOf = new Map(graph.boxes().flatMap(
  (box, index) => box.map(cell => [cell, index])));

const bentTriples = graph.cells().flatMap(a => [1, -1].flatMap(dCol => {
  const b = graph.step(a, 1, dCol);
  if (!b || boxOf.get(a) === boxOf.get(b)) return [];
  return [graph.step(a, 0, dCol), graph.step(a, 1, 0)].map(elbow => [a, elbow, b]);
}));

const smallIslandDigits = bentTriples.map(([a, elbow, b]) => new Or([
  new Given(shade.at(a), WATER),
  new Given(shade.at(elbow), WATER),
  new Given(shade.at(b), WATER),
  new AllDifferent(a, b),
]));

return [
  shape,
  ...colouring,
  ...arrowCounts,
  waterIsOneRegion,
  ...noWater2x2,
  ...noLoneLand,
  ...noLandDomino,
  ...smallIslandDigits,
];
