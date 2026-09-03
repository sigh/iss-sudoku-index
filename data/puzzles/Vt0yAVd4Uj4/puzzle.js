// Title: Tenfold
// Author: Black_Doom
// Video: https://www.youtube.com/watch?v=Vt0yAVd4Uj4
// Source: https://sudokupad.app/2yiw0yc01y

// Rules encoded below, in order:
//   Normal sudoku rules apply.
//   Draw a one-cell-wide loop of orthogonally connected cells. The loop can't
//   touch itself, not even diagonally.
//   The loop consists of non-overlapping segments, each of which sums to 10.
//   Digits may repeat on the loop and even within an individual segment.
//   The digit in a caged cell shows how many (of the up to 8) surrounding cells
//   are on the loop. The caged cells cannot be on the loop. The number in the
//   top-left corner of a caged cell shows the sum of digits in the loop cells
//   around it.
// Every clause is encoded; nothing is omitted.

const OFF = 1;                 // VL value for a cell that is not on the loop.
// The other VL values name the direction of the loop's successor step out of
// this cell. Values 6..9 are the same four directions for a cell that also
// closes a segment, i.e. the segment cut lies between it and its successor.
// Travelling the loop is an artifact of this encoding, not of the puzzle: the
// rules only speak of the cyclic sequence of cells, which the pointers realise.
const UP = 2, RIGHT = 3, DOWN = 4, LEFT = 5;
const CUT = 4;                 // added to a direction code to mark a segment end
const SEGMENT_TOTAL = 10;      // each segment of the loop sums to 10

const STEPS = [[UP, -1, 0], [RIGHT, 0, 1], [DOWN, 1, 0], [LEFT, 0, -1]];
const onLoop = value => value !== OFF;
const closesSegment = value => value > LEFT;
const directionOf = value => (value > LEFT ? value - CUT : value);

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// VL: loop membership plus the successor direction and segment cut, per above.
const loop = graph.makeOverlay('VL');
// VS: running segment total. On a loop cell that does not close a segment it is
// the sum of the segment's digits from its first cell up to and including this
// one, so it lies in 1..9. Everywhere else (off the loop, or closing a segment,
// where the running total is 10) it is pinned to 1 as a placeholder, so that
// those cells add no freedom of their own.
const runningTotal = graph.makeOverlay('VS');

// Cages, transcribed from the eight single-cell cages drawn in the source; the
// value is the total printed in the cage's top-left corner.
const cages = [
  ['R1C2', 21], ['R2C5', 10], ['R3C8', 18], ['R5C3', 17],
  ['R6C7', 14], ['R7C4', 19], ['R8C9', 5], ['R9C6', 9],
];

// --- Loop membership and step direction ---------------------------------
// A step may not leave the grid, so edge cells lose the outward directions.
const inGridDirections = gridCells.flatMap(cell => {
  const allowed = [OFF];
  for (const [dir, dR, dC] of STEPS) {
    if (graph.step(cell, dR, dC)) allowed.push(dir, dir + CUT);
  }
  return allowed.length === 9 ? [] : [new Given(loop.at(cell), ...allowed)];
});

// Caged cells are off the loop.
const cagedCellsOff = cages.map(([cell]) => new Given(loop.at(cell), OFF));

// --- One loop, one cell wide, never touching itself ----------------------
// Degree 2: each on-loop cell has exactly two on-loop orthogonal neighbours.
// Reads the membership of the cell, then of each neighbour; off cells are free.
// Together with ConnectedValues below this makes the on-loop cells one simple
// cycle: 2-regular and connected.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, value) => {
    if (phase === 'start') {
      return onLoop(value) ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (onLoop(value) ? 1 : 0);
    return count > 2 ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === 2,
}, geometry.numValues);
const degrees = gridCells.map(cell => new NFA(degreeMachine, 'degree',
  ...loop.at([cell, ...graph.neighbours(cell)])));

