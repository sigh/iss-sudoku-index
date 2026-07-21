// Title: Clueless Entropy Sudoku 2
// Author: Alf Smith
// Video: https://www.youtube.com/watch?v=nkMCRP6Obzw
// Source: https://sudokupad.app/1rbkrrjyqv

// Every 2x2 window contains a low, middle, and high digit.
const entropy = new GlobalEntropy();

// A cell is gold exactly when its digit equals its 1-based position in its
// row, column, or 3x3 box (the latter read left-to-right, top-to-bottom).
const goldCells = new Set([
  'R1C8',
  'R2C4', 'R2C9',
  'R3C3', 'R3C9',
  'R4C6', 'R4C8',
  'R5C2', 'R5C3', 'R5C7',
  'R6C1', 'R6C2', 'R6C4', 'R6C6', 'R6C7',
  'R7C5', 'R7C6', 'R7C7', 'R7C8',
  'R8C3', 'R8C4', 'R8C8',
  'R9C5',
]);

const allDigits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const positionalCandidates = cellGraph('9x9').cells().map(cell => {
  const {row, col} = parseCellId(cell);
  const boxPosition = ((row - 1) % 3) * 3 + ((col - 1) % 3) + 1;
  const positions = new Set([row, col, boxPosition]);
  const candidates = allDigits.filter(value =>
    goldCells.has(cell) ? positions.has(value) : !positions.has(value));
  return new Given(cell, ...candidates);
});

return [
  new Shape('9x9'),
  entropy,
  ...positionalCandidates,
];
