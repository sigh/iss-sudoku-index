// Title: Funfzehn
// Author: Eric Bader
// Video: https://www.youtube.com/watch?v=zjoRubzzYjg
// Source: https://sudokupad.app/skuy1x5ywn

// The rules explicitly allow repeated digits in cages, so these are sums rather
// than killer cages. Row, column, and box rules supply any incidental uniqueness.
const sums = [
  ['R4C3', 'R5C3', 'R6C3'],
  ['R4C9', 'R5C9', 'R6C9'],
  ['R5C5', 'R5C6', 'R6C5'],
  ['R8C8', 'R8C9', 'R9C9'],
  ['R3C4', 'R3C5', 'R3C6'],
  ['R2C4', 'R2C5', 'R2C6'],
  ['R3C8', 'R4C7', 'R4C8', 'R5C7', 'R5C8'],
  ['R5C2', 'R6C2', 'R7C2'],
  ['R9C6', 'R9C7', 'R9C8'],
  ['R1C8', 'R2C8', 'R2C9'],
].map(cells => new Sum(15, ...cells));

const whispers = [
  ['R7C1', 'R7C2', 'R7C3', 'R8C3', 'R8C4', 'R9C4'],
  ['R7C2', 'R6C2', 'R5C2'],
  ['R8C8', 'R8C9', 'R9C9'],
  ['R4C3', 'R5C3', 'R6C3'],
  ['R9C6', 'R9C7', 'R9C8'],
  ['R3C4', 'R3C5', 'R3C6'],
  ['R2C4', 'R2C5', 'R2C6'],
  ['R6C5', 'R5C6', 'R4C7', 'R3C8'],
].map(cells => new Whisper(5, ...cells));

return [
  new Shape('9x9'),
  ...sums,
  ...whispers,
  new WhiteDot('R3C2', 'R4C2'),
];
