// Title: Ouroboros
// Author: Thomas Occhipinti
// Video: https://www.youtube.com/watch?v=M39k_hyxjbc
// Source: https://app.crackingthecryptic.com/sudoku/67NL6D4jBH

// Normal sudoku (rows/columns/3x3 boxes -- ISS default). Cells are shaded to
// form a single 1-cell-wide closed loop that may not touch itself, even
// diagonally: modelled as an ON/OFF Var per cell using degree-2 +
// no-diagonal-touch + ConnectedValues(ON), which closes a self-touch-free
// loop outright -- connected + 2-regular under orthogonal adjacency is
// exactly one simple cycle. Within each cage the shaded-cell digit sum
// equals the unshaded-cell digit sum: an interleaved digit/membership NFA per cage
// accumulates a signed running total (+digit if on-loop, -digit if not) and
// requires the final total to be 0. Digits also do not repeat within a cage
// (AllDifferent). Each circled cell's own digit equals the count of on-loop
// cells among itself, its orthogonal neighbours and its diagonal neighbours
// (a 3x3 block clipped at the grid edge): an NFA reads the cell's digit as
// the target, then its own and each king-neighbour's loop membership. "Not
// all circles are given" is read as the source's own disclaimer that the
// count relation binds only the nine drawn circles -- not an exhaustiveness
// clause requiring every other cell to fail it.

const ON = 1, OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const loop = graph.makeOverlay('VL');

// Cages, provenance: the twelve non-stub entries in the drawn cages array.
const CAGES = [
  ['R2C2', 'R3C2', 'R2C3', 'R3C3'],
  ['R3C4', 'R2C4', 'R2C5', 'R2C6', 'R1C6'],
  ['R1C7', 'R1C8', 'R2C8', 'R2C9'],
  ['R2C7', 'R3C7', 'R3C8', 'R3C9'],
  ['R4C7', 'R5C7', 'R6C7', 'R5C8'],
  ['R6C8', 'R7C8', 'R8C8', 'R8C7'],
  ['R9C7', 'R9C8', 'R9C9', 'R8C9'],
  ['R8C6', 'R9C6', 'R9C5', 'R9C4'],
  ['R8C4', 'R7C4', 'R7C3', 'R8C3', 'R6C3', 'R7C2', 'R6C2'],
  ['R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3'],
  ['R4C2', 'R5C2', 'R5C1'],
  ['R4C4', 'R5C4', 'R6C4', 'R6C5', 'R6C6', 'R5C6', 'R4C6', 'R4C5'],
];

// Circles, provenance: the nine drawn underlay circles, at box corners/center.
const CIRCLES = ['R1C1', 'R1C9', 'R3C3', 'R3C7', 'R5C5', 'R7C3', 'R9C1', 'R7C7', 'R9C9'];

// -- Loop membership: every cell is on (shaded) or off. --
const originCell = loop.cells()[0];
const membership = [loop.makeReplicate(new Given(originCell, ON, OFF))];

// -- Degree 2: each on cell has exactly two on-loop orthogonal neighbours. --
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, value) => {
    if (phase === 'start') {
      return value === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (value === ON ? 1 : 0);
    return count > 2 ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === 2,
}, geometry.numValues);
const degrees = gridCells.map(cell => new NFA(degreeMachine, 'degree',
  ...loop.at([cell, ...graph.neighbours(cell)])));

// -- No diagonal self-touch: forbid a 2x2 whose only on cells are a diagonal. --
const noDiagonalTouchMachine = NFA.encodeSpec({
  startState: { block: [] },
  transition: ({ block }, value) => {
    if (block === null) return { block: null };
    const next = [...block, value === ON];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    return diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const firstBlock = graph.block(blockOrigins[0], 2, 2);
const noDiagonalTouches = loop.makeReplicate(
  [new NFA(noDiagonalTouchMachine, 'no-touch', ...loop.at(firstBlock))],
  loop.at(blockOrigins),
);

// -- Cage split-sum: shaded-cell digits sum to the same total as unshaded-cell
// digits within a cage. Reads interleaved (digit, membership) pairs and
// accumulates a signed running total (+digit if on-loop, -digit if not),
// requiring the cage's final total to be 0.
const cageSplitSumMachine = NFA.encodeSpec({
  startState: { phase: 'digit', sum: 0 },
  transition: (state, value) => {
    if (state.phase === 'digit') return { phase: 'flag', digit: value, sum: state.sum };
    const sum = state.sum + (value === ON ? state.digit : -state.digit);
    return { phase: 'digit', sum };
  },
  accept: (state) => state.phase === 'digit' && state.sum === 0,
  maxDepth: 2 * Math.max(...CAGES.map(cells => cells.length)),
}, geometry.numValues);
const interleave = cells => cells.flatMap(cell => [cell, loop.at(cell)]);
const cageConstraints = CAGES.flatMap(cells => [
  new AllDifferent(...cells),
  new NFA(cageSplitSumMachine, 'cage-split-sum', ...interleave(cells)),
]);

// -- Circle counts: a circled cell's own digit equals how many of {itself,
// its orthogonal neighbours, its diagonal neighbours} are on the loop.
const countMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (value === ON ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry.numValues);
const circleCounts = CIRCLES.map(cell => new NFA(countMachine, 'circle-count',
  cell, loop.at(cell), ...loop.at(graph.kingNeighbours(cell))));

return [
  new Shape('9x9'),
  loop.toVar('loop'),
  ...membership,
  new ConnectedValues('VL', ON),
  ...degrees,
  noDiagonalTouches,
  ...cageConstraints,
  ...circleCounts,
  new Given('R9C3', 9),
];
