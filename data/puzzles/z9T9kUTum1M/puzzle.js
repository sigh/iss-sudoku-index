// Title: Nabnerfel
// Author: Antiknight
// Video: https://www.youtube.com/watch?v=z9T9kUTum1M
// Source: https://sudokupad.app/6y7vhnhdof

// Normal sudoku, no givens. Digits along each arrow sum to the digit in the
// circled cell. On each golden nabner loop (a 2x2 set of cells), no two
// digits may be consecutive. White dots join consecutive digits; not all
// possible white dots are shown.

const nabnerKey = PairX.fnToKey((a, b) => Math.abs(a - b) > 1, 9);

const nabnerSets = [
  ['R1C8', 'R2C8', 'R2C9', 'R1C9'],
  ['R1C1', 'R1C2', 'R2C2', 'R2C1'],
  ['R8C1', 'R8C2', 'R9C2', 'R9C1'],
  ['R8C8', 'R8C9', 'R9C9', 'R9C8'],
];

return [
  new Shape('9x9'),

  new Arrow('R3C8', 'R4C7', 'R5C7', 'R6C7'),
  new Arrow('R7C2', 'R6C3', 'R5C3', 'R4C3'),
  new Arrow('R2C3', 'R3C4', 'R3C5', 'R3C6'),
  new Arrow('R8C7', 'R7C6', 'R7C5', 'R7C4'),
  new Arrow('R9C5', 'R9C4', 'R9C3'),
  new Arrow('R1C5', 'R1C6', 'R1C7'),
  new Arrow('R5C9', 'R6C9', 'R7C9'),
  new Arrow('R5C1', 'R4C1', 'R3C1'),

  new WhiteDot('R3C5', 'R4C5'),
  new WhiteDot('R4C4', 'R4C5'),
  new WhiteDot('R6C5', 'R7C5'),
  new WhiteDot('R5C6', 'R5C7'),
  new WhiteDot('R9C7', 'R9C8'),
  new WhiteDot('R7C1', 'R8C1'),
  new WhiteDot('R7C9', 'R8C9'),

  ...nabnerSets.map(cells => new PairX(nabnerKey, 'nabner', ...cells)),
];
