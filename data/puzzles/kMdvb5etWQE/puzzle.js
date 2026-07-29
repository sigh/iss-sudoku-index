// Title: That's all the X's
// Author: rockratzero
// Video: https://www.youtube.com/watch?v=kMdvb5etWQE
// Source: https://app.crackingthecryptic.com/TtPpQdrH4n

// Normal Sudoku applies. Both blue diagonals have distinct digits. Each listed
// cage sums to its drawn total; each purple five-cell X is a consecutive set;
// and every drawn white X joins two cells summing to 10.
const cages = [
  [10, 'R1C1', 'R1C2', 'R2C1', 'R2C2'],
  [30, 'R8C8', 'R8C9', 'R9C8', 'R9C9'],
  [12, 'R4C5', 'R5C5'],
  [13, 'R7C5', 'R8C5'],
  [12, 'R1C8', 'R1C9', 'R2C9'],
  [16, 'R8C1', 'R9C1', 'R9C2'],
]; // Killer-cage cell sets and totals transcribed from the drawn cages.

const purpleXs = [
  ['R1C4', 'R2C5', 'R3C6', 'R3C4', 'R1C6'],
  ['R4C1', 'R5C2', 'R6C3', 'R6C1', 'R4C3'],
  ['R7C4', 'R8C5', 'R9C6', 'R9C4', 'R7C6'],
  ['R4C7', 'R5C8', 'R6C9', 'R6C7', 'R4C9'],
]; // Each pair of crossing purple strokes is one five-cell line.

const xMarks = [
  ['R2C4', 'R2C5'], ['R5C2', 'R6C2'], ['R8C5', 'R8C6'],
  ['R4C8', 'R5C8'], ['R3C3', 'R4C3'], ['R3C6', 'R3C7'],
  ['R6C7', 'R7C7'], ['R7C3', 'R7C4'], ['R4C5', 'R4C6'],
  ['R6C4', 'R6C5'], ['R1C7', 'R1C8'], ['R3C3', 'R3C4'],
  ['R7C6', 'R7C7'], ['R9C2', 'R9C3'],
]; // Adjacent cell pairs carrying the drawn white X marks.

return [
  new Shape('9x9'),
  new Diagonal(1),
  new Diagonal(-1),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...purpleXs.map(cells => new Renban(...cells)),
  ...xMarks.map(cells => new X(...cells)),
];
