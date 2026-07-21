// Title: Pointer Arrow Parity Loop
// Author: yttrio
// Video: https://www.youtube.com/watch?v=xtjZW1-ZFXs
// Source: https://sudokupad.app/gx4a6r7xzq

// A binary overlay records loop membership. Degree two plus orthogonal
// connectivity makes the selected cells one cycle; the 2x2 checks prevent
// diagonal self-touch. Conditional edge NFAs enforce alternating parity.

const ON = 1;
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const loop = graph.makeOverlay('VL');

const arrows = [
  {
    bulb: 'R1C1',
    shaft: ['R2C2', 'R2C3'],
    targets: ['R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R2C9'],
  },
  {
    bulb: 'R4C1',
    shaft: ['R3C2', 'R4C3'],
    targets: ['R5C4', 'R6C5', 'R7C6', 'R8C7', 'R9C8'],
  },
  {
    bulb: 'R5C2',
    shaft: ['R6C3', 'R7C4'],
    targets: ['R8C5', 'R9C6'],
  },
  {
    bulb: 'R4C4',
    shaft: ['R5C5', 'R6C4'],
    targets: ['R7C3', 'R8C2', 'R9C1'],
  },
  {
    bulb: 'R1C4',
    shaft: ['R1C5', 'R2C5'],
    targets: ['R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5', 'R9C5'],
  },
  {
    bulb: 'R9C6',
    shaft: ['R8C7', 'R7C7'],
    targets: ['R6C7', 'R5C7', 'R4C7', 'R3C7', 'R2C7', 'R1C7'],
  },
  {
    bulb: 'R3C9',
    shaft: ['R4C9', 'R4C8'],
    targets: ['R4C7', 'R4C6', 'R4C5', 'R4C4', 'R4C3', 'R4C2', 'R4C1'],
  },
];

const membership = loop.makeReplicate(
  new Given(loop.cells()[0], ON, OFF));

const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'center' },
  transition: ({ phase, count }, value) => {
    if (phase === 'center') {
      return value === ON
        ? { phase: 'neighbours', count: 0 }
        : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const next = count + (value === ON ? 1 : 0);
    return next <= 2
      ? { phase: 'neighbours', count: next }
      : undefined;
  },
  accept: ({ phase, count }) => phase === 'off' || count === 2,
}, geometry.numValues);
const degrees = gridCells.map(cell => new NFA(
  degreeMachine,
  'loop degree',
  ...loop.at([cell, ...graph.neighbours(cell)]),
));

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
    'no diagonal loop touch',
    ...loop.at(graph.block(gridCells[0], 2, 2)),
  ),
  loop.at(blockOrigins),
);

// Reads membership and digit for each end of an orthogonal edge. If both cells
// are on the loop, their digits must have opposite parity.
const parityMachine = NFA.encodeSpec({
  startState: { phase: 'aMembership' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'aMembership':
        return value === ON
          ? { phase: 'aDigit' }
          : { phase: 'skip', left: 3 };
      case 'aDigit':
        return { phase: 'bMembership', parity: value % 2 };
      case 'bMembership':
        return value === ON
          ? { phase: 'bDigit', parity: state.parity }
          : { phase: 'skip', left: 1 };
      case 'bDigit':
        return value % 2 !== state.parity ? { phase: 'done' } : undefined;
      case 'skip':
        return state.left > 1
          ? { phase: 'skip', left: state.left - 1 }
          : { phase: 'done' };
      case 'done':
        return { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
const parityEdges = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dRow, dCol]) => graph.step(cell, dRow, dCol))
  .filter(Boolean)
  .map(other => new NFA(
    parityMachine,
    'loop parity',
    loop.at(cell), cell, loop.at(other), other,
  )));

// Target n is n steps beyond the tip, contains the bulb digit, and lies on the
// loop. The alternatives are sourced directly from each arrow's forward ray.
const pointerRules = arrows.map(({ bulb, shaft, targets }) => new Or(
  targets.map((target, index) => new And([
    new Given(shaft[shaft.length - 1], index + 1),
    // Two one-cell sets must contain the same value.
    new SameValues(2, bulb, target),
    new Given(loop.at(target), ON),
  ])),
));

return [
  new Shape('9x9'),
  loop.toVar('loop membership'),
  membership,
  new ConnectedValues('VL', ON),
  ...degrees,
  noDiagonalTouches,
  ...parityEdges,
  ...arrows.map(({ bulb }) => new Given(loop.at(bulb), ON)),
  ...arrows.map(({ bulb, shaft }) => new Arrow(bulb, ...shaft)),
  ...pointerRules,
];
