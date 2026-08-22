// Title: Red Light, Green Light
// Author: Piatato
// Video: https://www.youtube.com/watch?v=tAp89BoyUvY
// Source: https://app.crackingthecryptic.com/sudoku/8jPnpjrnr6

// Normal sudoku. Killer cages: digits sum to the printed total when one is
// given (cages 6/7/8 have no total) and never repeat within a cage --
// unconditionally, independent of the path below.
//
// The solver draws one orthogonally-connected path between the two green
// cells (R1C2, R9C1), which does not touch itself orthogonally or
// diagonally. A path cell outside every cage is "green light" and must hold
// a high digit (>=6); a path cell inside a cage is "red light" and must
// hold a low digit (<=4). Cells off the path are unconstrained by this rule.
//
// Path membership is a Var overlay (ON/OFF per grid cell), shaped into a
// single simple path by a degree machine (endpoints degree 1, other on-path
// cells degree 2) plus ConnectedValues for single-region connectivity, plus
// a no-diagonal-touch NFA over every 2x2 block. Orthogonal self-touch is
// already excluded by the degree machines: a stray orthogonal adjacency
// between non-consecutive on-path cells would push that cell's degree past
// its required value.

const shape = new Shape('9x9');
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

const ON = 1;
const OFF = 2;

// Path-membership overlay: one Var per grid cell, ON = on the path.
const path = graph.makeOverlay('VP');
const originCell = path.cells()[0];

// Green underlay cells (drawn art): the path's two endpoints.
const endpoints = ['R1C2', 'R9C1'];
const endpointSet = new Set(endpoints);

const membership = [
  path.makeReplicate(new Given(originCell, ON, OFF)),
  ...path.at(endpoints).map(cell => new Given(cell, ON)),
];

// --- Degree: an on-path endpoint has exactly 1 on-path orthogonal
// neighbour; any other on-path cell has exactly 2. Off-path cells are
// unconstrained.
function makeDegreeMachine(expected) {
  return NFA.encodeSpec({
    startState: { phase: 'start' },
    transition: ({ phase, onNeighbours }, membership) => {
      if (phase === 'start') {
        return membership === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
      }
      if (phase === 'off') return { phase: 'off' };
      const count = onNeighbours + (membership === ON ? 1 : 0);
      return count > expected ? undefined : { phase: 'on', onNeighbours: count };
    },
    accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === expected,
  }, geometry.numValues);
}
const degree1Machine = makeDegreeMachine(1);
const degree2Machine = makeDegreeMachine(2);
const degrees = gridCells.map(cell => new NFA(
  endpointSet.has(cell) ? degree1Machine : degree2Machine,
  'degree', ...path.at([cell, ...graph.neighbours(cell)])));

// --- No diagonal self-touch: forbid a 2x2 block whose only on-path cells
// are the two diagonal corners.
const noDiagonalTouchMachine = NFA.encodeSpec({
  startState: { block: [] },
  transition: ({ block }, membership) => {
    if (block === null) return { block: null };
    const next = [...block, membership === ON];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    return diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, geometry.numValues);
// Every 2x2 block is the same shifted template, so one Replicate covers all
// of them (all 64 blocks in a 9x9 grid; none are partial).
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noDiagonalTouches = path.makeReplicate(
  new NFA(noDiagonalTouchMachine, 'no-touch',
    ...path.at(graph.block(gridCells[0], 2, 2))),
  path.at(blockOrigins));

// --- Cages (drawn cell groups): sum (if printed) + distinct. Cages 6, 7, 8
// carry no printed total and are all-different only.
const cages = [
  { cells: ['R1C3', 'R2C3', 'R2C2', 'R3C2'], total: 28 },
  { cells: ['R1C6', 'R2C6', 'R2C5'], total: 18 },
  { cells: ['R2C7', 'R2C8'], total: 9 },
  { cells: ['R4C5', 'R5C5', 'R4C6'], total: 17 },
  { cells: ['R4C7', 'R5C7'], total: 8 },
  { cells: ['R4C8', 'R4C9'], total: 14 },
  { cells: ['R5C2', 'R5C3'], total: null },
  { cells: ['R7C2', 'R7C1', 'R8C1'], total: null },
  { cells: ['R6C3', 'R6C4', 'R7C4'], total: null },
  { cells: ['R8C8', 'R8C9', 'R9C9'], total: 15 },
];
const cageConstraints = cages.map(({ cells, total }) =>
  total === null ? new AllDifferent(...cells) : new Cage(total, ...cells));
const cageCells = new Set(cages.flatMap(c => c.cells));

// --- Red/green light digit rule: an on-path cage cell must be <=4, an
// on-path non-cage cell must be >=6; off-path cells are unconstrained. One
// Pair relates each cell's path-membership flag to its own digit.
const redKey = Pair.fnToKey((m, d) => m !== ON || d <= 4, shape);
const greenKey = Pair.fnToKey((m, d) => m !== ON || d >= 6, shape);
const lights = gridCells.map(cell => new Pair(
  cageCells.has(cell) ? redKey : greenKey, 'light', path.at(cell), cell));

return [
  shape,
  path.toVar('path'),
  ...membership,
  // Single path: the on-path cells form one orthogonally-connected region.
  new ConnectedValues('VP', ON),
  ...degrees,
  noDiagonalTouches,
  ...cageConstraints,
  ...lights,
  new Given('R4C4', 2),
  new Given('R7C6', 5),
];
