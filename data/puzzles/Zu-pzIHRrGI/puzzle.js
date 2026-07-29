// Title: Craven
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=Zu-pzIHRrGI
// Source: https://sudokupad.app/james-sinclair/craven-unshaded

// Normal sudoku rules apply. The drawn killer cages contain distinct digits
// totalling their clue; purple lines are renbans; white dots join consecutive
// digits; and each arrow circle equals the sum of its arm.

// Cages, renban paths, dots, and arrows transcribed from the source's named
// constraint arrays; each arrow's `cells` entry is its circle.
const cages = [
  [8, 'R2C1', 'R2C2'],
  [10, 'R8C8', 'R8C9'],
  [9, 'R8C1', 'R9C1'],
  [9, 'R1C9', 'R2C9'],
];

const renbans = [
  ['R6C2', 'R5C3', 'R4C4', 'R3C5'],
  ['R5C5', 'R4C6', 'R5C7', 'R6C8'],
];

const whiteDots = [
  ['R6C5', 'R5C5'],
  ['R1C6', 'R1C7'],
  ['R8C4', 'R8C3'],
  ['R3C7', 'R3C8'],
  ['R9C4', 'R9C5'],
];

const arrows = [
  ['R6C2', 'R7C3', 'R8C3', 'R9C3'],
  ['R4C4', 'R3C3', 'R2C3'],
  ['R4C6', 'R3C7', 'R2C7'],
  ['R6C8', 'R7C7', 'R8C7', 'R9C7'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...renbans.map(cells => new Renban(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...arrows.map(cells => new Arrow(...cells)),
];
