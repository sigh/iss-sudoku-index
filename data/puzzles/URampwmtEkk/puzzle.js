// Title: Psst, I'm in the Loop
// Author: Calvinball
// Video: https://www.youtube.com/watch?v=URampwmtEkk
// Source: https://sudokupad.app/dxgxcqoyeg

// Rules encoded below:
//   1. Normal Sudoku rules apply.
//   2. Draw a one-cell-wide loop of orthogonally connected cells. The loop may
//      not touch itself, not even diagonally.
//   3. The loop acts as a German Whisper line: all adjacent digits along the
//      line differ by at least 5.
//   4. Clues outside the grid are Loopwiches: the clue is the sum of the digits
//      between the first and last loop cell of its row or column. Both loop and
//      non-loop cells between the two crust cells are summed; the crusts are not.
// Nothing is omitted.

const ON = 1;                     // loop-membership codes held in the Var cells
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// One membership Var cell per grid cell (VL1..VL81, in grid order).
const loop = graph.makeOverlay('VL');

// --- Loop membership: every cell is on (1) or off (2). ---
const membership = loop.makeReplicate(new Given(loop.cells()[0], ON, OFF));

// --- Degree 2: each on-loop cell has exactly two on-loop orthogonal
// neighbours. Reads the cell's own membership, then each neighbour's; off-loop
// cells are unconstrained.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, membership) => {
    if (phase === 'start') {
      return membership === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (membership === ON ? 1 : 0);
    return count > 2 ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === 2,
}, geometry.numValues);
const degrees = gridCells.map(cell => new NFA(degreeMachine, 'degree',
  ...loop.at([cell, ...graph.neighbours(cell)])));

// --- No self-touch and one-cell-wide, both read off each 2x2 block. ---
// A diagonal-only 2x2 is two loop cells touching diagonally with no shared
// loop cell between them, i.e. a diagonal self-touch. A fully-on 2x2 is a loop
// two cells wide (and its diagonals touch as well), so it is excluded too.
// Reads the four membership cells of the block, left-to-right, top-to-bottom.
const blockMachine = NFA.encodeSpec({
  // `block` accumulates the 2x2's membership flags, and becomes null once the
  // block has passed the check (all further symbols are absorbed).
  startState: { block: [] },
  transition: ({ block }, membership) => {
    if (block === null) return { block: null };
    const next = [...block, membership === ON];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    const solid = topLeft && topRight && bottomLeft && bottomRight;
    return diagonalOnly || solid ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, geometry.numValues);
// One template on the top-left block, stamped onto every cell that starts a
// 2x2; cells on the bottom/right edge start none.
const blocks = loop.makeReplicate(
  new NFA(blockMachine, 'no-touch', ...loop.at(graph.block(gridCells[0], 2, 2))),
  loop.at(gridCells.filter(cell => graph.block(cell, 2, 2))));

// --- German Whisper along the loop. Degree 2 plus the no-touch rule make two
// orthogonally adjacent on-loop cells consecutive along the loop, so the rule is
// exactly: adjacent cells both on the loop differ by at least 5. Reads
// (membership, digit) for each of the two cells; if either is off the loop the
// pair is unconstrained and the remaining symbols are absorbed by a countdown.
const whisperMachine = NFA.encodeSpec({
  startState: { phase: 'aOn' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'aOn':
        return value === ON ? { phase: 'aDigit' } : { phase: 'skip', left: 3 };
      case 'aDigit':
        return { phase: 'bOn', aDigit: value };
      case 'bOn':
        return value === ON
          ? { phase: 'bDigit', aDigit: state.aDigit }
          : { phase: 'skip', left: 1 };
      case 'bDigit':
        return Math.abs(state.aDigit - value) >= 5 ? { phase: 'done' } : undefined;
      case 'skip':
        return state.left > 1 ? { phase: 'skip', left: state.left - 1 } : { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
// Right/down steps only, so each orthogonal pair is covered exactly once.
const whispers = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dR, dC]) => graph.step(cell, dR, dC))
  .filter(Boolean)
  .map(other => new NFA(whisperMachine, 'whisper',
    loop.at(cell), cell, loop.at(other), other)));

// --- Loopwich. Scans the line as (membership, digit) per cell and accumulates
// `sum`, the digits seen since the first loop cell. At each later loop cell the
// running `sum` is the loopwich total for that cell as final crust, so the line
// is satisfied exactly when some loop cell is reached with `sum === target` and
// no loop cell follows it. Because every digit is at least 1 the running sum is
// strictly increasing, so at most one loop cell can be reached at `sum ===
// target`, and once `sum` passes `target` no later loop cell can be the crust:
// both cases are dead ends rather than choices.
const loopwichMachine = target => NFA.encodeSpec({
  startState: { phase: 'preFlag' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'preFlag':      // membership, before the first crust
        return value === ON ? { phase: 'firstDigit' } : { phase: 'preDigit' };
      case 'preDigit':     // digit before the first crust: not summed
        return { phase: 'preFlag' };
      case 'firstDigit':   // the first crust's own digit: not summed
        return { phase: 'flag', sum: 0 };
      case 'flag':         // membership, after the first crust
        return value === ON && state.sum === target
          ? { phase: 'closedDigit' }              // this is the final crust
          : { phase: 'digit', sum: state.sum };
      case 'digit': {      // digit strictly between the crusts: always summed
        const sum = state.sum + value;
        return sum > target ? undefined : { phase: 'flag', sum };
      }
      case 'closedDigit':  // the final crust's own digit, or any digit past it
        return { phase: 'closed' };
      case 'closed':       // a further loop cell would move the final crust
        return value === ON ? undefined : { phase: 'closedDigit' };
    }
  },
  accept: ({ phase }) => phase === 'closed',
}, geometry.numValues);

// Clue values and lines, transcribed from the six black labels in the margin:
// three above columns 1, 6 and 8, and three to the left of rows 2, 7 and 9.
const loopwichClues = [
  [17, graph.column(1)],
  [30, graph.column(6)],
  [22, graph.column(8)],
  [40, graph.row(2)],
  [35, graph.row(7)],
  [13, graph.row(9)],
];
const loopwiches = loopwichClues.map(([target, cells]) => new NFA(
  loopwichMachine(target), 'loopwich-' + target,
  ...cells.flatMap(cell => [loop.at(cell), cell])));

return [
  new Shape('9x9'),
  new Given('R7C7', 5),
  loop.toVar('loop'),
  membership,
  // Single loop: the on-loop cells form one orthogonally-connected region, and
  // with degree 2 that region is one simple cycle.
  new ConnectedValues('VL', ON),
  ...degrees,
  blocks,
  ...whispers,
  ...loopwiches,
];
