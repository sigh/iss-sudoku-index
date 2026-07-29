// Title: Arrow Cartwheel
// Author: Wypman
// Video: https://www.youtube.com/watch?v=2NiDce28gP8
// Source: https://sudokupad.app/3GNbdGpbLH

// Normal Sudoku. Each arrow's arm digits sum to its circle digit. Grey circles
// are odd and grey squares are even.
const givens = [
  ['R1C7', 2], ['R3C1', 1], ['R3C3', 9], ['R3C7', 6], ['R5C5', 5],
  ['R7C3', 8], ['R7C7', 7], ['R7C9', 3], ['R9C3', 4],
];

// Arrow paths transcribed from the drawn arrow circles and shafts, circle first.
const arrows = [
  ['R5C5', 'R4C5', 'R3C5'], ['R5C5', 'R5C6', 'R5C7'],
  ['R5C5', 'R6C5', 'R7C5'], ['R5C5', 'R5C4', 'R5C3'],
  ['R4C2', 'R3C2', 'R2C3', 'R2C4'], ['R2C6', 'R2C7', 'R3C8', 'R4C8'],
  ['R6C8', 'R7C8', 'R8C7', 'R8C6'], ['R8C4', 'R8C3', 'R7C2', 'R6C2'],
  ['R1C8', 'R1C7', 'R1C6'],
];

// Grey circular and square markers transcribed from the drawing.
const oddCells = [
  'R5C8', 'R9C2', 'R2C1', 'R1C8', 'R8C9', 'R4C2', 'R2C6', 'R6C8',
  'R5C5', 'R8C4', 'R2C5', 'R5C2', 'R8C5', 'R7C6', 'R3C4',
];
const evenCells = [
  'R8C1', 'R1C2', 'R2C9', 'R9C8', 'R6C2', 'R2C4', 'R4C8', 'R8C6',
  'R4C7', 'R6C3',
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...arrows.map(cells => new Arrow(...cells)),
  ...oddCells.map(cell => new Given(cell, 1, 3, 5, 7, 9)),
  ...evenCells.map(cell => new Given(cell, 2, 4, 6, 8)),
];
