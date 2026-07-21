// Title: Unstable Seesaws
// Author: Cane_Puzzles & Piatato
// Video: https://www.youtube.com/watch?v=OUlAVsaWnDQ
// Source: https://sudokupad.app/r3tfzi51qa

// White dots are consecutive; green-line neighbours differ by at least 5.
const whiteDots = [
  ['R3C5', 'R4C5'],
  ['R3C6', 'R4C6'],
  ['R6C6', 'R7C6'],
  ['R6C5', 'R7C5'],
  ['R9C2', 'R8C2'],
  ['R5C3', 'R5C4'],
  ['R1C4', 'R1C5'],
  ['R1C1', 'R2C1'],
].map(cells => new WhiteDot(...cells));

const greenLines = [
  ['R3C7', 'R4C7'],
  ['R3C8', 'R4C8'],
  ['R3C9', 'R4C9'],
  ['R6C7', 'R7C7'],
  ['R6C8', 'R7C8'],
  ['R6C9', 'R7C9'],
  ['R1C1', 'R1C2', 'R2C2'],
  ['R8C2', 'R8C1', 'R9C1'],
  ['R9C4', 'R9C5'],
].map(cells => new Whisper(5, ...cells));

const sumCages = [
  [21, 'R3C1', 'R3C2', 'R3C3', 'R3C4'],
  [21, 'R4C1', 'R4C2', 'R4C3', 'R4C4'],
  [20, 'R6C1', 'R6C2', 'R6C3', 'R6C4'],
  [22, 'R7C1', 'R7C2', 'R7C3', 'R7C4'],
].map(([total, ...cells]) => new Sum(total, ...cells));

return [
  new Shape('9x9'),
  new Given('R1C9', 1),
  new Given('R5C5', 3),
  new Given('R8C8', 6),
  ...whiteDots,
  ...greenLines,
  ...sumCages,
];
