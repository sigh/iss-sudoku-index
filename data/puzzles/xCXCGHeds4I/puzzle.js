// Title: Within and without
// Author: Merdock
// Video: https://www.youtube.com/watch?v=xCXCGHeds4I
// Source: https://sudokupad.app/k18i652bjj

// Each closed line is split into nine clues at the shared circle/diamond cells.
const betweenLines = [
  ['R2C5', 'R2C6', 'R2C7', 'R2C8'],
  ['R2C8', 'R3C9', 'R4C9', 'R5C8'],
  ['R5C8', 'R6C8', 'R7C8', 'R8C8'],
  ['R8C8', 'R8C7', 'R8C6', 'R8C5'],
  ['R8C5', 'R7C5', 'R6C5', 'R5C5'],
  ['R5C5', 'R5C4', 'R6C3', 'R7C4', 'R8C3', 'R8C2'],
  ['R8C2', 'R7C2', 'R6C2', 'R5C2'],
  ['R5C2', 'R4C1', 'R3C1', 'R2C2'],
  ['R2C2', 'R2C3', 'R2C4', 'R2C5'],
];

const lockoutLines = [
  ['R2C2', 'R3C2', 'R4C2', 'R5C2'],
  ['R5C2', 'R6C1', 'R7C1', 'R8C2'],
  ['R8C2', 'R7C3', 'R6C4', 'R5C5'],
  ['R5C5', 'R6C6', 'R7C6', 'R8C5'],
  ['R8C5', 'R9C6', 'R9C7', 'R8C8'],
  ['R8C8', 'R7C9', 'R6C9', 'R5C8'],
  ['R5C8', 'R4C8', 'R3C8', 'R2C8'],
  ['R2C8', 'R1C7', 'R1C6', 'R2C5'],
  ['R2C5', 'R1C4', 'R1C3', 'R2C2'],
];

const whiteDots = [
  ['R2C3', 'R2C4'],
  ['R6C2', 'R7C2'],
  ['R6C8', 'R7C8'],
  ['R8C6', 'R8C7'],
  ['R7C2', 'R8C2'],
  ['R2C6', 'R2C7'],
  ['R9C6', 'R9C7'],
  ['R3C2', 'R4C2'],
];

return [
  new Shape('9x9'),
  new DisjointSets(),
  ...betweenLines.map(cells => new Between(...cells)),
  // Lockout endpoint digits differ by at least 4.
  ...lockoutLines.map(cells => new Lockout(4, ...cells)),
  new BlackDot('R1C1', 'R2C1'),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
];
