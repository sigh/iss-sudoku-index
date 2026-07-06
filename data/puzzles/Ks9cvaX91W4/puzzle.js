// Loss for Words by Br1312te
// https://www.youtube.com/watch?v=Ks9cvaX91W4
//
// Rules:
// Normal sudoku rules apply.
// German Whisper (green) lines: adjacent cells differ by at least 5.
// Renban (magenta) lines: a set of consecutive, non-repeating digits in any order.

const renbanLines = [
  ['R9C4', 'R9C3', 'R9C2', 'R9C1', 'R8C1', 'R7C1', 'R6C1', 'R5C1'],
  ['R4C1', 'R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5'],
  ['R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9'],
  ['R6C9', 'R7C9', 'R8C9', 'R9C9', 'R9C8', 'R9C7', 'R9C6', 'R9C5'],
  ['R4C5', 'R5C5', 'R6C5'],
  ['R2C2', 'R2C3'],
  ['R3C4', 'R3C5'],
  ['R5C7', 'R6C6'],
  ['R7C7', 'R7C8'],
  ['R3C6', 'R4C7'],
  ['R2C7', 'R3C7', 'R3C8', 'R2C8'],
  ['R7C2', 'R8C2', 'R8C3', 'R7C3'],
];

const whisperLines = [
  ['R5C2', 'R5C3', 'R5C4'],
  ['R5C6', 'R5C7', 'R5C8'],
  ['R2C5', 'R3C5', 'R4C5'],
  ['R6C5', 'R7C5', 'R8C5'],
  ['R3C2', 'R3C3'],
];

return [
  new Shape('9x9'),
  new Given('R4C2', 5),
  new Given('R8C8', 3),
  ...renbanLines.map(cells => new Renban(...cells)),
  ...whisperLines.map(cells => new Whisper(5, ...cells)),
];
