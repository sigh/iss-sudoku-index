// Title: Mad Mod Quad Loop
// Author: carabet/yttrio
// Video: https://www.youtube.com/watch?v=ZxBZiFb6VpE
// Source: https://sudokupad.app/nuf4q68voj

// Standard Sudoku, the four white dots, and the four black dots are encoded.
// Each listed quad contains its three displayed digits, and exactly one of its
// cells is on the loop. The loop is one orthogonally connected, non-self-touching
// cycle. Consecutive loop cells have distinct residues modulo 3, equivalent to
// every three consecutive loop digits containing [147], [258], and [369].
const ON = 1;
const OFF = 2;
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const loop = graph.makeOverlay('VL');

// Drawn white and black dot pairs from the source puzzle.
const whiteDots = [
  ['R6C7', 'R5C7'], ['R5C4', 'R5C5'], ['R4C6', 'R3C6'], ['R2C8', 'R1C8'],
];
const blackDots = [
  ['R7C3', 'R7C2'], ['R7C9', 'R8C9'], ['R4C9', 'R4C8'], ['R4C3', 'R5C3'],
];
const quads = [
  ['R1C2', '147'], ['R2C5', '258'], ['R3C3', '147'],
  ['R1C8', '369'], ['R5C2', '258'], ['R8C7', '369'],
].map(([topLeft, digits]) => [topLeft, [...digits].map(Number)]);

const membership = loop.makeReplicate(new Given(loop.cells()[0], ON, OFF));

// An on cell has exactly two on orthogonal neighbours; an off cell is ignored.
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
const degrees = gridCells.map(cell => new NFA(degreeMachine, 'degree',
  ...loop.at([cell, ...graph.neighbours(cell)])));

// A 2x2 block cannot have just its diagonal pair on the loop.
const noTouchMachine = NFA.encodeSpec({
  startState: { values: [] },
  transition: ({ values }, value) => {
    if (values === null) return { values: null };
    const next = [...values, value === ON];
    if (next.length < 4) return { values: next };
    const [a, b, c, d] = next;
    return (a && d && !b && !c) || (b && c && !a && !d) ? undefined : { values: null };
  },
  accept: ({ values }) => values === null,
}, geometry.numValues);
const noTouches = loop.makeReplicate(
  new NFA(noTouchMachine, 'no-touch', ...loop.at(graph.block('R1C1', 2, 2))),
  loop.at(gridCells.filter(cell => graph.step(cell, 1, 1))));

// Each four-cell quad has exactly one loop member.
const quadEntryMachine = NFA.encodeSpec({
  startState: { count: 0 },
  transition: ({ count }, value) => {
    const next = count + (value === ON ? 1 : 0);
    return next > 1 ? undefined : { count: next };
  },
  accept: ({ count }) => count === 1,
}, geometry.numValues);
const quadEntries = quads.map(([topLeft]) => new NFA(quadEntryMachine, 'quad-entry',
  ...loop.at(graph.block(topLeft, 2, 2))));

// An on cell and its two on-loop neighbours occupy all three modulo-3 classes.
const modularTripleMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, residues, neighbourOn }, value) => {
    if (phase === 'start') return value === ON ? { phase: 'own-digit' } : { phase: 'off' };
    if (phase === 'off') return { phase: 'off' };
    if (phase === 'own-digit') return { phase: 'membership', residues: 1 << ((value - 1) % 3) };
    if (phase === 'membership') {
      return { phase: 'digit', residues, neighbourOn: value === ON };
    }
    const next = neighbourOn ? residues | (1 << ((value - 1) % 3)) : residues;
    return { phase: 'membership', residues: next };
  },
  accept: ({ phase, residues }) => phase === 'off' || (phase === 'membership' && residues === 0b111),
}, geometry.numValues);
const modularTriples = gridCells.map(cell => new NFA(modularTripleMachine, 'modular-triple',
  loop.at(cell), cell, ...graph.neighbours(cell).flatMap(neighbour => [loop.at(neighbour), neighbour])));

return [
  new Shape('9x9'),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...quads.map(([topLeft, values]) => new Quad(topLeft, ...values)),
  loop.toVar('loop'),
  membership,
  new ConnectedValues('VL', ON),
  ...degrees,
  noTouches,
  ...quadEntries,
  ...modularTriples,
];
