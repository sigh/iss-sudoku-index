// Title: Loop Limit
// Author: Dorlir and Marty Sears
// Video: https://www.youtube.com/watch?v=hgx0Rso7JNs
// Source: https://sudokupad.app/uy5efqsnus

// Standard Sudoku. A one-cell-wide orthogonal loop passes through every
// thermometer bulb without diagonal self-touch. Every digit used on the loop
// occurs either zero times or exactly that many times on the loop. Thermometers
// increase from their grey-circle bulbs; the four drawn white dots are consecutive.
const ON = 1;
const OFF = 2;
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const loop = graph.makeOverlay('VL');
const cells = graph.cells();

// The grey-circle bulb cells, transcribed from the drawn thermometer starts.
const bulbs = ['R1C1', 'R1C5', 'R1C9', 'R3C8', 'R5C1', 'R6C2', 'R5C9', 'R9C4', 'R9C1', 'R9C6', 'R9C8'];
const thermos = [
  ['R1C1', 'R1C2', 'R2C1'], ['R1C5', 'R2C4', 'R2C3'], ['R1C9', 'R2C9', 'R1C8'],
  ['R3C8', 'R4C7'], ['R5C1', 'R4C1'], ['R6C2', 'R5C2'],
  ['R5C9', 'R6C9', 'R7C9'], ['R9C4', 'R8C4', 'R7C4', 'R6C4'],
  ['R9C1', 'R8C2', 'R9C3', 'R9C2'], ['R9C6', 'R8C6'],
  ['R9C8', 'R8C8', 'R9C9', 'R8C9'],
];

// Each loop cell has exactly two orthogonal loop neighbours; off-loop cells do not.
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
// Replicate each degree shape over cells with the same boundary position.
const interiorCells = cells.filter(cell => !/^R[19]C|C[19]$/.test(cell));
const degreeAt = cell => new NFA(degreeMachine, 'loop-degree', ...loop.at([cell, ...graph.neighbours(cell)]));
const replicateDegree = (origin, targets) => new Replicate(
  [degreeAt(origin)],
  Replicate.encodeTargetCells(loop.at(targets), loop.at(origin), loop),
  loop.at(origin),
);
const degrees = [
  replicateDegree('R2C2', interiorCells),
  replicateDegree('R1C2', cells.filter(cell => /^R1C[2-8]$/.test(cell))),
  replicateDegree('R9C2', cells.filter(cell => /^R9C[2-8]$/.test(cell))),
  replicateDegree('R2C1', cells.filter(cell => /^R[2-8]C1$/.test(cell))),
  replicateDegree('R2C9', cells.filter(cell => /^R[2-8]C9$/.test(cell))),
  degreeAt('R1C1'), degreeAt('R1C9'), degreeAt('R9C1'), degreeAt('R9C9'),
];

// A diagonal pair alone in a 2x2 would be a forbidden diagonal self-touch.
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
const blockOrigins = cells.filter(cell => graph.block(cell, 2, 2));
const noTouches = loop.makeReplicate(
  new NFA(noTouchMachine, 'no-diagonal-touch', ...loop.at(graph.block('R1C1', 2, 2))),
  loop.at(blockOrigins));

// For a fixed digit d, scan (membership, digit) pairs: d appears on the loop
// either not at all or exactly d times. The count is capped once it exceeds d.
const digitCountMachine = digit => NFA.encodeSpec({
  startState: { readMembership: true, on: false, count: 0 },
  transition: ({ readMembership, on, count }, value) => {
    if (readMembership) return { readMembership: false, on: value === ON, count };
    const next = count + (on && value === digit ? 1 : 0);
    return next > digit ? undefined : { readMembership: true, on: false, count: next };
  },
  accept: ({ readMembership, count }) => readMembership && (count === 0 || count === digit),
}, geometry.numValues);
const digitCounts = Array.from({ length: 9 }, (_, index) => {
  const digit = index + 1;
  return new NFA(digitCountMachine(digit), `loop-${digit}-count`, ...cells.flatMap(cell => [loop.at(cell), cell]));
});

const whiteDots = [['R1C7', 'R2C7'], ['R4C6', 'R5C6'], ['R4C7', 'R4C8'], ['R8C2', 'R8C3']];

return [
  new Shape('9x9'),
  loop.toVar('loop'),
  loop.makeReplicate(new Given(loop.cells()[0], ON, OFF)),
  ...bulbs.map(cell => new Given(loop.at(cell), ON)),
  new ConnectedValues('VL', ON),
  ...degrees,
  noTouches,
  ...digitCounts,
  ...thermos.map(cells => new Thermo(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
];
