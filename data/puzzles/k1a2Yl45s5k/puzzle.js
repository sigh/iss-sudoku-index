// Title: Monty Python And The Ghostly Trail: The Sudoku!
// Author: Peter C Hayward
// Video: https://www.youtube.com/watch?v=k1a2Yl45s5k
// Source: https://cracking-the-cryptic.web.app/sudoku/tLmqnGRNPL

// Normal Sudoku rules apply. The final grid contains a 1-cell-wide python,
// which begins at the purple 1 (R8C1). The python may not touch itself
// orthogonally or diagonally. Numbers in blue squares show how many of their 8
// surrounding squares are python. Blue squares cannot be python. All possible
// blue squares are given: every cell that is not on the python and whose digit
// equals its own minesweeper total is drawn blue. The final grid also contains
// a "ghost", an identical copy of the python (shape, digits, orientation),
// which begins and ends on the original python and may overlap it elsewhere;
// blue squares ignore the ghost.
//
// OMITTED: the ghost. Nothing below constrains it, so the python is only
// shaped by the minesweeper clues and the sudoku.
//
// Python membership is a Var cell per grid cell (1 = on the python, 2 = off).
// "May not touch itself, not even diagonally" is the standard snake reading:
// non-consecutive python cells are never orthogonally adjacent, and the only
// diagonal contact allowed is the one a 90-degree turn forces between the
// cells either side of the turn. Under that reading the shape rules are the
// same degree and 2x2 machines the other snake/loop scripts use.

const ON = 1;                  // python-membership values, held in the Var cells
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

// The membership Var cell paired with each grid cell (VP1..VP81, in grid order).
const python = graph.makeOverlay('VP');

const gridCells = graph.cells();

// Drawn data, transcribed from the source grid.
const givens = {
  R2C5: 8, R3C8: 7, R6C2: 4, R6C4: 1, R8C1: 1, R8C5: 5,
};
// The ten solid blue cell fills.
const blueCells = [
  'R3C4', 'R3C5', 'R4C6', 'R5C5', 'R6C2',
  'R7C7', 'R8C2', 'R9C2', 'R9C7', 'R9C9',
];
// The single solid purple cell fill: the python's first cell.
const pythonStart = 'R8C1';

const plainCells = gridCells.filter(cell => !blueCells.includes(cell));

// --- Membership: every cell is on (1) or off (2); blue cells off, purple on.
const originCell = python.cells()[0];
const membership = [
  python.makeReplicate(new Given(originCell, ON, OFF)),
  ...python.at(blueCells).map(cell => new Given(cell, OFF)),
  new Given(python.at(pythonStart), ON),
];

// --- Shape: a single simple path with R8C1 as one of its two ends. ---
// Reads the membership of a cell, then of each orthogonal neighbour, and bounds
// the number of on-python neighbours. Off cells are free.
// Connected (below) + every python cell of degree at most 2 + the start cell of
// degree at most 1 is a simple path with R8C1 as an end: a connected graph of
// maximum degree 2 is a path or a cycle, and a cycle has no cell of degree
// below 2. Nothing here sets a minimum length, so a python consisting of R8C1
// alone would pass this group; the blue clues rule it out, since a blue square
// with no python neighbour would need the digit 0.
// Non-consecutive python cells are then never orthogonally adjacent, which is
// the orthogonal half of "may not touch itself".
const degreeMachine = (maxDegree) => NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, membership) => {
    if (phase === 'start') {
      return membership === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (membership === ON ? 1 : 0);
    return count > maxDegree ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: ({ phase }) => phase === 'off' || phase === 'on',
}, geometry.numValues);
const bodyMachine = degreeMachine(2);
const endMachine = degreeMachine(1);
const degrees = gridCells.map(cell => new NFA(
  cell === pythonStart ? endMachine : bodyMachine, 'degree',
  ...python.at([cell, ...graph.neighbours(cell)])));

// --- No diagonal self-touch: forbid a 2x2 whose only on cells are a diagonal.
// Two diagonally adjacent python cells with neither shared orthogonal neighbour
// on the python are non-consecutive, so this is the diagonal half of the rule;
// a turn keeps three cells of its 2x2 on the python and is unaffected.
// Reads the four membership cells of a 2x2 block, left-to-right, top-to-bottom.
const noDiagonalTouchMachine = NFA.encodeSpec({
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
    return diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, geometry.numValues);
// Cells on the bottom/right edge start no 2x2 block, so the template at R1C1 is
// stamped onto the 64 cells that do start one.
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noDiagonalTouches = python.makeReplicate(
  new NFA(noDiagonalTouchMachine, 'no-touch',
    ...python.at(graph.block(gridCells[0], 2, 2))),
  python.at(blockOrigins));

// --- Blue squares: the digit equals the number of king neighbours on the
// python. Reads the digit, then each neighbour's membership.
const countMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };   // the blue digit
    const next = count + (value === ON ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry.numValues);
const blueCounts = blueCells.map(cell => new NFA(countMachine, 'blue-count',
  cell, ...python.at(graph.kingNeighbours(cell))));

// --- All possible blue squares are given: a cell with no blue fill that is off
// the python must NOT have the correct minesweeper total. Reads the cell's own
// membership, then its digit, then each king neighbour's membership.
const notBlueMachine = NFA.encodeSpec({
  startState: { phase: 'membership' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'membership':
        // The clause speaks only of cells that are not on the python.
        return value === ON ? { phase: 'exempt' } : { phase: 'digit' };
      case 'exempt':
        return { phase: 'exempt' };
      case 'digit':
        return { phase: 'count', target: value, count: 0 };
      case 'count': {
        const count = state.count + (value === ON ? 1 : 0);
        // The count only grows, so once past the digit it can never match it.
        return count > state.target
          ? { phase: 'exempt' }
          : { phase: 'count', target: state.target, count };
      }
    }
  },
  accept: (state) => state.phase === 'exempt'
    || (state.phase === 'count' && state.count !== state.target),
}, geometry.numValues);
const notBlueCounts = plainCells.map(cell => new NFA(notBlueMachine, 'not-blue',
  python.at(cell), cell, ...python.at(graph.kingNeighbours(cell))));

return [
  new Shape('9x9'),
  python.toVar('python'),
  ...Object.entries(givens).map(([cell, value]) => new Given(cell, value)),
  ...membership,
  // One python: the on-python cells form a single orthogonally-connected region.
  new ConnectedValues('VP', ON),
  ...degrees,
  noDiagonalTouches,
  ...blueCounts,
  ...notBlueCounts,
];
