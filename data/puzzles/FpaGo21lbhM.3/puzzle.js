// Title: Second Law of Thermodynamics
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=FpaGo21lbhM
// Source: https://tinyurl.com/2p94chhr

// Standard Sudoku, with each of the four drawn 3x3 regions also containing 1-9.
// The given table is transcribed from the source grid.
const givens = [
  ['R1C3', 3], ['R1C7', 5], ['R2C2', 2], ['R2C4', 6], ['R3C1', 1],
  ['R3C3', 5], ['R3C9', 6], ['R4C2', 4], ['R4C4', 8], ['R5C3', 7],
  ['R5C7', 1], ['R6C6', 9], ['R6C8', 7], ['R7C1', 5], ['R7C7', 6],
  ['R7C9', 4], ['R8C6', 5], ['R8C8', 3], ['R9C3', 6], ['R9C7', 2],
];

// The four cells lists are the source's marked region windows.
const regions = [
  ['R2C2', 'R2C3', 'R2C4', 'R3C2', 'R3C3', 'R3C4', 'R4C2', 'R4C3', 'R4C4'],
  ['R2C6', 'R2C7', 'R2C8', 'R3C6', 'R3C7', 'R3C8', 'R4C6', 'R4C7', 'R4C8'],
  ['R6C2', 'R6C3', 'R6C4', 'R7C2', 'R7C3', 'R7C4', 'R8C2', 'R8C3', 'R8C4'],
  ['R6C6', 'R6C7', 'R6C8', 'R7C6', 'R7C7', 'R7C8', 'R8C6', 'R8C7', 'R8C8'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...regions.map((cells) => new AllDifferent(...cells)),
];
