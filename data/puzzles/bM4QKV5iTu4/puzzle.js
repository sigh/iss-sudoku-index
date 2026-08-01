// Title: Rellik Loop
// Author: blackjackfitz
// Video: https://www.youtube.com/watch?v=bM4QKV5iTu4
// Source: https://sudokupad.app/ka3olc7kq1

// Standard Sudoku, the drawn killer cages and Kropki dots, and the loop's
// topology are encoded. The rule applying RellikCage to each loop segment
// discovered inside a box is omitted: its cell groups are not fixed by the art.

const ON = 1, OFF = 2;
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const loop = graph.makeOverlay('VL');
const gridCells = graph.cells();

// Purple diamond relliks transcribed from the drawn underlay marks.
const relliks = ['R1C1', 'R1C9', 'R2C6', 'R4C4', 'R6C1', 'R6C6', 'R7C2', 'R7C9', 'R9C3'];

// On cells have exactly two orthogonally adjacent on cells; off cells are free.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, count }, value) => {
    if (phase === 'start') return value === ON ? { phase: 'on', count: 0 } : { phase: 'off' };
    if (phase === 'off') return { phase: 'off' };
    const next = count + (value === ON ? 1 : 0);
    return next > 2 ? undefined : { phase: 'on', count: next };
  },
  accept: ({ phase, count }) => phase === 'off' || count === 2,
}, geometry.numValues);

// A diagonal-only pair of on cells in a 2x2 would be a diagonal self-touch.
const noDiagonalTouchMachine = NFA.encodeSpec({
  startState: { cells: [] },
  transition: ({ cells }, value) => {
    if (cells === null) return { cells: null };
    const next = [...cells, value === ON];
    if (next.length < 4) return { cells: next };
    const [a, b, c, d] = next;
    return (a && d && !b && !c) || (b && c && !a && !d) ? undefined : { cells: null };
  },
  accept: ({ cells }) => cells === null,
}, geometry.numValues);

const membership = [
  loop.makeReplicate(new Given(loop.cells()[0], ON, OFF)),
  ...relliks.map(cell => new Given(loop.at(cell), ON)),
];
const degrees = gridCells.map(cell => new NFA(
  degreeMachine, 'loop-degree', ...loop.at([cell, ...graph.neighbours(cell)])));
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noDiagonalTouches = loop.makeReplicate(
  new NFA(noDiagonalTouchMachine, 'loop-no-diagonal-touch',
    ...loop.at(graph.block(gridCells[0], 2, 2))),
  loop.at(blockOrigins));

return [
  new Shape('9x9'),
  new Cage(8, 'R2C1', 'R3C1', 'R3C2'),
  new Cage(32, 'R1C1', 'R1C2', 'R2C2', 'R2C3', 'R3C3'),
  new Cage(13, 'R8C1', 'R9C1', 'R9C2'),
  new Cage(22, 'R1C4', 'R1C5', 'R2C4'),
  new Cage(6, 'R4C8', 'R5C8', 'R5C9'),
  new Cage(19, 'R7C7', 'R7C8', 'R8C7', 'R8C8'),
  new BlackDot('R5C1', 'R6C1'),
  new BlackDot('R7C4', 'R7C5'),
  new BlackDot('R5C5', 'R5C6'),
  new WhiteDot('R6C6', 'R7C6'),
  loop.toVar('loop membership'),
  ...membership,
  new ConnectedValues('VL', ON),
  ...degrees,
  noDiagonalTouches,
];
