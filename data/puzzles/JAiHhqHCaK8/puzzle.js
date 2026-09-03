// Title: Yajilin Sudoku
// Author: Madmahogany
// Video: https://www.youtube.com/watch?v=JAiHhqHCaK8
// Source: https://bit.ly/2Bgx2bW

// Rules:
//   Normal Sudoku rules apply. Place some blocks in the grid. Digits in grey
//   cells will be the clues for the number of blocks in the given direction.
//   Blocks cannot touch orthogonally. The remainder of the grid (not blocks or
//   clues) must be a part of a single continuous non-intersecting loop. Also,
//   the loop can only turn in a cell containing an odd digit.
//
// Every cell holds a Sudoku digit, and independently every cell is exactly one
// of: one of the nine drawn grey clue cells, a block, or a cell the loop runs
// through. That three-way state is the VS overlay below; the loop runs through
// cell centres, moves orthogonally, and goes straight or turns within a cell.
//
// Omitted: that the loop is a *single* loop. Edge agreement makes every loop
// cell degree 2 and ConnectedValues forces the loop cells into one
// orthogonally-connected blob, but this loop may run alongside itself, so two
// separate loops can be cell-adjacent while sharing no used edge. That residue
// is not expressed here.
//
// The arrow drawn in each grey cell carries a direction index 0-3 rather than a
// compass direction; which index means which direction is a convention of the
// drawing format and is not recorded in the source. Every index-to-direction
// bijection that survives the emptiness test below is therefore carried as a
// disjunction, rather than one being picked.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shape = graph.makeOverlay('VS');

// VS codes: the two off-loop states, then the six ways the loop can pass
// through a cell (which of its four edges the loop uses).
const BLOCK = 1, CLUE = 2, HORIZ = 3, VERT = 4, UL = 5, UR = 6, DL = 7, DR = 8;
const usesUp = s => s === VERT || s === UL || s === UR;
const usesDown = s => s === VERT || s === DL || s === DR;
const usesLeft = s => s === HORIZ || s === UL || s === DL;
const usesRight = s => s === HORIZ || s === UR || s === DR;
const isTurn = s => s >= UL;      // the four corner codes
const LOOP_CODES = [HORIZ, VERT, UL, UR, DL, DR];

// The 18 digits printed in the grid.
const givens = {
  R1C5: 6, R1C9: 9, R2C2: 9, R2C8: 6, R3C4: 4,
  R4C4: 7, R4C8: 8, R5C1: 8, R5C5: 4, R5C9: 5,
  R6C2: 2, R6C6: 9, R7C6: 8, R8C2: 3, R8C3: 6,
  R8C8: 7, R9C1: 2, R9C5: 7,
};

// The nine grey cells, each holding an arrow instead of a printed digit, with
// the direction index that arrow carries.
const arrowClues = {
  R1C1: 2, R1C3: 3, R3C3: 3, R4C7: 1,
  R5C3: 2, R6C5: 2, R7C8: 3, R8C4: 1, R8C5: 0,
};
const clueCells = Object.keys(arrowClues);

// Grey cells are clues, never blocks and never on the loop; every other cell is
// a block or a loop cell, and cannot use an edge that leaves the grid.
const PLACEABLE = [BLOCK, HORIZ, VERT, UL, UR, DL, DR];
const stateDomains = graph.cells().map(cell => {
  if (arrowClues[cell] !== undefined) return new Given(shape.at(cell), CLUE);
  const { row, col } = parseCellId(cell);
  const allowed = PLACEABLE.filter(s =>
    !(row === 1 && usesUp(s)) && !(row === geometry.numRows && usesDown(s)) &&
    !(col === 1 && usesLeft(s)) && !(col === geometry.numCols && usesRight(s)));
  return new Given(shape.at(cell), ...allowed);
});

