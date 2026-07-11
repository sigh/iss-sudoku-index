// Title: 5 Pickles and a Dream
// Author: Cassinii
// Video: https://www.youtube.com/watch?v=MDx8QVOCub8
// Source: https://sudokupad.app/dpsvou0v90

// 6x6 irregular sudoku, no givens.
// Green whisper lines: adjacent digits differ by at least 3.
// V mark between R3C3 and R4C3: points to the smaller digit (R4C3 < R3C3).

const regions = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R2C1', 'R2C4'],
  ['R5C3', 'R5C6', 'R6C3', 'R6C4', 'R6C5', 'R6C6'],
  ['R3C1', 'R3C2', 'R4C1', 'R5C1', 'R6C1', 'R6C2'],
  ['R2C2', 'R2C3', 'R3C3', 'R4C2', 'R4C3', 'R5C2'],
  ['R1C6', 'R2C6', 'R3C6', 'R4C5', 'R4C6', 'R5C5'],
  ['R1C5', 'R2C5', 'R3C4', 'R3C5', 'R4C4', 'R5C4'],
];

const whispers = [
  ['R1C1', 'R1C2'],
  ['R5C1', 'R6C1'],
  ['R1C6', 'R2C6'],
  ['R3C4', 'R4C4'],
  ['R6C5', 'R6C6'],
];

return [
  new Shape('6x6'),
  new NoBoxes(),
  ...regions.map(cells => new Jigsaw('6x6', ...cells)),
  ...whispers.map(([a, b]) => new Whisper(3, a, b)),
  new GreaterThan('R3C3', 'R4C3'),
];
