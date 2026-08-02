// Title: Factory Loop
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=DnfTWZ5XQfA
// Source: https://sudokupad.app/dk7jgt7xov

// Rules encoded here:
//   Standard 9x9 Sudoku. Draw a single, orthogonal, one-cell-wide loop which
//   cannot touch itself, even diagonally. Green circles are on the loop and
//   count loop cells in their box; red squares are off the loop and count
//   non-loop cells in their box. Consecutive loop digits divide one another.

const ON = 1;
const OFF = 2;
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const loop = graph.makeOverlay('VL');
const gridCells = graph.cells();

// Drawn green circles and red squares, transcribed from the coloured overlays.
const circles = ['R1C1', 'R4C1', 'R9C7'];
const squares = ['R2C3', 'R8C5'];
const boxOf = cell => {
  const { row, col } = parseCellId(cell);
  return 1 + 3 * Math.floor((row - 1) / 3) + Math.floor((col - 1) / 3);
};

const membership = [
  loop.makeReplicate(new Given(loop.cells()[0], ON, OFF)),
  ...loop.at(circles).map(cell => new Given(cell, ON)),
  ...loop.at(squares).map(cell => new Given(cell, OFF)),
];

// An on-loop cell has exactly two orthogonal on-loop neighbours; off-loop cells
// are unrestricted. Together with connectivity, this makes one closed loop.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, value) => {
    if (phase === 'start') {
      return value === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (value === ON ? 1 : 0);
    return count > 2 ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === 2,
}, geometry.numValues);
// The 49 interior cells share the same four-neighbour pattern, so one template
// is replicated across them; border cells retain their smaller individual scans.
const degreeTemplateCell = 'R2C2';
const interiorDegrees = loop.makeReplicate(new NFA(degreeMachine, 'degree',
  ...loop.at([degreeTemplateCell, ...graph.neighbours(degreeTemplateCell)])),
loop.at(graph.block('R1C1', 7, 7)));
const borderDegrees = gridCells
  .filter(cell => {
    const { row, col } = parseCellId(cell);
    return row === 1 || row === 9 || col === 1 || col === 9;
  })
  .map(cell => new NFA(degreeMachine, 'degree',
    ...loop.at([cell, ...graph.neighbours(cell)])));

// A 2x2 may not contain precisely its diagonal pair as loop cells.
const noDiagonalTouchMachine = NFA.encodeSpec({
  startState: { cells: [] },
  transition: ({ cells }, value) => {
    if (cells === null) return { cells: null };
    const next = [...cells, value === ON];
    if (next.length < 4) return { cells: next };
    const [a, b, c, d] = next;
    return (a && d && !b && !c) || (b && c && !a && !d)
      ? undefined : { cells: null };
  },
  accept: ({ cells }) => cells === null,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noDiagonalTouches = loop.makeReplicate(new NFA(
  noDiagonalTouchMachine, 'no-touch', ...loop.at(graph.block('R1C1', 2, 2))),
loop.at(blockOrigins));

// The marked cell's digit is compared with the count of the requested membership
// value across its ordinary 3x3 box, including the marked cell itself.
const boxCountMachine = targetMembership => NFA.encodeSpec({
  startState: { target: null, count: 0, seen: 0 },
  transition: ({ target, count, seen }, value) => {
    if (target === null) return { target: value, count: 0, seen: 0 };
    const next = count + (value === targetMembership ? 1 : 0);
    return next > target ? undefined : { target, count: next, seen: seen + 1 };
  },
  accept: ({ target, count, seen }) => seen === 9 && count === target,
  maxDepth: 10,
}, geometry.numValues);
const circleCounts = circles.map(cell => new NFA(boxCountMachine(ON), 'circle-count',
  cell, ...loop.at(graph.box(boxOf(cell)))));
const squareCounts = squares.map(cell => new NFA(boxCountMachine(OFF), 'square-count',
  cell, ...loop.at(graph.box(boxOf(cell)))));

// Each orthogonally adjacent pair is considered once. If both cells are on the
// loop, their digits must be integer multiples in one direction.
const multipleMachine = NFA.encodeSpec({
  startState: { phase: 'aOn' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'aOn':
        return value === ON ? { phase: 'aDigit' } : { phase: 'skip', left: 3 };
      case 'aDigit': return { phase: 'bOn', aDigit: value };
      case 'bOn':
        return value === ON ? { phase: 'bDigit', aDigit: state.aDigit }
          : { phase: 'skip', left: 1 };
      case 'bDigit':
        return state.aDigit % value === 0 || value % state.aDigit === 0
          ? { phase: 'done' } : undefined;
      case 'skip':
        return state.left > 1 ? { phase: 'skip', left: state.left - 1 } : { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
const multiples = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dRow, dCol]) => graph.step(cell, dRow, dCol))
  .filter(Boolean)
  .map(other => new NFA(multipleMachine, 'multiple',
    loop.at(cell), cell, loop.at(other), other)));

return [
  new Shape('9x9'),
  loop.toVar('loop membership'),
  ...membership,
  new ConnectedValues('VL', ON),
  interiorDegrees,
  ...borderDegrees,
  noDiagonalTouches,
  ...circleCounts,
  ...squareCounts,
  ...multiples,
];
