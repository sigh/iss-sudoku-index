// Title: can i pet that dog!?
// Author: aqjhs
// Video: https://www.youtube.com/watch?v=-aGOCdPb5uU
// Source: https://sudokupad.app/7llvcaivec

// Rules encoded here:
//  - Normal sudoku.
//  - Doppel-Dog loop: one orthogonal, non-branching closed loop of cells that
//    does not cross or touch itself, not even diagonally. The rules state that
//    R6C6 and R6C7 (the dog cell and the cell its arrow points at) are on it.
//  - Adjacent digits along the loop differ by at least 5.
//  - Circled cells are off the loop, and a circle's digit counts how many of its
//    up-to-8 king neighbours are on the loop.
//  - A cell off the loop has value equal to its digit.
//  - Values in a cage sum to the cage total.
//  - A clue outside a row/column is the sum of the values of that line's loop
//    cells.
//
// Rule omitted: "A cell on the loop with a digit D will have a value equal to
// the cell D steps away along the loop in the orientation given by the arrow."
// A loop cell's value is left as a free 1-9 Var, which relaxes that rule rather
// than replacing it, so the cage totals and the outside clues are still enforced
// over the value layer. The arrow's orientation is used by no other rule, so it
// is omitted with it; the arrow's other content -- that R6C6 and R6C7 are on the
// loop -- is encoded.

const ON = 1;                  // loop-membership values, held in the VL Var cells
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// The loop-membership Var cell paired with each grid cell (VL1..VL81).
const loop = graph.makeOverlay('VL');

// Drawn clues.
const circles = ['R3C7', 'R7C6', 'R8C8', 'R9C6'];
const dogCells = ['R6C6', 'R6C7'];   // named in the rules text as on the loop
// Cage outlines and their printed totals, read off the drawn cages.
const cages = [
  { total: 3, cells: ['R1C3', 'R1C4', 'R1C5'] },
  { total: 18, cells: ['R2C1', 'R3C1'] },
  { total: 3, cells: ['R2C8', 'R2C9', 'R3C9'] },
  { total: 2, cells: ['R4C9', 'R5C9'] },
  { total: 18, cells: ['R6C2', 'R7C2'] },
  { total: 18, cells: ['R7C3', 'R8C3'] },
  { total: 5, cells: ['R7C8', 'R8C7', 'R8C8'] },
  { total: 15, cells: ['R8C4', 'R9C4'] },
  { total: 17, cells: ['R8C5', 'R9C5'] },
  { total: 4, cells: ['R8C6'] },
];
// Green numbers printed outside the frame: right of row 9, below column 8,
// below column 9.
const outsideClues = [
  { total: 18, cells: graph.row(9) },
  { total: 3, cells: graph.column(8) },
  { total: 3, cells: graph.column(9) },
];

// --- Loop membership: every cell is on (1) or off (2). ---
const membership = [
  loop.makeReplicate(new Given(loop.cells()[0], ON, OFF)),
  ...loop.at(circles).map(cell => new Given(cell, OFF)),
  ...loop.at(dogCells).map(cell => new Given(cell, ON)),
];

// --- Degree 2: each on cell has exactly two on-loop orthogonal neighbours. ---
// Reads the membership of the cell, then of each neighbour. Off cells are free.
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

// --- No diagonal self-touch: forbid a 2x2 whose only on cells are a diagonal. ---
// Two on-loop cells sharing only a corner are non-consecutive along the loop
// unless one of the other two cells of their 2x2 is the turn that joins them.
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
// One template on the top-left block, replicated to every other 2x2 block.
// Cells on the bottom/right edge start no 2x2 block.
const blockStarts = gridCells.filter(cell => graph.block(cell, 2, 2));
const noDiagonalTouches = loop.makeReplicate(
  new NFA(noDiagonalTouchMachine, 'no-touch',
    ...loop.at(graph.block(gridCells[0], 2, 2))),
  loop.at(blockStarts));

// --- Circle counts: the circle's digit equals the number of its king
// neighbours that are on the loop. Reads the digit, then each neighbour's
// membership, counting up to the digit and rejecting an overshoot.
const countMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };   // the circle's digit
    const next = count + (value === ON ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry.numValues);
const circleCounts = circles.map(cell => new NFA(countMachine, 'count',
  cell, ...loop.at(graph.kingNeighbours(cell))));

// --- Loop whispers: two on-loop cells that are orthogonally adjacent are
// consecutive along the loop (a degree-2 loop that never touches itself has no
// other way for two of its cells to be adjacent), so the >= 5 difference
// applies to exactly these pairs. Reads (membership, digit) for each cell; if
// either is off the loop the pair is unconstrained and the remaining symbols
// are absorbed by a skip countdown.
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
// Right/down steps only: each orthogonal pair is covered once. The step falls
// off the grid at the last column/row.
const whispers = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dR, dC]) => graph.step(cell, dR, dC))
  .filter(Boolean)
  .map(other => new NFA(whisperMachine, 'whisper',
    loop.at(cell), cell, loop.at(other), other)));

// --- Value layer. Only the cells a cage or an outside clue reads need a value,
// so the VV overlay covers exactly those, in grid order.
const cluedCells = new Set([
  ...cages.flatMap(cage => cage.cells),
  ...outsideClues.flatMap(clue => clue.cells),
]);
const valueCells = gridCells.filter(cell => cluedCells.has(cell));
const values = graph.makeOverlay('VV', valueCells);

// A cell off the loop has value equal to its digit; a loop cell's value is left
// free (see the omitted rule above). Reads (membership, digit, value).
const valueMachine = NFA.encodeSpec({
  startState: { phase: 'membership' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'membership':
        return value === ON ? { phase: 'skip', left: 2 } : { phase: 'digit' };
      case 'digit':
        return { phase: 'value', digit: value };
      case 'value':
        return value === state.digit ? { phase: 'done' } : undefined;
      case 'skip':
        return state.left > 1 ? { phase: 'skip', left: state.left - 1 } : { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
const valueLinks = valueCells.map(cell => new NFA(valueMachine, 'value',
  loop.at(cell), cell, values.at(cell)));

// --- Cage totals, over the value layer.
const cageSums = cages.map(cage => new Sum(cage.total, ...values.at(cage.cells)));

// --- Outside clues: the values of the line's loop cells sum to the total.
// Reads (membership, value) per cell along the line, accumulating the value only
// where the cell is on the loop. Values are at least 1, so a running total past
// the clue can never come back down and is rejected on the spot.
const outsideMachine = total => NFA.encodeSpec({
  // `on` is null while the next symbol is a membership flag, and holds that
  // flag while the next symbol is the paired value.
  startState: { sum: 0, on: null },
  transition: ({ sum, on }, value) => {
    if (on === null) return { sum, on: value === ON };
    const next = sum + (on ? value : 0);
    return next > total ? undefined : { sum: next, on: null };
  },
  accept: ({ sum, on }) => on === null && sum === total,
}, geometry.numValues);
const outsideSums = outsideClues.map(clue => new NFA(
  outsideMachine(clue.total), `outside-${clue.total}`,
  ...clue.cells.flatMap(cell => [loop.at(cell), values.at(cell)])));

return [
  new Shape('9x9'),
  loop.toVar('loop'),
  values.toVar('value'),
  ...membership,
  // Single loop: the on-loop cells form one orthogonally-connected region.
  // Connected plus 2-regular under orthogonal adjacency is one simple cycle.
  new ConnectedValues('VL', ON),
  ...degrees,
  noDiagonalTouches,
  ...circleCounts,
  ...whispers,
  ...valueLinks,
  ...cageSums,
  ...outsideSums,
];
