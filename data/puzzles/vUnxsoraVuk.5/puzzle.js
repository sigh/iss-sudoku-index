// Title: Average Arrows Sudoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=vUnxsoraVuk
// Source: https://tinyurl.com/dtps29e2

// Normal Sudoku rules apply (default row/col/box all-different). Each arrow's
// circled bulb digit is the average of the digits on its two arm cells. ISS
// has no Average class, so each arrow is a coefficient Sum tying all three
// cells together: arm1 + arm2 - 2*bulb == 0, i.e. arm1 + arm2 == 2*bulb.

// Bulb/arm cells transcribed from the drawn arrow paths (each a bent line of
// a circled bulb cell plus two arm cells).
const arrows = [
  { bulb: 'R1C3', value: 3, arm: ['R2C2', 'R3C1'] },
  { bulb: 'R4C2', value: 1, arm: ['R3C3', 'R2C4'] },
  { bulb: 'R3C5', value: 2, arm: ['R4C4', 'R5C3'] },
  { bulb: 'R6C4', value: 7, arm: ['R5C5', 'R4C6'] },
  { bulb: 'R5C7', value: 8, arm: ['R6C6', 'R7C5'] },
  { bulb: 'R8C6', value: 9, arm: ['R7C7', 'R6C8'] },
  { bulb: 'R7C9', value: 7, arm: ['R8C8', 'R9C7'] },
  { bulb: 'R2C8', value: 4, arm: ['R2C7', 'R2C6'] },
  { bulb: 'R8C2', value: 6, arm: ['R8C3', 'R8C4'] },
];

// Plain givens with no arrow (drawn as ordinary digits, not circled bulbs).
const plainGivens = [
  ['R1C5', 5],
  ['R2C9', 8],
  ['R7C9', 7],
  ['R8C1', 3],
  ['R9C5', 4],
];

return [
  new Shape('9x9'),
  ...arrows.map(a => new Given(a.bulb, a.value)),
  ...plainGivens.map(([cell, value]) => new Given(cell, value)),
  ...arrows.map(a => new Sum(0, ...a.arm, [a.bulb, -2])),
];
