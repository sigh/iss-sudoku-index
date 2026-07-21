// Title: Anti-Quads 5
// Author: The Bard
// Video: https://www.youtube.com/watch?v=xV95g9_NqV4
// Source: https://sudokupad.app/68n5ump3ql

// Each white clue digit occurs in its surrounding 2x2 square. Each pink clue
// digit is removed from the candidates of every cell in its surrounding square.
const whiteQuads = [
  ['R2C2', 8, 9],
  ['R4C8', 1, 2, 3, 4],
  ['R4C2', 2, 8],
  ['R2C7', 1, 2],
  ['R7C7', 3, 4],
  ['R7C2', 1, 3],
  ['R8C7', 8],
  ['R7C1', 7],
];

const pinkQuads = [
  ['R1C8', [1, 2, 3, 4]],
  ['R1C1', [1, 2, 3, 4]],
  ['R8C1', [1, 2, 3, 4]],
  ['R8C8', [1, 2, 3, 4]],
  ['R6C6', [5, 6, 7]],
  ['R6C3', [7, 8, 9]],
  ['R3C6', [6, 8, 9]],
  ['R3C3', [5, 6, 7]],
  ['R5C5', [1, 4, 8]],
  ['R1C4', [2]],
  ['R7C5', [4, 6]],
  ['R1C5', [8]],
  ['R2C8', [5]],
];

const allowedByCell = new Map();
for (const [topLeft, excluded] of pinkQuads) {
  const { row, col } = parseCellId(topLeft);
  for (const rowOffset of [0, 1]) {
    for (const colOffset of [0, 1]) {
      const cell = makeCellId(row + rowOffset, col + colOffset);
      const allowed = allowedByCell.get(cell) || new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      for (const digit of excluded) allowed.delete(digit);
      allowedByCell.set(cell, allowed);
    }
  }
}

const antiQuadCandidates = [...allowedByCell].map(
  ([cell, allowed]) => new Given(cell, ...allowed),
);

return [
  new Shape('9x9'),
  ...whiteQuads.map(([cell, ...digits]) => new Quad(cell, ...digits)),
  ...antiQuadCandidates,
];
