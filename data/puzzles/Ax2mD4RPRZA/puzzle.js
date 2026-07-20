// Title: 9 x 9 = 81
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=Ax2mD4RPRZA
// Source: https://sudokupad.app/dg8irdpkl3

// Normal Sudoku rules apply. The digits on each drawn line sum to 9.
const sumLines = [
  ['R3C3', 'R2C4', 'R1C5'],
  ['R2C5', 'R3C4', 'R4C3'],
  ['R3C6', 'R4C7', 'R5C8'],
  ['R3C7', 'R4C8', 'R5C9'],
  ['R4C6', 'R5C5', 'R6C4'],
  ['R5C1', 'R6C2', 'R7C3'],
  ['R5C2', 'R6C3', 'R7C4'],
  ['R8C5', 'R7C6', 'R6C7'],
  ['R9C5', 'R8C6', 'R7C7'],
];

return [
  new Shape('9x9'),
  new Given('R1C2', 8),
  new Given('R1C5', 1),
  new Given('R2C9', 5),
  new Given('R4C1', 5),
  new Given('R4C7', 2),
  new Given('R5C3', 6),
  ...sumLines.map(cells => new Sum(9, ...cells)),
];