// Neighbour rules, stamped onto each cell that has a right neighbour and each
// cell that has a down neighbour, so every orthogonal pair is covered once.
// - edge agreement: the left/upper cell uses the shared edge exactly when the
//   right/lower one does, which is what joins the per-cell codes into loops.
// - no-touch: two blocks may not be orthogonally adjacent.
const agreeAcross = Pair.fnToKey((a, b) => usesRight(a) === usesLeft(b), geometry);
const agreeDown = Pair.fnToKey((a, b) => usesDown(a) === usesUp(b), geometry);
const noTouch = Pair.fnToKey((a, b) => !(a === BLOCK && b === BLOCK), geometry);
// The overlay's first cell shadows R1C1, which has both a right and a down
// neighbour, so it can carry both templates.
const origin = graph.cells()[0];
const neighbourRules = [
  shape.makeReplicate([
    new Pair(agreeAcross, 'edge-h', ...shape.at([origin, graph.step(origin, 0, 1)])),
    new Pair(noTouch, 'no-touch-h', ...shape.at([origin, graph.step(origin, 0, 1)])),
  ], shape.at(graph.cells().filter(cell => graph.step(cell, 0, 1)))),
  shape.makeReplicate([
    new Pair(agreeDown, 'edge-v', ...shape.at([origin, graph.step(origin, 1, 0)])),
    new Pair(noTouch, 'no-touch-v', ...shape.at([origin, graph.step(origin, 1, 0)])),
  ], shape.at(graph.cells().filter(cell => graph.step(cell, 1, 0)))),
];

// A cell's digit against its own loop code: a turn needs an odd digit.
const turnNeedsOdd = Pair.fnToKey(
  (digit, state) => !isTurn(state) || digit % 2 === 1, geometry);
const turnRules = graph.cells().map(
  cell => new Pair(turnNeedsOdd, 'turn-odd', cell, shape.at(cell)));

// --- Arrow clues.
const DIRECTIONS = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
// graph.ray() includes the cell it starts from, which is the clue itself.
const rayFrom = (cell, direction) =>
  graph.ray(cell, ...DIRECTIONS[direction]).slice(1);

// The most blocks a ray could ever hold: a block sits on neither a grey cell nor
// a cell orthogonally next to another block, so each maximal grey-free run of
// length L holds at most ceil(L / 2).
const rayCapacity = cells => {
  let total = 0, run = 0;
  for (const cell of cells) {
    if (arrowClues[cell] !== undefined) { total += (run + 1) >> 1; run = 0; }
    else run++;
  }
  return total + ((run + 1) >> 1);
};

const permutations = xs => xs.length <= 1 ? [xs] : xs.flatMap(
  (x, i) => permutations([...xs.slice(0, i), ...xs.slice(i + 1)]).map(p => [x, ...p]));
// A clue digit is a Sudoku digit, so it is at least 1; an index whose ray can
// hold no block at all therefore makes that whole bijection unsatisfiable. This
// drops 16 of the 24 bijections (R1C1 has no cell above it or to its left, and
// R1C3 none above it), leaving 8 live readings.
const assignments = permutations(Object.keys(DIRECTIONS)).filter(
  perm => clueCells.every(
    cell => rayCapacity(rayFrom(cell, perm[arrowClues[cell]])) >= 1));

// Reads the clue cell's digit as the target, then counts BLOCK codes along the
// ray; the count is clamped one past the target, which is a dead end.
const countBlocks = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) return state;
    if (state.target === null) return { target: value, count: 0 };
    const count = state.count + (value === BLOCK ? 1 : 0);
    return { target: state.target, count: Math.min(count, state.target + 1) };
  },
  accept: ({ target, count }) => target !== null && count === target,
  maxDepth: 10,   // 1 clue cell + at most 8 ray cells + 1 segment break
}, geometry, { multiSegment: true });

const arrowRules = new Or(assignments.map(perm => new And(
  clueCells.map(cell => new NFA(countBlocks, 'arrow-count',
    [cell], shape.at(rayFrom(cell, perm[arrowClues[cell]])))))));

return [
  new Shape('9x9'),
  ...Object.entries(givens).map(([cell, digit]) => new Given(cell, digit)),
  shape.toVar('cell state'),
  ...stateDomains,
  ...neighbourRules,
  ...turnRules,
  arrowRules,
  new ConnectedValues('VS', LOOP_CODES),
];
