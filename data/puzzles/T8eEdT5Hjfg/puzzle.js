// Title: Circuit Board
// Author: It_depends
// Video: https://www.youtube.com/watch?v=T8eEdT5Hjfg
// Source: https://sudokupad.app/n0ntvvi7fw

// Grey squares are even, circles odd; green lines are modular modulo 3.
const left = [
  'R1C3', 'R1C2', 'R2C2', 'R3C2', 'R3C3', 'R4C3', 'R5C3',
  'R5C2', 'R6C2', 'R7C2', 'R7C3', 'R8C3', 'R9C3', 'R9C2',
];
const right = [
  'R1C7', 'R1C8', 'R2C8', 'R3C8', 'R3C7', 'R4C7', 'R5C7',
  'R5C8', 'R6C8', 'R7C8', 'R7C7', 'R8C7', 'R9C7', 'R9C8',
];
const evens = [
  'R1C3', 'R1C7', 'R2C6', 'R3C4', 'R3C6',
  'R5C1', 'R6C9', 'R7C9', 'R8C6', 'R8C9',
];
const odds = [
  'R2C4', 'R4C2', 'R5C9', 'R6C1', 'R7C1', 'R7C4', 'R7C6',
  'R8C1', 'R8C4', 'R9C2', 'R9C3', 'R9C7', 'R9C8',
];

return [
  new Shape('9x9'),
  ...Array.from({length: 9}, (_, index) =>
    new Given(makeCellId(index + 1, 5), index + 1)),
  new Modular(3, ...left), new Modular(3, ...right),
  ...evens.map(cell => new Given(cell, 2, 4, 6, 8)),
  ...odds.map(cell => new Given(cell, 1, 3, 5, 7, 9)),
];
