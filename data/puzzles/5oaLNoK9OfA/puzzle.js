// Title: Cracking The Witness
// Author: Ricky Cruz
// Video: https://www.youtube.com/watch?v=5oaLNoK9OfA
// Source: https://app.crackingthecryptic.com/sudoku/p9ttmLjQ4T

// Rules:
//   Normal sudoku rules apply. Draw a path along the grey lines from the
//   lower-left to the top-right that goes through all hexagon cells. Hexagon
//   cells indicate that the digits before and after them along the path have a
//   1:2 ratio. Red squares must be coloured depending on their odd/even
//   parity. The path must separate the red cells such that all red cells in
//   each region are the same colour. It is NOT REQUIRED that red cells in
//   adjacent regions be of different colour.
//
// Geometry of the grey lines: they are the five full rows 1, 3, 5, 7, 9 and
// the five full columns 1, 3, 5, 7, 9, so they draw a 5x5 lattice whose
// vertices are the cells with two odd coordinates ("nodes") and whose edges
// each run through one cell with exactly one even coordinate ("links"). The
// 16 cells with two even coordinates are the red squares, one inside each face
// of the lattice. The path therefore occupies whole cells: node, link, node,
// ... The grey circle drawn in R9C1 is the lower-left start; the top-right end
// is R1C9.
//
// A red square's colour is fixed by its digit's parity, so no colour variable
// is needed: "same colour" is "same parity".
//
// The ambiguous clause is the hexagon ratio. "Before and after" names the two
// cells (a link's only path neighbours are its two nodes); "have a 1:2 ratio"
// is the standard Kropki-black wording for an unordered pair, so the encoding
// takes it unordered - see notes.

const ON = 1;   // path-membership values, held in the VP cells
const OFF = 2;

const graph = cellGraph('9x9');
const shape = new Shape('9x9');
const geometry = graph.gridGeometry();

// One path-membership Var cell per grid cell (VP1..VP81, in grid order).
const path = graph.makeOverlay('VP');

const isOdd = n => n % 2 === 1;
const kindOf = cell => {
  const { row, col } = parseCellId(cell);
  if (isOdd(row) && isOdd(col)) return 'node';
  if (isOdd(row) || isOdd(col)) return 'link';
  return 'square';
};
const nodes = graph.cells().filter(cell => kindOf(cell) === 'node');
const squares = graph.cells().filter(cell => kindOf(cell) === 'square');

const START = 'R9C1';   // lower-left lattice corner, marked by the grey circle
const END = 'R1C9';     // top-right lattice corner

// The eight hexagon overlays, each drawn in a link cell.
const hexagons = [
  'R2C5', 'R4C5', 'R5C4', 'R7C2', 'R7C8', 'R9C2', 'R9C6', 'R9C8',
];

// Given digits, as printed in the grid.
const givens = [
  ['R3C4', 3], ['R3C6', 7],
  ['R4C9', 7],
  ['R5C1', 1], ['R5C2', 7], ['R5C8', 6], ['R5C9', 3],
  ['R6C1', 9],
  ['R7C4', 2], ['R7C6', 9],
];

// --- Path membership: every cell is on (1) or off (2) the path. ---
const membership = [
  path.makeReplicate(new Given(path.cells()[0], ON, OFF)),
  // The path follows the grey lines, so it never enters a face of the lattice.
  ...squares.map(cell => new Given(path.at(cell), OFF)),
  // It starts at the lower-left corner and ends at the top-right one, and it
  // passes through every hexagon.
  ...[START, END, ...hexagons].map(cell => new Given(path.at(cell), ON)),
];

// --- Path shape, stated at the lattice nodes. ---
// Every grid neighbour of a node cell is a link cell, so the number of links
// the path uses at a node is the number of ON cells among those neighbours.
// A node the path visits uses two links (one at either end of the path); a
// node it does not visit uses none. With membership values ON = 1 and OFF = 2,
// a neighbour contributes 2 when off and 1 when on, so for k neighbours
//   usedLinks = 2k - sum(neighbours),
// and the requirement usedLinks = degree * (2 - VP[node]) rearranges to the
// linear form below.
const degrees = nodes.map(cell => {
  const neighbours = graph.neighbours(cell);
  const degree = (cell === START || cell === END) ? 1 : 2;
  return new Sum(
    2 * neighbours.length - 2 * degree,
    ...path.at(neighbours),
    [path.at(cell), -degree]);
});

// The path is a single connected route: with the node degrees above, the ON
// cells have degree 2 everywhere except one at each of R9C1 and R1C9, so
// requiring them to form one orthogonally-connected region makes them exactly
// one simple path between those two corners and excludes any separate loop.
const singlePath = new ConnectedValues('VP', ON);

// --- Hexagons: the digits either side of a hexagon are in a 1:2 ratio. ---
const ratioKey = Pair.fnToKey((a, b) => a === 2 * b || b === 2 * a, shape);
const ratios = hexagons.map(cell => {
  const [before, after] = graph.neighbours(cell)
    .filter(neighbour => kindOf(neighbour) === 'node');
  return new Pair(ratioKey, 'ratio', before, after);
});

// --- Separation: red squares sharing a region share a colour. ---
// Two red squares two cells apart are in the same region exactly when the path
// does not use the link between them, and every pair of squares in one region
// is joined by a chain of such unused links, so the region rule is equivalent
// to this local rule over the 24 interior links: if the link is off the path,
// the two squares it lies between have the same parity. Boundary links have a
// square on one side only and separate nothing.
const separationMachine = NFA.encodeSpec({
  // Reads the link's membership, then the two squares' digits.
  startState: { step: 0 },
  transition: ({ step, separated, parity }, value) => {
    if (step === 0) return { step: 1, separated: value === ON };
    if (step === 1) return { step: 2, separated, parity: value % 2 };
    if (separated || value % 2 === parity) return { step: 3 };
    return undefined;
  },
  accept: ({ step }) => step === 3,
}, geometry.numValues);
const separations = squares.flatMap(cell => [[0, 2], [2, 0]]
  .map(([dR, dC]) => [graph.step(cell, dR / 2, dC / 2), graph.step(cell, dR, dC)])
  .filter(([, other]) => other)
  .map(([link, other]) =>
    new NFA(separationMachine, 'separate', path.at(link), cell, other)));

return [
  shape,
  path.toVar('path'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...membership,
  ...degrees,
  singlePath,
  ...ratios,
  ...separations,
];
