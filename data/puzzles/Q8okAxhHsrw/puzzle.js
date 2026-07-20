// Title: Hook or Crook
// Author: Sotehr
// Video: https://www.youtube.com/watch?v=Q8okAxhHsrw
// Source: https://sudokupad.app/s9w5cterb4

// The auxiliary cell is fixed to 3 and controls the number of distinct
// digits on each main diagonal.

const entropicLine = [
  'R8C3', 'R8C2', 'R7C2', 'R7C3', 'R6C4', 'R5C5', 'R4C4',
  'R4C5', 'R5C6', 'R6C7', 'R7C6', 'R7C7', 'R6C8',
];

const modularLine = [
  'R2C7', 'R2C8', 'R3C8', 'R3C7', 'R4C6', 'R5C5', 'R6C6',
  'R6C5', 'R5C4', 'R4C3', 'R3C4', 'R3C3', 'R4C2',
];

const blackDots = [
  ['R2C7', 'R3C7'],
  ['R7C3', 'R8C3'],
  ['R9C7', 'R9C8'],
  ['R1C2', 'R1C3'],
];

const diagonals = [
  ['R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9'],
  ['R1C9', 'R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1'],
];

return [
  new Shape('9x9'),
  new Var('D', 'Diagonal distinct count', 1),
  new Given('VD', 3),
  new Entropic(...entropicLine),
  new Modular(3, ...modularLine),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...diagonals.map(cells => new CountDistinct('VD', ...cells)),
];
