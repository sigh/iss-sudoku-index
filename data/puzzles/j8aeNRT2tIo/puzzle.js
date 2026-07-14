// Title: Horseshoes
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=j8aeNRT2tIo
// Source: https://sudokupad.app/ddgg4xrhlz

// Each grey horseshoe is an all-different nine-cell line; its circled ends
// sum to the number printed at the bend.
const horseshoes = [
  { cells: ['R2C3', 'R3C3', 'R4C3', 'R5C3', 'R5C2', 'R5C1', 'R4C1', 'R3C1', 'R2C1'], sum: 14 },
  { cells: ['R4C2', 'R3C2', 'R2C2', 'R1C2', 'R1C3', 'R1C4', 'R2C4', 'R3C4', 'R4C4'], sum: 10 },
  { cells: ['R3C8', 'R3C7', 'R3C6', 'R3C5', 'R2C5', 'R1C5', 'R1C6', 'R1C7', 'R1C8'], sum: 11 },
  { cells: ['R2C6', 'R2C7', 'R2C8', 'R2C9', 'R3C9', 'R4C9', 'R4C8', 'R4C7', 'R4C6'], sum: 10 },
  { cells: ['R8C7', 'R7C7', 'R6C7', 'R5C7', 'R5C8', 'R5C9', 'R6C9', 'R7C9', 'R8C9'], sum: 12 },
  { cells: ['R6C8', 'R7C8', 'R8C8', 'R9C8', 'R9C7', 'R9C6', 'R8C6', 'R7C6', 'R6C6'], sum: 10 },
  { cells: ['R7C2', 'R7C3', 'R7C4', 'R7C5', 'R8C5', 'R9C5', 'R9C4', 'R9C3', 'R9C2'], sum: 13 },
  { cells: ['R8C4', 'R8C3', 'R8C2', 'R8C1', 'R7C1', 'R6C1', 'R6C2', 'R6C3', 'R6C4'], sum: 10 },
];

return [
  new Shape('9x9'),
  ...horseshoes.flatMap(({ cells, sum }) => [
    new AllDifferent(...cells),
    new Sum(sum, cells[0], cells.at(-1)),
  ]),
];
