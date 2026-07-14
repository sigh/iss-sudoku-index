// Title: Brink
// Author: 99%Sneaky
// Video: https://www.youtube.com/watch?v=1HJtCeHCWQ8
// Source: https://sudokupad.app/jjvussx9zq

// Normal Sudoku rules apply. Cells a king's move apart cannot contain equal
// digits. Digits on an arrow sum to its circled bulb. Each purple line contains
// a consecutive set. Digits in each cage sum to its printed total.

const cages = [
  [11, 'R7C8', 'R7C9'],
  [11, 'R3C1', 'R3C2'],
  [11, 'R5C8', 'R5C9'],
  [11, 'R7C2', 'R8C2'],
  [10, 'R6C1', 'R7C1'],
].map(([total, ...cells]) => new Cage(total, ...cells));

// Each entry starts with its circled bulb, followed by the arrow arm.
const arrows = [
  ['R8C3', 'R8C4', 'R9C5', 'R9C6'],
  ['R2C3', 'R2C4', 'R1C5', 'R1C6'],
  ['R3C8', 'R4C8', 'R4C7', 'R4C6'],
  ['R5C6', 'R5C7', 'R6C7'],
].map(cells => new Arrow(...cells));

const renbans = [
  ['R9C7', 'R9C8', 'R9C9'],
  ['R1C7', 'R1C8', 'R1C9'],
  ['R7C5', 'R7C6', 'R7C7'],
  ['R3C5', 'R3C6', 'R3C7'],
  ['R4C4', 'R5C4', 'R6C4'],
  ['R6C2', 'R5C3', 'R4C3'],
].map(cells => new Renban(...cells));

return [
  new Shape('9x9'),
  new AntiKing(),
  ...cages,
  ...arrows,
  ...renbans,
];
