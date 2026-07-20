// Title: Loopy Circles
// Author: Scojo
// Video: https://www.youtube.com/watch?v=saDN6vul51A
// Source: https://sudokupad.app/2vyqqhy6ky

// VL stores loop membership for each grid cell: 1 = on, 2 = off. Since the
// loop cannot touch itself, every orthogonally adjacent pair of on cells is a
// loop edge. Degree 2 plus one connected on-region therefore forms one cycle.

const ON = 1;
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const loop = graph.makeOverlay('VL');

const circles = [
  'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9',
  'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9',
  'R9C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2', 'R9C1',
  'R8C1', 'R7C1', 'R6C1', 'R5C1', 'R4C1', 'R3C1', 'R2C1',
  'R2C5', 'R5C4', 'R7C3', 'R8C7', 'R3C8', 'R5C3', 'R7C2',
  'R8C8', 'R2C6', 'R3C3', 'R5C2', 'R6C5', 'R2C2', 'R6C7',
  'R3C6', 'R4C5', 'R2C4', 'R4C7', 'R5C6', 'R8C5', 'R7C4',
];

const whiteDots = [
  ['R1C3', 'R2C3'], ['R5C3', 'R5C4'], ['R9C2', 'R9C3'],
  ['R9C3', 'R9C4'], ['R9C5', 'R9C6'], ['R2C9', 'R3C9'],
  ['R3C5', 'R4C5'], ['R6C7', 'R6C8'], ['R8C1', 'R9C1'],
];
const blackDots = [
  ['R3C1', 'R3C2'], ['R8C5', 'R9C5'], ['R3C2', 'R4C2'],
  ['R1C8', 'R1C9'], ['R7C8', 'R7C9'],
];

const membership = loop.makeReplicate(new Given(loop.cells()[0], ON, OFF));

// Each on cell has exactly two orthogonal on-neighbours; off cells are free.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'cell' },
  transition: ({ phase, count }, value) => {
    if (phase === 'cell') {
      return value === ON ? { phase: 'neighbours', count: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const next = count + (value === ON ? 1 : 0);
    return next > 2 ? undefined : { phase: 'neighbours', count: next };
  },
  accept: ({ phase, count }) => phase === 'off' || count === 2,
}, geometry.numValues);
const degrees = gridCells.map(cell => new NFA(
  degreeMachine,
  'loop degree',
  ...loop.at([cell, ...graph.neighbours(cell)]),
));

// Two diagonal on-cells with the other two off are separate loop portions
// touching at a corner. Three on-cells are an ordinary turn and are allowed.
const noDiagonalTouchMachine = NFA.encodeSpec({
  startState: { block: [] },
  transition: ({ block }, value) => {
    if (block === null) return { block: null };
    const next = [...block, value === ON];
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
const noDiagonalTouches = loop.makeReplicate(
  new NFA(
    noDiagonalTouchMachine,
    'no diagonal touch',
    ...loop.at(graph.block(gridCells[0], 2, 2)),
  ),
  loop.at(blockOrigins),
);

// For each digit and each side of the loop, its occurrence count among circles
// is either zero or that digit. This is equivalent to applying the circle clue
// at every circled cell, while avoiding one duplicate count machine per circle.
function circleCountMachine(targetDigit, targetMembership) {
  return NFA.encodeSpec({
    startState: { phase: 'digit', count: 0, matchesDigit: false },
    transition: ({ phase, count, matchesDigit }, value) => {
      if (phase === 'digit') {
        return { phase: 'membership', count, matchesDigit: value === targetDigit };
      }
      const next = count + (matchesDigit && value === targetMembership ? 1 : 0);
      return next > targetDigit
        ? undefined
        : { phase: 'digit', count: next, matchesDigit: false };
    },
    accept: ({ phase, count }) =>
      phase === 'digit' && (count === 0 || count === targetDigit),
  }, geometry.numValues);
}
const circleScan = circles.flatMap(cell => [cell, loop.at(cell)]);
const circleCounts = [ON, OFF].flatMap(membershipValue =>
  Array.from({ length: 9 }, (_, index) => index + 1).map(digit => new NFA(
    circleCountMachine(digit, membershipValue),
    `circle count ${digit} side ${membershipValue}`,
    ...circleScan,
  )));

const whiteDotSides = whiteDots.map(cells => new SameValues(
  2,
  ...loop.at(cells),
));
const blackDotSides = blackDots.map(cells => new AllDifferent(
  ...loop.at(cells),
));

return [
  new Shape('9x9'),
  loop.toVar('loop membership'),
  membership,
  new ConnectedValues('VL', ON),
  ...degrees,
  noDiagonalTouches,
  ...circleCounts,
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...whiteDotSides,
  ...blackDotSides,
];
