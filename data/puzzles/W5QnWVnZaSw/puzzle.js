// Title: Right Twice a Day
// Author: Jeff Wajes
// Video: https://www.youtube.com/watch?v=W5QnWVnZaSw
// Source: https://sudokupad.app/aadq3z8j80

// Grey-line cells form consecutive groups summing to 10. The open-line
// machine requires a group boundary at each endpoint.
const openTenGroups = NFA.encodeSpec({
  startState: { sum: 0 },
  transition: ({ sum }, value) => {
    const next = sum + value;
    if (next > 10) return undefined;
    return { sum: next === 10 ? 0 : next };
  },
  accept: ({ sum }) => sum === 0,
}, 9);

// The closed loop has no distinguished endpoint. Each possible initial partial
// sum represents placing the wraparound group boundary elsewhere on the loop.
const closedTenGroups = NFA.encodeSpec({
  startState: Array.from({ length: 10 }, (_, initial) => ({ initial, sum: initial })),
  transition: ({ initial, sum }, value) => {
    const next = sum + value;
    if (next > 10) return undefined;
    return { initial, sum: next === 10 ? 0 : next };
  },
  accept: ({ initial, sum }) => sum === initial,
}, 9);

const greyLines = [
  ['R3C7', 'R4C8'],
  ['R3C3', 'R4C2', 'R5C2', 'R6C2'],
  ['R4C9', 'R5C9', 'R6C9'],
  ['R1C4', 'R1C5', 'R1C6'],
];

const closedGreyLoop = [
  'R4C3', 'R5C3', 'R6C3', 'R7C4', 'R7C5', 'R7C6',
  'R6C7', 'R5C7', 'R4C7', 'R3C6', 'R3C5', 'R3C4',
];

const pinkLines = [
  ['R3C3', 'R2C4', 'R2C5', 'R2C6', 'R3C7'],
  ['R6C2', 'R7C3', 'R8C4', 'R8C5', 'R8C6', 'R7C7', 'R6C8', 'R5C8', 'R4C8'],
  ['R9C5', 'R9C6'],
  ['R4C1', 'R5C1', 'R6C1'],
  ['R5C5', 'R6C6'],
];

const greenLines = [
  ['R7C1', 'R8C1', 'R9C1', 'R9C2'],
  ['R4C5', 'R5C5'],
  ['R7C9', 'R8C9', 'R9C9', 'R9C8'],
];

return [
  new Shape('9x9'),
  ...greyLines.map(cells => new NFA(openTenGroups, '10-sum groups', ...cells)),
  new NFA(closedTenGroups, 'cyclic 10-sum groups', ...closedGreyLoop),
  ...pinkLines.map(cells => new Renban(...cells)),
  ...greenLines.map(cells => new Whisper(5, ...cells)),
];
