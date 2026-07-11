// Title: Splatter Code
// Author: Vythic
// Video: https://www.youtube.com/watch?v=KN5Eobhkhe4
// Source: https://sudokupad.app/0ugsgegaxv

// Chaos construction: nine hidden orthogonally-connected nine-cell regions,
// with rows, columns, and regions containing 1-9. No givens. A digit on a
// small arrow counts the cells immediately beyond the arrow that belong to
// the arrow cell's region. The blue summit loop ascends or descends, with 1
// and 9 reversing the direction of travel. X pairs sum to 10, V pairs to 5.

const graph = cellGraph('9x9');

const summitLine = [
  'R8C1', 'R9C2', 'R8C3', 'R9C4', 'R8C5', 'R9C6', 'R8C7', 'R9C8',
  'R8C9', 'R7C8', 'R6C9', 'R5C8', 'R4C9', 'R3C8', 'R2C9', 'R1C8',
  'R2C7', 'R1C6', 'R2C5', 'R1C4', 'R2C3', 'R1C2', 'R2C1', 'R3C2',
  'R4C1', 'R5C2', 'R6C1', 'R7C2', 'R8C1',
];

const chaosArrows = [
  { origin: 'R2C1', arm: ['R2C1', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R2C9'] },
  { origin: 'R8C7', arm: ['R8C7', 'R8C8', 'R8C9'] },
  { origin: 'R1C5', arm: ['R1C5', 'R2C6', 'R3C7', 'R4C8', 'R5C9'] },
  { origin: 'R5C6', arm: ['R5C6', 'R6C7', 'R7C8', 'R8C9'] },
  { origin: 'R6C4', arm: ['R6C4', 'R7C5', 'R8C6', 'R9C7'] },
  { origin: 'R2C7', arm: ['R2C7', 'R3C7', 'R4C7', 'R5C7', 'R6C7', 'R7C7', 'R8C7', 'R9C7'] },
  { origin: 'R4C9', arm: ['R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9'] },
  { origin: 'R5C4', arm: ['R5C4', 'R6C4', 'R7C4', 'R8C4', 'R9C4'] },
  { origin: 'R4C1', arm: ['R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1'] },
  { origin: 'R9C3', arm: ['R9C3', 'R9C2', 'R9C1'] },
  { origin: 'R6C3', arm: ['R6C3', 'R5C2', 'R4C1'] },
  { origin: 'R7C2', arm: ['R7C2', 'R6C2', 'R5C2', 'R4C2', 'R3C2', 'R2C2', 'R1C2'] },
  { origin: 'R4C2', arm: ['R4C2', 'R3C2', 'R2C2', 'R1C2'] },
  { origin: 'R7C3', arm: ['R7C3', 'R6C3', 'R5C3', 'R4C3', 'R3C3', 'R2C3', 'R1C3'] },
  { origin: 'R4C8', arm: ['R4C8', 'R3C8', 'R2C8', 'R1C8'] },
  { origin: 'R2C5', arm: ['R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5', 'R9C5'] },
  { origin: 'R5C9', arm: ['R5C9', 'R6C8', 'R7C7', 'R8C6', 'R9C5'] },
  { origin: 'R1C6', arm: ['R1C6', 'R1C5', 'R1C4', 'R1C3', 'R1C2', 'R1C1'] },
];

const xPairs = [
  ['R5C6', 'R6C6'],
  ['R7C6', 'R8C6'],
  ['R7C1', 'R8C1'],
  ['R7C6', 'R7C7'],
  ['R4C2', 'R4C3'],
  ['R4C3', 'R5C3'],
];

const vPairs = [
  ['R7C3', 'R7C4'],
  ['R3C9', 'R4C9'],
  ['R2C6', 'R2C7'],
  ['R8C7', 'R9C7'],
  ['R8C8', 'R9C8'],
  ['R3C8', 'R4C8'],
];

const summitSpec = NFA.encodeSpec({
  startState: [{ prev: null, dir: 1 }, { prev: null, dir: -1 }],
  transition: ({ prev, dir }, value) => {
    if (prev === null) {
      return { prev: value, dir: value === 9 ? -1 : value === 1 ? 1 : dir };
    }

    const pairDir = prev === 9 ? -1 : prev === 1 ? 1 : dir;
    if (pairDir === 1 && value <= prev) return undefined;
    if (pairDir === -1 && value >= prev) return undefined;
    return { prev: value, dir: value === 9 ? -1 : value === 1 ? 1 : pairDir };
  },
  accept: () => true,
}, 9);

const cc = graph.makeOverlay('CC');

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),

  ...chaosArrows.map(({ origin, arm }) =>
    new ChaosArrow(origin, 1, ...arm.map(cell => cc.at(cell)))),

  new NFA(summitSpec, 'summit', summitLine),

  ...xPairs.map(([a, b]) => new X(a, b)),
  ...vPairs.map(([a, b]) => new V(a, b)),
];
