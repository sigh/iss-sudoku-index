// Title: Pseudo Cluedo
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=oudYXBASJLE
// Source: https://sudokupad.app/el9sus7p0o

// Normal Sudoku. Digits do not repeat within each outlined suspect cage.
// Each X weapon joins two adjacent cells whose values sum to 10.
const cages = [
  ['R1C1', 'R1C2', 'R2C2', 'R2C3', 'R3C3'],
  ['R1C6', 'R2C5', 'R2C6', 'R3C5', 'R3C6'],
  ['R1C9', 'R2C8', 'R2C9', 'R3C8'],
  ['R4C6', 'R5C4', 'R5C5', 'R5C6', 'R6C4'],
  ['R7C5', 'R8C5', 'R8C6', 'R9C5'],
  ['R5C8', 'R6C8', 'R6C9', 'R7C9', 'R8C9'],
];

const weapons = [
  ['R7C1', 'R8C1'], ['R7C7', 'R7C8'], ['R1C4', 'R1C5'],
  ['R2C4', 'R3C4'], ['R4C7', 'R5C7'],
];

return [
  new Shape('9x9'),
  ...cages.map(cells => new AllDifferent(...cells)),
  ...weapons.map(cells => new X(...cells)),
];
