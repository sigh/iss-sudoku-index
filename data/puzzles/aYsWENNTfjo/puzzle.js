// Title: Gouge Away
// Author: Math Pesto
// Video: https://www.youtube.com/watch?v=aYsWENNTfjo
// Source: https://sudokupad.app/nn9ohqnsnz

// Normal Sudoku. The four drawn no-total killer cages are all-different.
// The drawn white quads list digits required in their surrounding 2x2 squares.
// Each grey segment between two circled endpoints is a double arrow: its inner
// cells sum to its endpoint cells. The segment lists come from the drawn paths.
const cages = [
  ['R4C4', 'R5C4', 'R6C4', 'R7C4', 'R8C4', 'R9C4', 'R9C5', 'R9C6', 'R9C7'],
  ['R4C6', 'R4C7', 'R4C8', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9'],
  ['R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C4', 'R2C5', 'R2C6'],
  ['R4C2', 'R5C2', 'R6C1', 'R6C2', 'R7C1', 'R8C1', 'R9C1'],
];

const doubleArrows = [
  ['R4C6', 'R5C7', 'R5C8', 'R6C8', 'R7C9'],
  ['R7C9', 'R8C8', 'R9C7'],
  ['R9C7', 'R8C6', 'R8C5', 'R7C5', 'R6C4'],
  ['R6C4', 'R7C3', 'R8C2', 'R9C1'],
  ['R9C1', 'R9C2', 'R9C3', 'R9C4'],
  ['R9C4', 'R8C4', 'R7C4', 'R6C4'],
  ['R6C4', 'R5C4', 'R5C5', 'R4C6'],
  ['R4C6', 'R4C7', 'R4C8', 'R4C9'],
  ['R4C9', 'R3C9', 'R2C9', 'R1C9'],
  ['R1C9', 'R2C8', 'R3C7', 'R4C6'],
];

return [
  new Shape('9x9'),
  ...cages.map(cells => new AllDifferent(...cells)),
  new Quad('R6C6', 2, 3, 4, 5),
  new Quad('R8C8', 4, 5, 8),
  new Quad('R4C4', 3, 7, 8),
  new Quad('R2C2', 1, 6),
  ...doubleArrows.map(cells => new DoubleArrow(...cells)),
];
