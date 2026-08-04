// Title: February 13, 2023: Koffing
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=vuq-IhtnG-U
// Source: https://tinyurl.com/yzkts6ae

// Normal sudoku rules apply (default row/column/box all-different).
// Killer: digits in each cage cannot repeat and must sum to the cage total.
// Quadruples: each circle's digit must appear somewhere in its surrounding
// 2x2 square. Every circle here carries exactly one required digit.

// Killer cages, transcribed from the payload's `killercage` array
// (cells, total).
const cages = [
  ['R2C2', 'R2C3', 'R3C2', 6],
  ['R7C2', 'R8C2', 'R8C3', 23],
  ['R7C8', 'R8C7', 'R8C8', 7],
  ['R2C7', 'R2C8', 'R3C8', 24],
  ['R2C4', 'R3C3', 'R3C4', 9],
  ['R7C6', 'R7C7', 'R8C6', 8],
  ['R6C2', 'R6C3', 'R7C3', 22],
  ['R3C7', 'R4C7', 'R4C8', 21],
  ['R5C1', 'R5C2', 'R6C1', 19],
  ['R4C9', 'R5C8', 'R5C9', 20],
  ['R8C5', 'R9C5', 'R9C6', 10],
  ['R1C4', 'R1C5', 'R2C5', 11],
  ['R4C2', 'R4C3', 'R4C4', 12],
  ['R6C6', 'R6C7', 'R6C8', 13],
  ['R6C4', 'R7C4', 'R8C4', 18],
  ['R2C6', 'R3C6', 'R4C6', 19],
];

// Quadruple circles, transcribed from the payload's `circle` array
// (topLeftCell of the 2x2 square, required digit).
const quads = [
  ['R5C1', 6],
  ['R6C2', 8],
  ['R7C2', 7],
  ['R8C5', 4],
  ['R7C6', 2],
  ['R7C7', 3],
  ['R4C8', 7],
  ['R3C7', 9],
  ['R2C7', 6],
  ['R1C4', 3],
  ['R2C3', 1],
  ['R2C2', 4],
];

return [
  new Shape('9x9'),
  ...cages.map(([...cells]) => {
    const total = cells.pop();
    return new Cage(total, ...cells);
  }),
  ...quads.map(([topLeftCell, digit]) => new Quad(topLeftCell, digit)),
];
