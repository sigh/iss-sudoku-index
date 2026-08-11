// Title: Where No Snake Has Gone Before
// Author: filuta and Nordy
// Video: https://www.youtube.com/watch?v=rM5FLHEIbAo
// Source: https://app.crackingthecryptic.com/sudoku/TbQfBD6j8j
//
// Standard 9x9 sudoku (rows, columns, 3x3 boxes) sits centred in an 11x11
// canvas; the one-cell border ring carries no digit, only snake membership.
// A snake -- a non-looping, non-branching 1-cell-wide path that may touch
// itself diagonally but not orthogonally -- runs anywhere on the 11x11
// canvas; its two ends are the drawn UFO circles at physical R1C6 and
// R11C6. Within the 9x9, a cell is odd iff it is on the snake: odd digits
// are exactly the snake cells, even digits are exactly the off-snake cells.
// White dots (sun) mark consecutive pairs and black dots (moon) mark 2:1
// ratio pairs; not every dot is drawn, so an absent dot is not a
// constraint (no StrictKropki -- the rules say so explicitly).

const ON = 1;
const OFF = 2;
const NUM_VALUES = 9;   // main grid's value range; Var domains inherit it

// The 11x11 physical canvas, used only for snake adjacency. Its own
// R1C1..R11C11 coordinates are the puzzle's physical coordinates; the 9x9
// sudoku sits at physical R2C2..R10C10, i.e. main-grid RxCy is physical
// R(x+1)C(y+1).
const canvas = cellGraph('11x11');
const snake = canvas.makeOverlay('VS');
const snakeVar = snake.toVar('snake');

// --- Snake membership: every canvas cell is on (1) or off (2) the snake,
// with the two UFO circles forced on.
const originCell = snake.cells()[0];
const endpoints = [snakeVar.cell(1, 6), snakeVar.cell(11, 6)];
const membership = [
  snake.makeReplicate(new Given(originCell, ON, OFF)),
  ...endpoints.map(cell => new Given(cell, ON)),
];

// --- Degree: an on-snake cell counts its on-snake orthogonal neighbours.
// The two UFO ends need exactly one (a path end); every other on-snake
// cell needs exactly two (mid-path); off cells are unconstrained. Reads a
// cell's own membership, then each neighbour's. With ConnectedValues below
// (one connected on-snake region), this degree sequence forces exactly one
// simple path -- no separate cycle or branch can appear, and any cell
// touching more on-snake orthogonal neighbours than its target is rejected,
// which is exactly the "no orthogonal self-touch except along the path"
// rule; diagonal touches are untouched by this and stay legal.
const makeDegreeMachine = (targetDegree) => NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, membership) => {
    if (phase === 'start') {
      return membership === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (membership === ON ? 1 : 0);
    return count > targetDegree ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === targetDegree,
}, NUM_VALUES);
const degree1Machine = makeDegreeMachine(1);
const degree2Machine = makeDegreeMachine(2);

const canvasCells = canvas.cells();
const endpointSet = new Set(endpoints);

// The 81 cells with all four orthogonal neighbours -- exactly the 9x9
// sudoku's physical footprint, R2C2..R10C10 -- all shift the same relative
// template (self + left/right/up/down), so one Replicate covers them
// instead of 81 hand-stamped copies.
const fullNeighbourCells = [];
for (let r = 2; r <= 10; r++) {
  for (let c = 2; c <= 10; c++) fullNeighbourCells.push(makeCellId(r, c));
}
const interiorOrigin = fullNeighbourCells[0];
const interiorTemplate = new NFA(degree2Machine, 'degree',
  ...snake.at([interiorOrigin, ...canvas.neighbours(interiorOrigin)]));
const interiorDegree = new Replicate(
  [interiorTemplate],
  Replicate.encodeTargetCells(
    snake.at(fullNeighbourCells), snake.at(interiorOrigin), snake),
  snake.at(interiorOrigin));

// The one-cell border ring (40 cells, including the two UFO endpoints) keeps
// individual per-cell NFAs: each side's relative neighbour offsets differ
// from the others, so no single shift template covers them, and every
// resulting group is well under the stamped-copy threshold.
const fullNeighbourSet = new Set(fullNeighbourCells);
const borderDegrees = canvasCells
  .filter(cell => !fullNeighbourSet.has(cell))
  .map(cell => {
    const varCell = snake.at(cell);
    const machine = endpointSet.has(varCell) ? degree1Machine : degree2Machine;
    return new NFA(machine, 'degree', ...snake.at([cell, ...canvas.neighbours(cell)]));
  });
const degrees = [interiorDegree, ...borderDegrees];

// --- Single connected snake region (paired with the degree rules above).
const connectivity = new ConnectedValues('VS', ON);

// --- Parity link (within the 9x9 only): a main-grid cell's digit is odd
// iff its shadowing canvas cell is on the snake. Border cells carry no
// digit and get no such link.
const parityKey = Pair.fnToKey((digit, membershipValue) =>
  (digit % 2 === 1) === (membershipValue === ON), NUM_VALUES);
const parity = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) {
    const mainCell = makeCellId(r, c);
    const canvasCell = makeCellId(r + 1, c + 1);
    parity.push(new Pair(parityKey, 'parity', mainCell, snake.at(canvasCell)));
  }
}

// --- Dots: white = consecutive, black = 2:1 ratio. Cell pairs are the
// drawn dot centres (source overlays, converted from physical/canvas
// coordinates to main-grid coordinates by subtracting 1 from each index).
const whiteDots = [
  ['R1C4', 'R1C5'],
  ['R2C8', 'R3C8'],
  ['R4C4', 'R4C5'],
  ['R4C6', 'R5C6'],
  ['R6C5', 'R6C6'],
  ['R5C4', 'R6C4'],
  ['R8C5', 'R9C5'],
].map(([a, b]) => new WhiteDot(a, b));

const blackDots = [
  ['R2C2', 'R3C2'],
  ['R5C3', 'R6C3'],
  ['R5C4', 'R5C5'],
  ['R5C6', 'R6C6'],
  ['R8C3', 'R9C3'],
  ['R9C7', 'R9C8'],
  ['R6C8', 'R7C8'],
].map(([a, b]) => new BlackDot(a, b));

return [
  new Shape('9x9'),
  snakeVar,
  ...membership,
  connectivity,
  ...degrees,
  ...parity,
  ...whiteDots,
  ...blackDots,
];
