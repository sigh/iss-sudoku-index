// Title: Multiverse
// Author: Jonesy
// Video: https://www.youtube.com/watch?v=4cG7ceU5Adk
// Source: https://sudokupad.app/pgLhjFH3bR

// Normal Sudoku. A one-cell-wide orthogonal loop is a single connected,
// degree-2 set of cells with no diagonal self-touch. Circles are off the loop;
// their digits count equal circled digits and their king-neighbours on the loop.
// Consecutive loop cells differ by at least 5. White/black dots are consecutive/
// 1:2-ratio pairs.
const ON = 1;
const OFF = 2;
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const loop = graph.makeOverlay('VL');
const gridCells = graph.cells();

// Circle locations from the ten drawn circular underlays.
const circles = ['R2C1', 'R3C3', 'R3C8', 'R4C3', 'R4C6',
  'R6C1', 'R6C4', 'R6C5', 'R7C7', 'R8C1'];

const membership = [
  loop.makeReplicate(new Given(loop.cells()[0], ON, OFF)),
  ...loop.at(circles).map(cell => new Given(cell, OFF)),
];

// The state counts orthogonally adjacent ON cells around each ON cell.
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

// A 2x2 cannot consist of precisely two diagonally opposite loop cells.
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
const noDiagonalTouchOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noDiagonalTouches = loop.makeReplicate(
  new NFA(noDiagonalTouchMachine, 'no-touch', ...loop.block('VL1', 2, 2)),
  loop.at(noDiagonalTouchOrigins));

// The circle digit is followed by its king-neighbours' loop-membership values.
const circleCountMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (value === ON ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry.numValues);
const circleCounts = circles.map(cell => new NFA(circleCountMachine, 'circle-count',
  cell, ...loop.at(graph.kingNeighbours(cell))));

// For an orthogonal pair, skip it unless both cells are on the loop; otherwise
// reject digit differences below 5.
const loopDifferenceMachine = NFA.encodeSpec({
  startState: { phase: 'firstMembership' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'firstMembership':
        return value === ON ? { phase: 'firstDigit' } : { phase: 'skip', left: 3 };
      case 'firstDigit':
        return { phase: 'secondMembership', firstDigit: value };
      case 'secondMembership':
        return value === ON
          ? { phase: 'secondDigit', firstDigit: state.firstDigit }
          : { phase: 'skip', left: 1 };
      case 'secondDigit':
        return Math.abs(state.firstDigit - value) >= 5 ? { phase: 'done' } : undefined;
      case 'skip':
        return state.left > 1 ? { phase: 'skip', left: state.left - 1 } : { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
const loopDifferences = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dR, dC]) => graph.step(cell, dR, dC))
  .filter(Boolean)
  .map(other => new NFA(loopDifferenceMachine, 'loop-difference',
    loop.at(cell), cell, loop.at(other), other)));

// The five drawn edge dots, grouped by their stated colour and rule.
const whiteDots = [
  new WhiteDot('R8C3', 'R8C4'),
  new WhiteDot('R8C6', 'R9C6'),
  new WhiteDot('R5C6', 'R6C6'),
];
const blackDots = [
  new BlackDot('R6C1', 'R6C2'),
  new BlackDot('R3C3', 'R4C3'),
];

return [
  new Shape('9x9'),
  loop.toVar('loop'),
  ...membership,
  new ConnectedValues('VL', ON),
  ...degrees,
  noDiagonalTouches,
  new CountingCircles(...circles),
  ...circleCounts,
  ...loopDifferences,
  ...whiteDots,
  ...blackDots,
];
