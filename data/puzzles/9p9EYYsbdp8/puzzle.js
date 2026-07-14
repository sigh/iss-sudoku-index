// Title: Crossroads on Another World
// Author: Jeff Wajes
// Video: https://www.youtube.com/watch?v=9p9EYYsbdp8
// Source: https://sudokupad.app/ut3m32qtmf

// Green line: adjacent digits differ by at least 5. Pink lines are renbans.
// On every grey line, positive digits make the sum-10 partition deterministic:
// accumulate a segment until it reaches 10, then begin the next segment.
const greenWhisper = ['R3C4', 'R3C5', 'R3C6', 'R4C7', 'R5C7', 'R6C7'];
const pinkRenbans = [
  ['R1C6', 'R2C7', 'R2C8', 'R3C8', 'R4C9'],
  ['R6C3', 'R7C4', 'R7C5', 'R7C6'],
  ['R5C1', 'R6C1'],
];
const greyLines = [
  ['R4C2', 'R4C3'], ['R5C2', 'R5C3'], ['R6C2', 'R6C3'],
  ['R2C4', 'R3C4'], ['R2C5', 'R3C5'], ['R2C6', 'R3C6'],
  ['R4C7', 'R4C8'], ['R5C7', 'R5C8'], ['R6C7', 'R6C8'],
  ['R7C6', 'R8C6'], ['R7C5', 'R8C5'], ['R7C4', 'R8C4'],
  ['R8C1', 'R7C2', 'R8C3', 'R9C4', 'R9C5', 'R9C6', 'R8C7', 'R8C8', 'R7C8', 'R6C9'],
  ['R4C1', 'R3C2', 'R2C2', 'R2C3', 'R1C4'],
];

const sum10Segments = NFA.encodeSpec({
  startState: 0,
  transition: (sum, digit) => {
    const next = sum + digit;
    if (next > 10) return undefined;
    return next === 10 ? 0 : next;
  },
  accept: sum => sum === 0,
}, 9);

return [
  new Shape('9x9'),
  new Whisper(5, ...greenWhisper),
  ...pinkRenbans.map(line => new Renban(...line)),
  ...greyLines.map(line => new NFA(sum10Segments, 'sum-10 segments', ...line)),
];
