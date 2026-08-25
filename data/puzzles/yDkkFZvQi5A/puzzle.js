// Title: Scrub Python
// Author: Peter C. Hayward
// Video: https://www.youtube.com/watch?v=yDkkFZvQi5A
// Source: https://app.crackingthecryptic.com/webapp/mQgPbbGfGr
//
// Standard 9x9 sudoku, plus a 1-cell-wide "python": a single orthogonally-
// connected chain of cells running between the two red squares (R9C1,
// R5C5), branchless and not touching itself in any of the 8 directions.
// The blue squares (13, listed below) are never on the python, and each
// blue square's own digit equals how many of its up-to-8 king-move
// neighbours are on the python; no other off-python cell may coincide with
// its own king-move python-count ("all possible blue squares are given").
//
// OMITTED: "Digits on the python form a palindrome, with the given 8 at the
// midpoint" is only partly encoded. R3C9 (the given 8) is pinned onto the
// python below, since the rule states it as the sequence's midpoint cell.
// The palindrome digit-equality itself -- pairing each python cell with the
// cell at the same distance on the other side of R3C9, whose identity is
// only known to the solver -- is not encoded.

const ON = 1;                  // python-membership values, stored in the Var cells
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// Drawn geometry: 1x1 underlay fills by colour.
const redEndpoints = ['R9C1', 'R5C5'];               // #E6261F
const midpoint = 'R3C9';                             // given 8; also marked #D23BE7
const blueCells = [
  'R1C7', 'R1C9', 'R2C2', 'R2C4', 'R3C5', 'R4C3', 'R4C6',
  'R4C8', 'R5C6', 'R6C9', 'R7C2', 'R7C6', 'R8C2',
];                                                    // #34BBE6

// The python-membership Var cell paired with each grid cell (VP1..VP81, in grid order).
const python = graph.makeOverlay('VP');

// --- Membership: every cell is on (1) or off (2); endpoints and the
// midpoint on, blue squares off.
const originCell = python.cells()[0];
const membership = [
  python.makeReplicate(new Given(originCell, ON, OFF)),
  ...python.at(redEndpoints).map(cell => new Given(cell, ON)),
  new Given(python.at(midpoint), ON),
  ...python.at(blueCells).map(cell => new Given(cell, OFF)),
];

// --- Degree: an on-python cell has exactly two on-python orthogonal
// neighbours, except the two red endpoints, which have exactly one --
// together with single-region connectivity below this makes the on-python
// cells one simple path between the endpoints. Off cells are unconstrained.
// Reads a cell's own membership, then each orthogonal neighbour's.
function makeDegreeMachine(target) {
  return NFA.encodeSpec({
    startState: { phase: 'start' },
    transition: ({ phase, onNeighbours }, membershipValue) => {
      if (phase === 'start') {
        return membershipValue === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
      }
      if (phase === 'off') return { phase: 'off' };
      const count = onNeighbours + (membershipValue === ON ? 1 : 0);
      return count > target ? undefined : { phase: 'on', onNeighbours: count };
    },
    accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === target,
  }, geometry.numValues);
}
const degree1Machine = makeDegreeMachine(1);
const degree2Machine = makeDegreeMachine(2);
const degrees = gridCells.map(cell => {
  const machine = redEndpoints.includes(cell) ? degree1Machine : degree2Machine;
  return new NFA(machine, 'degree', ...python.at([cell, ...graph.neighbours(cell)]));
});

// --- No diagonal self-touch: forbid a 2x2 whose only on cells are a
// diagonal pair. (Orthogonal self-touch between non-consecutive cells is
// already excluded by the degree cap above.)
const noDiagonalTouchMachine = NFA.encodeSpec({
  // `block` accumulates the 2x2's membership flags, and becomes null once
  // the block has passed the check (all further symbols are absorbed).
  startState: { block: [] },
  transition: ({ block }, membershipValue) => {
    if (block === null) return { block: null };
    const next = [...block, membershipValue === ON];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    return diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, geometry.numValues);
// Every valid top-left corner of a 2x2 block, as a shift of the block
// anchored at the overlay's own origin cell (VP1 / R1C1). Replicate stamps
// the one template built there onto the other 63, instead of 64 hand-built
// copies of the identical shape.
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noDiagonalTouchTemplate = new NFA(noDiagonalTouchMachine, 'no-touch',
  ...python.at(graph.block(python.gridAt(python.cells()[0]), 2, 2)));
const noDiagonalTouches = python.makeReplicate(
  noDiagonalTouchTemplate, python.at(blockOrigins));

// --- Blue square counts: a blue square's own digit equals the number of
// its king-move neighbours that are on the python. Reads the cell's digit,
// then each king neighbour's membership.
const countMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };   // the cell's own digit
    const next = count + (value === ON ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry.numValues);
const blueCounts = blueCells.map(cell => new NFA(countMachine, 'count',
  cell, ...python.at(graph.kingNeighbours(cell))));

// --- Exhaustiveness ("all possible blue squares are given"): every other
// cell must NOT have its own digit equal to its king-move python-count
// while off the python -- otherwise it would itself qualify as a blue
// square that the puzzle did not mark. Reads a cell's own membership, then
// its own digit (only if off), then each king neighbour's membership.
const notBlueMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'start':
        return value === OFF ? { phase: 'digit' } : { phase: 'onSkip' };
      case 'onSkip':
        return { phase: 'onSkip' };
      case 'digit':
        return { phase: 'count', target: value, count: 0 };
      case 'count':
        // Clamp: a count above the max possible digit (9) can never equal
        // target, so collapsing it to one sink value bounds the state count.
        return {
          phase: 'count', target: state.target,
          count: Math.min(state.count + (value === ON ? 1 : 0), 9),
        };
    }
  },
  accept: (state) => state.phase === 'onSkip' ||
    (state.phase === 'count' && state.count !== state.target),
}, geometry.numValues);
const notBlue = gridCells
  .filter(cell => !blueCells.includes(cell))
  .map(cell => new NFA(notBlueMachine, 'not-blue',
    python.at(cell), cell, ...python.at(graph.kingNeighbours(cell))));

return [
  new Shape('9x9'),
  new Given('R3C3', 1),
  new Given('R3C9', 8),
  new Given('R4C6', 3),
  new Given('R5C1', 7),
  python.toVar('python'),
  ...membership,
  // Single path: the on-python cells form one orthogonally-connected region.
  new ConnectedValues('VP', ON),
  ...degrees,
  noDiagonalTouches,
  ...blueCounts,
  ...notBlue,
];
