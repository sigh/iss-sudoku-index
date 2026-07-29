// Title: Circles in the Mist
// Author: Oddlyeven
// Video: https://www.youtube.com/watch?v=cyEoWCqQf1w
// Source: https://sudokupad.app/zdmnz4qx5m

// Normal Sudoku. Each arrow's arm sums to its circular bulb. The counting-circle
// rule is omitted because the R6C2 coincident circle artwork has no local rule
// or drawing evidence that says whether it contributes once or twice.
const arrows = [
  ['R1C1', 'R2C2', 'R3C2'],
  ['R6C2', 'R6C1', 'R7C2', 'R8C2', 'R9C2'],
  ['R1C4', 'R1C3', 'R1C2'],
  ['R4C2', 'R4C3', 'R5C3', 'R6C4'],
  ['R7C6', 'R7C5', 'R8C4', 'R9C3'],
  ['R5C6', 'R6C7', 'R7C7', 'R8C6'],
  ['R9C6', 'R9C7', 'R9C8'],
  ['R2C8', 'R3C8', 'R4C8', 'R5C8'],
  ['R2C9', 'R1C8', 'R1C7'],
];

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
];
