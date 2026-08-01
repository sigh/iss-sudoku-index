// Title: Thriller
// Author: GoodCity
// Video: https://www.youtube.com/watch?v=0T90bpnvE50
// Source: https://sudokupad.app/QM4QhqThpb

// Normal Sudoku rules apply. Cage digits do not repeat, and every cage total
// begins or ends with 3. The listed totals are all such totals possible for a
// distinct cage of the relevant size. Cage coordinates come from the drawn outlines.
const cages = [
  ['R1C1', 'R2C1', 'R3C1'],
  ['R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1'],
  ['R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9'],
  ['R2C2', 'R3C2', 'R4C2'],
  ['R2C3', 'R3C3'],
  ['R1C2', 'R1C3'],
  ['R6C2', 'R7C2'],
  ['R4C3', 'R4C4'],
  ['R4C5', 'R4C6'],
  ['R4C7', 'R4C8', 'R4C9'],
  ['R6C3', 'R7C3', 'R8C2', 'R8C3', 'R9C2'],
  ['R9C3', 'R9C4', 'R9C5'],
  ['R9C6', 'R9C7', 'R9C8', 'R9C9'],
  ['R7C7', 'R8C7'],
  ['R7C8', 'R7C9'],
  ['R8C8', 'R8C9'],
  ['R7C4', 'R8C4', 'R8C5'],
  ['R7C6', 'R8C6'],
  ['R6C4', 'R6C5', 'R7C5'],
  ['R6C6', 'R6C7', 'R6C8', 'R6C9'],
  ['R3C4', 'R3C5'],
  ['R1C4', 'R2C4', 'R2C5'],
  ['R1C9', 'R2C9', 'R3C9'],
  ['R2C7', 'R3C7', 'R3C8'],
  ['R1C5', 'R1C6', 'R1C7', 'R1C8', 'R2C6', 'R2C8', 'R3C6'],
];
const totals = [3, 13, 23, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 43];
const possibleTotals = cells => totals.filter(sum =>
  sum >= cells.length * (cells.length + 1) / 2 &&
  sum <= cells.length * (19 - cells.length) / 2);
const constrainedCages = cages.map(cells =>
  new Or(possibleTotals(cells).map(sum => new Cage(sum, ...cells))));

return [
  new Shape('9x9'),
  ...constrainedCages,
];
