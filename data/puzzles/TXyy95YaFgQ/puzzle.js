// Title: Global Warming
// Author: Br1312te
// Video: https://www.youtube.com/watch?v=TXyy95YaFgQ
// Source: https://sudokupad.app/tdr0ywy332

// Normal 9x9 sudoku. Box borders split each grey thermometer into segments.
// Digits rise within every segment, and successive segment sums also rise.
// Every 2x2 window fully inside a red outline contains a low (1-3), middle
// (4-6), and high (7-9) digit. White and black dots are ordinary Kropki clues;
// there is no negative Kropki rule.

const graph = cellGraph('9x9');

// Segment order follows each thermometer away from its bulb.
const thermometers = [
  [
    ['R9C1', 'R8C2', 'R9C3'],
    ['R8C4', 'R9C5', 'R8C6'],
    ['R7C7'],
    ['R6C7', 'R5C8', 'R4C8'],
    ['R3C8', 'R2C8', 'R2C7', 'R1C8'],
  ],
  [
    ['R4C5', 'R4C4'],
    ['R4C3'],
    ['R3C4'],
    ['R2C3'],
  ],
];

// Compare two segment sums directly. The running difference is
// sum(first) - sum(second), so a negative final value means a strict rise.
function risingSegmentSum(first, second) {
  const machine = NFA.encodeSpec({
    startState: { phase: 'first', difference: 0 },
    transition: ({ phase, difference }, value) => {
      if (value === SEGMENT_BREAK) {
        return { phase: 'second', difference };
      }
      return phase === 'first'
        ? { phase, difference: difference + value }
        : { phase, difference: difference - value };
    },
    accept: ({ phase, difference }) =>
      phase === 'second' && difference < 0,
    maxDepth: first.length + second.length + 1,
  }, 9, { multiSegment: true });
  return new NFA(machine, 'rising segment sums', first, second);
}

const increasingDigits = thermometers.flatMap(segments =>
  segments
    .filter(cells => cells.length > 1)
    .map(cells => new Thermo(...cells))
);
const increasingSegmentSums = thermometers.flatMap(segments =>
  segments.slice(0, -1).map((cells, i) =>
    risingSegmentSum(cells, segments[i + 1])
  )
);

// The red outlines are the union of these drawn rectangular areas. Derive all
// fully contained 2x2 windows from their membership rather than listing them.
const redCages = [
  [...graph.block('R1C7', 6, 3), ...graph.block('R7C1', 3, 9)],
  graph.block('R2C2', 3, 3),
];
const redCageWindows = redCages.flatMap(cells => {
  const members = new Set(cells);
  return graph.cells()
    .map(cell => graph.block(cell, 2, 2))
    .filter(block => block && block.every(cell => members.has(cell)));
});

const LOW = 1;
const MIDDLE = 2;
const HIGH = 4;
const ALL_BANDS = LOW | MIDDLE | HIGH;
const entropyWindowMachine = NFA.encodeSpec({
  startState: { bands: 0 },
  transition: ({ bands }, digit) => {
    const band = digit <= 3 ? LOW : digit <= 6 ? MIDDLE : HIGH;
    return { bands: bands | band };
  },
  accept: ({ bands }) => bands === ALL_BANDS,
}, 9);
const windowOrigins = redCageWindows.map(cells => cells[0]);
const redCageEntropy = graph.makeReplicate(
  new NFA(
    entropyWindowMachine,
    'red cage entropy',
    ...graph.block('R1C1', 2, 2)
  ),
  windowOrigins
);

const whiteDots = [
  ['R1C2', 'R1C3'],
  ['R5C8', 'R5C9'],
  ['R6C7', 'R6C8'],
  ['R9C6', 'R9C7'],
];

return [
  new Shape('9x9'),
  ...increasingDigits,
  ...increasingSegmentSums,
  redCageEntropy,
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  new BlackDot('R7C9', 'R8C9'),
];
