// Title: African Daisies
// Author: Antiknight
// Video: https://www.youtube.com/watch?v=nDOET-_1e4c
// Source: https://sudokupad.app/yp5cwjsu5m

// Normal sudoku rules apply. Each line acts as both a Zipper line and a
// Nabner line: digits at equal distance from the central cell sum to the
// central cell's digit (for these 3-cell lines, the two end digits sum to
// the middle digit), and no two digits on the line may be consecutive or
// repeat.

const lines = [
  ['R3C3', 'R4C4', 'R3C5'],
  ['R5C3', 'R6C4', 'R7C3'],
  ['R7C5', 'R6C6', 'R7C7'],
  ['R3C7', 'R4C6', 'R5C7'],
  ['R7C2', 'R6C1', 'R7C1'],
  ['R2C3', 'R1C4', 'R1C3'],
  ['R9C8', 'R8C7', 'R8C6'],
  ['R1C6', 'R2C7', 'R2C8'],
  ['R4C9', 'R5C9', 'R6C9'],
  ['R4C2', 'R5C1', 'R4C1'],
  ['R8C2', 'R8C1', 'R9C1'],
];

// Nabner: no two cells on the line may hold consecutive or equal digits.
const nabnerKey = PairX.fnToKey((a, b) => Math.abs(a - b) > 1, 9);

return [
  new Shape('9x9'),

  ...lines.flatMap(cells => [
    new Zipper(...cells),
    new PairX(nabnerKey, 'Nabner', ...cells),
  ]),
];
