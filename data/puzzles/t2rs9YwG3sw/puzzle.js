// Title: Bosnian Whisper
// Author: Cale Schoon
// Video: https://www.youtube.com/watch?v=t2rs9YwG3sw
// Source: https://sudokupad.app/2oxam110an

// Normal 9x9 Sudoku applies. A one-cell-wide orthogonal loop neither branches
// nor touches itself diagonally. Circled cells are off the loop and count their
// king-neighbour loop cells. Adjacent digits on the loop differ by at least 5.

const ON = 1;
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const loop = graph.makeOverlay('VL');
const gridCells = graph.cells();
const circles = ['R3C1', 'R4C2', 'R4C3', 'R4C7'];

// The loop is a membership overlay: 1 is on the loop and 2 is off it.
const origin = loop.cells()[0];
const membership = [
  loop.makeReplicate(new Given(origin, ON, OFF)),
  ...loop.at(circles).map(cell => new Given(cell, OFF)),
];

// An on cell has exactly two orthogonal on neighbours; off cells are unrestricted.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, count }, membershipValue) => {
    if (phase === 'start') {
      return membershipValue === ON ? { phase: 'on', count: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const next = count + (membershipValue === ON ? 1 : 0);
    return next > 2 ? undefined : { phase: 'on', count: next };
  },
  accept: ({ phase, count }) => phase === 'off' || count === 2,
}, geometry.numValues);
const degrees = gridCells.map(cell => new NFA(
  degreeMachine, 'loop degree', ...loop.at([cell, ...graph.neighbours(cell)])));

// A 2x2 block may not have exactly its two diagonal cells on the loop.
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
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noDiagonalTouches = loop.makeReplicate(new NFA(
  noDiagonalTouchMachine, 'no diagonal touch', ...loop.at(graph.block('R1C1', 2, 2))),
loop.at(blockOrigins));

// Each circle's grid digit equals its number of king-neighbour loop cells.
const countMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (value === ON ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry.numValues);
const circleCounts = circles.map(cell => new NFA(
  countMachine, 'circle count', cell, ...loop.at(graph.kingNeighbours(cell))));

// On each row and column, read membership/digit pairs in order. Consecutive
// on-loop cells must have German-whisper difference at least 5.
const whisperMachine = NFA.encodeSpec({
  startState: { phase: 'membership', previousMembership: null, previousDigit: null },
  transition: (state, value) => {
    switch (state.phase) {
      case 'membership':
        return { ...state, phase: 'digit', currentMembership: value };
      case 'digit':
        if (state.previousMembership === ON && state.currentMembership === ON &&
            Math.abs(state.previousDigit - value) < 5) return undefined;
        return {
          phase: 'membership',
          previousMembership: state.currentMembership,
          previousDigit: value,
        };
    }
  },
  accept: ({ phase }) => phase === 'membership',
}, geometry.numValues);
const whispers = [
  ...graph.rows().map(row => new NFA(
    whisperMachine, 'row loop whisper', ...row.flatMap(cell => [loop.at(cell), cell]))),
  ...graph.columns().map(column => new NFA(
    whisperMachine, 'column loop whisper', ...column.flatMap(cell => [loop.at(cell), cell]))),
];

return [
  new Shape('9x9'),
  new Given('R4C6', 2),
  new Given('R5C7', 6),
  loop.toVar('loop membership'),
  ...membership,
  // One connected 2-regular on-cell region is a single loop.
  new ConnectedValues('VL', ON),
  ...degrees,
  noDiagonalTouches,
  ...circleCounts,
  ...whispers,
];
