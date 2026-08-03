// Title: Polarity Loop
// Author: yttrio
// Video: https://www.youtube.com/watch?v=OpVCpxuCP98
// Source: https://app.crackingthecryptic.com/sudoku/38RpDFhqDm
//
// Standard 9x9 sudoku. Digits in cages cannot repeat and must sum to the
// cage's total. Cells separated by a white dot are consecutive (undrawn dots
// carry no information). Draw a one-cell-wide loop of orthogonally connected
// cells that does not branch or touch itself, not even diagonally; the loop
// must occupy every cage cell, and may include other cells too (which ones,
// if any, is for the solver to work out). Along the loop, adjacent digits
// alternate polarity: one low (1-4), one high (6-9) -- so digit 5, being
// neither, can never sit on the loop.
//
// Loop membership is a Var cell per grid cell (1 = on, 2 = off), shaped into
// a single cycle by the same degree-2 + no-diagonal-touch pattern as the
// other loop scripts (nordschleife.js, loop_entropic.js). Because degree-2
// makes "both cells ON and orthogonally adjacent" exactly the loop's own path
// edges, the polarity rule only needs to scan each orthogonal pair once.

const ON = 1;                  // loop-membership values, stored in the Var cells
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

// The loop-membership Var cell paired with each grid cell (VL1..VL81, in grid order).
const loop = graph.makeOverlay('VL');
const gridCells = graph.cells();

// --- Cages: killer cages (distinct + sum to total). Cage cells from the
// source's `cages` array (top-left cell carries the printed total).
const cages = [
  new Cage(7, 'R1C1', 'R1C2'),
  new Cage(13, 'R1C8', 'R1C9'),
  new Cage(7, 'R8C7', 'R8C8'),
  new Cage(7, 'R3C5', 'R4C5'),
  new Cage(13, 'R9C2', 'R9C3'),
];
const cageCells = cages.flatMap(c => c.cells);

// --- White dots (Kropki consecutive), edges from the source's `overlays`
// array (edge-sized white-filled rounded marks).
const whiteDots = [
  new WhiteDot('R5C3', 'R6C3'),
  new WhiteDot('R4C3', 'R4C4'),
  new WhiteDot('R8C6', 'R9C6'),
  new WhiteDot('R5C5', 'R6C5'),
  new WhiteDot('R3C7', 'R4C7'),
  new WhiteDot('R6C6', 'R6C7'),
];

// --- Loop membership: restrict every VL cell's domain to {ON, OFF} (the
// overlay otherwise inherits the full 1-9 grid range), then force every cage
// cell onto the loop ("the loop must occupy all cells of all given cages").
// No other cell is fixed either way.
const membership = [
  loop.makeReplicate(new Given(loop.cells()[0], ON, OFF)),
  ...cageCells.map(cell => new Given(loop.at(cell), ON)),
];

// --- Degree 2: each on cell has exactly two on-loop orthogonal neighbours. ---
// Reads the membership of the cell, then of each neighbour. Off cells are free.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, membershipValue) => {
    if (phase === 'start') {
      return membershipValue === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (membershipValue === ON ? 1 : 0);
    return count > 2 ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === 2,
}, geometry.numValues);
const degrees = gridCells.map(cell => new NFA(degreeMachine, 'degree',
  ...loop.at([cell, ...graph.neighbours(cell)])));

// --- No diagonal self-touch: forbid a 2x2 whose only on cells are a diagonal. ---
// Reads the four membership cells of a 2x2 block, left-to-right, top-to-bottom.
const noDiagonalTouchMachine = NFA.encodeSpec({
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
// Same 4-cell shape at every valid top-left, so one Replicate stamps all 64
// blocks instead of 64 near-identical NFA constraints.
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const firstBlock = graph.block(blockOrigins[0], 2, 2);
const noDiagonalTouches = loop.makeReplicate(
  [new NFA(noDiagonalTouchMachine, 'no-touch', ...loop.at(firstBlock))],
  loop.at(blockOrigins),
);

// --- Polarity alternation: for two orthogonally adjacent on-loop cells, one
// must be low (1-4) and the other high (6-9); 5 is neither, so it rejects any
// edge touching a 5, which forces 5 off the loop entirely. Reads
// (membership, digit) for each cell of the pair; off cells are unconstrained.
const groupOf = digit => (digit <= 4 ? 'LOW' : digit >= 6 ? 'HIGH' : null);
const polarityMachine = NFA.encodeSpec({
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
      case 'bDigit': {
        const aGroup = groupOf(state.aDigit);
        const bGroup = groupOf(value);
        return (aGroup && bGroup && aGroup !== bGroup) ? { phase: 'done' } : undefined;
      }
      case 'skip':
        return state.left > 1 ? { phase: 'skip', left: state.left - 1 } : { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
// Right/down steps only: each orthogonal pair is covered once.
const polarities = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dR, dC]) => graph.step(cell, dR, dC))
  .filter(Boolean)
  .map(other => new NFA(polarityMachine, 'polarity',
    loop.at(cell), cell, loop.at(other), other)));

return [
  new Shape('9x9'),
  loop.toVar('loop'),
  ...cages,
  ...whiteDots,
  ...membership,
  // Single loop: the on-loop cells form one orthogonally-connected region.
  new ConnectedValues('VL', ON),
  ...degrees,
  noDiagonalTouches,
  ...polarities,
];
