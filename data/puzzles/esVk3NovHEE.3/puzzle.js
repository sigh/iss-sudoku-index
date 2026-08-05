// Title: Fireworks
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=esVk3NovHEE
// Source: https://tinyurl.com/4a2hmmsx

// Normal Sudoku rules apply. Each drawn arrow arm sums to its shared circular bulb.
// Givens and arrow paths are transcribed from the puzzle grid and drawn fireworks.
const givens = [
  ['R1C9', 6], ['R2C8', 9], ['R3C3', 8], ['R3C7', 5], ['R5C3', 6],
  ['R5C7', 1], ['R7C3', 3], ['R7C7', 7], ['R8C2', 6], ['R9C1', 9],
];

const arrows = [
  ['R3C3', 'R2C3', 'R1C3'], ['R3C3', 'R2C2', 'R1C1'],
  ['R3C3', 'R2C4', 'R1C5'], ['R3C3', 'R3C2', 'R3C1'],
  ['R3C3', 'R4C2', 'R5C1'],
  ['R5C5', 'R4C5', 'R3C5'], ['R5C5', 'R4C6', 'R3C7'],
  ['R5C5', 'R5C6', 'R5C7'], ['R5C5', 'R6C5', 'R7C5'],
  ['R5C5', 'R6C4', 'R7C3'], ['R5C5', 'R5C4', 'R5C3'],
  ['R5C5', 'R4C4', 'R3C3'], ['R5C5', 'R6C6', 'R7C7'],
  ['R7C7', 'R6C8', 'R5C9'], ['R7C7', 'R7C8', 'R7C9'],
  ['R7C7', 'R8C8', 'R9C9'], ['R7C7', 'R8C7', 'R9C7'],
  ['R7C7', 'R8C6', 'R9C5'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...arrows.map(([bulb, ...arm]) => new Arrow(bulb, ...arm)),
];
