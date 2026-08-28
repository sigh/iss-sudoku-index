// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=5jZtG5inMPE
// Source: https://cracking-the-cryptic.web.app/sudoku/jh8B2BpF2g

// Normal Sudoku rules apply. A snake has to be drawn into the grid. The head
// and the tail of the snake are in the two cells with grey circles (R7C4 and
// R7C8). The snake may not touch itself orthogonally, but may touch itself
// diagonally. The cells without the snake form exactly eight orthogonally
// connected areas, one of each size from 1 to 8; these areas may not touch each
// other orthogonally, but may touch diagonally. An area of size n contains each
// digit from 1 to n exactly once.
//
// One Var per grid cell (VS) says what the cell is: value 9 for a snake cell,
// value n for a cell of the area of size n. The eight areas have eight distinct
// sizes, so a size names its area outright and the layer carries no
// interchangeable labels.

const SNAKE = 9;              // VS value: this cell is on the snake
const OUTSIDE = 9;            // VA..VH value: this cell is not in that area
const AREA_SIZES = [1, 2, 3, 4, 5, 6, 7, 8];
const HEAD = 'R7C4';
const TAIL = 'R7C8';

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// The eight areas take 1+2+...+8 cells, so the snake is the rest of the grid.
const SNAKE_LENGTH = gridCells.length - AREA_SIZES.reduce((a, b) => a + b, 0);

const cellRole = graph.makeOverlay('VS');

// Givens, from the drawn digits.
const givens = [
  ['R2C8', 7], ['R3C3', 1], ['R3C4', 9], ['R4C9', 8], ['R5C6', 3],
  ['R5C8', 2], ['R6C7', 9], ['R8C7', 2], ['R8C5', 8], ['R8C8', 9],
  ['R9C5', 1], ['R9C6', 4], ['R9C8', 3],
].map(([cell, value]) => new Given(cell, value));

const regions = [
  ...AREA_SIZES.map(n => new ConnectedValues('VS', n, n)),
  new ConnectedValues('VS', SNAKE, SNAKE_LENGTH),
];

// Two orthogonally adjacent cells carrying different area sizes would be one
// larger area, so an area borders only the snake and its own cells. One
// template per step direction, stamped onto every cell that has such a
// neighbour.
const areasDoNotTouchKey = Pair.fnToKey(
  (a, b) => a === b || a === SNAKE || b === SNAKE, geometry);
const areaBorders = [[0, 1], [1, 0]].map(([dRow, dCol]) => {
  const origin = cellRole.cells()[0];
  return cellRole.makeReplicate(
    new Pair(areasDoNotTouchKey, 'areas do not touch',
      origin, cellRole.step(origin, dRow, dCol)),
    cellRole.cells().filter(cell => cellRole.step(cell, dRow, dCol)));
});

// The snake is a path from head to tail which never touches itself, so a snake
// cell has exactly two orthogonal snake neighbours, except the head and the
// tail which have one. Connectivity plus those degrees makes the snake cells a
// single path. The machine reads the cell's own role and then each neighbour's;
// a cell off the snake is unconstrained.
const degreeMachine = (degree) => NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, snakeNeighbours }, role) => {
    if (phase === 'start') {
      return role === SNAKE ? { phase: 'on', snakeNeighbours: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const count = snakeNeighbours + (role === SNAKE ? 1 : 0);
    return count > degree ? undefined : { phase: 'on', snakeNeighbours: count };
  },
  accept: ({ phase, snakeNeighbours }) =>
    phase === 'off' || snakeNeighbours === degree,
}, geometry.numValues);
const endDegreeMachine = degreeMachine(1);
const middleDegreeMachine = degreeMachine(2);
const snakeShape = [
  new Given(cellRole.at(HEAD), SNAKE),
  new Given(cellRole.at(TAIL), SNAKE),
  ...gridCells.map(cell => new NFA(
    cell === HEAD || cell === TAIL ? endDegreeMachine : middleDegreeMachine,
    'snake degree',
    ...cellRole.at([cell, ...graph.neighbours(cell)]))),
];

// VA..VH project the digits of the areas of size 1..8: each layer holds the
// digit of every cell of its own area and the sentinel 9 everywhere else. Two
// pairwise conditions pin a layer -- it is the sentinel exactly where the role
// layer puts the cell outside that area, and it copies the cell's digit
// otherwise -- and ContainExact then reads the area's digits off the layer.
// A cell of the area of size n therefore cannot hold 9, which the sentinel
// would swallow; that is right, since its digits run 1 to n and n is at most 8.
const projectionPrefixes = ['VA', 'VB', 'VC', 'VD', 'VE', 'VF', 'VG', 'VH'];
const areaProjections = AREA_SIZES.map(
  (n, i) => graph.makeOverlay(projectionPrefixes[i]));
const copiesDigitKey = Pair.fnToKey(
  (digit, projected) => projected === OUTSIDE || projected === digit, geometry);
const areaDigits = AREA_SIZES.flatMap((n, i) => {
  const projection = areaProjections[i];
  const insideAreaKey = Pair.fnToKey(
    (role, projected) => (role === n) === (projected !== OUTSIDE), geometry);
  return [
    ...gridCells.flatMap(cell => [
      new Pair(insideAreaKey, `in area ${n}`,
        cellRole.at(cell), projection.at(cell)),
      new Pair(copiesDigitKey, `area ${n} digit`, cell, projection.at(cell)),
    ]),
    new ContainExact(AREA_SIZES.slice(0, n).join('_'), ...projection.cells()),
  ];
});

return [
  new Shape('9x9'),
  cellRole.toVar('cell role'),
  ...areaProjections.map((projection, i) =>
    projection.toVar(`area ${AREA_SIZES[i]} digits`)),
  ...givens,
  ...regions,
  ...areaBorders,
  ...snakeShape,
  ...areaDigits,
];
