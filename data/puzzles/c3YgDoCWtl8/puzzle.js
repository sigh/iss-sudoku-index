// Title: You're Such a Square!
// Author: Walking Writer
// Video: https://www.youtube.com/watch?v=c3YgDoCWtl8
// Source: https://sudokupad.app/b5azokaz10

// The square-code Vars identify the nine squares 1, 4, 9, 16, 25, 36,
// 49, 64, and 81. Their all-different constraint enforces that each is used
// at most once across the nine outlined cages.
const squareCodeVars = new Var(
  'S',
  'perfect square used by each outlined cage',
  9,
);
const squareCodes = squareCodeVars.cells();
const singleSquareCages = [
  ['R1C1'],
  ['R9C1'],
  ['R9C9'],
];
const doubleSquareCages = [
  ['R1C5', 'R1C6'],
  ['R1C8', 'R1C9'],
  ['R5C8', 'R5C9'],
  ['R5C4', 'R5C5'],
  ['R4C1', 'R4C2'],
  ['R8C4', 'R8C5'],
];
const squareCages = [
  ...singleSquareCages.map((cells, i) =>
    new Regex('(11|42|93)', ...cells, squareCodes[i])),
  ...doubleSquareCages.map((cells, i) =>
    new Regex('(164|255|366|497|648|819)', ...cells, squareCodes[i + 3])),
];

const xPairs = [
  ['R4C1', 'R4C2'],
  ['R7C2', 'R8C2'],
  ['R7C7', 'R8C7'],
  ['R5C6', 'R6C6'],
].map(cells => new X(...cells));
const vPairs = [
  ['R5C1', 'R6C1'],
  ['R6C5', 'R7C5'],
  ['R2C8', 'R2C9'],
  ['R2C5', 'R3C5'],
  ['R7C9', 'R8C9'],
  ['R4C7', 'R4C8'],
].map(cells => new V(...cells));

return [
  new Shape('9x9'),
  squareCodeVars,
  new AllDifferent(...squareCodes),
  new Diagonal(-1),
  new Diagonal(1),
  ...xPairs,
  ...vPairs,
  ...squareCages,
];
