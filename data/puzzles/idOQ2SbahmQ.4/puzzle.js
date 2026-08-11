// Title: June 23, 2022: Odd Thru the Heart
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=idOQ2SbahmQ
// Source: https://tinyurl.com/4vmjmft4

// Normal sudoku rules apply. Digits in cages cannot repeat and must sum to
// the total given. Digits in grey circles must be odd, encoded as a
// restricted Given per cell.
const cages = [
  [['R2C2', 'R2C3'], 6],
  [['R2C7', 'R2C8'], 10],
  [['R3C1', 'R3C2'], 5],
  [['R3C8', 'R3C9'], 11],
  [['R3C3', 'R3C4'], 13],
  [['R3C6', 'R3C7'], 9],
  [['R4C8', 'R4C9'], 13],
  [['R4C1', 'R4C2'], 9],
  [['R5C1', 'R5C2'], 8],
  [['R5C8', 'R5C9'], 15],
  [['R6C2', 'R6C3'], 13],
  [['R6C7', 'R6C8'], 7],
  [['R4C7', 'R5C7'], 9],
  [['R4C3', 'R5C3'], 11],
  [['R7C6', 'R7C7'], 14],
  [['R7C3', 'R7C4'], 8],
  [['R8C4', 'R8C5', 'R8C6', 'R9C5'], 13],
  [['R4C4', 'R4C5', 'R4C6', 'R5C5'], 20],
  [['R5C4', 'R6C4'], 9],
  [['R5C6', 'R6C6'], 7],
  [['R6C5', 'R7C5'], 17],
];
const oddCells = [
  'R2C2', 'R2C3', 'R3C1', 'R4C1', 'R5C1', 'R6C2', 'R7C3', 'R8C4', 'R9C5',
  'R8C6', 'R7C7', 'R6C8', 'R5C9', 'R4C9', 'R3C9', 'R2C8', 'R2C7', 'R3C6',
  'R4C5', 'R3C4',
];
return [
  new Shape('9x9'),
  ...cages.map(([cells, total]) => new Cage(total, ...cells)),
  ...oddCells.map(cell => new Given(cell, 1, 3, 5, 7, 9)),
];
