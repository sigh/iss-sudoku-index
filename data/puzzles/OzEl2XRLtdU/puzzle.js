// Title: RAT RUN 27: Productivity
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=OzEl2XRLtdU
// Source: https://sudokupad.app/syu6xcezzm

// Normal sudoku rules apply (standard 9x9 boxes, no givens).

// Goldenberries sit between two orthogonally adjacent cells: the two digits
// are not consecutive.
const goldenberryKey = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);
const goldenberries = [
  ['R4C2', 'R5C2'],
  ['R3C4', 'R4C4'],
  ['R3C2', 'R4C2'],
  ['R7C2', 'R7C3'],
  ['R1C8', 'R2C8'],
  ['R8C5', 'R8C6'],
  ['R4C3', 'R4C4'],
  ['R1C1', 'R2C1'],
];

return [
  new Shape('9x9'),
  ...goldenberries.map(cells => new Pair(goldenberryKey, 'goldenberry', ...cells)),
];
