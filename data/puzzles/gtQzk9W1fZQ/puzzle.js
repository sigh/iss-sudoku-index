// Title: The Python
// Author: ICHTUES
// Video: https://www.youtube.com/watch?v=gtQzk9W1fZQ
// Source: https://app.crackingthecryptic.com/sudoku/RR8mDPLDJJ
//
// Normal sudoku. A 1-cell-wide "python" is an orthogonally-connected path that
// may not touch itself, even diagonally; it begins/ends at the two red cells.
// Grey cells (stones) are NOT python; each stone's own digit equals how many
// of its surrounding cells (king-move neighbours + itself) are NOT python.
// Stone digits are all different. Blue cells may be python; each blue cell's
// own digit equals how many of its surrounding cells (king-move neighbours +
// itself) ARE python. "ALL possible coloured cells are given" -- every cell
// that could validly carry a stone- or blue-style count is already coloured
// grey/blue, so every other cell is barred from matching either count.
//
// OMITTED: "the digits on the python form a palindrome, with the purple cell
// at the midpoint" is not encoded. The palindrome pairs cells by their
// position along a solver-discovered path of unknown length -- no ISS
// primitive ties two cells by discovered position (blocker #867). The purple
// cell IS still pinned onto the path (a plain geometric fact independent of
// the pairing), but the mirror-symmetry relation itself is omitted.
//
// The stone/blue clue VALUES are not printed anywhere -- per the rules text
// ("each ... shows") the clue is the cell's own sudoku digit, not a separate
// printed number.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

const ON = 1;   // python-membership values, stored in the VP overlay
const OFF = 2;

const python = graph.makeOverlay('VP');

// Coloured cells, transcribed from the puzzle's underlay fills (0-indexed centers -> 1-indexed cells).
const greyCells = ['R6C1', 'R5C2', 'R2C2', 'R2C3', 'R4C8', 'R7C8', 'R7C7', 'R8C7', 'R9C9'];
const blueCells = ['R1C5', 'R1C7', 'R3C6', 'R3C8', 'R3C2', 'R5C4', 'R7C9'];
const redCells = ['R8C9', 'R2C7'];
const purpleCell = 'R4C3';
const redSet = new Set(redCells);
const specialCells = new Set([...greyCells, ...blueCells, ...redCells, purpleCell]);

// --- Membership: every cell is on (1) or off (2) the python; fix the known cells. ---
const originCell = python.cells()[0];
const membership = [
  python.makeReplicate(new Given(originCell, ON, OFF)),
  ...python.at(greyCells).map(cell => new Given(cell, OFF)),
  ...python.at(redCells).map(cell => new Given(cell, ON)),
  new Given(python.at(purpleCell), ON),
];

// --- Degree: on-path cells have exactly one on-path orthogonal neighbour at
// each red endpoint, and exactly two everywhere else on the path; off cells
// are free. Connected (below) + this degree sequence forces one simple path.
function degreeMachine(targetDegree) {
  return NFA.encodeSpec({
    startState: { phase: 'start' },
    transition: ({ phase, onNeighbours }, value) => {
      if (phase === 'start') {
        return value === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
      }
      if (phase === 'off') return { phase: 'off' };
      const count = onNeighbours + (value === ON ? 1 : 0);
      return count > targetDegree ? undefined : { phase: 'on', onNeighbours: count };
    },
    accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === targetDegree,
  }, geometry.numValues);
}
const degree1 = degreeMachine(1);
const degree2 = degreeMachine(2);
const degrees = gridCells.map(cell => new NFA(
  redSet.has(cell) ? degree1 : degree2,
  'degree', ...python.at([cell, ...graph.neighbours(cell)])));

// --- Single connected path (with the degree machines above, this closes the
// route into exactly one simple path between the two red endpoints). ---
const connected = new ConnectedValues('VP', ON);

// --- No diagonal self-touch: forbid a 2x2 block whose only on-path cells sit
// on one diagonal (the standard no-diagonal-touch NFA over each 2x2 block). ---
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
// Same-shaped 2x2-block template at every valid top-left cell (not last row
// or column) -- one Replicate instead of 64 near-identical NFAs.
const blockTopLefts = gridCells.filter(cell => graph.block(cell, 2, 2));
const noDiagonalTouches = [python.makeReplicate(
  new NFA(noDiagonalTouchMachine, 'no-touch', ...python.at(graph.block(gridCells[0], 2, 2))),
  python.at(blockTopLefts),
)];

// --- Stone/blue self-count: reads the cell's own digit, then its own
// membership, then its up-to-8 king neighbours' memberships; the digit must
// equal 1 (for itself) plus the count of king neighbours matching `matchValue`.
function selfCountMachine(matchValue) {
  return NFA.encodeSpec({
    startState: { target: null, count: null },
    transition: ({ target, count }, value) => {
      if (target === null) return { target: value, count: null };      // digit
      if (count === null) return { target, count: value === matchValue ? 1 : 0 }; // self
      const next = count + (value === matchValue ? 1 : 0);
      return next > target ? undefined : { target, count: next };
    },
    accept: ({ target, count }) => target !== null && count === target,
  }, geometry.numValues);
}
const stoneCounts = greyCells.map(cell => new NFA(
  selfCountMachine(OFF), 'stone-count',
  cell, python.at(cell), ...python.at(graph.kingNeighbours(cell))));
const blueCounts = blueCells.map(cell => new NFA(
  selfCountMachine(ON), 'blue-count',
  cell, python.at(cell), ...python.at(graph.kingNeighbours(cell))));

// --- Stone digits all different. ---
const stonesDistinct = new AllDifferent(...greyCells);

// --- "ALL possible coloured cells are given": every cell that is not grey,
// blue, red or purple must NOT match either count relation -- reads own
// membership, own digit, then king neighbours' memberships; a cell whose
// digit equals its own self-count (matched against its own membership value)
// would have been a valid stone/blue cell, so that is forbidden here.
const noMatchMachine = NFA.encodeSpec({
  startState: { phase: 'self' },
  transition: (state, value) => {
    if (state.phase === 'self') return { phase: 'digit', self: value, count: 1 };
    if (state.phase === 'digit') return { phase: 'scan', self: state.self, digit: value, count: state.count };
    const match = value === state.self;
    // Clamp: once count exceeds the digit it can only stay mismatched, so cap
    // it at digit+1 (a sink) instead of letting it grow with every neighbour.
    const next = Math.min(state.count + (match ? 1 : 0), state.digit + 1);
    return { phase: 'scan', self: state.self, digit: state.digit, count: next };
  },
  accept: (state) => state.phase === 'scan' && state.count !== state.digit,
  maxDepth: 10, // self + digit + up to 8 king neighbours
}, geometry.numValues);
const noMatches = gridCells
  .filter(cell => !specialCells.has(cell))
  .map(cell => new NFA(noMatchMachine, 'no-count-match',
    python.at(cell), cell, ...python.at(graph.kingNeighbours(cell))));

return [
  new Shape('9x9'),
  python.toVar('python'),
  ...membership,
  connected,
  ...degrees,
  ...noDiagonalTouches,
  ...stoneCounts,
  ...blueCounts,
  stonesDistinct,
  ...noMatches,
];
