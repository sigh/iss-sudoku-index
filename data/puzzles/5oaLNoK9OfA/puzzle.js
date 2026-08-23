// Title: Cracking The Witness
// Author: Ricky Cruz
// Video: https://www.youtube.com/watch?v=5oaLNoK9OfA
// Source: https://app.crackingthecryptic.com/sudoku/p9ttmLjQ4T
//
// Normal sudoku rules apply (Shape('9x9') defaults: rows, columns, boxes all
// differ).
//
// A path runs along the grey lattice (raw lines #17-#25) from R9C1 (lower
// left) to R1C9 (top right): the lattice is every cell in rows {1,3,5,7,9} or
// columns {1,3,5,7,9} -- 25 "node" cells (row and column both odd) joined by
// 40 "edge" cells (exactly one of row/column odd) that each sit between two
// adjacent nodes. The 16 cells with neither row nor column odd never lie on
// the lattice. Modelled as a loop-style membership Var restricted to the
// lattice, closed by ConnectedValues + a degree profile: 1 at the two
// endpoints, 0 or 2 elsewhere. An edge cell has only its two flanking nodes as path
// neighbours, so its degree-2 requirement when on-path already forces both
// flanking nodes on-path too -- no separate no-self-touch check is needed
// (unlike a loop over the full grid, this lattice has no cell that is
// orthogonally adjacent to two path cells without being adjacent to their
// shared node).
//
// A hexagon mark (raw overlays #0-#7) sits on an edge cell and requires its
// two flanking node digits to be in 1:2 ratio ("the digits before and after
// [it] along the path"). The rules force the path through every hexagon, and
// an edge cell's only possible path-neighbours are its two flanking nodes, so
// the ratio applies to that fixed pair regardless of the rest of the route.
//
// Omitted: the red-square rule (colour every off-lattice cell by its digit's
// parity; the path must split the grid so that every region's red squares
// share one colour). No documented ISS technique classifies which side of an
// *open* path (endpoints on the grid boundary, not a closed loop) a cell
// falls on.

const graph = cellGraph('9x9');
const gridCells = graph.cells();

const isNode = cell => {
  const { row, col } = parseCellId(cell);
  return row % 2 === 1 && col % 2 === 1;
};
const isLattice = cell => {
  const { row, col } = parseCellId(cell);
  return row % 2 === 1 || col % 2 === 1;
};

const ON = 1;
const OFF = 2;

const path = graph.makeOverlay('VP');
const geometry = graph.gridGeometry();

const START = 'R9C1';
const END = 'R1C9';

// Hexagon-marked cells, raw overlays #0-#7.
const hexes = ['R9C2', 'R7C2', 'R5C4', 'R4C5', 'R2C5', 'R7C8', 'R9C8', 'R9C6'];

const originCell = path.cells()[0];
const membership = [
  path.makeReplicate(new Given(originCell, ON, OFF)),
  ...gridCells.filter(c => !isLattice(c)).map(c => new Given(path.at(c), OFF)),
  new Given(path.at(START), ON),
  new Given(path.at(END), ON),
  ...hexes.map(c => new Given(path.at(c), ON)),
];

// Degree machine: reads a cell's own membership, then its orthogonal
// neighbours'. `target` on-path neighbours are required when the cell itself
// is on-path; off cells are unconstrained.
const degreeMachine = target => NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, membership) => {
    if (phase === 'start') {
      return membership === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (membership === ON ? 1 : 0);
    return count > target ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === target,
}, geometry.numValues);
const degreeEndpoint = degreeMachine(1);
const degreeThrough = degreeMachine(2);

const degrees = gridCells.filter(isLattice).map(cell => new NFA(
  (cell === START || cell === END) ? degreeEndpoint : degreeThrough,
  'path-degree',
  ...path.at([cell, ...graph.neighbours(cell)]),
));

// Ratio: a hexagon's two flanking nodes (its only lattice neighbours) must
// have digits in 1:2 ratio.
const flankingNodes = cell => {
  const { row, col } = parseCellId(cell);
  return isNode(makeCellId(row, col - 1)) || isNode(makeCellId(row, col + 1))
    ? [makeCellId(row, col - 1), makeCellId(row, col + 1)]
    : [makeCellId(row - 1, col), makeCellId(row + 1, col)];
};
const ratioKey = Pair.fnToKey((a, b) => a === 2 * b || b === 2 * a, 9);
const ratios = hexes.map(cell => {
  const [a, b] = flankingNodes(cell);
  return new Pair(ratioKey, 'hexagon 1:2 ratio', a, b);
});

return [
  new Shape('9x9'),
  new Given('R3C4', 3),
  new Given('R3C6', 7),
  new Given('R4C9', 7),
  new Given('R5C1', 1),
  new Given('R5C2', 7),
  new Given('R5C8', 6),
  new Given('R5C9', 3),
  new Given('R6C1', 9),
  new Given('R7C4', 2),
  new Given('R7C6', 9),
  path.toVar('path'),
  ...membership,
  new ConnectedValues('VP', ON),
  ...degrees,
  ...ratios,
];