// One cell wide, no diagonal self-touch: within a 2x2 block, forbid a fully on
// block (two cells wide) and forbid one whose only on cells are a diagonal pair
// (the loop passing beside itself). The two arms of a 90 degree turn are always
// diagonally adjacent, and a turn is not the loop touching itself, so a block
// with three on cells stays legal.
// Reads the four membership cells of a 2x2 block, left-to-right, top-to-bottom.
const noDiagonalTouchMachine = NFA.encodeSpec({
  // `block` accumulates the 2x2's membership flags, and becomes null once the
  // block has passed the check (all further symbols are absorbed).
  startState: { block: [] },
  transition: ({ block }, value) => {
    if (block === null) return { block: null };
    const next = [...block, onLoop(value)];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const allOn = topLeft && topRight && bottomLeft && bottomRight;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    return allOn || diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, geometry.numValues);
// One template stamped on every cell that starts a 2x2 block.
const noDiagonalTouches = loop.makeReplicate(
  new NFA(noDiagonalTouchMachine, 'no-touch',
    ...loop.at(graph.block(gridCells[0], 2, 2))),
  loop.at(gridCells.filter(cell => graph.block(cell, 2, 2))));

// --- Segments of 10 ------------------------------------------------------
// Placeholder pin: only a loop cell that does not close a segment carries a
// meaningful running total; every other cell holds 1.
const placeholderKey = Pair.fnToKey(
  (membership, total) =>
    (onLoop(membership) && !closesSegment(membership)) || total === 1,
  geometry.numValues);
const placeholders = gridCells.map(cell => new Pair(placeholderKey, 'placeholder',
  loop.at(cell), runningTotal.at(cell)));

// One machine per orthogonally adjacent pair (A, B), reading
//   [membership(A), membership(B), total(A), total(B), digit(A), digit(B)].
// It handles whichever of the two possible steps between them is taken:
//   - A and B may not both step at each other. Each on-loop cell has exactly two
//     on-loop neighbours and steps to one of them, so banning mutual steps
//     leaves only the two consistent ways round the cycle; every on-loop cell
//     then has exactly one predecessor and its running total is determined.
//   - For the step P -> X, the total carried into X is 0 when P closed a
//     segment and total(P) otherwise, and the total reached at X is 10 when X
//     closes a segment and total(X) otherwise. digit(X) is the difference, which
//     therefore lies in 1..9: a segment can neither exceed 10 nor close twice in
//     a row.
const buildStepMachine = (aToB, bToA) => NFA.encodeSpec({
  startState: { phase: 'membershipA' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'membershipA':
        return { phase: 'membershipB', a: value };
      case 'membershipB': {
        const a = state.a, b = value;
        const aSteps = onLoop(a) && directionOf(a) === aToB;
        const bSteps = onLoop(b) && directionOf(b) === bToA;
        if (aSteps && bSteps) return undefined;
        if (aSteps && !onLoop(b)) return undefined;
        if (bSteps && !onLoop(a)) return undefined;
        if (!aSteps && !bSteps) return { phase: 'skip', left: 4 };
        return {
          phase: aSteps ? 'forwardA' : 'backwardA',
          aCut: closesSegment(a),
          bCut: closesSegment(b),
        };
      }
      case 'forwardA':   // total(A): the sum carried into B
        return { phase: 'forwardB', from: state.aCut ? 0 : value, bCut: state.bCut };
      case 'backwardA':  // total(A): the sum B's step must reach
        return {
          phase: 'backwardB',
          to: state.aCut ? SEGMENT_TOTAL : value,
          bCut: state.bCut,
        };
      case 'forwardB': {
        const need = (state.bCut ? SEGMENT_TOTAL : value) - state.from;
        return need < 1 || need > geometry.numValues
          ? undefined : { phase: 'forwardSkip', need };
      }
      case 'backwardB': {
        const need = state.to - (state.bCut ? 0 : value);
        return need < 1 || need > geometry.numValues
          ? undefined : { phase: 'backwardCheck', need };
      }
      case 'forwardSkip':  // digit(A) is not the stepped-to digit here
        return { phase: 'forwardCheck', need: state.need };
      case 'forwardCheck':
        return value === state.need ? { phase: 'done' } : undefined;
      case 'backwardCheck':
        return value === state.need ? { phase: 'skip', left: 1 } : undefined;
      case 'skip':
        return state.left > 1
          ? { phase: 'skip', left: state.left - 1 } : { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
const horizontalStepMachine = buildStepMachine(RIGHT, LEFT);
const verticalStepMachine = buildStepMachine(DOWN, UP);
const segmentSteps = gridCells.flatMap(cell => [
  [horizontalStepMachine, graph.step(cell, 0, 1)],
  [verticalStepMachine, graph.step(cell, 1, 0)],
].filter(([, other]) => other).map(([machine, other]) => new NFA(machine, 'step',
  loop.at(cell), loop.at(other),
  runningTotal.at(cell), runningTotal.at(other),
  cell, other)));

// Both ways round the loop satisfy every rule above and give different pointer
// and running-total layers, so pin one. The first on-loop cell in reading order
// has no on-loop neighbour above or to its left, so its two neighbours are its
// right and lower ones; requiring it to step right selects one of the two.
const seamMachine = NFA.encodeSpec({
  startState: { seen: false },
  transition: ({ seen }, value) => {
    if (seen) return { seen: true };
    if (!onLoop(value)) return { seen: false };
    return directionOf(value) === RIGHT ? { seen: true } : undefined;
  },
  accept: ({ seen }) => seen,
}, geometry.numValues);
const seam = new NFA(seamMachine, 'seam', ...loop.cells());

// --- Caged cells ---------------------------------------------------------
// The caged digit counts its on-loop king neighbours. Reads the digit, then
// each neighbour's membership.
const countMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (onLoop(value) ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry.numValues);
const cageCounts = cages.map(([cell]) => new NFA(countMachine, 'count',
  cell, ...loop.at(graph.kingNeighbours(cell))));

// The corner total is the sum of the digits of those same on-loop neighbours.
// Reads (membership, digit) for each king neighbour, adding the digit only when
// the neighbour is on the loop, and saturating past the total.
const buildSumMachine = total => NFA.encodeSpec({
  startState: { phase: 'membership', sum: 0 },
  transition: (state, value) => {
    if (state.phase === 'membership') {
      return { phase: 'digit', sum: state.sum, counted: onLoop(value) };
    }
    const sum = state.sum + (state.counted ? value : 0);
    return sum > total ? undefined : { phase: 'membership', sum };
  },
  accept: ({ phase, sum }) => phase === 'membership' && sum === total,
}, geometry.numValues);
const cageSums = cages.map(([cell, total]) => new NFA(buildSumMachine(total),
  'cage sum',
  ...graph.kingNeighbours(cell).flatMap(n => [loop.at(n), n])));

return [
  new Shape('9x9'),
  loop.toVar('loop step'),
  runningTotal.toVar('segment running total'),
  new Given('R8C2', 3),
  ...inGridDirections,
  ...cagedCellsOff,
  // Single loop: the on-loop cells form one orthogonally-connected region.
  new ConnectedValues('VL', [UP, RIGHT, DOWN, LEFT,
    UP + CUT, RIGHT + CUT, DOWN + CUT, LEFT + CUT]),
  ...degrees,
  noDiagonalTouches,
  ...placeholders,
  ...segmentSteps,
  seam,
  ...cageCounts,
  ...cageSums,
];
