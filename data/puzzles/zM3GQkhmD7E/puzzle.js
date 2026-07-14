// Title: A pretty flower
// Author: Altai
// Video: https://www.youtube.com/watch?v=zM3GQkhmD7E
// Source: https://sudokupad.app/ij8hblfzym

// Killer cages; each listed cage has a shown sum and distinct digits.
const cages = [
  { total: 7, cells: ['R3C2', 'R3C3'] },
  { total: 13, cells: ['R2C2', 'R2C3'] },
  { total: 13, cells: ['R7C7', 'R7C8'] },
  { total: 7, cells: ['R8C7', 'R8C8'] },
  { total: 19, cells: ['R4C1', 'R5C1', 'R6C1'] },
  { total: 18, cells: ['R9C4', 'R9C5', 'R9C6'] },
  { total: 19, cells: ['R4C9', 'R5C9', 'R6C9'] },
  { total: 18, cells: ['R1C4', 'R1C5', 'R1C6'] },
  { total: 7, cells: ['R7C2', 'R7C3'] },
  { total: 13, cells: ['R8C2', 'R8C3'] },
  { total: 7, cells: ['R2C7', 'R2C8'] },
  { total: 13, cells: ['R3C7', 'R3C8'] },
];

// White Kropki dots are given, but unmarked consecutive pairs are permitted.
const whiteDots = [
  ['R9C8', 'R9C9'],
  ['R1C1', 'R1C2'],
  ['R6C9', 'R7C9'],
  ['R1C6', 'R1C7'],
  ['R7C2', 'R8C2'],
];

return [
  new Shape('9x9'),
  ...cages.map(({ total, cells }) => new Cage(total, ...cells)),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  new Quad('R3C3', 1, 2, 5, 9),
  new Quad('R3C6', 1, 3),
  new Quad('R6C3', 1, 7),
  new Quad('R6C6', 1, 2, 4, 9),
];
