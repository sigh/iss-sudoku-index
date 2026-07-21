// Title: War with Pythagoras
// Author: Jeff Wajes
// Video: https://www.youtube.com/watch?v=P0x5DIGDcwo
// Source: https://sudokupad.app/gejf3uvo1y

// A gray line is split into contiguous groups that each sum to 10. For an
// open line the running sum must start and end at a group boundary.
const openGraySpec = NFA.encodeSpec({
  startState: 0,
  transition: (sum, value) => {
    const next = sum + value;
    if (next > 10) return undefined;
    return next === 10 ? 0 : next;
  },
  accept: sum => sum === 0,
}, 9);

// A closed gray loop has no distinguished boundary. The NFA tries every
// possible partial sum at the cut and requires the same sum after one circuit.
const closedGraySpec = NFA.encodeSpec({
  startState: Array.from({length: 10}, (_, sum) => ({start: sum, sum})),
  transition: ({start, sum}, value) => {
    const next = sum + value;
    if (next > 10) return undefined;
    return {start, sum: next === 10 ? 0 : next};
  },
  accept: ({start, sum}) => sum === start,
}, 9);

const openGrayLines = [
  ['R2C1', 'R1C1', 'R1C2'],
  ['R1C8', 'R1C9', 'R2C9'],
  ['R8C8', 'R8C9'],
  ['R4C9', 'R5C9', 'R6C9'],
  ['R6C4', 'R6C5'],
];

// Closed paths omit the repeated endpoint because each cell is scanned once.
const closedGrayLines = [
  ['R8C1', 'R9C1', 'R9C2', 'R8C2'],
  [
    'R3C5', 'R3C6', 'R3C7', 'R4C7', 'R5C7', 'R6C7', 'R7C7', 'R7C6',
    'R7C5', 'R7C4', 'R7C3', 'R6C3', 'R5C3', 'R4C3', 'R3C3', 'R3C4',
  ],
];

const greenLines = [
  ['R1C2', 'R2C2', 'R2C1'],
  ['R1C8', 'R2C8', 'R2C9'],
  ['R8C8', 'R9C8'],
  ['R6C4', 'R5C4', 'R4C4', 'R4C5', 'R4C6', 'R5C6', 'R6C6', 'R6C5'],
  ['R6C9', 'R7C9'],
];

const pinkLines = [
  ['R9C8', 'R9C9', 'R8C9'],
  ['R5C1', 'R6C1'],
];

const openGrayConstraints = openGrayLines.map(
  cells => new NFA(openGraySpec, 'Sum-10 groups', cells),
);
const closedGrayConstraints = closedGrayLines.map(
  cells => new NFA(closedGraySpec, 'Cyclic sum-10 groups', cells),
);
const whispers = greenLines.map(cells => new Whisper(5, ...cells));
const renbans = pinkLines.map(cells => new Renban(...cells));

return [
  new Shape('9x9'),
  ...openGrayConstraints,
  ...closedGrayConstraints,
  ...whispers,
  ...renbans,
];
