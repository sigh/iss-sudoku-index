// Title: Artemis
// Author: Merdock
// Video: https://www.youtube.com/watch?v=EVyPQkJ1JoQ
// Source: https://sudokupad.app/l9mam4ijsg

// Standard Sudoku, anti-knight, six magenta Renban sets, four blue
// region-sum lines, and one explicitly drawn black Kropki dot.
const renbans = [
  ['R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R5C4', 'R5C3', 'R5C2', 'R5C1'],
  ['R4C1', 'R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R2C2', 'R3C3'],
  ['R3C7', 'R2C8', 'R1C9', 'R2C9', 'R3C9', 'R4C9', 'R1C8', 'R1C7', 'R1C6'],
  ['R7C3', 'R8C2', 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R8C1', 'R7C1', 'R6C1'],
  ['R7C7', 'R8C8', 'R9C9', 'R8C9', 'R7C9', 'R6C9', 'R9C8', 'R9C7', 'R9C6'],
  ['R9C5', 'R8C5', 'R7C5', 'R6C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9'],
];

const regionSumLines = [
  ['R1C4', 'R2C4', 'R3C4', 'R4C4', 'R4C3', 'R4C2', 'R4C1'],
  ['R6C1', 'R6C2', 'R6C3', 'R7C4', 'R8C4', 'R9C4'],
  ['R2C6', 'R3C6', 'R4C7', 'R4C8'],
  ['R6C9', 'R6C8', 'R6C7', 'R7C6', 'R8C6', 'R9C6'],
];

return [
  new Shape('9x9'),
  new Given('R3C8', 3),
  new Given('R8C3', 7),
  new AntiKnight(),
  ...renbans.map(cells => new Renban(...cells)),
  ...regionSumLines.map(cells => new RegionSumLine(...cells)),
  new BlackDot('R4C6', 'R4C7'),
];
