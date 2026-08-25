// Title: Arrow Sudoku
// Author: Serkan Yurekli
// Video: https://www.youtube.com/watch?v=rQIdvXcpoBI
// Source: https://sudokupad.app/p6r8D82gnF

// Normal sudoku rules apply. Digits along arrows sum to the number in the
// attached circle. The circle overlays carry no printed number, so the digit
// in each bulb cell is that sum.
const givens = [
  ['R2C2', 3], ['R2C8', 6], ['R4C2', 5], ['R4C8', 3], ['R6C2', 6],
  ['R6C8', 7], ['R7C5', 5], ['R8C2', 7], ['R8C8', 5], ['R9C3', 2],
  ['R9C7', 1],
];
const arrows = [
  ['R1C2', 'R2C1', 'R3C2', 'R4C1', 'R5C2'],
  ['R9C2', 'R8C1', 'R7C2', 'R6C1'],
  ['R4C4', 'R3C3', 'R2C3'],
  ['R1C4', 'R1C5', 'R1C6'],
  ['R4C6', 'R3C7', 'R2C7'],
  ['R5C5', 'R6C4', 'R7C4'],
  ['R5C5', 'R6C6', 'R7C6'],
  ['R8C6', 'R8C5', 'R8C4'],
  ['R9C4', 'R9C5', 'R9C6'],
  ['R9C8', 'R8C9', 'R7C8', 'R6C9'],
  ['R1C8', 'R2C9', 'R3C8', 'R4C9', 'R5C8'],
];
return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...arrows.map(cells => new Arrow(...cells)),
];
