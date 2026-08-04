// Title: Dot Press Me
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=MhlzTkWXXEM
// Source: https://tinyurl.com/yck9d7rk

// Normal sudoku, no givens. Cages: digits must not repeat and sum to the
// printed total. White dots: digits consecutive. Black dots: digits in a
// 2:1 ratio. Not all possible dots are given (no negative dot constraint).

const cages = [
  [7, 'R1C3', 'R1C4', 'R2C3'],
  [11, 'R1C6', 'R1C7', 'R2C7'],
  [17, 'R8C7', 'R9C6', 'R9C7'],
  [19, 'R8C3', 'R9C3', 'R9C4'],
  [14, 'R3C8', 'R3C9', 'R4C9'],
  [7, 'R6C9', 'R7C8', 'R7C9'],
  [11, 'R6C1', 'R7C1', 'R7C2'],
  [21, 'R3C1', 'R3C2', 'R4C1'],
  [22, 'R6C3', 'R6C4', 'R7C3', 'R7C4'],
  [19, 'R3C3', 'R3C4', 'R4C3', 'R4C4'],
  [21, 'R6C6', 'R6C7', 'R7C6', 'R7C7'],
  [22, 'R3C6', 'R3C7', 'R4C6', 'R4C7'],
];

const whiteDots = [
  ['R4C1', 'R3C1'],
  ['R6C1', 'R7C1'],
  ['R7C8', 'R7C9'],
  ['R3C8', 'R3C9'],
  ['R2C7', 'R1C7'],
  ['R1C3', 'R2C3'],
  ['R9C3', 'R9C4'],
  ['R9C6', 'R9C7'],
  ['R3C7', 'R4C7'],
  ['R7C7', 'R7C6'],
  ['R7C3', 'R6C3'],
  ['R6C6', 'R7C6'],
  ['R7C3', 'R7C4'],
  ['R4C4', 'R3C4'],
];

const blackDots = [
  ['R3C1', 'R3C2'],
  ['R7C2', 'R7C1'],
  ['R3C9', 'R4C9'],
  ['R6C9', 'R7C9'],
  ['R1C3', 'R1C4'],
  ['R1C6', 'R1C7'],
  ['R9C3', 'R8C3'],
  ['R8C7', 'R9C7'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
