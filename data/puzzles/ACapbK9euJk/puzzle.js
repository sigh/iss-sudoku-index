// Title: Vibrations
// Author: Niverio
// Video: https://www.youtube.com/watch?v=ACapbK9euJk
// Source: https://app.crackingthecryptic.com/sudoku/GNtrQQQ88q

// Standard Sudoku, five distinct killer cages, and seven increasing thermos.
const cages = [
  [20, 'R1C1', 'R2C1', 'R3C1'],
  [11, 'R9C7', 'R9C8', 'R9C9'],
  [11, 'R1C2', 'R1C3'],
  [9, 'R7C9', 'R8C9'],
  [13, 'R4C5', 'R4C6', 'R5C6'],
];

const thermos = [
  ['R7C2', 'R6C1', 'R5C1', 'R4C1'],
  ['R8C3', 'R9C4', 'R9C5', 'R9C6'],
  ['R5C4', 'R4C3', 'R3C3'],
  ['R2C7', 'R1C6', 'R1C5', 'R1C4'],
  ['R3C8', 'R4C9', 'R5C9', 'R6C9'],
  ['R6C5', 'R7C6', 'R7C7'],
  ['R5C7', 'R4C7', 'R3C6', 'R3C5'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...thermos.map((cells) => new Thermo(...cells)),
];
