// Title: Nov. 25, 2022: German Whispers
// Author: clover!
// Video: https://www.youtube.com/watch?v=rV-Z57M3y9I
// Source: https://tinyurl.com/2s3vxrhy

// Normal sudoku rules. Each green line is a German whisper: adjacent digits
// along the line must differ by at least 5.

const givens = [
  ['R1C1', 4], ['R1C2', 6], ['R1C3', 5],
  ['R1C7', 8], ['R1C8', 3], ['R1C9', 9],
  ['R2C1', 7], ['R2C9', 4],
  ['R3C1', 2], ['R3C9', 5],
  ['R7C1', 5], ['R7C9', 1],
  ['R8C1', 6], ['R8C9', 7],
  ['R9C1', 1], ['R9C2', 9], ['R9C3', 3],
  ['R9C7', 4], ['R9C8', 5], ['R9C9', 6],
];

// Whisper line cell paths, transcribed from the `whispers` array (green,
// fromConstraint: "Whispers"). Each is an open 8-cell path, not a loop.
const whisperLines = [
  ['R2C3', 'R1C4', 'R1C5', 'R1C6', 'R2C7', 'R3C7', 'R4C7', 'R5C6'],
  ['R3C8', 'R4C9', 'R5C9', 'R6C9', 'R7C8', 'R7C7', 'R7C6', 'R6C5'],
  ['R8C7', 'R9C6', 'R9C5', 'R9C4', 'R8C3', 'R7C3', 'R6C3', 'R5C4'],
  ['R4C5', 'R3C4', 'R3C3', 'R3C2', 'R4C1', 'R5C1', 'R6C1', 'R7C2'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...whisperLines.map((cells) => new Whisper(5, ...cells)),
];
